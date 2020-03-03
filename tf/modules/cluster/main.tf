resource "digitalocean_kubernetes_cluster" "cluster" {
  name    = var.name
  region  = "nyc1"
  version = var.k8s_cluster_version

  node_pool {
    name       = var.name
    size       = var.k8s_node_size
    node_count = var.k8s_node_count
  }
}

module "infrastructure-database" {
  source          = "../mysql_cluster"
  name            = "mysql-${var.name}-infrastructure"
  node_count      = var.mysql_node_count
  node_size       = var.mysql_node_size
  cluster_version = var.mysql_cluster_version
  users           = var.mysql_users
  pgp_key         = var.pgp_key
}
