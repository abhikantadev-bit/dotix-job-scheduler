# Deployment Guide

Deploy your Job Scheduler app to the cloud in 10 minutes.

---

## 🚀 Step 1: Push to GitHub

1. Initialize git (if not already done):
```bash
cd C:\Users\abhik\OneDrive\Desktop\ReactProjects\dotix_Assignment
git init
```

2. Create `.gitignore`:
```bash
# See .gitignore files in root/frontend/backend
```

3. Commit and push:
```bash
git add .
git commit -m "Initial commit: Job Scheduler app"
git remote add origin https://github.com/YOUR-USERNAME/dotix-job-scheduler.git
git branch -M main
git push -u origin main
```

---

## 📱 Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"New Project"**
3. Select your GitHub repo (`dotix-job-scheduler`)
4. **Root Directory:** Select `frontend`
5. **Framework:** Auto-detect (React)
6. **Build Command:** `npm run build`
7. **Start Command:** `npm start`
8. **Environment Variables:**
   - Name: `REACT_APP_API_BASE`
   - Value: `https://your-backend-on-render.onrender.com` (get this after Step 3)
9. Click **Deploy** ✅

**Vercel Frontend URL:** `https://dotix-job-scheduler.vercel.app`

### Option B: Using Vercel CLI

```bash
npm install -g vercel

cd frontend
vercel
# Follow prompts, link to GitHub repo
```

---

## 🔧 Step 3: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (`dotix-job-scheduler`)
4. Configure:
   - **Name:** `dotix-job-scheduler-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free (or Starter)
5. **Environment Variables** → Add:
   - **Key:** `WEBHOOK_URL`
   - **Value:** `https://webhook.site/your-unique-id` (or your webhook service)
6. Click **Create Web Service** ✅

**Render Backend URL:** `https://dotix-job-scheduler-api.onrender.com`

---

## 🔗 Step 4: Link Frontend & Backend

### Update Frontend API URL

1. Go back to [vercel.com](https://vercel.com)
2. Select your frontend project
3. Settings → Environment Variables
4. Edit `REACT_APP_API_BASE`:
   - Value: `https://dotix-job-scheduler-api.onrender.com`
5. **Redeploy** (triggers auto-rebuild)

### Update Backend Webhook (Optional)

1. Get a test webhook URL from [webhook.site](https://webhook.site)
2. Go to [render.com](https://render.com)
3. Select backend project → Environment
4. Edit `WEBHOOK_URL` = your webhook.site URL
5. Save (auto-redeploys)

---

## ✅ Step 5: Test Deployed App

1. Open frontend: **https://dotix-job-scheduler.vercel.app**
2. Create a job
3. Click **Run**
4. Verify status updates
5. Check webhook.site for job completion POST ✅

---

## 📋 Deployment Checklist

- [ ] GitHub repo created and pushed
- [ ] Vercel project created (frontend)
- [ ] Render project created (backend)
- [ ] `REACT_APP_API_BASE` set in Vercel
- [ ] `WEBHOOK_URL` set in Render
- [ ] Both deployed and linked
- [ ] Frontend loads (no CORS errors)
- [ ] Create job works end-to-end
- [ ] Webhook fires on completion

---

## 🔍 Troubleshooting Deployed App

### Frontend Won't Connect to Backend
- Check browser console (F12)
- Verify `REACT_APP_API_BASE` in Vercel settings
- Confirm backend URL is correct (check Render dashboard)

### Backend Returns 502 Error
- Check Render logs: **Logs** tab
- Ensure `sqlite3` is in `package.json`
- Restart backend: **Manual Deploy** button in Render

### Webhook Not Firing
- Verify `WEBHOOK_URL` is set in Render env vars
- Test URL is accessible (curl from local terminal)
- Check Render logs for webhook errors

---

## 📦 Free Tier Limitations

- **Vercel:** 100 GB bandwidth/month (usually free tier sufficient)
- **Render:** 0.5 GB RAM, spins down after 15 min inactivity (cold starts 30sec)

For production, upgrade to paid plans.

---

## 🔐 Security Notes

- Never commit `.env` file (use `.env.example` template)
- Keep `WEBHOOK_URL` secret in Render env vars
- Use HTTPS URLs only
- Verify webhook signatures in production

---

## 📞 Support

- **Vercel Issues:** [vercel.com/docs](https://vercel.com/docs)
- **Render Issues:** [render.com/docs](https://render.com/docs)
- **CORS Problems:** Check backend CORS config in `index.js`

---

**Deployment Done! 🎉**

Share your live links:
- Frontend: `https://dotix-job-scheduler.vercel.app`
- Backend: `https://dotix-job-scheduler-api.onrender.com`
- GitHub: `https://github.com/YOUR-USERNAME/dotix-job-scheduler`
