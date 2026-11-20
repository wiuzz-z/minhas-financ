/* 2.8 · Pílula da barra de baixo que desliza de uma aba para a outra (SÓ CELULAR). Estilo: css/95-suavidade.css.
   A barra é redesenhada a cada troca; este script desenha a pílula (i.nv-g) atrás do botão ativo e, ao trocar de aba,
   anima do lugar antigo para o novo. Só posiciona e anima: não muda abas, dados nem o que cada botão abre.
   Sem animar com "Animações: Desligadas" ou "reduzir movimento". */
(function () {
  'use strict';
  const DURACAO = 260, CURVA = 'cubic-bezier(.32,.72,0,1)';
  let prev = null; // { x, t }

  const desk = () => !!(window.mfIsDesk && mfIsDesk());
  const semAnim = () => document.documentElement.dataset.mfanim === '0' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function montar(animar) {
    const nv = document.getElementById('nv'); if (!nv) return;
    const on = !desk() ? nv.querySelector('button.on') : null;
    if (!on) { nv.classList.remove('nv-ghost'); const o = nv.querySelector('.nv-g'); if (o) o.remove(); prev = null; return; }
    let g = nv.querySelector('.nv-g');
    if (!g) { g = document.createElement('i'); g.className = 'nv-g'; g.setAttribute('aria-hidden', 'true'); nv.insertBefore(g, nv.firstChild); }
    // a cor da pílula é a que o botão ativo já tinha (muda com o tema): lê com o botão "sem fantasma" por um instante
    on.style.transition = 'none'; // sem transição de fundo: a cor lida é a final, não a do meio do caminho
    nv.classList.remove('nv-ghost');
    const cs = getComputedStyle(on), cor = cs.backgroundColor, raio = cs.borderRadius;
    const nr = nv.getBoundingClientRect(), br = on.getBoundingClientRect();
    nv.classList.add('nv-ghost');
    void on.offsetWidth; on.style.transition = '';
    const x = br.left - nr.left, y = br.top - nr.top;
    g.style.width = br.width + 'px'; g.style.height = br.height + 'px'; g.style.top = y + 'px';
    g.style.background = cor; g.style.borderRadius = raio; g.style.transform = 'translateX(' + x + 'px)';
    if (animar && prev && Date.now() - prev.t < 3000 && Math.abs(prev.x - x) > 1 && !semAnim() && g.animate) {
      g.animate([{ transform: 'translateX(' + prev.x + 'px)' }, { transform: 'translateX(' + x + 'px)' }], { duration: DURACAO, easing: CURVA });
    }
    prev = { x, t: Date.now() };
  }

  const start = () => {
    const nv = document.getElementById('nv'); if (!nv) return;
    new MutationObserver(() => montar(true)).observe(nv, { childList: true });
    window.addEventListener('resize', () => montar(false));
    montar(false);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
