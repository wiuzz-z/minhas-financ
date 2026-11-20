/* 3.8 · Gráficos animados e interativos (SÓ CELULAR; o computador não muda).
   Reúne, num lugar só, tudo o que anima e responde ao toque nos gráficos:
     1. Rosca do cartão de classe da Posição (.mf-ring): enche até a % e o número conta junto.
     2. Roscas de distribuição (svg.mf-dn: Distribuição da carteira, Tipo de ativo, Ativos, gastos…): as fatias crescem em sequência.
        Tocar numa fatia (ou na linha da legenda) deixa só ela em destaque e mostra o nome e a % no centro; tocar de novo desfaz.
     3. Barras (horizontais, verticais, empilhadas) e progressos: crescem a partir da base. Tocar numa linha de barras destaca a linha.
     4. Linhas e áreas dos gráficos (svg[role="img"]): a linha se desenha, a área e os pontos aparecem.
   Quando toca: ao aparecer na tela (inclusive ao rolar até o gráfico), ao voltar para a aba/subaba, ao trocar o modo (Classe/Setor/Ativo,
   Rosca/Barras…) e ao tocar no próprio gráfico. Um redesenho comum da MESMA tela (cotação chegando, digitar um valor) não reinicia nada.
   Só mexe na aparência: os valores, tamanhos finais e proporções vêm do HTML e nunca mudam. Respeita "reduzir movimento" do aparelho e
   "Animações: desligadas" do app (os gráficos nascem prontos). Sem ligação com o resto: se este arquivo faltar, o app funciona igual, sem animação.

   Ajustes rápidos (duração, atraso, quais elementos animam) ficam nas constantes logo abaixo. */
