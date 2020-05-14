// Chronos K8s cluster
module "chronos-cluster" {
  source = "../modules/base_cluster"
  name   = "chronos"
  // TODO: (before release) change this to >=2
  k8s_node_count = 1
  k8s_node_size  = "s-1vcpu-2gb"
  traefik_values = [
    "${file("helm/traefik.yaml")}"
  ]
  cert_manager_values = [
    "${file("helm/cert-manager.yaml")}"
  ]
}

// Infrastructure DB
module "postgres-cluster" {
  source = "../modules/postgres_cluster"
  users  = ["vault", "grafana-prod", "grafana-sandbox"]
  name   = "infrastructure"
  // TODO: (before release) make this more and add a replica
  node_count = 1
}


// Atlantis
TODO:
