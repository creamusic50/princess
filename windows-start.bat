@echo off
echo ========================================
echo 🚀 Smart Money Guide - Windows 10 Setup
echo ========================================
echo.

echo 1. Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 2. Creating database tables...
node scripts/migrate.js
if errorlevel 1 (
    echo ❌ Failed to create database tables
    pause
    exit /b 1
)

echo.
echo 3. Starting server...
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000
echo 👤 Admin Login: admin@smartmoneyguide.com
echo 🔑 Admin Password: Admin123!
echo.
echo Press Ctrl+C to stop
echo.
node server.js
pause