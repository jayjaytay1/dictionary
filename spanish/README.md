# Aprende 🇪🇸 — Learn Spanish

A complete, mobile-first Spanish learning web app. No build step, no accounts —
open `index.html` and start learning. Your progress (XP, streak, word mastery)
is saved in your browser's `localStorage`.

## Features

- **Dashboard** — total XP, daily streak, daily-goal ring, and overall course progress.
- **8 lessons · 100+ words** — greetings, numbers, colors, family, food, verbs, travel, and days/time, each with an English translation and pronunciation hint.
- **Flashcards** — flip-to-reveal cards with real Spanish audio (browser speech synthesis).
- **Quizzes** — multiple-choice for new words, and type-the-answer once you've started mastering a word. Scored, with instant feedback.
- **Spaced-repetition Review** — automatically resurfaces the words you find hardest so they stick.
- **Mastery tracking** — every word has a 0–5 mastery level (the ●○ dots); the app focuses your review on weak words.
- **AI Tutor chat** — ask about grammar (e.g. *ser* vs *estar*), request translations, or say "quiz me". Works offline with a built-in tutor; upgrade to a live Claude-powered tutor by deploying with an API key (below).

## Run it locally

It's a static site. Any of these work:

```bash
# Option 1: just open the file
open spanish/index.html          # macOS  (xdg-open on Linux)

# Option 2: a tiny local server (recommended — enables the /api tutor route if you add it)
cd spanish && python3 -m http.server 8000
# then visit http://localhost:8000
```

Everything except the *live* AI tutor works with no server at all.

## Optional: a live AI tutor (Vercel, ~5 min)

The app calls `/api/tutor`. Without it, the built-in scripted tutor answers. To
make the tutor a real Claude conversation:

1. Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com).
2. Import this repo into [Vercel](https://vercel.com) → **Add New… → Project**.
3. Set the **Root Directory** to `spanish`.
4. Add an Environment Variable `ANTHROPIC_API_KEY` = *your key*.
   (Optional: `APP_ACCESS_CODE` = a secret phrase to stop strangers spending your credits.)
5. Deploy. Open the URL, go to the **Tutor** tab, and chat.

Your key stays on the server in `api/tutor.js`; the browser never sees it.

### Cost & model

Uses `claude-opus-4-8` by default. To reduce cost, edit the `model` line in
`api/tutor.js` to `claude-sonnet-5` (cheaper) or `claude-haiku-4-5` (cheapest),
then redeploy.

## Files

- `index.html` — markup + styles
- `data.js` — all vocabulary and phrases (edit here to add words/lessons)
- `app.js` — the whole app (routing, flashcards, quizzes, review, tutor, progress)
- `api/tutor.js` — optional serverless AI-tutor endpoint

## Add your own words

Open `data.js` and add to any lesson's `words` array, or add a whole new lesson
object to `LESSONS`. Each word is `{ es, en, hint }` (hint is optional). Refresh
the page — it's picked up automatically.
