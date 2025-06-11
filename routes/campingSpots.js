const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();
const prisma = new PrismaClient();

// GET /spots
router.get('/', async (req, res) => {
  try {
    const {
      cityIds,
      styleIds,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    let where = {};

    if (cityIds) {
      const cityIdArray = Array.isArray(cityIds) ? cityIds : [cityIds];
      const parsedCityIds = cityIdArray.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (parsedCityIds.length > 0) {
        where.cityId = { in: parsedCityIds };
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      where.owner = {
        OR: [
          { firstName: { contains: searchLower } },
          { lastName: { contains: searchLower } }
        ]
      };
    }

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

    const totalSpots = await prisma.campingSpots.count({ where });
    const totalPages = Math.ceil(totalSpots / limitNum);

    const spots = await prisma.campingSpots.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        spotId: true,
        cityId: true,
        city: {
          select: {
            name: true,
            countryName: true
          }
        },
        userId: true,
        owner: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        description: true,
        streetAddress: true,
        instagramLink: true,
        portfolioLink: true,
        imageURL: true,
        spotstyles: {
          select: {
            style: {
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

    const formattedSpots = spots.map(spot => ({
      spotId: spot.spotId,
      userId: spot.owner.userId,
      firstName: spot.owner.firstName,
      lastName: spot.owner.lastName,
      email: spot.owner.email,
      city: spot.city ? {
        id: spot.cityId,
        name: spot.city.name,
        country: spot.city.countryName
      } : null,
      description: spot.description,
      address: spot.streetAddress,
      social: {
        instagram: spot.instagramLink,
        portfolio: spot.portfolioLink
      },
      imageURL: spot.imageURL,
      styles: spot.spotstyles.map(as => ({
        id: as.style.styleId,
        name: as.style.styleName
      }))
    }));

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
router.get('/:id', async (req, res) => {
  try {
    const spotId = parseInt(req.params.id);
    if (isNaN(spotId)) {
      return res.status(400).json({ success: false, message: 'Invalid spot ID format' });
    }

    const spot = await prisma.campingSpots.findUnique({
      where: { spotId },
      select: {
        spotId: true,
        userId: true,
        owner: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        city: {
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
            style: {
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
      return res.status(404).json({ success: false, message: 'Camping spot not found' });
    }

    const formattedSpot = {
      spotId: spot.spotId,
      user: {
        userId: spot.owner.userId,
        firstName: spot.owner.firstName,
        lastName: spot.owner.lastName,
        email: spot.owner.email,
        phoneNumber: spot.owner.phoneNumber
      },
      location: spot.city ? {
        cityId: spot.city.cityId,
        city: spot.city.name,
        country: spot.city.countryName,
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
        id: as.style.styleId,
        name: as.style.styleName,
        description: as.style.description
      }))
    };

    res.status(200).json({ success: true, spot: formattedSpot });

  } catch (err) {
    console.error('GET /spots/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch spot details' });
  }
});

module.exports = router;
