# GitHub Setup & Push Instructions

## 1. Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `smart-parking-system` (or your preference)
3. Description: `Smart Campus Parking Management System - University Parking Solution`
4. Choose: **Public** (for portfolio) or **Private** (for production)
5. **Do NOT** initialize with README, .gitignore, or license (we have our own)
6. Click **Create repository**

## 2. Configure Git Locally

Run these commands in your project root directory:

```bash
# Initialize git (if not already initialized)
git init

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/smart-parking-system.git

# Set default branch name
git branch -M main
```

Replace `YOUR_USERNAME` with your GitHub username.

## 3. Configure Git User (if needed)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@gmail.com"
```

## 4. Verify Files Before Commit

**✅ These WILL be committed** (safe to push):
- Backend code: `backend/models/`, `backend/routes/`, `backend/middleware/`, `backend/server.js`
- Frontend code: `frontend/src/`, `frontend/public/`
- Documentation: `docs/`, all `.md` files
- Config templates: `.env.example`, `.gitignore`, `package.json`, `.prettierrc`, `.eslintrc`
- Configuration: `vercel.json`, `.prettierrc`, etc.

**❌ These WON'T be committed** (protected by comprehensive .gitignore):
```
Secrets & Environment:
- .env, .env.local, .env.production, .env.*.local
- *.pem, *.key, *.crt, secrets.json

Dependencies:
- node_modules/, package-lock.json, yarn.lock, pnpm-lock.yaml

IDE & Editor:
- .vscode/, .idea/, *.swp, *.swo, ~*

Build & Cache:
- build/, dist/, .next/, .vercel/, coverage/
- .cache/, .eslintcache, .turbo/

System Files:
- .DS_Store, Thumbs.db, Desktop.ini, ._* files

Logs & Temp:
- logs/, *.log, tmp/, temp/

Database & Containers:
- *.db, *.sqlite, .mongodb/, docker-compose.override.yml
```

**Comprehensive Protection**: The updated `.gitignore` now covers 100+ irrelevant files and patterns. Only source code and safe documentation will be pushed.

## 5. Add and Commit Files

```bash
# Check what will be committed
git status

# Add all files (respects .gitignore)
git add .

# Verify additions (should show many files, but NO .env or node_modules)
git status

# Create initial commit
git commit -m "Initial commit: Smart Parking System - Backend API complete, documentation, security hardened"
```

**Expected commit message should include**:
- Backend API with 24+ endpoints ✅
- MongoDB models and schemas ✅
- JWT authentication & RBAC ✅
- Security: Helmet, CORS, rate limiting ✅
- Automated billing system ✅
- Complete documentation ✅
- No sensitive credentials ✅

## 6. Push to GitHub

```bash
# Push to GitHub
git push -u origin main

# Verify (should see success message)
git log --oneline
```

## 7. Verify on GitHub

- Go to your repository: `https://github.com/YOUR_USERNAME/smart-parking-system`
- Verify all files present (except `.env`, `node_modules/`)
- Check commit message appears
- .gitignore should be visible

## 8. Add SSH Key (Optional - for future easier commits)

If you want to avoid entering password on every push:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your.email@gmail.com"

# Copy the key
cat ~/.ssh/id_ed25519.pub
```

Add this key to GitHub: Settings → SSH and GPG keys → New SSH key

## Quick Reference Commands

```bash
# Check status
git status

# View what will be pushed
git log --oneline -5

# Make changes and update
git add .
git commit -m "Your message here"
git push

# View remote
git remote -v
```

## Troubleshooting

**"fatal: not a git repository"**
```bash
git init
```

**"Everything up-to-date"**
- Run `git status` to verify changes exist
- If nothing changed, make edits and commit

**Authentication error**
```bash
# Use personal access token instead of password
# Generate at: github.com/settings/tokens
# When prompted for password, paste the token
```

**Want to see what .gitignore is protecting?**
```bash
# View files git is ignoring
git status --ignored
```

## Production Branch Setup (Optional)

```bash
# Create and switch to production branch
git checkout -b production

# Push to production
git push -u origin production
```

---

✅ **After successful push**, your repository is ready for deployment!

Next: Follow `DEPLOYMENT_GUIDE.md` for backend (Heroku/Railway) and frontend (Vercel) deployment.
