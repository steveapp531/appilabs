export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  static badRequest(msg = 'Bad request', details) { return new ApiError(400, 'bad_request', msg, details); }
  static unauthorized(msg = 'Authentication required') { return new ApiError(401, 'unauthorized', msg); }
  static forbidden(msg = 'You do not have permission to do this') { return new ApiError(403, 'forbidden', msg); }
  static notFound(msg = 'Not found') { return new ApiError(404, 'not_found', msg); }
  static conflict(msg = 'Conflict') { return new ApiError(409, 'conflict', msg); }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const send = (res, data, { status = 200, meta } = {}) =>
  res.status(status).json(meta ? { data, meta } : { data });
