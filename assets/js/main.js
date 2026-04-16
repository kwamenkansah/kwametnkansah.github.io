/**
 * ICT Portfolio — interactions: theme, nav, typing, reveal, filters, contact form
 */
(function () {
  "use strict";

  var THEME_KEY = "nkt-portfolio-theme";

  /* ——— Theme (dark default, optional light) ——— */
  function initTheme() {
    var root = document.documentElement;
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    var stored = localStorage.getItem(THEME_KEY);
    if (stored === "light") {
      root.classList.add("light");
      toggle.setAttribute("aria-label", "Switch to dark mode");
      toggle.innerHTML = iconMoon();
    } else {
      root.classList.remove("light");
      toggle.setAttribute("aria-label", "Switch to light mode");
      toggle.innerHTML = iconSun();
    }

    toggle.addEventListener("click", function () {
      var light = root.classList.toggle("light");
      localStorage.setItem(THEME_KEY, light ? "light" : "dark");
      toggle.setAttribute(
        "aria-label",
        light ? "Switch to dark mode" : "Switch to light mode"
      );
      toggle.innerHTML = light ? iconMoon() : iconSun();
    });
  }

  function iconSun() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  }

  function iconMoon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  /* ——— Mobile navigation ——— */
  function initNav() {
    var burger = document.getElementById("navToggle");
    var wrap = document.getElementById("navMenu");
    var links = wrap ? wrap.querySelectorAll("a[href^=\"#\"]") : [];

    if (!burger || !wrap) return;

    function closeMenu() {
      burger.setAttribute("aria-expanded", "false");
      wrap.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    function openMenu() {
      burger.setAttribute("aria-expanded", "true");
      wrap.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      if (open) closeMenu();
      else openMenu();
    });

    links.forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 880px)").matches) closeMenu();
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 880) closeMenu();
    });

    /* Active section highlight */
    var sections = document.querySelectorAll("section[id]");
    var navAnchors = document.querySelectorAll('.nav-menu a[href^="#"]');

    function onScroll() {
      var scrollY = window.scrollY + 120;
      var current = "";
      sections.forEach(function (sec) {
        var top = sec.offsetTop;
        var h = sec.offsetHeight;
        if (scrollY >= top && scrollY < top + h) current = sec.getAttribute("id") || "";
      });
      navAnchors.forEach(function (link) {
        var href = link.getAttribute("href") || "";
        var on = current !== "" && href === "#" + current;
        link.setAttribute("aria-current", on ? "true" : "false");
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ——— Typing effect for hero tagline ——— */
  function initTyping() {
    var el = document.getElementById("typingTagline");
    if (!el) return;

    var full = el.getAttribute("data-text") || "";
    var i = 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      el.textContent = full;
      return;
    }

    el.textContent = "";

    function tick() {
      if (i <= full.length) {
        el.textContent = full.slice(0, i);
        i++;
        var delay = i <= 4 ? 95 : 38;
        window.setTimeout(tick, delay);
      }
    }

    window.setTimeout(tick, 400);
  }

  /* ——— Scroll reveal ——— */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    els.forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ——— Project filters ——— */
  function initProjectFilters() {
    var bar = document.getElementById("projectFilters");
    if (!bar) return;

    var buttons = bar.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".project-card");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter") || "all";

        buttons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });

        cards.forEach(function (card) {
          var tags = (card.getAttribute("data-category") || "").split(/\s+/);
          var show = cat === "all" || tags.indexOf(cat) !== -1;
          card.setAttribute("data-hidden", show ? "false" : "true");
        });
      });
    });
  }

  /* ——— Contact form ——— */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var status = document.getElementById("formStatus");

    function setStatus(msg, type) {
      if (!status) return;
      status.textContent = msg || "";
      status.className = "form-status" + (type ? " " + type : "");
    }

    function validateEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("");

      var name = form.elements.namedItem("name");
      var email = form.elements.namedItem("email");
      var message = form.elements.namedItem("message");
      var website = form.elements.namedItem("website");

      [name, email, message].forEach(function (field) {
        if (field) field.classList.remove("invalid");
      });

      var ok = true;
      if (!name || !String(name.value).trim()) {
        if (name) name.classList.add("invalid");
        ok = false;
      }
      if (!email || !validateEmail(String(email.value).trim())) {
        if (email) email.classList.add("invalid");
        ok = false;
      }
      if (!message || String(message.value).trim().length < 10) {
        if (message) message.classList.add("invalid");
        ok = false;
      }

      if (!ok) {
        setStatus("Please check the highlighted fields.", "error");
        return;
      }

      if (website && String(website.value).trim() !== "") {
        setStatus("Submission blocked.", "error");
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      var payload = {
        name: String(name.value).trim(),
        email: String(email.value).trim(),
        message: String(message.value).trim(),
      };

      fetch("api/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data && result.data.success) {
            setStatus(result.data.message || "Message sent. I will get back to you soon.", "success");
            form.reset();
          } else {
            var err =
              (result.data && result.data.message) ||
              "Could not send. Try email or WhatsApp instead.";
            setStatus(err, "error");
          }
        })
        .catch(function () {
          setStatus("Network error. Please try again or use email/WhatsApp.", "error");
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send message";
          }
        });
    });
  }

  /* ——— Footer year ——— */
  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();
    initTyping();
    initReveal();
    initProjectFilters();
    initContactForm();
    initYear();
  });
})();
