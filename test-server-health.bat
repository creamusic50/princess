@echo off
REM Test Keep-Alive and Server Health
REM Verifies that everything is working correctly

echo.
echo ============================================================
echo  ^^ Website Health Check Test
echo ============================================================
echo.

REM Test 1: Check if server is running
echo [1/4] Checking if server is running...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000' -TimeoutSec 5; Write-Host '✅ Server is running - Status: ' $response.StatusCode } catch { Write-Host '❌ Server is not running or unreachable' }"
echo.

REM Test 2: Check health endpoint
echo [2/4] Checking health endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 5; $data = $response.Content | ConvertFrom-Json; Write-Host '✅ Health endpoint working'; Write-Host '   Status: ' $data.status; Write-Host '   Uptime: ' $data.uptime ' seconds' } catch { Write-Host '❌ Health endpoint failed' }"
echo.

REM Test 3: Check posts API
echo [3/4] Checking posts API...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/posts?limit=1' -TimeoutSec 5; Write-Host '✅ Posts API working - Status: ' $response.StatusCode } catch { Write-Host '❌ Posts API failed' }"
echo.

REM Test 4: Check auth endpoint
echo [4/4] Checking auth endpoint connectivity...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/me' -TimeoutSec 5; Write-Host '⚠️  Auth endpoint responding (expected 401 without token)' } catch { Write-Host '✅ Auth endpoint accessible' }"
echo.

echo ============================================================
echo  ^^ Test Complete
echo ============================================================
echo.
echo Summary:
echo - If all tests passed: Server is healthy and ready! ✅
echo - If server test failed: Start your server first (npm start)
echo - If other tests failed: Check network/API configuration
echo.
echo Next step: Run keep-alive script
echo   powershell .\keep-alive.ps1
echo.
pause
