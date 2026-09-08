/* =========================================================================
   Elizabeth James-Salmon — main.js
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
  /*  Count-up for stat numbers                                           */
  /* --------------------------------------------------------------------- */
  var formatNumber = function (n) {
    return n.toLocaleString("en-US");
  };

  var finalizeCount = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    el.textContent = formatNumber(target) + (el.getAttribute("data-count-suffix") || "");
  };

  var runCountUp = function (el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";

    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;

    if (prefersReducedMotion) {
      finalizeCount(el);
      return;
    }

    var suffix = el.getAttribute("data-count-suffix") || "";
    var duration = 1500;
    var startTime = null;

    var step = function (now) {
      if (startTime === null) startTime = now;
      var progress = Math.min(1, (now - startTime) / duration);
      var eased = 1 - Math.pow(1 - progress, 3); /* easeOutCubic */
      el.textContent = formatNumber(Math.round(target * eased)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target) + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  /* --------------------------------------------------------------------- */
  /*  Scroll-reveal animations (IntersectionObserver)                     */
  /*  - grouped elements ([data-reveal-group]) stagger in sequence        */
  /*  - stat numbers count up when their block reveals                    */
  /* --------------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var countEls = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  /* Pre-compute a static stagger delay for children of a reveal group. */
  revealEls.forEach(function (el) {
    var group = el.closest("[data-reveal-group]");
    if (!group || el.hasAttribute("data-reveal-delay")) return;
    var items = Array.prototype.slice.call(group.querySelectorAll(".reveal"));
    var index = items.indexOf(el);
    if (index > 0) {
      el.style.transitionDelay = Math.min(index, 10) * 0.075 + "s";
    }
  });

  var revealOne = function (el) {
    el.classList.add("is-visible");
    var counters = el.matches("[data-count]")
      ? [el]
      : Array.prototype.slice.call(el.querySelectorAll("[data-count]"));
    counters.forEach(runCountUp);
  };

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
    countEls.forEach(finalizeCount);
  } else {
    var io = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealOne(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });

    /* Any stat number that isn't inside a .reveal still needs a trigger. */
    var looseCounters = countEls.filter(function (el) {
      return !el.closest(".reveal");
    });
    if (looseCounters.length) {
      var countIo = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCountUp(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      looseCounters.forEach(function (el) {
        countIo.observe(el);
      });
    }
  }

  /* --------------------------------------------------------------------- */
  /*  Scroll-progress bar + hero parallax (one rAF-throttled listener)    */
  /* --------------------------------------------------------------------- */
  var progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("aria-hidden", "true");
  var progressFill = document.createElement("span");
  progressBar.appendChild(progressFill);
  document.body.appendChild(progressBar);

  var heroInner = document.querySelector(".hero .hero-inner");
  var heroSection = document.querySelector(".hero");
  var scrollTicking = false;

  var onScrollFx = function () {
    var scrollTop =
      window.pageYOffset || document.documentElement.scrollTop || 0;

    /* progress bar: fraction of the page scrolled */
    var docEl = document.documentElement;
    var scrollable = docEl.scrollHeight - docEl.clientHeight;
    var ratio = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;
    progressFill.style.transform = "scaleX(" + ratio + ")";

    /* hero parallax + gentle fade/scale as it leaves the viewport */
    if (heroInner && heroSection && !prefersReducedMotion) {
      var heroH = heroSection.offsetHeight || 1;
      if (scrollTop < heroH) {
        var k = scrollTop / heroH; /* 0 -> 1 across the hero */
        var shift = scrollTop * 0.32;
        var scale = 1 - k * 0.04;
        heroInner.style.transform =
          "translate3d(0," + shift.toFixed(1) + "px,0) scale(" + scale.toFixed(4) + ")";
        heroInner.style.opacity = (1 - k * 0.9).toFixed(3);
      }
    }
    scrollTicking = false;
  };

  var requestScrollFx = function () {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollFx);
    }
  };
  onScrollFx();
  window.addEventListener("scroll", requestScrollFx, { passive: true });
  window.addEventListener("resize", requestScrollFx, { passive: true });

  /* --------------------------------------------------------------------- */
  /*  Hero rotating background: slow cross-fade between photos             */
  /*  - skipped entirely for reduced motion or a single slide             */
  /*  - deferred slides (data-src) are fetched just before they're shown  */
  /*  - pauses while the tab is hidden                                    */
  /* --------------------------------------------------------------------- */
  var heroMedia = document.querySelector(".hero-media");
  if (heroMedia) {
    var slides = Array.prototype.slice.call(
      heroMedia.querySelectorAll(".hero-slide")
    );

    var loadSlide = function (img) {
      if (img && !img.getAttribute("src") && img.dataset.src) {
        img.src = img.dataset.src;
      }
    };

    if (slides.length > 1 && !prefersReducedMotion) {
      var HOLD_MS = 6500; /* time each image holds (fade is 1.5s in CSS) */
      var activeIdx = 0;
      var heroTimer = null;

      /* Warm up the next image so the first transition isn't a hard cut. */
      loadSlide(slides[1]);

      var advanceHero = function () {
        var nextIdx = (activeIdx + 1) % slides.length;
        var current = slides[activeIdx];
        var next = slides[nextIdx];

        var swap = function () {
          current.classList.remove("is-active");
          next.classList.add("is-active");
          activeIdx = nextIdx;
          /* Pre-fetch the following one during this hold. */
          loadSlide(slides[(nextIdx + 1) % slides.length]);
        };

        loadSlide(next);
        if (next.complete && next.naturalWidth) {
          swap();
        } else {
          next.addEventListener("load", swap, { once: true });
        }
      };

      var startHero = function () {
        if (!heroTimer) heroTimer = setInterval(advanceHero, HOLD_MS);
      };
      var stopHero = function () {
        if (heroTimer) {
          clearInterval(heroTimer);
          heroTimer = null;
        }
      };

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stopHero();
        else startHero();
      });
      startHero();
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
            "Thank you — your message has been sent. Mrs. Salmon-James’ office will respond as soon as possible."
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
