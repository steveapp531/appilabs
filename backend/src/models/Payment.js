import mongoose from 'mongoose';
import { opts } from './_shared.js';

const schema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    provider: { type: String, enum: ['mock', 'paystack'], required: true },
    purpose: { type: String, enum: ['enrollment'], default: 'enrollment' },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
    email: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'GHS' },
    status: { type: String, enum: ['initialized', 'success', 'failed', 'abandoned'], default: 'initialized', index: true },
    channel: String,
    providerTransactionId: String,
    processedEvents: { type: [String], default: [] },
    verifiedAt: Date,
    failureReason: String,
  },
  opts,
);
export default mongoose.model('Payment', schema);
