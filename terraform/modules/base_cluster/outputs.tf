output "endpoint" {
  value     = digitalocean_kubernetes_cluster.cluster.endpoint
  sensitive = true
}

output "token" {
  value     = digitalocean_kubernetes_cluster.cluster.kube_config[0].token
  sensitive = true
}

output "cluster_ca_certificate" {
  value     = digitalocean_kubernetes_cluster.cluster.kube_config[0].cluster_ca_certificate
  sensitive = true
}
