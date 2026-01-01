@echo off
echo ================================
echo   CSP ERRORS FIX DEPLOYMENT
echo ================================
echo.

echo [1/5] Creating backups...
if exist frontend\index.html (
    copy /Y frontend\index.html frontend\index-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%.html
    echo    ✓ Backed up index.html
)
if exist server.js (
    copy /Y server.js server-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%.js
    echo    ✓ Backed up server.js
)
echo.

echo [2/5] Applying fixes...
if exist frontend\index-fixed.html (
    copy /Y frontend\index-fixed.html frontend\index.html
    echo    ✓ Applied index.html fix
) else (
    echo    ✗ index-fixed.html not found!
    pause
    exit /b 1
)

if exist server-fixed.js (
    copy /Y server-fixed.js server.js
    echo    ✓ Applied server.js fix
) else (
    echo    ✗ server-fixed.js not found!
    pause
    exit /b 1
)
echo.

echo [3/5] Stopping any running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo    ✓ Cleared node processes
echo.

echo [4/5] Starting server with fixes...
start "Finance Blog Server" cmd /k "npm start"
echo    ✓ Server starting...
echo.

echo [5/5] Waiting for server to start...
timeout /t 3 /nobreak >nul
echo.

echo ================================
echo   DEPLOYMENT COMPLETE!
echo ================================
echo.
echo Server running at: http://localhost:5000
echo.
echo VERIFICATION STEPS:
echo 1. Open: http://localhost:5000
echo 2. Press F12 (DevTools)
echo 3. Check Console tab
echo 4. Hard reload: Ctrl+Shift+R
echo.
echo Expected Results:
echo  ✓ No CSP violations
echo  ✓ Service Worker registered
echo  ✓ No MIME type errors
echo  ✓ No frame-ancestors warnings
echo.
echo If you see errors, check:
echo  - frontend/index.html (should be fixed version)
echo  - server.js (should be fixed version)
echo  - Clear browser cache completely
echo.
pause
