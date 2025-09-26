output "hosting_bucket_id" {
  description = "ID of the frontend hosting S3 bucket"
  value       = aws_s3_bucket.frontend_hosting.id
}

output "hosting_bucket_arn" {
  description = "ARN of the frontend hosting S3 bucket"
  value       = aws_s3_bucket.frontend_hosting.arn
}

output "hosting_bucket_domain_name" {
  description = "Domain name of the frontend hosting S3 bucket"
  value       = aws_s3_bucket.frontend_hosting.bucket_domain_name
}

output "hosting_bucket_regional_domain_name" {
  description = "Regional domain name of the frontend hosting S3 bucket"
  value       = aws_s3_bucket.frontend_hosting.bucket_regional_domain_name
}

