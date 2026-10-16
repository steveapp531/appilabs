import mongoose from 'mongoose';
import { attributionSchema } from './_shared.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    path: String,
    props: { type: mongoose.Schema.Types.Mixed },
    sessionId: String,
    attribution: attributionSchema,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);
export default mongoose.model('AnalyticsEvent', schema);
