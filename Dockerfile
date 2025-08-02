FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --only=production
RUN cd client && npm ci --only=production
COPY . .
RUN npm run build

FROM node:24-alpine AS production

RUN apk add --no-cache dumb-init curl

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/docker-scripts ./docker-scripts

RUN chmod +x ./docker-scripts/start.sh

RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'node dist/server/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

USER nextjs

# Use environment variable for port - this is crucial for Render
ENV PORT=10000
EXPOSE $PORT

# Update healthcheck to use environment PORT
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]