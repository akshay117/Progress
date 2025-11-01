# 🚀 Render Deployment Guide for WeCare Insurance Portal

This guide will walk you through deploying both the backend (Spring Boot) and frontend (React/Vite) to Render.

## 🎯 Quick Answer: Using Existing Docker Images

**Yes, you can use existing Docker images on Render!** Here's how:

1. **Push your Docker image to a registry** (Docker Hub, GitHub Container Registry, etc.)
   ```bash
   docker tag your-image:tag yourusername/wecaare-backend:latest
   docker push yourusername/wecaare-backend:latest
   ```

2. **In Render**, create a Web Service:
   - Select **"Docker"** as the environment
   - Enter your Docker image: `yourusername/wecaare-backend:latest`
   - Configure environment variables (see Step 4 below)

**However, the recommended approach for this project is:**
- **Backend**: Build from source using Maven (standard deployment) or Dockerfile
- **Frontend**: Deploy as Static Site (fastest and simplest)

Continue reading for complete step-by-step instructions.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database**: SQLite (default, already configured) or PostgreSQL (optional, for production)

---

## 🎯 Deployment Options

### Option 1: Standard Deployment (Recommended)
- Backend: Web Service on Render (with SQLite)
- Frontend: Static Site on Render
- Database: SQLite (file-based, no separate service needed)

### Option 2: Docker Deployment (If you prefer containers)
- Build and push Docker images
- Deploy as Docker Web Services

### Option 3: PostgreSQL Deployment (Optional - for production)
- Backend: Web Service on Render
- Frontend: Static Site on Render  
- Database: PostgreSQL on Render (separate service)

---

## 🐳 Using Existing Docker Images

If you have existing Docker images, you can:

1. **Push images to Docker Hub or Container Registry**
   ```bash
   docker build -t yourusername/wecaare-backend:latest ./backend
   docker push yourusername/wecaare-backend:latest
   ```

2. **In Render**, create a Web Service and select:
   - **Environment**: `Docker`
   - **Docker Image**: `yourusername/wecaare-backend:latest`
   - **Docker Registry**: Docker Hub (or your registry)

3. **Configure environment variables** as described below

**Note**: For this guide, we'll use **standard deployment** (Maven build) or **Dockerfile-based deployment** (images built on Render).

---

## 📦 Part 1: Deploy Backend (Spring Boot)

### Step 1: Database Setup - SQLite (Default)

**SQLite is already configured!** The application uses SQLite by default, which works well for:
- Small to medium applications
- Single-instance deployments
- Simpler setup (no separate database service needed)

**Important Notes for SQLite on Render:**
- SQLite database file will persist within the service's file system
- Data persists across deployments as long as the service doesn't get destroyed
- For production with high traffic, consider PostgreSQL (optional - see below)

**For SQLite**: No additional setup needed! Just proceed to Step 2.

---

### Step 1b: Optional - PostgreSQL Setup (For Production/High Traffic)

If you prefer PostgreSQL for better scalability and reliability:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `wecaare-insurance-db`
   - **Database**: `insurance`
   - **User**: Auto-generated
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 15 (or latest)
   - **Plan**: Free tier is fine for testing
4. Click **"Create Database"**
5. **Save the Internal Database URL** - you'll use it in environment variables

**Note**: PostgreSQL dependency is already in `pom.xml`, and the app will auto-detect based on `DATABASE_URL`.

### Step 3: Create Backend Web Service on Render

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the repository containing your code
4. Configure the service:

   **Basic Settings:**
   - **Name**: `wecaare-insurance-api`
   - **Environment**: `Docker` (if using Docker) or `Maven` (if standard)
   - **Region**: Same as database
   - **Branch**: `main` (or your deployment branch)

   **For Standard Deployment (Maven):**
   - **Build Command**: `cd backend && mvn clean package -DskipTests`
   - **Start Command**: `cd backend && java -jar target/insurance-portal-1.0.0.jar`
   - **Root Directory**: Leave empty (or set to `backend` if repo root)

   **For Docker Deployment:**
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Docker Context**: `backend`

### Step 4: Configure Environment Variables for Backend

In the Render service settings, go to **"Environment"** tab and add:

#### For SQLite (Default - Recommended):

```bash
# Server - Render automatically sets PORT
PORT=10000

# Database - Leave empty or omit to use SQLite
# The app will use SQLite if DATABASE_URL is not set

# JWT Configuration
JWT_SECRET=<generate-a-strong-secret-key-64-chars-minimum>
JWT_EXPIRATION=86400000

# CORS (will be set after frontend is deployed)
CORS_ORIGINS=https://your-frontend-url.onrender.com

# Logging
LOG_LEVEL=INFO

# Java Version (for Render to use correct Java version)
JAVA_VERSION=17
```

#### For PostgreSQL (Optional):

```bash
# Server
PORT=10000

# Database - Use the Internal Database URL from your PostgreSQL service
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@dpg-xxxxx-a/insurance

# For PostgreSQL, set platform
DB_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
DB_DRIVER=org.postgresql.Driver
DB_DDL_AUTO=update

# JWT Configuration
JWT_SECRET=<generate-a-strong-secret-key-64-chars-minimum>
JWT_EXPIRATION=86400000

# CORS (will be set after frontend is deployed)
CORS_ORIGINS=https://your-frontend-url.onrender.com

# Logging
LOG_LEVEL=INFO

# Java Version
JAVA_VERSION=17
```

