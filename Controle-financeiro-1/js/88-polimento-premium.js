/* ===== 0.4 · Polimento Premium (só movimento; nenhum dado ou cálculo muda aqui) =====
   1) Sem piscar: o app redesenha a tela inteira a cada toque (escolher um dia, abrir um item, salvar).
      As animações de entrada recomeçavam em todo redesenho e tudo "piscava". Agora:
      - ao TROCAR de tela (aba, sub-aba, seção) as entradas tocam como sempre (classe vp-troca no <html>);
      - no redesenho da MESMA tela nada recomeça; só o que é novo na tela (a lista do dia tocado, um item aberto)
        entra com um fade curto (classe vp-ent).
   2) Cartão de crédito: abrir desliza para baixo com as compras entrando em cascata; fechar recolhe antes de sumir.
   3) Itens que abrem (toque no título): o conteúdo entra com o mesmo fade curto.
   Tudo respeita "reduzir movimento" do aparelho e "Animações: desligadas" do app. O CSS fica em css/77-polimento-premium.css. */
(function () {
  const root = document.documentElement;
  const parado = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || root.dataset.mfanim === '0';
  const tela = () => (typeof mfLkScreen === 'function' ? mfLkScreen() : String(window.tab || ''));
  const txt = (el, n) => String((el && el.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, n || 32);

  /* o que tinha animação de entrada a cada redesenho: [seletor, o que distingue um do outro] */
  const ALVOS = [
    ['.mf-foldable', null],
    ['details[open]', el => el.dataset.fdrow || txt(el.querySelector('summary'), 40)],
    ['.mfu-det', el => txt(el.firstElementChild, 40)],
    ['.mfu-cal .dash-calendar-grid', null],
    ['.mfu-cal .mf-pvc-sw', null],
    ['.mfu-cal .mf-pvc-nav', null],
    ['.dash-calendar-events', el => { const d = el.closest('[data-bk]'), s = d && d.querySelector('.dash-calendar-day.selected'); return s ? (s.dataset.calday || txt(s, 12)) : ''; }],
    ['.mf-dia-l', el => { const d = el.closest('[data-bk]'), s = d && d.querySelector('.mf-dia-d.on'); return s ? (s.dataset.diad || '') : ''; }],
    ['.cbx-list', el => { const d = el.closest('.cbx-body'), s = d && d.querySelector('.cb-m.on,.cb-m[aria-pressed="true"],.cb-m.sel'); return s ? txt(s, 16) : ''; }],
    ['.mf-seg button.on', el => txt(el, 24)],
    ['.an-secs button.on', el => txt(el, 24)]
  ];
  function chaves(app, marcar) {
    const out = new Set(), n = {};
    ALVOS.forEach(([sel, extra], t) => {
      app.querySelectorAll(sel).forEach(el => {
        const bk = el.closest('[data-bk]'), base = (bk ? bk.dataset.bk : '') + '#' + t, e = extra ? extra(el) : '';
        const k = base + '#' + (e || (n[base] = (n[base] || 0) + 1));
        out.add(k);
        if (marcar && !marcar.has(k)) el.classList.add('vp-ent');
      });
    });
    return out;
  }

  let telaAnt = null, foto = null, tTroca = 0;
  (window.__mfPre = window.__mfPre || []).push(function () {
    try {
      const app = document.getElementById('app'), scr = tela();
      if (scr !== telaAnt || !app) {
        telaAnt = scr; foto = null;
        root.classList.add('vp-troca'); clearTimeout(tTroca);
        tTroca = setTimeout(() => root.classList.remove('vp-troca'), 750);
      } else {
        root.classList.remove('vp-troca'); clearTimeout(tTroca);
        foto = chaves(app, null);
      }
    } catch (e) { foto = null; }
  });
  (window.__mfAD = window.__mfAD || []).push(function () {
    try {
      const app = document.getElementById('app'); if (!app) return;
      if (foto && !parado()) chaves(app, foto);
      foto = null;
      abrirCartao(app);
    } catch (e) { }
  });

  /* itens que abrem sem redesenhar a tela: <details> e o recolher/abrir dos cards */
  document.addEventListener('click', function (e) {
    try {
      const t = e.target; if (!t || !t.closest) return;
      const s = t.closest('#app summary');
      if (s) { const d = s.parentElement; if (d && d.tagName === 'DETAILS') { if (d.open) d.classList.remove('vp-ent'); else d.classList.add('vp-ent'); } return; }
      const f = t.closest('#app .mf-fold');
      if (f) { const c = f.closest('.mf-foldable'); if (c) c.classList.add('vp-ent'); }
    } catch (err) { }
  }, true);

  /* ---- cartão de crédito ---- */
  const DUR = 300;
  function abrirCartao(app) {
    if (window.__cbxAbriu !== true) { window.__cbxAbriu = null; return; }
    window.__cbxAbriu = null;
    const b = app.querySelector('.cbx-body'); if (!b || parado()) return;
    const h = b.scrollHeight;
    b.classList.add('vp-abre');
    b.style.overflow = 'hidden'; b.style.height = '0px'; b.style.opacity = '0';
    void b.offsetHeight;
    b.style.transition = 'height ' + DUR + 'ms var(--vp-ease), opacity ' + DUR + 'ms var(--vp-ease)';
    b.style.height = h + 'px'; b.style.opacity = '1';
    setTimeout(() => { if (b.isConnected) { b.style.transition = ''; b.style.height = ''; b.style.overflow = ''; b.style.opacity = ''; } }, DUR + 40);
  }
  /* js/80 chama antes de fechar: recolhe com animação e só então redesenha */
  window.mfCbxFechar = function (cb) {
    const b = document.querySelector('#app .cbx-body');
    if (!b || parado()) { cb(); return; }
    let feito = false; const fim = () => { if (feito) return; feito = true; cb(); };
    try {
      const c = b.closest('.cbx'); if (c) c.classList.add('vp-fecha');
      b.style.overflow = 'hidden'; b.style.height = b.offsetHeight + 'px';
      void b.offsetHeight;
      b.style.transition = 'height 240ms var(--vp-ease), opacity 200ms var(--vp-ease), margin-top 240ms var(--vp-ease), padding-top 240ms var(--vp-ease)';
      b.style.height = '0px'; b.style.opacity = '0'; b.style.marginTop = '0px'; b.style.paddingTop = '0px';
      setTimeout(fim, 250);
    } catch (e) { fim(); }
  };
})();
