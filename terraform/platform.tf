resource "aws_iam_user" "platform" {
  for_each = local.platform_members
  name     = each.key

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_access_key" "platform" {
  for_each = local.platform_members
  user     = aws_iam_user.platform[each.key].name
}

resource "aws_iam_user_policy" "platform" {
  for_each = local.platform_members
  name     = "kubectl"
  user     = aws_iam_user.platform[each.key].name
  policy   = data.aws_iam_policy_document.assume-kubectl.json
}

resource "vault_generic_secret" "aws-auth" {
  for_each = local.platform_members
  path     = "${module.vault.secrets-path}/breakglass/aws/${each.key}"

  data_json = jsonencode({
    "ACCESS_KEY" = aws_iam_access_key.platform[each.key].id
    "SECRET_KEY" = aws_iam_access_key.platform[each.key].secret
  })
}
