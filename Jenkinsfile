pipeline {
    agent any // Stick to 'any' to avoid the mounting issues you saw earlier
    
    environment {
        REGISTRY_URL = "192.168.81.131:30010"
        IMAGE_NAME = "alumni-app/backend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        NEXUS_CREDS = credentials('nexus-creds')
    }

    stages {
        stage('Prepare') {
            steps{
                sh "git config --global --add safe.directory '*'"
            }
        }
        stage('Checkout') {
            steps {
                // This stays the same
                checkout scm 
            }
        }

        // REMOVE the "Environment Check" stage that calls 'node --version'
        // Or wrap it inside a docker run command if you MUST check it

        stage('Build Docker Image') {
            steps {
                // This will work because the 'node' environment is 
                // inside your Dockerfile, not on the Jenkins host.
                sh "usr/local/bin/docker build -t ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Nexus Authentication & Push') {
            steps {
                script {
                    sh "echo ${NEXUS_CREDS_PSW} | usr/local/bin/docker login ${REGISTRY_URL} -u ${NEXUS_CREDS_USR} --password-stdin"
                    sh "usr/local/bin/docker push ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
    }
    
    post {
        always {
            sh " usr/local/bin/docker logout ${REGISTRY_URL}"
            cleanWs()
        }
    }
}
