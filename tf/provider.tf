provider "digitalocean" {
  version = "~> 1.12.0"
}

provider "aws" {
  version = "~> 2.44.0"
  region  = "us-east-1"
}

provider "mysql" {
  version = "~> 1.9"
  endpoint = "${digitalocean_database_cluster.mysql-production.host}:${digitalocean_database_cluster.mysql-production.port}"
  username = digitalocean_database_cluster.mysql-production.user
  password = digitalocean_database_cluster.mysql-production.password
}

provider "mysql" {
  alias = "infra"
  version = "~> 1.9"
  endpoint = "${digitalocean_database_cluster.mysql-infra.host}:${digitalocean_database_cluster.mysql-infra.port}"
  username = digitalocean_database_cluster.mysql-infra.user
  password = digitalocean_database_cluster.mysql-infra.password
}

terraform {
  backend "s3" {
    bucket         = "labs-tfstate"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}
