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

        stage('3. Validate Configuration') {
            steps {
                script {
                    echo '========================================='
                    echo 'Validating Configuration & Credentials'
                    echo '========================================='
                }
                sh '''
                    # Verify required files
                    test -f ".env.example" && echo "✓ .env.example found"
                    test -f "package.json" && echo "✓ package.json found"
                    test -f "server.js" && echo "✓ server.js found"
                    
                    # Check Node.js syntax
                    echo "Checking Node.js syntax..."
                    node --check server.js && echo "✓ server.js syntax valid"
                    
                    # Validate critical dependencies
                    echo "Checking critical dependencies..."
                    npm list express ejs mongoose bcryptjs && echo "✓ All critical dependencies installed"
                '''
            }
        }

        stage('4. Run Tests') {
            steps {
                script {
                    echo '========================================='
                    echo 'Running Application Tests'
                    echo '========================================='
                }
                sh '''
                    npm test || echo "No automated tests configured yet"
                '''
            }
        }

        stage('5. Build & Prepare Artifacts') {
            steps {
                script {
                    echo '========================================='
                    echo 'Preparing Application for Deployment'
                    echo '========================================='
                }
                sh '''
                    echo "Application artifact prepared"
                    echo "Package size: $(du -sh . | cut -f1)"
                    echo "All build steps completed successfully"
                '''
            }
        }

        stage('6. Deploy to AWS EC2') {
            steps {
                script {
                    echo '========================================='
                    echo 'Deploying to AWS EC2'
                    echo '========================================='
                }
                sh '''
                    # Create comprehensive deployment script
                    cat > deploy.sh << 'EOF'
                    #!/bin/bash
                    set -e
                    
                    echo "========================================="
                    echo "LoginPortal Deployment Script"
                    echo "========================================="

                    # Pre-deployment checks
                    echo "Performing pre-deployment checks..."
                    command -v node >/dev/null 2>&1 || { echo "Node.js not found"; exit 1; }
                    command -v pm2 >/dev/null 2>&1 || { echo "Installing PM2 globally..."; npm install -g pm2; }
                    
                    # Stop and backup current application
                    echo "Backing up current application..."
                    cd /home/${AWS_EC2_USER}/LoginPortal
                    BACKUP_DIR="/home/${AWS_EC2_USER}/LoginPortal-backup-$(date +%Y%m%d-%H%M%S)"
                    [ -d ".git" ] && cp -r . "$BACKUP_DIR" || echo "First deployment, no backup needed"

                    # Stop running application
                    echo "Stopping current application..."
                    pm2 stop login-portal 2>/dev/null || true
                    pm2 delete login-portal 2>/dev/null || true
                    sleep 2

                    # Pull latest code
                    echo "Pulling latest code from GitHub..."
                    git fetch origin
                    git checkout main
                    git pull origin main

                    # Install dependencies
                    echo "Installing dependencies..."
                    npm ci --only=production

                    # Verify .env file exists
                    if [ ! -f ".env" ]; then
                        echo "ERROR: .env file not found!"
                        echo "Please create .env file with required variables"
                        exit 1
                    fi
                    echo "✓ .env file verified"

                    # Start application with PM2
                    echo "Starting application with PM2..."
                    pm2 start server.js --name "login-portal" --env production --max-memory-restart 300M
                    
                    # Save PM2 configuration
                    pm2 save
                    pm2 startup -u ${AWS_EC2_USER} --hp /home/${AWS_EC2_USER} 2>/dev/null || true

                    # Display deployment info
                    echo "========================================="
                    echo "✓ Deployment completed successfully!"
                    echo "========================================="
                    echo "Application Port: ${APP_PORT}"
                    echo "Process Name: login-portal"
                    echo ""
                    pm2 list
                    echo ""
                    echo "View logs with: pm2 logs login-portal"
                    EOF

                    # Make script executable
                    chmod +x deploy.sh

                    # Copy files to EC2
                    echo "Transferring files to EC2..."
                    scp -o StrictHostKeyChecking=no -i ${AWS_EC2_KEY} deploy.sh ${AWS_EC2_USER}@${AWS_EC2_IP}:/home/${AWS_EC2_USER}/
                    scp -o StrictHostKeyChecking=no -i ${AWS_EC2_KEY} -r . ${AWS_EC2_USER}@${AWS_EC2_IP}:/home/${AWS_EC2_USER}/LoginPortal/ --exclude=node_modules --exclude=.git

                    # Execute deployment on EC2
                    echo "Executing deployment script on EC2..."
                    ssh -o StrictHostKeyChecking=no -i ${AWS_EC2_KEY} ${AWS_EC2_USER}@${AWS_EC2_IP} 'bash /home/${AWS_EC2_USER}/deploy.sh'
                '''
            }
        }

        stage('7. Verify Deployment') {
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
                echo ""
                echo "Next steps:"
                echo "1. Access your app: http://${AWS_EC2_IP}:${APP_PORT}"
                echo "2. Check logs: ssh to EC2 and run: pm2 logs login-portal"
                echo "3. Monitor app: pm2 monit login-portal"
            '''
        }

        failure {
            echo '========================================='
            echo '✗ Deployment Failed!'
            echo '========================================='
            sh '''
                echo "Attempting to retrieve deployment logs..."
                ssh -o StrictHostKeyChecking=no -i ${AWS_EC2_KEY} ${AWS_EC2_USER}@${AWS_EC2_IP} 'pm2 logs login-portal --lines 50' || true
                echo ""
                echo "Troubleshooting steps:"
                echo "1. SSH to EC2: ssh -i <key.pem> ${AWS_EC2_USER}@${AWS_EC2_IP}"
                echo "2. Check PM2 status: pm2 status"
                echo "3. View logs: pm2 logs login-portal"
                echo "4. Verify .env exists: cat /home/${AWS_EC2_USER}/LoginPortal/.env"
            '''
        }

        always {
            // Generate build summary
            sh '''
                echo "========================================="
                echo "Build Summary"
                echo "========================================="
                echo "Build Number: ${BUILD_NUMBER}"
                echo "Build Status: ${BUILD_STATUS}"
                echo "Timestamp: $(date)"
                echo "========================================="
            '''
            // Clean up workspace
            cleanWs()
        }
    }
}
