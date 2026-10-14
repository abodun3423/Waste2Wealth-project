const express = require('express');
const router = express.Router();

const RecyclingCompany = require('../models/RecyclingCompany');
const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const companyAuth = require('../middleware/companyAuth');
const verifiedCompany = require('../middleware/verifiedCompany');


// ======================================
// GET LOGGED-IN COMPANY PROFILE
// ======================================
router.get('/me', companyAuth, async (req, res) => {
  try {

    const company = await RecyclingCompany.findById(
      req.companyId
    ).select('-password');

    if (!company) {
      return res.status(404).json({
        error: 'Recycling company not found'
      });
    }

    res.json({
      message: 'Company profile retrieved successfully',
      company
    });

  } catch (error) {

    console.error(
      'Get company profile error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });
  }
});

// ======================================
// GET COMPANY'S ASSIGNED PICKUPS
// ======================================
router.get('/pickups', companyAuth, async (req, res) => {
  try {

    const pickups = await PickupRequest.find({
      company: req.companyId
    })
      .populate(
        'user',
        'name email'
      )
      .sort({ createdAt: -1 });

    res.json({
      totalPickups: pickups.length,
      pickups
    });

  } catch (error) {

    console.error(
      'Get company pickups error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });
  }
});

// ======================================
// UPDATE COMPANY'S PICKUP STATUS
// ======================================
router.patch('/pickups/:id/status', companyAuth, verifiedCompany, async (req,res) => {
  try {
    const { transitionPickup } = require('../services/pickupTransitions');
    const result = await transitionPickup({id:req.params.id,companyId:req.companyId,status:req.body.status,verifiedWeight:req.body.verifiedWeight});
    return res.json({message:'Pickup updated successfully',...result});
  } catch(error) {
    if (error.status) return res.status(error.status).json({error:error.message});
    console.error('Pickup transition failed:',error);
    return res.status(500).json({error:'Unable to update pickup'});
  }
});

module.exports = router;
