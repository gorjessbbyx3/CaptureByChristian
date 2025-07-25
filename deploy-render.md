# 🚀 Quick Render Deployment Guide

## **1. Prepare Repository**
```bash
# Commit all changes
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## **2. Create Database on Render**
1. Go to [render.com](https://render.com) → New PostgreSQL
2. **Name**: `capturedbychristian-db`
3. **Database**: `capturedcollective`
4. **Plan**: Free or Starter
5. Copy the **Internal Database URL** (starts with `postgresql://`)

## **3. Create Web Service**
1. **New Web Service** → Connect GitHub repo
2. **Settings**:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18+ (auto-detected)

## **4. Add Environment Variables**
In the Render dashboard, add these:

```env
NODE_ENV=production
DATABASE_URL=postgresql://[FROM YOUR DATABASE]
PORT=5000
OPENAI_API_KEY=sk-your-key-here
SESSION_SECRET=your-secure-secret-123
```

Optional:
```env
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

## **5. Deploy!**
- Render automatically builds and deploys
- Check logs for any issues
- Visit your app URL when deployment completes

## **6. Test Your App**
- Main site: `https://your-app.onrender.com`
- Health check: `https://your-app.onrender.com/api/health`
- Admin: `https://your-app.onrender.com/admin`

## **🎯 That's it!** Your photography app is live! 📸

---

### **Troubleshooting**
- **Build fails**: Check Node.js version and npm logs
- **Database connection**: Verify `DATABASE_URL` is correct
- **App crashes**: Check environment variables and logs
- **Slow start**: Free tier takes ~30 seconds to wake up