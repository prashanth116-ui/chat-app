import { Router, type IRouter } from 'express';
import * as friendService from '../services/friendService.js';
import * as blockService from '../services/blockService.js';
import { authMiddleware } from '../middleware/auth.js';

const router: IRouter = Router();

router.use(authMiddleware);

// Get friends list
router.get('/', async (req, res) => {
  try {
    const friends = await friendService.getFriends(req.user!.userId);
    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// Get pending friend requests (received)
router.get('/requests', async (req, res) => {
  try {
    const requests = await friendService.getPendingRequests(req.user!.userId);
    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to get friend requests' });
  }
});

// Get sent friend requests
router.get('/requests/sent', async (req, res) => {
  try {
    const requests = await friendService.getSentRequests(req.user!.userId);
    res.json(requests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ error: 'Failed to get sent requests' });
  }
});

// Get friendship status with a user
router.get('/status/:userId', async (req, res) => {
  try {
    const status = await friendService.getFriendshipStatus(req.user!.userId, req.params.userId);
    res.json(status);
  } catch (error) {
    console.error('Get friendship status error:', error);
    res.status(500).json({ error: 'Failed to get friendship status' });
  }
});

// Send friend request
router.post('/request/:userId', async (req, res) => {
  try {
    const friendship = await friendService.sendFriendRequest(req.user!.userId, req.params.userId);
    res.status(201).json(friendship);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else if (
        error.message === 'Cannot send friend request to yourself' ||
        error.message === 'Cannot send friend request' ||
        error.message === 'Already friends' ||
        error.message === 'Friend request already sent'
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Send friend request error:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
      }
    } else {
      res.status(500).json({ error: 'Failed to send friend request' });
    }
  }
});

// Accept friend request
router.put('/:friendshipId/accept', async (req, res) => {
  try {
    const friendship = await friendService.acceptFriendRequest(req.params.friendshipId, req.user!.userId);
    res.json(friendship);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Friend request not found') {
        res.status(404).json({ error: error.message });
      } else if (
        error.message === 'Not authorized to accept this request' ||
        error.message === 'Friend request is no longer pending'
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Accept friend request error:', error);
        res.status(500).json({ error: 'Failed to accept friend request' });
      }
    } else {
      res.status(500).json({ error: 'Failed to accept friend request' });
    }
  }
});

// Decline friend request
router.delete('/:friendshipId/decline', async (req, res) => {
  try {
    await friendService.declineFriendRequest(req.params.friendshipId, req.user!.userId);
    res.json({ message: 'Friend request declined' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Friend request not found') {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Decline friend request error:', error);
      res.status(500).json({ error: 'Failed to decline friend request' });
    }
  }
});

// Cancel sent friend request
router.delete('/:friendshipId/cancel', async (req, res) => {
  try {
    await friendService.cancelFriendRequest(req.params.friendshipId, req.user!.userId);
    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Friend request not found') {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Cancel friend request error:', error);
      res.status(500).json({ error: 'Failed to cancel friend request' });
    }
  }
});

// Remove friend
router.delete('/:friendshipId', async (req, res) => {
  try {
    await friendService.removeFriend(req.params.friendshipId, req.user!.userId);
    res.json({ message: 'Friend removed' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Friendship not found') {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Remove friend error:', error);
      res.status(500).json({ error: 'Failed to remove friend' });
    }
  }
});

// Block user
router.post('/block/:userId', async (req, res) => {
  try {
    await blockService.blockUser(req.user!.userId, req.params.userId);
    res.status(201).json({ message: 'User blocked' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Cannot block yourself') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Block user error:', error);
        res.status(500).json({ error: 'Failed to block user' });
      }
    } else {
      res.status(500).json({ error: 'Failed to block user' });
    }
  }
});

// Unblock user
router.delete('/block/:userId', async (req, res) => {
  try {
    await blockService.unblockUser(req.user!.userId, req.params.userId);
    res.json({ message: 'User unblocked' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Get blocked users
router.get('/blocked', async (req, res) => {
  try {
    const blocked = await blockService.getBlockedUsers(req.user!.userId);
    res.json(blocked);
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ error: 'Failed to get blocked users' });
  }
});

// Check if user is blocked
router.get('/block/:userId', async (req, res) => {
  try {
    const isBlocked = await blockService.isBlocked(req.user!.userId, req.params.userId);
    res.json({ isBlocked });
  } catch (error) {
    console.error('Check block status error:', error);
    res.status(500).json({ error: 'Failed to check block status' });
  }
});

export default router;
