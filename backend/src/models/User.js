import mongoose from 'mongoose';
import { opts } from './_shared.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['owner', 'admin', 'editor'], default: 'editor' },
    active: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  opts,
);
schema.set('toJSON', { transform: (_d, r) => { delete r.passwordHash; return r; } });
export default mongoose.model('User', schema);
