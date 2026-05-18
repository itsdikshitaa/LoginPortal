@echo off
REM GitHub Push Commands for Windows
REM Copy and run these commands in PowerShell or Command Prompt

echo.
echo ========================================
echo Login Portal - GitHub Push Instructions
echo ========================================
echo.
echo STEP 1: Create Repository on GitHub
echo ====================================
echo.
echo 1. Go to https://github.com/new
echo 2. Repository name: LoginPortal
echo 3. Description: Full-stack login portal with CI/CD deployment
echo 4. Choose: Public or Private
echo 5. DO NOT initialize with README
echo 6. Click "Create repository"
echo.
echo After creating, copy the URL from GitHub
echo.
echo ========================================
echo.
echo STEP 2: Run These Commands
echo ===========================
echo.
echo Open PowerShell or Command Prompt and run:
echo.
echo cd C:\Users\diksh\OneDrive\Documents\GitHub\LoginPortal
echo.
echo REM Configure Git
echo git config user.name "Your Name"
echo git config user.email "your-email@example.com"
echo.
echo REM Add GitHub repository
echo git remote add origin https://github.com/itsdikshitaa/LoginPortal.git
echo.
echo REM Verify remote
echo git remote -v
echo.
echo REM Push to GitHub
echo git branch -M main
echo git push -u origin main
echo.
echo ========================================
echo.
echo STEP 3: When Prompted for Password
echo ===================================
echo.
echo - Username: YOUR_GITHUB_USERNAME
echo - Password: YOUR_PERSONAL_ACCESS_TOKEN (NOT your GitHub password)
echo.
echo HOW TO GET PERSONAL ACCESS TOKEN:
echo 1. Go to https://github.com/settings/tokens
echo 2. Click "Generate new token" ^> "Generate new token (classic)"
echo 3. Token name: LoginPortal
echo 4. Select scopes: repo, workflow
echo 5. Generate and copy token
echo 6. Use this token as password
echo.
echo ========================================
echo.
echo COPY-PASTE READY COMMANDS
echo =========================
echo.
echo First, navigate to project:
echo cd C:\Users\diksh\OneDrive\Documents\GitHub\LoginPortal
echo.
echo Then run these:
echo git remote add origin https://github.com/itsdikshitaa/LoginPortal.git
echo git branch -M main
echo git push -u origin main
echo.
echo ========================================
echo.
echo ALTERNATIVE: Using SSH Keys
echo ============================
echo.
echo If you have SSH keys set up:
echo.
echo git remote set-url origin git@github.com:itsdikshitaa/LoginPortal.git
echo git branch -M main
echo git push -u origin main
echo.
echo ========================================
echo.
echo VERIFY ON GITHUB
echo ================
echo.
echo 1. Go to https://github.com/itsdikshitaa/LoginPortal
echo 2. Verify all files are there
echo 3. Verify .gitignore is working (no node_modules folder)
echo 4. Check git history (should show 3 commits)
echo.
echo ========================================
echo.
echo SETUP GITHUB WEBHOOK
echo ====================
echo.
echo For Jenkins CI/CD pipeline:
echo.
echo 1. Go to https://github.com/itsdikshitaa/LoginPortal/settings/hooks
echo 2. Click "Add webhook"
echo 3. Configure:
echo    - Payload URL: http://YOUR_JENKINS_IP:8080/github-webhook/
echo    - Content type: application/json
echo    - Events: Just the push event
echo    - Active: Checked
echo 4. Click "Add webhook"
echo.
echo ========================================
echo.
echo TROUBLESHOOTING
echo ===============
echo.
echo Error: "fatal: remote origin already exists"
echo Solution:
echo   git remote remove origin
echo   git remote add origin https://github.com/itsdikshitaa/LoginPortal.git
echo.
echo Error: "permission denied" or "403 error"
echo Solution:
echo   Use your personal access token as password
echo   NOT your GitHub login password
echo.
echo Error: "refusing to merge unrelated histories"
echo Solution:
echo   git pull --allow-unrelated-histories
echo   git push -u origin main
echo.
echo ========================================
echo.
echo NEXT STEPS
echo ==========
echo.
echo 1. Local Testing
echo    npm run dev
echo    http://localhost:5000
echo.
echo 2. AWS EC2 Setup (20-30 minutes)
echo    Read: AWS-EC2-SETUP.md
echo.
echo 3. Jenkins Setup (15-20 minutes)
echo    Read: GITHUB-JENKINS-SETUP.md
echo.
echo 4. Test Full Pipeline
echo    Make change ^> git push ^> Jenkins builds and deploys
echo.
echo ========================================
echo.
echo Ready to deploy? Follow these docs:
echo.
echo - QUICK-START.md          - 5-step setup
echo - AWS-EC2-SETUP.md        - EC2 deployment
echo - GITHUB-JENKINS-SETUP.md - CI/CD setup
echo - README.md               - Overview
echo.
echo Good luck! :)
echo.
pause
