resource "vault_mount" "secrets" {
  path        = "secrets"
  type        = "kv-v2"
  description = "Secrets backend"
}

resource "vault_auth_backend" "approle" {
  type = "approle"
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

// TODO: create the team sync policy?
