# 🚀 Netlify Deployment Guide for HostelEase Frontend

## 📋 Prerequisites

- GitHub account with HostelEase repository
- Netlify account (free tier works fine)
- Backend deployed on Render

---

## 🎯 Quick Deployment Steps

### **Method 1: Deploy via Netlify Dashboard (Recommended)**

#### **Step 1: Connect to Netlify**

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub
5. Select your repository: `HostelEase---A-Hostel-Management-System`

#### **Step 2: Configure Build Settings**

Fill in these settings:

```
Base directory:        Frontend
Build command:         npm run build
Publish directory:     Frontend/dist
```

**Important:** Make sure to set the base directory to `Frontend`!

#### **Step 3: Add Environment Variables**

Before deploying, click **"Add environment variables"**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://hostelease-a-hostel-management-system.onrender.com` |

**⚠️ Critical:** No trailing slash in the URL!

#### **Step 4: Deploy**

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. Netlify will assign a random URL like: `random-name-123456.netlify.app`

#### **Step 5: Custom Domain (Optional)**

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS

---

### **Method 2: Deploy via Netlify CLI**

#### **Step 1: Install Netlify CLI**

```bash
npm install -g netlify-cli
```

#### **Step 2: Login to Netlify**

```bash
netlify login
```

#### **Step 3: Initialize and Deploy**

```bash
cd Frontend
netlify init
```

Follow the prompts:
- Create & configure a new site
- Build command: `npm run build`
- Publish directory: `dist`

#### **Step 4: Set Environment Variables**

```bash
netlify env:set VITE_API_URL "https://hostelease-a-hostel-management-system.onrender.com"
```

#### **Step 5: Deploy**

```bash
netlify deploy --prod
```

---

## 🔧 Update Backend CORS

After deploying to Netlify, you'll get a URL like:
```
https://your-site-name.netlify.app
```

**You MUST update the backend CORS to allow this new origin!**

### **Update Render Environment Variable:**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your HostelEase backend service
3. Go to **Environment** tab
4. Update `CLIENT_URL`:

```
CLIENT_URL=https://your-site-name.netlify.app
```

5. Save changes (Render will auto-redeploy)

### **Alternative: Update Backend Code**

If you want to allow multiple origins, the backend code already supports it:

```javascript
// Backend/src/app.js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://hostel-ease-a-hostel-management-system-gs630nuwt.vercel.app',
  'https://your-site-name.netlify.app', // Add your Netlify URL
  process.env.CLIENT_URL
].filter(Boolean);
```

Then commit and push:
```bash
git add Backend/src/app.js
git commit -m "Add Netlify URL to CORS whitelist"
git push origin main
```

---

## 📁 Configuration Files

### **netlify.toml** (Already created)

