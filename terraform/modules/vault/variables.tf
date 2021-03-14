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

variable "GF_SLACK_URL" {
  type        = string
  description = "Slack notification URL used for Grafana notifications"
}

variable "SECRET_SYNC_ARN" {
  type        = string
  description = "Role ARN for secret-sync"
}

variable "TEAM_SYNC_ARN" {
  type        = string
  description = "Role ARN for team-sync"
}
