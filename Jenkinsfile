pipeline {
    agent {
        kubernetes {
            yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              # 1. The Docker CLI (Where your commands run)
              - name: docker
                image: docker:cli
                command: ['cat']
                tty: true
                env:
                - name: DOCKER_HOST
                  value: tcp://localhost:2375
                  
              # 2. The Docker Engine (The private sidecar)
              - name: dind
                image: docker:dind
                args: ["--insecure-registry=192.168.41.90:8082"]
                securityContext:
                  privileged: true
                env:
                - name: DOCKER_TLS_CERTDIR
                  value: ""
            '''
        }
    }
    
    environment {
        REGISTRY_URL = "192.168.41.90:8082" 
        IMAGE_NAME = "alumni-backend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        
        NEXUS_CREDS = credentials('nexus-creds')
        // Removed GIT_PAT from here; we call it directly inside the GitOps stage now!
    }

    stages {
        stage('Prepare') {
            steps{
                sh "git config --global --add safe.directory '*'"
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm 
            }
        }

        stage('Build Docker Image') {
            steps {
                container('docker') {
                    // Added a brief sleep to ensure the DinD sidecar is fully awake before connecting
                    sh "sleep 10" 
                    sh "docker build -t ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Push to Nexus') {
            steps {
                container('docker') {
                    script {
                        // Safe shell execution using single quotes
                        sh 'echo $NEXUS_CREDS_PSW | docker login $REGISTRY_URL -u $NEXUS_CREDS_USR --password-stdin'
                        sh 'docker push $REGISTRY_URL/$IMAGE_NAME:$IMAGE_TAG'
                    }
                }
            }
        }

        stage('GitOps: Update Infra Repo') {
            steps {
                script {
                    dir('infra-repo-tmp') {
                        // Explicitly pull the username and password from the vault
                        withCredentials([usernamePassword(credentialsId: 'github-pat', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                            // Single quotes here are CRITICAL. Do not change to double quotes.
                            sh 'git clone https://$GIT_USER:$GIT_PASS@github.com/Riyag012/git-infra-repo.git .'
                        }
                        
                        sh "git config user.email 'jenkins@alumnilab.local'"
                        sh "git config user.name 'Jenkins Pipeline'"
                        
                        def valuesFile = "charts/alumni-backend/values.yaml"
                        
                        sh """
                           sed -i 's/tag: .*/tag: \"${IMAGE_TAG}\"/' ${valuesFile}
                        """
                        
                        sh """
                           git add ${valuesFile}
                           git commit -m "Automated CI/CD: Update backend tag to ${IMAGE_TAG}"
                           git push origin main
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            container('docker') {
                sh "docker logout ${REGISTRY_URL} || true"
            }
            deleteDir()
        }
    }
}
