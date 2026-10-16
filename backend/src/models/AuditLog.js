import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorEmail: String,
    action: { type: String, required: true },
    entity: String,
    entityId: String,
    meta: mongoose.Schema.Types.Mixed,
    ip: String,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);
export default mongoose.model('AuditLog', schema);
