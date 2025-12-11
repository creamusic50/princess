# 🔐 ADMIN CREDENTIALS - KEEP THIS FILE SECURE!

⚠️ **DO NOT COMMIT THIS FILE TO VERSION CONTROL**
⚠️ **ADD TO .gitignore IMMEDIATELY**

---

## Default Admin Account

These are the DEFAULT credentials created by `backend/scripts/seed.js`. After first deployment, **CHANGE THESE IMMEDIATELY**:

To find your actual default credentials, run:
```bash
cd backend
node scripts/create-admin.js
```

Or check your `.env` file (which should be in .gitignore and never committed):
```
ADMIN_EMAIL=<stored in .env>
ADMIN_PASSWORD=<stored in .env>
```

**Login URL:** http://localhost:5000/login.html (local)  
**Production Login:** https://yourdomain.com/login.html

---

## 🚨 CRITICAL SECURITY STEPS

### 1. Change Default Password IMMEDIATELY

After first login:
1. Go to admin dashboard
2. Navigate to account settings
3. Change password to something strong
4. Use a password manager to store it

### 2. Use Strong Passwords

❌ **Bad:** admin123, password, 123456  
✅ **Good:** vK9#mP2$nQ7@wR5!xL8^

**Requirements:**
- At least 12 characters
- Mix of uppercase and lowercase
- Include numbers
- Include special characters
- NOT a dictionary word
- NOT related to personal info

### 3. Password Manager Recommendations

- **1Password** - https://1password.com
- **Bitwarden** - https://bitwarden.com (free & open source)
- **LastPass** - https://lastpass.com
- **Dashlane** - https://dashlane.com

---

## 📝 Your Production Credentials

Once deployed, update these with your ACTUAL credentials:

**Production Email:** _____________________  
**Production Password:** (Store in password manager!)  
**Production URL:** _____________________

---

## 🔒 Security Best Practices

### Do's ✅

- ✅ Change default password immediately
- ✅ Use a unique password (not used elsewhere)
- ✅ Use a password manager
- ✅ Keep this file locally only
- ✅ Add to .gitignore
- ✅ Enable 2FA if available in future
- ✅ Regularly update passwords (every 3-6 months)
- ✅ Log out after each session
- ✅ Only access admin from secure networks

### Don'ts ❌

- ❌ Never commit credentials to Git
- ❌ Don't share passwords via email/chat
- ❌ Don't use same password on multiple sites
- ❌ Don't write passwords on paper
- ❌ Don't save in browser (use password manager instead)
- ❌ Don't access admin from public WiFi
- ❌ Don't leave admin session logged in

---

## 🛡️ If Credentials Are Compromised

If you suspect your admin account has been compromised:

1. **Immediately change your password**
2. **Check recent activity logs**
3. **Review all published posts** (look for unauthorized changes)
4. **Check user accounts** (look for new accounts)
5. **Update all passwords** (including database)
6. **Review server logs** for suspicious activity
7. **Consider migrating to new admin account**

---

## 🔑 Password Storage Template

For your records (keep in password manager):

```
Service: Smart Money Guide Admin
URL: https://yourdomain.com/login.html
Username: creamusic50@gmail.com
Password: [Generated Strong Password]
Notes: Main admin account for finance blog
Created: [Date]
Last Changed: [Date]
```

---

## 📞 Emergency Contact

If locked out of admin:

1. Access database directly via Neon dashboard
2. Use `password-reset.js` script (if available)
3. Create new admin account via seed script
4. Contact hosting support if deployed

---

## ⚠️ REMEMBER

**These credentials have full control over:**
- All blog content
- User accounts
- Site settings
- Database access

**Treat them like you'd treat:**
- Your bank account password
- Your email password
- Your social security number

**Security is not optional. Take it seriously.**

---

Last Updated: [Current Date]
Next Password Change Due: [Date + 6 months]

---

## 🎯 Quick Reference

**Current Environment:** Development  
**Admin Access Level:** Full (Owner)  
**Database:** Neon PostgreSQL  
**2FA Enabled:** Not yet (recommended for production)  
**Password Strength:** ⚠️ Change from default!

---

*This file should be stored locally and securely. Never upload to GitHub, public repositories, or share publicly.*
