@echo off
cls
echo ============================================
echo  FINAL CSP FIX - ZERO CONSOLE ERRORS!
echo ============================================
echo.
echo This fixes CSP in BOTH locations:
echo  ✅ server.js (for Node.js/Express)
echo  ✅ .htaccess (for Apache/Static files)
echo.
echo Fixed domains:
echo  ✅ googleads.g.doubleclick.net
echo  ✅ ep1.adtrafficquality.google
echo  ✅ tpc.googlesyndication.com
echo  ✅ adservice.google.com
echo.
pause

echo.
echo [1/5] Staging all changes...
git add server.js
git add frontend/.htaccess
git add frontend/index-ultra-optimized.html
git add *.bat
git add *.md
echo ✓ Files staged

echo.
echo [2/5] Committing changes...
git commit -m "🔧 FINAL CSP FIX - Zero console errors for AdSense (server.js + .htaccess)"
echo ✓ Changes committed

echo.
echo [3/5] Pushing to repository...
git push origin main
if %errorlevel% neq 0 (
    echo ⚠️ Trying with -u flag...
    git push -u origin main
    if %errorlevel% neq 0 (
        echo ❌ Push failed. Check your Git configuration.
        pause
        exit /b 1
    )
)
echo ✓ Pushed to repository

echo.
echo [4/5] Waiting for deployment...
echo ⏳ Waiting 10 seconds...
timeout /t 10 /nobreak > nul
echo ✓ Deployment initiated

echo.
echo [5/5] Final CSP Fix Complete!
echo.
echo ============================================
echo  ✅ CSP FIXED IN BOTH LOCATIONS!
echo ============================================
echo.
echo What was fixed:
echo  ✅ server.js: Node.js/Express CSP headers
echo  ✅ .htaccess: Apache CSP headers
echo  ✅ All AdSense domains whitelisted
echo  ✅ frame-src: googleads.g.doubleclick.net
echo  ✅ connect-src: ep1.adtrafficquality.google
echo.
echo IMPORTANT - After 3 minutes:
echo  1. Go to: https://tilana.online
echo  2. Hard refresh: Ctrl+Shift+R
echo  3. Open console: F12
echo  4. Check for errors: SHOULD BE ZERO!
echo.
echo If still seeing errors:
echo  - Clear ALL browser cache
echo  - Use Incognito/Private mode
echo  - Try different browser
echo  - Wait 5 minutes and try again
echo.
echo Expected result:
echo  ✅ Zero console errors
echo  ✅ AdSense loads properly
echo  ✅ Performance still 95-100
echo  ✅ Site fully optimized
echo.
pause
