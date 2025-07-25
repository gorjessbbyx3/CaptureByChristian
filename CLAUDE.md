# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Management
```bash
# Deploy schema changes to database
npm run db:push

# Open database studio GUI
npm run db:studio

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Test database connection
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(res => console.log('Connected:', res.rows[0]));"
```

### Development Server
```bash
# Start development server (includes frontend and backend)
npm run dev

# Run TypeScript compiler check
npm run type-check

# Run ESLint
npm run lint

# Run tests
npm test
```

### Build and Deploy
```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
./deploy-vercel.sh
# or manually: vercel --prod

# Docker development
docker-compose -f docker-compose.dev.yml up

# Docker production
docker-compose up --build
```

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript, Vite build tool, Wouter for routing
- **Backend**: Express.js + TypeScript, Drizzle ORM
- **Database**: PostgreSQL with Drizzle schema
- **UI**: Tailwind CSS + shadcn/ui components
- **AI Integration**: OpenAI API for booking assistant and image analysis
- **File Storage**: Local filesystem with multer for uploads
- **Deployment**: Vercel (recommended) or Docker

### Directory Structure
```
CaptureByChristian/
├── client/src/          # React frontend
│   ├── components/      # UI components (admin/, client-portal/, ui/)
│   ├── pages/          # Route components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities, API client, types
├── server/             # Express backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API route definitions
│   ├── db.ts          # Database connection
│   ├── storage.ts     # Data access layer
│   └── openai.ts      # AI integration
├── shared/             # Shared TypeScript types and schemas
├── api/               # Vercel serverless function entry
├── migrations/        # Database migration files
└── attached_assets/   # File uploads storage
```

### Core Database Schema
Main tables defined in `shared/schema.ts`:
- **users**: Admin authentication
- **clients**: Customer management with lead scoring
- **services**: Photography packages and pricing
- **bookings**: Session scheduling
- **contracts**: Digital contract signing
- **invoices**: Billing with PDF generation
- **gallery_images**: Portfolio and client galleries
- **contact_messages**: Website form submissions with AI analysis
- **ai_chats**: Booking assistant conversations

### API Architecture
The application uses a hybrid approach:
- **Development**: Express server with Vite dev middleware (`server/index.ts`)
- **Production**: Vercel serverless functions (`api/index.ts`)

Key API patterns:
- RESTful endpoints in `server/routes.ts`
- Zod schema validation for all inputs
- File upload handling with multer (50MB limit, images only)
- AI integration for booking responses and image analysis

### Frontend Architecture
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Custom hook (`useAuth`) with session management

### Business Logic Components
The application serves both admin users and clients:

**Admin Dashboard** (`client/src/pages/admin.tsx`):
- Client management with CRM features
- Booking calendar and scheduling
- Service management
- Invoice generation with PDF export
- Portfolio management
- Analytics and revenue tracking

**Client Portal** (`client/src/pages/client-portal.tsx`):
- Gallery viewing for booked sessions
- Contract signing
- Booking management

**Public Website**:
- Portfolio showcase with password protection
- AI-powered booking assistant
- Contact form with lead capture

## Environment Configuration

