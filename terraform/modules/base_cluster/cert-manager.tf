resource "kubernetes_namespace" "cert-manager" {
  metadata {
    name = "cert-manager"
  }
}

resource "helm_release" "cert-manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  version    = "0.15.0"
  namespace  = kubernetes_namespace.cert-manager.metadata[0].name

  values = var.cert_manager_values
}

resource "helm_release" "labs-clusterissuer" {
  name       = "labs-clusterissuer"
  repository = "https://helm.pennlabs.org"
  chart      = "helm-wrapper"
  version    = "0.1.0"
  values = [
    "${file("${path.module}/clusterissuer.yaml")}"
  ]
}

resource "helm_release" "pennlabs-wildcard-cert" {
  name       = "pennlabs-wildcard-cert"
  repository = "https://helm.pennlabs.org"
  chart      = "helm-wrapper"
  version    = "0.1.0"
  values = [
    "${file("${path.module}/wildcard-cert.yaml")}"
  ]
}
