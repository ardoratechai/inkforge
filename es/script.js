/* ═══════════════════════════════════════════════════
   InkForge Landing Page — JavaScript
   ═══════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════
   CONFIG EmailJS — 3 valores que debes rellenar tú
   ──────────────────────────────────────────────────────────
   PASO 1 → Ve a https://www.emailjs.com y crea cuenta gratis
   PASO 2 → Email Services → Add New Service → selecciona
            "Outlook" → conecta tu cuenta y copia el Service ID
   PASO 3 → Email Templates → Create New Template
            Usa estas variables en el template:
              {{from_name}}   → nombre del usuario
              {{from_email}}  → email del usuario
              {{device}}      → dispositivo seleccionado
              {{message}}     → texto fijo de confirmación
            Asunto sugerido: "InkForge - Nueva suscripción: {{from_email}}"
            Copia el Template ID
   PASO 4 → Account → Public Key → cópiala aquí abajo
   ══════════════════════════════════════════════════════════ */
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← p.ej. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← p.ej. 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← p.ej. 'aBcDeFgHiJkLmN'

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
   Pricing toggle (mensual / anual)
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
      showToast('Por favor, introduce un email válido.', 'error');
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
      emailError.textContent = 'Introduce un email válido.';
      valid = false;
    }
    if (!consentInput.checked) {
      consentError.textContent = 'Debes aceptar para continuar.';
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
        from_name:  document.getElementById('wlName').value.trim() || 'Sin nombre',
        from_email: emailInput.value.trim(),
        device:     document.getElementById('wlDevice').value || 'No indicado',
        message:    'Nueva suscripción a la lista de espera de InkForge.',
        reply_to:   emailInput.value.trim(),
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      showSuccess();
      incrementCounter();
    } catch (err) {
      console.error('EmailJS error:', err);
      showToast('Hubo un problema al enviar. Inténtalo de nuevo.', 'error');
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
  const pageText = encodeURIComponent('Acabo de apuntarme a la lista de espera de InkForge, la app que convierte tus notas de Kindle Scribe y reMarkable en conocimiento buscable con IA. ¡Échale un vistazo!');

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
        showToast('¡Enlace copiado al portapapeles!');
      } catch {
        showToast('Copia el enlace: ' + window.location.href);
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
