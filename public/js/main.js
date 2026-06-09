/* =====================================================
   MAYANK SHARMA — PORTFOLIO  |  main.js
   ===================================================== */

'use strict';

// ── CONFIG ──────────────────────────────────────────
// Replace this with your actual showreel YouTube embed URL
const SHOWREEL_URL = 'https://www.youtube.com/embed/YOUR_SHOWREEL_ID?autoplay=1&rel=0';

// ── DOM REFS ────────────────────────────────────────
const nav          = document.getElementById('nav');
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileClose  = document.getElementById('mobileClose');
const mobileLinks  = document.querySelectorAll('.mobile-link');
const btnReel      = document.getElementById('btnReel');
const videoModal   = document.getElementById('videoModal');
const modalClose   = document.getElementById('modalClose');
const modalFrame   = document.getElementById('modalFrame');
const backTop      = document.getElementById('backTop');
const toast        = document.getElementById('toast');
const cursor       = document.getElementById('cursor');
const cursorDot    = document.getElementById('cursorDot');
const contactForm  = document.getElementById('contactForm');
const statNums     = document.querySelectorAll('.stat-num');
const revealEls    = document.querySelectorAll('.reveal');
const filterPills  = document.querySelectorAll('.filter-pill');
const catBlocks    = document.querySelectorAll('.cat-block');
const watchBtns    = document.querySelectorAll('.watch-btn:not(:disabled)');

// ── CUSTOM CURSOR ────────────────────────────────────
if (window.matchMedia('(hover: hover)').matches) {
  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';
    }
  });

  const animateCursor = () => {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    if (cursor) {
      cursor.style.left = curX + 'px';
      cursor.style.top  = curY + 'px';
    }
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  // Hover state for interactive elements
  const hoverTargets = 'a, button, .proj-card:not(.proj-card--coming), .svc-card, .filter-pill';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hovering'));
  });
}

// ── NAV SCROLL ───────────────────────────────────────
const onScroll = () => {
  const scrollY = window.scrollY;

  // Sticky nav
  if (nav) nav.classList.toggle('scrolled', scrollY > 60);

  // Back to top
  if (backTop) backTop.classList.toggle('visible', scrollY > 400);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

// ── BACK TO TOP ──────────────────────────────────────
if (backTop) {
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── MOBILE MENU ──────────────────────────────────────
const openMobileMenu = () => {
  mobileMenu && mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeMobileMenu = () => {
  mobileMenu && mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
};

hamburger  && hamburger.addEventListener('click', openMobileMenu);
mobileClose && mobileClose.addEventListener('click', closeMobileMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

// ── VIDEO MODAL ──────────────────────────────────────
const openModal = (url) => {
  if (!videoModal || !modalFrame) return;
  modalFrame.src = url || '';
  videoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  if (!videoModal || !modalFrame) return;
  videoModal.classList.remove('open');
  document.body.style.overflow = '';
  // delay src clear so close animation plays
  setTimeout(() => { modalFrame.src = ''; }, 350);
};

// Showreel button
if (btnReel) {
  btnReel.addEventListener('click', () => openModal(SHOWREEL_URL));
}

// Watch Project buttons
watchBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const url = btn.getAttribute('data-video');
    if (url && url !== 'YOUR_YOUTUBE_EMBED_URL_HERE') {
      openModal(url);
    } else {
      showToast('Video coming soon!', 'error');
    }
  });
});

// Click on project card (not on button) also opens modal
document.querySelectorAll('.proj-card:not(.proj-card--coming)').forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.watch-btn')) return; // already handled above
    const btn = card.querySelector('.watch-btn:not(:disabled)');
    if (!btn) return;
    const url = btn.getAttribute('data-video');
    if (url && url !== 'YOUR_YOUTUBE_EMBED_URL_HERE') {
      openModal(url);
    }
  });
});

// Close modal
if (modalClose) modalClose.addEventListener('click', closeModal);
if (videoModal) {
  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeModal();
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── SCROLL REVEAL ────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
});

revealEls.forEach((el, i) => {
  // Stagger sibling cards naturally
  el.style.transitionDelay = (i % 3) * 0.08 + 's';
  revealObserver.observe(el);
});

// ── STAT COUNT-UP ────────────────────────────────────
const countUp = (el, target, duration = 1400) => {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      countUp(el, target);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statsObserver.observe(el));

// ── FILTER PILLS ─────────────────────────────────────
filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    // Update active pill
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    const filter = pill.getAttribute('data-filter');

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
        setTimeout(() => {
          if (pill.getAttribute('data-filter') !== 'all' && block.getAttribute('data-cat') !== pill.getAttribute('data-filter')) {
            block.style.display = 'none';
          }
        }, 350);
      }
    });
  });
});

// ── CONTACT FORM ─────────────────────────────────────
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('.btn-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const formData = {
      name:        contactForm.name.value.trim(),
      email:       contactForm.email.value.trim(),
      projectType: contactForm.projectType.value,
      budget:      contactForm.budget.value,
      message:     contactForm.message.value.trim()
    };

    // Basic validation
    if (!formData.name || !formData.email || !formData.projectType || !formData.message) {
      showToast('Please fill in all required fields.', 'error');
      btn.textContent = originalText;
      btn.disabled = false;
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast('Please enter a valid email address.', 'error');
      btn.textContent = originalText;
      btn.disabled = false;
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast('Message sent! I\'ll get back to you soon.', 'success');
        contactForm.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// ── TOAST ────────────────────────────────────────────
const showToast = (message, type = 'success') => {
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
};

// ── SMOOTH SCROLL FOR ANCHOR LINKS ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── KEYBOARD ACCESSIBILITY FOR CARDS ─────────────────
document.querySelectorAll('.proj-card:not(.proj-card--coming)').forEach(card => {
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const btn = card.querySelector('.watch-btn:not(:disabled)');
      btn && btn.click();
    }
  });
});
