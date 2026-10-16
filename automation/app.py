"""Vercel WSGI entry point for scheduled AppiLabs reports."""
import hmac
import json
import os

from appilabs_automation.__main__ import main


def _response(start_response, status, payload):
    body = json.dumps(payload).encode("utf-8")
    start_response(
        status,
        [
            ("Content-Type", "application/json; charset=utf-8"),
            ("Content-Length", str(len(body))),
            ("Cache-Control", "no-store"),
        ],
    )
    return [body]


def app(environ, start_response):
    if environ.get("REQUEST_METHOD") != "GET":
        return _response(start_response, "405 Method Not Allowed", {"error": "Method not allowed"})

    secret = os.environ.get("CRON_SECRET")
    if not secret:
        return _response(start_response, "503 Service Unavailable", {"error": "CRON_SECRET is not configured"})

    authorization = environ.get("HTTP_AUTHORIZATION", "")
    if not hmac.compare_digest(authorization, f"Bearer {secret}"):
        return _response(start_response, "401 Unauthorized", {"error": "Unauthorized"})

    if main(["all", "--notify", "smtp"]) != 0:
        return _response(start_response, "502 Bad Gateway", {"error": "Report generation failed; inspect function logs"})
    if main(["purge-uploads"]) != 0:
        return _response(start_response, "502 Bad Gateway", {"error": "Upload cleanup failed; inspect function logs"})
    return _response(start_response, "200 OK", {"status": "completed"})
