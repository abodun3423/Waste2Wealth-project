const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const RecyclingCompany = require('../models/RecyclingCompany');


// ======================================
// COMPANY ACCOUNT SETUP
// ======================================
// Used for an existing recycling company
// to create its login password.
router.post('/setup', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    const company = await RecyclingCompany.findOne({
      email: email.toLowerCase().trim()
    });

    if (!company) {
      return res.status(404).json({
        error: 'Recycling company not found'
      });
    }

    if (company.password) {
      return res.status(400).json({
        error: 'Company account has already been set up'
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    company.password = hashedPassword;

    await company.save();

    res.json({
      message: 'Company account setup successfully'
    });

  } catch (error) {
    console.error(
      'Company account setup error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });
  }
});


// ======================================
// COMPANY LOGIN
// ======================================
router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const company = await RecyclingCompany.findOne({
      email: email.toLowerCase().trim()
    });

    if (!company || !company.password) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    if (!company.accountActive) {
      return res.status(403).json({
        error: 'Company account is inactive'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      company.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        companyId: company._id,
        role: 'company'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      message: 'Company login successful',

      token,

      company: {
        _id: company._id,
        companyName: company.companyName,
        email: company.email,
        phone: company.phone,
        city: company.city,
        state: company.state,
        verified: company.verified,
        pickupAvailable: company.pickupAvailable
      }
    });

  } catch (error) {
    console.error(
      'Company login error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });
  }
});


module.exports = router;
