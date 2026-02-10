import { Router, type IRouter } from 'express';
import * as userService from '../services/userService.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { updateProfileSchema } from '../utils/validators.js';

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

export default router;
