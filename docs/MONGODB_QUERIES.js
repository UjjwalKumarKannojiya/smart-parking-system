/**
 * DIRECT MONGODB INSERT QUERIES
 * ==============================
 * 
 * How to use:
 * 1. Open MongoDB Compass and connect using credentials from .env (MONGO_URI)
 * 2. Go to smart_parking > users collection
 * 3. Click "INSERT DOCUMENT" and paste the JSON below
 * 
 * OR use mongosh CLI:
 * mongosh "<your_mongodb_connection_string>"
 * Then paste the db.users.insertOne() commands below
 * 
 * See .env.example for MongoDB connection setup
 */

// ==================== HASHED PASSWORDS REFERENCE ====================
/**
 * These are bcryptjs hashed passwords (12 salt rounds)
 * You can use them directly without hashing again
 * 
 * Original Password → Hashed Password
 * Admin@12345 → $2a$12$...
 * Staff@12345 → $2a$12$...
 * User@123456 → $2a$12$...
 * 
 * BETTER: Use the API to register/seed instead of direct insert
 * This ensures passwords are properly hashed
 */

// ==================== MONGODB COMPASS - INSERT ONE ====================

/**
 * ADMIN USER (Copy the entire object below)
 */
{
  "name": "System Administrator",
  "email": "admin@campus.edu",
  "phone": "9876543210",
  "role": "admin",
  "isActive": true,
  "totalSpent": 0,
  "createdAt": { "$date": "2024-01-01T00:00:00Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00Z" }
}

/**
 * STAFF USER (Copy the entire object below)
 */
{
  "name": "Parking Attendant",
  "email": "staff@campus.edu",
  "phone": "9876543211",
  "role": "staff",
  "isActive": true,
  "totalSpent": 0,
  "createdAt": { "$date": "2024-01-01T00:00:00Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00Z" }
}

/**
 * REGULAR USER (Copy the entire object below)
 */
{
  "name": "Rahul Sharma",
  "email": "rahul@campus.edu",
  "phone": "9876543212",
  "vehicleNumber": "UP32AB1234",
  "role": "user",
  "isActive": true,
  "totalSpent": 0,
  "createdAt": { "$date": "2024-01-01T00:00:00Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00Z" }
}

// ==================== MONGOSH CLI COMMANDS ====================

/**
 * 1. Connect to MongoDB Atlas:
 * mongosh "<your_mongodb_connection_string>"
 * 
 * 2. Select database:
 * use smart_parking
 * 
 * 3. View all collections:
 * show collections
 * 
 * 4. View all users:
 * db.users.find()
 * 
 * 5. Count users:
 * db.users.countDocuments()
 * 
 * 6. View users by role:
 * db.users.find({ role: "admin" })
 * db.users.find({ role: "staff" })
 * db.users.find({ role: "user" })
 */

// ==================== ADD USERS VIA MONGOSH ====================

/**
 * Add Admin (paste in mongosh):
 */
db.users.insertOne({
  name: "System Administrator",
  email: "admin@campus.edu",
  phone: "9876543210",
  role: "admin",
  isActive: true,
  totalSpent: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})

/**
 * Add Staff (paste in mongosh):
 */
db.users.insertOne({
  name: "Parking Attendant",
  email: "staff@campus.edu",
  phone: "9876543211",
  role: "staff",
  isActive: true,
  totalSpent: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})

/**
 * Add Regular User (paste in mongosh):
 */
db.users.insertOne({
  name: "John Doe",
  email: "john@campus.edu",
  phone: "9876543212",
  vehicleNumber: "MH02AB1234",
  role: "user",
  isActive: true,
  totalSpent: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})

/**
 * Add Multiple Users at Once (paste in mongosh):
 */
