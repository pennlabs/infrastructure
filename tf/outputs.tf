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
  value = digitalocean_database_user.vault-user.name
}

output "DB_PASSWORD" {
  sensitive   = true
  value = digitalocean_database_user.vault-user.password
}

output "DB_NAME" {
  sensitive   = true
  value = digitalocean_database_db.vault.name
}

output "DB_HOST" {
  sensitive   = true
  value = digitalocean_database_cluster.mysql-infra.host
}

output "DB_PORT" {
  sensitive   = true
  value = digitalocean_database_cluster.mysql-infra.port
}

output "KUBECONFIG" {
  sensitive   = true
  value = digitalocean_kubernetes_cluster.labs-prod.kube_config[0].raw_config
}

output "GHOST_AWS_ACCESS_KEY_ID" {
  sensitive   = true
  value = aws_iam_access_key.ghost-user.id
}

output "GHOST_AWS_SECRET_ACCESS_KEY" {
  sensitive   = true
  value = aws_iam_access_key.ghost-user.secret
}

output "GHOST_STORAGE_ADAPTER_S3_PATH_BUCKET" {
  sensitive   = true
  value = aws_s3_bucket.ghost_static.bucket
}
