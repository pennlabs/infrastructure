provider "digitalocean" {
  version = "~> 1.12.0"
}

provider "aws" {
  version = "~> 2.44.0"
  region  = "us-east-1"
}

terraform {
  backend "s3" {
    bucket         = "labs-tfstate"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}
