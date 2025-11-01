# 🚀 Quick 5-Step Deployment Guide

## Step 1: Push Code to GitHub
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Deploy Backend on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `wecaare-insurance-api`
   - **Root Directory**: Leave empty
   - **Environment**: Leave as default (or select "Maven")
   - **Build Command**: `cd backend && mvn clean package -DskipTests`
   - **Start Command**: `cd backend && java -jar target/insurance-portal-1.0.0.jar`
5. Click **"Create Web Service"**

## Step 3: Set Backend Environment Variables

In the backend service settings → **"Environment"** tab, add:

```bash
PORT=10000
JWT_SECRET=<generate-a-random-64-char-string>
JWT_EXPIRATION=86400000
CORS_ORIGINS=https://your-frontend-url.onrender.com
LOG_LEVEL=INFO
JAVA_VERSION=17
```

**Important:** 
- Generate JWT_SECRET: Use an online generator or `openssl rand -base64 64`
- Leave `CORS_ORIGINS` for now - update after Step 4 with your actual frontend URL

## Step 4: Deploy Frontend on Render

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `wecaare-insurance-frontend`
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `20`
4. In **"Environment"** tab, add:
   ```bash
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```
   (Replace with your actual backend URL from Step 2)
5. Click **"Create Static Site"**

## Step 5: Update CORS in Backend

1. Copy your frontend URL (from Step 4)
2. Go back to backend service → **"Environment"** tab
3. Update `CORS_ORIGINS`:
   ```bash
   CORS_ORIGINS=https://your-actual-frontend-url.onrender.com
   ```
4. Click **"Save Changes"** - this will trigger a redeploy

## ✅ Done!

- Backend: `https://your-backend-url.onrender.com/api`
- Frontend: `https://your-frontend-url.onrender.com`
- Login with: `smitha` / `smithamg33` (admin) or `wecare` / `wecare` (staff)

---

**Troubleshooting:** Check logs in Render dashboard if something doesn't work.

