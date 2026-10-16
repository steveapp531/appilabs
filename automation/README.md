# AppiLabs automation (Python)

Scheduled business reports built on the AppiLabs automation API. Python 3.10+ standard library only, nothing to install.

## Reports

| Command | What it answers |
| --- | --- |
| `stale` | Which leads and research requests are still "new" after N hours (default 48)? |
| `daily` | What came in today: leads, consultations, research requests, enrollments, subscribers, by area and source |
| `upcoming` | Which consultations are confirmed, or waiting for confirmation, in the next N days (default 7)? |
| `enrollments` | Enrollments and revenue per course over the last N days (default 30) |
| `weekly` | Seven day activity across the pipeline, payments, subscribers and site events |
| `all` | All of the above |
| `purge-uploads` | Deletes uploaded files past their retention date |

## Setup

```bash
cd automation
cp .env.example .env
# APPILABS_API_URL=http://localhost:4000
# APPILABS_AUTOMATION_API_KEY=<same value as AUTOMATION_API_KEY in backend/.env>
python -m appilabs_automation all
```

Options: `--hours 24` (stale), `--days 14` (upcoming), `--window 90` (enrollments), `--date 2026-10-14` (daily), `--notify console|file|smtp`.

## Delivery modes

- `console` (default): prints Markdown.
- `file`: writes `output/YYYY-MM-DD-<report>.md`.
- `smtp`: emails your team (`REPORT_TO`). Reports are internal only; this tool never emails customers or subscribers.

## Scheduling

- **Vercel Cron:** defined in the root `vercel.json`, daily at 07:00 UTC. It calls `app.py`, which requires `CRON_SECRET`, runs all reports, then purges expired uploads. Vercel injects `APPILABS_API_URL` through the automation-to-backend service binding; set `APPILABS_AUTOMATION_API_KEY` to the same value as the backend's `AUTOMATION_API_KEY`.
- **Render alternative:** the optional `render.yaml` defines an `appilabs-reports` cron job.
- **GitHub Actions:** `.github/workflows/reports.yml` (weekdays, saves reports as build artifacts).
- **Your own machine:** `crontab -e` and add `0 7 * * * cd /path/to/appilabs/automation && python3 -m appilabs_automation all --notify file`. On Windows, use Task Scheduler.

## Design

All business rules (what counts as stale, revenue, lead source) live in the API (`backend/src/services/reports.js`), which also powers the admin dashboard. This package only fetches, formats and delivers, so numbers always match the dashboard.

## Tests

```bash
python -m unittest discover -s tests -t .
```

`sample_output/` contains real output generated from the demo seed data.
