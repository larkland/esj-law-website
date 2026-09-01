/* =========================================================================
   ESJ Law Offices — main.js
   Vanilla JS, no dependencies, no build step.
   ========================================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* --------------------------------------------------------------------- */
  /*  Sticky header: shadow / shrink on scroll                            */
  /* --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScrollHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* --------------------------------------------------------------------- */
  /*  Mobile navigation toggle                                            */
  /* --------------------------------------------------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var primaryNav = document.querySelector(".primary-nav");

  if (navToggle && primaryNav) {
    var closeNav = function () {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation menu");
      primaryNav.classList.remove("is-open");
      document.body.style.removeProperty("overflow");
    };
    var openNav = function () {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close navigation menu");
      primaryNav.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      expanded ? closeNav() : openNav();
    });

    /* Close when a nav link is chosen */
    primaryNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    /* Close on Escape */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    /* Reset when resizing back up to desktop */
    var mq = window.matchMedia("(min-width: 781px)");
    var onMqChange = function () {
      if (mq.matches) closeNav();
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", onMqChange);
    } else if (mq.addListener) {
      mq.addListener(onMqChange);
    }
  }

  /* --------------------------------------------------------------------- */
  /*  Scroll-reveal animations (IntersectionObserver)                     */
  /* --------------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* --------------------------------------------------------------------- */
  /*  Back-to-top button                                                  */
  /* --------------------------------------------------------------------- */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    var toggleBackToTop = function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    };
    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    backToTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /*  Smooth-scroll for in-page anchor links                              */
  /* --------------------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href");
    if (id.length < 2) return;
    var target = document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* --------------------------------------------------------------------- */
  /*  Contact form: client-side validation + friendly status              */
  /* --------------------------------------------------------------------- */
  var form = document.querySelector("form[data-contact-form]");
  if (form) {
    /* Progressive enhancement: with JS active we run our own validation and
       show friendly inline messages, so suppress the native bubbles.
       Without JS the markup keeps `required` / `type="email"` for the
       browser's built-in checks. */
    form.setAttribute("novalidate", "novalidate");

    var statusEl = form.querySelector(".form-status");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var setFieldError = function (field, message) {
      var wrap = field.closest(".form-field");
      if (!wrap) return;
      var errEl = wrap.querySelector(".field-error");
      if (message) {
        wrap.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
        if (errEl) errEl.textContent = message;
      } else {
        wrap.classList.remove("is-invalid");
        field.removeAttribute("aria-invalid");
        if (errEl) errEl.textContent = "";
      }
    };

    var validateField = function (field) {
      var value = (field.value || "").trim();
      if (field.hasAttribute("required") && !value) {
        setFieldError(field, "This field is required.");
        return false;
      }
      if (field.type === "email" && value && !emailRe.test(value)) {
        setFieldError(field, "Please enter a valid email address.");
        return false;
      }
      if (field.name === "phone" && value && !/[0-9]{6,}/.test(value.replace(/\D/g, ""))) {
        setFieldError(field, "Please enter a valid phone number.");
        return false;
      }
      setFieldError(field, "");
      return true;
    };

    var fields = Array.prototype.slice.call(
      form.querySelectorAll("input, select, textarea")
    ).filter(function (f) {
      return f.type !== "hidden" && !f.classList.contains("hp-input");
    });

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.closest(".form-field").classList.contains("is-invalid")) {
          validateField(field);
        }
      });
    });

    var showStatus = function (type, message) {
      if (!statusEl) return;
      statusEl.className = "form-status is-" + type;
      statusEl.textContent = message;
      statusEl.setAttribute("role", type === "error" ? "alert" : "status");
    };

    form.addEventListener("submit", function (e) {
      /* Honeypot: silently drop bot submissions */
      var hp = form.querySelector(".hp-input");
      if (hp && hp.value) {
        e.preventDefault();
        return;
      }

      var firstInvalid = null;
      fields.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        e.preventDefault();
        showStatus(
          "error",
          "Please fix the highlighted fields and try again."
        );
        firstInvalid.focus();
        return;
      }

      /* --------------------------------------------------------------- */
      /*  Submit via fetch so we can show an in-page success state.      */
      /*  Netlify Forms picks the POST up from the static markup, so     */
      /*  the same request works in production with no backend code.     */
      /*  Without JS the form still posts normally and Netlify redirects */
      /*  to its default success page.                                   */
      /* --------------------------------------------------------------- */
      e.preventDefault();
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = "Sending…";
      }

      var data = new FormData(form);
      var encoded = new URLSearchParams(data).toString();

      fetch(form.getAttribute("action") || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encoded,
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Bad response " + res.status);
          form.reset();
          showStatus(
            "success",
            "Thank you — your message has been sent. Mrs. Salmon-James’s office will respond as soon as possible."
          );
          if (statusEl) statusEl.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
        })
        .catch(function () {
          showStatus(
            "error",
            "Something went wrong sending your message. Please email the office directly or try again shortly."
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.label || "Send message";
          }
        });
    });
  }

  /* --------------------------------------------------------------------- */
  /*  Footer year                                                         */
  /* --------------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
