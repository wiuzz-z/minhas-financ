
window.__mfPre.push(function(){const i=MF_DWIDE.indexOf('dv_sim'),on=tab==='inv'&&mfInvMode()==='fund';if(on&&i<0)MF_DWIDE.push('dv_sim');else if(!on&&i>=0&&!MF_DVSIM0)MF_DWIDE.splice(i,1)});

/* ===== Patch 63 · Etapa 4: mês ao lado de "Todos os lançamentos" (setas e deslizar) ===== */
MF_NOMONTH.push('add');
/* se o bloco Todos os lançamentos estiver oculto ou em outra aba, o mês volta para o topo (nunca fica sem seletor) */
window.__mfPre.push(function(){try{const i=MF_NOMONTH.indexOf('add'),off=isHid('ext_all')||mvAway('ext_all','add');if(off&&i>=0)MF_NOMONTH.splice(i,1);else if(!off&&i<0)MF_NOMONTH.push('add')}catch(e){}});
function mfLmNav(){return `<div class="mf-lmn" role="group" aria-label="Mês dos lançamentos"><button type="button" data-m="-1" aria-label="Mês anterior">‹</button><span aria-live="polite">${MESF[+ym.slice(5)-1]} ${ym.slice(0,4)}</span><button type="button" data-m="1" aria-label="Próximo mês">›</button></div>`}
/* celular: o botão Selecionar vai para a linha da busca (o título fica com o mês ao lado) */
function mfTxFilterBar(sel){return `<div class="mf-filters"><div class="mf-frow"><label class="mf-fsearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="search" data-txq placeholder="Buscar lançamento" value="${escH(window.__txQ||'')}" aria-label="Buscar lançamento"></label>${sel===undefined?'':`<button type="button" class="mf-sel-ic" data-mfsel="toggle" aria-label="${sel?'Cancelar seleção':'Selecionar lançamentos'}" title="${sel?'Cancelar':'Selecionar'}"></button>`}</div>${mfTxChips()}</div>`}
function mfLmGo(d){window.__mfSlide=d;ym=nm(ym,d);dashCalDay='';F.dt=null;draw()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.mf-lmn [data-m]');if(b)window.__mfSlide=+b.dataset.m||0},true);
(function(){let st=null;
 document.addEventListener('touchstart',e=>{st=null;if(tab!=='add'||e.touches.length!==1)return;const t=e.target;if(!t||!t.closest||!t.closest('#app .mf-all,#app .mf-sum')||t.closest('input,textarea,select,.mf-fchips,.mf-lmn,.mf-frow'))return;const c=e.touches[0];if(c.clientX<28)return;st={x:c.clientX,y:c.clientY,t:Date.now()}},{passive:true});
 document.addEventListener('touchend',e=>{if(!st)return;const c=e.changedTouches[0],dx=c.clientX-st.x,dy=c.clientY-st.y,dt=Date.now()-st.t;st=null;if(dt>800||Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.6)return;mfLmGo(dx<0?1:-1)},{passive:true});
 document.addEventListener('touchcancel',()=>{st=null},{passive:true});
})();
window.__mfAD.push(function(){const d=window.__mfSlide;if(!d)return;window.__mfSlide=0;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;document.querySelectorAll('#app .mf-all').forEach(el=>{el.classList.remove('mf-sl-n','mf-sl-p');void el.offsetWidth;el.classList.add(d>0?'mf-sl-n':'mf-sl-p')})});

/* ===== Patch 64 · Etapa 5: cadastrar proventos direto no card ===== */
function mfProvTk(t){if(t&&t.tk)return String(t.tk).toUpperCase();const m=String((t&&t.n)||'').toUpperCase().match(/\b([A-Z]{4}\d{1,2})\b/);return m?m[1]:''}
/* Proventos recebidos = receitas de proventos do app + histórico do Supabase (antes de MF_PVA_DESDE).
   O histórico só entra nos cálculos (yield, média, por ativo, ano a ano): não vira lançamento e não mexe no saldo. */
var MF_PVA_DESDE='2026-11-01';
function mfProvHist(){const L=mfProvRows();if(!L.length)return '';const row=t=>t.hist?`<div class="mf-pvh-r" title="Histórico (antes de começar a usar o app): conta no yield, não no saldo"><span class="mf-pvh-m">${mfMs(t.d.slice(0,7))}</span><span class="mf-pvh-n">${escH(mfProvTk(t)||String(t.n||'Provento'))} <small class="mu">· histórico</small></span><b class="ok">${R(+t.v||0)}</b></div>`:`<button type="button" class="mf-pvh-r" data-e="${escH(t.id)}" aria-label="Editar provento"><span class="mf-pvh-m">${mfMs(t.d.slice(0,7))}</span><span class="mf-pvh-n">${escH(mfProvTk(t)||String(t.n||'Provento'))}</span><b class="ok">${R(+t.v||0)}</b></button>`;
 return `<div class="mf-pvh"><small class="mf-pvh-t">Histórico</small>${L.slice(0,5).map(row).join('')}${L.length>5?`<details class="mf-pvh-more"><summary>Ver todos (${L.length})</summary>${L.slice(5).map(row).join('')}</details>`:''}</div>`}
function mfProvBlock(){const cur=TD.slice(0,7),all=mfProvAll().filter(t=>t.d&&t.d<=TD&&mfIsProv(t)),sm=f=>all.filter(f).reduce((s,t)=>s+(+t.v||0),0),k12=nm(cur,-11);
 const last=sm(t=>t.d.slice(0,7)===cur),ano=sm(t=>t.d.slice(0,4)===TD.slice(0,4)),avg=sm(t=>t.d.slice(0,7)>=k12)/12,P=plEnsure(),meta=+P.provMeta>0?+P.provMeta:1000,pct=meta?Math.min(100,avg/meta*100):0;
 const hasPv=all.length||((window.__pva||{}).rows||[]).length;
 const goal=`<div class="mf-prov-goal"><div class="mf-prov-gt"><span>Meta de renda passiva</span><label><em>R$</em><input type="text" inputmode="decimal" data-provmeta value="${meta.toLocaleString('pt-BR',{maximumFractionDigits:2})}"><em>/mês</em></label></div>${hasPv?`<div class="mf-prov-bar"><i style="width:${pct.toFixed(1)}%"></i></div><small>${pct>=100?'Meta atingida pela média dos últimos 12 meses':`${pct.toFixed(0)}% da meta · faltam ${R(Math.max(0,meta-avg))} por mês`}</small>${pct<100&&window.mfPvBase?(()=>{const b=mfPvBase(),f=Math.max(0,meta-avg);return b.dy>0?`<small class="mf-prov-inv">Com o DY atual (${(b.dy*100).toFixed(2).replace('.',',')}% ao ano), faltaria investir cerca de <b>${R(f*12/b.dy)}</b>.</small>`:''})():''}`:''}</div>`;
 const body=hasPv?`<div class="mf-pv1"><div><small>Recebido em ${MESF[+cur.slice(5)-1].toLowerCase()}</small><b class="${last>0?'ok':''}">${R(last)}</b></div><div><small>No ano de ${TD.slice(0,4)}</small><b>${R(ano)}</b></div></div>${goal}`
  :`<p class="mf-empty">Os proventos dos seus ativos aparecem aqui sozinhos, na data de pagamento.</p>${goal}`;
 return B('i_prov')+`<section class="c mf-prov"><h2>Proventos</h2>${body}${mfProvHist()}</section>`}
function mfProvChart(id){const p=+mfView(id,'per','12'),per=[6,12,24].includes(p)?p:12,ct=mfChart(id,'colunas'),cur=TD.slice(0,7),ks=Array.from({length:per},(_,i)=>nm(cur,i-per+1)),all=mfProvAll().filter(t=>t.d&&t.d<=TD&&mfIsProv(t)),
 sm=(k,f)=>all.filter(t=>t.d.slice(0,7)===k&&(!f||f(t))).reduce((s,t)=>s+(+t.v||0),0),vals=ks.map(k=>sm(k)),names=ks.map(k=>MES[+k.slice(5)-1]),ev=per>12?3:per>6?2:1;
 if(ct==='linha')return `<div class="mf-prov-ch">${mfLines(names,[{vals,color:'var(--ok)',fill:true}],{every:ev,aria:'Proventos por mês'})}</div>`;
 if(ct==='tipo'){const tps=[['Dividendos','#5fbf77'],['JCP','#f2c14e'],['Rendimentos (FII)','#7cc4fa']].filter(([tp])=>ks.some(k=>sm(k,t=>mfPvTipo(t)===tp)>0));
  return `<div class="mf-prov-ch">${mfVBars(names,tps.map(([tp,c])=>({vals:ks.map(k=>sm(k,t=>mfPvTipo(t)===tp)),color:c})),{every:ev,aria:'Proventos por mês e tipo'})}${mfKeys(tps)}</div>`}
 return `<div class="mf-prov-ch${per>12?' mf-pvm24':''}">${mfProvBars(ks,vals)}</div>`}
/* barras dos meses com o valor de cada mês; tocar no mês mostra o valor exato (patch 79) */
function mfProvBars(ks,vals){const mx=Math.max(...vals,0)||1,sel=ks.includes(window.__pvmSel)?window.__pvmSel:ks[ks.length-1],si=ks.indexOf(sel),
 lb=v=>!(v>0)?'':v>=1000?(v/1000).toFixed(1).replace('.',',')+'k':String(Math.round(v));
 return `<div class="mf-pvm" role="group" aria-label="Proventos por mês">${ks.map((k,i)=>`<button type="button" class="${k===sel?'on':''}" data-pvm="${k}" aria-label="${MESF[+k.slice(5)-1]} de ${k.slice(0,4)}: ${R(vals[i])}"><span>${lb(vals[i])}</span><i style="height:${vals[i]>0?Math.max(4,vals[i]/mx*100).toFixed(1):0}%"></i><small>${MES[+k.slice(5)-1]}</small></button>`).join('')}</div>
 <div class="mf-pvm-d"><span>${MESF[+sel.slice(5)-1]} de ${sel.slice(0,4)}</span><b class="${vals[si]>0?'ok':''}">${R(vals[si])}</b></div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pvm]');if(!b)return;e.preventDefault();e.stopPropagation();window.__pvmSel=b.dataset.pvm;draw()},true);
/* salvar: vira uma receita (atualiza Receitas, Saldo, Proventos e a meta) — sem duplicar */
function mfProvSave(o){window.__provLock=Date.now();S.tx.push({id:'pv'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),n:'Proventos '+o.tk,v:o.v,e:'',d:o.d,c:'Receita',s:'Proventos',t:'',tk:o.tk});window.__provOpen=false;window.__provF=null;save();draw();mfToast('Provento lançado ✓')}
document.addEventListener('submit',e=>{const f=e.target;if(!f||!f.matches||!f.matches('[data-provform]'))return;e.preventDefault();e.stopPropagation();
 if(window.__provLock&&Date.now()-window.__provLock<600)return;
 const tk=String(f.tk.value||'').trim().toUpperCase().replace(/\s+/g,''),v=Math.round(mfNum(f.v.value)*100)/100,k=/^\d{4}-\d{2}$/.test(f.m.value)?f.m.value:TD.slice(0,7);
 window.__provF={tk,v:f.v.value,m:k};
 if(tk.length<2){mfToast('Informe o ativo ou ticker.');try{f.tk.focus({preventScroll:true})}catch(_){}return}
 if(!(v>0)){mfToast('Informe o valor recebido.');try{f.v.focus({preventScroll:true})}catch(_){}return}
 const d=k===TD.slice(0,7)?TD:k+'-15',dup=mfProvRows().filter(t=>t.d.slice(0,7)===k&&mfProvTk(t)===tk);
 if(dup.length){mfConfirm({title:'Provento já lançado',ok:'Lançar mesmo assim',body:`<p class="mf-cf-sub">Já existe provento de <b>${escH(tk)}</b> em ${MESF[+k.slice(5)-1].toLowerCase()} de ${k.slice(0,4)}: ${dup.map(t=>R(+t.v||0)).join(', ')}.</p><p class="mf-cf-note">Lance de novo só se for outro pagamento (ex.: dividendo e JCP no mesmo mês).</p>`,onOk:()=>{mfProvSave({tk,v,d})}});return}
 mfProvSave({tk,v,d})},true);
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 if(t.closest('[data-provadd]')){e.preventDefault();e.stopPropagation();window.__provOpen=true;draw();setTimeout(()=>{const i=document.querySelector('#app .mf-pvf input[name="tk"]');if(i){try{i.focus({preventScroll:true})}catch(_){}}},60);return}
 if(t.closest('[data-provcancel]')){e.preventDefault();e.stopPropagation();window.__provOpen=false;window.__provF=null;draw()}},true);
document.addEventListener('input',e=>{const f=e.target&&e.target.closest&&e.target.closest('[data-provform]');if(f)window.__provF={tk:f.tk.value,v:f.v.value,m:f.m.value}},true);
document.addEventListener('change',e=>{const f=e.target&&e.target.closest&&e.target.closest('[data-provform]');if(f)window.__provF={tk:f.tk.value,v:f.v.value,m:f.m.value}},true);

/* ===== Patch 65 · Etapa 6: escolher o que aparece em cada card (Editar › Escolher o que mostrar) ===== */
/* sel = o que esconder dentro do card; g = grupo (Valores, Informações secundárias, Indicadores, Outras). Só esconde: nenhum dado muda. */
(function(){
 const V='Valores',S2='Informações secundárias',I='Indicadores',O='Outras informações';
 const o=(k,l,g,sel)=>({k,l,g,sel,t:'b',d:true});
 const kpi=(t,sub)=>({t,o:[o('val','Valor principal',V,':scope>b'),o('sec',sub||'Texto abaixo do valor',S2,':scope>b~small'),o('cmp','Comparação com o mês anterior',I,'.mf-dvrow'),o('go','Atalho ↗',O,'.mf-dgo')]});
 const add={
  c_sal:{t:window.mfIsDesk&&mfIsDesk()?'Saldo disponível hoje':'Saldo atual',o:[o('val','Valor do saldo',V,'.dash-balance-value'),o('meta','Entradas e saídas do mês',S2,'.dash-balance-meta'),o('daily','Quanto pode gastar por dia',S2,'.mf-daily'),o('ico','Seta de tendência',I,'.dash-balance-icon'),o('cmp','Comparação com o mês anterior',I,'.mf-dvrow')]},
  c_ent:kpi('Receitas do mês','Quantidade de entradas'),c_sai:kpi('Despesas do mês','À vista e fatura'),c_fat:kpi('Fatura do cartão','Vencimento e status'),c_inv:kpi('Investido no mês','Percentual da renda'),
  d_alert:{t:'Avisos',o:[o('val','Valores e percentuais',V,'.mf-al-i b'),o('more','Contador de outros avisos',S2,'.mf-al-more'),o('ico','Marcador de cor',I,'.mf-al-i i')]},
  calendar:{t:'Calendário',o:[o('kick','Título pequeno e ajuda',S2,'.dash-section-kicker,.dash-section-head p'),o('dots','Marcadores nos dias',I,'.dash-calendar-dots')]},
  cashflow:{t:'Fluxo de caixa',o:[o('val','Saldo previsto',V,'.dash-cashflow-main'),o('sum','Entradas e saídas previstas',V,'.dash-cashflow-summary'),o('per','Botões de período',O,'.dash-period'),o('proj','Projeção do período',S2,'.dash-cashflow-summary~div:not([class])'),o('note','Observação',S2,'.dash-networth-note'),o('go','Atalho Contas ↗',O,'.dash-text-btn')]},
  budgetalerts:{t:'Distribuição 50/30/20',o:[o('val','Gasto e quanto resta',V,'.mf-bg-s'),o('pct','Percentuais',I,'.mf-bg-t b:last-child'),o('bar','Barras',I,'.mf-bg-bar'),o('inc','Receitas do mês',S2,'.mf-bg-inc'),o('cfg','Configurar regra',O,'.mf-rule-cfg')]},
  d_cat:{t:'Gastos por categoria',o:[o('val','Valores',V,'.mf-leg b,.mf-clist b,.mf-clist small'),o('seg','Botões Rosca/Barras/Lista',O,':scope>.mf-seg,.dash-section-head~.mf-seg')]},
  d_eco:{t:'Economia mensal',o:[o('kv','Média e este mês',V,'.mf-eco-kv'),o('chart','Gráfico',I,':scope>svg')]},
  d_bar:{t:'Gastos por mês',o:[o('pill','Variação',I,'.mf-dbar-s'),o('chart','Gráfico',V,':scope>svg')]},
  ext_sum:{t:'Receitas e gastos do mês',o:[o('bal','Saldo do mês',V,'.mf-sum-bal'),o('tiles','Entradas e saídas',V,':scope>.g2'),o('list','Listas abertas',S2,'.mf-flow-list'),o('note','Observação',S2,':scope>p,:scope>small.mu')]},
  ext_cat:{t:'Por categoria',o:[o('val','Valores',V,'.mf-xc-t b'),o('pct','Percentuais',I,'.mf-xc-t em'),o('bar','Barras',I,'.mf-xc-b'),o('tot','Total do mês',S2,'.mf-xc-tot')]},
  ext_all:{t:'Todos os lançamentos',o:[o('val','Valores',V,'.mf-txv,.mf-tall td.dv-r b'),o('det','Categoria e pagamento',S2,'.mf-txm small,.mf-tall td small,.mf-tall .mf-tag'),o('ico','Ícones',I,'.mf-txi'),o('flt','Busca e filtros',O,'.mf-filters,.mf-ttools')]},
  p_faturas:{t:'Cartão de crédito',o:[o('val','Valor da fatura',V,'.cb-hero b'),o('mval','Valores nos meses',V,'.cb-m small'),o('leg','Legenda das cores',S2,'.cb-legend'),o('st','Status da fatura',I,'.cb-status'),o('cats','Maiores categorias',O,'.cb-cats'),o('list','Compras da fatura',O,'details[data-cbd="list"]'),o('cfg','Ciclo do cartão',O,'details[data-cbd="cfg"]')]},
  p_venc:{t:'Compromissos do mês',o:[o('sum','A pagar e pago',V,'.mf-due-sum'),o('val','Valores de cada conta',V,'.mf-due-r b'),o('mon','Mês',S2,'.mf-due-mon'),o('date','Data e detalhe',S2,'.mf-due-m small'),o('tag','Situação (dias, paga)',I,'.mf-due-r small')]},
  p_fixos:{t:'Recorrentes',o:[o('new','Novo recorrente',O,':scope>details')]},
  p_shop:{t:'Lista de compras',o:[o('val','Preços',V,'.mf-shv'),o('tot','Total estimado',V,'.mf-shtot'),o('qty','Quantidades',S2,'.mf-shn small'),o('cnt','Contadores dos locais',I,'.mf-shtabs em'),o('done','Itens comprados',O,'.mf-shdh,.mf-shdh+.mf-shl')]},
  p_parc:{t:'Parcelamentos',o:[o('sum','Falta pagar e parcelas do mês',V,'.mf-pc-sum'),o('val','Valor da parcela',V,'.mf-pc-t b:last-child'),o('det','Parcela atual e quanto falta',S2,'.mf-pc-s'),o('bar','Barras de progresso',I,'.mf-pc-bar'),o('fin','Quitados',O,'.mf-pc-fin'),o('btn','Botão registrar compra',O,'.mf-pc-new')]},
  p_gasto:{t:'Simulador de gastos',o:[o('top','Gráfico e resumo',V,'.mf-sim-top')]},
  dv_kpi:{t:window.mfIsDesk&&mfIsDesk()?'Patrimônio total':'Valor atual',o:[o('k1',window.mfIsDesk&&mfIsDesk()?'Patrimônio total':'Valor atual',V,'.dv-k:nth-child(1)'),o('k2','Rentabilidade',V,'.dv-k:nth-child(2)'),o('k3','Aportado no mês',V,'.dv-k:nth-child(3)'),o('k4','Dividendos do mês',V,'.dv-k:nth-child(4)'),o('sec','Textos abaixo dos valores',S2,'.dv-ks'),o('ind','Barras, anel e etiquetas',I,'.dv-bars,.dv-ringw,.dv-pill')]},
  i_chart:{t:'Distribuição da carteira',o:[o('chart','Gráfico',V,'.mf-cat-donut svg'),o('leg','Legenda',S2,'.mf-leg'),o('ap','Aportes',I,'.mf-ivl')]},
  dv_chart:{t:'Distribuição dos ativos',o:[o('chart','Gráfico',V,'.dv-donut'),o('leg','Legenda',S2,'.dv-leg'),o('side','Por classe',I,'.dv-side')]},
  i_cls:{t:'Classes e ativos',o:[o('btn','Botões (novo ativo, cotações)',O,'.mf-cls-act')]},
  dv_tab:{t:'Meus ativos',o:[o('btn','Botões (cotações, novo ativo)',O,'.dv-tools')]},
  i_prov:{t:'Proventos',o:[o('kv','Recebido no mês e no ano',V,'.mf-pv1'),o('goal','Meta de renda passiva',I,'.mf-prov-goal'),o('add','Adicionar provento',O,'.mf-pv-add,.mf-pvf'),o('hist','Histórico',O,'.mf-pvh')]},
  dv_proj:{t:'Projeção do patrimônio',o:[o('res','Resultado',V,'.dv-proj-r'),o('chart','Gráfico',I,'.dv-proj-c svg,.dv-proj-c .mf-keys'),o('note','Observação',S2,'.dv-foot')]},
  dv_sim:{t:'Simulador de aporte',o:[o('mode','Modo (Eu escolho / Pelas metas)',O,'.mf-sd-mode'),o('foot','Total distribuído',S2,'.dv-foot')]},
  n_kpi:{t:'Resumo do mês',o:[o('val','Valores',V,'.mf-kpis b'),o('cmp','Variação',I,'.mf-kpis .mf-dl'),o('txt','Comparação em texto',S2,'.mf-cmp')]}
 };
 Object.keys(add).forEach(id=>{if(!MF_VIEW[id])MF_VIEW[id]=add[id]});
})();
/* 1.17: opções de qualquer bloco = as dele + tipo de gráfico (MF_CHARTS) + título; blocos sem lista ganham uma automática (gráfico, legenda, números, observações, botões) */
function mfViewOps(id){const cfg=MF_VIEW[id];if(!cfg)return [];const o=cfg.o.slice(),ct=MF_CHARTS[id];
 if(ct&&!o.some(x=>x.k==='chart'))o.unshift({k:'chart',l:'Tipo de gráfico',t:'1',d:ct[0][0],v:ct,g:'Gráfico'});
 if(!o.some(x=>x.k==='_tt'))o.push({k:'_tt',l:'Título do bloco',g:'Geral',sel:':scope h2',t:'b',d:true,gen:1});return o}
var MF_VIEW_AUTO=[['_gr','Gráfico',':scope svg,:scope .mf-vbars,:scope .mf-hbars,:scope .mf-bars12,:scope .mf-stack,:scope .iv-stack,:scope .mf-pvm'],['_lg','Legenda',':scope .mf-keys,:scope .mf-leg,:scope .mf-leg2,:scope .mf-legend'],
 ['_kp','Números em destaque',':scope .mf-kpis,:scope .mf-big2,:scope .an-eco'],['_nt','Observações e notas',':scope .mf-cmp,:scope .dv-foot,:scope .mf-note,:scope p.mu'],['_sg','Botões de escolha',':scope .mf-seg,:scope .mfc-chips']];
function mfViewAuto(){document.querySelectorAll('#app [data-bk]').forEach(el=>{const id=String(el.dataset.bk).split('|')[1]||'';if(!id)return;const b=mfBase(id),k=MF_VIEW[id]?id:MF_VIEW[b]?b:null;if(k&&!MF_VIEW[k].auto)return;const key=k||b;
 const h2=el.querySelector('h2'),cfg=MF_VIEW[key]||{t:((h2&&h2.textContent)||'').trim()||'Bloco',o:[],auto:1},has=new Set(cfg.o.map(x=>x.k));
 MF_VIEW_AUTO.forEach(([kk,l,sel])=>{if(has.has(kk))return;try{if(el.querySelector(sel))cfg.o.push({k:kk,l,sel,g:'Partes do card',t:'b',d:true})}catch(e){}});if(cfg.o.length||MF_CHARTS[key]||h2)MF_VIEW[key]=cfg})}
function mfApplyView(){try{mfViewAuto()}catch(e){}document.querySelectorAll('#app [data-bk]').forEach(el=>{const id=String(el.dataset.bk).split('|')[1]||'',vid=MF_VIEW[id]?id:mfBase(id),cfg=MF_VIEW[vid];if(!cfg)return;
 mfViewOps(vid).forEach(op=>{if(!op.sel||mfView(vid,op.k,op.d)!==false)return;try{el.querySelectorAll(op.sel).forEach(x=>x.classList.add('mf-vh'))}catch(e){}})})}
window.__mfAD.push(mfApplyView);
/* folha "Escolher o que mostrar" com grupos e "Mostrar tudo" */
function mfViewSheet(id){const cfg=MF_VIEW[id];if(!cfg)return;document.getElementById('mf-vw-sheet')?.remove();
 const w=document.createElement('div');w.id='mf-vw-sheet';let last='';
 const row=op=>{const on=mfView(id,op.k,op.d);if(op.t==='b')return `<div class="vw-row"><span>${op.l}</span><button type="button" class="vw-sw ${on?'on':''}" data-vwk="${op.k}" data-vwv="${on?'0':'1'}" role="switch" aria-checked="${!!on}" aria-label="${op.l}"><i></i></button></div>`;
  return `<div class="vw-row vw-col"><span>${op.l}</span><div class="vw-chips">${op.v.map(([v,n])=>`<button type="button" class="${on===v?'on':''}" data-vwk="${op.k}" data-vwv="${v}">${n}</button>`).join('')}</div></div>`};
 const bel=[...document.querySelectorAll('#app [data-bk]')].find(e=>{const x=String(e.dataset.bk).split('|')[1]||'';return x===id||mfBase(x)===id}),ops=mfViewOps(id).filter(op=>!op.gen||!bel||(()=>{try{return bel.querySelector(op.sel)}catch(e){return true}})());
 const body=ops.map(op=>{let h='';if(op.g&&op.g!==last){last=op.g;h+=`<div class="vw-g">${op.g}</div>`}return h+row(op)}).join('');
 const any=ops.some(op=>mfView(id,op.k,op.d)!==op.d);
 w.innerHTML=`<div class="mf-mv-back" data-vwk="close"></div><section class="mf-mv-box" role="dialog" aria-modal="true" aria-label="Escolher o que mostrar"><h3>Exibir em “${cfg.t}”</h3><p>Escolha o que aparece neste card e como. Nenhum valor é apagado ou alterado.</p><div class="vw-list">${body}</div>${any?'<button type="button" class="vw-reset" data-vwk="reset">Voltar ao padrão</button>':''}<button type="button" class="mf-mv-cancel" data-vwk="close" style="margin-top:12px">Feito</button></section>`;
 w.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-vwk]');if(!b)return;const k=b.dataset.vwk;if(k==='close'){w.remove();return}
  S.view=S.view||{};if(k==='reset'){delete S.view[id];save();draw();mfViewSheet(id);return}
  S.view[id]=S.view[id]||{};const op=mfViewOps(id).find(x=>x.k===k);if(!op)return;if(k==='chart'&&id==='d_cat')S.view.catMode=b.dataset.vwv;S.view[id][k]=op.t==='b'?b.dataset.vwv==='1':b.dataset.vwv;save();draw();mfViewSheet(id)});
 document.body.appendChild(w)}

/* ===== Patch 66 · Etapa 7: Visão do Futuro (Dashboard) ===== */
/* só lançamentos reais: receitas, despesas (crédito no mês da fatura, parcelas no mês de cada uma) e investimentos.
   Pagamento de fatura não é saída; investimento fica separado; recorrentes já estão lançados nos meses (sem duplicar). */
var MF_FUT_N=13;
function mfFutMonths(){const cur=TD.slice(0,7);return Array.from({length:MF_FUT_N},(_,i)=>nm(cur,i))}
function mfFutBlock(){const ks=mfFutMonths(),D=ks.map(mfFutData),cur=ks[0];let sel=window.__futSel;if(!ks.includes(sel))sel=window.__futSel=cur;
 const mx0=Math.max(0,...D.map(d=>Math.max(d.e.t,d.s.t,d.i.t))),mx=mx0>0?mfNice(mx0):1,any=mx0>0;
 const bar=(x,c)=>`<i class="${c}" style="height:${(x.t/mx*100).toFixed(1)}%">${x.p>0.005&&x.t>0?`<b style="height:${(x.p/x.t*100).toFixed(1)}%"></b>`:''}</i>`;
 const ml=k=>MES[+k.slice(5)-1]+(k.slice(5)==='01'||k===cur?'/'+k.slice(2,4):'');
 const cols=D.map(d=>`<button type="button" class="mf-fut-c${d.k===sel?' on':''}${d.k===cur?' cur':''}" data-fut="${d.k}" aria-pressed="${d.k===sel}" aria-label="${MESF[+d.k.slice(5)-1]} de ${d.k.slice(0,4)}: entradas ${R(d.e.t)}, saídas ${R(d.s.t)}, investido ${R(d.i.t)}"><span class="mf-fut-bars">${bar(d.e,'e')}${bar(d.s,'s')}${bar(d.i,'i')}</span><span class="mf-fut-m">${ml(d.k)}</span></button>`).join('');
 const d=D[ks.indexOf(sel)],isCur=sel===cur,acc=D.slice(0,ks.indexOf(sel)+1).reduce((s,x)=>s+x.bal,0);
 const kv=(c,l,x)=>`<div class="${c}"><small>${l}</small><b>${R(x.t)}</b>${isCur&&x.r>0.005&&x.p>0.005?`<em>realizado ${R(x.r)} · previsto ${R(x.p)}</em>`:!isCur&&x.r>0.005&&x.t>0?`<em>${x.r>=x.t-0.005?'já lançado':'inclui '+R(x.r)+' já lançado'}</em>`:''}</div>`;
 const det=`<div class="mf-fut-det"><div class="mf-fut-dh"><button type="button" data-futgo="-1" aria-label="Mês anterior"${ks.indexOf(sel)===0?' disabled':''}>‹</button><div><b>${MESF[+sel.slice(5)-1]} ${sel.slice(0,4)}</b><small>${isCur?'Realizado até hoje + previsto':'Previsto'}</small></div><button type="button" data-futgo="1" aria-label="Próximo mês"${ks.indexOf(sel)===ks.length-1?' disabled':''}>›</button></div>
  <div class="mf-fut-kv">${kv('e','Entradas',d.e)}${kv('s','Saídas',d.s)}${kv('i','Investido',d.i)}<div class="bal"><small>Saldo previsto</small><b class="${d.bal>0.005?'ok':d.bal<-0.005?'bad':''}">${d.bal<-0.005?'−':''}${R(Math.abs(d.bal))}</b><em>entradas − saídas − investido</em></div></div>
  ${ks.indexOf(sel)>0?`<div class="mf-fut-acc">Acumulado de ${mfMs(cur)} a ${mfMs(sel)}: <b class="${acc>0.005?'ok':acc<-0.005?'bad':''}">${acc<-0.005?'−':''}${R(Math.abs(acc))}</b></div>`:''}</div>`;
 return B('d_fut')+`<section class="c mf-fut"><h2>Visão do Futuro</h2>
 <div class="mf-fut-leg" aria-hidden="true"><span class="e">Entrada</span><span class="s">Saída</span><span class="i">Investido</span><span class="pv">Previsto</span></div>
 ${any?`<div class="mf-fut-sc"><div class="mf-fut-cols" role="group" aria-label="Próximos ${MF_FUT_N} meses">${cols}</div></div>${det}`:'<p class="mf-empty">Ainda não há lançamentos para os próximos meses. Recorrentes, parcelas e contas futuras aparecem aqui automaticamente.</p>'}
 <p class="mf-fut-note">Com base só nos lançamentos cadastrados: recorrentes, parcelas (no mês da fatura) e contas futuras. Pagamento de fatura não conta como saída.</p></section>`}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 const c=t.closest('[data-fut]');if(c){e.preventDefault();e.stopPropagation();window.__futSel=c.dataset.fut;draw();return}
 const g=t.closest('[data-futgo]');if(g){e.preventDefault();e.stopPropagation();const ks=mfFutMonths(),i=ks.indexOf(window.__futSel||ks[0]),j=Math.max(0,Math.min(ks.length-1,i+(+g.dataset.futgo||0)));window.__futSel=ks[j];draw()}},true);
window.__mfAD.push(function(){const sc=document.querySelector('#app .mf-fut-sc');if(!sc)return;if(window.__futSL!=null)sc.scrollLeft=window.__futSL;const on=sc.querySelector('.mf-fut-c.on');if(on&&(on.offsetLeft<sc.scrollLeft||on.offsetLeft+on.offsetWidth>sc.scrollLeft+sc.clientWidth))sc.scrollLeft=Math.max(0,on.offsetLeft-sc.clientWidth/2+on.offsetWidth/2);window.__futSL=sc.scrollLeft;sc.addEventListener('scroll',()=>{window.__futSL=sc.scrollLeft},{passive:true})});
/* posição no Dashboard: logo depois do Fluxo de caixa (também para quem já tem a ordem salva) */
(function(){const ins=a=>{if(a.includes('d_fut'))return;const i=a.indexOf('cashflow');a.splice(i<0?a.length:i+1,0,'d_fut')};ins(MF_ORD.res);ins(MF_ORD_D.res);if(!MF_DWIDE.includes('d_fut'))MF_DWIDE.push('d_fut')})();
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__fut66)return;if(L.o&&Array.isArray(L.o.res)&&!L.o.res.includes('d_fut')){const a=L.o.res,i=a.indexOf('cashflow');a.splice(i<0?a.length:i+1,0,'d_fut')}L.__fut66=1;save()}catch(e){}});
if(!MF_VIEW.d_fut)MF_VIEW.d_fut={t:'Visão do Futuro',o:[{k:'chart',l:'Gráfico de barras',g:'Valores',sel:'.mf-fut-sc',t:'b',d:true},{k:'kv',l:'Valores do mês escolhido',g:'Valores',sel:'.mf-fut-kv',t:'b',d:true},{k:'sub',l:'Realizado e previsto',g:'Informações secundárias',sel:'.mf-fut-kv em',t:'b',d:true},{k:'acc',l:'Acumulado no período',g:'Informações secundárias',sel:'.mf-fut-acc',t:'b',d:true},{k:'leg',l:'Legenda',g:'Indicadores',sel:'.mf-fut-leg',t:'b',d:true},{k:'note',l:'Observação',g:'Outras informações',sel:'.mf-fut-note',t:'b',d:true}]};

/* ===== Patch 67 · Etapa 8: avisos de vencimento da fatura (no app, sem duplicar, param quando paga) ===== */
function mfFatAlertOn(){const n=(S.prefs&&S.prefs.notif)||{};return n.faturas!==false}
function mfFatNotices(all){if(!all&&!mfFatAlertOn())return [];const cur=mfFatCur(),N=mfFatDays(),out=[];
 [nm(cur,-2),nm(cur,-1),cur,nm(cur,1)].forEach(k=>{const inv=cbInvoice(k);if(!(inv.total>0.005)||mfFatPaid(k))return;const d=mfDaysTo(inv.due),v=inv.left>0.005?inv.left:inv.total;
  if(d<0)out.push({k,st:'late',d,due:inv.due,v});else if(d===0)out.push({k,st:'day',d,due:inv.due,v});else if(d<=N)out.push({k,st:'pre',d,due:inv.due,v})});
 return out}
/* bloco Avisos do Dashboard: fatura com a mesma regra (antes, no dia, vencida) */
/* Avisos: cada tipo tem origem e pode ser ligado/desligado em Configurar (S.prefs.avisos) */
var MF_AL_SRC=[['fat','Faturas do cartão','Cartão'],['contas','Contas a vencer','Contas'],['saldo','Saldo previsto do mês','Saldo'],['gastos','Gastos x mês anterior','Despesas'],['regra','Distribuição 50/30/20','Orçamento'],['teto','Ativos acima do teto','Investimentos'],['tetocat','Tetos por categoria','Orçamento'],['prov','Proventos recebidos','Investimentos']];
function mfAlPrefs(){S.prefs=S.prefs||{};const a=S.prefs.avisos&&typeof S.prefs.avisos==='object'?S.prefs.avisos:{};return {on:Object.assign({fat:1,contas:1,saldo:1,gastos:1,regra:1,teto:1,prov:1,tetocat:0},a.on||{}),n:[3,5,0].includes(a.n)?a.n:3}}
function mfAlerts(){const out=[],cur=TD.slice(0,7),prev=nm(cur,-1),tom=new Date(TD+'T12:00:00');tom.setDate(tom.getDate()+1);const tomS=tom.toISOString().slice(0,10),P=mfAlPrefs().on,add=(k,o)=>{if(P[k])out.push(Object.assign({k,src:(MF_AL_SRC.find(x=>x[0]===k)||[])[2]||''},o))};
 try{mfFatNotices(true).forEach(n=>{const dt=n.due.slice(8,10)+'/'+n.due.slice(5,7);add('fat',n.st==='late'?{lv:'bad',t:`Fatura do cartão venceu em ${dt}`,v:R(n.v),go:'mais'}:n.st==='day'?{lv:'wa',t:`Fatura do cartão vence hoje (${dt})`,v:R(n.v),go:'mais'}:{lv:'wa',t:`Fatura do cartão vence ${n.d===1?'amanhã':'em '+n.d+' dias'} (${dt})`,v:R(n.v),go:'mais'})})}catch(e){}
 try{const items=[...mfDueItems(prev).filter(x=>!x.paid&&x.d<TD),...mfDueItems(cur)];if(tomS.slice(0,7)!==cur)items.push(...mfDueItems(tomS.slice(0,7)).filter(x=>x.d===tomS));
  const seen=new Set();items.forEach(it=>{if(it.fat||it.paid||seen.has(it.key))return;seen.add(it.key);const dt=it.d.slice(8,10)+'/'+it.d.slice(5,7);
   if(it.d<TD)add('contas',{lv:'bad',t:`${it.n} venceu em ${dt}`,v:R(it.v),go:'mais'});else if(it.d===TD)add('contas',{lv:'wa',t:`${it.n} vence hoje`,v:R(it.v),go:'mais'});else if(it.d===tomS)add('contas',{lv:'wa',t:`${it.n} vence amanhã`,v:R(it.v),go:'mais'})})}catch(e){}
 try{const [y,m]=cur.split('-').map(Number),fim=cur+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0'),sp=cashBalanceAt(fim);if(sp<-0.005)add('saldo',{lv:'bad',t:'Saldo previsto do mês negativo',v:'−'+R(Math.abs(sp)),go:'res'})}catch(e){}
 try{const a=dashStats(cur,true).exp,b=dashStats(prev).exp;if(b>0.005&&a>b)add('gastos',{lv:'wa',t:`Gastos do mês já passaram os de ${MESF[+prev.slice(5)-1].toLowerCase()}`,v:R(a-b)+' a mais',go:'anal'})}catch(e){}
 try{const {income,G}=mfBudgetG();if(income>0)G.forEach(g=>{if(g.name==='Investimentos')return;if(g.p>1)add('regra',{lv:'bad',t:`${g.name} passou dos ${Math.round(g.pct*100)}% da renda`,v:`${Math.round(g.actual/income*100)}%`,go:'res'});else if(g.p>=.9)add('regra',{lv:'wa',t:`${g.name} perto dos ${Math.round(g.pct*100)}% da renda`,v:`${Math.round(g.actual/income*100)}%`,go:'res'})})}catch(e){}
 try{mfTetoRows(cur).forEach(r=>{if(r.p>100)add('tetocat',{lv:'bad',t:`${r.c} passou do teto`,v:`${Math.round(r.p)}%`,go:'res'});else if(r.p>=90)add('tetocat',{lv:'wa',t:`${r.c} perto do teto`,v:`${Math.round(r.p)}%`,go:'res'})})}catch(e){}
 try{mfOverCap().slice(0,2).forEach(x=>add('teto',{lv:'wa',t:`${x.a} acima do teto de ${mfCap()}%`,v:`${x.p.toFixed(1).replace('.',',')}%`,go:'inv'}))}catch(e){}
 try{const d7=new Date(TD+'T12:00:00');d7.setDate(d7.getDate()-7);const from=d7.toISOString().slice(0,10),pv=S.tx.filter(t=>t&&t.c==='Receita'&&t.d>from&&t.d<=TD&&(t.pva||t.s==='Proventos'));if(pv.length)add('prov',{lv:'ok',t:`Proventos recebidos nos últimos 7 dias (${pv.length})`,v:R(pv.reduce((s,t)=>s+(+t.v||0),0)),go:'inv'})}catch(e){}
 /* tipo ligado sem alerta: mostra a situação atual (assim todo tipo escolhido aparece) */
 const has=k=>out.some(x=>x.k===k),info=(k,t,v,go,lv)=>add(k,{lv:lv||'info',t,v,go});
 try{if(P.fat&&!has('fat')){const ks=[cur,nm(cur,1),nm(cur,2)];let f=null;for(const k of ks){const i=cbInvoice(k);if(i.total>0.005&&i.left>0.005){f={k,i};break}}
  if(f)info('fat',`Próxima fatura: ${MESF[+f.k.slice(5)-1].toLowerCase()} · vence ${f.i.due.slice(8,10)}/${f.i.due.slice(5,7)}`,R(f.i.left),'mais');else info('fat','Nenhuma fatura em aberto','✓','mais','ok')}}catch(e){}
 try{if(P.contas&&!has('contas')){const L=[...mfDueItems(cur),...mfDueItems(nm(cur,1))].filter(x=>!x.fat&&!x.paid&&x.d>=TD).sort((x,z)=>x.d<z.d?-1:1),nx=L[0];
  if(nx)info('contas',`Próxima conta: ${nx.n} · ${nx.d.slice(8,10)}/${nx.d.slice(5,7)}`,R(nx.v),'mais');else info('contas','Nenhuma conta a vencer','✓','mais','ok')}}catch(e){}
 try{if(P.saldo&&!has('saldo')){const [y,m]=cur.split('-').map(Number),fim=cur+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0');info('saldo','Saldo previsto para o fim do mês',R(cashBalanceAt(fim)),'res','ok')}}catch(e){}
 try{if(P.gastos&&!has('gastos')){const a=dashStats(cur,true).exp,b=dashStats(prev).exp;info('gastos',`Gastos do mês até agora${b>0?` · ${Math.round(a/b*100)}% de ${MESF[+prev.slice(5)-1].toLowerCase()}`:''}`,R(a),'anal')}}catch(e){}
 try{if(P.regra&&!has('regra')){const {income,G}=mfBudgetG(),g=G.filter(x=>x.name!=='Investimentos').sort((x,z)=>z.p-x.p)[0];if(income>0&&g)info('regra',`${g.name}: ${Math.round(g.p*100)}% do limite de ${Math.round(g.pct*100)}%`,R(g.actual),'res','ok');else info('regra','50/30/20: registre uma receita no mês','—','res')}}catch(e){}
 try{if(P.tetocat&&!has('tetocat')){const r=mfTetoRows(cur);info('tetocat',r.length?`Tetos: ${r.length} ${r.length===1?'categoria':'categorias'} dentro do limite`:'Nenhum teto por categoria definido','✓','res','ok')}}catch(e){}
 try{if(P.teto&&!has('teto'))info('teto',`Nenhum ativo acima do teto de ${mfCap()}%`,'✓','inv','ok')}catch(e){}
 try{if(P.prov&&!has('prov')){const mes=S.tx.filter(t=>t&&t.d&&t.d<=TD&&t.d.slice(0,7)===cur&&mfIsProv(t)).reduce((s,t)=>s+(+t.v||0),0),o=window.__pva||{},fut=(o.rows||[]).filter(r=>r.data_pagamento&&r.data_pagamento>TD&&r.data_pagamento.slice(0,7)===cur).reduce((s,r)=>s+(+r.total||0),0);
  info('prov',`Proventos do mês${fut>0?` · ${R(fut)} a receber`:''}`,R(mes),'inv','ok')}}catch(e){}
 const ord={bad:0,wa:1,ok:2,info:3};return out.sort((x,z)=>(ord[x.lv]??4)-(ord[z.lv]??4))}
/* 1.18: saiu o aviso que aparecia por cima da tela ao abrir o app (fatura perto do vencimento, no dia ou vencida).
   A situação da fatura continua no bloco Avisos do Dashboard e, se ligado, nas notificações do celular (push). */

/* ===== Patch 68 · Etapa 9: gesto de voltar (borda esquerda) e voltar do sistema, sem sair do app ===== */
(function(){
 const isMob=()=>document.documentElement.classList.contains('mf-mob')||!document.documentElement.classList.contains('mf-desk');
 const stack=[];let prev=null,backing=false,lastPop=0;
 /* histórico interno das telas (abas) */
 window.__mfPre.push(function(){if(prev&&prev!==tab&&!backing){if(stack[stack.length-1]!==prev)stack.push(prev);if(stack.length>30)stack.shift()}prev=tab;backing=false});
 const vis=el=>!!el&&el.isConnected&&!el.hidden&&el.style.display!=='none';
 const clickIn=(el,sel)=>{const b=el.querySelector(sel);if(b){b.click();return true}return false};
 /* fecha o que estiver por cima: confirmação, folhas, edição, configurações… */
 function closeTop(){
  const c=document.getElementById('mf-confirm');if(vis(c)){if(!clickIn(c,'button[data-cf="no"]'))c.remove();return true}
  const vw=document.getElementById('mf-vw-sheet');if(vis(vw)){vw.remove();return true}
  const mv=document.getElementById('mf-mv-sheet');if(vis(mv)){if(!clickIn(mv,'[data-mvgo="close"]'))mv.remove();return true}
  const lp=document.getElementById('mf-lp');if(vis(lp)){if(!clickIn(lp,'[data-lp="close"]'))lp.remove();return true}
  const tx=document.getElementById('tx-edit-backdrop');if(vis(tx)){if(!clickIn(tx,'[data-tx-modal="close"]'))tx.remove();return true}
  const nt=document.getElementById('mf-note');if(vis(nt)){nt.remove();return true}
  const cfg=document.getElementById('mf-cfg');if(vis(cfg)){const p=cfg.querySelector('.mfc-panel');if(p&&p.dataset.v&&p.dataset.v!=='main'&&clickIn(cfg,'.mfc-back'))return true;window.mfCfgClose&&mfCfgClose();return true}
  const dl=[...document.querySelectorAll('body>[role="dialog"][aria-modal="true"]')].filter(x=>vis(x)&&x.id!=='cloud-auth').pop();if(dl){if(!clickIn(dl,'[data-close],[data-cfgclose],[data-mvgo="close"],[data-vwk="close"],.mf-mv-cancel'))dl.remove();return true}
  if(window.__mfSelOn){window.__mfSelOn=false;draw();return true}
  if(window.__provOpen){window.__provOpen=false;window.__provF=null;draw();return true}
  return false}
 window.mfBack=function(){if(closeTop())return true;if(window.mfPageBack&&mfPageBack())return true;if(stack.length){backing=true;tab=stack.pop();window.__mfLastTab=null;draw();scrollTo(0,0);return true}return false};
 window.mfBackDepth=()=>stack.length;
 /* voltar do sistema (Android, iPhone no navegador): volta dentro do app e nunca sai dele */
 let armed=false;const arm=()=>{if(armed||!isMob())return;armed=true;try{history.pushState({mfnav:1},'')}catch(e){}};
 ['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,arm,{capture:true,passive:true}));
 window.addEventListener('popstate',()=>{if(!armed)return;lastPop=Date.now();window.mfBack();try{history.pushState({mfnav:1},'')}catch(e){}});
 /* gesto: deslizar a partir da borda esquerda (inclusive no app instalado no iPhone) */
 let g=null,ind=null;
 const show=(p,y)=>{if(!ind){ind=document.createElement('div');ind.id='mf-backind';ind.setAttribute('aria-hidden','true');ind.innerHTML='<span>‹</span>';document.body.appendChild(ind)}ind.style.top=Math.max(60,Math.min(innerHeight-120,y-22))+'px';ind.style.setProperty('--p',p.toFixed(3));ind.classList.toggle('go',p>=1)};
 const hide=()=>{if(ind){ind.remove();ind=null}};
 document.addEventListener('touchstart',e=>{g=null;if(!isMob()||e.touches.length!==1)return;const t=e.touches[0];if(t.clientX>22)return;g={x:t.clientX,y:t.clientY,t:Date.now()}},{passive:true,capture:true});
 document.addEventListener('touchmove',e=>{if(!g)return;const t=e.touches[0],dx=t.clientX-g.x,dy=t.clientY-g.y;if(Math.abs(dy)>45&&Math.abs(dy)>dx){g=null;hide();return}if(dx>8)show(Math.min(1,dx/80),t.clientY)},{passive:true,capture:true});
 document.addEventListener('touchend',e=>{if(!g)return;const t=e.changedTouches[0],dx=t.clientX-g.x,dy=t.clientY-g.y,dt=Date.now()-g.t;g=null;hide();if(dx>=80&&Math.abs(dy)<70&&dt<1000&&Date.now()-lastPop>700)window.mfBack()},{passive:true,capture:true});
 document.addEventListener('touchcancel',()=>{g=null;hide()},{passive:true,capture:true});
})();

/* ===== Patch 69 · Etapa 10: login com animações leves, cadastro com confirmação de senha e rodapé das Configurações ===== */
/* e-mail de contato do rodapé: preencha aqui quando quiser (ex.: 'contato@seudominio.com') */
var MF_CONTATO_EMAIL='contatowillians@outlook.com';
function mfCfgFoot(){const em=String(window.MF_CONTATO_EMAIL||'').trim();return `<footer class="mfc-foot"><b>Desenvolvido por mim</b><span>Contato para sugestões, dúvidas ou suporte.</span><span>E-mail: ${em?`<a href="mailto:${escH(em)}">${escH(em)}</a>`:'[ENDEREÇO DE E-MAIL]'}</span><span class="mfc-ver">Versão ${escH(typeof MF_VER!=='undefined'?MF_VER:'')}</span></footer>`}
function mfAuthEls(){return {card:document.querySelector('#cloud-auth .auth-card'),form:document.getElementById('cloud-auth-form'),cf:document.getElementById('cloud-password2'),cfw:document.getElementById('cloud-cf-wrap'),pw:document.getElementById('cloud-password'),login:document.getElementById('cloud-login'),sign:document.getElementById('cloud-signup'),ok:document.getElementById('cloud-auth-ok'),err:document.getElementById('cloud-auth-err'),sub:document.querySelector('#cloud-auth .auth-sub')}}
function mfAuthMsg(kind,html){const E=mfAuthEls();if(!E.ok||!E.err)return;E.ok.hidden=kind!=='ok';E.err.hidden=kind!=='err';if(kind==='ok')E.ok.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg><div>${html}</div>`;if(kind==='err')E.err.textContent=html}
function mfAuthState(st){const E=mfAuthEls();if(!E.card||!E.form)return;E.card.classList.toggle('is-ok',st==='ok');if(st==='err'){E.form.classList.remove('mf-shake');void E.form.offsetWidth;E.form.classList.add('mf-shake')}}
function mfAuthMode(mode,keep){const E=mfAuthEls();if(!E.form)return;const su=mode==='signup';E.form.classList.toggle('mf-signup',su);E.form.noValidate=su;
 if(E.cfw)E.cfw.setAttribute('aria-hidden',su?'false':'true');if(E.cf){E.cf.required=su;E.cf.tabIndex=su?0:-1;if(!su)E.cf.value=''}
 if(E.pw)E.pw.setAttribute('autocomplete',su?'new-password':'current-password');
 if(E.login&&!E.login.disabled)E.login.textContent=su?'Criar conta':'Entrar';if(E.sign)E.sign.textContent=su?'Já tenho conta':'Criar conta';
 if(E.sub){E.sub.dataset.t0=E.sub.dataset.t0||E.sub.textContent;E.sub.textContent=su?'Crie sua conta com e-mail e senha. Seus dados ficam guardados e sincronizados no celular e no computador.':E.sub.dataset.t0}
 if(E.card)E.card.classList.remove('is-ok');if(!keep)mfAuthMsg('none');
 if(su&&E.cf)setTimeout(()=>{try{(document.getElementById('cloud-email').value?(E.pw.value?E.cf:E.pw):document.getElementById('cloud-email')).focus({preventScroll:true})}catch(_){}},60)}
document.addEventListener('input',e=>{if(e.target&&e.target.closest&&e.target.closest('#cloud-auth-form')){const E=mfAuthEls();if(E.err)E.err.hidden=true}},true);

/* ===== Patch 70: avisos de fatura no celular com o app fechado (Web Push via Supabase) ===== */
var MF_VAPID_PUB='BOdYtH-gDSOHVBY3AFQXa3JcvL39Qi2Z710NCODfcC2wRu4Sfr5zpqbbQOoS4qPDsRATqaZkQhQ4xmJCZ2ax128';
function mfPushSupport(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window&&location.protocol.startsWith('http')}
function mfB64(s){const p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...b].map(c=>c.charCodeAt(0)))}
async function mfPushSub(){try{const r=await navigator.serviceWorker.getRegistration();return r?await r.pushManager.getSubscription():null}catch(e){return null}}
async function mfPushRefresh(){if(!mfPushSupport()){window.__mfPush='nosup';return}const s=await mfPushSub();window.__mfPush=s&&Notification.permission==='granted'?'on':Notification.permission==='denied'?'denied':'off';window.mfCfgRender&&document.getElementById('mf-cfg')&&!document.getElementById('mf-cfg').hidden&&mfCfgRender()}
function mfPushHtml(){const st=window.__mfPush,logged=typeof authUser!=='undefined'&&authUser;if(st===undefined)setTimeout(mfPushRefresh,0);
 let body;
 if(!logged)body='<p class="mfc-note" style="margin:0">Entre na sua conta para receber os avisos no celular.</p>';
 else if(mfIsIOS()&&!mfStandalone())body='<p class="mfc-note" style="margin:0">No iPhone, primeiro instale o app: no Safari toque em Compartilhar › <b>Adicionar à Tela de Início</b>. Depois abra pelo ícone e ative aqui.</p>';
 else if(st==='nosup')body='<p class="mfc-note" style="margin:0">Este navegador não aceita avisos com o app fechado.</p>';
 else if(st==='denied')body='<p class="mfc-note" style="margin:0">As notificações estão bloqueadas para este site. Libere nas configurações do navegador e volte aqui.</p>';
 else if(st==='on')body='<p class="mfc-note" style="margin:0 0 10px">Ativado neste aparelho. Você recebe o aviso da fatura mesmo com o app fechado (todo dia às 9h, quando houver).</p><button type="button" class="mfc-btn ghost" data-push="off">Desativar neste aparelho</button>';
 else body='<p class="mfc-note" style="margin:0 0 10px">Receba o aviso da fatura mesmo com o app fechado.</p><button type="button" class="mfc-btn" data-push="on">Ativar avisos neste aparelho</button>';
 return `<div class="mfc-group mfc-pad"><div class="mfc-lb">Com o app fechado</div>${body}</div>`}
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('#mf-cfg [data-push]');if(!b)return;e.preventDefault();e.stopPropagation();if(b.disabled)return;b.disabled=true;const act=b.dataset.push;
 try{if(act==='on'){if(!supabaseClient||!authUser){mfToast('Entre na sua conta primeiro.');return}
   const perm=await Notification.requestPermission();if(perm!=='granted'){window.__mfPush=perm==='denied'?'denied':'off';mfToast('Notificações não permitidas.');return}
   const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:mfB64(MF_VAPID_PUB)});
   const j=sub.toJSON(),{error}=await MF_DB.push.save({user_id:authUser.id,endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,user_agent:navigator.userAgent.slice(0,200)});
   if(error)throw error;window.__mfPush='on';mfToast('Avisos ativados neste aparelho ✓')}
  else{const sub=await mfPushSub();if(sub){const ep=sub.endpoint;await sub.unsubscribe();if(supabaseClient&&authUser)await MF_DB.push.remove(ep)}window.__mfPush='off';mfToast('Avisos desativados neste aparelho')}}
 catch(err){console.warn('push',err);mfToast('Não foi possível ativar agora. Tente de novo.')}
 finally{b.disabled=false;window.mfCfgRender&&mfCfgRender()}},true);
