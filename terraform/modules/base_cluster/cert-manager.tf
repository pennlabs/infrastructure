resource "kubernetes_namespace" "cert-manager" {
  metadata {
    name = "cert-manager"
  }
}

resource "helm_release" "cert-manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  version    = "1.1.0"
  namespace  = kubernetes_namespace.cert-manager.metadata[0].name
  // This is set to ensure that cert-manager is working before the CRs are applied
  atomic = true
  set {
    name = "installCRDs"
    value = true
  }  
}

resource "time_sleep" "cert-manager-cr" {
  // Used to allow cert-manager time to initialize
  depends_on      = [helm_release.cert-manager]
  create_duration = "1m"
}

resource "helm_release" "labs-clusterissuer" {
  name       = "labs-clusterissuer"
  repository = "https://helm.pennlabs.org"
  chart      = "helm-wrapper"
  version    = "0.1.0"
  values = [file("${path.module}/clusterissuer.yaml")]

  depends_on = [
    time_sleep.cert-manager-cr
  ]
}

resource "helm_release" "pennlabs-wildcard-cert" {
  name       = "pennlabs-wildcard-cert"
  repository = "https://helm.pennlabs.org"
  chart      = "helm-wrapper"
  version    = "0.1.0"
  values = [file("${path.module}/wildcard-cert.yaml")]

  depends_on = [
    time_sleep.cert-manager-cr
  ]
}
