/* 2.9 · Efeito de clique (onda que se abre do ponto tocado) nos atalhos, áreas e linhas da Central e nas linhas de Patrimônio (SÓ CELULAR).
   Estilo: css/95-suavidade.css (.sm-rip). Só desenha a onda: o clique continua sendo tratado como sempre. Sem onda com
   "Animações: Desligadas" ou "reduzir movimento". */
(function () {
  'use strict';
  const ALVO = '#app :is(.gl-at, .gl-ar, .gl-fn, .mf-pat-it)';
  const desk = () => !!(window.mfIsDesk && mfIsDesk());
  const semAnim = () => document.documentElement.dataset.mfanim === '0' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.addEventListener('pointerdown', e => {
    if (desk() || semAnim() || (e.button && e.button !== 0)) return;
    const el = e.target.closest && e.target.closest(ALVO); if (!el) return;
    const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
    el.classList.add('sm-rip-host');
    const o = document.createElement('i'); o.className = 'sm-rip'; o.setAttribute('aria-hidden', 'true');
    o.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    el.appendChild(o);
    const fim = () => { o.remove(); if (!el.querySelector(':scope > .sm-rip')) el.classList.remove('sm-rip-host'); };
    o.addEventListener('animationend', fim); setTimeout(fim, 700);
  }, { passive: true, capture: true });
})();
