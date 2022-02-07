locals {
  database_users = setunion(local.products,
    toset([
      "bitwarden",
      "vault",
    ])
  )
  products = toset([
    "common-funding-application",
    "hub-at-penn",
    "office-hours-queue",
    "penn-clubs",
    "penn-courses",
    "platform",
    "platform-dev",
    "penn-mobile"
  ])
  iam_service_accounts = setunion(local.products,
    toset([
      "team-sync",
      "db-backup",
    ])
  )
  sre_members = toset([
    "armaan",
    "peyton",
    "joy",
    "jonathan",
  ])
  k8s_cluster_name = "production"
  k8s_cluster_size = 3
  vault_ami        = "ami-0eec2c28d4dd94628"
  domains = toset([
    "ohq.io",
    "pennbasics.com",
    "penncfa.com",
    "pennclubs.com",
    "penncoursealert.com",
    "penncourseplan.com",
    "penncoursereview.com",
    "penncourses.org",
    "pennlabs.org",
    "pennmobile.org",
  ])
  traefik_lb_name = "acf3fd952315e4e6f90772849116da8d"
  vpc_cidr        = "10.0.0.0/16"
  kubeconfig = yamlencode({
    apiVersion      = "v1"
    kind            = "Config"
    current-context = "terraform"
    clusters = [{
      name = module.eks-production.cluster_id
      cluster = {
        certificate-authority-data = module.eks-production.cluster_certificate_authority_data
        server                     = module.eks-production.cluster_endpoint
      }
    }]
    contexts = [{
      name = "terraform"
      context = {
        cluster = module.eks-production.cluster_id
        user    = "terraform"
      }
    }]
    users = [{
      name = "terraform"
      user = {
        token = data.aws_eks_cluster_auth.production.token
      }
    }]
  })
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "assume-kubectl" {
  statement {
    actions   = ["sts:AssumeRole"]
    resources = [aws_iam_role.kubectl.arn]
  }
}

// Admin SSH key that should only be used if things go wrong
// Has access to bastion & vault
resource "aws_key_pair" "admin" {
  key_name   = "admin"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDATHpBscMwZBByUmafMmIcbDB2my1Ejj88DAalX8lJHr4mav2ZrPVZK7XAz6SacmGiIEMCK6YgkXh502MgPKLoBEBf4OzvLJVpZlsjzJX3dK+MWTff/a1Jyo35nUOFSdjUyKPNV0CPq5bUqGvYo3hh/bCZQn+7cZ7pENPo/1J/vdmdE5CTrl0UuGqLj0OWjolJwSiL0zeUaRuWATukcn5qv4vgZ9H4woCaMEX5FEVWYPsB7kIz5jH7LlFnhvJ3N8ay3Y/2/2JzFR2RdivQID6vO8Cm7bxfoSF5GpAGJbKcFEJGuV+j/xd3QRHHsC/fHy1sSD4G2bszveHKQwQ1aVYUgq0dITx4o/WO1sbTzRruA0FA63SNAnikq7+eyJsUT/9RkHf3DKXZJqTFCZ1+dDZz9pQSv6dlx4lZ7qgUPcdBiA8WpNTxUZSZ/GvwieE8Zz5sQ6mWQlHgqoILe4t1NpRPLi5LFKvV+nR7Yt0vdlddRkuZE/hBo/XilC9lGYT9hHosZzhiQJ7NZvul9txA8N2YpDBAb1HOR3vd+mpGX0BzxpMUhrJwJdRlQANfULMalHHXTkjPqPUSctrj7zvMl/lzmbGlpClxcp+c3mlIM3lPtoW3dYnaVNK/tYuyzAAUzvNPkPKn1/6XgXhu6hf8TBFScvKSWjn2KFLbo2d0+exUMQ== admin"
}
