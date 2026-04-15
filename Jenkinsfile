pipeline {
    agent any

    environment {
        // Global Variables for your infrastructure
        REGISTRY_URL = "192.168.81.131:30010"
        IMAGE_NAME = "alumni-app/backend"
        // Generates a unique tag for every build (e.g., v1, v2)
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        // Matches the ID you created in Jenkins Credentials
        NEXUS_CREDS = credentials('nexus-creds') 
    }

    stages {
        stage('Checkout') {
            steps {
                // Jenkins pulls the code automatically if configured via SCM, 
                // but this step ensures clarity in the logs.
                checkout scm
            }
        }

        stage('Environment Check') {
            steps {
                // Confirming our 'Binary Injection' is still active
                sh 'docker --version'
                sh 'node --version'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Starting build for version: ${IMAGE_TAG}"
                    // Building from the Dockerfile in your root directory
                    sh "docker build -t ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG} ."
                    // Also tag it as 'latest' for easier K8s pulling later
                    sh "docker tag ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY_URL}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Nexus Authentication & Push') {
            steps {
                script {
                    // Secure login using --password-stdin to avoid plain-text password in logs
                    sh "echo '${NEXUS_CREDS_PSW}' | docker login ${REGISTRY_URL} -u ${NEXUS_CREDS_USR} --password-stdin"
                    
                    echo "Pushing ${IMAGE_TAG} to Nexus..."
                    sh "docker push ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${REGISTRY_URL}/${IMAGE_NAME}:latest"
                }
            }
        }
    }

    post {
        success {
            echo "Successfully built and pushed ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed. Check Docker permissions or Nexus connectivity."
        }
        always {
            // Cleanup to save disk space on your VM and remove credentials
            sh "docker logout ${REGISTRY_URL}"
            cleanWs()
        }
    }
}