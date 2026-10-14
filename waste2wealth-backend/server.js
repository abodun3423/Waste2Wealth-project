const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const allowedOrigins = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || '')
  .split(',').map(origin => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  console.error('FRONTEND_ORIGIN or FRONTEND_ORIGINS must be configured in production');
  process.exit(1);
}
app.use(cors({
  origin(origin, callback) {
    // Non-browser traffic without an Origin header may still authenticate using JWT.
    if (!origin) return callback(null, true);
    return callback(null, allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production');
  }
}));
app.use(express.json());

// Routes
const userRoutes = require('./routes/users');
const recyclableRoutes = require('./routes/recyclables');
const rewardRoutes = require('./routes/rewards');
const redemptionRoutes = require('./routes/redemptions');
const companyRoutes = require('./routes/companies');
const pickupRoutes = require('./routes/pickups');
const adminRoutes = require('./routes/admin');
const companyAuthRoutes = require('./routes/companyAuth');
const companyPortalRoutes = require('./routes/companyPortal');

app.use('/api/users', userRoutes);
app.use('/api/recyclables', recyclableRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company-auth', companyAuthRoutes);
app.use('/api/company', companyPortalRoutes);

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => { console.log("✅ MongoDB connected"); console.log("Active database:", mongoose.connection.name); })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

