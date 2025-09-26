# ENCOM Frontend

React TypeScript application for the ENCOM hexagonal map generator system with independent Terraform infrastructure management.

## Infrastructure Architecture

### AWS Architecture Overview
```
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│             DEV                 │  │            PROD                 │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│                                 │  │                                 │
│  ┌─────────────────────┐       │  │  ┌─────────────────────┐       │
│  │   CloudFront        │       │  │  │   CloudFront        │       │
│  │ d2x37w9ikau35g...   │       │  │  │ d1ttgjhhkt33s5...   │       │
│  │ Default Domain      │       │  │  │ encom.riperoni.com  │       │
│  │ No SSL Cert         │       │  │  │ ACM Certificate     │       │
│  └─────────────────────┘       │  │  └─────────────────────┘       │
│            │                   │  │            │                   │
│  ┌─────────────────────┐       │  │  ┌─────────────────────┐       │
│  │   Origin Access     │       │  │  │   Origin Access     │       │
│  │   Control (OAC)     │       │  │  │   Control (OAC)     │       │
│  └─────────────────────┘       │  │  └─────────────────────┘       │
│            │                   │  │            │                   │
│  ┌─────────────────────┐       │  │  ┌─────────────────────┐       │
│  │   S3 Bucket         │       │  │  │   S3 Bucket         │       │
│  │encom-frontend-dev-  │       │  │encom-frontend-prod-   │       │
│  │us-west-1            │       │  │us-west-1             │       │
│  │Versioning: Enabled  │       │  │Versioning: Enabled   │       │
│  │Encryption: AES256   │       │  │Encryption: AES256    │       │
│  │Public Access: Block │       │  │Public Access: Block  │       │
│  └─────────────────────┘       │  │  └─────────────────────┘       │
│                                 │  │            │                   │
└─────────────────────────────────┘  │  ┌─────────────────────┐       │
                                     │  │   Route53           │       │
                                     │  │ encom.riperoni.com  │       │
                                     │  │ A Record → CF       │       │
                                     │  │ CNAME → Cert Valid  │       │
                                     │  └─────────────────────┘       │
                                     │            │                   │
                                     │  ┌─────────────────────┐       │
                                     │  │   ACM Certificate   │       │
                                     │  │ us-east-1 Region    │       │
                                     │  │ DNS Validation      │       │
                                     │  └─────────────────────┘       │
                                     └─────────────────────────────────┘

         ┌─────────────────────┐              ┌─────────────────────┐
         │   Terraform State   │              │   Terraform State   │
         │dev-encom-frontend-  │              │prod-encom-frontend- │
         │terraform-state      │              │terraform-state      │
         │    (S3 Bucket)      │              │    (S3 Bucket)      │
         └─────────────────────┘              └─────────────────────┘
```

### Application Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Users       │───▶│   CloudFront     │───▶│   S3 Hosting    │
│ (Web Browsers)  │    │   (Global CDN)   │    │   (Static Web)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   API Gateway    │    │ React TypeScript│
                       │ (ENCOM Lambda)   │    │   Application   │
                       └──────────────────┘    └─────────────────┘
```

## Features

- **Interactive Hexagonal Map Visualization** - Canvas-based rendering with zoom and pan
- **Real-time Map Generation** - Connect to AWS Lambda backend for dynamic map creation
- **Advanced Navigation** - Mouse wheel zoom, click-and-drag panning, reset controls
- **Touch Support** - Full mobile support with pinch-to-zoom and touch panning
- **Screenshot Capture** - Export generated maps as PNG images
- **Hover Interaction** - Display hexagon coordinates and properties
- **Fully Responsive Design** - Optimized layouts for mobile, tablet, and desktop
- **Intelligent Auto-Centering** - Bounding box algorithm ensures entire map is always visible with optimal zoom

## Technology Stack

- **React 18** with TypeScript
- **Canvas API** for hexagon rendering and interactions
- **Tabler Icons** for professional, consistent iconography
- **REST API** integration with AWS Lambda backend
- **S3 + CloudFront** deployment for global CDN
- **Independent Terraform Infrastructure** with modular configuration

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables

Create `.env` file:

```env
REACT_APP_ENVIRONMENT=dev
```

### API Configuration

The app connects to different API endpoints based on environment:

- **Dev**: `https://kxt2knsej3.execute-api.us-west-1.amazonaws.com/dev`
- **Prod**: `https://3901ff1oz1.execute-api.us-west-1.amazonaws.com/prod`

## Canvas Controls

### Desktop Controls
- **Mouse Wheel**: Zoom in/out (0.1x to 3.0x)
- **Click + Drag**: Pan around large maps
- **Hover**: Display hexagon coordinates and properties
- **+ / - Icon Buttons**: Manual zoom controls with professional Tabler icons
- **Reset Icon Button**: Return to optimal bounding box view with entire map visible
- **Camera Icon Button**: Download screenshot as PNG