/* tocar no aviso abre Contas na fatura certa */
(function(){try{const q=new URLSearchParams(location.search),k=q.get('fatura');if(q.get('aba')==='contas'){window.__mfOpenFat=/^\d{4}-\d{2}$/.test(k||'')?k:'';history.replaceState(null,'',location.pathname)}}catch(e){}})();
window.__mfPre.push(function(){if(window.__mfOpenFat===undefined)return;const k=window.__mfOpenFat;window.__mfOpenFat=undefined;tab='mais';window.__ctMode='contas';if(k)window.__cbm=k;window.__cbOpen=Object.assign(window.__cbOpen||{},{pay:true});if(!(window.mfIsDesk&&mfIsDesk())){window.__ctPg='pagar';window.__ctPilha=[null]}});

/* ===== Patch 72: Oscilação da carteira (valor por dia salvo no Supabase, 45 dias) ===== */
var MF_OSC_P=[15,30];
function mfOscLoad(force){const o=window.__osc||(window.__osc={});if(typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser){o.rows=null;o.off=true;return}o.off=false;
 if(o.busy||(!force&&o.rows&&Date.now()-o.at<6e5))return;o.busy=true;
 MF_DB.portfolio.daily(authUser.id).then(({data,error})=>{o.busy=false;o.at=Date.now();o.err=error?error.message:'';o.rows=error?(o.rows||null):(data||[]);if(tab==='inv')mfDrawLater()},()=>{o.busy=false;o.at=Date.now();o.err='rede'})}
