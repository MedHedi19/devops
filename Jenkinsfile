pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        BACKEND_IMAGE = "react-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "react-frontend:${BUILD_NUMBER}"
        REGISTRY_NAMESPACE = 'medhedi19'
        DOCKER_REGISTRY_URL = 'docker.io'
        SONAR_PROJECT_KEY = 'devops'
        SONAR_HOST_URL = ''
        ENABLE_IMAGE_PUSH = 'false'
        ENABLE_K8S_DEPLOY = 'false'
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
                            sh '''
                                docker run --rm \
                                  -v "$PWD":/app \
                                  -w /app \
                                  node:20-alpine \
                                  sh -lc "npm install --no-audit --no-fund"
                            '''
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh '''
                                docker run --rm \
                                  -v "$PWD":/app \
                                  -w /app \
                                  node:20-alpine \
                                  sh -lc "npm install --no-audit --no-fund"
                            '''
                        }
                    }
                }
            }
        }

        stage('Validate Code') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh '''
                                docker run --rm \
                                  -v "$PWD":/app \
                                  -w /app \
                                  node:20-alpine \
                                  sh -lc "CI=true npm test"
                            '''
                        }
                    }
                }

                stage('Frontend Tests') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh '''
                                docker run --rm \
                                  -v "$PWD":/app \
                                  -w /app \
                                  node:20-alpine \
                                  sh -lc "CI=true npm test -- --watchAll=false --passWithNoTests"
                            '''
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                allOf {
                    expression { return env.SONAR_HOST_URL?.trim() }
                    expression { return fileExists('backend/package.json') }
                    expression { return fileExists('frontend/package.json') }
                }
            }
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        docker run --rm \
                          -e SONAR_HOST_URL="$SONAR_HOST_URL" \
                          -e SONAR_TOKEN="$SONAR_TOKEN" \
                          -v "$PWD":/usr/src \
                          -w /usr/src \
                          sonarsource/sonar-scanner-cli:latest \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.projectName=${SONAR_PROJECT_KEY} \
                          -Dsonar.sources=backend,frontend \
                          -Dsonar.exclusions=**/node_modules/**,**/build/**,**/coverage/** \
                          -Dsonar.sourceEncoding=UTF-8
                    '''
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
                sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy:latest image --severity CRITICAL,HIGH --exit-code 1 react-backend:${BUILD_NUMBER}
                '''
                sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy:latest image --severity CRITICAL,HIGH --exit-code 1 react-frontend:${BUILD_NUMBER}
                '''
            }
        }

        stage('Push Images') {
            when {
                expression {
                    return env.ENABLE_IMAGE_PUSH == 'true'
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-registry-creds', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY_URL" -u "$DOCKER_USERNAME" --password-stdin
                        docker tag react-backend:${BUILD_NUMBER} ${DOCKER_REGISTRY_URL}/${REGISTRY_NAMESPACE}/react-backend:${BUILD_NUMBER}
                        docker tag react-frontend:${BUILD_NUMBER} ${DOCKER_REGISTRY_URL}/${REGISTRY_NAMESPACE}/react-frontend:${BUILD_NUMBER}
                        docker tag react-backend:${BUILD_NUMBER} ${DOCKER_REGISTRY_URL}/${REGISTRY_NAMESPACE}/react-backend:latest
                        docker tag react-frontend:${BUILD_NUMBER} ${DOCKER_REGISTRY_URL}/${REGISTRY_NAMESPACE}/react-frontend:latest
                        docker push ${DOCKER_REGISTRY_URL}/${REGISTRY_NAMESPACE}/react-backend:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY_URL}/${REGISTRY_NAMESPACE}/react-frontend:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY_URL}/${REGISTRY_NAMESPACE}/react-backend:latest
                        docker push ${DOCKER_REGISTRY_URL}/${REGISTRY_NAMESPACE}/react-frontend:latest
                    '''
                }
            }
        }

        stage('Deploy Render') {
            when {
                expression {
                    return env.RENDER_DEPLOY_HOOK_BACKEND?.trim() || env.RENDER_DEPLOY_HOOK_FRONTEND?.trim()
                }
            }
            steps {
                script {
                    if (env.RENDER_DEPLOY_HOOK_BACKEND?.trim()) {
                        sh "curl -fsSL -X POST '${env.RENDER_DEPLOY_HOOK_BACKEND}'"
                    }
                    if (env.RENDER_DEPLOY_HOOK_FRONTEND?.trim()) {
                        sh "curl -fsSL -X POST '${env.RENDER_DEPLOY_HOOK_FRONTEND}'"
                    }
                }
            }
        }

        stage('Deploy Kubernetes') {
            when {
                expression {
                    return env.ENABLE_K8S_DEPLOY == 'true' && (fileExists('k8s/staging') || fileExists('k8s/production'))
                }
            }
            steps {
                sh '''
                    if [ -d k8s/staging ]; then
                      kubectl apply -f k8s/staging
                    fi
                    if [ -d k8s/production ]; then
                      kubectl apply -f k8s/production
                    fi
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}