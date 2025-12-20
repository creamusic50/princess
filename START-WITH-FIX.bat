@echo off
echo ========================================
echo 🔧 COMPLETE ADSENSE FIX + SERVER START
echo ========================================
echo.

cd /d D:\finance-blog

echo 📋 Fixes Applied:
echo   ✅ Added script-src-attr 'unsafe-inline' (for inline event handlers)
echo   ✅ Added ep2.adtrafficquality.google (SODAR endpoint 2)
echo   ✅ Added *.adtrafficquality.google wildcard to script-src-elem
echo.

echo 🛑 Stopping any running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Starting server...
echo.

start "Finance Blog Server" cmd /k "node server.js"

timeout /t 3 /nobreak >nul

echo ========================================
echo ✅ SERVER STARTED!
echo ========================================
echo.
echo 🌐 Your site is running at:
echo    👉 http://localhost:5000
echo.
echo 📝 Next Steps:
echo   1. Open http://localhost:5000 in browser
echo   2. Press F12 to open DevTools
echo   3. Check Console tab - should see NO errors
echo   4. Check if AdSense loads properly
echo.
echo 🔍 What was fixed:
echo   - Connection errors (server now running)
echo   - CSP script-src-attr violation
echo   - ep2.adtrafficquality.google blocked
echo.
echo 💡 If you want to push to GitHub:
echo    Run: PUSH-CSP-FIX.bat
echo.
pause
