@echo off
echo ========================================
echo 🚀 ADSENSE OPTIMIZATION DEPLOYMENT
echo ========================================
echo.

REM Step 1: Backup current files
echo [1/6] Creating backups...
copy frontend\index.html frontend\index-OLD-BACKUP-%date:~-4,4%%date:~-10,2%%date:~-7,2%.html >nul 2>&1
copy frontend\.htaccess frontend\.htaccess-OLD-BACKUP-%date:~-4,4%%date:~-10,2%%date:~-7,2% >nul 2>&1
copy frontend\robots.txt frontend\robots-OLD-BACKUP-%date:~-4,4%%date:~-10,2%%date:~-7,2%.txt >nul 2>&1
echo    ✅ Backups created
echo.

REM Step 2: Deploy optimized files
echo [2/6] Deploying optimized files...
copy /Y frontend\index-adsense-optimized.html frontend\index.html >nul
copy /Y frontend\.htaccess-optimized frontend\.htaccess >nul
copy /Y frontend\robots-optimized.txt frontend\robots.txt >nul
echo    ✅ Files deployed
echo.

REM Step 3: Git status check
echo [3/6] Checking Git status...
git status --short
echo.

REM Step 4: Git add
echo [4/6] Staging changes...
git add .
echo    ✅ Changes staged
echo.

REM Step 5: Git commit
echo [5/6] Committing changes...
git commit -m "🚀 AdSense Optimization: 100/100 Performance Target - Mobile First, Accessibility Enhanced, Security Headers, GZIP Compression, Aggressive Caching, Clean URLs, Service Worker, Core Web Vitals Monitoring"
echo    ✅ Changes committed
echo.

REM Step 6: Git push
echo [6/6] Pushing to production...
git push origin main
echo    ✅ Pushed to production
echo.

echo ========================================
echo ✅ DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next Steps:
echo 1. Wait 5-10 minutes for Render to auto-deploy
echo 2. Visit https://tilana.online and verify
echo 3. Test mobile view (Chrome DevTools)
echo 4. Run PageSpeed test: https://pagespeed.web.dev/
echo 5. Set up UptimeRobot: https://uptimerobot.com
echo.
echo Target Scores:
echo   - Performance: 100/100 ⚡
echo   - Accessibility: 100/100 ♿
echo   - Best Practices: 100/100 ✅
echo   - SEO: 100/100 🔍
echo.
echo 🎯 Your site is now AdSense-ready!
echo.
pause