// Minimal, ordered, idempotent migration runner for MongoDB.
// Each file in this folder named NNN-description.js exports `up()`. Applied names are stored in `_migrations`.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import mongoose from 'mongoose';

const dir = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations({ log = console.log } = {}) {
  const col = mongoose.connection.db.collection('_migrations');
  const applied = new Set((await col.find({}).toArray()).map((m) => m.name));
  const files = (await fs.readdir(dir)).filter((f) => /^\d{3}-.+\.js$/.test(f)).sort();
  const ran = [];
  for (const file of files) {
    if (applied.has(file)) continue;
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    await mod.up(mongoose.connection.db);
    await col.insertOne({ name: file, appliedAt: new Date() });
    ran.push(file);
    log(`Applied migration ${file}`);
  }
  if (!ran.length) log('Migrations up to date');
  return ran;
}
