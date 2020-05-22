data "vault_generic_secret" "secret" {
  path = var.path
}

resource "vault_generic_secret" "secret" {
  path      = var.path
  data_json = jsonencode(merge(data.vault_generic_secret.secret.data, var.entry))
}
