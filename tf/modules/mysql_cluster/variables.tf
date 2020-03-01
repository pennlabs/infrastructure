variable "name" {
  description = "Name for database cluster"
  type        = string
}

variable "node_count" {
  description = "Number of nodes in cluster"
  type        = number
}

variable "node_size" {
  description = "DigitalOcean size for database nodes"
  type        = string
  default = "db-s-1vcpu-1gb"
}
