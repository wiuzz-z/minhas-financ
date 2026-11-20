


/* Toque limpo: sem pulo nem ✓ voando; confirmação discreta ao salvar */
window.mfFloatOk=function(){if(document.querySelector('.mf-toast'))return;const o=document.createElement('div');o.className='mf-toast mf-toast-ok';o.textContent='✓ Salvo';document.body.appendChild(o);setTimeout(()=>o.remove(),1400)};

/* ===== Patch 37: visual do computador (só desktop) ===== */
var MF_DCARD={c_sal:['var(--ac)',k=>anMonth(...k.split('-').map(Number)).bal],c_ent:['var(--ac)',k=>anMonth(...k.split('-').map(Number)).rec],c_sai:['var(--ac)',k=>anMonth(...k.split('-').map(Number)).exp],c_fat:['var(--ac)',k=>S.tx.filter(t=>t.t==='Crédito'&&t.d&&invoiceDueDate(t).slice(0,7)===k).reduce((s,t)=>s+txValue(t),0)],c_inv:['var(--ac)',k=>anMonth(...k.split('-').map(Number)).inv]};
/* 1.24: seção "Geral" e cartão Premium na barra lateral (computador) */
function mfSideExtra(){const A=window.__acc||{},prem=A.admin||(typeof mfIsPago==='function'&&mfIsPago()),ic=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
 const it=(v,t,p)=>`<div><button type="button" class="mf-sb-it" data-sbcfg="${v}">${ic(p)}<em class="nv-l">${t}</em></button></div>`;
 return `<small class="mf-sb-lb">Geral</small>${it('aparencia','Aparência','<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor"/>')}${it('relatorios','Relatórios','<path d="M7 3h7l4 4v14H7Z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>')}${it('main','Configurações','<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>')}
 ${prem?'':`<div class="mf-sb-up"><b>Seja Premium</b><small>Análises completas, proventos automáticos e simulações.</small><button type="button" data-sbcfg="plano">Ver planos</button></div>`}`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sbcfg]');if(!b)return;e.preventDefault();e.stopPropagation();if(window.mfCfgOpen)mfCfgOpen(b.dataset.sbcfg)},true);

/* ===== Patch 38: Investimentos no computador ===== */
function ivAportes(n){return Array.from({length:n},(_,i)=>{const k=nm(TD.slice(0,7),i-(n-1));return S.tx.filter(t=>t.d&&t.d.slice(0,7)===k&&t.c==='Investimento').reduce((s,t)=>s+(+t.v||0),0)})}
function ivSimCfg(){S.invSim=S.invSim&&typeof S.invSim==='object'?S.invSim:{};const a=ivAportes(6),avg=Math.round(a.reduce((s,v)=>s+v,0)/6);const c=S.invSim;return {aporte:+c.aporte>0?+c.aporte:avg,mensal:+c.mensal>0?+c.mensal:avg,taxa:+c.taxa>0?+c.taxa:10,anos:+c.anos>0?+c.anos:10}}
const dvCard=(id,title,body,cls)=>B(id)+`<section class="c dv-card ${cls||''}"><div class="dv-h"><h2>${title}</h2></div>${body}</section>`;
function dvChartBase(I){const L=I.map(a=>({a,v:ivNow(a)})).filter(x=>x.v>0).sort((x,y)=>y.v-x.v),tot=L.reduce((s,x)=>s+x.v,0);if(!L.length)return dvCard('dv_chart','Distribuição dos ativos','<p class="mf-empty">Adicione ativos para ver o gráfico.</p>','dv-wide');
 const rows=L.slice(0,9).map((x,i)=>({n:String(x.a.a),v:x.v,c:MF_PAL[i%MF_PAL.length]}));if(L.length>9)rows.push({n:'Outros',v:L.slice(9).reduce((s,x)=>s+x.v,0),c:'#8e8e93'});
 const gs=ivGroups(I).filter(g=>g.v>0);
 const ct=mfChart('dv_chart','rosca');
 return dvCard('dv_chart','Distribuição dos ativos',`<div class="dv-chart ${ct==='rosca'?'':'dv-chart-alt'}">${ct==='rosca'?`<div class="dv-donut">${mfDonut(rows,{size:250,center:R(tot).replace(/,\d\d$/,''),sub:'patrimônio',cfs:12})}</div><div class="dv-leg">${rows.map(r=>`<div><i style="background:${r.c}"></i><span>${escH(r.n)}</span><em>${R(r.v)}</em><b>${(r.v/tot*100).toFixed(1).replace('.',',')}%</b></div>`).join('')}</div>`:`<div class="dv-alt">${mfCatView(rows,ct)}</div>`}<div class="dv-side"><div class="dv-side-h">Por classe</div>${gs.map(g=>`<div class="dv-cls"><div><span>${IV_NOME[g.k]||'Outros'}</span><b>${R(g.v)}</b></div><i><b style="width:${(g.v/tot*100).toFixed(1)}%;background:${IV_COLS[g.k]||'#8e8e93'}"></b></i><small><span>${(g.v/tot*100).toFixed(1).replace('.',',')}% da carteira</span><span class="${g.rent==null?'mu':g.rent>=0?'ok':'bad'}">${g.rent==null?'—':ivSp(g.rent)}</span></small></div>`).join('')}</div></div>`,'dv-wide')}
function dvProj(I){const c=ivSimCfg(),P0=I.reduce((s,a)=>s+ivNow(a),0),r=Math.pow(1+c.taxa/100,1/12)-1,yrs=Math.min(50,Math.max(1,Math.round(c.anos))),pts=[],ap=[];let v=P0,inv=P0;pts.push(v);ap.push(inv);
 for(let y=1;y<=yrs;y++){for(let m=0;m<12;m++){v=v*(1+r)+c.mensal;inv+=c.mensal}pts.push(v);ap.push(inv)}
 const names=Array.from({length:yrs+1},(_,i)=>i===0?'Hoje':String(+TD.slice(0,4)+i)),ev=Math.ceil((yrs+1)/10);
 const inp=(k,l,val,suf)=>`<label class="dv-in sm"><span>${l}</span><div>${suf==='R$'?'<em>R$</em>':''}<input type="text" inputmode="decimal" data-dvsim="${k}" value="${val}">${suf&&suf!=='R$'?`<em>${suf}</em>`:''}</div></label>`;
 return dvCard('dv_proj','Projeção do patrimônio',`<div class="dv-proj"><div class="dv-proj-in">${inp('mensal','Aporte mensal',plFmt(c.mensal),'R$')}${inp('taxa','Rentabilidade ao ano',String(c.taxa).replace('.',','),'%')}${inp('anos','Prazo',String(yrs),'anos')}<div class="dv-proj-r"><div><small>Patrimônio em ${+TD.slice(0,4)+yrs}</small><b>${R(v)}</b></div><div><small>Total aportado</small><b>${R(inv)}</b></div><div><small>Rendimento</small><b class="ok">${R(v-inv)}</b></div></div></div><div class="dv-proj-c">${mfSeriesView(names,[{vals:ap,color:'#8e8e93',dash:'4 4',w:1.8},{vals:pts,color:'#60a5fa',fill:true}],mfChart('dv_proj','linha'),{h:(window.mfIsDesk&&mfIsDesk())?230:170,w:(window.mfIsDesk&&mfIsDesk())?760:320,every:ev,aria:'Projeção do patrimônio'})}${mfKeys([['Patrimônio projetado','#60a5fa'],['Total aportado','#8e8e93',1]])}<p class="dv-foot">Simulação com rentabilidade constante e aportes todo mês. Não é garantia de resultado.</p></div></div>`,'dv-wide')}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 const s=t.closest('[data-dvsort]');if(s){e.preventDefault();e.stopPropagation();const k=s.dataset.dvsort,o=window.__dvSort||{k:'val',d:-1};window.__dvSort={k,d:o.k===k?-o.d:(k==='ativo'||k==='cls'?1:-1)};draw();return}
 const f=t.closest('[data-dvfil]');if(f){e.preventDefault();e.stopPropagation();window.__dvFil=f.dataset.dvfil;draw();return}
 const ed=t.closest('[data-dvedit]');if(ed){e.preventDefault();e.stopPropagation();const i=+ed.dataset.dvedit;window.__dvEdit=window.__dvEdit===i?null:i;draw()}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('[data-dvsim]'))return;S.invSim=S.invSim||{};const k=t.dataset.dvsim,v=plNum(t.value);if(v>0)S.invSim[k]=k==='anos'?Math.round(v):v;else delete S.invSim[k];save();draw()},true);

function vInv(){return (window.mfIsDesk&&mfIsDesk())?vInvDesk():vInvMob()}

