resource "vault_aws_auth_backend_role" "secret-sync" {
  role                     = "secret-sync"
  bound_iam_principal_arns = [var.secret-sync-arn]
  token_policies = [vault_policy.secret-sync.name]
}

resource "vault_aws_auth_backend_role" "team-sync" {
  role                     = "team-sync"
  bound_iam_principal_arns = [var.team-sync-arn]
  token_policies = [vault_policy.team-sync.name]
}