(function () {
  'use strict';
  const desk = () => !!(window.mfIsDesk && mfIsDesk());
  const DUR = 800;                                   // duração das barras e roscas (ms)
  const DUR_LINHA = 1000;                            // duração do traço das linhas (ms)
  const PASSO = 60, PASSO_MAX = 360;                 // atraso entre uma barra e a seguinte, e o máximo (ms)
  const EASE = 'cubic-bezier(.22,1,.36,1)';
  /* o que anima em cada tipo (seletores): acrescentar um gráfico novo = acrescentar o seletor aqui */
  const SEL_HBAR = '.mf-hbars i b, .iv-bar > i, .mf-xc-b > i, .mf-prov-bar > i, .mf-prl-t > i, .mf-pc-bar > i, .mf-bg-bar > i, .mf-teto-b > i, .mfr-bar i b, .cc-lim-bar > i';
  const SEL_VBAR = '.mf-vbars > div > i, .mf-fut-bars > i';
  const SEL_WIPE = '.iv-stack, .mf-pat-bar';        // blocos lado a lado: revelados da esquerda para a direita
  const SEL_ARC = 'svg:not(.mf-dn):not(.mf-ring-svg) > circle[stroke-dasharray]';   // anéis de progresso soltos (ex.: meta)
  const GRUPOS = '.mf-hbars, .mf-vbars, .mfr-bars, .iv-pie-list, .mf-fut-bars';         // linhas que se destacam ao tocar
  const LINHAS = row => row.parentElement;

  const parado = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.mfanim === '0';
  const tela = () => (typeof mfLkScreen === 'function' ? mfLkScreen() : String(window.tab || ''));
  const visto = new Set();
  const selecao = new Map();                          // assinatura do gráfico → índice destacado (sobrevive ao redesenho)
  let telaAtual = '', replay = '', io = null;

  /* ---------- utilidades ---------- */
  const noAr = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; };
  const bk = el => { const b = el.closest('[data-bk]'); return b ? b.dataset.bk + '#' + (b.dataset.dm || (b.querySelector('[data-dm]') || {}).dataset?.dm || '') : ''; };
  const anim = (el, kf, op) => { try { if (el.__a) el.__a.cancel(); } catch (e) { } el.__a = el.animate(kf, Object.assign({ duration: DUR, easing: EASE, fill: 'backwards' }, op)); return el.__a; };
  const atraso = (el, cont) => { if (!cont) return 0; const l = [...cont.querySelectorAll(SEL_HBAR + ',' + SEL_VBAR)]; return Math.min(PASSO_MAX, Math.max(0, l.indexOf(el)) * PASSO); };
  /* arco que cresce de 0 até o tamanho final; antes de começar (e no instante 0) fica invisível, para a ponta redonda não aparecer como bolinha */
  const crescer = (el, final, C, op) => anim(el, [{ strokeDasharray: '0.01 ' + C, opacity: 0, offset: 0 }, { strokeDasharray: '0.4 ' + C, opacity: 1, offset: .03 }, { strokeDasharray: final, opacity: 1, offset: 1 }], op);
  const contar = (n, alvo, dur, atr) => {
    if (!n) return; const m = /^(-?\d+)(\D*)$/.exec(alvo); if (!m) return;
    const v = +m[1], suf = m[2], t0 = performance.now() + (atr || 0);
    n.textContent = '0' + suf;
    const passo = agora => {
      if (!n.isConnected) return;
      const k = Math.max(0, Math.min(1, (agora - t0) / dur)), e = 1 - Math.pow(1 - k, 3);
      n.textContent = (k >= 1 ? v : Math.round(v * e)) + suf;
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  /* ---------- 1. rosca do cartão de classe ---------- */
  function tocarAnel(el) {
    const arc = el.querySelector('.mf-ring-arc'), n = el.querySelector('.mf-ring-n');
    const alvo = Math.max(0, Math.min(100, parseFloat(el.dataset.pct) || 0));
    if (!arc) return;
    crescer(arc, alvo.toFixed(2) + ' 100', 100, { duration: 900 });
    contar(n, Math.round(alvo) + '%', 900);
  }

  /* ---------- 2. roscas de distribuição ---------- */
  function tocarRosca(svg) {
    const arcs = [...svg.querySelectorAll('.mf-dn-a')];
    if (!arcs.length) return;
    const tot = arcs.reduce((s, a) => s + (+a.dataset.p || 0), 0) || 100;
    let cum = 0;
    arcs.forEach(a => {
      const [len, resto] = (a.getAttribute('stroke-dasharray') || '0 1').split(/[ ,]+/).map(Number), C = len + resto, p = +a.dataset.p || 0;
      const d = cum / tot * (DUR * .8); cum += p;
      crescer(a, len + ' ' + resto, C, { duration: Math.max(260, p / tot * DUR + 260), delay: d });
    });
    const c = svg.querySelector('.mf-dn-c'), s = svg.querySelector('.mf-dn-s');
    if (c) { anim(c, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: DUR * .45 }); if (!svg.classList.contains('mf-dn-sel')) contar(c, c.textContent.trim(), DUR, DUR * .15); }
    if (s) anim(s, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: DUR * .5 });
  }

  const linhasDaLegenda = svg => {
    const pai = svg.parentElement; if (!pai) return [];
    const n = svg.querySelectorAll('.mf-dn-a').length;
    for (const sel of ['.mf-leg > div', '.iv-pie-list > .iv-pl', '.mf-clist > div']) {
      const l = [...pai.querySelectorAll(sel)];
      if (l.length === n) return l;
    }
    return [];
  };
  const guardaCentro = svg => {
    ['.mf-dn-c', '.mf-dn-s'].forEach(q => { const t = svg.querySelector(q); if (t && t.__orig === undefined) t.__orig = t.textContent; });
  };
  function destacar(svg, i, comAnim) {
    const arcs = [...svg.querySelectorAll('.mf-dn-a')], leg = linhasDaLegenda(svg), c = svg.querySelector('.mf-dn-c'), s = svg.querySelector('.mf-dn-s');
    guardaCentro(svg);
    svg.classList.toggle('mf-dn-sel', i >= 0);
    arcs.forEach((a, k) => a.classList.toggle('on', k === i));
    leg.forEach((l, k) => { l.classList.toggle('mf-on', k === i); l.classList.toggle('mf-off', i >= 0 && k !== i); });
    const a = arcs[i];
    if (a) {
      const nome = a.dataset.n || '', pc = Math.round(parseFloat(a.dataset.p) || 0) + '%';
      if (c) c.textContent = pc;
      if (s) s.textContent = nome.length > 15 ? nome.slice(0, 14) + '…' : nome;
      if (comAnim && !parado()) {
        const [len, resto] = (a.getAttribute('stroke-dasharray') || '0 1').split(/[ ,]+/).map(Number);
        crescer(a, len + ' ' + resto, len + resto, { duration: 520 });
        if (c) contar(c, pc, 420);
      }
    } else {
      if (c && c.__orig !== undefined) c.textContent = c.__orig;
      if (s && s.__orig !== undefined) s.textContent = s.__orig;
    }
  }
  /* qual fatia está sob o dedo: pelo próprio traço ou, se tocou ao lado dele, pelo ângulo */
  function fatiaDoToque(svg, e) {
    const a0 = e.target.closest && e.target.closest('.mf-dn-a');
    if (a0) return +a0.dataset.i;
    const arcs = [...svg.querySelectorAll('.mf-dn-a')]; if (!arcs.length) return -2;
    const r = svg.getBoundingClientRect(), esc = r.width / 120, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = e.clientX - cx, dy = e.clientY - cy, dist = Math.hypot(dx, dy) / esc;
    const R0 = +arcs[0].getAttribute('r') || 44, W0 = +arcs[0].getAttribute('stroke-width') || 11;
    if (dist < R0 - W0 / 2 - 4 || dist > R0 + W0 / 2 + 6) return -2;     // no miolo ou fora: não é fatia
    let ang = Math.atan2(dx, -dy); if (ang < 0) ang += Math.PI * 2;
    const f = ang / (Math.PI * 2) * 100, tot = arcs.reduce((x, a) => x + (+a.dataset.p || 0), 0) || 100;
    let cum = 0;
    for (let k = 0; k < arcs.length; k++) { cum += (+arcs[k].dataset.p || 0) / tot * 100; if (f <= cum) return k; }
    return arcs.length - 1;
  }

  /* ---------- 3 e 4. barras, empilhados e linhas ---------- */
  function tocarBarra(el, vertical) {
    const svgEl = el instanceof SVGElement;
    if (svgEl) { el.style.transformBox = 'fill-box'; }
    el.style.transformOrigin = vertical ? '50% 100%' : '0 50%';
    const grupo = el.closest(GRUPOS);
    anim(el, vertical ? [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }] : [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { delay: atraso(el, grupo) });
  }
  function tocarWipe(el) { anim(el, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: DUR }); }
  function tocarArco(c) {
    const [len, resto] = (c.getAttribute('stroke-dasharray') || '0 1').split(/[ ,]+/).map(Number);
    crescer(c, len + ' ' + resto, len + resto, { duration: DUR });
  }
  function tocarGrafico(svg) {
    svg.querySelectorAll('path, polyline, polygon, rect, circle').forEach((f, i) => {
      if (f.closest('defs, clipPath')) return;
      const tag = f.tagName.toLowerCase(), st = f.getAttribute('stroke'), fi = f.getAttribute('fill'), tracejado = f.hasAttribute('stroke-dasharray');
      if (tag === 'rect') {                                              // colunas: sobem da base (o fundo do gráfico não anima)
        const h = +f.getAttribute('height') || 0, w = +f.getAttribute('width') || 0;
        if (fi && fi !== 'none' && h > 0 && w < 40) { f.style.transformBox = 'fill-box'; f.style.transformOrigin = '50% 100%'; anim(f, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { delay: Math.min(PASSO_MAX, i * 25) }); }
        return;
      }
      if (st && st !== 'none' && (fi === 'none' || fi === null) && tag !== 'circle') {
        if (tracejado) { anim(f, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 300 }); return; }
        if (!f.hasAttribute('pathLength')) f.setAttribute('pathLength', '1');
        anim(f, [{ strokeDasharray: '1 1', strokeDashoffset: '1' }, { strokeDasharray: '1 1', strokeDashoffset: '0' }], { duration: DUR_LINHA });
      } else if (fi && fi !== 'none' && (tag === 'path' || tag === 'polygon' || tag === 'circle')) {
        anim(f, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: DUR_LINHA * .55 });   // área e pontos aparecem depois da linha
      }
    });
  }

  /* ---------- lista do que existe na tela ---------- */
  function alvos() {
    const app = document.getElementById('app'); if (!app) return [];
    const L = [], cont = {};
    const add = (tipo, el, extra) => {
      const k = tipo + '|' + bk(el);
      cont[k] = (cont[k] || 0) + 1;
      L.push({ tipo, el, n: cont[k], k, extra });
    };
    app.querySelectorAll('.mf-ring').forEach(e => add('anel', e));
    app.querySelectorAll('svg.mf-dn').forEach(e => add('rosca', e));
    app.querySelectorAll(SEL_HBAR).forEach(e => add('hbar', e));
    app.querySelectorAll(SEL_VBAR).forEach(e => add('vbar', e));
    app.querySelectorAll(SEL_WIPE).forEach(e => add('wipe', e));
    app.querySelectorAll(SEL_ARC).forEach(e => add('arco', e));
    app.querySelectorAll('svg[role="img"]:not(.mf-dn)').forEach(e => { const vb = (e.getAttribute('viewBox') || '').split(/[ ,]+/).map(Number); if ((vb[2] || 0) >= 150) add('grafico', e); });
    return L.map(a => { a.sig = a.k + '#' + a.n + '/' + cont[a.k] + (a.tipo === 'rosca' ? '/' + (a.el.getAttribute('aria-label') || '') + '/' + a.el.querySelectorAll('.mf-dn-a').length : a.tipo === 'anel' ? '/' + (a.el.dataset.ring || '') : ''); return a; });
  }
  function tocar(a) {
    visto.add(a.sig);
    if (parado()) return;
    try {
      ({ anel: tocarAnel, rosca: tocarRosca, hbar: e => tocarBarra(e, false), vbar: e => tocarBarra(e, true), wipe: tocarWipe, arco: tocarArco, grafico: tocarGrafico }[a.tipo])(a.el);
    } catch (e) { console.warn('graficos', a.tipo, e); }
  }

  function ligar() {
    if (desk()) return;
    const t = tela();
    if (t !== telaAtual) { visto.clear(); selecao.clear(); telaAtual = t; }
    if (io) io.disconnect();
    io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const a = e.target.__alvo; if (a && !visto.has(a.sig)) tocar(a);
    }), { threshold: .25 }) : null;
    alvos().forEach(a => {
      a.el.__alvo = a;
      if (a.tipo === 'rosca' && selecao.has(a.sig)) destacar(a.el, selecao.get(a.sig), false);   // mantém a fatia escolhida após redesenhar
      if (replay && a.tipo === 'anel' && replay === a.el.dataset.ring) { tocar(a); return; }
      if (visto.has(a.sig)) return;                    // já tocou nesta passagem pela tela: nasce no valor final
      if (!io || noAr(a.el)) tocar(a); else io.observe(a.el);
    });
    replay = '';
  }

  (window.__mfAD = window.__mfAD || []).push(function () { try { ligar(); } catch (e) { console.warn('graficos', e); } });

  /* ---------- toques ----------
     Ficam na `window` (fase de captura), antes dos tratadores do app. Não impedem nada: só marcam, destacam ou repetem a animação. */
  window.addEventListener('click', e => {
    if (desk()) return;
    const t = e.target; if (!t || !t.closest) return;

    /* cartão de classe: repete a rosca daquele cartão (o redesenho vem logo depois) */
    const h = t.closest('[data-ivcls]') || (t.closest('.mf-cls-assets') ? null : t.closest('[data-ivclsw]'));
    if (h) { replay = h.dataset.ivcls || h.dataset.ivclsw; setTimeout(() => { replay = ''; }, 500); return; }

    /* rosca de distribuição: toque na fatia ou na legenda destaca/solta */
    const svg = t.closest('svg.mf-dn');
    let alvoSvg = svg, idx = -2;
    if (svg) idx = fatiaDoToque(svg, e);
    else {
      const li = t.closest('.mf-leg > div, .iv-pie-list > .iv-pl, .mf-clist > div');
      if (li) {
        const pai = li.parentElement.parentElement, s2 = pai && pai.querySelector('svg.mf-dn');
        if (s2) { const l = linhasDaLegenda(s2), k = l.indexOf(li); if (k >= 0) { alvoSvg = s2; idx = k; } }
      }
    }
    if (alvoSvg && alvoSvg.__alvo) {
      const a = alvoSvg.__alvo;
      if (idx === -2) {                                // miolo da rosca: limpa o destaque e repete a animação
        if (selecao.has(a.sig)) { selecao.delete(a.sig); destacar(alvoSvg, -1, false); }
        tocarRosca(alvoSvg); return;
      }
      const atual = selecao.has(a.sig) ? selecao.get(a.sig) : -1;
      if (atual === idx) { selecao.delete(a.sig); destacar(alvoSvg, -1, false); }
      else { selecao.set(a.sig, idx); destacar(alvoSvg, idx, true); }
      return;
    }

    /* barras: tocar numa linha repete a barra e deixa só ela em destaque; tocar de novo solta */
    const g = t.closest(GRUPOS);
    if (g && !t.closest('button, a, input, select, textarea, [data-clsedit]')) {
      const linha = [...g.children].find(c => c.contains(t));
      if (linha && g.children.length > 1) {
        const ligado = linha.classList.contains('mf-on');
        [...g.children].forEach(c => { c.classList.remove('mf-on'); c.classList.toggle('mf-off', !ligado && c !== linha); });
        g.classList.toggle('mf-sel', !ligado);
        if (!ligado) { linha.classList.add('mf-on'); linha.classList.remove('mf-off'); }
        if (!parado()) linha.querySelectorAll(SEL_HBAR + ',' + SEL_VBAR).forEach(b => tocarBarra(b, b.matches(SEL_VBAR)));
      }
      return;
    }

    /* barra de progresso ou gráfico de linha solto: repete a animação daquele elemento */
    if (parado()) return;
    const b = t.closest(SEL_HBAR + ',' + SEL_VBAR);
    if (b) { tocarBarra(b, b.matches(SEL_VBAR)); return; }
    const sv = t.closest('svg[role="img"]:not(.mf-dn)');
    if (sv && sv.__alvo) tocarGrafico(sv);
  }, true);
})();
