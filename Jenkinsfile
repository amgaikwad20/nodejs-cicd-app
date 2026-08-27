pipeline {
    agent {  label  'agent-1'  }

    environment {
        IMAGE_NAME = 'amol20/devsecops-nodejs-app'
        IMAGE_TAG  = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            agent { label 'agent-1' }
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            agent { label 'agent-1' }
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            agent { label 'agent-1' }
            steps {
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            agent { label 'agent-1' }
            steps {
                withSonarQubeEnv('YOUR_SONARQUBE_NAME') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=devsecops-nodejs-app \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_HOST_URL \
                          -Dsonar.token=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage('Quality Gate') {
            agent { label 'agent-1' }
            steps {
                echo 'Quality Gate temporarily skipped'
            }
        }

        stage('Docker Build') {
            agent { label 'jenkin-worker' }
            steps {
                sh '''
                    docker build \
                      -t ${IMAGE_NAME}:${IMAGE_TAG} \
                      .
                '''
            }
        }

        stage('Trivy Scan') {
            agent { label 'jenkin-worker' }
            steps {
                echo 'Trivy temporarily skipped for DockerHub push testing'
            }
        }

        stage('Push to DockerHub') {
            agent { label 'jenkin-worker' }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'DOCKERHUB_CREDS',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                          --username "$DOCKER_USERNAME" \
                          --password-stdin

                        docker push ${IMAGE_NAME}:${IMAGE_TAG}

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "SUCCESS: ${IMAGE_NAME}:${IMAGE_TAG} pushed to DockerHub"
        }

        failure {
            echo 'Pipeline FAILED'
        }
    }
}
