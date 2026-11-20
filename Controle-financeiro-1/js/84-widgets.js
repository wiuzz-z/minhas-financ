/* Widgets (1.15; catálogo maior, tamanhos e modelos na 1.16) — blocos que a pessoa adiciona pelo "+" do modo Editar tela.
   Catálogo (MF_WG): cada widget SÓ LÊ os cálculos que o app já tem (js/domain e funções de tela: saldo, mês, fatura,
   parcelas, investimentos, proventos) e nunca grava lançamentos nem dados financeiros. Nenhum cálculo de dinheiro novo.
   Cada widget tem:
     a  = aba da galeria = tela do app a que o bloco pertence (add, mais, res, inv, anal)
     n  = nome, d = descrição na galeria
     m  = modelos [[chave, nome]] — a mesma informação em formas diferentes (Número, Lista, Barras, Rosca, Linha, Anel)
     f  = dados reais (só leitura) e ex = dados de exemplo da galeria; os dois passam pelo MESMO desenho (mod),
          então a prévia mostra exatamente a forma que o bloco terá na tela.
   Onde ficam: S.lay.wg = { aba: [{ id: 'p_wg~N', k: 'saldo', sz: 'x'|'p'|'m'|'g', v: 'num', s: 'compras' }] }. sz, v e s são opcionais
   (blocos da 1.15 continuam Médio, no primeiro modelo). 'wg' é chave por aparelho (MF_DEV_K): celular e computador
   têm widgets separados, como a ordem e as larguras.
   Como entram na tela: withMoved() recebe os widgets da aba como blocos comuns (<!--b:id-->), então
   ordem, largura, olho (ocultar) e a miniatura de Telas funcionam neles igual aos outros blocos. */
