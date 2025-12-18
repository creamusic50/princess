@echo off
REM Quick Setup & Performance Optimization Commands for Windows
REM Run this file to deploy the optimized website

echo.
echo ========================================================
echo      Smart Money Guide - Performance Optimization
echo          Deploy Script for Windows
echo ========================================================
echo.

REM Navigate to backend
cd backend

echo [1/3] Pre-compressing static assets (Gzip + Brotli)...
call npm run precompress
if %errorlevel% neq 0 (
    echo ERROR: Pre-compression failed
    pause
    exit /b 1
)
echo [OK] Pre-compression complete
echo.

echo [2/3] Setting up database...
node scripts/migrate.js
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed
    pause
    exit /b 1
)
echo [OK] Database setup complete
echo.

echo [3/3] Starting server...
echo.
echo ========================================================
echo   Server running on http://localhost:5000
echo   Press Ctrl+C to stop
echo ========================================================
echo.

npm start
pause
