/* =========================================================================
   ABRAJ SOLUTIONS — Core Engine
   =========================================================================
   Founder: Sai Teja Gandepalli
   Primary Email: saitejagandepalli8@gmail.com
   ========================================================================= */

/* =========================================================================
   BILLION PORTFOLIO — script.js
   =========================================================================
   Configured for: Sai Teja Gandepalli
   Founder Contact updated to: +91 85003 52030
   ========================================================================= */

const CONFIG = {
  // WhatsApp number in international format, digits only, no "+", no spaces.
  // Updated to: 918500352030
  whatsappNumber: "918500352030",
  whatsappDefaultMessage: "Hi, I am interested in scheduling an insurance consultation with ABRAJ Solutions.",

  // Contact email
  email: "saitejagandepalli8@gmail.com",
  emailSubject: "Inquiry - ABRAJ Solutions Protection Consultation",
  emailBody: "Hi Sai Teja,\n\nI visited the ABRAJ Solutions portal and want to review our protection options:\n\n- Scope of Requirement (Health/Life): \n- Sum Insured targets: \n- Best time to contact me: \n",

  // -----------------------------------------------------------------------
  // EMAIL — EmailJS configuration
  // -----------------------------------------------------------------------
  formMode: "emailjs",

  emailjs: {
    publicKey: "9yEUlCDQc19rrReYy",
    serviceId: "service_eiy6zkk",
    templateId: "template_8zhyuxf" // Please configure your actual Template ID here
  },

  // -----------------------------------------------------------------------
  // WHATSAPP SECURE PROXY (Meta Cloud API Backend endpoint)
  // -----------------------------------------------------------------------
  whatsappApi: {
    enabled: true,
    notifyEndpoint: "http://localhost:5000/api/whatsapp-notify"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileNav();
  initActiveNavOnScroll();
  initScrollReveal();
  initCountUp();
  initDirectContactLinks();
  initContactForm();
  initBackToTop();
  initToastClose();
  
  const yearElement = document.getElementById("currentYear");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

/* ---------------------------------------------------------------------
   Header background change on scroll threshold
--------------------------------------------------------------------- */
function initHeader() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  const toggle = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

/* ---------------------------------------------------------------------
   Mobile Navigation Menu handler
--------------------------------------------------------------------- */
function initMobileNav() {
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  if (!navToggle || !mainNav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll(".main-nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------------------------------------------------------------
   Active menu highlighting based on scrolling position
--------------------------------------------------------------------- */
function initActiveNavOnScroll() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll("[data-nav]");

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active-link", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------------------------------------------------------------------
   Scroll reveal animations
--------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".expertise-card, .project-card, .timeline-item, .contact-action, .contact-form-wrap, .section-head"
  );
  targets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------------
   Ease-out-cubic responsive metric counter animation
--------------------------------------------------------------------- */
function initCountUp() {
  const stats = document.querySelectorAll("[data-count-to]");
  if (!stats.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.countTo);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease-out-cubic
      const value = (target % 1 === 0) 
        ? Math.round(target * eased) 
        : (target * eased).toFixed(1);
      el.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  stats.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------------
   Formatting dynamic Mailto and WhatsApp links
--------------------------------------------------------------------- */
function buildWhatsappUrl(message) {
  const text = encodeURIComponent(message || CONFIG.whatsappDefaultMessage);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

function buildMailtoUrl(subject, body) {
  const params = new URLSearchParams({
    subject: subject || CONFIG.emailSubject,
    body: body || CONFIG.emailBody
  });
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${CONFIG.email}?${query}`;
}

function initDirectContactLinks() {
  const whatsappBtn = document.getElementById("whatsappBtn");
  const emailBtn = document.getElementById("emailBtn");
  const emailDisplay = document.getElementById("emailDisplay");

  if (whatsappBtn) whatsappBtn.setAttribute("href", buildWhatsappUrl());
  if (emailBtn) emailBtn.setAttribute("href", buildMailtoUrl());
  if (emailDisplay) emailDisplay.textContent = CONFIG.email;
}

/* ---------------------------------------------------------------------
   Advanced validations and form management
--------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const formWhatsappLink = document.getElementById("formWhatsappLink");
  if (!form || !submitBtn) return;

  const fields = {
    fullName: { el: document.getElementById("fullName"), errorEl: document.getElementById("fullNameError") },
    emailAddress: { el: document.getElementById("emailAddress"), errorEl: document.getElementById("emailAddressError") },
    subject: { el: document.getElementById("subject"), errorEl: document.getElementById("subjectError") },
    message: { el: document.getElementById("message"), errorEl: document.getElementById("messageError") }
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(key, message) {
    const fieldObj = fields[key];
    if (!fieldObj || !fieldObj.el || !fieldObj.errorEl) return;
    fieldObj.errorEl.textContent = message;
    fieldObj.el.closest(".form-field").classList.toggle("has-error", Boolean(message));
  }

  function validate() {
    let isValid = true;

    const name = fields.fullName.el.value.trim();
    if (!name) {
      setError("fullName", "Please enter your name.");
      isValid = false;
    } else if (name.length < 2) {
      setError("fullName", "That name looks too short.");
      isValid = false;
    } else {
      setError("fullName", "");
    }

    const email = fields.emailAddress.el.value.trim();
    if (!email) {
      setError("emailAddress", "Please write an email address.");
      isValid = false;
    } else if (!emailPattern.test(email)) {
      setError("emailAddress", "Please write a correct email standard.");
      isValid = false;
    } else {
      setError("emailAddress", "");
    }

    const subject = fields.subject.el.value.trim();
    if (!subject) {
      setError("subject", "Please specify a short subject topic.");
      isValid = false;
    } else {
      setError("subject", "");
    }

    const message = fields.message.el.value.trim();
    if (!message) {
      setError("message", "Please share a brief message detail.");
      isValid = false;
    } else if (message.length < 10) {
      setError("message", "Kindly write at least 10 letters outlining what you need.");
      isValid = false;
    } else {
      setError("message", "");
    }

    return isValid;
  }

  // Clear errors live on input
  Object.keys(fields).forEach((key) => {
    fields[key].el.addEventListener("input", () => {
      const parent = fields[key].el.closest(".form-field");
      if (parent && parent.classList.contains("has-error")) {
        setError(key, "");
      }
    });
  });

  // Keep WhatsApp message synchronization up-to-date
  function syncWhatsappHandoff() {
    const name = fields.fullName.el.value.trim();
    const subject = fields.subject.el.value.trim();
    const message = fields.message.el.value.trim();

    const composedText = [
      name ? `Hi, my name is ${name}.` : "Hi,",
      subject ? `Regarding: ${subject}.` : "",
      message || CONFIG.whatsappDefaultMessage
    ].filter(Boolean).join(" ");

    formWhatsappLink.setAttribute("href", buildWhatsappUrl(composedText));
  }

  form.addEventListener("input", syncWhatsappHandoff);
  if (formWhatsappLink) {
    formWhatsappLink.setAttribute("href", buildWhatsappUrl());
    formWhatsappLink.setAttribute("target", "_blank");
    formWhatsappLink.setAttribute("rel", "noopener");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validate()) {
      showToast({
        type: "error",
        title: "Please check details",
        message: "Verify the highlighted red boxes before pressing send."
      });
      return;
    }

    const payload = {
      fullName: fields.fullName.el.value.trim(),
      email: fields.emailAddress.el.value.trim(),
      subject: fields.subject.el.value.trim(),
      message: fields.message.el.value.trim()
    };

    setSubmitting(true);

    const [emailResult, whatsappResult] = await Promise.allSettled([
      submitContactForm(payload),
      notifyOwnerViaWhatsapp(payload)
    ]);

    setSubmitting(false);

    if (emailResult.status === "fulfilled" && emailResult.value?.ok !== false) {
      showToast({
        type: "success",
        title: "Message delivered successfully",
        message: "Thank you. We will review your inquiry and reply soon."
      });
      form.reset();
      syncWhatsappHandoff();
    } else {
      console.error("Transmission error:", emailResult.reason);
      showToast({
        type: "error",
        title: "Submission failed",
        message: "We faced an issue sending this email. Please tap 'Instant Chat on WhatsApp'!"
      });
    }

    if (whatsappResult.status === "rejected") {
      console.warn("Backend API warning (WhatsApp proxy is off or loading):", whatsappResult.reason);
    }
  });

  function setSubmitting(isSubmitting) {
    submitBtn.classList.toggle("is-loading", isSubmitting);
    submitBtn.disabled = isSubmitting;
  }
}

/* ---------------------------------------------------------------------
   Proxy call to Secure WhatsApp Backend
--------------------------------------------------------------------- */
async function notifyOwnerViaWhatsapp(payload) {
  if (!CONFIG.whatsappApi || !CONFIG.whatsappApi.enabled) return;

  try {
    const res = await fetch(CONFIG.whatsappApi.notifyEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`WhatsApp API responded with status ${res.status}: ${errorText}`);
    }
    return res.json();
  } catch (err) {
    throw err;
  }
}

/* ---------------------------------------------------------------------
   Email Handlers (EmailJS or Demo Fallback)
--------------------------------------------------------------------- */
async function submitContactForm(payload) {
  const isEmailJSConfigured = CONFIG.emailjs.templateId && !CONFIG.emailjs.templateId.includes("YOUR_");
  const actualMode = isEmailJSConfigured ? CONFIG.formMode : "demo";

  switch (actualMode) {
    case "emailjs": {
      if (typeof emailjs === "undefined") {
        throw new Error("EmailJS SDK script tag missing on page.");
      }
      emailjs.init(CONFIG.emailjs.publicKey);
      return emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, {
        name: payload.fullName,
        email: payload.email,
        title: payload.subject,
        message: payload.message
      }).then(res => ({ ok: true, details: res }));
    }

    case "demo":
    default: {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { ok: true, simulated: true };
    }
  }
}

/* ---------------------------------------------------------------------
   Dynamic Toast Notification HUD
--------------------------------------------------------------------- */
let toastTimeoutId = null;

function showToast({ type = "success", title, message }) {
  const toast = document.getElementById("toast");
  const icon = document.getElementById("toastIcon");
  const titleEl = document.getElementById("toastTitle");
  const messageEl = document.getElementById("toastMessage");

  if (!toast || !icon || !titleEl || !messageEl) return;

  titleEl.textContent = title;
  messageEl.textContent = message;

  const successIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#4caf7d" stroke-width="1.5"/><path d="M8 12.5l2.5 2.5L16 9" stroke="#4caf7d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const errorIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#e5635b" stroke-width="1.5"/><path d="M12 8v5M12 16h.01" stroke="#e5635b" stroke-width="1.6" stroke-linecap="round"/></svg>`;

  icon.innerHTML = type === "success" ? successIcon : errorIcon;
  toast.classList.toggle("is-error", type === "error");
  toast.classList.add("is-visible");

  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => hideToast(), 5500);
}

function hideToast() {
  const toast = document.getElementById("toast");
  if (toast) toast.classList.remove("is-visible");
}

function initToastClose() {
  const closeBtn = document.getElementById("toastClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      clearTimeout(toastTimeoutId);
      hideToast();
    });
  }
}

/* ---------------------------------------------------------------------
   Back-to-top Scrolling Button
--------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const toggle = () => btn.classList.toggle("is-visible", window.scrollY > 600);
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
