resource "aws_security_group" "rds" {
  name   = "rds"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port = 5432
    to_port   = 5432
    protocol  = "tcp"
    // Setting this to be more restrictive would require always running
    // terraform in the EKS cluster so it can access RDS. Probably not worth
    // the trouble for the added security it provides.
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "Production DB",
    created-by = "terraform"
  }
}

resource "aws_db_subnet_group" "rds" {
  name       = "public-subnets"
  subnet_ids = module.vpc.public_subnets

  tags = {
    Name       = "RDS subnet group",
    created-by = "terraform"
  }
}

resource "aws_db_instance" "production" {
  identifier                          = "production"
  instance_class                      = "db.t3.2xlarge"
  engine                              = "postgres"
  engine_version                      = "11.16"
  availability_zone                   = "us-east-1a"
  allocated_storage                   = 20
  max_allocated_storage               = 200
  username                            = "postgres"
  password                            = var.RDS_PASSWORD
  iam_database_authentication_enabled = true
  db_subnet_group_name                = aws_db_subnet_group.rds.name
  vpc_security_group_ids              = [aws_security_group.rds.id]
  publicly_accessible                 = true
  tags = {
    Name       = "Production",
    created-by = "terraform"
  }
}

resource "random_password" "postgres-password" {
  for_each = setunion(local.database_users, local.readonly_users)
  length   = 64
  special  = false
}

resource "postgresql_database" "db" {
  for_each = local.database_users
  name     = each.key
  owner    = postgresql_role.role[each.key].name
}

resource "postgresql_role" "role" {
  for_each = local.database_users
  name     = each.key
  login    = true
  password = random_password.postgres-password[each.key].result
}

resource "postgresql_role" "readonly_role" {
  for_each = local.readonly_users
  name     = each.key
  password = random_password.postgres-password[each.key].result
  login    = true
}

resource "postgresql_grant" "readonly_tables" {
  for_each    = { for config in local.readonly_config : "${config.db}-${config.user}" => config } //local.database_users
  role        = each.value.user
  database    = postgresql_database.db[each.value.db].name
  object_type = "table"
  schema      = "public"
  privileges  = ["SELECT"]
}

resource "postgresql_grant" "readonly_sequence" {
  for_each    = { for config in local.readonly_config : "${config.db}-${config.user}" => config } //local.database_users
  role        = each.value.user
  database    = postgresql_database.db[each.value.db].name
  object_type = "sequence"
  schema      = "public"
  privileges  = ["SELECT"]
}

resource "postgresql_default_privileges" "privileges" {
  for_each    = local.database_users
  database    = postgresql_database.db[each.key].name
  role        = postgresql_role.role[each.key].name
  owner       = postgresql_role.role[each.key].name
  schema      = "public"
  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"]
}
