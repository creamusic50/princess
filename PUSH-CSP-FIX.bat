@echo off
echo ========================================
echo 📤 PUSHING CSP FIX TO GITHUB
echo ========================================
echo.

cd /d D:\finance-blog

echo 📋 Checking git status...
git status
echo.

echo 📝 Adding changes...
git add server.js
git add FIX-CSP-ADSENSE.bat
git add CSP-FIX-COMPLETE.md
echo.

echo 💾 Committing changes...
git commit -m "Fix AdSense CSP violations - Add missing DoubleClick and SODAR domains"
echo.

echo 🚀 Pushing to GitHub...
git push origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo ✅ SUCCESSFULLY PUSHED TO GITHUB!
    echo ========================================
    echo.
    echo 🎯 Next Steps:
    echo   1. Render.com will auto-deploy in ~2-3 minutes
    echo   2. Check deployment at: https://dashboard.render.com
    echo   3. Once deployed, test your site
    echo   4. CSP errors should be GONE!
    echo.
) else (
    echo ========================================
    echo ❌ PUSH FAILED!
    echo ========================================
    echo.
    echo 🔍 Possible issues:
    echo   - Not logged into Git
    echo   - No internet connection
    echo   - Branch conflicts
    echo.
    echo 💡 Try manual push:
    echo   git push origin main
    echo.
)

pause
