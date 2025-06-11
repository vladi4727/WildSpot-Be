const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * POST /reviews
 * Authenticated users can leave a review after a booking.
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bookingId, rating, comment } = req.body;

    // Check if the booking exists and belongs to the user
    const booking = await prisma.bookings.findUnique({
      where: { bookingId },
      include: { users: true }
    });

    if (!booking || booking.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Invalid booking or not your booking.' });
    }

    // Create the review
    const review = await prisma.reviews.create({
      data: {
        userId,
        bookingId,
        rating,
        comment
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review
    });
  } catch (err) {
    console.error('POST /reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

module.exports = router;
