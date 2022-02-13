resource "helm_release" "datadog" {
  name       = "datadog"
  repository = "https://charts.helm.sh/stable"
  chart      = "datadog"
  namespace  = "monitoring"

  values = var.datadog_values
}
