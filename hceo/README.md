# HCEO — Health CEO

Run your health like a company. A dark, cinematic, mobile-first health tracker with a
**real AI "Chief of Staff"** coach.

- `index.html` — the whole front-end app (no build step). Works offline; data is saved
  in your browser's `localStorage`.
- `api/chief.js` — a small serverless function that talks to Claude on the server, so
  your API key is **never** exposed to the browser.

The app calls `/api/chief` for the Chief's replies. If that endpoint isn't reachable
(e.g. opened as a plain file), it automatically falls back to a built-in scripted coach,
so the app never breaks.

---

## Deploy to Vercel (about 5 minutes)

You need: a [Vercel](https://vercel.com) account (free) and an Anthropic API key from
[console.anthropic.com](https://console.anthropic.com).

1. **Get a fresh API key.** In the Anthropic Console → **API Keys** → **Create Key**.
   Copy it. (If you ever pasted a key into a chat, delete that one and make a new one.)

2. **Import this repo into Vercel.** Vercel dashboard → **Add New… → Project** → import
   this GitHub repository.

3. **Set the Root Directory to `hceo`.** In the import screen (or Project → Settings →
   General → Root Directory), set it to `hceo` so Vercel serves this folder. No build
   command or framework preset is needed — it's a static page plus one function.

4. **Add your key as an Environment Variable.** Project → **Settings → Environment
   Variables**:
   - `ANTHROPIC_API_KEY` = *your key* (required)
   - `APP_ACCESS_CODE` = *any phrase you choose* (optional but recommended — see below)

5. **Deploy.** Vercel gives you a live URL (e.g. `https://your-app.vercel.app`). Open it,
   go to the **Chief** tab, and say hello — it's now a real AI.

That's it. Pushing new commits to the repo redeploys automatically.

---

## Protecting your credits (optional)

The `/api/chief` endpoint is public by default — anyone with the URL could send it
messages and spend your Anthropic credits. To gate it, set `APP_ACCESS_CODE` to a secret
phrase. The app will ask you for the code once (on your first message) and remember it on
your device. Requests without the correct code get a 401 and are refused.

---

## Cost & model

The Chief uses **`claude-opus-4-8`** by default (highest quality). For a personal app
this is usually pennies per day, but you can lower cost by editing the `model` line in
`api/chief.js`:

- `claude-sonnet-5` — strong quality, cheaper
- `claude-haiku-4-5` — fastest and cheapest

Redeploy after changing it.

---

## Security notes

- **Never commit your API key.** It lives only in Vercel's Environment Variables. This
  repo contains no keys.
- The browser only ever sends your *own* stats (streak, scores, etc.) to `/api/chief`;
  the key stays on the server.
- Your health data stays in your browser (`localStorage`). This version does not sync
  across devices — that would need a database and login (a possible future upgrade).
