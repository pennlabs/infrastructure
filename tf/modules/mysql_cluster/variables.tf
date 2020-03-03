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
  default     = "db-s-1vcpu-1gb"
}

variable "cluster_version" {
  description = "MySQL version of the cluster"
  type        = number
  default     = 8
}

variable "users" {
  description = "List of names to generate DBs and users from"
  type        = set(string)
}

variable "pgp_key" {
  description = "PGP key to encrypt passwords with"
  type        = string
}
