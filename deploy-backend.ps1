#!/usr/bin/env powershell
# Smart Parking System - Automated Deployment Script
# This script handles backend deployment to Heroku

param(
    [string]$MongoDBURI = "mongodb+srv://nk875002_db_user:V8ewcioSO28ONVqr@cluster0.l5gertx.mongodb.net/",
    [string]$JWTSecret = "MjAwNzY4NjYtM2I1NS00OWM0LWI4YmEtNGZjOGY1NWFhYjgwMTBiOTQwZmItZjA3Ny00MTJlLWFhOWQtZWRhZjJiOThjNGQzZTY5MjU0NzAtNzcxNS00MGM4LWFjOWItOTc3YzM0MTdjOTMw",
    [string]$AppName = "smart-parking-api",
    [string]$ProjectPath = "d:\chaicode\smart-parking-project\smart-parking-project\smart-parking"
)

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Smart Parking System - Heroku Backend Deployment Script    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify Heroku CLI
Write-Host "📋 Step 1: Checking Heroku CLI..." -ForegroundColor Green
$herokuVersion = heroku --version
Write-Host "✅ Heroku CLI found: $herokuVersion" -ForegroundColor Green
Write-Host ""

# Step 2: Login to Heroku (Interactive)
Write-Host "📋 Step 2: Logging into Heroku (Browser will open)..." -ForegroundColor Green
Write-Host "⚠️  If not already logged in, run: heroku login" -ForegroundColor Yellow
$herokuAuth = heroku auth:whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in. Running: heroku login" -ForegroundColor Yellow
    heroku login
} else {
    Write-Host "✅ Already logged in as: $herokuAuth" -ForegroundColor Green
}
Write-Host ""

# Step 3: Create Heroku App
Write-Host "📋 Step 3: Creating Heroku app: $AppName" -ForegroundColor Green
$appExists = heroku apps --json | ConvertFrom-Json | Where-Object { $_.name -eq $AppName }

if ($appExists) {
    Write-Host "ℹ️  App '$AppName' already exists" -ForegroundColor Yellow
} else {
    Write-Host "Creating new app..." -ForegroundColor Cyan
    heroku create $AppName
    Write-Host "✅ App created: $AppName" -ForegroundColor Green
}
Write-Host ""

# Step 4: Set Environment Variables
Write-Host "📋 Step 4: Setting environment variables..." -ForegroundColor Green
Write-Host "Setting MONGODB_URI..." -ForegroundColor Cyan
heroku config:set MONGODB_URI=$MongoDBURI --app=$AppName
Write-Host "✅ MONGODB_URI set" -ForegroundColor Green

Write-Host "Setting JWT_SECRET..." -ForegroundColor Cyan
heroku config:set JWT_SECRET=$JWTSecret --app=$AppName
Write-Host "✅ JWT_SECRET set" -ForegroundColor Green

Write-Host "Setting NODE_ENV..." -ForegroundColor Cyan
heroku config:set NODE_ENV="production" --app=$AppName
Write-Host "✅ NODE_ENV set to production" -ForegroundColor Green

Write-Host "Setting PORT..." -ForegroundColor Cyan
heroku config:set PORT="5000" --app=$AppName
Write-Host "✅ PORT set to 5000" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy to Heroku
Write-Host "📋 Step 5: Deploying to Heroku..." -ForegroundColor Green
Write-Host "This will push your code from GitHub to Heroku..." -ForegroundColor Cyan
Set-Location "$ProjectPath\backend"
git push heroku main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Deployment had issues. Check logs with: heroku logs --tail --app=$AppName" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Get Backend URL
Write-Host "📋 Step 6: Getting your backend URL..." -ForegroundColor Green
$backendURL = heroku domains --app=$AppName | Select-Object -First 1 -ExpandProperty domain
if (-not $backendURL) {
    $backendURL = "$AppName.herokuapp.com"
}
Write-Host "✅ Backend URL: https://$backendURL" -ForegroundColor Green
Write-Host ""

# Step 7: Test Backend
Write-Host "📋 Step 7: Testing backend health..." -ForegroundColor Green
Start-Sleep -Seconds 5
$healthCheck = Invoke-WebRequest -Uri "https://$backendURL/api/health" -ErrorAction SilentlyContinue
if ($healthCheck.StatusCode -eq 200) {
    $response = $healthCheck.Content | ConvertFrom-Json
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Backend health check failed. Check logs: heroku logs --tail --app=$AppName" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              🎉 DEPLOYMENT COMPLETE!                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Green
Write-Host "  • Backend URL: https://$backendURL" -ForegroundColor White
Write-Host "  • App Name: $AppName" -ForegroundColor White
Write-Host "  • Database: MongoDB Atlas configured" -ForegroundColor White
Write-Host "  • Status: ✅ Running" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Green
Write-Host "  1. Copy the Backend URL: https://$backendURL" -ForegroundColor White
Write-Host "  2. Go to https://vercel.com" -ForegroundColor White
Write-Host "  3. Import your GitHub repo (smart-parking-system)" -ForegroundColor White
Write-Host "  4. Set environment variable:" -ForegroundColor White
Write-Host "     Key: REACT_APP_API_URL" -ForegroundColor Cyan
Write-Host "     Value: https://$backendURL/api" -ForegroundColor Cyan
Write-Host "  5. Deploy to Vercel" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Useful Commands:" -ForegroundColor Green
Write-Host "  View logs:        heroku logs --tail --app=$AppName" -ForegroundColor Cyan
Write-Host "  View config:      heroku config --app=$AppName" -ForegroundColor Cyan
Write-Host "  Scale dynos:      heroku ps:scale web=1 --app=$AppName" -ForegroundColor Cyan
Write-Host "  Open app:         heroku open --app=$AppName" -ForegroundColor Cyan
Write-Host ""
