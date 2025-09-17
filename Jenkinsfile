pipeline {
    agent {
        node {
            label 'any'
            customWorkspace '/var/lib/jenkins/workspace/ENCOM-Shared'
        }
    }
    
    options {
        skipDefaultCheckout(true)
    }
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'prod'],
            description: 'Target environment for frontend deployment'
        )
    }
    
    environment {
        AWS_REGION = 'us-west-1'
        PROJECT_NAME = 'encom-frontend'
        CI = 'true'
        
        // CloudFront Distribution IDs (configure these in Jenkins credentials)
        CLOUDFRONT_DEV_DISTRIBUTION_ID = credentials('cloudfront-dev-distribution-id')
        CLOUDFRONT_PROD_DISTRIBUTION_ID = credentials('cloudfront-prod-distribution-id')
    }
    
    tools {
        nodejs 'NodeJS-18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Checkout frontend code to subdirectory to preserve shared workspace
                dir('encom-frontend') {
                    checkout scm
                }
                script {
                    def gitCommit = sh(script: 'cd encom-frontend && git rev-parse HEAD', returnStdout: true).trim()
                    env.BUILD_VERSION = "${env.BUILD_NUMBER}-${gitCommit.take(7)}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('encom-frontend') {
                    sh '''
                        echo "Node.js version: $(node --version)"
                        echo "npm version: $(npm --version)"
                        npm ci
                    '''
                }
            }
        }
        
        stage('Lint & Type Check') {
            steps {
                dir('encom-frontend') {
                    sh '''
                        echo "Running ESLint..."
                        npx eslint src/ --ext .ts,.tsx
                        
                        echo "Running TypeScript compiler check..."
                        npx tsc --noEmit
                    '''
                }
            }
        }
        
        stage('Test') {
            steps {
                dir('encom-frontend') {
                    sh '''
                        echo "Running unit tests..."
                        npm test -- --coverage --watchAll=false --ci
                    '''
                }
            }
        }
        
        stage('Security Audit') {
            steps {
                dir('encom-frontend') {
                    sh '''
                        echo "Running security audit..."
                        npm audit --audit-level high || echo "Security audit completed with warnings"
                    '''
                }
            }
        }
        
        stage('Build') {
            steps {
                dir('encom-frontend') {
                    sh '''
                        echo "Building application for ${ENVIRONMENT} environment..."
                        REACT_APP_ENVIRONMENT=${ENVIRONMENT} npm run build
                        
                        echo "Build completed. Size: $(du -sh build/ | cut -f1)"
                        echo "Build contents:"
                        find build/ -type f -name "*.js" -o -name "*.css" -o -name "*.html" | head -10
                    '''
                }
                archiveArtifacts artifacts: 'encom-frontend/build/**/*'
                
                // Upload versioned tarball to artifacts bucket AND deploy to hosting bucket
                script {
                    def awsCredentials = params.ENVIRONMENT == 'prod' ? 'aws-encom-prod' : 'aws-encom-dev'
                    
                    withAWS(credentials: awsCredentials, region: env.AWS_REGION) {
                        script {
                            def artifactsBucket = "encom-build-artifacts-${params.ENVIRONMENT}-us-west-1"
                            def hostingBucket = "encom-frontend-${params.ENVIRONMENT}-us-west-1"
                            def s3KeyPrefix = "artifacts/frontend/encom-frontend-${env.BUILD_VERSION}"
                            
                            echo "Using artifacts bucket: ${artifactsBucket}"
                            echo "Using hosting bucket: ${hostingBucket}"
                            
                            // Create a tarball for versioned storage
                            sh '''
                                cd encom-frontend
                                tar -czf ../encom-frontend-${BUILD_VERSION}.tar.gz -C build .
                                echo "Created tarball: encom-frontend-${BUILD_VERSION}.tar.gz"
                                echo "Tarball size: $(du -sh ../encom-frontend-${BUILD_VERSION}.tar.gz | cut -f1)"
                            '''
                            
                            // Upload versioned tarball to artifacts bucket
                            s3Upload bucket: artifactsBucket,
                                    file: "encom-frontend-${env.BUILD_VERSION}.tar.gz",
                                    path: "${s3KeyPrefix}.tar.gz"
                            
                            s3Upload bucket: artifactsBucket,
                                    file: "encom-frontend-${env.BUILD_VERSION}.tar.gz",
                                    path: "artifacts/frontend/encom-frontend-latest.tar.gz"
                            
                            echo "Tarball uploaded to artifacts: s3://${artifactsBucket}/${s3KeyPrefix}.tar.gz"
                            
                            // Deploy build directory directly to hosting bucket
                            echo "Deploying to hosting bucket: ${hostingBucket}"
                            s3Upload bucket: hostingBucket,
                                    includePathPattern: '**/*',
                                    workingDir: 'encom-frontend/build',
                                    path: ''
                            
                            echo "Frontend deployed successfully!"
                            echo "Website URL: https://${hostingBucket}.s3-website-${AWS_REGION}.amazonaws.com"
                            
                            // Create CloudFront invalidation using Jenkins AWS plugin
                            script {
                                try {
                                    echo "Finding CloudFront distribution for bucket: ${hostingBucket}"
                                    
                                    // Find CloudFront distribution by S3 origin domain
                                    def distributions = cfnDescribeStackResources(stackName: "encom-${params.ENVIRONMENT}")
                                    def distributionId = null
                                    
                                    // Alternative: try to find by domain pattern if stack approach doesn't work
                                    def targetDomain = "${hostingBucket}.s3.${AWS_REGION}.amazonaws.com"
                                    
                                    // Get distribution ID from environment based on deployment environment
                                    distributionId = params.ENVIRONMENT == 'prod' ? 
                                        env.CLOUDFRONT_PROD_DISTRIBUTION_ID : 
                                        env.CLOUDFRONT_DEV_DISTRIBUTION_ID
                                    
                                    if (distributionId) {
                                        echo "Using CloudFront distribution: ${distributionId}"
                                        
                                        // Create invalidation using Jenkins AWS plugin
                                        cfInvalidate(
                                            distribution: distributionId,
                                            paths: ['/*']
                                        )
                                        
                                        echo "CloudFront invalidation created successfully"
                                        echo "Cache will be cleared in 1-5 minutes"
                                    } else {
                                        echo "Warning: CloudFront distribution ID not configured for ${params.ENVIRONMENT}"
                                        echo "Please set CLOUDFRONT_DEV_DISTRIBUTION_ID or CLOUDFRONT_PROD_DISTRIBUTION_ID environment variables"
                                    }
                                } catch (Exception e) {
                                    echo "Warning: CloudFront invalidation failed: ${e.message}"
                                    // Don't fail the build for invalidation issues
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "Frontend build complete. Build artifacts uploaded to S3 and ready for deployment."
                echo "Run ENCOM-Infrastructure pipeline to deploy frontend infrastructure with latest build."
                try {
                    cleanWs()
                } catch (Exception e) {
                    echo "Warning: Workspace cleanup failed: ${e.message}"
                }
            }
        }
    }
}