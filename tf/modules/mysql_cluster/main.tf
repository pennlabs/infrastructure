resource "digitalocean_database_cluster" "mysql" {
  name       = var.name
  engine     = "mysql"
  size       = var.node_size
  region     = "nyc1"
  node_count = var.node_count
  version    = var.cluster_version

  lifecycle {
    prevent_destroy = true
  }
}

resource "mysql_database" "db" {
  for_each              = var.users
  name                  = each.key
  default_character_set = "utf8mb4"
  default_collation     = "utf8mb4_unicode_ci"
}

resource "mysql_user" "user" {
  for_each = var.users
  user     = each.key
  host     = "%"
}

resource "mysql_user_password" "password" {
  for_each = var.users
  user     = each.key
  host     = "%"
  pgp_key  = var.pgp_key
}

resource "mysql_grant" "grant" {
  for_each   = var.users
  user       = mysql_user.user[each.key].user
  host       = mysql_user.user[each.key].host
  database   = mysql_database.db[each.key].name
  privileges = ["ALL"]
}
