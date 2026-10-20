/* Decorative correspondence animation. The shared contact form owns validation and saving. */
(() => {
  "use strict";

  function mount() {
    const form = document.querySelector('[data-form="contact"]');
    const host = document.querySelector(".contact-letter-mount");
    if (!form || !host || host.children.length) return false;

    host.innerHTML = `
      <div class="contact-postcard" data-state="opening" data-field="name" aria-hidden="true">
        <div class="letter-model">
          <div class="envelope-back"></div><div class="envelope-flap"></div>
          <div class="letter-slot"><div class="letter-paper">
            <img src="../../assets/yarmouk-logo-on-light.svg" width="140" height="49" alt="">
            <span class="letter-recipient">To the Internship Coordinator</span>
            <svg class="letter-ink" viewBox="0 0 230 160" fill="none">
              <path class="ink-name" pathLength="1" d="M18 19c8-12 6 9 13 0s6 6 13-1 8 7 15-1 7 6 15-1 7 6 16 0"/>
              <path class="ink-email" pathLength="1" d="M18 40c7-6 9 6 16 0s8 5 17-1 7 6 16 0 9 5 18-1 10 5 19-1 9 6 18 0"/>
              <path class="ink-subject" pathLength="1" d="M18 70c7-9 9 6 17-1s8 8 16 0 9 7 17-1 8 8 18-1 8 8 18 0 9 7 19-1 9 7 20 0 8 6 17-1"/>
              <path class="ink-message-0" pathLength="1" d="M18 99c6-8 8 7 15 0s8 6 17 0 7 7 16-1 8 8 17 0 8 6 17-1 9 6 18 0 9 6 18-1 9 6 18 0 8 5 16 0 9 5 17-1"/>
              <path class="ink-message-1" pathLength="1" d="M18 119c7-8 9 7 17-1s8 7 17 0 8 7 16-1 9 8 17 0 9 7 18-1 9 7 18 0 9 6 18-1 9 6 18 0 8 6 17-1"/>
              <path class="ink-message-2" pathLength="1" d="M18 139c7-8 9 7 17-1s8 7 17 0 9 6 18-1 9 8 17 0 9 7 18-1 9 7 18 0"/>
            </svg>
            <span class="letter-marker"></span>
          </div></div>
          <div class="envelope-pocket"></div><div class="envelope-fold"></div>
          <span class="envelope-address">Yarmouk University</span>
          <span class="envelope-seal"><svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9"/></svg></span>
        </div>
      </div>
      <p class="contact-letter-caption">A note for your internship coordinator.</p>`;

    const art = host.querySelector(".contact-postcard");
    const caption = host.querySelector(".contact-letter-caption");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const strokes = ["name", "email", "subject", "message-0", "message-1", "message-2"];
    // Numeric stroke values live in a stylesheet; no inline style attributes or copied message text.
    const stylesheet = document.createElement("style");
    document.head.append(stylesheet);
    const rules = strokes.map((name, index) => {
      stylesheet.sheet.insertRule(`.contact-postcard .ink-${name} { stroke-dashoffset:1; }`, index);
      return stylesheet.sheet.cssRules[index];
    });
    function draw() {
      const length = name => form.elements.namedItem(name).value.trim().length;
      const values = [length("name") / 26, length("email") / 32, length("subject") / 45,
        length("message") / 55, (length("message") - 55) / 55, (length("message") - 110) / 55];
      rules.forEach((rule, index) => rule.style.strokeDashoffset = String(1 - Math.max(0, Math.min(1, values[index]))));
    }
    function focusField(event) {
      if (!strokes.includes(event.target.name) && event.target.name !== "message") return;
      art.dataset.state = "ready";
      art.dataset.field = event.target.name;
      caption.textContent = "A note for your internship coordinator.";
      caption.classList.remove("is-saved");
      draw();
    }
    form.addEventListener("focusin", focusField);
    form.addEventListener("invalid", focusField, true);
    form.addEventListener("input", draw);
    form.addEventListener("contact:saved", () => {
      art.dataset.state = reduced.matches ? "saved" : "posting";
      caption.textContent = "Saved in this browser session.";
      caption.classList.add("is-saved");
    });
    art.addEventListener("animationend", event => {
      if (event.animationName === "letter-rise" && art.dataset.state === "opening") art.dataset.state = "ready";
      if (event.animationName === "letter-close" && art.dataset.state === "posting") art.dataset.state = "saved";
    });
    reduced.addEventListener("change", () => {
      if (reduced.matches) art.dataset.state = caption.classList.contains("is-saved") ? "saved" : "ready";
    });
    if (reduced.matches) art.dataset.state = "ready";
    draw();
    return true;
  }

  // The public page is rendered after the existing session store becomes ready.
  if (!mount()) {
    const observer = new MutationObserver(() => { if (mount()) observer.disconnect(); });
    observer.observe(document.getElementById("app"), { childList: true, subtree: true });
  }
})();
