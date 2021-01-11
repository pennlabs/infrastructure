resource "helm_release" "vault-secret-sync" {
  name       = "secret-sync"
  repository = "https://helm.pennlabs.org"
  chart      = "vault-secret-sync"
  version    = "0.1.4"

  values = [templatefile("helm/vault-secret-sync.yaml", {
    role_arn = module.iam-products["secret-sync"].role-arn
  })]
}

// // TODO: modify this for aws auth
// resource "helm_release" "team-sync" {
//   name       = "team-sync"
//   repository = "https://helm.pennlabs.org"
//   chart      = "icarus"
//   version    = "0.1.20"

//   values = [
//     file("helm/team-sync.yaml")
//   ]
// }

// resource "helm_release" "grafana" {
//   name       = "grafana"
//   repository = "https://kubernetes-charts.storage.googleapis.com"
//   chart      = "grafana"
//   version    = "5.1.4"
//   // This needs to be set because secrets that grafana expects aren't set yet
//   wait = false
//   values = [
//     file("helm/grafana.yaml")
//   ]
// }

// resource "helm_release" "bitwarden" {
//   name       = "bitwarden"
//   repository = "https://helm.pennlabs.org"
//   chart      = "icarus"
//   version    = "0.1.20"

//   values = [file("helm/bitwarden.yaml")]
// }

// module "production-cluster" {
//   source                   = "./modules/base_clusrer"
//   traefik_values           = [file("helm/traefik.yaml")]
//   vault_secret_sync_values = [file("helm/vault-secret-sync.yaml")]
//   prometheus_values        = [file("helm/prometheus.yaml")]
// }


// resource "helm_release" "db-backup" {
//   name       = "db-backup"
//   repository = "https://helm.pennlabs.org"
//   chart      = "icarus"
//   version    = "0.1.20"

//   values = [file("helm/db-backup.yaml")]
// }
