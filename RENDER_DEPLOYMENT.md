# 🚀 Deploy CaptureByChristian on Render

This guide will help you deploy your photography business application on Render with PostgreSQL database.

## Prerequisites

- ✅ Render account (free tier available)
- ✅ GitHub account with your code repository
- ✅ API keys (OpenAI, Twilio) ready

## 🗂️ **Step 1: Push Code to GitHub**

1. **Create a new GitHub repository** (if not already done):

   ```bash
   # From your project directory
   git init
   git add .
   git commit -m "Initial commit - CaptureByChristian photography app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/CaptureByChristian.git
   git push -u origin main
   ```

## 🗄️ **Step 2: Create PostgreSQL Database on Render**

1. **Go to [Render Dashboard](https://render.com/)**
2. **Click "New +" → "PostgreSQL"**
3. **Configure database:**
   - **Name**: `capturedbychristian-db`
   - **Database Name**: `capturedcollective`
   - **User**: `postgres`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. **Click "Create Database"**
5. **Save the connection details** (you'll need them)

## 🌐 **Step 3: Deploy Web Service**

1. **Click "New +" → "Web Service"**
2. **Connect GitHub repository**: `YOUR_USERNAME/CaptureByChristian`
3. **Configure service:**
   - **Name**: `capturedbychristian-app`
   - **Runtime**: `Node`
   - **Branch**: `main`
   - **Root Directory**: leave blank
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

## ⚙️ **Step 4: Environment Variables**

Add these environment variables in Render's dashboard:

### Required Variables

```env
NODE_ENV=production
DATABASE_URL=[COPY FROM YOUR POSTGRESQL SERVICE]
PORT=7000
```

### API Keys (Replace with your actual keys)

```env
OPENAI_API_KEY=sk-your-openai-key-here
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
SESSION_SECRET=your-secure-session-secret-here
```

### Optional

```env
REPLIT_AI_TOKEN=your-replit-token (if using Replit AI)
```

## 📋 **Step 5: Database Setup**

The application will automatically:

- ✅ Create database if it doesn't exist
- ✅ Run migrations on startup
- ✅ Initialize tables and schema
- ✅ Set up indexes and relationships

No manual database setup required!

## 🔗 **Step 6: Custom Domain (Optional)**

1. **In your web service settings:**
   - Go to "Settings" → "Custom Domains"
   - Add your domain (e.g., `capturedbychristian.com`)
   - Follow DNS configuration instructions

## 🧪 **Step 7: Test Deployment**

Once deployed, test these endpoints:

- `https://your-app.onrender.com/` - Main website
- `https://your-app.onrender.com/api/health` - Health check
- `https://your-app.onrender.com/admin` - Admin dashboard
- `https://your-app.onrender.com/client-portal` - Client portal

## 📊 **Step 8: Monitor & Scale**

### Health Monitoring

- Render automatically monitors `/api/health`
- Set up alerts in Render dashboard
- Monitor logs in real-time

### Scaling

- **Free Tier**: Sleeps after 15 min inactivity
- **Paid Plans**: Always on, auto-scaling available

## 🔧 **Environment-Specific Configuration**

### Development vs Production

The app automatically detects environment and:

- **Development**: Uses local database, detailed logging
- **Production**: Uses Render PostgreSQL, optimized performance

### File Uploads

- **Current**: Local file storage in `/attached_assets`
- **Recommendation**: Use Cloudinary or AWS S3 for production

## 🔒 **Security Best Practices**

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS**: Render provides SSL automatically
3. **Database**: Use connection pooling for better performance
4. **API Keys**: Rotate periodically

## 🚀 **Deploy Now!**

1. **Create services on Render**
2. **Set environment variables**
3. **Deploy and test**
4. **Configure custom domain**
5. **Monitor and scale**

## 📞 **Need Help?**

- **Render Docs**: <https://render.com/docs>
- **Application Logs**: Check Render dashboard
- **Database Issues**: Verify `DATABASE_URL` format

---

## 🎯 **Production Checklist**

- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Health check endpoint working
- [ ] Admin login functional
- [ ] Client portal accessible
- [ ] File uploads working
- [ ] Email notifications (if configured)
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring set up

Your photography business application is now live! 📸✨
