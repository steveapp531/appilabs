import mongoose from 'mongoose';
import { opts, attributionSchema } from './_shared.js';

const schema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    courseSlug: { type: String, index: true },
    courseTitle: String,
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: String,
    organization: String,
    experienceLevel: String,
    goals: String,
    status: { type: String, enum: ['interested', 'pending_payment', 'paid', 'cancelled', 'completed'], default: 'interested', index: true },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'GHS' },
    paymentReference: { type: String, index: true },
    paidAt: Date,
    internalNotes: String,
    attribution: attributionSchema,
    isDemo: { type: Boolean, default: false },
  },
  opts,
);
export default mongoose.model('Enrollment', schema);
