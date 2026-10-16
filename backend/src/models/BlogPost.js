import mongoose from 'mongoose';
import { opts, seoSchema } from './_shared.js';

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    previousSlugs: { type: [String], index: true, default: [] },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    body: { type: String, required: true }, // Markdown subset
    tags: [String],
    author: String,
    coverImage: String,
    readingMinutes: Number,
    status: { type: String, enum: ['published', 'draft'], default: 'draft', index: true },
    publishedAt: Date,
    isDemo: { type: Boolean, default: false },
    seo: seoSchema,
  },
  opts,
);
export default mongoose.model('BlogPost', schema);
