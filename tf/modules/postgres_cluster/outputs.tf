output "host" {
  value     = digitalocean_database_cluster.postgres.host
  sensitive = true
}

output "port" {
  value     = digitalocean_database_cluster.postgres.port
  sensitive = true
}

output "user" {
  value     = digitalocean_database_cluster.postgres.user
  sensitive = true
}

output "password" {
  value     = digitalocean_database_cluster.postgres.password
  sensitive = true
}

output "version" {
  value     = digitalocean_database_cluster.postgres.version
  sensitive = false
}
