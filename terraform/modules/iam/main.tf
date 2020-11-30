resource "aws_iam_role" "role" {
  assume_role_policy = data.aws_iam_policy_document.k8s.json
  name               = var.role
  tags = {
    created-by = "terraform"
  }
}

data "aws_iam_policy_document" "k8s" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    condition {
      test     = "StringEquals"
      variable = "${replace(var.oidc_issuer_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:${var.namespace}:${var.role}"]
    }

    principals {
      identifiers = [var.oidc_provider_arn]
      type        = "Federated"
    }
  }
}
