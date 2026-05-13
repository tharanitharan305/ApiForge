# ApiForge Hostinger Deployment Guide

## Current Setup
- **Domain**: https://ola.apidev.cloud
- **Backend Port**: 9753 (accessible at `/apiforgeapi/`)
- **Frontend Port**: 9754 (accessible at `/`)
- **Database**: Neon PostgreSQL (cloud)

---

## 🚨 CRITICAL: Fix Current Deployment Issues

### Step 1: Update Environment Files (Already Done Locally)

The following files have been updated in your local workspace:

**Backend** (`apps/api-server/.env`):
```env
DATABASE_URL="postgresql://neondb_owner:npg_8unBthpPiF5j@ep-nameless-rice-aqliscl4.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
PORT=9753
NODE_ENV=production
FRONTEND_URL="https://ola.apidev.cloud"
```

**Frontend** (`apps/dashboard-web/.env.local`):
```env
PORT=9754
NEXT_PUBLIC_API_URL=https://ola.apidev.cloud/apiforgeapi/api
```

### Step 2: Push Changes to Git

```bash
# On your local machine
git add apps/api-server/.env apps/dashboard-web/.env.local
git commit -m "fix: update environment variables for production deployment"
git push origin collections
```

### Step 3: Deploy on Hostinger Server

SSH into your Hostinger server and run these commands:

```bash
# Navigate to project
cd ~/ApiForge

# Pull latest changes
git pull origin collections

# Rebuild backend
pnpm --filter @apiforge/api-server build

# Rebuild frontend (this bakes in NEXT_PUBLIC_API_URL)
pnpm --filter @apiforge/dashboard-web build

# Restart both services
pm2 restart apiforge-api
pm2 restart apiforge-frontend

# Check status
pm2 status

# View logs to confirm
pm2 logs apiforge-api --lines 20
pm2 logs apiforge-frontend --lines 20
```

**OR** use the deployment script:

```bash
# Make script executable
chmod +x ~/ApiForge/deploy-hostinger.sh

# Run deployment
~/ApiForge/deploy-hostinger.sh
```

### Step 4: Update Nginx Configuration

Edit your Nginx config:

```bash
sudo nano /etc/nginx/sites-available/default
```

Make sure you have these location blocks (in this order):

```nginx
# Backend API
location /apiforgeapi/ {
    rewrite ^/apiforgeapi/(.*)$ /$1 break;
    proxy_pass http://127.0.0.1:9753;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Connection '';
    chunked_transfer_encoding off;
    proxy_buffering off;
    proxy_read_timeout 3600;
}

# Frontend static files (MUST come before root)
location /_next/static/ {
    proxy_pass http://127.0.0.1:9754;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# Frontend root
location / {
    proxy_pass http://127.0.0.1:9754;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
    proxy_buffering off;
}
```

Test and reload Nginx:

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: Verify Deployment

1. **Backend API**: https://ola.apidev.cloud/apiforgeapi/api/projects
2. **Frontend**: https://ola.apidev.cloud/

Clear browser cache or test in incognito mode to see changes.

---

## 🔍 Troubleshooting

### Issue: Frontend still calls localhost:4000

**Cause**: Environment variables in Next.js are baked into the build at build time.

**Solution**: Rebuild frontend after updating `.env.local`:
```bash
cd ~/ApiForge
pnpm --filter @apiforge/dashboard-web build
pm2 restart apiforge-frontend
```

### Issue: CORS errors

**Cause**: Backend CORS not configured for production domain.

**Solution**: Check `apps/api-server/.env` has:
```env
FRONTEND_URL="https://ola.apidev.cloud"
```

Then rebuild and restart backend:
```bash
pnpm --filter @apiforge/api-server build
pm2 restart apiforge-api
```

### Issue: Static files return 404

**Cause**: Nginx not properly proxying `/_next/static/` requests.

**Solution**: Add the `/_next/static/` location block BEFORE the root `/` location in Nginx config.

### Issue: CSS/JS files have wrong MIME type

**Cause**: Nginx returning HTML (404 page) instead of actual files.

**Solution**: Ensure `/_next/static/` location block is configured correctly.

---

## 📊 Monitoring

### View Logs
```bash
# Backend logs
pm2 logs apiforge-api

# Frontend logs
pm2 logs apiforge-frontend

# Both logs
pm2 logs
```

### Check Status
```bash
pm2 status
```

### Restart Services
```bash
# Restart backend
pm2 restart apiforge-api

# Restart frontend
pm2 restart apiforge-frontend

# Restart both
pm2 restart all
```

---

## 🔄 Future Deployments

For future updates:

1. Make changes locally
2. Commit and push to `collections` branch
3. SSH into server
4. Run: `~/ApiForge/deploy-hostinger.sh`

---

## ✅ Expected Results After Fix

1. Frontend loads at `https://ola.apidev.cloud/`
2. All static files (CSS, JS, fonts) load correctly
3. API calls go to `https://ola.apidev.cloud/apiforgeapi/api/*`
4. No CORS errors
5. No 404 errors for static files
6. Projects list loads successfully