function mfOscSeries(){const o=window.__osc||{},P=MF_OSC_P.includes(window.__oscP)?window.__oscP:30,lim=new Date(Date.now()-P*864e5).toISOString().slice(0,10);
 const r=(o.rows||[]).filter(x=>x.dia>=lim);if(!r.length)return {P,pts:[]};const a0=+r[0].aplicado||0;
 return {P,pts:r.map(x=>({d:x.dia,v:(+x.valor||0)-((+x.aplicado||0)-a0),raw:+x.valor||0,est:!!x.estimado}))}}
var MF_DES_P=[['15','15d'],['30','30d'],['6','6m'],['12','12m'],['24','24m']];
function mfDesP(){const v=String(mfView('i_osc','p','30'));return MF_DES_P.some(x=>x[0]===v)?v:'30'}
function mfOscBlock(){const dp=mfDesP(),longo=['6','12','24'].includes(dp);
 const seg=`<div class="mf-osc-seg mf-des-seg">${MF_DES_P.map(([v,t])=>`<button type="button" class="${v===dp?'on':''}" data-desp="${v}" aria-label="${t.replace('d',' dias').replace('m',' meses')}">${t}</button>`).join('')}</div>`;
 if(longo)return B('i_osc')+`<section class="c mf-osc mf-bench"><h2>Desempenho da carteira</h2>${seg}${mfBenchBody(+dp)}</section>`;
 window.__oscP=+dp;mfOscLoad(false);const o=window.__osc||{},S_=mfOscSeries(),pts=S_.pts,desk=window.mfIsDesk&&mfIsDesk();
 let body;
 if(o.off)body='<p class="mf-empty">Entre na sua conta para ver a oscilação da carteira.</p>';
 else if(!o.rows)body=`<p class="mf-empty">${o.err?'Não foi possível carregar agora.':'Carregando…'}</p>`;
 else if(pts.length<2)body='<p class="mf-empty">O gráfico começa a encher a partir do primeiro dia útil salvo. Volte amanhã depois das 18h40.</p>';
 else{const W=desk?640:320,H=desk?170:150,L=4,Rr=4,T=10,Bt=18,vs=pts.map(p=>p.v),mn=Math.min(...vs),mx=Math.max(...vs),pad=(mx-mn)*.08||Math.max(1,mx*.002),lo=mn-pad,hi=mx+pad,
   X=i=>L+(W-L-Rr)*(pts.length===1?0:i/(pts.length-1)),Y=v=>T+(H-T-Bt)*(1-(v-lo)/(hi-lo)),first=pts[0].v,last=pts[pts.length-1].v,ch=last-first,pc=first?ch/first*100:0,cls=ch>0.005?'ok':ch<-0.005?'bad':'mu',col=cls==='ok'?'var(--ok)':cls==='bad'?'var(--bad)':'var(--mu)';
   const line=pts.map((p,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(p.v).toFixed(1)).join(' '),area=line+` L${X(pts.length-1).toFixed(1)} ${H-Bt} L${X(0).toFixed(1)} ${H-Bt} Z`,yb=Y(first).toFixed(1);
   const dl=d=>d.slice(8,10)+'/'+d.slice(5,7),mid=Math.floor((pts.length-1)/2),est=pts.some(p=>p.est);
   const ct=mfChart('i_osc','area'),dch=pts.map((p,i)=>i?p.v-pts[i-1].v:0),dmx=Math.max(...dch.map(Math.abs),0.01),y0=T+(H-T-Bt)/2,bw=Math.max(1.5,(W-L-Rr)/pts.length*.62);
   const draw_=ct==='barras'?`<line x1="${L}" x2="${W-Rr}" y1="${y0}" y2="${y0}" stroke="var(--ln)"/>`+dch.map((v,i)=>{if(!i)return '';const hh=Math.abs(v)/dmx*((H-T-Bt)/2);return `<rect x="${(X(i)-bw/2).toFixed(1)}" y="${(v>=0?y0-hh:y0).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(.8,hh).toFixed(1)}" rx="1" fill="${v>=0?'var(--ok)':'var(--bad)'}"/>`}).join('')
    :`<line x1="${L}" x2="${W-Rr}" y1="${yb}" y2="${yb}" stroke="var(--ln)" stroke-dasharray="3 4"/>${ct==='linha'?'':`<path d="${area}" fill="${col}" fill-opacity=".12"/>`}<path d="${line}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
   const svg=`<svg class="mf-osc-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Oscilação da carteira nos últimos ${S_.P} dias" data-oscn="${pts.length}" data-oscw="${W}">${draw_}<line class="mf-osc-cur" x1="0" x2="0" y1="${T}" y2="${H-Bt}" stroke="var(--mu)" stroke-width="1" opacity="0"/>${[0,mid,pts.length-1].map(i=>`<text x="${X(i).toFixed(1)}" y="${H-4}" font-size="10.5" fill="var(--mu)" text-anchor="${i===0?'start':i===pts.length-1?'end':'middle'}">${dl(pts[i].d)}</text>`).join('')}</svg>`;
   window.__oscPts=pts;
   body=`<div class="mf-osc-top"><div><small>Variação em ${S_.P} dias</small><b class="${cls}">${ch>0.005?'+':ch<-0.005?'−':''}${R(Math.abs(ch))} <em>(${ch>=0?'+':'−'}${Math.abs(pc).toFixed(1).replace('.',',')}%)</em></b></div></div>
   <div class="mf-osc-ch">${svg}</div><div class="mf-osc-tip" aria-live="polite">Toque no gráfico para ver cada dia.</div>
   <p class="mf-osc-note">Aportes descontados: mostra só a subida ou queda das cotações. Atualiza nos dias úteis às 18h40.${est?' Os dias antes do primeiro registro foram estimados com as quantidades de hoje.':''}</p>`}
 return B('i_osc')+`<section class="c mf-osc"><h2>Desempenho da carteira</h2>${seg}${body}</section>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-desp]');if(!b)return;e.preventDefault();e.stopPropagation();S.view=S.view||{};S.view.i_osc=Object.assign({},S.view.i_osc,{p:b.dataset.desp});save();draw()},true);
function mfOscTip(ev){const sv=ev.target.closest&&ev.target.closest('.mf-osc-svg');if(!sv)return;const pts=window.__oscPts||[];if(pts.length<2)return;const r=sv.getBoundingClientRect(),x=(ev.touches?ev.touches[0].clientX:ev.clientX)-r.left,i=Math.max(0,Math.min(pts.length-1,Math.round(x/r.width*(pts.length-1)))),p=pts[i],prev=pts[i-1],dv=prev?p.v-prev.v:0,dp=prev&&prev.v?dv/prev.v*100:0;
 const W=+sv.dataset.oscw,cx=4+(W-8)*(i/(pts.length-1)),cur=sv.querySelector('.mf-osc-cur');if(cur){cur.setAttribute('x1',cx);cur.setAttribute('x2',cx);cur.setAttribute('opacity','.6')}
 const tip=sv.closest('.mf-osc').querySelector('.mf-osc-tip');const acc=p.v-pts[0].v;if(tip)tip.innerHTML=`<b>${p.d.slice(8,10)}/${p.d.slice(5,7)}</b>${prev?` · <span class="${dv>0.005?'ok':dv<-0.005?'bad':'mu'}">${dv>=0?'+':'−'}${R(Math.abs(dv))} (${dp>=0?'+':'−'}${Math.abs(dp).toFixed(1).replace('.',',')}%) no dia</span>`:''}${i?` · <span class="${acc>0.005?'ok':acc<-0.005?'bad':'mu'}">${acc>=0?'+':'−'}${R(Math.abs(acc))} no período</span>`:' · início do período'}${p.est?' · estimado':''}`}
document.addEventListener('click',mfOscTip,true);document.addEventListener('touchmove',e=>{if(e.target.closest&&e.target.closest('.mf-osc-svg'))mfOscTip(e)},{passive:true});
/* lugar: logo depois do Patrimônio total (também para ordem salva) */
(function(){const ins=a=>{if(!a||a.includes('i_osc'))return;const i=a.indexOf('dv_kpi');a.splice(i<0?0:i+1,0,'i_osc')};ins(MF_ORD.inv);ins(MF_ORD_D.inv);if(!MF_DWIDE.includes('i_osc'))MF_DWIDE.push('i_osc')})();
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__osc72)return;if(L.o&&Array.isArray(L.o.inv)&&!L.o.inv.includes('i_osc')){const a=L.o.inv,i=a.indexOf('dv_kpi');a.splice(i<0?0:i+1,0,'i_osc')}L.__osc72=1;save()}catch(e){}});
if(!MF_VIEW.i_osc)MF_VIEW.i_osc={t:'Oscilação da carteira',o:[{k:'top',l:'Variação no período',g:'Valores',sel:'.mf-osc-top',t:'b',d:true},{k:'seg',l:'Botões 15/30/45 dias',g:'Outras informações',sel:'.mf-osc-seg',t:'b',d:true},{k:'tip',l:'Detalhe do dia tocado',g:'Informações secundárias',sel:'.mf-osc-tip',t:'b',d:true},{k:'note',l:'Observação',g:'Informações secundárias',sel:'.mf-osc-note',t:'b',d:true}]};


