/* ========== KIMISOUND LANDING ========== */
(function(){
  'use strict';

  // ---- sticky nav ----
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- reveal on scroll ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---- counter animation ----
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.counter);
      const dur = 1600;
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const isFloat = (target % 1) !== 0;
        const v = target * eased;
        el.textContent = isFloat ? v.toFixed(1) : Math.round(v).toString();
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      // trigger flow ring fill if inside a flow-circle
      const ring = el.closest('.feat-flow')?.querySelector('.flow-circle');
      if (ring) ring.classList.add('animated');
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-counter]').forEach(el => counterIO.observe(el));

  // ---- hero BPM ticker ----
  const bpm = document.getElementById('bpmTicker');
  if (bpm) {
    const bpms = ['123.0', '122.8', '124.2', '123.0', '125.1', '123.5'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % bpms.length;
      bpm.textContent = bpms[i];
    }, 1800);
  }

  // ---- pricing toggle ----
  const toggle = document.querySelector('.toggle');
  const opts = document.querySelectorAll('.t-opt');
  const pill = document.querySelector('.t-pill');

  const movePill = (opt) => {
    if (!pill || !opt || !toggle) return;
    const tRect = toggle.getBoundingClientRect();
    const oRect = opt.getBoundingClientRect();
    pill.style.width = oRect.width + 'px';
    pill.style.transform = `translateX(${oRect.left - tRect.left}px)`;
  };

  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      const period = opt.dataset.period;
      opts.forEach(o => {
        o.classList.toggle('active', o === opt);
        o.setAttribute('aria-selected', o === opt ? 'true' : 'false');
      });
      toggle.dataset.active = period;
      movePill(opt);

      document.querySelectorAll('.plan .amount, .plan .period').forEach(el => {
        const v = el.dataset[period];
        if (v != null) el.textContent = v;
      });

      document.querySelectorAll('.plan-alt-price').forEach(el => {
        const v = el.dataset[period];
        if (v != null) el.textContent = v;
      });
    });
  });

  // initial pill position (after fonts settle)
  const initPill = () => movePill(document.querySelector('.t-opt.active'));
  initPill();
  window.addEventListener('load', initPill);
  window.addEventListener('resize', initPill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initPill);

  // ---- mobile nav toggle (light, just shows links inline) ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (navLinks.style.display === 'flex') {
        navLinks.style.display = '';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '60px';
        navLinks.style.left = '20px';
        navLinks.style.right = '20px';
        navLinks.style.flexDirection = 'column';
        navLinks.style.padding = '16px';
        navLinks.style.background = 'rgba(15,17,23,.96)';
        navLinks.style.border = '1px solid var(--border)';
        navLinks.style.borderRadius = '12px';
        navLinks.style.backdropFilter = 'blur(20px)';
      }
    });
    navLinks?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth < 880) navLinks.style.display = '';
      });
    });
  }

  // ---- platform check: informational banner on non-Windows (download stays functional) ----
  (function() {
    var ua = navigator.userAgent;
    var platform = navigator.platform || '';
    var isWin = /Win(dows|32|64)/.test(platform) || /Windows|Win64|WOW64/.test(ua);
    var isMobile = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var isNonWindows = !isWin || isMobile;

    if (isNonWindows) {
      document.body.classList.add('not-windows');

      // Show subtle informational banner (does NOT block downloads)
      var banner = document.createElement('div');
      banner.className = 'platform-banner';
      banner.innerHTML =
        '<span class="platform-banner-icon">ð»</span>' +
        '<span class="platform-banner-text">KimiSound roda em <strong>Windows 10/11</strong>. ' +
        'O download e um instalador .exe para seu computador.</span>' +
        '<button class="platform-banner-close" aria-label="Fechar">&times;</button>';
      document.body.prepend(banner);

      banner.querySelector('.platform-banner-close').addEventListener('click', function() {
        banner.remove();
      });
    }
  })();
})();
