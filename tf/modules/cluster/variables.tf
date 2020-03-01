variable "name" {
  description = "Name for cluster"
  type        = string
}

variable "node_count" {
  description = "Number of nodes in cluster"
  type        = number
}

variable "node_size" {
  description = "DigitalOcean size for nodes"
  type        = string
  default = "s-2vcpu-4gb"
}
