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
