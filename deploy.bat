@echo off
REM IoT Live Streaming - Quick Deploy Script for Windows
echo 🚀 Deploying IoT Live Streaming App...

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Railway CLI...
    npm install -g @railway/cli
)

REM Login to Railway (if not already logged in)
echo Please login to Railway in your browser...
railway login

REM Create and deploy
echo Creating Railway project...
railway init iot-live-streaming --source .

echo Deploying...
railway up

echo ✅ Deployment complete!
echo Get your URLs with: railway domain
pause