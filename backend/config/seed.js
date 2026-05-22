const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany(),
      ParkingSlot.deleteMany(),
      Booking.deleteMany()
    ]);
    console.log('Cleared existing data');

    const users = await User.create([
      {
        name: 'System Administrator',
        email: 'admin@campus.edu',
        password: 'Admin@12345',
        phone: '9876543210',
        role: 'admin'
      },
      {
        name: 'Parking Attendant',
        email: 'staff@campus.edu',
        password: 'Staff@12345',
        phone: '9876543211',
        role: 'staff'
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@campus.edu',
        password: 'User@123456',
        phone: '9876543212',
        vehicleNumber: 'UP32AB1234',
        role: 'user'
      },
      {
        name: 'Priya Singh',
        email: 'priya@campus.edu',
        password: 'User@123456',
        phone: '9876543213',
        vehicleNumber: 'UP32CD5678',
        role: 'user'
      },
      {
        name: 'Amit Kumar',
        email: 'amit@campus.edu',
        password: 'User@123456',
        phone: '9876543214',
        vehicleNumber: 'DL01EF9012',
        role: 'user'
      }
    ]);

    console.log(`Created ${users.length} users`);

    const zones = ['A', 'B', 'C', 'D'];
    const slots = [];

    for (const zone of zones) {
      for (let i = 1; i <= 15; i++) {
        let type = 'standard';
        let price = 20;

        if (i === 1) {
          type = 'handicapped';
          price = 10;
        } else if (i === 2) {
          type = 'ev_charging';
          price = 30;
        } else if (i <= 6) {
          type = 'compact';
          price = 15;
        }

        slots.push({
          slotNumber: `${zone}${String(i).padStart(2, '0')}`,
          zone,
          type,
          pricePerHour: price,
          floor: (zone === 'C' || zone === 'D') ? 2 : 1,
          status: 'available'
        });
      }
    }

    await ParkingSlot.insertMany(slots);
    console.log(`Created ${slots.length} parking slots`);

    console.log('\n========================================');
    console.log('Database seeding completed successfully');
    console.log('========================================\n');

    console.log('Login Credentials:');
    console.log('Admin:  admin@campus.edu / Admin@12345');
    console.log('Staff:  staff@campus.edu / Staff@12345');
    console.log('User:   rahul@campus.edu / User@123456');
    console.log('User:   priya@campus.edu / User@123456');
    console.log('User:   amit@campus.edu  / User@123456\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
