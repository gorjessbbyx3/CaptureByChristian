# 🚀 Render Deployment Guide - Captured by Christian

## **Quick Start (5 minutes)**

### **Option 1: One-Click Deploy**
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### **Option 2: Manual Deployment**

## **📋 Prerequisites**
- [ ] Render account (free tier works)
- [ ] GitHub repository with your code
- [ ] Environment variables configured

## **🔧 Step-by-Step Deployment**

### **1. Repository Setup**
```bash
# Ensure your repo has these files:
# - Dockerfile.render
# - render-production.yaml
# - package.json
# - All source code
```

### **2. Render Configuration**

#### **Create New Web Service**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|--------|
| **Name** | `capturedbychristian-app` |
| **Environment** | `Docker` |
| **Dockerfile Path** | `./Dockerfile.render` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `./start.sh` |
| **Port** | `7000` |

### **3. Environment Variables**

#### **Required Variables**
Add these in Render dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | PostgreSQL connection | Auto-generated |
| `SESSION_SECRET` | Session encryption | Auto-generated |
| `JWT_SECRET` | JWT signing | Auto-generated |

#### **External Services (Optional)**
| Variable | Service | Get From |
|----------|---------|----------|
| `OPENAI_API_KEY` | AI Assistant | [OpenAI Dashboard](https://platform.openai.com/api-keys) |
| `TWILIO_ACCOUNT_SID` | SMS/Phone | [Twilio Console](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | SMS/Phone | [Twilio Console](https://console.twilio.com) |
| `TWILIO_PHONE_NUMBER` | SMS/Phone | [Twilio Console](https://console.twilio.com) |

### **4. Database Setup**

#### **Create PostgreSQL Database**
1. In Render dashboard: "New" → "PostgreSQL"
2. Configure:
   - **Name**: `capturedbychristian-db`
   - **Plan**: Starter (free tier)
   - **Database**: `capturedcollective`
   - **User**: `postgres`

3. **Auto-migration**: Database will auto-initialize on first deploy

### **5. Deploy**

#### **Using Render Dashboard**
1. Click "Create Web Service"
2. Wait for build (~3-5 minutes)
3. Check logs for successful startup
4. Test health endpoint: `https://your-app.onrender.com/api/health`

#### **Using CLI (Advanced)**
```bash
# Install Render CLI
npm install -g @render/cli

# Deploy
render deploy --file render-production.yaml
```

## **🔍 Verification Steps**

### **After Deployment**
1. **Health Check**: Visit `/api/health`
2. **Admin Login**: Visit `/admin-login`
   - Username: `CapturedbyChristian`
   - Password: `Wordpass3211`
3. **Client Portal**: Visit `/client-portal`
4. **Main Website**: Visit `/`

### **Test All Features**
- ✅ Admin dashboard access
- ✅ Client portal functionality
- ✅ Booking system
- ✅ Contact forms
- ✅ AI chat features
- ✅ Gallery management

## **📊 Performance Optimization**

### **Render Settings**
- **Auto-deploy**: Enabled (on git push)
- **Health checks**: Every 30s
- **Auto-restart**: Enabled on failure
- **Scaling**: Manual (free tier) or auto-scaling (paid)

### **Database Optimization**
- **Connection pooling**: Enabled
- **SSL**: Always enabled
- **Backups**: Daily automated backups

## **🛠️ Troubleshooting**

### **Common Issues**

#### **Build Fails**
```bash
# Check logs in Render dashboard
# Common fixes:
1. Ensure all dependencies in package.json
2. Check Dockerfile.render syntax
3. Verify build command works locally
```

#### **Database Connection Issues**
```bash
# Test locally:
docker-compose -f docker-compose.render.yml up
```

#### **Port Issues**
- Render automatically sets `PORT` environment variable
- Ensure your app listens on `process.env.PORT || 7000`

### **Log Access**
- **Build logs**: Available in Render dashboard
- **Runtime logs**: `render logs capturedbychristian-app`

## **🔄 Continuous Deployment**

### **Auto-Deploy Setup**
1. **GitHub Integration**: Connect your repository
2. **Auto-deploy**: Enabled by default
3. **Branch**: Set to `main` or `master`
4. **Preview Deployments**: Enabled for PRs

### **Manual Deploy**
```bash
# Push to trigger auto-deploy
git push origin main

# Or use Render CLI
render deploy
```

## **📞 Support**

### **Render Support**
- **Documentation**: [render.com/docs](https://render.com/docs)
- **Community**: [render.com/community](https://render.com/community)
- **Status**: [status.render.com](https://status.render.com)

### **Application Support**
- **Issues**: Create GitHub issue
- **Logs**: Check Render dashboard logs
- **Health**: Monitor `/api/health` endpoint

## **🎯 Success Checklist**

After deployment, verify:
- [ ] Application loads at your Render URL
- [ ] Admin login works (`/admin-login`)
- [ ] Client portal accessible (`/client-portal`)
- [ ] Booking system functional (`/booking`)
- [ ] Database migrations completed
- [ ] All API endpoints responding
- [ ] Health check passing

## **🚀 Next Steps**

1. **Custom Domain**: Add your custom domain in Render settings
2. **SSL Certificate**: Auto-provisioned by Render
3. **Monitoring**: Set up alerts in Render dashboard
4. **Scaling**: Upgrade plan as needed for traffic

**Estimated deployment time: 5-10 minutes**
