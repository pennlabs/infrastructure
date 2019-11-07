resource "digitalocean_kubernetes_cluster" "labs-testing" {
  name    = "labs-testing"
  region  = "nyc1"
  // Grab the latest version slug from `doctl kubernetes options versions`
  version = "1.16.2-do.0"

  node_pool {
    name       = "worker-pool"
    size       = "s-2vcpu-2gb"
    node_count = 3
  }
}

resource "digitalocean_database_cluster" "mysql-vault" {
  name       = "mysql-vault"
  engine     = "mysql"
  size       = "db-s-1vcpu-1gb"
  region     = "nyc1"
  node_count = 1
}
