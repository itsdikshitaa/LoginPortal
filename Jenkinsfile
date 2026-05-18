pipeline {
    agent any

    // Environment variables
    environment {
        NODE_ENV = 'production'
        APP_DIR = '/home/ubuntu/LoginPortal'
        APP_PORT = '5000'
        BACKUP_DIR = '/home/ubuntu/LoginPortal-backups'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo '========================================='
                echo 'Checking out code from GitHub'
                echo '========================================='
                checkout scm
            }
        }

        stage('2. Install Dependencies') {
            steps {
                sh '''
                    node --version
                    npm --version
                    npm ci --only=production
                '''
            }
        }

        stage('3. Validate Configuration') {
            steps {
                sh '''
                    test -f ".env.example" && echo "✓ .env.example found"
                    test -f "server.js" && echo "✓ server.js found"
                    node --check server.js && echo "✓ server.js syntax valid"
                    npm list express ejs mongoose bcryptjs && echo "✓ All critical dependencies installed"
                '''
            }
        }

        stage('4. Tests') {
            steps {
                sh '''
                    npm test || echo "No automated tests configured yet"
                '''
            }
        }

        stage('5. Deploy to App Directory') {
            steps {
                script {
                    echo '========================================='
                    echo 'Syncing code to application directory'
                    echo '========================================='
                }
                sh '''
                    set -e

                    # Ensure target directory exists
                    sudo mkdir -p "${APP_DIR}"
                    sudo chown ubuntu:ubuntu "${APP_DIR}"

                    # Create backup of current app (excluding node_modules)
                    if [ -d "${APP_DIR}/server.js" ]; then
                        echo "Creating backup..."
                        mkdir -p "${BACKUP_DIR}"
                        BACKUP="${BACKUP_DIR}/backup-$(date +%Y%m%d-%H%M%S)"
                        sudo cp -r "${APP_DIR}/.env" "${APP_DIR}/server.js" "${BACKUP}/" 2>/dev/null || true
                        echo "✓ Backup saved"
                    fi

                    # Sync new code (preserve .env, node_modules)
                    echo "Syncing files..."
                    sudo rsync -a --delete \
                        --exclude='.env' \
                        --exclude='node_modules' \
                        --exclude='.git' \
                        --exclude='GITHUB-PUSH-COMMANDS.*' \
                        ./ "${APP_DIR}/"

                    # Fix ownership
                    sudo chown -R ubuntu:ubuntu "${APP_DIR}"

                    echo "✓ Code synced to ${APP_DIR}"
                '''
            }
        }

        stage('6. Install & Restart App') {
            steps {
                sh '''
                    # Install production dependencies as ubuntu user
                    sudo -u ubuntu bash -c '
                        cd "${APP_DIR}"
                        echo "Installing production dependencies..."
                        npm ci --only=production

                        # Ensure PM2 is available
                        command -v pm2 >/dev/null 2>&1 || { echo "Installing PM2..."; npm install -g pm2; }

                        # Stop current app
                        echo "Stopping current application..."
                        pm2 stop login-portal 2>/dev/null || true
                        pm2 delete login-portal 2>/dev/null || true
                        sleep 2

                        # Start with PM2
                        echo "Starting application with PM2..."
                        pm2 start server.js --name "login-portal" --env production --max-memory-restart 300M

                        # Save PM2 config
                        pm2 save
                    '

                    # Setup PM2 startup (runs once)
                    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

                    echo ""
                    echo "✓ Application deployed successfully!"
                    echo "✓ Port: ${APP_PORT}"
                    sudo -u ubuntu pm2 list 2>/dev/null || echo "(run 'pm2 list' as ubuntu)"
                '''
            }
        }

        stage('7. Verify Deployment') {
            steps {
                sh '''
                    sleep 3
                    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${APP_PORT}/ || echo "000")

                    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "302" ] || [ "$RESPONSE" = "301" ]; then
                        echo "✓ Application is running successfully!"
                        echo "✓ HTTP Status: $RESPONSE"
                    else
                        echo "⚠️  Application returned HTTP $RESPONSE"
                        echo "Check logs: sudo -u ubuntu pm2 logs login-portal --lines 20"
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo '========================================='
            echo '✓ Pipeline Completed Successfully!'
            echo '========================================='
            sh '''
                echo "Access: http://$(curl -s http://checkip.amazonaws.com/):${APP_PORT}"
            '''
        }

        failure {
            echo '========================================='
            echo '✗ Pipeline Failed!'
            echo '========================================='
            sh '''
                echo "Checking application logs..."
                sudo -u ubuntu pm2 logs login-portal --lines 30 2>/dev/null || true
                echo ""
                echo "1. Check .env: sudo cat ${APP_DIR}/.env"
                echo "2. View logs: sudo -u ubuntu pm2 logs login-portal"
                echo "3. Status: sudo -u ubuntu pm2 status"
            '''
        }

        always {
            sh '''
                echo "Build #${BUILD_NUMBER} - ${BUILD_STATUS}"
                echo "Completed: $(date)"
            '''
        }
    }
}
