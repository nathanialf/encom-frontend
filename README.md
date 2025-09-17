# ENCOM Frontend

React TypeScript application for the ENCOM hexagonal map generator system.

## Features

- **Interactive Hexagonal Map Visualization** - Canvas-based rendering with zoom and pan
- **Real-time Map Generation** - Connect to AWS Lambda backend for dynamic map creation
- **Advanced Navigation** - Mouse wheel zoom, click-and-drag panning, reset controls
- **Touch Support** - Full mobile support with pinch-to-zoom and touch panning
- **Screenshot Capture** - Export generated maps as PNG images
- **Hover Interaction** - Display hexagon coordinates and properties
- **Fully Responsive Design** - Optimized layouts for mobile, tablet, and desktop
- **Intelligent Auto-Centering** - Bounding box algorithm ensures entire map is always visible with optimal zoom

## Architecture

- **React 18** with TypeScript
- **Canvas API** for hexagon rendering and interactions
- **Tabler Icons** for professional, consistent iconography
- **REST API** integration with AWS Lambda backend
- **S3 + CloudFront** deployment for global CDN

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
- **Prod**: `https://encom.riperoni.com` (when configured)

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

## Deployment

### CI/CD Pipeline

Jenkins pipeline automatically:

1. **Install** dependencies and run security audit
2. **Test** with Jest and coverage reporting
3. **Lint** TypeScript and ESLint validation
4. **Build** optimized production bundle
5. **Archive** versioned tarball to S3 artifacts bucket
6. **Deploy** static files to S3 hosting bucket
7. **Invalidate** CloudFront cache for immediate content updates

### Manual Deployment

```bash
# Build production bundle
REACT_APP_ENVIRONMENT=prod npm run build

# Deploy to S3 (requires AWS credentials)
aws s3 sync build/ s3://encom-frontend-prod-us-west-1/ --delete
```

### Infrastructure

Frontend hosting infrastructure is now enabled in Terraform:

- **S3 Hosting Bucket**: `encom-frontend-{env}-us-west-1`
- **S3 Artifacts Bucket**: `encom-build-artifacts-{env}-us-west-1` (managed by Terraform)
- **CloudFront Distribution**: Global CDN with caching and SPA routing
- **Custom Domain**: `dev.encom.riperoni.com` with automated SSL validation
- **Route53 DNS**: Automated certificate validation via CNAME records
- **Origin Access Control**: Secure S3 access via CloudFront only
- **Custom Error Pages**: 404/403 redirects to index.html for SPA routing

### CloudFront Cache Invalidation

The deployment pipeline automatically invalidates CloudFront cache after successful S3 deployment:

- **Automatic Detection**: Finds CloudFront distribution by S3 origin domain
- **Full Invalidation**: Clears all paths (`/*`) for immediate content updates
- **Error Resilient**: Deployment succeeds even if invalidation fails
- **Cache Clear Time**: 1-5 minutes for global propagation
- **Cost Efficient**: Uses free tier (1,000 invalidations/month)

```bash
# Manual invalidation (if needed)
aws cloudfront create-invalidation \
    --distribution-id DISTRIBUTION_ID \
    --paths "/*"
```

#### Jenkins Credential Setup

The pipeline requires CloudFront distribution IDs to be configured as Jenkins credentials:

1. **Get Distribution ID**: Find in AWS Console → CloudFront → Distributions
2. **Add Jenkins Credential**: Manage Jenkins → Manage Credentials → Add Secret Text
3. **Required Credentials**:
   - `cloudfront-dev-distribution-id` - Dev environment distribution ID
   - `cloudfront-prod-distribution-id` - Prod environment distribution ID

**IMPORTANT**: When setting up production environment, update the `cloudfront-prod-distribution-id` credential with the actual production CloudFront distribution ID.

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

## Build Analysis

```bash
# Analyze bundle size
npm run build
npx serve -s build

# Check bundle composition
du -sh build/
find build/ -name "*.js" -o -name "*.css" | head -10
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Bundle Size**: ~2MB (including React)
- **Load Time**: <3s on 3G connection
- **Canvas Performance**: 60fps with 1000+ hexagons
- **Memory Usage**: <50MB for large maps
- **Mobile Optimization**: Stable canvas sizing prevents scroll distortions
- **Touch Response**: <10ms tap detection with coordinate transformation

## Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Run `npm test` and `npm run build`
4. Submit pull request