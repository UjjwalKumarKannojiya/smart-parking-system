# 🚀 Smart Parking - Complete Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Testing](#local-testing)
3. [GitHub Repository Setup](#github-repository-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [Production Configuration](#production-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Security Verification

- [ ] **Environment Variables**: All sensitive data in `.env` (never in code)
- [ ] **Git Ignore**: `.env` is in `.gitignore` (verify with `git check-ignore -v .env`)
- [ ] **Credentials Rotation**: MongoDB, JWT_SECRET are production-grade
- [ ] **Documentation**: Removed all hardcoded credentials from docs
- [ ] **HTTPS**: SSL certificate ready for production domain
- [ ] **CORS**: Updated CLIENT_URL to production domain

### Code Quality

- [ ] **No Console Logs**: Sensitive data not logged
- [ ] **Error Handling**: All errors caught and handled gracefully
- [ ] **Input Validation**: All endpoints validate input
- [ ] **Authentication**: Protected endpoints require valid JWT
- [ ] **Authorization**: RBAC implemented and tested
- [ ] **Rate Limiting**: Enabled on production

### Database Setup

- [ ] **MongoDB Atlas Created**: Production cluster ready
- [ ] **Database Users**: Created with minimal necessary permissions
- [ ] **Backup Policy**: Configured automatic backups
- [ ] **Connection Pool**: Configured for expected load
- [ ] **Indexes**: Created on frequently queried fields

---

## Local Testing

### Step 1: Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Configure Environment

**Backend `.env`:**
```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/smart_parking
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
LOG_LEVEL=debug
```

**Frontend `.env.local`:**
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Step 3: Seed Database

```bash
cd backend
npm run seed

# Expected output:
# ✅ Connected to MongoDB
# 🧹 Cleared existing data
# 👥 Created 5 users
# 🅿️  Created 60 parking slots
# ✅ Database seeded successfully!
```

### Step 4: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# Expected: Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start

# Expected: Opens http://localhost:3000
```

### Step 5: Test Application

**Test Scenarios:**
1. **Login**: Try admin/staff/user accounts
2. **Create Booking**: Test available slot selection
3. **Staff Operations**: Test check-in/out
4. **Admin Dashboard**: Verify analytics
5. **API Health**: `GET http://localhost:5000/api/health`

### Step 6: Run API Tests

Use provided `docs/api-tests.http` or create Postman collection:
```bash
curl http://localhost:5000/api/health

# Expected Response:
# {
#   "success": true,
#   "message": "API is running",
#   "timestamp": "2024-01-15T10:30:00.000Z"
# }
```

---

## GitHub Repository Setup

### Step 1: Initialize Git Repository

```bash
cd smart-parking
git init
git add .
git commit -m "Initial commit: Smart Parking Management System"
```

### Step 2: Verify .gitignore

```bash
# Confirm .env is excluded
git check-ignore -v .env
# Output: .env

# Verify node_modules excluded
git check-ignore -v node_modules
# Output: node_modules
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: `smart-parking`
3. Do NOT add README (we already have one)
4. Copy repository URL

### Step 4: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/smart-parking.git
git branch -M main
git push -u origin main
```

### Step 5: Create Release Tags

```bash
git tag -a v1.0.0 -m "Initial production release"
git push origin v1.0.0
```

### Important: Files NOT to Push

These files should be in `.gitignore` and NEVER committed:
- `.env` (has real credentials)
- `node_modules/` (reinstalled via npm install)
- `.DS_Store`, `Thumbs.db` (OS files)
- `*.log` files
- `.vscode/` settings (personal)

---

## Backend Deployment

### Option 1: Heroku (Recommended for beginners)

**Setup:**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create smart-parking-api
```

**Configure Environment:**
```bash
heroku config:set -a smart-parking-api \
  MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/smart_parking" \
  JWT_SECRET="your_production_secret_min_32_chars" \
  NODE_ENV="production" \
  CLIENT_URL="https://your-frontend-domain.vercel.app"
```

**Deploy:**
```bash
git push heroku main
```

**Verify:**
```bash
heroku open -a smart-parking-api
# Visit: https://smart-parking-api.herokuapp.com/api/health
```

### Option 2: Railway.app

**Setup:**
1. Connect GitHub account at https://railway.app
2. Select repository
3. Add MongoDB plugin or link existing database

**Configuration:**
- Set environment variables via Railway dashboard
- Deploy automatically on push

**URL Structure:**
```
https://smart-parking-production.up.railway.app/api/...
```

### Option 3: AWS EC2

**Setup:**
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance.ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/YOUR_USERNAME/smart-parking.git
cd smart-parking/backend
npm install
```

**Start Server:**
```bash
# Using PM2 for process management
npm install -g pm2
pm2 start server.js --name "smart-parking-api"
pm2 startup
pm2 save

# Verify
pm2 status
```

**Configure Nginx Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name api.yourparking.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare for Deployment

**Update package.json:**
```json
{
  "homepage": ".",
  "proxy": "https://your-backend-domain.com",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

**Create `.env.production`:**
```bash
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_ENV=production
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
cd frontend
vercel

# Answer prompts:
# - Link to existing project? No
# - Set project name: smart-parking-frontend
# - Set framework: React
# - Set build directory: build
```

**Option B: GitHub Integration**
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Choose your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js → (change to) Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://your-backend-url/api
     ```

### Step 3: Configure Custom Domain

1. Go to Vercel Project Settings → Domains
2. Add custom domain: `parking.yourdomain.com`
3. Update DNS records (provided by Vercel)
4. Wait for SSL certificate (automated)

### Step 4: Verify Deployment

```bash
# Test production build locally
npm run build
npm install -g serve
serve -s build

# Visit: http://localhost:3000
```

---

## Production Configuration

### Backend Production Settings

**Update `backend/.env` for production:**
```bash
NODE_ENV=production
PORT=5000

# Database: Use MongoDB Atlas (not local)
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smart_parking

# JWT: Use strong random key (minimum 32 characters)
JWT_SECRET=<generate-strong-random-key-32-chars-min>
JWT_EXPIRE=7d

# CORS: Set to production frontend domain
CLIENT_URL=https://parking.yourdomain.com

# Logging: Reduce verbosity
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate Strong JWT_SECRET:**
```bash
# macOS/Linux:
openssl rand -base64 32

# Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

### Frontend Production Settings

**Update `frontend/.env.production`:**
```bash
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENV=production
```

### HTTPS/SSL Configuration

**For Backend (Nginx):**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d api.yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

**For Frontend (Vercel):**
- ✅ Automatic HTTPS enabled by default

---

## Monitoring & Maintenance

### Setup Monitoring

**1. Database Monitoring (MongoDB Atlas)**
- Go to Atlas Dashboard → Clusters
- Enable monitoring alerts for:
  - Connection count
  - Query performance
  - Disk usage
  - Replication lag

**2. Application Monitoring (Optional: New Relic, Datadog)**
```bash
npm install newrelic

# Add to server.js
require('newrelic');
```

**3. Error Tracking (Optional: Sentry)**
```bash
npm install @sentry/node
```

### Logs & Debugging

**View Heroku Logs:**
```bash
heroku logs -a smart-parking-api --tail
```

**View Railway Logs:**
- Via Railway dashboard → Deployments → Logs

**View Server Logs (EC2):**
```bash
pm2 logs smart-parking-api
```

### Regular Maintenance Tasks

**Weekly:**
- [ ] Check error logs for patterns
- [ ] Verify all APIs responding correctly
- [ ] Monitor database size

**Monthly:**
- [ ] Review and optimize slow queries
- [ ] Audit user access logs
- [ ] Test backup restoration

**Quarterly:**
- [ ] Rotate JWT_SECRET (plan migration)
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance benchmarking

### Backup & Recovery

**MongoDB Atlas Automatic Backups:**
- Configured by default (8-4 week retention)
- Accessible via Atlas dashboard

**Restore from Backup:**
```bash
# Via MongoDB Compass
# 1. Go to Clusters → Backup → Restore
# 2. Select target cluster and time
# 3. Confirm restore
```

---

## Troubleshooting

### Deployment Issues

**Issue: "Cannot find module express"**
```bash
Solution: npm install in backend directory
cd backend && npm install
```

**Issue: "MongoDB connection timeout"**
```bash
Solution 1: Verify MONGO_URI in production .env
Solution 2: Check MongoDB Atlas IP whitelist includes server IP
Solution 3: Test connection: mongosh <MONGO_URI>
```

**Issue: "CORS blocked on frontend"**
```bash
Solution 1: Check CLIENT_URL matches frontend domain
Solution 2: Verify CORS headers in backend server.js
Solution 3: Clear browser cache (Cmd+Shift+Delete)
```

**Issue: "Vercel build fails"**
```bash
Solution 1: Check package.json scripts in frontend/
Solution 2: Verify .env variables available at build time
Solution 3: Check for circular dependencies
```

### Performance Issues

**High Memory Usage:**
- Increase server resources
- Enable database query optimization
- Implement caching layer

**Slow API Responses:**
- Check MongoDB indexes
- Enable CDN for static assets
- Implement request caching

---

## Success Checklist

- [ ] ✅ All tests passing locally
- [ ] ✅ Production `.env` configured securely
- [ ] ✅ GitHub repository with clean history
- [ ] ✅ Backend deployed and accessible
- [ ] ✅ Frontend deployed on Vercel
- [ ] ✅ Custom domain configured
- [ ] ✅ HTTPS/SSL working
- [ ] ✅ Environment variables set on all platforms
- [ ] ✅ Monitoring and alerts configured
- [ ] ✅ Backup strategy in place

---

**Deployment Date**: _____________________  
**Production URL**: _____________________  
**Backend URL**: _____________________  
**Frontend URL**: _____________________
