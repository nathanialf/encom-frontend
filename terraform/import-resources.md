# Frontend Resource Import Guide

This guide details how to import existing AWS resources into the new independent Terraform configuration for encom-frontend.

## Prerequisites

- Ensure AWS CLI is configured with appropriate profiles (`encom-dev` and `encom-prod`)
- Bootstrap terraform state buckets first using Jenkins or manual bootstrap process
- Have terraform initialized in each environment directory

## Dev Environment Resources

Dev environment should NOT have DNS resources (hosted zone, certificate, CloudFront custom domain). Only import:

### S3 Bucket
```bash
export AWS_PROFILE=encom-dev
export AWS_REGION=us-west-1
cd terraform/environments/dev

terraform import module.s3.aws_s3_bucket.frontend_hosting encom-frontend-dev-us-west-1
```

### CloudFront Distribution
```bash
# Find the CloudFront distribution ID for dev
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='encom-frontend dev distribution'].Id" --output text --profile encom-dev)
echo "Dev Distribution ID: $DISTRIBUTION_ID"

# Import the distribution
terraform import module.cloudfront.aws_cloudfront_distribution.frontend $DISTRIBUTION_ID

# Import the Origin Access Control
OAC_ID=$(aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='encom-frontend-dev-oac'].Id" --output text --profile encom-dev)
echo "Dev OAC ID: $OAC_ID"
terraform import module.cloudfront.aws_cloudfront_origin_access_control.frontend_oac $OAC_ID
```

## Prod Environment Resources

Prod environment includes full DNS setup:

### S3 Bucket
```bash
export AWS_PROFILE=encom-prod
export AWS_REGION=us-west-1
cd terraform/environments/prod

terraform import module.s3.aws_s3_bucket.frontend_hosting encom-frontend-prod-us-west-1
```

### CloudFront Distribution
```bash
# Find the CloudFront distribution ID for prod
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='encom-frontend prod distribution'].Id" --output text --profile encom-prod)
echo "Prod Distribution ID: $DISTRIBUTION_ID"

# Import the distribution
terraform import module.cloudfront.aws_cloudfront_distribution.frontend $DISTRIBUTION_ID

# Import the Origin Access Control
OAC_ID=$(aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='encom-frontend-prod-oac'].Id" --output text --profile encom-prod)
echo "Prod OAC ID: $OAC_ID"
terraform import module.cloudfront.aws_cloudfront_origin_access_control.frontend_oac $OAC_ID
```

### Route53 & SSL Certificate
```bash
# Find hosted zone ID
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='encom.riperoni.com.'].Id" --output text --profile encom-prod | cut -d'/' -f3)
echo "Hosted Zone ID: $HOSTED_ZONE_ID"

# Find certificate ARN (must be in us-east-1 for CloudFront)
CERT_ARN=$(aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?DomainName=='encom.riperoni.com'].CertificateArn" --output text --profile encom-prod)
echo "Certificate ARN: $CERT_ARN"

# Import certificate (use us-east-1 provider)
terraform import "module.route53.aws_acm_certificate.frontend[0]" $CERT_ARN

# Import certificate validation
terraform import "module.route53.aws_acm_certificate_validation.frontend[0]" $CERT_ARN

# Import A record
terraform import "module.route53.aws_route53_record.frontend[0]" "${HOSTED_ZONE_ID}_encom.riperoni.com_A"

# Import certificate validation records (these may vary - check existing records)
# List current records to identify validation CNAMEs
aws route53 list-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --query "ResourceRecordSets[?Type=='CNAME']" --profile encom-prod

# Import each validation record (replace with actual record names)
# terraform import "module.route53.aws_route53_record.cert_validation[0][\"encom.riperoni.com\"]" "${HOSTED_ZONE_ID}_VALIDATION_RECORD_NAME_CNAME"
```

## Verification Steps

After importing all resources:

### Dev Environment
```bash
cd terraform/environments/dev
export AWS_PROFILE=encom-dev
terraform plan -no-color | grep "Plan:"
```

### Prod Environment  
```bash
cd terraform/environments/prod
export AWS_PROFILE=encom-prod
terraform plan -no-color | grep "Plan:"
```

Both should show "Plan: 0 to add, 0 to change, 0 to destroy" if all resources are properly imported.

## Build Artifacts Bucket Cleanup

The old build artifacts buckets are no longer needed and should be cleaned up after migration:

- `encom-build-artifacts-dev-us-west-1`
- `encom-build-artifacts-prod-us-west-1`

These will be addressed in the encom-infrastructure cleanup phase.

## Notes

- Dev environment will NOT have custom domain, SSL certificate, or Route53 records
- Prod environment includes full DNS setup with custom domain
- S3 bucket policies will be updated during first apply to use new CloudFront OAC
- Certificate validation records may need manual import based on existing DNS setup