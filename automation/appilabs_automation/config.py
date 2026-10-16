import os
from dataclasses import dataclass
from pathlib import Path


def load_dotenv(path: Path) -> None:
    """Minimal .env loader (no third-party dependency). Existing environment variables win."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@dataclass
class Settings:
    api_url: str
    api_key: str
    notify: str
    output_dir: Path
    smtp_host: str | None
    smtp_port: int
    smtp_user: str | None
    smtp_pass: str | None
    smtp_from: str
    report_to: str | None
    currency: str = "GHS"

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv(Path(__file__).resolve().parent.parent / ".env")
        return cls(
            api_url=os.environ.get("APPILABS_API_URL", "http://localhost:4000").rstrip("/"),
            api_key=os.environ.get("APPILABS_AUTOMATION_API_KEY", ""),
            notify=os.environ.get("NOTIFY_MODE", "console"),
            output_dir=Path(os.environ.get("OUTPUT_DIR", Path(__file__).resolve().parent.parent / "output")),
            smtp_host=os.environ.get("SMTP_HOST"),
            smtp_port=int(os.environ.get("SMTP_PORT", "587")),
            smtp_user=os.environ.get("SMTP_USER"),
            smtp_pass=os.environ.get("SMTP_PASS"),
            smtp_from=os.environ.get("SMTP_FROM", "AppiLabs Reports <reports@appilabs.com>"),
            report_to=os.environ.get("REPORT_TO"),
        )
