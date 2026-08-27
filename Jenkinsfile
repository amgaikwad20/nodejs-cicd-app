    pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "amol20/devsecops-nodejs-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    node --version
                    npm --version
                    npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    npm test
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'SONAR_TOKEN',
                        variable: 'SONAR_TOKEN'
                    )
                ]) {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            sonar-scanner \
                              -Dsonar.projectKey=devsecops-nodejs-app \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=$SONAR_HOST_URL \
                              -Dsonar.token=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                      -t ${DOCKER_IMAGE}:${IMAGE_TAG} \
                      -t ${DOCKER_IMAGE}:latest .
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    trivy image \
                      --severity HIGH,CRITICAL \
                      --exit-code 1 \
                      ${DOCKER_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

        stage('Push to DockerHub') {
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
                          -u "$DOCKER_USERNAME" \
                          --password-stdin

                        docker push ${DOCKER_IMAGE}:${IMAGE_TAG}
                        docker push ${DOCKER_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Image passed SonarQube and Trivy and was pushed to DockerHub.'
        }

        failure {
            echo 'FAILED: Check the failed pipeline stage and Jenkins console output.'
        }
    }
}
