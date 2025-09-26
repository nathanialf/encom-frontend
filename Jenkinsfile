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
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup AWS Credentials') {
            steps {
                script {
                    env.AWS_PROFILE = params.ENVIRONMENT == 'prod' ? 'encom-prod' : 'encom-dev'
                    echo "Using AWS profile: ${env.AWS_PROFILE}"
                }
            }
        }
        
        stage('Bootstrap') {
            when {
                expression { params.ACTION == 'bootstrap' }
            }
            steps {
                dir('terraform/bootstrap') {
                    sh '''
                        echo "Bootstrapping Terraform state bucket for ${ENVIRONMENT}"
                        export AWS_PROFILE=${AWS_PROFILE}
                        export AWS_REGION=${AWS_REGION}
                        
                        terraform init
                        terraform plan -var="environment=${ENVIRONMENT}" -var="aws_region=${AWS_REGION}" -no-color
                        terraform apply -var="environment=${ENVIRONMENT}" -var="aws_region=${AWS_REGION}" -auto-approve -no-color
                        
                        echo "Bootstrap completed for ${ENVIRONMENT} environment"
                    '''
                }
            }
        }
        
        stage('Terraform Plan') {
            when {
                expression { params.ACTION == 'plan' }
            }
            steps {
                dir("terraform/environments/${params.ENVIRONMENT}") {
                    sh '''
                        echo "Running Terraform plan for ${ENVIRONMENT}"
                        export AWS_PROFILE=${AWS_PROFILE}
                        export AWS_REGION=${AWS_REGION}
                        
                        terraform init
                        terraform plan -no-color
                        
                        echo "Plan completed for ${ENVIRONMENT} environment"
                    '''
                }
            }
        }
        
        stage('Terraform Apply') {
            when {
                expression { params.ACTION == 'apply' }
            }
            steps {
                dir("terraform/environments/${params.ENVIRONMENT}") {
                    sh '''
                        echo "Applying Terraform changes for ${ENVIRONMENT}"
                        export AWS_PROFILE=${AWS_PROFILE}
                        export AWS_REGION=${AWS_REGION}
                        
                        terraform init
                        terraform apply -auto-approve -no-color
                        
                        echo "Apply completed for ${ENVIRONMENT} environment"
                        echo "Outputs:"
                        terraform output -no-color
                    '''
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