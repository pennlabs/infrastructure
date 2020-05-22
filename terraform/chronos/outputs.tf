output "endpoint" {
  value     = module.chronos-cluster.endpoint
  sensitive = true
}

output "token" {
  value     = module.chronos-cluster.token
  sensitive = true
}

output "cluster_ca_certificate" {
  value     = module.chronos-cluster.cluster_ca_certificate
  sensitive = true
}
