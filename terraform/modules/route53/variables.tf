variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "encom-frontend"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "create_dns_records" {
  description = "Whether to create DNS records and SSL certificate"
  type        = bool
  default     = false
}

variable "hosted_zone_name" {
  description = "Name of the Route53 hosted zone (only used if create_dns_records is true)"
  type        = string
  default     = null
}

variable "domain_name" {
  description = "Domain name for the frontend (only used if create_dns_records is true)"
  type        = string
  default     = null
}

variable "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution (only used if create_dns_records is true)"
  type        = string
  default     = null
}

variable "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution (only used if create_dns_records is true)"
  type        = string
  default     = null
}