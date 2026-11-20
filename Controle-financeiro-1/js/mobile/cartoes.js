/* Contas › Cartão (SÓ CELULAR; computador não muda). Estilo: css/94-cartoes.css.
   Contas › Cartão (uma página aberta pela pílula Cartão): cartão grande com a fatura e o limite (vários cartões ficam empilhados: arraste
   para o lado para trocar), barra do limite, os 4 botões (Pagamento, Parcelamento, Histórico, Análise) e as compras recentes.
   Tocar no cartão abre a página "Opções do cartão" (OPCOES, logo abaixo: é só acrescentar itens). Cada botão abre uma PÁGINA própria
   (window.__ctPg; pilha de páginas em window.__ctPilha; Voltar e título em js/mobile/paginas.js). Os dados e os cálculos são os de sempre
   (js/domain/cartoes.js, pagamento e importação em js/80, formulário dos cartões em js/70): aqui só se monta a tela. */
(function () {
  'use strict';
  const desk = () => !!(window.mfIsDesk && mfIsDesk());
  const PAGINAS = { opc: 'Opções do cartão', pagar: 'Pagamento da fatura', parc: 'Parcelamentos', hist: 'Histórico de compras', anal: 'Análise das compras', cfg: 'Configurar cartões' };
  window.MF_CT_PGS = PAGINAS;
  const PALETA = [['#27352e', '#0f1613'], ['#2a3347', '#10141f'], ['#3a2f45', '#16101c'], ['#43362a', '#1a130d']];   // um tom por cartão (grafite com um toque de cor)
  const CORES = ['#5b8def', '#46c2a0', '#f0b429', '#e5645f', '#a78bfa', '#f472b6', '#94a3b8'];
  const dm = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  const semMarca = h => String(h).replace(/<!--b:[\w~]+-->/g, '');

  /* ---- estado ---- */
  const cartao = () => { const L = mfCards(); return L.find(c => c.id === window.__ctCard) || L.find(c => c.id === mfCcDefault()) || L[0]; };
  window.__ctPg = window.__ctPg || null;

  /* situação da fatura de UM cartão */
  function estado(inv, k, cid) {
    if (!(inv.total > 0.005)) return { k: 'none', t: 'Sem fatura', c: 'mu' };
    if (mfFatPaidC(k, cid)) return { k: 'paid', t: 'Paga', c: 'ok' };
    const d = mfDaysTo(inv.due);
    if (d < 0) return { k: 'late', t: 'Vencida', c: 'bad' };
    if (k > mfFatCur()) return { k: 'future', t: 'Futura', c: 'mu' };
    return { k: 'open', t: d === 0 ? 'Vence hoje' : 'Vence em ' + d + (d === 1 ? ' dia' : ' dias'), c: d <= 5 ? 'bad' : 'wa' };
  }
  /* valor grande: "R$" e os centavos pequenos */
  function valor(v) {
    const s = R(v), m = /^(R\$\s*)([\d.]+)(,\d+)$/.exec(s);
    return m ? `<small>${m[1]}</small>${m[2]}<small>${m[3]}</small>` : escH(s);
  }
  const nome = t => String(t.n || 'Compra').replace(/\s*\(\d+\/\d+\)\s*$/, '');
  const quando = d => { if (d === TD) return 'Hoje'; const o = new Date(TD + 'T12:00:00'); o.setDate(o.getDate() - 1); return d === o.toISOString().slice(0, 10) ? 'Ontem' : dm(d); };
  const matiz = c => { let h = 0; String(c || '').split('').forEach(x => { h = (h * 31 + x.charCodeAt(0)) % 360; }); return h; };

  /* uma compra (toque abre a edição do lançamento) */
  function compra(t) {
    const n = nome(t), par = t.installmentCount > 1 ? `parcela ${t.installmentIndex}/${t.installmentCount}` : '';
    return `<div class="cx-it" data-cxe="${t.id}" role="button" tabindex="0"><i class="cx-ic" style="--h:${matiz(t.c)}">${escH(n.trim().slice(0, 2).toUpperCase())}</i><div class="cx-tx"><b>${escH(n)}</b><small>${quando(t.d)}${t.c ? ' · ' + escH(t.c) : ''}</small></div><div class="cx-vl"><b>${R(txValue(t))}</b>${par ? `<small>${par}</small>` : ''}</div></div>`;
  }
  /* compras já feitas no cartão, da mais nova para a mais antiga */
  const comprasDo = cid => S.tx.filter(t => t.t === 'Crédito' && t.d && t.d <= TD && t.c !== 'Receita' && !mfIsFatLanc(t) && mfCardOf(t) === cid).sort((a, b) => a.d < b.d ? 1 : a.d > b.d ? -1 : 0);

  /* ---- tela-base ---- */
  function face(x, j, sel, o) {
    const inv = cbInvoice(sel, x.id), st = estado(inv, sel, x.id), lim = mfCcLim(x.id), p = PALETA[j % PALETA.length];
    return `<article class="cx-card" data-ccid="${x.id}" data-o="${o}" style="--o:${o};--c1:${p[0]};--c2:${p[1]}"><div class="cx-top"><b>${escH(mfCardName(x, j))}</b><span class="cx-st ${st.c}">${st.t}</span></div><div class="cx-lb">Fatura de ${lab(sel).toLowerCase()}</div><div class="cx-val">${valor(inv.total)}</div><div class="cx-bot"><div><small>Limite</small><b>${lim.lim > 0 ? R(lim.lim) : '—'}</b></div><div><small>Vencimento</small><b>${dm(inv.due)}</b></div><i class="cx-go" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></i></div></article>`;
  }
  function barraLimite(c, i) {
    const x = mfCcLim(c.id);
    if (!(x.lim > 0)) return `<button type="button" class="cx-lim cx-lim-vz" data-ctpg="cfg"><span>Defina o limite do cartão</span><em>Configurar</em></button>`;
    const cl = x.pct >= 100 ? 'bad' : x.pct >= 80 ? 'wa' : 'ok', pc = String(x.pct).replace('.', ',');
    return `<div class="cx-lim"><div class="cx-lim-h"><span>Limite usado</span><b>${R(x.usado)}<em> / ${R(x.lim)}</em></b></div><div class="cx-bar" role="img" aria-label="${pc}% do limite usado"><i class="${cl}" style="width:${Math.min(100, x.pct)}%"></i></div><div class="cx-lim-f"><span>${pc}% do limite</span><span>${x.livre >= 0 ? 'Disponível ' : 'Acima do limite '}<b class="${x.livre >= 0 ? 'ok' : 'bad'}">${R(Math.abs(x.livre))}</b></span></div></div>`;
  }
  const ICO = {
    pagar: '<path d="M3 7h18v10H3z"/><path d="M3 11h18"/><path d="M7 15h3"/>',
    parc: '<path d="M5 6h14M5 12h14M5 18h9"/><circle cx="18" cy="18" r="1.4"/>',
    hist: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    anal: '<path d="M5 20V10M12 20V4M19 20v-7"/>'
  };
  const botao = (k, t) => `<button type="button" class="cx-bt" data-ctpg="${k}"><i><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]}</svg></i><span>${t}</span></button>`;

  function telaCartao() {
    const L = mfCards(), sel = mfCbMonth(), c = cartao(), i = L.indexOf(c), N = L.length;
    const cards = L.map((x, j) => face(x, j, sel, (j - i + N) % N)).join('');
    const pontos = N > 1 ? `<div class="cx-dots" aria-hidden="true">${L.map((x, j) => `<i${j === i ? ' class="on"' : ''}></i>`).join('')}</div>` : '';
    const rec = comprasDo(c.id).slice(0, 6);
    return B('p_faturas') + `<div class="cx">
      <div class="cx-stack${N > 1 ? ' cx-multi' : ''}" data-nosw="1" data-ctpg="opc" role="button" tabindex="0" aria-label="Abrir opções do cartão">${cards}</div>${pontos}
      ${barraLimite(c, i)}
      <div class="cx-bts">${botao('pagar', 'Pagamento')}${botao('parc', 'Parcelamento')}${botao('hist', 'Histórico')}${botao('anal', 'Análise')}</div>
      <section class="c cx-rec"><div class="cx-rh"><h2>Compras recentes</h2>${rec.length ? '<button type="button" data-ctpg="hist">Ver todas</button>' : ''}</div>
        ${rec.length ? `<div class="cx-list">${rec.map(compra).join('')}</div>` : '<p class="cx-vz">Nenhuma compra no crédito neste cartão ainda.</p>'}</section>
    </div>`;
  }

  /* ---- páginas ---- */
  const faixa = cid => {   // meses da fatura (o mesmo seletor de sempre: data-pc="cb-month")
    const cur = mfFatCur(), sel = mfCbMonth(), keys = Array.from({ length: 25 }, (_, i) => nm(cur, i - 12));
    return `<div class="cb-strip" role="group" aria-label="Meses da fatura">${keys.map(k => { const x = cbInvoice(k, cid), s = estado(x, k, cid); return `<button type="button" data-pc="cb-month" data-pcs="${k}" class="cb-m st-${s.k}${k === sel ? ' on' : ''}${k === cur ? ' cur' : ''}" aria-pressed="${k === sel}" aria-label="Fatura de ${lab(k).toLowerCase()}: ${s.t}"><span>${mfMs(k)}</span><small>${x.total > 0.005 ? R(x.total) : '—'}</small><i></i></button>`; }).join('')}</div>`;
  };
  const quem = (c, i) => mfCards().length > 1 ? `<div class="cx-who">${escH(mfCardName(c, i))}</div>` : '';

  function pgPagar() {
    const L = mfCards(), c = cartao(), i = L.indexOf(c), sel = mfCbMonth(), inv = cbInvoice(sel, c.id), st = estado(inv, sel, c.id);
    const pays = mfFatPays(sel).filter(t => mfPayCard(t) === c.id), v = mfMoney(inv.total);
    const corpo = st.k === 'none' ? '<p class="cx-vz">Sem compras nesta fatura.</p>'
      : st.k === 'paid' ? `<div class="cb-paid"><span class="cb-paid-i">✓</span><div><b>Fatura paga</b><small>${pays.length ? `Pagamento de ${R(txValue(pays[0]))} em ${mfDmy(pays[0].d)}` : 'Marcada como paga'}</small></div></div>`
      : `<label class="cb-pay-l"><small>Valor da fatura</small><span class="cb-pil"><em>R$</em><input type="text" inputmode="decimal" autocomplete="off" data-ccpayv="${c.id}" value="${v}" style="width:${Math.max(4, v.length) + 0.6}ch!important" aria-label="Valor da fatura"></span></label><small class="mu cb-pay-s">Soma das compras ${R(inv.sum)}${inv.paid > 0.005 ? ` · já pago ${R(inv.paid)}` : ''}</small><button type="button" class="b cb-paybtn" data-ccpayall="${sel}">Pagar fatura</button>`;
    const hist = pays.length ? `<div class="cb-hist"><small class="cb-hist-t">Pagamentos desta fatura</small>${pays.map(t => `<div class="cb-hist-r"><span>${mfDmy(t.d)}</span><b class="ok">${R(txValue(t))}</b></div>`).join('')}</div>` : '';
    return `${quem(c, i)}${faixa(c.id)}<section class="c cx-sec"><div class="cx-hero"><div><small>Fatura de ${lab(sel).toLowerCase()}</small><b>${R(inv.total)}</b><small>Vence ${dm(inv.due)}</small></div><span class="cx-st ${st.c}">${st.t}</span></div><div class="cb-pay">${corpo}</div>${hist}</section>`;
  }
  function pgHist() {
    const L = mfCards(), c = cartao(), i = L.indexOf(c), sel = mfCbMonth(), inv = cbInvoice(sel, c.id), rows = inv.rows.filter(t => !mfIsFatLanc(t)).sort((a, b) => a.d < b.d ? 1 : a.d > b.d ? -1 : 0);
    return `${quem(c, i)}${faixa(c.id)}<section class="c cx-sec"><div class="cx-hero"><div><small>${rows.length} ${rows.length === 1 ? 'compra' : 'compras'} · fatura de ${lab(sel).toLowerCase()}</small><b>${R(inv.total)}</b></div></div>${rows.length ? `<div class="cx-list">${rows.map(compra).join('')}</div>` : '<p class="cx-vz">Nenhuma compra no crédito nesta fatura.</p>'}</section>`;
  }
  function pgAnal() {
    const L = mfCards(), c = cartao(), i = L.indexOf(c), sel = mfCbMonth(), inv = cbInvoice(sel, c.id), rows = inv.rows.filter(t => !mfIsFatLanc(t));
    const cats = {}; rows.forEach(t => { const k = t.c || 'Sem categoria'; cats[k] = (cats[k] || 0) + txValue(t); });
    const lista = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([n, v], j) => ({ n, v, c: CORES[j % CORES.length] })), tot = lista.reduce((s, r) => s + r.v, 0);
    const maior = rows.slice().sort((a, b) => txValue(b) - txValue(a))[0], parc = rows.filter(t => t.installmentCount > 1).length;
    const corpo = !rows.length ? '<p class="cx-vz">Sem compras nesta fatura para analisar.</p>' : `
      <div class="cx-kp"><div><small>Total</small><b>${R(tot)}</b></div><div><small>Compras</small><b>${rows.length}</b></div><div><small>Média</small><b>${R(tot / rows.length)}</b></div><div><small>Parceladas</small><b>${parc}</b></div></div>
      <div class="cx-don">${mfDonut(lista, { size: 150, center: R(tot), cfs: 13, sub: 'na fatura', aria: 'Compras por categoria' })}${mfLegend(lista, tot)}</div>
      ${maior ? `<div class="cx-maior"><small>Maior compra</small><b>${escH(nome(maior))}</b><span>${R(txValue(maior))}</span></div>` : ''}`;
    return `${quem(c, i)}${faixa(c.id)}<section class="c cx-sec"><h2>Por categoria · ${mfMs(sel)}</h2>${corpo}</section>${window.mfTetoBlk ? semMarca(mfTetoBlk()) : ''}`;
  }
  /* Opções do cartão (toque no cartão). Para acrescentar uma opção: um item aqui. { t: título, d: descrição, ic: ícone (path SVG),
     e UM destes: pg = abre essa página (ver MAPA) · imp = abre o importador de fatura } */
  const OPCOES = [
    { t: 'Importar fatura', d: 'OFX, CSV ou PDF do banco', imp: 'fat', ic: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>' },
    { t: 'Configurar cartão', d: 'Nome, limite, vencimento e melhor dia', pg: 'cfg', ic: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>' }
  ];
  function pgOpc() {
    const L = mfCards(), c = cartao(), i = L.indexOf(c), sel = mfCbMonth(), inv = cbInvoice(sel, c.id), st = estado(inv, sel, c.id);
    const item = o => `<button type="button" class="cx-op" ${o.imp ? `data-mfimp="${o.imp}"` : `data-ctpg="${o.pg}"`}><i><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${o.ic}</svg></i><span><b>${o.t}</b><small>${o.d}</small></span><em aria-hidden="true">›</em></button>`;
    return `<section class="c cx-sec"><div class="cx-hero"><div><small>${escH(mfCardName(c, i))} · fatura de ${lab(sel).toLowerCase()}</small><b>${R(inv.total)}</b></div><span class="cx-st ${st.c}">${st.t}</span></div></section><div class="cx-ops">${OPCOES.map(item).join('')}</div>`;
  }
  const pgParc = () => semMarca(mfParcHtml());
  const pgCfg = () => `<section class="c cx-sec">${mfCcCfgForm()}</section>`;

  const MAPA = { opc: pgOpc, pagar: pgPagar, parc: pgParc, hist: pgHist, anal: pgAnal, cfg: pgCfg };
  const _ct = mfCtHtml;
  mfCtHtml = function (m) {
    if (desk() || m !== 'contas') return _ct(m);
    window.__impCc = cartao().id;                                                    // "Importar fatura" vale para o cartão da frente
    const pg = window.__ctPg && MAPA[window.__ctPg];
    return pg ? `<div class="cx cx-pg">${pg()}</div>` : telaCartao();
  };

  /* ---- toques ---- */
  document.addEventListener('click', e => {
    if (desk() || !e.target.closest) return;
    const b = e.target.closest('#app [data-ctpg]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.matches('.cx-stack') && window.__ccMoveu) return;                          // o clique que sobra de um arrasto não abre as opções
    (window.__ctPilha = window.__ctPilha || []).push(window.__ctPg || null);          // Voltar volta para a página de onde veio
    window.__ctPg = b.dataset.ctpg; window.__mfLastTab = null; draw(); try { scrollTo(0, 0); } catch (x) { }
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches && e.target.matches('.cx-stack')) e.target.click(); });

  /* ---- carrossel: arrastar o cartão da frente para o lado troca de cartão ---- */
  let dr = null;
  const sem = () => document.documentElement.dataset.mfanim === '0' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.addEventListener('pointerdown', e => {
    if (desk() || e.button || !e.target.closest) return;
    const st = e.target.closest('#app .cx-multi'); if (!st) return;
    const f = st.querySelector('.cx-card[data-o="0"]'); if (!f) return;
    dr = { st, f, x: e.clientX, dx: 0, t: performance.now(), mov: false, id: e.pointerId };
  }, true);
  document.addEventListener('pointermove', e => {
    if (!dr || e.pointerId !== dr.id) return;
    dr.dx = e.clientX - dr.x;
    if (!dr.mov && Math.abs(dr.dx) > 8) { dr.mov = true; try { dr.st.setPointerCapture(e.pointerId); } catch (x) { } dr.f.style.transition = 'none'; }
    if (dr.mov) dr.f.style.transform = `translateX(${dr.dx}px) rotate(${dr.dx / 22}deg)`;
  }, true);
  const solta = e => {
    if (!dr || (e.pointerId !== undefined && e.pointerId !== dr.id)) return;
    const d = dr; dr = null;
    if (!d.mov) return;
    window.__ccMoveu = true; setTimeout(() => { window.__ccMoveu = false; }, 80);       // o clique que vem logo depois do arrasto não abre as opções
    const v = Math.abs(d.dx) / Math.max(1, performance.now() - d.t);
    if (e.type !== 'pointercancel' && (Math.abs(d.dx) > 70 || (v > .5 && Math.abs(d.dx) > 30))) troca(d, d.dx < 0 ? -1 : 1);
    else { d.f.style.transition = ''; d.f.style.transform = ''; }
  };
  document.addEventListener('pointerup', solta, true);
  document.addEventListener('pointercancel', solta, true);

  /* troca de cartão: o da frente sai para o lado e vai para o fundo; os outros sobem. Ao terminar, a tela é desenhada de novo (parte de baixo muda). */
  function troca(d, dir) {                                  // dir -1: arrastou para a esquerda (próximo) · +1: para a direita (anterior)
    const cs = [...d.st.querySelectorAll('.cx-card')], N = cs.length, ms = sem() ? 0 : 320;
    const at = cs.find(c => c.dataset.o === '0'), id = cs.find(c => +c.dataset.o === (dir < 0 ? 1 : N - 1));
    const ord = c => +c.dataset.o, set = (c, o) => { c.dataset.o = o; c.style.setProperty('--o', o); };
    if (dir > 0) {                                           // o do fundo entra pela esquerda, vindo de fora
      id.style.transition = 'none'; id.style.transform = 'translateX(-115%) rotate(-12deg)'; id.style.opacity = '0'; void id.offsetWidth;
      id.style.transition = ''; id.style.transform = ''; id.style.opacity = '';
      cs.forEach(c => set(c, (ord(c) + 1) % N));
      at.style.transform = '';
    } else {                                                 // o da frente sai pela esquerda e volta para o fundo
      at.style.transition = ''; at.style.transform = 'translateX(-115%) rotate(-12deg)'; at.style.opacity = '0';
      cs.forEach(c => { if (c !== at) set(c, ord(c) - 1); });
      setTimeout(() => { at.style.transition = 'none'; set(at, N - 1); at.style.transform = ''; at.style.opacity = ''; void at.offsetWidth; at.style.transition = ''; }, ms);
    }
    window.__ctCard = id.dataset.ccid;
    setTimeout(() => { draw(); }, ms + 40);
  }
})();
