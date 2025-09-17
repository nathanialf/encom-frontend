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
                            
                            // Create CloudFront invalidation using AWS CLI
                            script {
                                try {
                                    echo "Finding CloudFront distribution for bucket: ${hostingBucket}"
                                    
                                    // Find CloudFront distribution ID by S3 origin domain
                                    def distributionId = sh(
                                        script: """
                                            aws cloudfront list-distributions \
                                                --query "DistributionList.Items[?Origins.Items[0].DomainName=='${hostingBucket}.s3.${AWS_REGION}.amazonaws.com'].Id" \
                                                --output text
                                        """,
                                        returnStdout: true
                                    ).trim()
                                    
                                    if (distributionId && distributionId != '' && distributionId != 'None') {
                                        echo "Found CloudFront distribution: ${distributionId}"
                                        
                                        // Create invalidation for all paths
                                        def invalidationId = sh(
                                            script: """
                                                aws cloudfront create-invalidation \
                                                    --distribution-id ${distributionId} \
                                                    --paths "/*" \
                                                    --query 'Invalidation.Id' \
                                                    --output text
                                            """,
                                            returnStdout: true
                                        ).trim()
                                        
                                        echo "CloudFront invalidation created: ${invalidationId}"
                                        echo "Cache will be cleared in 1-5 minutes"
                                    } else {
                                        echo "Warning: Could not find CloudFront distribution for bucket ${hostingBucket}"
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
            echo "Frontend build complete. Build artifacts uploaded to S3 and ready for deployment."
            echo "Run ENCOM-Infrastructure pipeline to deploy frontend infrastructure with latest build."
            cleanWs()
        }
    }
}