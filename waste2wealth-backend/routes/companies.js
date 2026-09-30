const express = require('express');
const router = express.Router();

const RecyclingCompany = require('../models/RecyclingCompany');
const auth = require('../middleware/auth');


// ======================================
// ADD A RECYCLING COMPANY
// ======================================
router.post('/', auth, async (req, res) => {
  try {
    const {
      companyName,
      email,
      phone,
      address,
      city,
      state,
      latitude,
      longitude,
      materialsAccepted,
      pickupAvailable
    } = req.body;

    if (
      !companyName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        error: 'Required company information is missing'
      });
    }

    const company = new RecyclingCompany({
      companyName,
      email,
      phone,
      address,
      city,
      state,
      latitude,
      longitude,
      materialsAccepted,
      pickupAvailable
    });

    await company.save();

    res.status(201).json({
      message: 'Recycling company added successfully',
      company
    });

  } catch (error) {
    console.error('Add company error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
});


// ======================================
// SEARCH / GET RECYCLING COMPANIES
// WITH LOCATION DISTANCE
// ======================================
router.get('/', auth, async (req, res) => {
  try {
    const {
  companyName,
  city,
  state,
  material,
  pickupAvailable,
  latitude,
  longitude
} = req.query;

    const filter = {};

    if (companyName) {
      filter.companyName = new RegExp(companyName, 'i');
    }

    if (city) {
      filter.city = new RegExp(city, 'i');
    }

    if (state) {
      filter.state = new RegExp(state, 'i');
    }

    if (material) {
      filter.materialsAccepted = new RegExp(material, 'i');
    }

    if (pickupAvailable !== undefined) {
      filter.pickupAvailable =
        pickupAvailable === 'true';
    }

    const companies = await RecyclingCompany.find(filter).select('-password');
    
    // If user latitude and longitude are not provided,
    // return the companies normally.
    if (!latitude || !longitude) {
      const sortedCompanies = companies.sort((a, b) =>
        a.companyName.localeCompare(b.companyName)
      );

      return res.json(sortedCompanies);
    }

    const userLat = Number(latitude);
    const userLng = Number(longitude);

    if (
      Number.isNaN(userLat) ||
      Number.isNaN(userLng)
    ) {
      return res.status(400).json({
        error: 'Invalid latitude or longitude'
      });
    }

    // Haversine formula
    const calculateDistance = (
      lat1,
      lon1,
      lat2,
      lon2
    ) => {
      const earthRadius = 6371;

      const toRadians = (degree) =>
        degree * (Math.PI / 180);

      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) *
          Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c =
        2 *
        Math.atan2(
          Math.sqrt(a),
          Math.sqrt(1 - a)
        );

      return earthRadius * c;
    };

    const companiesWithDistance = companies
      .map((company) => {
        if (
          company.latitude == null ||
          company.longitude == null
        ) {
          return {
            ...company.toObject(),
            distanceKm: null
          };
        }

        const distance = calculateDistance(
          userLat,
          userLng,
          Number(company.latitude),
          Number(company.longitude)
        );

        return {
          ...company.toObject(),
          distanceKm: Number(distance.toFixed(2))
        };
      })
      .sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;

        return a.distanceKm - b.distanceKm;
      });

    res.json(companiesWithDistance);

  } catch (error) {
    console.error('Get companies error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
});

module.exports = router;
