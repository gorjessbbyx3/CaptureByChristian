# Database Quick Reference - CapturedCCollective

## Essential Commands

### Initial Setup
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit database URL in .env
DATABASE_URL=postgresql://user:pass@host:5432/capturedccollective

# 3. Deploy schema
npm run db:push

# 4. Load sample data (optional)
npm run db:seed
```

### Daily Development
```bash
# Deploy schema changes
npm run db:push

# Open database studio
npm run db:studio

# Generate migration files
npm run db:generate

# Test database connection
npm run db:test
```

### Production Deployment
```bash
# Deploy to production database
DATABASE_URL=prod_url npm run db:push

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/capturedccollective

# Auto-generated (don't edit)
PGHOST=host
PGPORT=5432
PGUSER=user
PGPASSWORD=pass
PGDATABASE=capturedccollective
```

## Database Providers

### Local PostgreSQL
```bash
# Install and start
brew install postgresql
brew services start postgresql

# Create database
createdb capturedccollective

# Connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/capturedccollective
```

### Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string
4. Add to `.env`

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Settings → Database
4. Copy connection string

## Troubleshooting

### Common Issues
```bash
# Connection refused
# → Check database is running
# → Verify connection string

# Table does not exist
npm run db:push

# Authentication failed
# → Check username/password
# → Verify database exists

# Migration conflicts
# → Check migrations/ folder
# → Reset database if needed
```

### Debug Commands
```bash
# Test connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(res => console.log('Connected:', res.rows[0]));
"

# Check table structure
psql $DATABASE_URL -c "\d+ clients"

# View database size
psql $DATABASE_URL -c "
SELECT pg_database.datname,
       pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database;"
```

## Core Tables

- **users** - Admin authentication
- **clients** - Customer information
- **services** - Photography packages
- **bookings** - Session scheduling
- **contracts** - Legal agreements
- **invoices** - Billing and payments
- **gallery_images** - Portfolio management
- **contact_messages** - Website inquiries
- **ai_chats** - AI assistant conversations

## Package.json Scripts

```json
{
  "db:push": "drizzle-kit push",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "db:seed": "tsx scripts/seed.ts"
}
```

## Files to Know

- **`shared/schema.ts`** - Database schema definition
- **`server/db.ts`** - Database connection setup
- **`server/storage.ts`** - Data access layer
- **`drizzle.config.ts`** - Drizzle ORM configuration
- **`migrations/`** - Database migration files
- **`db-init/`** - Initialization scripts

## Security Checklist

- [ ] Strong database password
- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Regular backups scheduled
- [ ] Database firewall configured
- [ ] Connection pooling enabled
- [ ] Audit logging active

## Performance Tips

1. **Use indexes** for frequently queried columns
2. **Connection pooling** prevents connection exhaustion
3. **Monitor slow queries** with pg_stat_statements
4. **Regular VACUUM** for maintenance
5. **Backup strategy** for data protection

## Support

- **Full Guide**: `DATABASE_SETUP.md`
- **Deployment**: `DEPLOYMENT.md`
- **Project Info**: `replit.md`
- **Drizzle Docs**: [orm.drizzle.team](https://orm.drizzle.team)
- **PostgreSQL Docs**: [postgresql.org/docs](https://www.postgresql.org/docs/)