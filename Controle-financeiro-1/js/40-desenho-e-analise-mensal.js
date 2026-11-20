
/* ---- texto: "1 dia restante" ---- */

/* ===== Patch 56 · Lote 2: visual ===== */
/* draw com ganchos antes/depois (mantém a posição da tela do patch 52) */
window.__mfPre=window.__mfPre||[];window.__mfAD=window.__mfAD||[];
/* 1.27: layout separado no computador e no celular. Os dados e as funções são os mesmos; só a disposição dos blocos
   (ordem, ocultos, largura, tamanho, editor de aparência, opções de exibição e blocos movidos) fica por aparelho.
   O celular continua usando S.lay/S.view; o computador guarda o dele em S.layD/S.viewD (começa igual ao de hoje).
   Tema, cor de destaque, animação para todos e nomes das abas continuam iguais nos dois. */
var MF_DEV_K=['o','h','w','sz','lk','bt','mvt','fold'];
function mfDevK(k){return typeof k==='string'&&(MF_DEV_K.includes(k)||k.slice(0,2)==='__')}
function mfDevProxy(own,raw,dk,all){
 const desk=()=>!!(window.mfIsDesk&&mfIsDesk()),mine=k=>all||mfDevK(k),
  st=()=>{if(!own[dk]||typeof own[dk]!=='object'||Array.isArray(own[dk]))own[dk]={};return own[dk]},
  at=k=>desk()&&mine(k)?st():raw;
 return new Proxy(raw,{
  get(t,k){if(k==='__mfRaw')return raw;if(k==='toJSON')return ()=>raw;return at(k)[k]},
  set(t,k,v){at(k)[k]=v;return true},
  deleteProperty(t,k){delete at(k)[k];return true},
  has(t,k){return k in at(k)},
  ownKeys(t){if(!desk())return Reflect.ownKeys(raw);return [...Reflect.ownKeys(raw).filter(k=>!mine(k)),...Reflect.ownKeys(st()).filter(k=>mine(k))]},
  getOwnPropertyDescriptor(t,k){const d=Reflect.getOwnPropertyDescriptor(at(k),k);if(d)d.configurable=true;return d}
 })}
function mfDevWrap(){try{
 if(!(window.mfIsDesk&&mfIsDesk())||!S||typeof S!=='object')return;
 const cp=v=>JSON.parse(JSON.stringify(v));
 if(!S.lay||!S.lay.__mfRaw){const raw=S.lay&&typeof S.lay==='object'?S.lay:{};
  if(!S.layD||typeof S.layD!=='object'||Array.isArray(S.layD)){const c={};Object.keys(raw).filter(k=>mfDevK(k)&&raw[k]!==undefined).forEach(k=>{c[k]=cp(raw[k])});S.layD=c}
  S.lay=mfDevProxy(S,raw,'layD',false)}
 if(!S.view||!S.view.__mfRaw){const raw=S.view&&typeof S.view==='object'?S.view:{};
  if(!S.viewD||typeof S.viewD!=='object'||Array.isArray(S.viewD))S.viewD=cp(raw);
  S.view=mfDevProxy(S,raw,'viewD',true)}
}catch(e){console.warn('dev-wrap',e)}}
/* antes de qualquer toque/tecla no computador, garante que as edições vão para o layout do computador (mesmo logo após sincronizar) */
['pointerdown','mousedown','touchstart','click','input','change','keydown','submit'].forEach(ev=>window.addEventListener(ev,()=>{if(window.mfIsDesk&&mfIsDesk())mfDevWrap()},{capture:true,passive:true}));
/* 0.2 · Redesenho "preguiçoso" para respostas de rede (portfólio, mercado, fundamentos): junta várias respostas seguidas num só
   desenho (antes eram 3 em ~150 ms e a tela piscava). Qualquer desenho comum (toque do usuário) cancela o pendente. */
window.mfDrawLater=function(){clearTimeout(window.__mfDl);window.__mfDl=setTimeout(function(){window.__mfDl=0;try{draw()}catch(e){console.warn('draw',e)}},160)};
function draw(){if(window.__mfDl){clearTimeout(window.__mfDl);window.__mfDl=0}const app=document.getElementById('app'),same=window.__mfLastTab===tab,y=scrollY;
 mfDevWrap();
 if(same&&app&&y>0)app.style.minHeight=app.offsetHeight+'px';
 try{mfCal52();mfVenc54()}catch(e){}
 window.__mfPre.forEach(f=>{try{f()}catch(e){console.warn('pre-draw',e)}});
 mfDrawCore();window.__mfLastTab=tab;
 window.__mfAD.forEach(f=>{try{f()}catch(e){console.warn('after-draw',e)}});
 if(!app)return;
 if(!same){app.classList.remove('mf-tab-in');void app.offsetWidth;app.classList.add('mf-tab-in')}
 if(same&&y>0){scrollTo(0,y);requestAnimationFrame(()=>{if(scrollY<y-2)scrollTo(0,y);setTimeout(()=>{app.style.minHeight='';if(scrollY<y-2)scrollTo(0,y)},300)})}
 else app.style.minHeight=''}
/* curvas sem "estourar" abaixo do zero (interpolação monotônica) */
function anSmooth(pts){const n=pts.length;if(n<2)return '';const F=v=>v.toFixed(1);if(n===2)return `M${F(pts[0][0])},${F(pts[0][1])} L${F(pts[1][0])},${F(pts[1][1])}`;
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),dx=[],m=[],t=[];
 for(let i=0;i<n-1;i++){dx[i]=xs[i+1]-xs[i];m[i]=dx[i]?(ys[i+1]-ys[i])/dx[i]:0}
 t[0]=m[0];t[n-1]=m[n-2];
 for(let i=1;i<n-1;i++){if(m[i-1]*m[i]<=0)t[i]=0;else{const w1=2*dx[i]+dx[i-1],w2=dx[i]+2*dx[i-1];t[i]=(w1+w2)/(w1/m[i-1]+w2/m[i])}}
 for(let i=0;i<n-1;i++){if(m[i]===0){t[i]=0;t[i+1]=0;continue}const a=t[i]/m[i],b=t[i+1]/m[i],s=a*a+b*b;if(s>9){const k=3/Math.sqrt(s);t[i]=k*a*m[i];t[i+1]=k*b*m[i]}}
 let d=`M${F(xs[0])},${F(ys[0])}`;for(let i=0;i<n-1;i++){const h=dx[i]/3;d+=` C${F(xs[i]+h)},${F(ys[i]+t[i]*h)} ${F(xs[i+1]-h)},${F(ys[i+1]-t[i+1]*h)} ${F(xs[i+1])},${F(ys[i+1])}`}return d}
/* rótulos do eixo X: não encavalar o último (ex.: "Nov Dez") */
function mfXIdx(n,ev){const out=new Set();for(let i=0;i<n;i+=ev)out.add(i);const last=n-1;if(!out.has(last)){const prev=last-(last%ev);if(last-prev<ev)out.delete(prev);out.add(last)}return out}
function mfLines(names,series,o){o=o||{};const W=o.w||320,H=o.h||150,L=8,Rr=8,T=12,Bt=20,all=series.flatMap(s=>s.vals.filter(v=>v!=null)),mx=Math.max(...all,1),mn=Math.min(0,...all),X=i=>L+(W-L-Rr)*(names.length>1?i/(names.length-1):.5),Y=v=>T+(H-T-Bt)*(1-(v-mn)/((mx-mn)||1));
 const grid=[0,.5,1].map(f=>{const y=T+(H-T-Bt)*f;return `<line x1="${L}" x2="${W-Rr}" y1="${y}" y2="${y}" stroke="var(--ln)" stroke-dasharray="3 4"/>`}).join('')+(mn<0?`<line x1="${L}" x2="${W-Rr}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--mu)" stroke-opacity=".4"/>`:'');
 const paths=series.map(s=>{const pts=[];s.vals.forEach((v,i)=>{if(v!=null)pts.push([X(i),Y(v)])});if(pts.length<2)return pts.length?`<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="3" fill="${s.color}"/>`:'';const d=anSmooth(pts);return (s.fill?`<path d="${d} L${pts[pts.length-1][0]},${Y(Math.max(0,mn))} L${pts[0][0]},${Y(Math.max(0,mn))} Z" fill="${s.color}" fill-opacity=".12"/>`:'')+`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.w||2.4}" stroke-linecap="round"${s.dash?` stroke-dasharray="${s.dash}"`:''}/><circle cx="${pts[pts.length-1][0]}" cy="${pts[pts.length-1][1]}" r="3.4" fill="${s.color}"/>`}).join('');
 const idx=mfXIdx(names.length,o.every||1),lab_=names.map((n,i)=>idx.has(i)?`<text x="${X(i)}" y="${H-5}" text-anchor="${i===0?'start':i===names.length-1?'end':'middle'}" font-size="9" fill="var(--mu)">${n}</text>`:'').join('');
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escH(o.aria||'Gráfico de linhas')}" style="width:100%;height:auto;display:block">${grid}${paths}${lab_}</svg>`}
function mfVBars(names,series,o){o=o||{};const W=o.w||320,H=o.h||150,L=8,Rr=8,T=12,Bt=20,all=series.flatMap(s=>s.vals.filter(v=>v!=null)),mx=Math.max(...all,1),mn=Math.min(0,...all),n=names.length,k=series.length,slot=(W-L-Rr)/n,bw=Math.max(2,Math.min(18,slot*.7/k)),Y=v=>T+(H-T-Bt)*(1-(v-mn)/((mx-mn)||1));
 const bars=series.map((s,si)=>s.vals.map((v,i)=>{if(v==null)return '';const cx=L+slot*(i+.5)+(si-(k-1)/2)*(bw+1.5),y0=Y(0),y1=Y(v);return `<rect x="${(cx-bw/2).toFixed(1)}" y="${Math.min(y0,y1).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1,Math.abs(y1-y0)).toFixed(1)}" rx="${Math.min(4,bw/2).toFixed(1)}" fill="${s.color}" fill-opacity="${s.dash?.45:1}"><title>${escH(names[i])}: ${R(v)}</title></rect>`}).join('')).join('');
 const idx=mfXIdx(n,o.every||1),lab_=names.map((nm_,i)=>idx.has(i)?`<text x="${(L+slot*(i+.5)).toFixed(1)}" y="${H-5}" text-anchor="middle" font-size="9" fill="var(--mu)">${nm_}</text>`:'').join('');
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escH(o.aria||'Gráfico de barras')}" style="width:100%;height:auto;display:block"><line x1="${L}" x2="${W-Rr}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--ln)"/>${bars}${lab_}</svg>`}
/* eixos com números redondos */
function mfNice(v){if(!(v>0))return 1;const e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e,nf=f<=1?1:f<=1.5?1.5:f<=2?2:f<=2.5?2.5:f<=3?3:f<=4?4:f<=5?5:f<=6?6:f<=8?8:10;return nf*e}
function anFrame(W,H,mn,mx,fmt){const pl=30,pr=6,pt=10,pb=18,X0=pl,X1=W-pr;let lo=mn,hi=mx;if(lo>=0){lo=0;hi=mfNice(hi/3)*3}
 const Y=v=>pt+(1-(v-lo)/((hi-lo)||1))*(H-pt-pb);let g='';for(let i=0;i<=3;i++){const v=lo+(hi-lo)*i/3,y=Y(v);g+=`<line x1="${pl}" x2="${X1}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--ln)" stroke-width="1"/><text x="${pl-4}" y="${(y+3).toFixed(1)}" text-anchor="end" font-size="8" fill="var(--mu)">${(fmt||anK)(v)}</text>`}return{pl,pr,pt,pb,X0,X1,Y,grid:g}}
/* Economia mensal: valor da média sem cortar */
function dashboardSavingsRate(){const nE=+mfView('d_eco','per','7')===12?12:7,ks=Array.from({length:nE},(_,i)=>nm(ym,i-nE+1)),vals=ks.map(k=>{const a=dashStats(k,k===TD.slice(0,7));return a.rec-a.exp}),has=vals.some(v=>v!==0);
 const avg=vals.reduce((s,v)=>s+v,0)/vals.length,cur=vals[nE-1];
 if(!has)return `<section class="dash-extra-card mf-eco"><div class="dash-section-head"><div><h2>Economia mensal</h2></div></div><p class="mf-empty">Registre receitas e despesas para ver quanto sobra por mês.</p></section>`;
 const W=300,H=130,T=14,Bt=20,L=4,Rr=46,mx=Math.max(...vals,avg,1),mn=Math.min(0,...vals),Y=v=>T+(H-T-Bt)*(1-(v-mn)/((mx-mn)||1)),slot=(W-L-Rr)/nE,bw=Math.min(22,slot*.62),lnE=mfChart('d_eco','barras')==='linha';
 const bars=lnE?(()=>{const P=vals.map((v,i)=>[L+slot*(i+.5),Y(v)]),d=P.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');return `<path d="${d} L${P[P.length-1][0].toFixed(1)} ${Y(Math.max(0,mn)).toFixed(1)} L${P[0][0].toFixed(1)} ${Y(Math.max(0,mn)).toFixed(1)} Z" style="fill:var(--ok)" fill-opacity=".12"/><path d="${d}" fill="none" style="stroke:var(--ok)" stroke-width="2.2" stroke-linejoin="round"/>`+P.map((p,i)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i===nE-1?3.4:2.2}" style="fill:${vals[i]<0?'var(--bad)':'var(--ok)'}"><title>${lab(ks[i])}: ${R(vals[i])}</title></circle><text x="${p[0].toFixed(1)}" y="${H-5}" text-anchor="middle" font-size="9" fill="var(--mu)">${nE>7&&i%2?'':MES[+ks[i].slice(5)-1]}</text>`).join('')})():vals.map((v,i)=>{const x=L+slot*(i+.5)-bw/2,y0=Y(0),y1=Y(v);return `<rect x="${x.toFixed(1)}" y="${Math.min(y0,y1).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(2,Math.abs(y1-y0)).toFixed(1)}" rx="4" style="fill:${v<0?'var(--bad)':'var(--ok)'}" fill-opacity="${i===nE-1?1:.55}"><title>${lab(ks[i])}: ${R(v)}</title></rect><text x="${(L+slot*(i+.5)).toFixed(1)}" y="${H-5}" text-anchor="middle" font-size="9" fill="var(--mu)">${nE>7&&i%2?'':MES[+ks[i].slice(5)-1]}</text>`}).join('');
 const ya=Y(avg),short=window.MF_PRIV?'•••':(avg<0?'−':'')+anK(Math.abs(avg));
 return `<section class="dash-extra-card mf-eco"><div class="dash-section-head"><div><h2>Economia mensal</h2></div></div><div class="mf-eco-kv"><div><small>Média economizada</small><b class="${avg<0?'bad':''}">${R(avg)}</b></div><div><small>Este mês</small><b class="${cur<0?'bad':'ok'}">${R(cur)}</b></div></div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Economia por mês" style="width:100%;height:auto;display:block"><rect x="${L}" y="${Math.min(ya,Y(0)).toFixed(1)}" width="${W-L-Rr}" height="${Math.abs(Y(0)-ya).toFixed(1)}" style="fill:var(--ok)" fill-opacity=".07"/><line x1="${L}" x2="${W-Rr+2}" y1="${ya.toFixed(1)}" y2="${ya.toFixed(1)}" style="stroke:var(--ok)" stroke-opacity=".6" stroke-width="1.2"/><text x="${W-2}" y="${(ya+3).toFixed(1)}" text-anchor="end" font-size="9" style="fill:var(--ok)">média ${short}</text>${bars}</svg></section>`}
/* ---- passes depois de desenhar ---- */
var MF_ZERO_RE=/^([A-Za-zÀ-ú]+\s)?[▲▼↑↓↗↘+\-−\s]*(R\$\s*)?0([.,]0+)?\s*(%|p\.p\.)?\s*[▲▼↑↓↗↘]?\s*$/;
function mfNeutralZeros(){const app=document.getElementById('app');if(!app)return;
 app.querySelectorAll('.ok,.bad,[style*="--ok"],[style*="--bad"]').forEach(el=>{if(el.closest('svg')||el.matches('.mf-daily,.mf-due-c,section,div.k,.mf-flow-tile'))return;const txt=el.textContent.replace(/\s+/g,' ').trim();if(!txt||txt.length>24||!MF_ZERO_RE.test(txt))return;
  el.classList.remove('ok','bad');el.classList.add('mf-zero');if(el.classList.contains('mf-dpill'))el.classList.add('mu');if(/--ok|--bad/.test(el.getAttribute('style')||''))el.style.color='var(--mu)';
  const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))n.textContent=n.textContent.replace(/[▲▼↑↓↗↘]\s?/g,'').replace(/^\s*[+−-]\s?(?=R\$|0)/,'')})}
