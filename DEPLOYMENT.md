# Deployment

Target setup: **frontend on Vercel**, **API and report job on Render**, **database on MongoDB Atlas**, **uploads on Cloudflare R2** (or any private S3-compatible bucket).

Recommended domains: `appilabs.com` (Vercel) and `api.appilabs.com` (Render). Keeping both on the same registrable domain means the admin refresh cookie is treated as first-party by browsers.

## 1. MongoDB Atlas

1. Create a project and a cluster (M0 free is fine to start; M10+ adds automated backups).
2. **Database Access:** create a user with read and write access to the `appilabs` database only.
3. **Network Access:** add Render's outbound IP addresses (Render dashboard > service > Connect > Outbound), or `0.0.0.0/0` while testing.
4. **Connect > Drivers:** copy the URI and add the database name:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/appilabs?retryWrites=true&w=majority`

## 2. Object storage (Cloudflare R2)

1. Create a bucket such as `appilabs-uploads`. Leave public access **off**.
2. Create an API token with Object Read and Write on that bucket.
3. Note the account endpoint `https://<account-id>.r2.cloudflarestorage.com`, access key and secret.

## 3. Render (API and daily reports)

1. Push the repository to GitHub.
2. Render > **New > Blueprint** > select the repository. Render reads `render.yaml` and proposes two services: `appilabs-api` (web) and `appilabs-reports` (cron).
3. Fill in the variables marked `sync: false`:

| Variable | Example |
| --- | --- |
| `MONGODB_URI` | Atlas URI from step 1 |
| `PUBLIC_SITE_URL` | `https://appilabs.com` |
| `API_PUBLIC_URL` | `https://api.appilabs.com` |
| `CORS_ORIGINS` | `https://appilabs.com,https://www.appilabs.com` (add the `*.vercel.app` preview URL while testing) |
| `SETUP_TOKEN` | long random string, remove after creating the owner |
| `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`, `SMTP_*` | from your email provider |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` first. Until Paystack is verified, set `PAYMENT_PROVIDER=none` |
| `S3_*` | from step 2 |
| `VERCEL_DEPLOY_HOOK_URL` | from step 4 (optional) |

4. Deploy. Check `https://<api>/api/v1/ready` shows `"database": "ok"` and the expected integrations. Migrations run automatically on start-up.
5. Open the service **Shell** and seed the catalogue:
   ```bash
   cd backend && npm run seed
   ```
   Do **not** use `--demo` in production.
6. Create the owner account from the same Shell with `npm run create-admin`, or through `/admin` using `SETUP_TOKEN`.
7. **Custom domain:** Settings > Custom Domains > `api.appilabs.com`, then add the CNAME at your DNS provider.
8. **Report job:** in `appilabs-reports`, set `APPILABS_API_URL` to the API URL and `APPILABS_AUTOMATION_API_KEY` to the value Render generated for `AUTOMATION_API_KEY` on the API. Set `REPORT_TO` and `SMTP_*`. Use "Trigger Run" to test.

Free Render web services sleep when idle and wake slowly. Use at least the Starter plan for a business site so forms respond instantly.

## 4. Vercel (frontend)

1. Vercel > **Add New > Project** > import the repository.
2. **Root Directory:** leave as the repository root. Build settings come from `vercel.json` (installs and builds `frontend/`, output `frontend/dist`, clean URLs, SPA fallback, security headers).
3. Environment variables (Production and Preview):

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://api.appilabs.com` |
| `VITE_SITE_URL` | `https://appilabs.com` |
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXX` (optional) |
| `VITE_GSC_VERIFICATION` | Search Console HTML tag content (optional) |

4. Deploy. The build log should say `Prerender: using live data from ...` and list the number of pages.
5. **Domains:** add `appilabs.com` and `www.appilabs.com`, and follow Vercel's DNS instructions.
6. **Deploy hook (optional):** Settings > Git > Deploy Hooks > create one for `main`, paste the URL into `VERCEL_DEPLOY_HOOK_URL` on Render.

## 5. Paystack

1. Dashboard > Settings > API Keys and Webhooks.
2. Webhook URL: `https://api.appilabs.com/api/v1/payments/webhook/paystack`
3. Callback URL: `https://appilabs.com/payment/callback`
4. Enroll in a course with a test card. Confirm: redirect to Paystack, return to "Payment confirmed", enrollment *Paid* in the admin, payment listed under Payments.
5. Switch to the live secret key only after this succeeds.

## 6. Search and analytics

1. Google Search Console: add the domain property, verify (DNS or `VITE_GSC_VERIFICATION`), submit `https://appilabs.com/sitemap.xml`.
2. Google Analytics 4: create a web stream, set `VITE_GA_MEASUREMENT_ID`, redeploy. Mark `form_submit`, `consultation_request` and `payment_success` as key events.
3. Google Business Profile: create a profile for AppiLabs in Accra with the same name, phone and website URL used in Admin > Settings.

## 7. Backups

- Atlas M10+: continuous backups are built in. Enable them.
- Atlas M0: run a scheduled `mongodump` (for example from a GitHub Action or a small machine) and store the archive in your R2 bucket:
  ```bash
  mongodump --uri "$MONGODB_URI" --archive=appilabs-$(date +%F).gz --gzip
  ```
- Test a restore into a separate database at least once: `mongorestore --uri "$TEST_URI" --archive=file.gz --gzip`.

## Deployment checklist

### Staging

- [ ] Separate Atlas database (for example `appilabs_staging`) and separate R2 bucket
- [ ] `PAYMENT_PROVIDER=paystack` with a **test** key, or `mock` on staging only
- [ ] `npm run seed -- --demo` allowed on staging only
- [ ] All flows tested: start a project (with file), contact, booking, enrollment and payment, research request (with file), resource download, newsletter confirmation email
- [ ] Admin: sign in, change a lead status, export CSV, download an uploaded file, edit and publish an article
- [ ] Python report job run manually and received by email
- [ ] `/api/v1/ready` healthy; Lighthouse run on home, a service page and a course page

### Production

- [ ] `NODE_ENV=production`, `COOKIE_SECURE=true`, strong `JWT_SECRET`
- [ ] `CORS_ORIGINS` and `PUBLIC_SITE_URL` match the real domains
- [ ] `STORAGE_DRIVER=s3` with a private bucket
- [ ] `EMAIL_DRIVER=smtp` with SPF, DKIM and DMARC records configured for the sending domain
- [ ] `PAYMENT_PROVIDER=paystack` with the live key and webhook, or `none`
- [ ] Owner account created; `SETUP_TOKEN` removed
- [ ] Admin > Settings: real email, phone, WhatsApp, address, service areas, social links
- [ ] Demo prices confirmed or changed; *Demo price* flags removed
- [ ] Sample articles and illustrative case studies replaced or unpublished
- [ ] Founder bio checked in `shared/content/site.js`
- [ ] Privacy policy and terms reviewed by a lawyer
- [ ] Sitemap submitted; GA4 receiving events
- [ ] Backups enabled and a restore tested
- [ ] Uptime monitor on `/api/v1/health` (for example UptimeRobot or Better Stack)
