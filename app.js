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
})();

// ============================================================
// Auto-Versionamento Dinamico via GitHub API
// Busca a ultima release e atualiza links e badges
// ============================================================
(function() {
  var GITHUB_API = 'https://api.github.com/repos/victoryan7/KimiSound/releases/latest';

  function updateFromRelease(release) {
    // Extrair asset do instalador (.exe)
    var asset = null;
    for (var i = 0; i < release.assets.length; i++) {
      var a = release.assets[i];
      if (a.name.indexOf('.exe') > -1 && a.name.indexOf('Setup') > -1) {
        asset = a;
        break;
      }
    }
    if (!asset) return;

    var downloadUrl = asset.browser_download_url;
    var version = release.tag_name.replace('v', '');
    var versionLabel = 'v' + version;

    // 1. Atualizar todos os links com class 'download-link'
    var links = document.querySelectorAll('.download-link');
    for (var i = 0; i < links.length; i++) {
      links[i].href = downloadUrl;
    }

    // 2. Badge hero
    var badge = document.getElementById('version-badge');
    if (badge) {
      badge.textContent = versionLabel + ' · ATUALIZADO';
    }

    // 3. Footer version
    var footer = document.getElementById('version-footer');
    if (footer) {
      var dateInfo = '';
      if (release.published_at) {
        var d = new Date(release.published_at);
        dateInfo = ' · Build ' + d.getFullYear();
      }
      footer.textContent = versionLabel + dateInfo;
    }
  }

  // Buscar ultima release
  fetch(GITHUB_API, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(updateFromRelease)
    .catch(function(err) {
      console.warn('[KimiSound] Erro ao buscar versao:', err);
      // fallback: versao hardcoded ja esta no HTML
    });
})();
