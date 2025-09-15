# ENCOM Frontend

React TypeScript application for the ENCOM hexagonal map generator system.

## Features

- **Interactive Hexagonal Map Visualization** - Canvas-based rendering with zoom and pan
- **Real-time Map Generation** - Connect to AWS Lambda backend for dynamic map creation
- **Advanced Navigation** - Mouse wheel zoom, click-and-drag panning, reset controls
- **Screenshot Capture** - Export generated maps as PNG images
- **Hover Interaction** - Display hexagon coordinates and properties
- **Responsive Design** - Optimized for various screen sizes

## Architecture

- **React 18** with TypeScript
- **Canvas API** for hexagon rendering and interactions
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

- **Mouse Wheel**: Zoom in/out (0.1x to 3.0x)
- **Click + Drag**: Pan around large maps
- **+ / - Buttons**: Manual zoom controls
- **Reset Button**: Return to default view (1x zoom, centered)
- **📷 Save Button**: Download screenshot as PNG
- **Hover**: Display hexagon coordinates

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

### Manual Deployment

```bash
# Build production bundle
REACT_APP_ENVIRONMENT=prod npm run build

# Deploy to S3 (requires AWS credentials)
aws s3 sync build/ s3://encom-frontend-prod-us-west-1/ --delete
```

### Infrastructure

- **S3 Hosting Bucket**: `encom-frontend-{env}-us-west-1`
- **S3 Artifacts Bucket**: `encom-build-artifacts-{env}-us-west-1`
- **CloudFront**: Global CDN distribution
- **Route53**: Custom domain (when configured)

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

- **87 tests** across 6 test suites
- **Component tests**: App, MapControls, MapStatistics
- **Library tests**: API integration, hexagon mathematics
- **Hook tests**: Map generation state management
- **Features tested**: UI interactions, form validation, error handling, coordinate transformations

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

## Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Run `npm test` and `npm run build`
4. Submit pull request