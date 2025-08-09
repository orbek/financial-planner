# 🚀 Production Deployment Guide

This guide covers deploying your React.js Financial Planner to production environments with multiple options including Docker, cloud platforms, and traditional hosting.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ All features tested in development
- ✅ Environment variables configured
- ✅ Database setup (Supabase for production)
- ✅ SSL certificates for secure connections
- ✅ Domain name (optional but recommended)

## 🔧 Environment Configuration

### 1. Production Environment Variables

Create production environment files:

**Client Environment (`client/.env.production`):**
```bash
# API Configuration
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME=Financial Planner
VITE_APP_VERSION=1.0.0

# Database Configuration  
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Authentication
VITE_AUTH_ENABLED=true
VITE_DEMO_MODE=false
```

**Server Environment (`server/.env.production`):**
```bash
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
USE_SUPABASE=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Authentication (Microsoft OAuth)
CLIENT_ID=your-microsoft-app-id
CLIENT_SECRET=your-microsoft-app-secret
TENANT_ID=your-microsoft-tenant-id
REDIRECT_URI=https://your-domain.com/auth/callback

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
CORS_ORIGIN=https://your-frontend-domain.com

# AI Services
GOOGLE_API_KEY=your-google-gemini-api-key
GOOGLE_PROJECT_ID=your-google-project-id

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🐳 Docker Deployment (Recommended)

### Option 1: Docker Compose (Full Stack)

**1. Build and Deploy:**
```bash
# Clone your repository
git clone https://github.com/yourusername/financial-planner-react.git
cd financial-planner-react

# Copy environment files
cp client/.env.example client/.env.production
cp server/.env.example server/.env.production
# Edit the files with your production values

# Build and start services
docker-compose up -d

# Check status
docker-compose ps
```

**2. SSL Setup with Nginx:**
```yaml
# Add to docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - client
      - server
```

**3. Nginx Configuration (`nginx/nginx.conf`):**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server server:5000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Frontend
        location / {
            proxy_pass http://client:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### Option 2: Individual Docker Containers

**1. Build Images:**
```bash
# Build client image
cd client
docker build -t financial-planner-client .

# Build server image
cd ../server
docker build -t financial-planner-server .
```

**2. Run Containers:**
```bash
# Run server
docker run -d \
  --name financial-server \
  --env-file .env.production \
  -p 5000:5000 \
  financial-planner-server

# Run client
docker run -d \
  --name financial-client \
  --env-file .env.production \
  -p 3000:3000 \
  financial-planner-client
```

---

## ☁️ Cloud Platform Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod

# Set environment variables in Vercel dashboard
# Add all VITE_* variables from .env.production
```

**Backend on Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy from server directory
cd server
railway login
railway init
railway add --service postgresql
railway deploy

# Set environment variables in Railway dashboard
```

### Option 2: Netlify (Frontend) + Heroku (Backend)

**Frontend on Netlify:**
```bash
# Build the client
cd client
npm run build

# Deploy dist folder to Netlify
# Or connect GitHub repository for auto-deployment
```

**Backend on Heroku:**
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app from server directory
cd server
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
# ... add all other environment variables

# Deploy
git push heroku main
```

### Option 3: AWS (Complete Solution)

**Architecture:**
- Frontend: S3 + CloudFront
- Backend: EC2 or ECS
- Database: RDS PostgreSQL
- Storage: S3 for file uploads

**Frontend Deployment:**
```bash
# Build the application
cd client
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

**Backend Deployment (EC2):**
```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install docker.io docker-compose

# Clone repository and deploy
git clone https://github.com/yourusername/financial-planner-react.git
cd financial-planner-react
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🗄️ Database Setup

### Supabase (Recommended for Production)

