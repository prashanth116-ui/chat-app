import { Router, type IRouter } from 'express';
import multer from 'multer';
import * as uploadService from '../services/uploadService.js';
import { authMiddleware } from '../middleware/auth.js';

const router: IRouter = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.use(authMiddleware);

// Check if uploads are enabled
router.get('/status', (_req, res) => {
  res.json({ enabled: uploadService.isUploadEnabled() });
});

// Upload avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!uploadService.isUploadEnabled()) {
      res.status(503).json({ error: 'File uploads are not configured' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const url = await uploadService.uploadAvatar(
      req.user!.userId,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ url });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Avatar upload error:', error);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }
});

// Upload file attachment
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!uploadService.isUploadEnabled()) {
      res.status(503).json({ error: 'File uploads are not configured' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const attachment = await uploadService.uploadAttachment(
      req.user!.userId,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json(attachment);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
});

// Delete attachment
router.delete('/:attachmentId', async (req, res) => {
  try {
    await uploadService.deleteAttachment(req.params.attachmentId, req.user!.userId);
    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Attachment not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Not authorized to delete this attachment') {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    } else {
      console.error('Delete attachment error:', error);
      res.status(500).json({ error: 'Failed to delete attachment' });
    }
  }
});

export default router;
