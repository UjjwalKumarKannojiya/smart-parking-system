
/**
 * MONGODB USER CREATION GUIDE - SmartPark Parking Management System
 * ================================================================
 * 
 * MongoDB Atlas Connection: Use your credentials from .env file
 * 
 * DATABASE STRUCTURE:
 * - Database Name: smart_parking
 * - Collections: users, parkingslots, bookings
 * 
 * NOTE: Never commit .env file with credentials. Use .env.example instead.
 */

// ==================== USER ROLES & STRUCTURE ====================

/**
 * USER SCHEMA:
 * {
 *   _id: ObjectId (auto-generated)
 *   name: String (required)
 *   email: String (required, unique, lowercase)
 *   password: String (required, bcrypted)
 *   phone: String (required)
 *   vehicleNumber: String (optional, only for users)
 *   role: String (enum: 'admin', 'staff', 'user')
 *   isActive: Boolean (default: true)
 *   totalSpent: Number (default: 0)
 *   createdAt: Date (auto)
 *   updatedAt: Date (auto)
 * }
 */

// ==================== ADMIN USER ====================
/**
 * Role: admin
 * Permissions:
 *   - View all users
 *   - Manage users (create, update)
 *   - View all bookings
 *   - Manage parking slots
 *   - View revenue analytics
 *   - Access complete dashboard
 * 
 * Sample Admin User:
 * {
 *   name: "System Administrator",
 *   email: "admin@campus.edu",
 *   password: "Admin@12345",  // Will be hashed in DB
 *   phone: "9876543210",
 *   role: "admin",
 *   isActive: true,
 *   totalSpent: 0
 * }
 * 
 * How to add Admin to MongoDB using Compass/Shell:
 * db.users.insertOne({
 *   name: "System Administrator",
 *   email: "admin@campus.edu",
 *   password: "$2a$12$...", // bcrypted password
 *   phone: "9876543210",
 *   role: "admin",
 *   isActive: true,
 *   totalSpent: 0,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * })
 */

// ==================== STAFF USER ====================
/**
 * Role: staff
 * Permissions:
 *   - View active bookings
 *   - Perform check-in/check-out operations
 *   - Search vehicles
 *   - Calculate and record billing
 *   - Generate parking receipts
 * 
 * Sample Staff User:
 * {
 *   name: "Parking Attendant",
 *   email: "staff@campus.edu",
 *   password: "Staff@12345",
 *   phone: "9876543211",
 *   role: "staff",
 *   isActive: true,
 *   totalSpent: 0
 * }
 * 
 * How to add Staff to MongoDB:
 * db.users.insertOne({
 *   name: "Parking Attendant",
 *   email: "staff@campus.edu",
 *   password: "$2a$12$...",
 *   phone: "9876543211",
 *   role: "staff",
 *   isActive: true,
 *   totalSpent: 0,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * })
 */

// ==================== REGULAR USER ====================
/**
 * Role: user
 * Permissions:
 *   - View available parking slots
 *   - Book parking slots
 *   - View own bookings
 *   - Cancel bookings
 *   - View active booking details
 * 
 * Sample User:
 * {
 *   name: "Rahul Sharma",
 *   email: "rahul@campus.edu",
 *   password: "User@123456",
 *   phone: "9876543212",
 *   vehicleNumber: "UP32AB1234",
 *   role: "user",
 *   isActive: true,
 *   totalSpent: 0
 * }
 * 
 * How to add User to MongoDB:
 * db.users.insertOne({
 *   name: "Rahul Sharma",
 *   email: "rahul@campus.edu",
 *   password: "$2a$12$...",
 *   phone: "9876543212",
 *   vehicleNumber: "UP32AB1234",
 *   role: "user",
 *   isActive: true,
 *   totalSpent: 0,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * })
 */

// ==================== DEFAULT TEST USERS ====================
/**
 * The following users are automatically created when you run: npm run seed
 */

const DEFAULT_USERS = [
  {
    name: "System Administrator",
    email: "admin@campus.edu",
    password: "Admin@12345",
    phone: "9876543210",
    role: "admin",
    description: "Full system access, user management, revenue analytics"
  },
  {
    name: "Parking Attendant",
    email: "staff@campus.edu",
    password: "Staff@12345",
    phone: "9876543211",
    role: "staff",
    description: "Check-in/out operations, vehicle search, billing"
  },
  {
    name: "Rahul Sharma",
    email: "rahul@campus.edu",
    password: "User@123456",
    phone: "9876543212",
    vehicleNumber: "UP32AB1234",
    role: "user",
    description: "Regular user - can book and view slots"
  },
  {
    name: "Priya Singh",
    email: "priya@campus.edu",
    password: "User@123456",
    phone: "9876543213",
    vehicleNumber: "UP32CD5678",
    role: "user",
    description: "Regular user - can book and view slots"
  },
  {
    name: "Amit Kumar",
    email: "amit@campus.edu",
    password: "User@123456",
    phone: "9876543214",
    vehicleNumber: "DL01EF9012",
    role: "user",
    description: "Regular user - can book and view slots"
  }
];

// ==================== MONGODB QUERIES ====================

