
window.addEventListener('offline',mfNetUpdate);
window.addEventListener('online',async()=>{
 mfNetUpdate();
 try{
  if(!window.supabase)await window.mfSbReady();
  if(!authUser&&window.__mfInit)await window.__mfInit();
  else if(authUser){window.__mfPushFails=0;if(dirty||mfPending())queueCloudSave();else mfCatchUp()}
 }catch(e){console.warn('Reconexão:',e)}
 mfNetUpdate()});
setInterval(()=>{if(navigator.onLine&&authUser&&(dirty||mfPending())&&sync!=='syncing')queueCloudSave()},30000);
setTimeout(mfNetUpdate,600);

(function(){
 if(!document.getElementById('mf-bg')){const d=document.createElement('div');d.id='mf-bg';d.setAttribute('aria-hidden','true');document.body.appendChild(d)}
 let t;const busy=()=>{document.documentElement.classList.add('mf-busy');clearTimeout(t);t=setTimeout(()=>document.documentElement.classList.remove('mf-busy'),1200)};
 ['pointerdown','touchstart','keydown','input','wheel'].forEach(ev=>document.addEventListener(ev,busy,{passive:true,capture:true}));
 window.addEventListener('scroll',busy,{passive:true});
})();
function mfFloatOk(b){const r=b.getBoundingClientRect(),o=document.createElement('div');o.className='mf-ok';o.textContent='✓';o.style.left=(r.left+r.width/2)+'px';o.style.top=(r.top+r.height/2)+'px';document.body.appendChild(o);setTimeout(()=>o.remove(),900)}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('button,.b,.primary-btn,[role=button]');if(!b||b.disabled||b.closest('#uiCardCustomizer'))return;
 b.classList.remove('mf-hop');void b.offsetWidth;b.classList.add('mf-hop');setTimeout(()=>b.classList.remove('mf-hop'),340);
 const txt=(b.textContent||'').trim();
 if(/^(＋\s*)?(salvar|adicionar|criar|lançar|confirmar|aplicar|feito)/i.test(txt)&&!/cancel/i.test(txt)&&!b.closest('.mf-adm,.mf-adm-cf'))setTimeout(()=>{if(!document.querySelector('.mf-toast'))mfFloatOk(b)},380);
},true);
/* ===== Escolher o que mostrar (Temas › ⚙ exibir) ===== */
const MF_VIEW={
 c_pt:{t:'Patrimônio total',o:[{k:'lucro',l:'Lucro em R$',t:'b',d:true},{k:'pct',l:'% de valorização',t:'b',d:true},{k:'investido',l:'Valor investido (discreto)',t:'b',d:true}]},
 c_rent:{t:'Rentabilidade da carteira',o:[{k:'rent',l:'Rentabilidade %',t:'b',d:true},{k:'val',l:'Valorização em R$',t:'b',d:true},{k:'melhor',l:'Melhor ativo',t:'b',d:false},{k:'pior',l:'Pior ativo',t:'b',d:false}]},
 i_tipo:{t:'Tipo de ativo',o:[{k:'modo',l:'Visual',t:'1',d:'barras',v:[['barras','Barras'],['rosca','Rosca'],['lista','Lista']]},{k:'valor',l:'Mostrar valor em R$',t:'b',d:true}]},
 i_pie:{t:'Ativos',o:[{k:'modo',l:'Visual',t:'1',d:'rosca',v:[['rosca','Rosca'],['barras','Barras'],['lista','Lista']]},{k:'valor',l:'Mostrar valor em R$',t:'b',d:false}]},
 a_ritmo:{t:'Ritmo de gastos',o:[{k:'estilo',l:'Linha',t:'1',d:'onda',v:[['onda','Ondulada (por dia)'],['acum','Acumulada']]}]},
 a_semana:{t:'Gastos por dia da semana',o:[{k:'modo',l:'Visual',t:'1',d:'barras',v:[['barras','Barras'],['lista','Lista']]}]}
};
function mfView(id,k,d){const v=(S.view&&S.view[id]||{})[k];return v===undefined?d:v}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-vw]');if(!b)return;e.preventDefault();e.stopPropagation();mfLkOpen(b.dataset.vw,'info')},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-edit-card]');if(!b||!b.dataset.editCard||typeof mfLkOpen!=='function')return;e.preventDefault();e.stopImmediatePropagation();mfLkOpen(b.dataset.editCard,'cor')},true);
/* ===== Ritmo de gastos: linha ondulada ===== */

function lset(f){S.lay=S.lay||{};S.lay.o=S.lay.o||{};S.lay.h=S.lay.h||{};f(S.lay);save();draw()}
function sw(a,i,d){const j=i+d;if(i<0||j<0||j>=a.length)return a;[a[i],a[j]]=[a[j],a[i]];return a}




function ensureAnalysis(){S.goals=Array.isArray(S.goals)?S.goals:[];S.categoryBudgets=S.categoryBudgets&&typeof S.categoryBudgets==='object'?S.categoryBudgets:{};}

/* ===== Análises (reestruturada): mês atual + ano a ano ===== */
const AN_REC='#39b98a',AN_EXP='#e56b7b',AN_ACC='#6b8aff',AN_INV='#d5a348';
function anK(v){const a=Math.abs(v),s=v<0?'−':'';return s+(a>=1e6?(a/1e6).toFixed(1).replace('.',',')+'M':a>=1e3?(a/1e3).toFixed(a>=1e4?0:1).replace('.',',')+'k':String(Math.round(a)))}
function anMonth(y,m){const k=mk(y,m),st=dashStats(k),inv=S.tx.filter(t=>t.d.slice(0,7)===k&&t.c==='Investimento').reduce((s,t)=>s+(+t.v||0),0);return{k,m,rec:st.rec,exp:st.exp,bal:st.rec-st.exp,inv,cats:st.cats,poup:st.rec>0?(st.rec-st.exp)/st.rec*100:null}}
function anYear(y){return Array.from({length:12},(_,i)=>anMonth(y,i+1))}
function anRange(arrs,zero){let vs=arrs.flat().filter(v=>v!=null&&isFinite(v));if(zero)vs=vs.concat([0]);let mn=Math.min(...vs),mx=Math.max(...vs);if(!isFinite(mn)||!isFinite(mx)){mn=0;mx=1}if(mn===mx){mx=mn+1}const pad=(mx-mn)*.06;return[mn<0?mn-pad:Math.min(0,mn),mx+pad]}
function anLabels(f,W,H,n,names,every){return names.map((nm_,i)=>{if(every&&i%every)return '';const x=f.X0+(f.X1-f.X0)*(i+.5)/n;return `<text x="${x.toFixed(1)}" y="${H-5}" text-anchor="middle" font-size="8" fill="var(--mu)">${nm_}</text>`}).join('')}
function anBars(names,series,opts){
 opts=opts||{};const W=300,H=opts.h||150,n=names.length,[mn,mx]=anRange(series.map(s=>s.vals),true),f=anFrame(W,H,mn,mx,opts.fmt),k=series.length,slot=(f.X1-f.X0)/n,bw=Math.min(16,slot*.7/k);
 const bars=series.map((s,si)=>s.vals.map((v,i)=>{if(v==null)return '';const cx=f.X0+slot*(i+.5)+(si-(k-1)/2)*(bw+1),y0=f.Y(0),y1=f.Y(v);return `<rect x="${(cx-bw/2).toFixed(1)}" y="${Math.min(y0,y1).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1,Math.abs(y1-y0)).toFixed(1)}" rx="2" fill="${s.color}"${s.op?` fill-opacity="${s.op}"`:''}><title>${escH(names[i])}: ${opts.tfmt?opts.tfmt(v):R(v)}</title></rect>`}).join('')).join('');
 const lines=(opts.lines||[]).map(s=>{const pts=s.vals.map((v,i)=>v==null?null:[f.X0+slot*(i+.5),f.Y(v)]).filter(Boolean);return pts.length>1?`<polyline points="${pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"${s.dash?` stroke-dasharray="${s.dash}"`:''}/>`:''}).join('');
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escH(opts.aria||'Gráfico')}" style="width:100%;height:auto;display:block">${f.grid}${bars}${lines}${anLabels(f,W,H,n,names,opts.every)}</svg>`}
function anCard(id,title,sub,body){if(['a_semana','a_ritmo','a_top'].includes(id))sub='';if(id==='a_semana'||id==='a_ritmo')body=String(body).replace(/^<div style="font-size:13px;line-height:1.5;margin-bottom:8px">[\s\S]*?<\/div>/,'');return B(id)+`<section class="c"><h2>${title}</h2>${sub?`<p class="mu" style="font-size:12px;margin:4px 0 10px">${sub}</p>`:''}${body}</section>`}
function anHRow(label,val,pct,color,extra){return `<div style="margin:11px 0"><div style="display:flex;justify-content:space-between;gap:10px;font-size:13px"><span style="min-width:0;overflow-wrap:anywhere">${label}</span><b style="white-space:nowrap">${val}</b></div><div style="height:7px;background:var(--ln);border-radius:9px;overflow:hidden;margin:5px 0 3px"><i style="display:block;height:100%;width:${Math.max(0,Math.min(100,pct)).toFixed(1)}%;background:${color};border-radius:9px"></i></div>${extra?`<div class="mu" style="font-size:11px">${extra}</div>`:''}</div>`}
const AN_WD=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

/* ---------- MÊS ---------- */

/* ---------- ANO A ANO ---------- */

