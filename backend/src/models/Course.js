import mongoose from 'mongoose';
import { opts, seoSchema } from './_shared.js';

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    previousSlugs: { type: [String], index: true, default: [] },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    description: String,
    level: String,
    format: String,
    duration: String,
    price: { type: Number, default: 0 }, // minor units; 0 = free or quote
    currency: { type: String, default: 'GHS' },
    isDemoPrice: Boolean,
    audience: { type: String, enum: ['individual', 'corporate', 'both'], default: 'both' },
    outcomes: [String],
    prerequisites: [String],
    modules: [{ _id: false, title: String, topics: [String] }],
    nextCohort: String,
    seats: Number,
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
    isDemo: { type: Boolean, default: false },
    seo: seoSchema,
  },
  opts,
);
export default mongoose.model('Course', schema);
