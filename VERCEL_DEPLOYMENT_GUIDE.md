# Vercel Deployment Guide

Complete step-by-step guide for deploying Smart Parking System frontend on Vercel.

## Prerequisites

- ✅ GitHub repository created and pushed
- ✅ Vercel account created (free at vercel.com)
- ✅ Backend deployed (Heroku/Railway/AWS) with live URL
- ✅ MongoDB Atlas database with URI

## Part 1: Backend Deployment (Optional - if not already deployed)

**Recommended**: Use Heroku or Railway first (simpler than Vercel for Node.js)

See `DEPLOYMENT_GUIDE.md` for detailed backend deployment instructions.

**Note your backend URL after deployment** (e.g., `https://your-smart-parking-api.herokuapp.com`)

## Part 2: Frontend Deployment on Vercel

### Step 1: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub (recommended) or create account
3. Click **New Project**
4. Select your GitHub account
5. Find and select `smart-parking-system` repository
6. Click **Import**

### Step 2: Configure Project Settings

1. **Framework Preset**: Select **Create React App**
2. **Root Directory**: Set to `frontend`
3. Click **Environment Variables**

### Step 3: Add Environment Variables

Add these two environment variables:

**Variable 1:**
- Key: `REACT_APP_API_URL`
- Value: `https://your-smart-parking-api.herokuapp.com/api`
  (Replace with your actual backend URL)

Click **Add**

**Variable 2:**
- Key: `REACT_APP_BACKEND_URL`
- Value: `https://your-smart-parking-api.herokuapp.com`

Click **Add**

### Step 4: Deploy

Click **Deploy**

Vercel will:
- Run `npm install` in frontend directory
- Run `npm run build` (create production build)
- Deploy to edge network
- Assign a URL (e.g., `smart-parking-system.vercel.app`)

**Wait 2-5 minutes for deployment to complete**

### Step 5: Verify Deployment

Once deployment finishes:

1. Click the **Visit** button → Your site live! ✅
2. Test the application:
   - Open the website
   - Navigate to login page
   - Verify no console errors (F12 → Console tab)
   - Try a login action

## Part 3: Configure Custom Domain (Optional)

1. In Vercel project settings → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `parking.yourdomain.com`)
4. Follow DNS configuration instructions

## Part 4: Setup CI/CD (Automatic Deployments)

Vercel automatically redeploys when you push to GitHub!

**Automatic deployments trigger on**:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

To test:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Check Vercel → Deployments tab to see it auto-building.

## Part 5: Database Connection (if backend on Vercel)

If you deploy backend to Vercel, update Vercel settings:

1. In Vercel project (backend) → Settings → Environment Variables
2. Add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`

## Part 6: Update CORS (Backend)

For frontend to communicate with backend, update backend CORS:

**In backend/server.js** (around line with cors setup):
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-domain.vercel.app',
  credentials: true
}));
```

Then add `FRONTEND_URL` environment variable in Vercel backend settings.

## Troubleshooting

### Build Fails: "Module not found"

```bash
# In frontend directory, reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

Then commit and push - Vercel will retry.

### Frontend shows "Cannot reach API"

**Check**:
1. `REACT_APP_API_URL` environment variable is set correctly
2. Backend is actually running and accessible
3. Backend CORS allows frontend origin

**Test**:
```bash
# Test backend availability from browser console
fetch('https://your-backend-url/api/health')
  .then(r => r.json())
  .then(console.log)
```

### Changes not deploying

1. Make sure you pushed to `main` branch
2. Check Vercel Deployments tab for build logs
3. Check GitHub shows your commits

## Performance Optimization

### Enable Static Generation

In Vercel settings → Framework settings:
- **Node.js Version**: 18 (recommended)
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### Cache Assets

Vercel automatically caches:
- JavaScript bundles
- CSS files
- Images
- Fonts

No additional configuration needed! ✅

## Monitoring & Analytics

Vercel provides built-in monitoring:

1. **Deployments**: Click a deployment to see build logs and duration
2. **Functions**: Monitor backend performance if using Vercel
3. **Analytics**: View page load times, traffic

## Next Steps

✅ Frontend deployed to Vercel
✅ Automatic deployments on GitHub push
✅ Custom domain ready (optional)
✅ Performance optimized

### Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Test login functionality
- [ ] Test booking workflow
- [ ] Monitor error logs (first 24 hours)
- [ ] Setup monitoring alerts (optional)

## Rollback Previous Deployment

If new deployment has issues:

1. Go to Vercel → Deployments
2. Find the previous working deployment
3. Click the three dots → **Promote to Production**

Previous version restored in seconds! ⚡

## Support

For issues, check:
- [Vercel Docs](https://vercel.com/docs)
- [Vercel Community Forum](https://vercel.com/community)
- Project logs: Vercel → Deployments → Click deployment → Logs

---

**Estimated time**: 10-15 minutes
**Cost**: FREE tier available ($0/month)
**Uptime**: 99.95% SLA

✅ Your Smart Parking System is now live on the internet!
