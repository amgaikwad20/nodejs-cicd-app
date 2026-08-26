pipeline {

    agent {
        label 'agent-1'
    }

    environment {
        SONAR_SCANNER = '/usr/local/bin/sonar-scanner'
        IMAGE_NAME = 'amgaikwad20/nodejs-cicd-app'
    }

    stages {

        stage('Checkout') {
            steps {
                deleteDir()

                checkout scm
            }
        }

        stage('Check Agent') {
            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "        JENKINS AGENT CHECK"
                    echo "======================================"

                    echo "USER:"
                    whoami

                    echo "HOST:"
                    hostname

                    echo "NODE:"
                    echo "$NODE_NAME"

                    echo "WORKSPACE:"
                    pwd

                    echo "PATH:"
                    echo "$PATH"

                    echo "======================================"
                    echo "SONAR SCANNER"
                    echo "======================================"

                    which sonar-scanner

                    ls -l /usr/local/bin/sonar-scanner

                    "$SONAR_SCANNER" --version

                    echo "======================================"
                    echo "DOCKER"
                    echo "======================================"

                    docker --version

                    echo "======================================"
                    echo "TRIVY"
                    echo "======================================"

                    trivy --version

                    echo "======================================"
                    echo "KUBECTL"
                    echo "======================================"

                    kubectl version --client

                    echo "======================================"
                '''
            }
        }

        stage('Check Workspace') {
            steps {
                sh '''
                    set -e

                    echo "===== WORKSPACE FILES ====="

                    find . -maxdepth 2 -type f | sort

                    echo "===== PACKAGE FILES ====="

                    find . -name package.json -o -name package-lock.json

                    echo "===== KUBERNETES FILES ====="

                    find k8s -maxdepth 2 -type f 2>/dev/null || true
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -e

                    echo "===== INSTALL DEPENDENCIES ====="

                    if [ ! -f package.json ]; then
                        echo "ERROR: package.json not found"
                        exit 1
                    fi

                    if [ ! -f package-lock.json ]; then
                        echo "ERROR: package-lock.json not found"
                        exit 1
                    fi

                    echo "Node version:"
                    node --version

                    echo "NPM version:"
                    npm --version

                    npm ci
                '''
            }
        }

        stage('Unit Test') {
            steps {
                sh '''
                    set -e

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
                            set -e

                            echo "======================================"
                            echo "       SONARQUBE ANALYSIS"
                            echo "======================================"

                            echo "SonarQube URL:"
                            echo "$SONAR_HOST_URL"

                            echo "Scanner:"
                            "$SONAR_SCANNER" --version

                            echo "Running SonarScanner..."

                            "$SONAR_SCANNER" \
                                -Dsonar.projectKey=nodejs-cicd-app \
                                -Dsonar.sources=. \
                                -Dsonar.tests=test \
                                -Dsonar.exclusions=node_modules/**,coverage/** \
                                -Dsonar.host.url="$SONAR_HOST_URL" \
                                -Dsonar.token="$SONAR_TOKEN"

                            echo "======================================"
                            echo "SonarQube analysis completed"
                            echo "======================================"
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
                    set -e

                    echo "======================================"
                    echo "          DOCKER BUILD"
                    echo "======================================"

                    docker build \
                        -t ${IMAGE_NAME}:${BUILD_NUMBER} .

                    echo "Docker image created:"

                    docker images | grep nodejs-cicd-app
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "           TRIVY SCAN"
                    echo "======================================"

                    trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        ${IMAGE_NAME}:${BUILD_NUMBER}

                    echo "======================================"
                    echo "Trivy scan completed"
                    echo "======================================"
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
                        set -e

                        echo "======================================"
                        echo "          DOCKER LOGIN"
                        echo "======================================"

                        echo "$DOCKER_PASSWORD" | docker login \
                            -u "$DOCKER_USERNAME" \
                            --password-stdin

                        echo "======================================"
                        echo "          DOCKER PUSH"
                        echo "======================================"

                        docker push \
                            ${IMAGE_NAME}:${BUILD_NUMBER}

                        echo "======================================"
                        echo "Docker push completed"
                        echo "======================================"
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "      KUBERNETES DEPLOYMENT"
                    echo "======================================"

                    if [ ! -d k8s ]; then
                        echo "ERROR: k8s directory not found"
                        exit 1
                    fi

                    echo "Updating image..."

                    sed -i \
                        "s|image:.*|image: ${IMAGE_NAME}:${BUILD_NUMBER}|" \
                        k8s/deployment.yaml

                    echo "Deployment manifest:"
                    cat k8s/deployment.yaml

                    echo "Applying Kubernetes manifests..."

                    kubectl apply -f k8s/

                    echo "======================================"
                    echo "       KUBERNETES STATUS"
                    echo "======================================"

                    kubectl get pods

                    kubectl get svc

                    kubectl get deployments
                '''
            }
        }
    }

    post {

        success {
            echo "======================================"
            echo "       PIPELINE SUCCESSFUL"
            echo "======================================"
            echo "Build Number: ${BUILD_NUMBER}"
            echo "======================================"
        }

        failure {
            echo "======================================"
            echo "          PIPELINE FAILED"
            echo "======================================"
            echo "Build Number: ${BUILD_NUMBER}"
            echo "Check the failed stage above."
            echo "======================================"
        }

        always {
            echo "Pipeline completed."
        }
    }
}
