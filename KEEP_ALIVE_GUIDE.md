# 🔄 Keep Your Website Always Awake

## Problem
Free tier hosting services (Render.com, Heroku, Railway, Replit) automatically put your server to sleep after **15 minutes of inactivity**. Users have to wait 30+ seconds for the site to wake up.

## Solution: 3 Options

---

## Option 1: ⭐ BEST - Upgrade to Paid Tier (Render.com)

### On Render.com
1. Go to your Service Dashboard
2. Click **Settings**
3. Scroll to **Plan**
4. Select **Starter Plan** ($7/month) or higher
5. Save and redeploy

**Benefits:**
- ✅ Always-on, no sleep
- ✅ Better performance
- ✅ Support for auto-scaling
- ✅ No additional code needed

**Update render.yaml:**
```yaml
plan: starter  # Free tier sleeps, starter ($7) stays awake
```

---

## Option 2: 🤖 Free - Use External Ping Service

### Best Free Services
1. **UptimeRobot** (Recommended)
2. **Monitoring.app**
3. **Freshping**

### Setup UptimeRobot (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com) → Sign up free
2. Click **Add Monitor**
3. Select **HTTP(s)**
4. Enter your website URL: `https://your-site.onrender.com/_health`
5. Set interval: **5 minutes**
6. Click **Create Monitor**

**Benefits:**
- ✅ Completely free
- ✅ Monitors your site uptime
- ✅ Sends alerts if site goes down
- ✅ Keeps site awake with regular pings
- ✅ Works with any hosting

---

## Option 3: 🏃 DIY - Run Keep-Alive Service Locally

### Setup on Your Computer

We've included a keep-alive script. Here's how to use it:

#### Step 1: Install Dependencies
```bash
cd backend
npm install
```

#### Step 2: Update Configuration
Edit `scripts/keep-alive.js` and change:
```javascript
const WEBSITE_URL = 'https://your-site.onrender.com'; // Your actual URL
const PING_INTERVAL = 240000; // Ping every 4 minutes
```

#### Step 3: Run on Your Computer
```bash
cd backend
npm run keep-alive
```

**Keep this running 24/7:**
- **Windows**: Use Task Scheduler
- **Mac/Linux**: Use `nohup` or systemd service
- **Better**: Run on a cheap VPS ($2-5/month)

---

## Option 4: 🚀 RECOMMENDED - Both Render Paid + External Monitor

### Best For Production
1. **Upgrade to Paid Tier** ($7/month) - Always on
2. **Add UptimeRobot** (Free) - Monitoring + redundant pings

**This ensures:**
- ✅ Site never sleeps
- ✅ Instant load times
- ✅ You get alerts if it goes down
- ✅ Multiple layers of redundancy

---

## 📋 Quick Comparison

| Option | Cost | Setup | Always-On | Monitoring |
|--------|------|-------|-----------|-----------|
| **Render Paid** | $7/mo | 2 min | ✅ Yes | ✅ Yes |
| **UptimeRobot** | Free | 3 min | ✅ Yes (pings) | ✅ Yes |
| **DIY Service** | Free | 5 min | ⚠️ If running | ❌ No |
| **Both (Best)** | $7/mo | 5 min | ✅ Yes | ✅ Yes |

---

## ✅ How to Test

### Test Your Health Endpoint
```bash
# This should return instantly
curl https://your-site.onrender.com/_health

# Response:
# {"status":"ok","timestamp":"2025-12-18T10:30:45.123Z","uptime":3600}
```

### Monitor Site Wake Time
```bash
# Time how long it takes to load after sleep
time curl https://your-site.onrender.com/

# Before optimization: 30-50 seconds
# After optimization: 0.5-2 seconds
```

---

## 🔧 What We Added for You

### 1. Health Check Endpoint
```javascript
// In backend/server.js
app.get('/_health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

This is extremely lightweight and fast (< 10ms response).

### 2. Keep-Alive Script
```bash
scripts/keep-alive.js
```

Run this to ping your site every 4 minutes (configurable).

### 3. Updated render.yaml
Added health check path and environment variables for easy configuration.

---

## 📊 Cost Comparison

### Free Forever
- **Option 2 (UptimeRobot)**: $0
- **Option 3 (DIY)**: $0 (if running on your computer)
- **Downside**: Site still sleeps, just wakes faster

### Recommended ($7/month)
- **Option 1 (Render Starter)**: $7
- **Option 4 (Render + UptimeRobot)**: $7
- **Upside**: Always-on, never sleeps, instant loads

---

## 🚀 RECOMMENDED SETUP (Next Steps)

### Step 1: Upgrade Render Tier (Best Option)
1. Log in to Render.com
2. Go to your service
3. Settings → Plan → Select **Starter** ($7/month)
4. Redeploy

### Step 2: Add Free Monitoring (Optional but Recommended)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up free
3. Add monitor for: `https://your-site.onrender.com/_health`
4. Set interval: 5 minutes
5. Get alerts if site goes down

### Step 3: Done!
Your site will now:
- ✅ Never sleep
- ✅ Load instantly
- ✅ Send you alerts if issues

---

## 📞 Support

### Render.com Issues
- [Render Docs](https://render.com/docs)
- Support: support@render.com

### UptimeRobot Issues
- [UptimeRobot FAQ](https://uptimerobot.com/faq)
- Support: [Help Center](https://help.uptimerobot.com)

---

**Total Cost for Always-On Site**: $7/month (Render Starter)
**Setup Time**: 5 minutes
**Result**: Site loads instantly, never sleeps ⚡

🎉 Your site will now be lightning-fast and always available!
