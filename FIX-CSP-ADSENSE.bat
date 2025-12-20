@echo off
echo ========================================
echo 🔧 FIXING ADSENSE CSP ERRORS
echo ========================================
echo.

echo 📋 Changes Made:
echo   ✅ Added *.adtrafficquality.google to connect-src
echo   ✅ Added securepubads.g.doubleclick.net to connect-src
echo   ✅ Added partner.googleadservices.com to connect-src  
echo   ✅ Added td.doubleclick.net to frame-src
echo   ✅ Added securepubads.g.doubleclick.net to frame-src
echo.

echo 🔄 Restarting server...
echo.

REM Kill existing Node processes
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🚀 Starting server with fixed CSP...
start "Finance Blog Server" cmd /k "cd /d D:\finance-blog && node server.js"

timeout /t 3 /nobreak >nul
echo.
echo ========================================
echo ✅ SERVER RESTARTED WITH FIXED CSP
echo ========================================
echo.
echo 📝 Next Steps:
echo   1. Open your site in browser
echo   2. Open DevTools (F12) and check Console
echo   3. CSP errors should be GONE
echo   4. AdSense should load properly
echo.
echo 🔍 If you still see errors:
echo   - Clear browser cache (Ctrl+Shift+Del)
echo   - Hard reload (Ctrl+F5)
echo   - Check if ads appear on page
echo.
pause
