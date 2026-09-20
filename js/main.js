/* Site behaviour: theme toggle, mobile menu, config-driven links, contact form. */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG;
  var root = document.documentElement;

  /* ---------- Links driven by js/config.js ---------- */
  document.querySelectorAll("[data-link]").forEach(function (el) {
    var key = el.getAttribute("data-link");
    if (key === "github") {
      el.href = CFG.githubUrl;
      if (el.classList.contains("text-link") === false) el.textContent = CFG.githubUrl.replace("https://", "");
    } else if (key === "source") {
      el.href = CFG.sourceUrl;
    } else if (key.indexOf("repo:") === 0) {
      var repo = CFG.projectRepos[key.slice(5)];
      if (repo) { el.href = CFG.repoUrl(repo); el.target = "_blank"; el.rel = "noopener"; }
      else { el.hidden = true; }
    }
  });

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.getElementById("theme-toggle");
  function syncThemeLabel() {
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  syncThemeLabel();
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* storage may be blocked */ }
    syncThemeLabel();
  });

  /* ---------- Header: border on scroll, mobile menu ---------- */
  var header = document.getElementById("site-header");
  var menuBtn = document.getElementById("menu-btn");
  var nav = document.getElementById("site-nav");

  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    header.classList.toggle("nav-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  }
  menuBtn.addEventListener("click", function () { setMenu(!header.classList.contains("nav-open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("nav-open")) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Highlight the current section in the nav ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          var active = a.getAttribute("href") === "#" + entry.target.id;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("cf-status");
  var submit = document.getElementById("cf-submit");

  function setStatus(message, kind) {
    status.textContent = message;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = form.elements.name;
    var email = form.elements.email;
    var message = form.elements.message;

    [name, email, message].forEach(function (f) { f.removeAttribute("aria-invalid"); });

    var problem = null;
    if (!name.value.trim()) problem = { field: name, text: "Enter your name so I know who to reply to." };
    else if (!email.value.trim() || !email.checkValidity()) problem = { field: email, text: "Enter a valid email address so I can reply." };
    else if (!message.value.trim()) problem = { field: message, text: "Write a message before sending." };

    if (problem) {
      problem.field.setAttribute("aria-invalid", "true");
      problem.field.focus();
      setStatus(problem.text, "error");
      return;
    }

    // Spam trap: bots fill hidden fields. Pretend it worked and send nothing.
    if (form.elements._gotcha.value) { form.reset(); setStatus("Message sent.", "ok"); return; }

    var payload = { name: name.value.trim(), email: email.value.trim(), message: message.value.trim() };

    // Formspree is not set up yet: hand the message to the visitor's email app instead.
    if (!CFG.formConfigured) {
      var subject = "Portfolio message from " + payload.name;
      var body = payload.message + "\n\n" + payload.name + "\n" + payload.email;
      window.location.href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      setStatus("Opening your email app. If nothing opens, email " + CFG.email + " directly.", "ok");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending";
    setStatus("", "");

    fetch(CFG.formEndpoint, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error("Request failed with status " + res.status);
      form.reset();
      setStatus("Message sent. I'll reply to " + payload.email + ".", "ok");
    }).catch(function () {
      setStatus("The message didn't send. Check your connection and try again, or email " + CFG.email + " directly.", "error");
    }).then(function () {
      submit.disabled = false;
      submit.textContent = "Send message";
    });
  });
})();
