/* ============================================================================
   KimiSound — runtime i18n da landing  (pacote T023 / v1.0.0)
   ----------------------------------------------------------------------------
   Ultimo script do documento. NAO depende de app.js e NAO altera app.js.

   Convencao: CHAVE = a propria string pt-BR (estilo gettext).
     <p data-i18n="Funcionalidades">Funcionalidades</p>
     <img data-i18n-attr="alt" alt="KimiStage — intro da faixa no palco">
     <small data-i18n-dataset="monthly: / mês;annual: / ano"> / mês</small>

   Precedencia:  ?lang=  >  localStorage ks_lang  >  navigator.language  >  pt-BR
   Troca sem reload; <html lang> dinamico; og:locale + og:locale:alternate
   sincronizados; pt-BR = identidade (nao baixa catalogo).

   API publica:  window.KSi18n = { t, setLang, lang, apply, available }
   ==========================================================================*/
(function () {
  'use strict';

  var SUPPORTED = ['pt-BR', 'en', 'es'];
  var FALLBACK = 'pt-BR';
  var STORAGE_KEY = 'ks_lang';
  var CATALOG_BASE = 'assets/i18n/';
  var OG_LOCALE = { 'pt-BR': 'pt_BR', 'en': 'en_US', 'es': 'es_ES' };

  // toast de plataforma montado em runtime pelo app.js (mantem o <strong>)
  var TOAST_KEY = 'KimiSound esta disponivel apenas para <strong>Windows 10/11</strong>. ' +
                  'Acesse pelo seu computador para baixar!';

  var cache = {};      // locale -> { chave: traducao }
  var current = FALLBACK;
  var origin = 'default';
  var applying = false;

  /* ---------------- resolucao de idioma ---------------- */
  function normalize(code) {
    if (!code) { return null; }
    var c = String(code).toLowerCase();
    if (c.indexOf('pt') === 0) { return 'pt-BR'; }
    if (c.indexOf('es') === 0) { return 'es'; }
    if (c.indexOf('en') === 0) { return 'en'; }
    return null;
  }

  function fromQuery() {
    try {
      var m = /[?&]lang=([^&#]+)/.exec(window.location.search);
      return m ? normalize(decodeURIComponent(m[1])) : null;
    } catch (e) { return null; }
  }

  function fromStorage() {
    try { return normalize(window.localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }

  function fromNavigator() {
    try {
      var list = (navigator.languages && navigator.languages.length)
        ? navigator.languages : [navigator.language];
      for (var i = 0; i < list.length; i++) {
        var n = normalize(list[i]);
        if (n) { return n; }
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function persist(locale) {
    try { window.localStorage.setItem(STORAGE_KEY, locale); } catch (e) { /* ignore */ }
  }

  /* ---------------- traducao ---------------- */
  function t(s) {
    if (typeof s !== 'string' || !s) { return s; }
    if (current === FALLBACK) { return s; }
    var cat = cache[current];
    if (!cat) { return s; }
    var v = cat[s];
    return (typeof v === 'string' && v) ? v : s;
  }

  function loadCatalog(locale) {
    if (locale === FALLBACK) { return Promise.resolve(null); }
    if (cache[locale]) { return Promise.resolve(cache[locale]); }
    if (typeof window.fetch !== 'function') { return Promise.resolve(null); }
    return window.fetch(CATALOG_BASE + locale + '.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && typeof data === 'object') { cache[locale] = data; return data; }
        return null;
      })
      .catch(function () { return null; });
  }

  /* ---------------- aplicacao no DOM ---------------- */
  function applyText(root) {
    var els = (root || document).querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.getAttribute('data-i18n');
      if (key) { el.textContent = t(key); }
    }
  }

  function applyAttrs(root) {
    var els = (root || document).querySelectorAll('[data-i18n-attr]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.__ksAttrs) {
        // captura o pt-BR UMA vez (antes de qualquer traducao) -> a chave nao se perde
        var names = (el.getAttribute('data-i18n-attr') || '').split(',');
        var map = {};
        for (var n = 0; n < names.length; n++) {
          var name = names[n].replace(/^\s+|\s+$/g, '');
          if (name) { map[name] = el.getAttribute(name); }
        }
        el.__ksAttrs = map;
      }
      for (var a in el.__ksAttrs) {
        if (el.__ksAttrs.hasOwnProperty(a) && el.__ksAttrs[a]) {
          el.setAttribute(a, t(el.__ksAttrs[a]));
        }
      }
    }
  }

  function parseDataset(raw) {
    var out = {};
    var parts = String(raw || '').split(';');
    for (var i = 0; i < parts.length; i++) {
      var idx = parts[i].indexOf(':');
      if (idx > 0) {
        out[parts[i].slice(0, idx).replace(/^\s+|\s+$/g, '')] = parts[i].slice(idx + 1);
      }
    }
    return out;
  }

  function activePeriod() {
    var opt = document.querySelector('.t-opt.active');
    var p = opt && opt.getAttribute('data-period');
    return p || 'monthly';
  }

  function applyDatasets(root) {
    var els = (root || document).querySelectorAll('[data-i18n-dataset]');
    if (!els.length) { return false; }
    var period = activePeriod();
    var touched = false;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.__ksDataset) { el.__ksDataset = parseDataset(el.getAttribute('data-i18n-dataset')); }
      for (var name in el.__ksDataset) {
        if (el.__ksDataset.hasOwnProperty(name) && el.__ksDataset[name]) {
          el.setAttribute('data-' + name, t(el.__ksDataset[name]));
          touched = true;
        }
      }
      // espelha o toggle do app.js: dentro de .plan, o elemento exibe o periodo ativo
      if (el.closest && el.closest('.plan') && el.__ksDataset[period]) {
        el.textContent = t(el.__ksDataset[period]);
      }
    }
    return touched;
  }

  function syncHtmlLang() {
    document.documentElement.setAttribute('lang', current);
  }

  function syncOgLocale() {
    var head = document.head;
    if (!head) { return; }
    var alts = head.querySelectorAll('meta[property="og:locale:alternate"]');
    for (var i = 0; i < alts.length; i++) { alts[i].parentNode.removeChild(alts[i]); }
    var main = head.querySelector('meta[property="og:locale"]');
    if (!main) {
      main = document.createElement('meta');
      main.setAttribute('property', 'og:locale');
      head.appendChild(main);
    }
    main.setAttribute('content', OG_LOCALE[current] || OG_LOCALE[FALLBACK]);
    for (var j = 0; j < SUPPORTED.length; j++) {
      var loc = SUPPORTED[j];
      if (loc === current) { continue; }
      var alt = document.createElement('meta');
      alt.setAttribute('property', 'og:locale:alternate');
      alt.setAttribute('content', OG_LOCALE[loc]);
      head.appendChild(alt);
    }
  }

  function syncButtons() {
    var btns = document.querySelectorAll('.lang-btn[data-lang]');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-lang') === current;
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      btns[i].classList.toggle('active', on);
    }
  }

  function apply() {
    if (applying) { return; }
    applying = true;
    try {
      syncHtmlLang();
      applyText(document);
      applyAttrs(document);
      var touched = applyDatasets(document);
      syncOgLocale();
      syncButtons();
      if (touched && window.Event) {
        // recalcula a pill do toggle mensal/anual (largura do texto mudou)
        try { window.dispatchEvent(new Event('resize')); } catch (e) { /* ignore */ }
      }
    } finally {
      applying = false;
    }
  }

  /* ---------------- textos montados pelo app.js em runtime ---------------- */
  function patchPlatformBanner(scope) {
    var root = scope || document;
    var bubble = root.querySelector('.platform-banner-text');
    if (bubble) { bubble.innerHTML = t(TOAST_KEY); }
    var close = root.querySelector('.platform-banner-close');
    if (close) { close.setAttribute('aria-label', t('Fechar')); }
  }

  function watchPlatformBanner() {
    if (!window.MutationObserver || !document.body) { return; }
    var mo = new window.MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes || [];
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node && node.nodeType === 1 && node.classList &&
              node.classList.contains('platform-banner')) {
            patchPlatformBanner(node);
          }
        }
      }
    });
    mo.observe(document.body, { childList: true });
  }

  /* ---------------- API ---------------- */
  function setLang(locale, doPersist) {
    var next = normalize(locale) || FALLBACK;
    current = next;
    if (doPersist) { persist(next); }
    return loadCatalog(next).then(function () {
      apply();
      return current;
    });
  }

  function wireButtons() {
    var btns = document.querySelectorAll('.lang-btn[data-lang]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (ev) {
        if (ev && ev.preventDefault) { ev.preventDefault(); }
        setLang(this.getAttribute('data-lang'), true);
      });
    }
  }

  function init() {
    var q = fromQuery();
    if (q) { current = q; origin = 'query'; persist(q); }
    else {
      var s = fromStorage();
      if (s) { current = s; origin = 'storage'; }
      else {
        var n = fromNavigator();
        if (n) { current = n; origin = 'navigator'; }
      }
    }
    wireButtons();
    watchPlatformBanner();
    loadCatalog(current).then(function () {
      apply();
      patchPlatformBanner(document);
      if (window.console && console.info) {
        console.info('[i18n] lang=' + current + ' origem=' + origin);
      }
    });
  }

  window.KSi18n = {
    t: t,
    setLang: setLang,
    apply: apply,
    available: SUPPORTED.slice(),
    fallback: FALLBACK,
    get lang() { return current; },
    get origin() { return origin; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
