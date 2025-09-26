output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = var.create_dns_records ? aws_acm_certificate.frontend[0].arn : null
}

output "certificate_validation_arn" {
  description = "ARN of the validated ACM certificate"
  value       = var.create_dns_records ? aws_acm_certificate_validation.frontend[0].certificate_arn : null
}

output "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  value       = var.create_dns_records ? aws_route53_zone.main[0].zone_id : null
}

output "domain_record_name" {
  description = "Name of the domain A record"
  value       = var.create_dns_records ? aws_route53_record.frontend[0].name : null
}