#!/bin/bash

# ApiForge Deployment Script for Hostinger
# This script rebuilds and restarts both backend and frontend

echo "🚀 Starting ApiForge deployment..."

# Navigate to project root
cd ~/ApiForge

# Pull latest changes (if needed)
echo "📥 Pulling latest changes..."
git pull

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build backend
echo "🔨 Building backend..."
pnpm --filter @apiforge/api-server build

# Build frontend (this bakes in the environment variables)
echo "🔨 Building frontend..."
pnpm --filter @apiforge/dashboard-web build

# Restart backend
echo "🔄 Restarting backend..."
pm2 restart apiforge-api

# Restart frontend
echo "🔄 Restarting frontend..."
pm2 restart apiforge-frontend

# Show status
echo "✅ Deployment complete!"
pm2 status

echo ""
echo "🌐 Backend: https://ola.apidev.cloud/apiforgeapi/api"
echo "🌐 Frontend: https://ola.apidev.cloud/"
echo ""
echo "📊 View logs:"
echo "  Backend:  pm2 logs apiforge-api"
echo "  Frontend: pm2 logs apiforge-frontend"
