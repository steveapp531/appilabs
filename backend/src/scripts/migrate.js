import { connectDb, disconnectDb } from '../config/db.js';
import { runMigrations } from '../migrations/runner.js';

await connectDb();
await runMigrations();
await disconnectDb();
