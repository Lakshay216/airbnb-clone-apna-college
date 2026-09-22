pipeline {
    agent any

    environment {
        IMAGE_NAME = 'airbnb-clone'
        IMAGE_TAG = "${BUILD_NUMBER}"
        PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test:coverage'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
                }
            }
        }

        stage('Code Quality') {
            steps {
                sh 'npm run lint'
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                    timeout(time: 5, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }

        stage('Security') {
            steps {
                sh 'npm run security'
                sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v trivy-cache:/root/.cache/ \
                      aquasec/trivy:latest image \
                      --scanners vuln --exit-code 1 --severity HIGH,CRITICAL \
                      $IMAGE_NAME:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'airbnb-session-secret', variable: 'SECRET'),
                    string(credentialsId: 'cloudinary-name', variable: 'CLOUD_NAME'),
                    string(credentialsId: 'cloudinary-key', variable: 'CLOUD_API_KEY'),
                    string(credentialsId: 'cloudinary-secret', variable: 'CLOUD_API_SECRET'),
                    string(credentialsId: 'mapbox-token', variable: 'MAP_TOKEN')
                ]) {
                    sh '''
                        APP_IMAGE=$IMAGE_NAME:$IMAGE_TAG \
                        APP_PORT=8081 \
                        MONGO_DATABASE=airbnb_staging \
                        docker compose -p airbnb-staging up -d app

                        for attempt in 1 2 3 4 5 6; do
                            curl -fsS http://localhost:8081/health && exit 0
                            sleep 5
                        done
                        exit 1
                    '''
                }
            }
        }

        stage('Release') {
            steps {
                withCredentials([
                    string(credentialsId: 'airbnb-session-secret', variable: 'SECRET'),
                    string(credentialsId: 'cloudinary-name', variable: 'CLOUD_NAME'),
                    string(credentialsId: 'cloudinary-key', variable: 'CLOUD_API_KEY'),
                    string(credentialsId: 'cloudinary-secret', variable: 'CLOUD_API_SECRET'),
                    string(credentialsId: 'mapbox-token', variable: 'MAP_TOKEN')
                ]) {
                    sh '''
                        docker tag $IMAGE_NAME:$IMAGE_TAG $IMAGE_NAME:release-$IMAGE_TAG

                        APP_IMAGE=$IMAGE_NAME:release-$IMAGE_TAG \
                        APP_PORT=8082 \
                        MONGO_DATABASE=airbnb_production \
                        docker compose -p airbnb-production up -d app

                        for attempt in 1 2 3 4 5 6; do
                            curl -fsS http://localhost:8082/health && exit 0
                            sleep 5
                        done
                        exit 1
                    '''
                }
            }
        }

        stage('Monitoring') {
            steps {
                withCredentials([
                    string(credentialsId: 'airbnb-session-secret', variable: 'SECRET')
                ]) {
                    sh '''
                        APP_IMAGE=$IMAGE_NAME:release-$IMAGE_TAG \
                        APP_PORT=8082 \
                        MONGO_DATABASE=airbnb_production \
                        docker compose -p airbnb-production --profile monitoring up -d --no-deps prometheus grafana

                        curl -fsS http://localhost:8082/metrics
                        curl -fsS http://localhost:9090/-/ready
                    '''
                }
            }
        }
    }

    post {
        failure {
            echo 'Pipeline failed. Check the failed stage and Jenkins logs.'
            script {
                if (env.ALERT_EMAIL?.trim()) {
                    mail to: env.ALERT_EMAIL,
                         subject: "Airbnb pipeline failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                         body: "Open Jenkins to review the failed stage: ${env.BUILD_URL}"
                }
            }
        }
        always {
            sh 'SECRET=cleanup docker compose -p airbnb-staging down || true'
        }
    }
}
