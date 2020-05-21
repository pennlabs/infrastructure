resource "random_password" "prometheus" {
  for_each = toset(["sandbox", "production"])
  length   = 128
  special  = false
}

resource "random_password" "grafana" {
  length   = 64
  special  = false
}

resource "vault_generic_secret" "grafana" {
  path = "${vault_mount.secrets.path}/chronos/default/grafana"

  data_json = <<EOT
{
  "SANDBOX_PROMETHEUS_USER":        "prometheus",
  "SANDBOX_PROMETHEUS_PASSWORD":    "${random_password.prometheus["sandbox"].result}",
  "PRODUCTION_PROMETHEUS_USER":     "prometheus",
  "PRODUCTION_PROMETHEUS_PASSWORD": "${random_password.prometheus["production"].result}",
  "ADMIN_USER":                     "admin",
  "ADMIN_PASSWORD":                 "${random_password.grafana.result}",
  "GF_AUTH_GITHUB_CLIENT_ID":       "${var.GF_GH_CLIENT_ID}",
  "GF_AUTH_GITHUB_CLIENT_SECRET":   "${var.GF_GH_CLIENT_SECRET}"
}
EOT
}