**Important Notes:**
- **For SQLite**: Don't set `DATABASE_URL` - the app will use SQLite automatically
- **For PostgreSQL**: Copy the **Internal Database URL** from your PostgreSQL service
- Generate a strong JWT_SECRET: `openssl rand -base64 64` or use an online generator
- Update `CORS_ORIGINS` after frontend deployment with your actual frontend URL

### Step 5: Database Schema Setup

**For SQLite:**
- Tables will be created automatically on first run (if `DB_DDL_AUTO=update`)
- Or the app uses existing schema from your code
- The SQLite database file will be stored at: `./database/insurance.db` in the service

**For PostgreSQL:**
- Tables will be auto-created on first run if `DB_DDL_AUTO=update`
- Or manually run the schema from `backend/config/schema.sql`

---

## 🎨 Part 2: Deploy Frontend (React/Vite)

### Step 1: Create Static Site on Render

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository (same repo)
3. Configure:

   **Build Settings:**
   - **Name**: `wecaare-insurance-frontend`
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `/` if needed)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `18` or `20`

### Step 2: Configure Environment Variables for Frontend

In the Static Site settings, go to **"Environment"** tab:

```bash
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

**Important:** Replace `your-backend-url` with your actual backend Render URL (you'll get this after backend deployment).

### Step 3: Update Backend CORS

After frontend is deployed, get your frontend URL and update the backend's `CORS_ORIGINS` environment variable:

```
CORS_ORIGINS=https://your-frontend-url.onrender.com
```

Then manually deploy/restart the backend service.

---

## 🐳 Part 3: Docker Deployment (Alternative)

If you prefer Docker deployment, here's how:

### Create Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/insurance-portal-1.0.0.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Create Frontend Dockerfile (Optional - if using Web Service instead of Static Site)

Create `Dockerfile` in root:

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Run stage (for serving static files)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📝 Part 4: Database Initialization

The `DataInitializer` component will automatically create users on startup:
- **Admin**: `smitha` / `smithamg33`
- **Staff**: `wecare` / `wecare`

However, for PostgreSQL, you may need to:

1. **Option A: Let Hibernate create tables** (if `DB_DDL_AUTO=update`)
   - Tables will be created automatically
   - Users will be initialized automatically

2. **Option B: Manual schema creation**
   - Connect to PostgreSQL database
   - Run `backend/config/schema.sql` manually

---

## 🔧 Part 5: Post-Deployment Checklist

### Backend Verification

1. ✅ Check backend logs in Render dashboard
2. ✅ Verify `/api/health` endpoint works
3. ✅ Test login endpoint: `POST /api/auth/login`

### Frontend Verification

1. ✅ Frontend loads without errors
2. ✅ Can login with credentials:
   - Admin: `smitha` / `smithamg33`
   - Staff: `wecare` / `wecare`
3. ✅ API calls are working

### Security Checklist

1. ✅ Strong JWT_SECRET is set
2. ✅ CORS is configured correctly
3. ✅ Database credentials are secure
4. ✅ HTTPS is enabled (automatic on Render)

---

## 🔄 Part 6: Continuous Deployment

Render automatically deploys on:
- Push to the configured branch
- Manual deploy trigger

To trigger manual deployment:
1. Go to your service in Render
2. Click **"Manual Deploy"**
3. Select branch and deploy

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Database connection fails**
- Check `DATABASE_URL` format
- Verify database is running
- Check firewall/network settings

**Problem: Port binding errors**
- Ensure `PORT` environment variable is set
- Render uses `PORT` env var, not `server.port`

**Problem: JWT errors**
- Verify `JWT_SECRET` is set
- Check token expiry settings

### Frontend Issues

**Problem: API calls fail**
- Check `VITE_API_BASE_URL` is correct
- Verify backend CORS allows frontend origin
- Check browser console for CORS errors

**Problem: Build fails**
- Check Node version (use 18 or 20)
- Verify all dependencies in `package.json`
- Check build logs in Render

---

## 📊 Resource Requirements

### Free Tier Limits:
- **Web Services**: 750 hours/month
- **PostgreSQL**: 90 hours/month
- **Static Sites**: Unlimited

### Recommended Plan for Production:
- **Backend**: Starter ($7/month) for better performance
- **Database**: Starter ($7/month) for better reliability
- **Frontend**: Free tier is fine for static sites

---

## 🔗 URLs After Deployment

After deployment, you'll have:
- **Backend API**: `https://wecaare-insurance-api.onrender.com/api`
- **Frontend**: `https://wecaare-insurance-frontend.onrender.com`
- **Database**: Internal URL (only accessible from backend)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Spring Boot on Render](https://render.com/docs/deploy-spring-boot)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Static Sites on Render](https://render.com/docs/static-sites)

---

## ✅ Quick Start Summary

1. **Create PostgreSQL database** on Render
2. **Create backend Web Service** with Maven or Docker
3. **Set environment variables** for backend
4. **Deploy backend** and note the URL
5. **Create frontend Static Site**
6. **Set `VITE_API_BASE_URL`** to backend URL
7. **Deploy frontend**
8. **Update backend `CORS_ORIGINS`** with frontend URL
9. **Test the application**

---

**Need help?** Check Render logs in the dashboard for detailed error messages.

