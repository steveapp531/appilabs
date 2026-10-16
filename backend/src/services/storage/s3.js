// S3-compatible object storage (AWS S3, Cloudflare R2, Backblaze B2, DigitalOcean Spaces).
// The bucket must be PRIVATE. Files are only ever streamed through the authenticated admin API.
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import env from '../../config/env.js';

const client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT || undefined,
  forcePathStyle: Boolean(env.S3_ENDPOINT),
  credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
});

export async function put(key, buffer, mimeType) {
  await client.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: buffer, ContentType: mimeType }));
}
export async function get(key) {
  const out = await client.send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  return out.Body;
}
export async function remove(key) {
  await client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}
