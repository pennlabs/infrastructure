resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://charts.helm.sh/stable"
  chart      = "prometheus"
  version    = "11.2.3"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name

  values = var.prometheus_values
}
