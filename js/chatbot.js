/*
 * Rule-based portfolio chatbot. Runs entirely in the browser: no server, API key, or third-party service.
 *
 * How it works
 *   1. A visitor's question is lowercased, stripped of punctuation, and split into words.
 *   2. Every intent in js/knowledge.js is scored by how many of its keywords appear in the question.
 *   3. The highest-scoring specific intent wins. Broad "generic" intents (overview, greetings) are only
 *      used when no specific intent scores, so "What experience do you have with communication?"
 *      gets the communication answer, not the general experience list.
 *   4. If nothing scores, the chatbot says so and suggests topics it can answer.
 *
 * To change what it says, edit js/knowledge.js. This file only contains the matching logic and the UI.
 */
(function () {
  "use strict";

  var KB = window.PORTFOLIO_KB;
  if (!KB) return;

  /* ==========================================================================
     Matching engine
     ========================================================================== */
  var MIN_SCORE = 2;

  function normalize(text) {
    return String(text).toLowerCase().replace(/['\u2019]/g, "").replace(/[^a-z0-9+#]+/g, " ").trim();
  }

  // Very light stemming: "skills" and "skill" match. Verbs use prefix keywords ("communicat*") instead.
  function stem(word) {
    return word.length > 3 && word.slice(-1) === "s" && word.slice(-2) !== "ss" ? word.slice(0, -1) : word;
  }

  function parseKeyword(raw) {
    var weight = null;
    var body = raw;
    var caret = raw.lastIndexOf("^");
    if (caret > -1) { weight = parseFloat(raw.slice(caret + 1)); body = raw.slice(0, caret); }

    var prefix = /\*$/.test(body);
    if (prefix) body = body.slice(0, -1);

    var norm = normalize(body);
    if (!norm) return null;

    if (prefix) return { type: "prefix", value: norm, weight: weight == null ? 2 : weight };

    var parts = norm.split(" ").map(stem);
    if (parts.length > 1) return { type: "phrase", value: parts.join(" "), weight: weight == null ? 4 : weight };
    return { type: "word", value: parts[0], weight: weight == null ? 2 : weight };
  }

  var intents = KB.intents.map(function (intent) {
    return { def: intent, keywords: intent.keywords.map(parseKeyword).filter(Boolean) };
  });

  var byId = {};
  KB.intents.forEach(function (intent) { byId[intent.id] = intent; });

  function scoreIntent(keywords, tokens, stemmed, padded) {
    var total = 0;
    keywords.forEach(function (k) {
      var hit;
      if (k.type === "word") hit = stemmed.indexOf(k.value) > -1;
      else if (k.type === "prefix") hit = tokens.some(function (t) { return t.indexOf(k.value) === 0; });
      else hit = padded.indexOf(" " + k.value + " ") > -1;
      if (hit) total += k.weight;
    });
    return total;
  }

  /** Returns the best matching intent for a question, or null if nothing matches. */
  function match(text) {
    var norm = normalize(text);
    if (!norm) return null;
    var tokens = norm.split(" ");
    var stemmed = tokens.map(stem);
    var padded = " " + stemmed.join(" ") + " ";

    var best = null;
    var bestGeneric = null;

    intents.forEach(function (entry) {
      var def = entry.def;
      if (def.maxTokens && tokens.length > def.maxTokens) return;
      var score = scoreIntent(entry.keywords, tokens, stemmed, padded);
      if (score < MIN_SCORE) return;
      if (def.generic) {
        if (!bestGeneric || score > bestGeneric.score) bestGeneric = { def: def, score: score };
      } else if (!best || score > best.score) {
        best = { def: def, score: score };
      }
    });

    var winner = best || bestGeneric;
    return winner ? winner.def : null;
  }

  window.PortfolioChat = { match: match, byId: byId };

  /* ==========================================================================
     Chat UI
     ========================================================================== */
  if (typeof document === "undefined") return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  var root = document.createElement("div");
  root.innerHTML =
    '<button class="chat-launcher" id="chat-launcher" type="button" aria-expanded="false" aria-controls="chat-panel">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12Z"/></svg>' +
      '<span>Ask about me</span>' +
    '</button>' +
    '<section class="chat-panel" id="chat-panel" role="dialog" aria-labelledby="chat-title" hidden>' +
      '<div class="chat-head">' +
        '<div><h2 id="chat-title">Ask about Efe</h2><p>Automated answers, based on my resume</p></div>' +
        '<button class="chat-close" id="chat-close" type="button" aria-label="Close chat">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="chat-log" id="chat-log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="chat-suggest" id="chat-suggest" role="group" aria-label="Suggested questions"></div>' +
      '<form class="chat-form" id="chat-form" autocomplete="off">' +
        '<label class="visually-hidden" for="chat-input">Your question</label>' +
        '<input id="chat-input" type="text" maxlength="200" placeholder="Ask a question">' +
        '<button type="submit">Send</button>' +
      '</form>' +
    '</section>';
  while (root.firstChild) document.body.appendChild(root.firstChild);

  var launcher = document.getElementById("chat-launcher");
  var panel = document.getElementById("chat-panel");
  var closeBtn = document.getElementById("chat-close");
  var log = document.getElementById("chat-log");
  var suggest = document.getElementById("chat-suggest");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");

  var started = false;
  var busy = false;

  function addMessage(who, html, isText) {
    var msg = document.createElement("div");
    msg.className = "msg " + who;
    var bubble = document.createElement("div");
    bubble.className = "bubble";
    if (isText) bubble.textContent = html; else bubble.innerHTML = html;
    msg.appendChild(bubble);
    log.appendChild(msg);
    return msg;
  }

  function scrollToMessage(msg, who) {
    // Bot answers can be long: show the start of the answer rather than the end.
    log.scrollTop = who === "bot" ? Math.max(msg.offsetTop - 8, 0) : log.scrollHeight;
  }

  function showSuggestions(ids) {
    suggest.textContent = "";
    ids.forEach(function (id) {
      var intent = byId[id];
      if (!intent || !intent.q) return;
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = intent.q;
      chip.addEventListener("click", function () { ask(intent.q, id); });
      suggest.appendChild(chip);
    });
  }

  function ask(text, forcedId) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;

    var userMsg = addMessage("user", text, true);
    scrollToMessage(userMsg, "user");
    suggest.textContent = "";

    var typing = addMessage("bot", '<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span><span class="visually-hidden">Typing</span>');
    scrollToMessage(typing, "user");

    setTimeout(function () {
      typing.remove();
      var intent = forcedId ? byId[forcedId] : match(text);
      var answer = intent ? intent : KB.fallback;
      var msg = addMessage("bot", answer.answer);
      scrollToMessage(msg, "bot");
      showSuggestions(answer.next || KB.starters);
      busy = false;
      if (finePointer) input.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 550);
  }

  function open() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (!started) {
      started = true;
      addMessage("bot", "<p>" + KB.intro + "</p>");
      showSuggestions(KB.starters);
    }
    input.focus({ preventScroll: true });
  }

  function close() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  launcher.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = input.value;
    input.value = "";
    ask(value);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden && panel.contains(document.activeElement)) close();
  });

  // On phones the panel covers the page, so close it when a link jumps to a section.
  log.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (link && window.innerWidth <= 520) { panel.hidden = true; launcher.setAttribute("aria-expanded", "false"); }
  });
})();
