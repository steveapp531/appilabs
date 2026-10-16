import mongoose from 'mongoose';
import { opts } from './_shared.js';

const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    originalName: String,
    mimeType: String,
    size: Number,
    ownerType: { type: String, enum: ['Lead', 'ResearchRequest'] },
    ownerId: mongoose.Schema.Types.ObjectId,
    expiresAt: { type: Date, index: true },
    deletedAt: Date,
  },
  opts,
);
export default mongoose.model('Upload', schema);
