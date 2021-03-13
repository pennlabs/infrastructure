data "aws_iam_policy_document" "db-backup" {
  statement {
    actions = ["s3:PutObject", "s3:Get*"]
    resources = [
      "arn:aws:s3:::sql.pennlabs.org/*",
      "arn:aws:s3:::sql.pennlabs.org"
    ]
  }
}

resource "aws_iam_role_policy" "db-backup" {
  name = "db-backup"
  role = module.iam-products["db-backup"].role-id

  policy = data.aws_iam_policy_document.db-backup.json
}
