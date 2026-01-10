# 🚀 Start Keep-Alive Service (Choose One)

## Option 1: PowerShell (RECOMMENDED) ✅

```powershell
# Open PowerShell and run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\keep-alive.ps1
```

**Run in background:**
```powershell
Start-Process PowerShell -ArgumentList ".\keep-alive.ps1" -NoNewWindow
```

---

## Option 2: Batch File (Simple)

```bash
# Just double-click this:
keep-alive.bat
```

Or run in Command Prompt:
```cmd
keep-alive.bat
```

---

## Option 3: Node.js Keep-Alive

```bash
# From project root:
node scripts/keep-alive.js
```

Set environment variables first:
```bash
$env:WEBSITE_URL = "http://localhost:5000"
$env:PING_INTERVAL = "300000"
```

---

## Option 4: Windows Task Scheduler (Auto-Start)

**Setup automatic keep-alive on Windows startup:**

1. Press `Win + R`
2. Type: `taskschd.msc`
3. Click "Create Basic Task..."
4. **Name:** Website Keep-Alive
5. **Trigger:** At startup
6. **Action:** Start program
   - Program: `powershell.exe`
   - Arguments: `-NoProfile -ExecutionPolicy Bypass -File "D:\finance-blog\keep-alive.ps1"`
   - Start in: `D:\finance-blog`
7. Click Finish ✅

Now your site will ping itself automatically every 5 minutes, keeping the server awake 24/7!

---

## Verify It's Working

**Test the health endpoint:**
```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T15:30:00.000Z",
  "uptime": 3600.5
}
```

---

## What This Does

✅ **Keeps Server Awake** - Pings every 5 minutes  
✅ **Stable Performance** - No server sleep timeouts  
✅ **Cost-Free** - Uses your existing setup  
✅ **Works 24/7** - Runs in background  
✅ **1 Month+ Runtime** - Indefinite keep-alive  

---

## For Production (If Deployed)

**Use UptimeRobot (FREE):**
1. Go to: https://uptimerobot.com
2. Add Monitor
3. URL: `https://yourdomain.com/api/health`
4. Interval: 5 minutes
5. Done! ✅

UptimeRobot handles the pinging from their servers, no need to run on your machine.

