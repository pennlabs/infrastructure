resource "vault_mount" "secrets" {
  path        = "secrets"
  type        = "kv-v2"
  description = "Secrets backend"
}

resource "vault_auth_backend" "aws" {
  type = "aws"
}

// TODO: remove after migration
resource "vault_auth_backend" "approle" {
  type = "approle"
}

resource "vault_github_auth_backend" "pennlabs" {
  organization = "pennlabs"
}

resource "vault_github_team" "sre" {
  backend  = vault_github_auth_backend.pennlabs.id
  team     = "sre"
  policies = [vault_policy.admin.name]
}

resource "vault_policy" "admin" {
  name = "admin"
  policy = templatefile("${path.module}/policies/admin.hcl", {
    PATH = vault_mount.secrets.path
    }
  )
}