function mfMinFont(){const app=document.getElementById('app');if(!app)return;
 app.querySelectorAll('*').forEach(el=>{if(el.closest('svg')||el.closest('.mf-msw'))return;const tag=el.tagName;
  let own=false;for(const c of el.childNodes)if(c.nodeType===3&&c.textContent.trim()){own=true;break}
  const isField=tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA';
  if(!own&&!isField&&!el.matches('div,button,summary,label,span,a'))return;
  const cs=getComputedStyle(el);
  if(own){const fs=parseFloat(cs.fontSize);if(fs&&fs<10.95)el.style.setProperty('font-size','11px','important')}
  if(el.hasAttribute('data-bk')||el.matches('.dash-calendar-day,.mf-avatar,.mf-txi,.mf-rank,.mf-badge,.dv-badge,.mf-fold,.mf-flow-arrow,.mf-due-c,.mf-shc,.mf-dgo,.k,.dv-k,.mf-cls,.mf-pr-k'))return;
  if(document.documentElement.hasAttribute('data-mftbar')&&el.closest('.mf-anseg'))return; /* 3.25: os modelos de Tab bar desenham o próprio raio das pílulas das subabas */
  const r=parseFloat(cs.borderTopLeftRadius);if(!(r>=8.5&&r<=21))return;
  const bg=cs.backgroundColor,hasBg=bg&&bg!=='transparent'&&!/rgba\([^)]*,\s*0\)$/.test(bg),hasBd=parseFloat(cs.borderTopWidth)>0;if(!hasBg&&!hasBd)return;
  const rc=el.getBoundingClientRect();if(rc.height<24||rc.width<40||r>=rc.height/2-1)return;
  const want=isField?14:16;if(Math.abs(r-want)>.5)el.style.setProperty('border-radius',want+'px','important')})}
function mfSvgText(){const app=document.getElementById('app');if(!app)return;
 app.querySelectorAll('svg[viewBox]').forEach(svg=>{const vb=svg.viewBox&&svg.viewBox.baseVal;if(!vb||vb.width<=40)return;const w=svg.getBoundingClientRect().width;if(!w)return;const sc=w/vb.width;
  svg.querySelectorAll('text').forEach(t=>{let o=t.dataset.fs0;if(!o){o=t.getAttribute('font-size')||parseFloat(getComputedStyle(t).fontSize)||9;t.dataset.fs0=o}o=parseFloat(o);if(o>12)return;const eff=o*sc;let nf=o;if(eff<10.5)nf=10.5/sc;else if(eff>12.5)nf=12.5/sc;t.setAttribute('font-size',nf.toFixed(2))})})}
function mfCatLabels(){document.querySelectorAll('#app .mf-cat-t[data-v="Investimentos"] span').forEach(s=>{if(s.textContent.trim()==='Investimentos')s.textContent='Investir'})}
function mfPrivClass(){document.documentElement.classList.toggle('mf-priv',!!window.MF_PRIV)}
window.__mfAD.push(mfPrivClass,mfCatLabels,mfNeutralZeros,mfMinFont,mfSvgText,()=>{window.mfTxApply&&mfTxApply()});
(function(){let tm=0;window.addEventListener('resize',()=>{clearTimeout(tm);tm=setTimeout(()=>{try{mfSvgText()}catch(e){}},180)})})();

/* ===== Patch 57 · Lote 3: nova ordem das abas ===== */
MF_ORD.res=['c_sal','d_alert','c_ent','c_sai','c_fat','c_inv','calendar','budgetalerts','cashflow','d_cat','d_eco'];
MF_ORD.add=['form','p_fixos','ext_sum','ext_cat','ext_all','ext_fixos','p_shop','p_dsim','p_gasto','p_cmpg'];
MF_ORD.mais=['calendar','p_faturas','p_parc','p_teto','p_venc','p_div','p_sit','p_simc','p_gasto'];
MF_ORD.inv=['p_pat','p_bens','s_magico','dv_kpi','i_chart','i_cls','i_prov','i_pvtipo','i_pvativo','i_pvcal','dv_sim','dv_proj','i_ap','i_reserva','i_pie','i_tipo','i_barb','p_metas','p_proj'];
MF_ORD.anal=['n_mres','n_mcmp','n_mdesp','n_cat','n_msub','n_top','n_ritmo','n_grupo','n_pag','a_semana','n_mcc','n_mparc','n_minv','n_mativo','n_mprov','n_mdiag','n_ares','n_aflux','n_asaldo','n_agastos','n_aexpm','n_acat','n_asub','n_ainv','n_ainvm','n_aativo','n_aprov','n_apat','n_asaude','n_areserva','n_apoup','n_aretro','n_adiag','n_kpi','n_akpi','n_amelhor','n_aacum'];
MF_ORD_D.res=['c_sal','d_alert','c_ent','c_sai','c_fat','c_inv','d_bar','calendar','budgetalerts','cashflow','d_cat','d_eco'];
MF_ORD_D.mais=MF_ORD.mais.slice();
/* Script 1 · 16: a Distribuição 50/30/20 saiu do Dashboard e foi para Contas; leva junto quem já tinha mudado a ordem dos blocos */
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__bg16)return;L.__bg16=1;
 const o=L.o;if(o&&typeof o==='object'){if(Array.isArray(o.res)){const i=o.res.indexOf('budgetalerts');if(i>=0)o.res.splice(i,1)}
  if(Array.isArray(o.mais)&&!o.mais.includes('budgetalerts'))o.mais.splice(Math.min(2,o.mais.length),0,'budgetalerts')}
 save()}catch(e){console.warn('50/30/20 para Contas',e)}});
MF_ORD_D.add=['form','p_fixos','ext_sum','ext_cat','ext_all','ext_fixos','p_shop','p_dsim','p_gasto','p_cmpg'];
MF_ORD_D.inv=['p_pat','p_bens','s_magico','dv_kpi','dv_chart','dv_tab','dv_proj','i_prov','i_pvtipo','i_pvativo','i_pvcal','dv_sim'];
['d_alert'].forEach(x=>{if(!MF_DWIDE.includes(x))MF_DWIDE.push(x)});
/* uma vez: aplica a ordem recomendada (as preferências de esconder blocos continuam) */
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__ord57)return;if(L.o&&typeof L.o==='object')['res','add','mais','inv','anal'].forEach(k=>{delete L.o[k]});L.__ord57=1;save()}catch(e){}});
/* Contas só com contas: análises vão para a aba Análises */
/* ===== Análises v2: Análise Mensal e Análise Anual separadas, cada uma com seções e período próprios =====
   Regras: despesas = mfSpendRows (mesma regra do Dashboard: compra no cartão conta no mês da fatura; pagamento de fatura,
   investimento, reserva e VR não são despesa). Aportes = carteira (com data) + renda fixa (com data) + lançamentos "Investir",
   sem contar duas vezes o mesmo aporte. Nada aqui grava dados. */
window.__anYm=window.__anYm||TD.slice(0,7);window.__anSecM=window.__anSecM||'res';window.__anSecA=window.__anSecA||'res';
const AN_OPS_DESDE='2026-11-02'; // a partir daqui o app guarda a data dos aportes em ações/FIIs/ETFs
const AN_SEC={mes:[['res','Resultado do mês'],['desp','Despesas'],['cart','Cartão de crédito'],['inv','Investimentos'],['diag','Diagnóstico do mês']],
 ano:[['res','Resultado anual'],['gastos','Evolução dos gastos'],['inv','Evolução dos investimentos'],['saude','Saúde financeira'],['retro','Retrospecto anual'],['diag','Diagnóstico anual']]};
function anModeSeg(){return `<div class="an-mode">${mfSeg('data-anmode',window.__anMode==='ano'?'ano':'mes',[['mes','Mês'],['ano','Ano']])}</div>`}
function anSecs(){const m=window.__anMode==='ano'?'ano':'mes',cur=m==='ano'?window.__anSecA:window.__anSecM;
 return `<div class="an-secs" role="group" aria-label="${m==='ano'?'Análise anual':'Análise mensal'}">${AN_SEC[m].map(([k,t])=>`<button type="button" class="${k===cur?'on':''}" data-ansec="${k}" aria-pressed="${k===cur}">${t}</button>`).join('')}</div>`}
function anPer(){const a=window.__anMode==='ano';return a?`<div class="an-per"><button type="button" data-anyr="-1" aria-label="Ano anterior">‹</button><span>${window.__anYear}</span><button type="button" data-anyr="1" aria-label="Próximo ano">›</button></div>`
 :`<div class="an-per"><button type="button" data-anym="-1" aria-label="Mês anterior">‹</button><span>${MESF[+window.__anYm.slice(5)-1]} ${window.__anYm.slice(0,4)}</span><button type="button" data-anym="1" aria-label="Próximo mês">›</button></div>`}
const anCP=(id,title,body)=>B(id)+`<section class="c mf-an"><h2>${title}</h2>${anPer()}${body}</section>`;
function anPick(html,ids){const m={},p=String(html).split(/(<!--b:[\w~]+-->)/);for(let i=1;i<p.length;i+=2)m[p[i].slice(6,-3)]=p[i]+p[i+1];return ids.map(i=>m[i]||'').join('')}
const anSumV=a=>a.reduce((s,t)=>s+(+t.v||0),0),anPct=v=>v==null||!isFinite(v)?'—':Math.round(v)+'%',anSig=v=>(v<0?'−':'')+R(Math.abs(v));
const anRows=items=>`<div class="mf-chg an-rows">${items.map(([l,v,x,cls])=>`<div><span>${l}</span><b class="${cls||''}">${v}</b>${x!=null?`<small class="${(x&&x.c)||'mu'}">${(x&&x.t)!=null?x.t:x}</small>`:''}</div>`).join('')}</div>`;
const anDl=(cur,prev,good)=>{if(!(Math.abs(prev)>0.005))return {t:'—',c:'mu'};const p=(cur-prev)/Math.abs(prev)*100,up=p>=0;return {t:(up?'▲ ':'▼ ')+Math.abs(p).toFixed(0)+'%',c:(good==='up'?up:!up)?'ok':'bad'}};
function anFix(t){const s=t.s||inferSub(t.c);return !!(t.fixedId||t.autoRecurring||t.recId||['Conta fixa','Assinatura','Moradia'].includes(s)||['Contas Fixas','Moradia'].includes(t.c))}
function anIsProv(t){return !!t&&t.c==='Receita'&&!!(t.pva||t.s==='Proventos'||/provent|dividend|\bjcp\b|juros sobre capital|rendiment/i.test(String(t.n||'')))}
function anProvTipo(t){const n=String(t.n||'')+' '+String(t.tp||'');if(/jcp|juros sobre/i.test(n))return 'JCP';if(/\bcdb\b|caixinha|tesouro|poupan|renda fixa|\blci\b|\blca\b/i.test(n))return 'Renda fixa';if(/rendiment/i.test(n)||(t.tk&&/11$/.test(t.tk)))return 'Rendimentos de FII';return 'Dividendos'}
function anAportes(from,to){const out=[],inR=d=>!!d&&d>=from&&d<=to;
 (S.inv||[]).forEach(a=>{const nm=String(a.a||'Ativo');(Array.isArray(a.ops)?a.ops:[]).forEach(o=>{if(inR(o.d)&&+o.v>0)out.push({d:o.d,v:+o.v,a:nm,src:'cart'})});
  if(a.f){if(inR(a.cdbDate)&&+a.cdbPrincipal>0)out.push({d:a.cdbDate,v:+a.cdbPrincipal,a:nm,src:'rf'});(Array.isArray(a.cdbAportes)?a.cdbAportes:[]).forEach(x=>{if(!String(x.id||'').startsWith('adj_')&&inR(x.d)&&+x.v>0)out.push({d:x.d,v:+x.v,a:nm,src:'rf'})})}});
 S.tx.forEach(t=>{if(t&&mfIsTr(t)&&String(t.to||'').startsWith('cx:')&&String(t.from||'').startsWith('conta:')&&inR(t.d)&&+t.v>0){out.push({d:t.d,v:+t.v,a:t.to.slice(3),src:'tr'});return}if(!t||t.c!=='Investimento'||!inR(t.d)||!(+t.v>0))return;const v=+t.v,dup=out.find(o=>!o.used&&o.src!=='tx'&&o.d===t.d&&Math.abs(o.v-v)<0.01);if(dup){dup.used=1;return}
  out.push({d:t.d,v,a:String(t.n||'').replace(/^(aporte|investimento|investir)\s*[:\-·]?\s*/i,'').trim()||(t.t==='Reserva'?'Reserva':'Investimento'),src:'tx'})});
 return out}
