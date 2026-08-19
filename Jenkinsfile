pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Unit Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=nodejs-cicd-app \
                        -Dsonar.sources=. \
                        -Dsonar.tests=test \
                        -Dsonar.exclusions=node_modules/**,coverage/**
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t YOUR_DOCKERHUB_USERNAME/nodejs-cicd-app:${BUILD_NUMBER} .'
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    trivy image \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    YOUR_DOCKERHUB_USERNAME/nodejs-cicd-app:${BUILD_NUMBER}
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                        -u "$DOCKER_USERNAME" \
                        --password-stdin

                        docker push \
                        YOUR_DOCKERHUB_USERNAME/nodejs-cicd-app:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    sed -i \
                    "s|image:.*|image: YOUR_DOCKERHUB_USERNAME/nodejs-cicd-app:${BUILD_NUMBER}|" \
                    k8s/deployment.yaml

                    kubectl apply -f k8s/
                '''
            }
        }
    }
}