/* ===== Patch 39: escolher o tipo de gráfico (segurar o bloco › Tipo de gráfico) ===== */
var MF_CT_CAT=[['rosca','Rosca'],['barras','Barras'],['lista','Lista']],MF_CT_SER=[['linha','Linha'],['barras','Barras']];
var MF_CHARTS={d_cat:MF_CT_CAT,n_cat:MF_CT_CAT,n_grupo:[['barra','Barra'],['rosca','Rosca'],['lista','Lista']],n_pag:[['barras','Barras'],['rosca','Rosca'],['lista','Lista']],n_acat:[['barras','Barras'],['rosca','Rosca'],['lista','Lista']],i_chart:MF_CT_CAT,dv_chart:MF_CT_CAT,p_gasto:[['rosca','Rosca'],['barras','Barras']],n_ritmo:MF_CT_SER,n_aflux:MF_CT_SER,n_aacum:MF_CT_SER,n_apoup:[['barras','Barras'],['linha','Linha']],dv_proj:MF_CT_SER};
function mfChart(id,def){const v=((S.view||{})[id]||{}).chart,ok=MF_CHARTS[id]&&MF_CHARTS[id].some(x=>x[0]===v);return ok?v:def}
function mfChartRow(id){const b=mfBase(id),opts=MF_CHARTS[b];if(!opts)return '';const cur=mfChart(b,opts[0][0]);return `<div class="mf-lp-ct"><small>Tipo de gráfico</small><div class="mf-seg">${opts.map(([k,t])=>`<button type="button" class="${k===cur?'on':''}" data-lpchart="${b}|${k}">${t}</button>`).join('')}</div></div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lpchart]');if(!b)return;e.preventDefault();e.stopPropagation();const [id,k]=b.dataset.lpchart.split('|');S.view=S.view||{};S.view[id]=Object.assign({},S.view[id],{chart:k});if(id==='d_cat')S.view.catMode=k;const m=document.getElementById('mf-lp');if(m)m.remove();document.querySelectorAll('.mf-lp-lift').forEach(x=>x.classList.remove('mf-lp-lift'));save();draw()},true);
/* desenhos genéricos */
function mfCatView(rows,type,o){o=o||{};const tot=rows.reduce((s,r)=>s+Math.max(0,r.v),0);if(!rows.length||!(tot>0))return `<p class="mf-empty">${o.empty||'Sem dados.'}</p>`;const fmt=o.fmt||R;
 if(type==='barras'){const mx=Math.max(...rows.map(r=>r.v));return `<div class="mf-hbars">${rows.map(r=>`<div><span>${escH(r.n)}</span><i><b style="width:${(r.v/mx*100).toFixed(1)}%;background:${r.c}"></b></i><em>${fmt(r.v)}</em></div>`).join('')}</div>`}
 if(type==='lista')return `<div class="mf-clist">${rows.map(r=>`<div><i style="background:${r.c}"></i><span>${escH(r.n)}</span><small>${Math.round(r.v/tot*100)}%</small><b>${fmt(r.v)}</b></div>`).join('')}</div>`;
 const top=rows.slice().sort((a,b)=>b.v-a.v)[0];return `<div class="mf-cat-donut">${mfDonut(rows,{size:o.size||150,center:o.center||Math.round(top.v/tot*100)+'%',sub:o.sub||top.n,cfs:o.cfs||18,aria:o.aria})}${mfLegend(rows,tot)}</div>`}
function mfSeriesView(names,series,type,o){return type==='barras'?mfVBars(names,series,o):mfLines(names,series,o)}
/* Distribuição 50/30/20 com 3 formas */

/* ===== Patch 40: computador — blocos encaixados sem espaços (estilo bento) ===== */
window.MF_DESK_ROWS=true;/* 1.24: no computador os blocos ficam em linhas alinhadas (mesma altura na linha) em vez do mosaico */
(function(){let ro=null,raf=0;
 const spanOf=el=>{const app=document.getElementById('app'),cs=getComputedStyle(app),row=parseFloat(cs.gridAutoRows)||8,gap=parseFloat(cs.rowGap)||16;el.style.gridRowEnd='';const h=el.getBoundingClientRect().height;el.style.gridRowEnd='span '+Math.max(1,Math.ceil((h+gap)/(row+gap)))};
 const kids=()=>{const out=[];[...(document.getElementById('app')||{children:[]}).children].forEach(el=>{const cs=getComputedStyle(el);if(cs.position==='fixed')return;if(cs.display==='contents')[...el.children].forEach(c=>{if(getComputedStyle(c).position!=='fixed')out.push(c)});else out.push(el)});return out};
 function layout(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const desk=window.mfIsDesk&&mfIsDesk();if(ro)ro.disconnect();if(!desk||window.MF_DESK_ROWS){kids().forEach(el=>el.style.gridRowEnd='');return}
  const ks=kids();ks.forEach(spanOf);if(!ro)ro=new ResizeObserver(es=>es.forEach(e=>{const el=e.target;if(el.isConnected&&el.closest('#app'))spanOf(el)}));ks.forEach(el=>ro.observe(el))})}
 window.mfMasonry=layout;
 const start=()=>{const app=document.getElementById('app');if(!app)return;new MutationObserver(layout).observe(app,{childList:true});window.addEventListener('resize',layout);layout()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

/* ===== Patch 41: abrir tocando em qualquer parte · lista de ativos (nome, cotas, PM, rentabilidade) ===== */
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#app'))return;
 const so=t.closest('[data-clssort]');if(so){e.preventDefault();e.stopPropagation();const k=so.dataset.clssort,o=window.__clsSort||{k:'val',d:-1};window.__clsSort={k,d:o.k===k?-o.d:(k==='nome'?1:-1)};draw();return}
 const ed=t.closest('[data-clsedit]');if(ed&&!t.closest('.mf-al-ed')){e.preventDefault();e.stopPropagation();const i=+ed.dataset.clsedit;window.__clsEdit=window.__clsEdit===i?null:i;draw();return}
 // cartão de classe: tocar em qualquer parte abre/fecha (menos dentro da lista aberta)
 const w=t.closest('[data-ivclsw]');if(w&&!t.closest('.mf-cls-assets')&&!t.closest('[data-ivcls]')){e.preventDefault();e.stopPropagation();window.__ivOpenCls=window.__ivOpenCls||{};const k=w.dataset.ivclsw;window.__ivOpenCls[k]=!window.__ivOpenCls[k];draw();return}
 // bloco recolhido: tocar em qualquer parte abre; tocar no título abre/fecha
 if(document.body.classList.contains('org-on')||t.closest('button,a,input,select,textarea,label,summary,.mf-fold'))return;
 const card=t.closest('.mf-folded');if(card){const fb=card.querySelector('.mf-fold')||(card.previousElementSibling&&card.previousElementSibling.querySelector('.mf-fold'));if(fb){e.preventDefault();e.stopPropagation();fb.click()}return}
 const hd=t.closest('.mf-keep');if(hd){const fb=hd.querySelector(':scope>.mf-fold');if(fb){e.preventDefault();e.stopPropagation();fb.click()}}},true);
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.matches&&e.target.matches('[data-clsedit]')){e.preventDefault();e.target.click()}});


/* Excluir um lançamento que faz parte de uma série (vários meses ou parcelas): perguntar se é só ele ou todos */
function mfSeriesSheet(cur){const isFx=!!cur.fixedId,key=isFx?'fixedId':'installmentId',all=S.tx.filter(t=>t[key]===cur[key]),n=all.length;
 const old=document.getElementById('mf-ser');if(old)old.remove();const w=document.createElement('div');w.id='mf-ser';
 w.innerHTML=`<div class="mf-lp-bg" data-ser="x"></div><div class="mf-lp-box"><div class="mf-lp-grab"></div><div class="mf-lp-t"><small>Excluir lançamento</small><b>${escH(String(cur.n||'Lançamento').replace(/\s*\(\d+\/\d+\)$/,''))}</b></div><p class="mf-lp-tip" style="margin:0 0 12px">${isFx?`Ele faz parte de um recorrente (${n} meses).`:`Ele faz parte de uma compra parcelada (${n} parcelas).`}</p><div class="mf-lp-list"><button type="button" data-ser="one"><span>1</span>${isFx?'Só este mês':'Só esta parcela'}</button><button type="button" data-ser="all" style="color:var(--bad)"><span>∞</span>${isFx?`Todos os meses (${n})`:`Todas as parcelas (${n})`}</button></div><button type="button" class="mf-lp-x" data-ser="x" style="margin-top:12px">Cancelar</button></div>`;
 w.__cur=cur;w.__key=key;document.body.appendChild(w);requestAnimationFrame(()=>w.classList.add('on'))}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 const s=t.closest('#mf-ser [data-ser]');if(s){e.preventDefault();e.stopPropagation();const w=document.getElementById('mf-ser'),cur=w.__cur,key=w.__key,a=s.dataset.ser;w.remove();if(a==='x')return;
  try{ensureTools()}catch(err){}S.trash=S.trash||[];
  if(a==='one'){S.trash.push({...cur,deletedAt:TD});S.tx=S.tx.filter(x=>x.id!=cur.id)}
  else{const gone=S.tx.filter(x=>x[key]===cur[key]);gone.forEach(x=>S.trash.push({...x,deletedAt:TD}));S.tx=S.tx.filter(x=>x[key]!==cur[key]);if(key==='fixedId')S.fixed=(S.fixed||[]).filter(f=>f.id!==cur.fixedId)}
  F.id=null;F.v=F.dt=F.n=null;save();draw();return}
 const md=t.closest('#tx-edit-backdrop [data-tx-modal="delete"]');if(md){const cur=S.tx.find(x=>String(x.id)===String(window.__txEditId));if(cur&&(cur.fixedId||cur.installmentId)){e.preventDefault();e.stopPropagation();document.getElementById('tx-edit-backdrop')?.remove();document.body.classList.remove('tx-edit-open');mfSeriesSheet(cur);return}}
 const fx=t.closest('#fx');if(fx&&F.id){const cur=S.tx.find(x=>x.id==F.id);if(cur&&(cur.fixedId||cur.installmentId)){e.preventDefault();e.stopPropagation();mfSeriesSheet(cur)}}},true);


/* Trocar de aba desliza o conteúdo (como no Android): para a direita na ordem da barra entra da direita, e vice-versa */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('nav#nv [data-tab]');if(!b)return;const from=tab,to=b.dataset.tab;if(from===to)return;
 setTimeout(()=>{if(tab!==to)return;const app=document.getElementById('app');if(!app)return;const order=tbs(),dir=order.indexOf(to)>order.indexOf(from)?'l':'r';app.classList.remove('mf-slide-l','mf-slide-r');void app.offsetWidth;app.classList.add('mf-slide-'+dir);clearTimeout(app.__slT);app.__slT=setTimeout(()=>app.classList.remove('mf-slide-l','mf-slide-r'),420)},0)},true);


/* Cor de destaque escolhida pelo usuário (vale para botão Lançar, calendário, botões e seletores) */
function mfAccFg(c){const m=/^#?([0-9a-f]{6})$/i.exec(String(c||''));if(!m)return '#111';const n=parseInt(m[1],16),r=(n>>16)&255,g=(n>>8)&255,b=n&255,l=(0.2126*r+0.7152*g+0.0722*b)/255;return l>0.6?'#111':'#fff'}
function mfApplyAccent(root,L){const c=(L||{}).accent;if(c&&/^#[0-9a-f]{6}$/i.test(c)){root.style.setProperty('--ac',c,'important');root.style.setProperty('--ac-fg',mfAccFg(c),'important')}else{root.style.setProperty('--ac',(L&&L.ac)||'#6b8aff');root.style.removeProperty('--ac-fg')}}
var MF_ACCS=[['','Automático'],['#e8572f','Laranja'],['#3b82f6','Azul'],['#22c55e','Verde'],['#8b5cf6','Roxo'],['#ec4899','Rosa'],['#eab308','Amarelo'],['#06b6d4','Ciano'],['#ef4444','Vermelho']];
function mfAccentPicker(){const cur=(S.lay||{}).accent||'';return `<div class="mfc-lb">Cor de destaque</div><div class="mf-accs">${MF_ACCS.map(([c,t])=>`<button type="button" class="mf-acc ${cur===c?'on':''}" data-cfgacc="${c}" title="${t}" aria-label="${t}"><i style="${c?`background:${c}`:'background:linear-gradient(135deg,#fff 50%,#111 50%)'}"></i></button>`).join('')}<label class="mf-acc mf-acc-own ${cur&&!MF_ACCS.some(x=>x[0]===cur)?'on':''}" title="Escolher outra cor"><i style="background:${cur&&!MF_ACCS.some(x=>x[0]===cur)?cur:'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)'}"></i><input type="color" data-cfgaccc value="${/^#[0-9a-f]{6}$/i.test(cur)?cur:'#e8572f'}"></label></div><p class="mfc-note" style="margin:6px 0 0">Automático: branco no tema escuro e preto no claro. A cor vale para o botão Lançar, o calendário, os botões e os seletores.</p>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mf-cfg [data-cfgacc]');if(!b)return;e.preventDefault();e.stopPropagation();S.lay=S.lay||{};S.lay.accent=b.dataset.cfgacc;save();draw();window.mfCfgRender&&mfCfgRender()},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('#mf-cfg [data-cfgaccc]'))return;S.lay=S.lay||{};S.lay.accent=t.value;save();draw();window.mfCfgRender&&mfCfgRender()},true);

/* ===== Patch 47: crédito em Lançamentos no mês do vencimento · topo compacto com foto ===== */
document.addEventListener('click',e=>{const f=e.target.closest&&e.target.closest('[data-fatopen]');if(!f||e.target.closest('.row-sel'))return;e.preventDefault();e.stopPropagation();window.__fatOpen=window.__fatOpen||{};const k=f.dataset.fatopen;window.__fatOpen[k]=!window.__fatOpen[k];draw()},true);

/* ---- topo compacto (celular): foto · título · mês numa linha só ---- */
function mfMonthShort(){return `<div class="mf-msw mf-msw-s" aria-label="Selecionar mês"><button type="button" data-m="-1" aria-label="Mês anterior">‹</button><span>${MES[+ym.slice(5)-1].replace(/^./,c=>c.toUpperCase())} ${ym.slice(0,4)}</span><button type="button" data-m="1" aria-label="Próximo mês">›</button></div>`}

function mfTopCompactBase(){const pg=window.mfInvPag&&mfInvPag(),nm_=pg?'Investimentos':((S.lay||{}).tn||{})[tab]||(tab==='res'?'Dashboard':MF_TTL[tab])||'',right=tab==='anal'?anModeSeg():MF_MTABS.includes(tab)?mfMonthShort():'';
 if(pg)return `<div class="header-bar mf-top mf-ttl2 mf-pag"><button type="button" class="mf-voltar" data-invback="1" aria-label="Voltar para Patrimônio"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg><span>Voltar</span></button><h1>${escH(nm_)}</h1></div>`;
 /* 3.4: no celular o topo não tem mais a foto de perfil (ganha área útil; perfil e configurações ficam na aba Geral). Só o título (e o que vem à direita). */
 const foto=window.mfIsDesk&&mfIsDesk()?`<button type="button" class="mf-avatar" data-mfcfg="1" aria-label="Configurações e perfil" title="Configurações"><i class="mf-sync-dot" aria-hidden="true"></i>${mfAvatarHtml(34)}</button>`:'';
 return `<div class="header-bar mf-top mf-ttl2">${foto}<h1>${escH(nm_)}</h1>${right}</div>`}

/* ===== Patch 49 ===== */
/* sem minigráfico dentro dos cards */
function mfSpark(){return ''}
/* Economia mensal (no lugar da Taxa de economia): barras dos últimos 7 meses + linha da média */
/* 1.15: "Metas por classe" saiu da tela da Distribuição (pedido do usuário); mfMetaSec continua em js/40 */
function dvChart(I){return dvChartBase(I)}
function dvMetas(){return ''}
/* Simulador de aporte com destinos editáveis */
function dvSim(I){const c=ivSimCfg(),A=c.aporte,cfg=S.invSim||{},mode=cfg.mode||'manual';
 if(!Array.isArray(cfg.dest)||!cfg.dest.length){const T=S.invTarget||{},gs=ivGroups(I);const base=IV_ORD.filter(k=>+T[k]>0).map(k=>({n:IV_NOME[k],p:+T[k]}));cfg.dest=base.length?base:gs.map(g=>({n:IV_NOME[g.k]||'Outros',p:Math.round(100/Math.max(1,gs.length))}));S.invSim=cfg}
 const D=cfg.dest,sp=D.reduce((s,d)=>s+(+d.p||0),0);
 let body;
 if(mode==='metas'){const gs=ivGroups(I),tot=gs.reduce((s,g)=>s+g.v,0),T=S.invTarget||{},useT=IV_ORD.some(k=>+T[k]>0),after=tot+A;let alloc={};
  if(A>0){if(useT){const need={};IV_ORD.forEach(k=>{const g=gs.find(x=>x.k===k),v=g?g.v:0;need[k]=Math.max(0,(+T[k]||0)/100*after-v)});const sn=Object.values(need).reduce((s,v)=>s+v,0);if(sn>0)IV_ORD.forEach(k=>{if(need[k]>0)alloc[k]=A*need[k]/sn});else IV_ORD.forEach(k=>{if(+T[k]>0)alloc[k]=A*(+T[k])/100})}else gs.forEach(g=>{alloc[g.k]=tot?A*g.v/tot:A/gs.length})}
  const rows=Object.entries(alloc).filter(e=>e[1]>0.5).sort((x,y)=>y[1]-x[1]).map(([k,v])=>`<div class="mf-sd"><span class="mf-sd-n">${IV_NOME[k]}</span><b>${R(v)}</b><em>${A?(v/A*100).toFixed(0):0}%</em></div>`).join('');
  body=`<div class="mf-sd mf-sd-h"><span>Destino</span><b>Valor</b><em>%</em></div>${rows||'<p class="mf-empty">Digite o valor do aporte.</p>'}<p class="dv-foot">${useT?'Sugestão para aproximar a carteira das metas por classe.':'Sem metas: dividido pelo peso atual de cada classe.'}</p>`}
 else body=`<div class="mf-sd mf-sd-h"><span>Destino</span><em>%</em><b>Valor</b><i></i></div>${D.map((d,i)=>`<div class="mf-sd mf-sd-e"><input type="text" data-simn="${i}" value="${escH(d.n||'')}" placeholder="Nome (ex.: Ações)"><label class="mf-sd-p"><input type="text" inputmode="numeric" data-simp="${i}" value="${+d.p||''}" placeholder="0">%</label><b>${R(A*(+d.p||0)/100)}</b><button type="button" class="mf-sd-x" data-simdel="${i}" aria-label="Remover destino">✕</button></div>`).join('')}<button type="button" class="mf-sd-add" data-simadd="1">＋ Adicionar destino</button><p class="dv-foot ${sp!==100?'wa':''}">Total: ${sp}% ${sp>100?`· passou ${sp-100}% de 100%`:sp<100?`· faltam ${100-sp}% para fechar 100%`:'· '+R(A)+' distribuídos'}</p>`;
 return dvCard('dv_sim','Simulador de aporte',`<label class="dv-in"><span>Valor do aporte</span><div><em>R$</em><input type="text" inputmode="decimal" data-dvsim="aporte" value="${A?plFmt(A):''}" placeholder="0,00"></div></label><div class="mf-sd-mode">${mfSeg('data-simmode',mode,[['manual','Eu escolho'],['metas','Pelas metas']])}</div>${body}`)}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;const c=S.invSim||(S.invSim={});
 const m=t.closest('[data-simmode]');if(m){e.preventDefault();e.stopPropagation();c.mode=m.dataset.simmode;save();draw();return}
 const a=t.closest('[data-simadd]');if(a){e.preventDefault();e.stopPropagation();(c.dest=c.dest||[]).push({n:'',p:0});save();draw();return}
 const d=t.closest('[data-simdel]');if(d){e.preventDefault();e.stopPropagation();(c.dest||[]).splice(+d.dataset.simdel,1);save();draw()}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches)return;const c=S.invSim||(S.invSim={});c.dest=c.dest||[];
 if(t.matches('[data-simn]')){const i=+t.dataset.simn;if(c.dest[i]){c.dest[i].n=String(t.value).trim();save();draw()}}
 else if(t.matches('[data-simp]')){const i=+t.dataset.simp;if(c.dest[i]){c.dest[i].p=Math.max(0,Math.min(100,Math.round(+String(t.value).replace(',','.')||0)));save();draw()}}},true);
