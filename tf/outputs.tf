
output "AWS_ACCESS_KEY_ID" {
  sensitive   = true
  value = aws_iam_access_key.vault-unsealer.id
}

output "AWS_SECRET_ACCESS_KEY" {
  sensitive   = true
  value = aws_iam_access_key.vault-unsealer.secret
}

output "KMS_KEY_ID" {
  sensitive   = true
  value = aws_kms_key.vault-unseal-key.key_id
}

output "DB_USER" {
  sensitive   = true
  value = digitalocean_database_cluster.mysql-vault.user
}

output "DB_PASSWORD" {
  sensitive   = true
  value = digitalocean_database_cluster.mysql-vault.password
}

output "DB_NAME" {
  sensitive   = true
  value = digitalocean_database_cluster.mysql-vault.database
}

output "DB_HOST" {
  sensitive   = true
  value = digitalocean_database_cluster.mysql-vault.private_host
}

output "DB_PORT" {
  sensitive   = true
  value = digitalocean_database_cluster.mysql-vault.port
}

output "KUBECONFIG" {
  sensitive   = true
  value = digitalocean_kubernetes_cluster.labs-prod.kube_config[0].raw_config
}
