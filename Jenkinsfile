
pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Check Workspace') {
            steps {
                sh '''
                    echo "===== WORKSPACE ====="
                    pwd

                    echo "===== FILES ====="
                    find . -maxdepth 2 -type f | sort

                    echo "===== PACKAGE FILES ====="
                    find . -name package.json -o -name package-lock.json
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "===== INSTALL DEPENDENCIES ====="

                    if [ ! -f package.json ]; then
                        echo "ERROR: package.json not found"
                        exit 1
                    fi

                    if [ ! -f package-lock.json ]; then
                        echo "ERROR: package-lock.json not found"
                        exit 1
                    fi

                    node --version
                    npm --version

                    npm ci
                '''
            }
        }

        stage('Unit Test') {
            steps {
                sh '''
                    echo "===== UNIT TEST ====="
                    npm test
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {

                    withCredentials([
                        string(
                            credentialsId: 'SONAR_TOKEN',
                            variable: 'SONAR_TOKEN'
                        )
                    ]) {

                        sh '''
                            echo "===== SONARQUBE ANALYSIS ====="

                            /usr/local/bin/sonar-scanner \
                              -Dsonar.projectKey=nodejs-cicd-app \
                              -Dsonar.sources=. \
                              -Dsonar.tests=test \
                              -Dsonar.exclusions=node_modules/**,coverage/** \
                              -Dsonar.token="$SONAR_TOKEN"
                        '''
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    echo "===== DOCKER BUILD ====="

                    docker build \
                      -t amgaikwad20/nodejs-cicd-app:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    echo "===== TRIVY SECURITY SCAN ====="

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
                        echo "===== DOCKER LOGIN ====="

                        echo "$DOCKER_PASSWORD" | docker login \
                          -u "$DOCKER_USERNAME" \
                          --password-stdin

                        echo "===== DOCKER PUSH ====="

                        docker push \
                          amgaikwad20/nodejs-cicd-app:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    echo "===== KUBERNETES DEPLOYMENT ====="

                    echo "Updating image in deployment.yaml"

                    sed -i \
                      "s|image:.*|image: amgaikwad20/nodejs-cicd-app:${BUILD_NUMBER}|" \
                      k8s/deployment.yaml

                    echo "Applying Kubernetes manifests"

                    kubectl apply -f k8s/

                    echo "===== POD STATUS ====="

                    kubectl get pods

                    echo "===== SERVICE STATUS ====="

                    kubectl get svc
                '''
            }
        }
    }

    post {
        success {
            echo "======================================"
            echo "PIPELINE SUCCESSFUL"
            echo "Build Number: ${BUILD_NUMBER}"
            echo "======================================"
        }

        failure {
            echo "======================================"
            echo "PIPELINE FAILED"
            echo "Build Number: ${BUILD_NUMBER}"
            echo "Check the failed stage above."
            echo "======================================"
        }
    }
}
