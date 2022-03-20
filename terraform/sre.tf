resource "aws_iam_user" "sre" {
  for_each = local.sre_members
  name     = each.key

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_access_key" "sre" {
  for_each = local.sre_members
  user     = aws_iam_user.sre[each.key].name
}

resource "aws_iam_user_policy" "sre" {
  for_each = local.sre_members
  name     = "kubectl"
  user     = aws_iam_user.sre[each.key].name
  policy   = data.aws_iam_policy_document.assume-kubectl.json
}

resource "vault_generic_secret" "aws-auth" {
  for_each = local.sre_members
  path     = "${module.vault.secrets-path}/breakglass/aws/${each.key}"

  data_json = jsonencode({
    "ACCESS_KEY" = aws_iam_access_key.sre[each.key].id
    "SECRET_KEY" = aws_iam_access_key.sre[each.key].secret
  })
}
