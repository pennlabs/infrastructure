resource "aws_kms_key" "vault" {
  description             = "Key to unseal vault"
  deletion_window_in_days = 10

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_user" "vault" {
  name = "vault"

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_access_key" "vault" {
  user = aws_iam_user.vault.name
}

resource "aws_iam_user_policy" "vault" {
  name = "vault"
  user = aws_iam_user.vault.name

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
            "Resource": "arn:aws:kms:us-east-1:*:key/${aws_kms_key.vault.id}"
        }
    ]
}
EOF
}

resource "helm_release" "vault" {
  name       = "vault"
  repository = "https://helm.releases.hashicorp.com"
  chart      = "vault"
  version    = "0.5.0"

  values = [
    file("helm/vault.yaml")
  ]

  // Create the vault_kv_store table needed for vault
  // taken from https://www.vaultproject.io/docs/configuration/storage/postgresql
  provisioner "local-exec" {
    command = <<EOF
psql "postgres://$VAULT_DB_USER:$VAULT_DB_PASSWORD@$VAULT_DB_HOST:$VAULT_DB_PORT/$VAULT_DB_NAME" -c "
  CREATE TABLE "vault_kv_store" (
  parent_path TEXT COLLATE \"C\" NOT NULL,
  path        TEXT COLLATE \"C\",
  key         TEXT COLLATE \"C\",
  value       BYTEA,
  CONSTRAINT pkey PRIMARY KEY (path, key)
);

CREATE INDEX parent_path_idx ON vault_kv_store (parent_path);
"
    EOF
    environment = {
      VAULT_DB_USER     = "vault"
      VAULT_DB_PASSWORD = module.postgres-cluster.passwords["vault"]
      VAULT_DB_NAME     = "vault"
      VAULT_DB_HOST     = module.postgres-cluster.host
      VAULT_DB_PORT     = module.postgres-cluster.port
    }
  }
}

resource "kubernetes_secret" "vault" {
  metadata {
    name = "vault"
  }

  data = {
    AWS_ACCESS_KEY_ID        = aws_iam_access_key.vault.id
    AWS_SECRET_ACCESS_KEY    = aws_iam_access_key.vault.secret
    VAULT_AWSKMS_SEAL_KEY_ID = aws_kms_key.vault.key_id
    VAULT_PG_CONNECTION_URL  = "postgres://vault:${module.postgres-cluster.passwords["vault"]}@${module.postgres-cluster.private-host}:${module.postgres-cluster.port}/vault"
  }
}
