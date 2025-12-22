@echo off
cls
echo ============================================
echo   POSTS LOADING FIX - AUTO DIAGNOSTIC
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [STEP 1] Checking Node.js installation...
node --version
echo.

echo [STEP 2] Running diagnostic script...
echo.
node fix-posts-loading.js

echo.
echo ============================================
echo   DIAGNOSTIC COMPLETE
echo ============================================
echo.
echo If issues were found, follow the solutions above.
echo.
echo Quick Actions:
echo   1. To initialize database: npm run init-db
echo   2. To start server: npm start
echo   3. To create posts: Open http://localhost:5000/admin.html
echo.

pause