### Mobile & Touch Controls
- **Pinch to Zoom**: Multi-touch zoom in/out
- **Touch Drag**: Single finger pan across map
- **Tap**: Touch hexagons to display coordinates (persists until tapping elsewhere)
- **+ / - Icon Buttons**: Manual zoom controls (optimized for touch with 44px minimum size)
- **Reset Icon Button**: Return to optimal view
- **Camera Icon Button**: Download screenshot

## Infrastructure Management

### Terraform Structure
```
terraform/
├── bootstrap/              # State bucket creation
├── modules/
│   ├── s3/                 # S3 hosting bucket module
│   ├── cloudfront/         # CloudFront CDN module
│   └── route53/            # DNS and SSL certificate module
└── environments/
    ├── dev/                # Development environment
    └── prod/               # Production environment
```

### Deployment Pipeline
The project uses Jenkins for CI/CD with three main actions:

1. **Bootstrap**: Create S3 state bucket for terraform
2. **Plan**: Run terraform plan to preview changes
3. **Apply**: Apply terraform changes to deploy infrastructure

### Environment Configuration

#### Development
- **State Bucket**: `dev-encom-frontend-terraform-state`
- **Hosting Bucket**: `encom-frontend-dev-us-west-1`
- **CloudFront**: Default domain only (no custom DNS)
- **Authentication**: None
- **Website URL**: `https://d2x37w9ikau35g.cloudfront.net`

#### Production
- **State Bucket**: `prod-encom-frontend-terraform-state`
- **Hosting Bucket**: `encom-frontend-prod-us-west-1`
- **CloudFront**: Custom domain with SSL certificate
- **Custom Domain**: `encom.riperoni.com`
- **SSL Certificate**: ACM certificate in us-east-1
- **Route53**: Managed DNS with automatic certificate validation
- **Website URL**: `https://encom.riperoni.com`

### Infrastructure Deployment

```bash
# Bootstrap state bucket (first time only)
cd terraform/environments/dev
terraform init
terraform apply -var="environment=dev"

# Deploy infrastructure changes
terraform plan    # Review changes
terraform apply   # Deploy changes
```

### Manual Deployment

```bash
# Build production bundle
REACT_APP_ENVIRONMENT=prod npm run build

# Deploy to S3 (requires AWS credentials)
aws s3 sync build/ s3://encom-frontend-prod-us-west-1/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id E6Z3HPJJYYP2V \
    --paths "/*"
```

## Map Generation

### Request Format

```json
{
  "hexagonCount": 100,
  "seed": "optional-seed-string"
}
```

### Response Format

```json
{
  "hexagons": [
    {
      "id": "hex-1",
      "q": 0,
      "r": 0,
      "type": "ROOM",
      "connections": ["hex-2", "hex-3"]
    }
  ],
  "metadata": {
    "totalHexagons": 100,
    "rooms": 30,
    "corridors": 70,
    "seed": "generated-seed"
  }
}
```

## Testing

Comprehensive test suite with full coverage of all components and functionality.

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode (for Jenkins)
npm test -- --watchAll=false --ci
```

### Test Coverage

- **117 tests** across 8 test suites
- **Component tests**: App, MapControls, MapStatistics, HexagonCanvas
- **Library tests**: API integration, hexagon mathematics
- **Hook tests**: Map generation, responsive window dimensions
- **Features tested**: UI interactions, form validation, error handling, coordinate transformations, responsive design, touch controls

## Security

- **S3 Bucket Security**: All public access blocked, CloudFront-only access via OAC
- **CloudFront Security**: HTTPS redirect enforced, secure origin access
- **SSL Certificates**: Managed by ACM with DNS validation
- **IAM Roles**: Minimal permissions following principle of least privilege
- **Terraform State**: Encrypted S3 buckets with versioning enabled

## Monitoring & Logging

### CloudFront Metrics
- Request count and error rates
- Cache hit ratios and performance
- Geographic distribution of requests

### S3 Metrics
- Storage usage and object counts
- Request metrics and error rates

## Performance

- **Bundle Size**: ~2MB (including React)
- **Load Time**: <3s on 3G connection
- **Canvas Performance**: 60fps with 1000+ hexagons
- **Memory Usage**: <50MB for large maps
- **CDN Performance**: Global edge locations for optimal delivery
- **Cache Strategy**: Static assets cached for 1 year, HTML cached for 1 hour

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Run `npm test` and `npm run build`
4. Submit pull request

---

**Part of the ENCOM Project**: This frontend application provides visualization for hexagonal maps generated by the ENCOM Lambda service, with independent infrastructure management for scalable deployment.