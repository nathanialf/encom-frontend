output "hosting_bucket_name" {
  description = "Name of the frontend hosting S3 bucket"
  value       = module.s3.hosting_bucket_id
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_distribution_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.distribution_domain_name
}

output "website_url" {
  description = "URL of the frontend website"
  value       = "https://${module.cloudfront.distribution_domain_name}"
}