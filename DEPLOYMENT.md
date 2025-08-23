# CapturedCCollective - Complete Deployment Guide

## Vercel Deployment (Recommended)

### Quick Start

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   ./deploy-vercel.sh
   ```

### Manual Deployment Steps

1. **Set Environment Variables in Vercel Dashboard**
   - Go to your Vercel project settings
   - Add these environment variables:
     ```
     DATABASE_URL=your_postgresql_connection_string
     OPENAI_API_KEY=your_openai_api_key
     NODE_ENV=production
     VERCEL=1
     ```
   - Optional (for SMS features):
     ```
     TWILIO_ACCOUNT_SID=your_twilio_account_sid
     TWILIO_AUTH_TOKEN=your_twilio_auth_token
     TWILIO_PHONE_NUMBER=your_twilio_phone_number
     ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

### Database Setup

Before deploying, ensure your PostgreSQL database is ready:

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push
```

### Vercel Configuration Files

The following files are configured for Vercel deployment:

- **`vercel.json`** - Main Vercel configuration
- **`api/index.ts`** - Serverless function entry point
- **`.vercelignore`** - Files to exclude from deployment
- **`.env.vercel`** - Environment variables template

### Project Structure for Vercel

```
CapturedCCollective/
├── api/                  # Vercel serverless functions
│   └── index.ts         # API entry point
├── dist/                # Built frontend files
│   └── public/          # Static assets
├── server/              # Express server code
├── client/              # React frontend source
├── shared/              # Shared types and schemas
├── vercel.json          # Vercel configuration
├── deploy-vercel.sh     # Deployment script
└── package.json         # Dependencies
```

### Features Available After Deployment

✅ **Core Features**

- Professional photography portfolio
- AI-powered booking system
- Client management dashboard
- Invoice generation with PDF export
- Admin analytics and reporting

✅ **Advanced Features**

- Real-time booking calendar
- Client portal with gallery access
- Automated email notifications
- Service management system
- Revenue tracking and analytics

✅ **AI Integration**

- OpenAI-powered booking assistant
- Image analysis and tagging
- Business insights and recommendations
- Predictive analytics

## Alternative Deployment Options

### Docker Deployment

Use the existing Docker configuration:

```bash
# Build and run with Docker
docker-compose up --build

# Or use the development setup
docker-compose -f docker-compose.dev.yml up
```

### Traditional VPS Deployment

1. **Setup Node.js environment**
2. **Install dependencies**: `npm install`
3. **Build the project**: `npm run build`
4. **Start the server**: `npm start`
5. **Configure reverse proxy** (Nginx/Apache)

## Environment Variables Reference

### Required Variables

| Variable         | Description                    | Example                               |
| ---------------- | ------------------------------ | ------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string   | `postgresql://user:pass@host:5432/db` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...`                              |
| `NODE_ENV`       | Environment mode               | `production`                          |

### Optional Variables

| Variable              | Description             | Default |
| --------------------- | ----------------------- | ------- |
| `TWILIO_ACCOUNT_SID`  | Twilio account SID      | None    |
| `TWILIO_AUTH_TOKEN`   | Twilio auth token       | None    |
| `TWILIO_PHONE_NUMBER` | Twilio phone number     | None    |
| `VERCEL`              | Vercel environment flag | `false` |

## Post-Deployment Checklist

- [ ] Database schema deployed and populated
- [ ] All environment variables configured
- [ ] SSL/TLS certificate configured
- [ ] Custom domain configured (if applicable)
- [ ] Admin user account created
- [ ] API endpoints responding correctly
- [ ] File upload functionality working
- [ ] Email notifications configured
- [ ] SMS notifications configured (if using Twilio)
- [ ] Analytics and monitoring setup

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check database server is accessible
   - Ensure database exists and schema is applied

2. **API Timeouts**
   - Vercel functions have 30-second timeout
   - Check for inefficient database queries
   - Verify external API responses

3. **Build Failures**
   - Check all dependencies are installed
   - Verify TypeScript compilation
   - Review build logs for specific errors

4. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify sensitive data is not exposed

### Performance Optimization

1. **Database Optimization**
   - Use connection pooling
   - Optimize queries with indexes
   - Implement caching where appropriate

2. **Frontend Optimization**
   - Leverage Vercel CDN
   - Optimize images and assets
   - Implement lazy loading

3. **API Optimization**
   - Minimize cold start times
   - Use appropriate timeout values
   - Implement proper error handling

## Support and Documentation

- **Main Documentation**: `README.md`
- **Docker Guide**: `README.Docker.md`
- **Vercel Guide**: `README.Vercel.md`
- **Project Overview**: `replit.md`

## Security Considerations

- Environment variables stored securely in Vercel
- Database connections use SSL/TLS
- API endpoints include proper authentication
- File uploads have security restrictions
- CORS configured for production domains
