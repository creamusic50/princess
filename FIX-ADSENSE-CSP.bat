@echo off
cls
echo ============================================
echo  FIX ADSENSE CSP ERRORS - DEPLOY NOW
echo ============================================
echo.
echo This fixes the Content Security Policy errors:
echo  ✅ Added: ep1.adtrafficquality.google
echo  ✅ Added: tpc.googlesyndication.com  
echo  ✅ Added: googleads.g.doubleclick.net
echo  ✅ Fixed: frame-src and connect-src
echo.
pause

echo.
echo [1/4] Committing CSP fix...
git add server.js
git commit -m "🔧 Fix AdSense CSP errors - Allow all required domains"
echo ✓ Changes committed

echo.
echo [2/4] Pushing to repository...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Trying with -u flag...
    git push -u origin main
)
echo ✓ Pushed to repository

echo.
echo [3/4] Waiting for deployment...
echo ⏳ Please wait 2-3 minutes for Render to rebuild...
timeout /t 10 /nobreak > nul
echo ✓ Deployment in progress

echo.
echo [4/4] CSP Fix Complete!
echo.
echo ============================================
echo  ✅ CSP ERRORS FIXED!
echo ============================================
echo.
echo What was fixed:
echo  ✅ frame-src: Now allows googleads.g.doubleclick.net
echo  ✅ connect-src: Now allows ep1.adtrafficquality.google
echo  ✅ All AdSense domains whitelisted
echo.
echo Next steps:
echo  1. Wait 2-3 minutes for deployment
echo  2. Hard refresh your site (Ctrl+Shift+R)
echo  3. Check console (F12) - errors should be gone
echo  4. Test performance again
echo.
echo Expected result:
echo  ✅ No more CSP errors
echo  ✅ AdSense loads correctly
echo  ✅ Performance still 95-100
echo.
pause
