/**
 * ============================================================================
 * YARMOUK UNIVERSITY INTERNSHIP MANAGEMENT SYSTEM
 * Official Stone Arch Gateway Controller (login.js)
 * Faculty of Information Technology and Computer Science
 * ============================================================================
 * Responsibilities:
 * 1. Reactive visual state management for "The Gate" (Stone arch & doors).
 * 2. Form event binding: Email focus, password focus, typing dots, visibility toggle.
 * 3. 4-Role switching (Student, Academic Supervisor, Company Supervisor, Coordinator).
 * 4. Credential validation & role routing using local UIMS session authority.
 * ============================================================================
 */

(function () {
  "use strict";

  // ==========================================================================
  // 1. CONFIGURATION & DOM ELEMENTS
  // ==========================================================================
  const gatePanel = document.getElementById("gatePanel");
  const loginForm = document.getElementById("hrLoginForm");
  const emailInput = document.getElementById("loginEmail");
  const emailLabel = document.getElementById("loginEmailLabel");
  const emailHint = document.getElementById("loginEmailHint");
  const passwordInput = document.getElementById("loginPassword");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const toggleIcon = document.getElementById("toggleIcon");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  const loginSubmitBtnText = document.getElementById("loginSubmitBtnText");
  const loginToast = document.getElementById("loginToast");
  const loginToastMsg = document.getElementById("loginToastMsg");

  // 12 carved dots on the stone doors (6 per door leaf)
  const carvedDots = [];
  for (let i = 0; i < 12; i++) {
    const dotEl = document.getElementById(`gateDot${i}`);
    if (dotEl) carvedDots.push(dotEl);
  }

  // Accessibility media queries
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  // 4 Authorized Platform Roles & Metadata
  const ROLES = {
    student: {
      key: "student",
      title: "Student",
      label: "University email",
      hint: "Institutional domain: <code>yu.edu.jo</code>",
      defaultEmail: "student1@students.yu.edu.jo",
      btnText: "Sign In",
    },
    supervisor: {
      key: "supervisor",
      title: "Academic Supervisor",
      label: "Faculty email",
      hint: "Institutional domain: <code>yu.edu.jo</code>",
      defaultEmail: "academic@yu.edu.jo",
      btnText: "Sign In",
    },
    company: {
      key: "company",
      title: "Company Supervisor",
      label: "Company email",
      hint: "Partner domain: <code>northstar.example</code>",
      defaultEmail: "supervisor@northstar.example",
      btnText: "Sign In",
    },
    coordinator: {
      key: "coordinator",
      title: "University Internship Coordinator",
      label: "Coordinator email",
      hint: "Institutional domain: <code>yu.edu.jo</code>",
      defaultEmail: "coordinator@yu.edu.jo",
      btnText: "Sign In",
    },
  };

  let activeRole = "student";
  let isSubmitting = false;

  // ==========================================================================
  // 2. THE GATE VISUAL STATE MANAGEMENT
  // ==========================================================================

  // State 1: Parallax & Subtle Cursor Light (Desktop only)
  function initGateParallax() {
    if (!gatePanel || prefersReducedMotion.matches || !finePointer.matches) return;

    gatePanel.addEventListener("mouseenter", () => {
      gatePanel.classList.add("has-pointer");
    });

    gatePanel.addEventListener("mouseleave", () => {
      gatePanel.classList.remove("has-pointer");
      gatePanel.style.setProperty("--tilt-x", "0deg");
      gatePanel.style.setProperty("--tilt-y", "0deg");
    });

    gatePanel.addEventListener("mousemove", (e) => {
      const rect = gatePanel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gatePanel.style.setProperty("--mouse-x", `${x}px`);
      gatePanel.style.setProperty("--mouse-y", `${y}px`);

      // Gentle, dignified tilt (-3.5deg to +3.5deg max)
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;
      const tiltY = (normX * 3.5).toFixed(2);
      const tiltX = (-normY * 2.8).toFixed(2);

      gatePanel.style.setProperty("--tilt-y", `${tiltY}deg`);
      gatePanel.style.setProperty("--tilt-x", `${tiltX}deg`);
    });
  }

  // State 2: Email Focus (Golden Thread brightens smoothly)
  function initEmailReactions() {
    if (!emailInput || !gatePanel) return;

    emailInput.addEventListener("focus", () => {
      gatePanel.classList.add("is-email-focus");
    });

    emailInput.addEventListener("blur", () => {
      gatePanel.classList.remove("is-email-focus");
    });
  }

  // State 3 & 4: Password Focus & Typing Dot Arming
  function initPasswordReactions() {
    if (!passwordInput || !gatePanel) return;

    // Focus: Password field selected -> Activate seal aura & lock mechanism
    passwordInput.addEventListener("focus", () => {
      gatePanel.classList.add("is-password-focus", "is-doors-closed");
    });

    // Blur: Deactivate focus glow; reset reveal if empty
    passwordInput.addEventListener("blur", () => {
      gatePanel.classList.remove("is-password-focus");
      if (passwordInput.value.length === 0) {
        gatePanel.classList.remove("is-password-revealed");
        resetCarvedDots();
      }
    });

    // Typing: Map character count to up to 12 carved gold dots
    passwordInput.addEventListener("input", () => {
      const charCount = Math.min(passwordInput.value.length, 12);

      carvedDots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index < charCount);
      });
    });
  }

  function resetCarvedDots() {
    carvedDots.forEach((dot) => dot.classList.remove("is-active"));
  }

  // State 5: Show-Password Toggle (Doors crack open a narrow gap, gold light spills)
  function initShowPasswordToggle() {
    if (!togglePasswordBtn || !passwordInput || !toggleIcon || !gatePanel) return;

    togglePasswordBtn.addEventListener("click", () => {
      const isCurrentlyPassword = passwordInput.getAttribute("type") === "password";

      if (isCurrentlyPassword) {
        passwordInput.setAttribute("type", "text");
        toggleIcon.className = "bi bi-eye";
        togglePasswordBtn.setAttribute("aria-label", "Hide password");
        gatePanel.classList.add("is-password-revealed");
      } else {
        passwordInput.setAttribute("type", "password");
        toggleIcon.className = "bi bi-eye-slash";
        togglePasswordBtn.setAttribute("aria-label", "Show password");
        gatePanel.classList.remove("is-password-revealed");
      }
    });
  }

  // State 6: Wrong Credentials (One short, subtle tremor)
  function triggerGateError() {
    if (!gatePanel) return;

    gatePanel.classList.remove("is-error");
    void gatePanel.offsetWidth; // Force CSS reflow
    gatePanel.classList.add("is-error");

    setTimeout(() => {
      gatePanel.classList.remove("is-error");
    }, 450);
  }

  // State 7: Successful Login (Doors swing open, light floods arch, then redirect)
  function triggerGateSuccess(redirectCallback) {
    if (!gatePanel) {
      redirectCallback();
      return;
    }

    gatePanel.classList.remove("is-doors-closed", "is-password-revealed", "is-error");
    gatePanel.classList.add("is-success");

    // In reduced motion mode, proceed with immediate redirect without delay
    if (prefersReducedMotion.matches) {
      redirectCallback();
      return;
    }

    // Allow 1.2s for the doors to swing open and light to flood the gateway
    setTimeout(() => {
      redirectCallback();
    }, 1200);
  }

  // ==========================================================================
  // 3. ROLE SWITCHER & METADATA SYNCHRONIZATION
  // ==========================================================================
  function selectRole(roleKey) {
    if (!ROLES[roleKey] || isSubmitting) return;
    activeRole = roleKey;
    const roleData = ROLES[roleKey];

    // Update active role cards in UI
    document.querySelectorAll(".lb-role-card").forEach((card) => {
      const isCurrent = card.getAttribute("data-role") === roleKey;
      card.classList.toggle("is-active", isCurrent);
      card.setAttribute("aria-checked", isCurrent ? "true" : "false");
    });

    // Update form input defaults & labels
    if (emailInput) {
      emailInput.placeholder = roleData.defaultEmail;
      emailInput.value = roleData.defaultEmail;
      emailInput.classList.remove("is-invalid");
    }
    if (emailLabel) {
      emailLabel.innerHTML = `<i class="bi bi-envelope me-1"></i> ${roleData.label}`;
    }
    if (emailHint) {
      emailHint.innerHTML = `<i class="bi bi-info-circle me-1"></i> ${roleData.hint}`;
    }
    if (loginSubmitBtnText) {
      loginSubmitBtnText.textContent = roleData.btnText;
    }
    if (emailError) emailError.style.display = "none";
    if (passwordError) passwordError.style.display = "none";

    // Reset typing dots & reveal state if password was cleared
    if (passwordInput && passwordInput.value.length === 0 && gatePanel) {
      gatePanel.classList.remove("is-password-revealed");
      resetCarvedDots();
    }
  }

  function initRoleSelector() {
    document.querySelectorAll(".lb-role-card").forEach((card) => {
      card.addEventListener("click", () => {
        const roleKey = card.getAttribute("data-role");
        selectRole(roleKey);
      });
    });
  }

  // ==========================================================================
  // 4. FORM SUBMISSION, VALIDATION & ROLE-BASED ROUTING
  // ==========================================================================
  function showToast(message) {
    if (loginToast && loginToastMsg) {
      loginToastMsg.textContent = message;
      loginToast.style.display = "flex";
      setTimeout(() => {
        loginToast.style.display = "none";
      }, 3500);
    }
  }

  function initFormSubmission() {
    if (!loginForm) return;

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      let hasError = false;

      // Validate email format
      if (!email || !emailInput.validity.valid) {
        if (emailError) {
          emailError.textContent = "Invalid email address. Please try again.";
          emailError.style.display = "block";
        }
        if (emailInput) emailInput.classList.add("is-invalid");
        hasError = true;
      } else {
        if (emailError) emailError.style.display = "none";
        if (emailInput) emailInput.classList.remove("is-invalid");
      }

      // Validate password presence
      if (!password) {
        if (passwordError) {
          passwordError.textContent = "Invalid password. Please try again.";
          passwordError.style.display = "block";
        }
        if (passwordInput) passwordInput.classList.add("is-invalid");
        hasError = true;
      } else {
        if (passwordError) passwordError.style.display = "none";
        if (passwordInput) passwordInput.classList.remove("is-invalid");
      }

      if (hasError) {
        triggerGateError();
        return;
      }

      isSubmitting = true;
      if (loginSubmitBtn) loginSubmitBtn.disabled = true;

      // Access UIMS Storage authority (session key yarmouk:uims:v1)
      window.UIMS.ready
        .then(() => {
          const users = UIMS.db.users || {};
          const account = Object.entries(users).find(
            ([, u]) =>
              u.email.toLowerCase() === email.toLowerCase() &&
              u.role === activeRole &&
              u.status === "Active"
          );

          if (!account) {
            showToast("No active account matches the selected role and email address.");
            triggerGateError();
            isSubmitting = false;
            if (loginSubmitBtn) loginSubmitBtn.disabled = false;
            return;
          }

          // Authenticate session locally
          UIMS.signIn(account[0]);

          // Trigger "The Gate" opening transition before navigation
          triggerGateSuccess(() => {
            location.href = account[1].firstLogin
              ? "../first-login/first-login.html"
              : UIMS.route(activeRole, "dashboard");
          });
        })
        .catch(() => {
          showToast("The workspace session could not be established.");
          triggerGateError();
          isSubmitting = false;
          if (loginSubmitBtn) loginSubmitBtn.disabled = false;
        });
    });
  }

  // ==========================================================================
  // 5. PASSWORD RECOVERY MODAL HANDLERS
  // ==========================================================================
  function initForgotPasswordModal() {
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const forgotModal = document.getElementById("forgotPasswordModal");
    const closeForgotModalBtn = document.getElementById("closeForgotModalBtn");
    const cancelForgotBtn = document.getElementById("cancelForgotBtn");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const resetEmailInput = document.getElementById("resetEmail");

    function openModal() {
      if (!forgotModal) return;
      if (emailInput && resetEmailInput) {
        resetEmailInput.value = emailInput.value.trim();
      }
      forgotModal.style.display = "block";
      forgotModal.setAttribute("aria-hidden", "false");
      setTimeout(() => forgotModal.classList.add("show"), 10);
      setTimeout(() => resetEmailInput?.focus(), 40);
    }

    function closeModal() {
      if (!forgotModal) return;
      forgotModal.classList.remove("show");
      forgotModal.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        forgotModal.style.display = "none";
      }, 200);
      forgotPasswordLink?.focus();
    }

    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
      });
    }

    if (closeForgotModalBtn) closeForgotModalBtn.addEventListener("click", closeModal);
    if (cancelForgotBtn) cancelForgotBtn.addEventListener("click", closeModal);

    if (forgotModal) {
      forgotModal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          closeModal();
        }
      });
      forgotModal.addEventListener("click", (e) => {
        if (e.target === forgotModal) closeModal();
      });
    }

    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const resetAlert = document.getElementById("resetSuccessAlert");
        const submitBtn = document.getElementById("resetSubmitBtn");
        if (resetAlert) resetAlert.classList.remove("d-none");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Request Acknowledged";
        }
      });
    }
  }

  // ==========================================================================
  // 6. THEME CONTROLLER
  // ==========================================================================
  function initThemeController() {
    const loginThemeToggle = document.getElementById("loginThemeToggle");
    const loginThemeIcon = document.getElementById("loginThemeIcon");

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      if (loginThemeToggle) {
        const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
        loginThemeToggle.setAttribute("aria-label", label);
        loginThemeToggle.title = label;
      }
      if (loginThemeIcon) {
        loginThemeIcon.className = theme === "dark" ? "bi bi-sun-fill text-warning" : "bi bi-moon-stars";
      }
    }

    applyTheme("light");

    if (loginThemeToggle) {
      loginThemeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        applyTheme(currentTheme === "dark" ? "light" : "dark");
      });
    }
  }

  // ==========================================================================
  // 7. INITIALIZATION
  // ==========================================================================
  function init() {
    initGateParallax();
    initEmailReactions();
    initPasswordReactions();
    initShowPasswordToggle();
    initRoleSelector();
    initFormSubmission();
    initForgotPasswordModal();
    initThemeController();

    // Default to student role
    selectRole("student");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
