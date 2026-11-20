/* ===== Fase 3 · M4 · Gráficos animados =====
   Quando uma tela abre (ou muda o mês ou o modo), as barras crescem, as linhas se desenham e a rosca aparece com uma entrada suave.
   Só acontece na troca de tela/mês, não a cada atualização (senão tudo piscaria). A animação só mexe na aparência: valores, tamanhos
   finais e proporções são exatamente os mesmos. Respeita "reduzir movimento" do aparelho e "Animações: desligadas" do app. */
(window.__mfAD = window.__mfAD || []).push(function () {
  try {
    const app = document.getElementById('app'); if (!app) return;
    const scr = (typeof mfLkScreen === 'function' ? mfLkScreen() : String(tab)) + '|' + ym;
    if (window.__mfChScr === scr) {
      /* redesenho da MESMA tela durante a animação: continua de onde estava (atraso negativo) em vez de recomeçar do zero */
      if (app.classList.contains('mf-chart-in') && window.__mfChAt) app.style.setProperty('--mf-el', ((performance.now() - window.__mfChAt) / 1000).toFixed(3) + 's');
      return;
    }
    window.__mfChAt = performance.now(); app.style.setProperty('--mf-el', '0s');
    window.__mfChScr = scr;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.dataset.mfanim === '0') return;
    /* linhas: pathLength=1 deixa o "desenhar o traço" valer para qualquer tamanho de gráfico (não muda o desenho) */
    app.querySelectorAll('svg.mf-lines path, svg.mf-osc-svg path, .mf-eco svg path').forEach(p => {
      const st = p.getAttribute('stroke'), fi = p.getAttribute('fill');
      if (st && st !== 'none' && (fi === 'none' || fi === null)) p.setAttribute('pathLength', '1');
    });
    app.classList.add('mf-chart-in');
    clearTimeout(window.__mfChT);
    window.__mfChT = setTimeout(() => app.classList.remove('mf-chart-in'), 1500);
  } catch (e) { }
});
