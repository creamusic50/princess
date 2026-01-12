@echo off
REM Auto Keep-Alive Service for Finance Blog
REM This batch file automatically starts the keep-alive service on Windows startup

REM Navigate to project root
cd /d D:\finance-blog

REM Start Node.js keep-alive service
echo.
echo ============================================================
echo   Finance Blog - Auto Keep-Alive Service
echo ============================================================
echo   Starting: D:\finance-blog\scripts\keep-alive.js
echo   Time: %date% %time%
echo ============================================================
echo.

REM Start the keep-alive service (stays running)
node scripts/keep-alive.js

REM If it exits, restart after 10 seconds
:restart
echo Keep-Alive service exited. Restarting in 10 seconds...
timeout /t 10 /nobreak
goto restart
