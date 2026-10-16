import { API_URL } from './config.js';

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error?.message || `Request failed (${status})`);
    this.status = status;
    this.code = body?.error?.code;
    this.details = body?.error?.details || [];
  }
}

async function request(path, { method = 'GET', body, headers = {}, token, signal, raw = false } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  let res;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: {
        ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, { error: { code: 'network', message: 'We could not reach the server. Check your connection and try again.' } });
  }
  if (raw) {
    if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
    return res;
  }
  if (res.status === 204) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json);
  return json;
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  request,
};

/** Sends JSON, or multipart with a `payload` field when files are attached. */
export function submitWithFiles(path, payload, files = []) {
  if (!files?.length) return api.post(path, payload);
  const fd = new FormData();
  fd.append('payload', JSON.stringify(payload));
  for (const f of files) fd.append('files', f);
  return api.post(path, fd);
}

/** Maps server validation details onto react-hook-form fields. Returns a general message. */
export function applyServerErrors(err, setError) {
  if (err instanceof ApiError && err.details?.length) {
    for (const d of err.details) if (d.path) setError(d.path, { type: 'server', message: d.message });
  }
  return err?.message || 'Something went wrong. Please try again.';
}
