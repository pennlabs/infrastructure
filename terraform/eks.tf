// Production
module "eks-production" {
  // https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest
  source          = "terraform-aws-modules/eks/aws"
  version         = "18.4.0"
  cluster_name    = local.k8s_cluster_name
  cluster_version = "1.21"
  subnet_ids      = module.vpc.private_subnets
  vpc_id          = module.vpc.vpc_id

  # map_roles = [
  #   {
  #     rolearn  = aws_iam_role.kubectl.arn
  #     username = aws_iam_role.kubectl.name
  #     groups   = ["system:masters"]
  #   },
  # ]
  # map_users = [
  #   {
  #     userarn  = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/platform"
  #     username = "platform"
  #     groups   = ["system:masters"]
  #   },
  # ]
  eks_managed_node_groups = {
    spot = {
      desired_size = local.k8s_cluster_size
      max_size     = local.k8s_cluster_size
      min_size     = local.k8s_cluster_size

      create_launch_template = false
      launch_template_name   = ""
      disk_size              = 50
      instance_types         = ["r5d.large"]
      capacity_type          = "SPOT"
    }
  }
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

resource "null_resource" "eks-bootstrap" {
  triggers = {
    kubeconfig = base64encode(local.kubeconfig)
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    environment = {
      KUBECONFIG = self.triggers.kubeconfig
    }

    # TODO: docker pull secrets
    command = <<EOF
    kubectl patch configmap/aws-auth --patch \"${local.aws_auth_configmap_yaml}\" -n kube-system --kubeconfig <(echo $KUBECONFIG | base64 --decode);
    kubectl set env daemonset aws-node -n kube-system ENABLE_PREFIX_DELEGATION=true --kubeconfig <(echo $KUBECONFIG | base64 --decode)
    EOF
  }
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

    // Allow users to assume role
    principals {
      identifiers = concat([for member in local.sre_members : aws_iam_user.sre[member].arn], [aws_iam_user.gh-actions.arn])
      type        = "AWS"
    }

    // Allow bastion instance to assume role
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
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
