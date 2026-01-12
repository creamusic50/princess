@echo off
REM ============================================================
REM INSTALL BACKGROUND KEEP-ALIVE SERVICE
REM This will run automatically on computer startup
REM No performance impact - completely local
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  INSTALLING BACKGROUND KEEP-ALIVE SERVICE                ║
echo ║  (Will run automatically 24/7)                           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Steps:
    echo   1. Right-click this file
    echo   2. Select "Run as Administrator"
    echo   3. Click "Yes"
    echo.
    pause
    exit /b 1
)

echo ✓ Running with Administrator privileges
echo.

REM Delete existing task if it exists
echo Removing any existing keep-alive tasks...
schtasks /delete /tn "Website Keep-Alive Service" /f >nul 2>&1

REM Create the new task - simpler version
echo Creating new task...
schtasks /create /tn "Website Keep-Alive Service" ^
    /tr "node D:\finance-blog\keep-alive-local.js" ^
    /sc onstart ^
    /ru SYSTEM ^
    /f >nul 2>&1

if %errorLevel% equ 0 (
    echo ✓ Task created successfully!
    echo.
    echo Starting service...
    schtasks /run /tn "Website Keep-Alive Service" >nul 2>&1
    
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║  ✓ INSTALLATION COMPLETE                                 ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Your website will now stay awake 24/7!
    echo.
    echo Details:
    echo   ✓ Service: Website Keep-Alive Service
    echo   ✓ Status: Running (started automatically)
    echo   ✓ Interval: Pings every 5 minutes
    echo   ✓ Performance Impact: NONE (local only)
    echo.
    echo How to verify:
    echo   1. Open Task Scheduler (Win+R, type "taskschd.msc")
    echo   2. Find "Website Keep-Alive Service"
    echo   3. Right-click → Run to manually start anytime
    echo.
    echo How to stop/uninstall:
    echo   1. Open Command Prompt as Administrator
    echo   2. Run: schtasks /delete /tn "Website Keep-Alive Service" /f
    echo.
    echo Log file location:
    echo   D:\finance-blog\keep-alive.log
    echo   (Check this file to verify service is working)
    echo.
    echo Duration: 3 weeks (until you upgrade hosting)
    echo After that: Delete the task, upgrade hosting ($7/month)
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║  YOUR WEBSITE IS NOW PROTECTED 24/7! 🚀                   ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    
) else (
    echo ERROR: Failed to create scheduled task
    echo.
    echo Troubleshooting:
    echo   1. Make sure you're running as Administrator
    echo   2. Try manual method:
    echo      a. Open Task Scheduler (Win+R, type "taskschd.msc")
    echo      b. Create Basic Task
    echo      c. Name: "Website Keep-Alive Service"
    echo      d. Trigger: At startup
    echo      e. Action: Start program
    echo      f. Program: node
    echo      g. Arguments: D:\finance-blog\keep-alive-local.js
    echo.
    pause
    exit /b 1
)

pause
