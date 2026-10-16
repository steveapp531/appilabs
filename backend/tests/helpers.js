import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { User } from '../src/models/index.js';

export const app = createApp();
export const api = () => request(app);

export async function loginAs(role = 'owner') {
  const email = `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.dev`;
  await User.create({ name: `Test ${role}`, email, role, passwordHash: await bcrypt.hash('correct-horse-battery', 4) });
  const res = await api().post('/api/v1/auth/login').send({ email, password: 'correct-horse-battery' });
  return { token: res.body.data.accessToken, cookie: res.headers['set-cookie'], email };
}
