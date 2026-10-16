import { ZodError } from 'zod';
import mongoose from 'mongoose';
import multer from 'multer';
import { ApiError } from '../lib/http.js';
import logger from '../lib/logger.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.path} not found`));
}

export function errorHandler(err, req, res, _next) {
  let status = 500;
  let code = 'internal_error';
  let message = 'Something went wrong on our side. The error has been logged.';
  let details;

  if (err instanceof ApiError) {
    ({ status, code, message, details } = err);
  } else if (err instanceof ZodError) {
    status = 422;
    code = 'validation_error';
    message = 'Some fields need attention.';
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 422;
    code = 'validation_error';
    message = 'Some fields need attention.';
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = 'invalid_id';
    message = 'Invalid identifier.';
  } else if (err?.code === 11000) {
    status = 409;
    code = 'duplicate';
    message = 'A record with this value already exists.';
    details = Object.keys(err.keyValue || {}).map((path) => ({ path, message: 'Already in use' }));
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    code = 'upload_error';
    message = err.code === 'LIMIT_FILE_SIZE' ? 'One of the files is too large.' : err.message;
  } else if (err?.type === 'entity.too.large') {
    status = 413;
    code = 'payload_too_large';
    message = 'Request body is too large.';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    code = 'invalid_json';
    message = 'Request body is not valid JSON.';
  }

  if (status >= 500) logger.error({ err, reqId: req.id }, 'Unhandled error');
  res.status(status).json({ error: { code, message, details, requestId: req.id } });
}
