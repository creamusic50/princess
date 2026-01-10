# Auto-startup script for keep-alive service
# Run this ONCE in PowerShell as Administrator

$TaskName = "Website-KeepAlive-Service"
$TaskPath = "\Smart Money Guide\"
$ScriptPath = "D:\finance-blog\scripts\keep-alive.js"
$WorkingDir = "D:\finance-blog"

# Check if task already exists
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Write-Host "✅ Task already exists. Removing old version..."
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create trigger (At startup)
$Trigger = New-ScheduledTaskTrigger -AtStartup

# Create action (Run Node.js with keep-alive script)
$Action = New-ScheduledTaskAction -Execute "C:\Program Files\nodejs\node.exe" `
    -Argument $ScriptPath `
    -WorkingDirectory $WorkingDir

# Create principal (Run with highest privileges)
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Create task settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1)

# Register the task
Register-ScheduledTask -TaskName $TaskName `
    -TaskPath $TaskPath `
    -Trigger $Trigger `
    -Action $Action `
    -Principal $Principal `
    -Settings $Settings `
    -Description "Keeps tilana.online always awake by pinging every 5 minutes"

Write-Host ""
Write-Host "============================================================"
Write-Host "✅ AUTO-STARTUP TASK CREATED"
Write-Host "============================================================"
Write-Host "Task Name: $TaskName"
Write-Host "Path: $TaskPath"
Write-Host "Script: $ScriptPath"
Write-Host ""
Write-Host "The keep-alive service will:"
Write-Host "✓ Start automatically when Windows starts"
Write-Host "✓ Keep your website awake 24/7"
Write-Host "✓ Auto-restart if it crashes"
Write-Host "✓ Run with highest privileges"
Write-Host ""
Write-Host "To verify it's working:"
Write-Host "1. Restart your computer"
Write-Host "2. Wait 5 minutes"
Write-Host "3. Check: Get-Process node"
Write-Host ""
Write-Host "============================================================"
