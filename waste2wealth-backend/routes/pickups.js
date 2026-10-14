const express = require('express');
const router = express.Router();

const PickupRequest = require('../models/PickupRequest');
const RecyclingCompany = require('../models/RecyclingCompany');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');



// ======================================
// CREATE PICKUP REQUEST
// ======================================
router.post('/', auth, async (req, res) => {
  try {
    const {
      companyId,
      material,
      estimatedWeight,
      pickupAddress,
      city,
      state,
      phone,
      preferredDate,
      notes
    } = req.body;

    if (
      !companyId ||
      !material ||
      !estimatedWeight ||
      !pickupAddress ||
      !city ||
      !state ||
      !phone ||
      !preferredDate
    ) {
      return res.status(400).json({
        error: 'Required pickup information is missing'
      });
    }

    const numericWeight = Number(estimatedWeight);

    if (
      Number.isNaN(numericWeight) ||
      numericWeight <= 0
    ) {
      return res.status(400).json({
        error: 'Estimated weight must be greater than 0'
      });
    }

    const company = await RecyclingCompany.findById(
      companyId
    );

    if (!company) {
      return res.status(404).json({
        error: 'Recycling company not found'
      });
    }

    if (!company.verified || !company.accountActive) return res.status(403).json({ error: 'Only verified active companies can receive pickups' });
    if (!company.pickupAvailable) {
      return res.status(400).json({
        error: 'Pickup is not available for this company'
      });
    }

    if (
      !company.materialsAccepted.some(
        (acceptedMaterial) =>
          acceptedMaterial.toLowerCase() ===
          material.toLowerCase()
      )
    ) {
      return res.status(400).json({
        error:
          'This recycling company does not accept the selected material'
      });
    }

    const pickup = new PickupRequest({
      user: req.userId,
      company: companyId,
      material,
      estimatedWeight: numericWeight,
      pickupAddress,
      city,
      state,
      phone,
      preferredDate,
      notes
    });

    await pickup.save();

    await pickup.populate(
      'company',
      'companyName phone address city state'
    );

    res.status(201).json({
      message: 'Pickup request created successfully',
      pickup
    });

  } catch (error) {
    console.error('Create pickup error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
});


// ======================================
// GET LOGGED-IN USER'S PICKUPS
// ======================================
router.get('/', auth, async (req, res) => {
  try {
    const pickups = await PickupRequest.find({
      user: req.userId
    })
      .populate(
        'company',
        'companyName phone address city state'
      )
      .sort({ createdAt: -1 });

    res.json(pickups);

  } catch (error) {
    console.error('Get pickups error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
});

// ======================================
// UPDATE PICKUP STATUS
// COMPLETE + AWARD POINTS
// ======================================

router.patch('/:id/status', adminAuth, async (req,res) => {
  try {
    const { transitionPickup } = require('../services/pickupTransitions');
    const result = await transitionPickup({id:req.params.id,status:req.body.status,verifiedWeight:req.body.verifiedWeight,admin:true});
    return res.json({message:'Pickup updated successfully',...result});
  } catch(error) {
    if (error.status) return res.status(error.status).json({error:error.message});
    console.error('Pickup transition failed:',error);
    return res.status(500).json({error:'Unable to update pickup'});
  }
});

module.exports = router;