Required environment variables in `.env`:
```env
DATABASE_URL=postgresql://user:pass@host:5432/capturedccollective
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

Optional variables:
```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
VERCEL=1  # Set in Vercel deployment
```

## Database Operations

### Schema Management
- Schema defined in `shared/schema.ts` using Drizzle ORM
- Use `npm run db:push` for development schema changes
- Use `npm run db:generate` and `npm run db:migrate` for production migrations
- Database connection and queries handled in `server/storage.ts`

### Connection Setup
The application supports multiple database providers:
- **Local PostgreSQL**: For development
- **Neon**: Recommended for production (configured in docs)
- **Supabase**: Alternative cloud provider
- **Railway**: Another deployment option

## Key Integration Points

### OpenAI Integration
- Booking assistant in `server/openai.ts`
- Image analysis for uploaded photos
- Business insights and recommendations
- Natural language booking form processing

### File Upload System
- 50MB limit for high-resolution photography
- Images only (validation in multer config)
- Stored in `attached_assets/` directory
- Served via Express static middleware

### Business Operations
Core business functionality:
- Invoice generation with PDF export
- Digital contract signing system
- Revenue tracking and analytics
- Service package management

## Testing and Quality

### Type Safety
- Strict TypeScript configuration in `tsconfig.json`
- Zod schemas for runtime validation
- Drizzle ORM for type-safe database operations

### Linting and Formatting
- ESLint configuration for TypeScript and React
- Run `npm run lint` before commits
- Run `npm run type-check` for TypeScript validation

## Deployment Notes

### Vercel Deployment (Recommended)
- Uses `api/index.ts` as serverless function entry point
- Environment variables configured in Vercel dashboard
- Static files served from `dist/public/`
- Database schema deployed before deployment

### Docker Deployment
- Development: `docker-compose.dev.yml`
- Production: `docker-compose.yml`
- Includes PostgreSQL service and application container

### Database Deployment
Always run database operations before application deployment:
1. Set `DATABASE_URL` environment variable
2. Run `npm run db:push` to deploy schema
3. Verify connection with test command
4. Deploy application code

## Common Workflows

### Adding New Features
1. Define database schema changes in `shared/schema.ts`
2. Run `npm run db:push` to update database
3. Update storage layer in `server/storage.ts`
4. Add API routes in `server/routes.ts`
5. Create frontend components in `client/src/components/`
6. Add routing in `client/src/App.tsx`

### Database Schema Changes
1. Modify schema in `shared/schema.ts`
2. For development: `npm run db:push`
3. For production: `npm run db:generate` then `npm run db:migrate`
4. Update storage interfaces and API routes as needed

### AI Feature Development
- OpenAI integration in `server/openai.ts`
- Use existing patterns for new AI features
- Configure API keys in environment variables
=======
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Management
```bash
# Deploy schema changes to database
npm run db:push

# Open database studio GUI
npm run db:studio

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Test database connection
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(res => console.log('Connected:', res.rows[0]));"
```

### Development Server
```bash
# Start development server (includes frontend and backend)
npm run dev

# Run TypeScript compiler check
npm run type-check

# Run ESLint
npm run lint

# Run tests
npm test
```

### Build and Deploy
```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
./deploy-vercel.sh
# or manually: vercel --prod

# Docker development
docker-compose -f docker-compose.dev.yml up

# Docker production
docker-compose up --build
```

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript, Vite build tool, Wouter for routing
- **Backend**: Express.js + TypeScript, Drizzle ORM
- **Database**: PostgreSQL with Drizzle schema
- **UI**: Tailwind CSS + shadcn/ui components
- **AI Integration**: OpenAI API for booking assistant and image analysis
- **File Storage**: Local filesystem with multer for uploads
- **Deployment**: Vercel (recommended) or Docker

### Directory Structure
```
CaptureByChristian/
├── client/src/          # React frontend
│   ├── components/      # UI components (admin/, client-portal/, ui/)
│   ├── pages/          # Route components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities, API client, types
├── server/             # Express backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API route definitions
│   ├── db.ts          # Database connection
│   ├── storage.ts     # Data access layer
│   └── openai.ts      # AI integration
├── shared/             # Shared TypeScript types and schemas
├── api/               # Vercel serverless function entry
├── migrations/        # Database migration files
└── attached_assets/   # File uploads storage
```

### Core Database Schema
Main tables defined in `shared/schema.ts`:
- **users**: Admin authentication
- **clients**: Customer management with lead scoring
- **services**: Photography packages and pricing
- **bookings**: Session scheduling
- **contracts**: Digital contract signing
- **invoices**: Billing with PDF generation
- **gallery_images**: Portfolio and client galleries
- **contact_messages**: Website form submissions with AI analysis
- **ai_chats**: Booking assistant conversations

### API Architecture
The application uses a hybrid approach:
- **Development**: Express server with Vite dev middleware (`server/index.ts`)
- **Production**: Vercel serverless functions (`api/index.ts`)

Key API patterns:
- RESTful endpoints in `server/routes.ts`
- Zod schema validation for all inputs
- File upload handling with multer (50MB limit, images only)
- AI integration for booking responses and image analysis

### Frontend Architecture
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Custom hook (`useAuth`) with session management

### Business Logic Components
The application serves both admin users and clients:

**Admin Dashboard** (`client/src/pages/admin.tsx`):
- Client management with CRM features
- Booking calendar and scheduling
- Service management
- Invoice generation with PDF export
- Portfolio management
- Analytics and revenue tracking

**Client Portal** (`client/src/pages/client-portal.tsx`):
- Gallery viewing for booked sessions
- Contract signing
- Booking management

**Public Website**:
- Portfolio showcase with password protection
- AI-powered booking assistant
- Contact form with lead capture

## Environment Configuration

Required environment variables in `.env`:
```env
DATABASE_URL=postgresql://user:pass@host:5432/capturedccollective
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

