output "vault-tf-role-id" {
  value     = vault_approle_auth_backend_role.terraform.role_id
  sensitive = true
}

output "vault-tf-secret-id" {
  value     = vault_approle_auth_backend_role_secret_id.terraform.secret_id
  sensitive = true
}
