# CaptureByChristian - Photography Business Platform

A comprehensive photography business management platform built with modern web technologies. This full-stack application provides client management, booking systems, portfolio showcasing, and business analytics for professional photographers.

## 🚀 Features

### Client Management System
- Complete CRM with lead scoring and pipeline management
- Contact form integration with AI-powered lead analysis
- Client portal for booking management and gallery access
- Communication tracking and follow-up scheduling

### Booking & Scheduling
- Interactive calendar with availability management
- AI-powered booking assistant for customer inquiries
- Service package management with pricing
- Automated booking confirmations and reminders

### Portfolio & Gallery Management
- Password-protected portfolio showcase
- Client gallery delivery system
- High-resolution image upload and management
- Featured work curation

### Business Operations
- Invoice generation with PDF export
- Digital contract signing
- Revenue tracking and analytics
- Service management and pricing

### Admin Dashboard
- Real-time analytics and reporting
- Client relationship insights
- Booking calendar management
- Revenue and performance metrics

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript, Vite, Wouter routing
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **AI**: OpenAI API integration
- **Deployment**: Vercel (recommended) or Docker

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key (for AI features)
- Optional: Twilio account (for SMS features)

## ⚡ Quick Start

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd CaptureByChristian

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Database Configuration

```bash
# Set your database URL in .env
DATABASE_URL=postgresql://user:pass@host:5432/capturedccollective

# Deploy database schema
npm run db:push

# Optional: Load sample data
npm run db:seed
```

### 3. Start Development Server

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📊 Database Management

```bash
# Deploy schema changes
npm run db:push

# Open database studio
npm run db:studio

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
./deploy-vercel.sh
```

### Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up --build
```

## 📁 Project Structure

```
CaptureByChristian/
├── client/src/          # React frontend
│   ├── components/      # UI components
│   │   ├── admin/       # Admin dashboard components
│   │   ├── client-portal/ # Client portal components
│   │   └── ui/          # Reusable UI components
│   ├── pages/           # Route components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and API client
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── db.ts           # Database connection
│   ├── storage.ts      # Data access layer
│   └── openai.ts       # AI integration
├── shared/              # Shared TypeScript schemas
├── migrations/          # Database migrations
└── attached_assets/     # File uploads
```

## 🔧 Environment Variables

### Required

```env
DATABASE_URL=postgresql://user:pass@host:5432/capturedccollective
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

### Optional

```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
VERCEL=1  # For Vercel deployment
```

## 📖 API Documentation

The application provides RESTful API endpoints for:

- Client management (`/api/clients`)
- Booking operations (`/api/bookings`)
- Service management (`/api/services`)
- Gallery operations (`/api/gallery`)
- Contract handling (`/api/contracts`)
- Invoice generation (`/api/invoices`)

## 🔐 Authentication

- Admin authentication with session management
- Client portal access with secure login
- Role-based access control

## 🎨 Customization

The platform is designed to be easily customizable:

- Brand colors and styling via Tailwind CSS
- Business information in database profiles
- Service packages and pricing
- AI assistant prompts and responses

## 📞 Support

For detailed setup instructions, see:

- [`DATABASE_SETUP.md`](DATABASE_SETUP.md) - Database configuration
- [`DEPLOYMENT.md`](DEPLOYMENT.md) - Deployment guide
- [`CLAUDE.md`](CLAUDE.md) - Development guidance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

# CaptureByChristian - Photography Business Platform

A comprehensive photography business management platform built with modern web technologies. This full-stack application provides client management, booking systems, portfolio showcasing, and business analytics for professional photographers.

## 🚀 Features

### Client Management System
- Complete CRM with lead scoring and pipeline management
- Contact form integration with AI-powered lead analysis
- Client portal for booking management and gallery access
- Communication tracking and follow-up scheduling

### Booking & Scheduling
- Interactive calendar with availability management
- AI-powered booking assistant for customer inquiries
- Service package management with pricing
- Automated booking confirmations and reminders

### Portfolio & Gallery Management
- Password-protected portfolio showcase
- Client gallery delivery system
- High-resolution image upload and management
- Featured work curation

### Business Operations
- Invoice generation with PDF export
- Digital contract signing
- Revenue tracking and analytics
- Service management and pricing

### Admin Dashboard
- Real-time analytics and reporting
- Client relationship insights
- Booking calendar management
- Revenue and performance metrics

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript, Vite, Wouter routing
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **AI**: OpenAI API integration
- **Deployment**: Vercel (recommended) or Docker

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key (for AI features)
- Optional: Twilio account (for SMS features)

## ⚡ Quick Start

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd CaptureByChristian

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Database Configuration

```bash
# Set your database URL in .env
DATABASE_URL=postgresql://user:pass@host:5432/capturedccollective

# Deploy database schema
npm run db:push

# Optional: Load sample data
npm run db:seed
```

### 3. Start Development Server

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📊 Database Management

```bash
# Deploy schema changes
npm run db:push

# Open database studio
npm run db:studio

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
./deploy-vercel.sh
```

### Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up --build
```

## 📁 Project Structure

```
CaptureByChristian/
├── client/src/          # React frontend
│   ├── components/      # UI components
│   │   ├── admin/       # Admin dashboard components
│   │   ├── client-portal/ # Client portal components
│   │   └── ui/          # Reusable UI components
│   ├── pages/           # Route components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and API client
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── db.ts           # Database connection
│   ├── storage.ts      # Data access layer
│   └── openai.ts       # AI integration
├── shared/              # Shared TypeScript schemas
├── migrations/          # Database migrations
└── attached_assets/     # File uploads
```

## 🔧 Environment Variables

### Required

```env
DATABASE_URL=postgresql://user:pass@host:5432/capturedccollective
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

### Optional

```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
VERCEL=1  # For Vercel deployment
```

## 📖 API Documentation

The application provides RESTful API endpoints for:

- Client management (`/api/clients`)
- Booking operations (`/api/bookings`)
- Service management (`/api/services`)
- Gallery operations (`/api/gallery`)
- Contract handling (`/api/contracts`)
- Invoice generation (`/api/invoices`)

## 🔐 Authentication

- Admin authentication with session management
- Client portal access with secure login
- Role-based access control

## 🎨 Customization

The platform is designed to be easily customizable:

- Brand colors and styling via Tailwind CSS
- Business information in database profiles
- Service packages and pricing
- AI assistant prompts and responses

## 📞 Support

For detailed setup instructions, see:

- [`DATABASE_SETUP.md`](DATABASE_SETUP.md) - Database configuration
- [`DEPLOYMENT.md`](DEPLOYMENT.md) - Deployment guide
- [`CLAUDE.md`](CLAUDE.md) - Development guidance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---
**Built for professional photographers who want to streamline their business operations and provide exceptional client experiences.**