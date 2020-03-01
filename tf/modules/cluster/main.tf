resource "digitalocean_kubernetes_cluster" "cluster" {
  name    = "${var.name}"
  region  = "nyc1"

  // Grab the latest version slug from `doctl kubernetes options versions`
  version = "1.16.2-do.0"

  node_pool {
    name       = "${var.name}"
    size       = "${var.node_size}"
    node_count = var.node_count 
  }
}