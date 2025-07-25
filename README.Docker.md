# CapturedCCollective - Docker Deployment

This guide covers how to deploy the CapturedCCollective photography platform using Docker.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 1. Setup Environment
```bash
# Copy the environment template
cp .env.docker .env

# Edit .env with your actual API keys
nano .env
```

### 2. Start the Application
```bash
# Using the convenience script
./docker-scripts/start.sh

# Or manually
docker-compose up -d
```

### 3. Access the Application
- **Web Application**: http://localhost:7000
- **Database**: localhost:5432
- **Redis**: localhost:6379 (optional)

## 📋 Architecture

The Docker setup includes:

- **App Container**: Node.js application with CapturedCCollective
- **Database Container**: PostgreSQL 15 with persistent data
- **Redis Container**: Session storage and caching (optional)
- **Nginx Container**: Reverse proxy with rate limiting (optional)

## 🛠️ Configuration

### Environment Variables (.env)

```bash
# Database
DB_PASSWORD=secure_password_123
DATABASE_URL=postgresql://postgres:secure_password_123@database:5432/capturedcollective

# Application
NODE_ENV=production
PORT=7000

# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Security
SESSION_SECRET=your_session_secret_here
```

### API Keys Setup

1. **OpenAI API Key**: For AI booking assistance and image analysis
   - Get from: https://platform.openai.com/api-keys

2. **Twilio Credentials**: For SMS notifications
   - Get from: https://console.twilio.com/

## 🔧 Management Commands

### Start/Stop Services
```bash
# Start all services
./docker-scripts/start.sh

# Stop all services
./docker-scripts/stop.sh

# Restart services
docker-compose restart
```

### View Logs
```bash
# View app logs
./docker-scripts/logs.sh app

# View database logs
./docker-scripts/logs.sh database

# View all logs
docker-compose logs -f
```

### Database Management
```bash
# Connect to database
docker-compose exec database psql -U postgres -d capturedcollective

# Backup database
docker-compose exec database pg_dump -U postgres capturedcollective > backup.sql

# Restore database
docker-compose exec -T database psql -U postgres capturedcollective < backup.sql
```

## 🔧 Development Setup

For development with hot reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View development logs
docker-compose -f docker-compose.dev.yml logs -f app
```

## 🐳 Docker Commands

### Build and Deploy
```bash
# Build the application
docker-compose build

# Deploy with fresh build
docker-compose up -d --build

# Scale the application
docker-compose up -d --scale app=3
```

### Maintenance
```bash
# Check service status
docker-compose ps

# View resource usage
docker stats

# Clean up unused containers/images
docker system prune -a
```

## 📊 Monitoring

### Health Checks
- App health: http://localhost:7000/api/health
- Database health: `docker-compose ps database`
- Redis health: `docker-compose ps redis`

### Container Logs
```bash
# Real-time logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Logs from specific time
docker-compose logs --since="2024-01-01T00:00:00" app
```

## 🔒 Security

### Production Security
- Change default passwords in `.env`
- Use strong session secrets
- Enable HTTPS in nginx configuration
- Implement firewall rules
- Regular security updates

### SSL/TLS Setup
```bash
# Generate SSL certificates
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/nginx.key -out ssl/nginx.crt

# Update nginx.conf for HTTPS
# Restart nginx container
docker-compose restart nginx
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose ps database
   
   # View database logs
   docker-compose logs database
   
   # Restart database
   docker-compose restart database
   ```

2. **App Won't Start**
   ```bash
   # Check app logs
   docker-compose logs app
   
   # Verify environment variables
   docker-compose exec app env | grep -E "(DATABASE_URL|OPENAI_API_KEY)"
   
   # Rebuild app
   docker-compose build app && docker-compose up -d app
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port
   sudo lsof -i :7000
   
   # Change port in docker-compose.yml
   ports:
     - "5001:7000"  # Change external port
   ```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker rmi $(docker images -q)

# Start fresh
./docker-scripts/start.sh
```

## 📈 Performance Optimization

### Resource Limits
```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          memory: 512M
```

### Database Optimization
```bash
# Increase shared_buffers in postgres
docker-compose exec database psql -U postgres -c "ALTER SYSTEM SET shared_buffers = '256MB';"
docker-compose restart database
```

## 🔄 Backup Strategy

### Automated Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
docker-compose exec -T database pg_dump -U postgres capturedcollective > "$BACKUP_DIR/database.sql"
docker-compose exec app tar -czf "$BACKUP_DIR/uploads.tar.gz" -C /app uploads
EOF

# Make executable and run daily
chmod +x backup.sh
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## 🌐 Production Deployment

### Cloud Deployment
1. **AWS ECS**: Use provided docker-compose.yml
2. **Google Cloud Run**: Deploy from container registry
3. **Azure Container Instances**: Use docker-compose
4. **DigitalOcean Apps**: Deploy from GitHub with Dockerfile

### Domain Setup
```bash
# Update nginx.conf with your domain
server_name yourdomain.com www.yourdomain.com;

# Setup SSL with Let's Encrypt
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📞 Support

For Docker-related issues:
- Check logs: `./docker-scripts/logs.sh app`
- View configuration: `docker-compose config`
- Test connectivity: `docker-compose exec app curl -f http://localhost:7000/api/health`

The CapturedCCollective platform is now fully containerized and ready for production deployment!