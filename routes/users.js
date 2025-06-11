const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /users/me
 * Returns info about the logged-in user.
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { userId: req.user.userId },
      select: {
        userId: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        birthDate: true,
        bookings: {
          select: {
            bookingId: true,
            createdAt: true,
            campingSpots: {
              select: {
                spotId: true,
                description: true,
                streetAddress: true,
                imageURL: true
              }
            },
            reviews: {
              select: {
                rating: true,
                comment: true,
                createdAt: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('GET /users/me error:', err);
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
});

/**
 * DELETE /users/me
 * Deletes user and related data
 */
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.$transaction(async (tx) => {
      const bookings = await tx.bookings.findMany({ where: { userId } });

      for (const booking of bookings) {
        await tx.reviews.deleteMany({ where: { bookingId: booking.bookingId } });
      }

      await tx.bookings.deleteMany({ where: { userId } });
      await tx.users.delete({ where: { userId } });
    });

    res.status(200).json({ success: true, message: 'User and related data deleted' });
  } catch (err) {
    console.error('DELETE /users/me error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

/**
 * PATCH /users/me
 * Updates user profile
 */
router.patch('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email, password, firstName, lastName, phoneNumber, birthDate } = req.body;

    const updateData = {};
    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.users.update({
      where: { userId },
      data: updateData,
      select: {
        userId: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        birthDate: true
      }
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('PATCH /users/me error:', err);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

module.exports = router;
