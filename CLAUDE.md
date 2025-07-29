# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Start development servers (client + server)
npm run dev

# Start individual services
npm run dev:server    # Server only (port 3000)
npm run dev:client     # Client only (port 5173)

# Code quality
npm run lint           # ESLint check
npm run typecheck      # TypeScript validation
```

### Database Operations
```bash
npm run db:push        # Deploy schema changes to database
npm run db:generate    # Generate migration files
npm run db:migrate     # Apply pending migrations
npm run db:studio      # Open Drizzle Studio (database GUI)
npm run db:seed        # Seed database with sample data
```

### Testing & Building
```bash
npm test              # Run Vitest tests
npm test:ui           # Run tests with UI
npm run build         # Build for production
npm start             # Start production server
```

## Architecture Overview

### Tech Stack Foundation
- **Full-stack TypeScript** with ES modules (`"type": "module"`)
- **Frontend**: React 18 + Vite, Wouter for routing, Tailwind CSS + shadcn/ui
- **Backend**: Express.js with session-based authentication
- **Database**: PostgreSQL with Drizzle ORM, comprehensive schema in `shared/schema.ts`
- **AI Integration**: OpenAI API for chat, lead analysis, and business insights

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/
│   │   ├── admin/       # Admin dashboard components
│   │   ├── client-portal/ # Client-facing portal
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Route components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # API client, utilities, types
├── server/              # Express backend
│   ├── index.ts         # Server entry with middleware setup
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data access layer (Drizzle queries)
│   ├── db.ts            # Database connection
│   └── openai.ts        # AI integration
├── shared/schema.ts     # Drizzle database schema & types
└── migrations/          # Database migration files
```

### Core Business Domain
This is a **photography business management platform** with:
- **CRM**: Client management, lead scoring, communication tracking
- **Booking System**: Service scheduling with calendar integration
- **Client Portal**: Gallery access, contract signing, communications
- **Business Operations**: Invoice generation, contract management, analytics
- **AI Features**: Booking assistant, lead analysis, business insights

### Database Architecture
The schema (`shared/schema.ts`) implements a comprehensive CRM with:
- **Core entities**: `clients`, `bookings`, `services`, `contracts`, `invoices`
- **Advanced CRM**: `leads`, `communicationLog`, `automationSequences`
- **Client engagement**: `galleryImages`, `clientPortalSessions`, `aiChats`
- **Business features**: `products`, `orders`, `questionnaires`, `profiles`

All tables use Drizzle ORM with proper relations and Zod validation schemas.

### Authentication & Sessions
- Express sessions with cookie-parser for admin auth
- Client portal uses token-based access (`clientPortalSessions` table)
- CORS configured for development (localhost:5173) and production

### API Patterns
- RESTful endpoints under `/api/` prefix
- All routes defined in `server/routes.ts`
- Data access layer in `server/storage.ts` using Drizzle queries
- Comprehensive error handling with environment-aware responses

### Development Workflow
1. **Database First**: Schema changes in `shared/schema.ts`
2. **API Layer**: Update `server/storage.ts` and `server/routes.ts`
3. **Frontend**: Components in appropriate directories, API calls via `lib/api.ts`
4. **Always run** `npm run lint` and `npm run typecheck` before committing

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (required)
- `OPENAI_API_KEY`: For AI features (required)
- `SESSION_SECRET`: Session security (defaults provided)
- `TWILIO_*`: SMS notifications (optional)

### File Upload Handling
- Images stored in `attached_assets/` directory
- Multer middleware for file processing
- Gallery images linked to bookings via `galleryImages` table

### Production Deployment
- Supports Vercel (primary), Docker, and Render
- Static files served from `client/dist` in production
- Health check endpoint at `/health`
- Node.js 18+ required
```

## Development Guidelines

### Commit Message Guidelines
- Do not add your signature to commit messages