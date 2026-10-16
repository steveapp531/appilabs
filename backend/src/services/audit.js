import AuditLog from '../models/AuditLog.js';
import logger from '../lib/logger.js';

export async function audit(req, action, entity, entityId, meta) {
  try {
    await AuditLog.create({ actor: req.user?.id, actorEmail: req.user?.email, action, entity, entityId: entityId && String(entityId), meta, ip: req.ip });
  } catch (err) {
    logger.error({ err: err.message }, 'Audit log write failed');
  }
}
