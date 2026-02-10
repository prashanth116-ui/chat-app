import { Router, type IRouter } from 'express';
import * as roomService from '../services/roomService.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validation.js';
import { createRoomSchema, paginationSchema } from '../utils/validators.js';
import * as CountryModel from '../models/Country.js';
import * as RoomModel from '../models/Room.js';
import * as RoomBanModel from '../models/RoomBan.js';
import * as RoomInviteModel from '../models/RoomInvite.js';

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

// Search rooms
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      res.json([]);
      return;
    }
    const rooms = await RoomModel.searchRooms(q);
    res.json(rooms);
  } catch (error) {
    console.error('Search rooms error:', error);
    res.status(500).json({ error: 'Failed to search rooms' });
  }
});

// === Moderation Routes ===

// Kick user from room
router.post('/:roomId/kick/:userId', authMiddleware, async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const currentUserRole = await RoomModel.getMemberRole(roomId, req.user!.userId);

    if (!currentUserRole || currentUserRole === 'member') {
      res.status(403).json({ error: 'Not authorized to kick users' });
      return;
    }

    const targetRole = await RoomModel.getMemberRole(roomId, userId);
    if (targetRole === 'owner' || (targetRole === 'admin' && currentUserRole !== 'owner')) {
      res.status(403).json({ error: 'Cannot kick this user' });
      return;
    }

    await RoomModel.removeRoomMember(roomId, userId);
    res.json({ message: 'User kicked' });
  } catch (error) {
    console.error('Kick user error:', error);
    res.status(500).json({ error: 'Failed to kick user' });
  }
});

// Ban user from room
router.post('/:roomId/ban/:userId', authMiddleware, async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const { reason, duration } = req.body;
    const currentUserRole = await RoomModel.getMemberRole(roomId, req.user!.userId);

    if (!currentUserRole || currentUserRole === 'member') {
      res.status(403).json({ error: 'Not authorized to ban users' });
      return;
    }

    const targetRole = await RoomModel.getMemberRole(roomId, userId);
    if (targetRole === 'owner' || (targetRole === 'admin' && currentUserRole !== 'owner')) {
      res.status(403).json({ error: 'Cannot ban this user' });
      return;
    }

    const expiresAt = duration ? new Date(Date.now() + duration * 1000) : undefined;

    await RoomModel.removeRoomMember(roomId, userId);
    await RoomBanModel.createBan({
      roomId,
      userId,
      bannedBy: req.user!.userId,
      reason,
      expiresAt,
    });

    res.json({ message: 'User banned' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Unban user from room
router.delete('/:roomId/ban/:userId', authMiddleware, async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const currentUserRole = await RoomModel.getMemberRole(roomId, req.user!.userId);

    if (!currentUserRole || currentUserRole === 'member') {
      res.status(403).json({ error: 'Not authorized to unban users' });
      return;
    }

    await RoomBanModel.removeBan(roomId, userId);
    res.json({ message: 'User unbanned' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// Get room bans
router.get('/:roomId/bans', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserRole = await RoomModel.getMemberRole(roomId, req.user!.userId);

    if (!currentUserRole || currentUserRole === 'member') {
      res.status(403).json({ error: 'Not authorized to view bans' });
      return;
    }

    const bans = await RoomBanModel.getRoomBans(roomId);
    res.json(bans);
  } catch (error) {
    console.error('Get bans error:', error);
    res.status(500).json({ error: 'Failed to get bans' });
  }
});

// Update member role
router.put('/:roomId/members/:userId/role', authMiddleware, async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const { role } = req.body;
    const currentUserRole = await RoomModel.getMemberRole(roomId, req.user!.userId);

    if (currentUserRole !== 'owner') {
      res.status(403).json({ error: 'Only owner can change roles' });
      return;
    }

    if (role !== 'admin' && role !== 'member') {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    await RoomModel.updateMemberRole(roomId, userId, role);
    res.json({ message: 'Role updated' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// === Invite Routes ===

// Create invite
router.post('/:roomId/invites', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { maxUses, expiresIn } = req.body;
    const currentUserRole = await RoomModel.getMemberRole(roomId, req.user!.userId);

    if (!currentUserRole || currentUserRole === 'member') {
      res.status(403).json({ error: 'Not authorized to create invites' });
      return;
    }

    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

    const invite = await RoomInviteModel.createInvite({
      roomId,
      createdBy: req.user!.userId,
      maxUses,
      expiresAt,
    });

    res.status(201).json(invite);
  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

// Get room invites
router.get('/:roomId/invites', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserRole = await RoomModel.getMemberRole(roomId, req.user!.userId);

    if (!currentUserRole || currentUserRole === 'member') {
      res.status(403).json({ error: 'Not authorized to view invites' });
      return;
    }

    const invites = await RoomInviteModel.getRoomInvites(roomId);
    res.json(invites);
  } catch (error) {
    console.error('Get invites error:', error);
    res.status(500).json({ error: 'Failed to get invites' });
  }
});

// Delete invite
router.delete('/:roomId/invites/:inviteId', authMiddleware, async (req, res) => {
  try {
    const { roomId, inviteId } = req.params;
    const currentUserRole = await RoomModel.getMemberRole(roomId, req.user!.userId);

    if (!currentUserRole || currentUserRole === 'member') {
      res.status(403).json({ error: 'Not authorized to delete invites' });
      return;
    }

    const invite = await RoomInviteModel.findInviteById(inviteId);
    if (!invite || invite.roomId !== roomId) {
      res.status(404).json({ error: 'Invite not found' });
      return;
    }

    await RoomInviteModel.deleteInvite(inviteId);
    res.json({ message: 'Invite deleted' });
  } catch (error) {
    console.error('Delete invite error:', error);
    res.status(500).json({ error: 'Failed to delete invite' });
  }
});

// Join room via invite code
router.post('/invites/:code/join', authMiddleware, async (req, res) => {
  try {
    const { code } = req.params;
    const invite = await RoomInviteModel.findInviteByCode(code);

    if (!invite) {
      res.status(404).json({ error: 'Invalid or expired invite' });
      return;
    }

    const isBanned = await RoomBanModel.isBanned(invite.roomId, req.user!.userId);
    if (isBanned) {
      res.status(403).json({ error: 'You are banned from this room' });
      return;
    }

    const isMember = await RoomModel.isRoomMember(invite.roomId, req.user!.userId);
    if (!isMember) {
      await RoomModel.addRoomMember(invite.roomId, req.user!.userId, 'member');
      await RoomInviteModel.incrementUseCount(code);
    }

    const room = await roomService.getRoomWithDetails(invite.roomId);
    res.json(room);
  } catch (error) {
    console.error('Join via invite error:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

export default router;
