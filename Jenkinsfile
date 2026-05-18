pipeline {
    agent any

    // Environment variables
    environment {
        NODE_ENV = 'production'
        NODEJS_VERSION = 'v18'
        AWS_EC2_IP = credentials('aws-ec2-ip')
        AWS_EC2_USER = credentials('aws-ec2-user')
        AWS_EC2_KEY = credentials('aws-ec2-key')
        GITHUB_REPO = 'https://github.com/itsdikshitaa/LoginPortal.git'
        APP_PORT = '5000'
    }

    options {
        // Keep build history
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('1. Clone Repository') {
            steps {
                script {
                    echo '========================================='
                    echo 'Cloning Repository from GitHub'
                    echo '========================================='
                }
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: env.GITHUB_REPO]]
                ])
            }
        }

        stage('2. Install Dependencies') {
            steps {
                script {
                    echo '========================================='
                    echo 'Installing Node.js Dependencies'
                    echo '========================================='
                }
                sh '''
                    node --version
                    npm --version
                    npm ci --only=production
                '''
            }
        }

        stage('3. Run Tests') {
            steps {
                script {
                    echo '========================================='
                    echo 'Running Application Tests'
                    echo '========================================='
                }
                sh '''
                    npm test
                '''
            }
        }

        stage('4. Build Application') {
            steps {
                script {
                    echo '========================================='
                    echo 'Building Application'
                    echo '========================================='
                }
                sh '''
                    echo "Build completed successfully"
                    echo "Application is ready for deployment"
                '''
            }
        }

        stage('5. Deploy to AWS EC2') {
            steps {
                script {
                    echo '========================================='
                    echo 'Deploying to AWS EC2'
                    echo '========================================='
                }
                sh '''
                    # Create deployment script
                    cat > deploy.sh << 'EOF'
                    #!/bin/bash
                    set -e

                    # Stop running application
                    echo "Stopping current application..."
                    pm2 stop login-portal || true
                    pm2 delete login-portal || true

                    # Navigate to app directory
                    cd /home/${AWS_EC2_USER}/LoginPortal

                    # Pull latest code
                    echo "Pulling latest code from GitHub..."
                    git pull origin main

                    # Install dependencies
                    echo "Installing dependencies..."
                    npm ci --only=production

                    # Start application with PM2
                    echo "Starting application with PM2..."
                    pm2 start server.js --name "login-portal" --env production

                    # Save PM2 process list
                    pm2 save

                    echo "Deployment completed successfully!"
                    echo "Application is running on port ${APP_PORT}"
                    EOF

                    # Make script executable
                    chmod +x deploy.sh

                    # Copy files to EC2
                    scp -i ${AWS_EC2_KEY} deploy.sh ${AWS_EC2_USER}@${AWS_EC2_IP}:/home/${AWS_EC2_USER}/

                    # Execute deployment on EC2
                    ssh -i ${AWS_EC2_KEY} ${AWS_EC2_USER}@${AWS_EC2_IP} 'bash /home/${AWS_EC2_USER}/deploy.sh'
                '''
            }
        }

        stage('6. Verify Deployment') {
            steps {
                script {
                    echo '========================================='
                    echo 'Verifying Application Deployment'
                    echo '========================================='
                }
                sh '''
                    # Check if application is running
                    sleep 5
                    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://${AWS_EC2_IP}:${APP_PORT}/ || echo "000")
                    
                    if [ "$RESPONSE" = "200" ]; then
                        echo "✓ Application is running successfully"
                        echo "✓ HTTP Status: $RESPONSE"
                    else
                        echo "✗ Application verification failed"
                        echo "✗ HTTP Status: $RESPONSE"
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo '========================================='
            echo '✓ Deployment Successful!'
            echo '========================================='
            sh '''
                echo "Application deployed successfully to http://${AWS_EC2_IP}:${APP_PORT}"
            '''
        }

        failure {
            echo '========================================='
            echo '✗ Deployment Failed!'
            echo '========================================='
            sh '''
                echo "Check logs for details"
                ssh -i ${AWS_EC2_KEY} ${AWS_EC2_USER}@${AWS_EC2_IP} 'pm2 logs login-portal' || true
            '''
        }

        always {
            // Clean up
            cleanWs()
        }
    }
}
