data "vault_generic_secret" "secret-sync" {
  path = "secrets/secret-sync"
}

resource "kubernetes_secret" "secret-sync-chronos" {
  for_each = toset(["cert-manager", "default", "monitoring"])
  metadata {
    name      = "secret-sync"
    namespace = each.key
  }

  data = data.vault_generic_secret.secret-sync.data

  provider = kubernetes.chronos
}

resource "kubernetes_secret" "secret-sync-sandbox" {
  for_each = toset(["cert-manager", "default", "monitoring"])
  metadata {
    name      = "secret-sync"
    namespace = each.key
  }

  data = data.vault_generic_secret.secret-sync.data

  provider = kubernetes.sandbox
}

resource "kubernetes_secret" "secret-sync-production" {
  for_each = toset(["cert-manager", "default", "staging", "monitoring"])
  metadata {
    name      = "secret-sync"
    namespace = each.key
  }

  data = data.vault_generic_secret.secret-sync.data
}