/* ícones das categorias do lançamento */
var MF_CICO=(()=>{const i=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;return {'Variáveis':i('<path d="M4 5h2l2 10h10l2-7H7"/><circle cx="10" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'),'Lazer':i('<path d="M5 20l3-9 5 5-8 4ZM13 4l1 3M18 6l-2 2M20 11h-3"/>'),'Moradia':i('<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z"/>'),'Conta fixa':i('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6M9 12h6"/>'),'Investimentos':i('<path d="M4 17l5-5 4 3 7-8M15 7h5v5"/>'),'Alimentação':i('<path d="M7 3v8a2 2 0 0 0 2 2v8M7 3v6M11 3v6M17 3c-2 2-2 6 0 8v10"/>'),'Pessoal':i('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),'Assinatura':i('<path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M20 4v5h-5M4 20v-5h5"/>')}})();

/* ===== Patch 50: computador no estilo da foto de referência ===== */
var MF_DGO={c_ent:'add',c_sai:'add',c_fat:'mais',c_inv:'inv'};
function mfDeskCard(id,h){if(!(window.mfIsDesk&&mfIsDesk())||!MF_DCARD[id])return h;const f=MF_DCARD[id][1];let cur=0,prev=0;try{cur=f(ym);prev=f(nm(ym,-1))}catch(e){}
 const d=Math.abs(prev)>0.005?(cur-prev)/Math.abs(prev)*100:null,good=(id==='c_sai'||id==='c_fat')?d<=0:d>=0;
 const pill=`<div class="mf-dvrow">${d==null?'<span class="mf-dpill mu">—</span>':`<span class="mf-dpill ${good?'ok':'bad'}">${d>=0?'↑':'↓'} ${Math.abs(d).toFixed(1).replace('.',',')}%</span>`}<small>vs mês anterior</small></div>`;
 let out=h;const i=out.lastIndexOf('</div>');if(i>0)out=out.slice(0,i)+pill+out.slice(i);
 if(MF_DGO[id]){const j=out.indexOf('>',out.indexOf('<div class=k'));if(j>0)out=out.slice(0,j+1)+`<button type="button" class="mf-dgo" data-tab="${MF_DGO[id]}" aria-label="Abrir" title="Abrir">↗</button>`+out.slice(j+1)}
 return out}
/* Lançamentos no computador: tabela como lista de pedidos */
document.addEventListener('click',e=>{const s=e.target.closest&&e.target.closest('[data-txsort]');if(!s)return;e.preventDefault();e.stopPropagation();const k=s.dataset.txsort,o=window.__txSort||{k:'d',d:-1};window.__txSort={k,d:o.k===k?-o.d:(k==='n'||k==='c'||k==='t'?1:-1)};draw()},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.matches||!t.matches('[data-txq]'))return;const q=t.value.trim().toLowerCase();document.querySelectorAll('.mf-txt tbody tr').forEach(r=>{r.style.display=!q||r.textContent.toLowerCase().includes(q)?'':'none'})});


/* ===== Patch 52: tela não sobe ao editar · calendário no Dashboard · mês abaixo do título ===== */
/* 1) manter a posição da tela em qualquer alteração (só volta ao topo ao trocar de aba) */
/* 2) calendário vai para o Dashboard, acima do Fluxo de caixa (uma vez) */
function mfCal52(){try{const L=S.lay||(S.lay={});if(L.__cal52)return;L.mvt=L.mvt||{};if(!L.mvt.calendar)L.mvt.calendar={f:'mais',t:'res'};
 if(L.o&&Array.isArray(L.o.res)){const a=L.o.res.filter(x=>x!=='calendar'),k=a.indexOf('cashflow');a.splice(k<0?1:k,0,'calendar');L.o.res=a}
 L.__cal52=1;save()}catch(e){}}

/* ===== Patch 53: Contas | Compras · lista de compras (mercado, feira, açougue) ===== */
var MF_SHLOC=[['mercado','Mercado'],['feira','Feira'],['acougue','Açougue']];
/* Fase 3 · M13: a lista passa a ter quantidade numérica, preço preenchido depois (direto na linha), totais e filtro pelo mês escolhido.
   Cada item guarda a data (d) do mês a que pertence; itens antigos, sem data, contam como do mês de hoje. O "valor" do item continua sendo o
   valor da linha (est), como era antes: nada foi recalculado nem apagado. */
function mfShopMes(x){return String(x.d||TD).slice(0,7)}
function mfShopQtd(x){const q=+x.qty>0?+x.qty:1;return q}
function mfShopQtdTxt(x){const q=mfShopQtd(x),n=q%1?String(Math.round(q*100)/100).replace('.',','):String(q),u=String(x.q||'').trim();return q===1&&!u?'':n+(u?' '+u:'')}
function mfShopHtml(){S.shopping=Array.isArray(S.shopping)?S.shopping:[];const loc=MF_SHLOC.some(x=>x[0]===window.__shopLoc)?window.__shopLoc:'mercado',all=S.shopping.filter(x=>(x.loc||'mercado')===loc),L=all.filter(x=>mfShopMes(x)===ym),pend=L.filter(x=>!x.done),done=L.filter(x=>x.done);
 const cnt=k=>S.shopping.filter(x=>(x.loc||'mercado')===k&&!x.done&&mfShopMes(x)===ym).length,old=all.filter(x=>!x.done&&mfShopMes(x)<ym&&ym===TD.slice(0,7)),
  qT=L.reduce((s,x)=>s+mfShopQtd(x),0),vT=L.reduce((s,x)=>s+(+x.est||0),0),semP=L.filter(x=>!(+x.est>0)).length,qtxt=Math.round(qT*100)/100;
 const row=x=>`<div class="mf-shi ${x.done?'done':''}"><button type="button" class="mf-shc" data-shdone="${escH(x.id)}" aria-label="${x.done?'Desmarcar':'Marcar como comprado'}">${x.done?'✓':''}</button><div class="mf-shn"><b>${escH(x.n||'')}</b>${mfShopQtdTxt(x)?`<small>${escH(mfShopQtdTxt(x))}</small>`:''}</div><input class="mf-shp" data-shprice="${escH(x.id)}" inputmode="decimal" autocomplete="off" placeholder="Preço" value="${+x.est>0?mfMoney(+x.est):''}" aria-label="Preço de ${escH(x.n||'item')}"><button type="button" class="mf-shx" data-shdel="${escH(x.id)}" aria-label="Remover">✕</button></div>`;
 return `<section class="c mf-shop"><h2>Lista de compras</h2>
 <div class="mf-shtabs">${MF_SHLOC.map(([k,t])=>`<button type="button" class="${k===loc?'on':''}" data-shloc="${k}">${t}${cnt(k)?` <em>${cnt(k)}</em>`:''}</button>`).join('')}</div>
 <form class="mf-shadd" data-shform="${loc}" autocomplete="off"><input name="n" placeholder="Adicionar item" aria-label="Item"><input name="q" inputmode="decimal" placeholder="Qtd" aria-label="Quantidade"><input name="v" inputmode="decimal" placeholder="Preço" aria-label="Preço, pode ficar em branco"><button type="submit" aria-label="Adicionar">＋</button></form>
 <div class="mf-shl">${pend.map(row).join('')||`<p class="mf-empty">${L.length?'Tudo comprado neste mês. ✓':'Nenhum item em '+lab(ym).toLowerCase()+'. Escreva o nome acima; a quantidade e o preço podem vir depois.'}</p>`}</div>
 ${done.length?`<div class="mf-shdh"><span>Comprados (${done.length})</span><button type="button" data-shclear="${loc}">Limpar comprados</button></div><div class="mf-shl">${done.map(row).join('')}</div>`:''}
 ${L.length?`<div class="mf-shtot mf-shtot2"><div><small>Itens</small><b>${L.length}</b></div><div><small>Quantidade total</small><b>${qtxt%1?String(qtxt).replace('.',','):qtxt}</b></div><div><small>Valor total</small><b>${R(vT)}</b></div></div>${semP?`<small class="mu mf-shsp">${semP} ${semP===1?'item sem preço':'itens sem preço'}: toque em "Preço" na linha para preencher.</small>`:''}`:''}
 ${old.length?`<div class="mf-shold"><small>${old.length} ${old.length===1?'item pendente':'itens pendentes'} de meses anteriores.</small><button type="button" data-shbring="${loc}">Trazer para este mês</button></div>`:''}</section>`}
document.addEventListener('submit',e=>{const f=e.target;if(!f||!f.matches||!f.matches('[data-shform]'))return;e.preventDefault();const n=String(f.n.value||'').trim();if(!n){f.n.focus({preventScroll:true});return}
 S.shopping=Array.isArray(S.shopping)?S.shopping:[];const qm=String(f.q.value||'').trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/),qty=qm?Math.max(.01,parseFloat(qm[1].replace(',','.'))||1):1,un=qm?qm[2].trim():String(f.q.value||'').trim();S.shopping.push({id:'sh'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),n,q:un,est:Math.max(0,ev(String(f.v.value||'0'))||0),qty,done:false,loc:f.dataset.shform,d:ym===TD.slice(0,7)?TD:ym+'-01'});save();draw();
 setTimeout(()=>{const i=document.querySelector('.mf-shadd input[name="n"]');if(i)i.focus({preventScroll:true})},30)},true);
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 const md=t.closest('[data-ctmode]');if(md){e.preventDefault();e.stopPropagation();window.__ctMode=md.dataset.ctmode;try{localStorage.setItem('fin1_ctmode',window.__ctMode)}catch(_){}window.__mfLastTab=null;draw();scrollTo(0,0);return}
 const lc=t.closest('[data-shloc]');if(lc){e.preventDefault();e.stopPropagation();window.__shopLoc=lc.dataset.shloc;draw();return}
 const br=t.closest('[data-shbring]');if(br){e.preventDefault();e.stopPropagation();const k=br.dataset.shbring;(S.shopping||[]).forEach(z=>{if((z.loc||'mercado')===k&&!z.done&&mfShopMes(z)<ym)z.d=TD});save();draw();return}
 const dn=t.closest('[data-shdone]');if(dn){e.preventDefault();e.stopPropagation();const x=(S.shopping||[]).find(z=>z.id===dn.dataset.shdone);if(x){x.done=!x.done;save();draw()}return}
 const dl=t.closest('[data-shdel]');if(dl){e.preventDefault();e.stopPropagation();S.shopping=(S.shopping||[]).filter(z=>z.id!==dl.dataset.shdel);save();draw();return}
 const cl=t.closest('[data-shclear]');if(cl){e.preventDefault();e.stopPropagation();const k=cl.dataset.shclear;S.shopping=(S.shopping||[]).filter(z=>!((z.loc||'mercado')===k&&z.done));save();draw()}},true);
