/* ===== 0.7 · Arrastar para o lado troca de aba (só celular; nenhum dado ou cálculo muda aqui) =====
   Arrastar para a ESQUERDA vai para a aba seguinte da barra de baixo; para a DIREITA, para a anterior.
   - A tela acompanha o dedo (só o conteúdo; a barra de baixo fica parada). Passou de ~28% da largura, ou foi um deslize rápido: troca.
     Senão volta para o lugar com uma mola suave. Na primeira e na última aba o conteúdo "resiste" e volta.
   - A troca de verdade é o toque na própria barra de baixo (mesmas regras de plano/bloqueio de sempre); só a animação é nova.
   - Não dispara: no computador; começando na borda esquerda (ali é o gesto de voltar); em campo de texto ou com teclado aberto;
     em barras que rolam para o lado (sub-abas, dias, gráficos); em Lançamentos sobre a lista/resumo (ali o arrastar troca o mês);
     com janela aberta (Configurações, editor, confirmação, bloqueio) ou no modo organizar (arrastar blocos).
   - Respeita "reduzir movimento" do aparelho e Animações desligadas em Aparência (troca direto, sem animar).
   O CSS fica em css/86-gesto-abas.css. Para um elemento nunca iniciar o gesto, basta pôr o atributo data-nosw nele. */
/* ===== 1.0 · Arrastar para o lado troca de SUBABA (só celular; nenhum dado ou cálculo muda aqui) =====
   Arrastar para a ESQUERDA vai para a subaba seguinte; para a DIREITA, para a anterior. Vale só onde há subabas:
     Investimentos (Resumo, Posição, Proventos, Análise), Contas (Geral, Compras, Simular) e Análises (Mês e Ano).
   As abas principais da barra de baixo NÃO trocam mais por arrasto (só pelo toque).
   - A tela acompanha o dedo (só o conteúdo; a barra de baixo fica parada). Passou de ~28% da largura, ou foi um deslize rápido: troca.
     Senão volta para o lugar com uma mola suave. Na primeira e na última subaba o conteúdo "resiste" e volta.
   - A troca de verdade é o toque no botão da própria subaba (mesmas regras de plano/bloqueio de sempre); só a animação é nova.
     Durante o deslize os cartões não fazem a entrada em cascata vertical (era o "desce e sobe"): só o movimento lateral.
   - Não dispara: no computador; começando na borda esquerda (ali é o gesto de voltar); em campo de texto ou com teclado aberto;
     em barras que rolam para o lado (dias, gráficos); com janela aberta (Configurações, editor, confirmação, bloqueio)
     ou no modo organizar (arrastar blocos).
   - Respeita "reduzir movimento" do aparelho e Animações desligadas em Aparência (troca direto, sem animar).
   O CSS fica em css/86-gesto-abas.css. Para um elemento nunca iniciar o gesto, basta pôr o atributo data-nosw nele. */
/* ===== 3.2 · Troca de subaba tipo "pager" (Mercado Pago) — só celular; nenhum dado ou cálculo muda aqui =====
   Antes: a tela velha saía sozinha, o app redesenhava (quadro vazio = "pisca") e a nova entrava depois, com os cartões ainda fazendo fade.
   Agora: o topo (título/foto) e a barra de subabas ficam PARADOS; só o conteúdo (cartões, "Editar tela") desliza.
     • Durante o arrasto o conteúdo acompanha o dedo (cada filho do #app recebe o transform; o #app, o topo e as abas não se mexem).
     • Ao soltar além de ~28% da largura (ou num deslize rápido): troca. A tela antiga e a nova andam JUNTAS, coladas uma na outra, na mesma
       curva (rápida, com um leve "gelatinoso" no fim); não existe quadro vazio entre as duas. Isso usa a API View Transitions do navegador
       (document.startViewTransition): ela fotografa a tela antiga, o app troca o conteúdo de verdade e o navegador anima as duas imagens.
     • Tocar na própria subaba usa o MESMO movimento (para frente = o conteúdo vai para a esquerda; para trás = para a direita).
     • Sem a API (navegador antigo): troca direta com a entrada lateral de antes (css/86, mf-sw-l/r). Sem animar com "reduzir movimento"
       ou Animações desligadas. As curvas e durações estão em css/86-gesto-abas.css (variáveis --mf-ease, --mf-out, --mf-in, --mf-dur). */
