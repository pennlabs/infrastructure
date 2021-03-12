resource "vault_policy" "secret-sync" {
  name = "secret-sync"
  policy = templatefile("${path.module}/policies/secret-sync.hcl", {
    PATH = vault_mount.secrets.path
    }
  )
}
resource "vault_aws_auth_backend_role" "secret-sync" {
  role                     = "secret-sync"
  bound_iam_principal_arns = [var.SECRET_SYNC_ARN]
  token_policies           = [vault_policy.secret-sync.name]
}
