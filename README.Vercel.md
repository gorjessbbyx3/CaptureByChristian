# CapturedCCollective - Vercel Deployment Guide

This guide covers deploying the CapturedCCollective photography platform to Vercel.

## Prerequisites

1. **Database Setup**: Set up a PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)
2. **OpenAI API Key**: Required for AI booking assistance features
3. **Twilio Account** (Optional): For SMS notifications

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Configure Environment Variables

In your Vercel project dashboard, add the following environment variables:

**Required:**
- `DATABASE_URL`: Your PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: Set to `production`
- `VERCEL`: Set to `1`

**Optional:**
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number

### 4. Database Setup

Before deploying, ensure your database is set up:

```bash
# Push database schema
npm run db:push
```

### 5. Deploy to Vercel

```bash
# Deploy to Vercel
vercel --prod
```

## Configuration Files

### vercel.json
The project includes a `vercel.json` configuration file that:
- Sets up the API serverless functions
- Configures static file serving for the frontend
- Routes API requests to the backend
- Sets proper environment variables

### Project Structure for Vercel

```
project/
├── api/
│   └── index.ts          # Vercel serverless function entry point
├── dist/                 # Built frontend files
├── server/               # Express server code
├── client/               # React frontend source
├── shared/               # Shared types and schemas
├── vercel.json           # Vercel configuration
└── package.json          # Project dependencies
```

## Build Process

1. **Frontend Build**: Vite builds the React application to `dist/`
2. **API Functions**: Vercel automatically builds the serverless functions from `api/`
3. **Static Assets**: Frontend files are served from `dist/`

## Features in Production

- **Serverless API**: All backend functionality runs as Vercel functions
- **Static Frontend**: Optimized React build served from CDN
- **Database Integration**: PostgreSQL database with connection pooling
- **AI Features**: OpenAI integration for booking assistance
- **File Uploads**: Image upload and gallery management
- **Admin Dashboard**: Complete business management interface
- **Client Portal**: Professional client-facing portal

## Monitoring and Logs

- **Vercel Dashboard**: Monitor deployments and function performance
- **Function Logs**: View API logs in the Vercel dashboard
- **Analytics**: Built-in analytics for performance monitoring

## Custom Domain

1. Add your custom domain in the Vercel dashboard
2. Configure DNS settings as instructed
3. SSL certificates are automatically managed

## Environment-Specific Features

**Development:**
- Hot module reloading
- Development server with Vite
- Local database connection

**Production (Vercel):**
- Serverless functions
- CDN-served static assets
- Production database
- Automatic SSL/TLS

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure DATABASE_URL is correctly set
2. **API Timeouts**: Functions have a 30-second timeout limit
3. **File Uploads**: Large files may need streaming or chunked uploads
4. **Environment Variables**: Verify all required variables are set

### Performance Optimization

1. **Cold Starts**: Functions may have cold start latency
2. **Database Connections**: Connection pooling is implemented
3. **Static Assets**: Automatically optimized by Vercel CDN

## Support

For deployment issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connectivity
4. Review API endpoint responses