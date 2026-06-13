(function () {
  'use strict';

  const STORAGE_KEY = 'meirenru-lang';
  let currentLang = 'en';

  function t(key) {
    return (window.I18N[currentLang] && window.I18N[currentLang][key]) || key;
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    localStorage.setItem(STORAGE_KEY, lang);

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    document.title = t('meta.title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t('meta.description');
  }

  function initI18n() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const lang = saved === 'zh' ? 'zh' : 'en';
    applyLanguage(lang);

    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
      langSwitch.addEventListener('click', () => {
        applyLanguage(currentLang === 'en' ? 'zh' : 'en');
      });
    }
  }

  initI18n();

  // Navigation scroll effect
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    nav.classList.toggle('scrolled', currentScroll > 50);
    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // Scroll reveal
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Color picker
  const colorOptions = document.querySelectorAll('.color-option');
  const previewFan = document.querySelector('.preview-fan');

  colorOptions.forEach((option) => {
    option.addEventListener('click', () => {
      colorOptions.forEach((o) => o.classList.remove('active'));
      option.classList.add('active');

      const color = option.dataset.color;
      if (previewFan) {
        previewFan.dataset.variant = color;
      }
    });
  });

  // Spectrum ring animation on scroll
  const spectrumRing = document.getElementById('spectrumRing');
  if (spectrumRing) {
    const spectrumObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let hue = 0;
            const animate = () => {
              hue = (hue + 0.5) % 360;
              spectrumRing.style.filter = `hue-rotate(${hue}deg)`;
              if (entry.isIntersecting) {
                requestAnimationFrame(animate);
              }
            };
            animate();
          }
        });
      },
      { threshold: 0.5 }
    );
    spectrumObserver.observe(spectrumRing);
  }

  // Hero fan speed on scroll
  const heroFan = document.getElementById('heroFan');
  if (heroFan) {
    const blades = heroFan.querySelector('.fan-blades');
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.min(window.scrollY / 600, 1);
      const duration = 8 - scrollPercent * 6;
      if (blades) {
        blades.style.animationDuration = `${duration}s`;
      }
    }, { passive: true });
  }

  // Smooth anchor offset for fixed nav
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 48;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();
