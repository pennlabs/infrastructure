resource "mysql_database" "db" {
  for_each              = var.names
  name                  = each.key
  default_character_set = "utf8mb4"
  default_collation     = "utf8mb4_unicode_ci"
}

resource "mysql_user" "user" {
  for_each = var.names
  user     = each.key
  host     = "%"
}

resource "mysql_user_password" "password" {
  for_each = var.names
  user     = each.key
  host     = "%"
  pgp_key  = "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"
}

resource "mysql_grant" "grant" {
  for_each   = var.names
  user       = mysql_user.user[each.key].user
  host       = mysql_user.user[each.key].host
  database   = mysql_database.db[each.key].name
  privileges = ["ALL"]
}
