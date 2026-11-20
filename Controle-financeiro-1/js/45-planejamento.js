/* ===== Nova organização · Planejamento: Dívidas | Situação | Simular (e Tetos por categoria em Cartão) =====
   Dívidas: o que a pessoa cadastra fica em S.debts (criado só quando ela cadastra a primeira; quem não usa não tem nada novo salvo).
   Nada daqui cria, muda ou apaga lançamento, saldo, cartão ou recorrente. Situação só lê o que o app já calcula.
   Simular uma compra: só conta (cálculo em js/domain/planejamento.js); os números ficam neste aparelho (localStorage 'fin1_simc'). */
(function () {
 'use strict';
 const H = s => escH(s), NUM = v => mfNum(v);
 const mm = k => k ? k.slice(5, 7) + '/' + k.slice(2, 4) : '';
 const dm = d => d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '';
 const lista = () => Array.isArray(S.debts) ? S.debts : [];

 /* ---------- Tetos por categoria (o bloco que existia dentro da Distribuição, agora com casa própria em Cartão) ---------- */
 window.mfTetoBlk = function () {
  return B('p_teto') + `<section class="c mf-pl mf-tetob"><h2>Tetos por categoria</h2>${mfTetoHtml().replace('<b>Tetos por categoria</b>', '<span class="mu">Quanto quer gastar no máximo em cada categoria no mês.</span>')}</section>`;
 };

 /* ---------- Dívidas ---------- */
 const campo = (k, t, v, ph, tp) => `<label class="mf-pl-f"><small>${t}</small><input type="${tp || 'text'}" ${tp ? '' : 'inputmode="decimal" '}data-divf="${k}" value="${H(v)}" placeholder="${H(ph || '')}"></label>`;
 function form(d) {
  d = d || {};
  const nv = (x, cas) => x ? (+x).toLocaleString('pt-BR', { minimumFractionDigits: cas, maximumFractionDigits: cas }) : '';
  return `<div class="mf-pl-form" data-divform="${H(d.id || 'new')}">
  <div class="mf-pl-g">${campo('n', 'Nome', d.n || '', 'Ex.: Financiamento do carro', 'text')}${campo('cred', 'Credor (opcional)', d.cred || '', 'Ex.: Banco', 'text')}
  ${campo('saldo', 'Quanto ainda devo', nv(d.saldo, 2), '0,00')}${campo('parc', 'Valor da parcela', nv(d.parc, 2), '0,00')}
  ${campo('rest', 'Parcelas que faltam', d.rest || '', '0')}${campo('dia', 'Dia do vencimento', d.dia || '', '10')}</div>
  <div class="mf-pl-acts"><button type="button" class="mf-pl-b on" data-divsave="1">Salvar</button><button type="button" class="mf-pl-b" data-divcancel="1">Cancelar</button></div></div>`;
 }
 window.mfDivHtml = function () {
  const ed = window.__divEd || null, r = mfDivResumo(lista(), TD), quit = lista().map(mfDivNorm).filter(d => d.q);
  const row = d => ed === d.id ? form(d) : `<div class="mf-pl-li"><div class="mf-pl-li-t"><span><b>${H(d.n)}</b>${d.cred ? `<small>${H(d.cred)}</small>` : ''}</span><b>${R(d.saldo)}</b></div>
   <div class="mf-pl-li-s">${d.rest > 0 ? `${R(d.parc)}/mês · ${d.rest === 1 ? 'falta 1 parcela' : `faltam ${d.rest} parcelas`}${d.prox ? ` · próxima ${dm(d.prox)}` : ''}${d.fim ? ` · termina ${mm(d.fim)}` : ''}` : 'Sem parcelas informadas'}</div>
   <div class="mf-pl-acts"><button type="button" class="mf-pl-b" data-divedit="${H(d.id)}">Editar</button><button type="button" class="mf-pl-b" data-divquit="${H(d.id)}">Quitar</button></div></div>`;
  const qrow = d => `<div class="mf-pl-li q"><div class="mf-pl-li-t"><span><b>${H(d.n)}</b>${d.cred ? `<small>${H(d.cred)}</small>` : ''}</span><small class="mu">Quitada</small></div>
   <div class="mf-pl-acts"><button type="button" class="mf-pl-b" data-divreopen="${H(d.id)}">Reabrir</button><button type="button" class="mf-pl-b" data-divdel="${H(d.id)}">Excluir</button></div></div>`;
  return B('p_div') + `<section class="c mf-pl mf-div"><h2>Dívidas</h2>
  <p class="mf-pl-nt">Financiamentos, empréstimos e acordos. Só para acompanhar: nada daqui vira lançamento nem mexe no saldo.</p>
  ${r.n ? `<div class="mf-pl-sum"><div><small>Ainda devo</small><b>${R(r.total)}</b></div><div><small>Parcelas por mês</small><b>${R(r.mensal)}</b></div></div>${r.itens.map(row).join('')}` : (ed === 'new' ? '' : '<p class="mf-empty">Nenhuma dívida cadastrada.</p>')}
  ${ed === 'new' ? form() : `<button type="button" class="mf-pl-add" data-divnew="1">+ Nova dívida</button>`}
  ${quit.length ? `<div class="mf-pl-lb">Quitadas</div>${quit.map(qrow).join('')}` : ''}</section>`;
 };
 function lerForm() {
  const f = document.querySelector('#app [data-divform]'); if (!f) return null;
  const v = k => (f.querySelector(`[data-divf="${k}"]`) || {}).value || '';
  return { id: f.dataset.divform, n: v('n').trim(), cred: v('cred').trim(), saldo: NUM(v('saldo')), parc: NUM(v('parc')), rest: Math.round(NUM(v('rest'))), dia: Math.round(NUM(v('dia'))) };
 }
 const redraw = () => { window.__mfLastTab = null; draw(); };
 document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-divnew],[data-divedit],[data-divsave],[data-divcancel],[data-divquit],[data-divreopen],[data-divdel]'); if (!b) return;
  e.preventDefault(); e.stopPropagation(); const D = b.dataset;
  if (D.divnew) { window.__divEd = 'new'; redraw(); return; }
  if (D.divedit) { window.__divEd = D.divedit; redraw(); return; }
  if (D.divcancel) { window.__divEd = null; redraw(); return; }
  if (D.divsave) {
   const x = lerForm(); if (!x) return;
   if (!x.n) { mfToast('Dê um nome para a dívida.'); return; }
   if (!(x.saldo > 0)) { mfToast('Informe quanto ainda deve.'); return; }
   if (x.dia && (x.dia < 1 || x.dia > 31)) { mfToast('O dia do vencimento vai de 1 a 31.'); return; }
   if (!Array.isArray(S.debts)) S.debts = [];
   const novo = mfDivNorm(Object.assign({}, x, { dia: x.dia || 1 }));
   if (x.id === 'new') { novo.id = 'dv' + Date.now().toString(36); S.debts.push(novo); }
   else { const i = S.debts.findIndex(d => d && d.id === x.id); if (i < 0) return; novo.id = x.id; novo.q = !!S.debts[i].q; S.debts[i] = novo; }
   window.__divEd = null; save(); redraw(); mfToast('Dívida salva ✓'); return;
  }
  const id = D.divquit || D.divreopen || D.divdel, i = lista().findIndex(d => d && d.id === id); if (i < 0) return;
  const d = mfDivNorm(S.debts[i]);
  if (D.divreopen) { S.debts[i].q = false; save(); redraw(); return; }
  if (D.divquit) mfConfirm({ title: 'Quitar dívida?', ok: 'Quitar', body: `<p class="mf-cf-sub">${H(d.n)}</p><p class="mf-cf-note">Ela sai das contas e fica na lista de quitadas. Dá para reabrir depois.</p>`, onOk: () => { S.debts[i].q = true; save(); redraw(); } });
  if (D.divdel) mfConfirm({ title: 'Excluir dívida?', ok: 'Excluir', body: `<p class="mf-cf-sub">${H(d.n)}</p><p class="mf-cf-note">Some da lista de quitadas. Seus lançamentos não mudam.</p>`, onOk: () => { S.debts.splice(i, 1); save(); redraw(); } });
 }, true);

 /* ---------- Situação: o que eu devo (só leitura) ---------- */
 window.mfSitHtml = function () {
  const k = ym, inv = cbInvoice(mfFatKey(k)), fat = Math.max(0, +inv.left || 0);
  const contas = mfDueItems(k).filter(x => !x.fat && !x.paid).reduce((s, x) => s + x.v, 0);
  const dv = mfDivResumo(lista(), TD), divMes = dv.mensal, aPagar = fat + contas + divMes;
  const renda = dashStats(k).rec, pct = renda > 0 ? Math.round(aPagar / renda * 100) : null;
  const parc = mfParcList().filter(x => x.left > 0.005).reduce((s, x) => s + x.left, 0);
  const li = (t, v, sub, go) => `<div class="mf-pl-row"><span>${t}${sub ? `<small>${sub}</small>` : ''}</span><b>${R(v)}</b>${go ? `<button type="button" class="mf-pl-go" data-ctmode="${go}" aria-label="Abrir ${H(t)}">›</button>` : ''}</div>`;
  return B('p_sit') + `<section class="c mf-pl mf-sit"><h2>Situação</h2>
  <p class="mf-pl-nt">O que você deve, juntando cartão, contas e dívidas.</p>
  <div class="mf-pl-lb">A pagar em ${H(MESF[+k.slice(5) - 1].toLowerCase())}</div>
  <div class="mf-pl-box">${li('Fatura do cartão', fat, inv.total > 0.005 ? (fat > 0.005 ? 'em aberto' : 'paga') : 'sem fatura', 'contas')}${li('Contas do mês', contas, 'compromissos ainda não pagos', 'venc')}${li('Parcelas das dívidas', divMes, dv.n ? `${dv.n} ${dv.n === 1 ? 'dívida' : 'dívidas'}` : 'nenhuma cadastrada', 'div')}
  <div class="mf-pl-row tot"><span>Total do mês${pct != null ? `<small>${pct}% das receitas do mês (${R(renda)})</small>` : '<small>sem receita lançada no mês</small>'}</span><b class="${pct != null && pct > 100 ? 'bad' : ''}">${R(aPagar)}</b></div></div>
  <div class="mf-pl-lb">Ainda vai pagar</div>
  <div class="mf-pl-box">${li('Parcelamentos', parc, 'o que falta das compras parceladas (inclui a parte desta fatura)', 'contas')}${li('Dívidas', dv.total, 'quanto ainda deve no total', 'div')}</div></section>`;
 };

 /* ---------- Simular uma compra ---------- */
 const KEY = 'fin1_simc';
 let sc = null;
 function carrega() {
  if (sc) return sc;
  sc = { v: '', n: '1', d: TD, cc: '' };
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o === 'object') Object.keys(sc).forEach(k => { if (typeof o[k] === 'string') sc[k] = o[k]; }); } catch (_) { }
  if (!sc.d || sc.d < TD) sc.d = TD;
  return sc;
 }
 function guarda() { try { localStorage.setItem(KEY, JSON.stringify(sc)); } catch (_) { } }
 function cartao() { const C = mfCards(), c = carrega().cc; return C.some(x => x.id === c) ? c : C[0].id; }
 function saida() {
  const s = carrega(), v = NUM(s.v), n = Math.max(1, Math.min(48, Math.round(NUM(s.n) || 1))), cc = cartao();
  if (!(v > 0)) return '<p class="mf-pl-nt" style="text-align:center;margin:0">Digite o valor da compra para ver as faturas.</p>';
  const P = mfSimCompra(v, n, s.d || TD, d => invoiceDueDate({ d, t: 'Crédito', cc }));
  let acum = 0, neg = null;
  const rows = P.map(p => {
   acum += p.v; const antes = cbInvoice(p.k, cc).total, saldo = cashBalanceAt(p.due) - acum; if (saldo < -0.005 && !neg) neg = p;
   return `<div class="mf-pl-sim"><span><b>Fatura ${mm(p.k)}</b><small>vence ${dm(p.due)} · parcela ${p.i}/${P.length}</small></span><span class="r"><small>${R(antes)} →</small><b>${R(antes + p.v)}</b><small class="${saldo < -0.005 ? 'bad' : 'mu'}">saldo depois ${R(saldo)}</small></span></div>`;
  }).join('');
  const topo = `<div class="mf-pl-sum"><div><small>${P.length > 1 ? `${P.length} parcelas de` : 'À vista'}</small><b>${R(P[0].v)}</b></div><div><small>Última fatura</small><b>${mm(P[P.length - 1].k)}</b></div></div>`;
  const aviso = neg ? `<p class="mf-pl-warn">Com essa compra, o saldo previsto fica negativo depois da fatura de ${mm(neg.k)}.</p>` : '<p class="mf-pl-ok">O saldo previsto continua positivo em todas as faturas.</p>';
  return topo + aviso + rows;
 }
 window.mfSimcHtml = function () {
  const s = carrega(), C = mfCards(), cc = cartao();
  const sel = C.length > 1 ? `<label class="mf-pl-f"><small>Cartão</small><select data-simc="cc">${C.map((c, i) => `<option value="${H(c.id)}"${c.id === cc ? ' selected' : ''}>${H(c.n || 'Cartão ' + (i + 1))}</option>`).join('')}</select></label>` : '';
  const f = (k, t, ph, tp) => `<label class="mf-pl-f"><small>${t}</small><input type="${tp || 'text'}" ${tp ? '' : 'inputmode="decimal" '}data-simc="${k}" value="${H(s[k])}" placeholder="${ph}"></label>`;
  return B('p_simc') + `<section class="c mf-pl mf-simc"><h2>Simular uma compra</h2>
  <p class="mf-pl-nt">Veja quanto uma compra no cartão pesa em cada fatura e no saldo. Não lança nada.</p>
  <div class="mf-pl-g">${f('v', 'Valor da compra', '0,00')}${f('n', 'Parcelas', '1')}${f('d', 'Data da compra', '', 'date')}${sel}</div>
  <div class="mf-pl-out" id="simc-out">${saida()}</div>
  <button type="button" class="mf-pl-add" data-simcreset="1">Limpar simulação</button></section>`;
 };
 const atualiza = () => { const o = document.getElementById('simc-out'); if (o) o.innerHTML = saida(); };
 document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-simc]'); if (!i) return; carrega(); sc[i.dataset.simc] = i.value; guarda(); atualiza(); }, true);
 document.addEventListener('change', e => { const i = e.target.closest && e.target.closest('select[data-simc]'); if (!i) return; carrega(); sc.cc = i.value; guarda(); atualiza(); }, true);
 document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-simcreset]'); if (!b) return;
  e.preventDefault(); e.stopPropagation(); sc = { v: '', n: '1', d: TD, cc: '' }; guarda();
  document.querySelectorAll('#app [data-simc]').forEach(i => { if (i.tagName !== 'SELECT') i.value = sc[i.dataset.simc]; }); atualiza();
 }, true);
})();
