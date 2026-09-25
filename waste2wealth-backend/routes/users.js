const express = require('express');
const router = express.Router();

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// ==========================
// REGISTER USER
// ==========================

router.post('/register', async (req, res) => {
  try {

    const {
      name,
      email,
      password
    } = req.body;


    // Check required fields
    if (!name || !email || !password) {

      return res.status(400).json({
        error:
          'Name, email and password are required'
      });

    }


    // Check if user already exists
    const existingUser =
      await User.findOne({ email });


    if (existingUser) {

      return res.status(400).json({
        error: 'Email already registered'
      });

    }


    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);


    // IMPORTANT:
    // Public registration always creates
    // a normal user.
    //
    // We do NOT accept role from req.body.

    const user = new User({

      name,
      email,
      password: hashedPassword,
      role: 'user'

    });


    await user.save();


    // Return safe user information
    res.status(201).json({

      message:
        'User registered successfully',

      user: {

        _id: user._id,

        name: user.name,

        email: user.email,

        role: user.role

      }

    });


  } catch (err) {

    console.error(
      'Register error:',
      err
    );


    res.status(500).json({
      error: 'Server error'
    });

  }
});


// ==========================
// LOGIN USER / ADMIN
// ==========================

router.post('/login', async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    // Check required fields
    if (!email || !password) {

      return res.status(400).json({
        error:
          'Email and password are required'
      });

    }


    // Find user
    const user =
      await User.findOne({ email });


    if (!user) {

      return res.status(401).json({
        error: 'Invalid credentials'
      });

    }


    // Compare password
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!isMatch) {

      return res.status(401).json({
        error: 'Invalid credentials'
      });

    }


    /*
      Existing users created before the
      role field was introduced may not
      have role stored in MongoDB.

      Treat them as normal users.
    */

    const userRole =
      user.role || 'user';


    // Create JWT
    const token = jwt.sign(

      {

        userId: user._id,

        role: userRole

      },

      process.env.JWT_SECRET,

      {
        expiresIn: '7d'
      }

    );


    // Send token + safe user information
    res.json({

      message: 'Login successful',

      token,

      user: {

        _id: user._id,

        name: user.name,

        email: user.email,

        role: userRole

      }

    });


  } catch (err) {

    console.error(
      'Login error:',
      err
    );


    res.status(500).json({
      error: 'Server error'
    });

  }

});


module.exports = router;