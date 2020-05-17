// K8s Cluster
resource "digitalocean_kubernetes_cluster" "cluster" {
  name    = var.name
  region  = "nyc1"
  version = var.k8s_cluster_version

  node_pool {
    name       = var.name
    size       = var.k8s_node_size
    node_count = var.k8s_node_count
  }
}

// Traefik
resource "helm_release" "traefik" {
  name       = "traefik"
  repository = "https://kubernetes-charts.storage.googleapis.com"
  chart      = "traefik"
  version    = "1.86.2"
  namespace  = "kube-system"

  values = var.traefik_values
}

// Cert Manager
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
    "${file("${path.module}/cluster_issuer.yaml")}"
  ]
}

resource "helm_release" "vault-secret-sync" {
  name       = "vault-secret-sync"
  repository = "https://helm.pennlabs.org"
  chart      = "vault-secret-sync"
  version    = "0.1.0"
  values = var.vault_secret_sync_values
}
