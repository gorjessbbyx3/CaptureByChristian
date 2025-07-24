# Project Dependencies Reference

This Node.js project uses npm for dependency management. All dependencies are defined in `package.json`.

## Installation

```bash
npm install
```

## Main Dependencies

### Core Framework
- **react**: ^18.3.1 - React frontend library
- **react-dom**: ^18.3.1 - React DOM rendering
- **express**: ^4.21.2 - Backend server framework
- **typescript**: 5.6.3 - TypeScript language support
- **vite**: ^6.3.5 - Build tool and dev server

### Database & ORM
- **drizzle-orm**: ^0.39.1 - Type-safe ORM
- **drizzle-kit**: ^0.28.1 - Database toolkit
- **@neondatabase/serverless**: ^0.10.4 - PostgreSQL serverless client

### AI & External Services
- **openai**: ^5.9.0 - OpenAI API integration
- **twilio**: ^5.7.3 - SMS communication service

### UI & Styling
- **@radix-ui/react-***: Accessible UI components
- **tailwindcss**: ^3.4.17 - Utility-first CSS framework
- **framer-motion**: ^11.13.1 - Animation library
- **lucide-react**: ^0.453.0 - Icon library

### Forms & Validation
- **react-hook-form**: ^7.55.0 - Form management
- **@hookform/resolvers**: ^3.10.0 - Form validation resolvers
- **zod**: ^3.24.2 - Schema validation

### State Management
- **@tanstack/react-query**: ^5.60.5 - Server state management

### Authentication & Security
- **passport**: ^0.7.0 - Authentication middleware
- **passport-local**: ^1.0.0 - Local authentication strategy
- **express-session**: ^1.18.1 - Session management

### Development Tools
- **@vitejs/plugin-react**: ^4.3.2 - Vite React plugin
- **tsx**: ^4.19.1 - TypeScript execution
- **esbuild**: ^0.25.0 - JavaScript bundler

### Utilities
- **date-fns**: ^3.6.0 - Date manipulation
- **clsx**: ^2.1.1 - Conditional CSS classes
- **wouter**: ^3.3.5 - Lightweight router

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push

# Type checking
npm run check
```

## Node.js Version

This project requires Node.js v18 or higher for optimal compatibility with all dependencies.