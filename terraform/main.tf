locals {
  database_users = setunion(local.products,
    toset([
      "bitwarden",
      "vault",
    ])
  )
  products = toset([
    "common-funding-application",
    "first-year-hub",
    "office-hours-queue",
    "penn-clubs",
    "penn-courses",
    "platform",
    "platform-dev",
    "student-life"
  ])
  iam_service_accounts = setunion(local.products,
    toset([
      "team-sync",
      "db-backup",
    ])
  )
  platform_members = toset([
    "armaan",
    "peyton"
  ])
  k8s_cluster_name = "production"
  vault_ami        = "ami-0eec2c28d4dd94628"
}

data "aws_iam_policy_document" "assume-kubectl" {
  statement {
    actions   = ["sts:AssumeRole"]
    resources = [aws_iam_role.kubectl.arn]
  }
}
