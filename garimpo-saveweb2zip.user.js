// ==UserScript==
// @name         Garimpo → Save Web to Zip
// @namespace    garimpo
// @version      1.2
// @description  Quando o Garimpo abre o Save Web to Zip: preenche o link, clica em Save e fecha a janela quando o download começa
// @match        https://saveweb2zip.com/*
// @run-at       document-start
// @grant        window.close
// @updateURL    https://garimpo-beige.vercel.app/garimpo-saveweb2zip.user.js
// @downloadURL  https://garimpo-beige.vercel.app/garimpo-saveweb2zip.user.js
// ==/UserScript==
(function () {
  const m = location.hash.match(/u=([^&]+)/);
  if (!m) return;
  const link = decodeURIComponent(m[1]);
  history.replaceState(null, '', location.pathname);

  // quando o site disparar o download, espera uns segundos e fecha a janela
  let fechando = false;
  const fechar = () => { if (fechando) return; fechando = true; setTimeout(() => window.close(), 4000); };
  const clickOrig = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute('download') || /\.zip|blob:|download/i.test(this.href || '')) fechar();
    return clickOrig.apply(this, arguments);
  };
  try { window.navigation && window.navigation.addEventListener('navigate', (e) => { if (e.downloadRequest !== null || /\.zip|download/i.test(e.destination?.url || '')) fechar(); }); } catch (_) { /* navegador antigo */ }
  document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a'); if (a && (a.hasAttribute('download') || /\.zip|download/i.test(a.href || ''))) fechar(); }, true);

  let tentativas = 0;
  const iniciar = () => {
    const t = setInterval(() => {
      const inp = document.querySelector('input[placeholder*="url" i], input[type=text], input[type=url]');
      const btn = [...document.querySelectorAll('button')].find((b) => /save/i.test(b.textContent || ''));
      if ((!inp || !btn) && ++tentativas < 60) return;
      clearInterval(t);
      if (!inp || !btn) return;
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      set.call(inp, link);
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
      setTimeout(() => btn.click(), 600);
    }, 250);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
