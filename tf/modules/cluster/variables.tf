variable "name" {
  description = "Name for cluster"
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version of the cluster"
  type        = string
  default     = "1.16.6-do.0"
}

variable "node_count" {
  description = "Number of nodes in cluster"
  type        = number
}

variable "node_size" {
  description = "DigitalOcean size for nodes"
  type        = string
  default     = "s-2vcpu-4gb"
}
