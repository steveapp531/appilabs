"""Generates the downloadable lead-magnet PDFs and the Open Graph image.
Run: python scripts/generate_assets.py   (needs: pip install reportlab pillow)
Edit the text below and re-run to update the files in public/."""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "public"
INK, GOLD = (0x13, 0x23, 0x2E), (0xE0, 0xA5, 0x26)

def pdf(path, title, intro, sections):
    c = canvas.Canvas(str(path), pagesize=A4)
    w, h = A4
    def header():
        c.setFillColorRGB(*[x / 255 for x in INK]); c.rect(0, h - 28 * mm, w, 28 * mm, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1); c.setFont("Helvetica-Bold", 18); c.drawString(18 * mm, h - 17 * mm, title)
        c.setFont("Helvetica", 9); c.drawRightString(w - 18 * mm, h - 17 * mm, "AppiLabs")
    header(); y = h - 40 * mm
    c.setFillColorRGB(*[x / 255 for x in INK]); c.setFont("Helvetica", 10)
    for line in intro: c.drawString(18 * mm, y, line); y -= 5.5 * mm
    y -= 4 * mm
    for heading, items in sections:
        if y < 50 * mm: c.showPage(); header(); y = h - 40 * mm; c.setFillColorRGB(*[x / 255 for x in INK])
        c.setFont("Helvetica-Bold", 12); c.drawString(18 * mm, y, heading); y -= 7 * mm
        c.setFont("Helvetica", 10)
        for item in items:
            c.rect(18 * mm, y - 1, 3.5 * mm, 3.5 * mm, fill=0, stroke=1)
            c.drawString(25 * mm, y, item); y -= 6.5 * mm
        y -= 4 * mm
    c.setFont("Helvetica", 8); c.drawString(18 * mm, 12 * mm, "appilabs.com  |  Free to use and share")
    c.save()

pdf(OUT / "resources" / "data-readiness-checklist.pdf", "Data readiness checklist",
    ["Tick each statement that is true for your business. Fewer than 10 ticks usually means",
     "dashboards or automation will struggle until the foundations are fixed."],
    [("Sources", ["We know every system that holds customer, sales and operations data", "Each source has a named owner", "We can export data from each system without manual copying"]),
     ("Quality", ["Key fields (dates, IDs, amounts) are filled in consistently", "Customers and products have one ID across systems", "Duplicates are found and fixed regularly"]),
     ("Definitions", ["Our top 10 KPIs are written down with formulas", "Everyone uses the same definition of revenue, customer and churn", "We agree which system is the source of truth for each metric"]),
     ("Process", ["Reports are produced on a fixed schedule", "Report preparation takes less than half a day", "Errors in reports are rare and traced to a cause"]),
     ("People", ["Someone is responsible for data quality", "Managers can read and question a dashboard", "The team has basic spreadsheet or BI skills"])])

pdf(OUT / "resources" / "research-proposal-template.pdf", "Research proposal planning template",
    ["Answer each prompt in one or two sentences before writing your proposal.",
     "Clear answers here make every later chapter easier to write and defend."],
    [("Problem", ["What is happening, where, and who is affected?", "What evidence shows it matters?", "What is not yet known about it?"]),
     ("Aim and objectives", ["One sentence aim that starts with 'To ...'", "Three or four objectives using verbs like assess, examine, compare", "One research question per objective"]),
     ("Literature", ["Three key theories or models you will draw on", "Five core studies and what each found", "The gap your study fills"]),
     ("Method", ["Design (survey, interviews, mixed) and why it fits the questions", "Population, sample and sampling method", "Instrument and how you will test it", "Analysis technique for each objective"]),
     ("Practicalities", ["Ethics approval and consent process", "Timeline working back from the deadline", "Risks to data collection and your backup plan"])])

# Open Graph image 1200x630
img = Image.new("RGB", (1200, 630), INK); d = ImageDraw.Draw(img)
for i in range(9):
    op = [1, .55, .3, 1, 1, .55, 1, 1, 1][i]
    col = tuple(int(INK[k] + (GOLD[k] - INK[k]) * op) for k in range(3))
    x, y = 80 + (i % 3) * 46, 80 + (i // 3) * 46
    d.rectangle([x, y, x + 34, y + 34], fill=col)
try:
    big = ImageFont.truetype("DejaVuSans-Bold.ttf", 76); small = ImageFont.truetype("DejaVuSans.ttf", 34)
except OSError:
    big = small = ImageFont.load_default()
d.text((80, 300), "Vision requires", font=big, fill="white")
d.text((80, 390), "structure to scale.", font=big, fill="white")
d.text((80, 520), "AppiLabs  |  Solutions, Consulting, Academy", font=small, fill=GOLD)
img.save(OUT / "og-image.png", optimize=True)
print("Generated PDFs and og-image.png")
