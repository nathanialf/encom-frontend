terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }

  backend "s3" {
    bucket = "dev-encom-frontend-terraform-state"
    key    = "terraform.tfstate"
    region = "us-west-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}


# CloudFront module (no custom domain for dev)
module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name                    = var.project_name
  environment                     = var.environment
  s3_bucket_regional_domain_name  = module.s3.hosting_bucket_regional_domain_name
  domain_name                     = null  # No custom domain for dev
  ssl_certificate_arn             = null  # No SSL cert for dev
}

# S3 module
module "s3" {
  source = "../../modules/s3"

  bucket_name                 = var.hosting_bucket_name
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
  environment                 = var.environment
  project_name                = var.project_name
}

