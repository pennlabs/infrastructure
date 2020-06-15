variable "name" {
  description = "Name for the cluster"
  type        = string
}

// Kubernetes cluster inputs
variable "cluster_version" {
  description = "Kubernetes version of the cluster"
  type        = string
  default     = "1.17.5-do.0"
}

variable "node_count" {
  description = "Number of nodes in cluster"
  type        = number
}

variable "node_size" {
  description = "DigitalOcean size for Kubernetes nodes"
  type        = string
  default     = "s-2vcpu-4gb"
}

// Traefik values
variable "traefik_values" {
  description = "Values to provide to the Traefik helm chart"
  type        = list(string)
}

// Cert Manager values
variable "cert_manager_values" {
  description = "Values to provide to the Cert Manager helm chart"
  type        = list(string)
}

// Vault Secret Sync values
variable "vault_secret_sync_values" {
  description = "Values to provide to the Vault Secret Sync helm chart"
  type        = list(string)
}

// Prometheus values
variable "prometheus_values" {
  description = "Values to provide to the Prometheus helm chart"
  type        = list(string)
}

// Fluentd values
variable "fluentd_values" {
  description = "Values to provide to the Fluentd helm chart"
  type        = list(string)
}
