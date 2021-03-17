resource "github_actions_organization_secret" "aws_account_id" {
  secret_name     = "AWS_ACCOUNT_ID"
  visibility      = "all"
  plaintext_value = data.aws_caller_identity.current.account_id
}

resource "github_actions_organization_secret" "aws_access_key" {
  secret_name     = "GH_AWS_ACCESS_KEY_ID"
  visibility      = "all"
  plaintext_value = aws_iam_access_key.gh-actions.id
}

resource "github_actions_organization_secret" "aws_secret_key" {
  secret_name     = "GH_AWS_SECRET_ACCESS_KEY"
  visibility      = "all"
  plaintext_value = aws_iam_access_key.gh-actions.secret
}
