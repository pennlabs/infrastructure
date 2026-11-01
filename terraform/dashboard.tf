// Read-only Performance Insights access for the deployment dashboard. The role
// is limited to the production database's metrics and can't connect to it.
locals {
  // The production instance's DbiResourceId. Written out rather than read from
  // aws_db_instance.production so that targeting this policy doesn't also pull
  // the database into the plan.
  production_db_resource_id = "db-UZ6WEKHZ2ZTWOOJCPYO3KAQECM"
}

data "aws_iam_policy_document" "dashboard-backend" {
  statement {
    actions = ["pi:DescribeDimensionKeys", "pi:GetResourceMetrics"]
    resources = [
      "arn:aws:pi:us-east-1:${data.aws_caller_identity.current.account_id}:metrics/rds/${local.production_db_resource_id}"
    ]
  }
}

resource "aws_iam_role_policy" "dashboard-backend" {
  name = "dashboard-backend"
  role = module.iam-products["dashboard-backend"].role-id

  policy = data.aws_iam_policy_document.dashboard-backend.json
}