/* ===== Patch 74 (+78): proventos automáticos (Supabase › tabela proventos; fonte Dados B3, Yahoo de reserva) + gráfico ano a ano ===== */
/* Cada pagamento vira uma receita "Proventos TICKER" na DATA DE PAGAMENTO (sem ela, na data com), uma vez só,
   e só quando a data chega. Se o usuário apagar a receita, ela não volta (S.pvaDone guarda o que já foi lançado). */
function mfPvaId(r){return 'pva_'+(r.chave||(r.ticker+'_'+r.data_ex))}
function mfPvaDate(r){return r.data_pagamento||r.data_com}
var MF_PVA_TIPO={DIVIDENDO:'Dividendo',JCP:'JCP',RENDIMENTO:'Rendimento'};
function mfPvaLoad(force){const o=window.__pva||(window.__pva={});
 if(typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser||!cloudLast)return;
 if(o.busy||(!force&&o.at&&Date.now()-o.at<6e5&&o.uid===authUser.id))return;o.busy=true;const uid=authUser.id;
 MF_DB.proventos.list(uid).then(({data,error})=>{o.busy=false;o.at=Date.now();o.uid=uid;if(error){o.err=error.message;return}o.err='';o.rows=data||[];mfPvaApply()},()=>{o.busy=false;o.at=Date.now()})}
