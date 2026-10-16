import mongoose from 'mongoose';
import { opts, attributionSchema } from './_shared.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    company: String,
    pillar: { type: String, enum: ['solutions', 'consulting', 'academy', 'general'], default: 'general' },
    topic: String,
    preferredDates: [Date],
    timezone: { type: String, default: 'Africa/Accra' },
    mode: { type: String, enum: ['video', 'phone', 'in_person'], default: 'video' },
    notes: String,
    status: { type: String, enum: ['requested', 'confirmed', 'completed', 'cancelled'], default: 'requested', index: true },
    scheduledAt: { type: Date, index: true },
    internalNotes: String,
    attribution: attributionSchema,
    isDemo: { type: Boolean, default: false },
  },
  opts,
);
export default mongoose.model('Booking', schema);
