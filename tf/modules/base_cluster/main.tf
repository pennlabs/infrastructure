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