try{const m=localStorage.getItem('fin1_ctmode');if(m)window.__ctMode=m}catch(_){}

/* ===== Patch 54: Central de vencimentos no fim de Contas ===== */
function mfVenc54(){try{const L=S.lay||(S.lay={});if(L.__venc54)return;if(L.o&&Array.isArray(L.o.mais)&&L.o.mais.includes('p_venc')){L.o.mais=L.o.mais.filter(x=>x!=='p_venc').concat('p_venc')}L.__venc54=1;save()}catch(e){}}

/* ===== Patch 55 · Lote 1: números certos =====
   Regra única de despesas do mês: compra no crédito conta no mês em que a fatura vence;
   investimentos, VR e o que foi pago com a reserva ficam à parte. */
/* keepDate=true mantém a data da compra (para dia da semana e listas); senão usa a data em que o dinheiro sai */
function mfSpendRows(k,keepDate){return S.tx.filter(t=>t.d&&mfIsSpend(t)&&mfMonthOf(t)===k).map(t=>keepDate||t.t!=='Crédito'?t:Object.assign({},t,{d:mfDayOf(t),_d0:t.d}))}
function anSpendRows(k){return mfSpendRows(k)}
/* Gastos por dia da semana: mesmos gastos do mês, mas pelo dia em que a compra foi feita */
function anSemana(){
 const tot=Array(7).fill(0),cnt=Array(7).fill(0),[y,m]=ym.split('-').map(Number),dim=new Date(y,m,0).getDate();
 for(let d=1;d<=dim;d++)cnt[new Date(y,m-1,d,12).getDay()]++;
 mfSpendRows(ym,true).forEach(t=>{tot[new Date(t.d+'T12:00:00').getDay()]+=+t.v||0});
 const sum=tot.reduce((s,v)=>s+v,0);if(!(sum>0))return anCard('a_semana','Gastos por dia da semana','',`<div class="mu" style="font-size:12px">Sem despesas registradas neste mês.</div>`);
 const mxI=tot.indexOf(Math.max(...tot)),avg=tot.map((v,i)=>cnt[i]?v/cnt[i]:0),mxA=avg.indexOf(Math.max(...avg)),fds=tot[0]+tot[6],modo=mfView('a_semana','modo','barras'),nomes=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
 const vis=modo==='lista'?AN_WD.map((d,i)=>anHRow(d,R(tot[i]),tot[i]/(tot[mxI]||1)*100,AN_ACC,`${Math.round(tot[i]/sum*100)}% do mês`)).join(''):anBars(AN_WD,[{vals:tot,color:AN_ACC}],{aria:'Gasto por dia da semana'});
 return anCard('a_semana','Gastos por dia da semana','',`<div style="font-size:13px;line-height:1.5;margin-bottom:8px">Mais gastos na <b>${nomes[mxI]}</b> (${R(tot[mxI])}, ${Math.round(tot[mxI]/sum*100)}%). Fins de semana: <b>${R(fds)}</b> (${Math.round(fds/sum*100)}%). Maior média por dia: <b>${AN_WD[mxA]}</b>.</div>${vis}`)}
