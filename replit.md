# CapturedCCollective Media Platform

## Overview
The CapturedCCollective Media Platform is a sophisticated AI-powered business platform for a Hawai'i-based media team specializing in cinematic, high-impact content. The platform's purpose is to provide an immersive booking experience, comprehensive portfolio management system, and robust business administration tools. It blends modern web technologies with artificial intelligence to manage real estate, event, and branded visual content, emphasizing intentionality, artistry, and precision to capture emotion, energy, and vision. The double "C" in CapturedCCollective stands for Content and Cinematic, with a strong emphasis on Creative storytelling.

## User Preferences
Preferred communication style: Simple, everyday language.
UI Design preference: Clean, minimal interface without decorative bubble elements or status indicators.

## System Architecture
The application follows a modern full-stack architecture.
- **Frontend**: React 18 with TypeScript, Vite build system, Radix UI primitives with shadcn/ui components, Tailwind CSS for styling, Wouter for routing, TanStack Query for server state management, and React Hook Form with Zod for form handling. Responsive design is mobile-first.
- **Backend**: Express.js with TypeScript. It provides RESTful APIs for clients, bookings, services, gallery, and AI chat. A repository pattern is used for storage abstraction.
- **Database**: PostgreSQL with Drizzle ORM, utilizing connection pooling with Neon serverless PostgreSQL. The schema includes tables for Users, Clients, Services, Bookings, Contracts & Invoices, Gallery Images (with AI tagging), and AI Chats.
- **AI Integration**: OpenAI GPT-4o is integrated for intelligent booking assistance, image analysis, and AI-enhanced business insights.
- **Core Features**:
    - **AI-Powered Booking**: Intelligent chat assistant for customer acquisition.
    - **Portfolio Management**: AI-powered image analysis and professional gallery organization with a lead capture system for access.
    - **Admin Dashboard**: Comprehensive live booking management, calendar integration, client relationship management, and real-time analytics.
    - **Service Management**: CRUD operations for photography services with visual management and real-time updates.
    - **Invoice Generation**: Professional PDF generation with Hawai'i GET tax integration and email delivery.
    - **Client Portal**: Professional client-facing portal with workflow management, real-time analytics, and gallery selection.
    - **Lead Management**: Advanced lead scoring, temperature tracking, and source attribution with conversion analytics.
- **Deployment**: Configured for Docker containerization (multi-container setup with Docker Compose) and Vercel serverless deployment for the frontend and API functions.

## External Dependencies
- **Database**: Neon PostgreSQL serverless database.
- **AI Services**: OpenAI GPT-4o API.
- **UI Components**: Radix UI primitives.
- **Build Tools**: Vite.
- **Development Tools**: TypeScript, ESLint/Prettier, Drizzle Kit.

## Recent Changes (January 2026)

### API Security & Database Fixes
- **Gallery Selections**: Implemented database persistence for client gallery selections (favorites, comments) using new `gallery_selections` table
- **Client Credentials**: Added secure password hashing with bcrypt for client portal authentication via `client_credentials` table
- **Integration Status**: Database persistence for third-party integration status (Stripe, Google Calendar) via `integrations` table
- **Portal Session Reset**: Implemented actual database clearing for admin portal session reset functionality
- **Products CRUD**: Full database-backed create, read, update, delete operations for products with Zod validation
- **Questionnaires CRUD**: Full database-backed operations for questionnaires with Zod validation
- **Orders Management**: Database-backed order retrieval and management
- **Product Analytics**: Real-time analytics calculated from orders data (revenue, sales count, top products)
- **Default QueryFn**: Added default query function to TanStack Query client to prevent "No queryFn" errors
- **Security Fix**: Removed plain-text password logging vulnerability from client credential management

### Client Portal Authentication Fixes
- **Token Storage**: Fixed client portal login to properly store JWT token in localStorage after successful authentication
- **Auth Headers**: Updated client dashboard queries to use the default queryFn which includes Authorization headers
- **Message Sending**: Fixed send message mutation to use apiRequest with proper auth headers
- **Query Types**: Added proper TypeScript type annotations to client portal data queries

### IDOR Security Fix (Critical)
- **Client Data Isolation**: Fixed critical IDOR (Insecure Direct Object Reference) vulnerability where client portal endpoints accepted clientId from query parameters
- **Server-Side Authentication**: All client portal endpoints now use `req.user!.id` from JWT token instead of accepting clientId from request
- **Affected Endpoints**: bookings, galleries, contracts, invoices, messages, send-message, and gallery selections
- **Result**: Client A can no longer access Client B's data by modifying request parameters