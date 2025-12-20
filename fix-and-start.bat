@echo off
echo ==========================================
echo FINANCE BLOG - DIAGNOSTIC AND FIX SCRIPT
echo ==========================================
echo.

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
node --version
echo OK: Node.js is installed
echo.

echo [2/5] Checking if node_modules exists...
if exist "node_modules\" (
    echo OK: node_modules folder exists
) else (
    echo WARNING: node_modules not found
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)
echo.

echo [3/5] Checking .env file...
if exist ".env" (
    echo OK: .env file exists
) else (
    echo ERROR: .env file not found!
    echo Please create .env file from .env.example
    pause
    exit /b 1
)
echo.

echo [4/5] Testing database connection...
node -e "const {pool} = require('./config/database'); pool.query('SELECT NOW()').then(r => console.log('OK: Database connected')).catch(e => {console.error('ERROR: Database connection failed:', e.message); process.exit(1)});"
if errorlevel 1 (
    echo.
    echo Database connection failed. Please check:
    echo - Your DATABASE_URL in .env file
    echo - Your internet connection
    echo - Neon database is accessible
    pause
    exit /b 1
)
echo.

echo [5/5] Starting server...
echo.
echo ==========================================
echo Server will start on http://localhost:5000
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

node server.js
