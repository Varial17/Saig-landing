/* ============================================================
   SAIG landing page
   ============================================================ */

/* ─────────────────────────────────────────────────────────────
   1. CTA LINKS — the only thing you need to edit to go live.

   Replace the two placeholder values below with the real URLs.
   Every "Book a call" and "Login to Sage Chat" button on the
   page is wired to these (they carry data-cta="book" / "login").

   Leave a value as null to keep the on-page anchor behaviour.
   ───────────────────────────────────────────────────────────── */

var LINKS = {
  book:  null,  // e.g. 'https://cal.com/saig/intro'
  login: null   // e.g. 'https://chat.saig.com.au/login'
};

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── CTA wiring ──────────────────────────────────────────── */

  Object.keys(LINKS).forEach(function (key) {
    var url = LINKS[key];
    if (!url) return;
    document.querySelectorAll('[data-cta="' + key + '"]').forEach(function (el) {
      el.href = url;
      if (/^https?:/i.test(url) && new URL(url, location.href).origin !== location.origin) {
        el.target = '_blank';
        el.rel = 'noopener';
      }
    });
  });

  /* ── Mobile menu ─────────────────────────────────────────── */

  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');

  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
    };

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
    });

    // Reset state when the pill nav comes back at desktop widths.
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ── FAQ accordion (single open at a time) ───────────────── */

  document.querySelectorAll('[data-faq]').forEach(function (faq) {
    var buttons = Array.prototype.slice.call(faq.querySelectorAll('.faq-q'));

    faq.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-q');
      if (!btn) return;
      var willOpen = btn.getAttribute('aria-expanded') !== 'true';
      buttons.forEach(function (other) {
        var open = other === btn && willOpen;
        other.setAttribute('aria-expanded', String(open));
        other.closest('.faq-item').setAttribute('data-open', String(open));
        var sign = other.querySelector('.faq-sign');
        if (sign) sign.textContent = open ? '−' : '+';
      });
    });
  });

  /* ── Hero: rotating headline word ────────────────────────── */

  /* The wrapper is pinned to the measured width of the word it holds, so the
     comma after it glides rather than jumping. Widths are measured with a
     hidden twin inside the wrapper — the headline is sized with clamp() and
     the metrics move again when the webfont swaps in, so the numbers can't be
     hard-coded and have to be re-taken on resize and on fonts.ready. */

  var rotWrap = document.querySelector('[data-rotator-wrap]');
  var rotator = rotWrap && rotWrap.querySelector('[data-rotator]');

  if (rotWrap && rotator) {
    var words = ['chat', 'workflows', 'operations'];
    var wordIdx = 0;

    var ghost = document.createElement('span');
    ghost.className = 'rotator-word rotator-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    rotWrap.appendChild(ghost);

    var sizeTo = function (word, animate) {
      ghost.textContent = word;
      var w = ghost.getBoundingClientRect().width;
      if (!w) return;
      if (!animate) rotWrap.style.transition = 'none';
      rotWrap.style.width = w.toFixed(2) + 'px';
      if (!animate) {
        void rotWrap.offsetWidth;   // flush, or the suppressed transition still runs
        rotWrap.style.transition = '';
      }
    };

    sizeTo(words[0], false);

    setInterval(function () {
      wordIdx = (wordIdx + 1) % words.length;
      // Swap the node so the entrance animation replays.
      var next = rotator.cloneNode(false);
      next.textContent = words[wordIdx];
      rotator.replaceWith(next);
      rotator = next;
      sizeTo(words[wordIdx], true);
    }, 2600);

    var remeasure = function () { sizeTo(words[wordIdx], false); };

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(remeasure, 120);
    });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  }

  /* ── Hero: fade the background in once it has decoded ─────── */

  /* The starting opacity is applied here, never in the stylesheet — with JS
     off the background has to render normally. */

  var heroFade = document.querySelector('.hero-bg');
  if (heroFade) {
    var small = window.matchMedia('(max-width: 900px)').matches;
    var probe = new Image();

    var reveal = function () {
      if (heroFade.classList.contains('is-loaded')) return;
      heroFade.classList.add('is-loaded');
      heroFade.style.removeProperty('opacity');
    };

    probe.onload = reveal;
    // No WebP support: the stylesheet falls back to the JPEG, so probe it too.
    probe.onerror = function () {
      probe.onerror = reveal;
      probe.onload = reveal;
      probe.src = small ? '/assets/hero-bg-900.jpg' : '/assets/hero-bg.jpg';
    };
    probe.src = small ? '/assets/hero-bg-900.webp' : '/assets/hero-bg.webp';

    // Already cached — don't blink it out just to fade it back in.
    if (!probe.complete) {
      heroFade.style.opacity = '0';
      heroFade.classList.add('is-fading');
      setTimeout(reveal, 3000);   // never leave the hero blank
    }
  }

  /* ── Hero: chat typing effect ────────────────────────────── */

  var typedEl = document.querySelector('[data-typed]');
  if (typedEl) {
    var TEXT = 'Here are the key terms: 30-day payment window, 12-month exclusivity, and a renewal clause in June…';

    if (reduceMotion) {
      typedEl.textContent = TEXT;
    } else {
      var i = 0;
      var pause = 0;
      setInterval(function () {
        if (pause > 0) { pause--; if (pause === 0) i = 0; return; }
        i++;
        if (i >= TEXT.length) pause = 60;
        typedEl.textContent = TEXT.slice(0, i);
      }, 40);
    }
  }

  /* ── Hero: parallax background ───────────────────────────── */

  var heroBg = document.querySelector('[data-parallax]');
  if (heroBg && !reduceMotion) {
    var ticking = false;
    var paint = function () {
      heroBg.style.transform = 'translateY(' + Math.min(window.scrollY * 0.22, 180) + 'px)';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }, { passive: true });
    paint();
  }

  /* ── Footer year ─────────────────────────────────────────── */

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