/**
 * Get all users:
 * db.users.find()
 * 
 * Get all admins:
 * db.users.find({ role: "admin" })
 * 
 * Get all staff:
 * db.users.find({ role: "staff" })
 * 
 * Get all regular users:
 * db.users.find({ role: "user" })
 * 
 * Find user by email:
 * db.users.findOne({ email: "admin@campus.edu" })
 * 
 * Count users by role:
 * db.users.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
 * 
 * Get active users only:
 * db.users.find({ isActive: true })
 * 
 * Delete a user:
 * db.users.deleteOne({ email: "test@campus.edu" })
 * 
 * Update user status:
 * db.users.updateOne({ email: "admin@campus.edu" }, { $set: { isActive: false } })
 * 
 * Add new staff member:
 * db.users.insertOne({
 *   name: "New Staff Member",
 *   email: "newstaff@campus.edu",
 *   password: "hashed_password_here",
 *   phone: "1234567890",
 *   role: "staff",
 *   isActive: true,
 *   totalSpent: 0,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * })
 */

// ==================== PROGRAMMING APPROACH (Node.js) ====================

/**
 * Create users programmatically using Mongoose:
 * 
 * const User = require('./models/User');
 * 
 * // Create Admin User
 * const admin = await User.create({
 *   name: "System Administrator",
 *   email: "admin@campus.edu",
 *   password: "Admin@12345",  // Auto-hashed by pre-save hook
 *   phone: "9876543210",
 *   role: "admin"
 * });
 * 
 * // Create Staff User
 * const staff = await User.create({
 *   name: "Parking Attendant",
 *   email: "staff@campus.edu",
 *   password: "Staff@12345",
 *   phone: "9876543211",
 *   role: "staff"
 * });
 * 
 * // Create Regular User
 * const user = await User.create({
 *   name: "John Doe",
 *   email: "john@campus.edu",
 *   password: "User@123456",
 *   phone: "9876543212",
 *   vehicleNumber: "MH02AB1234",
 *   role: "user"
 * });
 */

// ==================== API AUTHENTICATION ====================

/**
 * Login API: POST /api/auth/login
 * Request:
 * {
 *   email: "admin@campus.edu",
 *   password: "Admin@12345"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   token: "jwt_token_here",
 *   user: {
 *     _id: "user_id",
 *     name: "System Administrator",
 *     email: "admin@campus.edu",
 *     role: "admin",
 *     phone: "9876543210"
 *   }
 * }
 * 
 * Token expires in 7 days by default
 * Token is stored in localStorage as 'token'
 * User info is stored in localStorage as 'user'
 */

// ==================== PASSWORD REQUIREMENTS ====================

/**
 * Password Validation Rules:
 * - Minimum 8 characters
 * - Must be present
 * - Will be hashed using bcryptjs (12 salt rounds) before storage
 * 
 * Recommended Password Format:
 * - Admin: Admin@12345 (Start with capital, include numbers, special char)
 * - Staff: Staff@12345
 * - User: User@123456
 */

// ==================== PARKING SLOTS STRUCTURE ====================

/**
 * PARKING SLOT SCHEMA:
 * {
 *   _id: ObjectId
 *   slotNumber: String (e.g., "A01", "B15")
 *   zone: String (A, B, C, D)
 *   type: String (standard, compact, handicapped, ev_charging)
 *   floor: Number (1 or 2)
 *   pricePerHour: Number
 *   status: String (available, booked, occupied, maintenance)
 *   createdAt: Date
 *   updatedAt: Date
 * }
 * 
 * Default Slots:
 * - 4 Zones (A, B, C, D)
 * - 15 slots per zone = 60 total slots
 * - Zone distribution:
 *   - Slot 1: Handicapped, ₹10/hr
 *   - Slot 2: EV Charging, ₹30/hr
 *   - Slots 3-6: Compact, ₹15/hr
 *   - Slots 7-15: Standard, ₹20/hr
 * - Zones C & D are on Floor 2
 * - Zones A & B are on Floor 1
 */

// ==================== BOOKINGS STRUCTURE ====================

/**
 * BOOKING SCHEMA:
 * {
 *   _id: ObjectId
 *   userId: ObjectId (ref to User)
 *   slotId: ObjectId (ref to ParkingSlot)
 *   vehicleNumber: String
 *   checkInTime: Date
 *   checkOutTime: Date (optional)
 *   estimatedDuration: Number (hours)
 *   status: String (pending, active, checked_in, completed, cancelled)
 *   totalAmount: Number
 *   paymentMethod: String (cash, card, upi, wallet)
 *   createdAt: Date
 *   updatedAt: Date
 * }
 */

// ==================== QUICK START COMMANDS ====================

/**
 * 1. Connect to MongoDB Atlas:
 *    - Use credentials from .env (MONGO_URI)
 *    - Use MongoDB Compass or mongosh CLI
 * 
 * 2. Seed database with default data:
 *    cd backend
 *    npm run seed
 * 
 * 3. Start backend server:
 *    npm run dev
 * 
 * 4. Start frontend:
 *    cd frontend
 *    npm start
 * 
 * 5. Login credentials:
 *    Admin:   admin@campus.edu / Admin@12345
 *    Staff:   staff@campus.edu / Staff@12345
 *    User:    rahul@campus.edu / User@123456
 */

module.exports = { DEFAULT_USERS };
