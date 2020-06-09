variable "CF_API_KEY" {
  type        = string
  description = "Global API Key for Penn Labs Cloudflare account"
}

variable "GH_PERSONAL_TOKEN" {
  type        = string
  description = "GitHub Personal Access token for the Penn Labs Admin account"
}

variable "GF_GH_CLIENT_ID" {
  type        = string
  description = "GitHub Client ID for the Penn Labs Grafana OAuth2 Application"
}

variable "GF_GH_CLIENT_SECRET" {
  type        = string
  description = "GitHub Client Secret for the Penn Labs Grafana OAuth2 Application"
}

variable "ELASTIC_PASSWORD" {
  type        = string
  description = "Managed Elasticsearch password"
}

variable "ELASTIC_HOST" {
  type        = string
  description = "Managed Elasticsearch host"
}
