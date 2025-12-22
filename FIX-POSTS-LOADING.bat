@echo off
echo ========================================
echo    FIXING POSTS LOADING ISSUE
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
echo.

echo Step 2: Initializing database...
call npm run init-db
echo.

echo Step 3: Starting server...
echo.
echo Your blog should now be running!
echo Visit: http://localhost:5000
echo Admin: http://localhost:5000/admin.html
echo.
call npm start