function anSum(k){const inc=S.tx.filter(t=>t&&t.d&&t.d.slice(0,7)===k&&mfIsRec(t)),sp=mfSpendRows(k,true),ap=anAportes(k+'-01',k+'-31'),rec=anSumV(inc),exp=anSumV(sp),inv=anSumV(ap);
 const cats={};sp.forEach(t=>{if(mfIsFatLanc(t))return;cats[t.c]=(cats[t.c]||0)+(+t.v||0)});
 return {k,rec,exp,inv,bal:rec-exp-inv,eco:rec>0?(rec-exp)/rec*100:null,recP:anSumV(inc.filter(t=>t.d>TD)),expP:anSumV(sp.filter(t=>t.d>TD)),sp,inc,ap,cats,prov:S.tx.filter(t=>t&&t.d&&t.d.slice(0,7)===k&&anIsProv(t))}}
function anTop(o){const e=Object.entries(o).filter(x=>x[1]>0.005).sort((a,b)=>b[1]-a[1]);return e}
function anDiag(items){return items.length?`<ul class="an-diag">${items.map(([c,t])=>`<li class="${c}">${t}</li>`).join('')}</ul>`:'<p class="mf-empty">Sem dados suficientes para o diagnóstico.</p>'}
function anCardsMonth(k){const L=mfCards();return L.map((c,i)=>{const inv=cbInvoice(k,c.id);return {c,i,nome:mfCardName(c,i),inv,st:inv.total>0.005&&inv.left<=0.005?'paga':inv.total>0.005&&inv.due<TD?'vencida':inv.total>0.005?'em aberto':'sem compras'}})}
/* patrimônio no fim de cada mês (Supabase › patrimonio_mensal) */
function anPatLoad(){const o=window.__anPat||(window.__anPat={});if(typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser)return o;
 if(o.busy||(o.uid===authUser.id&&o.rows&&Date.now()-o.at<6e5))return o;o.busy=true;const uid=authUser.id;
 MF_DB.portfolio.monthly(uid).then(({data,error})=>{o.busy=false;o.at=Date.now();o.uid=uid;o.err=error?error.message:'';o.rows=error?(o.rows||[]):(data||[]);if((tab==='anal'&&window.__anMode==='ano')||tab==='inv')mfDrawLater()},()=>{o.busy=false;o.at=Date.now();o.err='rede'});return o}
function anPatNow(){const I=S.inv||[];let v=0,c=0;I.forEach(a=>{try{v+=ivNow(a)||0;c+=a.f?(isCdbAsset(a)?(+a.cdbPrincipal||0)+(a.cdbAportes||[]).reduce((s,x)=>s+(+x.v||0),0)-mfCdbRes(a):(+a.p||0)):(+a.q||0)*(+a.p||0)}catch(e){}});return {v,c}}

/* ================= ANÁLISE MENSAL ================= */
function anMensal(){const k=window.__anYm,sec=window.__anSecM,pk=nm(k,-1),a=anSum(k),b=anSum(pk),isCur=k===TD.slice(0,7),out=[];
 if(sec==='res'){
  const prevTxt=a.recP>0.005||a.expP>0.005?`<p class="mf-cmp">Inclui valores previstos (ainda não aconteceram): receitas ${R(a.recP)} · despesas ${R(a.expP)}.</p>`:'';
  out.push(anCP('n_mres','Resultado do mês',anKpis([['Receitas',R(a.rec),'ok',mfDelta(a.rec,b.rec,'up')],['Despesas',R(a.exp),'bad',mfDelta(a.exp,b.exp,'down')],['Investido',R(a.inv),'',mfDelta(a.inv,b.inv,'up')],['Saldo do mês',anSig(a.bal),a.bal>=0?'ok':'bad',mfDelta(a.bal,b.bal,'up')]])+
   `<div class="an-eco"><small>Taxa de economia</small><b>${anPct(a.eco)}</b><span class="mu">${a.eco==null?'sem receitas no mês':`da renda não foi consumida`}${b.eco!=null&&a.eco!=null?` · ${a.eco>=b.eco?'▲':'▼'} ${Math.abs(a.eco-b.eco).toFixed(0)} p.p.`:''}</span></div>`+
   `<p class="mf-cmp">Saldo = receitas − despesas − investido. Comparado com ${lab(pk).toLowerCase()}.</p>${prevTxt}`));
  out.push(anC('n_mcmp','Mês atual x mês anterior',anRows([['Receitas',R(a.rec),anDl(a.rec,b.rec,'up')],['Despesas',R(a.exp),anDl(a.exp,b.exp,'down')],['Investido',R(a.inv),anDl(a.inv,b.inv,'up')],['Saldo',anSig(a.bal),anDl(a.bal,b.bal,'up'),a.bal>=0?'ok':'bad']])+`<p class="mf-cmp">${MESF[+pk.slice(5)-1]}: receitas ${R(b.rec)} · despesas ${R(b.exp)} · investido ${R(b.inv)}</p>`));
 }
 if(sec==='desp'){
  const ym0=ym;let old='';try{ym=k;old=anMes()+anSemana()}finally{ym=ym0}
  const subs={};a.sp.forEach(t=>{if(mfIsFatLanc(t))return;const s=t.s||inferSub(t.c)||'Outros';subs[s]=(subs[s]||0)+(+t.v||0)});const se=anTop(subs);
  const fx=anSumV(a.sp.filter(anFix)),vr=a.exp-fx,dim=new Date(+k.slice(0,4),+k.slice(5,7),0).getDate(),days=isCur?Math.max(1,+TD.slice(8)):dim,real=anSumV(a.sp.filter(t=>t.d<=TD)),pdim=new Date(+pk.slice(0,4),+pk.slice(5,7),0).getDate();
  out.push(anCP('n_mdesp','Despesas do mês',anKpis([['Total de despesas',R(a.exp),'bad',mfDelta(a.exp,b.exp,'down')],['Média diária',R(real/days),'',mfDelta(real/days,b.exp/pdim,'down')],['Fixas',R(fx),'',`<small class="mf-dl mu">${a.exp>0?Math.round(fx/a.exp*100)+'% das despesas':'—'}</small>`],['Variáveis',R(vr),'',`<small class="mf-dl mu">${a.exp>0?Math.round(vr/a.exp*100)+'% das despesas':'—'}</small>`]])+
   `<p class="mf-cmp">Fixas: moradia, contas fixas, assinaturas e recorrentes. Média diária ${isCur?'até hoje':'do mês'}.</p>`));
  out.push(anPick(old,['n_cat']));
  out.push(anC('n_msub','Gastos por subcategoria',se.length?mfCatView(se.slice(0,8).map(([n,v],i)=>({n,v,c:MF_PAL[i%MF_PAL.length]})),mfChart('n_msub','barras')):'<p class="mf-empty">Sem despesas neste mês.</p>'));
  out.push(anPick(old,['n_top','n_ritmo','n_grupo','n_pag','a_semana']));
 }
 if(sec==='cart'){
  const C=anCardsMonth(k),tot=C.reduce((s,x)=>s+x.inv.total,0),paid=C.reduce((s,x)=>s+Math.min(x.inv.paid,x.inv.total),0),left=C.reduce((s,x)=>s+x.inv.left,0),stc={paga:'ok',vencida:'bad','em aberto':'wa','sem compras':'mu'};
  out.push(anCP('n_mcc','Faturas do período',anKpis([['Total das faturas',R(tot),'bad'],['Pago',R(paid),'ok'],['Pendente',R(left),left>0.005?'bad':''],['Renda comprometida',a.rec>0?anPct(tot/a.rec*100):'—','',`<small class="mf-dl mu">fatura ÷ receitas</small>`]])+
   anRows(C.map(x=>[`${escH(x.nome)}<small class="mu" style="display:block;font-weight:500">${x.inv.rows.length} ${x.inv.rows.length===1?'compra':'compras'} · vence ${mfDmy(x.inv.due)}</small>`,R(x.inv.total),{t:x.st,c:stc[x.st]}]))+`<p class="mf-cmp">Fatura com vencimento em ${lab(k).toLowerCase()}. O pagamento da fatura não é somado de novo como despesa.</p>`));
  const parc=C.flatMap(x=>x.inv.rows.filter(t=>+t.installmentCount>1).map(t=>({t,nome:x.nome}))),fut={};
  S.tx.forEach(t=>{if(t&&t.t==='Crédito'&&+t.installmentCount>1&&t.d){const m=mfMonthOf(t);if(m>k)fut[m]=(fut[m]||0)+txValue(t)}});const fe=Object.keys(fut).sort(),ft=fe.reduce((s,m)=>s+fut[m],0);
  out.push(anC('n_mparc','Compras parceladas',(parc.length?anRows(parc.map(({t})=>[escH(String(t.n||'Compra').replace(/\s*\(\d+\/\d+\)\s*$/,'')),R(txValue(t)),`${t.installmentIndex}/${t.installmentCount}`])):'<p class="mf-empty">Nenhuma parcela nesta fatura.</p>')+
   `<div class="an-eco"><small>Parcelas futuras</small><b>${R(ft)}</b><span class="mu">${fe.length?`em ${fe.length} ${fe.length===1?'fatura':'faturas'} · até ${lab(fe[fe.length-1]).toLowerCase()}`:'nenhuma parcela a vencer'}</span></div>`+
   (fe.length?anRows(fe.slice(0,6).map(m=>[MESF[+m.slice(5)-1]+' '+m.slice(0,4),R(fut[m])])):'')));
 }
 if(sec==='inv'){
  const byA={};a.ap.forEach(x=>{byA[x.a]=(byA[x.a]||0)+x.v});const ae=anTop(byA),pv={};a.prov.forEach(t=>{const tp=anProvTipo(t);pv[tp]=(pv[tp]||0)+(+t.v||0)});const provT=anSumV(a.prov),bprov=anSumV(b.prov);
  out.push(anCP('n_minv','Investimentos do mês',anKpis([['Total aportado',R(a.inv),'',mfDelta(a.inv,b.inv,'up')],['Aportes',String(a.ap.length),'',`<small class="mf-dl mu">${b.ap.length} no mês anterior</small>`],['Proventos recebidos',R(provT),'ok',mfDelta(provT,bprov,'up')],['Aportado x renda',a.rec>0?anPct(a.inv/a.rec*100):'—','',`<small class="mf-dl mu">da receita do mês</small>`]])+
   `<p class="mf-cmp">Aportes contam a carteira, a renda fixa e os lançamentos em “Investir”, sem repetir o mesmo aporte. Ações, FIIs e ETFs têm data registrada a partir de ${mfDmy(AN_OPS_DESDE)}.</p>`));
  out.push(anC('n_mativo','Aportes por ativo',ae.length?mfCatView(ae.slice(0,10).map(([n,v],i)=>({n,v,c:MF_PAL[i%MF_PAL.length]})),mfChart('n_mativo','barras')):'<p class="mf-empty">Nenhum aporte registrado neste mês.</p>'));
  const pe=['Dividendos','JCP','Rendimentos de FII','Renda fixa'].map(n=>[n,pv[n]||0]);
  out.push(anC('n_mprov','Proventos e rendimentos',provT>0?anRows(pe.map(([n,v])=>[n,v>0?R(v):'—'])):'<p class="mf-empty">Nenhum provento ou rendimento recebido neste mês.</p>')+'');
 }
 if(sec==='diag'){const D=[],ca=a.cats,cb=b.cats;
  if(!(a.rec||a.exp||a.inv))D.push(['mu','Sem lançamentos neste mês.']);
  else{
   if(b.exp>0.005){const d=a.exp-b.exp;D.push([d<=0?'ok':'bad',`Você gastou ${R(Math.abs(d))} ${d<=0?'a menos':'a mais'} que em ${MESF[+pk.slice(5)-1].toLowerCase()} (${Math.abs(d/b.exp*100).toFixed(0)}%).`])}else D.push(['mu','Sem despesas no mês anterior para comparar.']);
   const inc=Object.keys(ca).map(c=>[c,(ca[c]||0)-(cb[c]||0)]).sort((x,z)=>z[1]-x[1])[0];if(inc&&inc[1]>0.005)D.push(['wa',`A categoria que mais aumentou foi ${escH(inc[0])}: +${R(inc[1])} em relação ao mês anterior.`]);
   if(a.rec>0)D.push([a.eco>=20?'ok':a.eco>=0?'wa':'bad',`Você preservou ${anPct(a.eco)} da renda (${anSig(a.rec-a.exp)} não foram consumidos).`]);else D.push(['wa','Nenhuma receita registrada neste mês.']);
   D.push([a.inv>0?'ok':'wa',a.inv>0?`Você investiu ${R(a.inv)}${a.rec>0?` (${anPct(a.inv/a.rec*100)} da renda)`:''}.`:'Nenhum aporte registrado neste mês.']);
   const at=[];if(a.bal<-0.005)at.push(`o saldo do mês ficou negativo (${anSig(a.bal)})`);const tc=anTop(ca)[0];if(tc&&a.exp>0&&tc[1]/a.exp>0.35)at.push(`${escH(tc[0])} concentra ${Math.round(tc[1]/a.exp*100)}% das despesas`);
   const C=anCardsMonth(k),ft=C.reduce((s,x)=>s+x.inv.total,0);if(C.some(x=>x.st==='vencida'))at.push('há fatura vencida em aberto');if(a.rec>0&&ft/a.rec>0.3)at.push(`o cartão compromete ${anPct(ft/a.rec*100)} da renda`);
   const m3=[1,2,3].map(i=>anSum(nm(k,-i)).exp).filter(v=>v>0);if(m3.length&&a.exp>(m3.reduce((s,v)=>s+v,0)/m3.length)*1.15)at.push('as despesas estão acima da média dos últimos meses');
   D.push(at.length?['bad','Pontos de atenção: '+at.join('; ')+'.']:['ok','Nenhum ponto de atenção relevante neste mês.']);
  }
  out.push(anCP('n_mdiag','Diagnóstico do mês',anDiag(D)+`<p class="mf-cmp">Análise automática com os lançamentos de ${lab(k).toLowerCase()}.</p>`));
 }
 return out.join('')}

