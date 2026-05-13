# Quick Deployment Commands

## 🚀 Deploy to Hostinger (Run on Server)

```bash
# Option 1: Use deployment script (recommended)
cd ~/ApiForge
git pull origin collections
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh

# Option 2: Manual commands
cd ~/ApiForge
git pull origin collections
pnpm install
pnpm --filter @apiforge/api-server build
pnpm --filter @apiforge/dashboard-web build
pm2 restart apiforge-api
pm2 restart apiforge-frontend
pm2 status
```

## 📝 Update Nginx (Run on Server)

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/default

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔍 Check Logs (Run on Server)

```bash
# Backend logs
pm2 logs apiforge-api --lines 50

# Frontend logs
pm2 logs apiforge-frontend --lines 50

# Live logs (both)
pm2 logs
```

## 🌐 URLs

- **Frontend**: https://ola.apidev.cloud/
- **Backend API**: https://ola.apidev.cloud/apiforgeapi/api/projects

## ⚠️ Important Notes

1. **Environment variables** in Next.js are baked at build time
2. Always **rebuild frontend** after changing `.env.local`
3. Always **rebuild backend** after changing `.env`
4. **Clear browser cache** or use incognito to test changes
5. Nginx `/_next/static/` location MUST come BEFORE `/` location
