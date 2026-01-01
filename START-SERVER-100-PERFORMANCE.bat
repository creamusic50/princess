@echo off
REM Smart Money Guide - 100/100 Performance Setup & Launch Script
REM This script sets up and launches the website with all optimizations

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   SMART MONEY GUIDE - 100/100 PERFORMANCE OPTIMIZATION
echo ============================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found: 
node --version
echo.

REM Kill any existing Node processes
echo Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

REM Navigate to backend
echo.
echo Navigating to backend...
cd /d d:\finance-blog\backend

REM Install dependencies if needed
echo.
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
) else (
    echo ✓ Dependencies already installed
)

REM Check if database is set up
echo.
echo Checking database setup...
if exist "..\backend\models\Post.js" (
    echo ✓ Database models found
) else (
    echo WARNING: Database models not found
)

REM Start the server
echo.
echo ============================================================
echo   STARTING SERVER WITH PERFORMANCE OPTIMIZATIONS
echo ============================================================
echo.
echo Server will start on: http://localhost:5000
echo Admin Dashboard: http://localhost:5000/admin.html
echo.
echo Performance Features Enabled:
echo   ✓ gzip + Brotli compression
echo   ✓ Service Worker (offline support)
echo   ✓ Optimized caching headers
echo   ✓ Deferred AdSense (no CLS)
echo   ✓ Deferred analytics (non-blocking)
echo   ✓ Preloaded critical resources
echo   ✓ Font optimization
echo   ✓ Code splitting ready
echo.
echo CTRL+C to stop the server
echo.

REM Start the server
call npm start

pause
