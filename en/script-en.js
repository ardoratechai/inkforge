/* ═══════════════════════════════════════════════════
   InkForge Landing Page — JavaScript
   ═══════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════
   CONFIG EmailJS — 3 values you need to fill in
   ──────────────────────────────────────────────────────────
   STEP 1 → Go to https://www.emailjs.com and create free account
   STEP 2 → Email Services → Add New Service → select
            "Outlook" → connect your account and copy Service ID
   STEP 3 → Email Templates → Create New Template
            Use these variables in the template:
              {{from_name}}   → user name
              {{from_email}}  → user email
              {{device}}      → selected device
              {{message}}     → confirmation text
            Subject suggestion: "InkForge - New subscription: {{from_email}}"
            Copy the Template ID
   STEP 4 → Account → Public Key → copy it below
   ══════════════════════════════════════════════════════════ */
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← e.g. 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← e.g. 'aBcDeFgHiJkLmN'

if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

const DEMO_MODE = EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID';

/* ──────────────────────────────────────
   NAV scroll effect + mobile menu
─────────────────────────────────────── */
(function initNav() {
  const nav       = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
})();

/* ──────────────────────────────────────
   Scroll-reveal animations
─────────────────────────────────────── */
(function initReveal() {
  const targets = [
    '.pain__card', '.how__step', '.feature-row',
    '.privacy__card', '.testi__card', '.plan',
    '.section-title', '.section-sub', '.waitlist__inner',
    '.metric', '.device-pill'
  ].join(',');

  document.querySelectorAll(targets).forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ──────────────────────────────────────
   Pricing toggle (monthly / annual)
─────────────────────────────────────── */
(function initPricingToggle() {
  const toggle = document.getElementById('billingToggle');
  if (!toggle) return;

  let isAnnual = false;

  toggle.addEventListener('click', () => {
    isAnnual = !isAnnual;
    toggle.classList.toggle('on', isAnnual);
    toggle.setAttribute('aria-checked', isAnnual);

    document.querySelectorAll('.plan__amount').forEach(el => {
      const monthly = el.dataset.monthly;
      const annual  = el.dataset.annual;
      if (!monthly || !annual) return;
      animateCounter(el, parseInt(el.textContent) || 0, parseInt(isAnnual ? annual : monthly));
    });
  });

  function animateCounter(el, from, to) {
    const duration = 300;
    const start = performance.now();
    requestAnimationFrame(function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(from + (to - from) * ease);
      if (progress < 1) requestAnimationFrame(step);
    });
  }
})();

/* ──────────────────────────────────────
   Waitlist counter animation
─────────────────────────────────────── */
(function initWaitlistCounter() {
  const BASE = 412;
  const counters = document.querySelectorAll('#waitlistCounter, #waitlistCounter2');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateFrom(entry.target, 360, BASE);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));

  function animateFrom(el, from, to) {
    const dur = 1200;
    const start = performance.now();
    requestAnimationFrame(function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    });
  }
})();

/* ──────────────────────────────────────
   Hero waitlist form (mini form)
─────────────────────────────────────── */
(function initHeroForm() {
  const form = document.getElementById('heroWaitlistForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type=email]');
    const email = emailInput.value.trim();

    if (!isValidEmail(email)) {
      emailInput.style.borderColor = '#E53935';
      showToast('Please enter a valid email.', 'error');
      return;
    }

    const mainEmail = document.getElementById('wlEmail');
    if (mainEmail) mainEmail.value = email;

    document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const wlEmail = document.getElementById('wlEmail');
      if (wlEmail) wlEmail.focus();
    }, 600);
  });
})();

/* ──────────────────────────────────────
   Main waitlist form
─────────────────────────────────────── */
(function initMainWaitlistForm() {
  const form = document.getElementById('mainWaitlistForm');
  if (!form) return;

  const submitBtn  = form.querySelector('.waitlist__submit');
  const btnText    = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput   = document.getElementById('wlEmail');
    const consentInput = document.getElementById('wlConsent');
    const emailError   = document.getElementById('wlEmailError');
    const consentError = document.getElementById('wlConsentError');

    emailError.textContent   = '';
    consentError.textContent = '';
    emailInput.classList.remove('error');

    let valid = true;

    if (!isValidEmail(emailInput.value.trim())) {
      emailInput.classList.add('error');
      emailError.textContent = 'Please enter a valid email.';
      valid = false;
    }
    if (!consentInput.checked) {
      consentError.textContent = 'You must agree to continue.';
      valid = false;
    }
    if (!valid) return;

    setLoading(true);

    try {
      if (DEMO_MODE) {
        await new Promise(r => setTimeout(r, 900));
        showSuccess();
        incrementCounter();
        return;
      }

      const templateParams = {
        from_name:  document.getElementById('wlName').value.trim() || 'No name',
        from_email: emailInput.value.trim(),
        device:     document.getElementById('wlDevice').value || 'Not specified',
        message:    'New subscription to InkForge waitlist.',
        reply_to:   emailInput.value.trim(),
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      showSuccess();
      incrementCounter();
    } catch (err) {
      console.error('EmailJS error:', err);
      showToast('There was a problem sending. Please try again.', 'error');
      setLoading(false);
    }

    function setLoading(loading) {
      submitBtn.disabled = loading;
      btnText.hidden    = loading;
      btnLoading.hidden = !loading;
    }

    function showSuccess() {
      const formState    = document.getElementById('waitlistFormState');
      const successState = document.getElementById('waitlistSuccessState');
      formState.hidden    = true;
      successState.hidden = false;
      localStorage.setItem('if_waitlist_joined', '1');
    }

    function incrementCounter() {
      document.querySelectorAll('#waitlistCounter, #waitlistCounter2').forEach(el => {
        el.textContent = parseInt(el.textContent) + 1;
      });
    }
  });
})();

/* ──────────────────────────────────────
   Restore success state on reload
─────────────────────────────────────── */
(function checkAlreadyJoined() {
  if (localStorage.getItem('if_waitlist_joined')) {
    const formState    = document.getElementById('waitlistFormState');
    const successState = document.getElementById('waitlistSuccessState');
    if (formState && successState) {
      formState.hidden    = true;
      successState.hidden = false;
    }
  }
})();

/* ──────────────────────────────────────
   Share buttons
─────────────────────────────────────── */
(function initShareButtons() {
  const pageUrl  = encodeURIComponent(window.location.href);
  const pageText = encodeURIComponent('I just joined the InkForge waitlist, the app that turns your Kindle Scribe and reMarkable notes into searchable knowledge with AI. Check it out!');

  const linkedin = document.getElementById('shareLinkedIn');
  const twitter  = document.getElementById('shareTwitter');
  const copy     = document.getElementById('copyLink');

  if (linkedin) {
    linkedin.addEventListener('click', () => {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`, '_blank', 'noopener,noreferrer,width=600,height=500');
    });
  }

  if (twitter) {
    twitter.addEventListener('click', () => {
      window.open(`https://twitter.com/intent/tweet?text=${pageText}&url=${pageUrl}`, '_blank', 'noopener,noreferrer,width=600,height=400');
    });
  }

  if (copy) {
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      } catch {
        showToast('Copy this link: ' + window.location.href);
      }
    });
  }
})();

/* ──────────────────────────────────────
   Toast notification
─────────────────────────────────────── */
function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#E53935' : '#2D2010';
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ──────────────────────────────────────
   Utility
─────────────────────────────────────── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ──────────────────────────────────────
   Smooth scroll for all anchor links
─────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
