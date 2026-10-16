import mongoose from 'mongoose';
import { opts, seoSchema } from './_shared.js';

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    previousSlugs: { type: [String], index: true, default: [] },
    title: { type: String, required: true },
    pillar: { type: String, enum: ['solutions', 'consulting', 'academy'] },
    sector: String,
    summary: String,
    challenge: String,
    approach: [String],
    deliverables: [String],
    result: String, // only real, client-approved results
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    isDemo: { type: Boolean, default: false },
    seo: seoSchema,
  },
  opts,
);
export default mongoose.model('CaseStudy', schema);
