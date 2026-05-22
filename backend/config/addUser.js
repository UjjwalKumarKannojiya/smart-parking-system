/**
 * MongoDB User Management - Helper Script
 * Add this to your backend/config/ folder or use directly
 * 
 * Usage: node addUser.js
 * This script provides functions to add new users to MongoDB
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

/**
 * Add a new admin user to the database
 */
async function addAdmin(adminData) {
  try {
    const { name, email, password, phone } = adminData;
    
    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
      isActive: true
    });
    
    console.log('✓ Admin created successfully:', admin.email);
    return admin;
  } catch (error) {
    console.error('✗ Error creating admin:', error.message);
    throw error;
  }
}

/**
 * Add a new staff member to the database
 */
async function addStaff(staffData) {
  try {
    const { name, email, password, phone } = staffData;
    
    const staff = await User.create({
      name,
      email,
      password,
      phone,
      role: 'staff',
      isActive: true
    });
    
    console.log('✓ Staff member created successfully:', staff.email);
    return staff;
  } catch (error) {
    console.error('✗ Error creating staff:', error.message);
    throw error;
  }
}

/**
 * Add a new regular user to the database
 */
async function addUser(userData) {
  try {
    const { name, email, password, phone, vehicleNumber } = userData;
    
    const user = await User.create({
      name,
      email,
      password,
      phone,
      vehicleNumber,
      role: 'user',
      isActive: true
    });
    
    console.log('✓ User created successfully:', user.email);
    return user;
  } catch (error) {
    console.error('✗ Error creating user:', error.message);
    throw error;
  }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log('✓ User found:', {
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      });
      return user;
    } else {
      console.log('✗ User not found:', email);
      return null;
    }
  } catch (error) {
    console.error('✗ Error finding user:', error.message);
    throw error;
  }
}

/**
 * Get all users by role
 */
async function getUsersByRole(role) {
  try {
    const users = await User.find({ role });
    console.log(`✓ Found ${users.length} users with role '${role}':`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });
    return users;
  } catch (error) {
    console.error('✗ Error fetching users:', error.message);
    throw error;
  }
}

/**
 * Delete user by email
 */
async function deleteUserByEmail(email) {
  try {
    const result = await User.deleteOne({ email: email.toLowerCase() });
    
    if (result.deletedCount > 0) {
      console.log('✓ User deleted successfully:', email);
    } else {
      console.log('✗ User not found:', email);
    }
    return result;
  } catch (error) {
    console.error('✗ Error deleting user:', error.message);
    throw error;
  }
}

/**
 * Update user status (activate/deactivate)
 */
async function updateUserStatus(email, isActive) {
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive },
      { new: true }
    );
    
    if (user) {
      console.log(`✓ User status updated to ${isActive ? 'active' : 'inactive'}:`, email);
      return user;
    } else {
      console.log('✗ User not found:', email);
      return null;
    }
  } catch (error) {
    console.error('✗ Error updating user:', error.message);
    throw error;
  }
}

/**
 * Get all users with pagination
 */
async function getAllUsers(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const users = await User.find()
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments();
    
    console.log(`✓ Fetched ${users.length} users (Page ${page} of ${Math.ceil(total / limit)}):`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    return { users, total, pages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('✗ Error fetching users:', error.message);
    throw error;
  }
}

/**
 * Interactive command-line interface
 */
async function interactiveMode() {
  const readline = require('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║  MongoDB User Management Tool         ║');
  console.log('╚═══════════════════════════════════════╝\n');

  let exit = false;
  while (!exit) {
    console.log('\nOptions:');
    console.log('1. Add Admin');
    console.log('2. Add Staff Member');
    console.log('3. Add Regular User');
    console.log('4. Find User by Email');
    console.log('5. List Users by Role');
    console.log('6. View All Users');
    console.log('7. Delete User');
    console.log('8. Exit');

    const choice = await question('\nSelect option (1-8): ');

    try {
      switch (choice) {
        case '1':
          const adminData = {
            name: await question('Admin Name: '),
            email: await question('Admin Email: '),
            password: await question('Admin Password (min 8 chars): '),
            phone: await question('Phone Number: ')
          };
          await addAdmin(adminData);
          break;

        case '2':
          const staffData = {
            name: await question('Staff Name: '),
            email: await question('Staff Email: '),
            password: await question('Staff Password (min 8 chars): '),
            phone: await question('Phone Number: ')
          };
          await addStaff(staffData);
          break;

        case '3':
          const userData = {
            name: await question('User Name: '),
            email: await question('User Email: '),
            password: await question('User Password (min 8 chars): '),
            phone: await question('Phone Number: '),
            vehicleNumber: await question('Vehicle Number: ')
          };
          await addUser(userData);
          break;

        case '4':
          const searchEmail = await question('Enter email to search: ');
          await getUserByEmail(searchEmail);
          break;

        case '5':
          const role = await question('Enter role (admin/staff/user): ');
          await getUsersByRole(role);
          break;

        case '6':
          const page = parseInt(await question('Enter page number (default 1): ')) || 1;
          await getAllUsers(page, 10);
          break;

        case '7':
          const deleteEmail = await question('Enter email to delete: ');
          const confirm = await question('Are you sure? (yes/no): ');
          if (confirm.toLowerCase() === 'yes') {
            await deleteUserByEmail(deleteEmail);
          }
          break;

        case '8':
          exit = true;
          console.log('\nGoodbye!');
          break;

        default:
          console.log('Invalid option. Please select 1-8.');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  rl.close();
  process.exit(0);
}

// ==================== STANDALONE USAGE EXAMPLES ====================

/**
 * Example: Run directly as a script
 * 
 * Uncomment any of the below examples and run:
 * node backend/config/addUser.js
 */

async function runExamples() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Example 1: Add a new admin
    // await addAdmin({
    //   name: 'John Smith',
    //   email: 'john.admin@campus.edu',
    //   password: 'AdminPass@123',
    //   phone: '9876543210'
    // });

    // Example 2: Add a new staff member
    // await addStaff({
    //   name: 'Alice Johnson',
    //   email: 'alice.staff@campus.edu',
    //   password: 'StaffPass@123',
    //   phone: '9876543211'
    // });

    // Example 3: Add a new regular user
    // await addUser({
    //   name: 'Bob Wilson',
    //   email: 'bob.user@campus.edu',
    //   password: 'UserPass@123',
    //   phone: '9876543212',
    //   vehicleNumber: 'MH02CD5678'
    // });

    // Example 4: Find user by email
    // await getUserByEmail('admin@campus.edu');

    // Example 5: Get all admins
    // await getUsersByRole('admin');

    // Example 6: Get all users (paginated)
    // await getAllUsers(1, 10);

    // Example 7: Start interactive mode
    await interactiveMode();

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Uncomment to run examples
// runExamples();

module.exports = {
  addAdmin,
  addStaff,
  addUser,
  getUserByEmail,
  getUsersByRole,
  getAllUsers,
  deleteUserByEmail,
  updateUserStatus,
  interactiveMode
};
