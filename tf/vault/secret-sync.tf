resource "vault_policy" "secret-sync" {
  name = "secret-sync"
  policy = templatefile("secret-sync-policy.hcl", {
    PATH = vault_mount.secrets.path
    }
  )
}

resource "vault_approle_auth_backend_role" "secret-sync" {
  role_name      = "secret-sync"
  token_policies = [vault_policy.secret-sync.name]
}

resource "vault_approle_auth_backend_role_secret_id" "secret-sync" {
  role_name = vault_approle_auth_backend_role.secret-sync.role_name
}

// TODO: will likely need to add the staging NS to prod
resource "vault_generic_secret" "secret-sync" {
  for_each = toset(["chronos", "sandbox", "production"])
  path     = "${vault_mount.secrets.path}/${each.key}/default/secret-sync"

  data_json = <<EOT
{
  "ROLE_ID":   "${vault_approle_auth_backend_role.secret-sync.role_id}",
  "SECRET_ID": "${vault_approle_auth_backend_role_secret_id.secret-sync.secret_id}"
}
EOT
}
