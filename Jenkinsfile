pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        BACKEND_IMAGE = "react-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "react-frontend:${BUILD_NUMBER}"
        RUN_TRIVY_SCAN = 'false'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            script {
                                docker.image('node:20-alpine').inside {
                                    sh 'npm install --no-audit --no-fund'
                                }
                            }
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            script {
                                docker.image('node:20-alpine').inside {
                                    sh 'npm install --no-audit --no-fund'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Validate Code') {
            parallel {
                stage('Backend Syntax Check') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            script {
                                docker.image('node:20-alpine').inside {
                                    sh 'node --check index.js && node --check routes/router.js'
                                }
                            }
                        }
                    }
                }

                stage('Frontend Tests') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            script {
                                docker.image('node:20-alpine').inside {
                                    sh 'CI=true npm test -- --watchAll=false --passWithNoTests'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Backend Docker Image') {
                    steps {
                        sh "docker build -t ${BACKEND_IMAGE} ${BACKEND_DIR}"
                    }
                }

                stage('Frontend Docker Image') {
                    steps {
                        sh "docker build -t ${FRONTEND_IMAGE} ${FRONTEND_DIR}"
                    }
                }
            }
        }

        stage('Security Scan') {
            when {
                environment name: 'RUN_TRIVY_SCAN', value: 'true'
            }
            steps {
                sh "trivy image --severity CRITICAL,HIGH --exit-code 1 ${BACKEND_IMAGE}"
                sh "trivy image --severity CRITICAL,HIGH --exit-code 1 ${FRONTEND_IMAGE}"
            }
        }

        stage('Push Images') {
            when {
                expression {
                    return env.DOCKER_REGISTRY?.trim()
                }
            }
            steps {
                sh '''
                    docker tag react-backend:${BUILD_NUMBER} ${DOCKER_REGISTRY}/react-backend:${BUILD_NUMBER}
                    docker tag react-frontend:${BUILD_NUMBER} ${DOCKER_REGISTRY}/react-frontend:${BUILD_NUMBER}
                    docker push ${DOCKER_REGISTRY}/react-backend:${BUILD_NUMBER}
                    docker push ${DOCKER_REGISTRY}/react-frontend:${BUILD_NUMBER}
                '''
            }
        }

        stage('Deploy Staging') {
            when {
                expression {
                    return fileExists('k8s/staging')
                }
            }
            steps {
                sh 'kubectl apply -f k8s/staging'
            }
        }

        stage('Deploy Production') {
            when {
                expression {
                    return fileExists('k8s/production')
                }
            }
            steps {
                input message: 'Promote build to production?'
                sh 'kubectl apply -f k8s/production'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}