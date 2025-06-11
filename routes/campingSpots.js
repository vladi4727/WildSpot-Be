const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();
const prisma = new PrismaClient();

// GET /spots
// This endpoint retrieves all camping spots with optional filters like city, style, and search keywords.
// It also handles pagination.
router.get('/', async (req, res) => {
  try {
    const {
      cityIds,
      styleIds,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Validate and sanitize pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Initialize the filtering conditions
    let where = {};

    // Filter by city ID(s) if provided
    if (cityIds) {
      const cityIdArray = Array.isArray(cityIds) ? cityIds : [cityIds];
      const parsedCityIds = cityIdArray.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (parsedCityIds.length > 0) {
        where.cityId = { in: parsedCityIds };
      }
    }

    // Search by user name if a search query is provided
    if (search) {
      const searchLower = search.toLowerCase();
      where.users = {
        OR: [
          { firstName: { contains: searchLower } },
          { lastName: { contains: searchLower } }
        ]
      };
    }

    // Filter by style ID(s) if provided
    if (styleIds) {
      const styleIdArray = Array.isArray(styleIds) ? styleIds : [styleIds];
      const parsedStyleIds = styleIdArray.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (parsedStyleIds.length > 0) {
        where.spotstyles = {
          some: {
            styleId: { in: parsedStyleIds }
          }
        };
      }
    }

    // Count total matching camping spots for pagination
    const totalSpots = await prisma.campingSpots.count({ where });
    const totalPages = Math.ceil(totalSpots / limitNum);

    // Fetch the actual camping spots from the database
    const spots = await prisma.campingSpots.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        spotId: true,
        users: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        cityId: true,
        cities: {
          select: {
            name: true,
            countryName: true
          }
        },
        description: true,
        streetAddress: true,
        instagramLink: true,
        portfolioLink: true,
        imageURL: true,
        spotstyles: {
          select: {
            styles: {
              select: {
                styleId: true,
                styleName: true
              }
            }
          }
        }
      },
      orderBy: { spotId: 'desc' }
    });

    // Format the raw data into a clean, frontend-friendly structure
    const formattedSpots = spots.map(spot => ({
      spotId: spot.spotId,
      userId: spot.users.userId,
      firstName: spot.users.firstName,
      lastName: spot.users.lastName,
      email: spot.users.email,
      city: spot.cities ? {
        id: spot.cityId,
        name: spot.cities.name,
        country: spot.cities.countryName
      } : null,
      description: spot.description,
      address: spot.streetAddress,
      social: {
        instagram: spot.instagramLink,
        portfolio: spot.portfolioLink
      },
      imageURL: spot.imageURL,
      styles: spot.spotstyles.map(as => ({
        id: as.styles.styleId,
        name: as.styles.styleName
      }))
    }));

    // Send the result back with pagination metadata
    res.status(200).json({
      spots: formattedSpots,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalSpots,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error('GET /spots error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch camping spots' });
  }
});

