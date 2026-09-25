const express = require('express');
const router = express.Router();

const RecyclingCompany = require('../models/RecyclingCompany');
const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const companyAuth = require('../middleware/companyAuth');


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
router.patch('/pickups/:id/status', companyAuth, async (req, res) => {
  try {
    const {
      status,
      verifiedWeight
    } = req.body;

    const allowedStatuses = [
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

    // IMPORTANT:
    // Find the pickup only if it belongs
    // to the logged-in company.
    const pickup = await PickupRequest.findOne({
      _id: req.params.id,
      company: req.companyId
    });

    if (!pickup) {
      return res.status(404).json({
        error:
          'Pickup request not found or not assigned to this company'
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
    // COMPLETE PICKUP + AWARD POINTS
    // ==================================
    if (status === 'completed') {

      const numericWeight = Number(
        verifiedWeight
      );

      if (
        Number.isNaN(numericWeight) ||
        numericWeight <= 0
      ) {
        return res.status(400).json({
          error:
            'A valid verified weight is required to complete the pickup'
        });
      }

      if (pickup.pointsProcessed) {
        return res.status(400).json({
          error:
            'Points have already been awarded for this pickup'
        });
      }

      const pointsEarned =
        Math.round(numericWeight * 10);

      const user = await User.findById(
        pickup.user
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      user.points =
        (user.points || 0) + pointsEarned;

      await user.save();

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
        'user',
        'name email'
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
      'user',
      'name email'
    );

    res.json({
      message:
        `Pickup status updated to ${status}`,

      pickup
    });

  } catch (error) {

    console.error(
      'Company update pickup status error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });
  }
});


module.exports = router;
