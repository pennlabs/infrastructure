variable "path" {
  description = "Path to the existing secret in Vault"
  type        = string
}

variable "entry" {
  description = "Entries to replace within the secret"
  type        = map(any)
}