function mfPvaApply(){const o=window.__pva||{};if(!o.rows||!o.rows.length||typeof authUser==='undefined'||!authUser||o.uid!==authUser.id)return;
 const done=Array.isArray(S.pvaDone)?S.pvaDone:(S.pvaDone=[]),has=new Set(S.tx.flatMap(t=>[t.id,t.pvk].filter(Boolean)));let n=0,tot=0,fix=0;
 o.rows.forEach(r=>{const id=mfPvaId(r),v=Math.round((+r.total||0)*100)/100,d=mfPvaDate(r);if(!(v>0)||!d||has.has(id))return;
  const old=S.tx.find(t=>t.pva&&!t.pvk&&/_(null|undefined)$/.test(String(t.id))&&String(t.tk||'').toUpperCase()===r.ticker&&Math.abs((+t.v||0)-v)<0.01);
  if(old){old.pvk=id;old.d=d;old.tp=r.tipo||old.tp||'';old.dc=r.data_com||old.dc||'';old.vc=+r.valor_cota||old.vc||0;old.qt=+r.qtd||old.qt||0;has.add(id);fix++}});
 o.rows.forEach(r=>{const id=mfPvaId(r),v=Math.round((+r.total||0)*100)/100,d=mfPvaDate(r);if(!(v>0)||!d||done.includes(id))return;
  if(d>TD)return; /* ainda não foi pago: entra no dia do pagamento */
  if(d<MF_PVA_DESDE)return; /* histórico importado: só para yield e médias, não vira receita */
  if(!has.has(id)){
   /* já lançado à mão (mesmo ativo no mesmo mês)? não duplica */
   const man=S.tx.find(t=>t.d&&!t.pva&&mfIsProv(t)&&t.d.slice(0,7)===d.slice(0,7)&&mfProvTk(t)===r.ticker);
   if(!man){S.tx.push({id,n:'Proventos '+r.ticker,v,e:'',d,c:'Receita',s:'Proventos',t:'',tk:r.ticker,pva:1,vc:+r.valor_cota||0,qt:+r.qtd||0,tp:r.tipo||'',dc:r.data_com||''});n++;tot+=v}}
  done.push(id)});
 if(done.length!==(o.lastDone||0)||n||fix){o.lastDone=done.length;save();if(fix&&!n)draw();if(n){draw();mfToast(n===1?`Provento lançado automaticamente: ${R(tot)} ✓`:`${n} proventos lançados automaticamente: ${R(tot)} ✓`)}}}
