"""Delivery channels: console (default), file (Markdown files in OUTPUT_DIR), smtp (internal team email only)."""
import smtplib
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path


def deliver(settings, name: str, title: str, body: str) -> str:
    mode = settings.notify
    if mode == "file":
        settings.output_dir.mkdir(parents=True, exist_ok=True)
        path = Path(settings.output_dir) / f"{datetime.now():%Y-%m-%d}-{name}.md"
        path.write_text(body, encoding="utf-8")
        return f"Wrote {path}"
    if mode == "smtp":
        if not (settings.smtp_host and settings.report_to):
            raise RuntimeError("NOTIFY_MODE=smtp needs SMTP_HOST and REPORT_TO. Falling back is not automatic so misconfiguration is visible.")
        msg = EmailMessage()
        msg["Subject"] = f"[AppiLabs] {title}"
        msg["From"] = settings.smtp_from
        msg["To"] = settings.report_to  # internal recipients only; never customer lists
        msg.set_content(body)
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as s:
            s.starttls()
            if settings.smtp_user:
                s.login(settings.smtp_user, settings.smtp_pass or "")
            s.send_message(msg)
        return f"Emailed {settings.report_to}"
    print(body)
    print("-" * 72)
    return "Printed to console"
