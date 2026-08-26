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

                    echo "===== NODE VERSION ====="
                    node --version

                    echo "===== NPM VERSION ====="
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

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    echo "===== KUBERNETES DEPLOYMENT ====="

                    sed -i \
                    "s|image:.*|image: amgaikwad20/nodejs-cicd-app:${BUILD_NUMBER}|" \
                    k8s/deployment.yaml

                    kubectl apply -f k8s/

                    echo "===== KUBERNETES RESOURCES ====="

                    kubectl get pods
                    kubectl get services
                '''
            }
        }
    }

    post {

        success {
            echo '======================================'
            echo 'PIPELINE COMPLETED SUCCESSFULLY'
            echo '======================================'
        }

        failure {
            echo '======================================'
            echo 'PIPELINE FAILED'
            echo 'Check the failed stage above.'
            echo '======================================'
        }

        always {
            echo "Build Number: ${BUILD_NUMBER}"
        }
    }
}
