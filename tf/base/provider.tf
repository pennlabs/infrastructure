provider "digitalocean" {
  version = "~> 1.12.0"
}

provider "aws" {
  version = "~> 2.44.0"
  region  = "us-east-1"
}

// Production cluster
// provider "helm" {
//   version = "~> 1.0"
//   kubernetes {
//     load_config_file = false
//     host             = module.production-cluster.endpoint
//     token            = module.production-cluster.token
//     cluster_ca_certificate = base64decode(
//       module.production-cluster.cluster_ca_certificate
//     )
//   }
// }

// provider "mysql" {
//   version  = "~> 1.9"
//   endpoint = "${module.production-cluster.mysql-host}:${module.production-cluster.mysql-port}"
//   username = module.production-cluster.mysql-user
//   password = module.production-cluster.mysql-password
// }

// Staging cluster
provider "helm" {
  alias   = "staging"
  version = "~> 1.0"
  kubernetes {
    load_config_file = false
    host             = module.staging-cluster.endpoint
    token            = module.staging-cluster.token
    cluster_ca_certificate = base64decode(
      module.staging-cluster.cluster_ca_certificate
    )
  }
}

provider "mysql" {
  alias    = "staging"
  version  = "~> 1.9"
  endpoint = "${module.staging-cluster.mysql-host}:${module.staging-cluster.mysql-port}"
  username = module.staging-cluster.mysql-user
  password = module.staging-cluster.mysql-password
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
