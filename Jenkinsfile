pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'prod'],
            description: 'Target environment for infrastructure deployment'
        )
        choice(
            name: 'ACTION',
            choices: ['bootstrap', 'plan', 'apply'],
            description: 'Action to perform (bootstrap=create state bucket, plan=terraform plan, apply=terraform apply)'
        )
    }
    
    environment {
        AWS_REGION = 'us-west-1'
        PROJECT_NAME = 'encom-frontend'
    }
    
    tools {
        terraform 'Terraform-1.5'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Bootstrap') {
            when {
                expression { params.ACTION == 'bootstrap' }
            }
            steps {
                script {
                    def awsCredentials = params.ENVIRONMENT == 'prod' ? 'aws-encom-prod' : 'aws-encom-dev'
                    
                    withAWS(credentials: awsCredentials, region: env.AWS_REGION) {
                        dir("terraform/bootstrap") {
                            sh """
                                echo "Bootstrapping Terraform state backend for ${params.ENVIRONMENT}..."
                                terraform init
                                terraform plan -var="environment=${params.ENVIRONMENT}" -var="aws_region=${env.AWS_REGION}" -out=bootstrap-plan
                                terraform apply bootstrap-plan
                                echo "Bootstrap completed for ${params.ENVIRONMENT} environment"
                            """
                        }
                    }
                }
            }
        }
        
        stage('Terraform Plan') {
            when {
                expression { params.ACTION == 'plan' }
            }
            steps {
                script {
                    def awsCredentials = params.ENVIRONMENT == 'prod' ? 'aws-encom-prod' : 'aws-encom-dev'
                    
                    withAWS(credentials: awsCredentials, region: env.AWS_REGION) {
                        dir("terraform/environments/${params.ENVIRONMENT}") {
                            sh '''
                                echo "Initializing Terraform..."
                                terraform init
                                echo "Planning Terraform changes..."
                                terraform plan -var-file=terraform.tfvars -out=tfplan
                                echo "Plan completed for ${ENVIRONMENT} environment"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Terraform Apply') {
            when {
                expression { params.ACTION == 'apply' }
            }
            steps {
                script {
                    def awsCredentials = params.ENVIRONMENT == 'prod' ? 'aws-encom-prod' : 'aws-encom-dev'
                    
                    withAWS(credentials: awsCredentials, region: env.AWS_REGION) {
                        dir("terraform/environments/${params.ENVIRONMENT}") {
                            sh '''
                                echo "Initializing Terraform..."
                                terraform init
                                echo "Applying Terraform changes..."
                                terraform apply -auto-approve -var-file=terraform.tfvars
                                echo "Apply completed for ${ENVIRONMENT} environment"
                                echo "Outputs:"
                                terraform output -no-color
                            '''
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            script {
                if (params.ACTION == 'apply') {
                    echo "Infrastructure deployment successful for ${params.ENVIRONMENT}"
                    echo "Frontend infrastructure is ready for deployment"
                }
            }
        }
    }
}