function ensureTools(){
  S.recurring=S.recurring||[]; S.shopping=S.shopping||[]; S.house=S.house||[]; S.tasks=S.tasks||[];
  S.trash=S.trash||[]; S.closedMonths=S.closedMonths||[]; S.homePrefs=S.homePrefs||{compact:false};
  // Repara automaticamente meses futuros ausentes sem duplicar lançamentos já existentes.
  // Meses apagados (estão na Lixeira) não são recriados.
  S.trash.forEach(mfRecSkip);
  S.recurring.forEach(item=>genRecurringMonths(item,0,12));
}
function escH(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function openQuick(){
 ensureTools();
 if(document.getElementById('quick-modal'))return;
 document.body.insertAdjacentHTML('beforeend',`<div id="quick-modal" class="quick-backdrop"><form class="quick-box" data-form="quick"><div class="quick-title-row" style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;font-size:17px">Lançamento rápido</h2><button type=button class=mini-btn data-tool="quick-close">✕</button></div><div class="quick-fields"><label><small class="fld-l">Descrição</small><input name=n required placeholder="Ex.: mercado, salário…" autofocus></label><label><small class="fld-l fld-v">Valor (R$)</small><input name=v required type=number min=0 step=.01 inputmode=decimal placeholder="0,00"></label></div><div class=quick-row><select name=kind aria-label="Despesa ou receita"><option value="Despesa">Despesa</option><option value="Receita">Receita</option></select><input name=d type=date value="${TD}" aria-label="Data" required></div><div class=quick-row><label style="flex:1"><small>Repetir por quantos meses?</small><input name=repeatMonths type=number min=1 max=120 value=1></label></div><div class="quick-section-title">FORMA DE PAGAMENTO</div><input type="hidden" name="t" id="quick-pay" value="Pix"><input type="hidden" name="installments" id="quick-installments" value="1"><div class="quick-choice-list pay-choices">${TIPOS.filter(x=>x!=='Fatura').map(x=>`<button type="button" data-quick-pay="${escH(x)}" class="${x==='Pix'?'on':''}">${escH(x)}</button>`).join('')}</div><div id="quick-installment-row" class="installment-inline" style="display:none"><label for="quick-installments-select">Quantidade de parcelas</label><select id="quick-installments-select" aria-label="Quantidade de parcelas">${Array.from({length:120},(_,i)=>`<option value="${i+1}" ${i===0?'selected':''}>${i+1} ${i===0?'parcela':'parcelas'}</option>`).join('')}</select><small>As parcelas serão lançadas automaticamente nos próximos meses.</small></div><div class="quick-section-title">CATEGORIA</div><input type="hidden" name="s" id="quick-sub" value="Pessoal"><div class="quick-choice-list cat-choices">${SUBCATS.map(x=>`<button type="button" data-quick-sub="${escH(x)}" class="${x==='Pessoal'?'on':''}">${escH(x)}</button>`).join('')}</div><button type=submit class=primary-btn style="width:100%">Salvar lançamento</button></form></div>`);
}

function syncReserve(){mfSyncCx()}
function syncReserveOld(){
 try{
  if(!S.reserveStamp){S.reserveStamp=Date.now();S.reserveApplied={};save();return}
  S.reserveApplied=S.reserveApplied&&typeof S.reserveApplied==='object'?S.reserveApplied:{};
  const want={};
  (S.tx||[]).forEach(t=>{if(t&&t.t==='Reserva'&&t.c==='Investimento'&&(+t.v||0)>0&&t.d&&t.d<=TD){const m=/^n(\d{10,})/.exec(String(t.id||''));if(m&&+m[1]>=S.reserveStamp)want[t.id]=Math.round((+t.v)*100)/100}});
  const ids=[...new Set([...Object.keys(want),...Object.keys(S.reserveApplied)])];let delta=0,diff=false;
  ids.forEach(id=>{const w=want[id]||0,a=S.reserveApplied[id]||0;delta+=w-a;if(w!==a)diff=true});
  if(!diff)return;
  let ra=S.inv.find(a=>/reserva\s*(de\s*)?em/i.test(a.a||''));
  if(!ra){ra={a:'RESERVA EM',q:0,p:0,d:0,k:'Seguro',f:1};S.inv.push(ra)}
  if(ra.f)ra.p=Math.round(((+ra.p||0)+delta)*100)/100;else ra.q=Math.round(((+ra.q||0)+delta/(+ra.p||1))*1e6)/1e6;
  S.reserveApplied=want;save();
  if(delta>0.004&&typeof mfToast==='function')setTimeout(()=>mfToast('+'+R(delta)+' somados à reserva de emergência'),50);
 }catch(e){console.warn('Reserva de emergência:',e)}
}
function mfDrawCore(){
 ensureCategoryConfig();syncReserve();if(F.s==='Dia a dia')F.s='Variáveis';S.tx.forEach(t=>{if(t.t==='Cartão')t.t='Crédito';if(t.c&&t.c!=='Receita'&&(!t.s||t.s==='Dia a dia'))t.s=inferSub(t.c);if(t.c&&t.c!=='Receita')t.g=inferMain(t.c,t.s)});if(!S.__futureLaunchCleanup){S.__futureLaunchCleanup=true}
 const _cardToggle=document.getElementById('uiCardEditToggle'),_cardPanel=document.getElementById('uiCardCustomizer');
 if(_cardToggle&&_cardPanel&&_cardToggle.parentElement!==document.body)document.body.append(_cardToggle,_cardPanel);
 if(!S.orc||typeof S.orc!=='object')S.orc={};
 if(!Array.isArray(S.orc.contas))S.orc.contas=[];
 if(!Array.isArray(S.orc.metas))S.orc.metas=[];
 if(!Array.isArray(S.orc.grupos))S.orc.grupos=[];
 if(!Array.isArray(S.house))S.house=[];
 if(!Array.isArray(S.shopping))S.shopping=[];
 if(!Array.isArray(S.tasks))S.tasks=[];
 if(!Array.isArray(S.recurring))S.recurring=[];
 if(!Array.isArray(S.trash))S.trash=[];
 if(!Array.isArray(S.closedMonths))S.closedMonths=[];
 applyLay();snapRes();{const L=S.lay||{},vs=tbs().filter(k=>org||!(L.ht||{})[k]);if(vs.length&&!vs.includes(tab)&&!(tab==='anal'&&vs.includes('geral')))tab=vs[0]}const V=viewFor(tab),y=scrollY;
 $('#app').innerHTML=mfTopBar()+(org?layPanel():'')+lay(tab,withMoved(tab,V()));document.body.classList.toggle('org-on',!!org);document.dispatchEvent(new Event('mf-card-close'));
 if(_cardToggle&&_cardPanel){document.body.append(_cardToggle,_cardPanel);_cardToggle.style.display='none';_cardPanel.style.display='none';_cardToggle.classList.remove('in-organize');_cardPanel.classList.remove('in-organize')}
 document.documentElement.dataset.tab=tab;const dk_=window.mfIsDesk&&mfIsDesk();$('#nv').innerHTML=(dk_?'<header class="mf-sb-brand"><i><svg viewBox="0 0 48 48" fill="none" stroke="#1a1206" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 11.5a10 10 0 0 1 15-6.6"/><path d="M28.6 3.2l2.2 1.9-2.6 1.3"/><path d="M36.5 17a10 10 0 0 1-15 6.6"/><path d="M23.4 25.3l-2.2-1.9 2.6-1.3"/><circle cx="26" cy="14.3" r="6.6" fill="#1a1206" stroke="none"/><text x="26" y="18.6" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="11.5" fill="#fbbf24" stroke="none">$</text><rect x="3.5" y="29.5" width="6" height="17" rx="1.6" fill="#1a1206" stroke="none"/><path d="M9.5 31H19c2.6 0 4.6 .8 6.6 2.2H33c1.9 0 3.2 1.2 3.2 2.8s-1.3 2.8-3.2 2.8H25"/><path d="M36 36.6l4.6-2.2c1.7-.8 3.6-.1 4 1.5.4 1.3-.3 2.6-1.6 3.3l-10.4 5.2c-1.6.8-3.4 1.2-5.2 1.2H9.5"/></svg></i><span>Controle Financeiro<small>Finanças pessoais</small></span></header><small class="mf-sb-lb">Menu principal</small>':'')+tbs().filter(k=>org||!((S.lay||{}).ht||{})[k]).sort((a,b)=>dk_&&!org?(a==='res'?-1:b==='res'?1:0):0).map(k=>`<div><button data-tab=${k} class="${(tab==k||(k==='geral'&&tab==='anal'))?'on':''}${k==='res'?' dash-tab':''}"><span>${((S.lay||{}).ti||{})[k]||TN[k][0]}</span><i class="nv-mono" aria-hidden="true">${((S.lay||{}).ti||{})[k]||NV_MONO[k]||''}</i><em class="nv-l">${escH(((S.lay||{}).tn||{})[k]||(k==='anal'?'Análises':TN[k][1]))}</em></button>${org?`<span><button class=mvb data-mt="${k}|-1">◀</button><button class=mvb data-mt="${k}|1">▶</button></span>`:''}</div>`).join('')+(dk_?mfSideExtra()+mfSideUser():'');scrollTo(0,y)}
const NV_MONO={add:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 6.5V4.5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h7"/><rect x="5.6" y="2.2" width="4.2" height="2.6" rx="1"/><path d="M4.9 9.2l1 1 1.8-1.9M4.9 13.2l1 1 1.8-1.9M4.9 17.2l1 1 1.8-1.9M9.6 9.6h2M9.6 13.6h1.2"/><circle cx="16" cy="15" r="5"/><circle cx="16" cy="15" r="2.4"/><path d="M16 15l5-5M19.2 8.6l2 .1-.1 2"/></svg>`,
mais:`<svg viewBox="0 0 24 24"><defs><mask id="nvm-c"><rect width="24" height="24" fill="#fff"/><path d="M7 11.2h5M7 13.8h7.5M7 16.3h7.5M7 18.8h7.5" stroke="#000" stroke-width="1.1"/><path d="M8.6 9.6V4.4a1.9 1.9 0 0 1 3.8 0v6.2l-1.9 1.5-1.9-1.5" fill="none" stroke="#000" stroke-width="3"/></mask></defs><rect x="3.8" y="7.2" width="13.4" height="13.4" fill="currentColor" mask="url(#nvm-c)"/><path d="M18.9 8.8v13.4H5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.6 9.6V4.4a1.9 1.9 0 0 1 3.8 0v6.2l-1.9 1.5-1.9-1.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
res:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.3" y="3.6" width="19.4" height="13.6" rx="1.6"/><path d="M12 17.2v3M8.4 20.6h7.2"/><path d="M5 9.2h1.2M5 11.6h1.2M5 14h1.2"/><rect x="7.8" y="12.4" width="2" height="2.8" fill="currentColor" stroke="none"/><rect x="11" y="11" width="2" height="4.2" fill="currentColor" stroke="none"/><rect x="14.2" y="12" width="2" height="3.2" fill="currentColor" stroke="none"/><rect x="17.4" y="8.6" width="2" height="6.6" fill="currentColor" stroke="none"/><path d="M7.6 10.4l3.2-3 2.6 1.9 5.2-4.4M16.2 4.6h2.6v2.6"/></svg>`,
inv:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6.2" y="13.6" width="3.2" height="6.4" fill="currentColor" stroke="none"/><rect x="10.8" y="11.4" width="3.2" height="8.6" fill="currentColor" stroke="none"/><rect x="15.4" y="9.2" width="3.2" height="10.8" fill="currentColor" stroke="none"/><path d="M4 21h16.5"/><path d="M4 12.6l3.4-3 2.8 1.8 7.4-6.6M15.2 4.6h3.1v3.1"/></svg>`,
anal:`<svg viewBox="0 0 24 24"><defs><mask id="nvm-w"><rect width="24" height="24" fill="#fff"/><rect x="15.2" y="11.4" width="7.4" height="5" rx="2.5" fill="none" stroke="#000" stroke-width="1.6"/><circle cx="17.7" cy="13.9" r="1.1" fill="#000"/></mask></defs><path d="M7.2 8.4 13.6 4.2l2.6 4.2" fill="currentColor"/><path d="M11 8.4l5.2-2.4 1.4 2.4" fill="currentColor"/><path d="M6.6 8.6h-.9" stroke="currentColor"/><rect x="3" y="8.4" width="17.8" height="12" rx="2" fill="currentColor" mask="url(#nvm-w)"/><path d="M5.2 8.4h14.6" stroke="#000" stroke-opacity=".5" stroke-width=".8"/></svg>`};
const $=s=>document.querySelector(s);
const setp=(p,i,k,v)=>{const a=p.split('.').reduce((o,x)=>o[x],S);(Array.isArray(a)?a[i]:a)[k]=v};
document.addEventListener('click',e=>{const b=e.target.closest('button,.row');if(!b)return;const d=b.dataset;
 if(d.refreshQuotes!==undefined){refreshYahooQuotes();return}
 if(d.saveVrReceipt!==undefined){const day=Math.max(1,Math.min(31,parseInt(document.getElementById('vr-receipt-day')?.value||'1',10)||1)),value=Math.max(0,Number(document.getElementById('vr-receipt-value')?.value)||0);S.tx=(S.tx||[]).filter(t=>!t.vrFoodIncome);S.vrReceipt={day,value};if(value>0){for(let y=2026;y<=2030;y++)for(let m=1;m<=12;m++){const date=new Date(y,m-1,Math.min(day,new Date(y,m,0).getDate()),12),ds=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');S.tx.push({id:'vrfood'+y+String(m).padStart(2,'0'),n:'VR — alimentação',v:value,e:'',d:ds,c:'Receita',g:'Essencial',s:'Alimentação',t:'Pix',vrFoodIncome:true})}}save();draw();return}
 if(d.addCategory!==undefined){ensureCategoryConfig();const inp=document.querySelector('[data-new-category]'),name=String(inp?.value||'').trim();if(!name){alert('Digite o nome da categoria.');return}if([...CATS,'Receita'].some(x=>x.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR'))){alert('Essa categoria já existe.');return}S.catConfig[name]=[];catManageSelected=name;ensureCategoryConfig();save();draw();return}
 if(d.subDelete!==undefined){S.subscriptions=S.subscriptions||{};delete S.subscriptions[d.subDelete];save();draw()}else if(d.reviewSave!==undefined){const i=+d.reviewSave,a=S.inv[i];if(a){S.invReview=S.invReview||{};const key=String(a.a||'').trim(),old=S.invReview[key]||{};old.note=document.querySelector(`[data-review-note=\"${i}\"]`)?.value||'';old.status=document.querySelector(`[data-inv-review=\"${i}\"]`)?.value||old.status||'Manter';S.invReview[key]=old;save();draw()} }else if(d.saveBudget){ensureAnalysis();const c=d.saveBudget,inp=document.querySelector(`[data-budget-input=\"${CSS.escape(c)}\"]`);const v=inp&&inp.value!==''?Math.max(0,+inp.value||0):0;if(v)S.categoryBudgets[c]=v;else delete S.categoryBudgets[c];save();draw()}else if(d.goalDel!==undefined){ensureAnalysis();S.goals.splice(+d.goalDel,1);save();draw()}else if(d.goalContribute!==undefined){ensureAnalysis();const i=+d.goalContribute,inp=document.querySelector(`[data-goal-add=\"${i}\"]`),v=Math.max(0,+inp?.value||0);if(!v){alert('Informe um aporte maior que zero.');return}S.goals[i].current=(+S.goals[i].current||0)+v;save();draw()}else if(d.analysisYear){analysisYear+=+d.analysisYear;draw()}else if(d.dueFilter){dueFilter=d.dueFilter;draw()}else if(d.clearFilters!==undefined){F.search='';F.from='';F.to='';F.cat='';F.pay='';F.kind='';draw()}else if(d.org){org=d.org==='close'?false:!org;draw()}else if(d.invView){F.invView=d.invView;draw()}else if(d.fil){F.fil=d.fil=='todos'?'':d.fil;draw()}else if(d.mvtab){mvTabSheet(d.mvtab)}else if(d.mv){const[t,id,dr]=d.mv.split('|');lset(l=>{const a=(LAST[t]||[]).slice(),i=a.indexOf(id);if(i<0)return;if(dr=='top'||dr=='end'){a.splice(i,1);dr=='top'?a.unshift(id):a.push(id);l.o[t]=a}else l.o[t]=sw(a,i,+dr)})}else if(d.wd){const[id,v]=d.wd.split('|');lset(l=>{l.w=l.w||{};l.w[id]=v})}else if(d.lo){const[k,v]=d.lo.split('|');if(k=='reset'){S.lay={};save();draw()}else if(k=='showtabs'){lset(l=>{l.ht={}})}else if(k=='showcards'){lset(l=>{l.h={}})}else if(k=='preset'){lset(l=>{if(v==='compact'){l.dn='c';l.baseFs=13;l.pad=10;l.gap=8}else if(v==='comfortable'){l.dn='x';l.baseFs=17;l.pad=22;l.gap=18}else{l.dn='n';l.baseFs=15;l.pad=16;l.gap=14}})}else lset(l=>{if(k=='theme')l.theme=v;else if(k=='zoom')l.zoom=+v;else if(k=='allreset')delete l.all;else if(k==='bgTheme')l.bgTheme=v;else if(k=='shadow')l.shadow=v;else if(k=='surface')l.surface=v;else if(k=='cardTone')l.cardTone=v;else if(k=='transparency')l.transparency=v;else if(k=='fs')l.fs=+v;else if(k=='dn')l.dn=v;else if(k=='ac')l.ac=v;else if(k=='cw')l.cw=+v;else if(k=='rad')l.rad=+v;else if(k=='bd')l.bd=v;else if(k=='ht'){l.ht=l.ht||{};const vis=TB0.filter(x=>!l.ht[x]&&x!=v);if(!l.ht[v]&&!vis.length)return;l.ht[v]=!l.ht[v]}})}else if(d.hd){lset(l=>{l.h[d.hd]=!isHid(d.hd)})}else if(d.mt){const[k,dr]=d.mt.split('|');lset(l=>{l.tabs=sw(tbs().slice(),tbs().indexOf(k),+dr)})}else if(d.rmi){if(F.del==d.rmi||String(d.rmi).startsWith('inv:')){const[w,i]=d.rmi.split(':');if(w=='cx')S.cx.splice(+i,1);else(w=='inv'?S.inv:S.orc.contas).splice(+i,1);F.del=null;window.__invOpen={};save()}else F.del=d.rmi;draw()}else if(d.tab){F.del=null;tab=d.tab;if(tab==='res')ym=TD.slice(0,7);draw();scrollTo(0,0)}else if(d.movementKind){tab='add';if(window.mfAddInicio)mfAddInicio();F.c='Receita';F.t='';if(d.movementKind==='saida'){F.c='Lazer e Pessoal';F.s='Variáveis';F.g='Não essencial';F.t='Pix'}draw();scrollTo(0,0)}else if(d.chartMonths){dashChartMonths=+d.chartMonths===12?12:6;draw()}else if(d.cashflowDays){S.cashflowHorizon=[7,30,90].includes(+d.cashflowDays)?+d.cashflowDays:30;save();draw()}else if(d.calday){dashCalDay=dashCalDay===d.calday?'':d.calday;draw()}else if(d.m){ym=nm(ym,+d.m);dashCalDay='';F.dt=null;draw()}else if(d.y){yr+=+d.y;draw()}
 else if(d.subsToggle!==undefined){F.showSubs=!F.showSubs;draw()}else if(d.payToggle!==undefined){F.showPay=!F.showPay;draw()}else if(d.f){F.v=$('#fv').value;F.dt=$('#fd').value;F.n=$('#fn').value;if(d.f==='s'){if(F.c==='Receita'&&!F.t)F.t=F.pt||'Pix';F.s=d.v;F.c=SUB_TO_LEGACY[d.v]||'Lazer e Pessoal';F.g=inferMain(F.c,F.s);F.showSubs=true}else if(d.f==='c'){if(d.v==='Receita'){F.pt=F.t||F.pt;F.t=''}else if(F.c==='Receita')F.t=F.pt||'Pix';F.c=d.v}else if(d.f==='t'){if(d.v==='Crédito'&&F.t!=='Crédito'){F.installmentCount=1}else if(d.v!=='Crédito'){F.installmentCount=1}F.t=d.v;F.showPay=false}draw()}else if(d.e){openTxEditModal(d.e)}
 else if(b.id=='fc'){F.id=null;F.v=F.dt=F.n=null;draw()}else if(b.id=='fx'){ensureTools();const gone=S.tx.find(t=>t.id==F.id);if(gone)S.trash.push({...gone,deletedAt:TD});S.tx=S.tx.filter(t=>t.id!=F.id);F.id=null;F.v=F.dt=F.n=null;save();draw()}
 else if(b.id=='fs'){const v=ev($('#fv').value);if(isNaN(v)){$('#fv').style.borderColor='var(--bad)';return}const name=$('#fn').value.trim();let category=F.c,payment=F.c==='Receita'?'':F.t;if(/^(pagar|pagamento|quitar|quita[cç][aã]o)\s+(a\s+)?fatura\b/i.test(name)){category='';payment='Fatura'}const selectedSub=F.s||inferSub(F.c),legacyCat=category==='Receita'?'Receita':(SUB_TO_LEGACY[selectedSub]||'Lazer e Pessoal');const o={n:name,v,e:/[+\-*/]/.test($('#fv').value.replace(/^-/,''))?$('#fv').value:'',d:$('#fd').value||TD,c:legacyCat,g:category==='Receita'?'':(F.g||inferMain(legacyCat,selectedSub)),s:category==='Receita'?'':selectedSub,t:payment};if(mfAccs().length>1&&payment!=='Crédito'&&payment!=='VR'&&payment!=='Reserva'&&payment!=='Fatura')o.acc=F.acc||mfAccMain();
  const duplicate=S.tx.find(t=>t.id!==F.id&&t.d===o.d&&Math.abs((+t.v||0)-Math.abs(v))<.005&&String(t.n||'').trim().toLowerCase()===name.toLowerCase()&&t.c===o.c&&t.t===o.t);if(duplicate&&!confirm('Já existe um lançamento igual nesta data. Deseja registrar outro mesmo assim?'))return;
  const current=F.id?S.tx.find(t=>t.id==F.id):null;const row={id:current?.id||'n'+Date.now(),...(current&&current.recurringId?{recurringId:current.recurringId,rm:current.rm||String(current.d||'').slice(0,7)}:{}),...o};if(payment==='Crédito'&&(F.installmentCount||1)>1){if(current?.installmentId){const oldId=current.installmentId;S.tx=S.tx.filter(t=>t.installmentId!==oldId)}else if(current){S.tx=S.tx.filter(t=>t.id!==current.id)}S.tx.push(...splitIntoInstallments(row,F.installmentCount,row.id))}else if(current){const oldId=current.installmentId;S.tx=S.tx.filter(t=>t.id!==current.id&&(!oldId||t.installmentId!==oldId));S.tx.push(row)}else S.tx.push(row);F.id=null;F.v=F.dt=F.n=null;F.t='Pix';F.installmentCount=1;save();draw()}
 else if(d.savequickaccount){const n=$('#qac-n')?.value.trim(),v=ev($('#qac-v')?.value||''),dt=$('#qac-d')?.value||TD,g=$('#qac-g')?.value||((S.orc.grupos[0]||{}).n||'Essencial'),r=$('#qac-r')?.value||'none',total=Math.max(2,Math.min(120,parseInt($('#qac-total')?.value||'12',10)||12));if(!n){alert('Informe o nome da conta.');return}if(!Number.isFinite(v)||v<=0){alert('Informe um valor maior que zero.');return}const id='qac'+Date.now();S.orc.contas.push({id,n,v,g,d:dt,p:0,r,total,kind:r==='installments'?'Cartão parcelado':'Conta'});if(r==='monthly'){S.recurring=S.recurring||[];const item={id,n,v,c:'Contas Fixas',t:'Pix',start:dt,confirm:false,source:'planned-account'};S.recurring.push(item);genRecurringMonths(item,0,12)}else if(r==='installments'){const cents=Math.round(v*100);for(let i=0;i<total;i++){const date=shiftMonthDate(dt,i);S.tx.push({id:'n'+Date.now()+'q'+i+Math.random().toString(36).slice(2,5),n:`${n} (${i+1}/${total})`,v:cents/100,e:'',d:date,c:'Contas Fixas',t:'Crédito',installmentId:id,installmentIndex:i+1,installmentCount:total,plannedAccountId:id,autoRecurring:true})}}save();draw()}else if(d.pay){S.tx.push({id:'n'+Date.now(),n:'Fatura '+lab(ym),v:+d.val,e:'',d:d.dt,c:'',t:'Fatura'});save();draw()}else if(d.add=='cx'){S.cx=S.cx||[];S.cx.push({n:'Nova caixinha',v:0,tx:100,d:''});save();draw()}else if(d.add=='salary'){S.orc.salarios=S.orc.salarios||[{n:'Salário principal',v:ev(S.orc.sal)||0}];S.orc.salarios.push({n:'Nova renda',v:0});save();draw()}else if(d.rmsalary!==undefined){if((S.orc.salarios||[]).length<=1){alert('Mantenha pelo menos uma fonte de renda.');return}S.orc.salarios.splice(+d.rmsalary,1);save();draw()}else if(d.add=='grp'){S.orc.grupos.push({n:'Novo grupo',i:0});save();draw()}else if(d.rm){const g=S.orc.grupos[+d.i];if(S.orc.contas.some(c=>c.g==g.n)){alert('Mude as contas deste grupo antes de excluir.')}else{S.orc.grupos.splice(+d.i,1);save()}draw()}else if(d.add=='inv'){openAssetModal()}else if(d.add=='fixed'){openFixedIncomeModal()}else if(d.add=='orc'){S.orc.contas.push({n:'Nova conta',v:0,g:'Essencial',p:0});save();draw()}});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='quick-installments-select'){const h=document.getElementById('quick-installments');if(h)h.value=e.target.value;return}if(e.target&&e.target.id==='f-installments'){F.installmentCount=Math.max(1,Math.min(120,parseInt(e.target.value||'1',10)||1));return}if(e.target&&e.target.id==='qac-r'){const w=document.getElementById('qac-installment-wrap');if(w)w.style.display=e.target.value==='installments'?'block':'none'}});
document.addEventListener('focusin',e=>{const t=e.target;if(t.dataset&&t.dataset.raw!==undefined){t.value=t.dataset.raw;t.select()}});
// Mantém o campo ticker editável durante a digitação, sem redesenhar a tela.
document.addEventListener('input',e=>{const t=e.target;if(!t.matches('input[data-p="inv"][data-k="a"]'))return;const i=Number(t.dataset.i);if(!Number.isInteger(i)||!S.inv||!S.inv[i])return;const a=S.inv[i];a.a=t.value.toUpperCase();if(/CDB|TESOURO|LCI|LCA|LIG|RENDA FIXA/i.test(a.a)){a.f=1;a.q=0;}save();const row=t.closest('.invest-asset-row');const title=row?.querySelector('.invest-asset-id b');if(title)title.textContent=a.a||'Novo ativo';});
document.addEventListener('change',e=>{const cdiInput=e.target;if(cdiInput&&cdiInput.matches('input[data-cdb-cdi]')){S.cxc=S.cxc||{};S.cxc.cdi=Math.max(0,Number(cdiInput.value)||0);save();draw();return}const cdbDateInput=e.target;if(cdbDateInput&&cdbDateInput.matches('input[data-cdb-date]')){const i=Number(cdbDateInput.dataset.i),a=S.inv?.[i];if(a&&isCdbAsset(a)&&cdbDateInput.value){a.cdbDate=cdbDateInput.value;save();if(window.__invOpen)window.__invOpen[i]=true;draw()}return}const t=e.target;if(t.dataset.subStatus!==undefined){S.subscriptions=S.subscriptions||{};const k=t.dataset.subStatus;S.subscriptions[k]=S.subscriptions[k]||{};S.subscriptions[k].status=t.value;save();draw();return}if(t.dataset.tn!==undefined||t.dataset.ti!==undefined){const k=t.dataset.tn!==undefined?'tn':'ti',id=t.dataset[k];lset(l=>{l[k]=l[k]||{};l[k][id]=t.value.trim()});return}if(t.dataset.ord!==undefined){F.ord=t.value;draw();return}if(t.dataset.fv!==undefined){S.fatv=S.fatv||{};const v=ev(t.value);if(!t.value.trim()||isNaN(v))delete S.fatv[ym];else S.fatv[ym]=v;save();draw();return}if(t.dataset.rate!==undefined){S.rate=(+t.value||0)/100;save();draw();return}const d=t.dataset;if(!d.p)return;
 let v=d.t=='b'?t.checked:(d.t=='n'||d.t=='m')?(d.p=='orc'||d.k=='v'&&d.p.startsWith('orc')?t.value:(ev(t.value)||0)):t.value;if(d.p=='ap.l'||d.k=='m'&&d.p=='orc.metas'||d.k=='i')v=(ev(t.value)||0)/100;if(d.p=='orc.grupos'&&d.k=='n'){const old=S.orc.grupos[+d.i].n;S.orc.contas.forEach(c=>{if(c.g==old)c.g=v})}setp(d.p,+d.i,d.k,v);save();if(d.p==='inv'){const a=S.inv[+d.i];if(a&&d.k==='a'&&/CDB|TESOURO|LCI|LCA|LIG|RENDA FIXA/i.test(a.a||'')){a.f=1;a.q=0;save();draw();return}if(t.closest&&t.closest('.invest-edit-details')){invDeferredDraw();return}draw();return}draw()});

window.__invOpen=window.__invOpen||{};
document.addEventListener('toggle',function(e){var d=e.target;if(d&&d.classList&&d.classList.contains('invest-edit-details')){var r=d.closest('.invest-asset-row');if(r&&r.dataset.investIndex!==undefined)window.__invOpen[r.dataset.investIndex]=d.open}},true);
function invFocusInside(){var ae=document.activeElement;return !!(ae&&ae.closest&&ae.closest('.invest-edit-details')&&/^(INPUT|SELECT)$/.test(ae.tagName))}
function invDeferredDraw(){window.__invDirty=true;clearTimeout(window.__invT);window.__invT=setTimeout(function(){if(invFocusInside())return;window.__invDirty=false;draw()},450)}
document.addEventListener('focusout',function(){if(!window.__invDirty)return;clearTimeout(window.__invT);window.__invT=setTimeout(function(){if(invFocusInside())return;window.__invDirty=false;draw()},450)});
function openAssetModal(){
 document.getElementById('asset-modal-backdrop')?.remove();
 document.body.insertAdjacentHTML('beforeend',`<div id="asset-modal-backdrop" class="quick-backdrop"><form class="quick-box" data-form="new-asset" style="max-width:460px"><div class="quick-title-row" style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;font-size:17px">Adicionar novo ativo</h2><button type="button" class="mini-btn" data-tool="asset-close">✕</button></div><div class="quick-fields mf-af" style="margin-top:14px"><label class="mf-af-t"><small>Ticker / código</small><input name="asset-ticker" required placeholder="Ex.: BBAS3, GGRC11" autocapitalize="characters" spellcheck="false"></label><label><small>Quantidade</small><input name="asset-qty" type="number" min="0" step="0.0001" value="0" required></label><label><small>Preço médio (R$)</small><input name="asset-price" type="number" min="0" step="0.0001" value="0" required></label></div><label class="mf-asset-date" style="display:block;margin-top:10px"><small>Data da compra</small><input name="asset-date" type="date" value="${TD}" max="${TD}" required></label><div style="display:flex;gap:8px;margin-top:14px"><button type="button" class="b s" data-tool="asset-close" style="flex:1">Cancelar</button><button type="submit" class="b" style="flex:1">Adicionar ativo</button></div></form></div>`);
 document.querySelector('#asset-modal-backdrop [name="asset-ticker"]')?.focus();
}
document.addEventListener('submit',e=>{const form=e.target;if(!form||form.dataset.form!=='new-asset')return;e.preventDefault();const fd=new FormData(form),ticker=String(fd.get('asset-ticker')||'').trim().toUpperCase(),qty=Number(fd.get('asset-qty')),price=Number(fd.get('asset-price'));if(!ticker){alert('Informe o ticker ou código do ativo.');return}if(!Number.isFinite(qty)||qty<0||!Number.isFinite(price)||price<0){alert('Confira a quantidade e o preço médio.');return}S.inv.push({a:ticker,q:qty,p:price,d:0,k:String(fd.get('asset-profile')||'Crescimento')});save();form.closest('#asset-modal-backdrop')?.remove();draw()});
function openFixedIncomeModal(){
 document.getElementById('fixed-income-backdrop')?.remove();
 const today=new Date();const dateValue=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 const selic=(Math.max(0,+S.rate||0)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
 document.body.insertAdjacentHTML('beforeend',`<div id="fixed-income-backdrop" class="quick-backdrop"><form class="quick-box" data-form="fixed-income" style="max-width:460px"><div class="quick-title-row" style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;font-size:17px">Adicionar renda fixa</h2><button type="button" class="mini-btn" data-tool="fixed-close">✕</button></div><div class="quick-fields" style="margin-top:14px"><label><small>Tipo de ativo</small><select name="fixed-type" id="fixed-type"><option value="CDB">CDB</option><option value="LCI">LCI</option><option value="LCA">LCA</option><option value="LIG">LIG</option><option value="Tesouro Direto">Tesouro Direto</option><option value="Outro">Outro</option></select></label><label><small>Nome / banco (opcional)</small><input name="fixed-name" placeholder="Ex.: CDB Banco X"></label><label><small>Valor aplicado (R$)</small><input name="fixed-principal" type="number" min="0.01" step="0.01" required placeholder="Ex.: 1000,00"></label><label><small>Percentual do CDI (%)</small><input name="fixed-percent" type="number" min="0" step="0.01" value="100" required></label><label><small>Data da compra</small><input name="fixed-date" type="date" value="${dateValue}" required></label><div style="padding:10px 12px;border:1px solid var(--ln);border-radius:12px"><div style="font-size:13px;font-weight:750">Selic hoje: ${selic}% a.a.</div><div class="mu" style="font-size:11px;margin-top:4px">Estimativa bruta aproximada usando a taxa cadastrada no app como referência. O rendimento real depende do CDI, do produto, de impostos e das regras do investimento.</div></div></div><div style="display:flex;gap:8px;margin-top:14px"><button type="button" class="b s" data-tool="fixed-close" style="flex:1">Cancelar</button><button type="submit" class="b" style="flex:1">Adicionar CDB</button></div></form></div>`);
 const type=document.getElementById('fixed-type'),pct=document.querySelector('#fixed-income-backdrop [name="fixed-percent"]'),label=document.querySelector('#fixed-income-backdrop label:nth-of-type(4) small'),submit=document.querySelector('#fixed-income-backdrop button[type="submit"]');
 type.addEventListener('change',()=>{const isCdb=type.value==='CDB';label.textContent=isCdb?'Percentual do CDI (%)':'Percentual anual contratado (%)';submit.textContent=isCdb?'Adicionar CDB':'Adicionar renda fixa';pct.value=isCdb?'100':'0'});
}
document.addEventListener('submit',e=>{const form=e.target;if(!form||form.dataset.form!=='cdb-aporte')return;e.preventDefault();const i=Number(form.dataset.i),a=S.inv?.[i],fd=new FormData(form),v=Number(fd.get('aporte-value')),d=String(fd.get('aporte-date')||'');if(!a||!isCdbAsset(a)){alert('Não foi possível identificar este CDB.');return}if(!Number.isFinite(v)||v<=0){alert('Informe um valor de aporte maior que zero.');return}if(!d){alert('Informe a data do aporte.');return}ensureCdbData(a);a.cdbAportes.push({id:'cdbap'+Date.now(),v,d});a.cdbPrincipal=Math.max(0,+a.cdbPrincipal||0);a.p=a.cdbPrincipal+a.cdbAportes.reduce((sum,x)=>sum+(+x.v||0),0);save();form.closest('#cdb-aporte-backdrop')?.remove();if(window.__invOpen)window.__invOpen[i]=true;draw()});
document.addEventListener('submit',e=>{const form=e.target;if(!form||form.dataset.form!=='fixed-income')return;e.preventDefault();const fd=new FormData(form),type=String(fd.get('fixed-type')||'CDB'),custom=String(fd.get('fixed-name')||'').trim(),principal=Number(fd.get('fixed-principal')),percent=Number(fd.get('fixed-percent')),date=String(fd.get('fixed-date')||'');if(!Number.isFinite(principal)||principal<=0){alert('Informe um valor aplicado maior que zero.');return}if(!Number.isFinite(percent)||percent<0){alert('Informe um percentual válido.');return}if(!date){alert('Informe a data da compra.');return}const name=custom||type;S.inv.push({a:name,q:0,p:principal,d:0,k:'Seguro',f:1,cdbPrincipal:principal,cdbPercent:percent,cdbDate:date,cdbType:type});save();form.closest('#fixed-income-backdrop')?.remove();draw()});
function openCdbAporteModal(index){const a=S.inv?.[index];if(!a||!isCdbAsset(a))return;ensureCdbData(a);document.getElementById('cdb-aporte-backdrop')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="cdb-aporte-backdrop" class="quick-backdrop"><form class="quick-box" data-form="cdb-aporte" data-i="${index}" style="max-width:420px"><div class="quick-title-row" style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;font-size:17px">Novo aporte — ${escH(a.a||'CDB')}</h2><button type="button" class="mini-btn" data-tool="cdb-aporte-close">✕</button></div><p class="mu" style="font-size:12px;margin:10px 0 14px">Este aporte ficará vinculado somente a este CDB e será calculado separadamente a partir da data informada.</p><div class="quick-fields"><label><small>Valor do aporte (R$)</small><input name="aporte-value" type="number" min="0.01" step="0.01" required placeholder="Ex.: 500,00"></label><label><small>Data do aporte</small><input name="aporte-date" type="date" value="${todayISO()}" required></label></div><div style="display:flex;gap:8px;margin-top:14px"><button type="button" class="b s" data-tool="cdb-aporte-close" style="flex:1">Cancelar</button><button type="submit" class="b" style="flex:1">Salvar aporte</button></div></form></div>`);document.querySelector('#cdb-aporte-backdrop [name="aporte-value"]')?.focus()}
document.addEventListener('click',e=>{
 const payToggle=e.target.closest('[data-quick-pay-toggle]');if(payToggle){const panel=document.getElementById('quick-pay-wrap');if(panel){const show=panel.style.display==='none';panel.style.display=show?'block':'none';payToggle.textContent=show?'Fechar ×':'＋ '+(document.getElementById('quick-pay')?.value||'Pagamento');payToggle.setAttribute('aria-expanded',String(show))}return}const payPick=e.target.closest('[data-quick-pay]');if(payPick){const val=payPick.dataset.quickPay;if(val==='Crédito'){document.getElementById('quick-installments').value=document.getElementById('quick-installments-select')?.value||'1'}else if(val!=='Crédito'){document.getElementById('quick-installments').value='1'}const installmentRow=document.getElementById('quick-installment-row');if(installmentRow)installmentRow.style.display=val==='Crédito'?'block':'none';document.getElementById('quick-pay').value=val;document.querySelectorAll('[data-quick-pay]').forEach(x=>x.classList.toggle('on',x===payPick));return}const subToggle=e.target.closest('[data-quick-subs-toggle]');if(subToggle){const panel=document.getElementById('quick-sub-wrap');if(panel){const show=panel.style.display==='none';panel.style.display=show?'block':'none';subToggle.textContent=show?'Fechar ×':'＋ Categoria';subToggle.setAttribute('aria-expanded',String(show))}return}const subPick=e.target.closest('[data-quick-sub]');if(subPick){const sub=subPick.dataset.quickSub;document.getElementById('quick-sub').value=sub;const selectedSubLabel=document.getElementById('quick-sub-selected');if(selectedSubLabel)selectedSubLabel.textContent=sub;document.querySelectorAll('[data-quick-sub]').forEach(x=>x.classList.toggle('on',x===subPick));return}const q=e.target.closest('[data-quick]'); if(q){e.preventDefault();openQuick();return}
 const b=e.target.closest('[data-tool]');if(!b)return;
 const action=b.dataset.tool,id=b.dataset.id;ensureTools();
 if(action==='cdb-aporte'){openCdbAporteModal(Number(b.dataset.i));return} if(action==='cdb-aporte-close'){document.getElementById('cdb-aporte-backdrop')?.remove();return} if(action==='inv-save'){const i=Number(b.dataset.i);if(Number.isInteger(i)&&S.inv?.[i]){save();if(window.__invOpen)window.__invOpen[i]=false;draw()}return} if(action==='quick-close'){document.getElementById('quick-modal')?.remove();return} if(action==='asset-close'){document.getElementById('asset-modal-backdrop')?.remove();return} if(action==='fixed-close'){document.getElementById('fixed-income-backdrop')?.remove();return}
 if(action==='rec-del'){S.recurring=S.recurring.filter(x=>x.id!==id)}
 else if(action==='rec-gen'){const item=S.recurring.find(x=>x.id===id);if(item)genRecurringMonths(item,12,12)}
 else if(action==='confirm-rec'){const x=S.tx.find(t=>t.id===id);if(x)x.pendingConfirm=false}
 else if(action==='skip-rec'){mfRecSkip(S.tx.find(t=>t.id===id));S.tx=S.tx.filter(t=>t.id!==id)}
 else if(action==='shop-del'){S.shopping=S.shopping.filter(x=>x.id!==id)}
 else if(action==='house-del'){S.house=S.house.filter(x=>x.id!==id)}
 else if(action==='task-del'){S.tasks=S.tasks.filter(x=>x.id!==id)}
 else if(action==='restore'){const x=S.trash.find(t=>t.id===id);if(x){const {deletedAt,...rest}=x;if(!S.tx.some(t=>t.id===rest.id))S.tx.push(rest);S.trash=S.trash.filter(t=>t.id!==id)}}
 else if(action==='close-month'){const rows=S.tx.filter(t=>t.d.slice(0,7)===ym),expRows=rows.filter(t=>t.c&&t.c!=='Receita'&&t.c!=='Investimento'&&t.t!=='Fatura'&&t.t!=='Reserva'&&!isVR(t)&&!isInvoicePayment(t)),exp=expRows.reduce((n,t)=>n+(+t.v||0),0),rec=rows.filter(t=>t.c==='Receita'&&!isVR(t)).reduce((n,t)=>n+(+t.v||0),0),cats={};expRows.forEach(t=>cats[t.c]=(cats[t.c]||0)+(+t.v||0));const top=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];S.closedMonths=S.closedMonths.filter(x=>x.ym!==ym&&x.month!==lab(ym));S.closedMonths.push({month:lab(ym),ym,rec,exp,balance:rec-exp,savingsRate:rec>0?Math.round((rec-exp)/rec*1000)/10:0,topCategory:top?top[0]:'',topCategoryValue:top?top[1]:0,closedAt:TD});}
 else if(action==='compact'){S.homePrefs.compact=!!b.checked;save();draw();return}
 else if(action==='reset-home'){S.homePrefs.compact=false}
 else if(action==='task-toggle'||action==='shop-toggle'){return}
 else return;
 save();draw();
});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.lrange){const key=t.dataset.lrange,value=+t.value;lset(l=>{l[key]=value});return}
 if(t.dataset.invReview!==undefined){const a=S.inv[+t.dataset.invReview];if(a){S.invReview=S.invReview||{};const key=String(a.a||'').trim(),old=S.invReview[key]||{};old.note=document.querySelector(`[data-review-note=\"${+t.dataset.invReview}\"]`)?.value||old.note||'';old.status=t.value;S.invReview[key]=old;save();draw()}return}
 if(t.dataset.dashVis!==undefined){S.lay=S.lay||{};S.lay.h=S.lay.h||{};S.lay.h[t.dataset.dashVis]=!t.checked;save();draw();return}
 if(t.dataset.searchExtrato!==undefined){F.search=t.value;draw();return}if(t.dataset.filter){F[t.dataset.filter]=t.value;draw();return}
 if(t.dataset.shopprice){ensureTools();const x=S.shopping.find(x=>x.id===t.dataset.shopprice);if(x){x.real=t.value===''?null:Math.max(0,+t.value||0);save();draw()}return}
 if(t.dataset.tool==='shop-toggle'){ensureTools();const x=S.shopping.find(x=>x.id===t.dataset.id);if(x)x.done=t.checked;save();draw();return}
 if(t.dataset.tool==='task-toggle'){ensureTools();const x=S.tasks.find(x=>x.id===t.dataset.id);if(x)x.done=t.checked;save();draw();return}
});
document.addEventListener('submit',e=>{
 const form=e.target.closest('form[data-form]');if(!form)return;
 e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());const type=form.dataset.form;ensureTools();
 if(type==='card-billing'){const due=Math.max(1,Math.min(31,parseInt(data.dueDay||'10',10)||10)),best=Math.max(1,Math.min(31,parseInt(data.bestDay||'4',10)||4));S.cardBilling={dueDay:due,bestDay:best};save();draw();return}
 if(type==='adv-invest'){S.advInvest={monthly:Math.max(0,+data.monthly||0),rate:+data.rate||0,years:Math.max(1,Math.min(60,+data.years||20)),inflation:Math.max(0,+data.inflation||0)};save();draw();return}
 if(type==='subscription'){S.subscriptions=S.subscriptions||{};const name=String(data.name||'').trim(),value=Math.max(0,+data.value||0),key='manual-'+name.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-');if(!name||value<=0){alert('Informe o nome e um valor mensal maior que zero.');return}S.subscriptions[key]={manual:true,name,value,status:'Reavaliar'};save();draw();return}
 if(type==='decision'){S.decisionSim={amount:Math.max(0,+data.amount||0),monthly:Math.max(0,+data.monthly||0),years:Math.max(1,Math.min(60,+data.years||10)),rate:+data.rate||0,debtRate:Math.max(0,+data.debtRate||0)};save();draw();return}
 if(type==='goal'){ensureAnalysis();const name=String(data.name||'').trim(),target=Math.max(0,+data.target||0);if(!name||target<=0){alert('Informe um nome e um valor-alvo maior que zero.');return}S.goals.push({id:'goal'+Date.now(),name,target,current:Math.max(0,+data.current||0),monthly:Math.max(0,+data.monthly||0),deadline:data.deadline||''});save();draw();return}
 if(type==='quick'){
  const name=String(data.n||'').trim();const amount=Number(data.v);if(!name){alert('Informe o nome do lançamento.');form.querySelector('[name="n"]')?.focus();return}if(!Number.isFinite(amount)||amount<=0){alert('Informe um valor maior que zero.');form.querySelector('[name="v"]')?.focus();return}if(!data.d){alert('Informe a data do lançamento.');form.querySelector('[name="d"]')?.focus();return}let c=data.kind==='Receita'?'Receita':(SUB_TO_LEGACY[data.s||'Pessoal']||'Lazer e Pessoal'),t=c==='Receita'?'':data.t;
  if(/^(pagar|pagamento|quitar|quita[cç][aã]o)\s+(a\s+)?fatura\b/i.test(name)){c='';t='Fatura'}
  const selectedSub=data.s||'Pessoal';const row={id:'n'+Date.now(),n:name,v:amount,e:'',d:data.d||TD,c,g:data.kind==='Receita'?'':inferMain(c,selectedSub),s:data.kind==='Receita'?'':selectedSub,t};
  const duplicate=S.tx.find(x=>x.d===row.d&&Math.abs((+x.v||0)-row.v)<.005&&String(x.n||'').trim().toLowerCase()===name.toLowerCase()&&x.c===row.c&&x.t===row.t);if(duplicate&&!confirm('Já existe um lançamento igual nesta data. Deseja registrar outro mesmo assim?'))return;
  const count=row.t==='Crédito'?Math.max(1,Math.min(120,parseInt(data.installments||'1',10)||1)):1,repeat=Math.max(1,Math.min(120,parseInt(data.repeatMonths||'1',10)||1));if(count>1){S.tx.push(...splitIntoInstallments(row,count,row.id))}else{for(let i=0;i<repeat;i++){const d=i?shiftMonthDate(row.d,i):row.d;S.tx.push({...row,id:i?row.id+'r'+i:row.id,d})}}document.getElementById('quick-modal')?.remove();save();draw();return;
 }
 if(type==='rec'){
  const item={id:'rec'+Date.now(),n:String(data.n||'').trim(),v:Math.max(0,+data.v||0),c:SUB_TO_LEGACY[data.c]||data.c,s:data.c,g:inferMain(SUB_TO_LEGACY[data.c]||data.c,data.c),t:data.t,start:data.start||TD,confirm:data.confirm==='1'};
  S.recurring.push(item);genRecurringMonths(item,0,12);
 }else if(type==='parcel'){
  const total=Math.round((+data.v||0)*100),count=Math.max(2,Math.min(120,parseInt(data.count)||2)),base=Math.floor(total/count),start=data.start||TD,id='par'+Date.now();
  for(let i=0;i<count;i++){const cents=i===count-1?total-base*(count-1):base;S.tx.push({id:'n'+Date.now()+'p'+i+Math.random().toString(36).slice(2,5),n:`${String(data.n||'Compra').trim()} (${i+1}/${count})`,v:cents/100,e:'',d:shiftMonthDate(start,i),c:SUB_TO_LEGACY[data.c]||data.c,s:data.c,g:inferMain(SUB_TO_LEGACY[data.c]||data.c,data.c),t:data.t,installmentId:id,installmentIndex:i+1,installmentCount:count})}
 }else if(type==='shop'){
  S.shopping.push({id:'shop'+Date.now(),n:String(data.n||'').trim(),qty:Math.max(.01,+data.qty||1),est:Math.max(0,+data.est||0),real:null,done:false});
 }else if(type==='house'){
  S.housePrefs={incomeA:Math.max(0,+data.incomeA||0),incomeB:Math.max(0,+data.incomeB||0)};S.house.push({id:'house'+Date.now(),n:String(data.n||'').trim(),v:Math.max(0,+data.v||0),d:data.d||TD,by:data.by||'Pessoa 1',shared:data.shared==='1',splitMode:data.splitPct==='income'?'income':'fixed',splitPct:data.splitPct==='income'?50:Math.max(0,Math.min(100,+data.splitPct||50))});
 }else if(type==='task'){
  S.tasks.push({id:'task'+Date.now(),n:String(data.n||'').trim(),d:data.d||'',kind:data.kind||'Outro',done:false});
 }
 save();draw();
});
/* ===== Patch 28: Lançamentos limpo, simulador de gastos e gastos por categoria ===== */
var MF_PAL=['#7cc4fa','#8b7cf6','#5fbf77','#f2c14e','#f07b7b','#5ad1c8','#c58af0','#8e8e93','#f59e6b','#9ad46a'];
function mfDonut(rows,o){o=o||{};const sz=o.size||150,sum=rows.reduce((s,r)=>s+Math.max(0,r.v),0)||1,R0=44,C=2*Math.PI*R0,gap=rows.length>1?3.2:0;let off=0;
 const arcs=rows.map((r,i)=>{const l=Math.max(0,r.v)/sum*C,len=Math.max(.01,l-gap),x=`<circle class="mf-dn-a" data-i="${i}" data-n="${escH(r.n)}" data-v="${escH(R(r.v))}" data-p="${(Math.max(0,r.v)/sum*100).toFixed(2)}" cx="60" cy="60" r="${R0}" fill="none" stroke="${r.c}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${len.toFixed(2)} ${(C-len).toFixed(2)}" stroke-dashoffset="${(-off-gap/2).toFixed(2)}" transform="rotate(-90 60 60)"><title>${escH(r.n)}: ${R(r.v)}</title></circle>`;off+=l;return x}).join('');
 return `<svg class="mf-donut mf-dn" viewBox="0 0 120 120" role="img" aria-label="${escH(o.aria||'Gráfico de rosca')}" style="width:${sz}px;height:${sz}px"><circle cx="60" cy="60" r="${R0}" fill="none" stroke="var(--card-2)" stroke-width="11"/>${arcs}${o.center?`<text class="mf-dn-c" x="60" y="${o.sub?59:65}" text-anchor="middle" font-size="${o.cfs||17}" font-weight="700" fill="var(--tx)">${escH(o.center)}</text>`:''}${o.sub?`<text class="mf-dn-s" x="60" y="74" text-anchor="middle" font-size="8" fill="var(--mu)">${escH(o.sub)}</text>`:''}</svg>`}
function mfLegend(rows,total){return `<div class="mf-leg">${rows.map(r=>`<div><i style="background:${r.c}"></i><span>${escH(r.n)}</span><b>${total?Math.round(r.v/total*100):0}%</b></div>`).join('')}</div>`}
function mfSeg(attr,cur,opts){return `<div class="mf-seg">${opts.map(([k,t])=>`<button type="button" class="${k===cur?'on':''}" ${attr}="${k}">${t}</button>`).join('')}</div>`}

/* ---- Lançamentos ---- */

/* ---- Simulador de gastos (Contas) ---- */
function plGastoHtml(P){
 const ed=window.__plEd||{},R_=P.rendas,G=P.gasto.itens,liq=R_.reduce((s,x)=>s+Math.max(0,(+x.v||0)-(+x.dc||0)),0),desc=R_.reduce((s,x)=>s+(+x.dc||0),0),tot=G.reduce((s,x)=>s+(+x.v||0),0),sobra=liq-tot,pct=liq>0?Math.min(100,tot/liq*100):(tot>0?100:0);
 const er=ed.t==='r'?R_[ed.i]:null,eg=ed.t==='g'?G[ed.i]:null,fld=(id,l,ph,v,mode)=>`<label class="pl-f"><small class="fld-l">${l}</small><input id="${id}" type="text" ${mode?`inputmode="${mode}"`:''} autocomplete="off" placeholder="${ph}" value="${escH(v==null?'':v)}"></label>`;
 const item=(x,i,t,cls,val)=>`<div class="mf-si"><div class="mf-txm"><b>${escH(x.n)}</b>${x.desc||(+x.dc>0)?`<small>${escH([x.desc,+x.dc>0?'desconto '+R(+x.dc):''].filter(Boolean).join(' · '))}</small>`:''}</div><b class="${cls}">${R(val)}</b><button type="button" class="mf-si-b" data-pc="${t}-edit" data-pci="${i}" aria-label="Editar">✎</button><button type="button" class="mf-si-b" data-pc="${t}-del" data-pci="${i}" aria-label="Remover">✕</button></div>`;
 const rows=[{n:'Gastos',v:Math.min(tot,liq||tot),c:sobra<0?'var(--bad)':'#f07b7b'},{n:'Sobra',v:Math.max(0,sobra),c:'#5fbf77'}];
 return B('p_gasto')+`<section class="c pl-sim mf-sim"><h2>Simulador de gastos</h2>
 <div class="mf-sim-top">${mfChart('p_gasto','rosca')==='barras'?`<div class="mf-hbars" style="min-width:170px;flex:1">${[['Renda',liq,'#5fbf77'],['Gastos',tot,'#f07b7b']].map(([n,v,c])=>`<div><span>${n}</span><i><b style="width:${(Math.max(liq,tot)?v/Math.max(liq,tot)*100:0).toFixed(1)}%;background:${c}"></b></i><em>${R(v)}</em></div>`).join('')}</div>`:mfDonut(rows,{size:132,center:Math.round(pct)+'%',sub:'da renda',aria:'Renda comprometida'})}<div class="mf-sim-kv"><div><small>Renda líquida</small><b class="ok">${R(liq)}</b></div><div><small>Gastos (${G.length})</small><b class="bad">${R(tot)}</b></div><div><small>${sobra<0?'Faltam':'Sobra'}</small><b class="${sobra<0?'bad':'ok'}">${R(Math.abs(sobra))}</b></div></div></div>
 <div class="mf-sim-sec"><div class="mf-day"><span>Rendas</span><small>${R_.length}</small></div>${R_.map((x,i)=>item(x,i,'r','ok',Math.max(0,(+x.v||0)-(+x.dc||0)))).join('')||'<div class="mu mf-empty">Nenhuma renda ainda.</div>'}
 <details class="mf-add" ${er?'open':''}><summary>${er?'Editar renda':'＋ Adicionar renda'}</summary><div class="pl-grid">${fld('pl-rn','Nome','Ex.: Salário',er&&er.n)}${fld('pl-rv','Valor (R$)','0,00',er&&plFmt(+er.v),'decimal')}${fld('pl-rdesc','Descrição (opcional)','Ex.: CLT',er&&er.desc)}${fld('pl-rdc','Desconto (R$)','INSS, IR…',er&&plFmt(+er.dc),'decimal')}</div><div class="pl-btns"><button type="button" class="b" data-pc="r-add">${er?'Salvar renda':'Adicionar'}</button>${er?'<button type="button" class="b s" data-pc="cancel">Cancelar</button>':''}</div></details></div>
 <div class="mf-sim-sec"><div class="mf-day"><span>Gastos</span><small>${G.length}</small></div>${G.map((x,i)=>item(x,i,'g','bad',+x.v||0)).join('')||'<div class="mu mf-empty">Nenhum gasto na lista.</div>'}
 <details class="mf-add" ${eg?'open':''}><summary>${eg?'Editar gasto':'＋ Adicionar gasto'}</summary><div class="pl-grid">${fld('pl-gn','Nome','Ex.: Aluguel',eg&&eg.n)}${fld('pl-gv','Valor (R$)','0,00',eg&&plFmt(+eg.v),'decimal')}<div style="grid-column:1/-1">${fld('pl-gdesc','Descrição (opcional)','Ex.: vence dia 5',eg&&eg.desc)}</div></div><div class="pl-btns"><button type="button" class="b" data-pc="g-add">${eg?'Salvar gasto':'Adicionar'}</button>${eg?'<button type="button" class="b s" data-pc="cancel">Cancelar</button>':''}</div></details></div>
 ${desc>0?`<p class="mu" style="font-size:11px;text-align:center;margin:8px 0 0">Descontos nas rendas: ${R(desc)}</p>`:''}</section>`}

/* ---- Gastos por categoria (Dashboard) com troca de gráfico ---- */
function dashboardCategoryBreakdown(){
 const a=dashStats(ym,false),entries=Object.entries(a.cats).filter(([,v])=>v>0).sort((x,y)=>y[1]-x[1]),total=entries.reduce((n,x)=>n+x[1],0),mode=(S.view&&S.view.catMode)||'rosca';
 const rows=entries.slice(0,8).map(([n,v],i)=>({n,v,c:MF_PAL[i%MF_PAL.length]}));if(entries.length>8)rows.push({n:'Outras',v:entries.slice(8).reduce((s,x)=>s+x[1],0),c:'#8e8e93'});
 let body='<div class="dash-empty">Ainda não há despesas neste mês.</div>';
 if(rows.length){const top=rows[0];
  if(mode==='rosca')body=`<div class="mf-cat-donut">${mfDonut(rows,{size:150,center:Math.round(top.v/total*100)+'%',sub:top.n,cfs:18})}${mfLegend(rows,total)}</div>`;
  else if(mode==='barras'){const mx=rows[0].v;body=`<div class="mf-hbars">${rows.map(r=>`<div><span>${escH(r.n)}</span><i><b style="width:${(r.v/mx*100).toFixed(1)}%;background:${r.c}"></b></i><em>${R(r.v)}</em></div>`).join('')}</div>`}
  else body=`<div class="mf-clist">${rows.map(r=>`<div><i style="background:${r.c}"></i><span>${escH(r.n)}</span><small>${Math.round(r.v/total*100)}%</small><b>${R(r.v)}</b></div>`).join('')}</div>`;
  body+=`<div class="mf-cat-tot">Total do mês <b>${R(total)}</b></div>`}
 return `<section class="dash-extra-card mf-cat"><div class="dash-section-head"><div><h2>Gastos por categoria</h2></div></div>${mfSeg('data-catm',mode,[['rosca','Rosca'],['barras','Barras'],['lista','Lista']])}${body}</section>`;
}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-catm]');if(!b)return;e.preventDefault();e.stopPropagation();S.view=S.view||{};S.view.catMode=b.dataset.catm;S.view.d_cat=Object.assign({},S.view.d_cat,{chart:b.dataset.catm});save();draw()},true);

/* ===== Patch 29: Investimentos no estilo do print ===== */
/* Nova organização: Reserva de emergência (i_reserva) e Metas (p_metas) aparecem em Patrimônio › Metas (quem escondeu continua escondido) */
var MF_DEFHID=['i_tipo','i_pie','i_ap','i_barb','p_proj'];
var IV_ICO={acao:'<path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6Z"/><path d="M12 8v8M14.2 9.6c-.4-.7-1.2-1.1-2.2-1.1-1.3 0-2.2.7-2.2 1.7 0 2.3 4.5 1.3 4.5 3.6 0 1-.9 1.8-2.3 1.8-1 0-1.9-.4-2.4-1.2"/>',fii:'<path d="M4 20V9l5-3v14M9 20V4l7 3v13M16 20v-9l4 2v7M3 20h18"/>',etf:'<rect x="3.5" y="4" width="17" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 12l3-3 2 2 4-4"/>',rf:'<rect x="4" y="3.5" width="12" height="17" rx="2"/><path d="M7 8h6M7 11.5h6M7 15h3"/><circle cx="17.5" cy="16.5" r="3.5"/><path d="M17.5 15v3"/>',rv:'<path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6Z"/><path d="M9 12l2 2 4-4"/>'};
var IV_ORD=['acao','fii','etf','rf','rv'],IV_COLS={acao:'#7cc4fa',fii:'#8b7cf6',etf:'#5fbf77',rf:'#f2c14e',rv:'#5ad1c8'};
function ivGroups(I){const g={};I.forEach(a=>{const k=ivClass(a);(g[k]=g[k]||[]).push(a)});return Object.entries(g).map(([k,arr])=>{const v=arr.reduce((s,a)=>s+ivNow(a),0),G=arr.filter(a=>ivHasGain(a)),c=G.reduce((s,a)=>s+ivCost(a),0),gn=G.reduce((s,a)=>s+ivNow(a)-ivCost(a),0);return {k,arr,v,rent:c>0?gn/c*100:null}}).sort((a,b)=>(IV_ORD.indexOf(a.k)+1||9)-(IV_ORD.indexOf(b.k)+1||9))}
function ivChartBase(I){const gs=ivGroups(I).filter(g=>g.v>0),tot=gs.reduce((s,g)=>s+g.v,0);if(!gs.length)return '';/* 1.19: também por setor e por ativo */
 const rows=gs.map(g=>({n:IV_NOME[g.k]||'Outros',v:g.v,c:IV_COLS[g.k]||'#8e8e93'})),top=rows.slice().sort((a,b)=>b.v-a.v)[0];
 const ks=Array.from({length:12},(_,i)=>nm(TD.slice(0,7),i-11)),ap=ks.map(k=>S.tx.filter(t=>t.d&&t.d.slice(0,7)===k&&t.c==='Investimento').reduce((s,t)=>s+(+t.v||0),0));
 const W=300,H=96,mx=Math.max(...ap,1),pts=ap.map((v,i)=>[10+i*(W-20)/11,H-14-(v/mx)*(H-34)]),last=ap[ap.length-1];
 const line=ap.some(v=>v>0)?`<div class="mf-ivl"><div class="mf-ivl-h"><span>Aportes</span><b>${R(last)}</b></div><svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block"><path d="${anSmooth(pts)}" fill="none" stroke="var(--ac)" stroke-width="2.4" stroke-linecap="round"/><circle cx="${pts[11][0]}" cy="${pts[11][1]}" r="3.6" fill="var(--ac)"/>${ks.map((k,i)=>i%2?'':`<text x="${pts[i][0]}" y="${H-2}" text-anchor="middle" font-size="8" fill="var(--mu)">${MES[+k.slice(5)-1]}</text>`).join('')}</svg></div>`:'';
 const dm=['classe','setor','ativo'].includes(mfView('i_chart','dm','classe'))?mfView('i_chart','dm','classe'):'classe',seg=`<div class="mf-seg mf-dist-seg">${[['classe','Classe'],['setor','Setor'],['ativo','Ativo']].map(([k,t])=>`<button type="button" class="${k===dm?'on':''}" data-distm="${k}">${t}</button>`).join('')}</div>`;
 const A=I.filter(a=>ivNow(a)>0);let R2=rows,extra='',cen={};
 if(dm==='setor'){const m=new Map();A.forEach(a=>{const k=mfSetorOf(a);m.set(k,(m.get(k)||0)+ivNow(a))});R2=[...m.entries()].sort((a,b)=>b[1]-a[1]).map(([n,v],i)=>({n,v,c:MF_PAL[i%MF_PAL.length]}));const t0=R2[0];
  extra=(t0&&t0.v/tot>0.4?`<p class="mf-cmp mf-setor-al"><b class="wa">${escH(t0.n)}</b> concentra ${Math.round(t0.v/tot*100)}% da carteira.</p>`:'')+`<button type="button" class="mfc-btn ghost mf-setor-ed" data-setored="1">Ajustar setores</button>`;cen={center:String(R2.length),sub:R2.length===1?'setor':'setores'}}
 else if(dm==='ativo'){R2=A.map(a=>({n:String(a.a||'Ativo'),v:ivNow(a)})).sort((a,b)=>b.v-a.v).map((x,i)=>Object.assign(x,{c:MF_PAL[i%MF_PAL.length]}));cen={center:String(R2.length),sub:R2.length===1?'ativo':'ativos'}}
 return `${B('i_chart')}<section class="c mf-ivc" data-dm="${dm}"><h2>Distribuição da carteira</h2>${seg}${mfCatView(R2,mfChart('i_chart','rosca'),Object.assign({aria:'Distribuição por '+dm},cen))}${extra}${line}</section>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-distm]');if(!b)return;e.preventDefault();e.stopPropagation();S.view=S.view||{};S.view.i_chart=Object.assign({},S.view.i_chart,{dm:b.dataset.distm});save();draw()},true);
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 const c=t.closest('[data-ivcls]');if(c){e.preventDefault();e.stopPropagation();window.__ivOpenCls=window.__ivOpenCls||{};const k=c.dataset.ivcls;window.__ivOpenCls[k]=!window.__ivOpenCls[k];draw();return}
 const a=t.closest('[data-ivadd]');if(a){e.preventDefault();e.stopPropagation();openAssetModal();return}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('[data-ivtgt]'))return;S.invTarget=S.invTarget||{};const v=Math.max(0,Math.min(100,Math.round(+String(t.value).replace(',','.')||0)));if(v)S.invTarget[t.dataset.ivtgt]=v;else delete S.invTarget[t.dataset.ivtgt];window.__ivTgtOpen=true;save();draw()},true);
document.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('mf-tgt'))window.__ivTgtOpen=e.target.open},true);

window.__mfFolded=window.__mfFolded||{};if(!('inv:Meus ativos' in window.__mfFolded))window.__mfFolded['inv:Meus ativos']=true;

/* ===== Patch 30: Análises redesenhada (mês a mês e ano a ano) ===== */
window.__anMode=window.__anMode||'mes';window.__anYear=window.__anYear||+TD.slice(0,4);
function mfAnTop(){return anModeSeg()}

function mfDelta(cur,prev,good){if(!(Math.abs(prev)>0.005))return '<small class="mf-dl mu">sem comparação</small>';const p=(cur-prev)/Math.abs(prev)*100,up=p>=0,ok=good==='up'?up:!up;return `<small class="mf-dl ${ok?'ok':'bad'}">${up?'▲':'▼'} ${Math.abs(p).toFixed(0)}%</small>`}
function mfKeys(items){return `<div class="mf-keys">${items.map(([t,c,d])=>`<span><i style="background:${c}${d?';opacity:.6':''}"></i>${t}</span>`).join('')}</div>`}
const anC=(id,title,body,extra)=>B(id)+`<section class="c mf-an ${extra||''}"><h2>${title}</h2>${body}</section>`;
function anKpis(rows){return `<div class="mf-kpis">${rows.map(([l,v,cls,dl])=>`<div><small>${l}</small><b class="${cls||''}">${v}</b>${dl||''}</div>`).join('')}</div>`}

/* ---- Mês ---- */

/* ---- Ano ---- */
function anAno(){const y=window.__anYear,cy=+TD.slice(0,4),lastM=y===cy?+TD.slice(5,7):12,M=anYear(y),P=anYear(y-1),Mv=M.slice(0,lastM),Pv=P.slice(0,lastM),out=[];
 const sum=(A,f)=>A.reduce((s,r)=>s+f(r),0),rec=sum(Mv,r=>r.rec),exp=sum(Mv,r=>r.exp),bal=rec-exp,inv=sum(Mv,r=>r.inv),prec=sum(Pv,r=>r.rec),pexp=sum(Pv,r=>r.exp),pinv=sum(Pv,r=>r.inv),eco=rec>0?bal/rec*100:null,peco=prec>0?(prec-pexp)/prec*100:null;
 out.push(anC('n_akpi',`Resumo de ${y}`,anKpis([['Receitas',R(rec),'ok',mfDelta(rec,prec,'up')],['Despesas',R(exp),'bad',mfDelta(exp,pexp,'down')],['Investido',R(inv),'',mfDelta(inv,pinv,'up')],['Economia',eco==null?'—':Math.round(eco)+'%','',eco!=null&&peco!=null?`<small class="mf-dl ${eco>=peco?'ok':'bad'}">${eco>=peco?'▲':'▼'} ${Math.abs(eco-peco).toFixed(0)} p.p.</small>`:'<small class="mf-dl mu">da renda</small>']])+`<p class="mf-cmp">${y===cy?`De janeiro a ${MESF[lastM-1].toLowerCase()}, comparado com o mesmo período de ${y-1}`:`Comparado com ${y-1}`}</p>`));
 const names=MES.map(x=>x.charAt(0).toUpperCase()+x.slice(1,3));
 out.push(anC('n_aflux','Receitas x despesas',mfSeriesView(names,[{vals:M.map((r,i)=>i<lastM?r.rec:null),color:'#5fbf77'},{vals:M.map((r,i)=>i<lastM?r.exp:null),color:'#f07b7b'}],mfChart('n_aflux','linha'),{every:2,aria:'Receitas e despesas por mês'})+mfKeys([['Receitas','#5fbf77'],['Despesas','#f07b7b']])));
 const ec=M.map((r,i)=>i<lastM&&r.rec>0?r.poup:null),emx=Math.max(10,...ec.filter(v=>v!=null).map(Math.abs));
 out.push(anC('n_apoup','Taxa de economia por mês',mfChart('n_apoup','barras')==='linha'?mfLines(names,[{vals:ec,color:'#5fbf77',fill:true}],{every:2,aria:'Taxa de economia'}):`<div class="mf-vbars">${M.map((r,i)=>{const v=ec[i];return `<div title="${MESF[i]}: ${v==null?'—':Math.round(v)+'%'}"><span>${v==null?'':Math.round(v)+'%'}</span><i style="height:${v==null?0:Math.max(3,Math.abs(v)/emx*100)}%;background:${v==null?'transparent':v>=0?'#5fbf77':'#f07b7b'}"></i><small>${names[i].charAt(0)}</small></div>`}).join('')}</div>`));
 let acc=0;const ac=M.map((r,i)=>i<lastM?(acc+=r.bal):null);
 out.push(anC('n_aacum','Saldo acumulado no ano',`<div class="mf-big2"><div><small>Acumulado até ${MESF[lastM-1].toLowerCase()}</small><b class="${bal>=0?'ok':'bad'}">${(bal<0?'−':'')+R(Math.abs(bal))}</b></div></div>${mfSeriesView(names,[{vals:ac,color:'var(--ac)',fill:true}],mfChart('n_aacum','linha'),{every:2,aria:'Saldo acumulado'})}`));
 const cats={},pc={};Mv.forEach(r=>Object.entries(r.cats||{}).forEach(([c,v])=>cats[c]=(cats[c]||0)+v));Pv.forEach(r=>Object.entries(r.cats||{}).forEach(([c,v])=>pc[c]=(pc[c]||0)+v));
 const ce=Object.entries(cats).filter(e=>e[1]>0).sort((x,z)=>z[1]-x[1]).slice(0,8),cmx=ce.length?ce[0][1]:1;
 out.push(anC('n_acat','Categorias no ano',ce.length&&mfChart('n_acat','barras')!=='barras'?mfCatView(ce.map(([c,v],i)=>({n:c,v,c:MF_PAL[i%MF_PAL.length]})),mfChart('n_acat','barras')):ce.length?`<div class="mf-hbars mf-hb3">${ce.map(([c,v],i)=>`<div><span>${escH(c)}</span><i><b style="width:${(v/cmx*100).toFixed(1)}%;background:${MF_PAL[i%MF_PAL.length]}"></b></i><em>${R(v)}</em>${pc[c]>0?`<small class="${v<=pc[c]?'ok':'bad'}">${v>=pc[c]?'▲':'▼'}${Math.abs((v-pc[c])/pc[c]*100).toFixed(0)}%</small>`:'<small class="mu">—</small>'}</div>`).join('')}</div><p class="mf-cmp">Variação contra o mesmo período de ${y-1}</p>`:'<p class="mf-empty">Sem despesas no ano.</p>'));
 const act=(y===cy&&lastM>1?Mv.slice(0,lastM-1):Mv).filter(r=>r.rec||r.exp).sort((x,z)=>z.bal-x.bal);
 if(act.length>1){const bst=act[0],wst=act[act.length-1];out.push(anC('n_amelhor','Melhor e pior mês',`<div class="mf-kpis mf-k2"><div><small>Melhor · ${MESF[bst.m-1]}</small><b class="ok">${(bst.bal<0?'−':'')+R(Math.abs(bst.bal))}</b><small class="mf-dl mu">${bst.poup==null?'':Math.round(bst.poup)+'% de economia'}</small></div><div><small>Mais apertado · ${MESF[wst.m-1]}</small><b class="${wst.bal>=0?'':'bad'}">${(wst.bal<0?'−':'')+R(Math.abs(wst.bal))}</b><small class="mf-dl mu">${wst.poup==null?'':Math.round(wst.poup)+'% de economia'}</small></div></div>`))}
 return out.join('')}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 const m=t.closest('[data-anmode]');if(m){e.preventDefault();e.stopPropagation();window.__anMode=m.dataset.anmode;draw();return}
 const y=t.closest('[data-anyr]');if(y){e.preventDefault();e.stopPropagation();window.__anYear+=+y.dataset.anyr;draw()}},true);

/* ===== Patch 31: ativos dentro das classes, formulário de lançamento moderno ===== */
function ivAssetArticles(I,oldAt){const f0=F.fil;F.fil='';let html='';try{html=ivMeusAtivos(I,oldAt)}finally{F.fil=f0}
 const doc=new DOMParser().parseFromString('<body>'+html+'</body>','text/html'),out={};
 doc.querySelectorAll('article[data-invest-index]').forEach(a=>{out[a.getAttribute('data-invest-index')]=a.outerHTML});return out}

/* ---- Novo lançamento ---- */
function vAdd(){const e=F.id&&S.tx.find(t=>t.id==F.id),vv=F.v??(e?(e.e||String(e.v).replace('.',',')):''),dv=F.dt??(e?e.d:dd()),nn=String(F.n??(e?e.n:'')).replace(/"/g,'&quot;'),rec=F.c==='Receita',curS=F.s||inferSub(F.c);
 const chip=(attrs,on,t,dot)=>`<button type="button" ${attrs} class="mf-pill ${on?'on':''}">${dot?`<i style="background:${dot}"></i>`:''}${t}</button>`;
 return B('form')+`<div class="c form-add mf-form"><h2>${e?'Editar lançamento':'Novo lançamento<button type="button" class="mf-imp-pill" data-mfimp="ext" title="Importar extrato do banco (OFX, CSV ou PDF)" aria-label="Importar extrato do banco (OFX, CSV ou PDF)">Importar</button>'}</h2>
 <div class="mf-seg mf-type">${chip('data-f="c" data-v="Receita"',rec,'Entrada').replace('class="mf-pill','class="mf-pill mf-in')}${chip(`data-f="s" data-v="${rec?'Variáveis':escH(curS)}"`,!rec,'Saída').replace('class="mf-pill','class="mf-pill mf-out')}</div>
 <label class="mf-amt ${rec?'ok':''}"><span>R$</span><input id=fv inputmode=decimal placeholder="0,00" value="${vv}" aria-label="Valor"></label>
 <div class="mf-frow"><label class="mf-fld"><small>Data</small><input id=fd type=date value="${dv}"></label><label class="mf-fld mf-grow"><small>Descrição</small><input id=fn placeholder="Ex.: mercado, aluguel…" value="${nn}"></label></div>
 ${rec?'':`<div class="mf-flab">Categoria</div><div class="mf-cats">${SUBCATS.map(x=>`<button type="button" data-f="s" data-v="${x}" class="mf-cat-t ${curS===x?'on':''}">${(MF_CICO||{})[x]||''}<span>${x}</span></button>`).join('')}</div>
 <div class="mf-flab">Pagamento</div><div class="mf-pills">${TIPOS.filter(x=>x!=='Fatura').map(x=>chip(`data-f="t" data-v="${x}"`,F.t==x,x||'sem',TCOL[x])).join('')}</div>`}
 ${!rec&&F.t==='Crédito'?`<label class="mf-fld mf-inst"><small>Parcelas</small><select id="f-installments">${Array.from({length:120},(_,i)=>`<option value="${i+1}" ${(F.installmentCount||1)===i+1?'selected':''}>${i+1}x${i===0?' (à vista)':''}</option>`).join('')}</select></label>`:''}
 <div class="mf-fbtns"><button class=b id=fs>${e?'Atualizar':'Salvar lançamento'}</button>${e?`<div class="mf-fsec"><button class="b s" id=fc>Cancelar</button><button class="b d" id=fx>Excluir</button></div>`:''}</div></div>`}



/* ===== Patch 33: segurar um bloco para editar · arrastar para mudar de lugar ===== */
(function(){
const HOLD=450,TOL=9;
let lp=null,suppress=false,drag=null;
const inApp=el=>!!(el&&el.closest&&el.closest('#app'));
function headOf(t){if(!t||!t.closest||!inApp(t)||document.body.classList.contains('org-on'))return null;
 if(t.closest('input,select,textarea,label,[contenteditable],.header-bar,.mf-seg,.mf-msw,.ia-card details,.mf-form'))return null;
 const own=t.closest('[data-bk]');if(own&&inApp(own))return own;
 let top=t;while(top.parentElement&&top.parentElement.id!=='app'&&!top.parentElement.classList.contains('mf-dblk'))top=top.parentElement;
 for(let p=top;p;p=p.previousElementSibling){if(p.dataset&&p.dataset.bk)return p}return null}
const vis=h=>h.parentElement&&h.parentElement.classList.contains('mf-dblk')?h.parentElement:h;
const idOf=h=>String(h.dataset.bk||'').split('|');
const titleOf=h=>{const e=h.querySelector&&(h.querySelector('h2,h3')||h.querySelector('small,b'));let t=(e&&e.textContent||h.textContent||'').replace(/[▸▾▼›‹✎⚙]/g,'').replace(/\s+/g,' ').trim();return t.slice(0,46)||'Bloco'};
function toast(msg){document.querySelectorAll('.mf-toast').forEach(t=>t.remove());const o=document.createElement('div');o.className='mf-toast';o.textContent=msg;document.body.appendChild(o);setTimeout(()=>o.remove(),2600)}

/* ---- mover ---- */
const isC=x=>String(x).startsWith('c_');
const fullOf=id=>{const wd=((S.lay||{}).w||{})[id];if(wd)return wd==='f';return id.startsWith('c_')?(WIDE.includes(id)||/^c_.+_\d+$/.test(id)):(typeof MF_DWIDE!=='undefined'&&MF_DWIDE.includes(mfBase(id)))};
function move(t,id,dir){const a=(LAST[t]||[]).slice(),i=a.indexOf(id);if(i<0)return;
 if(dir==='top'||dir==='end'){a.splice(i,1);dir==='top'?a.unshift(id):a.push(id)}
 else if(dir<0){let j=i-1;while(j>=0&&isHid(a[j]))j--;if(j<0)return;if(!isC(id))while(j>0&&isC(a[j])&&isC(a[j-1]))j--;a.splice(i,1);a.splice(j,0,id)}
 else{let j=i+1;while(j<a.length&&isHid(a[j]))j++;if(j>=a.length)return;if(!isC(id))while(j+1<a.length&&isC(a[j])&&isC(a[j+1]))j++;a.splice(i,1);a.splice(j,0,id)}
 lset(l=>{l.o[t]=a})}

/* ---- menu ---- */
function closeMenu(){const m=document.getElementById('mf-lp');if(m)m.remove();document.querySelectorAll('.mf-lp-lift').forEach(x=>x.classList.remove('mf-lp-lift'))}
/* ajuste rápido do bloco (fica salvo na conta: S.lay.sz e S.lay.w) */
function mfSzGet(id){const z=((S.lay||{}).sz||{})[id];return Object.assign({z:'m',h:'a',p:'n'},z||{})}
function mfSzRows(id,full){const z=mfSzGet(id),w=((S.lay||{}).w||{})[id]||(full?'f':''),seg=(k,cur,opts)=>`<div class="mf-sz-seg">${opts.map(([v,t])=>`<button type="button" class="${cur===v?'on':''}" data-lpsz="${k}:${v}">${t}</button>`).join('')}</div>`;
 return `<div class="mf-sz"><div class="mf-sz-r"><small>Tamanho</small>${seg('z',z.z,[['s','Pequeno'],['m','Normal'],['l','Grande']])}</div><div class="mf-sz-r"><small>Altura</small>${seg('h',z.h,[['c','Compacta'],['a','Automática'],['t','Alta']])}</div><div class="mf-sz-r"><small>Espaço interno</small>${seg('p',z.p,[['j','Justo'],['n','Normal'],['a','Amplo']])}</div><div class="mf-sz-r"><small>Largura</small>${seg('w',w==='h'?'h':'f',[['f','Inteira'],['h','Meia']])}</div></div>`}
function mfSzApply(){const SZ=(S.lay||{}).sz||{};document.querySelectorAll('#app [data-bk]').forEach(el=>{const id=String(el.dataset.bk).split('|')[1],z=SZ[id]||SZ[mfBase(id)];
 if(z&&z.z&&z.z!=='m')el.dataset.szz=z.z;else delete el.dataset.szz;if(z&&z.h&&z.h!=='a')el.dataset.szh=z.h;else delete el.dataset.szh;if(z&&z.p&&z.p!=='n')el.dataset.szp=z.p;else delete el.dataset.szp})}
(window.__mfAD=window.__mfAD||[]).push(()=>{try{mfSzApply()}catch(e){}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mf-lp [data-lpsz]');if(!b)return;e.preventDefault();e.stopPropagation();const w=document.getElementById('mf-lp'),h=w&&w.__h;if(!h)return;const [t,id]=idOf(h),[k,v]=b.dataset.lpsz.split(':');
 S.lay=S.lay||{};if(k==='w'){S.lay.w=S.lay.w||{};S.lay.w[id]=v}else{S.lay.sz=S.lay.sz||{};const z=Object.assign({},S.lay.sz[id]||{});z[k]=v;S.lay.sz[id]=z}
 save();draw();b.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))},true);
/* Nome do bloco: S.lay.bt[id] troca o título (h2/h3) do bloco; vazio volta ao nome original */
function mfBtHead(el){return el&&el.querySelector&&el.querySelector('h2,h3')}
function mfBtTextNode(hd){return [...hd.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())}
function mfBtDefault(el){const hd=mfBtHead(el);if(!hd)return '';if(hd.dataset.mfdef==null){const n=mfBtTextNode(hd);hd.dataset.mfdef=n?n.textContent.trim():''}return hd.dataset.mfdef}
function mfBtField(h,id){const el=vis(h)||h,def=mfBtDefault(el);if(!def)return '';const cur=(((S.lay||{}).bt)||{})[id]||'';
 return `<label class="mf-lp-name"><small>Nome do bloco</small><span><input type="text" data-lpname="${escH(id)}" maxlength="40" value="${escH(cur)}" placeholder="${escH(def)}">${cur?`<button type="button" data-lpnamereset="${escH(id)}">Original</button>`:''}</span></label>`}
function mfBtApply(){const BT=((S.lay||{}).bt)||{};document.querySelectorAll('#app [data-bk]').forEach(el=>{const id=String(el.dataset.bk).split('|')[1],hd=mfBtHead(el);if(!hd)return;const def=mfBtDefault(el),n=mfBtTextNode(hd);if(!n)return;const want=BT[id]||def;if(want&&n.textContent.trim()!==want)n.textContent=want})}
(window.__mfAD=window.__mfAD||[]).push(()=>{try{mfBtApply()}catch(e){}});
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('[data-lpname]');if(!i)return;const id=i.dataset.lpname,v=i.value.trim();S.lay=S.lay||{};S.lay.bt=S.lay.bt||{};if(v)S.lay.bt[id]=v;else delete S.lay.bt[id];save();draw();const t=document.querySelector('#mf-lp .mf-lp-t b');if(t)t.textContent=v||i.placeholder;const box=i.parentElement,rb=box&&box.querySelector('[data-lpnamereset]');if(v&&box&&!rb)box.insertAdjacentHTML('beforeend',`<button type="button" data-lpnamereset="${escH(id)}">Original</button>`);else if(!v&&rb)rb.remove()},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lpnamereset]');if(!b)return;e.preventDefault();e.stopPropagation();const id=b.dataset.lpnamereset,i=document.querySelector(`#mf-lp [data-lpname="${CSS.escape(id)}"]`);if(S.lay&&S.lay.bt)delete S.lay.bt[id];save();draw();if(i){i.value='';const t=document.querySelector('#mf-lp .mf-lp-t b');if(t)t.textContent=i.placeholder}b.remove()},true);
function openMenu(h){closeMenu();const [t,id]=idOf(h),cd=id.startsWith('c_'),full=fullOf(id),canW=cd||(window.mfIsDesk&&mfIsDesk());
 vis(h).classList.add('mf-lp-lift');
 const A=(k,ic,txt,extra)=>`<button type="button" data-lp="${k}"${extra||''}><span>${ic}</span>${txt}</button>`;
 const w=document.createElement('div');w.id='mf-lp';w.setAttribute('role','dialog');w.setAttribute('aria-label','Editar bloco');
 w.innerHTML=`<div class="mf-lp-bg" data-lp="close"></div><div class="mf-lp-box"><div class="mf-lp-grab"></div><div class="mf-lp-t"><small>Editar bloco</small><b>${escH(titleOf(h))}</b></div>
 ${mfBtField(h,id)}<div class="mf-lp-row">${A('up','↑','Subir')}${A('down','↓','Descer')}${A('top','⤒','Topo')}${A('end','⤓','Fim')}</div>${mfSzRows(id,full)}${typeof mfChartRow==='function'?mfChartRow(id):''}
 <div class="mf-lp-list">${A('view','☰','Gráfico e informações')}${A('look','🎨','Cores, formato, texto e efeitos')}${A('tab','⇄','Mover para outra aba')}${A('hide','◌','Ocultar bloco')}</div>
 <p class="mf-lp-tip">Dica: segure o bloco e arraste para mudar de lugar.</p><button type="button" class="mf-lp-x" data-lp="close">Fechar</button></div>`;
 w.__h=h;document.body.appendChild(w);requestAnimationFrame(()=>w.classList.add('on'))}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mf-lp [data-lp]');if(!b)return;e.preventDefault();e.stopPropagation();
 const w=document.getElementById('mf-lp'),h=w&&w.__h,k=b.dataset.lp;if(!h||k==='close'){closeMenu();return}const [t,id]=idOf(h);closeMenu();
 if(k==='up')move(t,id,-1);else if(k==='down')move(t,id,1);else if(k==='top')move(t,id,'top');else if(k==='end')move(t,id,'end');
 else if(k==='view')mfLkOpen(id,'info');
 else if(k==='look')mfLkOpen(id,'cor');
 else if(k==='width'){const full=fullOf(id);lset(l=>{l.w=l.w||{};l.w[id]=full?'h':'f'})}
 else if(k==='tab')mvTabSheet(t+'|'+id);
 else if(k==='hide'){lset(l=>{l.h[id]=true});toast('Bloco oculto. Para mostrar de novo: Configurações › Personalizar telas.')}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

/* ---- arrastar ---- */
function startDrag(h,x,y){closeMenu();const v=vis(h),[t,id]=idOf(h),r=v.getBoundingClientRect();
 const cands=[...document.querySelectorAll(`#app [data-bk^="${t}|"]`)].filter(x=>x!==h&&!x.closest('.mf-lp-lift')).map(x=>({el:vis(x),id:idOf(x)[1]})).filter(c=>c.el!==v);
 const line=document.createElement('div');line.id='mf-drop';document.body.appendChild(line);
 drag={h,v,t,id,x0:x,y0:y,sy0:scrollY,cands,line,target:null,after:false,raf:0,lx:x,ly:y};v.classList.add('mf-dragging');document.documentElement.classList.add('mf-drag-on');
 const loop=()=>{if(!drag)return;const edge=70;if(drag.ly<edge)scrollBy(0,-10);else if(drag.ly>innerHeight-edge-60)scrollBy(0,10);dragMove(drag.lx,drag.ly);drag.raf=requestAnimationFrame(loop)};drag.raf=requestAnimationFrame(loop);
 if(navigator.vibrate)try{navigator.vibrate(8)}catch(e){}}
function dragMove(x,y){const d=drag;if(!d)return;d.lx=x;d.ly=y;d.v.style.transform=`translate(${x-d.x0}px,${y-d.y0+(scrollY-d.sy0)}px) scale(1.02)`;
 let best=null,bd=1e9;d.cands.forEach(c=>{const r=c.el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,inside=x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom,dist=inside?0:Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom));if(dist<bd){bd=dist;best={c,r,cx,cy}}});
 if(!best){d.target=null;d.line.style.display='none';return}
 const r=best.r,side=r.width<innerWidth*.6&&y>r.top&&y<r.bottom;d.target=best.c.id;d.after=side?x>best.cx:y>best.cy;
 const L=d.line.style;L.display='block';if(side){L.left=(d.after?r.right+3:r.left-5)+'px';L.top=r.top+'px';L.width='3px';L.height=r.height+'px'}else{L.left=r.left+'px';L.top=(d.after?r.bottom+4:r.top-6)+'px';L.width=r.width+'px';L.height='3px'}}
