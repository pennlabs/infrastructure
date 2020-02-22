resource "digitalocean_kubernetes_cluster" "labs-prod" {
  name    = "production"
  region  = "nyc1"

  // Grab the latest version slug from `doctl kubernetes options versions`
  version = "1.16.2-do.0"

  node_pool {
    name       = "worker-pool"
    size       = "s-2vcpu-4gb"
    node_count = 5
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "digitalocean_ssh_key" "pawalt" {
  name       = "pawalt"
  public_key = file("keys/pawalt.pub")
}

resource "digitalocean_droplet" "jump" {
  image  = "ubuntu-18-04-x64"
  name   = "jump-host"
  region = "nyc2"
  size   = "s-1vcpu-1gb"
  ssh_keys = [
    digitalocean_ssh_key.pawalt.fingerprint,
    // Existing DO SSH keys from Armaan, Davis, and Eric
    23679853,
    15536236,
    14680641,
  ]
}

resource "digitalocean_database_cluster" "mysql-infra" {
  name       = "mysql-infra"
  engine     = "mysql"
  size       = "db-s-1vcpu-1gb"
  region     = "nyc1"
  node_count = 1
  version    = 8

  lifecycle {
    prevent_destroy = true
  }
}

resource "digitalocean_database_cluster" "mysql-production" {
  name       = "mysql-production"
  engine     = "mysql"
  size       = "db-s-1vcpu-1gb"
  region     = "nyc1"
  node_count = 1
  version    = 8

  lifecycle {
    prevent_destroy = true
  }
}

module "production-db-users" {
  source =  "./modules/db-user-management"
  names  = []
}

module "infra-db-users" {
  source = "./modules/db-user-management"
  names  = []

  providers = {
    mysql = mysql.infra
  }
}
