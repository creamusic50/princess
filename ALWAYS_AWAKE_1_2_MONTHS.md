# 🔄 ALWAYS AWAKE - 1-2 Month Keep-Alive Setup

## 🎯 Your Goal:
Keep tilana.online **ALWAYS AWAKE** for 1-2 months without paying

## ✅ Best Solution: Windows Task Scheduler (Auto-Run)

This will run **24/7 automatically** without any manual work!

---

## 🚀 Setup (Takes 5 Minutes)

### Step 1: Create Batch File
Create file: `D:\finance-blog\run-keep-alive.bat`

```batch
@echo off
REM Auto-restart keep-alive if it crashes
:restart
cd D:\finance-blog
node scripts/keep-alive.js
REM If it exits, restart it
goto restart
```

### Step 2: Create Windows Task

1. **Press:** `Win + R`
2. **Type:** `taskschd.msc`
3. **Click:** `OK`

### Step 3: Create Basic Task

1. **Right-click** "Task Scheduler Library"
2. **Select:** "Create Basic Task..."
3. **Name:** "Website Keep-Alive Service"
4. **Description:** "Keeps tilana.online always awake"
5. **Click:** Next

### Step 4: Set Trigger

1. **Select:** "At startup"
2. **Click:** Next

### Step 5: Set Action

1. **Select:** "Start a program"
2. **Program:** `C:\Program Files\nodejs\node.exe`
3. **Arguments:** `scripts/keep-alive.js`
4. **Start in:** `D:\finance-blog`
5. **Click:** Next

### Step 6: Finish

1. **Click:** "Finish"
2. **Check:** "Run with highest privileges" ✓
3. **Click:** OK

---

## 🧪 Test It Works

### Test 1: Manual Test
```bash
cd D:\finance-blog
node scripts/keep-alive.js
```

You should see:
```
🔄 Keep-Alive Service Started
⏰ Pinging http://localhost:5000/api/health every 300 seconds
📍 Time: 2026-01-10T12:00:00.000Z
```

Wait 5 minutes, you should see:
```
[2026-01-10 12:05:00] Ping successful - Status: 200
[2026-01-10 12:10:00] Ping successful - Status: 200
```

**If you see this = IT'S WORKING!** ✅

### Test 2: Restart Computer

1. Restart your computer
2. Wait 2 minutes
3. Check: Does the keep-alive service auto-start?

If yes = **IT'S WORKING!** ✅

---

## 📊 How It Works

```
Your Computer
    ↓
Windows starts → Task Scheduler starts
    ↓
    → node scripts/keep-alive.js starts
    ↓
    → Every 5 minutes: Ping http://localhost:5000/api/health
    ↓
    → Server gets pinged → STAYS AWAKE
    ↓
    → Website always responsive ✅
```

---

## 🔍 Monitor It's Working

### Check Running Processes
```powershell
Get-Process node
```

Should show `node.exe` running.

### Check Logs
```bash
cd D:\finance-blog
type logs\*.log | tail -20  # Last 20 log entries
```

---

## ⚡ Alternative: Keep-Alive.ps1 (PowerShell)

If you prefer PowerShell version:

```powershell
cd D:\finance-blog
.\keep-alive.ps1
```

Keep this window open. Site stays awake while running.

---

## 📋 1-2 Month Maintenance Plan

### Daily (Takes 0 seconds)
- Nothing! It runs automatically

### Weekly Check (Takes 1 minute)
```powershell
# Verify process is running
Get-Process node | Where-Object {$_.ProcessName -eq "node"}

# If not running, restart manually:
node D:\finance-blog\scripts\keep-alive.js
```

### If Server Restarts
Just restart the keep-alive script:
```bash
cd D:\finance-blog
node scripts/keep-alive.js
```

---

## ✅ Checklist: Always Awake Setup

- [ ] Backend server running: `npm start`
- [ ] Keep-alive script running: `node scripts/keep-alive.js`
- [ ] (Optional) Add to Windows Task Scheduler for auto-start
- [ ] Test pings working (wait 5 min, check logs)
- [ ] Verify server status: `curl http://localhost:5000/api/health`

---

## 🎯 Expected Results

### With Keep-Alive Running:
```
Response Time: 100-500ms (STABLE)
Server Status: Always Awake ✅
Website: Always Fast ✅
Uptime: 24/7 ✅
```

### Without Keep-Alive (DON'T DO THIS):
```
Response Time: 100-500ms... then 5000ms (server waking up)
Server Status: Sleeping after 30 mins of inactivity
Website: Slow on first request ❌
Uptime: Interrupted ❌
```

---

## 💡 Why This Works

1. **Keep-Alive Ping:** Every 5 minutes, server gets pinged
2. **Server Never Sleeps:** Always has activity
3. **Response Time:** Stays at 100-500ms
4. **Free:** No Render upgrade needed yet
5. **Reliable:** Auto-restarts if crashes

---

## 🚀 Upgrade to Render $7/Month (When Ready)

When you're ready in 1-2 months:

1. **Go to:** https://dashboard.render.com
2. **Select:** Your service
3. **Click:** "Settings"
4. **Upgrade to:** Paid plan ($7/month)
5. **Result:** Server always on, no keep-alive needed

---

## ❓ Troubleshooting

**Q: Keep-alive stops working?**
```bash
cd D:\finance-blog
node scripts/keep-alive.js
```

**Q: Server still sleeping?**
Make sure keep-alive is running and pinging every 5 minutes.

**Q: How do I stop it?**
Press `Ctrl + C` in the terminal window.

**Q: Will it work through power outages?**
No - your computer needs to be ON. If you shut down, restart when back up.

**Q: Can I close the terminal?**
If using Task Scheduler = yes, runs in background.  
If running manually = no, keep terminal open.

---

## ✨ That's It!

Your website will be **ALWAYS AWAKE** for 1-2 months! 🎉

```
Keep-Alive Running 24/7
        ↓
Server Never Sleeps
        ↓
Website Always Fast
        ↓
Users Happy ✅
```

**Start now and enjoy free always-awake hosting!** 🚀

