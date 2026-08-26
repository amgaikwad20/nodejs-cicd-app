pipeline {

    agent any

    stages {

        stage('Identify Jenkins Agent') {
            steps {
                sh '''
                    echo "===== USER ====="
                    whoami

                    echo "===== HOSTNAME ====="
                    hostname

                    echo "===== JENKINS NODE ====="
                    echo "$NODE_NAME"

                    echo "===== WORKSPACE ====="
                    pwd

                    echo "===== PATH ====="
                    echo "$PATH"

                    echo "===== SONAR SCANNER ====="
                    which sonar-scanner || true

                    echo "===== SCANNER FILE ====="
                    ls -l /usr/local/bin/sonar-scanner || true

                    echo "===== SCANNER DIRECTORY ====="
                    ls -ld /opt/sonar-scanner-7.2.0.5079-linux-x64 || true

                    echo "===== SCANNER VERSION ====="
                    /usr/local/bin/sonar-scanner --version || true
                '''
            }
        }

    }
}
