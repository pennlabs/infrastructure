resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://kubernetes-charts.storage.googleapis.com"
  chart      = "grafana"
  version    = "5.0.24"

  values = [
    file("helm/grafana.yaml")
  ]
}
