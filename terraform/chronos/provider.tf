provider "digitalocean" {
  version = "~> 1.22.0"
}

provider "aws" {
  version = "~> 2.44.0"
  region  = "us-east-1"
}

// Chronos K8s cluster
provider "helm" {
  version = "~> 1.3"
  kubernetes {
    load_config_file = false
    host             = module.chronos-cluster.endpoint
    token            = module.chronos-cluster.token
    cluster_ca_certificate = base64decode(
      module.chronos-cluster.cluster_ca_certificate
    )
  }
}

provider "kubernetes" {
  version          = "~> 1.11"
  load_config_file = false
  host             = module.chronos-cluster.endpoint
  token            = module.chronos-cluster.token
  cluster_ca_certificate = base64decode(
    module.chronos-cluster.cluster_ca_certificate
  )
}

// Infrastructure DB
provider "postgresql" {
  version          = "~> 1.6"
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

provider "time" {
  version = "~> 0.5"
}

terraform {
  backend "s3" {
    region         = "us-east-1"
    bucket         = "chronos-tfstate-state"
    key            = "terraform.tfstate"
    dynamodb_table = "chronos-tfstate-state-lock"
    encrypt        = true
  }
}
