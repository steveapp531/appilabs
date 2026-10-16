# Security

## Reporting

Email the address in Admin > Settings with the subject "Security". Please do not open public issues for vulnerabilities.

## Controls in place

| Area | Control |
| --- | --- |
| Passwords | bcrypt (cost 12), minimum 10 characters, constant-time login (dummy hash when the user does not exist), generic error message |
| Sessions | 15 minute JWT access token in memory; 7 day refresh token in an httpOnly, Secure, SameSite cookie scoped to `/api/v1/auth`, stored as a SHA-256 hash, rotated on every use, revoked on logout and password change |
| CSRF | Cookie endpoints require a custom header and an allowed Origin; all other endpoints use bearer tokens, which browsers do not send automatically |
| Authorization | Roles: owner (everything), admin (content and customer data), editor (content only). Checked on every admin route |
| First admin | No default credentials. Created by CLI, or once in the browser with a one-time `SETUP_TOKEN`, refused once any user exists |
| Input | Zod validation on every write; keys starting with `$` or containing `.` removed (MongoDB operator injection); body size limits; honeypot fields on public forms |
| Rate limits | Reads 3000 and writes 300 per 15 minutes per IP; public forms 20; login and setup 10 |
| Headers | Helmet defaults on the API; HSTS, nosniff, frame denial, referrer and permissions policies on the site (`vercel.json`) |
| CORS | Explicit allowlist from `CORS_ORIGINS`, credentials only for listed origins |
| Errors | Internal errors return a generic message plus a request ID; details go only to logs |
| Logging | Structured logs with request IDs; authorization headers, cookies, API keys, passwords and tokens redacted |
| Payments | Server-side verification with Paystack before marking anything paid; amount and currency checks; HMAC SHA-512 webhook signatures; idempotent processing; no card data touches the platform |
| Uploads | Allowlist of extensions and MIME types, file signature checks, size and count limits, random storage keys, private bucket, authenticated and audited downloads, `Content-Disposition: attachment`, automatic deletion after the retention period |
| CSV export | Cells beginning with `= + - @` are escaped to prevent formula injection |
| Audit | Sign-ins, setup, exports, file downloads and every admin create, update and delete are logged with actor and IP |
| Automation | Separate API key compared in constant time, read-only endpoints except upload purge |
| Privacy | Analytics load only after consent; attribution stored in session storage only; demo data clearly flagged |

## Secrets

- Never commit `.env` files. Only `.env.example` files are tracked.
- Production secrets live in Render and Vercel environment settings. `render.yaml` generates `JWT_SECRET` and `AUTOMATION_API_KEY`.
- The API refuses to start in production without a 32+ character `JWT_SECRET`, and refuses `PAYMENT_PROVIDER=paystack` without a key.
- Rotate `JWT_SECRET` to sign everyone out; rotate `AUTOMATION_API_KEY` in both the API and the cron job together.

## Data retention

- Uploaded files: deleted after `UPLOAD_RETENTION_DAYS` (default 180) by a daily job, or immediately when the parent record is deleted in the admin.
- Enquiries: delete on request from the admin (owner or admin role). Exports are audited.
- Backups: MongoDB Atlas provides automated snapshots on paid tiers. On the free tier, schedule `mongodump` (see DEPLOYMENT.md).

## Before go-live

- Remove `SETUP_TOKEN` after creating the owner account.
- Set `COOKIE_SECURE=true` and serve both site and API over HTTPS, ideally on the same registrable domain (`appilabs.com` and `api.appilabs.com`).
- Use `PAYMENT_PROVIDER=paystack` or `none`, never `mock`.
- Use a private bucket for uploads (`STORAGE_DRIVER=s3`).
- Restrict MongoDB Atlas network access as tightly as your hosting allows, and use a database user limited to the `appilabs` database.
