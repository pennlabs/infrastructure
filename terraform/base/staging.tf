resource "kubernetes_namespace" "staging" {
  metadata {
    name = "staging"
  }
}
