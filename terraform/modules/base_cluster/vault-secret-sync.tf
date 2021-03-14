resource "helm_release" "vault-secret-sync" {
  name       = "vault-secret-sync"
  repository = "https://helm.pennlabs.org"
  chart      = "vault-secret-sync"
  version    = "0.1.4"
  values     = var.vault_secret_sync_values
  depends_on = [
    kubernetes_namespace.monitoring,
    kubernetes_namespace.cert-manager,
  ]
}
