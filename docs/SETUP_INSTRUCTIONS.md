# MongoDB Setup Complete - Quick Reference Guide

## Connection Details

**MongoDB Atlas URI:**

Use the credentials from your `.env` file (MONGO_URI). See `.env.example` for setup.

**Database Name:** `smart_parking`

**Collections:**
- `users` - All user accounts (admin, staff, regular users)
- `parkingslots` - Parking slot inventory
- `bookings` - Parking booking records

---

## Default Test Users (Created via npm run seed)

### 1. ADMIN User
- **Email:** `admin@campus.edu`
- **Password:** `Admin@12345`
- **Permissions:** Full system access, user management, revenue analytics

### 2. STAFF User
- **Email:** `staff@campus.edu`
- **Password:** `Staff@12345`
- **Permissions:** Check-in/out operations, vehicle search, billing

### 3. Regular Users
| Name | Email | Password | Vehicle |
|------|-------|----------|---------|
| Rahul Sharma | rahul@campus.edu | User@123456 | UP32AB1234 |
| Priya Singh | priya@campus.edu | User@123456 | UP32CD5678 |
| Amit Kumar | amit@campus.edu | User@123456 | DL01EF9012 |

---

## How to Add More Users

### Option 1: Via Application UI (Recommended)
1. Go to `http://localhost:3000`
2. Click "Register" tab
3. Fill in user details
4. Click "Register"

### Option 2: Via Backend API
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "New User Name",
  "email": "newuser@campus.edu",
  "password": "SecurePass@123",
  "phone": "9876543220",
  "vehicleNumber": "HR26AB1234"
}
```

### Option 3: Via Node.js Script
```bash
cd backend
node config/addUser.js
# Then follow interactive prompts
```

### Option 4: Via MongoDB Compass
1. Use credentials from `.env` (MONGO_URI)
2. Go to: `smart_parking` > `users` collection
3. Click "+ INSERT DOCUMENT"
4. Add user data as JSON

### Option 5: Via mongosh CLI
```bash
mongosh "<your_mongodb_connection_string>"

use smart_parking

