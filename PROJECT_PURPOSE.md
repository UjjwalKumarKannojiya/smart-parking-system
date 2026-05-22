# 🅿️ Smart Campus Parking Management System

## Project Purpose

The **Smart Campus Parking Management System** is a comprehensive full-stack web application designed to revolutionize how universities and large institutions manage their parking infrastructure. This system provides automated parking slot management, real-time booking capabilities, and revenue tracking through a Role-Based Access Control (RBAC) system.

### Core Objectives

1. **Optimize Parking Space Utilization** - Reduce time spent searching for parking and maximize slot occupancy
2. **Streamline Check-In/Check-Out Process** - Enable staff to efficiently manage vehicle entry and exit
3. **Automate Billing & Revenue Tracking** - Eliminate manual billing errors and track revenue in real-time
4. **Provide User Self-Service** - Allow users to book, view, and manage parking independently
5. **Enable Administrative Control** - Give administrators full visibility and control over system operations

---

## 🏗️ System Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Tailwind CSS | 18.2.0 |
| **Backend** | Node.js + Express.js | 18.0 LTS |
| **Database** | MongoDB + Mongoose | 8.0.3 |
| **Authentication** | JWT + bcryptjs | 9.0.2 |
| **Security** | Helmet, CORS, Rate Limiting | Latest |
| **Scheduling** | node-cron | 3.0.3 |

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  - User Dashboard       - Booking Management                │
│  - Admin Dashboard      - Parking Slot Viewer               │
│  - Authentication UI    - Responsive Design                 │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/REST API
┌────────────────▼────────────────────────────────────────────┐
│                  BACKEND (Express.js)                        │
│  - Authentication Middleware    - Billing Engine            │
│  - RBAC Authorization          - Cron Jobs                  │
│  - API Routes (Auth, Slots, Bookings, Admin, Staff)         │
│  - Input Validation & Security                              │
└────────────────┬────────────────────────────────────────────┘
                 │ Mongoose ODM
┌────────────────▼────────────────────────────────────────────┐
│                  DATABASE (MongoDB)                          │
│  - users (Admin, Staff, Users)                              │
│  - parkingslots (Physical slots with metadata)              │
│  - bookings (Reservation & billing history)                 │
│  - pricingpolicies (Dynamic pricing rules)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Permissions

### 1. **Admin** (System Administrator)
- **Access Level**: Full system control
- **Capabilities**:
  - User management (create, view, deactivate)
  - Pricing policy configuration
  - Revenue analytics & reporting
  - System configuration
  - Staff management

### 2. **Staff** (Parking Attendant)
- **Access Level**: Operations management
- **Capabilities**:
  - Vehicle check-in/check-out
  - Active booking view
  - Vehicle search by registration number
  - Manual billing adjustments
  - Booking status updates

### 3. **User** (Vehicle Owner)
- **Access Level**: Self-service
- **Capabilities**:
  - View available parking slots
  - Create parking bookings
  - View own booking history
  - Cancel bookings
  - View pricing information
  - Profile management

---

## 🔑 Key Features

### Parking Slot Management
- **Slot Types**: Standard, Compact, Handicapped, EV Charging
- **Zones**: A, B, C, D (multi-zone support)
- **Status Tracking**: Available, Booked, Occupied, Maintenance
- **Dynamic Pricing**: Per-type pricing with weekend multipliers

### Booking System
- **Real-time Availability**: Live slot availability checking
- **Booking Lifecycle**: Pending → Active → Checked In → Completed
- **Double-Booking Prevention**: Unique constraint prevents overbooking
- **Cancellation Support**: Users can cancel bookings (refund policies configurable)

### Automated Billing
- **Auto-Billing**: Cron job processes overdue bookings every 5 minutes
- **Flexible Pricing**: Hourly rates with configurable minimums
- **Payment Methods**: Cash, Card, UPI, Wallet
- **Billing History**: Complete transaction tracking

### Staff Operations
- **Check-In System**: Record actual arrival time and vehicle data
- **Check-Out & Billing**: Calculate charges based on duration
- **Vehicle Search**: Locate vehicles by registration number
- **Active Bookings Dashboard**: Real-time operations view

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: 7-day expiration with refresh mechanism
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Role-Based Access Control**: Three-tier permission system
- **Token Validation**: Every protected endpoint requires valid JWT

### API Security
- **Helmet.js**: Sets HTTP security headers
- **CORS**: Configurable cross-origin policy
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: express-validator on all inputs
- **NoSQL Injection Prevention**: Mongoose schema validation

### Data Protection
- **Password Never Stored**: Only bcrypt hashes stored
- **No Sensitive Data in Logs**: Automatic sanitization
- **Environment Variables**: Credentials isolated from code
- **Database Access Control**: MongoDB user permissions

---

