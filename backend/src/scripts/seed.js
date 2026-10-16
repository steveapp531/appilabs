// Usage: npm run seed            -> catalogue content + settings (never overwrites admin edits)
//        npm run seed -- --demo  -> also sample leads, bookings, enrollments, research requests, events
import { connectDb, disconnectDb } from '../config/db.js';
import { runMigrations } from '../migrations/runner.js';
import { seedContent, seedDemoPipeline } from './seedData.js';

async function main() {
  await connectDb();
  await runMigrations();
  console.log('Content seeded (new records):', await seedContent());
  if (process.argv.includes('--demo')) {
    await seedDemoPipeline();
    console.log('Demo pipeline records seeded (marked isDemo, names prefixed "Demo:").');
  }
  await disconnectDb();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
