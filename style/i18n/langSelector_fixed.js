/* Language Selector Overlay — shows on first visit if no language cookie is set.
   Include AFTER langCookie.js. Requires a <meta name="page-country" content="kg|kz|uz|az"> tag. */
(function() {
  if (!window.LangCookie) return;

  var LANG_MAP = {
    kg: { local: 'kg', localLabel: 'Кыргызча', localFlag: '🇰🇬', ruLabel: 'Русский', ruFlag: '🇷🇺' },
    kz: { local: 'kz', localLabel: 'Қазақша',  localFlag: '🇰🇿', ruLabel: 'Русский', ruFlag: '🇷🇺' },
    uz: { local: 'uz', localLabel: 'O\'zbek',   localFlag: '🇺🇿', ruLabel: 'Русский', ruFlag: '🇷🇺' },
    az: { local: 'az', localLabel: 'Azərbaycanca', localFlag: '🇦🇿', ruLabel: 'Русский', ruFlag: '🇷🇺' }
  };

  var meta = document.querySelector('meta[name="page-country"]');
  var country = meta ? meta.getAttribute('content') : null;
  if (!country || !LANG_MAP[country]) return;

  // If cookie is already set — skip
  if (LangCookie.get()) return;

  var cfg = LANG_MAP[country];

  var overlay = document.createElement('div');
  overlay.id = 'langSelectorOverlay';
  overlay.innerHTML =
    '<div class="ls-backdrop"></div>' +
    '<div class="ls-card">' +
      '<div class="ls-title">Выберите язык</div>' +
      '<div class="ls-buttons">' +
        '<button class="ls-btn" data-lang="ru">' +
          '<span class="ls-flag">' + cfg.ruFlag + '</span>' +
          '<span class="ls-label">' + cfg.ruLabel + '</span>' +
        '</button>' +
        '<button class="ls-btn" data-lang="' + cfg.local + '">' +
          '<span class="ls-flag">' + cfg.localFlag + '</span>' +
          '<span class="ls-label">' + cfg.localLabel + '</span>' +
        '</button>' +
      '</div>' +
    '</div>';

  // Inject styles
  var style = document.createElement('style');
  style.textContent =
    '#langSelectorOverlay{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;animation:lsFadeIn .25s ease}' +
    '@keyframes lsFadeIn{from{opacity:0}to{opacity:1}}' +
    '.ls-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.5)}' +
    '.ls-card{position:relative;background:#fff;border-radius:16px;padding:28px 24px 24px;max-width:320px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,.2);text-align:center;animation:lsSlideUp .3s ease}' +
    '@keyframes lsSlideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}' +
    '.ls-title{font-size:17px;font-weight:600;color:#1a1a1a;margin-bottom:20px}' +
    '.ls-buttons{display:flex;gap:12px}' +
    '.ls-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 8px;border-radius:12px;border:2px solid #e5e7eb;background:#fff;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .1s;font-family:inherit}' +
    '.ls-btn:hover{border-color:#6b7280;box-shadow:0 2px 8px rgba(0,0,0,.08)}' +
    '.ls-btn:active{transform:scale(.97)}' +
    '.ls-flag{font-size:32px;line-height:1}' +
    '.ls-label{font-size:14px;font-weight:600;color:#1a1a1a}';
  document.head.appendChild(style);

  function emitLangChanged(lang) {
    try {
      window.dispatchEvent(new CustomEvent('siteLangChanged', { detail: { lang: lang } }));
      return;
    } catch (e) {}
    try {
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('siteLangChanged', true, true, { lang: lang });
      window.dispatchEvent(evt);
    } catch (e2) {}
  }

  function choose(lang) {
    LangCookie.set(lang);
    window.SITE_LANG = lang;
    emitLangChanged(lang);
    overlay.style.animation = 'lsFadeIn .2s ease reverse';
    setTimeout(function() {
      overlay.remove();
      // If the page has client-side i18n, trigger a language update
      if (typeof window.applyLang === 'function') {
        window.applyLang(lang);
      }
    }, 200);
  }

  overlay.querySelectorAll('.ls-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      choose(btn.getAttribute('data-lang'));
    });
  });

  // Prevent clicks on backdrop from closing (user must choose)
  overlay.querySelector('.ls-backdrop').addEventListener('click', function(e) {
    e.stopPropagation();
  });

  if (document.body) {
    document.body.appendChild(overlay);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      document.body.appendChild(overlay);
    });
  }
})();