/* ================= ANÁLISE ANUAL ================= */
function anAnual(){const y=window.__anYear,cy=+TD.slice(0,4),lastM=y===cy?+TD.slice(5,7):y>cy?0:12,sec=window.__anSecA,out=[];
 const K=yy=>Array.from({length:12},(_,i)=>mk(yy,i+1)),M=K(y).map(anSum),P=K(y-1).map(anSum),Mv=M.slice(0,lastM),Pv=P.slice(0,lastM),sm=(A,f)=>A.reduce((s,r)=>s+f(r),0);
 const rec=sm(Mv,r=>r.rec),exp=sm(Mv,r=>r.exp),inv=sm(Mv,r=>r.inv),prec=sm(Pv,r=>r.rec),pexp=sm(Pv,r=>r.exp),pinv=sm(Pv,r=>r.inv),eco=rec>0?(rec-exp)/rec*100:null,peco=prec>0?(prec-pexp)/prec*100:null,n=Math.max(1,lastM);
 const names=MES.map(x=>x.charAt(0).toUpperCase()+x.slice(1,3)),per=y===cy?`De janeiro a ${MESF[Math.max(0,lastM-1)].toLowerCase()}, comparado com o mesmo período de ${y-1}`:`Comparado com ${y-1}`;
 const cats={},pc={};Mv.forEach(r=>Object.entries(r.cats).forEach(([c,v])=>cats[c]=(cats[c]||0)+v));Pv.forEach(r=>Object.entries(r.cats).forEach(([c,v])=>pc[c]=(pc[c]||0)+v));
 const prov=Mv.flatMap(r=>r.prov),provT=anSumV(prov),pprov=anSumV(Pv.flatMap(r=>r.prov)),ap=Mv.flatMap(r=>r.ap);
 const old=anAno();
 if(sec==='res'){
  out.push(anCP('n_ares','Resultado anual',anKpis([['Receitas',R(rec),'ok',mfDelta(rec,prec,'up')],['Despesas',R(exp),'bad',mfDelta(exp,pexp,'down')],['Investido',R(inv),'',mfDelta(inv,pinv,'up')],['Total economizado',anSig(rec-exp),rec-exp>=0?'ok':'bad',mfDelta(rec-exp,prec-pexp,'up')]])+
   anRows([['Saldo financeiro acumulado',anSig(rec-exp-inv),null,rec-exp-inv>=0?'ok':'bad'],['Taxa média de economia',anPct(eco),eco!=null&&peco!=null?{t:(eco>=peco?'▲ ':'▼ ')+Math.abs(eco-peco).toFixed(0)+' p.p.',c:eco>=peco?'ok':'bad'}:null],['Média mensal de receitas',R(rec/n)],['Média mensal de despesas',R(exp/n)]])+
   `<p class="mf-cmp">Economizado = receitas − despesas. Saldo acumulado = economizado − investido. ${per}.</p>`));
  out.push(anPick(old,['n_aflux']));
  let acc=0;const ac=M.map((r,i)=>i<lastM?(acc+=r.bal):null);
  out.push(anC('n_asaldo','Saldo acumulado no ano',mfSeriesView(names,[{vals:ac,color:'var(--ac)',fill:true}],mfChart('n_asaldo','linha'),{every:2,aria:'Saldo acumulado no ano'})+`<p class="mf-cmp">Receitas − despesas − investido, somados mês a mês.</p>`));
 }
 if(sec==='gastos'){
  const subs={};Mv.forEach(r=>r.sp.forEach(t=>{if(mfIsFatLanc(t))return;const s=t.s||inferSub(t.c)||'Outros';subs[s]=(subs[s]||0)+(+t.v||0)}));const se=anTop(subs),ce=anTop(cats);
  const fx=sm(Mv,r=>anSumV(r.sp.filter(anFix))),cc=sm(Mv,r=>anSumV(r.sp.filter(t=>t.t==='Crédito')));
  out.push(anCP('n_agastos','Despesas no ano',anKpis([['Total de despesas',R(exp),'bad',mfDelta(exp,pexp,'down')],['Média mensal',R(exp/n),'',mfDelta(exp/n,pexp/n,'down')],['Fixas',R(fx),'',`<small class="mf-dl mu">${exp>0?Math.round(fx/exp*100)+'%':'—'}</small>`],['Variáveis',R(exp-fx),'',`<small class="mf-dl mu">${exp>0?Math.round((exp-fx)/exp*100)+'%':'—'}</small>`]])+
   anRows([['Gasto com cartão de crédito',R(cc),{t:exp>0?Math.round(cc/exp*100)+'% das despesas':'—'}],['Categoria que mais consumiu',ce[0]?escH(ce[0][0]):'—',ce[0]?{t:R(ce[0][1])}:null]])+`<p class="mf-cmp">${per}.</p>`));
  out.push(anC('n_aexpm','Evolução das despesas',mfSeriesView(names,[{vals:P.map((r,i)=>i<lastM?r.exp:null),color:'#8e8e93',dash:'4 4',w:1.8},{vals:M.map((r,i)=>i<lastM?r.exp:null),color:'#f07b7b',fill:true}],mfChart('n_aexpm','linha'),{every:2,aria:'Despesas por mês'})+mfKeys([[String(y),'#f07b7b'],[String(y-1),'#8e8e93',1]])));
  out.push(anPick(old,['n_acat']));
  out.push(anC('n_asub','Gastos por subcategoria',se.length?mfCatView(se.slice(0,8).map(([n,v],i)=>({n,v,c:MF_PAL[i%MF_PAL.length]})),mfChart('n_asub','barras')):'<p class="mf-empty">Sem despesas no ano.</p>'));
 }
 if(sec==='inv'||sec==='saude'||sec==='retro')anPatLoad();
 const PT=(window.__anPat||{}).rows||[],pty=PT.filter(r=>r.mes.slice(0,4)===String(y)),pnow=anPatNow(),pStart=PT.filter(r=>r.mes<=mk(y-1,12)).slice(-1)[0];
 if(sec==='inv'){
  const byA={};ap.forEach(x=>{byA[x.a]=(byA[x.a]||0)+x.v});const ae=anTop(byA),pv={};prov.forEach(t=>{const tp=anProvTipo(t);pv[tp]=(pv[tp]||0)+(+t.v||0)});
  out.push(anCP('n_ainv','Investimentos no ano',anKpis([['Total aportado',R(inv),'',mfDelta(inv,pinv,'up')],['Média mensal',R(inv/n),'',''],['Dividendos e JCP',R((pv['Dividendos']||0)+(pv['JCP']||0)+(pv['Rendimentos de FII']||0)),'ok',mfDelta(provT,pprov,'up')],['Rendimentos de renda fixa',pv['Renda fixa']>0?R(pv['Renda fixa']):'—','',`<small class="mf-dl mu">${pv['Renda fixa']>0?'lançados como receita':'sem dados'}</small>`]])+
   anRows([['Aportes x proventos',inv>0?anPct(provT/inv*100):'—',{t:'proventos ÷ aportes'}]])+`<p class="mf-cmp">Ações, FIIs e ETFs têm a data dos aportes registrada a partir de ${mfDmy(AN_OPS_DESDE)}; antes disso contam os lançamentos em “Investir” e a renda fixa.</p>`));
  out.push(anC('n_ainvm','Aportes por mês',mfSeriesView(names,[{vals:M.map((r,i)=>i<lastM?r.inv:null),color:'#5fbf77'}],mfChart('n_ainvm','barras'),{every:1,aria:'Aportes por mês'})));
  out.push(anC('n_aativo','Aportes por ativo',ae.length?mfCatView(ae.slice(0,10).map(([n,v],i)=>({n,v,c:MF_PAL[i%MF_PAL.length]})),mfChart('n_aativo','barras')):'<p class="mf-empty">Nenhum aporte com data registrado no ano.</p>'));
  out.push(anC('n_aprov','Proventos recebidos',provT>0?mfSeriesView(names,[{vals:M.map((r,i)=>i<lastM?anSumV(r.prov):null),color:'#7cc4fa'}],mfChart('n_aprov','barras'),{every:1,aria:'Proventos por mês'})+anRows(['Dividendos','JCP','Rendimentos de FII','Renda fixa'].map(k2=>[k2,pv[k2]>0?R(pv[k2]):'—'])):'<p class="mf-empty">Nenhum provento recebido no ano.</p>'));
  const pl=K(y).map(mm_=>{const r=pty.find(x=>x.mes===mm_);return r?+r.valor:null}),pa=K(y).map(mm_=>{const r=pty.find(x=>x.mes===mm_);return r?+r.aplicado:null});
  const rentOk=pStart&&pStart.mes>=AN_OPS_DESDE.slice(0,7)&&+pStart.valor>0,last=pty.slice(-1)[0];
  out.push(anC('n_apat','Evolução do patrimônio investido',(pty.length?mfSeriesView(names,[{vals:pa,color:'#8e8e93',dash:'4 4',w:1.8},{vals:pl,color:'#5fbf77',fill:true}],mfChart('n_apat','linha'),{every:2,aria:'Patrimônio no fim de cada mês'})+mfKeys([['Patrimônio (valor de mercado)','#5fbf77'],['Valor aplicado','#8e8e93',1]]):'<p class="mf-empty">O patrimônio de cada mês começa a ser guardado a partir de setembro de 2026.</p>')+
   anRows([['Patrimônio hoje',R(pnow.v)],['Valor aplicado (custo)',R(pnow.c)],['Ganho ou perda sobre o aplicado',pnow.c>0?anSig(pnow.v-pnow.c):'—',pnow.c>0?{t:anPct((pnow.v-pnow.c)/pnow.c*100),c:pnow.v>=pnow.c?'ok':'bad'}:null],
    ['Rentabilidade acumulada no ano',rentOk&&last?anPct(((+last.valor-+pStart.valor-inv)/(+pStart.valor))*100):'—',{t:rentOk?'descontando os aportes':'dados insuficientes'}]])+
   `<p class="mf-cmp">Patrimônio é quanto a carteira vale; aplicado é quanto você colocou. A rentabilidade do ano só aparece quando há o fechamento de dezembro do ano anterior e os aportes com data.</p>`));
 }
 if(sec==='saude'){
  const ra=(S.inv||[]).find(a=>/reserva\s*(de\s*)?em/i.test(a.a||'')),rv=ra?ivNow(ra):0,avgE=exp/n,cob=avgE>0?rv/avgE:null;
  const rmv=K(y).map((m_,i)=>i<lastM?S.tx.filter(t=>t&&t.t==='Reserva'&&t.d&&t.d.slice(0,7)===m_).reduce((s,t)=>s+(t.c==='Investimento'?1:-1)*(+t.v||0),0):null);
  out.push(anCP('n_asaude','Saúde financeira',anKpis([['Taxa de economia',anPct(eco),'',eco!=null&&peco!=null?`<small class="mf-dl ${eco>=peco?'ok':'bad'}">${eco>=peco?'▲':'▼'} ${Math.abs(eco-peco).toFixed(0)} p.p.</small>`:'<small class="mf-dl mu">do ano</small>'],['Renda comprometida',rec>0?anPct(exp/rec*100):'—','',`<small class="mf-dl mu">despesas ÷ receitas</small>`],['Investimento médio',R(inv/n),'',`<small class="mf-dl mu">por mês</small>`],['Cobertura da reserva',cob==null?'—':cob.toFixed(1).replace('.',',')+' meses','',`<small class="mf-dl mu">reserva ÷ despesa média</small>`]])+
   anRows([['Reserva de emergência hoje',R(rv)],['Patrimônio investido',pty.length?`${R(+pty[0].valor)} → ${R(pnow.v)}`:R(pnow.v),{t:pty.length?`desde ${MESF[+pty[0].mes.slice(5)-1].toLowerCase()}`:'hoje'}]])));
  out.push(anC('n_areserva','Reserva de emergência mês a mês',rmv.some(v=>v)?mfSeriesView(names,[{vals:rmv,color:'#0d9488'}],mfChart('n_areserva','barras'),{every:1,aria:'Movimentação da reserva por mês'})+`<p class="mf-cmp">Depósitos menos retiradas na reserva em cada mês.</p>`:'<p class="mf-empty">Nenhuma movimentação da reserva registrada no ano.</p>'));
  out.push(anPick(old,['n_apoup']));
 }
 if(sec==='retro'){const act=Mv.filter(r=>r.rec||r.exp||r.inv),mn=r=>MESF[+r.k.slice(5)-1];
  if(!act.length)out.push(anCP('n_aretro','Retrospecto anual','<p class="mf-empty">Sem lançamentos neste ano.</p>'));
  else{const best=act.slice().sort((x,z)=>(z.rec-z.exp)-(x.rec-x.exp))[0],worst=act.slice().sort((x,z)=>(x.rec-x.exp)-(z.rec-z.exp))[0],hiE=act.slice().sort((x,z)=>z.exp-x.exp)[0],hiI=act.slice().sort((x,z)=>z.inv-x.inv)[0],tc=anTop(cats)[0];
   out.push(anCP('n_aretro','Retrospecto anual',anRows([['Melhor mês',mn(best),{t:anSig(best.rec-best.exp)+' economizados',c:'ok'}],['Mês mais apertado',mn(worst),{t:anSig(worst.rec-worst.exp),c:worst.rec-worst.exp>=0?'mu':'bad'}],['Mês com maiores despesas',mn(hiE),{t:R(hiE.exp),c:'bad'}],['Mês com mais investimentos',hiI.inv>0?mn(hiI):'—',hiI.inv>0?{t:R(hiI.inv)}:null],['Categoria com maior gasto',tc?escH(tc[0]):'—',tc?{t:R(tc[1])}:null],['Dividendos e proventos',R(provT),{t:mfDelta(provT,pprov,'up').replace(/<[^>]+>/g,'')}],
    ['Patrimônio investido',pty.length?`${R(+pty[0].valor)} → ${R(pnow.v)}`:R(pnow.v),null]]))+
    anRows([['Receitas x '+(y-1),R(rec),anDl(rec,prec,'up')],['Despesas x '+(y-1),R(exp),anDl(exp,pexp,'down')],['Investido x '+(y-1),R(inv),anDl(inv,pinv,'up')]])+`<p class="mf-cmp">${per}.</p>`)}
 }
 if(sec==='diag'){const D=[];
  if(!(rec||exp||inv))D.push(['mu','Sem lançamentos neste ano.']);
  else{
   const ev=(rec-exp)-(prec-pexp);if(prec||pexp)D.push([ev>=0?'ok':'bad',`${ev>=0?'Houve evolução':'Houve piora'}: você economizou ${anSig(rec-exp)} contra ${anSig(prec-pexp)} no mesmo período de ${y-1}.`]);else D.push(['mu',`Sem dados de ${y-1} para comparar a evolução.`]);
   if(prec>0&&pexp>0){const gr=(rec-prec)/prec*100,ge=(exp-pexp)/pexp*100;D.push([ge>gr?'bad':'ok',ge>gr?`Os gastos cresceram mais que as receitas (${ge.toFixed(0)}% contra ${gr.toFixed(0)}%).`:`As receitas cresceram mais que os gastos (${gr.toFixed(0)}% contra ${ge.toFixed(0)}%).`])}
   D.push([inv>=pinv?'ok':'wa',pinv>0?`A capacidade de investimento ${inv>=pinv?'aumentou':'diminuiu'}: ${R(inv)} contra ${R(pinv)} em ${y-1}.`:`Você investiu ${R(inv)} no ano (${anPct(rec>0?inv/rec*100:null)} da renda).`]);
   const gro=Object.keys(cats).map(c=>[c,cats[c]-(pc[c]||0),pc[c]||0]).filter(x=>x[2]>0&&x[1]>0).sort((x,z)=>z[1]-x[1]).slice(0,2),tc=anTop(cats).slice(0,2);
   D.push(['wa',gro.length?`Despesas que precisam de atenção: ${gro.map(x=>`${escH(x[0])} (+${R(x[1])})`).join(' e ')}.`:tc.length?`Maiores despesas do ano: ${tc.map(x=>`${escH(x[0])} (${R(x[1])})`).join(' e ')}.`:'Nenhuma despesa registrada.']);
   const varA=exp-sm(Mv,r=>anSumV(r.sp.filter(anFix))),proj=n<12?varA/n*12:varA;
   D.push(['ok',`Reduzindo 10% dos gastos variáveis, você economizaria cerca de ${R(proj*0.1)} no próximo ano.`]);
  }
  out.push(anCP('n_adiag','Diagnóstico anual',anDiag(D)+`<p class="mf-cmp">Análise automática com os lançamentos de ${y}. ${per}.</p>`));
 }
 return out.join('')}
