# API reference

- Base URL: `https://<api-host>/api/v1`
- Interactive documentation: `https://<api-host>/api/docs` (OpenAPI spec at `/api/openapi.json`, source in `backend/openapi.yaml`)
- Success: `{ "data": ..., "meta": { "page", "limit", "total", "pages" } }` (meta on lists only)
- Error: `{ "error": { "code", "message", "details": [{ "path", "message" }], "requestId" } }`

| Status | Meaning |
| --- | --- |
| 200 / 201 / 202 / 204 | OK / created / accepted / no content |
| 308 | Content moved to a new slug (follow `Location`) |
| 400 | Bad request (invalid JSON or id) |
| 401 | Not signed in, token expired, or bad API key |
| 403 | Signed in but not allowed (role), or missing CSRF header |
| 404 | Not found |
| 409 | Duplicate (for example an email that already exists) |
| 413 / 415 | File too large / file type not accepted |
| 422 | Validation failed (see `details`) |
| 429 | Rate limited |
| 5xx | Server error (quote `requestId` when reporting) |

## System

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | Liveness, for uptime monitors and Render |
| GET | `/ready` | Database ping plus active integrations; 503 when the database is unavailable |

## Public content (cached)

| Method | Path | Query |
| --- | --- | --- |
| GET | `/services` | `pillar=solutions\|consulting\|academy`, `track=training\|research` |
| GET | `/services/:slug` | |
| GET | `/courses` | |
| GET | `/courses/:slug` | |
| GET | `/blog` | `page`, `limit`, `tag` |
| GET | `/blog/:slug` | |
| GET | `/case-studies`, `/case-studies/:slug` | |
| GET | `/settings/public` | Contact details and site flags |
| GET | `/resources` | Lead magnets |
| GET | `/sitemap-entries` | Published slugs (used by the frontend build) |

## Conversions (rate limited: 20 per 15 minutes per IP)

| Method | Path | Body |
| --- | --- | --- |
| POST | `/leads` | `type` (contact, project, corporate_training), `pillar`, `serviceSlug?`, `name`, `email`, `phone?`, `company?`, `message` or `goal`, `timeline?`, `budget?`, `teamSize?`, `marketingConsent?`, `attribution?`. JSON, or multipart with `payload` + up to 3 `files` |
| POST | `/bookings` | `name`, `email`, `phone?`, `company?`, `pillar`, `topic?`, `preferredDates[1..3]` (ISO), `mode` (video, phone, in_person), `notes?` |
| POST | `/enrollments` | `courseSlug`, `name`, `email`, `phone?`, `organization?`, `experienceLevel?`, `goals?`, `payNow?` (default true). Returns `payment.authorizationUrl` when payment is required |
| POST | `/research-requests` | Multipart: `payload` JSON (`serviceSlug`, `academicLevel`, `discipline`, `institution?`, `topic`, `requirements`, `deadline`, `supportMode`, `name`, `email`, `phone?`, `integrityAcknowledged: true`) plus `files` |
| POST | `/resources/:slug/request` | `name`, `email`, `marketingConsent?`. Returns `downloadUrl` |
| POST | `/newsletter/subscribe` | `email`, `consent: true`, `source?`. Double opt-in |
| POST | `/newsletter/confirm` | `token` |
| POST | `/newsletter/unsubscribe` | `email`, `token` |
| POST | `/events` | `name` (allowlisted), `path`, `props` (max 10 scalar values), `sessionId`, `attribution`. Sent only after analytics consent |

All public forms accept a hidden `website` honeypot field. If it is filled, the API responds as if successful but stores nothing.

Example:

```bash
curl -X POST https://api.appilabs.com/api/v1/leads \
  -H 'Content-Type: application/json' \
  -d '{"type":"project","pillar":"solutions","name":"Ama Mensah","email":"ama@example.com","goal":"Automate our weekly sales report"}'
```

## Payments

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/payments/verify/:reference` | Verifies with the provider, marks the enrollment paid. Safe to call repeatedly |
| POST | `/payments/webhook/paystack` | Raw JSON body, `x-paystack-signature` HMAC SHA-512. Idempotent |

## Authentication

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/auth/setup-status` | `{ needsSetup, setupEnabled }` |
| POST | `/auth/setup` | `setupToken`, `name`, `email`, `password`. Only when no users exist |
| POST | `/auth/login` | `email`, `password`. Returns `accessToken`, sets refresh cookie |
| POST | `/auth/refresh` | Header `X-Requested-With: appilabs`. Rotates the cookie, returns a new `accessToken` |
| POST | `/auth/logout` | Header `X-Requested-With: appilabs` |
| GET | `/auth/me` | Bearer token |
| POST | `/auth/change-password` | `currentPassword`, `newPassword`. Signs out other sessions |

## Admin (Bearer token)

Collections: `leads`, `bookings`, `enrollments`, `research-requests`, `subscribers`, `payments` (owner and admin), and `services`, `courses`, `blog`, `case-studies` (all roles; delete needs owner or admin).

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/admin/:collection` | `q` search, filters (`status`, `pillar`, `type`...), `page`, `limit`, `sort`, `format=csv` |
| GET | `/admin/:collection/:id` | |
| POST | `/admin/:collection` | Content collections only |
| PATCH | `/admin/:collection/:id` | Pipeline: `status`, `internalNotes`, `scheduledAt`, `quoteAmount`. Content: any field |
| DELETE | `/admin/:collection/:id` | Also deletes attached files |
| GET | `/admin/files/:id` | Private file download (audited) |
| GET | `/admin/dashboard` | Overview metrics |
| GET | `/admin/analytics?days=30` | Events, top pages, sources, campaigns |
| GET, PUT | `/admin/settings` | Business details and site flags |
| GET, POST | `/admin/users` | Owner only |
| PATCH | `/admin/users/:id` | `role`, `active`. Owner only |
| GET | `/admin/audit-logs` | `entity`, `page`, `limit` |

## Automation (header `X-API-Key`)

| Method | Path | Query |
| --- | --- | --- |
| GET | `/automation/stale-inquiries` | `hours` (default 48) |
| GET | `/automation/daily-summary` | `date=YYYY-MM-DD` (UTC, default today) |
| GET | `/automation/upcoming-bookings` | `days` (default 7) |
| GET | `/automation/enrollment-summary` | `days` (default 30) |
| GET | `/automation/weekly-activity` | |
| POST | `/automation/purge-uploads` | Deletes files past their retention date |
