resource "vault_policy" "secret-sync" {
  name = "secret-sync"
  policy = templatefile("policies/secret-sync.hcl", {
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

// TODO: do we need to sync to more namespaces?
resource "vault_generic_secret" "secret-sync-default" {
  for_each = toset(["chronos", "sandbox", "production"])
  path     = "${vault_mount.secrets.path}/${each.key}/default/secret-sync"

  data_json = <<EOT
{
  "ROLE_ID":   "${vault_approle_auth_backend_role.secret-sync.role_id}",
  "SECRET_ID": "${vault_approle_auth_backend_role_secret_id.secret-sync.secret_id}"
}
EOT
}

resource "vault_generic_secret" "secret-sync-monitoring" {
  for_each = toset(["chronos", "sandbox", "production"])
  path     = "${vault_mount.secrets.path}/${each.key}/monitoring/secret-sync"

  data_json = <<EOT
{
  "ROLE_ID":   "${vault_approle_auth_backend_role.secret-sync.role_id}",
  "SECRET_ID": "${vault_approle_auth_backend_role_secret_id.secret-sync.secret_id}"
}
EOT
}
