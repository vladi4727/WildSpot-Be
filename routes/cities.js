// cities.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /cities — return all supported cities (sorted by country & name)
router.get('/', async (req, res) => {
  try {
    // Fetch cityId, name, and countryName from DB
    const cities = await prisma.cities.findMany({
      select: {
        cityId: true,
        name: true,
        countryName: true,
      },
      orderBy: [
        { countryName: 'asc' },
        { name: 'asc' }
      ]
    });

    // Format the response for frontend use
    const formattedCities = cities.map(city => ({
      id: city.cityId,
      name: city.name,
      country: city.countryName,
    }));

    res.status(200).json({
      success: true,
      cities: formattedCities
    });

  } catch (err) {
    console.error('GET /cities error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
