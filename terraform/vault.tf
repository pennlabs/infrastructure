// Certificate
resource "aws_acm_certificate" "vault" {
  domain_name       = "vault.pennlabs.org"
  validation_method = "DNS"
}

// KMS
resource "aws_kms_key" "vault" {
  description = "Key to unseal vault"

  tags = {
    created-by = "terraform"
  }
}

// IAM
resource "aws_iam_role" "vault" {
  name = "vault"

  assume_role_policy = data.aws_iam_policy_document.assume-role-policy.json

  tags = {
    created-by = "terraform"
  }
}

data "aws_iam_policy_document" "vault-iam" {
  statement {
    actions = [
      "iam:GetUser",
      "iam:GetRole"
    ]
    resources = ["arn:aws:iam::*:role/*"]
  }
}

resource "aws_iam_role_policy" "vault-iam" {
  name = "iam"
  role = aws_iam_role.vault.id

  policy = data.aws_iam_policy_document.vault-iam.json
}

data "aws_iam_policy_document" "vault-kms" {
  statement {
    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:DescribeKey"
    ]
    resources = [aws_kms_key.vault.arn]
  }
}

resource "aws_iam_role_policy" "vault-kms" {
  name = "kms"
  role = aws_iam_role.vault.id

  policy = data.aws_iam_policy_document.vault-kms.json
}

resource "aws_iam_instance_profile" "vault" {
  name = "vault"
  role = aws_iam_role.vault.name
}

// EC2 Instance
resource "aws_instance" "vault" {
  // Official Vault OSS AMI
  ami                    = local.vault_ami
  instance_type          = "t3.small"
  subnet_id              = module.vpc.public_subnets[0]
  vpc_security_group_ids = [aws_security_group.vault.id]
  iam_instance_profile   = aws_iam_instance_profile.vault.name
  key_name               = aws_key_pair.armaan.key_name
  user_data = templatefile("files/vault_user_data.sh", {
    connection_url = format("postgres://vault:%s@%s/vault", random_password.postgres-password["vault"].result, aws_db_instance.production.endpoint)
    kms_key_id     = aws_kms_key.vault.key_id
  })
  tags = {
    Name       = "Vault"
    created-by = "terraform"
  }
  // TODO: local exec for table
  // Create the vault_kv_store table needed for vault
  // taken from https://www.vaultproject.io/docs/configuration/storage/postgresql
  //   provisioner "local-exec" {
  //     command = <<EOF
  // psql "postgres://$VAULT_DB_USER:$VAULT_DB_PASSWORD@$VAULT_DB_HOST:$VAULT_DB_PORT/$VAULT_DB_NAME" -c "
  //   CREATE TABLE "vault_kv_store" (
  //   parent_path TEXT COLLATE \"C\" NOT NULL,
  //   path        TEXT COLLATE \"C\",
  //   key         TEXT COLLATE \"C\",
  //   value       BYTEA,
  //   CONSTRAINT pkey PRIMARY KEY (path, key)
  // );

  // CREATE INDEX parent_path_idx ON vault_kv_store (parent_path);
  // "
  //     EOF
  //     environment = {
  //       VAULT_DB_USER     = "vault"
  //       VAULT_DB_PASSWORD = module.postgres-cluster.passwords["vault"]
  //       VAULT_DB_NAME     = "vault"
  //       VAULT_DB_HOST     = module.postgres-cluster.host
  //       VAULT_DB_PORT     = module.postgres-cluster.port
  //     }
  //   }
}
// TODO: remove
resource "aws_key_pair" "armaan" {
  key_name   = "armaan"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDATHpBscMwZBByUmafMmIcbDB2my1Ejj88DAalX8lJHr4mav2ZrPVZK7XAz6SacmGiIEMCK6YgkXh502MgPKLoBEBf4OzvLJVpZlsjzJX3dK+MWTff/a1Jyo35nUOFSdjUyKPNV0CPq5bUqGvYo3hh/bCZQn+7cZ7pENPo/1J/vdmdE5CTrl0UuGqLj0OWjolJwSiL0zeUaRuWATukcn5qv4vgZ9H4woCaMEX5FEVWYPsB7kIz5jH7LlFnhvJ3N8ay3Y/2/2JzFR2RdivQID6vO8Cm7bxfoSF5GpAGJbKcFEJGuV+j/xd3QRHHsC/fHy1sSD4G2bszveHKQwQ1aVYUgq0dITx4o/WO1sbTzRruA0FA63SNAnikq7+eyJsUT/9RkHf3DKXZJqTFCZ1+dDZz9pQSv6dlx4lZ7qgUPcdBiA8WpNTxUZSZ/GvwieE8Zz5sQ6mWQlHgqoILe4t1NpRPLi5LFKvV+nR7Yt0vdlddRkuZE/hBo/XilC9lGYT9hHosZzhiQJ7NZvul9txA8N2YpDBAb1HOR3vd+mpGX0BzxpMUhrJwJdRlQANfULMalHHXTkjPqPUSctrj7zvMl/lzmbGlpClxcp+c3mlIM3lPtoW3dYnaVNK/tYuyzAAUzvNPkPKn1/6XgXhu6hf8TBFScvKSWjn2KFLbo2d0+exUMQ== armaan"
}

