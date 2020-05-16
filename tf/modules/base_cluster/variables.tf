variable "name" {
  description = "Name for cluster"
  type        = string
}

// Kubernetes cluster inputs
variable "k8s_cluster_version" {
  description = "Kubernetes version of the cluster"
  type        = string
  default     = "1.17.5-do.0"
}

variable "k8s_node_count" {
  description = "Number of nodes in cluster"
  type        = number
}

variable "k8s_node_size" {
  description = "DigitalOcean size for nodes"
  type        = string
  default     = "s-2vcpu-4gb"
}

// Traefik values
variable "traefik_values" {
  description = "Values to provide to Traefik"
  type        = list(string)
}

// Cert Manager values
variable "cert_manager_values" {
  description = "Values to provide to Cert Manager"
  type        = list(string)
}

// Vault Secret Sync values
variable "vault_secret_sync_values" {
  description = "Values to provide to Vault Secret Sync"
  type        = list(string)
}
