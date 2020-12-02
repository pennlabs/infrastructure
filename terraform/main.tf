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
  platform_members = toset([
    "armaan",
    "peyton"
  ])
  k8s_cluster_name = "production"
}

data "aws_iam_policy_document" "assume-role-policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}
