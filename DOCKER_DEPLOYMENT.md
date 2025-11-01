# 🐳 Docker Deployment Guide for Render

This guide covers deploying the unified Docker container (frontend + backend) to Render.

## 📋 Prerequisites

- Code pushed to GitHub
- Render account

## 🚀 Deployment Steps

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Add unified Dockerfile for frontend + backend"
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository

### Step 3: Configure Render Service

**Basic Settings:**
- **Name**: `wecaare-insurance-portal`
- **Environment**: `Docker`
- **Region**: Choose closest to you
- **Branch**: `main`

**Docker Settings:**
- **Docker Build Context Directory**: `.` (root directory)
- **Dockerfile Path**: `./Dockerfile`

**Health Check:**
- **Health Check Path**: `/api/health`
  - Nginx proxies `/api/*` to Spring Boot, so `/api/health` works

**Auto-Deploy:**
- ✅ **Auto-Deploy**: On Commit (enabled by default)

### Step 4: Set Environment Variables

In the **"Environment"** tab, add:

```bash
# Server port (Render sets PORT automatically, but nginx listens on 80)
# Don't set PORT - let Render handle it, or set to 80 if needed

# Backend server port (internal, Spring Boot uses this)
SERVER_PORT=5001

# JWT Configuration
JWT_SECRET=<generate-a-random-64-char-string>
JWT_EXPIRATION=86400000

# CORS (not needed since nginx proxies, but good to have)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Logging
LOG_LEVEL=INFO

# Java
JAVA_VERSION=17

# Frontend API URL (optional, for build-time)
VITE_API_BASE_URL=/api
```

**Important Notes:**
- `PORT` is for Render's external port (nginx listens on 80)
- `SERVER_PORT` or backend will use default 5001 internally
- `VITE_API_BASE_URL=/api` ensures frontend calls go to `/api` which nginx proxies
- Generate JWT_SECRET: Use online generator or `openssl rand -base64 64`

### Step 5: Deploy and Test

1. Click **"Create Web Service"**
2. Wait for build to complete (takes 5-10 minutes first time)
3. Once deployed, visit your Render URL
4. Login with:
   - **Admin**: `smitha` / `smithamg33`
   - **Staff**: `wecare` / `wecare`

## 🏗️ How It Works

1. **Docker Build Process:**
   - Builds frontend (React/Vite) → outputs to `/var/www/html`
   - Builds backend (Spring Boot) → creates JAR file
   - Combines both in final image

2. **Runtime:**
   - **Supervisor** manages both services:
     - **Spring Boot** runs on port 5001 (internal)
     - **Nginx** runs on port 80 (external, receives all traffic)
   - **Nginx configuration:**
     - Proxies `/api/*` requests → Spring Boot (port 5001)
     - Serves static files → Frontend build from `/var/www/html`

3. **Request Flow:**
   ```
   Browser → Render (port 80) → Nginx → /api/* → Spring Boot (5001)
                                  └─> /* → Static Files (Frontend)
   ```

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all files are committed to GitHub
- Verify Dockerfile path is correct

### Backend Not Starting
- Check supervisor logs: Container logs show backend.out.log
- Verify environment variables are set
- Check JWT_SECRET is set

### Frontend Can't Reach Backend
- Ensure `VITE_API_BASE_URL=/api` is set
- Check nginx configuration is correct
- Verify Spring Boot is running on port 5001

### Health Check Failing
- Ensure path is `/api/health`
- Check backend logs for errors
- Verify Spring Boot started successfully

## 📝 Important Notes

- **Single Container**: Both frontend and backend run in one container
- **Port Mapping**: External port 80 (nginx) → Internal port 5001 (Spring Boot)
- **No Separate Frontend Service**: Frontend is served as static files from the same container
- **Database**: SQLite database is stored in `/app/database/` inside container
- **Logs**: Check Render logs for both nginx and Spring Boot output

## 🎯 Advantages of Unified Docker Approach

✅ Single deployment  
✅ No CORS issues (same origin)  
✅ Simpler configuration  
✅ Lower cost (one service instead of two)  
✅ Easier SSL/HTTPS (single domain)

## 🔄 Updating the Application

1. Make changes to code
2. Commit and push to GitHub
3. Render automatically rebuilds and redeploys
4. Changes are live in ~5-10 minutes

---

**Need Help?** Check Render logs in the dashboard for detailed error messages.

