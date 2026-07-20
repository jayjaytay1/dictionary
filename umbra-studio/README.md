# Umbra Studio — Marketing Site

A single-page marketing/business site for **Umbra Studio**, a solo independent
app development studio. Dark, modern, sharp aesthetic — deep charcoal/black with
a sparingly-used red accent for CTAs, highlights, and hover states.

## Contents

- `index.html` — the entire site. Self-contained: all CSS and JS inline, no
  external dependencies, fonts, or build step. Just open it in a browser.

## Sections

- **Header** — Umbra wordmark with red accent glyph/underline, sticky nav
  (Home, Apps, Contact).
- **Hero** — Studio name, tagline "Independent apps, built with purpose",
  subtle grid + red glow background.
- **Apps** — One app card: **Car Cost Tracker** (status: *In Development*).
  Clicking the card opens a detail modal with a longer description, planned
  features (expense tracking, maintenance reminders, cost breakdowns, reports),
  and an optional "Notify me at launch" email capture.
- **About / Contact** — Short studio blurb (one developer, focused tools) and
  contact email `jtr.taylor.j@gmail.com`.
- **Footer** — Wordmark, email, current copyright year.

## Notes

- Fully responsive; respects `prefers-reduced-motion`.
- The "Notify me" form is client-side only — it validates the email and shows a
  confirmation but does not send data anywhere. Wire it to a real backend or
  form service before launch.
- No fabricated apps, user counts, testimonials, or team bios — content is
  limited to what actually exists.
