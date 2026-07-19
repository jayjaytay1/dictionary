/* Serverless function: a real AI Spanish tutor powered by Claude.
 *
 * Deploy on Vercel (see ../README.md). The Anthropic API key lives ONLY in the
 * server environment variable ANTHROPIC_API_KEY — it is never sent to the browser.
 * If this endpoint is unreachable, the front-end automatically falls back to a
 * built-in scripted tutor, so the app always works.
 *
 * Optional: set APP_ACCESS_CODE to gate usage and protect your credits.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // No key configured — tell the client to use its local fallback.
    res.status(501).json({ error: "No API key configured" });
    return;
  }

  // Optional access gate.
  const gate = process.env.APP_ACCESS_CODE;
  if (gate) {
    const provided = req.headers["x-access-code"];
    if (provided !== gate) {
      res.status(401).json({ error: "Access code required" });
      return;
    }
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const message = (body && body.message ? String(body.message) : "").slice(0, 2000);
  const history = Array.isArray(body && body.history) ? body.history.slice(-10) : [];
  if (!message) { res.status(400).json({ error: "Empty message" }); return; }

  const messages = history
    .filter((m) => m && m.text && m.text !== "…")
    .map((m) => ({ role: m.role === "you" ? "user" : "assistant", content: String(m.text).slice(0, 2000) }));
  messages.push({ role: "user", content: message });

  const system =
    "You are a warm, encouraging Spanish tutor for an English-speaking beginner using a " +
    "flashcard learning app. Keep replies short (2–5 sentences or a tight list). When you " +
    "give Spanish, show the English too. Use simple examples. Gently correct mistakes. " +
    "Use European/neutral Spanish. When the user asks to be quizzed, ask one short question " +
    "and wait. Never mention that you are an AI model. Prefer plain text with occasional " +
    "**bold** for key words; no long essays.";

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-8",
        max_tokens: 500,
        system,
        messages,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      res.status(502).json({ error: "Upstream error", detail: errText.slice(0, 300) });
      return;
    }
    const data = await r.json();
    const reply =
      data && data.content && data.content[0] && data.content[0].text
        ? data.content[0].text
        : "Lo siento, no pude responder. ¿Puedes intentarlo de nuevo?";
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: "Request failed" });
  }
}
