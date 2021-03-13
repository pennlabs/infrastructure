resource "aws_iam_user" "gh-actions" {
  name = "gh-actions"

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_access_key" "gh-actions" {
  user = aws_iam_user.gh-actions.name
}

resource "aws_iam_user_policy" "gh-actions-assume-kubectl" {
  name   = "kubectl"
  user   = aws_iam_user.gh-actions.name
  policy = data.aws_iam_policy_document.assume-kubectl.json
}

resource "aws_iam_user_policy" "gh-actions-view-k8s" {
  name   = "view-eks"
  user   = aws_iam_user.gh-actions.name
  policy = data.aws_iam_policy_document.view-k8s.json
}
