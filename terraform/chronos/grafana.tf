resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://kubernetes-charts.storage.googleapis.com"
  chart      = "grafana"
  version    = "5.1.4"
  // This needs to be set because secrets that grafana expects aren't set yet
  wait = false
  values = [
    file("helm/grafana.yaml")
  ]
}
