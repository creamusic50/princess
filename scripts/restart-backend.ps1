<#
Usage examples:
# Run with no Cloudinary vars (kills process on port 5000, starts server on 5000):
#   .\restart-backend.ps1
# Run and pass Cloudinary vars and start on a different port:
#   .\restart-backend.ps1 -CloudinaryKey "k" -CloudinarySecret "s" -CloudinaryName "c" -Port 5001
#
# The script will try to stop any process listening on the requested port, then start the backend
# in a new PowerShell window with the given environment variables set.
#>
param(
    [string]$BackendDir = "D:\finance-blog\backend",
    [string]$Port = "5000",
    [string]$CloudinaryKey = $null,
    [string]$CloudinarySecret = $null,
    [string]$CloudinaryName = $null
)

function Stop-ProcessesOnPort {
    param([string]$p)
    Write-Host "Checking for processes listening on port $p..."
    try {
        $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction Stop
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    } catch {
        Write-Verbose "Get-NetTCPConnection failed or not available, falling back to netstat parsing"
        $lines = (& netstat -ano | findstr ":$p") -split "\r?\n" | Where-Object { $_ -match '\bLISTENING\b' }
        $pids = @()
        foreach ($ln in $lines) {
            $parts = $ln -split '\s+' | Where-Object { $_ -ne '' }
            if ($parts.Length -ge 5) { $pid = $parts[-1]; if ($pid -match '^\d+$') { $pids += [int]$pid } }
        }
        $pids = $pids | Select-Object -Unique
    }

    if (-not $pids -or $pids.Count -eq 0) {
        Write-Host "No process found listening on port $p"
        return
    }

    foreach ($pid in $pids) {
        try {
            Write-Host "Stopping PID $pid..."
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "Stopped PID $pid"
        } catch {
            # Use formatted string to avoid variable interpolation issues with '$_' inside double quotes
            Write-Warning ("Failed to stop PID {0}: {1}" -f $pid, $_)
        }
    }
}

# Stop processes on the requested port
Stop-ProcessesOnPort -p $Port

# Build command to run in a new PowerShell window
$psCmdParts = @()
$psCmdParts += "Set-Location -Path '$BackendDir'"
$psCmdParts += "`$env:PORT='$Port'"
if ($CloudinaryKey)  { $psCmdParts += "`$env:CLOUDINARY_API_KEY='$CloudinaryKey'" }
if ($CloudinarySecret) { $psCmdParts += "`$env:CLOUDINARY_API_SECRET='$CloudinarySecret'" }
if ($CloudinaryName) { $psCmdParts += "`$env:CLOUDINARY_CLOUD_NAME='$CloudinaryName'" }
$psCmdParts += "npm start"

$psCmd = $psCmdParts -join "; "

Write-Host "Starting backend in new PowerShell window (working dir: $BackendDir)"
Write-Host "Command: $psCmd"

# Start new PowerShell and run the command (keep the window open)
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit","-Command","$psCmd"

Write-Host "Done. A new PowerShell window was launched to run the backend.\nCheck that the server logs indicate successful start or any errors."