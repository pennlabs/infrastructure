output "endpoint" {
  value = digitalocean_kubernetes_cluster.cluster.endpoint
}

output "token" {
  value = digitalocean_kubernetes_cluster.cluster.kube_config[0].token
}

output "cluster_ca_certificate" {
  value = digitalocean_kubernetes_cluster.cluster.kube_config[0].cluster_ca_certificate
}
