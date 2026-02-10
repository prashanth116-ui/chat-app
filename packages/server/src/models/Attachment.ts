import { query } from '../config/database.js';

interface AttachmentRow {
  id: string;
  uploader_id: string | null;
  file_name: string;
  file_type: string;
  file_size: string;
  s3_key: string;
  url: string;
  created_at: Date;
}

export interface Attachment {
  id: string;
  uploaderId: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  url: string;
  createdAt: string;
}

function rowToAttachment(row: AttachmentRow): Attachment {
  return {
    id: row.id,
    uploaderId: row.uploader_id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: parseInt(row.file_size),
    s3Key: row.s3_key,
    url: row.url,
    createdAt: row.created_at.toISOString(),
  };
}

export async function createAttachment(data: {
  uploaderId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  url: string;
}): Promise<Attachment> {
  const result = await query<AttachmentRow>(
    `INSERT INTO attachments (uploader_id, file_name, file_type, file_size, s3_key, url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.uploaderId, data.fileName, data.fileType, data.fileSize, data.s3Key, data.url]
  );

  return rowToAttachment(result.rows[0]);
}

export async function getAttachmentById(id: string): Promise<Attachment | null> {
  const result = await query<AttachmentRow>(
    'SELECT * FROM attachments WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) return null;
  return rowToAttachment(result.rows[0]);
}

export async function deleteAttachment(id: string): Promise<void> {
  await query('DELETE FROM attachments WHERE id = $1', [id]);
}
