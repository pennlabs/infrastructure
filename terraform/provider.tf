
// Production K8s cluster
provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.production.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.production.certificate_authority.0.data)
    token                  = data.aws_eks_cluster_auth.production.token
  }
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.production.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.production.certificate_authority.0.data)
  token                  = data.aws_eks_cluster_auth.production.token
}

// Production DB
provider "postgresql" {
  host             = aws_db_instance.production.address
  port             = aws_db_instance.production.port
  database         = "postgres"
  expected_version = aws_db_instance.production.engine_version
  username         = aws_db_instance.production.username
  password         = aws_db_instance.production.password
  superuser        = false
  sslmode          = "require"
}

provider "github" {
  owner = "pennlabs"
}

terraform {
  backend "s3" {
    region         = "us-east-1"
    bucket         = "pennlabs-terraform"
    key            = "terraform.tfstate"
    dynamodb_table = "pennlabs-terraform-lock"
    encrypt        = "true"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.74"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 3.2"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.7"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.4"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.7"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.15"
    }
    github = {
      source  = "integrations/github"
      version = "~> 4.20"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "vault" {
  address = "https://vault.pennlabs.org"
}