/* Análises do mês com a mesma regra (formas de pagamento com as cores do formulário) */
function anMes(){const k=ym,[y,m]=k.split('-').map(Number),a=anMonth(y,m),pk=nm(k,-1),b=anMonth(...pk.split('-').map(Number)),out=[];
 out.push(anC('n_kpi','Resumo do mês',anKpis([['Receitas',R(a.rec),'ok',mfDelta(a.rec,b.rec,'up')],['Despesas',R(a.exp),'bad',mfDelta(a.exp,b.exp,'down')],['Saldo',(a.bal<0?'−':'')+R(Math.abs(a.bal)),a.bal>=0?'ok':'bad',mfDelta(a.bal,b.bal,'up')],['Economia',a.poup==null?'—':Math.round(a.poup)+'%','',b.poup!=null&&a.poup!=null?`<small class="mf-dl ${a.poup>=b.poup?'ok':'bad'}">${a.poup>=b.poup?'▲':'▼'} ${Math.abs(a.poup-b.poup).toFixed(0)} p.p.</small>`:'<small class="mf-dl mu">da renda</small>']])+`<p class="mf-cmp">Comparado com ${lab(pk).toLowerCase()}</p>`));
 const ents=Object.entries(a.cats).filter(e=>e[1]>0).sort((x,z)=>z[1]-x[1]),tot=ents.reduce((s,e)=>s+e[1],0);
 if(ents.length){const rows=ents.slice(0,7).map(([n,v],i)=>({n,v,c:MF_PAL[i%MF_PAL.length]}));if(ents.length>7)rows.push({n:'Outras',v:ents.slice(7).reduce((s,e)=>s+e[1],0),c:'#8e8e93'});
  const chg=ents.slice(0,5).map(([n,v])=>{const pv=(b.cats||{})[n]||0;return `<div><span>${escH(n)}</span><b>${R(v)}</b>${pv>0?`<small class="${v<=pv?'ok':'bad'}">${v>=pv?'▲':'▼'} ${Math.abs((v-pv)/pv*100).toFixed(0)}%</small>`:'<small class="mu">novo</small>'}</div>`}).join('');
  out.push(anC('n_cat','Para onde foi o dinheiro',`${mfCatView(rows,mfChart('n_cat','rosca'),{center:R(tot).replace(/,\d\d$/,''),sub:'gastos no mês',cfs:13})}<div class="mf-chg"><div class="mf-chg-h">Maiores categorias x mês anterior</div>${chg}</div>`))}
 else out.push(anC('n_cat','Para onde foi o dinheiro','<p class="mf-empty">Sem despesas neste mês.</p>'));
 const dim=new Date(y,m,0).getDate(),pdim=new Date(...pk.split('-').map(Number),0).getDate(),cum=(rows,n)=>{const d=Array(n).fill(0);rows.forEach(t=>{const i=+t.d.slice(8)-1;if(i>=0&&i<n)d[i]+=+t.v||0});let s=0;return d.map(v=>s+=v)};
 const cur=cum(anSpendRows(k),dim),prv=cum(anSpendRows(pk),pdim),isCur=k===TD.slice(0,7),today=+TD.slice(8),N=Math.max(dim,pdim);
 const cv=Array.from({length:N},(_,i)=>i<dim&&(!isCur||i<today)?cur[i]:null),pv=Array.from({length:N},(_,i)=>i<pdim?prv[i]:null);
 const spent=isCur?cur[Math.min(today,dim)-1]:cur[dim-1],proj=isCur&&today>0?spent/today*dim:null,ref=isCur?prv[Math.min(today,pdim)-1]:prv[pdim-1];
 out.push(anC('n_ritmo','Ritmo de gastos',`<div class="mf-big2"><div><small>${isCur?'Até hoje':'No mês'}</small><b>${R(spent||0)}</b></div>${proj!=null?`<div><small>Projeção do mês</small><b>${R(proj)}</b></div>`:''}<div><small>Mesmo ponto em ${MESF[+pk.slice(5)-1].toLowerCase()}</small><b class="mu">${R(ref||0)}</b></div></div>${mfSeriesView(Array.from({length:N},(_,i)=>String(i+1)),[{vals:pv,color:'#8e8e93',dash:'4 4',w:1.8},{vals:cv,color:'#7cc4fa',fill:true}],mfChart('n_ritmo','linha'),{every:5,aria:'Gasto acumulado por dia'})}${mfKeys([[MESF[+k.slice(5)-1],'#7cc4fa'],[MESF[+pk.slice(5)-1],'#8e8e93',1]])}`));
 const rows=anSpendRows(k).filter(t=>!mfIsFatLanc(t)),gsum={};rows.forEach(t=>{const g=inferMain(t.c,t.s);gsum[g]=(gsum[g]||0)+(+t.v||0)});const gt=Object.values(gsum).reduce((s,v)=>s+v,0),ge=Object.entries(gsum).sort((x,z)=>z[1]-x[1]),gc={'Essencial':'#7cc4fa','Não essencial':'#f07b7b','Investimentos':'#5fbf77'};
 out.push(anC('n_grupo','Essencial x não essencial',gt&&mfChart('n_grupo','barra')!=='barra'?mfCatView(ge.map(([g,v])=>({n:g,v,c:gc[g]||'#8e8e93'})),mfChart('n_grupo','barra')):gt?`<div class="mf-stack">${ge.map(([g,v])=>`<i style="width:${v/gt*100}%;background:${gc[g]||'#8e8e93'}"></i>`).join('')}</div><div class="mf-glist">${ge.map(([g,v])=>`<div><i style="background:${gc[g]||'#8e8e93'}"></i><span>${escH(g)}</span><small>${Math.round(v/gt*100)}%</small><b>${R(v)}</b></div>`).join('')}</div>`:'<p class="mf-empty">Sem despesas neste mês.</p>'));
 const pay={};rows.forEach(t=>{const p=t.t||'Outro';pay[p]=(pay[p]||0)+(+t.v||0)});const pe=Object.entries(pay).sort((x,z)=>z[1]-x[1]),pmx=pe.length?pe[0][1]:1,pc=(p,i)=>TCOL[p]||MF_PAL[(i+1)%MF_PAL.length];
 out.push(anC('n_pag','Formas de pagamento',pe.length&&mfChart('n_pag','barras')!=='barras'?mfCatView(pe.map(([p,v],i)=>({n:p,v,c:pc(p,i)})),mfChart('n_pag','barras')):pe.length?`<div class="mf-hbars">${pe.map(([p,v],i)=>`<div><span>${escH(p)}</span><i><b style="width:${(v/pmx*100).toFixed(1)}%;background:${pc(p,i)}"></b></i><em>${R(v)}</em></div>`).join('')}</div>`:'<p class="mf-empty">Sem despesas neste mês.</p>'));
 const top=rows.slice().sort((x,z)=>(+z.v||0)-(+x.v||0)).slice(0,5);
 out.push(anC('n_top','Maiores gastos',top.length?`<div class="mf-toplist">${top.map((t,i)=>{const d0=t._d0||t.d;return `<div><span class="mf-rank">${i+1}</span><div class="mf-txm"><b>${escH(t.n||'(sem descrição)')}</b><small>${d0.slice(8)}/${d0.slice(5,7)} · ${escH(t.s||inferSub(t.c))}${t.t==='Crédito'?' · cartão':''}</small></div><b>${R(t.v)}</b></div>`}).join('')}</div>`:'<p class="mf-empty">Sem despesas neste mês.</p>'));
 return out.join('')}
/* 50/30/20 com a mesma regra (investimentos continuam no grupo Investimentos) */
function mfBudgetG(){
 const income=dashStats(ym).rec,rows=S.tx.filter(t=>t.d&&t.d.slice(0,7)===ym&&t.c&&t.c!=='Receita'&&t.t!=='Fatura'&&t.t!=='Reserva'&&!isVR(t)&&!isInvoicePayment(t)&&!mfIsFatLanc(t));
 const RL=mfRule(),groups=[{name:RL.nomes[0],pct:RL.f[0],c:'#7cc4fa',match:t=>['Moradia','Alimentação','Contas Fixas'].includes(t.c)||['Moradia','Conta fixa','Alimentação'].includes(t.s||inferSub(t.c))},{name:RL.nomes[1],pct:RL.f[1],c:'#f07b7b',match:t=>t.c!=='Investimento'&&['Variáveis','Pessoal','Lazer','Assinatura'].includes(t.s||inferSub(t.c))},{name:RL.nomes[2],pct:RL.f[2],c:'#5fbf77',match:t=>t.c==='Investimento'||(t.s||inferSub(t.c))==='Investimentos'}];
 /* limite em reais escolhido pela pessoa; sem ele, a % da renda do mês */
 const G=groups.map((g,i)=>{const actual=rows.filter(g.match).reduce((n,t)=>n+(+t.v||0),0),fixo=RL.lim[i]>0,limit=fixo?RL.lim[i]:income*g.pct;return {...g,actual,limit,fixo,p:limit?actual/limit:0}});return {income,G}}
/* ===== Tetos por categoria (opcional, dentro do 50/30/20): gasto lançado no mês (cartão pela data da compra) ===== */
function mfTetoMap(){S.categoryBudgets=S.categoryBudgets&&typeof S.categoryBudgets==='object'?S.categoryBudgets:{};return S.categoryBudgets}
function mfTetoRows(k){const T=mfTetoMap(),sp={};S.tx.forEach(t=>{if(t&&t.d&&t.d.slice(0,7)===k&&t.c&&t.c!=='Receita'&&t.c!=='Investimento'&&t.t!=='Fatura'&&t.t!=='Reserva'&&!isVR(t)&&!isInvoicePayment(t)&&!mfIsFatLanc(t)&&!mfIsTr(t))sp[t.c]=(sp[t.c]||0)+(+t.v||0)});
 return Object.keys(T).filter(c=>+T[c]>0).map(c=>({c,lim:+T[c],sp:sp[c]||0,p:(sp[c]||0)/(+T[c])*100})).sort((a,b)=>b.p-a.p)}
