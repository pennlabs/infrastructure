provider "digitalocean" {
  version = "~> 1.12.0"
}

provider "aws" {
  version = "~> 2.44.0"
  region  = "us-east-1"
}

// Production K8s cluster
provider "helm" {
  version = "~> 1.0"
  kubernetes {
    load_config_file = false
    host             = module.production-cluster.endpoint
    token            = module.production-cluster.token
    cluster_ca_certificate = base64decode(
      module.production-cluster.cluster_ca_certificate
    )
  }
}

provider "kubernetes" {
  version          = "~> 1.11"
  load_config_file = false
  host             = module.production-cluster.endpoint
  token            = module.production-cluster.token
  cluster_ca_certificate = base64decode(
    module.production-cluster.cluster_ca_certificate
  )
}

// Sandbox K8s cluster
provider "helm" {
  alias   = "sandbox"
  version = "~> 1.0"
  kubernetes {
    load_config_file = false
    host             = module.sandbox-cluster.endpoint
    token            = module.sandbox-cluster.token
    cluster_ca_certificate = base64decode(
      module.sandbox-cluster.cluster_ca_certificate
    )
  }
}

provider "kubernetes" {
  alias            = "sandbox"
  version          = "~> 1.11"
  load_config_file = false
  host             = module.sandbox-cluster.endpoint
  token            = module.sandbox-cluster.token
  cluster_ca_certificate = base64decode(
    module.sandbox-cluster.cluster_ca_certificate
  )
}

// Chronos K8s cluster
provider "helm" {
  alias   = "chronos"
  version = "~> 1.0"
  kubernetes {
    load_config_file = false
    host             = data.terraform_remote_state.chronos.outputs.endpoint
    token            = data.terraform_remote_state.chronos.outputs.token
    cluster_ca_certificate = base64decode(
      data.terraform_remote_state.chronos.outputs.cluster_ca_certificate
    )
  }
}

provider "kubernetes" {
  alias            = "chronos"
  version          = "~> 1.11"
  load_config_file = false
  host             = data.terraform_remote_state.chronos.outputs.endpoint
  token            = data.terraform_remote_state.chronos.outputs.token
  cluster_ca_certificate = base64decode(
    data.terraform_remote_state.chronos.outputs.cluster_ca_certificate
  )
}

// Production DB
provider "postgresql" {
  version          = "~> 1.5"
  host             = module.postgres-cluster.host
  port             = module.postgres-cluster.port
  database         = "defaultdb"
  expected_version = module.postgres-cluster.version
  username         = module.postgres-cluster.admin-user
  password         = module.postgres-cluster.admin-password
  superuser        = false
  sslmode          = "require"
}

provider "random" {
  version = "~> 2.2"
}

provider "vault" {
  version         = "~> 2.10"
  skip_tls_verify = true
}

// Vault remote state
data "terraform_remote_state" "vault" {
  backend = "s3"

  config = {
    region         = "us-east-1"
    bucket         = "vault-tfstate-state"
    key            = "terraform.tfstate"
    dynamodb_table = "vault-tfstate-state-lock"
    encrypt        = true
  }
}

// Chronos remote state
data "terraform_remote_state" "chronos" {
  backend = "s3"

  config = {
    region         = "us-east-1"
    bucket         = "chronos-tfstate-state"
    key            = "terraform.tfstate"
    dynamodb_table = "chronos-tfstate-state-lock"
    encrypt        = true
  }
}

terraform {
  backend "s3" {
    region         = "us-east-1"
    bucket         = "base-tfstate-state"
    key            = "terraform.tfstate"
    dynamodb_table = "base-tfstate-state-lock"
    encrypt        = true
  }
}
