resource "helm_release" "db-backup" {
  name       = "db-backup"
  repository = "https://helm.pennlabs.org"
  chart      = "icarus"
  version    = "0.1.20"

  values = [
    "${file("helm-production/db-backup.yaml")}"
  ]
}