// GET /spots/:id
// This endpoint fetches a single camping spot by ID with full detail, including owner info, city, styles, etc.
router.get('/:id', async (req, res) => {
  try {
    const spotId = parseInt(req.params.id);

    if (isNaN(spotId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid spot ID format'
      });
    }

    const spot = await prisma.campingSpots.findUnique({
      where: { spotId },
      select: {
        spotId: true,
        users: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        cities: {
          select: {
            cityId: true,
            name: true,
            countryName: true
          }
        },
        description: true,
        streetAddress: true,
        instagramLink: true,
        portfolioLink: true,
        imageURL: true,
        createdAt: true,
        spotstyles: {
          select: {
            styles: {
              select: {
                styleId: true,
                styleName: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Camping spot not found'
      });
    }

    // Format the output for frontend readability
    const formattedSpot = {
      spotId: spot.spotId,
      user: {
        userId: spot.users.userId,
        firstName: spot.users.firstName,
        lastName: spot.users.lastName,
        email: spot.users.email,
        phoneNumber: spot.users.phoneNumber
      },
      location: spot.cities ? {
        cityId: spot.cities.cityId,
        city: spot.cities.name,
        country: spot.cities.countryName,
        address: spot.streetAddress
      } : null,
      description: spot.description,
      social: {
        instagram: spot.instagramLink,
        portfolio: spot.portfolioLink
      },
      imageURL: spot.imageURL,
      createdAt: spot.createdAt,
      styles: spot.spotstyles.map(as => ({
        id: as.styles.styleId,
        name: as.styles.styleName,
        description: as.styles.description
      }))
    };

    res.status(200).json({ success: true, spot: formattedSpot });

  } catch (err) {
    console.error('GET /spots/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch spot details' });
  }
});

// PATCH /spots/:id
// This endpoint allows the owner to update their own camping spot.
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const spotId = parseInt(req.params.id);
    const userId = req.user.userId; // From JWT

    // Check if the spot exists and belongs to the user
    const existingSpot = await prisma.campingSpots.findUnique({
      where: { spotId },
      select: { userId: true }
    });

    if (!existingSpot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }
    if (existingSpot.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this spot' });
    }

    const {
      cityId,
      description,
      streetAddress,
      instagramLink,
      portfolioLink,
      imageURL,
      styleIds
    } = req.body;

    // Transaction: update spot + styles (if provided)
    const updatedSpot = await prisma.$transaction(async (prisma) => {
      const updateData = {};
      if (cityId) updateData.cityId = parseInt(cityId);
      if (description !== undefined) updateData.description = description;
      if (streetAddress !== undefined) updateData.streetAddress = streetAddress;
      if (instagramLink !== undefined) updateData.instagramLink = instagramLink;
      if (portfolioLink !== undefined) updateData.portfolioLink = portfolioLink;
      if (imageURL !== undefined) updateData.imageURL = imageURL;

      const spot = await prisma.campingSpots.update({
        where: { spotId },
        data: updateData,
        select: {
          spotId: true,
          cityId: true,
          cities: { select: { name: true, countryName: true } },
          description: true,
          streetAddress: true,
          instagramLink: true,
          portfolioLink: true,
          imageURL: true,
          users: { select: { firstName: true, lastName: true, email: true } }
        }
      });

      if (Array.isArray(styleIds)) {
        await prisma.spotstyles.deleteMany({ where: { spotId } });
        if (styleIds.length > 0) {
          const styleLinks = styleIds.map(styleId => ({ spotId, styleId: parseInt(styleId) }));
          await prisma.spotstyles.createMany({ data: styleLinks });
        }
      }

      return spot;
    });

    res.status(200).json({
      success: true,
      message: 'Spot updated successfully',
      spot: updatedSpot
    });

  } catch (err) {
    console.error('PATCH /spots/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to update spot' });
  }
});

// POST /spots
// This endpoint allows a logged-in user to create a new camping spot with optional styles.
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT after login
    const {
      cityId,
      description,
      streetAddress,
      instagramLink,
      portfolioLink,
      imageURL,
      styleIds
    } = req.body;

    // Start a transaction: create camping spot and link styles if provided
    const newSpot = await prisma.$transaction(async (prisma) => {
      const spot = await prisma.campingSpots.create({
        data: {
          userId,
          cityId: cityId ? parseInt(cityId) : undefined,
          description,
          streetAddress,
          instagramLink,
          portfolioLink,
          imageURL
        }
      });

      // If styles were included, link them in the spotstyles table
      if (Array.isArray(styleIds) && styleIds.length > 0) {
        const styleLinks = styleIds.map(styleId => ({
          spotId: spot.spotId,
          styleId: parseInt(styleId)
        }));
        await prisma.spotstyles.createMany({ data: styleLinks });
      }

      return spot;
    });

    res.status(201).json({
      success: true,
      message: 'Camping spot created successfully',
      spotId: newSpot.spotId
    });

  } catch (err) {
    console.error('POST /spots error:', err);
    res.status(500).json({ success: false, message: 'Failed to create camping spot' });
  }
});


module.exports = router;
