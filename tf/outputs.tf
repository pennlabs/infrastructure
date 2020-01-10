output "KUBECONFIG" {
  sensitive   = true
  value = digitalocean_kubernetes_cluster.labs-prod.kube_config[0].raw_config
}

output "JUMP_IP" {
  sensitive   = true
  value = digitalocean_droplet.jump.ipv4_address
}
