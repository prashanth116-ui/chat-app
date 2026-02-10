import { Router, type IRouter } from 'express';
import * as dmService from '../services/dmService.js';
import { authMiddleware } from '../middleware/auth.js';

const router: IRouter = Router();

router.use(authMiddleware);

// Get all conversations
router.get('/', async (req, res) => {
  try {
    const conversations = await dmService.getConversations(req.user!.userId);
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get or create conversation with a user
router.post('/with/:userId', async (req, res) => {
  try {
    const conversation = await dmService.getOrCreateConversation(
      req.user!.userId,
      req.params.userId
    );
    res.json(conversation);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Cannot start conversation') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Create conversation error:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
      }
    } else {
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }
});

// Get single conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const conversation = await dmService.getConversation(
      req.params.conversationId,
      req.user!.userId
    );

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(conversation);
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authorized') {
      res.status(403).json({ error: error.message });
    } else {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to get conversation' });
    }
  }
});

// Get messages in a conversation
router.get('/:conversationId/messages', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const before = req.query.before as string | undefined;

    const messages = await dmService.getMessages(
      req.params.conversationId,
      req.user!.userId,
      limit,
      before
    );

    res.json(messages);
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authorized') {
      res.status(403).json({ error: error.message });
    } else {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  }
});

// Send message (REST fallback, prefer socket)
router.post('/:conversationId/messages', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const message = await dmService.sendDirectMessage(
      req.params.conversationId,
      req.user!.userId,
      content.trim()
    );

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Not authorized' || error.message === 'Cannot send message') {
        res.status(403).json({ error: error.message });
      } else if (error.message === 'Conversation not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
      }
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
});

// Edit message
router.put('/:conversationId/messages/:messageId', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const message = await dmService.editMessage(
      req.params.messageId,
      req.user!.userId,
      content.trim()
    );

    res.json(message);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Message not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Not authorized to edit this message') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Edit message error:', error);
        res.status(500).json({ error: 'Failed to edit message' });
      }
    } else {
      res.status(500).json({ error: 'Failed to edit message' });
    }
  }
});

// Delete message
router.delete('/:conversationId/messages/:messageId', async (req, res) => {
  try {
    await dmService.deleteMessage(req.params.messageId, req.user!.userId);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Message not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Not authorized to delete this message') {
        res.status(403).json({ error: error.message });
      } else {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
      }
    } else {
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
});

export default router;
