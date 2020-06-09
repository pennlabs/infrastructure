resource "random_password" "prometheus-basic-auth" {
  for_each         = toset(["sandbox", "production"])
  length           = 128
  special          = true
  override_special = "_%@"
}

resource "vault_generic_secret" "prometheus-basic-auth" {
  for_each  = toset(["sandbox", "production"])
  path      = "${vault_mount.secrets.path}/${each.key}/monitoring/prometheus-basic-auth"
  data_json = <<EOT
{
  "auth": "prometheus:${bcrypt(random_password.prometheus-basic-auth["${each.key}"].result, 6)}"
}
EOT
}

resource "random_password" "grafana-admin" {
  length  = 64
  special = false
}

resource "vault_generic_secret" "grafana" {
  path = "${vault_mount.secrets.path}/chronos/default/grafana"

  data_json = <<EOT
{
  "SANDBOX_PROMETHEUS_USER":        "prometheus",
  "SANDBOX_PROMETHEUS_PASSWORD":    "${random_password.prometheus-basic-auth["sandbox"].result}",
  "PRODUCTION_PROMETHEUS_USER":     "prometheus",
  "PRODUCTION_PROMETHEUS_PASSWORD": "${random_password.prometheus-basic-auth["production"].result}",
  "ADMIN_USER":                     "admin",
  "ADMIN_PASSWORD":                 "${random_password.grafana-admin.result}",
  "GF_AUTH_GITHUB_CLIENT_ID":       "${var.GF_GH_CLIENT_ID}",
  "GF_AUTH_GITHUB_CLIENT_SECRET":   "${var.GF_GH_CLIENT_SECRET}"
}
EOT
}

resource "vault_generic_secret" "fluentd" {
  for_each  = toset(["chronos", "sandbox", "production"])
  path = "${vault_mount.secrets.path}/${each.key}/monitoring/fluentd"

  data_json = <<EOT
{
  "ELASTIC_USER":     "elastic",
  "ELASTIC_PASSWORD": "${var.ELASTIC_PASSWORD}",
  "ELASTIC_HOSTS":    "${var.ELASTIC_HOST}"
}
EOT
}