db.users.insertOne({
  name: "New User",
  email: "newuser@campus.edu",
  phone: "9876543220",
  vehicleNumber: "HR26AB1234",
  role: "user",
  isActive: true,
  totalSpent: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## User Roles & Permissions

### ADMIN
✅ View all users  
✅ Create/Update/Delete users  
✅ View all bookings  
✅ Manage parking slots  
✅ View revenue analytics  
✅ Access dashboard metrics  

**API Endpoints:**
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/revenue` - Revenue analytics

### STAFF
✅ View active bookings  
✅ Check-in vehicles  
✅ Check-out vehicles  
✅ Calculate billing  
✅ Search vehicles  

**API Endpoints:**
- `GET /api/staff/active-bookings` - List active bookings
- `POST /api/staff/checkin/:id` - Check-in vehicle
- `POST /api/staff/checkout/:id` - Check-out vehicle
- `GET /api/staff/search?vehicleNumber=...` - Search vehicle

### USER (Regular User)
✅ View own profile  
✅ Browse available slots  
✅ Create bookings  
✅ View own bookings  
✅ Cancel bookings  

**API Endpoints:**
- `GET /api/auth/me` - Get profile
- `PUT /api/auth/profile` - Update profile
- `GET /api/slots` - Browse slots
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - View own bookings

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,                    // Full name
  email: String,                   // Unique, lowercase
  password: String,                // Bcrypted
  phone: String,                   // Phone number
  vehicleNumber: String,           // Optional, for users
  role: String,                    // "admin", "staff", or "user"
  isActive: Boolean,               // Account status
  totalSpent: Number,              // Total parking charges
  createdAt: Date,
  updatedAt: Date
}
```

### Parking Slots Collection
```javascript
{
  _id: ObjectId,
  slotNumber: String,              // e.g., "A01"
  zone: String,                    // A, B, C, D
  floor: Number,                   // 1 or 2
  type: String,                    // "standard", "compact", "handicapped", "ev_charging"
  pricePerHour: Number,            // Hourly rate
  status: String,                  // "available", "booked", "occupied", "maintenance"
  createdAt: Date,
  updatedAt: Date
}
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // Reference to user
  slotId: ObjectId,                // Reference to slot
  vehicleNumber: String,
  checkInTime: Date,
  checkOutTime: Date,              // Optional
  estimatedDuration: Number,       // Hours
  status: String,                  // "pending", "active", "checked_in", "completed", "cancelled"
  totalAmount: Number,             // Charges
  paymentMethod: String,           // "cash", "card", "upi", "wallet"
  createdAt: Date,
  updatedAt: Date
}
```

---

## Parking Slots Default Setup

**Total Slots:** 60 (4 zones × 15 slots)

**Zones:** A, B, C, D
- Zones A & B: Floor 1
- Zones C & D: Floor 2

**Pricing per Zone (per hour):**
| Slot Range | Type | Price |
|-----------|------|-------|
| Slot 1 | Handicapped | ₹10 |
| Slot 2 | EV Charging | ₹30 |
| Slots 3-6 | Compact | ₹15 |
| Slots 7-15 | Standard | ₹20 |

---

## Useful MongoDB Queries

### Count users by role
```javascript
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])
```

### Find all available slots
```javascript
db.parkingslots.find({ status: "available" })
```

### Count slots by zone
```javascript
db.parkingslots.aggregate([
  { $group: { _id: "$zone", count: { $sum: 1 } } }
])
```

### Get active bookings
```javascript
db.bookings.find({ status: { $in: ["pending", "active", "checked_in"] } })
```

### Get user spending statistics
```javascript
db.users.aggregate([
  { $group: { _id: "$role", totalSpent: { $sum: "$totalSpent" } } }
])
```

### Find bookings for specific user
```javascript
db.bookings.find({ userId: ObjectId("user_id_here") })
```

---

## Files Provided

### Documentation Files
1. **MONGODB_USER_GUIDE.md** - Comprehensive user creation guide
2. **MONGODB_QUERIES.js** - Direct MongoDB queries and examples
3. **MONGODB_DATA_STRUCTURE.js** - Complete data structure reference with API examples
4. **SETUP_INSTRUCTIONS.md** - This file

### Helper Scripts
1. **backend/config/addUser.js** - Interactive user management script
   ```bash
   cd backend
   node config/addUser.js
   ```

---

## Verification Steps

✅ **MongoDB Connection:** Successfully connected to Atlas
✅ **Database Created:** `smart_parking` database ready
✅ **Collections Created:** users, parkingslots, bookings
✅ **Test Data Seeded:**
  - 5 users (1 admin, 1 staff, 3 regular users)
  - 60 parking slots (4 zones, 15 per zone)
✅ **Backend API:** Running on `http://localhost:5000`
✅ **Frontend UI:** Running on `http://localhost:3000`

---

## Quick Start Checklist

- [x] MongoDB Atlas connection configured
- [x] Environment file (.env) updated with Atlas URI
- [x] Database seeded with test data
- [x] All 3 user roles created
- [x] Backend API running and connected
- [x] Frontend UI functional and connected
- [ ] Ready for production deployment

---

## Next Steps

1. **Test the application:**
   - Log in with provided credentials
   - Test all user roles (admin, staff, user)
   - Verify all workflows

2. **Add more users:**
   - Use any of the 5 methods above
   - Create users for testing

3. **Configure production:**
   - Update .env for production
   - Set up HTTPS
   - Configure CORS for production domain
   - Set JWT_SECRET to secure random value

4. **Deploy:**
   - Push to GitHub
   - Deploy backend to cloud (Heroku/AWS/Railway)
   - Deploy frontend to cloud (Vercel/Netlify)

---

## Support

For detailed information on:
- **User creation:** See `MONGODB_USER_GUIDE.md`
- **Database queries:** See `MONGODB_QUERIES.js`
- **Data structure:** See `MONGODB_DATA_STRUCTURE.js`
- **Interactive user management:** Run `node backend/config/addUser.js`

---

**Status:** ✅ MongoDB Atlas successfully connected and configured
**Database:** smart_parking (MongoDB Atlas)
**Collections:** 3 (users, parkingslots, bookings)
**Test Users:** 5 ready
**API Endpoints:** All functional
