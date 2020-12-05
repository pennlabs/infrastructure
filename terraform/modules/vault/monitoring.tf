resource "random_password" "grafana-admin" {
  length  = 64
  special = false
}

resource "vault_generic_secret" "grafana" {
  path = "${vault_mount.secrets.path}/default/default/grafana"

  data_json = jsonencode({
    "ADMIN_USER" = "admin"
    "ADMIN_PASSWORD" = random_password.grafana-admin.result
    "GF_AUTH_GITHUB_CLIENT_ID" = var.GF_GH_CLIENT_ID
    "GF_AUTH_GITHUB_CLIENT_SECRET" = var.GF_GH_CLIENT_SECRET
    "SLACK_NOTIFICATION_URL" = var.GF_SLACK_URL
  })
}
