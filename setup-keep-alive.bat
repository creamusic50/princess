@echo off
REM ============================================================
REM SETUP: Keep Website Awake 24/7 During Google AdSense Review
REM ============================================================
REM This script sets up automatic keep-alive pinging every 5 minutes
REM Duration: 3 weeks (until you upgrade hosting)
REM ============================================================

echo.
echo ============================================================
echo   24/7 KEEP-ALIVE SETUP FOR GOOGLE ADSENSE REVIEW
echo ============================================================
echo.
echo This will:
echo   1. Create a scheduled task in Windows Task Scheduler
echo   2. Run keep-alive pings every 5 minutes
echo   3. Keep your website awake 24/7
echo   4. Continue even when your computer sleeps
echo.
echo ============================================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Please:
    echo   1. Right-click this file
    echo   2. Select "Run as Administrator"
    echo   3. Click "Yes" when prompted
    echo.
    pause
    exit /b 1
)

echo ✓ Running with Administrator privileges
echo.

REM Get Node.js path
for /f "tokens=*" %%i in ('where node.exe 2^>nul') do set NODE_PATH=%%i

if "%NODE_PATH%"=="" (
    echo ERROR: Node.js is not installed or not in PATH!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✓ Found Node.js at: %NODE_PATH%
echo.

REM Create the scheduled task
echo Creating scheduled task: "Website Keep-Alive Service"
echo.

schtasks /create /tn "Website Keep-Alive Service" /tr "cmd /c cd /d D:\finance-blog && node keep-alive-service.js" /sc onstart /ru SYSTEM /f >nul 2>&1

if %errorLevel% equ 0 (
    echo ✓ Task created successfully!
    echo.
    echo Starting the service...
    echo.
    
    REM Start the task immediately
    schtasks /run /tn "Website Keep-Alive Service" >nul 2>&1
    
    timeout /t 2 /nobreak
    
    echo ✓ Service is now running!
    echo.
    echo ============================================================
    echo   SETUP COMPLETE - YOUR WEBSITE IS NOW ALWAYS AWAKE!
    echo ============================================================
    echo.
    echo Status:
    echo   ✓ Keep-alive service running 24/7
    echo   ✓ Pings website every 5 minutes
    echo   ✓ Survives computer restarts
    echo   ✓ Safe for Google AdSense review
    echo.
    echo How to verify it's working:
    echo   1. Open Task Scheduler (Win+R, type "taskschd.msc")
    echo   2. Find "Website Keep-Alive Service"
    echo   3. Check its status (should be "Running")
    echo.
    echo How to stop it:
    echo   1. Open Command Prompt as Administrator
    echo   2. Run: schtasks /delete /tn "Website Keep-Alive Service" /f
    echo.
    echo Duration: 3 weeks (until you upgrade hosting)
    echo After that: Delete the task and upgrade to paid hosting
    echo.
    echo ============================================================
    echo.
    
) else (
    echo ERROR: Failed to create scheduled task
    echo.
    echo Troubleshooting:
    echo   - Make sure you're running as Administrator
    echo   - Check if task already exists (delete it first)
    echo   - Try running command manually:
    echo     schtasks /create /tn "Website Keep-Alive Service" /tr "cmd /c cd /d D:\finance-blog && node keep-alive-service.js" /sc onstart /ru SYSTEM
    echo.
    pause
    exit /b 1
)

pause
