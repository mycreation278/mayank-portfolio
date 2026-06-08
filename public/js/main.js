/* ─────────────────────────────────────────────────────────────
   public/js/main.js  —  All frontend interactions
───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Utility ─────────────────────────────────────────────── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ═══════════════════════════════════════════════════════════
     1. CUSTOM CURSOR (desktop only)
  ═══════════════════════════════════════════════════════════ */
  const cursor     = $('#cursor');
  const cursorRing = $('#cursor-ring');

  if (cursor && cursorRing && window.matchMedia('(pointer:fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    (function animRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();

    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; cursorRing.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; cursorRing.style.opacity = '1'; });
  }

  /* ═══════════════════════════════════════════════════════════
     2. NAVIGATION — sticky + active link highlight
  ═══════════════════════════════════════════════════════════ */
  const nav = $('#nav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    // Back-to-top button
    const backTop = $('#back-top');
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Active nav link on scroll
  const sections  = $$('section[id], div[id="contact"]');
  const navAnchors = $$('.nav-links a');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => {
          a.classList.toggle('active-nav', a.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ═══════════════════════════════════════════════════════════
     3. HAMBURGER / MOBILE MENU
  ═══════════════════════════════════════════════════════════ */
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    $$('.mob-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     4. TOAST NOTIFICATION
  ═══════════════════════════════════════════════════════════ */
  let toastTimer = null;

  function showToast(message, type = 'success') {
    const toast    = $('#toast');
    const toastMsg = $('#toast-msg');
    const toastIcon = $('#toast-icon');
    if (!toast) return;

    toastMsg.textContent  = message;
    toastIcon.textContent = type === 'success' ? '✓' : '✕';
    toast.className       = `toast ${type} show`;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
  }

  /* ═══════════════════════════════════════════════════════════
     5. VIDEO MODAL (Showreel + Project videos)
  ═══════════════════════════════════════════════════════════ */
  const modal      = $('#reel-modal');
  const iframe     = $('#reel-iframe');
  const videoEl    = $('#reel-video');
  const videoSrc   = $('#reel-video-src');
  const backdrop   = $('#modal-backdrop');
  const closeBtn   = $('#modal-close');

  // ── Showreel: use a local file path or a YouTube embed URL ──
  // Local example:  'videos/showreel.mp4'
  // YouTube example: 'https://www.youtube.com/embed/YOUR_SHOWREEL_ID?autoplay=1&rel=0'
  const SHOWREEL_URL = 'videos/showreel.mp4';

  // Returns true if the URL points to a local/hosted video file
  function isLocalVideo(url) {
    if (!url) return false;
    // Treat it as local if it does NOT start with http/https,
    // OR if it ends with a known video extension
    return !/^https?:\/\//i.test(url) ||
           /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
  }

  function openModal(videoUrl) {
    if (!modal) return;
    if (isLocalVideo(videoUrl)) {
      // Show HTML5 video player, hide iframe
      iframe.style.display = 'none';
      videoEl.style.display = 'block';
      videoSrc.src = videoUrl;
      // Update <source> type based on extension
      if (/\.webm(\?.*)?$/i.test(videoUrl)) videoSrc.type = 'video/webm';
      else if (/\.ogg(\?.*)?$/i.test(videoUrl)) videoSrc.type = 'video/ogg';
      else videoSrc.type = 'video/mp4';
      videoEl.load();
      videoEl.play().catch(() => {}); // autoplay (may be blocked by browser)
    } else {
      // Show iframe for YouTube / Vimeo
      videoEl.style.display = 'none';
      iframe.style.display = 'block';
      iframe.src = videoUrl + (videoUrl.includes('?') ? '&' : '?') + 'autoplay=1';
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    // Stop both players
    iframe.src = '';
    iframe.style.display = 'block';
    videoEl.pause();
    videoEl.src = '';
    videoSrc.src = '';
    videoEl.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Watch Reel button in Hero
  const reelBtn = $('#reel-btn');
  if (reelBtn) {
    reelBtn.addEventListener('click', () => openModal(SHOWREEL_URL));
  }

  // Project "View Project" buttons
  $$('.proj-view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const videoUrl = btn.dataset.video;
      if (videoUrl) openModal(videoUrl);
    });
  });

  // Close modal
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ═══════════════════════════════════════════════════════════
     6. PROJECT FILTER
  ═══════════════════════════════════════════════════════════ */
  const filterBtns = $$('.filter-btn');
  const projCards  = $$('.proj-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projCards.forEach((card, i) => {
        const cat     = card.dataset.cat || '';
        const matches = filter === 'all' || cat === filter;

        if (matches) {
          card.classList.remove('hidden');
          card.style.animation = `fadeUp .5s ${i * 0.07}s both`;
        } else {
          card.classList.add('hidden');
          card.style.animation = '';
        }
      });
    });
  });

  /* ═══════════════════════════════════════════════════════════
     7. SCROLL REVEAL
  ═══════════════════════════════════════════════════════════ */
  const revealEls = $$('.reveal');

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ═══════════════════════════════════════════════════════════
     8. STAT COUNT-UP
  ═══════════════════════════════════════════════════════════ */
  const statNums = $$('[data-target]');

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      let current  = 0;
      const step   = Math.max(target / 50, 0.5);

      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + '+';
        if (current >= target) clearInterval(timer);
      }, 28);

      countObserver.unobserve(el);
    });
  }, { threshold: 0.6 });

  statNums.forEach(el => countObserver.observe(el));

  /* ═══════════════════════════════════════════════════════════
     9. CONTACT FORM — client-side validation + API submission
  ═══════════════════════════════════════════════════════════ */
  const form      = $('#contact-form');
  const submitBtn = $('#submit-btn');
  const btnText   = $('#btn-text');
  const btnLoader = $('#btn-loader');

  // Field-level error helpers
  function setError(fieldName, message) {
    const input = form.elements[fieldName];
    const errEl = $('#err-' + fieldName);
    if (input) input.classList.add('error');
    if (errEl) errEl.textContent = message;
  }

  function clearErrors() {
    $$('.form-input, .form-textarea', form).forEach(el => el.classList.remove('error'));
    $$('.field-error', form).forEach(el => el.textContent = '');
  }

  function validateForm(data) {
    let valid = true;

    if (!data.name || data.name.trim().length < 2) {
      setError('name', 'Please enter your name.'); valid = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRe.test(data.email)) {
      setError('email', 'Please enter a valid email address.'); valid = false;
    }

    if (!data.projectType || data.projectType.trim().length < 2) {
      setError('projectType', 'Please describe the project type.'); valid = false;
    }

    if (!data.message || data.message.trim().length < 20) {
      setError('message', 'Message must be at least 20 characters.'); valid = false;
    }

    return valid;
  }

  if (form) {
    // Clear error on input
    $$('.form-input, .form-textarea', form).forEach(el => {
      el.addEventListener('input', () => {
        el.classList.remove('error');
        const errEl = $('#err-' + el.name);
        if (errEl) errEl.textContent = '';
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      clearErrors();

      const data = {
        name       : form.elements['name'].value,
        email      : form.elements['email'].value,
        projectType: form.elements['projectType'].value,
        budget     : form.elements['budget'].value,
        message    : form.elements['message'].value,
      };

      if (!validateForm(data)) return;

      // Show loading state
      submitBtn.disabled    = true;
      btnText.hidden        = true;
      btnLoader.hidden      = false;

      try {
        const res  = await fetch('/api/contact', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify(data),
        });

        const result = await res.json();

        if (res.ok && result.success) {
          showToast(result.message || "Thanks! I'll be in touch within 24 hours.", 'success');
          form.reset();
        } else {
          // Show server-side field errors if any
          if (result.errors && result.errors.length) {
            result.errors.forEach(err => setError(err.field, err.msg));
          }
          showToast(result.message || 'Something went wrong. Please try again.', 'error');
        }
      } catch (err) {
        console.error('Form error:', err);
        showToast('Network error. Please email me directly at hello@mayanksharma.in', 'error');
      } finally {
        submitBtn.disabled = false;
        btnText.hidden     = false;
        btnLoader.hidden   = true;
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     10. SMOOTH SCROLL for all internal anchor links
  ═══════════════════════════════════════════════════════════ */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ═══════════════════════════════════════════════════════════
     11. PROJECT CARD — keyboard accessibility
  ═══════════════════════════════════════════════════════════ */
  projCards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const btn = card.querySelector('.proj-view-btn');
        if (btn) btn.click();
      }
    });
  });

})();
