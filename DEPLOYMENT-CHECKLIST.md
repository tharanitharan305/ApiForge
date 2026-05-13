# ApiForge Deployment Checklist

## ✅ Pre-Deployment Checklist

### Local Changes
- [x] Updated `next.config.mjs` (removed basePath)
- [x] Updated `.env.local` (removed PORT, kept API URL)
- [x] Created `vercel.json` for monorepo build
- [x] Updated backend CORS to allow Vercel domains
- [x] Created deployment documentation

### Git
- [ ] Commit all changes
- [ ] Push to `collections` branch

```bash
git add .
git commit -m "feat: configure for Vercel deployment"
git push origin collections
```

---

## 🚀 Deployment Steps

### 1. Deploy Frontend to Vercel

**Using Vercel Dashboard:**
1. [ ] Go to [vercel.com](https://vercel.com)
2. [ ] Click "Add New Project"
3. [ ] Import your repository
4. [ ] Configure:
   - Root Directory: `apps/dashboard-web`
   - Build Command: `cd ../.. && pnpm build --filter=@apiforge/dashboard-web`
   - Install Command: `cd ../.. && pnpm install`
5. [ ] Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://ola.apidev.cloud/apiforgeapi/api`
6. [ ] Click "Deploy"
7. [ ] Copy your Vercel URL (e.g., `https://apiforge-dashboard.vercel.app`)

**OR Using Vercel CLI:**
```bash
npm i -g vercel
cd apps/dashboard-web
vercel login
vercel
# Follow prompts
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://ola.apidev.cloud/apiforgeapi/api
vercel --prod
```

### 2. Update Backend CORS

**On Hostinger Server:**
```bash
# SSH to server
ssh root@your-server

# Edit backend .env
nano ~/ApiForge/apps/api-server/.env
```

Update `FRONTEND_URL` with your Vercel URL:
```env
FRONTEND_URL="https://your-actual-vercel-url.vercel.app"
```

Rebuild and restart:
```bash
cd ~/ApiForge
git pull origin collections
pnpm --filter @apiforge/api-server build
pm2 restart apiforge-api
pm2 logs apiforge-api --lines 20
```

### 3. Stop Frontend on Hostinger

```bash
pm2 stop apiforge-frontend
pm2 delete apiforge-frontend
pm2 save
```

### 4. Test Deployment

- [ ] Visit your Vercel URL
- [ ] Check if projects list loads
- [ ] Create a new project
- [ ] Create a collection
- [ ] Add an API
- [ ] Test import/export
- [ ] Check browser console for errors

---

## 🔧 Post-Deployment Configuration

### Optional: Custom Domain

**In Vercel:**
1. [ ] Go to Project Settings → Domains
2. [ ] Add domain: `forge.ola.apidev.cloud`
3. [ ] Copy DNS records

**In DNS Provider:**
```
Type: CNAME
Name: forge
Value: cname.vercel-dns.com
```

**Update Backend:**
```bash
nano ~/ApiForge/apps/api-server/.env
# Change FRONTEND_URL to: https://forge.ola.apidev.cloud
cd ~/ApiForge
pnpm --filter @apiforge/api-server build
pm2 restart apiforge-api
```

---

## 📊 Final URLs

- **Frontend**: `https://your-vercel-url.vercel.app`
- **Backend**: `https://ola.apidev.cloud/apiforgeapi/api`
- **Database**: Neon PostgreSQL (no change)

---

## 🐛 Troubleshooting

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Verify `vercel.json` configuration
- Ensure all dependencies are in `package.json`

### CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches Vercel URL
- Check backend logs: `pm2 logs apiforge-api`
- Rebuild backend after changing `.env`

### API calls fail
- Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Verify backend is running: `pm2 status`
- Test backend directly: `curl https://ola.apidev.cloud/apiforgeapi/api/projects`

### Environment variables not working
- Must be prefixed with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables in Vercel
- Clear browser cache

---

## 🎉 Success Criteria

- [ ] Frontend loads on Vercel URL
- [ ] No CORS errors in browser console
- [ ] Projects list loads successfully
- [ ] Can create/edit/delete projects
- [ ] Can create/edit/delete collections
- [ ] Can create/edit/delete APIs
- [ ] Import Postman collection works
- [ ] Export SDK works
- [ ] Export Postman works
- [ ] All static assets load (CSS, JS, fonts)

---

## 📝 Notes

- Vercel automatically deploys on push to `collections` branch
- Preview deployments created for pull requests
- Backend still needs manual deployment on Hostinger
- Database migrations run automatically on backend startup
