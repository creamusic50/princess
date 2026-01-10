# 🔄 Keep Your Website Awake 24/7 (1 Month & Beyond)

## Best Solution: UptimeRobot (FREE) ✅

This is the **easiest and most reliable** solution:

### Setup Instructions:

1. **Go to UptimeRobot.com**
   - Sign up free at: https://uptimerobot.com
   - Create a free account

2. **Add Your Website Monitor**
   - Click "Add Monitor"
   - Choose: **HTTP(s)**
   - URL: `http://localhost:5000/api/health` (local)
     OR `https://yourdomain.com/api/health` (production)
   - Monitor Interval: **5 minutes** (prevents server sleep)
   - Click **Create Monitor**

3. **That's it!** 
   - UptimeRobot will ping your site every 5 minutes
   - You get alerts if it goes down
   - Works 24/7 automatically for 1 month & beyond

---

## Option 2: Run Keep-Alive Locally (DIY)

If you want to run the keep-alive service on your own machine:

```bash
# Navigate to project root
cd d:\finance-blog

# Set your website URL
$env:WEBSITE_URL = "http://localhost:5000"
$env:PING_INTERVAL = "300000"  # 5 minutes

# Run the keep-alive service
node scripts/keep-alive.js
```

Keep this terminal window open 24/7, or set up a scheduled task in Windows.

---

## Option 3: Windows Scheduled Task (Automatic)

To run keep-alive automatically on Windows startup:

1. **Open Task Scheduler**
   - Press `Win + R`
   - Type: `taskschd.msc`
   - Click OK

2. **Create Basic Task**
   - Right-click "Task Scheduler Library"
   - Click "Create Basic Task..."
   - Name: "Website Keep-Alive Service"
   - Trigger: "At startup"
   - Action: "Start a program"
   - Program: `node`
   - Arguments: `scripts/keep-alive.js`
   - Working Directory: `D:\finance-blog`

3. **Enable & Test**
   - Click "Finish"
   - Right-click task → "Run" to test
   - Check logs to confirm it's running

---

## Option 4: Render.com Paid Plan ($7/month)

If your site is on Render.com:

1. Go to: https://dashboard.render.com
2. Select your service
3. Click "Settings"
4. Upgrade to paid plan
5. Server stays awake 100% of the time

---

## Health Check Endpoint

Your server has a built-in health check endpoint:

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "uptime": 3600.5
}
```

---

## Performance Optimization (Stable Speed)

Your server is already optimized with:

✅ **Compression** - All responses gzipped  
✅ **Caching** - Static assets cached 1 year  
✅ **HTML Files** - No cache (always fresh)  
✅ **Database** - Indexed queries for speed  
✅ **Security Headers** - Helmet protection  
✅ **Rate Limiting** - API protected  

**Result:** Fast, stable performance 24/7

---

## Monitoring Your Server

### Check Server Status:
```bash
curl http://localhost:5000/api/health
```

### View Server Logs:
```bash
# Windows PowerShell
Get-Content -Path "logs\*.log" -Tail 50 -Wait
```

### Check Performance:
- Google PageSpeed: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com
- Pingdom: https://tools.pingdom.com

---

## Summary: 1-Month Keep-Alive Plan

| Method | Cost | Setup Time | Reliability |
|--------|------|-----------|-------------|
| **UptimeRobot** | FREE ✅ | 5 min | 99.9% |
| Local DIY | FREE | 10 min | 95% (requires PC on) |
| Scheduled Task | FREE | 15 min | 98% (Windows only) |
| Render Paid | $7/mo | 2 min | 100% |

**Recommended: UptimeRobot + Your Current Setup = Always Awake** 🚀

