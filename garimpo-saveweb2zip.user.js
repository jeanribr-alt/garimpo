// ==UserScript==
// @name         Garimpo → Save Web to Zip
// @namespace    garimpo
// @version      1.0
// @description  Preenche o link da oferta quando o Garimpo abre o Save Web to Zip
// @match        https://saveweb2zip.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function () {
  const m = location.hash.match(/u=([^&]+)/);
  if (!m) return;
  const link = decodeURIComponent(m[1]);
  let tentativas = 0;
  const t = setInterval(() => {
    const inp = document.querySelector('input[placeholder*="url" i], input[type=text], input[type=url]');
    if (!inp && ++tentativas < 40) return;
    clearInterval(t);
    if (!inp) return;
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(inp, link);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    inp.focus();
  }, 250);
})();
