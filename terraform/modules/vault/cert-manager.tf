resource "vault_generic_secret" "cloudflare-api-key" {
  for_each = toset(["sandbox", "production"])
  path     = "${vault_mount.secrets.path}/${each.key}/cert-manager/cloudflare-api-key-secret"

  data_json = jsonencode({ "api-key" = var.CF_API_KEY })
}
