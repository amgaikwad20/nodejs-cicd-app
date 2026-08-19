pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                deleteDir()

                git branch: 'main',
                    url: 'https://github.com/amgaikwad20/nodejs-cicd-app.git'
            }
        }

        stage('Verify Files') {
            steps {
                sh '''
                    echo "===== WORKSPACE ====="
                    pwd

                    echo "===== FILES ====="
                    ls -la

                    echo "===== PACKAGE FILES ====="
                    ls -lh package.json package-lock.json

                    echo "===== NODE ====="
                    node --version

                    echo "===== NPM ====="
                    npm --version
                '''
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
                sh '''
                    docker build \
                      -t amgaikwad20/nodejs-cicd-app:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    trivy image \
                      --severity HIGH,CRITICAL \
                      --exit-code 1 \
                      amgaikwad20/nodejs-cicd-app:${BUILD_NUMBER}
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
                          amgaikwad20/nodejs-cicd-app:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    sed -i \
                      "s|image:.*|image: amgaikwad20/nodejs-cicd-app:${BUILD_NUMBER}|" \
                      k8s/deployment.yaml

                    kubectl apply -f k8s/
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline completed."
        }
    }
}
