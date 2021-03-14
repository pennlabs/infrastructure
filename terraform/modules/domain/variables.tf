variable "domain" {
  description = "Domain name"
  type        = string
}

variable "traefik_lb_name" {
  description = "DNS name of the traefik load balancer"
  type        = string
}

variable "traefik_zone_id" {
  description = "Zone ID of the traefik load balancer"
  type        = string
}
