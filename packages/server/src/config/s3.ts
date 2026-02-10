import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env.js';

export const s3Enabled = !!(env.S3_ENDPOINT && env.S3_ACCESS_KEY && env.S3_SECRET_KEY && env.S3_BUCKET);

export const s3Client = s3Enabled
  ? new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY!,
        secretAccessKey: env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    })
  : null;

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (!s3Client || !env.S3_BUCKET) {
    throw new Error('S3 is not configured');
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );

  return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`;
}

export async function deleteFile(key: string): Promise<void> {
  if (!s3Client || !env.S3_BUCKET) {
    throw new Error('S3 is not configured');
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    })
  );
}

export async function getSignedUploadUrl(key: string, contentType: string): Promise<string> {
  if (!s3Client || !env.S3_BUCKET) {
    throw new Error('S3 is not configured');
  }

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function getPublicUrl(key: string): string {
  return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`;
}
