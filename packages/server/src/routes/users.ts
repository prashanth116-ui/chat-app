import { Router, type IRouter } from 'express';
import * as userService from '../services/userService.js';
import * as gdprService from '../services/gdprService.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { updateProfileSchema, changePasswordSchema } from '../utils/validators.js';

const router: IRouter = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/me', async (req, res) => {
  try {
    const user = await userService.getUserById(req.user!.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/me', validate(updateProfileSchema), async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user!.userId, req.body);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === 'Username already taken') {
      res.status(409).json({ error: error.message });
    } else {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
});

router.put('/me/password', validate(changePasswordSchema), async (req, res) => {
  try {
    await userService.changePassword(
      req.user!.userId,
      req.body.currentPassword,
      req.body.newPassword
    );
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Current password is incorrect') {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      res.json([]);
      return;
    }
    const users = await userService.searchUsers(q);
    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getPublicUser(req.params.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// === GDPR Routes ===

// Export user data
router.get('/me/export', async (req, res) => {
  try {
    const data = await gdprService.exportUserData(req.user!.userId);
    res.json(data);
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

// Get deletion status
router.get('/me/deletion', async (req, res) => {
  try {
    const status = await gdprService.getDeletionStatus(req.user!.userId);
    res.json(status);
  } catch (error) {
    console.error('Get deletion status error:', error);
    res.status(500).json({ error: 'Failed to get deletion status' });
  }
});

// Request account deletion
router.post('/me/delete', async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    if (!password || !confirmation) {
      res.status(400).json({ error: 'Password and confirmation required' });
      return;
    }

    const result = await gdprService.requestAccountDeletion(
      req.user!.userId,
      password,
      confirmation
    );
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Password is incorrect' || error.message === 'Invalid confirmation text') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Request deletion error:', error);
        res.status(500).json({ error: 'Failed to request account deletion' });
      }
    } else {
      res.status(500).json({ error: 'Failed to request account deletion' });
    }
  }
});

// Cancel account deletion
router.delete('/me/delete', async (req, res) => {
  try {
    await gdprService.cancelAccountDeletion(req.user!.userId);
    res.json({ message: 'Account deletion cancelled' });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    res.status(500).json({ error: 'Failed to cancel account deletion' });
  }
});

export default router;
