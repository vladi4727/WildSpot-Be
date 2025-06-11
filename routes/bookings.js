const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();
const prisma = new PrismaClient();

// POST /bookings
// Book a camping spot for a date range, only if it's available
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { spotId, startDate, endDate } = req.body;
    const userId = req.user.userId;

    if (!spotId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: spotId, startDate, and endDate are needed.'
      });
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format.'
      });
    }

    if (parsedStart > parsedEnd) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date.'
      });
    }

    const conflict = await prisma.bookings.findFirst({
      where: {
        spotId: parseInt(spotId),
        AND: [
          { startDate: { lte: parsedEnd } },
          { endDate: { gte: parsedStart } }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'This camping spot is already booked during the selected dates.'
      });
    }

    const booking = await prisma.bookings.create({
      data: {
        userId,
        spotId: parseInt(spotId),
        startDate: parsedStart,
        endDate: parsedEnd
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      bookingId: booking.bookingId
    });

  } catch (err) {
    console.error('POST /bookings error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /bookings/my
// Returns all bookings for the logged-in user
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.bookings.findMany({
      where: { userId: req.user.userId },
      select: {
        bookingId: true,
        startDate: true,
        endDate: true,
        campingSpot: {
          select: {
            spotId: true,
            city: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({ bookings });
  } catch (err) {
    console.error('GET /bookings/my error:', err);
    res.status(500).json({ message: 'Failed to fetch your bookings.' });
  }
});

module.exports = router;
