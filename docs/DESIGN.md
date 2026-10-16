# Design system

**Idea:** "Vision requires structure to scale." The visual language is a structured grid: things that start scattered end up ordered. The hero diagram shows scattered data points settling into a grid that feeds the three pillars. It is the one animated moment on the site, it plays once, and it is skipped when the visitor prefers reduced motion.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| `--ink` | `#13232E` | Text, primary buttons, dark sections |
| `--paper` | `#F2F4F3` | Page background |
| `--surface` | `#FFFFFF` | Alternating sections, forms, panels |
| `--rule` | `#CDD5D8` | Dividers and borders |
| `--muted` | `#50616B` | Secondary text (AA contrast on paper and white) |
| `--signal` | `#E0A526` | Accent strokes, buttons on dark backgrounds only |
| `--solutions` | `#1D6F8C` | Solutions identity marker |
| `--consulting` | `#4152A3` | Consulting identity marker |
| `--academy` | `#2E7A4E` | Academy identity marker |

Pillar colours appear only as small markers (a bar, a square, a left rule) so each page stays calm but you always know which part of the business you are in.

## Type

- **Bricolage Grotesque** (variable) for headings: characterful, confident, slightly condensed at large sizes.
- **Public Sans** (variable) for body and interface text: neutral and highly legible.
- Fonts are self-hosted through Fontsource (no third-party font requests).
- Scale: 14, 16, 18, 22, 28, then fluid 32 to 44 and 40 to 72 for display.

## Layout

- Left-aligned, 12-column "spec sheet" pattern: section heading and short intro in the left 4 columns, content in the right 8.
- Services are structured rows (what it is, what you get, price) instead of a grid of identical cards.
- Numbers are used only for real sequences (process steps, onboarding progress, course weeks).
- One button radius (3px), one panel radius (6px). No gradients, no glow, no decorative shadows except on overlays.

## Accessibility

Semantic landmarks and headings, skip link, visible focus outlines, labelled form controls with linked hints and errors, error summaries announced with `role="alert"`, keyboard-operable admin tables and drawers, `prefers-reduced-motion` respected, colour never used alone to carry meaning.

## Copy rules

Plain, direct sentences in sentence case. Concrete deliverables over claims. No em dashes. No invented testimonials, logos, metrics or certifications; sample and illustrative content is labelled on the page.
