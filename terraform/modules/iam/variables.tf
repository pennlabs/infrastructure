variable "role" {
  description = "Name of K8s SA (and generated IAM role)"
  type        = string
}

variable "namespace" {
  description = "Namespace of the k8s SA"
  type        = string
  default     = "default"
}

variable "oidc_issuer_url" {
  description = "URL of the K8s oidc issuer"
  type        = string
}

variable "oidc_provider_arn" {
  description = "ARN of the K8s oidc issuer"
  type        = string
}
