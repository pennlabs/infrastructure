// Chronos K8s cluster
module "chronos-cluster" {
  source = "../modules/base_cluster"
  name   = "chronos"
  // TODO: (before release) change this to >=2
  node_count = 1
  node_size  = "s-1vcpu-2gb"
  traefik_values = [
    "${file("helm/traefik.yaml")}"
  ]
  cert_manager_values = [
    "${file("helm/cert-manager.yaml")}"
  ]
  vault_secret_sync_values = [
    "${file("helm/vault-secret-sync.yaml")}"
  ]
  prometheus_values = [
    "${file("helm/prometheus.yaml")}"
  ]
  fluentd_values = [
    "${file("helm/fluentd.yaml")}"
  ]
}

// Infrastructure DB
module "postgres-cluster" {
  source = "../modules/postgres_cluster"
  users  = ["vault", "grafana"]
  name   = "infrastructure"
  // TODO: (before release) make this more and add a replica
  node_count = 1
}