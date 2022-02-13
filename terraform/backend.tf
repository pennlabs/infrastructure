module "tfstate_backend" {
  source  = "cloudposse/tfstate-backend/aws"
  version = "0.38.1"
  name    = "pennlabs-terraform"
}
