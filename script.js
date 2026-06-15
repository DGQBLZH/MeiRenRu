(function () {
  'use strict';

  const STORAGE_KEY = 'merenro-lang';
  let currentLang = 'en';
  let contactData = {};

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

  function applyContactLinks() {
    const emailLink = document.getElementById('contactEmail');
    const facebookLink = document.getElementById('contactFacebook');
    const twitterLink = document.getElementById('contactTwitter');

    if (emailLink && contactData.email) {
      emailLink.href = 'mailto:' + contactData.email;
      emailLink.textContent = contactData.email;
    }
    if (facebookLink && contactData.facebook) {
      facebookLink.href = contactData.facebook;
      facebookLink.textContent = contactData.facebookDisplay || contactData.facebook;
    }
    if (twitterLink && contactData.twitter) {
      twitterLink.href = contactData.twitter;
      twitterLink.textContent = contactData.twitterDisplay || contactData.twitter;
    }
  }

  async function loadTexts() {
    const [enRes, zhRes, contactRes, aboutZhRes, aboutEnRes] = await Promise.all([
      fetch('texts/en.json'),
      fetch('texts/zh.json'),
      fetch('texts/contact.json'),
      fetch('texts/公司简介.txt'),
      fetch('texts/公司简介-en.txt')
    ]);

    const en = await enRes.json();
    const zh = await zhRes.json();
    contactData = await contactRes.json();

    const aboutZhText = await aboutZhRes.text();
    const aboutEnText = await aboutEnRes.text();
    const zhParagraphs = aboutZhText.trim().split('\n').filter(Boolean);
    const enParagraphs = aboutEnText.trim().split('\n').filter(Boolean);

    zh['about.p1'] = zhParagraphs[0] || '';
    zh['about.p2'] = zhParagraphs[1] || '';
    zh['about.p3'] = zhParagraphs[2] || '';
    en['about.p1'] = enParagraphs[0] || '';
    en['about.p2'] = enParagraphs[1] || '';
    en['about.p3'] = enParagraphs[2] || '';

    window.I18N = { en, zh };
    applyContactLinks();

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

  loadTexts();

  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

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
