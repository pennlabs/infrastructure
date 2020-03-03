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

output "mysql-host" {
  value     = module.infrastructure-database.host
  sensitive = true
}

output "mysql-port" {
  value     = module.infrastructure-database.port
  sensitive = true
}

output "mysql-user" {
  value     = module.infrastructure-database.user
  sensitive = true
}

output "mysql-password" {
  value     = module.infrastructure-database.password
  sensitive = true
}
