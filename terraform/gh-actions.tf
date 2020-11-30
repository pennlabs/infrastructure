resource "aws_iam_user" "gh-actions" {
  name = "gh-actions"

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_access_key" "gh-actions" {
  user = aws_iam_user.gh-actions.name
}

data "aws_iam_policy_document" "gh-actions" {
  statement {
    actions   = ["eks:DescribeCluster"]
    effect    = "Allow"
    resources = [module.eks-production.cluster_arn]
  }
}

resource "aws_iam_user_policy" "gh-actions" {
  name   = "gh-actions"
  user   = aws_iam_user.gh-actions.name
  policy = data.aws_iam_policy_document.gh-actions.json
}
