# 🚀 Complete Docker Deployment Guide for Render

## 📋 Prerequisites
- ✅ Docker installed locally
- ✅ Render account with PostgreSQL database created
- ✅ Environment variables configured on Render

## 🔧 Database Connection Timeout Fix

I've created the following files to resolve the database connection timeout issue:

### 1. Database Readiness Check Script
- `docker-scripts/wait-for-db.js` - Node.js script to wait for PostgreSQL
- `docker-scripts/start.sh` - Updated startup script with database checks

### 2. Updated Dockerfile
Your existing Dockerfile already includes the startup script.

## 🏗️ Local Testing with Docker

### Build and Test Locally:
```bash
# Build the Docker image
docker build -t capture-by-christian .

# Run with docker-compose (includes PostgreSQL)
docker-compose up --build

# Test database connection
docker-compose exec app node docker-scripts/wait-for-db.js
```

## 🚀 Deploy to Render with Docker

### Option 1: GitHub Auto-Deploy (Recommended)
1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add database connection fixes"
   git push origin main
   ```

2. **Create Web Service on Render**
   - Go to [Render Dashboard](https://render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Environment**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Build Command**: (leave blank - uses Dockerfile)
   - **Start Command**: `./start.sh`

3. **Set Environment Variables**
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
   PORT=5000
   OPENAI_API_KEY=sk-your-key-here
   SESSION_SECRET=your-secure-secret-here
   ```

### Option 2: Docker Registry
1. **Build and Push to Docker Hub**
   ```bash
   # Build image
   docker build -t yourusername/capture-by-christian:latest .

   # Push to Docker Hub
   docker push yourusername/capture-by-christian:latest
   ```

2. **Deploy from Docker Hub**
   - Create Web Service on Render
   - Select "Deploy from Docker Hub"
   - Enter image name: `yourusername/capture-by-christian:latest`

## 🔍 Troubleshooting Database Connection

### Common Issues and Solutions:

1. **Connection Timeout**
   - ✅ Fixed with wait-for-db.js script
   - ✅ Added retry logic with exponential backoff

2. **Environment Variables**
   - Ensure DATABASE_URL is correctly formatted
   - Check for special characters in password

3. **Database Health Check**
   - Use Render's built-in health monitoring
   - Monitor logs in Render dashboard

## 📊 Verification Steps

### After Deployment:
1. **Health Check**: `https://your-app.onrender.com/api/health`
2. **Database Connection**: Check Render logs for successful connection
3. **Full App Test**: Navigate through all pages and features

## 🔄 Continuous Deployment

### Auto-Deploy Setup:
- Enable "Auto-Deploy" in Render settings
- Push to main branch triggers automatic rebuild
- Database migrations run automatically on startup

## 📞 Support

If issues persist:
1. Check Render logs for detailed error messages
2. Verify database credentials in environment variables
3. Test database connection locally with the same credentials
4. Contact Render support if database issues continue

Your app is now ready for Docker deployment on Render with robust database connection handling! 🎉
