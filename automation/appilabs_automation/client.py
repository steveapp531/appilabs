"""Thin client for the AppiLabs automation API (X-API-Key authentication). Standard library only."""
import json
import urllib.error
import urllib.parse
import urllib.request


class ApiError(RuntimeError):
    pass


class AutomationClient:
    def __init__(self, base_url: str, api_key: str, timeout: int = 20):
        if not api_key:
            raise ApiError("APPILABS_AUTOMATION_API_KEY is not set. Use the same value as AUTOMATION_API_KEY on the API server.")
        self.base = f"{base_url}/api/v1/automation"
        self.api_key = api_key
        self.timeout = timeout

    def _request(self, method: str, path: str, params: dict | None = None):
        query = f"?{urllib.parse.urlencode({k: v for k, v in (params or {}).items() if v is not None})}" if params else ""
        req = urllib.request.Request(f"{self.base}{path}{query}", method=method, headers={"X-API-Key": self.api_key, "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as res:
                return json.loads(res.read().decode())["data"]
        except urllib.error.HTTPError as err:
            try:
                message = json.loads(err.read().decode())["error"]["message"]
            except Exception:  # noqa: BLE001
                message = err.reason
            raise ApiError(f"{method} {path} failed ({err.code}): {message}") from err
        except urllib.error.URLError as err:
            raise ApiError(f"Cannot reach the API at {self.base}: {err.reason}") from err

    def stale_inquiries(self, hours: int = 48):
        return self._request("GET", "/stale-inquiries", {"hours": hours})

    def daily_summary(self, date: str | None = None):
        return self._request("GET", "/daily-summary", {"date": date})

    def upcoming_bookings(self, days: int = 7):
        return self._request("GET", "/upcoming-bookings", {"days": days})

    def enrollment_summary(self, days: int = 30):
        return self._request("GET", "/enrollment-summary", {"days": days})

    def weekly_activity(self):
        return self._request("GET", "/weekly-activity")

    def purge_uploads(self):
        return self._request("POST", "/purge-uploads")
