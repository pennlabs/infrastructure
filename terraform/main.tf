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
  k8s_cluster_size = 10
  vault_ami        = "ami-0eec2c28d4dd94628"
  domains = toset([
    "ohq.io",
    "pennbasics.com",
    "penncfa.com",
    "pennclubs.com",
    "penncoursealert.com",
    "penncourseplan.com",
    "penncoursereview.com", // Currently still in Google Domains
    "penncourses.org", // Currently still in Google Domains
    "pennlabs.org",
    "pennmobile.org",
  ])
  traefik_lb_name = "a3b77cc4561e649d4bcc2a89e1b63d7d"
}

data "aws_iam_policy_document" "assume-kubectl" {
  statement {
    actions   = ["sts:AssumeRole"]
    resources = [aws_iam_role.kubectl.arn]
  }
}