window.__mfAD.push(()=>{try{mfPvaLoad(false)}catch(e){}try{mfPvHistLoad()}catch(e){}});
/* Histórico dos últimos 13 meses (antes de MF_PVA_DESDE): vem da função proventos-historico e fica guardado em S.pvHist
   (sincroniza com a nuvem). Atualiza 1x por semana ou quando as compras dos ativos mudam. Só para yield e médias. */
function mfPvHistKey(){return (S.inv||[]).filter(a=>!a.f).map(a=>String(a.a||'').toUpperCase()+':'+(a.ops||[]).filter(o=>o&&o.d).map(o=>o.d+'/'+o.q).join(',')).sort().join(';')}
function mfPvHistLoad(force){if(typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser||!cloudLast||!navigator.onLine||window.__pvhBusy)return;
 if(TD>=nm(MF_PVA_DESDE.slice(0,7),12)+'-01'){if(S.pvHist){delete S.pvHist;save()}return} /* passados 13 meses, o histórico não é mais necessário */
 const H=S.pvHist,key=mfPvHistKey(),age=H&&H.at?Math.round((new Date(TD+'T12:00:00')-new Date(H.at+'T12:00:00'))/864e5):99;
 if(!force&&H&&H.h===key&&age<7)return;if(!force&&window.__pvhTry&&Date.now()-window.__pvhTry<6e5)return;
 window.__pvhBusy=true;window.__pvhTry=Date.now();
 MF_DB.proventos.history({body:{}}).then(({data,error})=>{window.__pvhBusy=false;if(error||!data||!Array.isArray(data.rows))return;
  const rows=data.rows.map(r=>({ticker:r.ticker,chave:r.chave,tipo:r.tipo,data_com:r.data_com,data_pagamento:r.data_pagamento,total:r.total,valor_cota:r.valor_cota}));
  const same=H&&JSON.stringify(H.rows)===JSON.stringify(rows);S.pvHist={at:TD,h:key,rows};save();if(!same)draw()},()=>{window.__pvhBusy=false})}
