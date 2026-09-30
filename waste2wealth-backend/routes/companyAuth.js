const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const RecyclingCompany = require('../models/RecyclingCompany');

// ======================================
// COMPANY REGISTRATION
// ======================================
router.post('/register', async (req, res) => {
  try {
    const {
      companyName,
      email,
      phone,
      address,
      city,
      state,
      materialsAccepted,
      pickupAvailable,
      password
    } = req.body;

    // Check required fields
    if (
      !companyName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !password
    ) {
      return res.status(400).json({
        error: 'Required company information is missing'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    // At least one material must be selected
    if (
      !Array.isArray(materialsAccepted) ||
      materialsAccepted.length === 0
    ) {
      return res.status(400).json({
        error: 'Select at least one recyclable material'
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // Prevent duplicate company accounts
    const existingCompany =
      await RecyclingCompany.findOne({
        email: normalizedEmail
      });

    if (existingCompany) {
      return res.status(400).json({
        error:
          'A recycling company with this email already exists'
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create company
    const company =
      new RecyclingCompany({
        companyName: companyName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        materialsAccepted,
        pickupAvailable:
          pickupAvailable === true,
        password: hashedPassword,

        // Public registration must never
        // approve itself.
        verified: false,
        accountActive: true
      });

    await company.save();

    res.status(201).json({
      message:
        'Company registration successful. Your account is awaiting verification.',

      company: {
        _id: company._id,
        companyName: company.companyName,
        email: company.email,
        phone: company.phone,
        city: company.city,
        state: company.state,
        materialsAccepted:
          company.materialsAccepted,
        pickupAvailable:
          company.pickupAvailable,
        verified: company.verified
      }
    });

  } catch (error) {
    console.error(
      'Company registration error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });
  }
});


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
