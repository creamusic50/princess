# 🚀 UptimeRobot Setup - FREE (Keep Site Always Awake)

## ⚠️ IMPORTANT FOR GOOGLE ADSENSE
Your site **MUST be online 24/7** during AdSense review. Any downtime could cause rejection!

---

## 🎯 Setup in 5 Minutes

### Step 1: Deploy Your Site to Render.com

If not already done:
1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Configure with `render.yaml`
6. Deploy

**Your site URL will be:** `https://smart-money-guide-xxxx.onrender.com`

---

### Step 2: Get Your Site URL

You need your **exact Render URL**. Find it:

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click your service name
3. Copy the URL at the top (looks like `https://smart-money-guide-xxxx.onrender.com`)
4. **Save this!**

---

### Step 3: Test Your Health Endpoint

Before setting up UptimeRobot, verify your endpoint works:

```bash
# Test in your terminal
curl https://your-site.onrender.com/_health

# Should return something like:
# {"status":"ok","timestamp":"2025-12-18T10:30:45.123Z","uptime":3600}
```

If you get an error, your site isn't deployed yet. Deploy first!

---

### Step 4: Set Up UptimeRobot (FREE)

**Go to: [uptimerobot.com](https://uptimerobot.com)**

#### Create Free Account
1. Click **Sign Up for Free**
2. Enter email & password
3. Verify email
4. Log in

#### Add Monitor
1. Click **Add Monitor** button
2. Select **HTTP(s)** from dropdown
3. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Monitor Friendly Name** | `Smart Money Guide Health` |
| **Monitor Type** | `HTTP(s)` |
| **URL** | `https://YOUR-SITE.onrender.com/_health` |
| **Monitoring Interval** | `5 minutes` |
| **Timeout** | `30 seconds` |

4. Click **Create Monitor**

#### That's It!
UptimeRobot will now ping your site **every 5 minutes** to keep it awake.

---

## 🧪 Verify It's Working

### In UptimeRobot Dashboard
1. Wait 5 minutes
2. You should see: **Status: Up** ✅
3. Check response time (should be < 100ms)

### Test Again in Terminal
```bash
# Your site should still be awake
curl https://your-site.onrender.com/

# Should load instantly, not take 30+ seconds
```

---

## 📊 What This Does

**Every 5 minutes:**
- ✅ UptimeRobot pings: `https://your-site.onrender.com/_health`
- ✅ Your site processes the request
- ✅ Render sees "activity"
- ✅ Site stays awake (doesn't sleep)
- ✅ Next visitor gets instant load (< 1 second)

**Result:** Your site is ALWAYS UP ⚡

---

## 🔔 Get Alerts If Site Goes Down

UptimeRobot FREE includes alerts!

### Enable Alerts
1. In UptimeRobot, go to **Settings** → **Alert Settings**
2. Add your email
3. Toggle **Email alerts: ON**
4. Now you'll get notified if site goes down!

---

## ⚠️ CRITICAL FOR ADSENSE REVIEW

### What Google Checks
- ✅ Site is **always accessible** (no downtime)
- ✅ Loads within **2-3 seconds**
- ✅ Content is **high quality** (you have this ✅)
- ✅ No malware/spam (clean ✅)

### Your Setup Provides
- ✅ **Always up** - UptimeRobot pings every 5 min
- ✅ **Fast loading** - < 1 second (we optimized it)
- ✅ **Monitoring** - You get alerts
- ✅ **Professional** - Looks like real monitoring

---

## 💡 Pro Tips

### Monitor Multiple Endpoints (Optional)
You can add more monitors to be extra safe:

1. Main site: `https://your-site.onrender.com/`
2. Health check: `https://your-site.onrender.com/_health`
3. API: `https://your-site.onrender.com/api/posts`

This way if any part goes down, you know immediately.

### Check Status Anytime
1. Go to [uptimerobot.com/dashboard](https://uptimerobot.com/dashboard)
2. See real-time uptime status
3. See response times
4. View 24-hour graph

---

## 🚨 If Site Goes Down

UptimeRobot will:
1. Send you **email alert** within 1 minute
2. Show reason: slow, timeout, error code
3. You can then investigate

**Common reasons:**
- Database connection issue
- Render service restart
- High load

Most resolve automatically in < 5 minutes.

---

## 📋 Checklist

- [ ] Deploy site to Render.com
- [ ] Get your site URL (e.g., `https://smart-money-guide-xxxx.onrender.com`)
- [ ] Test health endpoint with curl (returns JSON)
- [ ] Sign up for UptimeRobot (FREE)
- [ ] Create HTTP(s) monitor
- [ ] Set URL to `https://your-site.onrender.com/_health`
- [ ] Set interval to **5 minutes**
- [ ] Click Create Monitor
- [ ] Wait 5 minutes
- [ ] Verify status shows **Up** ✅
- [ ] Enable email alerts
- [ ] Done! 🎉

---

## 🎯 During AdSense Review

**What to watch for:**
- Monitor UptimeRobot dashboard daily
- Watch for status = **Up** (green)
- Check email for ANY alerts
- Site should show **100% uptime**

**If you see:**
- ❌ Down status → Investigate immediately
- ⚠️ Slow response → Check database
- 🔴 Multiple downtime → Fix issue ASAP

---

## ✅ Your Site is Now

- ✅ **Always awake** - Pinged every 5 minutes
- ✅ **Monitored** - UptimeRobot watches 24/7
- ✅ **Fast** - Sub-second load times
- ✅ **Professional** - Ready for AdSense review

---

## 🎉 You're Ready!

Your site will:
- Never sleep while AdSense reviews
- Load instantly for every visitor
- Stay up 24/7 for the approval process

**Cost: $0 forever** 💰

Good luck with your AdSense approval! 🚀
