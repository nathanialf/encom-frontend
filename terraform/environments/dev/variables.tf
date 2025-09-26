variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "encom-frontend"
}

variable "hosting_bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  type        = string
  default     = "encom-frontend-dev-us-west-1"
}

