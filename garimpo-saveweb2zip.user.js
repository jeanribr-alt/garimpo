// ==UserScript==
// @name         Garimpo → Save Web to Zip
// @namespace    garimpo
// @version      1.4
// @description  Quando o Garimpo abre o Save Web to Zip: preenche o link, clica em Save e fecha a janela quando o download começa
// @match        https://saveweb2zip.com/*
// @run-at       document-start
// @grant        window.close
// @grant        unsafeWindow
// @updateURL    https://garimpo-beige.vercel.app/garimpo-saveweb2zip.user.js
// @downloadURL  https://garimpo-beige.vercel.app/garimpo-saveweb2zip.user.js
// ==/UserScript==
(function () {
  const m = location.hash.match(/u=([^&]+)/);
  if (!m) return;
  const link = decodeURIComponent(m[1]);
  history.replaceState(null, '', location.pathname);

  // mexe na página de verdade (o script roda isolado dela)
  const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  // quando o site disparar o download, espera uns segundos e fecha a janela
  let fechando = false;
  // fecha a janela (vários jeitos, porque o Chrome às vezes ignora o primeiro)
  const fecharJa = () => { try { window.close(); } catch (_) {} try { W.close(); } catch (_) {} try { W.open('', '_self'); W.close(); } catch (_) {} };
  const fechar = () => { if (fechando) return; fechando = true; setTimeout(fecharJa, 4000); };
  const clickOrig = W.HTMLAnchorElement.prototype.click;
  W.HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute('download') || /\.zip|blob:|download/i.test(this.href || '')) fechar();
    return clickOrig.apply(this, arguments);
  };
  try { W.navigation && W.navigation.addEventListener('navigate', (e) => { if (e.downloadRequest !== null || /\.zip|download/i.test(e.destination?.url || '')) fechar(); }); } catch (_) { /* navegador antigo */ }
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
      // quando aparece "Website is ready for download!" o zip já foi baixado: fecha a janela
      const vigia = setInterval(() => {
        if (/ready for download|pronto para (download|baixar)/i.test(document.body?.innerText || '')) { clearInterval(vigia); fechando = true; setTimeout(fecharJa, 2500); }
      }, 500);
      setTimeout(() => clearInterval(vigia), 10 * 60e3);
    }, 250);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
