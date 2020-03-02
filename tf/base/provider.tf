provider "digitalocean" {
  version = "~> 1.12.0"
}

provider "aws" {
  version = "~> 2.44.0"
  region  = "us-east-1"
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
