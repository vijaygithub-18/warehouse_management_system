# 🚀 Warehouse WMS - Deployment Guide

**Version:** 1.0  
**Last Updated:** 2024

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Production Configuration](#production-configuration)
6. [Security Checklist](#security-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ Prerequisites

### System Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 20 GB
- OS: Ubuntu 20.04+ / Windows Server 2019+

**Recommended:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 50 GB SSD
- OS: Ubuntu 22.04 LTS

### Software Requirements

**Required:**
- Node.js 18+ (LTS)
- PostgreSQL 14+
- npm 9+

**Optional:**
- Nginx (reverse proxy)
- PM2 (process manager)
- SSL Certificate (Let's Encrypt)

---

## 🗄️ Database Setup

### Step 1: Install PostgreSQL

**Ubuntu:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Run installer
- Set password for postgres user

### Step 2: Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE warehouse_wms;

# Create user
CREATE USER wms_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE warehouse_wms TO wms_user;

# Exit
\q
```

### Step 3: Run Migrations

```bash
# Connect to database
psql -U wms_user -d warehouse_wms

# Run schema (copy from your schema.sql file)
\i /path/to/schema.sql

# Run critical migrations
\i /path/to/migrations/add_unique_constraints.sql

# Verify tables
\dt

# Exit
\q
```

### Step 4: Create Initial Admin User

```sql
-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password, role) 
VALUES (
  'admin', 
  'admin@yourcompany.com', 
  '$2b$10$YourHashedPasswordHere', 
  'admin'
);
```

**Generate password hash:**
```javascript
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('your_password', 10);
console.log(hash);
```

---

## 🔧 Backend Deployment

### Step 1: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd warehouse-wms-backend

# Install dependencies
npm install

# Install PM2 globally
npm install -g pm2
```

### Step 2: Environment Configuration

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=warehouse_wms
DB_USER=wms_user
DB_PASSWORD=your_secure_password

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password

# CORS
FRONTEND_URL=https://yourdomain.com
```

**Important:** Change all default values!

### Step 3: Update Database Config

Edit `config/db.js`:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### Step 4: Start with PM2

```bash
# Start application
pm2 start server.js --name warehouse-wms-backend

# Save PM2 configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup

# Check status
pm2 status

# View logs
pm2 logs warehouse-wms-backend
```

### Step 5: Configure Nginx (Optional)

Create `/etc/nginx/sites-available/warehouse-wms`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/warehouse-wms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🎨 Frontend Deployment

### Step 1: Build Frontend

```bash
cd warehouse-wms-frontend

# Install dependencies
npm install

# Update API URL in code
# Find and replace: http://localhost:3000 → https://api.yourdomain.com

# Build for production
npm run build
```

### Step 2: Deploy Build

**Option A: Nginx (Recommended)**

```bash
# Copy build files
sudo cp -r dist/* /var/www/warehouse-wms/

# Create Nginx config
sudo nano /etc/nginx/sites-available/warehouse-wms-frontend
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/warehouse-wms;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/warehouse-wms-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Option B: Serve with Node**

```bash
npm install -g serve
pm2 start "serve -s dist -p 5173" --name warehouse-wms-frontend
```

### Step 3: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🔒 Production Configuration

### Update CORS

Backend `server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true
}));
```

### Update API URLs

Frontend - Create `.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com
```

Update all fetch calls:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

fetch(`${API_URL}/api/products/all`)
```

### Change Daily Report Schedule

Backend `server.js`:

```javascript
// Change from every minute to 8 AM daily
cron.schedule('0 8 * * *', async () => {
  // Daily report code
});
```

### Database Backup

**Setup automated backups:**

```bash
# Create backup script
sudo nano /usr/local/bin/backup-wms-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/warehouse-wms"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U wms_user warehouse_wms > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-wms-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-wms-db.sh
```

---

## 🔐 Security Checklist

### Before Going Live

- [ ] Change all default passwords
- [ ] Update JWT_SECRET to strong random string
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW/iptables)
- [ ] Disable PostgreSQL remote access (if not needed)
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Remove console.log statements
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Test all features
- [ ] Create admin user
- [ ] Document credentials securely

### Firewall Setup

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### Rate Limiting

Install express-rate-limit:

```bash
npm install express-rate-limit
```

Backend `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring & Maintenance

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart warehouse-wms-backend

# Stop application
pm2 stop warehouse-wms-backend

# Delete from PM2
pm2 delete warehouse-wms-backend
```

### Database Maintenance

```bash
# Vacuum database (monthly)
psql -U wms_user -d warehouse_wms -c "VACUUM ANALYZE;"

# Check database size
psql -U wms_user -d warehouse_wms -c "SELECT pg_size_pretty(pg_database_size('warehouse_wms'));"

# Check table sizes
psql -U wms_user -d warehouse_wms -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Log Rotation

Create `/etc/logrotate.d/warehouse-wms`:

```
/var/log/warehouse-wms/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Health Check Endpoint

Backend - Add to `server.js`:

```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Monitoring Tools (Optional)

**PM2 Plus:**
```bash
pm2 link <secret> <public>
```

**Uptime Monitoring:**
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 🔄 Updates & Rollback

### Update Application

```bash
# Pull latest code
git pull origin main

# Backend
cd warehouse-wms-backend
npm install
pm2 restart warehouse-wms-backend

# Frontend
cd warehouse-wms-frontend
npm install
npm run build
sudo cp -r dist/* /var/www/warehouse-wms/
```

### Rollback

```bash
# Restore database backup
psql -U wms_user -d warehouse_wms < /var/backups/warehouse-wms/backup_YYYYMMDD_HHMMSS.sql

# Revert code
git checkout <previous-commit-hash>
pm2 restart all
```

---

## 📝 Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] HTTPS working
- [ ] Database connected
- [ ] Login working
- [ ] All pages loading
- [ ] Email notifications working
- [ ] Daily reports scheduled
- [ ] Backups running
- [ ] Monitoring active
- [ ] Logs accessible
- [ ] PM2 auto-restart working
- [ ] Firewall configured
- [ ] SSL certificate auto-renewal setup
- [ ] Documentation updated
- [ ] Team trained

---

## 🆘 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs warehouse-wms-backend --lines 100

# Check if port is in use
sudo lsof -i :3000

# Check database connection
psql -U wms_user -d warehouse_wms -c "SELECT 1;"
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Test connection
psql -U wms_user -h localhost -d warehouse_wms
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📞 Support

**Technical Issues:**
- Check logs first
- Review error messages
- Search documentation
- Contact: tech@yourcompany.com

**Emergency:**
- Database backup location: `/var/backups/warehouse-wms/`
- PM2 process name: `warehouse-wms-backend`
- Nginx config: `/etc/nginx/sites-available/warehouse-wms`

---

**End of Deployment Guide**

Next Steps:
- Review `USER_MANUAL.md` for usage
- Review `API_DOCUMENTATION.md` for API details
- Train your team
- Monitor application