/* depois de desenhar: a seção escolhida fica visível na faixa */
window.__mfAD&&window.__mfAD.push(function(){const s=document.querySelector('#app .an-secs'),on=s&&s.querySelector('.on');if(!s||!on)return;s.scrollLeft=Math.max(0,on.offsetLeft-(s.clientWidth-on.offsetWidth)/2)});
function vAnalisesV2(){return anSecs()+(window.__anMode==='ano'?anAnual():anMensal())}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 const s=t.closest('[data-ansec]');if(s){e.preventDefault();e.stopPropagation();if(window.__anMode==='ano')window.__anSecA=s.dataset.ansec;else window.__anSecM=s.dataset.ansec;draw();const n=document.querySelector('#app .an-secs');if(n&&n.getBoundingClientRect().top<0)n.scrollIntoView({block:'start'});return}
 const m=t.closest('[data-anym]');if(m){e.preventDefault();e.stopPropagation();window.__anYm=nm(window.__anYm,+m.dataset.anym);draw()}},true);
function vAnalises(){return vAnalisesV2()}
/* computador: categorias do mês ao lado do formulário (ocupa o espaço vazio) */
function mfExtCat(){const st=dashStats(ym),e=Object.entries(st.cats).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),tot=e.reduce((s,x)=>s+x[1],0),mx=e.length?e[0][1]:1;
 const rows=e.slice(0,6).map(([n,v],i)=>{const c=MF_PAL[i%MF_PAL.length];return `<div class="mf-xc"><div class="mf-xc-t"><span><i style="background:${c}"></i>${escH(n)}</span><b>${R(v)}</b><em>${tot?Math.round(v/tot*100):0}%</em></div><div class="mf-xc-b"><i style="width:${(v/mx*100).toFixed(1)}%;background:${c}"></i></div></div>`}).join('');
 return B('ext_cat')+`<section class="c mf-xcat"><h2>Por categoria</h2>${rows||'<p class="mf-empty">Sem gastos neste mês.</p>'}${tot?`<div class="mf-xc-tot">Total do mês <b>${R(tot)}</b></div>`:''}</section>`}
/* botão Lançar e "Novo lançamento" abrem o formulário novo */
window.addEventListener('click',e=>{const q=e.target.closest&&e.target.closest('[data-quick]');if(!q)return;e.preventDefault();e.stopPropagation();
 F.id=null;F.v=F.dt=F.n=null;if(F.c==='Receita'){const sub=F.s&&SUBCATS.includes(F.s)?F.s:'Variáveis';F.s=sub;F.c=SUB_TO_LEGACY[sub]||'Lazer e Pessoal';F.g=inferMain(F.c,F.s);F.t=F.pt||'Pix'}
 if(tab!=='add'){tab='add';ym=TD.slice(0,7)}mfAddInicio();window.__mfLastTab=null;draw();scrollTo(0,0);
 setTimeout(()=>{const i=document.getElementById('fv');if(i){try{i.focus({preventScroll:true})}catch(_){i.focus()}}},120)},true);

/* ===== Patch 58 · Lote 4: novidades ===== */
/* número digitado no padrão brasileiro: 1.500 = mil e quinhentos; 1.500,50 = mil e quinhentos e cinquenta centavos */
function mfNum(v){let s=String(v==null?'':v).replace(/[^\d.,-]/g,'');if(!s)return 0;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');const n=parseFloat(s);return isFinite(n)?n:0}
/* ---------- Teto por ativo ---------- */
function mfCap(){const v=+S.invCap;return v>0&&v<100?v:15}
function mfOverCap(){const I=S.inv||[],tot=I.reduce((s,a)=>s+ivNow(a),0);if(!(tot>0))return [];const cap=mfCap();return I.filter(a=>!/reserva/i.test(a.a||'')).map(a=>({a:String(a.a||''),p:ivNow(a)/tot*100})).filter(x=>x.p>cap+0.05).sort((x,y)=>y.p-x.p)}
/* Metas por classe (patch 49) + teto por ativo */
function mfMetaSec(I){const gs=ivGroups(I),tot=gs.reduce((s,g)=>s+g.v,0)||0,T=S.invTarget||{},ks=IV_ORD.filter(k=>gs.some(g=>g.k===k)||+T[k]>0),st=ks.reduce((s,k)=>s+(+T[k]||0),0);if(!ks.length)return '';
 const over=mfOverCap(),cap=mfCap();
 return `<div class="mf-metas"><div class="mf-metas-h"><b>Metas por classe</b><small>${st?`Soma ${st}%${st!==100?' · ideal 100%':''}`:'Digite o % ideal'}</small></div><div class="mf-metas-g">${ks.map(k=>{const g=gs.find(x=>x.k===k),v=g?g.v:0,cur=tot?v/tot*100:0,t=+T[k]||0,diff=t?(t/100*tot-v):0;
  return `<div class="dv-meta"><div class="dv-meta-t"><span><i style="background:${IV_COLS[k]}"></i>${IV_NOME[k]}</span><label>Meta <input type="text" inputmode="numeric" data-ivtgt="${k}" value="${t||''}" placeholder="0"><u>%</u></label></div><div class="dv-meta-b"><i><b style="width:${Math.min(100,cur).toFixed(1)}%;background:${IV_COLS[k]}"></b>${t?`<em style="left:${Math.min(100,t)}%"></em>`:''}</i></div><small><span>Atual ${cur.toFixed(1).replace('.',',')}%</span><span class="${!t?'mu':Math.abs(diff)<1?'ok':diff>0?'wa':'mu'}">${!t?'Sem meta':Math.abs(diff)<1?'Na meta':diff>0?'Faltam '+R(diff):'Acima '+R(-diff)}</span></small></div>`}).join('')}</div>
 <div class="mf-cap"><label>Teto por ativo <input type="text" inputmode="numeric" data-invcap value="${cap}">%</label><span class="${over.length?'bad':'ok'}">${over.length?over.slice(0,3).map(x=>`${escH(x.a)} ${x.p.toFixed(1).replace('.',',')}%`).join(' · ')+' acima do teto':'Nenhum ativo acima do teto'}</span></div></div>`}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('[data-invcap]'))return;const v=Math.round(+String(t.value).replace(',','.')||0);S.invCap=v>0&&v<100?v:15;save();draw()},true);
/* "Maior posição": aviso quando passa do teto */
window.__mfAD.push(function(){if(tab!=='inv')return;const over=mfOverCap();if(!over.length)return;document.querySelectorAll('#app .dv-k').forEach(k=>{if(!/Maior posição/.test(k.textContent)||k.querySelector('.mf-capw'))return;const s=document.createElement('span');s.className='dv-ks bad mf-capw';s.textContent=`Acima do teto de ${mfCap()}%`;k.appendChild(s)})});
/* ---------- Proventos x meta ---------- */
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('[data-provmeta]'))return;const P=plEnsure(),v=mfNum(t.value);P.provMeta=v>0?v:1000;save();draw()},true);
/* ---------- Avisos no Dashboard ---------- */
/* Fase 3 · M10: cada aviso do Dashboard leva à tela e ao bloco onde estão os valores dele (e destaca o bloco por um instante).
   Só há aviso quando há dado confiável por trás: a lista continua vindo de mfAlerts(), nada novo foi inventado. */
var MF_AL_GO={fat:{tab:'mais',ct:'contas',blk:'p_faturas',exp:1},contas:{tab:'mais',ct:'venc',blk:'p_venc'},saldo:{tab:'res',blk:'cashflow'},gastos:{tab:'anal'},
 regra:{tab:'res',blk:'budgetalerts'},tetocat:{tab:'mais',ct:'contas',blk:'p_teto'},teto:{tab:'inv',inv:'pos'},prov:{tab:'inv',inv:'prov'}};
function mfGoTo(g){if(!g)return;tab=g.tab;if(g.ct)window.__ctMode=g.ct;if(g.lc)window.__addMode=g.lc;if(g.inv)window.__invMode=g.inv;
 if(g.exp){window.__cbExp=true;try{const n=(mfFatNotices(true)||[])[0];if(n&&n.k)window.__cbm=n.k}catch(e){}}
 window.__mfLastTab=null;draw();
 if(g.blk)setTimeout(()=>{const el=document.querySelector(`#app [data-bk="${g.tab}|${g.blk}"]`);if(!el)return;el.scrollIntoView({block:'start',behavior:'smooth'});el.classList.add('mf-hl');setTimeout(()=>el.classList.remove('mf-hl'),1800)},90)}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#app [data-alk]');if(!b)return;e.preventDefault();e.stopPropagation();mfGoTo(MF_AL_GO[b.dataset.alk])},true);
function mfAlertsBlock(){if(ym!==TD.slice(0,7))return '';const A=mfAlerts(),pf=mfAlPrefs(),n=pf.n||A.length,show=A.slice(0,n),cfg=!!window.__alCfg;
 const panel=cfg?`<div class="mf-al-cfg"><small class="mu">Escolha quais avisos aparecem e de onde eles vêm:</small><div class="mf-al-chips">${MF_AL_SRC.map(([k,l,o])=>`<button type="button" class="${pf.on[k]?'on':''}" data-alsrc="${k}" aria-pressed="${!!pf.on[k]}"><b>${l}</b><small>${o}</small></button>`).join('')}</div><div class="mf-al-n"><small class="mu">Mostrar</small>${[[3,'3 principais'],[5,'5'],[0,'Todos']].map(([v,t])=>`<button type="button" class="${pf.n===v?'on':''}" data-aln="${v}">${t}</button>`).join('')}</div></div>`:'';
 return B('d_alert')+`<section class="c mf-alerts"><div class="mf-al-h"><h2>Avisos</h2><button type="button" class="mf-al-cfgb" data-alcfg="1" aria-expanded="${cfg}">${cfg?'Feito ✓':'Configurar'}</button></div>${panel}${show.length?show.map(a=>`<button type="button" class="mf-al-i" ${MF_AL_GO[a.k]?`data-alk="${a.k}"`:`data-tab="${a.go}"`}><i class="${a.lv}"></i><span>${escH(a.t)}<small class="mf-al-src">${escH(a.src)}</small></span><b class="${a.lv}">${a.v}</b><em>›</em></button>`).join(''):'<p class="mf-empty">Nenhum aviso agora.</p>'}${A.length>show.length?`<small class="mf-al-more">+${A.length-show.length} ${A.length-show.length===1?'aviso':'avisos'} · toque em Configurar para mostrar mais</small>`:''}</section>`}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;let b;
 if(t.closest('[data-alcfg]')){e.preventDefault();e.stopPropagation();window.__alCfg=!window.__alCfg;draw();return}
 if(b=t.closest('[data-alsrc]')){e.preventDefault();e.stopPropagation();const p=mfAlPrefs();p.on[b.dataset.alsrc]=p.on[b.dataset.alsrc]?0:1;S.prefs.avisos=p;save();draw();return}
 if(b=t.closest('[data-aln]')){e.preventDefault();e.stopPropagation();const p=mfAlPrefs();p.n=+b.dataset.aln;S.prefs.avisos=p;save();draw()}},true);
