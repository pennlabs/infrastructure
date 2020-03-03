output "host" {
  value     = digitalocean_database_cluster.mysql.host
  sensitive = true
}

output "port" {
  value     = digitalocean_database_cluster.mysql.port
  sensitive = true
}

output "user" {
  value     = digitalocean_database_cluster.mysql.user
  sensitive = true
}

output "password" {
  value     = digitalocean_database_cluster.mysql.password
  sensitive = true
}
