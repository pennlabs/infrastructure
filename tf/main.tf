resource "digitalocean_kubernetes_cluster" "labs-prod" {
  name    = "labs-prod"
  region  = "nyc1"
  // Grab the latest version slug from `doctl kubernetes options versions`
  version = "1.16.2-do.0"

  node_pool {
    name       = "worker-pool"
    size       = "s-2vcpu-4gb"
    node_count = 5
  }
}

resource "digitalocean_database_cluster" "mysql-infra" {
  name       = "mysql-infra"
  engine     = "mysql"
  size       = "db-s-1vcpu-1gb"
  region     = "nyc1"
  node_count = 1
}

resource "digitalocean_database_db" "vault" {
  cluster_id = digitalocean_database_cluster.mysql-infra.id
  name       = "vault"
}

resource "digitalocean_database_user" "vault-user" {
  cluster_id = digitalocean_database_cluster.mysql-infra.id
  name       = "vault-user"
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
  user = "${aws_iam_user.vault-unsealer.name}"
}

resource "aws_iam_user_policy" "vault-unseal-policy" {
  name = "vault-unseal-policy"
  user = "${aws_iam_user.vault-unsealer.name}"

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
