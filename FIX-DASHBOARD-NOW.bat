@echo off
color 0A
echo ========================================
echo    FIXING ADMIN DASHBOARD NOW
echo ========================================
echo.
echo Step 1: Installing axios...
call npm install axios
echo.
echo Step 2: Killing any running node processes...
taskkill /F /IM node.exe 2>NUL
timeout /t 2 >nul
echo.
echo Step 3: Starting fresh server...
start "Finance Blog Server" cmd /k "npm start"
echo.
echo ========================================
echo   DONE! Now do this:
echo ========================================
echo.
echo 1. Go to: http://localhost:5000/admin.html
echo 2. Press: Ctrl + Shift + R (hard refresh)
echo 3. You should see the NEW dashboard!
echo.
echo If you still see old dashboard:
echo - Press Ctrl + Shift + Delete
echo - Clear browsing data (cache)
echo - Try again
echo.
pause