/* ---------- Busca e filtros (celular e computador) ---------- */
var MF_TXF=[['all','Tudo'],['exp','Despesas'],['rec','Receitas'],['inv','Investimentos'],['cred','Cartão'],['pix','Pix'],['vr','VR']];
var MF_TXF_MAP={all:{},exp:{kind:'exp'},rec:{kind:'rec'},inv:{kind:'inv'},cred:{pay:'Crédito'},pix:{pay:'Pix'},vr:{pay:'VR'}};
function mfTxKey(){const F2=window.__txF||{};return Object.keys(MF_TXF_MAP).find(k=>k!=='all'&&MF_TXF_MAP[k].kind==F2.kind&&MF_TXF_MAP[k].pay==F2.pay)||'all'}
function mfTxChips(){const cur=mfTxKey();return `<div class="mf-fchips" role="group" aria-label="Filtrar lançamentos">${MF_TXF.map(([k,t])=>`<button type="button" class="${k===cur?'on':''}" data-txf="${k}" aria-pressed="${k===cur}">${t}</button>`).join('')}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-txf]');if(!b)return;e.preventDefault();e.stopPropagation();const k=b.dataset.txf,m=MF_TXF_MAP[k]||{};window.__txF=mfTxKey()===k?{}:{kind:m.kind,pay:m.pay};
 document.querySelectorAll('[data-txf]').forEach(x=>{const on=x.dataset.txf===mfTxKey();x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});mfTxApply()},true);
/* ---------- Desfazer exclusão ---------- */
(function(){const SEL='[data-tx-modal="delete"],[data-ser],[data-mfsel="del"],[data-fx="del"],[data-shdel],[data-shclear]';
 window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest(SEL);if(!b)return;
  const snap={tx:JSON.stringify(S.tx||[]),shopping:JSON.stringify(S.shopping||[]),fixed:JSON.stringify(S.fixed||[]),trash:JSON.stringify(S.trash||[])},n=[(S.tx||[]).length,(S.shopping||[]).length,(S.fixed||[]).length];
  setTimeout(()=>{const d=[n[0]-(S.tx||[]).length,n[1]-(S.shopping||[]).length,n[2]-(S.fixed||[]).length];if(d[0]<=0&&d[1]<=0&&d[2]<=0)return;
   const msg=d[0]>0?(d[0]===1?'Lançamento excluído':`${d[0]} lançamentos excluídos`):d[1]>0?(d[1]===1?'Item removido':`${d[1]} itens removidos`):'Recorrente excluído';mfUndoToast(msg,snap)},380)},true)})();
function mfUndoToast(msg,snap){document.querySelectorAll('.mf-undo').forEach(x=>x.remove());const t=document.createElement('div');t.className='mf-undo';t.setAttribute('role','status');t.innerHTML=`<span>${escH(msg)}</span><button type="button">Desfazer</button>`;document.body.appendChild(t);
 const kill=setTimeout(()=>t.remove(),7000);t.querySelector('button').addEventListener('click',()=>{clearTimeout(kill);try{S.tx=JSON.parse(snap.tx);S.shopping=JSON.parse(snap.shopping);S.fixed=JSON.parse(snap.fixed);S.trash=JSON.parse(snap.trash);save();draw()}catch(e){}t.remove();try{mfToast('Restaurado')}catch(e){}})}

/* ===== Patch 59: plano no perfil (protótipo, pagamento só por Pix) ===== */
var MF_PLANS=[{k:'free',n:'Free',p:'Grátis',d:'Uso básico, com limites',f:['Lançamentos e contas do mês','Dashboard e análises básicas','Uso limitado']},
 {k:'mensal',n:'Mensal',p:'R$ 9,99',per:'/mês',d:'Tudo liberado, cancele quando quiser',f:['Uso sem limites','Investimentos, proventos e metas','Relatórios em PDF']},
 {k:'anual',n:'Anual',p:'R$ 101,89',per:'/ano',d:'Equivale a R$ 8,49 por mês',tag:'15% de desconto',f:['Tudo do Mensal','Pague uma vez por ano','15% mais barato que o mensal']}];
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;const pl=t.closest('#mf-cfg [data-plan]');if(pl){e.preventDefault();e.stopPropagation();window.__planSel=pl.dataset.plan;window.mfCfgRender&&mfCfgRender();return}
 const pay=t.closest('#mf-cfg [data-planpay]');if(pay){e.preventDefault();e.stopPropagation();const k=pay.dataset.planpay;if(k==='free'){S.plano={k:'free'};save();window.__planSel='free';window.mfCfgRender&&mfCfgRender();return}try{mfToast('Pagamento por Pix em breve. Este é um protótipo.')}catch(_){}}},true);

/* ===== Patch 60 · Etapa 1: sincronizar sem fechar o teclado ===== */
/* 1) dado igual com chaves em outra ordem (eco do Supabase) não é mudança */
function mfCanon(v){if(v===null||v===undefined||typeof v!=='object')return typeof v==='function'?'null':JSON.stringify(v===undefined?null:v);if(v.__mfRaw)v=v.__mfRaw;if(Array.isArray(v))return '['+v.map(mfCanon).join(',')+']';return '{'+Object.keys(v).filter(k=>v[k]!==undefined&&typeof v[k]!=='function').sort().map(k=>JSON.stringify(k)+':'+mfCanon(v[k])).join(',')+'}'}
function mfSameData(a,b){try{return mfCanon(a)===mfCanon(b)}catch(e){return false}}
/* 2) nunca redesenhar a tela por baixo do campo que está sendo digitado */
(function(){
 const real=draw;
 const USER=new Set(['click','submit','keydown','keyup','pointerup','pointerdown','mousedown','mouseup','touchstart','touchend','dblclick','contextmenu','drop','dragend','reset','popstate']);
 const isText=el=>!!el&&el.nodeType===1&&(el.isContentEditable||el.tagName==='TEXTAREA'||(el.tagName==='INPUT'&&!/^(checkbox|radio|range|button|submit|reset|color|file|image|hidden)$/i.test(el.type||'')));
 const inApp=el=>!!(el&&el.closest&&el.closest('#app'));
 const editing=()=>{const a=document.activeElement;return isText(a)&&a.isConnected&&inApp(a)&&!a.disabled&&!a.readOnly&&a.getClientRects().length>0};
 let pend=false,tm=0,pdown=false;
 const dirty=new Map();
 const keyOf=el=>{if(!el||!el.tagName)return '';if(el.id)return '#'+el.id;const bk=el.closest('[data-bk]');let k=(bk?bk.dataset.bk:'')+'|'+el.tagName;['name','type','placeholder'].forEach(a=>{const v=el.getAttribute(a);if(v)k+='|'+a+'='+v});[...el.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name+'='+a.value).sort().forEach(x=>{k+='|'+x});return k};
 document.addEventListener('input',e=>{const t=e.target;if(inApp(t)&&(isText(t)||t.tagName==='SELECT'))dirty.set(keyOf(t),t.value)},true);
 const restore=()=>{if(!dirty.size)return;const by=new Map();document.querySelectorAll('#app input,#app textarea,#app select').forEach(el=>{const k=keyOf(el);if(dirty.has(k))by.set(k,(by.get(k)||[]).concat(el))});by.forEach((els,k)=>{if(els.length===1&&els[0].value!==dirty.get(k))els[0].value=dirty.get(k)})};
 const keep=()=>{const y=scrollY;real();restore();if(Math.abs(scrollY-y)>1)scrollTo(0,y)};
 const flush=()=>{clearTimeout(tm);if(!pend)return;if(editing()||pdown){tm=setTimeout(flush,350);return}pend=false;keep()};
 window.mfDrawPending=()=>pend;
 window.mfDrawSoft=()=>{if(editing()){pend=true;return}pend=false;keep()};
 draw=function(){const ev=window.event,ty=ev&&ev.type||'',tg=ev&&ev.target;
  if(USER.has(ty)){pend=false;clearTimeout(tm);dirty.clear();return real.apply(this,arguments)}
  if((ty==='change'||ty==='input')&&tg&&!isText(tg)){pend=false;clearTimeout(tm);return real.apply(this,arguments)}
  if(ty==='change'||ty==='input'){pend=true;clearTimeout(tm);tm=setTimeout(flush,0);return}
  if(editing()){pend=true;return}
  pend=false;keep()};
 document.addEventListener('focusout',e=>{if(pend&&inApp(e.target)){clearTimeout(tm);tm=setTimeout(flush,140)}},true);
 document.addEventListener('pointerdown',()=>{pdown=true},true);
 const up=()=>{pdown=false};document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&pend&&!editing())setTimeout(flush,60)});
})();

/* ===== Patch 61 · Etapa 2: Pagar fatura e meses do cartão ===== */
function mfCbMonth(){if(!window.__cbm||!/^\d{4}-\d{2}$/.test(window.__cbm)){let k=mfFatCur();for(let i=0;i<6;i++){let v=null;try{v=cbInvoice(k)}catch(e){}if(v&&v.total>0.005&&v.left<=0.005)k=nm(k,1);else break}window.__cbm=k}return window.__cbm}
function mfMoney(v){return (Math.round((+v||0)*100)/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function mfDmy(d){return String(d).slice(8,10)+'/'+String(d).slice(5,7)+'/'+String(d).slice(0,4)}
function plCardBillingHtml(){
 const cfg=ensureCardBilling(),cur=mfFatCur(),sel=mfCbMonth(),keys=Array.from({length:25},(_,i)=>nm(cur,i-12));
 const inv=cbInvoice(sel),st=mfFatState(sel,inv),paid=st.k==='paid',sum=inv.rows.reduce((s,t)=>s+txValue(t),0);
 const pct=paid?100:inv.total>0?Math.min(100,inv.paid/inv.total*100):0,cats={};inv.rows.forEach(t=>{if(mfIsFatLanc(t))return;cats[t.c]=(cats[t.c]||0)+txValue(t)});
 const topc=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,3),cmx=topc[0]?topc[0][1]:1,open=window.__cbOpen||{};
 const chips=keys.map(k=>{const x=cbInvoice(k),s2=mfFatState(k,x);return `<button type="button" data-pc="cb-month" data-pcs="${k}" class="cb-m st-${s2.k}${k===sel?' on':''}${k===cur?' cur':''}" aria-pressed="${k===sel}" aria-label="Fatura de ${lab(k).toLowerCase()}: ${s2.t}"><span>${mfMs(k)}</span><small>${x.total>0.005?R(x.total):'—'}</small><i></i></button>`}).join('');
 const list=inv.rows.slice().sort((a,b)=>txValue(b)-txValue(a)).map(t=>`<div class="tool-line"><div style="flex:1;min-width:0"><b style="overflow-wrap:anywhere">${escH(String(t.n||'Compra').replace(/\s*\(\d+\/\d+\)\s*$/,''))}</b><small class="mu" style="display:block">${t.d.slice(8,10)}/${t.d.slice(5,7)} · ${escH(t.c||'')}${t.installmentCount>1?` · parcela ${t.installmentIndex}/${t.installmentCount}`:''}</small></div><b>${R(txValue(t))}</b></div>`).join('');
 const pays=mfFatPays(sel);
 const hist=pays.length?`<div class="cb-hist"><small class="cb-hist-t">Histórico de pagamentos</small>${pays.map(t=>`<div class="cb-hist-r"><span>${mfDmy(t.d)}</span><b class="ok">${R(txValue(t))}</b></div>`).join('')}</div>`:'';
 const val=mfMoney(inv.total);
 const payBody=st.k==='none'?'<p class="mu cb-note">Sem compras nesta fatura.</p>':paid?`<div class="cb-paid"><span class="cb-paid-i">✓</span><div><b>Fatura paga</b><small>${pays.length?`Pagamento de ${R(txValue(pays[0]))} em ${mfDmy(pays[0].d)}`:'Marcada como paga'}</small></div></div>`
  :`<div class="cb-pay"><label class="cb-pay-l"><small>Valor da fatura</small><span class="cb-pil"><em>R$</em><input type="text" inputmode="decimal" autocomplete="off" data-cbpayv="${sel}" value="${val}" style="width:${Math.max(4,val.length)+0.6}ch!important" aria-label="Valor da fatura"></span></label><small class="mu cb-pay-s">Soma das compras ${R(sum)}${inv.paid>0.005?` · já pago ${R(inv.paid)}`:''}</small><button type="button" class="b cb-paybtn" data-cbpay="${sel}">Pagar fatura</button></div>`;
 const payOpen=open.pay!==undefined?open.pay:(st.k==='open'||st.k==='late');
 return B('p_faturas')+`<section class="c card-billing-compact cb-card"><h2>Cartão de crédito</h2>
 <div class="cb-strip" role="group" aria-label="Meses da fatura">${chips}</div>
 <div class="cb-legend" aria-hidden="true"><span class="st-paid">Pago</span><span class="st-open">Em aberto</span><span class="st-late">Vencida</span><span class="st-future">Futura</span></div>
 <div class="cb-hero"><div><small>Fatura de ${lab(sel).toLowerCase()}</small><b>${R(inv.total)}</b></div><span class="cb-status ${st.c}" data-st="${st.k||''}">${st.t}</span></div>
 ${topc.length?`<div class="cb-cats">${topc.map(([c,v])=>`<div><div style="display:flex;justify-content:space-between;font-size:12px"><span>${escH(c)}</span><b>${R(v)}</b></div><div class="iv-bar iv-bar-s"><i style="width:${(v/cmx*100).toFixed(1)}%;background:var(--ac)"></i></div></div>`).join('')}</div>`:''}
 <details class="cb-more" data-cbd="list"${open.list?' open':''}><summary>Compras da fatura (${inv.rows.length})</summary>${list||'<div class="mu" style="font-size:12px;padding:8px 0">Nenhuma compra no crédito nesta fatura.</div>'}</details>
 <details class="cb-more cb-paybox" data-cbd="pay"${payOpen?' open':''}><summary>Pagar fatura${paid?' <em class="cb-sum-ok">Pago</em>':''}</summary>${payBody}${hist}</details>
 <details class="cb-more" data-cbd="cfg"${open.cfg?' open':''}><summary>Ciclo do cartão</summary><form data-form="card-billing" class="tool-form"><label><small>Vencimento da fatura</small><input name="dueDay" type="number" min="1" max="31" required value="${cfg.dueDay}"></label><label><small>Melhor dia de compra</small><input name="bestDay" type="number" min="1" max="31" required value="${cfg.bestDay}"></label><button class="primary-btn" type="submit" style="grid-column:1/-1">Salvar datas</button></form><small class="mu" style="display:block;margin-top:4px">Antes do melhor dia a compra entra na fatura atual; depois, na próxima.</small></details></section>`}
/* lembra o que está aberto no card e a rolagem dos meses */
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.matches&&d.matches('#app details[data-cbd]')){window.__cbOpen=window.__cbOpen||{};window.__cbOpen[d.dataset.cbd]=d.open}},true);
window.__mfAD.push(function(){const st=document.querySelector('#app .cb-strip');if(!st)return;const sel=st.querySelector('.cb-m.on'),cur=st.querySelector('.cb-m.cur');
 if(window.__cbSL==null){const t=cur||sel;if(t)st.scrollLeft=t.offsetLeft-1}else st.scrollLeft=window.__cbSL;
 if(sel&&(sel.offsetLeft<st.scrollLeft||sel.offsetLeft+sel.offsetWidth>st.scrollLeft+st.clientWidth))st.scrollLeft=sel.offsetLeft-1;
 window.__cbSL=st.scrollLeft;st.addEventListener('scroll',()=>{window.__cbSL=st.scrollLeft},{passive:true})});
/* confirmação reutilizável */
function mfConfirm(o){document.getElementById('mf-confirm')?.remove();const w=document.createElement('div');w.id='mf-confirm';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label',o.title||'Confirmar');
 w.innerHTML=`<div class="mf-cf-bg" data-cf="no"></div><section class="mf-cf-box"><h3>${o.title||'Confirmar'}</h3>${o.body||''}<div class="mf-cf-btns"><button type="button" class="b mf-cf-ok" data-cf="ok">${o.ok||'Confirmar'}</button>${o.single?'':`<button type="button" class="b s" data-cf="no">${o.cancel||'Cancelar'}</button>`}</div></section>`;
 w.addEventListener('click',e=>{const b=e.target.closest('[data-cf]');if(!b)return;e.preventDefault();e.stopPropagation();if(b.dataset.cf==='no'){w.remove();o.onCancel&&o.onCancel();return}if(b.disabled)return;b.disabled=true;let r;try{r=o.onOk&&o.onOk(w)}catch(err){console.error(err)}if(r===false){b.disabled=false;return}w.remove()});
 document.body.appendChild(w);requestAnimationFrame(()=>w.classList.add('on'));return w}
/* pagar a fatura: valor informado vira o valor da fatura; paga o que falta; sem duplicar */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cbpay]');if(!b)return;e.preventDefault();e.stopPropagation();const k=b.dataset.cbpay,inp=document.querySelector(`#app [data-cbpayv="${k}"]`),v=inp?mfNum(inp.value):0;if(inp&&!(v>0)){mfToast('Informe o valor da fatura.');try{inp.focus({preventScroll:true})}catch(_){}return}mfPayInvoice(k,v)},true);
document.addEventListener('input',e=>{const t=e.target;if(t&&t.matches&&t.matches('[data-cbpayv]'))t.style.setProperty('width',(Math.max(4,t.value.length)+0.6)+'ch','important')},true);
/* Contas: sem mês geral no topo (o mês fica no card do cartão) */
var MF_NOMONTH=['mais'],MF_TOPSEG={mais:()=>mfCtSeg()};
function mfStripMonth(h){return h.replace(/<div class="mf-msw[^"]*"[^>]*>[\s\S]*?<\/div>/,'')}
/* MF_TOPSEG_IN: abas cujo seletor sobe para a linha do título (junto do avatar e do mês), em vez de ficar numa linha abaixo (Fase 3 · M9) */
var MF_TOPSEG_IN=[]; /* 1.34: o seletor volta para a linha abaixo do título, igual em Investimentos, Contas e Análises */
function mfTopCompact(){let h=mfTopCompactBase();if(MF_NOMONTH.includes(tab))h=mfStripMonth(h);const sg=MF_TOPSEG[tab];if(!sg)return h;if(MF_TOPSEG_IN.includes(tab)&&/<\/div>\s*$/.test(h))return h.replace('class="header-bar mf-top mf-ttl2"','class="header-bar mf-top mf-ttl2 mf-hdseg-on"').replace(/<\/div>\s*$/,`<div class="mf-hdseg">${sg()}</div></div>`);return h+`<div class="mf-anseg">${sg()}</div>`}
/* busca do topo: leva para Lançamentos já filtrando */
document.addEventListener('keydown',e=>{const i=e.target&&e.target.closest&&e.target.closest('[data-dtq]');if(!i||e.key!=='Enter')return;e.preventDefault();window.__txQ=i.value.trim();mfAddInicio();if(tab!=='add'){const nb=document.querySelector('#nv [data-tab="add"]');if(nb)nb.click();else draw()}else draw();setTimeout(()=>{window.mfTxApply&&mfTxApply();const r=document.querySelector('#app .mf-all');r&&r.scrollIntoView({block:'start',behavior:'smooth'})},60)});
/* Vencimentos em Contas seguem o mês escolhido no cartão */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-paid]');if(!b)return;e.preventDefault();e.stopPropagation();
 const key=b.dataset.paid,k=b.dataset.pm||ym,it=mfDueItems(k).find(x=>x.key===key),P=mfPaidMap();
 if(key.startsWith('fat:')){const fk=key.slice(4),inv=cbInvoice(fk),isPaid=!!(it&&it.paid);
  if(isPaid&&inv.paid>0.005&&inv.left<=0.005){const pg=mfFatPays(fk)[0];mfToast('Fatura paga'+(pg?' em '+mfDmy(pg.d):'')+'. Para desfazer, exclua o pagamento em Lançamentos.');return}
  if(isPaid||inv.due<(S.paidSince||TD)){P[key]=!isPaid;save();draw();return}
  mfPayInvoice(fk);return}
 const cur=it?it.paid:!!P[key];P[key]=!cur;save();draw()},true);

