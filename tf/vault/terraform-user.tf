// Terraform user
resource "vault_approle_auth_backend_role" "terraform" {
  role_name      = "terraform"
  token_policies = [vault_policy.admin.name]
}

resource "vault_approle_auth_backend_role_secret_id" "terraform" {
  role_name = vault_approle_auth_backend_role.terraform.role_name
}