resource "aws_security_group" "vault" {
  name        = "vault"
  description = "Allow TLS inbound traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "TLS from LB"
    from_port       = 8200
    to_port         = 8200
    protocol        = "tcp"
    security_groups = [aws_security_group.vault-lb.id]
  }

  // TODO: remove ssh
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "Vault"
    created-by = "terraform"
  }
}

// ELB
resource "aws_security_group" "vault-lb" {
  name        = "vault-lb"
  description = "Allow TLS inbound traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "TLS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "Vault LB"
    created-by = "terraform"
  }
}

resource "aws_lb" "vault" {
  name               = "vault"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.vault-lb.id]
  subnets            = module.vpc.public_subnets


  tags = {
    created-by = "terraform"
  }
}

resource "aws_lb_target_group" "vault" {
  name     = "vault"
  port     = 8200
  protocol = "HTTPS"
  vpc_id   = module.vpc.vpc_id

  health_check {
    protocol = "HTTPS"
    path     = "/v1/sys/health?standbyok=true"
  }
}

resource "aws_lb_listener" "vault" {
  load_balancer_arn = aws_lb.vault.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.vault.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.vault.arn
  }
}

resource "aws_lb_target_group_attachment" "vault" {
  target_group_arn = aws_lb_target_group.vault.arn
  target_id        = aws_instance.vault.id
}

// ----------------------------------------------------
// Comment out everything below this when bootstrapping
// ----------------------------------------------------

// Vault configuration
module "vault" {
  source              = "./modules/vault"
  CF_API_KEY          = var.CF_API_KEY
  GH_PERSONAL_TOKEN   = var.GH_PERSONAL_TOKEN
  GF_GH_CLIENT_ID     = var.GF_GH_CLIENT_ID
  GF_GH_CLIENT_SECRET = var.GF_GH_CLIENT_SECRET
  GF_SLACK_URL        = var.GF_SLACK_URL
  // TODO: move these out of module
  secret-sync-arn     = module.iam-secret-sync.role-arn
  team-sync-arn       = module.iam-products["team-sync"].role-arn
}

// Database secrets
module "db-secret-flush" {
  source = "./modules/vault_flush"
  // Vault exists outside of EKS, so don't create an entry for it
  for_each = setsubtract(local.database_users, ["vault"])
  path = "secrets/production/default/${each.key}"
  entry = {DATABASE_URL = "postgres://${each.key}:${postgresql_role.role[each.key].password}@${aws_db_instance.production.endpoint}/${each.key}"}
}
