output "host" {
  value     = digitalocean_database_cluster.postgres.host
  sensitive = true
}

output "private-host" {
  value     = digitalocean_database_cluster.postgres.private_host
  sensitive = true
}

output "port" {
  value     = digitalocean_database_cluster.postgres.port
  sensitive = true
}

output "admin-user" {
  value     = digitalocean_database_cluster.postgres.user
  sensitive = true
}

output "admin-password" {
  value     = digitalocean_database_cluster.postgres.password
  sensitive = true
}

output "version" {
  value     = digitalocean_database_cluster.postgres.version
  sensitive = false
}

output "passwords" {
  value = {
    for user in postgresql_role.role :
    user.name => user.password
  }
  sensitive = true
}
