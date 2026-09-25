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

router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const {
      status,
      verifiedWeight
    } = req.body;

    const allowedStatuses = [
      'pending',
      'accepted',
      'collected',
      'completed',
      'cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid pickup status'
      });
    }

   const pickup = await PickupRequest.findById(
  req.params.id
);

if (!pickup) {
  return res.status(404).json({
    error: 'Pickup request not found'
  });
}


// ==================================
// VALIDATE STATUS TRANSITION
// ==================================

const allowedTransitions = {
  pending: ['accepted', 'cancelled'],
  accepted: ['collected', 'cancelled'],
  collected: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

const currentStatus = pickup.status;

if (
  !allowedTransitions[currentStatus] ||
  !allowedTransitions[currentStatus].includes(status)
) {
  return res.status(400).json({
    error:
      `Cannot change pickup status from ${currentStatus} to ${status}`
  });
}

    // ==================================
    // COMPLETING PICKUP
    // ==================================

    if (status === 'completed') {

      const numericWeight =
        Number(verifiedWeight);

      if (
        Number.isNaN(numericWeight) ||
        numericWeight <= 0
      ) {
        return res.status(400).json({
          error:
            'A valid verified weight is required to complete the pickup'
        });
      }


      // Prevent duplicate point awards
      if (pickup.pointsProcessed) {

        return res.status(400).json({
          error:
            'Points have already been awarded for this pickup'
        });

      }


      // Calculate points
      const pointsEarned =
        Math.round(numericWeight * 10);


      // Find user
      const user = await User.findById(
        pickup.user
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }


      // Add points to user
      user.points =
        (user.points || 0) + pointsEarned;

      await user.save();


      // Save verified pickup information
      pickup.verifiedWeight =
        numericWeight;

      pickup.pointsAwarded =
        pointsEarned;

      pickup.pointsProcessed =
        true;

      pickup.status =
        'completed';

      await pickup.save();


      await pickup.populate(
        'company',
        'companyName phone address city state'
      );


      return res.json({

        message:
          'Pickup completed and points awarded successfully',

        pickup,

        pointsEarned,

        totalPoints: user.points

      });
    }


    // ==================================
    // OTHER STATUS CHANGES
    // ==================================

    pickup.status = status;

    await pickup.save();


    await pickup.populate(
      'company',
      'companyName phone address city state'
    );


    res.json({

      message:
        `Pickup status updated to ${status}`,

      pickup

    });


  } catch (error) {

    console.error(
      'Update pickup status error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });

  }
});

module.exports = router;
