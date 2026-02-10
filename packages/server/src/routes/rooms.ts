import { Router, type IRouter } from 'express';
import * as roomService from '../services/roomService.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validation.js';
import { createRoomSchema, paginationSchema } from '../utils/validators.js';
import * as CountryModel from '../models/Country.js';

const router: IRouter = Router();

// Get all countries
router.get('/locations/countries', async (_req, res) => {
  try {
    const countries = await CountryModel.getAllCountries();
    res.json(countries);
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ error: 'Failed to get countries' });
  }
});

// Get states for a country
router.get('/locations/countries/:id/states', async (req, res) => {
  try {
    const countryId = parseInt(req.params.id, 10);
    const states = await CountryModel.getStatesByCountry(countryId);
    res.json(states);
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({ error: 'Failed to get states' });
  }
});

// List rooms (public access with optional auth)
router.get('/', optionalAuth, validateQuery(paginationSchema), async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const countryId = req.query.countryId ? parseInt(req.query.countryId as string, 10) : undefined;
    const stateId = req.query.stateId ? parseInt(req.query.stateId as string, 10) : undefined;

    const rooms = await roomService.getRooms({ countryId, stateId, limit, offset });
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to get rooms' });
  }
});

// Get room by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const room = await roomService.getRoomWithDetails(req.params.id);

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

// Create room (requires auth)
router.post('/', authMiddleware, validate(createRoomSchema), async (req, res) => {
  try {
    const room = await roomService.createRoom(req.body, req.user!.userId);
    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get rooms by country code
router.get('/country/:code', optionalAuth, validateQuery(paginationSchema), async (req, res) => {
  try {
    const country = await CountryModel.getCountryByCode(req.params.code);

    if (!country) {
      res.status(404).json({ error: 'Country not found' });
      return;
    }

    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const rooms = await roomService.getRooms({ countryId: country.id, limit, offset });
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms by country error:', error);
    res.status(500).json({ error: 'Failed to get rooms' });
  }
});

// Get online users in room
router.get('/:id/users', authMiddleware, async (req, res) => {
  try {
    const users = await roomService.getOnlineUsersInRoom(req.params.id);
    res.json(users);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ error: 'Failed to get online users' });
  }
});

export default router;
