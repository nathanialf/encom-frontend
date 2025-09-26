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

output "certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = module.route53.certificate_validation_arn
}

output "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  value       = module.route53.hosted_zone_id
}

output "website_url" {
  description = "URL of the frontend website"
  value       = "https://${var.domain_name}"
}