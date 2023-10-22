resource "helm_release" "traefik" {
  name       = "traefik"
  repository = "https://traefik.github.io/charts"
  chart      = "traefik"
  version    = "21.0.0"
  namespace  = "kube-system"

  values = var.traefik_values
}