/* ===== Patch 62 · Etapa 3: abas Contas | Compras | Simulação e Investimentos | Simulação ===== */
var MF_CT_MODES=['contas','venc','div','sit','home']; /* 2.1: 'simular' saiu de Planejamento */
/* tela-base de Contas: no celular é a página inicial 'home' (resumos de tudo, nenhuma pílula marcada; as outras subabas abrem como página); no computador continua Cartão */
function mfCtBase(){return window.mfIsDesk&&mfIsDesk()?'contas':'home'}
function mfCtMode(){const m=window.__ctMode;return MF_CT_MODES.includes(m)&&!(m==='home'&&window.mfIsDesk&&mfIsDesk())?m:mfCtBase()}
/* Fase 3 · M13: os botões do topo (Lançamentos: Início/Lista/Diário/Resumo · Planejamento: Cartão/Compromissos/Dívidas/Situação/Simular · Patrimônio: Resumo/Patrimônio/Investimentos/Metas) podem mudar de ordem.
   A ordem fica em S.lay.sg (vale para celular e computador, como a ordem da barra principal); o que faltar volta no fim, nunca some. */
var MF_SEGS={add:[['inicio','Início'],['lista','Lista'],['diario','Diário'],['rec','Recorrentes'],['gasto','Gastos']],mais:[['contas','Cartão'],['venc','Compromissos'],['div','Dívidas'],['sit','Situação']],inv:[['resumo','Resumo'],['bens','Patrimônio'],['inv','Investimentos'],['metas','Metas']],invs:[['pos','Posição'],['meus','Posição'],['prov','Proventos'],['fund','Análises'],['radar','Radar']]};
/* 2.1: 'invs' = abas da página Investimentos (aberta pelo botão Investimentos de Patrimônio). Nomes trocados pelo usuário ficam em S.lay.sn[tela][chave]. */
function mfSegList(t){const base=MF_SEGS[t]||[],o=(((S.lay||{}).sg)||{})[t]||[],ks=base.map(x=>x[0]);return [...o.filter(k=>ks.includes(k)),...ks.filter(k=>!o.includes(k))].filter((k,i,a)=>a.indexOf(k)===i).filter(k=>!(t==='invs'&&(k==='radar'||k==='meus')&&window.mfIsDesk&&mfIsDesk())).filter(k=>!(t==='inv'&&k==='bens'&&!(window.mfIsDesk&&mfIsDesk()))).filter(k=>!(t==='add'&&(k==='rec'||k==='gasto')&&window.mfIsDesk&&mfIsDesk())).filter(k=>!(t==='add'&&(k==='diario'||k==='gasto')&&!(window.mfIsDesk&&mfIsDesk()))) /* 0.1: no celular Gastos (simulador de gastos) mora dentro de Recorrentes */.map(k=>{const b=base.find(x=>x[0]===k),n=((((S.lay||{}).sn)||{})[t]||{})[k];return n?[k,String(n)]:b})}
function mfCtSeg(){return mfSeg('data-ctmode',mfCtMode(),mfSegList('mais'))}
/* Nova organização, etapa 1: "Geral" vira "Cartão" (mesmo modo 'contas') e nasce "Compromissos" (modo 'venc').
   Quem já tinha mudado a ordem dos botões recebe "Compromissos" logo depois de "Cartão" (a ordem dos botões vale para os dois aparelhos,
   por isso só insere se ainda faltar). Parcelamentos passa a ficar logo depois do cartão em quem já tinha mudado a ordem dos blocos
   (a ordem dos blocos é de cada aparelho). Nada é apagado: só muda de lugar. */
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});
 const g=L.sg&&L.sg.mais;if(Array.isArray(g)&&!g.includes('venc')){const i=g.indexOf('contas');g.splice(i>=0?i+1:Math.min(1,g.length),0,'venc')}
 if(L.__ct113)return;L.__ct113=1;
 const o=L.o&&L.o.mais;if(Array.isArray(o)&&o.includes('p_faturas')){const a=o.filter(x=>x!=='p_parc');a.splice(a.indexOf('p_faturas')+1,0,'p_parc');L.o.mais=a}
 save()}catch(e){console.warn('Planejamento (nova organização)',e)}});
/* 0.4: quem já tinha mudado a ordem dos botões de Investimentos recebe "Posição" logo depois de "Resumo" (em vez de no fim) */
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__pos04)return;L.__pos04=1;
 const o=L.sg&&L.sg.inv;if(Array.isArray(o)&&!o.includes('pos')){const i=o.indexOf('carteira');o.splice(i>=0?i+1:Math.min(1,o.length),0,'pos')}}catch(e){}});
/* 0.5: ordem fixa das abas de Investimentos: Resumo › Posição › Proventos › Análise */
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__seg05)return;L.__seg05=1;if(L.sg&&L.sg.inv)delete L.sg.inv}catch(e){}});
var MF_INV_SIM=['dv_proj','p_proj','p_metas','i_ap'];
/* 0.2: a aba "Simulação" acabou; tudo dela foi para "Análise" (modo 'fund'). 'sim' guardado de antes vira 'fund'.
   0.4: "Investimentos" passou a se chamar "Resumo" (modo 'carteira') e nasceu "Posição" (modo 'pos'), só com o bloco "Meus ativos". */
/* 1.15: o Simulador de aporte (dv_sim) mora em Posição */
var MF_INV_POS=['i_cls','dv_tab','i_vendas','dv_sim'];
/* Nova organização · Patrimônio: Resumo | Patrimônio (bens) | Investimentos | Metas; Investimentos tem por dentro
   Posição | Proventos | Análises | Radar (barra própria .mf-iseg, fora de .mf-seg: o gesto de arrastar só troca as do alto). window.__invMode guarda uma das 7 telas;
   o que era Resumo de investimentos ('carteira') junta com Posição. As telas de dentro de Investimentos usam as chaves de antes. */
var MF_INV_TOPS=['resumo','bens','metas'],MF_INV_SUBS=['pos','meus','prov','fund','radar'];
/* celular: a página Posição (botão ao lado de Proventos) mostra "Meus ativos"; a tela inicial (modo 'pos') fica sem esse bloco. No computador não existe. */
var MF_INV_MEUS=['i_cls'];
var MF_INV_METAS=['s_magico','i_reserva','p_metas','i_ap'];
function mfInvModeOf(m){if(m==='bens'&&!(window.mfIsDesk&&mfIsDesk()))return 'resumo'; /* 2.5: no celular Patrimônio é só investimentos (a subaba Patrimônio/bens saiu; os dados ficam guardados) */ if(m==='radar'&&window.mfIsDesk&&mfIsDesk())return 'pos';if(m==='meus'&&window.mfIsDesk&&mfIsDesk())return 'resumo'; /* 'meus' só existe no celular; no computador é tratado como qualquer modo desconhecido (igual a antes) */return MF_INV_TOPS.includes(m)||MF_INV_SUBS.includes(m)?m:m==='sim'?'fund':m==='carteira'?'pos':m==='inv'?((window.mfSegList&&(mfSegList('invs')[0]||[])[0])||'pos') /* 2.9: Investimentos abre sempre na 1ª subaba (não lembra a última) */:'resumo'}
function mfInvMode(){return mfInvModeOf(window.__invMode)}
function mfInvTop(m){m=m||mfInvMode();return MF_INV_SUBS.includes(m)?'inv':m}
/* 2.1: Investimentos abre em página própria: título "Investimentos", botão Voltar no lugar da foto e UMA barra só (Posição | Proventos | Análises | Radar). */
function mfInvPag(){let t;try{t=tab}catch(_){return false}return t==='inv'&&MF_INV_SUBS.includes(mfInvMode())}
/* 1.9: ao abrir Contas ou Investimentos pela barra (vindo de outra aba), volta para "Geral" / "Resumo" (Patrimônio › Resumo)
   Nova organização: Lançamentos volta para "Início" (vale também para os botões de aba dentro da tela, como "Ver em Lançamentos") */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('nav#nv button[data-tab],#app [data-tab]');if(!b)return;const t=b.dataset.tab;let cur;try{cur=tab}catch(_){return}if(t===cur)return;if(t==='mais')window.__ctMode=mfCtBase();else if(t==='inv')window.__invMode='resumo';else if(t==='add')mfAddInicio()},true);
function mfInvSeg(){return mfInvPag()?mfSeg('data-invmode',mfInvMode(),mfSegList('invs')):mfSeg('data-invmode',mfInvTop(),mfSegList('inv'))}
try{const m=localStorage.getItem('fin1_invmode');if(m)window.__invMode=m}catch(_){}
MF_TOPSEG.inv=()=>mfInvSeg();
function mfPickBlocks(html,keep){const p=String(html).split(/<!--b:([\w~]+)-->/);let out=p[0];for(let i=1;i<p.length;i+=2)if(keep(p[i]))out+='<!--b:'+p[i]+'-->'+p[i+1];return out}
/* Contas por modo; 'all' = tudo (blocos movidos para outra aba e Configurações › Personalizar telas)
   Nova organização: Cartão ('contas') = cartão + Parcelamentos + Tetos por categoria (a 50/30/20 voltou para o Dashboard na etapa 3);
   Compromissos ('venc') = o que vence no mês; Dívidas ('div') e Situação ('sit') em js/45. 2.1: a subaba Simular saiu (o Simulador de gastos continua em Lançamentos › Diário).
   Recorrentes, Lista de compras, Compras do mês e o Simulador de gastos foram para Lançamentos (mesmos blocos, mesmos dados). */
function mfCtHtml(m){let h='';
 if(m==='contas'||m==='all')h+=plCardBillingHtml()+mfParcHtml()+(window.mfTetoBlk?mfTetoBlk():'')+dashboardCalendar()+mfDiarioHtml();
 if(m==='venc'||m==='all')h+=B('p_venc')+dashboardDueCenter();
 if(m==='div'||m==='all')h+=window.mfDivHtml?mfDivHtml():'';
 if(m==='sit'||m==='all')h+=window.mfSitHtml?mfSitHtml():'';
 if(m==='home')h+=plCardBillingHtml()+(window.mfSitHtml?mfSitHtml():''); /* 3.24: página inicial de Contas no celular = resumo do cartão + situação (cartão, compromissos, dívidas) */
 /* o Simulador de gastos (p_gasto) aparece aqui e em Lançamentos › Diário: é o mesmo bloco, com os mesmos dados (S.plan) */
 /* fxEnsure antes de plEnsure: S.fixed nasce antes de S.plan, como sempre foi (o estado salvo no Supabase segue igual, teste 27) */
 return `<div class=planning-page>${h}</div>`}