## 📊 Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, lowercase),
  password: String (bcrypted),
  phone: String,
  vehicleNumber: String (uppercase),
  role: Enum['user', 'staff', 'admin'],
  isActive: Boolean (default: true),
  isVerified: Boolean (default: false),
  totalSpent: Number,
  timestamps: {createdAt, updatedAt}
}
```

### Parking Slot Schema
```javascript
{
  _id: ObjectId,
  slotNumber: String (unique, uppercase),
  zone: Enum['A', 'B', 'C', 'D'],
  type: Enum['standard', 'compact', 'handicapped', 'ev_charging'],
  status: Enum['available', 'booked', 'occupied', 'maintenance'],
  floor: Number (1 or 2),
  pricePerHour: Number,
  currentBooking: Reference to Booking,
  timestamps: {createdAt, updatedAt}
}
```

### Booking Schema
```javascript
{
  _id: ObjectId,
  user: Reference to User (required),
  slot: Reference to ParkingSlot (required),
  vehicleNumber: String (uppercase),
  status: Enum['pending', 'active', 'checked_in', 'completed', 'cancelled'],
  checkInTime: Date,
  checkOutTime: Date,
  expectedDuration: Number (minutes),
  totalAmount: Number,
  paymentMethod: Enum['cash', 'card', 'upi', 'wallet'],
  checkedInBy: Reference to User (staff),
  checkedOutBy: Reference to User (staff),
  timestamps: {createdAt, updatedAt}
}
```

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user profile
- `PUT /profile` - Update profile
- `POST /verify` - Verify email

### Parking Slots (`/api/slots`)
- `GET` - List all slots (filterable)
- `GET /available` - Get only available slots
- `GET /:id` - Get single slot details
- `POST` - Create new slot (admin only)
- `PUT /:id` - Update slot (admin only)
- `DELETE /:id` - Deactivate slot (admin only)

### Bookings (`/api/bookings`)
- `POST` - Create new booking
- `GET /my` - Get user's bookings
- `GET /active` - Get active booking
- `PUT /:id/cancel` - Cancel booking
- `GET` - List all bookings (admin/staff)

### Staff Operations (`/api/staff`)
- `GET /active-bookings` - Get active bookings for check-in/out
- `POST /checkin/:id` - Check in vehicle
- `POST /checkout/:id` - Check out and bill
- `GET /search` - Search vehicle by number

### Admin Functions (`/api/admin`)
- `GET /dashboard` - System analytics
- `GET /users` - List all users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `GET /pricing-policy` - Get pricing rules
- `PUT /pricing-policy` - Update pricing
- `GET /revenue` - Revenue analytics

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 16
- MongoDB (Atlas or local)
- npm or yarn
- Git

### Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd smart-parking-project/smart-parking
```

**2. Setup Backend**
```bash
cd backend
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your MongoDB credentials and JWT secret
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secure_random_key_min_32_chars
```

**3. Setup Frontend**
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env.local

# REACT_APP_API_URL=http://localhost:5000/api
```

**4. Seed Database**
```bash
cd ../backend
npm run seed
```

**5. Start Development Servers**

Backend (Terminal 1):
```bash
cd backend
npm run dev   # Runs on http://localhost:5000
```

Frontend (Terminal 2):
```bash
cd frontend
npm start     # Runs on http://localhost:3000
```

### Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@campus.edu | Admin@12345 |
| **Staff** | staff@campus.edu | Staff@12345 |
| **User** | rahul@campus.edu | User@123456 |

---

## 🔧 Production Deployment

### Environment Configuration

Before deploying, ensure proper production settings in `.env`:

```bash
NODE_ENV=production
JWT_SECRET=<strong-random-key-32-chars-min>
MONGO_URI=<production-mongodb-uri>
CLIENT_URL=<production-frontend-url>
```

### Backend Deployment Options

**Option 1: Traditional Server (Heroku, AWS EC2, Railway)**
```bash
npm install -g pm2
npm run build
pm2 start server.js --name "smart-parking"
```

**Option 2: Serverless (AWS Lambda, Google Cloud Functions)**
- Requires API transformation for serverless format
- Deploy as serverless function

**Option 3: Docker**
```bash
docker build -t smart-parking-backend .
docker run -p 5000:5000 --env-file .env smart-parking-backend
```

### Frontend Deployment (Vercel, Netlify)

**Vercel:**
```bash
npm i -g vercel
vercel
# Follow prompts, configure REACT_APP_API_URL
```

**Build Command:** `npm run build`  
**Start Command:** `npm start`

---

## 📝 Important Notes

### Security Best Practices
1. ✅ Never commit `.env` file to version control
2. ✅ Always use strong JWT_SECRET (min 32 characters)
3. ✅ Rotate MongoDB credentials regularly
4. ✅ Enable HTTPS in production
5. ✅ Set secure CORS origins for production domain

### Database Maintenance
1. **Backups**: Configure MongoDB automatic backups
2. **Indexes**: Verify indexes on frequently queried fields
3. **Monitoring**: Setup monitoring for connection pooling
4. **Cleanup**: Archive old bookings periodically

### Performance Tips
1. Enable database query caching
2. Implement frontend lazy loading
3. Use CDN for static assets
4. Monitor API response times
5. Configure horizontal scaling for high traffic

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED
Solution: Verify MONGO_URI in .env, check MongoDB service running
```

### JWT Token Errors
```
Error: Token is invalid or expired
Solution: Check JWT_SECRET matches between backend & frontend
```

### CORS Errors
```
Error: Access to XMLHttpRequest blocked
Solution: Verify CLIENT_URL in backend .env and CORS configuration
```

### Rate Limiting Issues
```
Error: Too many requests
Solution: Increase RATE_LIMIT_MAX_REQUESTS or implement request queue
```

---

## 📞 Support & Documentation

- **API Documentation**: See `docs/` folder
- **MongoDB Guide**: `docs/MONGODB_USER_GUIDE.md`
- **Database Queries**: `docs/MONGODB_QUERIES.js`
- **Setup Instructions**: `docs/SETUP_INSTRUCTIONS.md`

---

## 📄 License

This project is proprietary and confidential.

---

## ✅ Project Status

- ✅ Backend API - Complete
- ✅ Database Schema - Complete
- ✅ Authentication System - Complete
- ⏳ Frontend UI - In Development
- ⏳ Deployment Configuration - In Progress
- ⏳ Comprehensive Testing - Pending

---

**Last Updated**: May 2026  
**Version**: 1.0.0  
**Status**: Production Ready (Frontend in development)
