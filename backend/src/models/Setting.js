import mongoose from 'mongoose';
import { opts } from './_shared.js';

const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'site' },
    businessName: String,
    email: String,
    phone: String,
    whatsapp: String,
    address: String,
    city: String,
    country: String,
    hours: String,
    serviceAreas: [String],
    socials: { linkedin: String, x: String, github: String, youtube: String },
    showPrices: { type: Boolean, default: true },
    bookingEnabled: { type: Boolean, default: true },
    announcement: String,
  },
  opts,
);
export default mongoose.model('Setting', schema);
