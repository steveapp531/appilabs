// Minimal, ordered, idempotent migration runner for MongoDB.
// Each file in this folder named NNN-description.js exports `up()`. Applied names are stored in `_migrations`.
import mongoose from 'mongoose';
import * as syncIndexes from './001-sync-indexes.js';
import * as backfillLeadPillar from './002-backfill-lead-pillar.js';

const migrations = [
  { name: '001-sync-indexes.js', up: syncIndexes.up },
  { name: '002-backfill-lead-pillar.js', up: backfillLeadPillar.up },
];

export async function runMigrations({ log = console.log } = {}) {
  const col = mongoose.connection.db.collection('_migrations');
  const applied = new Set((await col.find({}).toArray()).map((m) => m.name));
  const ran = [];
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    await migration.up(mongoose.connection.db);
    await col.insertOne({ name: migration.name, appliedAt: new Date() });
    ran.push(migration.name);
    log(`Applied migration ${migration.name}`);
  }
  if (!ran.length) log('Migrations up to date');
  return ran;
}
