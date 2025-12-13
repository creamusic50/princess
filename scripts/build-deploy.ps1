<#
scripts\build-deploy.ps1
Usage: run from repository root (PowerShell)
  Open PowerShell and run as a normal user or CI runner:
    Set-Location D:\finance-blog
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
    .\scripts\build-deploy.ps1

What it does:
- Ensures Node is available
- Installs backend deps
- If frontend has a build step, runs it
- Copies `frontend` into `backend/frontend` (safe via robocopy)
- Optionally runs backend build/start commands
#>

param(
  [string]$RepoRoot = "D:\\finance-blog",
  [string]$BackendDir = "D:\\finance-blog\\backend",
  [string]$FrontendDir = "D:\\finance-blog\\frontend"
)

function Fail($msg){ Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

Write-Host "Starting build/deploy script"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "Node.js not found in PATH. Install Node 16+ and retry." }

Write-Host "Installing backend dependencies..."
if (Test-Path "$BackendDir\package.json") {
  Push-Location $BackendDir
  npm install --no-audit --no-fund 2>&1 | Write-Host
  Pop-Location
} else {
  Write-Warning "No backend package.json found at $BackendDir; skipping npm install"
}

Write-Host "Building frontend (if applicable)..."
if (Test-Path "$FrontendDir\package.json") {
  Push-Location $FrontendDir
  $pkg = Get-Content package.json -Raw | ConvertFrom-Json
  if ($pkg.scripts -and $pkg.scripts.build) {
    Write-Host "Found frontend build script; running 'npm run build'"
    npm install --no-audit --no-fund 2>&1 | Write-Host
    npm run build 2>&1 | Write-Host
  } else {
    Write-Host "No frontend build script; skipping build"
  }
  Pop-Location
} else {
  Write-Host "No frontend folder found; skipping frontend build"
}

Write-Host "Copying frontend to backend/frontend (robocopy)"
$dest = Join-Path $BackendDir "frontend"
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $dest | Out-Null

# robocopy is robust for file tree copy on Windows
$src = $FrontendDir
if (Test-Path $src) {
  $robocmd = "robocopy `"$src`" `"$dest`" /MIR /Z /XD node_modules .git"
  Write-Host "Running: $robocmd"
  cmd /c $robocmd | Write-Host
} else {
  Write-Warning "Frontend source not found at $src; nothing copied"
}

Write-Host "Optional: run backend start command now?"
if (Test-Path "$BackendDir\package.json") {
  $pkg = Get-Content "$BackendDir\package.json" -Raw | ConvertFrom-Json
  if ($pkg.scripts -and $pkg.scripts.start) {
    Write-Host "To start server locally run: (in $BackendDir) npm start"
  } else {
    Write-Host "No backend start script found. You can run 'node server.js' in backend to start the server."
  }
}

Write-Host "Build/deploy script finished"
