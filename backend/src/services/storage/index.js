import env from '../../config/env.js';
import * as local from './local.js';

// Storage interface: put(key, buffer, mimeType), get(key) -> Readable stream, remove(key)
let s3;
export async function getStorage() {
  if (env.STORAGE_DRIVER === 's3') {
    s3 ??= await import('./s3.js');
    return s3;
  }
  return local;
}
