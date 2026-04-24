#!/bin/bash

# IoT Live Streaming - Quick Deploy Script
echo "🚀 Deploying IoT Live Streaming App..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "Please login to Railway in your browser..."
railway login

# Create and deploy
echo "Creating Railway project..."
railway init iot-live-streaming --source .

echo "Deploying..."
railway up

echo "✅ Deployment complete!"
echo "Get your URLs with: railway domain"