// HCEO — "Chief of Staff" AI endpoint (Vercel serverless function).
//
// The Anthropic API key lives ONLY in the server environment variable
// ANTHROPIC_API_KEY — it is never sent to the browser. The frontend posts the
// user's message plus a small context object (their own stats, computed on
// their device) and this function forwards it to Claude.
//
// Optional: set APP_ACCESS_CODE in the environment to require a shared code
// (stops random visitors from spending your API credits). The app prompts the
// user for it once and stores it locally.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(200).json({
      reply: "I'm not switched on yet — the app owner needs to add the ANTHROPIC_API_KEY on the server.",
    });
    return;
  }

  const accessCode = process.env.APP_ACCESS_CODE;

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const message = String(body.message || '');
  const history = Array.isArray(body.history) ? body.history : [];
  const context = body.context || {};
  const sentCode = String(body.code || '');

  if (accessCode && sentCode !== accessCode) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  if (!message.trim()) {
    res.status(400).json({ error: 'empty_message' });
    return;
  }

  // Build the message list: normalise roles, ensure it starts with a user
  // turn, and merge consecutive same-role turns.
  let msgs = history
    .map(function (m) {
      const role = (m && (m.role === 'assistant' || m.role === 'chief')) ? 'assistant' : 'user';
      return { role: role, content: String((m && m.content) || '').slice(0, 2000) };
    })
    .filter(function (m) { return m.content.trim(); });
  while (msgs.length && msgs[0].role === 'assistant') msgs.shift();
  msgs.push({ role: 'user', content: message.slice(0, 4000) });

  const merged = [];
  for (const m of msgs) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += '\n\n' + m.content;
    else merged.push(m);
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-8', // swap to claude-sonnet-5 or claude-haiku-4-5 for lower cost
        max_tokens: 700,
        system: buildSystem(context),
        messages: merged,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      const detail = (data && data.error && data.error.message) ? data.error.message : ('HTTP ' + r.status);
      res.status(200).json({ reply: 'The Chief hit a snag (' + detail + '). Try again in a moment.' });
      return;
    }

    const reply = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : '…';
    res.status(200).json({ reply: reply });
  } catch (e) {
    res.status(200).json({ reply: "Couldn't reach the Chief just now. Give it another go shortly." });
  }
};

function buildSystem(c) {
  c = c || {};
  const parts = [];
  parts.push(
    'You are "The Chief of Staff" inside HCEO (Health CEO), an app where the user runs their health like a company — they are the CEO and their body is the company. ' +
    'Speak like a sharp, warm, tough-love executive coach: direct, brief, motivating, and human. Keep replies to 2–5 short sentences unless the user asks for more. ' +
    'Never invent numbers — use only the data provided below. When the user is low, remind them of concrete progress from their record. When they ask what to do, give one clear next action. ' +
    'You are a supportive coach, not a medical professional — do not give clinical diagnoses; suggest seeing a doctor for medical concerns.'
  );

  const s = [];
  if (c.name) s.push('Name: ' + c.name);
  if (c.rank) s.push('CEO rank: ' + c.rank + (c.tenure ? ' (day ' + c.tenure + ')' : ''));
  if (typeof c.streak === 'number') s.push('Current streak: ' + c.streak + ' days');
  if (typeof c.approved === 'number') s.push('Board-approved days (all time): ' + c.approved);
  if (typeof c.reps === 'number') s.push('Total non-negotiables executed: ' + c.reps);
  if (typeof c.avg7 === 'number') s.push('7-day average performance: ' + c.avg7 + '%');
  if (typeof c.todayScore === 'number') s.push("Today's score so far: " + c.todayScore + '%');
  if (c.metricsToday) s.push("Today's metrics: " + c.metricsToday);
  if (typeof c.books === 'number' && c.books) s.push('Books finished: ' + c.books);
  if (c.mission) s.push('Their mission statement: "' + c.mission + '"');
  if (c.lastChange) s.push('Last board-meeting directive: "' + c.lastChange + '"');
  if (Array.isArray(c.wins) && c.wins.length) s.push('Recent wins they logged: ' + c.wins.map(function (w) { return '"' + w + '"'; }).join('; '));
  if (c.rest) s.push('Today is a declared REST day — protect recovery, no guilt-tripping.');

  parts.push('The CEO you are advising — their real data right now:\n' + (s.length ? s.join('\n') : 'No data yet — encourage them to start with one non-negotiable today.'));
  return parts.join('\n\n');
}
