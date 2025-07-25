# Database Setup Guide - CapturedCCollective

## Overview

This guide covers the complete database setup for the CapturedCCollective photography platform, including PostgreSQL configuration, schema deployment, and data initialization.

## Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 20+ installed
- npm or yarn package manager
- Database admin access

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Deploy database schema**

   ```bash
   npm run db:push
   ```

4. **Initialize with sample data** (optional)

   ```bash
   npm run db:seed
   ```

## Database Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Required: Main database connection
DATABASE_URL=postgresql://username:password@localhost:5432/capturedccollective

# Individual connection parameters (auto-generated from DATABASE_URL)
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=capturedccollective
```

### Connection String Format

```English
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

Examples:

- Local: `postgresql://postgres:password@localhost:5432/capturedccollective`
- Neon: `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/capturedccollective?sslmode=require`
- Supabase: `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres`

## Database Schema

### Core Tables

The platform uses the following main tables:

#### Users & Authentication

- `users` - Admin users and authentication
- `profiles` - Business profile information

#### Client Management

- `clients` - Customer information and contact details
- `client_messages` - Communication history
- `contact_messages` - Website contact form submissions

#### Business Operations

- `services` - Photography packages and pricing
- `bookings` - Session scheduling and management
- `contracts` - Legal agreements and signatures
- `invoices` - Billing and payment tracking

#### Content Management

- `gallery_images` - Portfolio and client galleries
- `ai_chats` - AI booking assistant conversations

#### Analytics & Tracking

- `client_portal_sessions` - Client portal access tracking

### Schema Deployment

#### Method 1: Drizzle Push (Recommended)

```bash
# Deploy schema changes directly to database
npm run db:push
```

#### Method 2: Migration Files

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

#### Method 3: Manual SQL

```bash
# Connect to database
psql -d $DATABASE_URL

# Run initialization script
\i db-init/01-init.sql
```

## Database Commands

### Development Commands

```bash
# Push schema changes to database
npm run db:push

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database studio (GUI)
npm run db:studio

# Reset database (WARNING: Deletes all data)
npm run db:reset
```

### Production Commands

```bash
# Deploy to production database
DATABASE_URL=your_prod_url npm run db:push

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

## Initial Data Setup

### Sample Data

The platform includes sample data for development:

```bash
# Load sample services, clients, and bookings
npm run db:seed
```

### Admin User Setup

Create your first admin user:

```sql
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@capturedccollective.com', '$hashed_password', 'admin');
```

### Business Profile

Set up your business information:

```sql
INSERT INTO profiles (name, title, bio, phone, email, address, social_media) 
VALUES (
  'CapturedCCollective',
  'Hawaii Media Collective',
  'Professional photography and media services in Hawaii',
  '808-555-0123',
  'info@capturedccollective.com',
  'Honolulu, HI',
  '{"instagram": "@capturedccollective", "facebook": "CapturedCCollective"}'
);
```

## Database Providers

### Local PostgreSQL

1. **Install PostgreSQL**

   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create database**

   ```bash
   createdb capturedccollective
   ```

3. **Set connection string**

   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/capturedccollective
   ```

### Neon (Recommended for Production)

