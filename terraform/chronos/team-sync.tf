resource "helm_release" "team-sync" {
  name       = "team-sync"
  repository = "https://helm.pennlabs.org"
  chart      = "icarus"
  version    = "0.1.18"

  values = [
    file("helm/team-sync.yaml")
  ]
}
