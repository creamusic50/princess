@echo off
echo ================================================================
echo      FINANCE BLOG - SYSTEM VALIDATION CHECK
echo ================================================================
echo.

echo [1/5] Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo [2/5] Checking if dependencies are installed...
if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo Please run: npm install
    pause
    exit /b 1
)
echo ✓ Dependencies are installed
echo.

echo [3/5] Checking environment variables...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file from .env.example
    pause
    exit /b 1
)
echo ✓ Environment file exists
echo.

echo [4/5] Checking database configuration...
node -e "require('dotenv').config(); if(!process.env.DATABASE_URL){console.error('ERROR: DATABASE_URL not set'); process.exit(1);} else {console.log('✓ Database URL configured');}" || (pause & exit /b 1)
echo.

echo [5/5] Testing database connection...
echo Please wait...
node -e "require('dotenv').config(); const {pool} = require('./config/database'); pool.connect((err) => { if(err) { console.error('ERROR: Cannot connect to database'); console.error(err.message); process.exit(1); } else { console.log('✓ Database connection successful'); pool.end(); process.exit(0); } });" || (
    echo.
    echo ERROR: Database connection failed!
    echo Please check your DATABASE_URL in .env file
    pause
    exit /b 1
)
echo.

echo ================================================================
echo                  VALIDATION COMPLETE
echo ================================================================
echo.
echo ✓ All system checks passed!
echo ✓ Backend is ready to run
echo.
echo To start the server, run: npm start
echo To test CRUD operations, run: node TEST-CRUD-OPERATIONS.js
echo.
echo ================================================================
pause
