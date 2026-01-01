@echo off
color 0A
echo ========================================
echo    ENHANCED ADMIN DASHBOARD SETUP
echo ========================================
echo.
echo Step 1: Installing axios for IP geolocation...
call npm install axios
echo.
echo ========================================
echo Step 2: Checking if server is running...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Server is already running!
    echo Please restart it to apply changes.
) else (
    echo Starting server...
    start "Finance Blog Server" cmd /k "npm start"
)
echo.
echo ========================================
echo     SETUP COMPLETE! 
echo ========================================
echo.
echo Your new admin dashboard features:
echo  [*] Visitor country and city tracking
echo  [*] Enhanced analytics with charts
echo  [*] Traffic sources analysis
echo  [*] Popular pages tracking
echo  [*] Settings page
echo.
echo Access your dashboard at:
echo  http://localhost:5000/admin.html
echo.
echo Read ADMIN-DASHBOARD-GUIDE.md for details
echo.
pause
