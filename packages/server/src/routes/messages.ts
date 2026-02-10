import { Router, type IRouter } from 'express';
import * as messageService from '../services/messageService.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validation.js';
import { paginationSchema } from '../utils/validators.js';

const router: IRouter = Router();

// All message routes require authentication
router.use(authMiddleware);

// Get messages for a room (paginated)
router.get('/rooms/:roomId/messages', validateQuery(paginationSchema), async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const before = req.query.before as string | undefined;

    const messages = await messageService.getMessages(req.params.roomId, {
      limit,
      offset,
      before,
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;
