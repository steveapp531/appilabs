import path from 'node:path';
import multer from 'multer';
import env from '../config/env.js';
import { ApiError } from '../lib/http.js';

// Allowed types: extension -> accepted MIME types and a magic-number check on the buffer.
const PK = (b) => b[0] === 0x50 && b[1] === 0x4b; // zip container (docx, xlsx, pptx)
const OLE = (b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0; // legacy office
const PDF = (b) => b.slice(0, 4).toString() === '%PDF';
const TEXT = (b) => !b.slice(0, 1024).includes(0);

export const ALLOWED = {
  '.pdf': { mimes: ['application/pdf'], check: PDF },
  '.docx': { mimes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], check: PK },
  '.doc': { mimes: ['application/msword'], check: OLE },
  '.xlsx': { mimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], check: PK },
  '.xls': { mimes: ['application/vnd.ms-excel'], check: OLE },
  '.pptx': { mimes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'], check: PK },
  '.csv': { mimes: ['text/csv', 'application/vnd.ms-excel', 'text/plain'], check: TEXT },
  '.txt': { mimes: ['text/plain'], check: TEXT },
  '.sav': { mimes: ['application/octet-stream', 'application/x-spss-sav'], check: () => true },
};

export const uploadFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: env.UPLOAD_MAX_FILES, fields: 40, fieldSize: 20000 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const rule = ALLOWED[ext];
    if (!rule || !rule.mimes.includes(file.mimetype)) {
      return cb(new ApiError(415, 'unsupported_file', `${file.originalname} is not an accepted file type. Use PDF, Word, Excel, PowerPoint, CSV or text.`));
    }
    cb(null, true);
  },
}).array('files', env.UPLOAD_MAX_FILES);

export function verifyFileContents(files = []) {
  for (const f of files) {
    const rule = ALLOWED[path.extname(f.originalname).toLowerCase()];
    if (!rule || !rule.check(f.buffer)) {
      throw new ApiError(415, 'unsupported_file', `${f.originalname} does not match its file type.`);
    }
  }
}

// Multipart forms send everything as strings; parse JSON-encoded fields when present.
export function parseMultipartJson(req, _res, next) {
  if (req.is('multipart/form-data') && typeof req.body?.payload === 'string') {
    try {
      req.body = JSON.parse(req.body.payload);
    } catch {
      return next(ApiError.badRequest('payload must be valid JSON'));
    }
  }
  next();
}
