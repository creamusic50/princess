#!/bin/bash
# Quick Setup & Performance Optimization Commands
# Run these commands to deploy the optimized website

echo "🚀 Smart Money Guide - Performance Optimization Deploy Script"
echo "=============================================================="
echo ""

# Navigate to backend
cd backend

echo "📦 Step 1: Pre-compress all static assets (Gzip + Brotli)..."
npm run precompress
echo "✅ Pre-compression complete"
echo ""

echo "📋 Step 2: Set up database..."
node scripts/migrate.js
echo "✅ Database setup complete"
echo ""

echo "🚀 Step 3: Starting server..."
echo "   Server will run on http://localhost:5000"
echo "   Press Ctrl+C to stop"
echo ""

npm start