Optional variables:
```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
VERCEL=1  # Set in Vercel deployment
```

## Database Operations

### Schema Management
- Schema defined in `shared/schema.ts` using Drizzle ORM
- Use `npm run db:push` for development schema changes
- Use `npm run db:generate` and `npm run db:migrate` for production migrations
- Database connection and queries handled in `server/storage.ts`

### Connection Setup
The application supports multiple database providers:
- **Local PostgreSQL**: For development
- **Neon**: Recommended for production (configured in docs)
- **Supabase**: Alternative cloud provider
- **Railway**: Another deployment option

## Key Integration Points

### OpenAI Integration
- Booking assistant in `server/openai.ts`
- Image analysis for uploaded photos
- Business insights and recommendations
- Natural language booking form processing

### File Upload System
- 50MB limit for high-resolution photography
- Images only (validation in multer config)
- Stored in `attached_assets/` directory
- Served via Express static middleware

### Business Operations
Core business functionality:
- Invoice generation with PDF export
- Digital contract signing system
- Revenue tracking and analytics
- Service package management

## Testing and Quality

### Type Safety
- Strict TypeScript configuration in `tsconfig.json`
- Zod schemas for runtime validation
- Drizzle ORM for type-safe database operations

### Linting and Formatting
- ESLint configuration for TypeScript and React
- Run `npm run lint` before commits
- Run `npm run type-check` for TypeScript validation

## Deployment Notes

### Vercel Deployment (Recommended)
- Uses `api/index.ts` as serverless function entry point
- Environment variables configured in Vercel dashboard
- Static files served from `dist/public/`
- Database schema deployed before deployment

### Docker Deployment
- Development: `docker-compose.dev.yml`
- Production: `docker-compose.yml`
- Includes PostgreSQL service and application container

### Database Deployment
Always run database operations before application deployment:
1. Set `DATABASE_URL` environment variable
2. Run `npm run db:push` to deploy schema
3. Verify connection with test command
4. Deploy application code

## Common Workflows

### Adding New Features
1. Define database schema changes in `shared/schema.ts`
2. Run `npm run db:push` to update database
3. Update storage layer in `server/storage.ts`
4. Add API routes in `server/routes.ts`
5. Create frontend components in `client/src/components/`
6. Add routing in `client/src/App.tsx`

### Database Schema Changes
1. Modify schema in `shared/schema.ts`
2. For development: `npm run db:push`
3. For production: `npm run db:generate` then `npm run db:migrate`
4. Update storage interfaces and API routes as needed

### AI Feature Development
- OpenAI integration in `server/openai.ts`
- Use existing patterns for new AI features
- Configure API keys in environment variables
- Test AI responses in development before deployment