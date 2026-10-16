"""Turns automation API data into readable Markdown reports. Presentation only: all
business logic (what counts as stale, revenue, sources) lives in the API."""
from datetime import datetime


def money(minor: int | None, currency: str = "GHS") -> str:
    value = (minor or 0) / 100
    return f"{currency} {value:,.2f}".replace(".00", "")


def _dt(value: str | None) -> str:
    if not value:
        return "-"
    return datetime.fromisoformat(value.replace("Z", "+00:00")).strftime("%d %b %Y %H:%M")


def _table(headers: list[str], rows: list[list]) -> str:
    if not rows:
        return "_None._\n"
    out = ["| " + " | ".join(headers) + " |", "|" + "---|" * len(headers)]
    out += ["| " + " | ".join(str(c).replace("|", "/") for c in r) + " |" for r in rows]
    return "\n".join(out) + "\n"


def _counts(d: dict) -> str:
    return ", ".join(f"{k}: {v}" for k, v in d.items()) or "none"


def stale_report(data: dict) -> tuple[str, str]:
    total = data["total"]
    title = f"Follow-up needed: {total} inquiries waiting over {data['thresholdHours']} hours" if total else "No inquiries are waiting for a reply"
    body = [f"# {title}\n"]
    if total:
        body.append("Reply to these first. The oldest are at the top.\n")
        body.append("## Leads\n")
        body.append(_table(["Waiting", "Name", "Email", "Area", "Type"], [[f"{l['ageHours']} h", l["name"], l["email"], l["pillar"], l["type"]] for l in data["leads"]]))
        body.append("\n## Research requests\n")
        body.append(_table(["Waiting", "Name", "Email", "Service", "Deadline"], [[f"{r['ageHours']} h", r["name"], r["email"], r["serviceSlug"], _dt(r.get("deadline"))[:11]] for r in data["researchRequests"]]))
    return title, "\n".join(body)


def daily_report(data: dict) -> tuple[str, str]:
    t = data["totals"]
    title = f"Daily lead summary for {data['date']}: {t['leads']} leads, {t['bookings']} bookings, {t['researchRequests']} research, {t['enrollments']} enrollments"
    body = [
        f"# Daily lead summary, {data['date']}\n",
        _table(["Leads", "Consultations", "Research requests", "Enrollments", "New subscribers"], [[t["leads"], t["bookings"], t["researchRequests"], t["enrollments"], t["newSubscribers"]]]),
        f"\n**By area:** {_counts(data['leadsByPillar'])}  \n**By source:** {_counts(data['bySource'])}\n",
        "\n## Leads\n",
        _table(["Name", "Email", "Type", "Area", "Service"], [[l["name"], l["email"], l["type"], l["pillar"], l.get("serviceSlug") or "-"] for l in data["leads"]]),
        "\n## Consultation requests\n",
        _table(["Name", "Topic", "First preferred time"], [[b["name"], b.get("topic") or b["pillar"], _dt((b.get("preferredDates") or [None])[0])] for b in data["bookings"]]),
    ]
    return title, "\n".join(body)


def bookings_report(data: dict) -> tuple[str, str]:
    c, a = data["confirmed"], data["awaitingConfirmation"]
    title = f"Consultations in the next {data['windowDays']} days: {len(c)} confirmed, {len(a)} awaiting confirmation"
    body = [
        f"# {title}\n",
        "## Confirmed\n",
        _table(["When", "Name", "Topic", "Mode"], [[_dt(b.get("scheduledAt")), b["name"], b.get("topic") or "-", b["mode"]] for b in c]),
        "\n## Awaiting confirmation\n",
        _table(["Requested", "Name", "Email", "Preferred times"], [[_dt(b["createdAt"]), b["name"], b["email"], ", ".join(_dt(d) for d in b.get("preferredDates", []))] for b in a]),
    ]
    return title, "\n".join(body)


def enrollment_report(data: dict) -> tuple[str, str]:
    cur = data.get("currency", "GHS")
    title = f"Enrollments, last {data['windowDays']} days: {data['total']} total, {money(data['revenueMinor'], cur)} collected"
    rows = [[course, v["total"], v.get("paid", 0) + v.get("completed", 0), v.get("pending_payment", 0), v.get("interested", 0), money(v["revenue"], cur)] for course, v in data["byCourse"].items()]
    body = [f"# {title}\n", _table(["Course", "Total", "Paid", "Awaiting payment", "Interested", "Revenue"], rows)]
    if any(r[3] for r in rows):
        body.append("\nLearners awaiting payment may need a reminder or a payment link.\n")
    return title, "\n".join(body)


def weekly_report(data: dict) -> tuple[str, str]:
    p = data["payments"]
    title = f"Weekly business activity, {data['periodStart']} to {data['periodEnd']}"
    body = [
        f"# {title}\n",
        "## Pipeline\n",
        f"- Leads by status: {_counts(data['leads']['byStatus'])}",
        f"- Leads by area: {_counts(data['leads']['byPillar'])}",
        f"- Lead sources: {_counts(data['leads']['bySource'])}",
        f"- Consultations: {_counts(data['bookings'])}",
        f"- Research requests: {_counts(data['researchRequests'])}",
        f"- Enrollments: {_counts(data['enrollments'])}",
        "\n## Revenue and audience\n",
        f"- Online payments: {p['count']} totalling {money(p['revenueMinor'], p.get('currency', 'GHS'))}",
        f"- New confirmed subscribers: {data['newSubscribers']}",
        f"- Site events (consented visitors): {_counts(data['events'])}",
    ]
    return title, "\n".join(body) + "\n"
