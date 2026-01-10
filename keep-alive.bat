@echo off
REM Keep-Alive Service for Finance Blog
REM Pings the server every 5 minutes to keep it awake

setlocal enabledelayedexpansion

set WEBSITE_URL=http://localhost:5000/api/health
set PING_INTERVAL=300000
set /a PING_SECONDS=%PING_INTERVAL% / 1000

echo.
echo ============================================================
echo  ^> Website Keep-Alive Service Started
echo ============================================================
echo  URL: %WEBSITE_URL%
echo  Interval: %PING_SECONDS% seconds (5 minutes)
echo  Time: %date% %time%
echo ============================================================
echo.

:loop
REM Ping the server using curl or powershell
powershell -Command "try { $response = Invoke-WebRequest -Uri '%WEBSITE_URL%' -TimeoutSec 10; Write-Host '[' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') '] Ping successful - Status: ' $response.StatusCode } catch { Write-Host '[' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') '] Ping failed: ' $_.Exception.Message }"

REM Wait 5 minutes (300 seconds)
timeout /t %PING_SECONDS% /nobreak

goto loop
