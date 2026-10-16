import mongoose from 'mongoose';

export const attributionSchema = new mongoose.Schema(
  {
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,
    referrer: String,
    landingPage: String,
    referralCode: String,
  },
  { _id: false },
);

export const seoSchema = new mongoose.Schema({ title: String, description: String }, { _id: false });

export const opts = { timestamps: true, versionKey: false, toJSON: { virtuals: true } };
