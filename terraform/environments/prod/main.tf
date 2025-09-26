terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }

  backend "s3" {
    bucket = "prod-encom-frontend-terraform-state"
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

# Provider alias for us-east-1 (required for ACM certificates used with CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Route53 module (creates certificate and DNS records for prod)
module "route53" {
  source = "../../modules/route53"
  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  project_name              = var.project_name
  environment               = var.environment
  create_dns_records        = true
  hosted_zone_name          = var.hosted_zone_name
  domain_name               = var.domain_name
  cloudfront_domain_name    = module.cloudfront.distribution_domain_name
  cloudfront_hosted_zone_id = module.cloudfront.distribution_hosted_zone_id
}

# CloudFront module (with custom domain for prod)
module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name                    = var.project_name
  environment                     = var.environment
  s3_bucket_regional_domain_name  = module.s3.hosting_bucket_regional_domain_name
  domain_name                     = var.domain_name
  ssl_certificate_arn             = module.route53.certificate_validation_arn
}

# S3 module
module "s3" {
  source = "../../modules/s3"

  bucket_name                 = var.hosting_bucket_name
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
  environment                 = var.environment
  project_name                = var.project_name
}