resource "vault_policy" "team-sync" {
  name = "team-sync"
  policy = templatefile("${path.module}/policies/team-sync.hcl", {
    PATH = vault_mount.secrets.path
    }
  )
}

resource "vault_aws_auth_backend_role" "team-sync" {
  role                     = "team-sync"
  bound_iam_principal_arns = [var.team-sync-arn]
  token_policies = [vault_policy.team-sync.name]
}

resource "vault_generic_secret" "team-sync" {
  path = "${vault_mount.secrets.path}/production/default/team-sync"

  data_json = jsonencode({
    "GITHUB_TOKEN" = var.GH_PERSONAL_TOKEN
  })
}
