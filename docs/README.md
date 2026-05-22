# 🅿️ Smart Campus Parking & RBAC System

A full-stack web application for managing university parking with Role-Based Access Control.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Security | Helmet, CORS, Rate Limiting |

## 👥 Roles

| Role | Access |
|------|--------|
| **Admin** | Full system control, pricing, revenue, user management |
| **Staff** | Check-in/out vehicles, view all active bookings |
| **User** | Register, view slots, book/cancel parking |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Start Backend
```bash
npm run dev   # Development with hot reload
# OR
npm start     # Production
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```

## 🔑 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campus.edu | admin123 |
| Staff | staff@campus.edu | staff123 |
| User | rahul@campus.edu | user123 |

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login
GET    /api/auth/me             Get current user
PUT    /api/auth/profile        Update profile
```

### Parking Slots
```
GET    /api/slots               All slots (filterable)
GET    /api/slots/available     Available slots only
GET    /api/slots/:id           Single slot
POST   /api/slots               Create slot (Admin)
PUT    /api/slots/:id           Update slot (Admin)
DELETE /api/slots/:id           Deactivate slot (Admin)
```

### Bookings
```
POST   /api/bookings            Create booking (User)
GET    /api/bookings/my         My bookings (User)
GET    /api/bookings/active     My active booking (User)
PUT    /api/bookings/:id/cancel Cancel booking (User)
GET    /api/bookings            All bookings (Admin)
```

### Staff
```
GET    /api/staff/active-bookings    Active bookings (Staff/Admin)
POST   /api/staff/checkin/:id        Check in vehicle (Staff/Admin)
POST   /api/staff/checkout/:id       Check out & bill (Staff/Admin)
GET    /api/staff/search?vehicleNumber=XX   Search vehicle (Staff/Admin)
```

### Admin
```
GET    /api/admin/dashboard     Dashboard metrics
GET    /api/admin/users         All users
POST   /api/admin/users         Create staff user
PUT    /api/admin/users/:id     Update user role
PUT    /api/admin/slots/:id/price  Update pricing
GET    /api/admin/revenue       Revenue analytics
```

## 🔧 Business Rules

- **One active booking per user** — prevented by DB index + validation
- **Cancel only before check-in** — enforced in booking route
- **Minimum 1-hour billing** — `Math.max(1, Math.ceil(hours))`
- **Slot lifecycle**: `Available → Booked → Occupied → Available`
- **Auto-billing cron** runs every 5 minutes for active sessions

## 🗃️ Database Schema

### Users
- name, email, password (hashed), role, phone, vehicleNumber, isActive, totalSpent

### ParkingSlots
- slotNumber, zone (A-D), type, status, pricePerHour, floor, isActive, currentBooking

### Bookings
- user, slot, vehicleNumber, status, bookingTime, checkIn/OutTime, pricePerHour, totalAmount, isPaid, paymentMethod, checkedInBy/OutBy
