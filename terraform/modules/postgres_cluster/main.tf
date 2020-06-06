resource "digitalocean_database_cluster" "postgres" {
  name       = var.name
  engine     = "pg"
  size       = var.node_size
  region     = "nyc1"
  node_count = var.node_count
  version    = var.cluster_version

  lifecycle {
    prevent_destroy = true
  }
}

resource "random_password" "password" {
  for_each = var.users
  length   = 64
  special  = false
}

resource "postgresql_database" "db" {
  for_each = var.users
  name     = each.key
  owner    = postgresql_role.role[each.key].name
}

resource "postgresql_role" "role" {
  for_each = var.users
  name     = each.key
  login    = true
  password = random_password.password[each.key].result
}

resource "postgresql_grant" "grant" {
  for_each    = var.users
  database    = postgresql_database.db[each.key].name
  role        = postgresql_role.role[each.key].name
  schema      = "public"
  object_type = "table"
  privileges  = ["ALL"]
}
