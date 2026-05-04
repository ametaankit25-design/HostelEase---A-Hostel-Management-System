# 🚀 MERN Stack Deployment Guide - Render + Vercel

## 📋 Current Deployment URLs

- **Frontend (Vercel)**: https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app
- **Backend (Render)**: https://hostelease-a-hostel-management-system.onrender.com

---

## ✅ **SOLUTION: All Issues Fixed**

### **1. CORS Configuration (Backend)**

The CORS error happens because the backend doesn't recognize your frontend's origin.

**✅ Fixed in `Backend/src/app.js`:**

```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow no-origin requests
    
    if (allowedOrigins.includes(origin) || process.env.CLIENT_URL === '*') {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // CRITICAL: Allows cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // Cache preflight for 24 hours
}));
```

**Why this works:**
- ✅ Explicitly allows your Vercel URL
- ✅ Handles preflight OPTIONS requests
- ✅ Supports credentials (cookies, auth headers)
- ✅ Logs blocked origins for debugging

---

### **2. API Base URL Issue (Frontend)**

**Problem:** Double slash `//api/auth/login` happens when:
- `.env` has: `VITE_API_URL=https://example.com/`
- Code has: `${VITE_API_URL}/api/auth/login`
- Result: `https://example.com//api/auth/login` ❌

**✅ Fixed in `Frontend/.env`:**

```env
VITE_API_URL=https://hostelease-a-hostel-management-system.onrender.com
```

**No trailing slash!**

**Frontend fetch example:**

```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // CRITICAL: Sends cookies cross-origin
  body: JSON.stringify({ username, password })
});
```

---

### **3. Route Structure Verification**

**✅ Backend routes are correct:**

```javascript
// Backend/src/app.js
app.use('/api/auth', authRoutes);

// Backend/src/routes/auth.routes.js
router.post('/login', authController.loginUser);
```

**Final endpoint:** `POST /api/auth/login` ✅

---

### **4. Preflight (OPTIONS) Request**

**What is preflight?**
- Browser sends OPTIONS request before POST/PUT/DELETE
- Checks if CORS allows the actual request
- Required when using `credentials: 'include'`

**✅ Fixed by:**
- Adding `methods: ['OPTIONS', ...]` in CORS config
- Setting `maxAge: 86400` to cache preflight responses
- Express automatically handles OPTIONS when CORS is configured

---

## 🔧 **Deployment Configuration**

### **Render (Backend) Settings**

1. **Root Directory**: `Backend`
2. **Build Command**: `npm install`
3. **Start Command**: `node server.js`

**Environment Variables (Add in Render Dashboard):**

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app
NODE_ENV=production
```

**⚠️ CRITICAL:** Update `CLIENT_URL` to match your Vercel URL!

---

### **Vercel (Frontend) Settings**

1. **Root Directory**: `Frontend`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`

**Environment Variables (Add in Vercel Dashboard):**

```env
VITE_API_URL=https://hostelease-a-hostel-management-system.onrender.com
```

**⚠️ No trailing slash!**

---

## 🧪 **Testing Checklist**

### **1. Test Backend Health**
```bash
curl https://hostelease-a-hostel-management-system.onrender.com/
```

Expected response:
```json
{
  "success": true,
  "message": "HostelEase API is running"
}
```

### **2. Test CORS**
```bash
curl -X OPTIONS \
  -H "Origin: https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  https://hostelease-a-hostel-management-system.onrender.com/api/auth/login -v
```

Should return `Access-Control-Allow-Origin` header.

### **3. Test Login Endpoint**
```bash
curl -X POST \
  https://hostelease-a-hostel-management-system.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

Should return JSON (not 404).

---

## 🐛 **Common Issues & Solutions**

### **Issue: "No 'Access-Control-Allow-Origin' header"**

**Cause:** Backend CORS not configured or wrong origin

**Fix:**
1. Check Render environment variable `CLIENT_URL` matches Vercel URL
2. Verify CORS middleware is **before** all routes
3. Check Render logs for "CORS blocked origin" messages

---

### **Issue: "404 Not Found on /api/auth/login"**

**Cause:** Route not registered or wrong path

**Fix:**
1. Verify `app.use('/api/auth', authRoutes)` in `app.js`
2. Check `router.post('/login', ...)` exists in `auth.routes.js`
3. Test directly: `curl https://your-backend.onrender.com/api/auth/login`

---

### **Issue: "Preflight request failed"**

**Cause:** OPTIONS request not handled

**Fix:**
1. Add `methods: ['OPTIONS', ...]` to CORS config
2. Ensure CORS middleware is first (before body parsers)
3. Don't have custom OPTIONS handlers that conflict

---

### **Issue: "Credentials not sent"**

**Cause:** Missing `credentials: 'include'` in fetch

**Fix:**
```javascript
// Frontend
fetch(url, {
  credentials: 'include', // ← Add this
  // ...
});

// Backend
cors({
  credentials: true, // ← Add this
  // ...
});
```

---

## 📝 **Production Best Practices**

### **1. Security**
- ✅ Never use `origin: '*'` with `credentials: true`
- ✅ Whitelist specific origins only
- ✅ Use HTTPS for both frontend and backend
- ✅ Set secure cookie flags in production

### **2. Environment Variables**
- ✅ Never commit `.env` files
- ✅ Use different values for dev/staging/prod
- ✅ Verify all env vars are set before deployment

### **3. Error Handling**
- ✅ Log CORS errors for debugging
- ✅ Return proper HTTP status codes
- ✅ Handle network errors gracefully in frontend

### **4. Performance**
- ✅ Set `maxAge` for preflight caching
- ✅ Use connection pooling for MongoDB
- ✅ Enable compression middleware

---

## 🔄 **Deployment Workflow**

### **When you update code:**

1. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix CORS and API configuration"
   git push origin main
   ```

2. **Vercel auto-deploys** (usually 1-2 minutes)

3. **Render auto-deploys** (usually 2-5 minutes)

4. **Verify deployment:**
   - Check Render logs for "Server is running"
   - Test frontend at Vercel URL
   - Check browser console for errors

---

## 📞 **Quick Debug Commands**

```bash
# Check if backend is running
curl https://hostelease-a-hostel-management-system.onrender.com/

# Check environment variables
curl https://hostelease-a-hostel-management-system.onrender.com/api/health

# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  https://hostelease-a-hostel-management-system.onrender.com/api/auth/login -v

# Test login endpoint
curl -X POST \
  https://hostelease-a-hostel-management-system.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

---

## ✅ **Final Checklist**

Before going live, verify:

- [ ] Backend health check returns 200
- [ ] CORS allows your Vercel origin
- [ ] All environment variables set in Render
- [ ] All environment variables set in Vercel
- [ ] MongoDB connection successful
- [ ] Login/signup works from frontend
- [ ] Cookies are set correctly
- [ ] No console errors in browser
- [ ] API calls succeed (check Network tab)

---

## 🎉 **Success Indicators**

You'll know everything works when:

1. ✅ No CORS errors in browser console
2. ✅ Network tab shows 200 responses
3. ✅ Login redirects to dashboard
4. ✅ Cookies appear in Application tab
5. ✅ API calls complete successfully

---

**Need help?** Check Render logs and browser console for specific error messages.
