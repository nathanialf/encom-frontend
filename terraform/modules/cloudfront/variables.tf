variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "encom-frontend"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for CloudFront (optional)"
  type        = string
  default     = null
}

variable "ssl_certificate_arn" {
  description = "ARN of the SSL certificate for custom domain (required if domain_name is provided)"
  type        = string
  default     = null
}