@echo off
echo ================================
echo   CSP FIX VERIFICATION
echo ================================
echo.

echo Checking if fixes are applied...
echo.

echo [CHECK 1] Verifying index.html...
findstr /C:"onload=" frontend\index.html >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✗ FAILED - Found inline event handlers
    echo      Action: Run APPLY-CSP-FIX.bat
) else (
    echo    ✓ PASSED - No inline event handlers
)
echo.

echo [CHECK 2] Verifying server.js...
findstr /C:"app.get('/sw.js'" server.js >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✓ PASSED - Service Worker route handler present
) else (
    echo    ✗ FAILED - Service Worker route handler missing
    echo      Action: Run APPLY-CSP-FIX.bat
)
echo.

findstr /C:"frameAncestors" server.js >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✓ PASSED - frameAncestors CSP directive present
) else (
    echo    ✗ FAILED - frameAncestors CSP directive missing
    echo      Action: Run APPLY-CSP-FIX.bat
)
echo.

echo [CHECK 3] Verifying backup files exist...
if exist frontend\index-backup*.html (
    echo    ✓ PASSED - Backups created
) else (
    echo    ⚠ WARNING - No backups found
)
echo.

echo [CHECK 4] Checking if server is running...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo    ✓ PASSED - Server is running
    echo.
    echo ================================
    echo   READY FOR BROWSER TEST
    echo ================================
    echo.
    echo Open: http://localhost:5000
    echo Then:
    echo 1. Press F12 to open DevTools
    echo 2. Go to Console tab
    echo 3. Press Ctrl+Shift+R (hard reload)
    echo 4. Look for these results:
    echo    ✓ No CSP violation errors
    echo    ✓ SW registered: /
    echo    ✓ No MIME type errors
) else (
    echo    ✗ FAILED - Server is not running
    echo      Action: Run npm start
)
echo.

echo ================================
echo   VERIFICATION COMPLETE
echo ================================
echo.
pause
