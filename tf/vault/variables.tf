variable "cloudflare_api_key" {
  type        = string
  description = "Global API Key for Penn Labs Cloudflare account"
  default     = "fake-api-key"
}

variable "github_access_token" {
  type        = string
  description = "GitHub Personal Access token for the Penn Labs Admin account"
  default     = "fake-access-token"
}
