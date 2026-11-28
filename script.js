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
    const emailInput = document.getElementById("contact-email");
    const whatsappInput = document.getElementById("contact-whatsapp");
    const businessInput = document.getElementById("contact-business");
    const businessTypeSelect = document.getElementById("contact-business-type");
    const operatingSelect = document.getElementById("contact-operating");
    const challengeSelect = document.getElementById("contact-challenge");
    const revenueSelect = document.getElementById("contact-revenue");
    const clientSpendSelect = document.getElementById("contact-client-spend");
    const revenueGoalSelect = document.getElementById("contact-revenue-goal");
    const agencyHistorySelect = document.getElementById("contact-agency-history");
    const authoritySelect = document.getElementById("contact-authority");
    const timelineSelect = document.getElementById("contact-timeline");
    const submitBtn = document.getElementById("contact-submit");

    const selectFields = [
      { el: businessTypeSelect, errorId: "error-business-type", msg: "Please select your business type." },
      { el: operatingSelect, errorId: "error-operating", msg: "Please select how long you have been operating." },
      { el: challengeSelect, errorId: "error-challenge", msg: "Please select your main challenge." },
      { el: revenueSelect, errorId: "error-revenue", msg: "Please select your current monthly revenue." },
      { el: clientSpendSelect, errorId: "error-client-spend", msg: "Please select the average spend of one client." },
      { el: revenueGoalSelect, errorId: "error-revenue-goal", msg: "Please select your monthly revenue goal." },
      { el: agencyHistorySelect, errorId: "error-agency-history", msg: "Please let us know if you have worked with an agency before." },
      { el: authoritySelect, errorId: "error-authority", msg: "Please let us know if you are the decision maker." },
      { el: timelineSelect, errorId: "error-timeline", msg: "Please select when you want to start." },
    ];

    const setFieldError = (field, errorId, message) => {
      const errorEl = document.getElementById(errorId);
      if (field) {
        field.setAttribute("aria-invalid", message ? "true" : "false");
      }
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = !message;
      }
    };

    const qualificationStatusInput = document.getElementById("qualification-status");
    const qualificationNoteInput = document.getElementById("qualification-note");

    const showFeedback = (type, text, showCalendly = false, title = "", applicant = {}) => {
      formFeedback.className = `form-feedback form-feedback--${type}`;
      formFeedback.replaceChildren();

      if (title) {
        const titleEl = document.createElement("p");
        titleEl.className = "form-feedback-title";
        titleEl.textContent = title;
        formFeedback.appendChild(titleEl);
      }

      const messageEl = document.createElement("p");
      messageEl.textContent = text;
      formFeedback.appendChild(messageEl);

      if (showCalendly) {
        const params = new URLSearchParams({ hide_gdpr_banner: "1" });
        if (applicant.name) params.set("name", applicant.name);
        if (applicant.email) params.set("email", applicant.email);

        const calendlyUrl = `https://calendly.com/jovinabesiga/30min?${params.toString()}`;

        const embedWrap = document.createElement("div");
        embedWrap.className = "calendly-embed-wrap";

        const iframe = document.createElement("iframe");
        iframe.className = "calendly-embed";
        iframe.src = calendlyUrl;
        iframe.title = "Book Your Free Strategy Call on Calendly";
        iframe.loading = "lazy";
        embedWrap.appendChild(iframe);
        formFeedback.appendChild(embedWrap);

        const actionWrap = document.createElement("div");
        actionWrap.className = "form-feedback-action";

        const calendlyLink = document.createElement("a");
        calendlyLink.href = calendlyUrl;
        calendlyLink.target = "_blank";
        calendlyLink.rel = "noopener noreferrer";
        calendlyLink.className = "btn btn--primary btn--full";
        calendlyLink.textContent = "Open Calendly in New Tab";

        actionWrap.appendChild(calendlyLink);
        formFeedback.appendChild(actionWrap);
      }

      formFeedback.hidden = false;
    };

    const evaluateQualification = () => {
      const revenue = revenueSelect instanceof HTMLSelectElement ? revenueSelect.value : "";
      const isBelowThousand =
        revenue === "Pre revenue / Starting out" || revenue === "Under $1,000";

      if (!isBelowThousand) {
        return {
          qualified: true,
          note: `Qualified (${revenue || "$1,000+ monthly revenue"})`,
          title: "You Qualify for a Free Strategy Call",
          message:
            "Thank you for applying. Select a date and time on our calendar below to confirm your 30 minute strategy call.",
        };
      }

      return {
        qualified: false,
        note: `Monthly revenue is below $1,000 (${revenue})`,
        title: "Thank You for Applying",
        message:
          "Thank you for applying to Velocity Scales. Based on your current monthly revenue, paid Meta and Google Ads management is not the most profitable next step right now. We work best with businesses generating at least $1,000 per month so ad spend and management fees deliver a strong return. We wish you every success and look forward to hearing from you once you reach that stage.",
      };
    };

    const validateTextField = (input) => {
      if (!(input instanceof HTMLInputElement)) return true;

      if (input === nameInput) {
        if (input.value.trim().length < 2) {
          setFieldError(input, "error-name", "Please enter your name.");
          return false;
        }
        setFieldError(input, "error-name", "");
        return true;
      }

      if (input === emailInput) {
        const emailValue = input.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailValue)) {
          setFieldError(input, "error-email", "Please enter a valid email address.");
          return false;
        }
        setFieldError(input, "error-email", "");
        return true;
      }

      if (input === whatsappInput) {
        const digits = input.value.replace(/\D/g, "");
        if (digits.length < 7) {
          setFieldError(input, "error-whatsapp", "Please enter a valid WhatsApp number.");
          return false;
        }
        setFieldError(input, "error-whatsapp", "");
        return true;
      }

      if (input === businessInput) {
        if (input.value.trim().length < 2) {
          setFieldError(input, "error-business", "Please enter your business name.");
          return false;
        }
        setFieldError(input, "error-business", "");
        return true;
      }

      return true;
    };

    const validateSelectField = ({ el, errorId, msg }) => {
      if (!(el instanceof HTMLSelectElement)) return true;
      if (!el.value) {
        setFieldError(el, errorId, msg);
        return false;
      }
      setFieldError(el, errorId, "");
      return true;
    };

    const validateForm = () => {
      let missingCount = 0;

      [nameInput, emailInput, whatsappInput, businessInput].forEach((input) => {
        if (!validateTextField(input)) {
          missingCount += 1;
        }
      });

      selectFields.forEach((fieldObj) => {
        if (!validateSelectField(fieldObj)) {
          missingCount += 1;
        }
      });

      const requiredFields = contactForm.querySelectorAll("[required]");
      requiredFields.forEach((field) => {
        if (
          (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) &&
          !field.value.trim() &&
          field.getAttribute("aria-invalid") !== "true"
        ) {
          field.setAttribute("aria-invalid", "true");
          missingCount += 1;
        }
      });

      return {
        valid: missingCount === 0,
        missingCount,
      };
    };

    [nameInput, emailInput, whatsappInput, businessInput].forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.addEventListener("input", () => {
          if (input.getAttribute("aria-invalid") === "true") {
            validateTextField(input);
          }
        });
      }
    });

    selectFields.forEach((fieldObj) => {
      const { el } = fieldObj;
      if (el instanceof HTMLSelectElement) {
        el.addEventListener("change", () => {
          validateSelectField(fieldObj);
        });
      }
    });

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      formFeedback.hidden = true;

      const validation = validateForm();
      if (!validation.valid) {
        const plural = validation.missingCount === 1 ? "question" : "questions";
        showFeedback(
          "error",
          `Please answer every compulsory question before booking. (${validation.missingCount} ${plural} still missing.)`,
          false,
          "All Questions Are Required"
        );
        const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid instanceof HTMLElement) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
          firstInvalid.focus({ preventScroll: true });
        }
        return;
      }

      const originalLabel = submitBtn ? submitBtn.textContent : "Book Your Free Strategy Call";
      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }

      const applicant = {
        name: nameInput instanceof HTMLInputElement ? nameInput.value.trim() : "",
        email: emailInput instanceof HTMLInputElement ? emailInput.value.trim() : "",
      };

      const result = evaluateQualification();
      if (qualificationStatusInput instanceof HTMLInputElement) {
        qualificationStatusInput.value = result.qualified ? "Qualified" : "Politely Declined";
      }
      if (qualificationNoteInput instanceof HTMLInputElement) {
        qualificationNoteInput.value = result.note;
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
          console.warn(`Form POST returned ${response.status}; showing qualification result locally.`);
        }
      } catch (err) {
        console.warn("Form POST could not complete:", err);
      } finally {
        contactForm.reset();
        if (result.qualified) {
          showFeedback("success", result.message, true, result.title, applicant);
        } else {
          showFeedback("declined", result.message, false, result.title);
        }

        formFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });

        if (submitBtn instanceof HTMLButtonElement) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel || "Book Your Free Strategy Call";
        }
      }
    });
  }
})();
