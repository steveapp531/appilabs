import path from 'node:path';
import crypto from 'node:crypto';
import env from '../config/env.js';
import Upload from '../models/Upload.js';
import { getStorage } from './storage/index.js';
import { verifyFileContents } from '../middleware/upload.js';
import logger from '../lib/logger.js';

export async function storeFiles(files = [], ownerType) {
  if (!files.length) return [];
  verifyFileContents(files);
  const storage = await getStorage();
  const expiresAt = new Date(Date.now() + env.UPLOAD_RETENTION_DAYS * 86400000);
  const docs = [];
  for (const f of files) {
    const key = `${ownerType.toLowerCase()}/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}${path.extname(f.originalname).toLowerCase()}`;
    await storage.put(key, f.buffer, f.mimetype);
    docs.push(
      await Upload.create({
        key,
        originalName: f.originalname.slice(0, 200),
        mimeType: f.mimetype,
        size: f.size,
        ownerType,
        expiresAt,
      }),
    );
  }
  return docs;
}

export async function attachOwner(uploads, ownerId) {
  if (!uploads.length) return;
  await Upload.updateMany({ _id: { $in: uploads.map((u) => u._id) } }, { ownerId });
}

export async function purgeExpiredUploads() {
  const storage = await getStorage();
  const expired = await Upload.find({ expiresAt: { $lte: new Date() }, deletedAt: null });
  for (const u of expired) {
    try {
      await storage.remove(u.key);
      u.deletedAt = new Date();
      await u.save();
    } catch (err) {
      logger.error({ err: err.message, key: u.key }, 'Failed to purge upload');
    }
  }
  return expired.length;
}
