import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { s3Enabled, uploadFile, deleteFile } from '../config/s3.js';
import * as AttachmentModel from '../models/Attachment.js';
import * as UserModel from '../models/User.js';
import type { Attachment } from '../models/Attachment.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf', 'text/plain'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const AVATAR_SIZE = 256;

export function isUploadEnabled(): boolean {
  return s3Enabled;
}

export async function uploadAvatar(
  userId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (!s3Enabled) {
    throw new Error('File uploads are not configured');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error('Invalid image type. Allowed: JPEG, PNG, GIF, WebP');
  }

  if (buffer.length > MAX_AVATAR_SIZE) {
    throw new Error('Image too large. Maximum size: 2MB');
  }

  // Process and resize image
  const processedBuffer = await sharp(buffer)
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toBuffer();

  const key = `avatars/${userId}/${randomUUID()}.jpg`;
  const url = await uploadFile(key, processedBuffer, 'image/jpeg');

  // Update user's avatar URL
  await UserModel.updateUser(userId, { avatarUrl: url });

  return url;
}

export async function uploadAttachment(
  uploaderId: string,
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<Attachment> {
  if (!s3Enabled) {
    throw new Error('File uploads are not configured');
  }

  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    throw new Error('File type not allowed');
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size: 10MB');
  }

  // Generate unique key
  const ext = fileName.split('.').pop() || 'bin';
  const key = `attachments/${uploaderId}/${randomUUID()}.${ext}`;

  // If it's an image, resize it
  let processedBuffer = buffer;
  let processedType = mimeType;

  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    const metadata = await sharp(buffer).metadata();
    if (metadata.width && metadata.width > 1920) {
      processedBuffer = await sharp(buffer)
        .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      processedType = 'image/jpeg';
    }
  }

  const url = await uploadFile(key, processedBuffer, processedType);

  // Create attachment record
  const attachment = await AttachmentModel.createAttachment({
    uploaderId,
    fileName,
    fileType: processedType,
    fileSize: processedBuffer.length,
    s3Key: key,
    url,
  });

  return attachment;
}

export async function deleteAttachment(attachmentId: string, userId: string): Promise<void> {
  const attachment = await AttachmentModel.getAttachmentById(attachmentId);
  if (!attachment) {
    throw new Error('Attachment not found');
  }

  if (attachment.uploaderId !== userId) {
    throw new Error('Not authorized to delete this attachment');
  }

  await deleteFile(attachment.s3Key);
  await AttachmentModel.deleteAttachment(attachmentId);
}
