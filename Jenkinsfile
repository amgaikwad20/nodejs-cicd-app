
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
