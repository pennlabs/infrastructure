# Resources
resource "digitalocean_database_db" "vault" {
  cluster_id = digitalocean_database_cluster.mysql-infra.id
  name       = "vault"
}

resource "digitalocean_database_user" "vault" {
  cluster_id = digitalocean_database_cluster.mysql-infra.id
  name       = "vault"
}

resource "aws_kms_key" "vault-unseal-key" {
  description             = "Key to unseal vault"
  deletion_window_in_days = 10
}

resource "aws_iam_user" "vault-unsealer" {
  name = "vault-unsealer"

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_access_key" "vault-unsealer" {
  user = aws_iam_user.vault-unsealer.name
}

resource "aws_iam_user_policy" "vault-unseal-policy" {
  name = "vault-unseal-policy"
  user = aws_iam_user.vault-unsealer.name

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt",
                "kms:Encrypt",
                "kms:DescribeKey"
            ],
            "Resource": "arn:aws:kms:us-east-1:*:key/${aws_kms_key.vault-unseal-key.id}"
        }
    ]
}
EOF
}


# Outputs
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

output "VAULT_DB_USER" {
  sensitive   = true
  value = digitalocean_database_user.vault.name
}

output "VAULT_DB_PASSWORD" {
  sensitive   = true
  value = digitalocean_database_user.vault.password
}

output "VAULT_DB_NAME" {
  sensitive   = true
  value = digitalocean_database_db.vault.name
}

output "VAULT_DB_HOST" {
  sensitive   = true
  value = digitalocean_database_cluster.mysql-infra.host
}

output "VAULT_DB_PORT" {
  sensitive   = true
  value = digitalocean_database_cluster.mysql-infra.port
}
