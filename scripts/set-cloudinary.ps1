<#
Interactive helper to set Cloudinary credentials into backend .env file.
Usage:
  # Run and follow prompts
  .\set-cloudinary.ps1

This will:
 - Back up existing backend .env to backend/.env.bak.TIMESTAMP
 - Write CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME (and CLOUDINARY_URL if provided)
 - Not store anything else.
#>

$backendEnvPath = Join-Path -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) -ChildPath '..\backend\.env'
$backendEnvPath = (Resolve-Path $backendEnvPath).ProviderPath

if (-not (Test-Path (Split-Path -Parent $backendEnvPath))) {
    Write-Error "Backend folder not found at expected location: $(Split-Path -Parent $backendEnvPath)"
    exit 1
}

Write-Host "This will store Cloudinary credentials in: $backendEnvPath"
$confirm = Read-Host "Proceed and overwrite/merge .env? (y/N)"
if ($confirm.ToLower() -ne 'y') { Write-Host "Aborted."; exit 0 }

# Backup existing .env if present
if (Test-Path $backendEnvPath) {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $bak = "$backendEnvPath.bak.$timestamp"
    Copy-Item -Path $backendEnvPath -Destination $bak -Force
    Write-Host "Backed up existing .env to: $bak"
}

# Prompt user for credentials
$useUrl = Read-Host "Do you have a CLOUDINARY_URL string (cloudinary://...)? (y/N)"
if ($useUrl.ToLower() -eq 'y') {
    $cloudUrl = Read-Host "Enter CLOUDINARY_URL"
    $envContent = "CLOUDINARY_URL=$cloudUrl`n"
} else {
    $key = Read-Host "Enter CLOUDINARY_API_KEY"
    $secret = Read-Host -AsSecureString "Enter CLOUDINARY_API_SECRET (input hidden)"
    $secretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret))
    $name = Read-Host "Enter CLOUDINARY_CLOUD_NAME"

    $envContent = "CLOUDINARY_API_KEY=$key`nCLOUDINARY_API_SECRET=$secretPlain`nCLOUDINARY_CLOUD_NAME=$name`n"
}

# Optionally preserve existing other vars by merging
$preserve = @{}
if (Test-Path $backendEnvPath) {
    $lines = Get-Content $backendEnvPath | Where-Object { $_ -and ($_ -notmatch '^(#|\s*$)') }
    foreach ($l in $lines) {
        if ($l -match '^(\w+)=(.*)$') {
            $k = $matches[1]; $v = $matches[2]
            # skip cloudinary keys - they will be overwritten
            if ($k -in @('CLOUDINARY_URL','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET','CLOUDINARY_CLOUD_NAME')) { continue }
            $preserve[$k] = $v
        }
    }
}

# Rebuild .env with preserved keys + cloudinary
$outLines = @()
foreach ($k in $preserve.Keys) { $outLines += "$k=$($preserve[$k])" }
$outLines += $envContent -split "`n" | Where-Object { $_ -ne '' }

# Write .env
$outLines | Set-Content -Path $backendEnvPath -Encoding UTF8
Write-Host "Wrote Cloudinary credentials to $backendEnvPath"

# Finish
Write-Host "Done. Restart the backend to pick up the new .env. Example:"
Write-Host "  D:\finance-blog\scripts\restart-backend.ps1 -Port 5000"
