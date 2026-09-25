const express = require('express');
const router = express.Router();

const adminAuth = require('../middleware/adminAuth');

const User = require('../models/User');
const RecyclingCompany = require('../models/RecyclingCompany');
const PickupRequest = require('../models/PickupRequest');
const Redemption = require('../models/Redemption');


// ======================================
// ADMIN DASHBOARD OVERVIEW
// ======================================

router.get('/dashboard', adminAuth, async (req, res) => {
  try {

    // ----------------------------------
    // USERS
    // ----------------------------------

    const totalUsers = await User.countDocuments({
      role: { $ne: 'admin' }
    });


    // ----------------------------------
    // RECYCLING COMPANIES
    // ----------------------------------

    const totalCompanies =
      await RecyclingCompany.countDocuments();


    const verifiedCompanies =
      await RecyclingCompany.countDocuments({
        verified: true
      });


    const unverifiedCompanies =
      await RecyclingCompany.countDocuments({
        verified: false
      });


    // ----------------------------------
    // PICKUPS
    // ----------------------------------

    const totalPickups =
      await PickupRequest.countDocuments();


    const pendingPickups =
      await PickupRequest.countDocuments({
        status: 'pending'
      });


    const acceptedPickups =
      await PickupRequest.countDocuments({
        status: 'accepted'
      });


    const collectedPickups =
      await PickupRequest.countDocuments({
        status: 'collected'
      });


    const completedPickups =
      await PickupRequest.countDocuments({
        status: 'completed'
      });


    const cancelledPickups =
      await PickupRequest.countDocuments({
        status: 'cancelled'
      });


    // ----------------------------------
    // TOTAL VERIFIED WEIGHT
    // ----------------------------------

    const weightResult =
      await PickupRequest.aggregate([
        {
          $match: {
            status: 'completed',
            verifiedWeight: {
              $ne: null
            }
          }
        },
        {
          $group: {
            _id: null,
            totalWeight: {
              $sum: '$verifiedWeight'
            }
          }
        }
      ]);


    const totalVerifiedWeight =
      weightResult.length > 0
        ? weightResult[0].totalWeight
        : 0;


    // ----------------------------------
    // TOTAL POINTS AWARDED
    // ----------------------------------

    const pointsResult =
      await PickupRequest.aggregate([
        {
          $match: {
            pointsProcessed: true
          }
        },
        {
          $group: {
            _id: null,
            totalPoints: {
              $sum: '$pointsAwarded'
            }
          }
        }
      ]);


    const totalPointsAwarded =
      pointsResult.length > 0
        ? pointsResult[0].totalPoints
        : 0;


    // ----------------------------------
    // REDEMPTIONS
    // ----------------------------------

    const totalRedemptions =
      await Redemption.countDocuments();


    const pendingRedemptions =
      await Redemption.countDocuments({
        status: 'pending'
      });


    // ----------------------------------
    // RECENT PICKUPS
    // ----------------------------------

    const recentPickups =
      await PickupRequest.find()
        .populate(
          'user',
          'name email'
        )
        .populate(
          'company',
          'companyName city state'
        )
        .sort({
          createdAt: -1
        })
        .limit(5);


    // ----------------------------------
    // RESPONSE
    // ----------------------------------

    res.json({

      message:
        'Waste2Wealth Admin Dashboard',

      admin: {
        id: req.userId,
        role: req.userRole
      },

      statistics: {

        users: {
          total: totalUsers
        },

        companies: {
          total: totalCompanies,
          verified: verifiedCompanies,
          unverified: unverifiedCompanies
        },

        pickups: {
          total: totalPickups,
          pending: pendingPickups,
          accepted: acceptedPickups,
          collected: collectedPickups,
          completed: completedPickups,
          cancelled: cancelledPickups
        },

        recycling: {
          totalVerifiedWeightKg:
            totalVerifiedWeight,

          totalPointsAwarded:
            totalPointsAwarded
        },

        redemptions: {
          total: totalRedemptions,
          pending: pendingRedemptions
        }

      },

      recentPickups

    });


  } catch (error) {

    console.error(
      'Admin dashboard error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });

  }
});

// ======================================
// ADMIN - GET ALL USERS
// ======================================

router.get('/users', adminAuth, async (req, res) => {
  try {

    const users = await User.find({
      $or: [
        { role: 'user' },
        { role: { $exists: false } }
      ]
    })
      .select('-password')
      .sort({ createdAt: -1 });


    const usersWithStats = await Promise.all(

      users.map(async (user) => {

        const totalPickups =
          await PickupRequest.countDocuments({
            user: user._id
          });


        const completedPickups =
          await PickupRequest.countDocuments({
            user: user._id,
            status: 'completed'
          });


        const totalRedemptions =
          await Redemption.countDocuments({
            user: user._id
          });


        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          points: user.points || 0,
          createdAt: user.createdAt,

          activity: {
            totalPickups,
            completedPickups,
            totalRedemptions
          }
        };

      })

    );


    res.json({
      totalUsers: usersWithStats.length,
      users: usersWithStats
    });


  } catch (error) {

    console.error(
      'Admin users error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });

  }
});

// ======================================
// ADMIN - GET ALL RECYCLING COMPANIES
// ======================================

router.get('/companies', adminAuth, async (req, res) => {
  try {

    const companies = await RecyclingCompany
      .find()
      .sort({ createdAt: -1 });


    const companiesWithStats = await Promise.all(

      companies.map(async (company) => {

        const totalPickups =
          await PickupRequest.countDocuments({
            company: company._id
          });


        const pendingPickups =
          await PickupRequest.countDocuments({
            company: company._id,
            status: 'pending'
          });


        const completedPickups =
          await PickupRequest.countDocuments({
            company: company._id,
            status: 'completed'
          });


        return {
          _id: company._id,

          companyName: company.companyName,
          email: company.email,
          phone: company.phone,

          address: company.address,
          city: company.city,
          state: company.state,

          latitude: company.latitude,
          longitude: company.longitude,

          materialsAccepted:
            company.materialsAccepted || [],

          pickupAvailable:
            company.pickupAvailable,

          verified:
            company.verified,

          createdAt:
            company.createdAt,

          activity: {
            totalPickups,
            pendingPickups,
            completedPickups
          }
        };

      })

    );


    res.json({
      totalCompanies:
        companiesWithStats.length,

      companies:
        companiesWithStats
    });


  } catch (error) {

    console.error(
      'Admin companies error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });

  }
});


// ======================================
// ADMIN - VERIFY / UNVERIFY COMPANY
// ======================================

router.patch(
  '/companies/:id/verification',
  adminAuth,
  async (req, res) => {

    try {

      const { verified } = req.body;


      if (typeof verified !== 'boolean') {

        return res.status(400).json({
          error:
            'verified must be true or false'
        });

      }


      const company =
        await RecyclingCompany.findById(
          req.params.id
        );


      if (!company) {

        return res.status(404).json({
          error:
            'Recycling company not found'
        });

      }


      company.verified = verified;

      await company.save();


      res.json({

        message: verified
          ? 'Company verified successfully'
          : 'Company verification removed',

        company: {
          _id: company._id,
          companyName:
            company.companyName,
          email:
            company.email,
          verified:
            company.verified
        }

      });


    } catch (error) {

      console.error(
        'Company verification error:',
        error
      );


      // Invalid MongoDB ID
      if (error.name === 'CastError') {

        return res.status(400).json({
          error: 'Invalid company ID'
        });

      }


      res.status(500).json({
        error: 'Server error'
      });

    }

  }
);

// ======================================
// ADMIN - GET ALL PICKUP REQUESTS
// ======================================

router.get('/pickups', adminAuth, async (req, res) => {
  try {

    const pickups = await PickupRequest.find()
      .populate('user', 'name email points')
      .populate(
        'company',
        'companyName email phone city state verified'
      )
      .sort({ createdAt: -1 });

    const totalPickups = pickups.length;

    const pending = pickups.filter(
      (pickup) => pickup.status === 'pending'
    ).length;

    const accepted = pickups.filter(
      (pickup) => pickup.status === 'accepted'
    ).length;

    const collected = pickups.filter(
      (pickup) => pickup.status === 'collected'
    ).length;

    const completed = pickups.filter(
      (pickup) => pickup.status === 'completed'
    ).length;

    const cancelled = pickups.filter(
      (pickup) => pickup.status === 'cancelled'
    ).length;

    const totalVerifiedWeightKg = pickups
      .filter(
        (pickup) =>
          pickup.status === 'completed' &&
          pickup.verifiedWeight
      )
      .reduce(
        (total, pickup) =>
          total + Number(pickup.verifiedWeight),
        0
      );

    const totalPointsAwarded = pickups
      .filter((pickup) => pickup.pointsProcessed)
      .reduce(
        (total, pickup) =>
          total + Number(pickup.pointsAwarded || 0),
        0
      );

    res.json({
      summary: {
        totalPickups,
        pending,
        accepted,
        collected,
        completed,
        cancelled,
        totalVerifiedWeightKg,
        totalPointsAwarded
      },

      pickups
    });

  } catch (error) {

    console.error(
      'Admin pickups error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });

  }
});

// ======================================
// ADMIN - GET ALL REDEMPTIONS
// ======================================

router.get('/redemptions', adminAuth, async (req, res) => {
  try {
    const redemptions = await Redemption.find()
      .populate('user', 'name email points')
      .sort({ createdAt: -1 });

    const totalRedemptions = redemptions.length;

    const pending = redemptions.filter(
      (redemption) => redemption.status === 'pending'
    ).length;

    const completed = redemptions.filter(
      (redemption) => redemption.status === 'completed'
    ).length;

    const cancelled = redemptions.filter(
      (redemption) => redemption.status === 'cancelled'
    ).length;

    const totalPointsSpent = redemptions
      .filter((redemption) => redemption.status === 'completed')
      .reduce(
        (total, redemption) =>
          total + Number(redemption.pointsSpent || 0),
        0
      );

    res.json({
      summary: {
        totalRedemptions,
        pending,
        completed,
        cancelled,
        totalPointsSpent
      },
      redemptions
    });

  } catch (error) {
    console.error('Admin redemptions error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
});

// ======================================
// ADMIN - PLATFORM ANALYTICS
// ======================================

router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // ----------------------------------
    // USERS
    // ----------------------------------

    const totalUsers = await User.countDocuments({
      $or: [
        { role: 'user' },
        { role: { $exists: false } }
      ]
    });

    // ----------------------------------
    // RECYCLING COMPANIES
    // ----------------------------------

    const totalCompanies =
      await RecyclingCompany.countDocuments();

    const verifiedCompanies =
      await RecyclingCompany.countDocuments({
        verified: true
      });

    const unverifiedCompanies =
      await RecyclingCompany.countDocuments({
        verified: false
      });

    // ----------------------------------
    // PICKUPS
    // ----------------------------------

    const totalPickups =
      await PickupRequest.countDocuments();

    const pendingPickups =
      await PickupRequest.countDocuments({
        status: 'pending'
      });

    const acceptedPickups =
      await PickupRequest.countDocuments({
        status: 'accepted'
      });

    const collectedPickups =
      await PickupRequest.countDocuments({
        status: 'collected'
      });

    const completedPickups =
      await PickupRequest.countDocuments({
        status: 'completed'
      });

    const cancelledPickups =
      await PickupRequest.countDocuments({
        status: 'cancelled'
      });

    // ----------------------------------
    // VERIFIED RECYCLING WEIGHT
    // ----------------------------------

    const weightResult = await PickupRequest.aggregate([
      {
        $match: {
          status: 'completed',
          verifiedWeight: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalWeight: {
            $sum: '$verifiedWeight'
          }
        }
      }
    ]);

    const totalVerifiedWeightKg =
      weightResult.length > 0
        ? weightResult[0].totalWeight
        : 0;

    // ----------------------------------
    // POINTS AWARDED
    // ----------------------------------

    const pointsResult = await PickupRequest.aggregate([
      {
        $match: {
          pointsProcessed: true
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: {
            $sum: '$pointsAwarded'
          }
        }
      }
    ]);

    const totalPointsAwarded =
      pointsResult.length > 0
        ? pointsResult[0].totalPoints
        : 0;

    // ----------------------------------
    // REDEMPTIONS
    // ----------------------------------

    const totalRedemptions =
      await Redemption.countDocuments();

    const pendingRedemptions =
      await Redemption.countDocuments({
        status: 'pending'
      });

    const completedRedemptions =
      await Redemption.countDocuments({
        status: 'completed'
      });

    const cancelledRedemptions =
      await Redemption.countDocuments({
        status: 'cancelled'
      });

    const redeemedPointsResult =
      await Redemption.aggregate([
        {
          $match: {
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalPoints: {
              $sum: '$pointsSpent'
            }
          }
        }
      ]);

    const totalPointsRedeemed =
      redeemedPointsResult.length > 0
        ? redeemedPointsResult[0].totalPoints
        : 0;

    // ----------------------------------
    // PICKUP COMPLETION RATE
    // ----------------------------------

    const pickupCompletionRate =
      totalPickups > 0
        ? Number(
            (
              (completedPickups / totalPickups) *
              100
            ).toFixed(1)
          )
        : 0;

    // ----------------------------------
    // COMPANY VERIFICATION RATE
    // ----------------------------------

    const companyVerificationRate =
      totalCompanies > 0
        ? Number(
            (
              (verifiedCompanies / totalCompanies) *
              100
            ).toFixed(1)
          )
        : 0;

    // ----------------------------------
    // AVERAGE VERIFIED WEIGHT
    // ----------------------------------

    const averageVerifiedWeightKg =
      completedPickups > 0
        ? Number(
            (
              totalVerifiedWeightKg /
              completedPickups
            ).toFixed(2)
          )
        : 0;

    // ----------------------------------
    // RECENT ACTIVITY
    // ----------------------------------

    const recentPickups = await PickupRequest.find()
      .populate('user', 'name email')
      .populate(
        'company',
        'companyName city state'
      )
      .sort({ createdAt: -1 })
      .limit(5);

    const recentRedemptions = await Redemption.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // ----------------------------------
    // SEND ANALYTICS RESPONSE
    // ----------------------------------

    res.json({
      overview: {
        totalUsers,
        totalCompanies,
        totalPickups,
        totalRedemptions
      },

      companies: {
        total: totalCompanies,
        verified: verifiedCompanies,
        unverified: unverifiedCompanies,
        verificationRate:
          companyVerificationRate
      },

      pickups: {
        total: totalPickups,
        pending: pendingPickups,
        accepted: acceptedPickups,
        collected: collectedPickups,
        completed: completedPickups,
        cancelled: cancelledPickups,
        completionRate:
          pickupCompletionRate
      },

      recycling: {
        totalVerifiedWeightKg,
        averageVerifiedWeightKg,
        totalPointsAwarded
      },

      redemptions: {
        total: totalRedemptions,
        pending: pendingRedemptions,
        completed: completedRedemptions,
        cancelled: cancelledRedemptions,
        totalPointsRedeemed
      },

      recentActivity: {
        pickups: recentPickups,
        redemptions: recentRedemptions
      }
    });

  } catch (error) {
    console.error(
      'Admin analytics error:',
      error
    );

    res.status(500).json({
      error: 'Server error'
    });
  }
});

module.exports = router;