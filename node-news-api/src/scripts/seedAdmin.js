// Seed script to create an admin user
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { Roles } from '../utils/permissions.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

async function seedAdmin() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/node_news';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`Admin user already exists with email: ${ADMIN_EMAIL}`);

      // Update role to ADMIN if it's not already
      if (existingAdmin.role !== Roles.ADMIN) {
        existingAdmin.role = Roles.ADMIN;
        await existingAdmin.save();
        console.log('Updated existing user role to ADMIN');
      }

      process.exit(0);
    }

    // Create new admin user
    const adminUser = new User({
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: Roles.ADMIN
    });

    // Set password (uses the setPassword method from User model)
    await adminUser.setPassword(ADMIN_PASSWORD);

    // Save to database
    await adminUser.save();

    console.log('✓ Admin user created successfully!');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Role:', Roles.ADMIN);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
