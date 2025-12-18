# ⚡ UptimeRobot Free Setup - QUICK VERSION

**Goal:** Keep site always awake for Google AdSense review ($0 cost)

---

## 3 STEPS - 5 MINUTES

### STEP 1: Get Your Render URL

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **smart-money-guide** service
3. Copy the URL (looks like: `https://smart-money-guide-abcd1234.onrender.com`)
4. Save it somewhere

---

### STEP 2: Go to UptimeRobot & Create Monitor

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. **Sign Up Free** (if not already)
3. Click **Add Monitor**
4. **Select:** HTTP(s)
5. **Paste your URL:** `https://smart-money-guide-abcd1234.onrender.com/_health`
   - (Replace the URL with YOUR actual URL)
6. **Change interval to:** 5 minutes
7. Click **Create Monitor**

---

### STEP 3: Enable Alerts

1. Go to **Settings** → **Alert Settings**
2. Add your email
3. Toggle **Email: ON**
4. Done! ✅

---

## ✅ VERIFICATION

Wait 5 minutes, then:
1. Check UptimeRobot dashboard
2. See **Status: Up** (green) ✅
3. You're done!

---

## 📊 WHAT'S HAPPENING

- Every 5 minutes: UptimeRobot pings your site
- Your site wakes up + responds
- Render sees activity → keeps it awake
- Next visitor gets instant loading ⚡

---

## 🎯 ADSENSE REVIEW

Your site will be:
- ✅ Always online
- ✅ Super fast (< 1 sec)
- ✅ Monitored 24/7
- ✅ Ready for approval

---

## 💰 COST

**$0 forever** 💰

---

## 🚨 TROUBLESHOOTING

**Q: UptimeRobot shows "Down"?**
A: Your server might be sleeping. Manually visit your site to wake it up, then wait 5 min.

**Q: Gets "Connection Timeout"?**
A: Make sure URL is correct. Test it:
```bash
curl https://YOUR-URL/_health
```

**Q: No green "Up" status?**
A: Wait 10 minutes for first check.

---

## 🎉 DONE!

Your site is now always awake. Good luck with AdSense! 🚀