(function () {
  const root = document.documentElement;
  const BORDA = 24;                      // px da borda esquerda reservados ao gesto de voltar
  const parado = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || root.dataset.mfanim === '0';
  const celular = () => !root.classList.contains('mf-desk') && !(window.mfIsDesk && mfIsDesk());
  // subabas de cada tela: a barra de seleção (.mf-seg) tem um botão por subaba; o que está ligado tem a classe "on"
  const SUBS = { inv: 'data-invmode', anal: 'data-anmode' };            // Lançamentos e Contas não têm arrasto: as pílulas abrem páginas (js/mobile/paginas.js)
  const subabas = () => {
    const attr = SUBS[root.dataset.tab]; if (!attr) return null;
    const bs = [...document.querySelectorAll(`#app .mf-seg [${attr}]`)].filter(b => b.offsetParent && b.dataset.invmode !== 'inv'); // "Investimentos" abre uma página própria: o arrasto não entra nela
    const i = bs.findIndex(b => b.classList.contains('on'));
    return bs.length > 1 && i >= 0 ? { bs, i } : null;
  };
  const app = () => document.getElementById('app');
  const SEMGESTO = 'input,textarea,select,[contenteditable="true"],[data-nosw],[data-diastrip],[data-pvcalsw],[data-pvsw],.mf-osc-svg,.dash-calendar-grid';
  const JANELAS = '#mf-lk,#mf-confirm,#mf-lock,.quick-backdrop,#cb-pop,#mf-note';
  let g = null, timer = 0;
  let vt = null;                                                   // troca por View Transition em andamento
  let aguarda = false;                                             // esperando a animação de clique da pílula antes de abrir a página
  const VT = () => typeof document.startViewTransition === 'function';
  // o "conteúdo" que desliza: tudo dentro do #app menos o topo (título/foto) e a barra de subabas, que ficam parados
  const conteudo = () => { const a = app(); return a ? [...a.children].filter(c => !c.matches('.header-bar, .mf-anseg')) : []; };
  const ativa = () => { const attr = SUBS[root.dataset.tab]; const b = attr && document.querySelector(`#app .mf-seg [${attr}].on`); return b ? b.getAttribute(attr) : null; };
  // onde o app está (aba + subaba/modo): para saber, depois do clique, se ele trocou de verdade (plano bloqueado, janela aberta etc. = não trocou)
  const onde = () => { let m = ativa(); try { if (root.dataset.tab === 'inv' && typeof mfInvMode === 'function') m = mfInvMode(); else if (root.dataset.tab === 'add') m = mfAddMode(); else if (root.dataset.tab === 'mais') m = mfCtMode(); } catch (e) { } return root.dataset.tab + ':' + m + ':' + (window.__ctPg || '') + (window.__glFrom ? 'g' : '') + (window.__glArea || ''); };
  // nomes das "camadas" da transição: topo, abas e conteúdo (o #app, sem o topo e as abas, que têm nome próprio)
  function nomear(on, pagina) {
    (pagina ? [['mf-pg', '#app'], ['mf-nav', 'nav#nv']] : [['mf-hd', '#app .header-bar'], ['mf-tabs', '#app .mf-anseg'], ['mf-pg', '#app'], ['mf-nav', 'nav#nv']]).forEach(([n, sel]) => {
      const e = document.querySelector(sel); if (!e) return;
      if (on) e.style.setProperty('view-transition-name', n); else e.style.removeProperty('view-transition-name');
    });
  }
  const soltar = kids => kids.forEach(c => { c.style.transform = ''; c.style.transition = ''; c.style.willChange = ''; });

  function rolaLado(el) {
    for (let e = el; e && e !== document.body && e.id !== 'app'; e = e.parentElement) {
      const o = getComputedStyle(e).overflowX;
      if ((o === 'auto' || o === 'scroll') && e.scrollWidth > e.clientWidth + 2) return true;
    }
    return false;
  }
  // regras gerais: modo bloqueado, organizar, Editar tela, janelas abertas, teclado
  function bloqueioGeral(tecladoOk) {
    if (root.classList.contains('mf-locked') || document.body.classList.contains('org-on')) return true;
    if (window.mfEdOn && mfEdOn()) return true;                   // 2.2: no "Editar tela" arrastar move blocos, não troca de subaba
    const cfg = document.getElementById('mf-cfg'); if (cfg && !cfg.hidden) return true;
    if (document.querySelector(JANELAS)) return true;
    const ae = document.activeElement; return !tecladoOk && !!(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));   // tocar numa subaba com o teclado aberto também pode animar
  }
  function bloqueado(t) {
    if (!t || !t.closest) return true;
    if (bloqueioGeral()) return true;
    if (!t.closest('#app')) return true;                         // só o conteúdo da tela, não a barra de baixo nem o topo fixo
    if (t.closest(SEMGESTO)) return true;
    return rolaLado(t);
  }
  function limpar() {
    const a = app(); if (!a) return;
    clearTimeout(timer); a.classList.remove('mf-sw-drag');
    a.style.transform = ''; a.style.transition = ''; soltar(conteudo());
  }
  function ir(destino, dir) {
    if (!destino) return;
    const y = scrollY;                                            // os botões das subabas mandam a página para o topo; no arrasto ela fica onde estava
    destino.click();                                              // a troca de verdade, igual ao toque no botão da subaba
    if (y > 0 && Math.abs(scrollY - y) > 1) scrollTo(0, y);       // mesmo quadro: ninguém vê a tela pular
    try { if (navigator.vibrate) navigator.vibrate(6); } catch (e) { }
    const a = app(); if (!a || parado()) return;
    // tira também a "mf-tab-in" (animação de trocar de aba): se ficasse, ao terminar a entrada lateral ela RECOMEÇARIA por baixo
    // (desce 18px e sobe) = o "desce e sobe" logo depois de a subaba chegar.
    a.classList.remove('mf-tab-in', 'mf-sw-l', 'mf-sw-r'); void a.offsetWidth;
    // a cascata dos cartões (js/99) também sai: se ficasse, ao fim do deslize ela COMEÇAVA (cartões descendo ~30px e subindo) = o "pulo" depois da troca
    semCascata(a);
    a.classList.add(dir < 0 ? 'mf-sw-l' : 'mf-sw-r', 'mf-sw-q');   // entra pelo lado oposto ao do deslize; "mf-sw-q" segura as entradas verticais até o próximo toque
    clearTimeout(a.__swT); a.__swT = setTimeout(() => { a.classList.remove('mf-sw-l', 'mf-sw-r'); semCascata(a); }, 520);
  }
  function semCascata(a) { a.querySelectorAll('.mf-stagger').forEach(e => { e.classList.remove('mf-stagger'); e.style.animationDelay = ''; }); }
  // qualquer toque/clique de verdade volta ao normal (a troca por arrasto não gera clique; o clique do próprio ir() acontece antes de "mf-sw-q" entrar)
  document.addEventListener('click', () => { if (window.__mfVtPass) return; const a = app(); if (a) a.classList.remove('mf-sw-q'); }, true);

  /* A troca em si. dx0 = onde o conteúdo está agora (arrasto: onde o dedo soltou; toque na subaba: 0); dir = -1 conteúdo vai para a esquerda
     (subaba seguinte), +1 para a direita. Com View Transitions: a tela antiga sai e a nova entra JUNTAS, na mesma curva. */
  function trocar(destino, dir, dx0, arrasto, manterCascata, pagina) {
    const a = app(), w = root.clientWidth || 390;
    if (!a) return;
    if (!VT() || parado() || vt) {
      limpar();
      if (arrasto) { ir(destino, dir); return; }
      window.__mfVtPass = true; try { destino.click(); } finally { window.__mfVtPass = false; }
      if (!parado() && !vt) {                                         // navegador sem View Transitions: a tela nova entra pelo lado
        a.classList.remove('mf-tab-in', 'mf-sw-l', 'mf-sw-r'); void a.offsetWidth; semCascata(a);
        a.classList.add(dir < 0 ? 'mf-sw-l' : 'mf-sw-r', 'mf-sw-q');
        clearTimeout(a.__swT); a.__swT = setTimeout(() => { a.classList.remove('mf-sw-l', 'mf-sw-r'); semCascata(a); }, 520);
      }
      return;
    }
    const y = scrollY, antes = onde(), kids = conteudo();
    const r = Math.min(1, Math.abs(dir * w - dx0) / w);               // quanto falta andar: o que já foi arrastado encurta o movimento
    const css = root.style;
    css.setProperty('--mf-out', (dir * w - dx0) + 'px'); css.setProperty('--mf-in', (dx0 - dir * w) + 'px');   // antiga: anda o que falta; nova: parte uma largura ao lado da antiga
    css.setProperty('--mf-dur', pagina ? '440ms' : Math.round(280 + 160 * r) + 'ms');
    root.classList.add('mf-vt-on'); if (pagina) root.classList.add('mf-vt-' + pagina); nomear(true, !!pagina);
    let t;
    const troca = () => {
      soltar(kids);                                                   // a foto da tela antiga já foi tirada (com o conteúdo onde o dedo estava)
      const a2 = app(); if (a2) { a2.classList.remove('mf-sw-drag'); a2.classList.add('mf-sw-q'); }          // antes do clique: o fade dos cartões não entra
      window.__mfVtPass = true; try { destino.click(); } finally { window.__mfVtPass = false; }   // a troca de verdade, igual ao toque na subaba
      if (arrasto && y > 0 && Math.abs(scrollY - y) > 1) scrollTo(0, y);
      if (a2) { a2.classList.remove('mf-tab-in', 'mf-sw-l', 'mf-sw-r'); if (!manterCascata) semCascata(a2); }   // barra de baixo e botões de Investimentos: a cascata (js/99) continua marcada, como antes
      nomear(true, !!pagina);                                         // o topo e as abas são elementos novos depois do redesenho
      if (onde() === antes && t) t.skipTransition();                 // o app não trocou (plano bloqueado etc.): sem animação
    };
    try { t = vt = document.startViewTransition(troca); }
    catch (e) { vt = null; root.classList.remove('mf-vt-on', 'mf-vt-abrir', 'mf-vt-voltar'); nomear(false); troca(); return; }   // o navegador recusou: troca direto
    if (arrasto) { try { if (navigator.vibrate) navigator.vibrate(6); } catch (e) { } }
    t.ready.catch(() => { }); t.updateCallbackDone.catch(() => { });   // skipTransition() rejeita estas promessas; não é erro
    t.finished.catch(() => { }).then(() => {
      vt = null; root.classList.remove('mf-vt-on', 'mf-vt-abrir', 'mf-vt-voltar'); nomear(false);
      ['--mf-out', '--mf-in', '--mf-dur'].forEach(k => css.removeProperty(k));
    });
  }
  /* 3.23 · troca SECA (pílulas fixas de Lançamentos e Contas): a página nova aparece na hora, sem deslizar e sem entrada em cascata.
     O clique segue normal até o app (nada é reenviado); depois do desenho (gancho __mfAD + microtarefa) saem as animações de entrada e o botão recém-desenhado
     dá um "aperto" curto = a única animação. Quem já está na página (botão marcado) não faz nada. */
  let seca = null;
  function trocarSeco(b) {
    if (b.classList.contains('on')) return;
    const attr = b.hasAttribute('data-addmode') ? 'data-addmode' : b.hasAttribute('data-ctmode') ? 'data-ctmode' : '';
    seca = { attr, val: attr && b.getAttribute(attr) };
    setTimeout(() => { seca = null; }, 600);                      // o clique não desenhou nada (plano bloqueado etc.): esquece o pedido
  }
  (window.__mfAD = window.__mfAD || []).push(function () {
    if (!seca) return;
    const s = seca; seca = null;
    queueMicrotask(() => {                                        // o draw() ainda marca "mf-tab-in" depois dos ganchos; a microtarefa roda antes de pintar
      const a = app(); if (!a) return;
      a.classList.remove('mf-tab-in', 'mf-sw-l', 'mf-sw-r', 'mf-sw-drag'); semCascata(a); a.classList.add('mf-sw-q');   // "mf-sw-q" segura as entradas até o próximo toque
      if (!s.attr || parado()) return;
      const n = document.querySelector(`#app .mf-anseg .mf-seg > button[${s.attr}="${s.val}"]`);
      if (n && n.animate) n.animate([{ transform: 'scale(.9)' }, { transform: 'scale(1.03)', offset: .6 }, { transform: 'scale(1)' }], { duration: 240, easing: 'cubic-bezier(.3,.7,.3,1)' });
    });
  });
  // tocar na própria subaba, num botão da barra de baixo, num botão de Investimentos (Proventos, Análises, Radar, Metas) ou no "<" que volta
  // para a Posição: o mesmo movimento (a troca de verdade continua sendo o clique do app, com as regras de sempre).
  // Para frente (aba/subaba seguinte, abrir) o conteúdo vai para a esquerda; para trás (anterior, voltar) vai para a direita.
  const TOQUES = '#app .mf-anseg .mf-seg > button, #app .an-mode .mf-seg > button, nav#nv [data-tab], #app .iv-at button[data-invmode], #app .header-bar .mf-voltar, #app [data-ctpg], #app .gl-wrap [data-gl], #app [data-addmode], #app [data-ctmode], #app [data-pgback="sub"]';
  window.addEventListener('click', e => {                         // na window: chega ANTES dos ouvintes do app (que já trocariam a subaba)
    if (window.__mfVtPass || vt || !VT() || parado() || !celular() || e.button) return;
    const b = e.target.closest && e.target.closest(TOQUES); if (!b) return;
    if (window.mfPgSemAnim && mfPgSemAnim(b)) { if (!bloqueioGeral(true)) trocarSeco(b); return; }   // 3.23: pílulas de Lançamentos/Contas trocam na hora, sem deslizar
    let dir, aba = false;
    const pg = window.mfPgTipo ? mfPgTipo(b) : null;               // 'abrir' = página nova entra pela direita · 'voltar' = a página sai pela direita
    if (pg) { dir = pg === 'abrir' ? -1 : 1; aba = true; }
    else if (b.matches('nav#nv [data-tab]')) {                         // barra de baixo: pela posição da aba na barra
      const bs = [...document.querySelectorAll('nav#nv [data-tab]')], i1 = bs.indexOf(b), i0 = bs.findIndex(x => x.dataset.tab === root.dataset.tab);
      if (i0 < 0 || i1 < 0 || i0 === i1) return;
      dir = i1 > i0 ? -1 : 1; aba = true;
    } else {
      const seg = b.parentElement, bs = [...seg.children].filter(x => x.tagName === 'BUTTON'), i0 = bs.findIndex(x => x.classList.contains('on')), i1 = bs.indexOf(b);
      if (i0 < 0 || i1 < 0 || i0 === i1 || b.dataset.invmode === 'inv') return;                // já está nela; "Investimentos" abre página própria
      dir = i1 > i0 ? -1 : 1;
    }
    if (!pg && b.matches('[data-ctpg]')) return;                  // (ex.: o clique que sobra de um arrasto de cartão)
    if (bloqueioGeral(true)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (aguarda) return;                                          // a pílula ainda está fazendo a animação de clique
    // pílula de Lançamentos/Contas: primeiro a animação de clique (a pílula vai até o botão), depois a página abre
    const espera = pg === 'abrir' && b.matches('.mf-anseg .mf-seg > button') && window.mfPilulaToque ? mfPilulaToque(b) : 0;
    if (espera) { aguarda = true; setTimeout(() => { aguarda = false; trocar(b, dir, 0, false, aba, pg); }, espera); return; }
    trocar(b, dir, 0, false, aba, pg);
  }, true);

  document.addEventListener('touchstart', e => {
    g = null;
    if (!celular() || e.touches.length !== 1) return;
    const t = e.touches[0]; if (t.clientX <= BORDA || bloqueado(e.target)) return;
    const sb = subabas(); if (!sb) return;
    g = { x: t.clientX, y: t.clientY, y0: scrollY, ab: sb.bs, i: sb.i, est: 'espera', dx: 0, pts: [[performance.now(), t.clientX]] };
  }, { passive: true, capture: true });

  /* 2.2: o toque longo do js/83 pergunta se o dedo já está trocando de subaba antes de levantar o bloco */
  window.mfSwOn = () => !!(g && g.est === 'arrasto');
  document.addEventListener('touchmove', e => {
    if (!g) return;
    if (window.mfEdOn && mfEdOn()) { if (g.est === 'arrasto') limpar(); g = null; return; } // segurar entrou no "Editar tela" no meio do toque
    if (e.touches.length > 1) { if (g.est === 'arrasto') limpar(); g = null; return; }
    const t = e.touches[0], dx = t.clientX - g.x, dy = t.clientY - g.y;
    if (g.est === 'espera') {
      // decide no PRIMEIRO movimento de verdade: o navegador só deixa cancelar a rolagem antes de ela começar; se o gesto esperasse mais,
      // a página já teria começado a rolar e seguiria o balanço vertical do dedo durante todo o arrasto.
      if (Math.hypot(dx, dy) < 3) return;
      if (Math.abs(dx) <= Math.abs(dy)) { g = null; return; }                               // mais vertical: rolagem normal
      g.est = 'arrasto'; g.x = t.clientX - Math.sign(dx) * Math.min(Math.abs(dx), 12); if (!parado()) { const a = app(); a && a.classList.add('mf-sw-drag'); }
    }
    if (e.cancelable) e.preventDefault();
    if (g.y0 !== undefined && Math.abs(scrollY - g.y0) > 1) scrollTo(0, g.y0);              // se alguma rolagem escapou, desfaz
    const x = t.clientX - g.x; g.dx = x;
    g.pts.push([performance.now(), t.clientX]); if (g.pts.length > 6) g.pts.shift();
    if (parado()) return;
    const w = root.clientWidth || 390, viz = g.ab[g.i + (x < 0 ? 1 : -1)];
    const px = viz ? x : x * 0.22;                                // sem subaba do lado: resiste
    const a = app(); if (!a) return;
    const kids = g.kids || (g.kids = conteudo());                 // o topo e a barra de subabas ficam parados
    cancelAnimationFrame(g.raf);
    g.raf = requestAnimationFrame(() => kids.forEach(c => { c.style.transition = 'none'; c.style.willChange = 'transform'; c.style.transform = `translate3d(${px}px,0,0)`; }));
  }, { passive: false, capture: true });

  function fim() {
    if (!g) return; const s = g; g = null;
    if (s.est !== 'arrasto') return;
    cancelAnimationFrame(s.raf);
    const dx = s.dx, dir = dx < 0 ? -1 : 1, w = root.clientWidth || 390, destino = s.ab[s.i - dir]; // esquerda (dir<0) = próxima
    const p = s.pts, ult = p[p.length - 1], ref = p.find(q => ult[0] - q[0] <= 110) || p[0];
    const v = ult[0] > ref[0] ? (ult[1] - ref[1]) / (ult[0] - ref[0]) : 0;               // px por ms
    const vale = !!destino && (Math.abs(dx) > w * 0.28 || (Math.abs(v) > 0.45 && Math.abs(dx) > 36)) && (v === 0 || Math.sign(v) === dir);
    const a = app(); if (!a) return;
    if (parado()) { limpar(); if (vale) ir(destino, dir); return; }
    if (vale) trocar(destino, dir, dx, true);
    else {
      // não passou do limite: o conteúdo volta ao lugar com a mesma mola da troca (sem redesenhar nada)
      (s.kids || conteudo()).forEach(c => { c.style.transition = 'transform .42s var(--mf-ease, cubic-bezier(.22,1,.36,1))'; c.style.transform = 'translate3d(0,0,0)'; });
      timer = setTimeout(limpar, 450);
    }
  }
  document.addEventListener('touchend', fim, { passive: true, capture: true });
  document.addEventListener('touchcancel', () => { if (g && g.est === 'arrasto') limpar(); g = null; }, { passive: true, capture: true });
})();
