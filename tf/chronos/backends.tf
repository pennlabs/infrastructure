module "chronos_tfstate_backend" {
  source = "git::https://github.com/cloudposse/terraform-aws-tfstate-backend.git?ref=tags/0.17.0"
  name   = "chronos-tfstate"
  region = "us-east-1"
}

module "vault_tfstate_backend" {
  source = "git::https://github.com/cloudposse/terraform-aws-tfstate-backend.git?ref=tags/0.17.0"
  name   = "vault-tfstate"
  region = "us-east-1"
}

// module "base_tfstate_backend" {
//   source = "git::https://github.com/cloudposse/terraform-aws-tfstate-backend.git?ref=tags/0.17.0"
//   name   = "base-tfstate"
//   region = "us-east-1"
// }


