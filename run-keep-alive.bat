@echo off
REM ============================================================
REM LOCAL KEEP-ALIVE SERVICE - RUN FROM COMMAND PROMPT
REM ============================================================
REM This keeps your website awake for Google AdSense review
REM No external services = No performance impact
REM ============================================================

title Keep Website Awake - Smart Money Guide (Close window to stop)
color 0A

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║  🚀 LOCAL KEEP-ALIVE SERVICE STARTING                     ║
echo ║                                                            ║
echo ║  Website: https://www.tilana.online/                      ║
echo ║  Duration: 3 weeks (until you upgrade hosting)            ║
echo ║  Performance Impact: NONE ✓ (local pings only)            ║
echo ║                                                            ║
echo ║  How it works:                                            ║
echo ║  - Pings your website every 5 minutes                     ║
echo ║  - Runs on your computer (not external service)           ║
echo ║  - Keeps site awake during AdSense review                 ║
echo ║  - No performance degradation                             ║
echo ║                                                            ║
echo ║  To stop: Close this window (Ctrl+C)                      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Starting service...
echo.

REM Check if Node.js is installed
where node.exe >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Run the keep-alive service
cd /d D:\finance-blog
node keep-alive-local.js

REM If we get here, user closed the window
echo.
echo ✓ Keep-Alive service stopped
echo.
pause
