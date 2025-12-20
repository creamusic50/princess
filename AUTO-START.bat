@echo off
title Finance Blog - Auto Setup & Start
color 0A

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║          FINANCE BLOG - AUTO SETUP SCRIPT              ║
echo ║                                                        ║
echo ║   This will automatically set up and start your site   ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
timeout /t 2 >nul

:: Check Node.js
echo [Step 1/6] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to: https://nodejs.org
    echo 2. Download the LTS version
    echo 3. Install it
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)
node --version
echo ✅ Node.js is installed
echo.
timeout /t 1 >nul

:: Check npm
echo [Step 2/6] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ❌ ERROR: npm is not installed!
    pause
    exit /b 1
)
npm --version
echo ✅ npm is installed
echo.
timeout /t 1 >nul

:: Check .env file
echo [Step 3/6] Checking .env configuration...
if not exist ".env" (
    color 0E
    echo.
    echo ⚠️  WARNING: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env >nul 2>&1
    echo.
    echo ⚠️  IMPORTANT: Edit .env file and add your DATABASE_URL
    echo.
    echo Steps:
    echo 1. Open .env file in a text editor
    echo 2. Add your Neon database URL to DATABASE_URL
    echo 3. Save the file
    echo 4. Run this script again
    echo.
    notepad .env
    pause
    exit /b 1
)
echo ✅ .env file exists
echo.
timeout /t 1 >nul

:: Install dependencies
echo [Step 4/6] Checking dependencies...
if not exist "node_modules\" (
    echo node_modules not found. Installing dependencies...
    echo This will take 2-5 minutes. Please wait...
    echo.
    call npm install
    if errorlevel 1 (
        color 0C
        echo.
        echo ❌ ERROR: Failed to install dependencies
        echo.
        echo Try these fixes:
        echo 1. Make sure you have internet connection
        echo 2. Try running as Administrator
        echo 3. Run: npm cache clean --force
        echo 4. Delete node_modules and try again
        echo.
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)
echo.
timeout /t 1 >nul

:: Test database connection
echo [Step 5/6] Testing database connection...
node -e "require('dotenv').config(); const {pool} = require('./config/database'); pool.query('SELECT NOW()').then(r => { console.log('✅ Database connected successfully'); process.exit(0); }).catch(e => { console.error('❌ Database connection failed:', e.message); process.exit(1); });" 2>nul
if errorlevel 1 (
    color 0E
    echo.
    echo ⚠️  WARNING: Database connection failed
    echo.
    echo This might be okay if:
    echo - You haven't set up the database yet
    echo - Your DATABASE_URL is not configured
    echo.
    echo To fix:
    echo 1. Go to https://console.neon.tech
    echo 2. Create a project (free)
    echo 3. Copy the connection string
    echo 4. Paste it in .env as DATABASE_URL
    echo 5. Run database-setup.sql in Neon SQL Editor
    echo.
    echo Press any key to continue anyway, or Ctrl+C to stop...
    pause >nul
)
echo.
timeout /t 1 >nul

:: Start server
echo [Step 6/6] Starting server...
echo.
color 0A
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║                   SERVER STARTING                      ║
echo ║                                                        ║
echo ║   Your site will be available at:                     ║
echo ║   http://localhost:5000                                ║
echo ║                                                        ║
echo ║   Press Ctrl+C to stop the server                     ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
timeout /t 2 >nul

echo Starting in 3...
timeout /t 1 >nul
echo Starting in 2...
timeout /t 1 >nul
echo Starting in 1...
timeout /t 1 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo.

:: Start the server
node server.js

:: If server stops
echo.
echo Server stopped.
echo.
pause