function mfTetoHtml(){const ed=!!window.__tetoEd,rows=mfTetoRows(ym),T=mfTetoMap(),cats=CATS.filter(c=>c!=='Investimento'&&c!=='Receita');
 const list=rows.length?rows.map(r=>`<div class="mf-teto-r"><div class="mf-teto-t"><span>${escH(r.c)}</span><b class="${r.p>100?'bad':r.p>=90?'wa':''}">${R(r.sp)} <small class="mu">de ${R(r.lim)}</small></b></div><div class="mf-teto-b"><i class="${r.p>100?'bad':r.p>=90?'wa':'ok'}" style="width:${Math.min(100,r.p).toFixed(1)}%"></i></div></div>`).join(''):'<p class="mf-empty" style="margin:6px 0">Nenhum teto definido.</p>';
 const form=ed?`<div class="mf-teto-ed">${cats.map(c=>`<label><span>${escH(c)}</span><input inputmode="decimal" data-teto="${escH(c)}" value="${+T[c]>0?(+T[c]).toLocaleString('pt-BR',{maximumFractionDigits:2}):''}" placeholder="sem teto"></label>`).join('')}</div>`:'';
 return `<div class="mf-teto"><div class="mf-teto-h"><b>Tetos por categoria</b><button type="button" class="mf-teto-btn" data-tetoed="1">${ed?'Feito ✓':rows.length?'Editar':'Definir tetos'}</button></div>${ed?form:list}</div>`}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('[data-teto]'))return;const T=mfTetoMap(),v=mfNum(t.value);if(v>0)T[t.dataset.teto]=Math.round(v*100)/100;else delete T[t.dataset.teto];save()},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tetoed]');if(!b)return;e.preventDefault();e.stopPropagation();try{document.activeElement&&document.activeElement.blur()}catch(_){}setTimeout(()=>{window.__tetoEd=!window.__tetoEd;draw()},40)},true);
function dashboardBudget(){
 const {income,G}=mfBudgetG(),RL=mfRule(),type='lista';/* 1.9: Distribuição 50/30/20 sempre em lista, para todos */
 let body;
 if(type==='rosca'){const used=G.reduce((s,g)=>s+g.actual,0);body=`<div class="mf-cat-donut">${mfDonut(G.map(g=>({n:g.name,v:g.actual,c:g.c})).filter(r=>r.v>0).length?G.map(g=>({n:g.name,v:g.actual,c:g.c})):[{n:'—',v:1,c:'var(--card-2)'}],{size:150,center:income?Math.round(used/income*100)+'%':'—',sub:'da renda usada',cfs:18,aria:'Distribuição por grupo'})}<div class="mf-leg">${G.map(g=>`<div><i style="background:${g.c}"></i><span>${g.name} · ${g.fixo?R(g.limit):Math.round(g.pct*100)+'%'}</span><b class="${g.p>1?'bad':''}">${Math.round(g.p*100)}%</b></div>`).join('')}</div></div>`}
 else if(type==='lista')body=`<div class="mf-clist">${G.map(g=>`<div><i style="background:${g.c}"></i><span>${g.name} <small class="mu">${g.fixo?R(g.limit):Math.round(g.pct*100)+'%'}</small></span><small>${R(g.actual)} de ${R(g.limit)}</small><b class="${g.p>1?'bad':'ok'}">${Math.round(g.p*100)}%</b></div>`).join('')}</div>`;
 else body=G.map(g=>{const has=g.limit>0,over=has&&g.actual>g.limit+0.005,pc=has?Math.round(g.p*100):null;return `<div class="mf-bg-row"><div class="mf-bg-t"><b>${g.name} · ${g.fixo?R(g.limit):Math.round(g.pct*100)+'%'}</b><b class="${!has?'mu':over?'bad':'ok'}">${pc==null?'—':pc+'%'}</b></div><div class="mf-bg-bar"><i style="width:${has?Math.min(100,Math.max(0,g.p*100)):0}%;background:${over?'var(--bad)':'var(--ok)'}"></i></div><div class="mf-bg-s"><span class="mu">${has?`Gasto ${R(g.actual)} de ${R(g.limit)}${g.fixo?' (limite fixo)':''}`:`Gasto ${R(g.actual)}`}</span><b class="${!has?'mu':over?'bad':'ok'}">${!has?'Sem receita no mês e sem limite fixo':over?'Excedeu '+R(g.actual-g.limit):'Restam '+R(g.limit-g.actual)}</b></div></div>`}).join('');
 return `${B('budgetalerts')}<section class="dash-budget"><div class="dash-section-head"><div><h2>Distribuição ${RL.nome}</h2></div></div>${body}${income?`<small class="mu mf-bg-inc">Receitas do mês: ${R(income)} · gastos lançados no mês (cartão pela data da compra, não pela fatura)</small>`:'<div class="dash-empty">Registre uma receita para calcular os limites de cada grupo.</div>'}${mfRuleCfg()}</section>`}
