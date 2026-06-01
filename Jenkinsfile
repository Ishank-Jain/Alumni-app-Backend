pipeline {
    agent {
        kubernetes {
            yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: docker
                image: docker:cli
                command: ['cat']
                tty: true
                volumeMounts:
                - mountPath: /var/run/docker.sock
                  name: docker-sock
              volumes:
              - name: docker-sock
                hostPath:
                  path: /var/run/docker.sock
            '''
        }
    } 
    
    environment {
        // 1. Updated to your direct Nexus Docker IP
        REGISTRY_URL = "192.168.41.90:8082" 
        IMAGE_NAME = "alumni-backend" // Removed the slash to keep it standard
        IMAGE_TAG = "v${BUILD_NUMBER}"
        
        // Ensure these IDs match exactly what you named them in Jenkins Credentials
        NEXUS_CREDS = credentials('nexus-creds')
        GIT_PAT = credentials('github-pat') // You need to add this credential to Jenkins!
        
        // The URL of your INFRASTRUCTURE repository (where your Helm charts live)
        INFRA_REPO_URL = "github.com/Riyag012/git-infra-repo.git"
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
                // THIS is the line that tells Jenkins to switch containers!
                container('docker') {
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
                    // We need a temporary directory to clone the infra repo without wiping out the backend code
                    dir('infra-repo-tmp') {
                        // 1. Securely clone the infra repo using the PAT
                        sh "git clone https://${GIT_PAT_USR}:${GIT_PAT_PSW}@${INFRA_REPO_URL} ."
                        
                        // 2. Configure Git user for the commit
                        sh "git config user.email 'jenkins@alumnilab.local'"
                        sh "git config user.name 'Jenkins Pipeline'"
                        
                        // 3. Update the Image Tag inside the backend values.yaml file using 'sed'
                        // Make sure this path is exactly where your backend values.yaml lives inside the infra repo!
                        def valuesFile = "charts/alumni-backend/values.yaml"
                        
                        sh """
                           # Find the line starting with 'tag:' and replace it with the new build number
                           sed -i 's/tag: .*/tag: \"${IMAGE_TAG}\"/' ${valuesFile}
                        """
                        
                        // 4. Commit and Push back to GitHub
                        sh """
                           git add ${valuesFile}
                           git commit -m "Automated CI/CD: Update backend tag to ${IMAGE_TAG}"
                           git push origin mainw
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Must logout inside the docker container
            container('docker') {
                sh "docker logout ${REGISTRY_URL} || true"
            }
            cleanWs()
        }
    }
}
