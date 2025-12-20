# 🔧 TROUBLESHOOTING GUIDE - FINANCE BLOG

## Quick Fix Steps (Do These First!)

### Step 1: Install Dependencies
```bash
# Run this first!
install-deps.bat
```

### Step 2: Start the Server
```bash
# After dependencies are installed
fix-and-start.bat
```

### Step 3: Open Browser
- Go to: http://localhost:5000
- If that doesn't work, try: http://127.0.0.1:5000

---

## Common Problems & Solutions

### ❌ Problem 1: "Cannot find module" errors

**Solution:**
1. Delete `node_modules` folder (if it exists)
2. Run `install-deps.bat`
3. Wait for it to finish (takes 2-5 minutes)
4. Run `fix-and-start.bat`

### ❌ Problem 2: Port 5000 is already in use

**Solution Option A - Kill the process:**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it (replace PID with the number from above)
taskkill /PID [PID_NUMBER] /F
```

**Solution Option B - Change port:**
1. Open `.env` file
2. Change `PORT=5000` to `PORT=3000` (or any other port)
3. Save and run `fix-and-start.bat`

### ❌ Problem 3: Database connection failed

**Cause:** Your Neon database URL might be wrong or database is not set up

**Solution:**
1. Check your `.env` file - DATABASE_URL should be correct
2. Go to https://neon.tech and verify your database exists
3. Make sure you have internet connection
4. Copy the correct connection string from Neon dashboard

### ❌ Problem 4: Website loads but shows errors

**Solution:**
1. Open browser console (Press F12)
2. Check for errors in the Console tab
3. Check Network tab for failed requests
4. Look at what specific API endpoint is failing

### ❌ Problem 5: CSS/JS files not loading

**Solution:**
1. Make sure `frontend` folder exists with all files
2. Check that these files exist:
   - `frontend/index.html`
   - `frontend/css/style.min.f5f26ea4.css`
   - `frontend/js/main.min.eb2549f5.js`
3. Clear browser cache (Ctrl + Shift + Delete)
4. Hard refresh page (Ctrl + F5)

---

## Verification Checklist

Run through this checklist:

- [ ] Node.js is installed (`node --version` in cmd)
- [ ] Dependencies are installed (`node_modules` folder exists)
- [ ] `.env` file exists with correct database URL
- [ ] Server starts without errors
- [ ] Can access http://localhost:5000 in browser
- [ ] Browser console shows no errors (F12 > Console tab)
- [ ] API endpoints respond (check Network tab)

---

## Still Not Working?

### Check Server Logs
When you run `fix-and-start.bat`, look for:
```
✅ Connected to PostgreSQL (Neon)
🚀 Server running on http://localhost:5000
```

If you see these, server is running correctly!

### Check Browser Console
1. Open your website
2. Press F12
3. Go to Console tab
4. Look for red error messages
5. Copy the error and search for solution

### Database Setup
If database is the issue:

1. Go to https://console.neon.tech
2. Create a new project (if needed)
3. Go to Dashboard
4. Copy the connection string
5. Paste it in `.env` as `DATABASE_URL`

### Need Database Tables?
Run this in your Neon SQL Editor:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author_id INTEGER REFERENCES users(id),
    published BOOLEAN DEFAULT true,
    meta_description TEXT,
    keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing Everything Works

### Test 1: Homepage
- URL: http://localhost:5000
- Should see: Finance blog homepage with categories

### Test 2: API Health
- URL: http://localhost:5000/api/health
- Should see: JSON with status "healthy"

### Test 3: Get Posts
- URL: http://localhost:5000/api/posts
- Should see: JSON array of posts (might be empty)

### Test 4: Admin Page
- URL: http://localhost:5000/admin
- Should see: Login page or admin dashboard

---

## Emergency Reset

If nothing works, do a full reset:

1. **Backup your .env file!**
2. Delete `node_modules` folder
3. Run: `npm cache clean --force`
4. Run: `install-deps.bat`
5. Run: `fix-and-start.bat`

---

## Getting Help

If you're still stuck:

1. Check what the **exact error message** is
2. Check **browser console** (F12 > Console)
3. Check **server logs** in the terminal
4. Look at the **Network tab** in browser (F12 > Network)

Most common issue is **missing node_modules** - just run `install-deps.bat`!
