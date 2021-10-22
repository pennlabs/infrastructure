resource "vault_policy" "team-sync" {
  name = "team-sync"
  policy = templatefile("${path.module}/policies/team-sync.hcl", {
    PATH = vault_mount.secrets.path
    }
  )
}

resource "vault_aws_auth_backend_role" "team-sync" {
  role                     = "team-sync"
  bound_iam_principal_arns = [var.TEAM_SYNC_ARN]
  token_policies           = [vault_policy.team-sync.name]
}

