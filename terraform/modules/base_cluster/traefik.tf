resource "helm_release" "traefik" {
  name       = "traefik"
  repository = "https://charts.helm.sh/stable"
  chart      = "traefik"
  version    = "1.87.2"
  namespace  = "kube-system"

  values = var.traefik_values
}
