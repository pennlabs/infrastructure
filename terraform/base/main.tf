module "production-cluster" {
  source     = "../modules/base_cluster"
  name       = "production"
  node_count = 10
  node_size  = "s-2vcpu-4gb"
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
  source     = "../modules/base_cluster"
  name       = "sandbox"
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
  source     = "../modules/postgres_cluster"
  users      = local.database_users
  name       = "production"
  node_count = 2
  node_size  = "db-s-6vcpu-16gb"
}

locals {
  database_users = toset(["bitwarden", "common-funding-application", "office-hours-queue", "penn-clubs", "penn-courses", "platform", "platform-dev", "student-life"])
}
