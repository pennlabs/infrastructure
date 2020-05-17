resource "vault_mount" "secrets" {
  path        = "secrets"
  type        = "kv-v2"
  description = "Secrets backend"
}

resource "vault_auth_backend" "approle" {
  type = "approle"
}

resource "vault_github_auth_backend" "pennlabs" {
  organization = "pennlabs"
}

resource "vault_github_team" "sre" {
  backend  = vault_github_auth_backend.pennlabs.id
  team     = "sre"
  policies = [vault_policy.admin.name]
}

// Admin policy
resource "vault_policy" "admin" {
  name = "admin"
  policy = templatefile("policies/admin.hcl", {
    PATH = vault_mount.secrets.path
    }
  )
}

// Cert-manager CF API Key
resource "vault_generic_secret" "cloudflare-api-key" {
  for_each = toset(["chronos", "sandbox", "production"])
  path     = "${vault_mount.secrets.path}/${each.key}/cert-manager/cloudflare-api-key-secret"

  data_json = <<EOT
{
  "api-key": "${var.cloudflare_api_key}"
}
EOT
}