(function () {
 'use strict';
 if (typeof MF_DEV_K !== 'undefined' && !MF_DEV_K.includes('wg')) MF_DEV_K.push('wg');

 /* abas que aceitam widgets (1.18: Análises também) */
 const MF_WG_TABS = ['res', 'add', 'mais', 'inv', 'anal'];
 /* 1.18: as abas da galeria são as telas do app (o nome vem da própria tela, então "Contas" aparece como Planejamento
    e um nome trocado pela pessoa também vale). O campo a de cada bloco diz em qual aba da galeria ele fica. */
 const MF_WG_AREAS = [['add', 'Lançamentos'], ['mais', 'Contas'], ['res', 'Dashboard'], ['inv', 'Investimentos'], ['anal', 'Análises']];
 const MF_WG_SZ = [['x', 'Mini'], ['p', 'Pequeno'], ['m', 'Médio'], ['g', 'Grande']];

 const MES3 = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
 const mesAtual = () => TD.slice(0, 7);
 const mesMais = (k, n) => { const d = new Date(+k.slice(0, 4), +k.slice(5, 7) - 1 + n, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
 const fimMes = k => k + '-' + String(new Date(+k.slice(0, 4), +k.slice(5, 7), 0).getDate()).padStart(2, '0');
 const mes3 = k => MES3[+k.slice(5, 7) - 1];
 const nomeMes = k => (typeof MESF !== 'undefined' ? MESF[+k.slice(5) - 1] : k);
 const dm = d => String(d).slice(8, 10) + '/' + String(d).slice(5, 7);
 const sinal = v => (v >= 0 ? 'ok' : 'bad');
 const E = x => (typeof escH === 'function' ? escH(x) : String(x == null ? '' : x));
 const pct = v => (Math.round(v * 10) / 10).toLocaleString('pt-BR') + '%';
 const COR = ['#5b8def', '#38a889', '#9b8afb', '#d5a348', '#e56b7b', '#7c8796'];
 /* valor curto para o centro da rosca: R$ 3.050 · R$ 19 mil · R$ 1,2 mi */
 const RS = v => { const a = Math.abs(v); return a >= 1e6 ? 'R$ ' + (Math.round(v / 1e5) / 10).toLocaleString('pt-BR') + ' mi' : a >= 1e4 ? 'R$ ' + Math.round(v / 1e3).toLocaleString('pt-BR') + ' mil' : R(v).replace(/,\d\d$/, ''); };

 /* ---------- desenhos do COMPUTADOR (versão 1.18, sem mudanças; o celular usa os de baixo, 3.6) ---------- */
 const D1 = {
  /* número grande + linha de apoio + (opcional) dois números lado a lado */
  num: x => `<b class="mf-wg-v ${x.cl || ''}">${x.v}</b>${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}${x.dois ? `<div class="mf-wg-2 mf-wg-x">${x.dois.map(([a, b]) => `<span><small>${a}</small><b>${b}</b></span>`).join('')}</div>` : ''}`,
  /* lista: [data/rótulo curto, nome, valor, ok?] */
  lista: x => x.li && x.li.length ? `${x.topo ? `<b class="mf-wg-v mf-wg-vs">${x.topo}</b>` : ''}<div class="mf-wg-li">${x.li.map(([i, n, v, ok]) => `<span class="${ok ? 'pg' : ''}"><i>${i}</i><em>${n}</em><b>${v}</b></span>`).join('')}</div>` : `<small class="mf-wg-s">${x.vazio || 'Nada por aqui.'}</small>`,
  /* barras verticais: [rótulo, valor, cor?]; pares = duas barras por rótulo (receita x despesa) */
  barras: x => {
   const L = x.b || [], mx = Math.max(1, ...L.map(r => Math.max(+r[1] || 0, +(r[3] || 0))));
   return `${x.topo ? `<b class="mf-wg-v mf-wg-vs ${x.cl || ''}">${x.topo}</b>` : ''}${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}<div class="mf-wg-bars${x.par ? ' par' : ''}">${L.map(r => `<span title="${E(r[0])}"><i style="height:${Math.max(3, (+r[1] || 0) / mx * 100)}%;${r[2] ? `background:${r[2]}` : ''}"></i>${x.par ? `<i class="b2" style="height:${Math.max(3, (+r[3] || 0) / mx * 100)}%"></i>` : ''}<small>${E(r[0])}</small></span>`).join('')}</div>${x.leg ? `<div class="mf-wg-leg mf-wg-x">${x.leg}</div>` : ''}`;
  },
  /* ranking em barras horizontais: [nome, valor, texto] */
  rank: x => x.r && x.r.length ? `<div class="mf-wg-rk">${(() => { const mx = x.max || Math.max(1, ...x.r.map(r => +r[1] || 0)); return x.r.map((r, i) => `<span><em>${E(r[0])}</em><b>${r[2]}</b><i><u style="width:${Math.max(4, (+r[1] || 0) / mx * 100)}%;background:${COR[i % COR.length]}"></u></i></span>`).join(''); })()}</div>` : `<small class="mf-wg-s">${x.vazio || 'Nada por aqui.'}</small>`,
  /* rosca: partes [nome, valor, cor]; centro com o total */
  rosca: x => {
   const P = (x.p || []).filter(r => (+r[1] || 0) > 0), tot = P.reduce((s, r) => s + (+r[1] || 0), 0);
   if (!tot) return `<small class="mf-wg-s">${x.vazio || 'Nada por aqui.'}</small>`;
   let a = 0; const g = P.map((r, i) => { const c = r[2] || COR[i % COR.length], b = a + (+r[1]) / tot * 360, s = `${c} ${a}deg ${b}deg`; a = b; return s; }).join(',');
   return `<div class="mf-wg-ro"><div class="mf-wg-rc" style="background:conic-gradient(${g})"><span><b>${x.centro || ''}</b><small>${x.centroS || ''}</small></span></div><div class="mf-wg-rl">${P.map((r, i) => `<span><i style="background:${r[2] || COR[i % COR.length]}"></i><em>${E(r[0])}</em><b>${pct((+r[1]) / tot * 100)}</b></span>`).join('')}</div></div>`;
  },
  /* linha (sparkline) com valor atual em cima */
  linha: x => {
   const P = x.pts || []; if (P.length < 2) return D1.num(x);
   const mn = Math.min(...P), mx = Math.max(...P), h = mx - mn || 1, W = 100, Hh = 36;
   const xy = P.map((v, i) => `${(i / (P.length - 1) * W).toFixed(1)},${(Hh - 3 - (v - mn) / h * (Hh - 6)).toFixed(1)}`);
   return `<b class="mf-wg-v mf-wg-vs ${x.cl || ''}">${x.v}</b>${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}<svg class="mf-wg-ln" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,${Hh} ${xy.join(' ')} ${W},${Hh}" /><polyline points="${xy.join(' ')}" /></svg>${x.ini ? `<div class="mf-wg-lx mf-wg-x"><small>${x.ini}</small><small>${x.fim || ''}</small></div>` : ''}`;
  },
  /* 1.18: três números lado a lado (ex.: Receitas, Despesas, Saldo) */
  tres: x => `<div class="mf-wg-3">${(x.tres || []).map(([a, b, c]) => `<span><small>${a}</small><b class="${c || ''}">${b}</b></span>`).join('')}</div>${x.s ? `<small class="mf-wg-s mf-wg-x">${x.s}</small>` : ''}`,
  /* 1.18: barra de progresso (0–100) com o número em cima */
  prog: x => { const p = Math.max(0, Math.min(100, +x.pc || 0)); return `<b class="mf-wg-v mf-wg-vs ${x.cl || ''}">${x.v}</b><div class="mf-wg-pg ${x.cl || ''}" role="img" aria-label="${Math.round(p)}%"><i style="width:${p}%"></i></div>${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}`; },
  /* 1.18: Mini — só o número principal, numa linha */
  mini: x => `<b class="mf-wg-v ${x.cl || ''}">${x.v != null ? x.v : (x.topo || '—')}</b>`,
  /* anel de progresso (0–100) */
  anel: x => {
   const p = Math.max(0, Math.min(100, +x.pc || 0));
   return `<div class="mf-wg-an"><div class="mf-wg-ac ${x.cl || ''}" style="--p:${p}"><b>${x.v}</b></div>${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}</div>`;
  }
 };

 /* ---------- desenhos (recebem dados normalizados; usados pelo real e pelo exemplo) ----------
   3.6 · Visual novo: título pequeno e número grande à esquerda, selo de variação, informação de apoio e gráficos que se desenham ao entrar.
   Os gráficos de linha, barras e rosca levam seus dados em data-wg-sc (JSON) para o toque: passar o dedo mostra o valor daquele ponto
   (ver "animação e toque", no fim deste arquivo). Os números levam data-cu (contam até o valor); as animações só rodam quando o bloco
   entra na tela ou o dado muda (classe mf-wg-go), nunca a cada redesenho. */
 const J = o => E(JSON.stringify(o));
 /* selo de variação do primeiro para o último ponto (inv = subir é ruim, como em despesas) */
 const chipV = (a, b, inv) => { if (!(Math.abs(a) > 0)) return ''; const d = (b - a) / Math.abs(a) * 100; if (!isFinite(d) || Math.abs(d) < 0.05) return ''; const bom = (d > 0) !== !!inv; /* base muito pequena: a % vira número enorme; mostra a diferença em R$ */ return `<span class="mf-wg-chip ${bom ? 'ok' : 'bad'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d) > 500 ? (d > 0 ? '+' : '−') + R(Math.abs(b - a)) : pct(Math.abs(d))}</span>`; };
 const D = {
  /* número grande + linha de apoio + (opcional) dois números lado a lado */
  num: x => `<b class="mf-wg-v ${x.cl || ''}" data-cu>${x.v}</b>${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}${x.dois ? `<div class="mf-wg-2 mf-wg-x">${x.dois.map(([a, b]) => `<span><small>${a}</small><b>${b}</b></span>`).join('')}</div>` : ''}`,
  /* lista: [data/rótulo curto, nome, valor, ok?] */
  lista: x => x.li && x.li.length ? `${x.topo ? `<b class="mf-wg-v mf-wg-vs" data-cu>${x.topo}</b>` : ''}<div class="mf-wg-li">${x.li.map(([i, n, v, ok]) => `<span class="${ok ? 'pg' : ''}"><i>${i}</i><em>${n}</em><b>${v}</b></span>`).join('')}</div>` : `<small class="mf-wg-s">${x.vazio || 'Nada por aqui.'}</small>`,
  /* barras verticais: [rótulo, valor, cor?, valor2?, rótulo completo?]; par = duas barras por rótulo (receita x despesa). Toque: balão com o valor. */
  barras: x => {
   const L = x.b || [], mx = Math.max(1, ...L.map(r => Math.max(+r[1] || 0, +(r[3] || 0)))), dat = { b: L.map(r => [r[0], +r[1] || 0, r[3] == null ? null : (+r[3] || 0), r[4] || '']), par: x.par ? 1 : 0, nm: x.par ? ['Receitas', 'Despesas'] : null };
   return `${x.topo ? `<b class="mf-wg-v mf-wg-vs ${x.cl || ''}" data-cu>${x.topo}</b>` : ''}${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}<div class="mf-wg-bars mf-wg-sc${x.par ? ' par' : ''}" data-nosw data-wg-sc="${J(dat)}" data-wg-t="b">${L.map((r, n) => `<span style="--k:${n}"><div class="mf-wg-pair"><i style="--h:${Math.max(3, (+r[1] || 0) / mx * 100)}%;${r[2] ? `background:${r[2]}` : ''}"></i>${x.par ? `<i class="b2" style="--h:${Math.max(3, (+r[3] || 0) / mx * 100)}%"></i>` : ''}</div><small>${E(r[0])}</small></span>`).join('')}</div>${x.leg ? `<div class="mf-wg-leg mf-wg-x">${x.leg}</div>` : ''}`;
  },
  /* ranking em barras horizontais: [nome, valor, texto] */
  rank: x => x.r && x.r.length ? `<div class="mf-wg-rk">${(() => { const mx = x.max || Math.max(1, ...x.r.map(r => +r[1] || 0)); return x.r.map((r, i) => `<span style="--k:${i}"><em>${E(r[0])}</em><b>${r[2]}</b><i><u style="--w:${Math.max(4, (+r[1] || 0) / mx * 100)}%;background:${COR[i % COR.length]}"></u></i></span>`).join(''); })()}</div>` : `<small class="mf-wg-s">${x.vazio || 'Nada por aqui.'}</small>`,
  /* rosca: partes [nome, valor, cor]; centro com o total. Toque na rosca ou na legenda: o centro mostra o valor da parte. */
  rosca: x => {
   const P = (x.p || []).filter(r => (+r[1] || 0) > 0), tot = P.reduce((s, r) => s + (+r[1] || 0), 0);
   if (!tot) return `<small class="mf-wg-s">${x.vazio || 'Nada por aqui.'}</small>`;
   let a = 0; const seg = P.map((r, i) => { const c = r[2] || COR[i % COR.length], d = (+r[1]) / tot * 100, h = `<circle class="mf-wg-seg" style="--k:${i};--d:${d.toFixed(2)}" cx="18" cy="18" r="15.915" stroke="${c}" stroke-dashoffset="${(-a).toFixed(2)}"/>`; a += d; return h; }).join('');
   const dat = { p: P.map((r, i) => [r[0], +r[1], r[2] || COR[i % COR.length], (+r[1]) / tot * 100]), c: [x.centro || '', x.centroS || ''] };
   return `<div class="mf-wg-ro"><div class="mf-wg-rc mf-wg-sc" data-nosw data-wg-sc="${J(dat)}" data-wg-t="d"><svg viewBox="-3 -3 42 42" aria-hidden="true"><circle class="mf-wg-bg" cx="18" cy="18" r="15.915"/>${seg}</svg><span><b>${x.centro || ''}</b><small>${x.centroS || ''}</small></span></div><div class="mf-wg-rl">${P.map((r, i) => { const c = r[2] || COR[i % COR.length], d = (+r[1]) / tot * 100; return `<span data-wg-seg="${i}" style="--k:${i};--c:${c};--lp:${d.toFixed(1)}%"><i></i><em>${E(r[0])}</em><b>${pct(d)}</b><s></s></span>`; }).join('')}</div></div>`;
  },
  /* linha (sparkline) com valor atual em cima, selo de variação, menor/maior e toque: balão com o valor de cada ponto */
  linha: x => {
   const P = x.pts || []; if (P.length < 2) return D.num(x);
   const mn = Math.min(...P), mx = Math.max(...P), h = mx - mn || 1, W = 100, Hh = 36;
   const xy = P.map((v, i) => `${(i / (P.length - 1) * W).toFixed(1)},${(Hh - 3 - (v - mn) / h * (Hh - 6)).toFixed(1)}`), ult = xy[xy.length - 1].split(',');
   const dat = { p: P.map(v => Math.round(v * 100) / 100), l: x.labs || null, a: x.ini || '', z: x.fim || '' };
   return `<div class="mf-wg-hd"><b class="mf-wg-v mf-wg-vs ${x.cl || ''}" data-cu>${x.v}</b>${chipV(P[0], P[P.length - 1], x.cl === 'bad')}</div>${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}<small class="mf-wg-s mf-wg-x">menor <b>${R(mn)}</b> · maior <b>${R(mx)}</b></small><div class="mf-wg-ln mf-wg-sc" data-nosw data-wg-sc="${J(dat)}" data-wg-t="l"><svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,${Hh} ${xy.join(' ')} ${W},${Hh}" /><polyline pathLength="1" points="${xy.join(' ')}" /></svg><i class="mf-wg-pt" style="left:${ult[0]}%;top:${(+ult[1] / Hh * 100).toFixed(1)}%"></i></div>${x.ini ? `<div class="mf-wg-lx mf-wg-x"><small>${x.ini}</small><small>${x.fim || ''}</small></div>` : ''}`;
  },
  /* 1.18: três números lado a lado (ex.: Receitas, Despesas, Saldo) */
  tres: x => `<div class="mf-wg-3">${(x.tres || []).map(([a, b, c]) => `<span><small>${a}</small><b class="${c || ''}" data-cu>${b}</b></span>`).join('')}</div>${x.s ? `<small class="mf-wg-s mf-wg-x">${x.s}</small>` : ''}`,
  /* 1.18: barra de progresso (0–100) com o número em cima */
  prog: x => { const p = Math.max(0, Math.min(100, +x.pc || 0)); return `<b class="mf-wg-v mf-wg-vs ${x.cl || ''}" data-cu>${x.v}</b><div class="mf-wg-pg ${x.cl || ''}" role="img" aria-label="${Math.round(p)}%"><i style="--w:${p}%"></i></div>${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}`; },
  /* 1.18: Mini — só o número principal, numa linha */
  mini: x => `<b class="mf-wg-v ${x.cl || ''}" data-cu>${x.v != null ? x.v : (x.topo || '—')}</b>`,
  /* anel de progresso (0–100) */
  anel: x => {
   const p = Math.max(0, Math.min(100, +x.pc || 0));
   return `<div class="mf-wg-an"><div class="mf-wg-ac ${x.cl || ''}" style="--an:${p}"><b data-cu>${x.v}</b></div>${x.s ? `<small class="mf-wg-s">${x.s}</small>` : ''}</div>`;
  }
 };

 /* ---------- 1.18: apoio dos blocos novos (só leitura do que o app já calcula) ---------- */
 const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
 const ivAtivos = () => (S.inv || []).filter(a => a && ((+a.q || 0) > 0 || a.f));
 const ivTotal = () => ivAtivos().reduce((s, a) => s + (+ivNow(a) || 0), 0);
 /* gastos entre duas datas (inclusive), pela mesma regra de gasto do app */
 const gastosEntre = (d0, d1) => { const out = []; for (let k = d0.slice(0, 7); k <= d1.slice(0, 7); k = mesMais(k, 1)) mfSpendRows(k).forEach(t => { const d = String(t.d).slice(0, 10); if (d >= d0 && d <= d1) out.push(t); }); return out; };
 const lancHoje = () => S.tx.filter(t => t && t.d === TD && !mfIsProvCx(t) && !mfIsSaldoIni(t) && !isInvoicePayment(t) && !mfIsTr(t));
 const somaPor = (L, f) => { const G = {}; L.forEach(t => { const k = f(t) || 'Outros'; G[k] = (G[k] || 0) + (+t.v || 0); }); return Object.keys(G).filter(k => G[k] > 0).sort((a, b) => G[b] - G[a]).map(k => [k, G[k]]); };
 /* rosca com no máximo 5 partes (as menores viram "Outras") */
 const top5 = P => { const t = P.slice(0, 4), r = P.slice(4).reduce((s, x) => s + x[1], 0); if (r > 0) t.push(['Outras', r, '#7c8796']); return t; };
 const diasRestantes = () => { const k = mesAtual(), fim = fimMes(k); return Math.max(1, Math.round((new Date(fim + 'T12:00:00') - new Date(TD + 'T12:00:00')) / 864e5) + 1); };
 const provsAte = () => mfProvAll().filter(t => t && t.d && t.d <= TD && mfIsProv(t));
 const sinalR = v => (v >= 0 ? '+' : '−') + R(Math.abs(v));
 const pctS = v => (v > 0 ? '+' : v < 0 ? '−' : '') + pct(Math.abs(v));

 /* ---------- catálogo ---------- */
 /* cada f/ex devolve { modelo: dados } só para os modelos daquele widget; o desenho é D[tipo do modelo] */
 const TIPO = { num: 'num', l3: 'lista', l5: 'lista', lista: 'lista', barras: 'barras', rank: 'rank', rosca: 'rosca', linha: 'linha', anel: 'anel', tres: 'tres', prog: 'prog' };
 /* modelos que têm um número principal e por isso aceitam o tamanho Mini */
 const MINI_OK = ['num', 'anel', 'prog'];
 const MF_WG = {
  /* ===== Dashboard ===== */
  saldo: { a: 'res', n: 'Saldo de hoje', d: 'Quanto você tem agora, somando as contas.', m: [['num', 'Número'], ['linha', 'Linha 30 dias']],
   f(v) {
    const val = cashBalanceAt(TD);
    if (v !== 'linha') return { v: R(val), cl: sinal(val), s: 'em ' + mfDmy(TD) };
    const pts = [], labs = []; for (let i = 30; i >= 0; i -= 3) { pts.push(cashBalanceAt(addDaysISO(TD, -i))); labs.push(i ? dm(addDaysISO(TD, -i)) : 'hoje'); }
    return { v: R(val), cl: sinal(val), s: 'últimos 30 dias', pts, labs, ini: dm(addDaysISO(TD, -30)), fim: 'hoje' };
   },
   ex: v => ({ v: 'R$ 4.280,50', cl: 'ok', s: v === 'linha' ? 'últimos 30 dias' : 'hoje', pts: [5200, 4900, 4950, 4400, 4100, 6900, 6500, 6200, 5300, 4700, 4280], ini: '12/10', fim: 'hoje' }) },
  mes: { a: 'res', n: 'Resultado do mês', d: 'Receitas menos despesas do mês atual.', m: [['num', 'Número'], ['barras', 'Barras']],
   f(v) {
    const s = dashStats(mesAtual());
    if (v === 'barras') return { topo: R(s.balance), cl: sinal(s.balance), b: [['Receitas', s.rec, 'var(--ok,#34c759)'], ['Despesas', s.exp, 'var(--bad,#ff453a)']] };
    return { v: R(s.balance), cl: sinal(s.balance), dois: [['Receitas', R(s.rec)], ['Despesas', R(s.exp)]] };
   },
   ex: v => (v === 'barras' ? { topo: 'R$ 1.350,00', cl: 'ok', b: [['Receitas', 5000, 'var(--ok,#34c759)'], ['Despesas', 3650, 'var(--bad,#ff453a)']] } : { v: 'R$ 1.350,00', cl: 'ok', dois: [['Receitas', 'R$ 5.000,00'], ['Despesas', 'R$ 3.650,00']] }) },
  prev: { a: 'res', n: 'Saldo previsto no fim do mês', d: 'O saldo de hoje com tudo o que ainda está lançado até o fim do mês, faturas incluídas.', m: [['num', 'Número']],
   f() {
    const k = mesAtual(), fim = fimMes(k), hoje = cashBalanceAt(TD), p = cashBalanceAt(fim), dif = p - hoje;
    return { v: R(p), cl: sinal(p), s: `em ${dm(fim)} · ${dif >= 0 ? '+' : '−'}${R(Math.abs(dif))} até lá` };
   },
   ex: () => ({ v: 'R$ 2.930,40', cl: 'ok', s: 'em 30/11 · −R$ 1.350,10 até lá' }) },
  fluxo6: { a: 'res', n: 'Últimos 6 meses', d: 'Quanto entrou e quanto saiu em cada um dos últimos 6 meses.', m: [['barras', 'Barras']],
   f() {
    const k = mesAtual(), b = []; for (let i = 5; i >= 0; i--) { const m = mesMais(k, -i), s = dashStats(m); b.push([mes3(m), s.rec, 'var(--ok,#34c759)', s.exp]); }
    return { b, par: 1, leg: '<span><i class="ok"></i>Receitas</span><span><i class="bad"></i>Despesas</span>' };
   },
   ex: () => ({ b: [['jun', 5000, 0, 4100], ['jul', 5200, 0, 4700], ['ago', 5000, 0, 3900], ['set', 5400, 0, 5100], ['out', 5000, 0, 4300], ['nov', 5100, 0, 3650]], par: 1, leg: '<span><i class="ok"></i>Receitas</span><span><i class="bad"></i>Despesas</span>' }) },
  comp: { a: 'res', n: 'Gastos x mês passado', d: 'Quanto você gastou até hoje, comparado ao mesmo período do mês passado.', m: [['num', 'Número'], ['barras', 'Barras']],
   f(v) {
    const k = mesAtual(), a = dashStats(k, true).exp, ant = mesMais(k, -1), dia = Math.min(+TD.slice(8, 10), +fimMes(ant).slice(8, 10));
    const b = mfSpendRows(ant).filter(t => +String(t.d).slice(8, 10) <= dia).reduce((s, t) => s + (+t.v || 0), 0), d = b ? (a - b) / b * 100 : 0;
    const s = b ? `${d > 0 ? '+' : ''}${pct(d)} que ${mes3(ant)} (${R(b)})` : `Sem gastos em ${mes3(ant)} até o dia ${dia}`;
    if (v === 'barras') return { topo: R(a), cl: d > 0 ? 'bad' : 'ok', s, b: [[mes3(ant), b, 'var(--mu)'], [mes3(k), a, d > 0 ? 'var(--bad,#ff453a)' : 'var(--ok,#34c759)']] };
    return { v: R(a), cl: d > 0 ? 'bad' : 'ok', s };
   },
   ex: v => ({ v: 'R$ 2.140,00', topo: 'R$ 2.140,00', cl: 'ok', s: '−12% que out (R$ 2.432,00)', b: [['out', 2432, 'var(--mu)'], ['nov', 2140, 'var(--ok,#34c759)']] }) },
  sobra: { a: 'res', n: 'Quanto sobrou', d: 'A parte das receitas do mês que ainda não foi gasta.', m: [['anel', 'Anel'], ['num', 'Número']],
   f(v) {
    const s = dashStats(mesAtual()), p = s.rec > 0 ? s.balance / s.rec * 100 : 0;
    if (!(s.rec > 0)) return { v: '—', pc: 0, s: 'Sem receitas neste mês' };
    return v === 'num' ? { v: pct(p), cl: sinal(p), s: `${R(s.balance)} de ${R(s.rec)}` } : { v: pct(Math.round(p)), pc: p, cl: sinal(p), s: `${R(s.balance)} de ${R(s.rec)}` };
   },
   ex: v => ({ v: '27%', pc: 27, cl: 'ok', s: 'R$ 1.350,00 de R$ 5.000,00' }) },

  /* ===== Planejamento ===== */
  fatura: { a: 'mais', n: 'Fatura atual', d: 'Valor e vencimento da fatura do cartão deste mês.', m: [['num', 'Número'], ['lista', 'Maiores compras']],
   f(v) {
    const k = mfFatCur(), inv = cbInvoice(k);
    if (!(inv.total > 0.005)) return { v: R(0), s: 'Sem fatura em ' + nomeMes(k), vazio: 'Sem fatura em ' + nomeMes(k) };
    const val = inv.left > 0.005 ? inv.left : inv.total, st = E(mfFatStatus(inv, k));
    if (v === 'lista') return { topo: R(val), li: (inv.rows || []).slice().sort((a, b) => txValue(b) - txValue(a)).slice(0, 3).map(t => [dm(t.d), E(String(t.n || t.c || 'Compra')), R(txValue(t))]) };
    return { v: R(val), s: st };
   },
   ex: v => ({ v: 'R$ 1.240,90', s: 'Vence 10/12 · em 8 dias', topo: 'R$ 1.240,90', li: [['03/11', 'Mercado', 'R$ 412,30'], ['15/11', 'Farmácia', 'R$ 189,90'], ['21/11', 'Restaurante', 'R$ 156,00']] }) },
  venc: { a: 'mais', n: 'Próximas contas', d: 'As próximas contas a pagar deste mês.', m: [['l3', 'Lista de 3'], ['l5', 'Lista de 5']],
   f(v) {
    const L = mfDueItems(mesAtual()).filter(x => !x.paid && x.d >= TD).slice(0, v === 'l5' ? 5 : 3);
    return { li: L.map(x => [dm(x.d), E(x.n), R(x.v)]), vazio: 'Nada a pagar até o fim do mês.' };
   },
   ex: v => ({ li: [['10/12', 'Aluguel', 'R$ 1.200,00'], ['15/12', 'Internet', 'R$ 99,90'], ['20/12', 'Academia', 'R$ 120,00'], ['22/12', 'Luz', 'R$ 180,40'], ['28/12', 'Celular', 'R$ 59,90']].slice(0, v === 'l5' ? 5 : 3) }) },
  parc: { a: 'mais', n: 'Parcelas em aberto', d: 'Quanto ainda falta pagar das compras parceladas.', m: [['num', 'Número'], ['lista', 'Lista']],
   f(v) {
    const L = mfParcList().filter(x => x.left > 0.005), tot = L.reduce((s, x) => s + x.left, 0);
    if (v === 'lista') return { topo: R(tot), li: L.slice(0, 3).map(x => [x.next ? dm(x.next) : '—', E(x.name), `${x.paid}/${x.n}`]), vazio: 'Nenhuma parcela em aberto.' };
    return { v: R(tot), s: L.length ? `${L.length} ${L.length === 1 ? 'compra parcelada' : 'compras parceladas'}` : 'Nenhuma parcela em aberto' };
   },
   ex: v => ({ v: 'R$ 2.380,00', s: '3 compras parceladas', topo: 'R$ 2.380,00', li: [['10/12', 'Geladeira', '4/10'], ['10/12', 'Notebook', '7/12'], ['15/12', 'Curso', '2/6']] }) },
  fixas: { a: 'mais', n: 'Contas fixas do mês', d: 'As contas recorrentes deste mês e quais já foram pagas.', m: [['lista', 'Lista']],
   f() {
    const L = mfDueItems(mesAtual()).filter(x => x.sub === 'Recorrente'), pg = L.filter(x => x.paid).length;
    return { topo: L.length ? `${pg} de ${L.length} pagas` : '', li: L.slice(0, 5).map(x => [x.paid ? '✓' : dm(x.d), E(x.n), R(x.v), x.paid]), vazio: 'Nenhuma conta recorrente neste mês.' };
   },
   ex: () => ({ topo: '2 de 4 pagas', li: [['✓', 'Aluguel', 'R$ 1.200,00', 1], ['✓', 'Internet', 'R$ 99,90', 1], ['20/12', 'Academia', 'R$ 120,00'], ['28/12', 'Celular', 'R$ 59,90']] }) },
  ult: { a: 'add', n: 'Últimos lançamentos', d: 'Os lançamentos mais recentes, até hoje.', m: [['l3', 'Lista de 3'], ['l5', 'Lista de 5']],
   f(v) {
    const L = S.tx.filter(t => t && t.d && t.d <= TD && !mfIsProvCx(t) && !mfIsSaldoIni(t) && !isInvoicePayment(t)).sort((a, b) => b.d.localeCompare(a.d)).slice(0, v === 'l5' ? 5 : 3);
    return { li: L.map(t => [dm(t.d), E(String(t.n || t.c || '')), `<span class="${t.c === 'Receita' ? 'ok' : ''}">${t.c === 'Receita' ? '+' : '−'}${R(+t.v || 0)}</span>`]), vazio: 'Nenhum lançamento ainda.' };
   },
   ex: v => ({ li: [['11/11', 'Padaria', '−R$ 18,50'], ['10/11', 'Salário', '<span class="ok">+R$ 5.000,00</span>'], ['09/11', 'Uber', '−R$ 23,90'], ['08/11', 'Mercado', '−R$ 245,70'], ['07/11', 'Cinema', '−R$ 64,00']].slice(0, v === 'l5' ? 5 : 3) }) },

  /* ===== Lançamentos ===== */
  gdia: { a: 'add', n: 'Gasto por dia', d: 'Média do que você gastou por dia neste mês, até hoje.', m: [['num', 'Número'], ['barras', 'Barras por dia']],
   f(v) {
    const k = mesAtual(), s = dashStats(k, true), dias = Math.max(1, +TD.slice(8, 10));
    if (v !== 'barras') return { v: R(s.exp / dias), s: `média de ${dias} ${dias === 1 ? 'dia' : 'dias'} · total ${R(s.exp)}` };
    const por = {}; mfSpendRows(k).forEach(t => { const d = String(t.d).slice(0, 10); if (d <= TD) por[d] = (por[d] || 0) + (+t.v || 0); });
    const b = []; for (let i = Math.min(13, dias - 1); i >= 0; i--) { const d = addDaysISO(TD, -i); b.push([d.slice(8, 10), por[d] || 0]); }
    return { topo: R(s.exp / dias), s: 'por dia, em média', b };
   },
   ex: v => ({ v: 'R$ 48,30', s: v === 'barras' ? 'por dia, em média' : 'média de 12 dias · total R$ 579,60', topo: 'R$ 48,30', b: [['30', 12], ['31', 80], ['01', 45], ['02', 0], ['03', 112], ['04', 26], ['05', 38], ['06', 64], ['07', 15], ['08', 245], ['09', 24], ['10', 0], ['11', 18]] }) },
  topcat: { a: 'add', n: 'Gastos por categoria', d: 'Onde o dinheiro foi neste mês: a maior categoria, a divisão ou o ranking.', m: [['num', 'Maior gasto'], ['rosca', 'Rosca'], ['rank', 'Ranking']],
   f(v) {
    const c = dashStats(mesAtual()).cats || {}, ks = Object.keys(c).filter(k => c[k] > 0).sort((a, b) => c[b] - c[a]), tot = ks.reduce((s, k) => s + c[k], 0);
    if (!ks.length) return { v: R(0), s: 'Sem gastos neste mês.', vazio: 'Sem gastos neste mês.' };
    if (v === 'rosca') { const top = ks.slice(0, 4).map(k => [k, c[k]]), resto = ks.slice(4).reduce((s, k) => s + c[k], 0); if (resto > 0) top.push(['Outras', resto, '#7c8796']); return { p: top, centro: RS(tot), centroS: 'no mês' }; }
    if (v === 'rank') return { r: ks.slice(0, 5).map(k => [k, c[k], R(c[k])]) };
    return { v: R(c[ks[0]]), s: E(ks[0]) };
   },
   ex: v => ({ v: 'R$ 1.200,00', s: 'Moradia', p: [['Moradia', 1200], ['Alimentação', 860], ['Transporte', 420], ['Lazer', 310], ['Outras', 260, '#7c8796']], centro: 'R$ 3.050', centroS: 'no mês', r: [['Moradia', 1200, 'R$ 1.200,00'], ['Alimentação', 860, 'R$ 860,00'], ['Transporte', 420, 'R$ 420,00'], ['Lazer', 310, 'R$ 310,00'], ['Saúde', 180, 'R$ 180,00']] }) },

  /* ===== Investimentos ===== */
  patri: { a: 'inv', n: 'Patrimônio investido', d: 'Valor atual de tudo o que está em Investimentos.', m: [['num', 'Número'], ['rosca', 'Rosca por classe']],
   f(v) {
    const L = (S.inv || []).filter(a => a && ((+a.q || 0) > 0 || a.f)), val = L.reduce((s, a) => s + (+ivNow(a) || 0), 0);
    if (v !== 'rosca') return { v: R(val), s: `${L.length} ${L.length === 1 ? 'ativo' : 'ativos'}` };
    const G = {}; L.forEach(a => { const c = ivClass(a); G[c] = (G[c] || 0) + (+ivNow(a) || 0); });
    return { p: Object.keys(G).sort((a, b) => G[b] - G[a]).map(c => [IV_NOME[c] || c, G[c], IV_COL[c]]), centro: RS(val), centroS: `${L.length} ativos`, vazio: 'Nenhum investimento ainda.' };
   },
   ex: v => ({ v: 'R$ 32.450,00', s: '8 ativos', p: [['Ações', 14200, '#5b8def'], ['FIIs', 9800, '#38a889'], ['Renda fixa', 6100, '#d5a348'], ['Reserva', 2350, '#e56b7b']], centro: 'R$ 32 mil', centroS: '8 ativos' }) },
  topinv: { a: 'inv', n: 'Maiores posições', d: 'Os ativos com mais dinheiro na carteira.', m: [['rank', 'Ranking'], ['lista', 'Lista']],
   f(v) {
    const L = (S.inv || []).filter(a => a && ((+a.q || 0) > 0 || a.f)).map(a => [String(a.a || '').toUpperCase(), +ivNow(a) || 0]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 5), tot = (S.inv || []).reduce((s, a) => s + (a && ((+a.q || 0) > 0 || a.f) ? (+ivNow(a) || 0) : 0), 0);
    if (v === 'lista') return { li: L.map(([n, x]) => [tot ? pct(x / tot * 100) : '', E(n), R(x)]), vazio: 'Nenhum investimento ainda.' };
    return { r: L.map(([n, x]) => [n, x, R(x)]), vazio: 'Nenhum investimento ainda.' };
   },
   ex: v => ({ r: [['ITSA4', 6200, 'R$ 6.200,00'], ['MXRF11', 4800, 'R$ 4.800,00'], ['TESOURO SELIC', 4100, 'R$ 4.100,00'], ['BBAS3', 3900, 'R$ 3.900,00'], ['HGLG11', 2600, 'R$ 2.600,00']], li: [['19%', 'ITSA4', 'R$ 6.200,00'], ['15%', 'MXRF11', 'R$ 4.800,00'], ['13%', 'TESOURO SELIC', 'R$ 4.100,00'], ['12%', 'BBAS3', 'R$ 3.900,00'], ['8%', 'HGLG11', 'R$ 2.600,00']] }) },
  lucro: { a: 'inv', n: 'Lucro da carteira', d: 'Valor atual menos o que você pagou nos ativos (sem proventos).', m: [['num', 'Número']],
   f() {
    const L = (S.inv || []).filter(a => a && ((+a.q || 0) > 0 || a.f)), now = L.reduce((s, a) => s + (+ivNow(a) || 0), 0), cost = L.reduce((s, a) => s + (+ivCost(a) || 0), 0), l = now - cost;
    return { v: (l >= 0 ? '+' : '−') + R(Math.abs(l)), cl: sinal(l), s: cost > 0 ? `${l >= 0 ? '+' : ''}${pct(l / cost * 100)} sobre ${R(cost)} aplicados` : 'Nenhum investimento ainda' };
   },
   ex: () => ({ v: '+R$ 2.315,40', cl: 'ok', s: '+7,7% sobre R$ 30.134,60 aplicados' }) },

  /* ===== Investimentos · proventos ===== */
  provm: { a: 'inv', n: 'Proventos do mês', d: 'Dividendos e rendimentos recebidos neste mês.', m: [['num', 'Número'], ['barras', 'Barras 12 meses']],
   f(v) {
    const k = mesAtual(), A = mfProvAll().filter(t => t.d && t.d <= TD && mfIsProv(t)), por = {}; A.forEach(t => { const m = t.d.slice(0, 7); por[m] = (por[m] || 0) + (+t.v || 0); });
    const ant = mesMais(k, -1);
    if (v !== 'barras') return { v: R(por[k] || 0), s: `${mes3(ant)}: ${R(por[ant] || 0)}` };
    const b = []; for (let i = 11; i >= 0; i--) { const m = mesMais(k, -i); b.push([mes3(m).slice(0, 1).toUpperCase(), por[m] || 0, 0, null, nomeMes(m) + ' ' + m.slice(0, 4)]); }
    return { topo: R(por[k] || 0), s: 'neste mês · últimos 12 meses', b };
   },
   ex: v => ({ v: 'R$ 186,40', s: v === 'barras' ? 'neste mês · últimos 12 meses' : 'out: R$ 172,10', topo: 'R$ 186,40', b: [['D', 120], ['J', 98], ['F', 132], ['M', 140], ['A', 101], ['M', 155], ['J', 149], ['J', 162], ['A', 158], ['S', 170], ['O', 172], ['N', 186]] }) },
  provnx: { a: 'inv', n: 'Próximos proventos', d: 'Os próximos dividendos já anunciados ou lançados.', m: [['l3', 'Lista de 3'], ['l5', 'Lista de 5']],
   f(v) {
    const L = mfProvAll().filter(t => t.d && t.d > TD && mfIsProv(t)).sort((a, b) => a.d.localeCompare(b.d)).slice(0, v === 'l5' ? 5 : 3);
    return { li: L.map(t => [dm(t.d), E(typeof mfProvTk === 'function' ? mfProvTk(t) || t.n : t.n), R(+t.v || 0)]), vazio: 'Nenhum provento futuro lançado.' };
   },
   ex: v => ({ li: [['14/11', 'MXRF11', 'R$ 42,30'], ['18/11', 'HGLG11', 'R$ 22,00'], ['28/11', 'ITSA4', 'R$ 15,80'], ['01/12', 'BBAS3', 'R$ 31,20'], ['12/12', 'KNRI11', 'R$ 18,90']].slice(0, v === 'l5' ? 5 : 3) }) },

  /* =====================================================================
     1.18 — blocos novos, por tela
     ===================================================================== */

  /* ===== Lançamentos ===== */
  ent: { a: 'add', n: 'Entradas do mês', d: 'Tudo o que entrou neste mês (sem saldo inicial e sem proventos).', m: [['num', 'Número'], ['linha', 'Linha 6 meses']],
   f(v) {
    const k = mesAtual(), s = dashStats(k), n = S.tx.filter(t => t && t.d && t.d.slice(0, 7) === k && mfIsRec(t)).length;
    if (v !== 'linha') return { v: R(s.rec), cl: 'ok', s: `${n} ${n === 1 ? 'entrada' : 'entradas'} em ${nomeMes(k).toLowerCase()}` };
    const pts = [], labs = []; for (let i = 5; i >= 0; i--) { pts.push(dashStats(mesMais(k, -i)).rec); labs.push(nomeMes(mesMais(k, -i))); }
    return { v: R(s.rec), cl: 'ok', s: 'últimos 6 meses', pts, labs, ini: mes3(mesMais(k, -5)), fim: mes3(k) };
   },
   ex: v => ({ v: 'R$ 5.000,00', cl: 'ok', s: v === 'linha' ? 'últimos 6 meses' : '2 entradas em novembro', pts: [4800, 5000, 5000, 5200, 5000, 5000], ini: 'jun', fim: 'nov' }) },
  sai: { a: 'add', n: 'Saídas do mês', d: 'Tudo o que você gastou neste mês, cartão incluído.', m: [['num', 'Número'], ['linha', 'Linha 6 meses']],
   f(v) {
    const k = mesAtual(), s = dashStats(k), n = mfSpendRows(k).length;
    if (v !== 'linha') return { v: R(s.exp), cl: 'bad', s: `${n} ${n === 1 ? 'gasto' : 'gastos'} em ${nomeMes(k).toLowerCase()}` };
    const pts = [], labs = []; for (let i = 5; i >= 0; i--) { pts.push(dashStats(mesMais(k, -i)).exp); labs.push(nomeMes(mesMais(k, -i))); }
    return { v: R(s.exp), cl: 'bad', s: 'últimos 6 meses', pts, labs, ini: mes3(mesMais(k, -5)), fim: mes3(k) };
   },
   ex: v => ({ v: 'R$ 3.650,00', cl: 'bad', s: v === 'linha' ? 'últimos 6 meses' : '42 gastos em novembro', pts: [4100, 4700, 3900, 5100, 4300, 3650], ini: 'jun', fim: 'nov' }) },
  hoje: { a: 'add', n: 'Lançamentos de hoje', d: 'O que foi lançado com a data de hoje.', m: [['lista', 'Lista'], ['num', 'Total']],
   f(v) {
    const L = lancHoje(), out = L.filter(t => t.c !== 'Receita').reduce((s, t) => s + (+t.v || 0), 0);
    if (v === 'num') return { v: R(out), s: L.length ? `${L.length} ${L.length === 1 ? 'lançamento' : 'lançamentos'} hoje` : 'Nada lançado hoje' };
    return { li: L.slice(0, 5).map(t => [t.c === 'Receita' ? '+' : '−', E(String(t.n || t.c || '')), `<span class="${t.c === 'Receita' ? 'ok' : ''}">${R(+t.v || 0)}</span>`]), vazio: 'Nada lançado hoje.' };
   },
   ex: v => ({ v: 'R$ 42,40', s: '3 lançamentos hoje', li: [['−', 'Padaria', 'R$ 18,50'], ['−', 'Uber', 'R$ 23,90'], ['+', 'Pix recebido', '<span class="ok">R$ 50,00</span>']] }) },
  sem7: { a: 'add', n: 'Últimos 7 dias', d: 'Quanto você gastou em cada um dos últimos 7 dias.', m: [['barras', 'Barras'], ['num', 'Total']],
   f(v) {
    const d0 = addDaysISO(TD, -6), L = gastosEntre(d0, TD), tot = L.reduce((s, t) => s + (+t.v || 0), 0);
    if (v === 'num') return { v: R(tot), s: `média de ${R(tot / 7)} por dia` };
    const por = {}; L.forEach(t => { const d = String(t.d).slice(0, 10); por[d] = (por[d] || 0) + (+t.v || 0); });
    const b = []; for (let i = 6; i >= 0; i--) { const d = addDaysISO(TD, -i); b.push([SEM[new Date(d + 'T12:00:00').getDay()], por[d] || 0]); }
    return { topo: R(tot), s: 'nos últimos 7 dias', b };
   },
   ex: v => ({ v: 'R$ 412,60', topo: 'R$ 412,60', s: v === 'num' ? 'média de R$ 58,94 por dia' : 'nos últimos 7 dias', b: [['qua', 45], ['qui', 0], ['sex', 112], ['sáb', 138], ['dom', 26], ['seg', 72], ['ter', 19]] }) },
  maior: { a: 'add', n: 'Maior gasto do mês', d: 'A compra ou conta de maior valor neste mês.', m: [['num', 'Número'], ['l3', 'Top 3']],
   f(v) {
    const L = mfSpendRows(mesAtual()).slice().sort((a, b) => (+b.v || 0) - (+a.v || 0));
    if (!L.length) return { v: R(0), s: 'Sem gastos neste mês', vazio: 'Sem gastos neste mês.' };
    if (v === 'l3') return { li: L.slice(0, 3).map(t => [dm(t.d), E(String(t.n || t.c || 'Gasto')), R(+t.v || 0)]) };
    return { v: R(+L[0].v || 0), s: `${E(String(L[0].n || L[0].c || 'Gasto'))} · ${dm(L[0].d)}` };
   },
   ex: v => ({ v: 'R$ 1.250,00', s: 'Aluguel · 05/11', li: [['05/11', 'Aluguel', 'R$ 1.250,00'], ['03/11', 'Mercado', 'R$ 412,30'], ['15/11', 'Farmácia', 'R$ 189,90']] }) },
  pag: { a: 'add', n: 'Por forma de pagamento', d: 'Quanto saiu no Pix, no crédito, no débito e nas outras formas neste mês.', m: [['rosca', 'Rosca'], ['rank', 'Ranking']],
   f(v) {
    const P = somaPor(mfSpendRows(mesAtual()), t => t.t || 'Outros'), tot = P.reduce((s, x) => s + x[1], 0);
    if (!P.length) return { vazio: 'Sem gastos neste mês.' };
    if (v === 'rank') return { r: P.slice(0, 5).map(([n, x]) => [n, x, R(x)]) };
    return { p: top5(P), centro: RS(tot), centroS: 'no mês' };
   },
   ex: v => ({ p: [['Pix', 1650], ['Crédito', 1240], ['Débito', 520], ['VR', 240]], centro: 'R$ 3.650', centroS: 'no mês', r: [['Pix', 1650, 'R$ 1.650,00'], ['Crédito', 1240, 'R$ 1.240,00'], ['Débito', 520, 'R$ 520,00'], ['VR', 240, 'R$ 240,00']] }) },
  qtd: { a: 'add', n: 'Lançamentos no mês', d: 'Quantas entradas e saídas você lançou neste mês.', m: [['tres', 'Três números'], ['num', 'Número']],
   f(v) {
    const k = mesAtual(), r = S.tx.filter(t => t && t.d && t.d.slice(0, 7) === k && mfIsRec(t)).length, g = mfSpendRows(k).length;
    if (v === 'num') return { v: String(r + g), s: `${r} ${r === 1 ? 'entrada' : 'entradas'} · ${g} ${g === 1 ? 'saída' : 'saídas'}` };
    return { tres: [['Entradas', String(r), 'ok'], ['Saídas', String(g), 'bad'], ['Total', String(r + g)]] };
   },
   ex: v => ({ v: '44', s: '2 entradas · 42 saídas', tres: [['Entradas', '2', 'ok'], ['Saídas', '42', 'bad'], ['Total', '44']] }) },
  media: { a: 'add', n: 'Gasto médio por compra', d: 'O valor médio de cada gasto lançado neste mês.', m: [['num', 'Número']],
   f() {
    const L = mfSpendRows(mesAtual()), tot = L.reduce((s, t) => s + (+t.v || 0), 0);
    return { v: R(L.length ? tot / L.length : 0), s: L.length ? `${L.length} ${L.length === 1 ? 'gasto' : 'gastos'} · total ${R(tot)}` : 'Sem gastos neste mês' };
   },
   ex: () => ({ v: 'R$ 86,90', s: '42 gastos · total R$ 3.650,00' }) },

  /* ===== Planejamento ===== */
  fatprox: { a: 'mais', n: 'Próxima fatura', d: 'O valor que já está na fatura do mês que vem.', m: [['num', 'Número']],
   f() {
    const k = mesMais(mfFatCur(), 1), inv = cbInvoice(k);
    if (!(inv.total > 0.005)) return { v: R(0), s: 'Nada na fatura de ' + nomeMes(k).toLowerCase() };
    return { v: R(inv.total), s: `${nomeMes(k)} · vence ${dm(inv.due)}` };
   },
   ex: () => ({ v: 'R$ 680,40', s: 'Dezembro · vence 10/01' }) },
  limite: { a: 'mais', n: 'Limite do cartão', d: 'Quanto do limite dos cartões a fatura atual já usa.', m: [['anel', 'Anel'], ['prog', 'Barra']],
   f() {
    const C = mfCards(), lim = C.reduce((s, c) => s + (+c.lim || 0), 0), k = mfFatCur(), uso = C.reduce((s, c) => { try { return s + (+cbInvoice(k, c.id).left || 0); } catch (e) { return s; } }, 0);
    if (!(lim > 0)) return { v: '—', pc: 0, s: 'Informe o limite em Cartão de crédito' };
    const p = uso / lim * 100;
    return { v: pct(Math.round(p)), pc: p, cl: p > 80 ? 'bad' : p > 50 ? '' : 'ok', s: `${R(uso)} de ${R(lim)}` };
   },
   ex: () => ({ v: '31%', pc: 31, cl: 'ok', s: 'R$ 1.240,90 de R$ 4.000,00' }) },
  apagar: { a: 'mais', n: 'Contas do mês pagas', d: 'Quanto das contas e faturas deste mês já foi pago.', m: [['prog', 'Barra'], ['anel', 'Anel'], ['tres', 'Três números']],
   f(v) {
    const L = mfDueItems(mesAtual()), tot = L.reduce((s, x) => s + (+x.v || 0), 0), pg = L.filter(x => x.paid).reduce((s, x) => s + (+x.v || 0), 0), p = tot > 0 ? pg / tot * 100 : 0;
    if (!L.length) return { v: '—', pc: 0, s: 'Nenhuma conta neste mês', tres: [['Total', R(0)], ['Pago', R(0)], ['Falta', R(0)]] };
    if (v === 'tres') return { tres: [['Total', R(tot)], ['Pago', R(pg), 'ok'], ['Falta', R(tot - pg), tot - pg > 0.005 ? 'bad' : '']] };
    return { v: v === 'anel' ? pct(Math.round(p)) : `${R(pg)} de ${R(tot)}`, pc: p, cl: 'ok', s: v === 'anel' ? `${R(pg)} de ${R(tot)}` : `falta ${R(tot - pg)}` };
   },
   ex: v => ({ v: v === 'anel' ? '62%' : 'R$ 1.299,90 de R$ 2.080,30', pc: 62, cl: 'ok', s: v === 'anel' ? 'R$ 1.299,90 de R$ 2.080,30' : 'falta R$ 780,40', tres: [['Total', 'R$ 2.080,30'], ['Pago', 'R$ 1.299,90', 'ok'], ['Falta', 'R$ 780,40', 'bad']] }) },
  vencidas: { a: 'mais', n: 'Contas atrasadas', d: 'Contas deste mês com data já passada e ainda não pagas.', m: [['lista', 'Lista'], ['num', 'Total']],
   f(v) {
    const L = mfDueItems(mesAtual()).filter(x => !x.paid && x.d < TD), tot = L.reduce((s, x) => s + (+x.v || 0), 0);
    if (v === 'num') return { v: R(tot), cl: tot > 0 ? 'bad' : 'ok', s: L.length ? `${L.length} ${L.length === 1 ? 'conta atrasada' : 'contas atrasadas'}` : 'Nenhuma conta atrasada' };
    return { li: L.slice(0, 5).map(x => [dm(x.d), E(x.n), `<span class="bad">${R(x.v)}</span>`]), vazio: 'Nenhuma conta atrasada. ✓' };
   },
   ex: v => ({ v: 'R$ 180,40', cl: 'bad', s: '1 conta atrasada', li: [['08/11', 'Luz', '<span class="bad">R$ 180,40</span>']] }) },
  parcfim: { a: 'mais', n: 'Parcelas que acabam logo', d: 'As compras parceladas mais perto da última parcela.', m: [['lista', 'Lista']],
   f() {
    const L = mfParcList().filter(x => x.left > 0.005).sort((a, b) => (a.n - a.paid) - (b.n - b.paid) || b.left - a.left).slice(0, 4);
    return { li: L.map(x => { const f = x.n - x.paid; return [`${x.paid}/${x.n}`, E(x.name), f <= 1 ? 'última' : `faltam ${f}`]; }), vazio: 'Nenhuma parcela em aberto.' };
   },
   ex: () => ({ li: [['9/10', 'Geladeira', 'última'], ['10/12', 'Notebook', 'faltam 2'], ['3/6', 'Curso', 'faltam 3']] }) },
  compras: { a: 'mais', n: 'Compras no cartão', d: 'O que foi comprado no crédito neste mês.', m: [['num', 'Número'], ['l5', 'Lista']],
   f(v) {
    const L = mfSpendRows(mesAtual(), true).filter(t => t.t === 'Crédito').sort((a, b) => String(b.d).localeCompare(String(a.d))), tot = L.reduce((s, t) => s + (+t.v || 0), 0);
    if (v === 'l5') return { topo: R(tot), li: L.slice(0, 5).map(t => [dm(t.d), E(String(t.n || t.c || 'Compra')), R(+t.v || 0)]), vazio: 'Nenhuma compra no cartão neste mês.' };
    return { v: R(tot), s: L.length ? `${L.length} ${L.length === 1 ? 'compra' : 'compras'} no crédito` : 'Nenhuma compra no cartão neste mês' };
   },
   ex: v => ({ v: 'R$ 1.240,90', topo: 'R$ 1.240,90', s: '9 compras no crédito', li: [['21/11', 'Restaurante', 'R$ 156,00'], ['15/11', 'Farmácia', 'R$ 189,90'], ['10/11', 'Streaming', 'R$ 39,90'], ['06/11', 'Posto', 'R$ 220,00'], ['03/11', 'Mercado', 'R$ 412,30']] }) },
  compcat: { a: 'mais', n: 'Compras por categoria', d: 'As compras do cartão neste mês, por categoria.', m: [['rank', 'Ranking'], ['rosca', 'Rosca']],
   f(v) {
    const P = somaPor(mfSpendRows(mesAtual(), true).filter(t => t.t === 'Crédito'), t => t.c), tot = P.reduce((s, x) => s + x[1], 0);
    if (!P.length) return { vazio: 'Nenhuma compra no cartão neste mês.' };
    if (v === 'rosca') return { p: top5(P), centro: RS(tot), centroS: 'no cartão' };
    return { r: P.slice(0, 5).map(([n, x]) => [n, x, R(x)]) };
   },
   ex: v => ({ r: [['Alimentação', 568, 'R$ 568,30'], ['Transporte', 220, 'R$ 220,00'], ['Saúde', 190, 'R$ 189,90'], ['Lazer', 156, 'R$ 156,00']], p: [['Alimentação', 568], ['Transporte', 220], ['Saúde', 190], ['Lazer', 156]], centro: 'R$ 1.134', centroS: 'no cartão' }) },
  regra: { a: 'mais', n: 'Distribuição 50/30/20', d: 'Quanto de cada parte da regra já foi usado no mês.', m: [['rank', 'Barras']],
   f() {
    const { income, G } = mfBudgetG();
    if (!(income > 0) && !G.some(g => g.fixo)) return { vazio: 'Registre uma receita no mês para ver a divisão.' };
    return { r: G.map(g => [g.name, Math.min(100, g.p * 100), `${R(g.actual)} de ${R(g.limit)}`]), max: 100 };
   },
   ex: () => ({ r: [['Contas da casa', 25, 'R$ 500,00 de R$ 2.000,00'], ['Não essencial', 17, 'R$ 259,00 de R$ 1.500,00'], ['Guardar', 0, 'R$ 0,00 de R$ 1.000,00']], max: 100 }) },
  tetos: { a: 'mais', n: 'Tetos por categoria', d: 'Quanto de cada teto de gasto você já usou neste mês.', m: [['rank', 'Barras']],
   f() {
    const L = mfTetoRows(mesAtual());
    return { r: L.slice(0, 5).map(x => [x.c, Math.min(100, x.p), `${R(x.sp)} de ${R(x.lim)}`]), max: 100, vazio: 'Nenhum teto por categoria definido.' };
   },
   ex: () => ({ r: [['Alimentação', 86, 'R$ 860,00 de R$ 1.000,00'], ['Lazer', 62, 'R$ 310,00 de R$ 500,00'], ['Transporte', 42, 'R$ 420,00 de R$ 1.000,00']], max: 100 }) },
  porDia: { a: 'mais', n: 'Quanto dá para gastar por dia', d: 'O saldo previsto do fim do mês dividido pelos dias que faltam (hoje incluído).', m: [['num', 'Número']],
   f() {
    const fim = fimMes(mesAtual()), p = cashBalanceAt(fim), n = diasRestantes();
    if (!(p > 0)) return { v: R(0), cl: 'bad', s: `O saldo previsto para ${dm(fim)} é ${R(p)}` };
    return { v: R(p / n), cl: 'ok', s: `por dia, por ${n} ${n === 1 ? 'dia' : 'dias'} até ${dm(fim)}` };
   },
   ex: () => ({ v: 'R$ 146,52', cl: 'ok', s: 'por dia, por 20 dias até 30/11' }) },
  saldodia: { a: 'mais', n: 'Saldo dia a dia', d: 'Como o saldo anda do começo ao fim do mês, com o que já está lançado.', m: [['linha', 'Linha']],
   f() {
    const k = mesAtual(), fim = fimMes(k), pts = [], labs = []; let d = k + '-01';
    while (d <= fim) { pts.push(cashBalanceAt(d)); labs.push(dm(d) + (d > TD ? ' (previsto)' : '')); d = addDaysISO(d, 1); }
    const h = cashBalanceAt(TD);
    return { v: R(h), cl: sinal(h), s: `hoje · fim do mês ${R(pts[pts.length - 1])}`, pts, ini: '01/' + k.slice(5, 7), fim: dm(fim) };
   },
   ex: () => ({ v: 'R$ 4.280,50', cl: 'ok', s: 'hoje · fim do mês R$ 2.930,40', pts: [1200, 6200, 5900, 5100, 4900, 4600, 4280, 3900, 3600, 3300, 2930], ini: '01/11', fim: '30/11' }) },

  /* ===== Dashboard ===== */
  resumo: { a: 'res', n: 'Resumo do mês', d: 'Receitas, despesas e o que sobrou, lado a lado.', m: [['tres', 'Três números']],
   f() { const s = dashStats(mesAtual()); return { tres: [['Receitas', R(s.rec), 'ok'], ['Despesas', R(s.exp), 'bad'], ['Sobra', R(s.balance), sinal(s.balance)]] }; },
   ex: () => ({ tres: [['Receitas', 'R$ 5.000,00', 'ok'], ['Despesas', 'R$ 3.650,00', 'bad'], ['Sobra', 'R$ 1.350,00', 'ok']] }) },
  patot: { a: 'res', n: 'Patrimônio total', d: 'O saldo das contas somado ao que está investido.', m: [['num', 'Número'], ['rosca', 'Rosca']],
   f(v) {
    const c = cashBalanceAt(TD), i = ivTotal(), t = c + i;
    if (v === 'rosca') return { p: [['Contas', Math.max(0, c), '#5b8def'], ['Investimentos', i, '#38a889']], centro: RS(t), centroS: 'no total' };
    return { v: R(t), cl: sinal(t), dois: [['Contas', R(c)], ['Investido', R(i)]] };
   },
   ex: v => ({ v: 'R$ 36.730,50', cl: 'ok', dois: [['Contas', 'R$ 4.280,50'], ['Investido', 'R$ 32.450,00']], p: [['Contas', 4280, '#5b8def'], ['Investimentos', 32450, '#38a889']], centro: 'R$ 37 mil', centroS: 'no total' }) },
  contas: { a: 'res', n: 'Saldo por conta', d: 'O saldo de hoje de cada conta cadastrada.', m: [['lista', 'Lista'], ['rank', 'Ranking']],
   f(v) {
    /* sem contas cadastradas, o app usa uma conta só: mostra o saldo dela */
    const A = mfAccs(), L = A.length ? A.map(a => [String(a.n || 'Conta'), mfAccBal(a.id, TD)]) : [['Conta principal', cashBalanceAt(TD)]];
    if (v === 'rank') return { r: L.slice().sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, x]) => [n, Math.max(0, x), R(x)]) };
    return { li: L.slice(0, 5).map(([n, x]) => ['', E(n), `<span class="${x < 0 ? 'bad' : ''}">${R(x)}</span>`]) };
   },
   ex: v => ({ li: [['', 'Conta principal', 'R$ 3.120,50'], ['', 'Reserva', 'R$ 1.000,00'], ['', 'Carteira', 'R$ 160,00']], r: [['Conta principal', 3120, 'R$ 3.120,50'], ['Reserva', 1000, 'R$ 1.000,00'], ['Carteira', 160, 'R$ 160,00']] }) },
  avisos: { a: 'res', n: 'Avisos', d: 'Os avisos de agora: fatura, contas, saldo e gastos.', m: [['l3', 'Lista de 3'], ['l5', 'Lista de 5']],
   f(v) {
    const L = (typeof mfAlerts === 'function' ? mfAlerts() : []).slice(0, v === 'l5' ? 5 : 3);
    return { li: L.map(a => [`<b class="mf-wg-dot ${E(a.lv || '')}"></b>`, E(a.t), `<span class="${a.lv === 'bad' ? 'bad' : a.lv === 'ok' ? 'ok' : ''}">${E(a.v)}</span>`]), vazio: 'Nenhum aviso agora.' };
   },
   ex: v => ({ li: [['<b class="mf-wg-dot bad"></b>', 'Fatura vence em 3 dias', '<span class="bad">R$ 1.240,90</span>'], ['<b class="mf-wg-dot wa"></b>', 'Próxima conta: Internet', 'R$ 99,90'], ['<b class="mf-wg-dot ok"></b>', 'Saldo previsto no fim do mês', '<span class="ok">R$ 2.930,40</span>'], ['<b class="mf-wg-dot"></b>', 'Gastos do mês até agora', 'R$ 2.140,00'], ['<b class="mf-wg-dot ok"></b>', 'Proventos do mês', '<span class="ok">R$ 186,40</span>']].slice(0, v === 'l5' ? 5 : 3) }) },
  sobra6: { a: 'res', n: 'Sobra dos últimos 6 meses', d: 'Quanto sobrou (receitas menos despesas) em cada mês.', m: [['barras', 'Barras'], ['linha', 'Linha']],
   f(v) {
    const k = mesAtual(), M = []; for (let i = 5; i >= 0; i--) { const m = mesMais(k, -i); M.push([m, dashStats(m).balance]); }
    const tot = M.reduce((s, x) => s + x[1], 0);
    if (v === 'linha') return { v: R(tot), cl: sinal(tot), s: 'somando os 6 meses', pts: M.map(x => x[1]), labs: M.map(x => nomeMes(x[0])), ini: mes3(M[0][0]), fim: mes3(k) };
    return { topo: R(tot), cl: sinal(tot), s: 'somando os 6 meses', b: M.map(([m, x]) => [mes3(m), Math.abs(x), x >= 0 ? 'var(--ok,#34c759)' : 'var(--bad,#ff453a)']) };
   },
   ex: v => ({ v: 'R$ 4.950,00', topo: 'R$ 4.950,00', cl: 'ok', s: 'somando os 6 meses', b: [['jun', 900, 'var(--ok,#34c759)'], ['jul', 500, 'var(--ok,#34c759)'], ['ago', 1100, 'var(--ok,#34c759)'], ['set', 300, 'var(--ok,#34c759)'], ['out', 800, 'var(--ok,#34c759)'], ['nov', 1350, 'var(--ok,#34c759)']], pts: [900, 500, 1100, 300, 800, 1350], ini: 'jun', fim: 'nov' }) },
  renda: { a: 'res', n: 'Renda já gasta', d: 'Quanto das receitas do mês já foi para as despesas.', m: [['prog', 'Barra'], ['anel', 'Anel'], ['num', 'Número']],
   f(v) {
    const s = dashStats(mesAtual());
    if (!(s.rec > 0)) return { v: '—', pc: 0, s: 'Sem receitas neste mês' };
    const p = s.exp / s.rec * 100, cl = p > 100 ? 'bad' : p > 80 ? '' : 'ok';
    return { v: pct(Math.round(p)), pc: p, cl, s: `${R(s.exp)} de ${R(s.rec)}` };
   },
   ex: () => ({ v: '73%', pc: 73, cl: 'ok', s: 'R$ 3.650,00 de R$ 5.000,00' }) },

  /* ===== Investimentos ===== */
  ativos: { a: 'inv', n: 'Melhores e piores ativos', d: 'Quanto cada ativo rende sobre o que você pagou nele.', m: [['lista', 'Lista'], ['rank', 'Ranking']],
   f(v) {
    const L = ivAtivos().map(a => { const c = +ivCost(a) || 0, n = +ivNow(a) || 0; return [String(a.a || '').toUpperCase(), c > 0 ? (n - c) / c * 100 : 0, n - c]; }).filter(x => x[0]).sort((a, b) => b[1] - a[1]);
    if (!L.length) return { vazio: 'Nenhum investimento ainda.' };
    const S5 = L.length > 5 ? L.slice(0, 3).concat(L.slice(-2)) : L;
    if (v === 'rank') return { r: S5.map(([n, p]) => [n, Math.abs(p), pctS(p)]) };
    return { li: S5.map(([n, p, x]) => [`<span class="${p >= 0 ? 'ok' : 'bad'}">${pctS(p)}</span>`, E(n), `<span class="${x >= 0 ? 'ok' : 'bad'}">${sinalR(x)}</span>`]) };
   },
   ex: v => ({ li: [['<span class="ok">+18,2%</span>', 'ITSA4', '<span class="ok">+R$ 954,00</span>'], ['<span class="ok">+9,4%</span>', 'HGLG11', '<span class="ok">+R$ 223,40</span>'], ['<span class="ok">+3,1%</span>', 'MXRF11', '<span class="ok">+R$ 144,20</span>'], ['<span class="bad">−4,6%</span>', 'BBAS3', '<span class="bad">−R$ 188,00</span>']], r: [['ITSA4', 18.2, '+18,2%'], ['HGLG11', 9.4, '+9,4%'], ['MXRF11', 3.1, '+3,1%'], ['BBAS3', 4.6, '−4,6%']] }) },
  provano: { a: 'inv', n: 'Proventos no ano', d: 'Dividendos e rendimentos recebidos neste ano, mês a mês.', m: [['barras', 'Barras'], ['num', 'Número']],
   f(v) {
    const y = TD.slice(0, 4), A = provsAte().filter(t => t.d.slice(0, 4) === y), tot = A.reduce((s, t) => s + (+t.v || 0), 0);
    if (v === 'num') return { v: R(tot), cl: 'ok', s: `em ${y} · média de ${R(tot / Math.max(1, +TD.slice(5, 7)))} por mês` };
    const por = {}; A.forEach(t => { const m = t.d.slice(0, 7); por[m] = (por[m] || 0) + (+t.v || 0); });
    const b = []; for (let m = 1; m <= 12; m++) { const k = y + '-' + String(m).padStart(2, '0'); b.push([MES3[m - 1].slice(0, 1).toUpperCase(), por[k] || 0, 0, null, nomeMes(k) + ' ' + y]); }
    return { topo: R(tot), cl: 'ok', s: 'recebidos em ' + y, b };
   },
   ex: v => ({ v: 'R$ 1.650,10', topo: 'R$ 1.650,10', cl: 'ok', s: v === 'num' ? 'em 2026 · média de R$ 150,01 por mês' : 'recebidos em 2026', b: [['J', 98], ['F', 132], ['M', 140], ['A', 101], ['M', 155], ['J', 149], ['J', 162], ['A', 158], ['S', 170], ['O', 172], ['N', 186], ['D', 0]] }) },
  yoc: { a: 'inv', n: 'Rendimento da carteira', d: 'Os proventos dos últimos 12 meses sobre o valor da carteira hoje.', m: [['num', 'Número'], ['anel', 'Anel']],
   f(v) {
    const b = mfPvBase();
    if (!(b.now > 0)) return { v: '—', pc: 0, s: 'Nenhum investimento ainda' };
    const p = b.y * 100;
    return { v: pct(p), pc: Math.min(100, p * 5), cl: 'ok', s: `${R(b.div12)} em 12 meses · ${R(b.m)} por mês` };
   },
   ex: () => ({ v: '5,6%', pc: 28, cl: 'ok', s: 'R$ 1.818,20 em 12 meses · R$ 151,52 por mês' }) },
  magico: { a: 'inv', n: 'Número mágico por ativo', d: 'Quantas cotas faltam para cada ativo pagar uma cota nova por mês só com os proventos.', m: [['rank', 'Barras'], ['lista', 'Lista']],
   f(v) {
    const L = (typeof mfMagicoRows === 'function' ? mfMagicoRows() : []).sort((a, b) => b.q / b.mg - a.q / a.mg).slice(0, 5);
    if (!L.length) return { vazio: 'Quando seus ativos pagarem proventos, o número mágico de cada um aparece aqui.' };
    if (v === 'lista') return { li: L.map(x => [E(x.tk), `${x.q.toLocaleString('pt-BR')} de ${x.mg.toLocaleString('pt-BR')}`, x.q >= x.mg ? '<span class="ok">chegou!</span>' : `faltam ${(x.mg - x.q).toLocaleString('pt-BR')}`]) };
    return { r: L.map(x => [x.tk, Math.min(100, x.q / x.mg * 100), `${x.q.toLocaleString('pt-BR')}/${x.mg.toLocaleString('pt-BR')}`]), max: 100 };
   },
   ex: v => ({ r: [['MXRF11', 82, '410/500'], ['HGLG11', 46, '23/50'], ['ITSA4', 21, '180/850']], max: 100, li: [['MXRF11', '410 de 500', 'faltam 90'], ['HGLG11', '23 de 50', 'faltam 27'], ['ITSA4', '180 de 850', 'faltam 670']] }) },
  pm: { a: 'inv', n: 'Preço médio x cotação', d: 'O preço médio que você pagou e a cotação de hoje de cada ativo.', m: [['lista', 'Lista']],
   f() {
    const L = mfHeld().map(x => { const pmv = (+ivCost(x.a) || 0) / (x.q || 1); return [x.tk, pmv, x.p]; }).filter(x => x[1] > 0 && x[2] > 0).sort((a, b) => (b[2] / b[1]) - (a[2] / a[1])).slice(0, 5);
    return { li: L.map(([tk, pmv, px]) => { const d = (px - pmv) / pmv * 100; return [E(tk), `PM ${R(pmv)} · hoje ${R(px)}`, `<span class="${d >= 0 ? 'ok' : 'bad'}">${pctS(d)}</span>`]; }), vazio: 'Nenhum ativo com preço médio ainda.' };
   },
   ex: () => ({ li: [['ITSA4', 'PM R$ 8,90 · hoje R$ 10,52', '<span class="ok">+18,2%</span>'], ['MXRF11', 'PM R$ 9,80 · hoje R$ 10,10', '<span class="ok">+3,1%</span>'], ['BBAS3', 'PM R$ 27,30 · hoje R$ 26,04', '<span class="bad">−4,6%</span>']] }) },
  graham: { a: 'inv', n: 'Graham: margem por ativo', d: 'O preço justo de Graham (√(22,5 × LPA × VPA)) e a margem sobre a cotação, das ações com dados.', m: [['lista', 'Lista']],
   f() {
    const L = mfHeld().filter(x => x.cls !== 'fii').map(x => mfGraham(x.tk)).filter(g => g && g.ok).sort((a, b) => b.margem - a.margem).slice(0, 5);
    return { li: L.map(g => [E(g.tk), `justo ${R(g.justo)}`, `<span class="${g.margem >= 0 ? 'ok' : 'bad'}">${pctS(g.margem)}</span>`]), vazio: 'Sem LPA e VPA ainda. Veja em Investimentos › Análise.' };
   },
   ex: () => ({ li: [['BBAS3', 'justo R$ 41,20', '<span class="ok">+36,8%</span>'], ['ITSA4', 'justo R$ 14,70', '<span class="ok">+28,4%</span>'], ['BBSE3', 'justo R$ 30,10', '<span class="bad">−9,2%</span>']] }) },
  bazin: { a: 'inv', n: 'Bazin: preço-teto por ativo', d: 'O preço-teto de Bazin pelos proventos que cada ativo pagou e a margem sobre a cotação.', m: [['lista', 'Lista']],
   f() {
    const L = mfHeld().map(x => mfBazin(x.tk)).filter(b => b && b.ok).sort((a, b) => b.margem - a.margem).slice(0, 5);
    return { li: L.map(b => [E(b.tk), `teto ${R(b.teto)}`, `<span class="${b.margem >= 0 ? 'ok' : 'bad'}">${pctS(b.margem)}</span>`]), vazio: 'Sem proventos de mercado ainda. Veja em Investimentos › Análise.' };
   },
   ex: () => ({ li: [['MXRF11', 'teto R$ 11,80', '<span class="ok">+14,4%</span>'], ['ITSA4', 'teto R$ 10,83', '<span class="ok">+2,9%</span>'], ['BBAS3', 'teto R$ 24,50', '<span class="bad">−6,3%</span>']] }) },
  conc: { a: 'inv', n: 'Concentração da carteira', d: 'O ativo com a maior fatia da carteira, comparado ao teto por ativo.', m: [['prog', 'Barra'], ['num', 'Número']],
   f() {
    const tot = ivTotal(), L = ivAtivos().map(a => [String(a.a || '').toUpperCase(), +ivNow(a) || 0]).sort((a, b) => b[1] - a[1]);
    if (!(tot > 0) || !L.length) return { v: '—', pc: 0, s: 'Nenhum investimento ainda' };
    const p = L[0][1] / tot * 100, cap = mfCap();
    return { v: pct(p), pc: p, cl: p > cap ? 'bad' : 'ok', s: `${E(L[0][0])} · ${p > cap ? 'acima' : 'dentro'} do teto de ${cap}% por ativo` };
   },
   ex: () => ({ v: '19,1%', pc: 19, cl: 'bad', s: 'ITSA4 · acima do teto de 15% por ativo' }) },

  /* ===== Análises ===== */
  ano12: { a: 'anal', n: 'Gastos nos últimos 12 meses', d: 'Quanto você gastou em cada um dos últimos 12 meses.', m: [['barras', 'Barras'], ['linha', 'Linha']],
   f(v) {
    const k = mesAtual(), M = []; for (let i = 11; i >= 0; i--) { const m = mesMais(k, -i); M.push([m, dashStats(m).exp]); }
    const tot = M.reduce((s, x) => s + x[1], 0);
    if (v === 'linha') return { v: R(tot), s: 'nos últimos 12 meses', pts: M.map(x => x[1]), labs: M.map(x => nomeMes(x[0]) + ' ' + x[0].slice(0, 4)), ini: mes3(M[0][0]), fim: mes3(k) };
    return { topo: R(tot), s: 'nos últimos 12 meses', b: M.map(([m, x]) => [mes3(m).slice(0, 1).toUpperCase(), x, 0, null, nomeMes(m) + ' ' + m.slice(0, 4)]) };
   },
   ex: v => ({ v: 'R$ 51.300,00', topo: 'R$ 51.300,00', s: 'nos últimos 12 meses', b: [['D', 5200], ['J', 4100], ['F', 3900], ['M', 4300], ['A', 4000], ['M', 4200], ['J', 4100], ['J', 4700], ['A', 3900], ['S', 5100], ['O', 4300], ['N', 3650]], pts: [5200, 4100, 3900, 4300, 4000, 4200, 4100, 4700, 3900, 5100, 4300, 3650], ini: 'dez', fim: 'nov' }) },
  recdesp: { a: 'anal', n: 'Receitas x despesas no ano', d: 'Entradas e saídas de cada mês deste ano.', m: [['barras', 'Barras'], ['tres', 'Três números']],
   f(v) {
    const y = TD.slice(0, 4), cur = +TD.slice(5, 7), M = []; for (let m = 1; m <= cur; m++) { const k = y + '-' + String(m).padStart(2, '0'), s = dashStats(k); M.push([k, s.rec, s.exp]); }
    const r = M.reduce((s, x) => s + x[1], 0), e = M.reduce((s, x) => s + x[2], 0);
    if (v === 'tres') return { tres: [['Receitas', R(r), 'ok'], ['Despesas', R(e), 'bad'], ['Sobra', R(r - e), sinal(r - e)]], s: 'em ' + y };
    return { b: M.map(([k, a, b]) => [mes3(k).slice(0, 1).toUpperCase(), a, 'var(--ok,#34c759)', b, nomeMes(k) + ' ' + y]), par: 1, leg: '<span><i class="ok"></i>Receitas</span><span><i class="bad"></i>Despesas</span>' };
   },
   ex: v => ({ tres: [['Receitas', 'R$ 55.400', 'ok'], ['Despesas', 'R$ 47.150', 'bad'], ['Sobra', 'R$ 8.250', 'ok']], s: 'em 2026', b: [['J', 5000, 0, 4100], ['F', 5000, 0, 3900], ['M', 5000, 0, 4300], ['A', 5000, 0, 4000], ['M', 5200, 0, 4200], ['J', 5000, 0, 4100], ['J', 5200, 0, 4700], ['A', 5000, 0, 3900], ['S', 5400, 0, 5100], ['O', 5000, 0, 4300], ['N', 5100, 0, 3650]], par: 1, leg: '<span><i class="ok"></i>Receitas</span><span><i class="bad"></i>Despesas</span>' }) },
  mediam: { a: 'anal', n: 'Média mensal de gastos', d: 'A média dos gastos dos últimos 12 meses fechados, e este mês ao lado.', m: [['num', 'Número']],
   f() {
    const k = mesAtual(), L = []; for (let i = 12; i >= 1; i--) { const e = dashStats(mesMais(k, -i)).exp; if (e > 0) L.push(e); }
    const md = L.length ? L.reduce((s, x) => s + x, 0) / L.length : 0, a = dashStats(k).exp;
    if (!L.length) return { v: R(0), s: 'Sem meses anteriores com gastos' };
    return { v: R(md), s: `${L.length} ${L.length === 1 ? 'mês' : 'meses'} com gastos`, dois: [[nomeMes(k), R(a)], ['Diferença', (a - md >= 0 ? '+' : '−') + R(Math.abs(a - md))]] };
   },
   ex: () => ({ v: 'R$ 4.275,00', s: '12 meses com gastos', dois: [['Novembro', 'R$ 3.650,00'], ['Diferença', '−R$ 625,00']] }) },
  melhor: { a: 'anal', n: 'Melhor e pior mês', d: 'Os meses deste ano em que mais e menos sobrou.', m: [['tres', 'Lado a lado'], ['lista', 'Lista']],
   f(v) {
    const y = TD.slice(0, 4), cur = +TD.slice(5, 7), M = []; for (let m = 1; m <= cur; m++) { const k = y + '-' + String(m).padStart(2, '0'), s = dashStats(k); if (s.rec > 0 || s.exp > 0) M.push([k, s.balance]); }
    if (!M.length) return { vazio: 'Sem lançamentos neste ano.', tres: [] };
    const o = M.slice().sort((a, b) => b[1] - a[1]), b = o[0], w = o[o.length - 1];
    if (v === 'lista') return { li: o.slice(0, 5).map(([k, x]) => [mes3(k), nomeMes(k), `<span class="${x >= 0 ? 'ok' : 'bad'}">${sinalR(x)}</span>`]) };
    return { tres: [['Melhor · ' + mes3(b[0]), sinalR(b[1]), sinal(b[1])], ['Pior · ' + mes3(w[0]), sinalR(w[1]), sinal(w[1])]] };
   },
   ex: v => ({ tres: [['Melhor · nov', '+R$ 1.450,00', 'ok'], ['Pior · set', '+R$ 300,00', 'ok']], li: [['nov', 'Novembro', '<span class="ok">+R$ 1.450,00</span>'], ['ago', 'Agosto', '<span class="ok">+R$ 1.100,00</span>'], ['jun', 'Junho', '<span class="ok">+R$ 900,00</span>']] }) },
  catano: { a: 'anal', n: 'Categorias do ano', d: 'Onde foi o dinheiro neste ano, somando todos os meses.', m: [['rank', 'Ranking'], ['rosca', 'Rosca']],
   f(v) {
    const y = TD.slice(0, 4), cur = +TD.slice(5, 7), G = {}; for (let m = 1; m <= cur; m++) { const c = dashStats(y + '-' + String(m).padStart(2, '0')).cats || {}; Object.keys(c).forEach(n => { G[n] = (G[n] || 0) + c[n]; }); }
    const P = Object.keys(G).filter(n => G[n] > 0).sort((a, b) => G[b] - G[a]).map(n => [n, G[n]]), tot = P.reduce((s, x) => s + x[1], 0);
    if (!P.length) return { vazio: 'Sem gastos neste ano.' };
    if (v === 'rosca') return { p: top5(P), centro: RS(tot), centroS: 'em ' + y };
    return { r: P.slice(0, 5).map(([n, x]) => [n, x, R(x)]) };
   },
   ex: v => ({ r: [['Moradia', 13200, 'R$ 13.200,00'], ['Alimentação', 9460, 'R$ 9.460,00'], ['Transporte', 4620, 'R$ 4.620,00'], ['Lazer', 3410, 'R$ 3.410,00'], ['Saúde', 1980, 'R$ 1.980,00']], p: [['Moradia', 13200], ['Alimentação', 9460], ['Transporte', 4620], ['Lazer', 3410], ['Outras', 2860, '#7c8796']], centro: 'R$ 34 mil', centroS: 'em 2026' }) },
  cresceu: { a: 'anal', n: 'Categoria que mais cresceu', d: 'A categoria com o maior aumento de gasto em relação ao mês passado (até o mesmo dia).', m: [['num', 'Número'], ['l3', 'Top 3']],
   f(v) {
    const k = mesAtual(), a = dashStats(k, true).cats || {}, ant = mesMais(k, -1), dia = Math.min(+TD.slice(8, 10), +fimMes(ant).slice(8, 10)), b = {};
    mfSpendRows(ant).filter(t => +String(t.d).slice(8, 10) <= dia && !mfIsFatLanc(t)).forEach(t => { b[t.c] = (b[t.c] || 0) + (+t.v || 0); });
    const L = Object.keys(a).map(c => [c, (a[c] || 0) - (b[c] || 0), a[c] || 0, b[c] || 0]).filter(x => x[1] > 0.005).sort((x, y) => y[1] - x[1]);
    if (!L.length) return { v: '—', s: `Nenhuma categoria gastou mais que em ${mes3(ant)}`, vazio: `Nenhuma categoria gastou mais que em ${mes3(ant)}.` };
    if (v === 'l3') return { li: L.slice(0, 3).map(([c, d]) => ['', E(c), `<span class="bad">+${R(d)}</span>`]) };
    return { v: E(L[0][0]), s: `+${R(L[0][1])} que em ${mes3(ant)} (${R(L[0][3])} → ${R(L[0][2])})` };
   },
   ex: v => ({ v: 'Lazer', s: '+R$ 140,00 que em out (R$ 170,00 → R$ 310,00)', li: [['', 'Lazer', '<span class="bad">+R$ 140,00</span>'], ['', 'Saúde', '<span class="bad">+R$ 62,00</span>'], ['', 'Transporte', '<span class="bad">+R$ 18,40</span>']] }) },
  vsano: { a: 'anal', n: 'Este ano x ano passado', d: 'Gastos deste ano até agora, comparados ao mesmo período do ano passado.', m: [['barras', 'Barras'], ['num', 'Número']],
   f(v) {
    const y = +TD.slice(0, 4), cur = +TD.slice(5, 7), soma = a => { let s = 0; for (let m = 1; m <= cur; m++) s += dashStats(a + '-' + String(m).padStart(2, '0')).exp; return s; }, a = soma(y), b = soma(y - 1), d = b ? (a - b) / b * 100 : 0;
    const s = b ? `${pctS(d)} que em ${y - 1} (jan a ${mes3(mesAtual())})` : `Sem gastos em ${y - 1} no mesmo período`;
    if (v === 'num') return { v: R(a), cl: d > 0 ? 'bad' : 'ok', s };
    return { topo: R(a), cl: d > 0 ? 'bad' : 'ok', s, b: [[String(y - 1), b, 'var(--mu)'], [String(y), a, d > 0 ? 'var(--bad,#ff453a)' : 'var(--ok,#34c759)']] };
   },
   ex: () => ({ v: 'R$ 47.150,00', topo: 'R$ 47.150,00', cl: 'ok', s: '−6,2% que em 2025 (jan a nov)', b: [['2025', 50260, 'var(--mu)'], ['2026', 47150, 'var(--ok,#34c759)']] }) },
  ecoano: { a: 'anal', n: 'Economia acumulada no ano', d: 'O que sobrou somando mês a mês, desde janeiro.', m: [['linha', 'Linha'], ['num', 'Número']],
   f(v) {
    const y = TD.slice(0, 4), cur = +TD.slice(5, 7), pts = []; let s = 0;
    const labs = []; for (let m = 1; m <= cur; m++) { s += dashStats(y + '-' + String(m).padStart(2, '0')).balance; pts.push(s); labs.push(nomeMes(y + '-' + String(m).padStart(2, '0'))); }
    if (v === 'num' || pts.length < 2) return { v: R(s), cl: sinal(s), s: `de janeiro a ${nomeMes(mesAtual()).toLowerCase()}` };
    return { v: R(s), cl: sinal(s), s: 'acumulado no ano', pts, labs, ini: 'jan', fim: mes3(mesAtual()) };
   },
   ex: v => ({ v: 'R$ 8.250,00', cl: 'ok', s: v === 'num' ? 'de janeiro a novembro' : 'acumulado no ano', pts: [900, 2000, 2700, 3700, 4700, 5600, 6100, 7200, 7500, 8300, 8250], ini: 'jan', fim: 'nov' }) },
  dsem: { a: 'anal', n: 'Gasto por dia da semana', d: 'Em que dias da semana você mais gasta, nos últimos 90 dias.', m: [['barras', 'Barras'], ['num', 'Maior dia']],
   f(v) {
    const L = gastosEntre(addDaysISO(TD, -89), TD), G = [0, 0, 0, 0, 0, 0, 0]; L.forEach(t => { G[new Date(String(t.d).slice(0, 10) + 'T12:00:00').getDay()] += +t.v || 0; });
    const i = G.indexOf(Math.max(...G)), ord = [1, 2, 3, 4, 5, 6, 0];
    if (!L.length) return { v: '—', s: 'Sem gastos nos últimos 90 dias', b: [] };
    if (v === 'num') return { v: SEM[i], s: `${R(G[i])} nos últimos 90 dias` };
    return { topo: SEM[i], s: 'o dia em que você mais gasta', b: ord.map(d => [SEM[d], G[d]]) };
   },
   ex: v => ({ v: 'sáb', topo: 'sáb', s: v === 'num' ? 'R$ 2.340,00 nos últimos 90 dias' : 'o dia em que você mais gasta', b: [['seg', 1120], ['ter', 980], ['qua', 1050], ['qui', 890], ['sex', 1680], ['sáb', 2340], ['dom', 1420]] }) }
 };

 /* ---------- montagem ---------- */
 /* 1.18: tamanhos x (Mini), p, m, g. Mini só vale nos modelos com um número principal; nos outros vira Pequeno. */
 const szOk = s => (s === 'x' || s === 'p' || s === 'g' ? s : 'm');
 const vOk = (k, v) => { const w = MF_WG[k]; return w && w.m.some(x => x[0] === v) ? v : (w ? w.m[0][0] : 'num'); };
 const miniOk = (k, v) => MINI_OK.includes(TIPO[vOk(k, v)]);
 const szDe = (k, sz, v) => { if (MF_WG[k] && MF_WG[k].raw) return 'g'; /* 2.9: blocos com tela própria (Simular gastos diário) ocupam a largura toda */ sz = szOk(sz); return sz === 'x' && !miniOk(k, v) ? 'p' : sz; };
 /* largura do bloco na grade de cada tamanho: Mini = meia (computador: um terço), Pequeno = meia, Grande = inteira, Médio = padrão */
 const largura = sz => (sz === 'x' ? (window.mfIsDesk && mfIsDesk() ? 't' : 'h') : sz === 'p' ? 'h' : sz === 'g' ? 'f' : '');
 function desenha(k, v, dados, sz) { const DD = window.mfIsDesk && mfIsDesk() ? D1 : D; /* 3.6: desenhos novos só no celular */ if (sz === 'x') return DD.mini(dados || {}); const t = TIPO[v] || 'num'; return DD[t](dados || {}); }
 function corpo(k, v, sz) {
  const w = MF_WG[k];
  if (!w) return '<small class="mf-wg-s">Bloco indisponível.</small>';
  v = vOk(k, v);
  if (w.raw) { try { return w.raw(); } catch (e) { console.warn('Widget', k, e); return '<small class="mf-wg-s">Não foi possível abrir agora.</small>'; } }
  try { return desenha(k, v, w.f(v), szDe(k, sz, v)); } catch (e) { console.warn('Widget', k, e); return '<small class="mf-wg-s">Não foi possível calcular agora.</small>'; }
 }
 function exemplo(k, v, sz) { const w = MF_WG[k]; if (!w) return ''; v = vOk(k, v); try { return desenha(k, v, w.ex(v), szDe(k, sz, v)); } catch (e) { return ''; } }
 /* o bloco inteiro (usado na tela, na prévia da galeria e no editor) */
 function secao(k, sz, v, html, extra) { const z = szDe(k, sz, v); return `<section class="c mf-wg ${z === 'x' ? 'mf-wg-mini' : 'mf-wg-' + z}${extra ? ' ' + extra : ''}" data-wg="${k}" data-wgv="${vOk(k, v)}"><h2>${E(MF_WG[k].n)}</h2>${html}</section>`; }
 function lista(t) { const a = (((S.lay || {}).wg) || {})[t]; return Array.isArray(a) ? a.filter(x => x && MF_WG[x.k] && /^p_wg~\d+$/.test(x.id)) : []; }
 /* 1.18: cada bloco mora numa subaba (campo s); sem s = a primeira (Lançamentos › Início, Planejamento › Cartão, Patrimônio › Resumo, Análises › Mês; em Patrimônio, 'inv' = Investimentos inteiro) */
 const PRIM = { add: 'inicio', mais: 'contas', inv: 'resumo', anal: 'mes' };
 /* 3.20 · celular: cada página de Investimentos (Posição, Proventos, Análises, Radar, Metas) é uma subaba própria; o bloco só aparece na página onde foi colocado
    (antes todas respondiam 'inv' e o bloco aparecia em todas). Blocos antigos (s vazio, 'resumo', 'inv' ou 'bens') ficam na primeira página. No computador nada muda. */
 const celInv = () => !(window.mfIsDesk && mfIsDesk());
 function subDe(t, x) {
  const s = x.s || PRIM[t];
  if (t === 'inv' && celInv() && (s === 'resumo' || s === 'inv' || s === 'bens')) return window.mfInvModeOf ? mfInvModeOf('resumo') : 'pos';
  return s;
 }
 function subAtual(t) {
  if (t === 'add') return window.mfAddMode ? mfAddMode() : 'inicio';
  if (t === 'mais') return window.mfCtMode ? mfCtMode() : 'contas';
  if (t === 'inv') return celInv() && window.mfInvMode ? mfInvMode() : (window.mfInvTop ? mfInvTop() : 'resumo');
  if (t === 'anal') return window.__anMode === 'ano' ? 'ano' : 'mes';
  return '';
 }
 const naSub = (t, x) => window.__mfAllModes || !PRIM[t] || subDe(t, x) === subAtual(t);
 function html(t) { return lista(t).filter(x => naSub(t, x)).map(x => `<!--b:${x.id}-->${secao(x.k, x.sz, x.v, corpo(x.k, x.v, x.sz))}`).join(''); }
 function injeta(t, h) {
  if (!MF_WG_TABS.includes(t)) return h;
  const w = html(t); if (!w) return h;
  return t === 'mais' && /<\/div>\s*$/.test(h) ? h.replace(/<\/div>\s*$/, w + '</div>') : h + w;
 }
 const original = withMoved;
 withMoved = function (t, h) { return original(t, injeta(t, h)); };
 /* o app desenha a primeira tela antes deste arquivo carregar; quem tem widgets ganha um redesenho quando a página termina de carregar */
 document.addEventListener('DOMContentLoaded', () => {
  try { if (MF_WG_TABS.some(t => lista(t).length) && typeof draw === 'function') draw(); } catch (e) { console.warn('Widgets: redesenho inicial', e); }
 });

 /* usado pela galeria do "+" (js/83) e pela prévia de estilo (js/96) */
 /* 2.9: "Simular gastos diário" (antes subaba Diário de Lançamentos) fica disponível em qualquer tela pelo "+ Adicionar blocos". Só simula: não grava lançamento nem saldo. */
 MF_WG_TABS.forEach(a => { MF_WG['dsim_' + a] = { a, n: 'Simular gastos diário', d: 'Veja quanto sobra gastando um valor fixo por dia, até a data que você escolher.', m: [['num', 'Simulador']], raw: () => (window.mfDiarioSimMiolo ? mfDiarioSimMiolo() : ''), f: () => ({}), ex: () => ({ v: 'R$ 30,00 por dia', s: 'até que dia o dinheiro dura' }) }; });
 /* ---------- 3.6 · animação ao entrar e toque nos gráficos ----------
   Animação: quando um bloco aparece (ou o dado dele muda) ele ganha a classe mf-wg-go: o CSS desenha a linha, sobe as barras, preenche a
   rosca e o JS conta os números até o valor. Um redesenho da tela com o mesmo dado NÃO anima de novo (nada pisca a cada toque); trocar de
   aba zera a lista de "já vistos" e a tela anima ao abrir. Sem animar com "Animações: Desligadas" ou "reduzir movimento".
   Toque: passar o dedo (ou o mouse) num gráfico mostra o valor do ponto. Não roda no modo Editar tela (ali arrastar move o bloco). */
 const semMov = () => document.documentElement.dataset.mfanim === '0' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
 const visto = new Map(); let abaVista = '';
 /* "R$ 1.234,56" / "+R$ 50,00" / "12,5%": acha o número, conta de 0 até ele mantendo o texto em volta e as casas decimais */
 function contar(el) {
  const txt = el.textContent, m = /(\d[\d.]*(?:,\d+)?)/.exec(txt); if (!m || !/R\$|%/.test(txt) || /\d\/\d/.test(txt)) return;
  const dec = m[1].includes(',') ? m[1].split(',')[1].length : 0, alvo = parseFloat(m[1].replace(/\./g, '').replace(',', '.')); if (!isFinite(alvo) || alvo === 0) return;
  const pre = txt.slice(0, m.index), pos = txt.slice(m.index + m[1].length), fmt = v => pre + v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + pos;
  /* o texto de verdade NUNCA muda (leitores de tela, cópia, testes): a contagem aparece num ::after (data-cuv) por cima, e o texto fica transparente até acabar */
  el.style.setProperty('--cuc', getComputedStyle(el).color); el.dataset.cuv = fmt(0); el.classList.add('mf-wg-cuing');
  const t0 = performance.now(), dur = 900;
  const passo = t => { if (!el.isConnected) return; const k = Math.min(1, (t - t0) / dur); if (k < 1) { el.dataset.cuv = fmt(alvo * (1 - Math.pow(1 - k, 3))); requestAnimationFrame(passo); } else { el.classList.remove('mf-wg-cuing'); delete el.dataset.cuv; } };
  requestAnimationFrame(passo);
 }
 function varre() {
  if (window.mfIsDesk && mfIsDesk()) return;   // computador: sem animação nem toque novos
  const tabA = document.documentElement.dataset.tab; if (tabA !== abaVista) { abaVista = tabA; visto.clear(); }
  const ocorr = {};
  document.querySelectorAll('.mf-wg:not([data-wgok])').forEach(sec => {
   sec.setAttribute('data-wgok', '1');
   let anima = true;
   if (sec.closest('#app')) {   // bloco da tela: anima só na primeira vez (ou quando o dado muda)
    const base = (sec.dataset.wg || '') + '|' + (sec.dataset.wgv || '') + '|' + ((/mf-wg-(mini|p|m|g)\b/.exec(sec.className) || [])[1] || ''), n = ocorr[base] = (ocorr[base] || 0) + 1, key = base + '|' + n;
    const sig = [...sec.querySelectorAll('[data-wg-sc]')].map(e => e.dataset.wgSc).join('') + sec.textContent;   // só o dado (outros scripts mexem em classes e botões do bloco)
    anima = visto.get(key) !== sig; visto.set(key, sig);
   }
   if (!anima || semMov()) return;
   sec.classList.add('mf-wg-go');
   sec.querySelectorAll('[data-cu]').forEach(contar);
  });
 }
 try { new MutationObserver(varre).observe(document.documentElement, { childList: true, subtree: true }); document.addEventListener('DOMContentLoaded', varre); } catch (e) { console.warn('Widgets: animação', e); }

 const vibra = () => { try { if (navigator.vibrate) navigator.vibrate(4); } catch (e) { } };
 const mfMoney = v => (typeof R === 'function' ? R(v) : String(v));
 let toque = null;   // { el, dado, tipo, ult }
 function lerDado(el) { if (!el.__wg) { try { el.__wg = JSON.parse(el.dataset.wgSc); } catch (e) { el.__wg = {}; } } return el.__wg; }
 function balao(el) { let t = el.querySelector(':scope > .mf-wg-tip'); if (!t) { t = document.createElement('div'); t.className = 'mf-wg-tip'; el.appendChild(t); } return t; }
 /* põe o balão em cima do ponto, sem sair da largura do gráfico nem do cartão */
 function poeBalao(el, t, px) {
  const w = el.clientWidth, tw = t.offsetWidth || 110, sec = el.closest('.mf-wg'), topo = sec ? el.getBoundingClientRect().top - sec.getBoundingClientRect().top : 40;
  t.style.left = Math.max(tw / 2, Math.min(w - tw / 2, px)) + 'px'; t.style.top = -Math.min(t.offsetHeight + 6, Math.max(6, topo - 4)) + 'px';
 }
 function mover(e) {
  const T = toque; if (!T) return; const el = T.el, d = lerDado(el), r = el.getBoundingClientRect(), x = Math.max(0, Math.min(r.width, e.clientX - r.left));
  let i = -1;
  if (T.tipo === 'l') {
   const P = d.p || []; if (P.length < 2) return; i = Math.round(x / r.width * (P.length - 1));
   const t = balao(el), pt = el.querySelector('.mf-wg-pt'), cur = el.querySelector('.mf-wg-cur') || el.appendChild(Object.assign(document.createElement('i'), { className: 'mf-wg-cur' }));
   const mn = Math.min(...P), mx = Math.max(...P), h = mx - mn || 1, px = i / (P.length - 1) * r.width;
   cur.style.left = px + 'px'; if (pt) { pt.style.left = px + 'px'; pt.style.top = ((36 - 3 - (P[i] - mn) / h * 30) / 36 * 100) + '%'; }
   const dl = i ? P[i] - P[i - 1] : 0, lb = d.l ? d.l[i] : (i === 0 ? d.a : i === P.length - 1 ? d.z : '');
   t.innerHTML = `${lb ? E(lb) : ''}<b>${mfMoney(P[i])}</b>${i ? `<u class="${dl >= 0 ? 'ok' : 'bad'}">${dl >= 0 ? '▲ +' : '▼ −'}${mfMoney(Math.abs(dl))}</u> vs. ponto anterior` : 'início do período'}`;
   poeBalao(el, t, px);
  } else if (T.tipo === 'b') {
   const sp = [...el.querySelectorAll(':scope > span')], L = d.b || []; if (!sp.length) return; i = Math.max(0, Math.min(sp.length - 1, Math.floor(x / r.width * sp.length)));
   sp.forEach((s, k) => s.classList.toggle('sel', k === i));
   const [nm, a, b, full] = L[i] || [], t = balao(el), lb = full || nm;
   t.innerHTML = d.par ? `${E(lb)}<b class="${a - b >= 0 ? 'ok' : 'bad'}">${a - b >= 0 ? '+' : '−'}${mfMoney(Math.abs(a - b))}</b>${d.nm[0]} ${mfMoney(a)}<br>${d.nm[1]} ${mfMoney(b)}` : `${E(lb)}<b>${mfMoney(a)}</b>`;
   const c = sp[i].getBoundingClientRect(); poeBalao(el, t, c.left - r.left + c.width / 2);
  } else if (T.tipo === 'd') {
   const P = d.p || []; let a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90; if (a < 0) a += 360;
   let acc = 0; i = P.length - 1; for (let k = 0; k < P.length; k++) { acc += P[k][3]; if (a / 3.6 < acc) { i = k; break; } }
   destacaRosca(el, i);
  }
  if (i !== T.ult) { T.ult = i; vibra(); }
 }
 function destacaRosca(el, i) {
  const d = lerDado(el), sec = el.closest('.mf-wg'), P = d.p || [], c = el.querySelector('span'), nova = i >= 0 && P[i];
  el.classList.toggle('on', !!nova); el.querySelectorAll('.mf-wg-seg').forEach((s, k) => s.classList.toggle('sel', k === i));
  if (sec) sec.querySelectorAll('.mf-wg-rl > span').forEach((r, k) => { r.style.opacity = nova && k !== i ? .45 : ''; });
  c.innerHTML = nova ? `<b>${typeof RS === 'function' ? RS(P[i][1]) : P[i][1]}</b><small>${E(P[i][0])}</small>` : `<b>${d.c[0]}</b><small>${d.c[1]}</small>`;
 }
 function fim() {
  const T = toque; if (!T) return; toque = null; const el = T.el;
  el.classList.remove('on');
  if (T.tipo === 'l') { const P = lerDado(el).p || [], pt = el.querySelector('.mf-wg-pt'); if (pt && P.length) { const mn = Math.min(...P), mx = Math.max(...P), h = mx - mn || 1; pt.style.left = '100%'; pt.style.top = ((36 - 3 - (P[P.length - 1] - mn) / h * 30) / 36 * 100) + '%'; } }
  if (T.tipo === 'b') el.querySelectorAll(':scope > span.sel').forEach(s => s.classList.remove('sel'));
  if (T.tipo === 'd') destacaRosca(el, -1);
 }
 document.addEventListener('pointerdown', e => {
  const el = e.target.closest && e.target.closest('.mf-wg-sc, .mf-wg-rl > span[data-wg-seg]'); if (!el || e.button) return;
  if (window.mfEdOn && mfEdOn()) return;
  if (el.matches('.mf-wg-rl > span')) {   // legenda da rosca: toque numa linha destaca a parte
   const ro = el.closest('.mf-wg').querySelector('.mf-wg-rc'); if (!ro) return; destacaRosca(ro, +el.dataset.wgSeg); vibra();
   const solta = () => { destacaRosca(ro, -1); ['pointerup', 'pointercancel'].forEach(t => document.removeEventListener(t, solta, true)); };
   ['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, solta, true)); return;
  }
  toque = { el, tipo: el.dataset.wgT, ult: -2 }; el.classList.add('on');
  try { el.setPointerCapture(e.pointerId); } catch (err) { }
  mover(e);
 }, true);
 document.addEventListener('pointermove', e => { if (toque) mover(e); }, true);
 ['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, fim, true));

 window.MF_WG = MF_WG;
 window.MF_WG_TABS = MF_WG_TABS;
 window.MF_WG_AREAS = MF_WG_AREAS;
 window.MF_WG_SZ = MF_WG_SZ;
 window.mfWgBody = corpo;
 window.mfWgExemplo = exemplo;
 window.mfWgSecao = secao;
 window.mfWgModelo = vOk;
 /* esta tela recebe blocos adicionados? (1.18: todas as subabas recebem; o bloco fica na subaba aberta) */
 window.mfWgAqui = t => MF_WG_TABS.includes(t);
 /* subaba em que um bloco novo vai morar (vazio = a primeira, como os blocos antigos) */
 window.mfWgSub = t => { const s = subAtual(t); return PRIM[t] && s !== PRIM[t] ? s : ''; };
 window.mfWgMiniOk = miniOk;
 window.mfWgSz = szDe;
 window.mfWgLarg = largura;
 window.mfWgList = lista;
 window.mfWgNovoId = function () {
  let n = 0; const W = (S.lay || {}).wg || {};
  Object.keys(W).forEach(t => (Array.isArray(W[t]) ? W[t] : []).forEach(x => { const m = /^p_wg~(\d+)$/.exec(x && x.id || ''); if (m) n = Math.max(n, +m[1]); }));
  return 'p_wg~' + (n + 1);
 };
})();