**1. Create Supabase Project:**
- Go to [supabase.com](https://supabase.com)
- Create new project
- Note your project URL and API keys

**2. Run Database Migrations:**
```sql
-- Copy content from database/init/01-create-tables.sql
-- Run in Supabase SQL editor

-- Copy content from database/init/02-seed-data.sql
-- Run in Supabase SQL editor (optional for production)
```

**3. Configure Row Level Security:**
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Create policies for user data isolation
CREATE POLICY "Users can only see own data" ON accounts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only see own transactions" ON transactions
    FOR ALL USING (user_id = auth.uid());
-- ... create policies for all tables
```

### Alternative: Managed PostgreSQL

For other providers (AWS RDS, Digital Ocean, etc.):
```bash
# Connect to your managed database
psql "postgresql://username:password@host:port/database?sslmode=require"

# Run the initialization scripts
\i database/init/01-create-tables.sql
\i database/init/02-seed-data.sql
```

---

## 🔐 Security Configuration

### 1. SSL/TLS Setup

**Let's Encrypt (Free SSL):**
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Security Headers

**Add to server middleware:**
```javascript
// server/src/index.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://your-api-domain.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
```

### 3. Environment Security

```bash
# Never commit these files
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Use secrets management in production
# AWS Secrets Manager, Azure Key Vault, etc.
```

---

## 📊 Monitoring & Analytics

### 1. Application Monitoring

**Add to server:**
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  })
})

// Error tracking
app.use((error, req, res, next) => {
  console.error('Error:', error)
  // Send to monitoring service (Sentry, LogRocket, etc.)
  res.status(500).json({ error: 'Internal server error' })
})
```

### 2. Performance Monitoring

**Client-side analytics:**
```javascript
// Add to client/src/main.tsx
if (import.meta.env.PROD) {
  // Google Analytics
  // PostHog
  // Mixpanel
}
```

### 3. Uptime Monitoring

- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring
- **DataDog**: Full observability platform

---

## 🚦 CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build and deploy to Vercel
        run: |
          cd client
          npm ci
          npm run build
          npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          cd server
          railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 📝 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Code reviewed and approved
- [ ] Dependencies updated and secure

### Configuration
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] DNS records pointing to production

### Security
- [ ] Authentication working
- [ ] API rate limiting enabled
- [ ] CORS configured properly
- [ ] Security headers implemented

### Performance
- [ ] Images optimized
- [ ] Bundle size analyzed
- [ ] CDN configured
- [ ] Caching strategies implemented

### Monitoring
- [ ] Health checks working
- [ ] Error tracking setup
- [ ] Analytics configured
- [ ] Backup strategy implemented

---

## 🔄 Post-Deployment

### 1. Verify Deployment
```bash
# Check all endpoints
curl https://your-domain.com/health
curl https://your-domain.com/api/health

# Test authentication flow
# Test core functionality
```

### 2. Monitor Performance
- Check application metrics
- Monitor error rates
- Verify database connections
- Test from different locations

### 3. Backup Strategy
```bash
# Database backups
pg_dump "postgresql://..." > backup-$(date +%Y%m%d).sql

# Application backups
tar -czf app-backup-$(date +%Y%m%d).tar.gz .
```

---

## 🆘 Troubleshooting

### Common Issues

**1. Build Failures:**
```bash
# Clear node modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**2. Environment Variable Issues:**
```bash
# Check variables are loaded
node -e "console.log(process.env.NODE_ENV)"
```

**3. Database Connection Issues:**
```bash
# Test database connection
psql "postgresql://user:pass@host:port/db"
```

**4. CORS Issues:**
```javascript
// Update server CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
```

---

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test in a staging environment
4. Review this guide's troubleshooting section

**Log Locations:**
- Docker: `docker logs container-name`
- PM2: `pm2 logs`
- System: `/var/log/nginx/`, `/var/log/apache2/`

---

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Implement backup automation
3. Plan for scaling strategies
4. Document your specific deployment process
5. Set up staging environment for future updates

Your React.js Financial Planner is now ready for production! 🚀
