# 🚀 SmartPark — Installation Guide

## Prerequisites — Install These First

### 1. Node.js (v18 or higher)
- Download: https://nodejs.org/en/download
- Choose **LTS version** (recommended)
- After install, verify in terminal:
  ```
  node --version    → should show v18.x.x or higher
  npm --version     → should show 9.x.x or higher
  ```

### 2. MongoDB (Local Installation)
- Download: https://www.mongodb.com/try/download/community
- Choose your OS → Version 7.0 → Package: MSI (Windows) or DMG (Mac)
- Install with default settings
- MongoDB runs as a background service automatically after install
- Verify: open terminal and type `mongod --version`

> **Alternative (No install needed):** Use MongoDB Atlas (free cloud):
> 1. Sign up at https://cloud.mongodb.com
> 2. Create a free cluster
> 3. Click "Connect" → "Drivers" → copy the connection string
> 4. Paste it into `backend/.env` as `MONGO_URI=<your-connection-string>`

### 3. VS Code
- Download: https://code.visualstudio.com/download
- Install recommended extensions (VS Code will prompt you automatically
  when you open the workspace file)

---

## Project Setup — Step by Step

### Step 1: Open the project in VS Code
1. Extract the ZIP file to a folder (e.g., `C:\Projects\smart-parking`)
2. Open VS Code
3. File → Open Workspace from File → select `smartpark.code-workspace`
4. VS Code will open both Backend and Frontend folders side by side

### Step 2: Setup the Backend

Open a **new terminal** in VS Code (`Ctrl + `` ` ```) and run:

```bash
cd backend
npm install
```

This installs: Express, Mongoose, JWT, bcryptjs, Helmet, CORS, node-cron, etc.

**Verify `.env` file exists** in the `backend/` folder. It should contain:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/smart_parking
JWT_SECRET=smartpark_super_secret_key_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Step 3: Seed the Database

In the same terminal (inside `backend/`):
```bash
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
🧹 Cleared existing data
👥 Created 4 users
🅿️  Created 40 parking slots
✅ Database seeded successfully!

🔑 Login Credentials:
   Admin:  admin@campus.edu  / admin123
   Staff:  staff@campus.edu  / staff123
   User:   rahul@campus.edu  / user123
```

### Step 4: Start the Backend Server

```bash
npm run dev
```

Expected output:
```
✅ MongoDB Connected
🚀 Server running on http://localhost:5000
📋 Environment: development
```

Keep this terminal running. Open a new terminal for the frontend.

### Step 5: Setup & Start the Frontend

In a **new terminal** (`Ctrl + Shift + `` ` ```) run:

```bash
cd frontend
npm install
npm start
```

`npm install` takes 2–3 minutes (installs React, axios, react-router-dom, etc.)

After `npm start`, your browser will automatically open:
```
http://localhost:3000
```

---

## Running Both Servers Simultaneously

You need **2 terminals open at the same time**:

| Terminal | Directory | Command | Port |
|----------|-----------|---------|------|
| Terminal 1 | `backend/` | `npm run dev` | :5000 |
| Terminal 2 | `frontend/` | `npm start` | :3000 |

In VS Code: click the `+` button in the terminal panel to open a second terminal.

---

## Login Credentials (After Seeding)

| Role | Email | Password | What You Can Do |
|------|-------|----------|-----------------|
| Admin | admin@campus.edu | admin123 | Full access: dashboard, pricing, users, revenue |
| Staff | staff@campus.edu | staff123 | Check vehicles in/out, search by plate |
| User | rahul@campus.edu | user123 | View slots, book, cancel |

---

## Testing the API (Optional)

Open `api-tests.http` in VS Code.
Install the **REST Client** extension (ID: `humao.rest-client`).
1. Send the Login request first
2. Copy the token from the response
3. Replace `PASTE_YOUR_TOKEN_HERE` with your token
4. Test any endpoint by clicking "Send Request"

---

## Troubleshooting

### ❌ `MongoDB connection failed`
- Make sure MongoDB is running: search "Services" in Windows → find "MongoDB" → Start
- Or use MongoDB Atlas and update `MONGO_URI` in `.env`

### ❌ `Port 5000 already in use`
- Change `PORT=5001` in `backend/.env`
- Update `"proxy": "http://localhost:5001"` in `frontend/package.json`

### ❌ `Module not found`
- Run `npm install` again inside the affected folder (`backend/` or `frontend/`)

### ❌ Frontend shows blank page / API errors
- Make sure **both** terminals are running (backend on :5000, frontend on :3000)
- Check the `"proxy"` field in `frontend/package.json` points to your backend port

### ❌ `npm run seed` — duplicate key error
- The database already has data. It auto-clears before seeding, so just run it again.

---

## Project Structure

```
smart-parking/
├── backend/
│   ├── config/
│   │   └── seed.js              ← Database seeder
│   ├── middleware/
│   │   ├── auth.js              ← JWT verify + RBAC
│   │   └── billing.js           ← Auto-billing logic
│   ├── models/
│   │   ├── User.js              ← User schema (roles)
│   │   ├── ParkingSlot.js       ← Slot schema
│   │   └── Booking.js           ← Booking + billing
│   ├── routes/
│   │   ├── auth.js              ← /api/auth/*
│   │   ├── slots.js             ← /api/slots/*
│   │   ├── bookings.js          ← /api/bookings/*
│   │   ├── staff.js             ← /api/staff/*
│   │   └── admin.js             ← /api/admin/*
│   ├── server.js                ← App entry point
│   ├── .env                     ← Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js               ← Main React app (UI)
│   │   ├── api.js               ← Axios API service layer
│   │   └── index.js             ← React entry point
│   └── package.json
├── api-tests.http               ← VS Code REST Client tests
├── smartpark.code-workspace     ← Open this in VS Code
├── README.md                    ← Full API docs
└── INSTALL.md                   ← This file
```

---

## Tech Stack Summary

| Layer | Package | Version | Purpose |
|-------|---------|---------|---------|
| Runtime | Node.js | v18+ | Backend runtime |
| Framework | Express | 4.18 | HTTP server + routing |
| Database | MongoDB | 7.0 | Data persistence |
| ODM | Mongoose | 8.0 | Schema + queries |
| Auth | jsonwebtoken | 9.0 | JWT tokens |
| Passwords | bcryptjs | 2.4 | Password hashing |
| Security | helmet | 7.1 | HTTP headers |
| CORS | cors | 2.8 | Cross-origin requests |
| Scheduler | node-cron | 3.0 | Auto-billing cron job |
| Validation | express-validator | 7.0 | Input validation |
| UI | React | 18.2 | Frontend framework |
| HTTP Client | axios | 1.6 | API calls from React |
| Routing | react-router-dom | 6.20 | Frontend page routing |