function endDrag(cancel){const d=drag;if(!d)return;drag=null;cancelAnimationFrame(d.raf);d.line.remove();d.v.classList.remove('mf-dragging');d.v.style.transform='';document.documentElement.classList.remove('mf-drag-on');
 if(cancel||!d.target)return;const t=d.t,id=d.id,tg=d.target,after=d.after;lset(l=>{const a=(LAST[t]||[]).filter(x=>x!==id);let i=a.indexOf(tg);if(i<0)return;if(after)i++;a.splice(i,0,id);l.o[t]=a})}

/* ---- gesto ---- */
document.addEventListener('pointerdown',e=>{if(e.button>0||drag)return;if(!(window.mfIsDesk&&mfIsDesk()))return;/* 2.2: no celular segurar o bloco só arrasta (js/83); este menu fica só no computador */const h=headOf(e.target);if(!h)return;
 lp={h,x:e.clientX,y:e.clientY,fired:false,id:e.pointerId,timer:setTimeout(()=>{if(!lp)return;lp.fired=true;suppress=true;if(navigator.vibrate)try{navigator.vibrate(12)}catch(err){}openMenu(lp.h)},HOLD)}},true);
document.addEventListener('pointermove',e=>{if(drag){dragMove(e.clientX,e.clientY);return}if(!lp)return;const dx=e.clientX-lp.x,dy=e.clientY-lp.y;
 if(!lp.fired){if(Math.hypot(dx,dy)>TOL){clearTimeout(lp.timer);lp=null}return}
 if(Math.hypot(dx,dy)>TOL){const h=lp.h;lp=null;startDrag(h,e.clientX-dx,e.clientY-dy);dragMove(e.clientX,e.clientY)}},true);
const up=e=>{const was=!!drag||!!(lp&&lp.fired);if(drag)endDrag(e.type==='pointercancel');if(lp){clearTimeout(lp.timer);lp=null}if(was)setTimeout(()=>{suppress=false},80)};
document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
document.addEventListener('touchmove',e=>{if(drag||(lp&&lp.fired))e.preventDefault()},{passive:false,capture:true});
document.addEventListener('contextmenu',e=>{const h=headOf(e.target);if(!h)return;e.preventDefault();if(!(window.mfIsDesk&&mfIsDesk()))return;
 if(lp){if(lp.fired)return;clearTimeout(lp.timer);lp.fired=true;suppress=true;openMenu(lp.h);return}
 if(!document.getElementById('mf-lp'))openMenu(h)},true);
document.addEventListener('click',e=>{if(!suppress)return;suppress=false;if(e.target.closest&&e.target.closest('#mf-lp'))return;e.preventDefault();e.stopPropagation()},true);
})();