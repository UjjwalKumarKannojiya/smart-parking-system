# COPY-PASTE COMMANDS - Production Deployment

Use these commands in order. Replace `YOUR_USERNAME` with your actual GitHub username.

## Phase 1: Local Setup (If not done already)

```powershell
# Navigate to project
cd d:\chaicode\smart-parking-project\smart-parking-project\smart-parking

# Backend setup
cd backend
npm install

# Copy .env template
cp .env.example .env

# Edit .env in VS Code - add real MongoDB URI and JWT secret
code .env
```

**Stop here and edit `.env` file with:**
- MONGODB_URI = your MongoDB Atlas connection string
- JWT_SECRET = generate random secret (e.g., `openssl rand -base64 32`)

```powershell
# Frontend setup
cd ../frontend
npm install
cp .env.example .env.local

# Edit frontend environment
code .env.local
```

**Add to `.env.local`:**
- REACT_APP_API_URL = http://localhost:5000/api
- REACT_APP_BACKEND_URL = http://localhost:5000

---

## Phase 2: Local Testing (Verify everything works)

```powershell
# Test backend
cd ../backend
npm run dev

# In a NEW PowerShell window, test frontend:
cd frontend
npm start

# Browser will open - Test login with:
# Email: admin@smartpark.com
# Password: Admin@123
```

**Stop here - verify login works and dashboard displays**

Once verified, press `Ctrl+C` in both terminals to stop.

---

## Phase 3: Push to GitHub

```powershell
# Go to project root
cd ..

# Initialize git
git init

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/smart-parking-system.git

# Set branch name
git branch -M main

# Verify .env is being ignored (comprehensive .gitignore protection)
git status
# Should NOT show: backend/.env, frontend/.env, node_modules, build, dist, logs, .vscode, .idea, etc.
# Should only show source code and documentation files

# Add all files (respects comprehensive .gitignore)
git add .

# Commit
git commit -m "Initial commit: Smart Parking System - Production ready, all endpoints tested, zero credential exposure"

# Push
git push -u origin main

# Verify on github.com/YOUR_USERNAME/smart-parking-system
# Should see: Only source code (.js, .jsx, .json, .md files)
# Should NOT see: node_modules, .env, build, logs, .vscode, .DS_Store, etc.
```

**Stop - verify repository visible on GitHub**
- ✅ Source code present
- ✅ Documentation files present
- ✅ No node_modules folder
- ✅ No .env file
- ✅ No build artifacts
- ✅ No system files

---

## Phase 4: Deploy Backend (Heroku)

**Option A: Using Heroku CLI (Recommended)**

```powershell
# Install Heroku CLI first: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Navigate to backend
cd backend

# Create Heroku app
heroku create smart-parking-api

# Set environment variables
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/smart_parking"
heroku config:set JWT_SECRET="your_random_jwt_secret_here"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# View logs
heroku logs --tail

# Open app
heroku open

# Get your backend URL (shown in browser or use):
heroku info
```

**Copy the URL** - looks like: `https://smart-parking-api.herokuapp.com`

---

## Phase 5: Deploy Frontend (Vercel)

**Steps (in browser):**

1. Go to https://vercel.com/login
2. Sign in with GitHub (or create account)
3. Click **New Project**
4. Select GitHub account and **smart-parking-system** repo
5. Set **Root Directory** to `frontend`
6. Click **Environment Variables**
7. Add these variables:
   - Key: `REACT_APP_API_URL`
   - Value: `https://smart-parking-api.herokuapp.com/api`
   - (Replace with your actual backend URL)
8. Click **Deploy**
9. Wait 2-5 minutes for build to complete
10. Click **Visit** when ready

**Copy your Vercel URL** - looks like: `https://smart-parking-system.vercel.app`

---

## Phase 6: Test Production

```powershell
# Open your Vercel frontend URL in browser
# Example: https://smart-parking-system.vercel.app

# Test login:
# Email: admin@smartpark.com
# Password: Admin@123

# Verify:
# - Dashboard loads
# - Can navigate pages
# - API calls working (check F12 Console)
# - No errors
```

---

## Phase 7: Setup Custom Domain (Optional)

```powershell
# In Vercel dashboard → Your Project → Settings → Domains
# Add your custom domain (e.g., parking.yourcompany.com)
# Follow DNS instructions
```

---

## Rollback (If something goes wrong)

**Heroku - previous version:**
```powershell
# View releases
heroku releases

# Rollback to previous
heroku releases:rollback v2
```

**Vercel - previous deployment:**
- Vercel Dashboard → Deployments → Click previous → Promote to Production

---

## Cleanup After Deployment

```powershell
# Delete local .env files (already on Vercel/Heroku)
rm backend\.env
rm frontend\.env.local

# Verify they're gitignored
git status
# Should show clean

# Keep .env.example files (these are safe)
git status backend\.env.example  # Should show nothing (already committed)
```

---

## Quick Status Check

```powershell
# Check backend deployed
curl https://smart-parking-api.herokuapp.com/api/health

# Should return:
# {"success":true,"message":"API is running","timestamp":"2026-05-22T..."}

# Check frontend deployed
# Open in browser: https://smart-parking-system.vercel.app
# Should load without errors
```

---

## Environment Variables Needed

**Backend (.env in Heroku):**
```
MONGODB_URI=mongodb+srv://username:password@cluster...
JWT_SECRET=your_secret_key_here
NODE_ENV=production
PORT=5000
```

**Frontend (.env in Vercel):**
```
REACT_APP_API_URL=https://smart-parking-api.herokuapp.com/api
REACT_APP_BACKEND_URL=https://smart-parking-api.herokuapp.com
```

---

## Troubleshooting

**"fatal: not a git repository"**
```powershell
git init
```

**"Heroku app already exists"**
```powershell
# Use different name
heroku create smart-parking-api-v2
```

**"Build failed on Vercel"**
- Check build logs in Vercel dashboard
- Likely missing dependency: `cd frontend && npm install`
- Push again: `git push`

**"Can't reach backend from frontend"**
- Verify REACT_APP_API_URL is correct
- Check backend is running: curl backend-url/api/health
- Verify backend CORS is set to frontend URL

---

**You're done! 🎉**

Your Smart Parking System is now:
- ✅ On GitHub (backed up)
- ✅ Backend deployed to Heroku
- ✅ Frontend deployed to Vercel
- ✅ Available globally on the internet
- ✅ Automatically updates on GitHub push

**Next time you make changes:**
```powershell
git add .
git commit -m "Your changes here"
git push origin main
# Automatic deployments trigger! ⚡
```
