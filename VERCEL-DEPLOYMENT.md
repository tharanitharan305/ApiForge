# Deploy ApiForge Frontend to Vercel

## Architecture
- **Frontend**: Vercel (Next.js)
- **Backend**: Hostinger at `https://ola.apidev.cloud/apiforgeapi/api`
- **Database**: Neon PostgreSQL (cloud)

---

## Step 1: Prepare Repository

Make sure your changes are committed and pushed:

```bash
git add .
git commit -m "feat: configure for Vercel deployment"
git push origin collections
```

---

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/dashboard-web`
   - **Build Command**: `cd ../.. && pnpm build --filter=@apiforge/dashboard-web`
   - **Install Command**: `cd ../.. && pnpm install`
   - **Output Directory**: `.next` (default)

5. Add Environment Variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://ola.apidev.cloud/apiforgeapi/api`

6. Click **"Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the dashboard-web directory
cd apps/dashboard-web
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? apiforge-dashboard (or your choice)
# - Directory? ./
# - Override settings? Yes
#   - Build Command: cd ../.. && pnpm build --filter=@apiforge/dashboard-web
#   - Output Directory: .next
#   - Install Command: cd ../.. && pnpm install

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://ola.apidev.cloud/apiforgeapi/api
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

---

## Step 3: Update Backend CORS

After Vercel gives you a URL (e.g., `https://apiforge-dashboard.vercel.app`), update your backend:

### On Hostinger Server:

```bash
# Edit backend .env
nano ~/ApiForge/apps/api-server/.env
```

Update `FRONTEND_URL`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_8unBthpPiF5j@ep-nameless-rice-aqliscl4.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
PORT=9753
NODE_ENV=production
FRONTEND_URL="https://your-vercel-url.vercel.app"
```

Then rebuild and restart:
```bash
cd ~/ApiForge
pnpm --filter @apiforge/api-server build
pm2 restart apiforge-api
```

---

## Step 4: Stop Frontend on Hostinger

Since frontend is now on Vercel, stop it on Hostinger:

```bash
# Stop the frontend process
pm2 stop apiforge-frontend
pm2 delete apiforge-frontend

# Save PM2 config
pm2 save
```

---

## Step 5: Custom Domain (Optional)

If you want to use a custom domain like `forge.ola.apidev.cloud`:

### In Vercel Dashboard:
1. Go to your project settings
2. Click **"Domains"**
3. Add domain: `forge.ola.apidev.cloud`
4. Vercel will show DNS records to add

### In Your DNS Provider:
Add a CNAME record:
```
Type: CNAME
Name: forge
Value: cname.vercel-dns.com
```

Then update backend CORS:
```env
FRONTEND_URL="https://forge.ola.apidev.cloud"
```

---

## Environment Variables in Vercel

Make sure these are set in Vercel project settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://ola.apidev.cloud/apiforgeapi/api` |

**Important**: `NEXT_PUBLIC_` prefix makes the variable available in the browser.

---

## Automatic Deployments

Vercel automatically deploys when you push to your repository:
- **Push to `collections` branch** → Vercel deploys automatically
- **Pull requests** → Vercel creates preview deployments
- **Production branch** → Set in Vercel project settings

---

## Troubleshooting

### Issue: Build fails with "Cannot find module"

**Solution**: Make sure `vercel.json` has correct build commands for monorepo:
```json
{
  "buildCommand": "cd ../.. && pnpm build --filter=@apiforge/dashboard-web",
  "installCommand": "cd ../.. && pnpm install"
}
```

### Issue: CORS errors

**Solution**: Update `FRONTEND_URL` in backend `.env` to match your Vercel URL.

### Issue: Environment variable not working

**Solution**: 
1. Check it's prefixed with `NEXT_PUBLIC_`
2. Redeploy after adding environment variables
3. Clear browser cache

---

## URLs After Deployment

- **Frontend**: `https://your-vercel-url.vercel.app` (or custom domain)
- **Backend API**: `https://ola.apidev.cloud/apiforgeapi/api`
- **Database**: Neon PostgreSQL (no change)

---

## Monitoring

- **Vercel Dashboard**: View deployments, logs, analytics
- **Backend Logs**: `pm2 logs apiforge-api` on Hostinger
- **Database**: Neon dashboard

---

## Future Updates

To deploy updates:

1. Make changes locally
2. Commit and push to `collections` branch
3. Vercel automatically deploys
4. If backend changes, SSH to Hostinger and run:
   ```bash
   cd ~/ApiForge
   git pull
   pnpm --filter @apiforge/api-server build
   pm2 restart apiforge-api
   ```
