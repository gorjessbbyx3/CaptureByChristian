# Multi-stage build for production optimization
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init and curl for health checks
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy docker-scripts directory for database initialization
COPY --chown=nextjs:nodejs ./docker-scripts ./docker-scripts
RUN chmod +x ./docker-scripts/start.sh

# Create a simple start script that calls the docker-scripts version
#RUN echo '#!/bin/sh' > /app/start.sh && \
#    echo 'cd /app' >> /app/start.sh && \
#    echo 'exec ./start.sh' >> /app/start.sh && \
#    chmod +x /app/start.sh && \
#    chown nextjs:nodejs /app/start.sh

RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'node dist/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh


# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 7000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7000/api/health || exit 1

# Start the application with database initialization
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]
