resource "digitalocean_database_cluster" "mysql-cluster" {
  name       = "${var.name}"
  engine     = "mysql"
  size       = "${var.node_size}"
  region     = "nyc1"
  node_count = var.node_count
  version    = 8
}