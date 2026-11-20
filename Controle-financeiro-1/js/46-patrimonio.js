/* ===== Nova organização · Patrimônio ("o que eu tenho"): Resumo | Patrimônio (bens) | Investimentos | Metas =====
   Resumo: patrimônio líquido = bens + investimentos − dívidas (só leitura; investimentos = soma de "Meus ativos", dívidas = Planejamento › Dívidas).
   Patrimônio: bens cadastrados à mão em S.bens (criado só quando a pessoa cadastra o primeiro; quem não usa não tem nada novo salvo).
   Investimentos › Radar: fica em js/71-radar.js (só celular).
   Nada daqui cria, muda ou apaga lançamento, ativo, saldo ou dívida. Cálculos em js/domain/patrimonio.js; visual reaproveita css/91 (.mf-pl). */
(function () {
 'use strict';
 const H = s => escH(s);
 const bens = () => Array.isArray(S.bens) ? S.bens : [];
 const invTotal = () => (Array.isArray(S.inv) ? S.inv : []).reduce((s, a) => s + (+ivNow(a) || 0), 0);
 const mesAno = d => d ? d.slice(5, 7) + '/' + d.slice(0, 4) : '';

 /* investimentos por classe (Ações, FIIs, Renda fixa…): valor de hoje e peso de cada uma; só leitura */
 const invClasses = () => { const I = (Array.isArray(S.inv) ? S.inv : []), g = typeof ivGroups === 'function' ? ivGroups(I).filter(x => x.v > 0) : [], t = g.reduce((s, x) => s + x.v, 0); return g.map(x => ({ k: x.k, nome: IV_NOME[x.k] || x.k, cor: IV_COLS[x.k] || 'var(--mu)', v: x.v, p: t > 0 ? Math.round(x.v / t * 100) : 0 })); };
 const invAplicado = () => (Array.isArray(S.inv) ? S.inv : []).reduce((s, a) => s + (+ivCost(a) || 0), 0);
 const pct = (v, t) => t > 0 ? Math.round(v / t * 100) : 0;
 const IC = { bens: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>', inv: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>', div: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>' };
 const ico = k => `<i class="mf-pat-ic ${k}" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg></i>`;

 /* ---------- Resumo ---------- */
 window.mfPatHtml = function () {
  const br = mfBensResumo(bens()), dv = window.mfDivResumo ? mfDivResumo(S.debts, TD) : { total: 0, n: 0 }, mob = !(window.mfIsDesk && mfIsDesk()), P = mfPatLiq(mob ? 0 : br.total, invTotal(), dv.total); /* 2.5: no celular Patrimônio é só investimentos (bens ficam guardados, fora da conta) */
  const cls = invClasses(), apl = invAplicado(), res = P.inv - apl, pDiv = pct(P.div, P.tem);
  const item = (k, t, v, sub, go, neg) => `<button type="button" class="mf-pat-it" data-patgo="${go}" aria-label="Abrir ${H(t)}">${ico(k)}<span class="mf-pat-tx"><b>${t}</b><small>${sub}</small></span><span class="mf-pat-v${neg && v > 0 ? ' bad' : ''}">${neg && v > 0 ? '− ' : ''}${R(v)}</span><span class="mf-pat-ch" aria-hidden="true">›</span></button>`;
  const barra = P.tem > 0 ? `<div class="mf-pat-sec"><div class="mf-pat-st"><span>O que você tem</span><b>${R(P.tem)}</b></div>
   <div class="mf-pat-bar" role="img" aria-label="Bens ${P.pBens}% e investimentos ${P.pInv}%"><i class="b" style="width:${P.pBens}%"></i><i class="i" style="width:${P.pInv}%"></i></div>
   <div class="mf-pat-leg">${mob ? '' : `<span><i class="b"></i>Bens ${P.pBens}%</span>`}<span><i class="i"></i>Investimentos ${P.pInv}%</span></div></div>` : '';
  const divida = P.div > 0 && P.tem > 0 ? `<div class="mf-pat-sec"><div class="mf-pat-st"><span>Dívidas sobre o que você tem</span><b class="${pDiv >= 50 ? 'bad' : ''}">${pDiv}%</b></div>
   <div class="mf-pat-bar" role="img" aria-label="Dívidas equivalem a ${pDiv}% do que você tem"><i class="d" style="width:${Math.min(100, pDiv)}%"></i></div></div>` : '';
  const invs = cls.length ? `<div class="mf-pat-sec"><div class="mf-pat-st"><span>Investimentos por classe</span><b>${R(P.inv)}</b></div>
   ${cls.map(c => `<div class="mf-pat-cl"><span><i style="background:${c.cor}"></i>${H(c.nome)}</span><div class="mf-pat-clb"><i style="width:${c.p}%;background:${c.cor}"></i></div><b>${R(c.v)}</b><small>${c.p}%</small></div>`).join('')}
   ${apl > 0 ? `<div class="mf-pat-res"><span>Aplicado <b>${R(apl)}</b></span><span>Resultado <b class="${res < -0.005 ? 'bad' : 'ok'}">${ivSg(res)}</b></span></div>` : ''}</div>` : '';
  return B('p_pat') + `<section class="c mf-pl mf-pat"><h2>Patrimônio líquido</h2>
  <div class="mf-pat-hero"><b class="${P.liq < -0.005 ? 'bad' : ''}">${R(P.liq)}</b><small>${mob ? 'investimentos − dívidas' : 'bens + investimentos − dívidas'}</small>
   <div class="mf-pat-chips"><span><small>Você tem</small><b>${R(P.tem)}</b></span><span><small>Você deve</small><b class="${P.div > 0 ? 'bad' : ''}">${R(P.div)}</b></span></div></div>
  <div class="mf-pat-list">${(window.mfIsDesk && mfIsDesk()) ? item('bens', 'Bens', P.bens, br.n ? `${br.n} ${br.n === 1 ? 'bem cadastrado' : 'bens cadastrados'}` : 'nenhum cadastrado', 'bens') : ''}${item('inv', 'Investimentos', P.inv, 'soma de Meus ativos', 'pos')}${item('div', 'Dívidas', P.div, dv.n ? `${dv.n} ${dv.n === 1 ? 'dívida' : 'dívidas'} em Planejamento` : 'nenhuma cadastrada', 'div', true)}</div>
  ${barra}${divida}${invs}</section>`;
 };
 document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-patgo]'); if (!b) return;
  e.preventDefault(); e.stopPropagation(); const g = b.dataset.patgo;
  if (g === 'div') { tab = 'mais'; window.__ctMode = 'div'; }
  else { if (g === 'pos') window.__invBack = mfInvMode(); window.__invMode = g; try { localStorage.setItem('fin1_invmode', g); } catch (_) { } }
  window.__mfLastTab = null; draw(); scrollTo(0, 0);
 }, true);

 /* ---------- Patrimônio (bens) ---------- */
 function form(b) {
  b = b || {};
  const v = b.v ? (+b.v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
  return `<div class="mf-pl-form" data-bemform="${H(b.id || 'new')}"><div class="mf-pl-g">
  <label class="mf-pl-f"><small>Nome</small><input type="text" data-bemf="n" value="${H(b.n || '')}" placeholder="Ex.: Apartamento, Carro"></label>
  <label class="mf-pl-f"><small>Tipo</small><select data-bemf="tipo">${MF_BEM_TIPOS.map(([k, , um]) => `<option value="${k}"${(b.tipo || 'imovel') === k ? ' selected' : ''}>${um}</option>`).join('')}</select></label>
  <label class="mf-pl-f"><small>Valor atual</small><input type="text" inputmode="decimal" data-bemf="v" value="${H(v)}" placeholder="0,00"></label></div>
  <div class="mf-pl-acts"><button type="button" class="mf-pl-b on" data-bemsave="1">Salvar</button><button type="button" class="mf-pl-b" data-bemcancel="1">Cancelar</button></div></div>`;
 }
 window.mfBensHtml = function () {
  const ed = window.__bemEd || null, r = mfBensResumo(bens());
  const row = b => ed === b.id ? form(b) : `<div class="mf-pl-li"><div class="mf-pl-li-t"><span><b>${H(b.n)}</b>${b.at ? `<small>valor atualizado em ${mesAno(b.at)}</small>` : ''}</span><b>${R(b.v)}</b></div>
   <div class="mf-pl-acts"><button type="button" class="mf-pl-b" data-bemedit="${H(b.id)}">Atualizar valor</button><button type="button" class="mf-pl-b" data-bemdel="${H(b.id)}">Excluir</button></div></div>`;
  const inv = invTotal(), cls = invClasses();
  /* 2.1: os investimentos também são patrimônio: aparecem aqui só para leitura (valor de hoje, por classe); para mexer, abre a página Investimentos */
  const invBloco = `<div class="mf-pl-lb">Investimentos · ${R(inv)}</div>${cls.length ? cls.map(c => `<div class="mf-pl-li mf-bens-inv"><div class="mf-pl-li-t"><span><b><i style="background:${c.cor}"></i>${H(c.nome)}</b><small>${c.p}% dos investimentos</small></span><b>${R(c.v)}</b></div></div>`).join('') : '<p class="mf-empty">Nenhum investimento cadastrado.</p>'}
  <button type="button" class="mf-pl-add mf-bens-go" data-patgo="pos">Abrir Investimentos ›</button>`;
  return B('p_bens') + `<section class="c mf-pl mf-bens"><h2>Tudo o que você tem</h2>
  <p class="mf-pl-nt">Seus investimentos (valor de hoje) e os bens que você cadastra, como imóveis e veículos. Não mexe nos lançamentos.</p>
  <div class="mf-pl-sum"><div><small>Total</small><b>${R(r.total + inv)}</b></div><div><small>Bens</small><b>${R(r.total)}</b></div></div>
  ${invBloco}
  <div class="mf-pl-lb mf-bens-tt">Bens · ${R(r.total)}</div>
  ${r.n ? `${r.tipos.map(t => `<div class="mf-pl-lb">${t.nome} · ${R(t.total)}</div>${t.itens.map(row).join('')}`).join('')}` : (ed === 'new' ? '' : '<p class="mf-empty">Nenhum bem cadastrado.</p>')}
  ${ed === 'new' ? form() : '<button type="button" class="mf-pl-add" data-bemnew="1">+ Cadastrar bem</button>'}</section>`;
 };
 const redraw = () => { window.__mfLastTab = null; draw(); };
 document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-bemnew],[data-bemedit],[data-bemsave],[data-bemcancel],[data-bemdel]'); if (!b) return;
  e.preventDefault(); e.stopPropagation(); const D = b.dataset;
  if (D.bemnew) { window.__bemEd = 'new'; redraw(); return; }
  if (D.bemedit) { window.__bemEd = D.bemedit; redraw(); return; }
  if (D.bemcancel) { window.__bemEd = null; redraw(); return; }
  if (D.bemsave) {
   const f = document.querySelector('#app [data-bemform]'); if (!f) return;
   const val = k => (f.querySelector(`[data-bemf="${k}"]`) || {}).value || '';
   const x = mfBemNorm({ id: f.dataset.bemform, n: val('n'), tipo: val('tipo'), v: mfNum(val('v')), at: TD });
   if (!val('n').trim()) { mfToast('Dê um nome para o bem.'); return; }
   if (!(x.v > 0)) { mfToast('Informe o valor atual.'); return; }
   if (!Array.isArray(S.bens)) S.bens = [];
   if (f.dataset.bemform === 'new') { x.id = 'bm' + Date.now().toString(36); S.bens.push(x); }
   else { const i = S.bens.findIndex(y => y && y.id === f.dataset.bemform); if (i < 0) return; S.bens[i] = x; }
   window.__bemEd = null; save(); redraw(); mfToast('Bem salvo ✓'); return;
  }
  const i = bens().findIndex(y => y && y.id === D.bemdel); if (i < 0) return;
  const bm = mfBemNorm(S.bens[i]);
  mfConfirm({ title: 'Excluir bem?', ok: 'Excluir', body: `<p class="mf-cf-sub">${H(bm.n)}</p><div class="mf-cf-v">${R(bm.v)}</div><p class="mf-cf-note">Sai do seu patrimônio. Seus lançamentos não mudam.</p>`, onOk: () => { S.bens.splice(i, 1); save(); redraw(); } });
 }, true);

})();
