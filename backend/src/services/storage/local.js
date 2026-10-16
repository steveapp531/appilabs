import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import env from '../../config/env.js';

const root = () => path.resolve(env.STORAGE_LOCAL_DIR);
const resolveKey = (key) => {
  const full = path.resolve(root(), key);
  if (!full.startsWith(root() + path.sep)) throw new Error('Invalid storage key');
  return full;
};

export async function put(key, buffer) {
  const full = resolveKey(key);
  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, buffer, { mode: 0o600 });
}
export async function get(key) {
  return fs.createReadStream(resolveKey(key));
}
export async function remove(key) {
  await fsp.rm(resolveKey(key), { force: true });
}
