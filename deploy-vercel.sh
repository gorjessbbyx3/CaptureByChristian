#!/bin/bash

# CapturedCCollective Vercel Deployment Script

echo "🚀 Starting Vercel deployment for CapturedCCollective..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Set environment variables reminder
echo "⚠️  IMPORTANT: Make sure you have set the following environment variables in your Vercel dashboard:"
echo "   - DATABASE_URL (required)"
echo "   - OPENAI_API_KEY (required)"
echo "   - TWILIO_ACCOUNT_SID (optional)"
echo "   - TWILIO_AUTH_TOKEN (optional)"
echo "   - TWILIO_PHONE_NUMBER (optional)"
echo "   - NODE_ENV=production"
echo "   - VERCEL=1"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "🔗 Your app should be available at the URL provided above"
echo ""
echo "📊 Next steps:"
echo "   1. Test all functionality on the deployed site"
echo "   2. Configure your custom domain (if applicable)"
echo "   3. Set up monitoring and analytics"
echo "   4. Run database migrations if needed"