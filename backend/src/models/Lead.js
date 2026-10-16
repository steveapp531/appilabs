import mongoose from 'mongoose';
import { opts, attributionSchema } from './_shared.js';

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed'];

const schema = new mongoose.Schema(
  {
    type: { type: String, enum: ['contact', 'project', 'resource', 'corporate_training'], default: 'contact', index: true },
    pillar: { type: String, enum: ['solutions', 'consulting', 'academy', 'general'], default: 'general', index: true },
    serviceSlug: String,
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: String,
    company: String,
    message: String,
    goal: String,
    timeline: String,
    budget: String,
    teamSize: String,
    resourceSlug: String,
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Upload' }],
    status: { type: String, enum: LEAD_STATUSES, default: 'new', index: true },
    internalNotes: String,
    firstRespondedAt: Date,
    marketingConsent: { type: Boolean, default: false },
    attribution: attributionSchema,
    isDemo: { type: Boolean, default: false },
  },
  opts,
);
schema.index({ createdAt: -1 });
export default mongoose.model('Lead', schema);