/* ---- Fatura do cartão: dia de vencimento configurado e fatura certa ---- */
MF_DCARD.c_fat=['var(--ac)',k=>{const base=mfFatKey(ym),off=(+k.slice(0,4)-+ym.slice(0,4))*12+(+k.slice(5,7)-+ym.slice(5,7));return cbInvoice(nm(base,off)).total}];
/* ---- Dashboard: cards com a regra única e valores negativos em vermelho ---- */
function mfReplBlock(h,id,html){const mk_='<!--b:'+id+'-->',i=h.indexOf(mk_);if(i<0)return h;const j=h.indexOf('<!--b:',i+mk_.length);return h.slice(0,i)+html+(j<0?'':h.slice(j))}
function mfNegRed(h){return h.replace(/<(b|div)( class="([^"]*)")?>-R\$/g,(m0,tg,c0,cls)=>`<${tg} class="${cls?cls+' ':''}bad">−R$`)}
function vResumo(){let h=vResumoBase();
 const K2=(id,t,v,col,subs)=>B(id)+`<div class=k${id==='c_inv'?' dashboard-invested-month-card':''}${WIDE.includes(id)?' style="grid-column:1/-1"':''}> <small>${t}</small><b style="color:${col}">${v}</b>${subs.filter(Boolean).map(q=>`<small>${q}</small>`).join('')}</div>`;
 const st=dashStats(ym),rows=mfSpendRows(ym),vista=rows.filter(t=>t.t!=='Crédito').reduce((s,t)=>s+(+t.v||0),0),cart=st.exp-vista,nRec=S.tx.filter(t=>t.d&&t.d.slice(0,7)===ym&&mfIsRec(t)).length;
 const inv=S.tx.filter(t=>t.d&&t.d.slice(0,7)===ym&&t.c==='Investimento').reduce((s,t)=>s+(+t.v||0),0),fk=mfFatKey(ym),fi=cbInvoice(fk);
 h=mfReplBlock(h,'c_ent',K2('c_ent','Receitas do mês',R(st.rec),'var(--ok)',[nRec?`${nRec} ${nRec===1?'entrada':'entradas'} no mês`:'Nenhuma entrada no mês']));
 h=mfReplBlock(h,'c_sai',K2('c_sai','Despesas do mês',R(st.exp),'var(--bad)',[`À vista ${R(vista)} · fatura ${R(cart)}`]));
 h=mfReplBlock(h,'c_inv',K2('c_inv','Investido no mês',R(inv),'var(--wa)',[st.rec?`<span class="mf-det-ok">${Math.round(inv/st.rec*100)}%</span> da renda`:'Sem receita no mês']));
 h=mfReplBlock(h,'c_fat',K2('c_fat','Fatura do cartão',R(fi.total),'var(--bad)',[(s=>s==='Sem fatura'?s:`<span class="${s==='Pago'?'mf-det-ok':'mf-det-bad'}">${s}</span>`)(mfFatStatus(fi,fk))]));
 const mk_='<!--b:c_sal-->',i=h.indexOf(mk_);if(i>=0){const j=h.indexOf('<!--b:',i+mk_.length),seg=j<0?h.slice(i):h.slice(i,j);h=h.slice(0,i)+mfNegRed(seg)+(j<0?'':h.slice(j))}
 return h+dashboardBudget()+(window.mfAlertsBlock?mfAlertsBlock():'')+(window.mfFutBlock?mfFutBlock():'')}
/* ---- Lançamentos (celular): resumo com a regra única; compras da fatura sempre no HTML (para a busca) ---- */
function mfTxKind(t){return mfIsTr(t)?'tr':t.c==='Receita'?'rec':isInvoicePayment(t)?'fat':t.c==='Investimento'?'inv':isVR(t)?'vr':'exp'}
function vExtratoList(){
 const all=S.tx.filter(t=>t.d),isCred=t=>t.t==='Crédito';
 const month=all.filter(t=>t.d.slice(0,7)===ym&&!isCred(t)&&!isInvoicePayment(t)&&!mfIsProvCx(t)),pays=all.filter(t=>isInvoicePayment(t)&&mfPayK(t)===ym).sort((a,b)=>a.d<b.d?1:-1);
 const cred=all.filter(t=>isCred(t)&&invoiceDueDate(t).slice(0,7)===ym).sort((a,b)=>a.d<b.d?1:-1);
 const credTot=cred.reduce((s,t)=>s+txValue(t),0),due=cred.length?cred.map(invoiceDueDate).sort()[0]:null;
 const paid=all.filter(t=>isInvoicePayment(t)&&t.d.slice(0,7)===ym).reduce((s,t)=>s+txValue(t),0);
 const fat=cred.length||pays.length?{fat:1,d:due||cbInvoice(ym).due,n:'Fatura do cartão',v:cred.length?credTot:cbInvoice(ym).total}:null;
 const st=dashStats(ym),gastos=mfSpendRows(ym,true),receitas=month.filter(mfIsRec);
 const Trec=st.rec,Tgasto=st.exp,sel=!!window.__mfSelOn,open=!!(window.__fatOpen||{})[ym];
 const sumK=f=>month.filter(f).reduce((s,t)=>s+(+t.v||0),0),invT=sumK(t=>t.c==='Investimento'),vrT=sumK(t=>t.c!=='Receita'&&isVR(t)),resT=sumK(t=>t.c&&t.c!=='Receita'&&t.c!=='Investimento'&&t.t==='Reserva');
 const ini=t=>t.c==='Receita'?'+':String(t.s||inferSub(t.c)||t.c||'•').trim().charAt(0).toUpperCase();
 const row=(t,extra,kid)=>{const k=mfTxKind(t),cls=k==='rec'?'ok':k==='inv'?'wa':k==='fat'||k==='tr'?'mf-txfat':'bad',sub=k==='tr'?mfTrLabel(t):k==='fat'?(extra||'Pagamento de fatura'):[t.c==='Receita'?'Receita':(t.s||inferSub(t.c)),extra||(t.t&&t.t!=='Fatura'?t.t:t.t==='Fatura'?'Pagamento de fatura':'')].filter(Boolean).join(' · ');
  return `<div class="row mf-tx" data-e="${t.id}" data-kind="${k}" data-pay="${escH(t.t||'')}"${kid?' data-kid="fat"':''}><input type="checkbox" class="row-sel" data-sel="${t.id}" aria-label="Selecionar lançamento"><span class="mf-txi ${cls}">${k==='fat'?'✓':k==='tr'?'⇄':ini(t)}</span><div class="mf-txm"><b>${escH(t.n||'(sem descrição)')}</b><small>${escH(sub)}</small></div><b class="mf-txv ${cls}">${k==='tr'?'':t.c==='Receita'?'+':'−'}${R(Math.abs(t.v))}</b></div>`};
 const fatRow=f=>{const st2=mfFatPaid(ym)?'paga':(f.d<TD?'em aberto':''),dt=f.d.slice(8,10)+'/'+f.d.slice(5,7);
  return `<div class="row mf-tx mf-fatrow ${open?'open':''}" data-fatopen="${ym}" data-kind="fat" data-pay="Crédito" role="button" aria-expanded="${open}"><span class="mf-txi mf-txi-card" aria-hidden="true"></span><div class="mf-txm"><b>Fatura do cartão</b><small>${dt} · ${cred.length} ${cred.length===1?'compra':'compras'}${pays.length?` · ${pays.length} ${pays.length===1?'pagamento':'pagamentos'}`:''}${st2?' · '+st2:''}</small></div><b class="mf-txv bad">−${R(f.v)}</b><span class="mf-fat-chev">›</span></div><div class="mf-fatlist" ${open?'':'hidden'}>${cred.map(t=>row(t,'Compra em '+t.d.slice(8,10)+'/'+t.d.slice(5,7)+(t.installmentCount>1?` · ${t.installmentIndex}/${t.installmentCount}`:''),1)).join('')}${pays.map(mfPayRow).join('')}</div>`};
 const pvM=all.filter(t=>t.d.slice(0,7)===ym&&!isCred(t)&&!isInvoicePayment(t)&&(mfIsProv(t)||mfIsProvCx(t))),pvT=pvM.reduce((s,t)=>s+(+t.v||0),0),pvNote=pvM.length?`<p class="mf-sum-note mf-pv-note">Dividendos e JCP do mês (${R(pvT)}) não aparecem nesta lista: veja em Investimentos › Proventos.</p>`:'';
 const L=[...month.filter(t=>!mfIsProv(t)),...(fat?[fat]:[])].sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:(a.fat?-1:b.fat?1:0));
 const DS=['dom','seg','ter','qua','qui','sex','sáb'],days={};L.forEach(t=>{(days[t.d]=days[t.d]||[]).push(t)});
 const groups=Object.keys(days).sort().reverse().map(d=>{const dt=new Date(d+'T12:00:00'),net=days[d].reduce((s,t)=>s+(t.fat?-t.v:(t.c==='Receita'?1:t.c&&t.t!=='Fatura'?-1:0)*(+t.v||0)),0);return `<div class="mf-day"><span>${DS[dt.getDay()]}, ${d.slice(8)} ${MES[+d.slice(5,7)-1]}</span><small class="${net>=0?'ok':'bad'}">${net>=0?'+':'−'}${R(Math.abs(net))}</small></div>${days[d].map(t=>t.fat?fatRow(t):row(t)).join('')}`}).join('');
 /* 1.22: cada lista separada por dia (igual a "Todos os lançamentos"); a fatura aparece uma vez e abre em cascata */
 const dg=A=>{const D={};A.forEach(t=>{(D[t.d]=D[t.d]||[]).push(t)});return Object.keys(D).sort().reverse().map(d=>{const dt=new Date(d+'T12:00:00'),net=D[d].reduce((s,t)=>s+(t.fat?-t.v:(t.c==='Receita'?1:t.c&&t.t!=='Fatura'?-1:0)*(+t.v||0)),0);
  return `<div class="mf-day"><span>${DS[dt.getDay()]}, ${d.slice(8)} ${MES[+d.slice(5,7)-1]}</span><small class="${net>=0?'ok':'bad'}">${net>=0?'+':'−'}${R(Math.abs(net))}</small></div>${D[d].sort((a,b)=>a.fat?-1:b.fat?1:0).map(t=>t.fat?fatRow(t):row(t)).join('')}`}).join('')};
 const mesN=MESF[+ym.slice(5)-1].toLowerCase(),flow=(k,arr)=>{const tot=arr.reduce((s,t)=>s+(t.fat?+t.v:Math.abs(+t.v||0)),0),n=arr.length;
  return `<div class="mf-flow-list" data-flow-list="${k}" ${window.__mfFlow===k?'':'hidden'}>${dg(arr)||`<div class="mu" style="padding:12px 0;text-align:center">Nenhuma ${k==='in'?'entrada':'saída'} neste mês.</div>`}${n?`<div class="mf-flow-tot"><span>${n} ${k==='in'?(n===1?'entrada':'entradas'):(n===1?'saída':'saídas')} em ${mesN}</span><b class="${k==='in'?'ok':'bad'}">${R(tot)}</b></div>`:''}</div>`};
 const inL=receitas.filter(t=>!mfIsProv(t)),outL=gastos.filter(t=>t.t!=='Crédito').concat(month.filter(t=>t.c==='Investimento'),cred.length&&fat?[Object.assign({},fat,{v:credTot})]:[]);
 const TgOut=Tgasto+invT,bal=Trec-TgOut,notes=[];
 if(credTot)notes.push(`Inclui a fatura que ${due<TD?'venceu':'vence'} em ${due.slice(8,10)}/${due.slice(5,7)} (${R(credTot)}).`);
 if(invT>0)notes.push(`Inclui investimentos (${R(invT)}).`);const fora=[vrT>0?`VR ${R(vrT)}`:'',resT>0?`pago com a reserva ${R(resT)}`:''].filter(Boolean);
 if(fora.length)notes.push(`Ficam fora das saídas: ${fora.join(' · ')}.`);
 {const pv=all.filter(t=>t.d.slice(0,7)===ym&&mfIsProvCx(t)).reduce((s,t)=>s+(+t.v||0),0);if(pv>0)notes.push(`Dividendos e JCP do mês (${R(pv)}) ficam em Investimentos › Proventos e não entram no saldo.`)}
 const desk=!!(window.mfIsDesk&&mfIsDesk()),nLanc=month.filter(t=>!mfIsProv(t)).length+cred.length,selbar=`<div class="mf-selbar" ${sel?'':'hidden'}><button type="button" data-mfsel="all">Marcar todos</button><span id="mfSelCount">0 selecionados</span><button type="button" class="mf-del" data-mfsel="del" disabled>Excluir</button></div>`;
 const todos=desk?'':`<button type="button" class="mf-flow-tile mf-allbtn" data-flow="all" aria-expanded="${window.__mfFlow==='all'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span>Buscar, filtrar e ver todos</span><span class="mf-flow-arrow" aria-hidden="true">▸</span></button><div class="mf-flow-list mf-all ${sel?'mf-selmode':''}" data-flow-list="all" ${window.__mfFlow==='all'?'':'hidden'}>${window.mfTxFilterBar?mfTxFilterBar(sel):''}${groups||'<div class="mu" style="padding:14px 0;text-align:center">Nada neste mês.</div>'}${pvNote}${selbar}</div>`;
 const sumB=B('ext_sum')+`<div class="c mf-sum mf-nofold"><h2>Lançamentos do mês</h2><div class="mf-lmn mf-lnav" role="group" aria-label="Mês dos lançamentos"><button type="button" data-m="-1" aria-label="Mês anterior">‹</button><span aria-live="polite"><b>${MESF[+ym.slice(5)-1]} ${ym.slice(0,4)}</b><small>arraste para o lado para trocar</small></span><button type="button" data-m="1" aria-label="Próximo mês">›</button></div>
 <div class="mf-sum-bal"><small>Saldo de ${mesN}</small><b class="${bal>=0?'ok':'bad'}">${bal<0?'−':''}${R(Math.abs(bal))}</b><em>${nLanc} ${nLanc===1?'lançamento':'lançamentos'} no mês</em></div><div class="g2"><div class="mf-flow-tile" role="button" tabindex="0" data-flow="in" aria-expanded="${window.__mfFlow==='in'}"><small>Entradas</small><b class="ok">${R(Trec)}</b><span class="mf-flow-arrow" aria-hidden="true">▸</span></div><div class="mf-flow-tile" role="button" tabindex="0" data-flow="out" aria-expanded="${window.__mfFlow==='out'}"><small>Saídas</small><b class="bad">${R(TgOut)}</b><span class="mf-flow-arrow" aria-hidden="true">▸</span></div></div>${flow('in',inL)}${flow('out',outL)}${todos}${notes.length?`<p class="mf-sum-note">${notes.join(' ')}</p>`:''}</div>`;
 if(!desk)return sumB;
 return sumB+
 B('ext_all')+`<div class="c mf-all ${sel?'mf-selmode':''}"><div class="mf-card-head mf-lhead"><h2 style="margin:0">Todos os lançamentos</h2>${mfLmNav()}</div>${window.mfTxFilterBar?mfTxFilterBar(sel):''}${groups||'<div class="mu" style="padding:14px 0;text-align:center">Nada neste mês.</div>'}${pvNote}<div class="mf-selbar" ${sel?'':'hidden'}><button type="button" data-mfsel="all">Marcar todos</button><span id="mfSelCount">0 selecionados</span><button type="button" class="mf-del" data-mfsel="del" disabled>Excluir</button></div></div>`;
}
/* ---- Lançamentos (computador): compras da fatura sempre na tabela para a busca encontrar ---- */
function vExtrato(){const base=vExtratoList();if(!(window.mfIsDesk&&mfIsDesk()))return base;const k=base.indexOf('<!--b:ext_all-->');const head=k>0?base.slice(0,k):base;
 const all=S.tx.filter(t=>t.d),isCred=t=>t.t==='Crédito',month=all.filter(t=>t.d.slice(0,7)===ym&&!isCred(t)&&!isInvoicePayment(t)&&!mfIsProvCx(t)),pays=all.filter(t=>isInvoicePayment(t)&&mfPayK(t)===ym).sort((a,b)=>a.d<b.d?1:-1),cred=all.filter(t=>isCred(t)&&invoiceDueDate(t).slice(0,7)===ym).sort((a,b)=>a.d<b.d?1:-1);
 const credTot=cred.reduce((s,t)=>s+txValue(t),0),due=cred.length?cred.map(invoiceDueDate).sort()[0]:null,sel=!!window.__mfSelOn,open=!!(window.__fatOpen||{})[ym],srt=window.__txSort||{k:'d',d:-1};
 const fv={d:t=>t.d,n:t=>String(t.n||''),c:t=>t.c==='Receita'?'Receita':(t.s||inferSub(t.c)||''),t:t=>t.fat?'Cartão':(t.t||''),v:t=>(t.c==='Receita'?1:-1)*Math.abs(+t.v||0)}[srt.k]||(t=>t.d);
 const L=[...month,...(cred.length||pays.length?[{fat:1,d:due||cbInvoice(ym).due,n:'Fatura do cartão',v:cred.length?credTot:cbInvoice(ym).total,t:'Fatura'}]:[])].sort((a,b)=>{const p=fv(a),q=fv(b);return (typeof p==='string'?p.localeCompare(q):p-q)*srt.d});
 const th=(k2,t,cls)=>`<th class="${cls||''}"><button type="button" data-txsort="${k2}">${t}${srt.k===k2?(srt.d<0?' ↓':' ↑'):''}</button></th>`;
 const tr=(t,sub,kid)=>{const kd=mfTxKind(t),rec=kd==='rec';return `<tr class="row${kid?' mf-kid'+(open?'':' mf-closed'):''}" data-e="${t.id}" data-kind="${kd}" data-pay="${escH(t.t||'')}"${kid?' data-kid="fat"':''}><td class="mf-tsel"><input type="checkbox" class="row-sel" data-sel="${t.id}" aria-label="Selecionar"></td><td>${t.d.slice(8)}/${t.d.slice(5,7)}/${t.d.slice(0,4)}</td><td><b>${escH(t.n||'(sem descrição)')}</b>${sub?`<small>${sub}</small>`:''}</td><td>${escH(rec?'Receita':(t.s||inferSub(t.c)||'—'))}</td><td><span class="mf-tag">${escH(rec?'Entrada':(t.t||'—'))}</span></td><td class="dv-r"><b class="${rec?'ok':kd==='inv'?'wa':'bad'}">${rec?'+':'−'}${R(Math.abs(t.v))}</b></td><td class="dv-r"><button type="button" class="dv-act" data-e="${t.id}">Editar</button></td></tr>`};
 const rows=L.map(t=>t.fat?`<tr class="mf-tfat ${open?'open':''}" data-fatopen="${ym}" data-kind="fat" data-pay="Crédito"><td class="mf-tsel"></td><td>${t.d.slice(8)}/${t.d.slice(5,7)}/${t.d.slice(0,4)}</td><td><b><span class="mf-ic-card" aria-hidden="true"></span>Fatura do cartão</b><small>${cred.length} ${cred.length===1?'compra':'compras'} · ${t.d<TD?'venceu':'vence'} ${t.d.slice(8,10)}/${t.d.slice(5,7)}</small></td><td>Cartão de crédito</td><td><span class="mf-tag">Fatura</span></td><td class="dv-r"><b class="bad">−${R(t.v)}</b></td><td class="dv-r"><span class="mf-fat-chev">›</span></td></tr>${cred.map(c=>tr(c,'Compra em '+c.d.slice(8,10)+'/'+c.d.slice(5,7)+(c.installmentCount>1?` · ${c.installmentIndex}/${c.installmentCount}`:''),1)).join('')}${pays.map(x=>mfPayTr(x,open)).join('')}`:tr(t)).join('');
 return head+(window.mfExtCat?mfExtCat():'')+B('ext_all')+`<div class="c mf-all mf-tall ${sel?'mf-selmode':''}"><div class="mf-card-head"><div class="mf-lh-l"><h2 style="margin:0">Todos os lançamentos <em class="mf-cnt">${month.length+cred.length+pays.length}</em></h2>${mfLmNav()}</div><div class="mf-ttools">${window.mfTxChips?mfTxChips():''}<label class="mf-tsearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="search" data-txq placeholder="Buscar lançamento" value="${escH(window.__txQ||'')}"></label><button type="button" class="mf-sel-btn" data-mfsel="toggle">${sel?'Cancelar':'Selecionar'}</button></div></div>
 <div class="dv-tw"><table class="dv-t mf-txt"><thead><tr><th class="mf-tsel"></th>${th('d','Data')}${th('n','Descrição')}${th('c','Categoria')}${th('t','Pagamento')}${th('v','Valor','dv-r')}<th class="dv-r">Ação</th></tr></thead><tbody>${rows||'<tr><td colspan="7" class="mf-empty">Nada neste mês.</td></tr>'}</tbody></table></div>
 <div class="mf-selbar" ${sel?'':'hidden'}><button type="button" data-mfsel="all">Marcar todos</button><span id="mfSelCount">0 selecionados</span><button type="button" class="mf-del" data-mfsel="del" disabled>Excluir</button></div></div>`}
