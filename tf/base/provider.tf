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

// Sandbox cluster
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

provider "mysql" {
  alias    = "sandbox"
  version  = "~> 1.9"
  endpoint = "${module.sandbox-cluster.mysql-host}:${module.sandbox-cluster.mysql-port}"
  username = module.sandbox-cluster.mysql-user
  password = module.sandbox-cluster.mysql-password
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
