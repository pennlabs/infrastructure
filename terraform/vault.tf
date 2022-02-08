// Certificate
resource "aws_acm_certificate" "vault" {
  domain_name       = "vault.pennlabs.org"
  validation_method = "DNS"
}

resource "aws_route53_record" "vault-tls-validation" {
  for_each = {
    for dvo in aws_acm_certificate.vault.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = module.domains["pennlabs.org"].zone_id
}

resource "aws_acm_certificate_validation" "vault" {
  certificate_arn         = aws_acm_certificate.vault.arn
  validation_record_fqdns = [for record in aws_route53_record.vault-tls-validation : record.fqdn]
}

// KMS
resource "aws_kms_key" "vault" {
  description = "Key to unseal vault"

  tags = {
    created-by = "terraform"
  }
}

// IAM
data "aws_iam_policy_document" "assume-role-policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

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
  key_name               = aws_key_pair.admin.key_name
  user_data = templatefile("files/vault_user_data.sh", {
    connection_url = format("postgres://vault:%s@%s/vault", random_password.postgres-password["vault"].result, aws_db_instance.production.endpoint)
    kms_key_id     = aws_kms_key.vault.key_id
  })
  tags = {
    Name       = "Vault"
    created-by = "terraform"
  }

  // Create the vault_kv_store table needed for vault
  // taken from https://www.vaultproject.io/docs/configuration/storage/postgresql
  provisioner "local-exec" {
    command = <<EOF
  psql "postgres://vault:$VAULT_DB_PASSWORD@$VAULT_DB_ENDPOINT/vault" -c "
    CREATE TABLE IF NOT EXISTS "vault_kv_store" (
    parent_path TEXT COLLATE \"C\" NOT NULL,
    path        TEXT COLLATE \"C\",
    key         TEXT COLLATE \"C\",
    value       BYTEA,
    CONSTRAINT pkey PRIMARY KEY (path, key)
  );

  CREATE INDEX IF NOT EXISTS parent_path_idx ON vault_kv_store (parent_path);
  "
      EOF
    environment = {
      VAULT_DB_PASSWORD = random_password.postgres-password["vault"].result
      VAULT_DB_ENDPOINT = aws_db_instance.production.endpoint
    }
  }
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

  // Add this block when debugging
  // ingress {
  //   description = "SSH"
  //   from_port   = 22
  //   to_port     = 22
  //   protocol    = "tcp"
  //   cidr_blocks = ["0.0.0.0/0"]
  // }

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
  certificate_arn   = aws_acm_certificate_validation.vault.certificate_arn

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
  GF_GH_CLIENT_ID     = var.GF_GH_CLIENT_ID
  GF_GH_CLIENT_SECRET = var.GF_GH_CLIENT_SECRET
  GF_SLACK_URL        = var.GF_SLACK_URL
  SECRET_SYNC_ARN     = module.iam-secret-sync.role-arn
  TEAM_SYNC_ARN       = module.iam-products["team-sync"].role-arn
}

// db-backup secret
resource "vault_generic_secret" "db-backup" {
  path = "${module.vault.secrets-path}/production/default/db-backup"

  data_json = jsonencode({
    "DATABASE_URL" = "postgres://postgres:${aws_db_instance.production.password}@${aws_db_instance.production.endpoint}"
    "S3_BUCKET"    = "sql.pennlabs.org"
  })
}

// Database secrets
module "db-secret-flush" {
  source = "./modules/vault_flush"
  // Vault exists outside of EKS, so don't create an entry for it
  for_each = setsubtract(local.database_users, ["vault"])
  path     = "secrets/production/default/${each.key}"
  entry    = { DATABASE_URL = "postgres://${each.key}:${postgresql_role.role[each.key].password}@${aws_db_instance.production.endpoint}/${each.key}" }
}

module "team-sync-flush" {
  source = "./modules/vault_flush"
  path   = "${module.vault.secrets-path}/production/default/team-sync"

  entry = {
    GITHUB_TOKEN = var.GH_PERSONAL_TOKEN
  }
}
