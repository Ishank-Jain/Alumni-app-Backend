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
        GIT_PAT = credentials('github-pat') 
        
        INFRA_REPO_URL = "github.com/Riyag012/git-infra-repo-main.git"
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
                        sh "echo ${NEXUS_CREDS_PSW} | docker login ${REGISTRY_URL} -u ${NEXUS_CREDS_USR} --password-stdin"
                        sh "docker push ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }

        stage('GitOps: Update Infra Repo') {
            steps {
                script {
                    dir('infra-repo-tmp') {
                        sh "git clone https://${GIT_PAT_USR}:${GIT_PAT_PSW}@${INFRA_REPO_URL} ."
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
