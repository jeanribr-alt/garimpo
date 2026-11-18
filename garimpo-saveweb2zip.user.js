// ==UserScript==
// @name         Garimpo → Save Web to Zip
// @namespace    garimpo
// @version      1.1
// @description  Quando o Garimpo abre o Save Web to Zip: preenche o link da oferta e já clica em Save
// @match        https://saveweb2zip.com/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://garimpo-beige.vercel.app/garimpo-saveweb2zip.user.js
// @downloadURL  https://garimpo-beige.vercel.app/garimpo-saveweb2zip.user.js
// ==/UserScript==
(function () {
  const m = location.hash.match(/u=([^&]+)/);
  if (!m) return;
  const link = decodeURIComponent(m[1]);
  // tira o link do endereço pra não baixar de novo se recarregar a página
  history.replaceState(null, '', location.pathname);
  let tentativas = 0;
  const t = setInterval(() => {
    const inp = document.querySelector('input[placeholder*="url" i], input[type=text], input[type=url]');
    const btn = [...document.querySelectorAll('button')].find((b) => /save/i.test(b.textContent || ''));
    if ((!inp || !btn) && ++tentativas < 40) return;
    clearInterval(t);
    if (!inp || !btn) return;
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(inp, link);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    // dá um instante pro site registrar o link e clica em Save
    setTimeout(() => btn.click(), 600);
  }, 250);
})();