function mfProvYearBlock(){const L=mfProvYears();if(!L)return '';const desk=window.mfIsDesk&&mfIsDesk(),cy=TD.slice(0,4),cur=L.find(x=>x.y===cy),prev=L.find(x=>x.y===String(+cy-1));
 const cmp=cur&&prev&&prev.v>0?(()=>{const d=(cur.v-prev.v)/prev.v*100;return `<span class="${d>=0?'ok':'bad'}">${d>=0?'+':'−'}${Math.abs(d).toFixed(0)}% vs ${prev.y}</span>`})():'';
 const ctY=mfChart('i_pano','barras');
 return `<div class="mf-pvy">${ctY==='lista'?anRows(L.slice().reverse().map((x,i,a)=>{const p=a[i+1];return [x.y+(x.y===cy?' (até agora)':''),`<span class="ok">${R(x.v)}</span>`,{t:p&&p.v>0?`${x.v>=p.v?'+':'−'}${Math.abs((x.v-p.v)/p.v*100).toFixed(0)}%`:'—',c:p&&p.v>0?(x.v>=p.v?'ok':'bad'):'mu'}]})):mfSeriesView(L.map(x=>x.y),[{vals:L.map(x=>x.v),color:'var(--ok)',fill:true}],ctY,{every:1,aria:'Proventos por ano',w:desk?520:320,h:desk?120:130})}
 <div class="mf-pvy-l">${L.slice(-4).map(x=>`<span><small>${x.y}${x.y===cy?' (até agora)':''}</small><b>${R(x.v)}</b></span>`).join('')}</div></div>`}
