// Creates (or resets the password of) an owner account from the command line.
// Usage: npm run create-admin
//   or non-interactively: ADMIN_EMAIL=... ADMIN_NAME=... ADMIN_PASSWORD=... npm run create-admin
import readline from 'node:readline/promises';
import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../config/db.js';
import { User } from '../models/index.js';

async function ask(rl, q, fallback) {
  if (fallback) return fallback;
  return (await rl.question(q)).trim();
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const name = await ask(rl, 'Name: ', process.env.ADMIN_NAME);
  const email = (await ask(rl, 'Email: ', process.env.ADMIN_EMAIL)).toLowerCase();
  const password = await ask(rl, 'Password (min 10 characters): ', process.env.ADMIN_PASSWORD);
  rl.close();
  if (!email.includes('@') || password.length < 10 || name.length < 2) throw new Error('Provide a name, a valid email and a password of at least 10 characters.');
  await connectDb();
  const passwordHash = await bcrypt.hash(password, 12);
  await User.updateOne({ email }, { $set: { name, email, passwordHash, role: 'owner', active: true } }, { upsert: true });
  console.log(`Owner account ready: ${email}`);
  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err.message);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
