"""Command line entry point.

Examples:
  python -m appilabs_automation all
  python -m appilabs_automation stale --hours 24 --notify file
  python -m appilabs_automation daily --date 2026-10-14
"""
import argparse
import sys

from . import reports
from .client import AutomationClient, ApiError
from .config import Settings
from .notify import deliver

JOBS = {
    "stale": lambda c, a: reports.stale_report(c.stale_inquiries(a.hours)),
    "daily": lambda c, a: reports.daily_report(c.daily_summary(a.date)),
    "upcoming": lambda c, a: reports.bookings_report(c.upcoming_bookings(a.days)),
    "enrollments": lambda c, a: reports.enrollment_report(c.enrollment_summary(a.window)),
    "weekly": lambda c, a: reports.weekly_report(c.weekly_activity()),
}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="appilabs_automation", description="AppiLabs scheduled reports")
    parser.add_argument("job", choices=[*JOBS, "all", "purge-uploads"])
    parser.add_argument("--hours", type=int, default=48, help="stale: hours without a reply (default 48)")
    parser.add_argument("--days", type=int, default=7, help="upcoming: look-ahead window in days (default 7)")
    parser.add_argument("--window", type=int, default=30, help="enrollments: look-back window in days (default 30)")
    parser.add_argument("--date", help="daily: UTC date YYYY-MM-DD (default today)")
    parser.add_argument("--notify", choices=["console", "file", "smtp"], help="override NOTIFY_MODE")
    args = parser.parse_args(argv)

    settings = Settings.from_env()
    if args.notify:
        settings.notify = args.notify
    try:
        client = AutomationClient(settings.api_url, settings.api_key)
        if args.job == "purge-uploads":
            print(f"Purged {client.purge_uploads()['purged']} expired uploads")
            return 0
        for name in JOBS if args.job == "all" else [args.job]:
            title, body = JOBS[name](client, args)
            print(f"[{name}] {deliver(settings, name, title, body)}", file=sys.stderr)
        return 0
    except ApiError as err:
        print(f"Error: {err}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
