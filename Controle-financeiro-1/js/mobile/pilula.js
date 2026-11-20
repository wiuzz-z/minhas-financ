/* Pílula das subabas (SÓ CELULAR). Estilo: css/94-pilula.css.
   A barra de pílulas só existe na tela-base (Lançamentos › Início, Contas › Situação): tocar numa pílula abre uma página e a barra sai.
   Este script faz duas coisas:
   1) desenha a pílula de vidro (i.mfp-g) atrás do botão ativo (a cada redesenho da tela);
   2) mfPilulaToque(botão): a animação de CLIQUE — a pílula encolhe até virar uma bolinha, vai para o botão tocado e se abre passando um
      pouco do tamanho (gelatina). O js/90-gesto-abas.js chama isto e só depois abre a página (devolve quantos ms esperar).
   Só desenha: não muda abas, dados nem o que cada botão abre. Sem animar com "Animações: Desligadas" ou "reduzir movimento". */
(function () {
  'use strict';
  const DUR = 560, ESPERA = 340;           // duração da gelatina e quanto esperar antes de abrir a página (a pílula já chegou e está se abrindo)
  const desk = () => !!(window.mfIsDesk && mfIsDesk());
  const semAnim = () => document.documentElement.dataset.mfanim === '0' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* os quadros: bolinha no meio do caminho, passa do tamanho ao chegar e assenta */
  function quadros(de, para, h) {
    const c0 = de.x + de.w / 2, c1 = para.x + para.w / 2, dist = Math.abs(c1 - c0);
    const bolha = Math.round(h * .96) + Math.min(dist * .22, 46);          // bolinha; estica mais quanto mais longe vai
    const T = (c, w, sy) => ({ width: w + 'px', transform: `translateX(${c - w / 2}px) scaleY(${sy})` });
    return [
      Object.assign({ offset: 0, easing: 'cubic-bezier(.45,0,.2,1)' }, T(c0, de.w, 1)),
      Object.assign({ offset: .34, easing: 'cubic-bezier(.16,.85,.3,1)' }, T(c0 + (c1 - c0) * .64, bolha, .9)),
      Object.assign({ offset: .64, easing: 'cubic-bezier(.3,0,.3,1)' }, T(c1, para.w * 1.13, .92)),
      Object.assign({ offset: .84, easing: 'cubic-bezier(.3,0,.3,1)' }, T(c1, para.w * .98, 1.03)),
      Object.assign({ offset: 1 }, T(c1, para.w, 1))
    ];
  }

  /* o texto acompanha a pílula: o antigo continua legível até ela sair, o novo só acende quando ela chega */
  function textos(de, para) {
    const fg = 'var(--ac-fg)', mu = 'var(--mu)', o = { duration: DUR, fill: 'none' };
    if (de) de.animate([{ color: fg }, { color: fg, offset: .22 }, { color: mu, offset: .5 }, { color: mu }], o);
    if (para) para.animate([{ color: mu }, { color: mu, offset: .26 }, { color: fg, offset: .5 }, { color: fg }], o);
  }

  const segDe = el => el && el.closest ? el.closest('#app .mf-anseg .mf-seg') : null;

  /* desenha a pílula sobre o botão ativo */
  function montar() {
    if (desk()) return;
    const seg = document.querySelector('#app .mf-anseg .mf-seg'); if (!seg) return;
    const on = seg.querySelector(':scope > button.on'); if (!on) return;
    let g = seg.querySelector(':scope > .mfp-g');
    if (!g) { g = document.createElement('i'); g.className = 'mfp-g'; g.setAttribute('aria-hidden', 'true'); seg.insertBefore(g, seg.firstChild); }
    g.style.top = on.offsetTop + 'px'; g.style.height = on.offsetHeight + 'px'; g.style.width = on.offsetWidth + 'px'; g.style.transform = `translateX(${on.offsetLeft}px)`;
  }

  /* animação de clique: a pílula vai até o botão tocado. Devolve quantos ms esperar antes de abrir a página (0 = sem animação). */
  window.mfPilulaToque = function (btn) {
    const seg = segDe(btn); if (!seg || desk() || semAnim() || !seg.animate) return 0;
    const on = seg.querySelector(':scope > button.on'), g = seg.querySelector(':scope > .mfp-g');
    if (!on || !g || on === btn) return 0;
    g.animate(quadros({ x: on.offsetLeft, w: on.offsetWidth }, { x: btn.offsetLeft, w: btn.offsetWidth }, on.offsetHeight), { duration: DUR, fill: 'none' });
    textos(on, btn);
    return ESPERA;
  };

  const start = () => {
    const app = document.getElementById('app'); if (!app) return;
    new MutationObserver(montar).observe(app, { childList: true });
    window.addEventListener('resize', montar);
    montar();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
