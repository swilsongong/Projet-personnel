/* accessibility.js — small, optional helpers shared across pages
   - Persists high-contrast and font size
   - Exposes window.AideA11y for buttons to call if present
*/
(function () {
  const KEY_HC = 'a11y_high_contrast_v1';
  const KEY_FONT = 'a11y_font_pct_v1';

  function setHighContrast(on) {
    document.body.classList.toggle('hc', !!on);
    localStorage.setItem(KEY_HC, on ? '1' : '0');
  }
  function setFontPct(pct) {
    pct = Math.min(170, Math.max(90, Number(pct) || 100));
    document.documentElement.style.fontSize = pct + '%';
    localStorage.setItem(KEY_FONT, String(pct));
  }
  function restore() {
    if ((localStorage.getItem(KEY_HC) || '0') === '1') document.body.classList.add('hc');
    const saved = Number(localStorage.getItem(KEY_FONT) || '100');
    if (saved && saved !== 100) document.documentElement.style.fontSize = saved + '%';
  }

  restore();

  // Auto-wire global buttons if present
  const btnHC = document.getElementById('btnGlobalContrast');
  const btnInc = document.getElementById('btnGlobalTextInc');
  const btnDec = document.getElementById('btnGlobalTextDec');
  btnHC && btnHC.addEventListener('click', () => setHighContrast(!document.body.classList.contains('hc')));
  btnInc && btnInc.addEventListener('click', () => setFontPct((Number(localStorage.getItem(KEY_FONT) || '100')) + 10));
  btnDec && btnDec.addEventListener('click', () => setFontPct((Number(localStorage.getItem(KEY_FONT) || '100')) - 10));

  window.AideA11y = { setHighContrast, setFontPct };
})();
