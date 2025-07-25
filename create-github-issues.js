#!/usr/bin/env node

// GitHub Issues Creation Script for CaptureByChristian Code Review
// This script creates GitHub issues for the most critical problems identified in the code review

const issues = [
  {
    title: "🔴 CRITICAL: No Authentication System - Admin Routes Completely Exposed",
    body: `## Problem
All admin routes are completely unprotected, allowing anyone to access sensitive administrative functions.

## Affected Files
- \`server/routes.ts\` - All admin endpoints
- \`/api/admin/*\`
- \`/api/services\`
- \`/api/bookings\`
- \`/api/clients\`

## Security Risk
- **Severity**: CRITICAL
- **Impact**: Complete system compromise possible
- Anyone can create, modify, or delete bookings, clients, and services
- Full access to sensitive customer data
- Potential for data theft and system manipulation

## Current State
\`\`\`javascript
// NO AUTHENTICATION CHECK
app.get("/api/clients", async (req, res) => {
  // Direct database access without any auth
  const clients = await storage.getClients();
  res.json(clients);
});
\`\`\`

## Required Solution
1. Implement JWT-based authentication system
2. Add authentication middleware to all admin routes
3. Implement role-based access control (admin vs client)
4. Add session management
5. Implement secure login/logout functionality

## Acceptance Criteria
- [ ] Authentication middleware implemented
- [ ] All admin routes protected
- [ ] JWT token validation
- [ ] Role-based access control
- [ ] Secure login/logout endpoints
- [ ] Session timeout handling

## Priority
**IMMEDIATE** - This must be fixed before any production deployment.`,
    labels: ["critical", "security", "authentication", "backend"]
  },

  {
    title: "🔴 CRITICAL: SQL Injection Vulnerability in Multiple Endpoints",
    body: `## Problem
Multiple API endpoints are vulnerable to SQL injection attacks due to insufficient input validation and direct parameter usage.

## Affected Files
- \`server/routes.ts\` - Lines with \`parseInt(req.params.id)\`
- All endpoints using URL parameters
- Query parameter handling

## Vulnerable Code Examples
\`\`\`javascript
// VULNERABLE - No validation
app.get("/api/clients/:id", async (req, res) => {
  const client = await storage.getClient(parseInt(req.params.id));
});

// VULNERABLE - Direct query parameter usage
app.get("/api/availability", async (req, res) => {
  const { start, end } = req.query; // No validation
  const startDate = new Date(start as string); // Potential injection
});
\`\`\`

## Security Risk
- **Severity**: CRITICAL
- **Impact**: Database compromise, data theft, data corruption
- Potential for complete database takeover
- Sensitive customer data exposure

## Required Solution
1. Implement comprehensive input validation middleware
2. Use parameterized queries (already using Drizzle ORM - good)
3. Add Zod validation for all input parameters
4. Sanitize all user inputs
5. Add rate limiting to prevent brute force attacks

## Acceptance Criteria
- [ ] Input validation middleware implemented
- [ ] All URL parameters validated
- [ ] Query parameters sanitized
- [ ] Zod schemas for all inputs
- [ ] Error handling without data exposure
- [ ] Rate limiting implemented

## Priority
**IMMEDIATE** - Critical security vulnerability.`,
    labels: ["critical", "security", "sql-injection", "backend", "validation"]
  },

  {
    title: "🔴 CRITICAL: Database Connection Pool Not Configured - Memory Leaks Risk",
    body: `## Problem
Database connection pool is not properly configured, leading to potential connection exhaustion and memory leaks.

## Affected Files
- \`server/db.ts\`
- All database operations

## Current Implementation
\`\`\`javascript
// PROBLEMATIC - No pool configuration
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
\`\`\`

## Issues
1. No connection pool size limits
2. No connection timeout configuration
3. No error handling for connection failures
4. No connection cleanup
5. No monitoring of connection health

## Risk
- **Severity**: CRITICAL
- **Impact**: Service instability, memory leaks, connection exhaustion
- Application crashes under load
- Database connection exhaustion
- Memory leaks leading to server crashes

## Required Solution
\`\`\`javascript
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  min: 5,  // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500, // Close connection after 7500 uses
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});
\`\`\`

## Acceptance Criteria
- [ ] Connection pool properly configured
- [ ] Connection limits set
- [ ] Timeout configurations added
- [ ] Error handling implemented
- [ ] Connection monitoring added
- [ ] Graceful shutdown handling

## Priority
**IMMEDIATE** - Can cause service instability.`,
    labels: ["critical", "database", "performance", "backend", "infrastructure"]
  },

  {
    title: "🔴 CRITICAL: Insecure File Upload System - XSS and Storage Issues",
    body: `## Problem
File upload system has multiple critical security vulnerabilities and performance issues.

## Affected Files
- \`server/routes.ts\` - \`/api/gallery/upload\` endpoint

## Security Issues
1. **XSS Vulnerability**: Base64 data stored and served without sanitization
2. **Storage Exhaustion**: Large files stored as base64 in database
3. **Memory Issues**: Files loaded entirely into memory
4. **Insufficient Validation**: Only MIME type checking

## Vulnerable Code
\`\`\`javascript
// DANGEROUS - Base64 storage in database
const base64Data = file.buffer.toString('base64');
const dataUrl = \`data:\${file.mimetype};base64,\${base64Data}\`;

const imageData = {
  url: dataUrl, // XSS risk when served
  // ...
};
\`\`\`

## Risks
- **Severity**: CRITICAL
- **Impact**: XSS attacks, system compromise, service degradation
- Malicious script execution in browsers
- Database bloat and performance issues
- Memory exhaustion attacks
- Storage costs explosion

## Required Solution
1. Implement proper file storage (AWS S3, Cloudinary, etc.)
2. Add comprehensive file validation
3. Implement virus scanning
4. Add file size and type restrictions
5. Use CDN for file serving
6. Implement proper access controls

## Acceptance Criteria
- [ ] External file storage implemented
- [ ] Comprehensive file validation
- [ ] Virus scanning integration
- [ ] File access controls
- [ ] CDN integration
- [ ] Remove base64 database storage

## Priority
**IMMEDIATE** - Active security vulnerability.`,
    labels: ["critical", "security", "file-upload", "xss", "backend"]
  },

  {
    title: "🔴 CRITICAL: Missing Rate Limiting - DDoS and Brute Force Vulnerability",
    body: `## Problem
No rate limiting implemented on any API endpoints, making the system vulnerable to DDoS and brute force attacks.

## Affected Files
- \`server/index.ts\` - No rate limiting middleware
- All API endpoints in \`server/routes.ts\`

## Vulnerabilities
1. **DDoS Attacks**: Unlimited requests can overwhelm the server
2. **Brute Force**: No protection against login attempts
3. **Resource Exhaustion**: Database and memory can be exhausted
4. **API Abuse**: No limits on expensive operations

## Current State
\`\`\`javascript
// NO RATE LIMITING
const app = express();
app.use(express.json());
// Missing rate limiting middleware
\`\`\`

## Risk
- **Severity**: CRITICAL
- **Impact**: Service availability compromise, resource exhaustion
- Complete service shutdown possible
- Database overload
- Increased hosting costs

## Required Solution
\`\`\`javascript
import rateLimit from 'express-rate-limit';

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Strict rate limiting for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 requests per 15 minutes
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/api/admin/', strictLimiter);
\`\`\`

## Acceptance Criteria
- [ ] Rate limiting middleware implemented
- [ ] Different limits for different endpoint types
- [ ] IP-based rate limiting
- [ ] Configurable rate limits
- [ ] Rate limit headers in responses
- [ ] Monitoring and alerting for rate limit hits

## Priority
**IMMEDIATE** - Service availability risk.`,
    labels: ["critical", "security", "rate-limiting", "ddos", "backend"]
  },

  {
    title: "🟠 HIGH: Commented Out Critical Code - getContracts() Method Disabled",
    body: `## Problem
Critical \`getContracts()\` method is commented out in storage layer, causing application crashes when contracts are accessed.

## Affected Files
- \`server/storage.ts\` - Line 298
- Contract-related API endpoints

## Issue
\`\`\`javascript
// BROKEN - Method is commented out
/*async getContracts(): Promise<(Contract & { client: Client })[]> {
  try {
    const contractsData = await db
      .select()
      .from(contracts)
      .leftJoin(clients, eq(contracts.clientId, clients.id))
      .orderBy(desc(contracts.createdAt));
    
    return contractsData.map(row => ({
      ...row.contracts,
      client: row.clients!
    }));
  } catch (error) {
    console.error("Error fetching contracts:", error);
    // Return empty array if table doesn't exist or has schema issues
    return [];
  }
}*/
\`\`\`

## Impact
- **Severity**: HIGH
- **Impact**: Application crashes, broken contract functionality
- Contract management completely non-functional
- Admin dashboard crashes when accessing contracts
- Business operations severely impacted

## Root Cause Analysis
The method was likely commented out due to database schema issues, but this breaks the entire contract system.

## Required Solution
1. Uncomment and fix the \`getContracts()\` method
2. Ensure database schema is properly migrated
3. Add proper error handling
4. Test all contract-related endpoints
5. Add integration tests for contract functionality

## Acceptance Criteria
- [ ] \`getContracts()\` method restored and working
- [ ] Database schema issues resolved
- [ ] All contract endpoints functional
- [ ] Error handling improved
- [ ] Integration tests added

## Priority
**HIGH** - Core business functionality broken.`,
    labels: ["high", "bug", "contracts", "backend", "database"]
  },

  {
    title: "🟠 HIGH: No Booking Conflict Detection - Double Booking Risk",
    body: `## Problem
Booking system has no conflict detection, allowing double bookings and scheduling conflicts.

## Affected Files
- \`server/routes.ts\` - \`/api/bookings\` POST endpoint
- \`server/storage.ts\` - Booking creation methods

## Current Implementation
\`\`\`javascript
// NO CONFLICT CHECKING
app.post("/api/bookings", async (req, res) => {
  // Direct booking creation without checking conflicts
  const booking = await storage.createBooking(validatedBookingData);
  res.json(booking);
});
\`\`\`

## Business Risk
- **Severity**: HIGH
- **Impact**: Revenue loss, customer dissatisfaction, reputation damage
- Double bookings leading to impossible commitments
- Customer conflicts and cancellations
- Loss of business credibility
- Potential legal issues

## Required Solution
1. Implement booking conflict detection
2. Check photographer availability
3. Consider travel time between locations
4. Add buffer time between bookings
5. Implement booking confirmation workflow

## Implementation Example
\`\`\`javascript
async function checkBookingConflicts(newBooking) {
  const conflictingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.date, newBooking.date),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'pending')
        )
      )
    );
  
  return conflictingBookings.length > 0;
}
\`\`\`

## Acceptance Criteria
- [ ] Booking conflict detection implemented
- [ ] Time slot validation
- [ ] Buffer time consideration
- [ ] Travel time calculation
- [ ] Conflict resolution workflow
- [ ] Admin override capability

## Priority
**HIGH** - Critical business operation risk.`,
    labels: ["high", "business-logic", "bookings", "backend"]
  },

  {
    title: "🟠 HIGH: Inconsistent Data Types - Price Handling Issues",
    body: `## Problem
Inconsistent data type handling for prices throughout the application, leading to calculation errors and data corruption.

## Affected Files
- \`shared/schema.ts\` - Price fields defined as decimal
- \`server/routes.ts\` - Price handling as strings
- Frontend components - Mixed price handling

## Issues
1. **Schema vs Implementation**: Prices defined as decimal but handled as strings
2. **Calculation Errors**: String concatenation instead of addition
3. **Data Corruption**: Inconsistent storage formats
4. **Display Issues**: Formatting inconsistencies

## Examples
\`\`\`javascript
// SCHEMA - Decimal type
price: decimal("price", { precision: 10, scale: 2 }).notNull(),

// ROUTES - String handling
totalPrice: requestData.totalPrice, // String from frontend

// CALCULATION ISSUES
const total = basePrice + addOnPrice; // String concatenation risk
\`\`\`

## Financial Risk
- **Severity**: HIGH
- **Impact**: Financial data accuracy, calculation errors
- Incorrect pricing calculations
- Revenue tracking errors
- Tax calculation issues
- Customer billing problems

## Required Solution
1. Standardize price handling as numbers
2. Implement proper decimal arithmetic
3. Add currency formatting utilities
4. Validate all price inputs
5. Add comprehensive price calculation tests

## Implementation
\`\`\`javascript
// Proper price handling
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const calculateTotal = (basePrice: number, addOns: number[]): number => {
  return basePrice + addOns.reduce((sum, addon) => sum + addon, 0);
};
\`\`\`

## Acceptance Criteria
- [ ] Consistent price data types
- [ ] Proper decimal arithmetic
- [ ] Currency formatting utilities
- [ ] Price validation
- [ ] Comprehensive testing
- [ ] Migration script for existing data

## Priority
**HIGH** - Financial data integrity risk.`,
    labels: ["high", "data-integrity", "pricing", "backend", "frontend"]
  },

  {
    title: "🟠 HIGH: Missing Environment Validation - Deployment Failure Risk",
    body: `## Problem
No environment variable validation, leading to potential runtime failures and deployment issues.

## Affected Files
- \`server/index.ts\`
- \`server/db.ts\`
- \`server/openai.ts\`

## Current Issues
\`\`\`javascript
// NO VALIDATION - Can fail at runtime
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set...");
}

// MISSING VALIDATION for other critical env vars
process.env.OPENAI_API_KEY // Used without checking
process.env.TWILIO_ACCOUNT_SID // Used without checking
\`\`\`

## Risk
- **Severity**: HIGH
- **Impact**: Service availability, deployment failures
- Runtime crashes in production
- Silent feature failures
- Difficult debugging
- Inconsistent behavior across environments

## Required Solution
1. Implement comprehensive environment validation
2. Create environment schema with Zod
3. Add startup validation checks
4. Provide clear error messages
5. Add environment documentation

## Implementation
\`\`\`javascript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  PORT: z.string().default('7000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
\`\`\`

## Acceptance Criteria
- [ ] Environment schema validation
- [ ] Startup validation checks
- [ ] Clear error messages
- [ ] Environment documentation
- [ ] Development vs production configs
- [ ] Docker environment validation

## Priority
**HIGH** - Deployment reliability risk.`,
    labels: ["high", "infrastructure", "environment", "deployment", "backend"]
  },

  {
    title: "🟠 HIGH: No Timezone Handling - Booking Conflicts for Hawaii Business",
    body: `## Problem
No consistent timezone handling for a Hawaii-based photography business, leading to booking conflicts and scheduling errors.

## Affected Files
- Throughout the application
- Booking system
- Calendar functionality
- Client communications

## Issues
1. **Server Timezone**: No explicit timezone configuration
2. **Client Timezone**: Browser timezone used inconsistently
3. **Database Storage**: Timestamps without timezone context
4. **Booking Conflicts**: Time zone confusion causing double bookings
5. **Client Communication**: Appointment times unclear

## Business Impact
- **Severity**: HIGH
- **Impact**: Business operation failures, customer confusion
- Missed appointments due to timezone confusion
- Double bookings from timezone errors
- Customer dissatisfaction
- Lost revenue from scheduling conflicts

## Current State
\`\`\`javascript
// PROBLEMATIC - No timezone handling
date: z.string().transform(val => new Date(val)),

// INCONSISTENT - Browser timezone used
const startDate = new Date(start as string);
\`\`\`

## Required Solution
1. Set application timezone to Hawaii (HST/HDT)
2. Store all timestamps in UTC with timezone info
3. Convert displays to Hawaii time
4. Add timezone indicators in UI
5. Handle daylight saving time transitions

## Implementation
\`\`\`javascript
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

const HAWAII_TIMEZONE = 'Pacific/Honolulu';

// Convert user input to UTC
const bookingDateUTC = zonedTimeToUtc(userDate, HAWAII_TIMEZONE);

// Display in Hawaii time
const displayDate = utcToZonedTime(utcDate, HAWAII_TIMEZONE);
const formattedDate = format(displayDate, 'yyyy-MM-dd HH:mm zzz', { 
  timeZone: HAWAII_TIMEZONE 
});
\`\`\`

## Acceptance Criteria
- [ ] Hawaii timezone configuration
- [ ] UTC storage with timezone conversion
- [ ] Consistent timezone display
- [ ] Daylight saving time handling
- [ ] Client timezone detection
- [ ] Clear time zone indicators in UI

## Priority
**HIGH** - Critical for Hawaii-based business operations.`,
    labels: ["high", "timezone", "bookings", "business-logic", "backend", "frontend"]
  }
];

console.log("GitHub Issues Creation Script");
console.log("============================");
console.log(`Total issues to create: ${issues.length}`);
console.log("");

issues.forEach((issue, index) => {
  console.log(`${index + 1}. ${issue.title}`);
  console.log(`   Labels: ${issue.labels.join(', ')}`);
  console.log("");
});

console.log("To create these issues, run:");
console.log("gh issue create --title \"TITLE\" --body \"BODY\" --label \"LABELS\"");
console.log("");
console.log("Or use the GitHub CLI in a loop to create all issues automatically.");

// Export for potential automation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { issues };
}
