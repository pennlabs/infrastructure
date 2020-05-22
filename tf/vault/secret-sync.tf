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

resource "vault_generic_secret" "secret-sync-chronos" {
  for_each = toset(["cert-manager", "default", "monitoring"])
  path     = "${vault_mount.secrets.path}/chronos/${each.key}/secret-sync"

  data_json = <<EOT
{
  "ROLE_ID":   "${vault_approle_auth_backend_role.secret-sync.role_id}",
  "SECRET_ID": "${vault_approle_auth_backend_role_secret_id.secret-sync.secret_id}"
}
EOT
}

resource "vault_generic_secret" "secret-sync-sandbox" {
  for_each = toset(["cert-manager", "default", "monitoring"])
  path     = "${vault_mount.secrets.path}/sandbox/${each.key}/secret-sync"

  data_json = <<EOT
{
  "ROLE_ID":   "${vault_approle_auth_backend_role.secret-sync.role_id}",
  "SECRET_ID": "${vault_approle_auth_backend_role_secret_id.secret-sync.secret_id}"
}
EOT
}

resource "vault_generic_secret" "secret-sync-production" {
  for_each = toset(["cert-manager", "default", "staging", "monitoring"])
  path     = "${vault_mount.secrets.path}/production/${each.key}/secret-sync"

  data_json = <<EOT
{
  "ROLE_ID":   "${vault_approle_auth_backend_role.secret-sync.role_id}",
  "SECRET_ID": "${vault_approle_auth_backend_role_secret_id.secret-sync.secret_id}"
}
EOT
}
