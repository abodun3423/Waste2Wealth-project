require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!process.env.MONGO_URI || !email || !password || password.length < 16) {
    throw new Error('Set MONGO_URI, ADMIN_EMAIL and a strong ADMIN_INITIAL_PASSWORD of at least 16 characters');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    if (await User.exists({ email })) {
      console.log('Admin account already exists; no changes made');
      return;
    }
    await User.create({
      name: 'Waste2Wealth Admin',
      email,
      password: await bcrypt.hash(password, 12),
      role: 'admin'
    });
    console.log('New admin account created. Remove ADMIN_INITIAL_PASSWORD from the environment after setup.');
  } finally {
    await mongoose.disconnect();
  }
}
if (require.main === module) {
  createAdmin().catch(err => {
    console.error('Admin setup failed:', err.message);
    process.exitCode = 1;
  });
}