db.users.insertMany([
  {
    name: "Alice Johnson",
    email: "alice@campus.edu",
    phone: "1111111111",
    vehicleNumber: "DL01CD5678",
    role: "user",
    isActive: true,
    totalSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Bob Wilson",
    email: "bob@campus.edu",
    phone: "2222222222",
    vehicleNumber: "KA01EF9012",
    role: "user",
    isActive: true,
    totalSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Carol Smith",
    email: "carol@campus.edu",
    phone: "3333333333",
    vehicleNumber: "TN02GH3456",
    role: "user",
    isActive: true,
    totalSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// ==================== UPDATE OPERATIONS ====================

/**
 * Deactivate a user:
 */
db.users.updateOne(
  { email: "admin@campus.edu" },
  { $set: { isActive: false } }
)

/**
 * Update user info:
 */
db.users.updateOne(
  { email: "admin@campus.edu" },
  { $set: { 
    phone: "9999999999",
    updatedAt: new Date()
  }}
)

/**
 * Increment totalSpent:
 */
db.users.updateOne(
  { email: "rahul@campus.edu" },
  { $inc: { totalSpent: 150 } }
)

// ==================== DELETE OPERATIONS ====================

/**
 * Delete a user:
 */
db.users.deleteOne({ email: "test@campus.edu" })

/**
 * Delete all users with a role:
 */
db.users.deleteMany({ role: "user" })

/**
 * Delete all users (WARNING - irreversible):
 */
db.users.deleteMany({})

// ==================== SEARCH & FILTER ====================

/**
 * Find active admins:
 */
db.users.find({ role: "admin", isActive: true })

/**
 * Find users by vehicle number:
 */
db.users.find({ vehicleNumber: "UP32AB1234" })

/**
 * Find users by email pattern:
 */
db.users.find({ email: /campus\.edu$/ })

/**
 * Count users with totalSpent > 100:
 */
db.users.countDocuments({ totalSpent: { $gt: 100 } })

/**
 * Get users sorted by totalSpent (descending):
 */
db.users.find().sort({ totalSpent: -1 })

/**
 * Get top 5 users by spending:
 */
db.users.find().sort({ totalSpent: -1 }).limit(5)

// ==================== AGGREGATION QUERIES ====================

/**
 * Count users by role:
 */
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])

/**
 * Get total spending by role:
 */
db.users.aggregate([
  { $group: { _id: "$role", totalSpent: { $sum: "$totalSpent" } } }
])

/**
 * Get average spending by role:
 */
db.users.aggregate([
  { $group: { _id: "$role", avgSpent: { $avg: "$totalSpent" } } }
])

/**
 * List all users with their spending stats:
 */
db.users.aggregate([
  {
    $project: {
      name: 1,
      email: 1,
      role: 1,
      totalSpent: 1,
      _id: 0
    }
  }
])

// ==================== PARKING SLOTS ====================

/**
 * View all parking slots:
 */
db.parkingslots.find()

/**
 * Count slots by zone:
 */
db.parkingslots.aggregate([
  { $group: { _id: "$zone", count: { $sum: 1 } } }
])

/**
 * Count slots by status:
 */
db.parkingslots.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

/**
 * Find available slots:
 */
db.parkingslots.find({ status: "available" })

/**
 * Find expensive slots (> ₹25/hr):
 */
db.parkingslots.find({ pricePerHour: { $gt: 25 } })

// ==================== BOOKINGS ====================

/**
 * View all bookings:
 */
db.bookings.find()

/**
 * Find active bookings:
 */
db.bookings.find({ status: { $in: ["pending", "active", "checked_in"] } })

/**
 * Find completed bookings:
 */
db.bookings.find({ status: "completed" })

/**
 * Get bookings for specific user:
 */
db.bookings.find({ userId: ObjectId("user_id_here") })

// ==================== BULK OPERATIONS ====================

/**
 * Reset all parking slots to available:
 */
db.parkingslots.updateMany({}, { $set: { status: "available" } })

/**
 * Reset all users' totalSpent to 0:
 */
db.users.updateMany({}, { $set: { totalSpent: 0 } })

/**
 * Deactivate all users:
 */
db.users.updateMany({}, { $set: { isActive: false } })

// ==================== TIPS FOR MONGODB COMPASS ====================

/**
 * 1. Connection String:
 *    Use credentials from .env (MONGO_URI)
 * 
 * 2. Navigate to: Database > smart_parking > users
 * 
 * 3. To Insert:
 *    - Click "+ INSERT DOCUMENT"
 *    - Choose "JSON" mode
 *    - Paste the document JSON
 * 
 * 4. To Query:
 *    - Click "FILTER" button
 *    - Enter: { role: "admin" }
 *    - Hit Enter
 * 
 * 5. To Update:
 *    - Find the document
 *    - Click the pencil icon
 *    - Edit fields
 *    - Click "Update"
 * 
 * 6. To Delete:
 *    - Find the document
 *    - Click the trash icon
 *    - Confirm
 */