1. **Create account** at [neon.tech](https://neon.tech)
2. **Create database project**
3. **Copy connection string** from dashboard
4. **Set environment variable**

   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/capturedccollective?sslmode=require
   ```

### Supabase

1. **Create project** at [supabase.com](https://supabase.com)
2. **Go to Settings → Database**
3. **Copy connection string**
4. **Set environment variable**

   ```env
   DATABASE_URL=postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
   ```

### Railway

1. **Create account** at [railway.app](https://railway.app)
2. **Create PostgreSQL service**
3. **Copy connection string** from variables
4. **Set environment variable**

## Schema Management

### Drizzle ORM

The platform uses Drizzle ORM for type-safe database operations:

- **Schema definition**: `shared/schema.ts`
- **Database connection**: `server/db.ts`
- **Storage layer**: `server/storage.ts`

### Adding New Tables

1. **Define schema** in `shared/schema.ts`:

   ```typescript
   export const newTable = pgTable('new_table', {
     id: serial('id').primaryKey(),
     name: text('name').notNull(),
     createdAt: timestamp('created_at').defaultNow(),
   });
   ```

2. **Update storage interface** in `server/storage.ts`
3. **Push schema changes**:

   ```bash
   npm run db:push
   ```

### Modifying Existing Tables

1. **Update schema** in `shared/schema.ts`
2. **Push changes**:

   ```bash
   npm run db:push
   ```

3. **Handle data migration** if needed

## Backup & Recovery

### Automated Backups

```bash
# Create backup script
#!/bin/bash
pg_dump $DATABASE_URL > "backup-$(date +%Y%m%d-%H%M%S).sql"

# Schedule with cron
0 2 * * * /path/to/backup-script.sh
```

### Manual Backup

```bash
# Full database backup
pg_dump $DATABASE_URL > full-backup.sql

# Schema only
pg_dump --schema-only $DATABASE_URL > schema-backup.sql

# Data only
pg_dump --data-only $DATABASE_URL > data-backup.sql
```

### Restore Database

```bash
# Restore from backup
psql $DATABASE_URL < backup.sql

# Restore specific table
pg_restore -t table_name backup.sql
```

## Performance Optimization

### Indexing

Key indexes for performance:

```sql
-- Client lookups
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);

-- Booking queries
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);

-- Gallery searches
CREATE INDEX idx_gallery_featured ON gallery_images(featured);
CREATE INDEX idx_gallery_booking ON gallery_images(booking_id);
```

### Connection Pooling

The platform uses connection pooling for optimal performance:

```typescript
// server/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Check database is running
   - Verify connection string
   - Check firewall settings

2. **Authentication failed**
   - Verify username/password
   - Check database user permissions
   - Ensure SSL settings match

3. **Table does not exist**
   - Run `npm run db:push`
   - Check schema definition
   - Verify database name

4. **Migration conflicts**
   - Check migration files in `migrations/`
   - Resolve conflicts manually
   - Reset database if needed

### Debug Commands

```bash
# Test database connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(res => console.log('Connected:', res.rows[0]));
"

# Check table structure
psql $DATABASE_URL -c "\d+ clients"

# View recent logs
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

## Security Considerations

### Database Security

1. **Use strong passwords** for database users
2. **Enable SSL/TLS** for connections
3. **Limit network access** with firewalls
4. **Regular security updates** for PostgreSQL
5. **Backup encryption** for sensitive data

### Application Security

1. **Environment variables** for credentials
2. **Connection pooling** to prevent exhaustion
3. **SQL injection prevention** via parameterized queries
4. **Input validation** before database operations
5. **Audit logging** for sensitive operations

## Monitoring

### Health Checks

```bash
# Check database status
psql $DATABASE_URL -c "SELECT 1;"

# Monitor connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check table sizes
psql $DATABASE_URL -c "
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats 
WHERE schemaname='public' 
ORDER BY n_distinct DESC;"
```

### Performance Monitoring

```sql
-- Slow query analysis
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Index usage
SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

## Support Resources

- **Drizzle Documentation**: [orm.drizzle.team](https://orm.drizzle.team)
- **PostgreSQL Documentation**: [postgresql.org/docs](https://www.postgresql.org/docs/)
- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)
- **Project Issues**: Check `replit.md` for troubleshooting tips

## Next Steps

1. Complete database setup using this guide
2. Run `npm run db:push` to deploy schema
3. Initialize with sample data using `npm run db:seed`
4. Configure backup strategy
5. Set up monitoring and alerts
6. Deploy to production environment

For deployment-specific database configuration, see:

- `DEPLOYMENT.md` - General deployment guide
- `README.Vercel.md` - Vercel-specific setup
- `README.Docker.md` - Docker container setup
