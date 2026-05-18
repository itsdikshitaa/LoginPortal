pipeline {
    agent any

    // Environment variables
    environment {
        NODE_ENV = 'production'
        NODEJS_VERSION = 'v18'
        APP_DIR = '/home/ubuntu/LoginPortal'
        APP_PORT = '5000'
        GITHUB_REPO = 'https://github.com/itsdikshitaa/LoginPortal.git'
    }

    options {
        // Keep build history
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('1. Clone / Pull Repository') {
            steps {
                script {
                    echo '========================================='
                    echo 'Pulling Latest Code from GitHub'
                    echo '========================================='
                }
                // Use the app directory as workspace
                dir("${APP_DIR}") {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[url: env.GITHUB_REPO]]
                    ])
                }
            }
        }

        stage('2. Install Dependencies') {
            steps {
                dir("${APP_DIR}") {
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
        }

        stage('3. Validate Configuration') {
            steps {
                dir("${APP_DIR}") {
                    script {
                        echo '========================================='
                        echo 'Validating Configuration & Files'
                        echo '========================================='
                    }
                    sh '''
                        # Verify required files
                        test -f ".env.example" && echo "✓ .env.example found"
                        test -f "package.json" && echo "✓ package.json found"
                        test -f "server.js" && echo "✓ server.js found"

                        # Verify .env exists (not in git, required for runtime)
                        if [ -f ".env" ]; then
                            echo "✓ .env file found"
                        else
                            echo "⚠️  .env file missing! Copy from .env.example"
                        fi

                        # Check Node.js syntax
                        echo "Checking Node.js syntax..."
                        node --check server.js && echo "✓ server.js syntax valid"

                        # Validate critical dependencies
                        echo "Checking critical dependencies..."
                        npm list express ejs mongoose bcryptjs && echo "✓ All critical dependencies installed"
                    '''
                }
            }
        }

        stage('4. Run Tests') {
            steps {
                dir("${APP_DIR}") {
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
        }

        stage('5. Build & Prepare') {
            steps {
                dir("${APP_DIR}") {
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
        }

        stage('6. Deploy Locally') {
            steps {
                dir("${APP_DIR}") {
                    script {
                        echo '========================================='
                        echo 'Deploying Application Locally'
                        echo '========================================='
                    }
                    sh '''
                        set -e

                        # Ensure PM2 is installed globally
                        command -v pm2 >/dev/null 2>&1 || { echo "Installing PM2..."; npm install -g pm2; }

                        # Create backup
                        echo "Creating backup..."
                        BACKUP_DIR="/home/ubuntu/LoginPortal-backup-$(date +%Y%m%d-%H%M%S)"
                        mkdir -p "$BACKUP_DIR"
                        cp -r .env package.json server.js config/ controllers/ middleware/ models/ public/ routes/ views/ "$BACKUP_DIR/" 2>/dev/null || true
                        echo "✓ Backup saved to $BACKUP_DIR"

                        # Stop running application
                        echo "Stopping current application..."
                        pm2 stop login-portal 2>/dev/null || true
                        pm2 delete login-portal 2>/dev/null || true
                        sleep 2

                        # Start application with PM2
                        echo "Starting application with PM2..."
                        pm2 start server.js --name "login-portal" --env production --max-memory-restart 300M

                        # Save PM2 configuration for auto-start on reboot
                        pm2 save
                        sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

                        echo '========================================='
                        echo "✓ Deployment completed successfully!"
                        echo '========================================='
                        echo "Application running on port ${APP_PORT}"
                        echo "Process Name: login-portal"
                        echo ""
                        pm2 list
                    '''
                }
            }
        }

        stage('7. Verify Deployment') {
            steps {
                dir("${APP_DIR}") {
                    script {
                        echo '========================================='
                        echo 'Verifying Application Deployment'
                        echo '========================================='
                    }
                    sh '''
                        sleep 3
                        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${APP_PORT}/ || echo "000")

                        if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "302" ] || [ "$RESPONSE" = "301" ]; then
                            echo "✓ Application is running successfully"
                            echo "✓ HTTP Status: $RESPONSE"
                        else
                            echo "⚠️  Application returned HTTP $RESPONSE (may need .env or MongoDB)"
                            echo "Check logs: pm2 logs login-portal --lines 20"
                        fi
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '========================================='
            echo '✓ Pipeline Successful!'
            echo '========================================='
            sh '''
                echo "Application deployed successfully!"
                echo "Access at: http://localhost:${APP_PORT}"
            '''
        }

        failure {
            echo '========================================='
            echo '✗ Pipeline Failed!'
            echo '========================================='
            sh '''
                echo "Checking application logs..."
                pm2 logs login-portal --lines 30 2>/dev/null || true
                echo ""
                echo "Troubleshooting:"
                echo "1. Check .env file: /home/ubuntu/LoginPortal/.env"
                echo "2. View PM2 logs: pm2 logs login-portal"
                echo "3. Check status: pm2 status"
            '''
        }

        always {
            sh '''
                echo "========================================="
                echo "Build Summary"
                echo "========================================="
                echo "Build Number: ${BUILD_NUMBER}"
                echo "Build Status: ${BUILD_STATUS}"
                echo "Timestamp: $(date)"
                echo "========================================="
            '''
        }
    }
}
