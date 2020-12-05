resource "vault_policy" "team-sync" {
  name = "team-sync"
  policy = templatefile("${path.module}/policies/team-sync.hcl", {
    PATH = vault_mount.secrets.path
    }
  )
}

resource "vault_approle_auth_backend_role" "team-sync" {
  role_name      = "team-sync"
  token_policies = [vault_policy.team-sync.name]
}

resource "vault_approle_auth_backend_role_secret_id" "team-sync" {
  role_name = vault_approle_auth_backend_role.team-sync.role_name
}

resource "vault_generic_secret" "team-sync" {
  path = "${vault_mount.secrets.path}/chronos/default/team-sync"

  data_json = jsonencode({
    "ROLE_ID" = vault_approle_auth_backend_role.team-sync.role_id
    "SECRET_ID" = vault_approle_auth_backend_role_secret_id.team-sync.secret_id
    "GITHUB_TOKEN" = var.GH_PERSONAL_TOKEN
  })
}
