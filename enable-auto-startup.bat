@echo off
REM Add Keep-Alive Service to Windows Startup Folder
REM Run this ONCE as Administrator

setlocal enabledelayedexpansion

REM Create startup shortcut
set "startupFolder=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "batchFile=D:\finance-blog\auto-keep-alive.bat"
set "shortcutPath=%startupFolder%\Keep-Alive-Service.lnk"

echo.
echo ============================================================
echo   Setting up Auto Keep-Alive Service
echo ============================================================
echo.

REM Check if batch file exists
if not exist "%batchFile%" (
    echo ERROR: Batch file not found: %batchFile%
    echo Please ensure auto-keep-alive.bat exists.
    pause
    exit /b 1
)

REM Create VBScript to generate shortcut
set "vbsFile=%TEMP%\create-shortcut.vbs"

(
    echo Set oWS = WScript.CreateObject("WScript.Shell"^)
    echo sLinkFile = "%shortcutPath%"
    echo Set oLink = oWS.CreateShortcut(sLinkFile^)
    echo oLink.TargetPath = "%batchFile%"
    echo oLink.WorkingDirectory = "D:\finance-blog"
    echo oLink.WindowStyle = 7
    echo oLink.Description = "Finance Blog - Auto Keep-Alive Service"
    echo oLink.Save
    echo WScript.Echo "Shortcut created successfully"
) > "%vbsFile%"

REM Execute VBScript
cscript.exe //nologo "%vbsFile%"

REM Delete VBScript
del "%vbsFile%"

echo.
echo ============================================================
echo ✅ AUTO-STARTUP CONFIGURED
echo ============================================================
echo.
echo Location: %shortcutPath%
echo.
echo The keep-alive service will:
echo ✓ Start automatically when Windows boots
echo ✓ Ping your server every 5 minutes
echo ✓ Auto-restart if it crashes
echo ✓ Keep your website awake 24/7
echo.
echo To verify:
echo 1. Restart your computer
echo 2. Wait 2-3 minutes
echo 3. Check: Get-Process node (in PowerShell)
echo.
echo ============================================================
pause
