pipeline {
    agent any

    stages {

        stage('Check Agent') {
            steps {
                sh '''
                    echo "===== WHO AM I ====="
                    whoami

                    echo "===== HOST ====="
                    hostname

                    echo "===== PATH ====="
                    echo "$PATH"

                    echo "===== SCANNER ====="
                    which sonar-scanner || true

                    echo "===== SCANNER FILE ====="
                    ls -l /usr/local/bin/sonar-scanner || true

                    echo "===== SCANNER TARGET ====="
                    ls -l /opt/sonar-scanner-7.2.0.5079-linux-x64/bin/sonar-scanner || true

                    echo "===== SCANNER VERSION ====="
                    /usr/local/bin/sonar-scanner --version
                '''
            }
        }
    }
    
    stage('Identify Jenkins Agent') {
    steps {
        sh '''
            echo "===== USER ====="
            whoami

            echo "===== HOSTNAME ====="
            hostname

            echo "===== HOSTNAME FQDN ====="
            hostname -f

            echo "===== JENKINS NODE ====="
            echo "$NODE_NAME"

            echo "===== WORKSPACE ====="
            pwd

            echo "===== OS ====="
            cat /etc/os-release | head
        '''
    }
}
}
