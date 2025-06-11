const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// POST /availabilities/:spotId
// Adds a new availability time slot for a specific camping spot
router.post('/:spotId', authenticateToken, async (req, res) => {
  try {
    const spotId = parseInt(req.params.spotId);
    const userId = req.user.userId;
    const { dateFrom, dateTo } = req.body;

    // Check that the camping spot belongs to the current user
    const spot = await prisma.campingSpots.findUnique({
      where: { spotId },
      select: { userId: true }
    });

    if (!spot || spot.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized or invalid spot.' });
    }

    const newAvailability = await prisma.availabilities.create({
      data: {
        spotId,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo)
      }
    });

    res.status(201).json({ message: 'Availability added.', availability: newAvailability });

  } catch (err) {
    console.error('POST /availabilities error:', err);
    res.status(500).json({ message: 'Failed to add availability.' });
  }
});

// GET /availabilities/:spotId
// Gets all availabilities for a specific camping spot
router.get('/:spotId', async (req, res) => {
  try {
    const spotId = parseInt(req.params.spotId);

    const data = await prisma.availabilities.findMany({
      where: { spotId },
      orderBy: { dateFrom: 'asc' }
    });

    res.status(200).json({ availabilities: data });
  } catch (err) {
    console.error('GET /availabilities error:', err);
    res.status(500).json({ message: 'Failed to fetch availabilities.' });
  }
});

module.exports = router;