/* Nova organização · Lançamentos por modo: Início (Novo lançamento, Lançamentos do mês) | Lista (Lista de compras, Recorrentes) |
   Diário (simulador Diário da 1.14 + Simulador de gastos) | Resumo (Compras do mês, com as compras repetidas). Editando um lançamento, fica sempre em Início. */
var MF_ADD_MODES=['inicio','lista','diario','rec','gasto']; /* 2.7: cada subaba mostra um assunto só (Lista = compras, Diário = diário, Recorrentes, Gastos = simulador de gastos) */
function mfAddMode(){if(typeof F!=='undefined'&&F&&F.id)return 'inicio';const m=window.__addMode;if(!(window.mfIsDesk&&mfIsDesk())){if(m==='diario')return 'inicio';if(m==='gasto')return 'rec'} /* 2.9: no celular o Diário virou o bloco "Simular gastos diário" */return MF_ADD_MODES.includes(m)?m:'inicio'}
function mfAddInicio(){window.__addMode='inicio';try{localStorage.setItem('fin1_addmode','inicio')}catch(_){}}
function mfAddSeg(){return mfSeg('data-addmode',mfAddMode(),mfSegList('add'))}
MF_TOPSEG.add=()=>mfAddSeg();
try{const m=localStorage.getItem('fin1_addmode');if(m)window.__addMode=m}catch(_){}
function mfAddHtml(m){const all=m==='all';let h='';
 if(m==='inicio'||all)h+=vAdd()+vExtrato();
 const D=!!(window.mfIsDesk&&mfIsDesk()); /* computador mantém Lista (compras + recorrentes) e Diário (diário + gastos) como antes */
 const FX=()=>fixedHtml().replace('<!--b:ext_fixos-->','<!--b:p_fixos-->'),GS=()=>plGastoHtml(plEnsure());
 if(m==='lista'||all)h+=B('p_shop')+mfShopHtml()+(D&&!all?FX():'');
 if(m==='rec'||all)h+=FX()+(!D&&!all?GS():''); /* 0.1: celular — Recorrentes + Simulador de gastos */
 if(m==='diario'||all)h+=(window.mfDiarioSimHtml?mfDiarioSimHtml():'')+(D&&!all?GS():'');
 if(m==='gasto'||all)h+=GS();
 if(m==='resumo'||all)h+=mfCmpHtml();
 return h}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-addmode]');if(!b)return;e.preventDefault();e.stopPropagation();window.__addMode=MF_ADD_MODES.includes(b.dataset.addmode)?b.dataset.addmode:'inicio';try{localStorage.setItem('fin1_addmode',window.__addMode)}catch(_){}window.__mfLastTab=null;draw();scrollTo(0,0)},true);
/* Nova organização · migração única, sem apagar nada: os blocos que saíram de Contas continuam onde a pessoa tinha posto.
   Se um deles tinha sido movido de Contas para outra aba, agora a "aba de origem" é Lançamentos (se foi movido para Lançamentos, volta a ser dele).
   Recorrentes entra logo depois do Novo lançamento em quem já tinha mudado a ordem dos blocos de Lançamentos. Cada aparelho tem a sua.
   Os botões Compras, Simular e Diário saem do alto de Planejamento (o simulador Diário da 1.14 mora em Lançamentos › Diário). */
/* Recorrentes (S.fixed) e o Simulador de gastos (S.plan) nasciam quando Contas era desenhada (o Dashboard desenha Contas por trás por causa do
   Calendário movido). Agora estão em Lançamentos; para o estado salvo continuar igual ao de antes (mesmos campos, na mesma ordem),
   os dois são garantidos ao fim de todo desenho. */
window.__mfAD.push(function(){try{fxEnsure();plEnsure()}catch(e){}});
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});
 const SAI=['compras','sim','diario'],g=L.sg&&L.sg.mais;if(Array.isArray(g)&&g.some(k=>SAI.includes(k)))L.sg.mais=g.filter(k=>!SAI.includes(k));
 /* blocos adicionados (S.lay.wg vale para os dois aparelhos): os que moravam em Compras, Simular ou Diário vão para a subaba nova em Lançamentos */
 const W=L.wg;if(W&&Array.isArray(W.mais)&&W.mais.some(x=>x&&SAI.includes(x.s))){const SUB={compras:'lista',sim:'diario',diario:'diario'},vai=W.mais.filter(x=>x&&SAI.includes(x.s));
  W.mais=W.mais.filter(x=>!vai.includes(x));W.add=(Array.isArray(W.add)?W.add:[]).concat(vai.map(x=>Object.assign({},x,{s:SUB[x.s]})))}
 if(L.__lc113)return;L.__lc113=1;
 const M=L.mvt;if(M&&typeof M==='object')['p_fixos','p_shop','p_cmpg','p_gasto','p_dsim'].forEach(id=>{const m=M[id];if(m&&m.f==='mais'){if(m.t==='add')delete M[id];else m.f='add'}});
 const o=L.o&&L.o.add;if(Array.isArray(o)&&!o.includes('p_fixos')){const i=o.indexOf('form');o.splice(i>=0?i+1:0,0,'p_fixos')}
 if(SAI.includes(window.__ctMode))window.__ctMode='contas';
 save()}catch(e){console.warn('Lançamentos (nova organização)',e)}});
/* Nova organização · etapa 3: a Distribuição 50/30/20 volta para o Dashboard (depois do Calendário); leva junto quem já tinha mudado a ordem ou movido o bloco */
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__bg113)return;L.__bg113=1;
 const M=L.mvt;if(M&&typeof M==='object'){const m=M.budgetalerts;if(m&&m.f==='mais'){if(m.t==='res')delete M.budgetalerts;else m.f='res'}}
 const o=L.o;if(o&&typeof o==='object'){if(Array.isArray(o.mais)){const i=o.mais.indexOf('budgetalerts');if(i>=0)o.mais.splice(i,1)}
  if(Array.isArray(o.res)&&!o.res.includes('budgetalerts')){const c=o.res.indexOf('calendar'),f=o.res.indexOf('cashflow');o.res.splice(c>=0?c+1:f>=0?f:o.res.length,0,'budgetalerts')}}
 save()}catch(e){console.warn('50/30/20 no Dashboard (nova organização)',e)}});
function viewFor(k){const own=k===tab&&!window.__mfAllModes;
 if(k==='mais')return ()=>mfCtHtml(own?mfCtMode():'all');
 if(k==='add')return ()=>mfAddHtml(own?mfAddMode():'all');
 if(k==='inv')return ()=>{if(own&&mfInvMode()==='radar'&&window.mfRadarHtml)return mfRadarHtml();const h=vInv()+(window.mfProvBlock?mfProvBlock():'')+(window.mfOscBlock?mfOscBlock():'')+(window.mfPyldHtml?mfPyldHtml()+mfPvExtraHtml()+mfPanoHtml():'')+(window.mfVendasHtml?mfVendasHtml():'')+(window.mfInvExtraHtml?mfInvExtraHtml():'')+(window.mfFundHtml?mfFundHtml():'')+(window.mfPatHtml?mfPatHtml()+mfBensHtml():'');if(!own)return h;const md=mfInvMode(),P=window.MF_INV_PROV||[],F=window.MF_INV_FUND||[],NOVO=['p_pat','p_bens'];
  /* Posição = o que era o Resumo de investimentos (Patrimônio total, Distribuição) + Meus ativos e o Simulador de aporte */
  const resto=b=>!MF_INV_SIM.includes(b)&&!P.includes(b)&&!F.includes(b)&&!MF_INV_POS.includes(b)&&!MF_INV_METAS.includes(b)&&!NOVO.includes(b);
  const pk=mfPickBlocks(h,id=>{const b=mfBase(id);if((window.MF_INV_GONE||[]).includes(b))return false;return md==='resumo'?b==='p_pat':md==='bens'?b==='p_bens':md==='metas'?MF_INV_METAS.includes(b):md==='meus'?MF_INV_MEUS.includes(b):md==='pos'?((MF_INV_POS.includes(b)||resto(b))&&!(MF_INV_MEUS.includes(b)&&!(window.mfIsDesk&&mfIsDesk()))):md==='prov'?P.includes(b):md==='fund'?(F.includes(b)||(MF_INV_SIM.includes(b)&&!MF_INV_METAS.includes(b))):false});
  return pk};
 return {res:vResumo,anal:vAnalises}[k]}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-invmode]');if(!b)return;e.preventDefault();e.stopPropagation();const de=mfInvMode();window.__invMode=mfInvModeOf(b.dataset.invmode);if(MF_INV_SUBS.includes(window.__invMode)){window.__invSubLast=window.__invMode;if(MF_INV_TOPS.includes(de))window.__invBack=de}try{localStorage.setItem('fin1_invmode',window.__invMode)}catch(_){}window.__mfLastTab=null;draw();scrollTo(0,0)},true);
/* Voltar da página Investimentos para a tela de Patrimônio de onde a pessoa veio */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-invback]');if(!b)return;e.preventDefault();e.stopPropagation();window.__invMode=MF_INV_TOPS.includes(window.__invBack)?window.__invBack:'resumo';try{localStorage.setItem('fin1_invmode',window.__invMode)}catch(_){}window.__mfLastTab=null;draw();scrollTo(0,0)},true);
/* (a barra de dentro de Investimentos usa o mesmo data-invmode; lembra a última para o botão "Investimentos" voltar nela) */
/* Nova organização · Patrimônio: migração sem apagar nada.
   - A ordem dos botões do alto (S.lay.sg.inv, vale para os dois aparelhos) era de Resumo/Posição/Proventos/Análise: volta ao padrão novo.
   - Blocos adicionados (S.lay.wg.inv) que moravam em Posição, Proventos ou Análise vão para Investimentos; os do antigo Resumo ficam no Resumo.
   As duas partes só agem quando acham chave antiga, então rodar de novo não muda nada. */
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={}),VELHO=['carteira','pos','prov','fund','sim'];
 const g=L.sg&&L.sg.inv;if(Array.isArray(g)&&g.some(k=>VELHO.includes(k)))delete L.sg.inv;
 /* 3.20: esta parte roda UMA vez (flag L.wgPg). Antes rodava a cada abertura e apagaria a página de cada bloco (Posição, Proventos, Análises, Radar) que o js/84 passou a guardar. */
 const W=L.wg;if(!L.wgPg){if(W&&Array.isArray(W.inv))W.inv.forEach(x=>{if(x&&VELHO.includes(x.s))x.s='inv'});L.wgPg=1}
}catch(e){console.warn('Patrimônio (nova organização)',e)}});
/* Compras: parcelamentos (compras parceladas, parcela atual, quanto falta) */
function mfParcList(){const G={};S.tx.forEach(t=>{if(t&&t.installmentId&&+t.installmentCount>1&&t.d&&!isInvoicePayment(t))(G[t.installmentId]=G[t.installmentId]||[]).push(t)});
 return Object.keys(G).map(id=>{const r=G[id].slice().sort((a,b)=>(+a.installmentIndex||0)-(+b.installmentIndex||0)||a.d.localeCompare(b.d)),cred=r[0].t==='Crédito',due=t=>cred?invoiceDueDate(t):t.d,
  n=Math.max(+r[0].installmentCount||0,r.length),tot=r.reduce((s,t)=>s+txValue(t),0),done=r.filter(t=>due(t)<TD),rest=r.filter(t=>due(t)>=TD),left=rest.reduce((s,t)=>s+txValue(t),0),nx=rest[0],cm=TD.slice(0,7),mon=r.filter(t=>due(t).slice(0,7)===cm).reduce((s,t)=>s+txValue(t),0);
  return {id,name:String(r[0].n||'Compra').replace(/\s*\(\d+\/\d+\)\s*$/,''),cred,n,tot,paid:done.length,left,mon,parc:txValue(nx||r[r.length-1]),next:nx?due(nx):'',first:r[0].d,cat:r[0].s||inferSub(r[0].c)||r[0].c||''}}).sort((a,b)=>(a.next||'9999')<(b.next||'9999')?-1:(a.next||'9999')>(b.next||'9999')?1:b.tot-a.tot)}
function mfParcHtml(){const L=mfParcList(),act=L.filter(x=>x.left>0.005),fin=L.filter(x=>x.left<=0.005),left=act.reduce((s,x)=>s+x.left,0),cm=TD.slice(0,7),mon=L.reduce((s,x)=>s+x.mon,0);
 const row=x=>`<div class="mf-pc"><div class="mf-pc-t"><b>${escH(x.name)}</b><b>${R(x.parc)}<small>/mês</small></b></div><div class="mf-pc-bar"><i style="width:${(x.paid/x.n*100).toFixed(1)}%"></i></div><div class="mf-pc-s"><span>${x.left>0.005?`Parcela ${Math.min(x.n,x.paid+1)} de ${x.n}${x.next?` · próxima ${mfMs(x.next.slice(0,7))}`:''}`:`${x.n} de ${x.n} pagas`}${x.cred?' · cartão':''}</span><span>${x.left>0.005?`Falta <b>${R(x.left)}</b>`:`Total <b>${R(x.tot)}</b>`}</span></div></div>`;
 return B('p_parc')+`<section class="c mf-parc"><h2>Parcelamentos</h2>${act.length?`<div class="mf-pc-sum"><div><small>Falta pagar</small><b>${R(left)}</b></div><div><small>Parcelas em ${mfMs(cm)}</small><b>${R(mon)}</b></div></div>${act.map(row).join('')}`:'<p class="mf-empty">Nenhuma compra parcelada em andamento.</p>'}
 ${fin.length?`<details class="mf-pc-fin"><summary>Quitados (${fin.length})</summary>${fin.map(row).join('')}</details>`:''}
 <button type="button" class="mf-pc-new" data-parcnew="1">＋ Registrar compra parcelada</button></section>`}
/* registrar compra: usa o formulário de lançamento que já existe (crédito, 2 parcelas) */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-parcnew]');if(!b)return;e.preventDefault();e.stopPropagation();
 F.id=null;F.v=F.dt=F.n=null;if(F.c==='Receita'||F.c==='Investimento'){F.c='Lazer e Pessoal';F.s='Variáveis';F.g=inferMain(F.c,F.s)}F.t='Crédito';F.installmentCount=2;F.showPay=false;
 tab='add';ym=TD.slice(0,7);mfAddInicio();window.__mfLastTab=null;draw();scrollTo(0,0);setTimeout(()=>{const i=document.getElementById('fv');if(i){try{i.focus({preventScroll:true})}catch(_){i.focus()}}},120)},true);
/* PC: no modo Simulação o simulador de aporte ocupa a largura toda (sem buraco ao lado) */
var MF_DVSIM0=MF_DWIDE.includes('dv_sim');