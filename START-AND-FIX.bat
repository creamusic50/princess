@echo off
echo ================================================
echo   COMPLETE FIX FOR POSTS NOT LOADING
echo ================================================
echo.

echo [1/5] Installing/Checking Dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [2/5] Initializing Database...
call npm run init-db
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database initialization had issues
    echo This might be normal if database is already initialized
)
echo.

echo [3/5] Running Diagnostic...
node fix-posts-loading.js
echo.

echo [4/5] Starting Server...
echo.
echo ================================================
echo   SERVER STARTING
echo ================================================
echo.
echo Visit: http://localhost:5000
echo Admin: http://localhost:5000/admin.html
echo.
echo Default Admin Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo If no posts appear:
echo   1. Open http://localhost:5000/admin.html
echo   2. Login with credentials above
echo   3. Create and PUBLISH a new post
echo   4. Refresh homepage
echo.
echo Press CTRL+C to stop the server
echo ================================================
echo.

node server.js
