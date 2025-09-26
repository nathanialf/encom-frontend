variable "bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  type        = string
}


variable "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution for bucket policy"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "encom-frontend"
}