/* busca: também procura nas compras da fatura e mostra a fatura junto */
function mfTxApply(){const q=String(window.__txQ||'').trim().toLowerCase(),F2=window.__txF||{},on=!!(q||F2.kind||F2.pay);
 const hide=(el,h)=>{if(h)el.style.setProperty('display','none','important');else el.style.removeProperty('display')},isHid=el=>el.style.getPropertyValue('display')==='none';
 const match=el=>{const txt=el.textContent.toLowerCase();if(q&&!txt.includes(q))return false;if(F2.kind&&el.dataset.kind!==F2.kind)return false;if(F2.pay&&el.dataset.pay!==F2.pay)return false;return true};
 document.querySelectorAll('.mf-txt').forEach(tb=>{tb.classList.toggle('mf-filtering',on);const trs=[...tb.querySelectorAll('tbody tr')];
  trs.forEach(r=>{if(!on||r.matches('[data-fatopen]')){hide(r,false);return}hide(r,!match(r))});
  if(on)trs.filter(r=>r.matches('[data-fatopen]')).forEach(f=>{let n=f.nextElementSibling,any=false;while(n&&n.matches('[data-kid]')){if(!isHid(n))any=true;n=n.nextElementSibling}hide(f,!(any||(!q&&match(f))))})});
 document.querySelectorAll('.mf-all:not(.mf-tall)').forEach(box=>{box.classList.toggle('mf-filtering',on);const rows=[...box.querySelectorAll('.row.mf-tx')];
  rows.forEach(r=>{if(!on){hide(r,false);return}if(r.matches('[data-fatopen]')){const l=r.nextElementSibling,kids=l&&l.matches('.mf-fatlist')?[...l.querySelectorAll('.row')]:[];hide(r,!(kids.some(match)||(!q&&match(r))));return}hide(r,!match(r))});
  box.querySelectorAll('.mf-fatlist').forEach(l=>{if(on){const any=[...l.querySelectorAll('.row')].some(r=>!isHid(r));if(any)l.style.setProperty('display','block','important');else hide(l,true)}else hide(l,false)});
  box.querySelectorAll('.mf-day').forEach(h=>{if(!on){hide(h,false);return}let n=h.nextElementSibling,any=false;while(n&&!n.matches('.mf-day')){if(n.matches('.row,.mf-fatlist')&&!isHid(n))any=true;n=n.nextElementSibling}hide(h,!any)});
  let em=box.querySelector('.mf-fempty');const vis=rows.some(r=>!isHid(r));if(on&&!vis){if(!em){em=document.createElement('div');em.className='mf-fempty mu';em.textContent='Nenhum lançamento encontrado.';const anchor=box.querySelector('.mf-filters')||box.querySelector('.mf-card-head');anchor&&anchor.after(em)}}else if(em)em.remove()})}
window.addEventListener('input',e=>{const t=e.target;if(!t||!t.matches||!t.matches('[data-txq]'))return;e.stopPropagation();window.__txQ=t.value;mfTxApply()},true);
/* ---- Central de vencimentos: segue o mês, mostra a fatura e as contas recorrentes, com marcar como paga ---- */
function mfSaud(){const h=new Date().getHours();return h>=5&&h<12?'Bom dia':h>=12&&h<18?'Boa tarde':'Boa noite'}
function mfDueItems(k){const P=mfPaidMap(),since=S.paidSince||TD,out=[];
 const inv=cbInvoice(k);if(inv.total>0.005){const key='fat:'+k;out.push({key,n:'Fatura do cartão',d:inv.due,v:inv.total,sub:`${inv.rows.length} ${inv.rows.length===1?'compra':'compras'}`,paid:mfFatPaid(k),fat:1})}
 S.tx.filter(t=>t.d&&t.d.slice(0,7)===k&&t.c&&t.c!=='Receita'&&t.c!=='Investimento'&&t.t!=='Crédito'&&!isVR(t)&&!isInvoicePayment(t)&&!mfIsTr(t)&&(+t.v||0)>0).forEach(t=>{const key=t.id;out.push({key,n:String(t.n||t.c||'Conta').replace(/\s*\(\d+\/\d+\)\s*$/,''),d:t.d,v:+t.v||0,sub:t.fixedId?'Recorrente':(t.s||inferSub(t.c)||''),paid:key in P?!!P[key]:mfDuePaidDef(t,since)})});
 return out.sort((a,b)=>a.d.localeCompare(b.d)||(a.fat?-1:1))}
/* padrão de "pago": lançado no dia ou depois (já aconteceu) = pago; lançado antes da data ou recorrente = a pagar até marcar */
function mfDuePaidDef(t,since){if(t.d<since)return true;if(t.fixedId||t.installmentId)return false;const m=/^n(\d{13})/.exec(String(t.id||''));if(!m)return t.d<TD;const c=new Date(+m[1]),cd=c.getFullYear()+'-'+String(c.getMonth()+1).padStart(2,'0')+'-'+String(c.getDate()).padStart(2,'0');return cd>=t.d}
function mfDueTag(it){if(it.paid)return ['Paga','ok'];const d=mfDaysTo(it.d);return d>1?[`Em ${d} dias`,'mu']:d===1?['Amanhã','wa']:d===0?['Hoje','wa']:[`Vencida há ${-d} ${d===-1?'dia':'dias'}`,'bad']}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-paid]');if(!b)return;e.preventDefault();e.stopPropagation();const P=mfPaidMap(),k=b.dataset.paid,it=mfDueItems(ym).find(x=>x.key===k),cur=it?it.paid:!!P[k];P[k]=!cur;save();draw()},true);
/* preço da linha: preenche ou corrige direto no item (vazio = sem preço) */
document.addEventListener('change',e=>{const i=e.target&&e.target.matches&&e.target.matches('[data-shprice]')?e.target:null;if(!i)return;const x=(S.shopping||[]).find(z=>z.id===i.dataset.shprice);if(!x)return;x.est=Math.max(0,ev(String(i.value||'0'))||0);save();draw()});
