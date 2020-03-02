module "terraform_state_backend" {
  source = "git::https://github.com/cloudposse/terraform-aws-tfstate-backend.git?ref=tags/0.13.0"
  name   = "base-tfstate"
  region = "us-east-1"
}
