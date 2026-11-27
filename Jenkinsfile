pipeline {
    agent any
    environment {
        TAG = "${env.BUILD_NUMBER}"
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build') {
            steps { sh 'mvn -B clean package -DskipTests' }
        }
        stage('Test') {
            steps { sh 'mvn -B test' }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
                }
            }
        }
        stage('Docker build') {
            steps {
                sh "docker build -t smartcampus:${TAG} ."
                sh "docker build -t smartcampus-frontend:${TAG} ./frontend"
            }
        }
    }
    post {
        success {
            archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
        }
    }

}