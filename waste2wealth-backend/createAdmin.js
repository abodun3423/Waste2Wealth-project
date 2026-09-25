require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB connected');

    const adminEmail = 'admin@waste2wealth.com';

    const existingAdmin = await User.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      console.log('⚠️ Admin account already exists');
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(
      'ChangeMe123!',
      10
    );

    const admin = new User({
      name: 'Waste2Wealth Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();

    console.log('✅ Admin account created successfully');
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

    await mongoose.disconnect();

  } catch (error) {
    console.error(
      '❌ Create admin error:',
      error
    );

    await mongoose.disconnect();
  }
};

createAdmin();
