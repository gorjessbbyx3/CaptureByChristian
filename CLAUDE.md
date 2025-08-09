# CLAUDE.md - REALEST

This file provides guidance to Claude Code (claude.ai/code) when working with the Realest real estate CRM.

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
- **AI Integration**: OpenAI API for deal analysis, market insights, and lead qualification

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/
│   │   ├── admin/       # Real estate dashboard components
│   │   ├── client-portal/ # Client/investor portal
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
This is a **comprehensive real estate investment CRM** inspired by Pace Morby's subject-to community with:
- **Deal Management**: Complete deal pipeline from lead to closing
- **Property Analysis**: ARV calculations, repair estimates, profit projections
- **Investment Strategies**: Subject-to, seller financing, wholesale, BRRRR, fix & flip
- **Lead Management**: Multi-channel lead capture and nurturing
- **Client Portal**: Investor/seller communication and document sharing
- **Market Intelligence**: Comparable sales, market trends, automated valuations
- **Task Management**: Deal workflow automation and team coordination
- **AI Features**: Deal analysis, market insights, lead qualification

### Database Architecture
The schema (`shared/schema.ts`) implements a comprehensive real estate CRM with:
- **Core entities**: `clients`, `properties`, `deals`, `investmentStrategies`, `contracts`
- **Analysis tools**: `dealAnalysis`, `comparables`, `propertyImages`
- **Advanced CRM**: `leads`, `communicationLog`, `automationSequences`, `tasks`
- **Service management**: `serviceProviders`, `teamMembers`
- **Client engagement**: `clientPortalSessions`, `aiChats`

All tables use Drizzle ORM with proper relations and Zod validation schemas.

### Real Estate Client Types
- **Sellers**: Motivated sellers, distressed properties, inherited properties
- **Buyers**: Cash buyers, first-time investors, experienced investors
- **Investors**: Private money lenders, institutional investors, partners
- **Wholesalers**: Deal finders, bird dogs, assignment specialists
- **Service Providers**: Contractors, inspectors, appraisers, attorneys, title companies

### Investment Strategies Supported
- **Subject-To**: Taking over existing mortgage payments
- **Seller Financing**: Owner-financed deals with flexible terms
- **Wholesale**: Quick assignments for wholesale fees
- **Fix & Flip**: Renovation projects for resale profit
- **BRRRR**: Buy, Rehab, Rent, Refinance, Repeat strategy
- **Lease Options**: Rent-to-own arrangements

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
- `MLS_API_KEY`: For property data integration (optional)
- `GOOGLE_MAPS_API_KEY`: For mapping and location services (optional)

### File Upload Handling
- Property images stored in `attached_assets/` directory
- Multer middleware for file processing
- Property images linked to properties and deals via `propertyImages` table
- Support for before/after renovation photos

### Production Deployment
- Supports Vercel (primary), Docker, and Render
- Static files served from `client/dist` in production
- Health check endpoint at `/health`
- Node.js 18+ required

## Real Estate Specific Features

### Deal Pipeline Management
- Lead capture from multiple sources (driving for dollars, direct mail, online)
- Deal stages: Prospect → Under Contract → Due Diligence → Closing → Closed
- Automated follow-up sequences based on lead temperature and stage
- Task management for each deal milestone

### Property Analysis Tools
- ARV (After Repair Value) calculations with comparable sales
- Repair cost estimation with contractor integration
- Cash flow analysis for rental properties
- ROI and cash-on-cash return calculations
- Risk assessment scoring (1-10 scale)
- Deal recommendation engine (buy/pass/negotiate)

### Market Intelligence
- Automated comparable sales analysis
- Market trend tracking by area
- Days on market statistics
- Price per square foot analysis
- Neighborhood scoring and demographics

### Lead Generation & Management
- Multi-channel lead capture (Facebook, websites, direct mail responses)
- Lead scoring based on motivation and timeline
- Automated lead nurturing sequences
- Bird dog and wholesaler referral tracking
- Motivation tracking (foreclosure, divorce, inheritance, etc.)

### Client & Investor Management
- Investor profiles with funding capacity and preferences
- Client communication history and preferences
- Document sharing and contract management
- Automated reporting for investors
- Performance tracking and ROI reporting

### SEO & Marketing Features
- Lead capture landing pages with A/B testing
- Automated email sequences for different lead types
- Social media integration for lead generation
- Content management for educational resources
- Referral tracking and reward systems
- Local market SEO optimization

## Development Guidelines

### Commit Message Guidelines
- Do not add your signature to commit messages

### File Management Guidelines
- Choose the most efficient approach - create new files if it's faster/easier than editing existing ones
- Actively remove unused files to keep the codebase clean
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

### Real Estate Terminology
- Use industry-standard terms (ARV, BRRRR, Subject-To, etc.)
- Maintain consistent terminology across UI and database
- Follow Pace Morby's methodology and terminology where applicable
- Consider both beginner and advanced investor needs