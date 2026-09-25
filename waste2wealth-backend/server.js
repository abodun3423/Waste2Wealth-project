const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
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
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

