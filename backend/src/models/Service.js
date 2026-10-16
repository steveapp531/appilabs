import mongoose from 'mongoose';
import { opts, seoSchema } from './_shared.js';

const pricing = new mongoose.Schema(
  {
    model: { type: String, enum: ['quote', 'from', 'fixed', 'retainer'], default: 'quote' },
    amount: Number, // minor units
    currency: { type: String, default: 'GHS' },
    interval: String,
    isDemoPrice: Boolean,
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    previousSlugs: { type: [String], index: true, default: [] },
    pillar: { type: String, enum: ['solutions', 'consulting', 'academy'], required: true, index: true },
    track: { type: String, enum: ['training', 'research', null], default: null },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    outcome: String,
    description: String,
    deliverables: [String],
    useCases: [String],
    pricing: { type: pricing, default: () => ({}) },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
    isDemo: { type: Boolean, default: false },
    seo: seoSchema,
  },
  opts,
);
export default mongoose.model('Service', schema);
