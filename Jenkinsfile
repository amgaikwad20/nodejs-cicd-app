pipeline {
    agent any

    environment {
        IMAGE_NAME = 'amol20/devsecops-nodejs-app'
        IMAGE_TAG  = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh '''
                    npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running application tests...'
                sh '''
                    npm test
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'Running SonarQube analysis...'

                withSonarQubeEnv('sonarqube') {
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
            steps {
                echo 'Waiting for SonarQube Quality Gate...'

                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker image ${IMAGE_NAME}:${IMAGE_TAG}"

                sh '''
                    docker build \
                      -t ${IMAGE_NAME}:${IMAGE_TAG} \
                      .
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                echo '================================================'
                echo 'TRIVY SCAN TEMPORARILY SKIPPED'
                echo 'Testing DockerHub push functionality'
                echo '================================================'
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo "Pushing ${IMAGE_NAME}:${IMAGE_TAG} to DockerHub..."

                withCredentials([
                    usernamePassword(
                        credentialsId: 'DOCKERHUB_CREDS',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                            -u "$DOCKER_USERNAME" \
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
            echo "SUCCESS: Image ${IMAGE_NAME}:${IMAGE_TAG} pushed to DockerHub."
        }

        failure {
            echo 'FAILED: Check the failed stage.'
        }

        always {
            echo "Pipeline completed: ${BUILD_NUMBER}"
        }
    }
}
