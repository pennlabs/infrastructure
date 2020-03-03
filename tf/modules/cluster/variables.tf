variable "name" {
  description = "Name for cluster"
  type        = string
}

// Kubernetes cluster inputs
variable "k8s_cluster_version" {
  description = "Kubernetes version of the cluster"
  type        = string
  default     = "1.16.6-do.0"
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

// MySQL database inputs
variable "mysql_cluster_version" {
  description = "MySQL version of the cluster"
  type        = number
  default     = 8
}

variable "mysql_node_count" {
  description = "Number of nodes in MySQL cluster"
  type        = number
}

variable "mysql_node_size" {
  description = "DigitalOcean size for MySQL nodes"
  type        = string
  default     = "db-s-1vcpu-1gb"
}

variable "mysql_users" {
  description = "List of names to generate DBs and users from"
  type        = set(string)
}

variable "pgp_key" {
  description = "PGP key to encrypt passwords with"
  type        = string
}
