import mongoose from 'mongoose';
import { opts, attributionSchema } from './_shared.js';

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: String,
    status: { type: String, enum: ['pending', 'active', 'unsubscribed'], default: 'pending', index: true },
    confirmTokenHash: { type: String, select: false },
    unsubscribeTokenHash: { type: String, select: false },
    source: String,
    consentAt: Date,
    confirmedAt: Date,
    unsubscribedAt: Date,
    attribution: attributionSchema,
  },
  opts,
);
export default mongoose.model('Subscriber', schema);
