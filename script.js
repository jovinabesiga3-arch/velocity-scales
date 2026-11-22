/* Velocity Scales — Vanilla JS Interactions (Menu, FAQ Accordion, Scroll Reveal, Netlify Form) */

(() => {
  const root = document.documentElement;
  root.classList.add("js-enabled");

  // 1. Mobile Navigation Drawer
  const menuToggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (menuToggle && mobileNav) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
    };

    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isExpanded));
      mobileNav.hidden = isExpanded;
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileNav.hidden) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  // 2. Accessible FAQ Accordion
  const faqTriggers = document.querySelectorAll(".faq-trigger");

  faqTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      const parentItem = trigger.closest(".faq-item");
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      // Collapse other open FAQ items for focused reading on mobile
      faqTriggers.forEach((otherTrigger) => {
        if (otherTrigger !== trigger) {
          const otherPanelId = otherTrigger.getAttribute("aria-controls");
          const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
          const otherItem = otherTrigger.closest(".faq-item");
          otherTrigger.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.hidden = true;
          if (otherItem) otherItem.setAttribute("data-open", "false");
        }
      });

      const nextExpanded = !isExpanded;
      trigger.setAttribute("aria-expanded", String(nextExpanded));
      if (panel) panel.hidden = !nextExpanded;
      if (parentItem) parentItem.setAttribute("data-open", String(nextExpanded));
    });
  });

  // 3. Smooth Scroll Animations via IntersectionObserver
  const revealElements = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -32px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // 4. Netlify Contact Form Validation & AJAX Submission
  const contactForm = document.getElementById("contact-form");
  const formFeedback = document.getElementById("form-feedback");

  if (contactForm instanceof HTMLFormElement && formFeedback) {
    const nameInput = document.getElementById("contact-name");
    const businessInput = document.getElementById("contact-business");
    const phoneInput = document.getElementById("contact-phone");
    const submitBtn = document.getElementById("contact-submit");

    const setFieldError = (input, errorId, message) => {
      const errorEl = document.getElementById(errorId);
      if (input) {
        input.setAttribute("aria-invalid", message ? "true" : "false");
      }
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = !message;
      }
    };

    const showFeedback = (type, text) => {
      formFeedback.className = `form-feedback form-feedback--${type}`;
      formFeedback.textContent = text;
      formFeedback.hidden = false;
    };

    const validateForm = () => {
      let valid = true;

      if (nameInput instanceof HTMLInputElement) {
        if (nameInput.value.trim().length < 2) {
          setFieldError(nameInput, "error-name", "Please enter your name.");
          valid = false;
        } else {
          setFieldError(nameInput, "error-name", "");
        }
      }

      if (businessInput instanceof HTMLInputElement) {
        if (businessInput.value.trim().length < 2) {
          setFieldError(businessInput, "error-business", "Please enter your business name.");
          valid = false;
        } else {
          setFieldError(businessInput, "error-business", "");
        }
      }

      if (phoneInput instanceof HTMLInputElement) {
        const digits = phoneInput.value.replace(/\D/g, "");
        if (digits.length < 7) {
          setFieldError(phoneInput, "error-phone", "Please enter a valid WhatsApp or phone number.");
          valid = false;
        } else {
          setFieldError(phoneInput, "error-phone", "");
        }
      }

      return valid;
    };

    [nameInput, businessInput, phoneInput].forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.addEventListener("input", () => {
          if (input.getAttribute("aria-invalid") === "true") {
            validateForm();
          }
        });
      }
    });

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      formFeedback.hidden = true;

      if (!validateForm()) {
        return;
      }

      const originalLabel = submitBtn ? submitBtn.textContent : "Request a Callback";
      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      try {
        const formData = new FormData(contactForm);
        const body = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
          if (typeof value === "string") {
            body.append(key, value);
          }
        }

        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        if (!response.ok) {
          throw new Error(`Submission returned ${response.status}`);
        }

        contactForm.reset();
        showFeedback(
          "success",
          "Thanks! Your details have been sent. Expect a message from Velocity Scales shortly, or tap WhatsApp for an immediate reply."
        );
      } catch (_err) {
        showFeedback(
          "error",
          "We could not submit the form from this preview environment. For instant help, tap the WhatsApp button to message us directly."
        );
      } finally {
        if (submitBtn instanceof HTMLButtonElement) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel || "Request a Callback";
        }
      }
    });
  }
})();
