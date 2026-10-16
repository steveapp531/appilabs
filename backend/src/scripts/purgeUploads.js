import { connectDb, disconnectDb } from '../config/db.js';
import { purgeExpiredUploads } from '../services/uploads.js';

await connectDb();
console.log(`Purged ${await purgeExpiredUploads()} expired uploads`);
await disconnectDb();
