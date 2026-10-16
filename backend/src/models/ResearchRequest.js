import mongoose from 'mongoose';
import { opts, attributionSchema } from './_shared.js';

const schema = new mongoose.Schema(
  {
    serviceSlug: { type: String, required: true, index: true },
    academicLevel: { type: String, enum: ['undergraduate', 'masters', 'doctoral', 'professional', 'other'], required: true },
    discipline: { type: String, required: true },
    institution: String,
    topic: { type: String, required: true },
    requirements: { type: String, required: true },
    deadline: { type: Date, required: true },
    supportMode: { type: String, enum: ['sessions', 'written_feedback', 'both'], default: 'both' },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Upload' }],
    integrityAcknowledged: { type: Boolean, required: true },
    status: { type: String, enum: ['new', 'reviewing', 'quoted', 'in_progress', 'completed', 'declined', 'closed'], default: 'new', index: true },
    quoteAmount: Number,
    internalNotes: String,
    firstRespondedAt: Date,
    attribution: attributionSchema,
    isDemo: { type: Boolean, default: false },
  },
  opts,
);
export default mongoose.model('ResearchRequest', schema);
