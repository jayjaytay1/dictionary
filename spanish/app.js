/* Aprende — Learn Spanish. Vanilla JS single-page app. Progress in localStorage. */
(function () {
  "use strict";

  var LESSONS = window.LESSONS, PHRASES = window.PHRASES;
  var view = document.getElementById("view");
  var toastEl = document.getElementById("toast");
  var DAILY_GOAL = 30; // XP per day

  /* ---------- state ---------- */
  var DEFAULT = { xp: 0, streak: 0, lastActive: null, todayXP: 0, todayDate: null, mastery: {}, chat: [] };
  var state = load();

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem("aprende") || "{}");
      return Object.assign({}, DEFAULT, s, { mastery: s.mastery || {}, chat: s.chat || [] });
    } catch (e) { return Object.assign({}, DEFAULT); }
  }
  function save() { localStorage.setItem("aprende", JSON.stringify(state)); }

  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function refreshDay() {
    var t = todayStr();
    if (state.todayDate !== t) { state.todayXP = 0; state.todayDate = t; }
    // streak logic
    if (state.lastActive) {
      var last = new Date(state.lastActive), now = new Date(t);
      var diff = Math.round((now - last) / 86400000);
      if (diff >= 2) state.streak = 0; // missed a day -> reset
    }
    save();
  }
  function markActive() {
    var t = todayStr();
    if (state.lastActive !== t) {
      var last = state.lastActive ? new Date(state.lastActive) : null;
      var diff = last ? Math.round((new Date(t) - last) / 86400000) : 999;
      state.streak = diff === 1 ? state.streak + 1 : 1;
      state.lastActive = t;
    }
    save();
  }
  function addXP(n) {
    refreshDay();
    state.xp += n; state.todayXP += n;
    markActive();
    save(); renderStreak();
  }

  /* word key = lesson id + index */
  function wkey(lid, i) { return lid + ":" + i; }
  function masteryOf(lid, i) { return state.mastery[wkey(lid, i)] || 0; } // 0..5
  function bumpMastery(lid, i, correct) {
    var k = wkey(lid, i), m = state.mastery[k] || 0;
    m = correct ? Math.min(5, m + 1) : Math.max(0, m - 1);
    state.mastery[k] = m; save();
  }
  function lessonProgress(les) {
    var total = les.words.length, sum = 0;
    for (var i = 0; i < total; i++) sum += masteryOf(les.id, i);
    return Math.round((sum / (total * 5)) * 100);
  }
  function overallProgress() {
    var t = 0, s = 0;
    LESSONS.forEach(function (l) { l.words.forEach(function (_, i) { t += 5; s += masteryOf(l.id, i); }); });
    return t ? Math.round((s / t) * 100) : 0;
  }
  function masteredCount() {
    var c = 0;
    LESSONS.forEach(function (l) { l.words.forEach(function (_, i) { if (masteryOf(l.id, i) >= 4) c++; }); });
    return c;
  }
  function totalWords() { return LESSONS.reduce(function (a, l) { return a + l.words.length; }, 0); }

  /* ---------- speech ---------- */
  function speak(text) {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES"; u.rate = .9;
      var vs = window.speechSynthesis.getVoices();
      var v = vs.find(function (x) { return /es(-|_)/i.test(x.lang); });
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = function () {};

  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { toastEl.classList.remove("show"); }, 1600);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function renderStreak() { document.getElementById("streakN").textContent = state.streak; }

  /* =====================================================================
     VIEWS
  ===================================================================== */
  var current = "home";

  function go(name, arg) {
    current = name;
    document.querySelectorAll("#nav button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.go === name);
    });
    window.scrollTo(0, 0);
    ({ home: home, lessons: lessons, lesson: lesson, flash: flash, quiz: quiz, review: review, tutor: tutor })[name](arg);
  }

  /* ---- HOME / dashboard ---- */
  function home() {
    refreshDay();
    var pct = overallProgress();
    var goalPct = Math.min(100, Math.round((state.todayXP / DAILY_GOAL) * 100));
    view.innerHTML =
      '<div class="stats">' +
        '<div class="stat gold"><div class="v">' + state.xp + '</div><div class="l">Total XP</div></div>' +
        '<div class="stat red"><div class="v">' + state.streak + '</div><div class="l">Day streak</div></div>' +
        '<div class="stat green"><div class="v">' + masteredCount() + '</div><div class="l">Mastered</div></div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="goalrow"><h2>Daily goal</h2><span class="ink2">' + state.todayXP + ' / ' + DAILY_GOAL + ' XP</span></div>' +
        '<div class="bar"><i style="width:' + goalPct + '%"></i></div>' +
        '<p class="muted" style="margin:10px 0 0;font-size:13px">' +
          (goalPct >= 100 ? "¡Felicidades! Goal complete for today 🎉" : "Keep going — you're " + goalPct + "% there.") +
        '</p>' +
      '</div>' +
      '<div class="card">' +
        '<div class="goalrow"><h2>Course progress</h2><span class="ink2">' + pct + '%</span></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<p class="muted" style="margin:10px 0 0;font-size:13px">' + masteredCount() + ' of ' + totalWords() + ' words mastered across ' + LESSONS.length + ' lessons.</p>' +
      '</div>' +
      '<div class="card">' +
        '<h2 style="margin-bottom:10px">Jump back in</h2>' +
        '<div class="btnrow">' +
          '<button class="btn primary block" id="qContinue">Continue learning</button>' +
          '<button class="btn gold block" id="qReview">Review 🔁</button>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<h2 style="margin-bottom:10px">Phrase of the day</h2>' + potdHTML() +
      '</div>';

    document.getElementById("qContinue").onclick = function () {
      // first lesson that isn't fully mastered
      var target = LESSONS.find(function (l) { return lessonProgress(l) < 100; }) || LESSONS[0];
      go("lesson", target.id);
    };
    document.getElementById("qReview").onclick = function () { go("review"); };
    wirePotd();
  }

  function potd() {
    var i = new Date().getDate() % PHRASES.length;
    return PHRASES[i];
  }
  function potdHTML() {
    var p = potd();
    return '<div class="qword" style="margin:4px 0"><div class="big">' + esc(p.es) + '</div>' +
      '<div class="ink2" style="margin-top:4px">' + esc(p.en) + '</div></div>' +
      '<div class="center" style="margin-top:8px"><button class="spk" id="potdSpk" title="Listen">🔊</button></div>';
  }
  function wirePotd() { var b = document.getElementById("potdSpk"); if (b) b.onclick = function () { speak(potd().es); }; }

  /* ---- LESSONS list ---- */
  function lessons() {
    var html = '<div class="shead"><div><h1>Lessons</h1><div class="sub">' + LESSONS.length + ' lessons · ' + totalWords() + ' words</div></div></div><div class="lessons">';
    LESSONS.forEach(function (l) {
      var p = lessonProgress(l);
      html += '<button class="lesson" data-id="' + l.id + '">' +
        '<span class="emoji">' + l.emoji + '</span>' +
        '<span class="grow"><span class="t">' + esc(l.title) + '</span>' +
        '<div class="s">' + l.words.length + ' words · ' + p + '% mastered</div>' +
        '<span class="mini"><i style="width:' + p + '%"></i></span></span>' +
        '<span class="chev">›</span></button>';
    });
    html += '</div>';
    view.innerHTML = html;
    view.querySelectorAll(".lesson").forEach(function (b) { b.onclick = function () { go("lesson", b.dataset.id); }; });
  }

  function findLesson(id) { return LESSONS.find(function (l) { return l.id === id; }); }

  /* ---- LESSON detail ---- */
  function lesson(id) {
    var l = findLesson(id); if (!l) return go("lessons");
    var html = '<div class="shead"><button class="back" data-back>‹</button>' +
      '<div><h1>' + l.emoji + ' ' + esc(l.title) + '</h1><div class="sub">' + esc(l.blurb) + '</div></div></div>' +
      '<div class="btnrow" style="margin-bottom:14px">' +
        '<button class="btn primary block" data-act="flash">Flashcards</button>' +
        '<button class="btn gold block" data-act="quiz">Quiz</button>' +
      '</div><div class="card"><h2 style="margin-bottom:12px">Word list</h2>';
    l.words.forEach(function (w, i) {
      var m = masteryOf(l.id, i);
      var dots = "●".repeat(m) + "○".repeat(5 - m);
      html += '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-top:' + (i ? '1px solid var(--line-soft)' : 'none') + '">' +
        '<button class="spk" style="width:38px;height:38px;font-size:16px" data-spk="' + i + '">🔊</button>' +
        '<div style="flex:1;min-width:0"><div style="font-weight:700">' + esc(w.es) + '</div>' +
        '<div class="muted" style="font-size:13px">' + esc(w.en) + (w.hint ? ' · <i>' + esc(w.hint) + '</i>' : '') + '</div></div>' +
        '<div style="color:var(--gold);font-size:11px;letter-spacing:1px">' + dots + '</div></div>';
    });
    html += '</div>';
    view.innerHTML = html;
    view.querySelector("[data-back]").onclick = function () { go("lessons"); };
    view.querySelector('[data-act="flash"]').onclick = function () { go("flash", l.id); };
    view.querySelector('[data-act="quiz"]').onclick = function () { go("quiz", { id: l.id }); };
    view.querySelectorAll("[data-spk]").forEach(function (b) { b.onclick = function () { speak(l.words[+b.dataset.spk].es); }; });
  }

  /* ---- FLASHCARDS ---- */
  function flash(id) {
    var l = findLesson(id); if (!l) return go("lessons");
    var order = shuffle(l.words.map(function (_, i) { return i; }));
    var pos = 0, flipped = false;

    function draw() {
      var idx = order[pos], w = l.words[idx];
      view.innerHTML = '<div class="shead"><button class="back" data-back>‹</button>' +
        '<div><h1>Flashcards</h1><div class="sub">' + esc(l.title) + '</div></div></div>' +
        '<div class="countpill">Card ' + (pos + 1) + ' of ' + order.length + '</div>' +
        '<div class="flash' + (flipped ? ' flipped' : '') + '" id="flash"><div class="inner">' +
          '<div class="face front"><div class="lbl">Spanish</div><div class="big">' + esc(w.es) + '</div>' +
            (w.hint ? '<div class="hint">' + esc(w.hint) + '</div>' : '') +
            '<button class="spk" id="spk">🔊</button><div class="muted" style="font-size:12px">tap card to flip</div></div>' +
          '<div class="face back"><div class="lbl">English</div><div class="big">' + esc(w.en) + '</div>' +
            '<div class="muted" style="font-size:12px">did you get it?</div></div>' +
        '</div></div>' +
        (flipped ?
          '<div class="btnrow"><button class="btn block" id="again">Again</button>' +
          '<button class="btn gold block" id="got">Got it 👍</button></div>' :
          '<button class="btn primary block" id="reveal">Reveal answer</button>');

      view.querySelector("[data-back]").onclick = function () { go("lesson", l.id); };
      var fc = document.getElementById("flash");
      var spk = document.getElementById("spk");
      spk.onclick = function (e) { e.stopPropagation(); speak(w.es); };
      fc.onclick = function () { flipped = !flipped; draw(); };
      if (!flipped) { document.getElementById("reveal").onclick = function () { flipped = true; draw(); }; speak(w.es); }
      else {
        document.getElementById("again").onclick = function () { bumpMastery(l.id, idx, false); next(); };
        document.getElementById("got").onclick = function () { bumpMastery(l.id, idx, true); addXP(2); next(); };
      }
    }
    function next() {
      pos++; flipped = false;
      if (pos >= order.length) return finishFlash(l);
      draw();
    }
    draw();
  }
  function finishFlash(l) {
    view.innerHTML = '<div class="card center"><div class="done">🎉</div>' +
      '<h1 style="margin:8px 0 4px">Deck complete!</h1>' +
      '<p class="muted">You reviewed all ' + l.words.length + ' cards in ' + esc(l.title) + '.</p>' +
      '<div class="btnrow" style="margin-top:14px"><button class="btn block" id="again">Again</button>' +
      '<button class="btn gold block" id="quiz">Take the quiz</button></div>' +
      '<button class="btn primary block" id="done" style="margin-top:10px">Back to lesson</button></div>';
    document.getElementById("again").onclick = function () { go("flash", l.id); };
    document.getElementById("quiz").onclick = function () { go("quiz", { id: l.id }); };
    document.getElementById("done").onclick = function () { go("lesson", l.id); };
    toast("+ practice logged");
  }

  /* ---- QUIZ ---- */
  function quiz(opts) {
    opts = opts || {};
    var pool; // array of {lid, i, w}
    if (opts.words) pool = opts.words;
    else {
      var l = findLesson(opts.id);
      pool = l.words.map(function (w, i) { return { lid: l.id, i: i, w: w }; });
    }
    var title = opts.title || (findLesson(opts.id) ? findLesson(opts.id).title : "Quiz");
    var qs = shuffle(pool);
    var pos = 0, correct = 0;

    // allDefs used to build distractors
    var allDefs = [];
    LESSONS.forEach(function (l) { l.words.forEach(function (w) { allDefs.push(w.en); }); });

    function draw() {
      var q = qs[pos], w = q.w;
      var typeMode = masteryOf(q.lid, q.i) >= 3; // harder for words you know
      var head = '<div class="shead"><button class="back" data-back>‹</button>' +
        '<div><h1>Quiz</h1><div class="sub">' + esc(title) + '</div></div></div>' +
        '<div class="countpill">Question ' + (pos + 1) + ' of ' + qs.length + ' · Score ' + correct + '</div>' +
        '<div class="card"><div class="qword"><div class="lbl">Translate</div><div class="big">' + esc(w.es) + '</div>' +
        '<button class="spk" id="spk" style="margin-top:8px">🔊</button></div>';

      if (typeMode) {
        view.innerHTML = head + '<div style="margin-top:8px"><input class="type" id="ans" placeholder="type the English…" autocomplete="off" autocapitalize="off"></div>' +
          '<button class="btn primary block" id="submit" style="margin-top:12px">Check</button>' +
          '<div id="fb" style="margin-top:10px"></div></div>';
        var inp = document.getElementById("ans");
        inp.focus();
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
        document.getElementById("submit").onclick = check;
        function check() {
          var val = inp.value.trim().toLowerCase();
          if (!val) return;
          var ok = norm(w.en).split(/\s*\/\s*|\s*\(|,/)[0]; // accept primary sense
          var good = norm(val) === norm(w.en) || norm(w.en).indexOf(norm(val)) > -1 && val.length > 2 || norm(val) === ok;
          document.getElementById("submit").disabled = true; inp.disabled = true;
          answer(good, q);
          document.getElementById("fb").innerHTML = feedbackHTML(good, w.en);
        }
      } else {
        var wrong = shuffle(allDefs.filter(function (d) { return d !== w.en; })).slice(0, 3);
        var opt = shuffle([w.en].concat(wrong));
        view.innerHTML = head + '<div class="opts">' + opt.map(function (o) {
          return '<button class="opt" data-o="' + esc(o) + '">' + esc(o) + '</button>';
        }).join("") + '</div></div>';
        view.querySelectorAll(".opt").forEach(function (b) {
          b.onclick = function () {
            var good = b.dataset.o === w.en;
            view.querySelectorAll(".opt").forEach(function (x) {
              x.disabled = true;
              if (x.dataset.o === w.en) x.classList.add("correct");
              else if (x === b) x.classList.add("wrong");
            });
            answer(good, q);
          };
        });
      }
      view.querySelector("[data-back]").onclick = function () { back(); };
      document.getElementById("spk").onclick = function () { speak(w.es); };
    }

    function answer(good, q) {
      bumpMastery(q.lid, q.i, good);
      if (good) { correct++; addXP(3); speak(q.w.es); } else addXP(1);
      setTimeout(function () {
        pos++;
        if (pos >= qs.length) return finishQuiz();
        draw();
      }, good ? 700 : 1300);
    }
    function feedbackHTML(good, ans) {
      return good ? '<div class="chip" style="border-color:var(--green);color:var(--green)">¡Correcto! 👏</div>'
        : '<div class="chip" style="border-color:var(--red);color:var(--red)">Answer: ' + esc(ans) + '</div>';
    }
    function finishQuiz() {
      var pct = Math.round((correct / qs.length) * 100);
      view.innerHTML = '<div class="card center"><div class="done">' + (pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📖") + '</div>' +
        '<h1 style="margin:8px 0 4px">' + correct + ' / ' + qs.length + '</h1>' +
        '<p class="muted">' + (pct >= 80 ? "¡Excelente! You're mastering this." : pct >= 50 ? "Good work — keep practicing." : "Keep at it, you'll get there.") + '</p>' +
        '<button class="btn primary block" id="retry" style="margin-top:14px">Try again</button>' +
        '<button class="btn block" id="home2" style="margin-top:10px">Done</button></div>';
      document.getElementById("retry").onclick = function () { go("quiz", opts); };
      document.getElementById("home2").onclick = function () { back(); };
    }
    function back() { if (opts.id) go("lesson", opts.id); else go("review"); }
    draw();
  }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^(to |the |a )/, "").trim(); }

  /* ---- REVIEW (spaced repetition across all lessons) ---- */
  function review() {
    // prioritise words with lower mastery; include a mix
    var all = [];
    LESSONS.forEach(function (l) { l.words.forEach(function (w, i) { all.push({ lid: l.id, i: i, w: w, m: masteryOf(l.id, i) }); }); });
    var weak = all.filter(function (x) { return x.m < 4; });
    var pickFrom = weak.length ? weak : all;
    // weight toward weakest: sort by mastery, take up to 12
    pickFrom.sort(function (a, b) { return a.m - b.m; });
    var pick = pickFrom.slice(0, 12);

    view.innerHTML = '<div class="shead"><div><h1>Daily Review 🔁</h1><div class="sub">Spaced repetition across every lesson</div></div></div>' +
      '<div class="card center">' +
      '<p class="ink2" style="margin-top:0">Review resurfaces the words you find hardest so they stick. ' +
      (weak.length ? 'You have <b>' + weak.length + '</b> words that still need work.' : "You've mastered everything — great job! Here's a mixed refresher.") + '</p>' +
      '<div style="font-size:40px;margin:6px 0">' + (weak.length ? "🧠" : "🌟") + '</div>' +
      '<button class="btn primary block" id="start">Start review (' + pick.length + ' words)</button>' +
      '<button class="btn block" id="flashAll" style="margin-top:10px">Flashcard mode</button>' +
      '</div>' + statsMini();
    document.getElementById("start").onclick = function () {
      go("quiz", { words: pick, title: "Daily Review" });
    };
    document.getElementById("flashAll").onclick = function () { reviewFlash(pick); };
  }
  function statsMini() {
    return '<div class="stats"><div class="stat gold"><div class="v">' + state.xp + '</div><div class="l">XP</div></div>' +
      '<div class="stat green"><div class="v">' + masteredCount() + '</div><div class="l">Mastered</div></div>' +
      '<div class="stat red"><div class="v">' + overallProgress() + '%</div><div class="l">Complete</div></div></div>';
  }
  function reviewFlash(pick) {
    var order = shuffle(pick), pos = 0, flipped = false;
    function draw() {
      var it = order[pos], w = it.w;
      view.innerHTML = '<div class="shead"><button class="back" data-back>‹</button><div><h1>Review cards</h1></div></div>' +
        '<div class="countpill">Card ' + (pos + 1) + ' of ' + order.length + '</div>' +
        '<div class="flash' + (flipped ? ' flipped' : '') + '" id="flash"><div class="inner">' +
        '<div class="face front"><div class="lbl">Spanish</div><div class="big">' + esc(w.es) + '</div>' +
        (w.hint ? '<div class="hint">' + esc(w.hint) + '</div>' : '') + '<button class="spk" id="spk">🔊</button></div>' +
        '<div class="face back"><div class="lbl">English</div><div class="big">' + esc(w.en) + '</div></div>' +
        '</div></div>' +
        (flipped ? '<div class="btnrow"><button class="btn block" id="again">Again</button><button class="btn gold block" id="got">Got it 👍</button></div>'
                 : '<button class="btn primary block" id="reveal">Reveal</button>');
      view.querySelector("[data-back]").onclick = function () { go("review"); };
      var fc = document.getElementById("flash");
      document.getElementById("spk").onclick = function (e) { e.stopPropagation(); speak(w.es); };
      fc.onclick = function () { flipped = !flipped; draw(); };
      if (!flipped) { document.getElementById("reveal").onclick = function () { flipped = true; draw(); }; speak(w.es); }
      else {
        document.getElementById("again").onclick = function () { bumpMastery(it.lid, it.i, false); nx(); };
        document.getElementById("got").onclick = function () { bumpMastery(it.lid, it.i, true); addXP(2); nx(); };
      }
    }
    function nx() { pos++; flipped = false; if (pos >= order.length) return go("review"); draw(); }
    draw();
  }

  /* ---- TUTOR (AI chat with graceful fallback) ---- */
  var tutorReady = false;
  function tutor() {
    view.innerHTML = '<div class="shead"><div><h1>💬 Tutor</h1><div class="sub">Ask anything about Spanish — grammar, words, practice</div></div></div>' +
      '<div class="chat" id="chat"></div>' +
      '<div id="suggest"></div>' +
      '<div class="chatbar"><input id="cin" placeholder="Ask your tutor…" autocomplete="off"><button class="btn primary" id="send">Send</button></div>' +
      '<p class="muted center" style="font-size:11px;margin-top:10px">Tip: deploy with an Anthropic API key for a live AI tutor. Otherwise a built-in tutor answers.</p>';
    var chat = document.getElementById("chat");
    if (!state.chat.length) {
      state.chat.push({ role: "bot", text: "¡Hola! I'm your Spanish tutor. Ask me to translate something, explain grammar (like ser vs estar), or say \"quiz me\". You can type in English or Spanish." });
      save();
    }
    renderChat();
    var sug = document.getElementById("suggest");
    sug.innerHTML = ["How do I say 'I would like a coffee'?", "ser vs estar?", "Quiz me on food", "Give me a phrase"].map(function (s) {
      return '<button class="btn ghost" style="font-size:12px;padding:7px 11px;margin:0 6px 6px 0" data-s="' + esc(s) + '">' + esc(s) + '</button>';
    }).join("");
    sug.querySelectorAll("[data-s]").forEach(function (b) { b.onclick = function () { document.getElementById("cin").value = b.dataset.s; sendMsg(); }; });
    document.getElementById("send").onclick = sendMsg;
    document.getElementById("cin").addEventListener("keydown", function (e) { if (e.key === "Enter") sendMsg(); });

    function renderChat() {
      chat.innerHTML = state.chat.map(function (m) {
        return '<div class="msg ' + (m.role === "you" ? "you" : "bot") + '">' + esc(m.text) + '</div>';
      }).join("");
      chat.scrollTop = chat.scrollHeight;
      window.scrollTo(0, document.body.scrollHeight);
    }

    function sendMsg() {
      var inp = document.getElementById("cin"); var text = inp.value.trim(); if (!text) return;
      inp.value = "";
      state.chat.push({ role: "you", text: text }); save(); renderChat();
      state.chat.push({ role: "bot", text: "…" }); renderChat();
      askTutor(text).then(function (reply) {
        state.chat[state.chat.length - 1] = { role: "bot", text: reply };
        if (state.chat.length > 40) state.chat = state.chat.slice(-40);
        save(); renderChat();
      }).catch(function () {
        state.chat[state.chat.length - 1] = { role: "bot", text: localTutor(text) };
        save(); renderChat();
      });
    }
  }

  function askTutor(text) {
    // Try the serverless endpoint; if unavailable, use the local fallback.
    return fetch("/api/tutor", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: text, history: state.chat.slice(-10) }),
    }).then(function (r) {
      if (!r.ok) throw new Error("no api");
      return r.json();
    }).then(function (d) {
      if (d && d.reply) return d.reply;
      throw new Error("bad");
    }).catch(function () {
      return localTutor(text);
    });
  }

  /* Built-in scripted tutor — works fully offline. */
  function localTutor(text) {
    var t = text.toLowerCase();
    // translation lookups from our vocab
    var hit = lookupWord(t);
    if (hit) return "“" + hit.match + "” → **" + hit.answer + "**. Tap 🔊 on the flashcards to hear it. Want an example sentence?";
    if (/ser.*estar|estar.*ser|difference.*(ser|estar)/.test(t))
      return "ser vs estar — both mean “to be”:\n• SER = permanent / identity: Soy profesor. (I am a teacher.)\n• ESTAR = state / location: Estoy cansado. (I am tired.) · Estoy en casa. (I am at home.)\nRule of thumb: temporary or location → estar; essence → ser.";
    if (/quiz|test/.test(t)) { setTimeout(function () { go("review"); }, 400); return "Let's do it — opening a quick review quiz for you now. 💪"; }
    if (/phrase|say something|useful/.test(t)) { var p = PHRASES[Math.floor(Math.random() * PHRASES.length)]; return "Here's a useful one:\n**" + p.es + "** — " + p.en; }
    if (/i would like|me gustaría|quiero|i want/.test(t)) return "To order politely, use **Quería…** or **Me gustaría…** (I would like):\n• Me gustaría un café, por favor. — I'd like a coffee, please.\n• Quería la cuenta. — I'd like the bill.";
    if (/hello|hola|greeting/.test(t)) return "Greetings:\n• Hola — hi\n• Buenos días — good morning\n• ¿Qué tal? — how's it going?\n• Mucho gusto — nice to meet you";
    if (/gracias|thank/.test(t)) return "¡De nada! (You're welcome.) You can also say “no hay de qué” for “don't mention it.”";
    if (/help|what can you|how do you work/.test(t))
      return "I can:\n• Translate words & phrases (try “how do you say water?”)\n• Explain grammar (try “ser vs estar”)\n• Quiz you (“quiz me”)\n• Give useful phrases (“give me a phrase”)\nAsk away — in English or Spanish!";
    // generic
    return "Good question! I'm the built-in tutor, so I'm best at translations, common phrases, and grammar basics like ser/estar. Try “how do you say ___?” or “quiz me.” For full conversational answers, deploy the app with an Anthropic API key (see README).";
  }
  function lookupWord(t) {
    // "how do you say X" / "what is X in spanish" / "translate X"
    var m = t.match(/say ([a-z\s]+?)(?:\?|$| in spanish)/) || t.match(/translate ([a-z\s]+)/) || t.match(/what(?:'s| is)? ([a-z\s]+?)(?: in spanish|\?|$)/);
    var term = m ? m[1] : null;
    var all = [];
    LESSONS.forEach(function (l) { l.words.forEach(function (w) { all.push(w); }); });
    PHRASES.forEach(function (p) { all.push(p); });
    if (term) {
      term = term.trim();
      var f = all.find(function (w) { return norm(w.en) === norm(term) || norm(w.en).indexOf(norm(term)) > -1; });
      if (f) return { match: term, answer: f.es };
    }
    // reverse: spanish -> english
    var f2 = all.find(function (w) { return t.indexOf(norm(w.es)) > -1 && norm(w.es).length > 2; });
    if (f2) return { match: f2.es, answer: f2.en };
    return null;
  }

  /* ---------- boot ---------- */
  document.getElementById("nav").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return; go(b.dataset.go);
  });
  refreshDay(); renderStreak(); go("home");
})();
