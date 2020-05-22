// Note: we're not using the vault-flush module because currently
// in tf version 12 you can't use the for_each keyword within a module

data "vault_generic_secret" "vault-flush" {
  for_each = local.database_users
  path     = "secrets/production/default/${each.key}"
}

resource "vault_generic_secret" "vault-flush" {
  for_each = local.database_users
  path     = "secrets/production/default/${each.key}"
  data_json = jsonencode(merge(data.vault_generic_secret.vault-flush[each.key].data, {
    DATABASE_URL : "postgres://${each.key}:${module.postgres-cluster.passwords[each.key]}@${module.postgres-cluster.host}:${module.postgres-cluster.port}/${each.key}"
    }
  ))
}
