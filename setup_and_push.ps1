Param(
    [string]$Email = ""
)

function Write-Err($m){ Write-Host "ERROR: $m" -ForegroundColor Red }
function Write-OK($m){ Write-Host "$m" -ForegroundColor Green }

$repoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoDir

Write-Host "Working in: $repoDir"

# 1) Show remotes and branch
git remote -v
git branch --show-current

$keyPath = "$env:USERPROFILE\.ssh\id_ed25519"
$pubPath = "$keyPath.pub"

if (-not (Test-Path $pubPath)) {
    if (-not $Email) {
        $Email = Read-Host "Enter your email for the SSH key (e.g. you@example.com)"
    }
    Write-Host "No ed25519 key found — generating a new SSH key at $keyPath"
    ssh-keygen -t ed25519 -C $Email -f $keyPath -N "" -q
    if ($LASTEXITCODE -ne 0) { Write-Err "ssh-keygen failed"; exit 1 }
    Write-OK "SSH key generated"
} else {
    Write-OK "Found existing SSH public key: $pubPath"
}

# 2) Start ssh-agent service (may require admin) and add the key
Write-Host "Starting ssh-agent service (may require admin)"
try {
    Start-Service ssh-agent -ErrorAction Stop
    Set-Service -Name ssh-agent -StartupType Automatic -ErrorAction SilentlyContinue
    Write-OK "ssh-agent service started"
} catch {
    Write-Host "Could not start ssh-agent service (permission issue?). Trying to continue..."
}

Write-Host "Adding private key to ssh-agent"
ssh-add $keyPath

# 3) Copy public key to clipboard and open GitHub SSH key page
try {
    if (Get-Command Set-Clipboard -ErrorAction SilentlyContinue) {
        Get-Content $pubPath | Set-Clipboard
    } else {
        Get-Content $pubPath | clip
    }
    Write-OK "Public key copied to clipboard"
} catch {
    Write-Err "Failed to copy to clipboard. Public key is at: $pubPath"
}

Write-Host "Opening GitHub SSH keys page in your browser. Please add the key (it is on your clipboard)."
Start-Process "https://github.com/settings/keys"

Read-Host "Press Enter after you've added the SSH key to GitHub (or Ctrl+C to abort)"

# 4) Test SSH auth
Write-Host "Testing SSH authentication to GitHub..."
ssh -T git@github.com 2>&1 | Write-Host

# 5) Switch remote to SSH and push
$sshUrl = "git@github.com:creamusic50/princess.git"
Write-Host "Setting origin to $sshUrl"
git remote set-url origin $sshUrl
git remote -v

Write-Host "Attempting git push (verbose)..."
$push = git push origin HEAD --verbose 2>&1 | Tee-Object -Variable pushOut
if ($LASTEXITCODE -eq 0) {
    Write-OK "Push successful"
    exit 0
} else {
    Write-Err "Push failed. Showing verbose output below:"
    $pushOut
    Write-Host "Attempting fallback with curl tracing for HTTPS (will not change remote)"
    $env:GIT_CURL_VERBOSE = "1"
    $env:GIT_TRACE = "1"
    git push origin HEAD --verbose 2>&1 | Write-Host
    exit 1
}
