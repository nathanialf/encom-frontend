terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }
}

# S3 bucket for hosting the frontend
resource "aws_s3_bucket" "frontend_hosting" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_versioning" "frontend_hosting" {
  bucket = aws_s3_bucket.frontend_hosting.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend_hosting" {
  bucket = aws_s3_bucket.frontend_hosting.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_hosting" {
  bucket = aws_s3_bucket.frontend_hosting.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket policy to allow CloudFront OAC access
resource "aws_s3_bucket_policy" "frontend_hosting" {
  bucket = aws_s3_bucket.frontend_hosting.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend_hosting.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = var.cloudfront_distribution_arn
          }
        }
      }
    ]
  })
}

