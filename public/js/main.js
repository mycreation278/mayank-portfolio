/* =====================================================
   MAYANK SHARMA — main.js
   All original logic preserved.
   Filter updated to match new cat-block structure.
   ===================================================== */

'use strict';

/* ── CURSOR ───────────────────────────────────────── */
(function () {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function lerp() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  document.querySelectorAll('a,button,.proj-card:not(.proj-card--coming),.service-card,.tool-item')
    .forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
})();

/* ── NAV SCROLL ───────────────────────────────────── */
const nav = document.getElementById('nav');
const backTop = document.getElementById('back-top');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav && nav.classList.toggle('scrolled', y > 60);
  backTop && backTop.classList.toggle('visible', y > 400);
}, { passive: true });

backTop && backTop.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
);

/* ── MOBILE MENU ──────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobLinks   = document.querySelectorAll('.mob-link');

const openMenu  = () => { mobileMenu.classList.add('open'); document.body.style.overflow = 'hidden'; };
const closeMenu = () => { mobileMenu.classList.remove('open'); document.body.style.overflow = ''; };

hamburger  && hamburger.addEventListener('click', openMenu);
mobLinks.forEach(l => l.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ── VIDEO MODAL ──────────────────────────────────── */
const modal    = document.getElementById('reel-modal');
const backdrop = document.getElementById('modal-backdrop');
const closeBtn = document.getElementById('modal-close');
const iframe   = document.getElementById('reel-iframe');
const video    = document.getElementById('reel-video');
const videoSrc = document.getElementById('reel-video-src');

function openModal(src) {
  if (!modal) return;
  const isYT = src.includes('youtube') || src.includes('youtu.be') || src.includes('vimeo');
  if (isYT) {
    // YouTube / Vimeo embed
    const sep = src.includes('?') ? '&' : '?';
    iframe.src = src + sep + 'autoplay=1';
    iframe.style.display = 'block';
    video.style.display  = 'none';
  } else {
    // Local video file
    videoSrc.src = src;
    video.load();
    video.play();
    iframe.src          = '';
    iframe.style.display = 'none';
    video.style.display  = 'block';
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    iframe.src = '';
    video.pause();
    video.src = '';
  }, 350);
}

// Showreel button
const reelBtn = document.getElementById('reel-btn');
// ← Replace with your actual YouTube embed URL or local file path
const SHOWREEL_SRC = 'https://www.youtube.com/embed/YOUR_SHOWREEL_ID';
reelBtn && reelBtn.addEventListener('click', () => openModal(SHOWREEL_SRC));

// "Watch Project" / "View Project" buttons
document.querySelectorAll('.proj-cta-btn:not(:disabled), .proj-view-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const src = btn.getAttribute('data-video');
    if (src) openModal(src);
    else showToast('Video coming soon!', 'error');
  });
});

// Clicking anywhere on a non-coming-soon card also opens modal
document.querySelectorAll('.proj-card:not(.proj-card--coming)').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.closest('.proj-cta-btn, .proj-view-btn')) return;
    const btn = card.querySelector('.proj-cta-btn:not(:disabled), .proj-view-btn');
    if (btn) btn.click();
  });
});

closeBtn     && closeBtn.addEventListener('click', closeModal);
backdrop     && backdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── SCROLL REVEAL ────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

revealEls.forEach(el => revObs.observe(el));

/* ── STAT COUNT-UP ────────────────────────────────── */
const statEls = document.querySelectorAll('.stat-num[data-target]');
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.getAttribute('data-target'), 10);
    let start = null;
    (function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + '+';
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + '+';
    })(performance.now());
    statObs.unobserve(el);
  });
}, { threshold: 0.5 });

statEls.forEach(el => statObs.observe(el));

/* ── FILTER PILLS ─────────────────────────────────── */
// Works with both old proj-grid (data-cat on articles)
// and new cat-block system (data-cat on .cat-block divs)
const filterBtns = document.querySelectorAll('.filter-btn');
const catBlocks  = document.querySelectorAll('.cat-block');     // new
const projCards  = document.querySelectorAll('.proj-grid .proj-card[data-cat]'); // old (if any)

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    // ── New: toggle entire category blocks ──
    if (catBlocks.length) {
      catBlocks.forEach(block => {
        const blockCat = block.getAttribute('data-cat');
        const show = filter === 'all' || blockCat === filter;
        block.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        if (show) {
          block.style.display = '';
          requestAnimationFrame(() => {
            block.style.opacity = '1';
            block.style.transform = 'translateY(0)';
          });
        } else {
          block.style.opacity = '0';
          block.style.transform = 'translateY(16px)';
          setTimeout(() => { block.style.display = 'none'; }, 350);
        }
      });
    }

    // ── Legacy: toggle individual cards (old grid, if kept) ──
    if (projCards.length) {
      projCards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        const show = filter === 'all' || cat === filter;
        card.style.display = show ? '' : 'none';
      });
    }
  });
});

/* ── CONTACT FORM ─────────────────────────────────── */
const form     = document.getElementById('contact-form');
const btnText  = document.getElementById('btn-text');
const btnLoad  = document.getElementById('btn-loader');
const submitBtn = document.getElementById('submit-btn');

const validators = {
  name:        v => v.trim().length >= 2  ? '' : 'Please enter your name.',
  email:       v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email.',
  projectType: v => v.trim().length >= 2  ? '' : 'Please describe the project type.',
  message:     v => v.trim().length >= 10 ? '' : 'Please write at least 10 characters.',
};

function setError(field, msg) {
  const el = document.getElementById('err-' + field);
  if (el) el.textContent = msg;
}

form && form.addEventListener('submit', async e => {
  e.preventDefault();
  let valid = true;

  Object.keys(validators).forEach(field => {
    const input = form.elements[field];
    if (!input) return;
    const err = validators[field](input.value);
    setError(field, err);
    if (err) valid = false;
  });

  if (!valid) return;

  btnText.hidden  = true;
  btnLoad.hidden  = false;
  submitBtn.disabled = true;

  const body = {};
  new FormData(form).forEach((v, k) => { body[k] = v; });

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      showToast('Message sent! I\'ll be in touch soon.', 'success');
      form.reset();
      Object.keys(validators).forEach(f => setError(f, ''));
    } else {
      const d = await res.json().catch(() => ({}));
      showToast(d.error || 'Something went wrong — please try again.', 'error');
    }
  } catch {
    showToast('Network error — please try again.', 'error');
  } finally {
    btnText.hidden  = false;
    btnLoad.hidden  = true;
    submitBtn.disabled = false;
  }
});

/* ── TOAST ────────────────────────────────────────── */
const toastEl  = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
const toastIco = document.getElementById('toast-icon');

function showToast(msg, type = 'success') {
  if (!toastEl) return;
  toastMsg.textContent = msg;
  toastIco.textContent = type === 'success' ? '✓' : '✕';
  toastEl.className = 'toast ' + type + ' show';
  setTimeout(() => { toastEl.classList.remove('show'); }, 4000);
}

/* ── SMOOTH ANCHOR SCROLL ─────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ── KEYBOARD ACCESS FOR CARDS ────────────────────── */
document.querySelectorAll('.proj-card:not(.proj-card--coming)').forEach(card => {
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const btn = card.querySelector('.proj-cta-btn:not(:disabled), .proj-view-btn');
      btn && btn.click();
    }
  });
});
