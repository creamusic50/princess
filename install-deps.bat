@echo off
echo Installing dependencies...
echo This will take a few minutes...
echo.

npm install

if errorlevel 1 (
    echo.
    echo ERROR: Installation failed!
    echo.
    echo Common fixes:
    echo 1. Make sure you have internet connection
    echo 2. Try running as Administrator
    echo 3. Delete node_modules folder and try again
    echo 4. Clear npm cache: npm cache clean --force
    pause
    exit /b 1
)

echo.
echo ==========================================
echo SUCCESS! All dependencies installed
echo ==========================================
echo.
echo Now run: fix-and-start.bat
echo.
pause