(function(){const _pb=mfProvBlock;mfProvBlock=function(){let h=_pb();
 h=h.replace(/Cadastre aqui os dividendos, JCP e rendimentos que você recebe \(ou lance como receita, ex\.: "Dividendos GGRC11"\)\./,'Os proventos dos seus ativos aparecem aqui sozinhos, na data de pagamento.');
 return h};window.mfProvBlock=mfProvBlock})();
/* "Ano a ano": esteve em Análises › Anual (patch 79); desde o patch 85 fica em Investimentos › Proventos (bloco i_pano) */
/* histórico: marca os automáticos */
(function(){const _ph=mfProvHist;mfProvHist=function(){let h=_ph();const ids=new Set(S.tx.filter(t=>t.pva).map(t=>t.id));if(!ids.size)return h;
 return h.replace(/<button type="button" class="mf-pvh-r" data-e="([^"]+)"([^>]*)>([\s\S]*?)<\/button>/g,(m,id,a,inner)=>{if(!ids.has(id.replace(/&quot;/g,'"')))return m;const t=S.tx.find(x=>x.id===id);const dm=x=>x?x.slice(8,10)+'/'+x.slice(5,7):'',tp=t&&MF_PVA_TIPO[t.tp]?MF_PVA_TIPO[t.tp]+' · ':'',det=t&&t.qt&&t.vc?`<i class="mf-pvh-a">auto · ${tp}${t.dc?`com ${dm(t.dc)} · pago ${dm(t.d)}`:`data ${dm(t.d)}`} · ${(+t.qt).toLocaleString('pt-BR')} × ${t.vc.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:4})}</i>`:'<i class="mf-pvh-a">auto</i>';
  return `<button type="button" class="mf-pvh-r" data-e="${id}"${a}>${inner.replace('</span><b',det+'</span><b')}</button>`})}})();

/* ===== Patch 75: assinatura com Pix (teste) — mostra a chave Pix para copiar e pagar ===== */
var MF_PIX_KEY='c8deb3b3-c8fe-4114-a42b-1f8a7cc373fc';
function mfPixCopy(txt){const done=()=>{try{mfToast('Chave Pix copiada ✓')}catch(_){}};
 if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(txt).then(done,()=>mfPixCopyOld(txt,done));return}mfPixCopyOld(txt,done)}
function mfPixCopyOld(txt,done){const i=document.createElement('textarea');i.value=txt;i.setAttribute('readonly','');i.style.cssText='position:fixed;top:-100px;opacity:0';document.body.appendChild(i);i.select();i.setSelectionRange(0,txt.length);let ok=false;try{ok=document.execCommand('copy')}catch(_){}i.remove();if(ok)done();else{try{mfToast('Não deu para copiar. Toque e segure na chave para copiar.')}catch(_){}}}