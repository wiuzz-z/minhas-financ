/* ===== 0.3 · Visual Premium (só aparência) =====
   1) Ícones de linha na navegação: troca o desenho dos cinco botões por ícones de traço único, todos do mesmo estilo.
      O botão, o rótulo e o clique continuam os mesmos; só o desenho muda.
   2) Números que contam: na primeira vez que cada tela abre, os valores principais sobem de zero até o valor.
      O texto final é exatamente o que o app escreveu (nenhum cálculo é refeito aqui). Acontece uma vez só por tela.
   3) Cabeçalho do celular: ganha a linha de baixo quando a tela rola.
   Tudo respeita "reduzir movimento" do aparelho e "Animações: desligadas" do app. */
(function () {
  const IC = {
    res: '<rect x="3.5" y="3.5" width="7" height="9" rx="2"/><rect x="13.5" y="3.5" width="7" height="5" rx="2"/><rect x="13.5" y="11.5" width="7" height="9" rx="2"/><rect x="3.5" y="15.5" width="7" height="5" rx="2"/>',
    add: '<path d="M7.5 19.5v-15"/><path d="M4 8l3.5-3.5L11 8"/><path d="M16.5 4.5v15"/><path d="M13 16l3.5 3.5L20 16"/>',
    mais: '<path d="M19.5 8.5V7a2 2 0 0 0-2-2h-12a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-13a2 2 0 0 1-2-2"/><path d="M16.5 14h.01"/>',
    inv: '<path d="M3.5 17l5.5-5.5 4 4 7.5-8"/><path d="M15 7.5h5.5V13"/>',
    anal: '<path d="M3.5 20.5h17"/><path d="M7 20.5v-7"/><path d="M12 20.5v-13"/><path d="M17 20.5v-10"/>'
  };
  function icones() {
    const nv = document.getElementById('nv'); if (!nv) return;
    nv.querySelectorAll('button[data-tab] .nv-mono svg:not(.vp-ic)').forEach(s => {
      const b = s.closest('button[data-tab]'), d = b && IC[b.dataset.tab]; if (!d) return;
      const t = document.createElement('span');
      t.innerHTML = '<svg class="vp-ic" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
      s.replaceWith(t.firstChild);
    });
  }
  const parado = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.mfanim === '0';
  const visto = {};
  const NUM = /\d{1,3}(?:\.\d{3})*,\d{2}/;
  function contar(el) {
    if (el.children.length) return;
    const fim = el.textContent, m = NUM.exec(fim); if (!m) return;
    const v = parseFloat(m[0].replace(/\./g, '').replace(',', '.')); if (!(v > 0)) return;
    const a = fim.slice(0, m.index), z = fim.slice(m.index + m[0].length), t0 = performance.now(), dur = 650;
    let ult = fim;
    (function passo(t) {
      if (!el.isConnected || el.textContent !== ult) return;            /* a tela foi redesenhada: quem vale é o texto novo */
      const p = Math.min(1, (t - t0) / dur);
      if (p >= 1) { el.textContent = fim; return; }
      const e = 1 - Math.pow(1 - p, 3);
      ult = a + (v * e).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + z;
      el.textContent = ult;
      requestAnimationFrame(passo);
    })(t0);
  }
  function numeros() {
    const app = document.getElementById('app'); if (!app) return;
    const k = (typeof mfLkScreen === 'function' ? mfLkScreen() : String(window.tab || ''));
    if (visto[k]) return;
    const alvos = app.querySelectorAll('.dash-balance-value, .dv-hero-v, .g2 > .k > b, .dv-kpis .dv-k > b');
    if (!alvos.length) return;
    visto[k] = 1;
    if (parado()) return;
    alvos.forEach(contar);
  }
  (window.__mfAD = window.__mfAD || []).push(function () { try { icones(); numeros(); } catch (e) { } });
  try {
    const nv = document.getElementById('nv');
    if (nv && window.MutationObserver) new MutationObserver(icones).observe(nv, { childList: true, subtree: true });
    icones();
    addEventListener('scroll', function () { document.documentElement.classList.toggle('vp-rolou', (window.scrollY || 0) > 6); }, { passive: true });
  } catch (e) { }
})();
