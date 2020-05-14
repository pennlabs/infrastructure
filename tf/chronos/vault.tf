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

resource "kubernetes_secret" "vault" {
  metadata {
    name = "vault"
  }

  data = {
    AWS_ACCESS_KEY_ID     = aws_iam_access_key.vault.id
    AWS_SECRET_ACCESS_KEY = aws_iam_access_key.vault.secret
  }
}

resource "helm_release" "vault" {
  name       = "vault"
  repository = "./"
  chart      = "vault-helm"
  version    = "0.4.0"

  values = [
    templatefile("helm/vault.yaml", {
      VAULT_DB_USER     = "vault",
      VAULT_DB_PASSWORD = module.postgres-cluster.passwords["vault"],
      VAULT_DB_NAME     = "vault",
      VAULT_DB_HOST     = module.postgres-cluster.host,
      VAULT_DB_PORT     = module.postgres-cluster.port,
      KMS_KEY_ID        = aws_kms_key.vault.key_id,
      }
    )
  ]
  // TODO: create table needed for vault. local-exec?
  // https://www.vaultproject.io/docs/configuration/storage/postgresql
}
