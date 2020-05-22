resource "helm_release" "bitwarden" {
  name       = "bitwarden"
  repository = "https://helm.pennlabs.org"
  chart      = "icarus"
  version    = "0.1.17"

  values = [
    "${file("helm-production/bitwarden.yaml")}"
  ]
}
