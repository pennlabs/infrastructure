module "production-cluster" {
  source     = "../modules/cluster"
  name       = "production"
  node_count = 5
}

module "staging-cluster" {
  source     = "../modules/cluster"
  name       = "staging"
  node_count = 1
  node_size  = "s-1vcpu-2gb"
}
