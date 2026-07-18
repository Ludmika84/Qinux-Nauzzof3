(function () {
  "use strict";

  var OFFER_URL =
    "https://nauzzof.getqinux.com/?widipub_id=6a5513155a138951ad0b2c37&wtrd_offer_id=6a38f66b1b2242d2c4014ee5&wtrd_offer_lids=6a38f66b1b2242d2c4014ee8";
  var COOKIE_KEY = "qn_cookie_consent_v1";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getConsent() {
    try {
      return localStorage.getItem(COOKIE_KEY);
    } catch (e) {
      return null;
    }
  }

  // Affiliate CTAs: sponsored relationship + new tab for clear destination change
  function bindOfferLinks() {
    qsa("[data-offer], .js-offer").forEach(function (el) {
      if (el.tagName === "A") {
        el.setAttribute("href", OFFER_URL);
        el.setAttribute("rel", "noopener noreferrer sponsored");
        el.setAttribute("target", "_blank");
      }
    });
  }

  // Marketing tags only after PECR consent (placeholder hook for Google Ads / Taboola pixels)
  function applyMarketingConsent(accepted) {
    document.documentElement.setAttribute(
      "data-marketing-consent",
      accepted ? "granted" : "denied"
    );
    window.dispatchEvent(
      new CustomEvent("qn:consent", { detail: { marketing: !!accepted } })
    );
  }

  function initHeader() {
    var header = qs(".site-header");
    var toggle = qs(".nav-toggle");
    var mobileNav = qs(".mobile-nav");

    if (!header || !toggle || !mobileNav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileNav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    qsa("a", mobileNav).forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 720) setOpen(false);
    });

    window.addEventListener(
      "scroll",
      function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      },
      { passive: true }
    );
  }

  function initAccordion() {
    qsa(".accordion").forEach(function (group) {
      qsa(".accordion-btn", group).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var expanded = btn.getAttribute("aria-expanded") === "true";
          var panelId = btn.getAttribute("aria-controls");
          var panel = panelId ? document.getElementById(panelId) : null;

          qsa(".accordion-btn", group).forEach(function (other) {
            other.setAttribute("aria-expanded", "false");
            var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
            if (otherPanel) otherPanel.classList.remove("is-open");
          });

          if (!expanded && panel) {
            btn.setAttribute("aria-expanded", "true");
            panel.classList.add("is-open");
          }
        });
      });
    });
  }

  function initReviews() {
    var slides = qsa(".review-slide");
    var prev = qs("[data-review-prev]");
    var next = qs("[data-review-next]");
    if (!slides.length || !prev || !next) return;

    var index = 0;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === index);
      });
    }

    prev.addEventListener("click", function () {
      show(index - 1);
    });
    next.addEventListener("click", function () {
      show(index + 1);
    });
  }

  function initReveal() {
    var items = qsa(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initCookies() {
    var banner = qs(".cookie-banner");
    if (!banner) return;

    var accept = qs("[data-cookie-accept]");
    var decline = qs("[data-cookie-decline]");
    var manageButtons = qsa("[data-cookie-manage]");
    var existing = getConsent();

    function save(value) {
      try {
        localStorage.setItem(COOKIE_KEY, value);
      } catch (err) {
        // ignore storage errors
      }
      banner.classList.remove("is-visible");
      applyMarketingConsent(value === "accepted");
    }

    if (existing === "accepted") {
      applyMarketingConsent(true);
    } else if (existing === "declined") {
      applyMarketingConsent(false);
    } else {
      banner.classList.add("is-visible");
      applyMarketingConsent(false);
    }

    if (accept) {
      accept.addEventListener("click", function () {
        save("accepted");
      });
    }
    if (decline) {
      decline.addEventListener("click", function () {
        save("declined");
      });
    }

    manageButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        try {
          localStorage.removeItem(COOKIE_KEY);
        } catch (err) {
          // ignore
        }
        applyMarketingConsent(false);
        banner.classList.add("is-visible");
        banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }

  function initContactForm() {
    var form = qs("#contact-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var privacy = form.querySelector("[name='privacy']");
      if (privacy && !privacy.checked) {
        privacy.focus();
        return;
      }
      window.location.href = "success.html";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindOfferLinks();
    initHeader();
    initAccordion();
    initReviews();
    initReveal();
    initCookies();
    initContactForm();
  });
})();