Located at `Frontend/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  base = "Frontend"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**What it does:**
- ✅ Tells Netlify how to build your app
- ✅ Handles React Router client-side routing
- ✅ Sets security headers
- ✅ Configures caching for assets

### **_redirects** (Already created)

Located at `Frontend/_redirects`:

```
/*    /index.html   200
```

**What it does:**
- ✅ Ensures all routes work with React Router
- ✅ Prevents 404 errors on page refresh

---

## 🧪 Testing Your Deployment

### **1. Check Build Logs**

In Netlify dashboard:
- Go to **Deploys** tab
- Click on the latest deploy
- Check logs for errors

**Successful build should show:**
```
✓ built in XXXms
✓ Build succeeded
```

### **2. Test the Live Site**

Visit your Netlify URL and test:

- ✅ Homepage loads
- ✅ Login page works
- ✅ Signup page works
- ✅ No CORS errors in console (F12)
- ✅ API calls succeed
- ✅ Navigation works
- ✅ Page refresh doesn't cause 404

### **3. Check Browser Console**

Press F12 → Console tab:
- ✅ No red errors
- ✅ API calls return 200 status
- ✅ No CORS errors

### **4. Test API Connection**

Try logging in with test credentials:
- Should successfully connect to Render backend
- Should redirect to dashboard on success
- Should show error messages on failure

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Page Not Found" on Refresh**

**Cause:** Missing redirect configuration

**Fix:**
- Ensure `netlify.toml` exists in `Frontend/` directory
- Or ensure `_redirects` file exists in `Frontend/` directory
- Redeploy the site

---

### **Issue 2: CORS Error**

**Error:** `Access to fetch at '...' has been blocked by CORS policy`

**Fix:**
1. Get your Netlify URL (e.g., `https://your-site.netlify.app`)
2. Update Render environment variable:
   ```
   CLIENT_URL=https://your-site.netlify.app
   ```
3. Wait for Render to redeploy (2-5 minutes)

---

### **Issue 3: Environment Variables Not Working**

**Symptoms:** API calls go to wrong URL or fail

**Fix:**
1. Go to Netlify dashboard → Site settings → Environment variables
2. Verify `VITE_API_URL` is set correctly
3. **Important:** Vite env vars must start with `VITE_`
4. Trigger a new deploy (Settings → Deploys → Trigger deploy)

---

### **Issue 4: Build Fails**

**Common causes:**
- Wrong build command
- Wrong publish directory
- Missing dependencies
- Node version mismatch

**Fix:**
1. Check build logs in Netlify
2. Verify `package.json` has correct scripts
3. Set Node version in `netlify.toml`:
   ```toml
   [build.environment]
     NODE_VERSION = "18"
   ```

---

### **Issue 5: Assets Not Loading**

**Symptoms:** Images, CSS, or JS files return 404

**Fix:**
1. Verify publish directory is `Frontend/dist` (not just `dist`)
2. Check that `vite.config.js` has correct base path
3. Ensure assets are in `Frontend/public/` or imported in components

---

## 🔄 Continuous Deployment

### **Automatic Deploys**

Netlify automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

**Netlify will:**
1. Detect the push
2. Start building (1-2 minutes)
3. Deploy to production
4. Update your live site

### **Deploy Previews**

For pull requests, Netlify creates preview deployments:
- Each PR gets a unique URL
- Test changes before merging
- Automatic cleanup after merge

---

## 📊 Netlify Dashboard Features

### **Analytics**
- Page views
- Unique visitors
- Top pages
- Bandwidth usage

### **Forms**
- Handle form submissions
- Spam filtering
- Email notifications

### **Functions**
- Serverless functions
- API endpoints
- Background jobs

### **Split Testing**
- A/B testing
- Traffic splitting
- Performance comparison

---

## 🎯 Production Checklist

Before going live, verify:

- [ ] Build succeeds without errors
- [ ] Environment variables set correctly
- [ ] CORS configured in backend
- [ ] All pages load correctly
- [ ] Login/signup works
- [ ] API calls succeed
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Page refresh works (no 404)
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] Performance optimized

---

## 🚀 Performance Optimization

### **1. Enable Asset Optimization**

In Netlify dashboard:
- Go to **Site settings** → **Build & deploy** → **Post processing**
- Enable:
  - ✅ Bundle CSS
  - ✅ Minify CSS
  - ✅ Minify JS
  - ✅ Compress images

### **2. Configure Caching**

Already configured in `netlify.toml`:
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### **3. Enable Prerendering**

For better SEO:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

---

## 📱 Custom Domain Setup

### **Step 1: Add Domain in Netlify**

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `hostelease.com`)

### **Step 2: Configure DNS**

**Option A: Use Netlify DNS (Recommended)**
1. Update nameservers at your domain registrar
2. Point to Netlify's nameservers
3. Netlify handles everything automatically

**Option B: Use External DNS**
1. Add A record: `@` → `75.2.60.5`
2. Add CNAME: `www` → `your-site.netlify.app`

### **Step 3: Enable HTTPS**

- Automatic with Let's Encrypt
- Free SSL certificate
- Auto-renewal

---

## 🔐 Security Best Practices

### **1. Environment Variables**

- ✅ Never commit `.env` files
- ✅ Use Netlify dashboard for secrets
- ✅ Prefix with `VITE_` for client-side access

### **2. Security Headers**

Already configured in `netlify.toml`:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

### **3. HTTPS**

- ✅ Automatic on Netlify
- ✅ Force HTTPS redirect
- ✅ HSTS enabled

---

## 📞 Quick Commands Reference

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Deploy to production
netlify deploy --prod

# Open site in browser
netlify open:site

# Open admin dashboard
netlify open:admin

# View logs
netlify logs

# Set environment variable
netlify env:set KEY "value"

# List environment variables
netlify env:list
```

---

## 🎉 Success Indicators

You'll know deployment is successful when:

1. ✅ Build completes without errors
2. ✅ Site loads at Netlify URL
3. ✅ No CORS errors in console
4. ✅ Login/signup works
5. ✅ API calls succeed (check Network tab)
6. ✅ Page refresh doesn't cause 404
7. ✅ All routes work correctly
8. ✅ Mobile responsive
9. ✅ HTTPS enabled
10. ✅ Fast load times

---

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router on Netlify](https://docs.netlify.com/routing/redirects/rewrites-proxies/)

---

## 🆘 Need Help?

1. Check Netlify build logs
2. Check browser console (F12)
3. Check Render backend logs
4. Review `DEPLOYMENT_GUIDE.md`
5. Test API endpoint directly: `curl https://hostelease-a-hostel-management-system.onrender.com/`

---

**Your Netlify deployment is ready! Just follow the steps above and your frontend will be live in minutes.** 🚀
