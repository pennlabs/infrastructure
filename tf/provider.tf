variable "do_token" {}

provider "digitalocean" {
  token = "${var.do_token}"
}

provider "aws" {
  version = "~> 2.0"
  region  = "us-east-1"
}
