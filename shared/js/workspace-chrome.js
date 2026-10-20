/* Original rail interaction: narrow icons, hover/focus expansion and a keep-open preference. */
(() => {
  "use strict";
  let mounted = null;
  const preference = "yarmouk:sidebar:pinned";
  window.YarmoukChrome = {
    syncTheme() {
      const dark = document.documentElement.dataset.theme === "dark";
      document.querySelectorAll('[data-action="theme"]').forEach((button) => {
        const label = dark ? "Switch to light mode" : "Switch to dark mode";
        button.setAttribute("aria-label", label);
        button.title = label;
        const icon = button.querySelector("i");
        if (icon) icon.className = "bi bi-" + (dark ? "sun" : "moon-stars");
        const text = button.querySelector("span");
        if (text) text.textContent = dark ? "Light mode" : "Dark mode";
      });
    },
    mountSidebar() {
      mounted?.dispose();
      const sidebar = document.querySelector(".sidebar"),
        rail = document.querySelector(".sidebar-rail");
      if (!sidebar || !rail) {
        mounted = null;
        return;
      }
      const toggle = sidebar.querySelector(".sidebar-toggle"),
        pin = sidebar.querySelector(".sidebar-pin"),
        mobileToggle = document.querySelector(".mobile-toggle");
      const small = matchMedia("(max-width:1080px)");
      let pinned = false,
        hovering = false,
        keyboardFocus = false,
        manual = false,
        mobileOpen = false,
        suppressed = false,
        timer;
      try {
        pinned = sessionStorage.getItem(preference) === "true";
      } catch {}
      const save = () => {
        try {
          sessionStorage.setItem(preference, String(pinned));
        } catch {}
      };
      function render() {
        const expanded = small.matches
          ? mobileOpen
          : pinned || manual || (!suppressed && (hovering || keyboardFocus));
        rail.classList.toggle("is-open", expanded && !small.matches);
        sidebar.classList.toggle("is-collapsed", !expanded);
        sidebar.classList.toggle("open", mobileOpen && small.matches);
        toggle.setAttribute("aria-expanded", String(expanded));
        toggle.setAttribute(
          "aria-label",
          expanded ? "Collapse navigation" : "Expand navigation",
        );
        toggle.title = expanded ? "Collapse navigation" : "Expand navigation";
        toggle.querySelector("i").className = "bi bi-chevron-left";
        pin.setAttribute("aria-checked", String(pinned));
        mobileToggle?.setAttribute(
          "aria-expanded",
          String(mobileOpen && small.matches),
        );
      }
      sidebar.addEventListener("pointerenter", (event) => {
        if (small.matches || event.pointerType === "touch") return;
        clearTimeout(timer);
        hovering = true;
        suppressed = false;
        render();
      });
      sidebar.addEventListener("pointerleave", () => {
        if (small.matches) return;
        timer = setTimeout(() => {
          hovering = false;
          manual = false;
          suppressed = false;
          render();
        }, 220);
      });
      sidebar.addEventListener("focusin", (event) => {
        if (event.target.matches(":focus-visible")) {
          keyboardFocus = true;
          render();
        }
      });
      sidebar.addEventListener("focusout", (event) => {
        if (!sidebar.contains(event.relatedTarget)) {
          keyboardFocus = false;
          render();
        }
      });
      toggle.addEventListener("click", () => {
        if (small.matches) {
          mobileOpen = !mobileOpen;
        } else if (rail.classList.contains("is-open")) {
          pinned = false;
          manual = false;
          hovering = false;
          keyboardFocus = false;
          suppressed = true;
          save();
        } else {
          manual = true;
          suppressed = false;
        }
        render();
      });
      pin.addEventListener("click", () => {
        pinned = !pinned;
        manual = false;
        save();
        render();
      });
      function onKey(event) {
        if (event.key !== "Escape") return;
        mobileOpen = false;
        manual = false;
        keyboardFocus = false;
        hovering = false;
        suppressed = true;
        if (small.matches) mobileToggle?.focus();
        render();
      }
      function outside(event) {
        if (
          small.matches &&
          mobileOpen &&
          !sidebar.contains(event.target) &&
          !mobileToggle?.contains(event.target)
        ) {
          mobileOpen = false;
          render();
        }
      }
      function breakpoint() {
        mobileOpen = false;
        hovering = false;
        keyboardFocus = false;
        render();
      }
      document.addEventListener("keydown", onKey);
      document.addEventListener("click", outside);
      small.addEventListener("change", breakpoint);
      mounted = {
        toggleMobile() {
          mobileOpen = !mobileOpen;
          render();
          if (mobileOpen) sidebar.querySelector(".nav-item")?.focus();
        },
        dispose() {
          clearTimeout(timer);
          document.removeEventListener("keydown", onKey);
          document.removeEventListener("click", outside);
          small.removeEventListener("change", breakpoint);
        },
      };
      render();
      this.syncTheme();
    },
    toggleMobile() {
      mounted?.toggleMobile();
    },
  };
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".studio-account[open]").forEach((menu) => {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape")
      document.querySelectorAll(".studio-account[open]").forEach((menu) => {
        menu.open = false;
        menu.querySelector("summary").focus();
      });
  });
})();
