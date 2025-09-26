output "terraform_state_bucket" {
  description = "Name of the terraform state S3 bucket"
  value       = aws_s3_bucket.terraform_state.bucket
}

output "terraform_state_bucket_arn" {
  description = "ARN of the terraform state S3 bucket"
  value       = aws_s3_bucket.terraform_state.arn
}