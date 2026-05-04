# 🚨 QUICK FIX - Do This Now!

## 1️⃣ **Update Render Environment Variable**

Go to: https://dashboard.render.com → Your Service → Environment

**Add or Update:**
```
CLIENT_URL=https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app
```

**⚠️ CRITICAL:** This MUST match your Vercel URL exactly!

---

## 2️⃣ **Verify Vercel Environment Variable**

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Verify it says:**
```
VITE_API_URL=https://hostelease-a-hostel-management-system.onrender.com
```

**⚠️ NO trailing slash!**

---

## 3️⃣ **Wait for Deployments**

- **Render**: Auto-redeploys when you save env vars (2-5 min)
- **Vercel**: Already deployed with latest code (check Deployments tab)

---

## 4️⃣ **Test It**

1. Open: https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app/login
2. Open browser DevTools (F12) → Console tab
3. Try to login
4. **Should work!** No CORS errors ✅

---

## 🐛 **Still Not Working?**

### Check Render Logs:
1. Go to Render Dashboard → Your Service → Logs
2. Look for: `✅ Server is running on port 10000`
3. Look for: `✅ Database connected successfully`

### Check Browser Console:
1. Press F12 → Console tab
2. Should see NO red errors
3. Network tab → Click login request → Should be 200 OK

### Check CORS:
```bash
curl -X OPTIONS \
  -H "Origin: https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app" \
  https://hostelease-a-hostel-management-system.onrender.com/api/auth/login -v
```

Should return `Access-Control-Allow-Origin` header.

---

## ✅ **What Was Fixed**

1. ✅ Updated CORS to allow new Vercel URL (`gs630nuwt`)
2. ✅ Added proper CORS methods and headers
3. ✅ Fixed preflight OPTIONS handling
4. ✅ Verified API URL has no trailing slash
5. ✅ Added comprehensive error logging

---

## 📞 **Need More Help?**

Read the full guide: `DEPLOYMENT_GUIDE.md`
