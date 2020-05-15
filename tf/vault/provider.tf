provider "vault" {
  version = "~> 2.10"
  address = "https://vault.upenn.club"
  skip_tls_verify = true
}

terraform {
  backend "s3" {
    region         = "us-east-1"
    bucket         = "vault-tfstate-state"
    key            = "terraform.tfstate"
    dynamodb_table = "vault-tfstate-state-lock"
    encrypt        = true
  }
}
