// Production
module "eks-production" {
  source           = "terraform-aws-modules/eks/aws"
  version          = "13.2.1"
  cluster_name     = local.k8s_cluster_name
  cluster_version  = "1.18"
  subnets          = module.vpc.private_subnets
  vpc_id           = module.vpc.vpc_id
  write_kubeconfig = false
  enable_irsa      = true
  map_roles = [
    {
      rolearn  = aws_iam_role.kubectl.arn
      username = aws_iam_role.kubectl.name
      groups   = ["system:masters"]
    },
  ]
  worker_groups_launch_template = [
    {
      name                    = "spot-1"
      override_instance_types = ["t3.medium"]
      spot_instance_pools     = 1
      // TODO: change to 10
      asg_max_size         = 2
      asg_desired_capacity = 2
      kubelet_extra_args   = "--node-labels=node.kubernetes.io/lifecycle=spot"
      public_ip            = true
    },
  ]
  tags = {
    created-by = "terraform"
  }
}

data "aws_eks_cluster" "production" {
  name = module.eks-production.cluster_id
}

data "aws_eks_cluster_auth" "production" {
  name = module.eks-production.cluster_id
}

// Spot Node Termination Handler
resource "helm_release" "aws-node-termination-handler" {
  name       = "aws-node-termination-handler"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-node-termination-handler"
  version    = "0.13.0"
  namespace  = "kube-system"

  values = [file("helm/aws-node-termination-handler.yaml")]
}

// Kubectl role
data "aws_iam_policy_document" "view-k8s" {
  statement {
    actions   = ["eks:DescribeCluster"]
    resources = [module.eks-production.cluster_arn]
  }
}

data "aws_iam_policy_document" "kubectl" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      identifiers = concat([for member in local.platform_members : aws_iam_user.platform[member].arn], [aws_iam_user.gh-actions.arn])
      type        = "AWS"
    }
  }
}

resource "aws_iam_role" "kubectl" {
  name = "kubectl"

  assume_role_policy = data.aws_iam_policy_document.kubectl.json

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_role_policy" "kubectl" {
  name   = "kubectl"
  role   = aws_iam_role.kubectl.name
  policy = data.aws_iam_policy_document.view-k8s.json
}

resource "vault_generic_secret" "kubeconfig" {
  path = "${module.vault.secrets-path}/breakglass/aws/kubeconfig"

  data_json = jsonencode({ "kubeconfig" = templatefile("files/kubeconfig", {
    endpoint = module.eks-production.cluster_endpoint
    ca       = module.eks-production.cluster_certificate_authority_data
    role     = aws_iam_role.kubectl.arn
  }) })
}
