module "production-cluster" {
  source = "../modules/base_cluster"
  name   = "production"
  // TODO: (before release) change this to >=2
  node_count = 1
  node_size  = "s-1vcpu-2gb"
  traefik_values = [
    "${file("helm-production/traefik.yaml")}"
  ]
  cert_manager_values = [
    "${file("helm-production/cert-manager.yaml")}"
  ]
  vault_secret_sync_values = [
    "${file("helm-production/vault-secret-sync.yaml")}"
  ]
  prometheus_values = [
    "${file("helm-production/prometheus.yaml")}"
  ]
  fluentd_values = [
    "${file("helm-production/fluentd.yaml")}"
  ]
}

module "sandbox-cluster" {
  source         = "../modules/base_cluster"
  name           = "sandbox"
  node_count = 1
  node_size  = "s-1vcpu-2gb"
  traefik_values = [
    "${file("helm-sandbox/traefik.yaml")}"
  ]
  cert_manager_values = [
    "${file("helm-sandbox/cert-manager.yaml")}"
  ]
  vault_secret_sync_values = [
    "${file("helm-sandbox/vault-secret-sync.yaml")}"
  ]
  prometheus_values = [
    "${file("helm-sandbox/prometheus.yaml")}"
  ]
  fluentd_values = [
    "${file("helm-sandbox/fluentd.yaml")}"
  ]
  providers = {
    helm       = helm.sandbox
    kubernetes = kubernetes.sandbox
  }
}

// Production DB
module "postgres-cluster" {
  source = "../modules/postgres_cluster"
  users  = local.database_users
  name   = "production"
  // TODO: (before release) make this more and add a replica
  node_count = 1
}

locals {
  database_users = toset(["bitwarden", "common-funding-application", "labs-api-server", "penn-club", "penn-courses", "platform", "platform-dev", "student-life"])
}
