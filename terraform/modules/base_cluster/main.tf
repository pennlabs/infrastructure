resource "digitalocean_kubernetes_cluster" "cluster" {
  name    = var.name
  region  = "nyc1"
  version = var.cluster_version

  node_pool {
    name       = var.name
    size       = var.node_size
    node_count = var.node_count
  }
}
