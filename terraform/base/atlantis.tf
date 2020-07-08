resource "helm_release" "atlantis" {
  name       = "atlantis"
  repository = "https://kubernetes-charts.storage.googleapis.com"
  chart      = "atlantis"
  version    = "3.12.0"

  values = [
    "${file("helm-production/atlantis.yaml")}"
  ]
}
