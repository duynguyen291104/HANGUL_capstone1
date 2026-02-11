# 🚀 Hướng Dẫn Deployment - Korean TOPIK Learning App

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Yêu Cầu](#yêu-cầu)
- [Deployment với Docker](#deployment-với-docker)
- [Deployment lên Vercel](#deployment-lên-vercel)
- [Deployment lên VPS/Cloud](#deployment-lên-vpscloud)
- [CI/CD Setup](#cicd-setup)
- [Monitoring](#monitoring)

---

## Tổng Quan

Dự án sử dụng:
- **Frontend/Backend**: Next.js 14+ (App Router)
- **Database**: PostgreSQL 16
- **ORM**: Prisma 7
- **Container**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

---

## Yêu Cầu

### Local Development
- Node.js 20+
- Docker & Docker Compose
- Git

### Production
- PostgreSQL database (hosted hoặc container)
- Node.js runtime (Vercel, VPS, Cloud Run, etc.)
- Domain name (optional)

---

## Deployment với Docker

### 1. Build Docker Image

```bash
# Build production image
docker build -t topik-learning-app:latest .

# Test local
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  topik-learning-app:latest
```

### 2. Docker Compose Production

Tạo file `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://topik_user:topik_password@postgres:5432/topik_learning_db
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: topik_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: topik_learning_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U topik_user"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

Deploy:

```bash
# Deploy production
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
```

---

## Deployment lên Vercel

### 1. Chuẩn Bị Database

Sử dụng managed PostgreSQL:
- **Vercel Postgres** (recommended)
- **Supabase** (free tier)
- **Railway**
- **Neon**
- **ElephantSQL**

### 2. Deploy lên Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

### 3. Environment Variables trên Vercel

Thêm trong Vercel Dashboard > Settings > Environment Variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Build Settings

**vercel.json**:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

### 5. Chạy Migrations

Sau khi deploy:

```bash
# Local với production database
DATABASE_URL="your_production_url" npx prisma migrate deploy

# Hoặc setup trong GitHub Actions
```

---

## Deployment lên VPS/Cloud

### Option 1: PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Build
npm run build

# Start with PM2
pm2 start npm --name "topik-app" -- start

# Setup auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs topik-app
```

**ecosystem.config.js**:

```javascript
module.exports = {
  apps: [{
    name: 'topik-learning-app',
    script: 'npm',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: process.env.DATABASE_URL
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
```

### Option 2: Systemd Service

**topik-app.service**:

```ini
[Unit]
Description=Korean TOPIK Learning App
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/topik-app
Environment="NODE_ENV=production"
Environment="DATABASE_URL=postgresql://..."
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Setup:

```bash
# Copy service file
sudo cp topik-app.service /etc/systemd/system/

# Enable & start
sudo systemctl enable topik-app
sudo systemctl start topik-app

# Check status
sudo systemctl status topik-app

# View logs
sudo journalctl -u topik-app -f
```

### Option 3: Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Create secrets
echo "your_db_password" | docker secret create db_password -

# Deploy stack
docker stack deploy -c docker-compose.prod.yml topik

# Check services
docker stack services topik

# Scale
docker service scale topik_app=3
```

---

## Nginx Configuration

**nginx.conf**:

```nginx
upstream nextjs {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://nextjs;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## CI/CD Setup

### GitHub Actions Secrets

Trong repository Settings > Secrets and variables > Actions, thêm:

```
DATABASE_URL - Production database URL
NEXT_PUBLIC_APP_URL - Production app URL
VERCEL_TOKEN - (nếu deploy lên Vercel)
DOCKER_USERNAME - Docker Hub username
DOCKER_PASSWORD - Docker Hub password
```

### Auto Deploy on Push

Workflow đã được tạo trong `.github/workflows/`:

- **ci-cd.yml**: Chạy tests, build, validate
- **deploy.yml**: Deploy lên production

### Manual Trigger

```bash
# Trigger deploy workflow manually
gh workflow run deploy.yml
```

---

## Database Migrations trong Production

### Cách 1: GitHub Actions

Thêm step trong workflow:

```yaml
- name: Run Production Migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Cách 2: Manual

```bash
# Connect to production database
export DATABASE_URL="production_url"

# Deploy migrations
npx prisma migrate deploy

# Verify
npx prisma db pull
```

### Cách 3: Init Container (Kubernetes/Docker)

```yaml
initContainers:
  - name: migrate
    image: topik-app:latest
    command: ['npx', 'prisma', 'migrate', 'deploy']
    env:
      - name: DATABASE_URL
        valueFrom:
          secretKeyRef:
            name: db-credentials
            key: url
```

---

## Monitoring

### Health Checks

```bash
# API health endpoint
curl https://yourdomain.com/api/health

# Database health
docker exec topik-postgres pg_isready
```

### Logging

**PM2**:
```bash
pm2 logs topik-app --lines 100
```

**Docker**:
```bash
docker logs -f topik-app --tail 100
```

### Metrics

Thêm monitoring tools:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Vercel Analytics** - Performance
- **Prometheus + Grafana** - Custom metrics

---

## Backup Database

### Automated Backup Script

**backup.sh**:

```bash
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATABASE="topik_learning_db"

# Create backup
docker exec topik-postgres pg_dump -U topik_user $DATABASE | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz"
```

Setup cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check connection
docker exec topik-postgres psql -U topik_user -d topik_learning_db -c "SELECT 1"

# Check network
docker network ls
docker network inspect korean-topik-learning-app_default
```

### Build Failures

```bash
# Clean build
rm -rf .next node_modules
npm install
npm run build
```

### Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Reset (development only!)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name fix_issue
```

---

## Security Checklist

- [ ] Change default database credentials
- [ ] Enable SSL for database connections
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Setup firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs for suspicious activity

---

## Support

- **Documentation**: [DATABASE_README.md](./DATABASE_README.md)
- **Issues**: GitHub Issues
- **CI/CD**: `.github/workflows/`
