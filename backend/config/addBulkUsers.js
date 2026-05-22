/**
 * Bulk User Addition Script for SmartPark
 * This script adds 20+ realistic test users to MongoDB
 * Run: node config/addBulkUsers.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const bulkUsers = [
  // Additional Admins (2 more)
  {
    name: "Dr. Vikram Patel",
    email: "vikram.admin@campus.edu",
    password: "Admin@12345",
    phone: "9876543220",
    role: "admin",
    isActive: true
  },
  {
    name: "Neha Sharma",
    email: "neha.admin@campus.edu",
    password: "Admin@12345",
    phone: "9876543221",
    role: "admin",
    isActive: true
  },

  // Additional Staff (4 more)
  {
    name: "Rajesh Kumar",
    email: "rajesh.staff@campus.edu",
    password: "Staff@12345",
    phone: "9876543222",
    role: "staff",
    isActive: true
  },
  {
    name: "Suresh Singh",
    email: "suresh.staff@campus.edu",
    password: "Staff@12345",
    phone: "9876543223",
    role: "staff",
    isActive: true
  },
  {
    name: "Anjali Gupta",
    email: "anjali.staff@campus.edu",
    password: "Staff@12345",
    phone: "9876543224",
    role: "staff",
    isActive: true
  },
  {
    name: "Mohan Verma",
    email: "mohan.staff@campus.edu",
    password: "Staff@12345",
    phone: "9876543225",
    role: "staff",
    isActive: true
  },

  // Regular Users (15 more)
  {
    name: "Akshay Nair",
    email: "akshay@campus.edu",
    password: "User@123456",
    phone: "8765432100",
    vehicleNumber: "KA01AB0001",
    role: "user",
    isActive: true
  },
  {
    name: "Deepika Reddy",
    email: "deepika@campus.edu",
    password: "User@123456",
    phone: "8765432101",
    vehicleNumber: "TG02CD0002",
    role: "user",
    isActive: true
  },
  {
    name: "Rohan Pandey",
    email: "rohan@campus.edu",
    password: "User@123456",
    phone: "8765432102",
    vehicleNumber: "UP03EF0003",
    role: "user",
    isActive: true
  },
  {
    name: "Sneha Mishra",
    email: "sneha@campus.edu",
    password: "User@123456",
    phone: "8765432103",
    vehicleNumber: "BR04GH0004",
    role: "user",
    isActive: true
  },
  {
    name: "Arjun Iyer",
    email: "arjun@campus.edu",
    password: "User@123456",
    phone: "8765432104",
    vehicleNumber: "MH05IJ0005",
    role: "user",
    isActive: true
  },
  {
    name: "Pooja Sinha",
    email: "pooja@campus.edu",
    password: "User@123456",
    phone: "8765432105",
    vehicleNumber: "DL06KL0006",
    role: "user",
    isActive: true
  },
  {
    name: "Vikram Malhotra",
    email: "vikram@campus.edu",
    password: "User@123456",
    phone: "8765432106",
    vehicleNumber: "HR07MN0007",
    role: "user",
    isActive: true
  },
  {
    name: "Ananya Chopra",
    email: "ananya@campus.edu",
    password: "User@123456",
    phone: "8765432107",
    vehicleNumber: "PB08OP0008",
    role: "user",
    isActive: true
  },
  {
    name: "Saurabh Dubey",
    email: "saurabh@campus.edu",
    password: "User@123456",
    phone: "8765432108",
    vehicleNumber: "WB09QR0009",
    role: "user",
    isActive: true
  },
  {
    name: "Isha Kulkarni",
    email: "isha@campus.edu",
    password: "User@123456",
    phone: "8765432109",
    vehicleNumber: "JK10ST0010",
    role: "user",
    isActive: true
  },
  {
    name: "Nikhil Bhat",
    email: "nikhil@campus.edu",
    password: "User@123456",
    phone: "8765432110",
    vehicleNumber: "GJ11UV0011",
    role: "user",
    isActive: true
  },
  {
    name: "Ritika Saxena",
    email: "ritika@campus.edu",
    password: "User@123456",
    phone: "8765432111",
    vehicleNumber: "CG12WX0012",
    role: "user",
    isActive: true
  },
  {
    name: "Harsh Verma",
    email: "harsh@campus.edu",
    password: "User@123456",
    phone: "8765432112",
    vehicleNumber: "AP13YZ0013",
    role: "user",
    isActive: true
  },
  {
    name: "Priyanka Joshi",
    email: "priyanka@campus.edu",
    password: "User@123456",
    phone: "8765432113",
    vehicleNumber: "OD14AB0014",
    role: "user",
    isActive: true
  },
  {
    name: "Sameer Khan",
    email: "sameer@campus.edu",
    password: "User@123456",
    phone: "8765432114",
    vehicleNumber: "TS15CD0015",
    role: "user",
    isActive: true
  }
];

async function addBulkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Check existing users
    const existingCount = await User.countDocuments();
    console.log(`📊 Existing users in database: ${existingCount}`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const userData of bulkUsers) {
      try {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⊘ Skipped: ${userData.email} (already exists)`);
          skippedCount++;
        } else {
          const newUser = await User.create(userData);
          console.log(`✓ Added: ${userData.name} (${userData.email})`);
          addedCount++;
        }
      } catch (err) {
        console.error(`✗ Error adding ${userData.email}:`, err.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Bulk User Addition Summary');
    console.log('='.repeat(50));
    console.log(`✓ Successfully added: ${addedCount} users`);
    console.log(`⊘ Skipped (duplicates): ${skippedCount} users`);

    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const staffCount = await User.countDocuments({ role: 'staff' });
    const userCount = await User.countDocuments({ role: 'user' });

    console.log('\nDatabase Statistics:');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`  - Admin: ${adminCount}`);
    console.log(`  - Staff: ${staffCount}`);
    console.log(`  - Regular Users: ${userCount}`);
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

addBulkUsers();
