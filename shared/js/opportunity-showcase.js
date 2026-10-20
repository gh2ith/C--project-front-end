/* A single catalog with direct manipulation and an interruptible scroll spring. */
(() => {
  "use strict";
  window.YarmoukOpportunityShowcase = (host, C) => {
    const {
      opportunities,
      U,
      E,
      icon,
      companyName,
      majorName,
      date,
      status,
      url,
      link,
      empty,
    } = C;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let selectedId = "",
      cleanup = () => {};
    host.innerHTML = `<section class="opportunity-showcase" aria-label="Explore internships"><div class="showcase-toolbar"><label class="showcase-search"><span>Search internships</span><div>${icon("search")}<input id="opportunity-search" type="search" placeholder="Role, company or location" autocomplete="off"></div></label><p class="showcase-count" role="status" aria-live="polite"></p></div><div class="showcase-results"></div></section>`;
    const render = () => {
      cleanup();
      const query = host.querySelector("input").value.trim().toLowerCase();
      const ops = opportunities.filter((o) =>
        [o.title, companyName(o.companyId), o.location, o.requirements]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
      host.querySelector(".showcase-count").textContent =
        `${ops.length} ${ops.length === 1 ? "opportunity" : "opportunities"} for your major`;
      const results = host.querySelector(".showcase-results");
      if (!ops.length) {
        results.innerHTML = empty(
          query ? "No internships found" : "No open opportunities yet",
          query
            ? "Try another role, company or location."
            : "Open roles for your major will appear here.",
        );
        return;
      }
      results.innerHTML = `<div class="showcase-track" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Internship opportunities" aria-describedby="showcase-hint">${ops
        .map((o, i) => {
          const company = companyName(o.companyId),
            initials = company
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("");
          const application = U.all("applications").find(
            (a) => a.studentId === U.userId && a.opportunityId === o.id,
          );
          return `<article class="showcase-slide" data-id="${E(o.id)}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${ops.length}: ${E(o.title)}"><div class="showcase-identity"><div class="showcase-company"><span aria-hidden="true">${E(initials)}</span><div><p>${E(company)}</p><small>${E(U.db.companies[o.companyId]?.industry || "Technology")}</small></div></div><h2>${E(o.title)}</h2><p class="showcase-location">${icon("geo-alt")} ${E(o.location)}</p><div class="showcase-identity-foot">${icon("briefcase")}<span>Practical internship</span></div></div><div class="showcase-role"><dl class="showcase-facts"><div><dt>Training</dt><dd>${E(U.user.requiredHours)} hours</dd></div><div><dt>Apply by</dt><dd>${date(o.deadline)}</dd></div><div><dt>Available seats</dt><dd>${E(o.seats)}</dd></div></dl><div class="showcase-copy"><section><h3>The opportunity</h3><p>${E(o.description)}</p></section><section><h3>What you’ll bring</h3><p>${E(o.requirements)}</p></section></div><footer class="showcase-apply">${application ? `<div>${status(application.status)}<p>Your application is in Applications.</p></div>${link("View my application", "student", "applications")}` : U.placement(U.userId) ? "<p>You already have a confirmed internship.</p>" : `<p>Ready to put your learning to work?</p>${link("Apply for this internship", "student", "apply", "?opportunity=" + o.id, true)}`}</footer></div></article>`;
        })
        .join(
          "",
        )}</div><div class="showcase-controls"><p id="showcase-hint">${icon("hand-index")} <span>Drag or swipe to explore</span></p><div class="showcase-stepper"><button type="button" class="showcase-arrow" data-step="-1" aria-label="Previous opportunity">${icon("arrow-left")}</button><span class="showcase-position" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" class="showcase-arrow" data-step="1" aria-label="Next opportunity">${icon("arrow-right")}</button></div></div><nav class="showcase-chooser" aria-label="Choose an opportunity">${ops.map((o, i) => `<button type="button" data-slide="${i}" aria-controls="showcase-slide-${E(o.id)}"><span>${String(i + 1).padStart(2, "0")}</span><div><small>${E(companyName(o.companyId))}</small><strong>${E(o.title)}</strong></div></button>`).join("")}</nav>`;
      const track = results.querySelector(".showcase-track"),
        slides = [...track.children];
      const choices = [...results.querySelectorAll("[data-slide]")];
      const previous = results.querySelector('[data-step="-1"]'),
        next = results.querySelector('[data-step="1"]');
      let index = Math.max(
        0,
        ops.findIndex((o) => o.id === selectedId),
      );
      let frame = 0,
        velocity = 0,
        lastTime = 0,
        target = 0,
        dragging = null,
        suppressClick = false,
        settleTimer = 0;
      const position = (i) =>
        slides[i].offsetLeft - (track.clientWidth - slides[i].offsetWidth) / 2;
      const nearest = () =>
        slides.reduce(
          (best, s, i) =>
            Math.abs(position(i) - track.scrollLeft) <
            Math.abs(position(best) - track.scrollLeft)
              ? i
              : best,
          0,
        );
      const sync = (i) => {
        index = i;
        selectedId = ops[i].id;
        slides.forEach((slide, j) => {
          slide.id = "showcase-slide-" + ops[j].id;
          slide.classList.toggle("is-selected", j === i);
          slide.inert = j !== i;
          slide.setAttribute("aria-hidden", String(j !== i));
          choices[j].setAttribute("aria-current", j === i ? "true" : "false");
        });
        previous.disabled = i === 0;
        next.disabled = i === ops.length - 1;
        results.querySelector(".showcase-position").textContent =
          `${i + 1} / ${ops.length}`;
      };
      const stop = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        track.classList.remove("is-moving");
      };
      const tick = (time) => {
        if (!host.isConnected) {
          stop();
          return;
        }
        const dt = Math.min((time - lastTime) / 1000 || 1 / 60, 1 / 30);
        lastTime = time;
        // Near-critical damping carries the current velocity through reversals.
        const acceleration = (target - track.scrollLeft) * 185 - velocity * 26;
        velocity += acceleration * dt;
        track.scrollLeft += velocity * dt;
        if (
          Math.abs(target - track.scrollLeft) < 0.8 &&
          Math.abs(velocity) < 10
        ) {
          track.scrollLeft = target;
          velocity = 0;
          stop();
          return;
        }
        frame = requestAnimationFrame(tick);
      };
      const select = (i, animate = true) => {
        i = Math.max(0, Math.min(ops.length - 1, i));
        sync(i);
        target = position(i);
        if (reduced.matches || !animate) {
          stop();
          track.scrollLeft = target;
          velocity = 0;
          return;
        }
        track.classList.add("is-moving");
        if (!frame) {
          lastTime = performance.now();
          frame = requestAnimationFrame(tick);
        }
      };
      previous.addEventListener("click", () => select(index - 1));
      next.addEventListener("click", () => select(index + 1));
      choices.forEach((choice, i) =>
        choice.addEventListener("click", () => select(i)),
      );
      track.addEventListener("keydown", (e) => {
        if (e.target !== track) return;
        const key = {
          ArrowRight: index + 1,
          ArrowLeft: index - 1,
          Home: 0,
          End: ops.length - 1,
        }[e.key];
        if (key !== undefined) {
          e.preventDefault();
          select(key);
        }
      });
      track.addEventListener(
        "scroll",
        () => {
          if (frame || dragging) return;
          clearTimeout(settleTimer);
          settleTimer = setTimeout(() => {
            if (!frame && !dragging) sync(nearest());
          }, 110);
        },
        { passive: true },
      );
      track.addEventListener("pointerdown", (e) => {
        if (
          e.pointerType !== "mouse" ||
          e.button !== 0 ||
          e.target.closest("a,button,input")
        )
          return;
        stop();
        velocity = 0;
        dragging = {
          id: e.pointerId,
          start: e.clientX,
          left: track.scrollLeft,
          last: e.clientX,
          time: performance.now(),
          moved: false,
        };
      });
      track.addEventListener("pointermove", (e) => {
        if (!dragging || e.pointerId !== dragging.id) return;
        const d = dragging,
          delta = e.clientX - d.start;
        if (!d.moved && Math.abs(delta) < 6) return;
        if (!d.moved) {
          d.moved = true;
          track.setPointerCapture(e.pointerId);
          track.classList.add("is-dragging");
        }
        const now = performance.now();
        velocity = ((d.last - e.clientX) / Math.max(8, now - d.time)) * 1000;
        d.last = e.clientX;
        d.time = now;
        track.scrollLeft = d.left - delta;
        e.preventDefault();
      });
      const release = (e) => {
        if (!dragging || e.pointerId !== dragging.id) return;
        const d = dragging;
        dragging = null;
        track.classList.remove("is-dragging");
        if (!d.moved) return;
        suppressClick = true;
        if (performance.now() - d.time > 100) velocity = 0;
        const projected = track.scrollLeft + velocity * 0.16;
        const landing = slides.reduce(
          (best, s, i) =>
            Math.abs(position(i) - projected) <
            Math.abs(position(best) - projected)
              ? i
              : best,
          0,
        );
        select(landing);
        if (track.hasPointerCapture(e.pointerId))
          track.releasePointerCapture(e.pointerId);
        setTimeout(() => (suppressClick = false), 0);
      };
      track.addEventListener("pointerup", release);
      track.addEventListener("pointercancel", release);
      track.addEventListener(
        "click",
        (e) => {
          if (suppressClick) {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        true,
      );
      track.addEventListener("dragstart", (e) => e.preventDefault());
      track.addEventListener(
        "wheel",
        () => {
          if (frame) {
            stop();
            velocity = 0;
          }
        },
        { passive: true },
      );
      const resize = new ResizeObserver(() => {
        if (!dragging) select(index, false);
      });
      resize.observe(track);
      const onReduced = () => {
        if (reduced.matches) select(index, false);
      };
      reduced.addEventListener("change", onReduced);
      select(index, false);
      cleanup = () => {
        stop();
        clearTimeout(settleTimer);
        resize.disconnect();
        reduced.removeEventListener("change", onReduced);
      };
    };
    host.querySelector("input").addEventListener("input", render);
    render();
  };
})();
