

/* ---- 2) Investimentos › Proventos: card de patrimônio + yield, Proventos e "ano a ano" ---- */
var MF_INV_PROV=['i_pyld','i_prov','i_pvativo','i_pvcal','i_pano'];
/* ===== Investimentos 1.15: carteira x CDI x Ibovespa, setores, gráfico e histórico do ativo,
   meta de renda passiva, previsão, data com, yield sobre o preço pago, reinvestir, com e sem reinvestir, número mágico (a "Bola de neve" saiu na 0.4) ===== */
var MF_INV_EXTRA_C=['i_evo','i_dest','i_setor'],MF_INV_EXTRA_P=['i_pvprev','i_pvcom','i_pvyoc','i_pvreinv'],MF_INV_EXTRA_S=['s_reinv','s_magico'];
MF_INV_PROV.push(...MF_INV_EXTRA_P,'i_ivtop','i_ivevo','i_ivativo','i_ivmeus');MF_INV_SIM.push('s_reinv');
/* 0.5: o Número mágico passou para o Resumo (modo 'carteira'); estes blocos saíram das abas de Investimentos */
/* 1.15: 'i_osc' (Desempenho da carteira) saiu da tela a pedido do usuário; o código continua */
var MF_INV_GONE=['i_evo','i_dest','i_pvcal','i_pvreinv','dv_proj','p_proj','i_osc'];
const mfPct=(v,d=1)=>v==null||!isFinite(v)?'—':(v>=0?'+':'−')+Math.abs(v).toFixed(d).replace('.',',')+'%';
const mfPc0=(v,d=2)=>v==null||!isFinite(v)?'—':v.toFixed(d).replace('.',',')+'%';
/* ---- dados de mercado (função mercado do Supabase), guardados no aparelho por um dia ---- */
function mfMkt(){try{const c=JSON.parse(localStorage.getItem('fin1_mkt')||'null');return c&&c.d?c:null}catch(e){return null}}
function mfMktLoad(){const H=mfHeld().map(x=>x.tk).sort(),key=H.join(','),c=mfMkt();
 if(!H.length||typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser||!navigator.onLine)return;
 if(c&&c.at===TD&&c.k===key)return;if(window.__mktBusy||(window.__mktTry&&Date.now()-window.__mktTry<300000))return;window.__mktBusy=1;window.__mktTry=Date.now();
 MF_DB.quotes.market({body:{tickers:H}}).then(({data,error})=>{window.__mktBusy=0;if(error||!data||!data.mensal)return;try{localStorage.setItem('fin1_mkt',JSON.stringify({at:TD,k:key,d:data}))}catch(_){}if(tab==='inv')mfDrawLater()},()=>{window.__mktBusy=0})}
(window.__mfAD=window.__mfAD||[]).push(()=>{try{if(tab==='inv')mfMktLoad()}catch(e){}});
const mfSvgLines=(series,opt)=>{/* series: [{pts:[[x,y]], cor, tr}] x de 0..1 */const W=300,Hh=opt&&opt.h||110,pad=6,all=series.flatMap(s=>s.pts.map(p=>p[1])).concat(opt&&opt.ref!=null?[opt.ref]:[]);if(!all.length)return '';
 let lo=Math.min(...all),hi=Math.max(...all);if(hi-lo<1e-9){hi+=1;lo-=1}const X=x=>pad+x*(W-2*pad),Y=y=>Hh-pad-(y-lo)/(hi-lo)*(Hh-2*pad);
 const ref=opt&&opt.ref!=null?`<line x1="${pad}" x2="${W-pad}" y1="${Y(opt.ref).toFixed(1)}" y2="${Y(opt.ref).toFixed(1)}" stroke="var(--mu)" stroke-width="1" stroke-dasharray="4 4" opacity=".8"/>`:'';
 return `<svg class="mf-lines" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" role="img" aria-label="${escH(opt&&opt.label||'Gráfico')}">${ref}${series.map(s=>`<polyline fill="none" stroke="${s.cor}" stroke-width="${s.w||2.2}" stroke-linejoin="round" stroke-linecap="round" ${s.tr?'stroke-dasharray="5 4"':''} points="${s.pts.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' ')}"/>`).join('')}</svg>`};
const mfLeg=it=>`<div class="mf-leg2">${it.map(([c,t,v,cls])=>`<span><i style="background:${c}"></i>${t}${v!=null?` <b class="${cls||''}">${v}</b>`:''}</span>`).join('')}</div>`;

/* ---- 1) Carteira x CDI x Ibovespa (12 meses, com as cotas de hoje) ---- */
function mfBenchBody(per){const c=mfMkt(),d=c&&c.d,H=mfHeld();if(!H.length)return '<p class="mf-empty">Cadastre ações, FIIs ou ETFs para comparar com o CDI e o Ibovespa.</p>';
 const head='';
 if(!d)return `<p class="mf-empty">Buscando o histórico do mercado…</p>`;
 const ct=mfChart('i_osc','area')==='barras'?'barras':'linha',vC=mfView('i_osc','cdi',true),vI=mfView('i_osc','ibov',true);
 const cur=TD.slice(0,7),ks=Array.from({length:per+1},(_,i)=>nm(cur,i-per)),serie=arr=>{const m=new Map(arr||[]);let last=null;return ks.map(k=>{if(m.has(k))last=m.get(k);return last})};
 const vars=H.map(x=>({x,s:serie((d.mensal||{})[x.tk])})).filter(o=>o.s[0]!=null),fix=(S.inv||[]).filter(a=>a.f).reduce((s,a)=>s+ivNow(a),0);
 const cdiM=new Map(d.cdi||[]),cdiIdx=[1];for(let i=1;i<ks.length;i++)cdiIdx.push(cdiIdx[i-1]*(1+(cdiM.get(ks[i])||0)/100));
 const fixAt=i=>fix*cdiIdx[i]/cdiIdx[ks.length-1];
 const cart=ks.map((k,i)=>vars.reduce((s,o)=>s+o.x.q*(i===ks.length-1&&o.x.p?o.x.p:o.s[i]),0)+fixAt(i));
 const ib=serie(d.ibov);if(!(cart[0]>0)||ib[0]==null)return `<p class="mf-empty">Sem histórico suficiente para ${per} meses ainda.</p>`;
 /* Rentabilidade da carteira = valorização das cotas + dividendos e JCP recebidos no período (Script 1 · 18).
    Assim a comparação com o CDI e o Ibovespa fica justa: os dois também rendem com juros/dividendos. */
 const PV=mfPvPeriodo(ks.slice(1));let acPv=0;
 const cartT=cart.map((v,i)=>{if(i>0)acPv+=PV.porMes.get(ks[i])||0;return v+acPv});
 const idx=a=>a.map(v=>v/a[0]*100),ci=idx(cartT),ii=idx(ib),cd=cdiIdx.map(v=>v*100),r=a=>a[a.length-1]-100;
 const pts=a=>a.map((v,i)=>[i/(a.length-1),v]);
 const base=cart[0],valR=cart[cart.length-1]-base,pctOf=v=>base>0?v/base*100:null;
 const comp=[['Valorização das cotas',valR,pctOf(valR)],['Dividendos recebidos',PV.div,pctOf(PV.div)],['JCP recebido',PV.jcp,pctOf(PV.jcp)]];
 const compHtml=`<div class="mf-bench-comp"><div class="mf-bc-h">Como foi formada a rentabilidade</div>${comp.map(([n,v,pc])=>`<div class="mf-bc-r"><span>${n}</span><b class="${v>0?'ok':v<0?'bad':'mu'}">${v<0?'−':''}${R(Math.abs(v))}</b><em class="${v>0?'ok':v<0?'bad':'mu'}">${mfPct(pc)}</em></div>`).join('')}<div class="mf-bc-r mf-bc-t"><span>Rentabilidade total</span><b class="${valR+PV.tot>=0?'ok':'bad'}">${valR+PV.tot<0?'−':''}${R(Math.abs(valR+PV.tot))}</b><em class="${valR+PV.tot>=0?'ok':'bad'}">${mfPct(pctOf(valR+PV.tot))}</em></div></div>`;
 const L=[['Sua carteira',r(ci),'var(--tx)',ci,2.6]].concat(vC?[['CDI',r(cd),'#22c55e',cd,1.8]]:[],vI?[['Ibovespa',r(ii),'#7cc4fa',ii,1.8]]:[]),best=L.slice().sort((a,b)=>b[1]-a[1])[0][0];
 const graf=ct==='barras'?(()=>{const mx=Math.max(...L.map(x=>Math.abs(x[1])),0.01);return `<div class="mf-hbars mf-bench-b">${L.map(([n,v,c])=>`<div><span>${n}</span><i><b style="width:${(Math.abs(v)/mx*100).toFixed(1)}%;background:${v<0?'var(--bad)':c}"></b></i><em class="${v>=0?'ok':'bad'}">${mfPct(v)}</em></div>`).join('')}</div>`})()
  :mfSvgLines(L.slice().reverse().map(([n,v,c,a,w])=>({pts:pts(a),cor:c,w})),{ref:100,label:`Carteira, CDI e Ibovespa em ${per} meses`});
 return `<p class="mf-cmp mf-bench-per">Carteira x CDI x Ibovespa · últimos ${per} meses · ${MES[+ks[0].slice(5)-1]}/${ks[0].slice(2,4)} a ${MES[+cur.slice(5)-1]}/${cur.slice(2,4)}</p>
 ${ct==='barras'?'':mfLeg(L.map(([n,v,c])=>[c,n,mfPct(v),v>=0?'ok':'bad']))}${graf}${compHtml}
 <p class="mf-cmp mf-bench-note">${L.length<2?'':best==='Sua carteira'?`Sua carteira foi a melhor${L.length===3?' das três':''}.`:`O melhor no período foi o ${best}.`} Conta com as cotas que você tem hoje (sem aportes e vendas) mais os dividendos e o JCP recebidos no período; a renda fixa segue o CDI. Proventos entram aqui na rentabilidade, não no saldo do app.</p>`}


/* ---- 1.19: Evolução do patrimônio (fim de cada mês, Supabase › patrimonio_mensal, + hoje) ---- */
function mfEvoHtml(){const o=anPatLoad(),now=anPatNow();if(!(now.v>0))return '';const cur=TD.slice(0,7);
 const L=(o.rows||[]).filter(r=>r.mes<cur).map(r=>({k:r.mes,v:+r.valor||0,a:+r.aplicado||0}));L.push({k:cur,v:now.v,a:now.c});
 const p=mfView('i_evo','per','12'),n=p==='tudo'?L.length:Math.min(L.length,+p||12),E=L.slice(-n),f0=E[0],l0=E[E.length-1],gan=l0.v-l0.a,gpc=l0.a>0?gan/l0.a*100:null;
 const names=E.map(x=>MES[+x.k.slice(5)-1]+(E.length>12&&x.k.slice(5)==='01'?'/'+x.k.slice(2,4):'')),ct=mfChart('i_evo','linha');
 const graf=E.length>=2?mfSeriesView(names,[{vals:E.map(x=>x.a),color:'#8e8e93',dash:'4 4',w:1.8},{vals:E.map(x=>x.v),color:'#5fbf77',fill:true}],ct,{every:E.length>12?3:E.length>6?2:1,aria:'Patrimônio e valor aplicado por mês'})+mfKeys([['Patrimônio','#5fbf77'],['Total aplicado','#8e8e93',1]])
  :`<p class="mf-empty">O app guarda o patrimônio no fim de cada mês. O gráfico vai crescendo mês a mês.</p>`;
 return B('i_evo')+`<section class="c mf-evo"><h2>Evolução do patrimônio</h2>${anKpis([['Patrimônio hoje',R(l0.v),''],['Total aplicado',R(l0.a),''],['Ganho',`${gan>=0?'+':'−'}${R(Math.abs(gan))}`,gan>=0?'ok':'bad',gpc!=null?`<small class="${gan>=0?'ok':'bad'}">${ivSp(gpc)}</small>`:'']])}${graf}
 ${E.length>=2&&f0.v>0?`<p class="mf-cmp mf-evo-note">Desde ${MESF[+f0.k.slice(5)-1].toLowerCase()}/${f0.k.slice(2,4)} o patrimônio ${l0.v>=f0.v?'cresceu':'caiu'} ${ivSp((l0.v/f0.v-1)*100).replace(/^[+−]/,'')} (aportes + valorização).</p>`:''}</section>`}
/* ---- 1.19: Destaques do mês (variação desde o fechamento do mês passado, maior peso e melhor resultado) ---- */
function mfDestHtml(){const I=(S.inv||[]).filter(a=>ivNow(a)>0);if(!I.length)return '';const tot=I.reduce((s,a)=>s+ivNow(a),0),mk=mfMkt(),d=mk&&mk.d,pk=nm(TD.slice(0,7),-1);
 const mov=mfHeld().filter(x=>x.p>0).map(x=>{const s=d&&d.mensal&&d.mensal[x.tk],m=s&&s.find(r=>r[0]===pk);return m&&m[1]>0?{n:x.tk,pc:(x.p/m[1]-1)*100}:null}).filter(Boolean).sort((a,b)=>b.pc-a.pc);
 const up=mov[0],dn=mov.length>1?mov[mov.length-1]:null,big=I.map(a=>({n:String(a.a),v:ivNow(a)})).sort((a,b)=>b.v-a.v)[0];
 const G=I.filter(a=>ivHasGain(a)).map(a=>({n:String(a.a),g:ivGain(a),pc:ivPct(a)})).sort((a,b)=>b.g-a.g),best=G[0];
 const tile=(cls,lb,n,v,c)=>`<div class="mf-dest-t ${cls}"><small>${lb}</small><b>${escH(n)}</b><span class="${c||''}">${v}</span></div>`;
 return B('i_dest')+`<section class="c mf-dest"><h2>Destaques do mês</h2><div class="mf-dest-g">
  ${tile('mf-dest-up','Mais subiu no mês',up?up.n:'—',up?mfPct(up.pc):(mk?'sem dados':'buscando…'),up?(up.pc>=0?'ok':'bad'):'mu')}
  ${tile('mf-dest-dn',dn&&dn.pc<0?'Mais caiu no mês':'Menor alta no mês',dn?dn.n:'—',dn?mfPct(dn.pc):'—',dn?(dn.pc>=0?'ok':'bad'):'mu')}
  ${tile('mf-dest-pe','Maior peso na carteira',big.n,Math.round(big.v/tot*100)+'% · '+R(big.v),'')}
  ${tile('mf-dest-be','Melhor resultado',best?best.n:'—',best?`${ivSg(best.g)} (${ivSp(best.pc)})`:'sem cotações',best?(best.g>=0?'ok':'bad'):'mu')}
 </div><p class="mf-cmp mf-dest-note">"No mês" compara a cotação de hoje com o fechamento de ${MESF[+pk.slice(5)-1].toLowerCase()}.</p></section>`}
/* ---- 2) Distribuição por setor ---- */
var MF_SETOR_MAP={BBAS3:'Bancos',ITUB3:'Bancos',ITUB4:'Bancos',BBDC3:'Bancos',BBDC4:'Bancos',SANB11:'Bancos',BPAC11:'Bancos',BRBI11:'Bancos',ITSA4:'Bancos',ABCB4:'Bancos',BBSE3:'Seguros',CXSE3:'Seguros',PSSA3:'Seguros',IRBR3:'Seguros',
 TAEE3:'Energia',TAEE4:'Energia',TAEE11:'Energia',ISAE4:'Energia',TRPL4:'Energia',EGIE3:'Energia',CMIG3:'Energia',CMIG4:'Energia',CPLE3:'Energia',CPLE6:'Energia',ELET3:'Energia',ELET6:'Energia',AXIA3:'Energia',AXIA6:'Energia',ENGI11:'Energia',EQTL3:'Energia',ALUP11:'Energia',CPFE3:'Energia',NEOE3:'Energia',AURE3:'Energia',
 SBSP3:'Saneamento',SAPR4:'Saneamento',SAPR11:'Saneamento',CSMG3:'Saneamento',PETR3:'Petróleo e gás',PETR4:'Petróleo e gás',PRIO3:'Petróleo e gás',RECV3:'Petróleo e gás',BRAV3:'Petróleo e gás',UGPA3:'Petróleo e gás',VBBR3:'Petróleo e gás',
 VALE3:'Mineração e siderurgia',GGBR4:'Mineração e siderurgia',GOAU4:'Mineração e siderurgia',CSNA3:'Mineração e siderurgia',USIM5:'Mineração e siderurgia',CMIN3:'Mineração e siderurgia',SUZB3:'Papel e celulose',KLBN11:'Papel e celulose',
 ALOS3:'Shoppings e imóveis',MULT3:'Shoppings e imóveis',IGTI11:'Shoppings e imóveis',CYRE3:'Shoppings e imóveis',WEGE3:'Indústria',EMBR3:'Indústria',ABEV3:'Consumo',MGLU3:'Varejo',LREN3:'Varejo',RADL3:'Saúde',RDOR3:'Saúde',HAPV3:'Saúde',VIVT3:'Telecom',TIMS3:'Telecom',RAIL3:'Transporte e logística',CCRO3:'Transporte e logística',
 GGRC11:'FII Logística',HGLG11:'FII Logística',BTLG11:'FII Logística',XPLG11:'FII Logística',VILG11:'FII Logística',MXRF11:'FII Papel',KNSC11:'FII Papel',VGIR11:'FII Papel',CPTS11:'FII Papel',KNCR11:'FII Papel',IRDM11:'FII Papel',KNIP11:'FII Papel',RECR11:'FII Papel',
 XPML11:'FII Shoppings',VISC11:'FII Shoppings',HGBS11:'FII Shoppings',HSML11:'FII Shoppings',GARE11:'FII Híbrido',KNRI11:'FII Híbrido',HGRU11:'FII Renda urbana',TRXF11:'FII Renda urbana'};
var MF_SETORES=['Bancos','Seguros','Energia','Saneamento','Petróleo e gás','Mineração e siderurgia','Papel e celulose','Shoppings e imóveis','Indústria','Consumo','Varejo','Saúde','Telecom','Transporte e logística','Tecnologia','Agro','FII Logística','FII Papel','FII Shoppings','FII Híbrido','FII Renda urbana','FII Lajes corporativas','ETF','Renda fixa','Outros'];
function mfSetorOf(a){const tk=String(a.a||'').toUpperCase(),o=(S.invSetor||{})[tk];if(o)return o;if(a.f||fcl(a)==='rf')return 'Renda fixa';if(fcl(a)==='etf')return 'ETF';return MF_SETOR_MAP[tk]||(fcl(a)==='fii'?'FII (outros)':'Outros')}
function mfSetorHtml(){const I=(S.inv||[]).filter(a=>ivNow(a)>0);if(!I.length)return '';const m=new Map();I.forEach(a=>{const k=mfSetorOf(a);m.set(k,(m.get(k)||0)+ivNow(a))});
 const tot=[...m.values()].reduce((s,v)=>s+v,0),ord=mfView('i_setor','ord','valor'),L=[...m.entries()].sort((a,b)=>ord==='nome'?a[0].localeCompare(b[0]):b[1]-a[1]),max=Math.max(...L.map(x=>x[1])),top=L.slice().sort((a,b)=>b[1]-a[1])[0];
 const ct=mfChart('i_setor','barras'),vl=mfView('i_setor','val','ambos'),pc=v=>mfPc0(v/tot*100,1);
 const graf=ct==='barras'?`<div class="mf-setor-l">${L.map(([k,v])=>`<div class="mf-setor-r"><div class="mf-setor-t"><span>${escH(k)}</span><b>${vl==='rs'?R(v):pc(v)}</b></div><i><b style="width:${(v/max*100).toFixed(1)}%"></b></i>${vl==='ambos'?`<small class="mu">${R(v)}</small>`:''}</div>`).join('')}</div>`
  :mfCatView(L.map(([k,v],i)=>({n:k,v,c:MF_PAL[i%MF_PAL.length]})),ct,{fmt:v=>vl==='pct'?pc(v):vl==='rs'?R(v):R(v)+' · '+pc(v),center:String(L.length),sub:L.length===1?'setor':'setores',cfs:18,aria:'Distribuição por setor'});
 return B('i_setor')+`<section class="c mf-setor"><h2>Distribuição por setor</h2>${graf}
 ${top[1]/tot>0.4?`<p class="mf-cmp mf-setor-al"><b class="wa">${escH(top[0])}</b> concentra ${mfPc0(top[1]/tot*100,0)} da carteira.</p>`:''}<button type="button" class="mfc-btn ghost mf-setor-ed" data-setored="1">Ajustar setores</button></section>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-setored]');if(!b)return;e.preventDefault();e.stopPropagation();
 const I=(S.inv||[]).filter(a=>ivNow(a)>0);mfConfirm({title:'Setor de cada ativo',ok:'Salvar',body:`<p class="mf-cf-sub">O app já sabe o setor dos ativos mais comuns. Ajuste se precisar.</p>${I.map(a=>{const tk=String(a.a).toUpperCase(),cur=mfSetorOf(a);return `<label class="mf-cf-f mf-setor-f"><small>${escH(a.a)}</small><select data-setortk="${escH(tk)}">${[...new Set(MF_SETORES.concat([cur]))].map(s=>`<option ${s===cur?'selected':''}>${escH(s)}</option>`).join('')}</select></label>`}).join('')}`,
  onOk:w=>{const o={};w.querySelectorAll('[data-setortk]').forEach(s=>{const tk=s.dataset.setortk,a=I.find(x=>String(x.a).toUpperCase()===tk),auto=(()=>{const sv=(S.invSetor||{})[tk];if(S.invSetor)delete S.invSetor[tk];const r=mfSetorOf(a);if(sv)S.invSetor[tk]=sv;return r})();if(s.value!==auto)o[tk]=s.value});S.invSetor=o;save();draw();mfToast('Setores salvos ✓')}})},true);

/* ---- 3) Card do ativo aberto: gráfico de 6 meses (com o preço médio) e histórico das compras ---- */
function mfDia(tk){try{const c=JSON.parse(localStorage.getItem('fin1_mkd_'+tk)||'null');return c&&c.at===TD?c.d:null}catch(e){return null}}
function mfDiaLoad(tk,el){if((window.__mkdBusy||{})[tk]||typeof supabaseClient==='undefined'||!supabaseClient||!authUser)return;(window.__mkdBusy=window.__mkdBusy||{})[tk]=1;
 MF_DB.quotes.market({body:{acao:'diario',tickers:[tk]}}).then(({data})=>{delete window.__mkdBusy[tk];const d=data&&Array.isArray(data.diario)?data.diario:[];try{localStorage.setItem('fin1_mkd_'+tk,JSON.stringify({at:TD,d}))}catch(_){}document.querySelectorAll(`.mf-iachart[data-tk="${tk}"]`).forEach(x=>{x.innerHTML=mfIaChart(tk)})},()=>{delete window.__mkdBusy[tk]})}
function mfIaChart(tk){const d0=mfDia(tk),a=(S.inv||[]).find(x=>!x.f&&String(x.a).toUpperCase()===tk);if(!d0)return '<p class="mf-cmp">Carregando o gráfico…</p>';if(d0.length<2)return '<p class="mf-cmp">Sem histórico de cotação para este ativo.</p>';
 const V=(S.view||{}).ia_card||{},per=[1,3,6].includes(+V.per)?+V.per:6,ct=V.ct==='barras'?'barras':'linha',cd=new Date(TD+'T12:00:00');cd.setMonth(cd.getMonth()-per);const cut=iso(cd);let d=d0.filter(p=>p[0]>=cut);if(d.length<2)d=d0;
 const ys=d.map(p=>p[1]),pm=+a.p||0,last=ys[ys.length-1],first=ys[0],mn=Math.min(...ys),mx=Math.max(...ys),pts=ys.map((v,i)=>[i/(ys.length-1),v]),lb=per===1?'1 mês':per+' meses';
 const seg=`<div class="mf-ia-seg">${[1,3,6].map(n=>`<button type="button" class="${n===per?'on':''}" data-iacard="per|${n}">${n===1?'1 mês':n+' meses'}</button>`).join('')}<i></i>${[['linha','Linha'],['barras','Barras']].map(([k,t])=>`<button type="button" class="${k===ct?'on':''}" data-iacard="ct|${k}">${t}</button>`).join('')}</div>`;
 const bars=()=>{const step=per===1?1:per===3?3:5,g=[];for(let i=0;i<ys.length;i+=step)g.push(ys[Math.min(ys.length-1,i+step-1)]);const lo=Math.min(...g,pm>0?pm:Infinity)*.985,hi=Math.max(...g,pm>0?pm:0)*1.005,W=300,Hh=90,n=g.length,sl=(W-8)/n,bw=Math.max(1.5,sl*.7),Y=v=>Hh-4-(v-lo)/((hi-lo)||1)*(Hh-8);
  return `<svg class="mf-lines" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" role="img" aria-label="Cotação em ${lb}">${pm>0?`<line x1="4" x2="${W-4}" y1="${Y(pm).toFixed(1)}" y2="${Y(pm).toFixed(1)}" stroke="var(--mu)" stroke-dasharray="4 4" opacity=".8"/>`:''}${g.map((v,i)=>`<rect x="${(4+sl*i+(sl-bw)/2).toFixed(1)}" y="${Y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1,Hh-4-Y(v)).toFixed(1)}" rx="1.5" fill="${pm>0&&v<pm?'#ef4444':'#22c55e'}" fill-opacity=".85"/>`).join('')}</svg>`};
 return `${seg}<div class="mf-ia-h"><small>${lb}</small><b class="${last>=first?'ok':'bad'}">${mfPct((last/first-1)*100)}</b></div>${ct==='barras'?bars():mfSvgLines([{pts,cor:last>=pm?'#22c55e':'#ef4444',w:2}],{ref:pm>0?pm:null,h:90,label:'Cotação em '+lb})}
 <div class="mf-ia-f"><span>Mín. ${R(mn)}</span>${pm>0?`<span class="mf-ia-pm">--- preço médio ${R(pm)}</span>`:''}<span>Máx. ${R(mx)}</span></div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-iacard]');if(!b)return;e.preventDefault();e.stopPropagation();const [k,v]=b.dataset.iacard.split('|');S.view=S.view||{};S.view.ia_card=Object.assign({},S.view.ia_card,{[k]:v});save();
 document.querySelectorAll('.mf-iachart[data-tk]').forEach(x=>{x.innerHTML=mfIaChart(x.dataset.tk)})},true);
function mfIaHist(a){let L=[];if(a.f){if(+a.cdbPrincipal>0)L.push({d:a.cdbDate||'',t:'Aplicação',v:+a.cdbPrincipal});(a.cdbAportes||[]).filter(x=>!/^adj_/.test(String(x.id||''))).forEach(x=>L.push({d:x.d||'',t:'Aporte',v:+x.v||0}));(a.cdbAportes||[]).filter(x=>/^adj_/.test(String(x.id||''))).forEach(x=>L.push({d:x.d||'',t:'Da conta',v:+x.v||0}));(a.cdbResgates||[]).forEach(x=>L.push({d:x.d||'',t:'Resgate',v:-(+x.v||0)}))}
 else (a.ops||[]).forEach(o=>L.push({d:o.d||'',t:+o.q<0?'Venda':'Compra',q:+o.q,p:+o.p,v:+o.v||((+o.q||0)*(+o.p||0))}));
 L=L.filter(x=>x.v).sort((x,y)=>x.d<y.d?1:-1);if(!L.length)return '<p class="mf-cmp">Nenhuma compra com data registrada. Use "+ Lançar" › aporte para registrar as próximas.</p>';
 const dm=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)?d.split('-').reverse().join('/'):'—';
 return `<div class="mf-ia-tl">${L.slice(0,12).map(x=>`<div class="mf-ia-ti"><i class="${x.v<0?'bad':'ok'}"></i><div><b>${x.t}${x.q?` · ${Math.abs(x.q).toLocaleString('pt-BR')} ${Math.abs(x.q)===1?'cota':'cotas'}`:''}</b><small class="mu">${dm(x.d)}${x.p?` · ${R(x.p)} por cota`:''}</small></div><b class="${x.v<0?'bad':''}">${x.v<0?'−':''}${R(Math.abs(x.v))}</b></div>`).join('')}</div>${L.length>12?`<p class="mf-cmp">+${L.length-12} mais antigos</p>`:''}`}
(window.__mfAD=window.__mfAD||[]).push(()=>{try{document.querySelectorAll('#app .mf-al-ed article.ia-card[data-invest-index]').forEach(c=>{if(c.querySelector('.mf-iax'))return;const a=(S.inv||[])[+c.dataset.investIndex];if(!a)return;const tk=String(a.a||'').toUpperCase();
 const meta=c.querySelector('.ia-meta')||c.querySelector('.iv-bar');const box=document.createElement('div');box.className='mf-iax';
 box.innerHTML=(!a.f&&/^[A-Z]{4}\d{1,2}$/.test(tk)?`<div class="mf-iachart" data-tk="${tk}">${mfIaChart(tk)}</div>`:'')+`<details class="mf-ia-hd"><summary>Histórico de ${a.f?'aplicações':'compras'}</summary>${mfIaHist(a)}</details>`;
 (meta?meta.after(box):c.prepend(box));if(!a.f&&/^[A-Z]{4}\d{1,2}$/.test(tk)&&!mfDia(tk))mfDiaLoad(tk)})}catch(e){}});

/* ---- Proventos: base comum ---- */
function mfPvBase(){const rec=mfProvAll().filter(t=>t&&t.d&&t.d<=TD&&mfIsProv(t)),k12=nm(TD.slice(0,7),-11),r12=rec.filter(t=>t.d.slice(0,7)>=k12),div12=r12.reduce((s,t)=>s+(+t.v||0),0),
 now=(S.inv||[]).reduce((s,a)=>s+ivNow(a),0),RV=(S.inv||[]).filter(a=>!a.f),nowRV=RV.reduce((s,a)=>s+ivNow(a),0),costRV=RV.reduce((s,a)=>s+ivCost(a),0),y=now>0?div12/now:0,dy=nowRV>0?div12/nowRV:0,by={};r12.forEach(t=>{const k=mfProvTk(t);if(k)by[k]=(by[k]||0)+(+t.v||0)});return {rec,r12,div12,now,nowRV,costRV,y,dy,by,m:div12/12}}
/* ---- 5) Dividendos nos últimos 12 meses (total, média, melhor mês, gráfico e divisão por tipo) ---- */
function mfPvPrevHtml(){const b=mfPvBase();if(!b.rec.length)return mfHeld().length?B('i_pvprev')+`<section class="c mf-pvx mf-pvprev"><h2>Dividendos nos últimos 12 meses</h2><p class="mf-empty">Os proventos que você receber aparecem aqui, mês a mês.</p></section>`:'';const p=+mfView('i_pvprev','per','12'),per=p===24?24:12,cur=TD.slice(0,7),k0=nm(cur,-(per-1)),R12=b.rec.filter(t=>t.d.slice(0,7)>=k0),tot=R12.reduce((s,t)=>s+(+t.v||0),0);
 const by={};R12.forEach(t=>{const k=t.d.slice(0,7);by[k]=(by[k]||0)+(+t.v||0)});const best=Object.entries(by).sort((a,c)=>c[1]-a[1])[0];
 const tps=[['Dividendos','#5fbf77'],['JCP','#f2c14e'],['Rendimentos (FII)','#7cc4fa']].map(([n,c])=>[n,c,R12.filter(t=>mfPvTipo(t)===n).reduce((s,t)=>s+(+t.v||0),0)]).filter(x=>x[2]>0);
 return B('i_pvprev')+`<section class="c mf-pvx mf-pvprev"><h2>Dividendos nos últimos ${per} meses</h2>${anKpis([['Total recebido',R(tot),'ok'],['Média por mês',R(tot/per),''],['Melhor mês',best?R(best[1]):'—','',best?`<small class="mu">${MESF[+best[0].slice(5)-1].toLowerCase()}/${best[0].slice(2,4)}</small>`:'']])}
 ${mfProvChart('i_pvprev')}${tps.length?`<div class="mf-pv12-tp">${tps.map(([n,c,v])=>`<span><i style="background:${c}"></i>${n}<b>${R(v)}</b><small>${(v/tot*100).toFixed(0)}%</small></span>`).join('')}</div>`:''}</section>`}
/* ---- 6) Próximos pagamentos: a próxima data de pagamento de cada ativo e quanto você vai receber ---- */
function mfPvComHtml(){const H=mfHeld();if(!H.length)return '';const mk=mfMkt(),qOf=tk=>(H.find(x=>x.tk===tk)||{}).q||0,tp=t=>/JCP/i.test(t||'')?'JCP':/RENDIMENTO/i.test(t||'')?'Rendimento':'Dividendo',dm=d=>d?d.slice(8,10)+'/'+d.slice(5,7):'—';
 const ev=[],seen=new Set(),add=(tk,pag,com,t,vc,v)=>{const k=tk+'|'+(pag||'c'+com)+'|'+t;if(seen.has(k)||!(v>0))return;seen.add(k);ev.push({tk,pag,com,t,vc,v})};
 ((window.__pva||{}).rows||[]).forEach(r=>{const pag=r.data_pagamento;if(!pag||pag<TD)return;add(String(r.ticker||'').toUpperCase(),pag,r.data_com||null,tp(r.tipo),+r.valor_cota||null,+r.total||0)});
 ((mk&&mk.d&&mk.d.proximos)||[]).forEach(p=>{const q=qOf(p.ticker);if(!(q>0)||(p.pag&&p.pag<TD))return;add(p.ticker,p.pag||null,p.com||null,tp(p.tipo),+p.valor,+p.valor*q)});
 const by={};ev.forEach(e=>{(by[e.tk]=by[e.tk]||[]).push(e)});
 const L0=Object.entries(by).map(([tk,a])=>{a.sort((x,y)=>(x.pag||'9'+x.com)<(y.pag||'9'+y.com)?-1:1);const d0=a[0].pag,mesmo=a.filter(x=>x.pag===d0&&(d0||x.com===a[0].com)),v=mesmo.reduce((s,x)=>s+x.v,0);
  return {tk,pag:d0,com:mesmo.map(x=>x.com).filter(Boolean).sort()[0]||null,tipos:[...new Set(mesmo.map(x=>x.t))].join(' + '),vc:mesmo.reduce((s,x)=>s+(x.vc||0),0),v,depois:a.length-mesmo.length,qt:qOf(tk)}}).sort((a,b)=>(a.pag||'9')<(b.pag||'9')?-1:1);
 const qC=mfView('i_pvcom','qtd','todas'),L=qC==='todas'?L0:L0.slice(0,+qC),tot=L0.reduce((s,x)=>s+x.v,0);
 return B('i_pvcom')+`<section class="c mf-pvx mf-pvcom"><h2>Próximos pagamentos</h2>${!L0.length?(mk||((window.__pva||{}).rows||[]).length?'<p class="mf-empty">Nenhum pagamento anunciado para os seus ativos agora.</p>':'<p class="mf-empty">Buscando os anúncios…</p>')
  :`<div class="mf-pvcom-tot"><span>A receber</span><b class="ok">${R(tot)}</b></div>
  ${L.map(x=>`<div class="mf-pvcom-r"><span class="mf-pvc-d"><b>${x.pag?+x.pag.slice(8):'?'}</b><small>${x.pag?MES[+x.pag.slice(5,7)-1]:'a definir'}</small></span><div class="mf-pvcom-m"><b>${escH(x.tk)}</b><small class="mu">${x.tipos}${x.depois?` · +${x.depois} depois`:''}</small><small class="mu mf-pvcom-det">${x.vc>0?`${R(x.vc)} por cota × ${x.qt.toLocaleString('pt-BR')}`:''}${x.com?`${x.vc>0?' · ':''}data com ${dm(x.com)}`:''}</small></div><b class="ok mf-pvcom-v">${R(x.v)}</b></div>`).join('')}${L0.length>L.length?`<p class="mf-cmp">+${L0.length-L.length} ${L0.length-L.length===1?'outro ativo':'outros ativos'}</p>`:''}`}</section>`}
/* ---- 7) Yield sobre o preço pago ---- */
function mfPvYocHtml(){const b=mfPvBase(),L=(S.inv||[]).filter(a=>!a.f).map(a=>{const tk=String(a.a).toUpperCase(),v=b.by[tk]||0,c=ivCost(a),n=ivNow(a);return {tk,v,yoc:c>0?v/c*100:null,atual:n>0?v/n*100:null}}).filter(x=>x.v>0).sort((x,y)=>(y.yoc||0)-(x.yoc||0));const oY=mfView('i_pvyoc','ord','pago');if(oY==='hoje')L.sort((x,y)=>(y.atual||0)-(x.atual||0));else if(oY==='nome')L.sort((x,y)=>x.tk.localeCompare(y.tk));
 if(!L.length)return '';const ctY=mfChart('i_pvyoc','tabela');return B('i_pvyoc')+`<section class="c mf-pvx"><h2>Yield sobre o preço pago</h2><p class="mf-cmp mf-pvyoc-exp">Quanto cada ativo rendeu em proventos nos últimos 12 meses sobre o que <b>você pagou</b>, comparado com o preço de hoje.</p>
 ${ctY==='barras'?(()=>{const mx=Math.max(...L.map(x=>Math.max(x.yoc||0,x.atual||0)),0.01);return `<div class="mf-yoc-b">${L.map(x=>`<div><span>${escH(x.tk)}</span><div><i><b style="width:${((x.yoc||0)/mx*100).toFixed(1)}%"></b></i><i class="hj"><b style="width:${((x.atual||0)/mx*100).toFixed(1)}%"></b></i></div><em><b class="ok">${mfPc0(x.yoc)}</b><small class="mu">${mfPc0(x.atual)}</small></em></div>`).join('')}</div>${mfKeys([['Sobre o pago','var(--ok)'],['Hoje','#8e8e93',1]])}`})():anRows([['<small class="mu">Ativo</small>','<small class="mu">Sobre o pago</small>',{t:'Hoje'}]].concat(L.map(x=>[escH(x.tk),`<span class="ok">${mfPc0(x.yoc)}</span>`,{t:mfPc0(x.atual),c:'mu'}])))}</section>`}
/* ---- 8) Reinvestir os proventos ---- */
function mfPvReinvHtml(){const b=mfPvBase(),cur=TD.slice(0,7),pv=nm(cur,-1),sm=k=>b.rec.filter(t=>t.d.slice(0,7)===k).reduce((s,t)=>s+(+t.v||0),0);let k=cur,tot=sm(cur);if(!(tot>0)){k=pv;tot=sm(pv)}
 const H=mfHeld().filter(x=>x.p>0);if(!H.length)return '';if(!(tot>0))return B('i_pvreinv')+`<section class="c mf-pvx"><h2>Reinvestir os proventos</h2><p class="mf-empty">Sem proventos neste mês nem no anterior para reinvestir.</p></section>`;const by=b.by,L=H.map(x=>({tk:x.tk,p:x.p,n:Math.floor(tot/x.p),y:x.p*x.q>0?(by[x.tk]||0)/(x.p*x.q):0})).sort((a,c)=>c.y-a.y||c.n-a.n);const oR=mfView('i_pvreinv','ord','yield');if(oR==='cotas')L.sort((a,c)=>c.n-a.n);else if(oR==='preco')L.sort((a,c)=>a.p-c.p);
 const pode=L.filter(x=>x.n>0).slice(0,+mfView('i_pvreinv','qtd','5')||5),cheap=L.slice().sort((a,c)=>a.p-c.p)[0];
 return B('i_pvreinv')+`<section class="c mf-pvx"><h2>Reinvestir os proventos</h2><p class="mf-cmp">Proventos de ${MESF[+k.slice(5)-1].toLowerCase()}: <b class="ok">${R(tot)}</b>. Dá para comprar:</p>
 ${pode.length?anRows([['<small class="mu">Ativo'+(oR==='cotas'?' (mais cotas)':oR==='preco'?' (mais barato)':' (do maior yield)')+'</small>','<small class="mu">Cotas</small>',{t:'Preço'}]].concat(pode.map(x=>[escH(x.tk),`<b>${x.n}</b>`,{t:R(x.p),c:'mu'}]))):`<p class="mf-cmp">Ainda não dá para 1 cota: faltam <b>${R(cheap.p-tot)}</b> para ${escH(cheap.tk)} (${R(cheap.p)}).</p>`}</section>`}

/* ---- Simulação: parâmetros comuns ---- */
function mfSimP(){const P=S.pvSim||{},b=mfPvBase(),cur=TD.slice(0,7),ap3=[1,2,3].map(i=>S.tx.filter(t=>t.d&&t.d.slice(0,7)===nm(cur,-i)&&t.c==='Investimento').reduce((s,t)=>s+(+t.v||0),0)),apD=Math.round(ap3.reduce((s,v)=>s+v,0)/3);
 return {ap:P.ap!=null?+P.ap:apD,y:P.y!=null?+P.y/100:(b.y>0?b.y:0.08),anos:+P.anos||10,P0:b.now,m0:b.m,yAuto:b.y}}
function mfSimIn(p){return `<div class="mf-sim-in"><label class="mf-cf-f"><small>Aporte por mês</small><input type="text" inputmode="decimal" data-pvsim="ap" value="${p.ap.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}"></label><label class="mf-cf-f"><small>Yield ao ano (%)</small><input type="text" inputmode="decimal" data-pvsim="y" value="${(p.y*100).toFixed(2).replace('.',',')}"></label></div>`}
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('[data-pvsim]');if(!i)return;const k=i.dataset.pvsim,v=mfNum(i.value);S.pvSim=S.pvSim||{};if(k==='ap')S.pvSim.ap=v>0?v:0;else if(k==='y')S.pvSim.y=v>0?v:0;save();draw()},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pvanos]');if(!b)return;e.preventDefault();e.stopPropagation();S.pvSim=S.pvSim||{};S.pvSim.anos=+b.dataset.pvanos;save();draw()},true);
/* ---- 10) Com e sem reinvestir ---- */
function mfReinvSimHtml(){const p=mfSimP();if(!(p.P0>0)&&!(p.ap>0))return '';const ym=p.y/12,N=p.anos*12;let A=p.P0,Bv=p.P0,rec=0;const pa=[[0,A]],pb=[[0,Bv]];
 for(let m=1;m<=N;m++){A+=p.ap+A*ym;rec+=Bv*ym;Bv+=p.ap;if(m%12===0||m===N){pa.push([m/N,A]);pb.push([m/N,Bv])}}
 return B('s_reinv')+`<section class="c mf-pvx mf-reinv"><h2>Com e sem reinvestir</h2>${mfSimIn(p)}<div class="mfc-chips">${[5,10,20,30].map(a=>`<button type="button" class="mfc-chip ${p.anos===a?'on':''}" data-pvanos="${a}">${a} anos</button>`).join('')}</div>
 ${mfLeg([['#22c55e','Reinvestindo',R(A),'ok'],['#7cc4fa','Gastando os proventos',R(Bv),'']])}${mfChart('s_reinv','linha')==='barras'?(()=>{const y0=+TD.slice(0,4),st=p.anos>10?Math.ceil(p.anos/8):1,ix=pa.map((_,i)=>i).filter(i=>i%st===0||i===pa.length-1);return mfVBars(ix.map(i=>i?String(y0+Math.round(pa[i][0]*p.anos)):'Hoje'),[{vals:ix.map(i=>pb[i][1]),color:'#7cc4fa'},{vals:ix.map(i=>pa[i][1]),color:'#22c55e'}],{every:ix.length>8?2:1,aria:'Com e sem reinvestir'})})():mfSvgLines([{pts:pb,cor:'#7cc4fa',w:2},{pts:pa,cor:'#22c55e',w:2.6}],{label:'Com e sem reinvestir'})}
 ${anRows([['<small class="mu">Em '+p.anos+' anos</small>','<small class="mu">Reinvestindo</small>',{t:'Gastando'}],['Patrimônio',R(A),{t:R(Bv),c:'mu'}],['Renda por mês',`<span class="ok">${R(A*ym)}</span>`,{t:R(Bv*ym),c:'mu'}],['Proventos já gastos','—',{t:R(rec),c:'mu'}]].concat(mfView('s_reinv','dif',true)?[['<b>Diferença</b>',`<b class="ok">+${R(A-Bv)}</b>`,{t:`+${R((A-Bv)*ym)}/mês`,c:'ok'}]]:[]))}
 <p class="mf-cmp mf-reinv-note">Mesmo aporte de ${R(p.ap)}/mês e yield de ${mfPc0(p.y*100)} ao ano. Sem contar a valorização das cotas.</p></section>`}
/* ---- 11) Número mágico da carteira (0.4: antes era só dos FIIs) + quanto os proventos do mês compram ---- */
/* 1.18: o cálculo por ativo (cotas para o ativo pagar uma cota nova por mês) fica separado em mfMagicoRows():
   o bloco da tela mostra só a parte de cima (quanto os proventos do mês compram); a lista por ativo virou bloco opcional. */
function mfMagicoRows(){const H=mfHeld().filter(x=>x.p>0);if(!H.length)return [];const b=mfPvBase(),rows=((window.__pva||{}).rows||[]);
 const L=H.map(x=>{let vc=0;
  if(x.cls==='fii'){const cand=[];mfProvAll().filter(t=>mfProvTk(t)===x.tk&&t.d<=TD&&+t.vc>0).forEach(t=>cand.push([t.d,+t.vc]));
   rows.concat((S.pvHist&&S.pvHist.rows)||[]).filter(r=>String(r.ticker).toUpperCase()===x.tk&&+r.valor_cota>0).forEach(r=>cand.push([mfPvaDate(r)||'',+r.valor_cota]));
   cand.sort((p,q)=>p[0]<q[0]?1:-1);if(cand.length)vc=cand[0][1]}
  if(!(vc>0))vc=((b.by[x.tk]||0)/12)/(x.q||1);const mg=vc>0?Math.ceil(x.p/vc):null;return {...x,vc,mg}}).filter(x=>x.mg);
 return L}
function mfMagicoHtml(){const H=mfHeld().filter(x=>x.p>0);if(!H.length)return '';const b=mfPvBase(),cur=TD.slice(0,7);
 /* quanto os proventos do mês compram: o que já caiu + o que ainda vai cair neste mês; sem nada no mês, a média mensal de 12 meses */
 const E=mfIvEvents().filter(e=>e.d.slice(0,7)===cur),mes=E.reduce((s,e)=>s+(+e.v||0),0),usaMedia=!(mes>0),verba=usaMedia?b.m:mes;
 if(!(verba>0))return B('s_magico')+`<section class="c mf-pvx mf-magico"><h2>Número mágico da carteira</h2><p class="mf-empty">Quando seus ativos pagarem proventos, aparece aqui quanto eles compram por mês.</p></section>`;
 const un=(n,x)=>n.toLocaleString('pt-BR')+' '+(x.cls==='acao'?(n===1?'ação':'ações'):(n===1?'cota':'cotas'));
 const buy=H.map(x=>({x,n:Math.floor(verba/x.p)})).sort((a,c)=>c.n-a.n||a.x.p-c.x.p),podem=buy.filter(y=>y.n>0),prox=buy.filter(y=>!y.n).sort((a,c)=>a.x.p-c.x.p)[0];
 const compra=verba>0?`<div class="mf-mg-buy"><div class="mf-mg-buy-h"><small>${usaMedia?'Média mensal de proventos (12 meses)':'Proventos de '+MESF[+cur.slice(5)-1].toLowerCase()}</small><b class="ok">${R(verba)}</b></div>
  <p class="mf-mg-buy-t">${podem.length?`Dá para comprar, de <b>${podem.length}</b> ${podem.length===1?'ativo':'ativos'} da carteira:`:`Ainda não compra uma cota inteira${prox?` — faltam <b>${R(prox.x.p-verba)}</b> para 1 de ${escH(prox.x.tk)}`:''}.`}</p>
  ${podem.length?`<div class="mf-mg-chips">${podem.map(y=>`<span class="mf-mg-chip"><b>${escH(y.x.tk)}</b><em>${un(y.n,y.x)}</em></span>`).join('')}</div><small class="mu mf-mg-buy-n">Cada número considera usar todo o valor em um só ativo, pela cotação de hoje.</small>`:''}</div>`:'';
 return B('s_magico')+`<section class="c mf-pvx mf-magico"><h2>Número mágico da carteira</h2>${compra}</section>`}
/* ===== 1.29: Proventos no estilo Investidor10 — total a receber no mês + DY, evolução, proventos por ativo e meus proventos ===== */
var MF_IV_COL=['#5b9bd5','#62bde4','#86dce0','#aee5bd','#f8dc72','#f4a582','#ea7c92','#cf65a8','#dc93cc','#e3bdf2','#9b97ec','#7f7be0'];
function mfIvSeg(id,k,cur,opts){return `<div class="mf-seg mf-pr-seg">${opts.map(([v,t])=>`<button type="button" class="${String(v)===String(cur)?'on':''}" data-ivp="${id}|${k}|${v}">${t}</button>`).join('')}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ivp]');if(!b)return;e.preventDefault();e.stopPropagation();const [id,k,v]=b.dataset.ivp.split('|');S.view=S.view||{};S.view[id]=Object.assign({},S.view[id],{[k]:v});save();draw()},true);
function mfIvTopHtml(){const E=mfIvEvents(),cur=TD.slice(0,7),b=mfPvBase();if(!E.length&&!(b.now>0))return '';
 const fut=E.filter(e=>!e.pago&&e.d.slice(0,7)===cur),rec=E.filter(e=>e.pago&&e.d.slice(0,7)===cur),tf=fut.reduce((s,e)=>s+e.v,0),tr=rec.reduce((s,e)=>s+e.v,0),pc=v=>v==null||!isFinite(v)?'—':v.toFixed(2).replace('.',',')+'%',n=new Set(fut.map(e=>e.tk)).size;
 return B('i_ivtop')+`<section class="c mf-pr mf-prtop"><div class="mf-pr-k"><span class="mf-pr-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><div><small>A receber em ${MESF[+cur.slice(5)-1].toLowerCase()}</small><b class="${tf>0?'ok':''}">${R(tf)}</b><em>${tf>0?`${n} ${n===1?'ativo':'ativos'} · já recebeu ${R(tr)}`:`já recebeu ${R(tr)} no mês`}</em></div></div>
 <div class="mf-pr-k"><span class="mf-pr-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg></span><div><small>DY da carteira</small><b class="${b.dy>0?'ok':''}">${b.nowRV>0?pc(b.dy*100):'—'}</b><em>últimos 12 meses</em></div></div></section>`}
function mfIvEvoHtml(){const E=mfIvEvents();if(!E.length)return '';const p=+mfView('i_ivevo','per','12'),per=p===24?24:12,cur=TD.slice(0,7),ks=Array.from({length:per},(_,i)=>nm(cur,i-per+1)),pv={},fv={};
 E.forEach(e=>{const k=e.d.slice(0,7);if(e.pago)pv[k]=(pv[k]||0)+e.v;else fv[k]=(fv[k]||0)+e.v});
 const kk=ks.slice();Object.keys(fv).filter(k=>k>cur&&!kk.includes(k)).sort().forEach(k=>{kk.push(k);kk.shift()});
 const tt=k=>(pv[k]||0)+(fv[k]||0),mx0=Math.max(...kk.map(tt),0),stp=mx0<=0?1:Math.pow(10,Math.floor(Math.log10(mx0)))*([1,2,2.5,5,10].find(m=>m*Math.pow(10,Math.floor(Math.log10(mx0)))*4>=mx0)||10)/4,top=Math.max(stp*4,1),ticks=[0,1,2,3,4].map(i=>i*stp),priv=window.MF_PRIV,fm=v=>priv?'•••':Math.round(v).toLocaleString('pt-BR'),lab=Math.ceil(kk.length/6);
 return B('i_ivevo')+`<section class="c mf-pr mf-prevo"><h2>Evolução dos dividendos</h2>${mfIvSeg('i_ivevo','per',per,[['12','12 meses'],['24','2 anos']])}
 <div class="mf-pr-leg"><span><i class="r"></i>Recebidos</span><span><i class="f"></i>A receber</span></div>
 <div class="mf-prc"><div class="mf-prc-y">${ticks.slice().reverse().map(v=>`<span>${fm(v)}</span>`).join('')}</div><div class="mf-prc-p">${ticks.slice().reverse().map(()=>'<hr>').join('')}<div class="mf-prc-b">${kk.map(k=>{const a=(pv[k]||0)/top*100,f=(fv[k]||0)/top*100;return `<div class="mf-prc-c" title="${mfMs(k)}: ${priv?'':(R(tt(k)))}"><div class="mf-prc-s"><i class="f" style="height:${f}%"></i><i class="r" style="height:${a}%"></i></div></div>`}).join('')}</div></div></div>
 <div class="mf-prc-x">${kk.map((k,i)=>`<span>${i%lab===0?k.slice(5)+'/'+k.slice(2,4):''}</span>`).join('')}</div></section>`}
function mfIvAtivoHtml(){const E=mfIvEvents().filter(e=>e.pago);if(!E.length)return '';const per=mfView('i_ivativo','per','12')==='30'?'30':'12',cur=TD.slice(0,7),d0=per==='30'?(()=>{const d=new Date(TD+'T12:00:00');d.setDate(d.getDate()-30);return d.toISOString().slice(0,10)})():nm(cur,-11)+'-01',by={};
 E.filter(e=>e.d>=d0).forEach(e=>{by[e.tk]=(by[e.tk]||0)+e.v});const L=Object.entries(by).sort((a,b)=>b[1]-a[1]),tot=L.reduce((s,x)=>s+x[1],0);
 const head=`<h2>Proventos por ativo</h2>${mfIvSeg('i_ivativo','per',per,[['30','30 dias'],['12','12 meses']])}`;
 if(!(tot>0))return B('i_ivativo')+`<section class="c mf-pr mf-prativo">${head}<p class="mf-empty">Nenhum provento recebido neste período.</p></section>`;
 let ac=0;const seg=L.map(([k,v],i)=>{const a=ac/tot*100;ac+=v;return `${MF_IV_COL[i%MF_IV_COL.length]} ${a.toFixed(3)}% ${(ac/tot*100).toFixed(3)}%`}).join(',');
 return B('i_ivativo')+`<section class="c mf-pr mf-prativo">${head}<div class="mf-prd" style="background:conic-gradient(${seg})"><div class="mf-prd-h"><small>Total</small><b>${R(tot)}</b></div></div>
 <div class="mf-prl">${L.map(([k,v],i)=>`<div class="mf-prl-r"><b>${escH(k)}</b><span>${(v/tot*100).toFixed(2).replace('.',',')}%</span><div class="mf-prl-t"><i style="width:${Math.max(4,v/L[0][1]*100)}%;background:${MF_IV_COL[i%MF_IV_COL.length]}"></i></div><em>${R(v)}</em></div>`).join('')}</div></section>`}
function mfIvMeusHtml(){const E=mfIvEvents();if(!E.length)return '';const per=mfView('i_ivmeus','per','12')==='30'?'30':'12',cur=TD.slice(0,7),d0=per==='30'?(()=>{const d=new Date(TD+'T12:00:00');d.setDate(d.getDate()-30);return d.toISOString().slice(0,10)})():nm(cur,-11)+'-01',L=E.filter(e=>e.d>=d0),lim=mfView('i_ivmeus','lim','12')==='all'?L.length:12,tot=L.filter(e=>e.pago).reduce((s,e)=>s+e.v,0),
  vc=x=>x>0?x.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:4}):'—',dm=d=>d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(2,4);
 return B('i_ivmeus')+`<section class="c mf-pr mf-prmeus"><h2>Meus proventos</h2>${mfIvSeg('i_ivmeus','per',per,[['30','30 dias'],['12','12 meses']])}
 <div class="mf-prm-t"><span>Total recebidos:</span><b class="ok">${R(tot)}</b></div>
 ${!L.length?'<p class="mf-empty">Nenhum provento neste período.</p>':`<div class="mf-prm-h"><span>Ativo</span><span>Valor</span><span>Valor total</span><span>Status</span></div>${L.slice(0,lim).map(e=>`<div class="mf-prm-r"><div class="mf-prm-a"><b>${escH(e.tk)}</b><small>${dm(e.d)}</small></div><div class="mf-prm-v"><b>${window.MF_PRIV?'•••':'R$ '+vc(e.vc)}</b><small>${e.qt>0?e.qt.toLocaleString('pt-BR'):'—'} ${e.qt===1?'cota':'cotas'}</small></div><b class="ok mf-prm-tt">${R(e.v)}</b><span class="mf-prm-s ${e.pago?'pg':'ar'}">${e.pago?'Pago':'A receber'}</span></div>`).join('')}${L.length>lim?`<button type="button" class="mf-prm-mais" data-ivp="i_ivmeus|lim|all">Ver todos (${L.length})</button>`:''}`}</section>`}
function mfInvExtraHtml(){let h='';const t=(f)=>{try{return f()}catch(e){console.warn(e);return ''}};h+=t(mfIvTopHtml)+t(mfIvEvoHtml)+t(mfIvAtivoHtml)+t(mfIvMeusHtml)+t(mfEvoHtml)+t(mfDestHtml)+t(mfPvPrevHtml)+t(mfPvComHtml)+t(mfPvYocHtml)+t(mfPvReinvHtml)+t(mfReinvSimHtml)+t(mfMagicoHtml);return h}

function mfPyldHtml(){const b=mfPvBase(),pc=v=>v==null||!isFinite(v)?'—':v.toFixed(2).replace('.',',')+'%';if(!(b.now>0)&&!b.div12)return '';
 return B('i_pyld')+`<section class="c mf-pyld"><h2>Dividend yield (DY)</h2>
 <div class="mf-dy"><b class="${b.dy>0?'ok':''}">${b.nowRV>0?pc(b.dy*100):'—'}</b><small>DY da carteira nos últimos 12 meses</small></div>
 <p class="mf-dy-f">${R(b.div12)} recebidos em 12 meses ÷ ${R(b.nowRV)} em ações, FIIs e ETFs hoje</p>
 <div class="mf-pyld-g mf-dy-g"><div class="mf-pyld-c" title="Proventos de 12 meses ÷ o que você pagou nas cotas"><small>Sobre o que você pagou</small><b>${b.costRV>0?pc(b.div12/b.costRV*100):'—'}</b></div><div class="mf-pyld-c mf-pyld-note" title="Proventos de 12 meses ÷ toda a carteira, com renda fixa e reserva"><small>Com a renda fixa junto</small><b>${b.now>0?pc(b.y*100):'—'}</b></div></div></section>`}
/* ---- Proventos: renda passiva ---- */
function mfPvTipo(t){const x=String(t.tp||'').toUpperCase(),n=String(t.n||'');if(x==='JCP'||/\bjcp\b|juros sobre/i.test(n))return 'JCP';if(x==='RENDIMENTO'||/rendiment/i.test(n)||/11$/.test(mfProvTk(t)||''))return 'Rendimentos (FII)';return 'Dividendos'}
function mfPvTipoR(r){const x=String(r.tipo||'').toUpperCase();return x==='JCP'?'JCP':x==='RENDIMENTO'||/11$/.test(r.ticker||'')?'Rendimentos (FII)':'Dividendos'}
function mfPvExtraHtml(){const rec=mfProvAll().filter(t=>t&&t.d&&t.d<=TD&&mfIsProv(t)),k12=nm(TD.slice(0,7),-11),y=TD.slice(0,4),r12=rec.filter(t=>t.d.slice(0,7)>=k12),ra=rec.filter(t=>t.d.slice(0,4)===y),sum=a=>a.reduce((s,t)=>s+(+t.v||0),0);
 const I=(S.inv||[]).filter(a=>!a.f&&(+a.q||0)>0),tk=new Set([...I.map(a=>String(a.a).toUpperCase()),...r12.map(mfProvTk).filter(Boolean)]);
 const lst=[...tk].map(t=>{const v=sum(r12.filter(x=>mfProvTk(x)===t)),a=I.find(x=>String(x.a).toUpperCase()===t),now=a?ivNow(a):0;return {t,m:v/12,v,dy:now>0&&v>0?v/now*100:null}}).sort((a,b)=>b.m-a.m||a.t.localeCompare(b.t));const ordA=mfView('i_pvativo','ord','valor');if(ordA==='nome')lst.sort((a,b)=>a.t.localeCompare(b.t));else if(ordA==='yield')lst.sort((a,b)=>(b.dy||0)-(a.dy||0));
 const totM=lst.reduce((s,x)=>s+x.m,0),ctA=mfChart('i_pvativo','tabela'),vA=mfView('i_pvativo','val','mes'),nxt={};((window.__pva||{}).rows||[]).filter(r=>r.data_pagamento&&r.data_pagamento>TD).sort((a,b)=>a.data_pagamento<b.data_pagamento?-1:1).forEach(r=>{const k=String(r.ticker||'').toUpperCase(),c=nxt[k];if(!c)nxt[k]={d:r.data_pagamento,v:+r.total||0};else if(c.d===r.data_pagamento)c.v+=+r.total||0});
 const atvB=B('i_pvativo')+`<section class="c mf-pvx"><h2>Renda por ativo</h2>${lst.length&&ctA!=='tabela'?`<p class="mf-cmp mf-pva-exp">${vA==='ano'?'Quanto cada ativo pagou nos últimos 12 meses.':'Quanto cada ativo gera por mês, na média dos últimos 12 meses.'}</p>`+mfCatView(lst.filter(x=>x.v>0).map((x,i)=>({n:x.t,v:vA==='ano'?x.v:x.m,c:MF_PAL[i%MF_PAL.length]})),ctA,{fmt:v=>R(v)+(vA==='ano'?'':'/mês'),empty:'Sem proventos nos últimos 12 meses.'})+`<p class="mf-cmp mf-pva-tot">Total: <b class="ok">${R(vA==='ano'?totM*12:totM)}</b>${vA==='ano'?' em 12 meses':' por mês'}</p>`:lst.length?`<p class="mf-cmp mf-pva-exp">Quanto cada ativo gera por mês, na média dos últimos 12 meses.</p>`+anRows([['<small class="mu">Ativo</small>','<small class="mu">Média/mês</small>',{t:'Yield 12m'}]].concat(lst.map(x=>[escH(x.t)+`<small class="mu mf-pva-sub" style="display:block;font-weight:500">${x.v>0?`<span class="ok">${R(x.v)}</span> em 12 meses`:nxt[x.t]?'próximo: '+R(nxt[x.t].v)+' em '+nxt[x.t].d.slice(8,10)+'/'+nxt[x.t].d.slice(5,7):'sem proventos ainda'}</small>`,x.m>0?`<span class="ok">${R(x.m)}</span>`:'—',{t:x.dy==null?'—':x.dy.toFixed(2).replace('.',',')+'%',c:x.dy==null?'mu':'ok'}]),[['<b>Total</b>',`<b class="ok">${R(totM)}</b>`,{t:'por mês'}]])):'<p class="mf-empty">Cadastre seus ativos para ver quanto cada um rende.</p>'}</section>`;
 const o=window.__pva||{},cur=TD.slice(0,7),prox=(o.rows||[]).filter(r=>r.data_pagamento&&r.data_pagamento>TD).map(r=>({d:r.data_pagamento,t:r.ticker,tp:mfPvTipoR(r),v:+r.total||0,ok:false})),
  rmes=(mfView('i_pvcal','rec',true)?rec:[]).filter(t=>t.d.slice(0,7)===cur).map(t=>({d:t.d,t:mfProvTk(t)||String(t.n||''),tp:mfPvTipo(t),v:+t.v||0,ok:true})),ev=rmes.concat(prox).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0),W=['dom','seg','ter','qua','qui','sex','sáb'];
 const meses=[...new Set(ev.map(e=>e.d.slice(0,7)))],aRec=sum(prox),ctC=mfChart('i_pvcal','grade');
 const grade=m=>{const [yy,mm]=m.split('-').map(Number),n=new Date(yy,mm,0).getDate(),o0=new Date(yy,mm-1,1).getDay(),E=ev.filter(e=>e.d.slice(0,7)===m),cell=d=>{const L=E.filter(e=>+e.d.slice(8)===d),v=L.reduce((s,e)=>s+e.v,0);return `<${L.length?'button type="button"':'div'} class="mf-pvg-c${L.length?(L.every(e=>e.ok)?' ok':' on'):''}${m+'-'+String(d).padStart(2,'0')===TD?' hj':''}" ${L.length?`data-pvday="${m}-${String(d).padStart(2,'0')}" aria-label="Ver pagamentos do dia ${d}"`:''}><b>${d}</b>${L.length?`<small>${v>=1000?(v/1000).toFixed(1).replace('.',',')+'k':Math.round(v)}</small>`:''}</${L.length?'button':'div'}>`};
  return `<div class="mf-pvg">${W.map(w=>`<span>${w.charAt(0).toUpperCase()}</span>`).join('')}${'<i></i>'.repeat(o0)}${Array.from({length:n},(_,i)=>cell(i+1)).join('')}</div><p class="mf-cmp mf-pvg-tip">Toque num dia marcado para ver os pagamentos. <span class="mf-pvg-k ok">recebido</span> <span class="mf-pvg-k on">a receber</span></p>`};
 window.__pvcalEv=ev;
 const um=mfView('i_pvcal','todos','um')!=='todos',cm=meses.includes(window.__pvcalM)?window.__pvcalM:(meses.find(m=>m>=cur)||meses[meses.length-1]),ci=meses.indexOf(cm);window.__pvcalL=meses;
 const nav=um&&meses.length?`<div class="mf-pvc-nav"><button type="button" data-pvcal="-1" ${ci<=0?'disabled':''} aria-label="Mês anterior">‹</button><span><b>${MESF[+cm.slice(5)-1]} ${cm.slice(0,4)}</b>${meses.length>1?`<small>${ci+1} de ${meses.length} · arraste para o lado</small>`:''}</span><button type="button" data-pvcal="1" ${ci>=meses.length-1?'disabled':''} aria-label="Próximo mês">›</button></div>`:'';
 const calB=B('i_pvcal')+`<section class="c mf-pvx mf-pvcal"><h2>Calendário de pagamentos</h2>${ev.length?`<div class="an-eco"><small>Próximos pagamentos anunciados</small><b>${R(aRec)}</b><span class="mu">${prox.length} ${prox.length===1?'pagamento':'pagamentos'} a receber</span></div>`+nav+`<div class="mf-pvc-sw" data-pvcalsw="1">`+(um?[cm]:meses).map(m=>(um?'':`<div class="mf-pvc-m">${MESF[+m.slice(5)-1]} ${m.slice(0,4)}</div>`)+(ctC==='grade'?grade(m):ev.filter(e=>e.d.slice(0,7)===m).map(e=>`<div class="mf-pvc-r${e.ok?' ok':''}"><span class="mf-pvc-d"><b>${+e.d.slice(8)}</b><small>${W[new Date(e.d+'T12:00:00').getDay()]}</small></span><span class="mf-pvc-n"><b>${escH(e.t)}</b><small>${e.tp}${e.ok?' · recebido':' · a receber'}</small></span><b class="${e.ok?'ok':''}">${R(e.v)}</b></div>`).join(''))).join('')+'</div>':'<p class="mf-empty">Nenhum pagamento anunciado para os seus ativos.</p>'}</section>`;
 return atvB+calB}
function mfPvDay(d){const E=(window.__pvcalEv||[]).filter(e=>e.d===d);if(!E.length)return;const W=['domingo','segunda','terça','quarta','quinta','sexta','sábado'],tot=E.reduce((s,e)=>s+e.v,0);
 mfConfirm({title:`${+d.slice(8)} de ${MESF[+d.slice(5,7)-1].toLowerCase()} · ${W[new Date(d+'T12:00:00').getDay()]}`,ok:'Fechar',single:1,body:`<div class="mf-pvday">${E.map(e=>`<div class="mf-pvday-r"><span><b>${escH(e.t)}</b><small class="mu">${e.tp}${e.ok?' · recebido':' · a receber'}</small></span><b class="${e.ok?'ok':''}">${R(e.v)}</b></div>`).join('')}${E.length>1?`<div class="mf-pvday-r mf-pvday-t"><span><b>Total do dia</b></span><b class="ok">${R(tot)}</b></div>`:''}</div>`})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pvday]');if(!b||document.body.classList.contains('org-on'))return;e.preventDefault();e.stopPropagation();mfPvDay(b.dataset.pvday)},true);
function mfPvcalGo(d){const L=window.__pvcalL||[],i=L.indexOf(window.__pvcalM&&L.includes(window.__pvcalM)?window.__pvcalM:(L.find(m=>m>=TD.slice(0,7))||L[L.length-1])),j=i+d;if(j<0||j>=L.length)return;window.__pvcalM=L[j];draw()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pvcal]');if(!b)return;e.preventDefault();e.stopPropagation();mfPvcalGo(+b.dataset.pvcal)},true);
(function(){let x0=null,y0=0;document.addEventListener('touchstart',e=>{const s=e.target.closest&&e.target.closest('[data-pvcalsw]');x0=s&&e.touches.length===1?e.touches[0].clientX:null;y0=x0==null?0:e.touches[0].clientY},{passive:true});
 document.addEventListener('touchend',e=>{if(x0==null)return;const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)mfPvcalGo(dx<0?1:-1)},{passive:true})})();
/* uma vez: na ordem já salva, os blocos novos de proventos ficam logo depois de Proventos */
window.__mfPre.push(function(){const fix=a=>{if(!Array.isArray(a))return;const i=a.indexOf('i_pano'),j=a.indexOf('i_pvcal');if(i>=0&&j>i){a.splice(i,1);a.splice(a.indexOf('i_pvcal')+1,0,'i_pano')}};fix(MF_ORD.inv);fix(MF_ORD_D.inv);try{fix(((S.lay||{}).o||{}).inv)}catch(e){}});
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__pv16)return;const o=L.o||{};if(Array.isArray(o.inv)){const a=o.inv.filter(x=>!['i_pvtipo','i_pvativo','i_pvcal'].includes(x)),i=a.indexOf('i_prov');a.splice(i<0?a.length:i+1,0,'i_pvtipo','i_pvativo','i_pvcal');o.inv=a}L.__pv16=1;save()}catch(e){}});
function mfPanoHtml(){return B('i_pano')+`<section class="c mf-pano"><h2>Proventos ano a ano</h2>${mfProvYearBlock()||'<p class="mf-empty">Os proventos recebidos aparecem aqui, ano a ano.</p>'}</section>`}
(function(){const ins=a=>{if(!a)return;const i=a.indexOf('i_prov');if(!a.includes('i_pyld'))a.splice(i<0?a.length:i,0,'i_pyld');const j=a.indexOf('i_prov');if(!a.includes('i_pano'))a.splice(j<0?a.length:j+1,0,'i_pano')};ins(MF_ORD.inv);ins(MF_ORD_D.inv);
 try{MF_REC_TRAVA.invest_avancado.inv.push('i_pyld','i_pano')}catch(e){}
 if(typeof MF_VIEW!=='undefined'){MF_VIEW.i_pyld={t:'Dividend yield (DY)',o:[{k:'calc',l:'Como foi calculado',g:'Informações secundárias',sel:'.mf-dy-f',t:'b',d:true},{k:'g',l:'DY sobre o que você pagou',g:'Informações secundárias',sel:'.mf-dy-g .mf-pyld-c:first-child',t:'b',d:true},{k:'note',l:'DY com a renda fixa junto',g:'Informações secundárias',sel:'.mf-pyld-note',t:'b',d:true}]};
  MF_VIEW.i_pano={t:'Proventos ano a ano',o:[{k:'l',l:'Valores de cada ano',g:'Valores',sel:'.mf-pvy-l',t:'b',d:true}]}}})();

/* ===== 1.16: mais opções em Investimentos, Proventos e Simulação (segurar o bloco › Escolher o que mostrar) =====
   chart = tipo de gráfico (também aparece no menu do bloco); per/ord/val/qtd = período, ordem, valores e quantidade. Só muda a forma de mostrar. */
(function(){if(typeof MF_VIEW==='undefined')return;
 const G='Gráfico',Pd='Período e ordem',V='Valores',Pt='Partes do card';
 const ch=(k,l,v,d,g)=>({k,l,t:'1',d,v,g:g||G}),sw=(k,l,sel,g,d)=>({k,l,sel,g:g||Pt,t:'b',d:d!==false});
 const T={linha:'Linha',barras:'Barras',rosca:'Rosca',lista:'Lista',tabela:'Tabela',colunas:'Colunas',area:'Área'},tp=a=>a.map(k=>[k,T[k]||k]);
 const P3=[['6','6 meses'],['12','12 meses'],['24','24 meses']];
 const def={
  i_pvativo:{t:'Renda por ativo',o:[ch('chart','Tipo de gráfico',tp(['tabela','barras','lista']),'tabela'),ch('val','Valor no gráfico',[['mes','Média por mês'],['ano','Total 12 meses']],'mes',V),ch('ord','Ordem',[['valor','Maior renda'],['yield','Maior yield'],['nome','Nome']],'valor',Pd),sw('sub','Detalhe abaixo de cada ativo',':scope .mf-pva-sub'),sw('exp','Explicação',':scope .mf-pva-exp'),sw('tot','Total (no gráfico)',':scope .mf-pva-tot')]},
  i_pvcal:{t:'Calendário de pagamentos',o:[ch('chart','Formato',[['grade','Calendário'],['lista','Lista']],'grade'),ch('todos','Meses',[['um','Um por vez'],['todos','Todos juntos']],'um',Pd),sw('rec','Pagamentos já recebidos no mês',null,'Pagamentos'),sw('res','Resumo do topo',':scope .an-eco')]},
  i_pvprev:{t:'Dividendos nos últimos 12 meses',o:[ch('chart','Tipo de gráfico',[['colunas','Colunas'],['linha','Linha'],['tipo','Por tipo']],'colunas'),ch('per','Período',[['12','12 meses'],['24','24 meses']],'12',Pd),sw('kpi','Total, média e melhor mês',':scope .mf-kpis',V),sw('cval','Valores em cima das colunas',':scope .mf-pvm span',V),sw('det','Valor do mês tocado',':scope .mf-pvm-d',V),sw('tp','Divisão por tipo',':scope .mf-pv12-tp')]},
  i_pvcom:{t:'Próximos pagamentos',o:[ch('qtd','Quantos ativos mostrar',[['5','5'],['10','10'],['todas','Todos']],'todas',Pd),sw('tot','Total a receber',':scope .mf-pvcom-tot',V),sw('val','Quanto você vai receber de cada ativo',':scope .mf-pvcom-v',V),sw('det','Detalhes (valor por cota e data com)',':scope .mf-pvcom-det',V,false)]},
  i_pvyoc:{t:'Yield sobre o preço pago',o:[ch('chart','Tipo de gráfico',tp(['tabela','barras']),'tabela'),ch('ord','Ordem',[['pago','Sobre o pago'],['hoje','Yield de hoje'],['nome','Nome']],'pago',Pd),sw('exp','Explicação',':scope .mf-pvyoc-exp')]},
  i_pvreinv:{t:'Reinvestir os proventos',o:[ch('qtd','Quantos ativos mostrar',[['3','3'],['5','5'],['10','10']],'5',Pd),ch('ord','Ordem',[['yield','Maior yield'],['cotas','Mais cotas'],['preco','Mais barato']],'yield',Pd)]},
  p_proj:{t:'Projeção patrimonial',o:[ch('chart','Tipo de gráfico',tp(['linha','area','barras']),'linha'),sw('in','Campos (aporte, retorno, prazo)',':scope .mf-pj-in'),sw('res','Resultado',':scope .mf-pj-res',V),sw('leg','Legenda',':scope .mf-pj-ch .mf-keys'),sw('note','Observação',':scope .mf-pj-note')]},
  s_reinv:{t:'Com e sem reinvestir',o:[ch('chart','Tipo de gráfico',tp(['linha','barras']),'linha'),sw('in','Campos de aporte e yield',':scope .mf-sim-in'),sw('dif','Linha "Diferença"',null,V),sw('anos','Botões de prazo',':scope .mfc-chips'),sw('leg','Legenda',':scope .mf-leg2'),sw('tab','Tabela',':scope .an-rows',V),sw('note','Observação',':scope .mf-reinv-note')]},
  p_metas:{t:'Simulador de metas',o:[sw('nova','Criar nova caixinha',':scope .cb-more')]}};
 Object.keys(def).forEach(id=>{MF_VIEW[id]=def[id];const c=def[id].o.find(x=>x.k==='chart');if(c)MF_CHARTS[id]=c.v});
 const CB=[['barras','Barras'],['rosca','Rosca'],['lista','Lista']],SB=[['barras','Barras'],['linha','Linha']];
 ['n_msub','n_mativo','n_asub','n_aativo'].forEach(id=>MF_CHARTS[id]=CB);['n_asaldo','n_aexpm','n_apat'].forEach(id=>MF_CHARTS[id]=MF_CT_SER);['n_ainvm','n_aprov','n_areserva','d_eco','d_bar'].forEach(id=>MF_CHARTS[id]=SB);
 const ad=(id,ops)=>{if(MF_VIEW[id])MF_VIEW[id].o=ops.concat(MF_VIEW[id].o.filter(x=>!ops.some(y=>y.k===x.k)))};
 ad('d_eco',[ch('per','Período',[['7','7 meses'],['12','12 meses']],'7',Pd)]);ad('d_bar',[ch('per','Período',[['8','8 meses'],['12','12 meses']],'8',Pd)]);
 const pre=(id,ops)=>{const c=MF_VIEW[id];if(!c)return;c.o=ops.concat(c.o.filter(x=>!ops.some(y=>y.k===x.k)));const k=ops.find(x=>x.k==='chart');if(k)MF_CHARTS[id]=k.v};
 pre('i_osc',[ch('chart','Tipo de gráfico',[['area','Área'],['linha','Linha'],['barras','Barras']],'area'),ch('p','Período',[['15','15 dias'],['30','30 dias'],['6','6 meses'],['12','12 meses'],['24','24 meses']],'30',Pd),
  sw('cdi','Comparar com o CDI (6 a 24 meses)',null,'Comparações'),sw('ibov','Comparar com o Ibovespa (6 a 24 meses)',null,'Comparações'),sw('lbl','Período escrito',':scope .mf-bench-per'),sw('leg','Legenda com os %',':scope .mf-leg2'),sw('bnote','Observação da comparação',':scope .mf-bench-note')]);
 MF_VIEW.i_osc.t='Desempenho da carteira';if(MF_VIEW.ext_sum){MF_VIEW.ext_sum.t='Lançamentos do mês';MF_VIEW.ext_sum.o.push(sw('nav','Mês com setas',':scope .mf-lnav','Partes do card'),sw('allb','Buscar, filtrar e ver todos',':scope .mf-allbtn','Partes do card'))}
 def2={i_evo:{t:'Evolução do patrimônio',o:[ch('chart','Tipo de gráfico',tp(['linha','barras']),'linha'),ch('per','Período',[['6','6 meses'],['12','12 meses'],['24','24 meses'],['tudo','Tudo']],'12',Pd),sw('kpi','Patrimônio, aplicado e ganho',':scope .mf-kpis',V),sw('leg','Legenda',':scope .mf-keys'),sw('note','Crescimento no período',':scope .mf-evo-note')]},
  i_dest:{t:'Destaques do mês',o:[sw('up','Mais subiu no mês',':scope .mf-dest-up'),sw('dn','Mais caiu no mês',':scope .mf-dest-dn'),sw('pe','Maior peso na carteira',':scope .mf-dest-pe'),sw('be','Melhor resultado',':scope .mf-dest-be'),sw('note','Observação',':scope .mf-dest-note')]}};
 Object.keys(def2).forEach(id=>{MF_VIEW[id]=def2[id];const c=def2[id].o.find(x=>x.k==='chart');if(c)MF_CHARTS[id]=c.v});
 pre('i_chart',[ch('dm','Mostrar por',[['classe','Classe'],['setor','Setor'],['ativo','Ativo']],'classe',Pd),sw('dseg','Botões Classe / Setor / Ativo',':scope .mf-dist-seg'),sw('al','Aviso de concentração (setor)',':scope .mf-setor-al'),sw('sbtn','Botão Ajustar setores',':scope .mf-setor-ed')]);
 pre('i_pano',[ch('chart','Tipo de gráfico',tp(['barras','linha','lista']),'barras')]);
 if(MF_VIEW.i_pie)MF_VIEW.i_pie.o.push(ch('ord','Ordem',[['valor','Maior valor'],['nome','Nome']],'valor',Pd));
})();

/* ---- 1.24: no computador a Distribuição é a mesma do celular (i_chart) no lugar de dv_chart ---- */
if(!MF_DWIDE.includes('i_dest'))MF_DWIDE.push('i_dest');
(function(){const a=MF_ORD_D.inv,i=a.indexOf('dv_chart');if(i>=0)a.splice(i,1,'i_chart');else if(!a.includes('i_chart'))a.splice(1,0,'i_chart')})();
/* ---- 1.22: Diário no Dashboard, acima de Avisos ---- */
(function(){const ins=a=>{if(!Array.isArray(a)||a.includes('p_diario'))return;const i=a.indexOf('d_alert');a.splice(i<0?1:i,0,'p_diario')};ins(MF_ORD.res);ins(MF_ORD_D.res);
 window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__dia122)return;L.mvt=L.mvt||{};if(!L.mvt.p_diario)L.mvt.p_diario={f:'mais',t:'res'};if(L.o&&Array.isArray(L.o.res)){const a=L.o.res.filter(x=>x!=='p_diario'),i=a.indexOf('d_alert');a.splice(i<0?1:i,0,'p_diario');L.o.res=a}L.__dia122=1;save()}catch(e){}})})();
/* ---- 1.19: ordem de Investimentos: Patrimônio › Desempenho › Evolução › Distribuição › Classes e ativos › Destaques ---- */
(function(){const fx=a=>{if(!Array.isArray(a))return;const rm=['i_evo','i_dest','i_bench','i_setor'];for(let i=a.length-1;i>=0;i--)if(rm.includes(a[i]))a.splice(i,1);
  const io=a.indexOf('i_osc'),ik=a.indexOf('dv_kpi');a.splice(io>=0?io+1:ik>=0?ik+1:0,0,'i_evo');const ic=a.indexOf('i_cls'),ich=a.indexOf('i_chart');a.splice(ic>=0?ic+1:ich>=0?ich+1:a.indexOf('i_evo')+1,0,'i_dest')};
 fx(MF_ORD.inv);fx(MF_ORD_D.inv);
 window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__inv119)return;if(L.o&&Array.isArray(L.o.inv))fx(L.o.inv);L.__inv119=1;save()}catch(e){}})})();
/* ---- 1.18: ordem de Proventos: DY › Proventos do mês e meta › últimos 12 meses › por ativo › calendário › datas com › ano a ano › yield sobre o pago › reinvestir ---- */
(function(){const P=['i_ivtop','i_ivevo','i_ivativo','i_ivmeus','i_pyld','i_prov','i_pvprev','i_pvativo','i_pvcal','i_pvcom','i_pvyoc','i_pvreinv','i_pano'];
 const fx=a=>{if(!Array.isArray(a))return;const i=a.findIndex(x=>P.includes(x)||x==='i_pvtipo'),rest=a.filter(x=>!P.includes(x)&&x!=='i_pvtipo');rest.splice(i<0?rest.length:i,0,...P);a.length=0;a.push(...rest)};
 fx(MF_ORD.inv);fx(MF_ORD_D.inv);
 window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__pv118)return;if(L.o&&Array.isArray(L.o.inv))fx(L.o.inv);L.__pv118=1;save()}catch(e){}});
 /* 1.9: "Proventos ano a ano" passa para o fim da aba Proventos (também na ordem já salva, celular e computador) */
 window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__pv19)return;if(L.o&&Array.isArray(L.o.inv))fx(L.o.inv);const D=S.layD;if(D&&D.o&&Array.isArray(D.o.inv))fx(D.o.inv);L.__pv19=1;save()}catch(e){}});
 window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__iv129)return;if(L.o&&Array.isArray(L.o.inv)){const a=L.o.inv,N=['i_ivtop','i_ivevo','i_ivativo','i_ivmeus'].filter(x=>!a.includes(x)),i=a.findIndex(x=>['i_pyld','i_prov','i_pvprev','i_pvativo','i_pvcal','i_pvcom'].includes(x));a.splice(i<0?a.length:i,0,...N)}L.__iv129=1;save()}catch(e){}})})();
/* ---- 3) Uma vez: ajusta as ordens já salvas (Proventos em Investimentos; 50/30/20 ↔ Fluxo de caixa) ---- */
/* só troca se o Fluxo de caixa ainda vier antes da Distribuição (igual à migração abaixo); na nova organização a ordem padrão já traz a Distribuição antes */
(function(){const sw=a=>{if(!a)return;const i=a.indexOf('cashflow'),j=a.indexOf('budgetalerts');if(i>=0&&j>=0&&i<j){a[i]='budgetalerts';a[j]='cashflow'}};sw(MF_ORD.res);sw(MF_ORD_D.res)})();
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__p85)return;const o=L.o||{};
 if(Array.isArray(o.res)){const a=o.res,i=a.indexOf('cashflow'),j=a.indexOf('budgetalerts');if(i>=0&&j>=0&&i<j){a[i]='budgetalerts';a[j]='cashflow'}}
 if(Array.isArray(o.inv)){const a=o.inv,i=a.indexOf('i_prov');if(!a.includes('i_pyld'))a.splice(i<0?a.length:i,0,'i_pyld');const j=a.indexOf('i_prov');if(!a.includes('i_pano'))a.splice(j<0?a.length:j+1,0,'i_pano')}
 L.__p85=1;save()}catch(e){}});

/* ===== Patch 87: sugestão por dia com dinheiro + VR; opção de bordas em Temas ===== */
/* Quanto pode gastar por dia: dinheiro + vale-refeição de hoje, menos o que ainda vai sair neste mês (dinheiro e VR) */
function diaria(){const L=led(),hoje=L.filter(t=>t.d<=TD).pop(),din=hoje?hoje.s:0,cm=TD.slice(0,7),mo=+TD.slice(5,7),last=new Date(+TD.slice(0,4),mo,0).getDate(),dias=last-(+TD.slice(8))+1;
 const vr=S.tx.filter(t=>t.d&&t.d<=TD).reduce((s,t)=>s+(t.c==='Receita'?(isVR(t)?(+t.v||0):0):t.t==='VR'?-(+t.v||0):0),0);
 const cpD=L.filter(t=>!t.fo&&!t.ini&&t.d>TD&&t.d.slice(0,7)==cm&&t.c!=='Receita'&&t.t!=='Crédito'&&t.t!=='Reserva'&&!isVR(t)).reduce((s,t)=>s+(+t.v||0),0);
 const cpV=S.tx.filter(t=>t.d&&t.d>TD&&t.d.slice(0,7)==cm&&t.c!=='Receita'&&t.t==='VR').reduce((s,t)=>s+(+t.v||0),0);
 const liv=din+vr,pd=Math.max(0,liv/dias),ok=liv>0; /* pedido: só dinheiro de hoje + VR, dividido pelos dias que faltam */
 return `<div style="display:flex;justify-content:center;margin-top:8px"><div class="mf-daily ${ok?'is-ok':'is-bad'}" title="Dinheiro + vale-refeição de hoje ÷ dias que faltam no mês" style="display:inline-flex;align-items:center;padding:5px 11px;border-radius:99px;font-size:11px;font-weight:600;letter-spacing:-0.01em;color:${ok?'var(--ok)':'var(--bad)'};background:${ok?'rgba(52,211,153,0.12)':'rgba(248,113,113,0.12)'};border:1px solid ${ok?'rgba(52,211,153,0.3)':'rgba(248,113,113,0.3)'}">${R(pd)} / dia · ${dias} ${dias===1?'dia restante':'dias restantes'}</div></div>`}
/* Temas › Bordas dos blocos: Padrão / Suaves / Sem borda */
var MF_BORDAS=[['','Sem borda'],['suave','Suave'],['nitida','Nítida']]; /* 0.1: no celular o padrão é sem borda (css/96); 'sem' antigo = sem borda */
function mfBordaApply(){const v=(S.lay||{}).borda||'';if(v)document.documentElement.setAttribute('data-mfborda',v);else document.documentElement.removeAttribute('data-mfborda')}
(function(){const _ap=mfAccentPicker;mfAccentPicker=function(){const cur=(S.lay||{}).borda||'';return _ap()+`<div class="mfc-lb">Bordas dos blocos</div><div class="mf-bordas">${MF_BORDAS.map(([k,t])=>`<button type="button" class="mf-borda ${cur===k?'on':''}" data-cfgborda="${k}" aria-pressed="${cur===k}"><i class="b-${k||'pad'}"></i><span>${t}</span></button>`).join('')}</div>`}})();
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mf-cfg [data-cfgborda]');if(!b)return;e.preventDefault();e.stopPropagation();S.lay=S.lay||{};S.lay.borda=b.dataset.cfgborda;save();mfBordaApply();draw();window.mfCfgRender&&mfCfgRender()},true);
window.__mfAD.push(mfBordaApply);

/* ===== Patch 88: até 4 cartões de crédito (nome, vencimento, melhor dia), fatura e pagamento por cartão, cartão no lançamento ===== */
/* Compras e pagamentos antigos (sem cartão) ficam no cartão 1, que usa o mesmo vencimento/melhor dia de antes (S.cardBilling). */
var MF_CC_MAX=4;
function mfCcDefault(){const L=mfCards();return L.some(c=>c.id===S.ccLast)?S.ccLast:L[0].id}
function mfFatvSet(cid,k,v){if(cid==='c1'){S.fatv=S.fatv||{};if(v==null)delete S.fatv[k];else S.fatv[k]=v;return}S.fatvc=S.fatvc||{};const o=S.fatvc[cid]=S.fatvc[cid]||{};if(v==null)delete o[k];else o[k]=v}
function mfPayCard(t){return t&&t.cc&&mfCards().some(c=>c.id===t.cc)?t.cc:'c1'}
/* fatura de um cartão (cid) ou de todos somados (sem cid) — os outros lugares do app continuam usando a soma */
function mfFatPaidC(k,cid){const inv=cbInvoice(k,cid);if(!(inv.total>0.005))return inv.paid>0.005||true;return inv.left<=0.005||inv.due<(S.paidSince||TD)}
/* ---- bloco Cartão de crédito: por cartão ---- */
/* formulário dos cartões (nome, vencimento, melhor dia, limite; adicionar e remover): usado na janela do computador e na página do celular */
function mfCcCfgForm(){const L=mfCards();
 const fld=(c,f,l,v,t)=>`<label class="cc-f${f==='n'?' cc-fn':''}"><small>${l}</small><input data-ccf="${f}" ${t==='n'?'type="number" min="1" max="31" inputmode="numeric"':t==='v'?'inputmode="decimal" maxlength="14" placeholder="opcional"':'maxlength="24" placeholder="Ex.: Nubank, Inter"'} value="${escH(String(v))}"></label>`;
 return `<div class="cc-list">${L.map((c,i)=>`<div class="cc-row" data-ccrow="${c.id}"><div class="cc-rh"><b>Cartão ${i+1}</b>${i?`<button type="button" class="cc-del" data-ccdel="${c.id}">Remover</button>`:''}</div>${fld(c,'n','Nome do cartão',c.n||'','t')}${fld(c,'due','Vencimento da fatura',c.due,'n')}${fld(c,'best','Melhor dia de compra',c.best,'n')}${fld(c,'lim','Limite total (R$)',c.lim?mfMoney(c.lim):'','v')}</div>`).join('')}</div>
  ${L.length<MF_CC_MAX?'<button type="button" class="cc-add" data-ccadd>＋ Adicionar cartão</button>':`<small class="mu cc-lim">Limite de ${MF_CC_MAX} cartões.</small>`}<button class="primary-btn cc-save" type="button" data-ccsave>Salvar cartões</button><small class="mu" style="display:block;margin-top:4px">Antes do melhor dia a compra entra na fatura atual; depois, na próxima.</small>`}
(function(){const _pl=plCardBillingHtml;plCardBillingHtml=function(){let h=_pl();const L=mfCards(),many=L.length>1,sel=mfCbMonth(),open=window.__cbOpen||{},inv=cbInvoice(sel);
 const nameOf=id=>escH(mfCardName(mfCardById(id))),dm=d=>d.slice(8,10)+'/'+d.slice(5,7);
 /* resumo por cartão abaixo do total */
 const brk=many?`<div class="cc-break">${inv.cards.map((x,i)=>`<div><span>${escH(mfCardName(L[i],i))}</span><b>${R(x.total)}</b><small>vence ${dm(x.due)}${mfFatPaidC(sel,x.cid)&&x.total>0.005?' · <em class="ok">pago</em>':''}</small></div>`).join('')}</div>`:'';
 /* compras da fatura com o nome do cartão */
 const list=inv.rows.slice().sort((a,b)=>txValue(b)-txValue(a)).map(t=>`<div class="tool-line"><div style="flex:1;min-width:0"><b style="overflow-wrap:anywhere">${escH(String(t.n||'Compra').replace(/\s*\(\d+\/\d+\)\s*$/,''))}</b><small class="mu" style="display:block">${t.d.slice(8,10)}/${t.d.slice(5,7)} · ${escH(t.c||'')}${t.installmentCount>1?` · parcela ${t.installmentIndex}/${t.installmentCount}`:''}${many?' · '+nameOf(mfCardOf(t)):''}</small></div><b>${R(txValue(t))}</b></div>`).join('');
 const listD=`<details class="cb-more" data-cbd="list"${open.list?' open':''}><summary>Compras da fatura (${inv.rows.length})</summary>${list||'<div class="mu" style="font-size:12px;padding:8px 0">Nenhuma compra no crédito nesta fatura.</div>'}</details>`;
 /* pagar: uma linha por banco/cartão e um botão para pagar */
 const pays=mfFatPays(sel),allPaid=inv.total>0.005&&mfFatPaid(sel),anyOpen=inv.cards.some(x=>!(x.total>0.005&&mfFatPaidC(sel,x.cid)));
 const rowsP=inv.cards.map((x,i)=>{const pd=x.total>0.005&&mfFatPaidC(sel,x.cid),v=mfMoney(x.total);return `<div class="cc-pay${pd?' paid':''}"><span class="cc-pn"><b>${escH(mfCardName(L[i],i))}</b><small>fatura · vence ${dm(x.due)}${x.paid>0.005&&!pd?' · já pago '+R(x.paid):''}</small></span>${pd?'<em class="cb-sum-ok">Pago</em>':`<span class="cb-pil"><em>R$</em><input type="text" inputmode="decimal" autocomplete="off" data-ccpayv="${x.cid}" value="${v}" style="width:${Math.max(4,v.length)+0.6}ch!important" aria-label="Fatura ${escH(mfCardName(L[i],i))}"></span>`}</div>`}).join('');
 const hist=pays.length?`<div class="cb-hist"><small class="cb-hist-t">Histórico de pagamentos</small>${pays.map(t=>`<div class="cb-hist-r"><span>${mfDmy(t.d)}${many?' · '+nameOf(mfPayCard(t)):''}</span><b class="ok">${R(txValue(t))}</b></div>`).join('')}</div>`:'';
 const payOpen=open.pay!==undefined?open.pay:anyOpen&&inv.total>0.005;
 const payD=`<details class="cb-more cb-paybox" data-cbd="pay"${payOpen?' open':''}><summary>Pagar fatura${allPaid?' <em class="cb-sum-ok">Pago</em>':''}</summary>${!anyOpen&&inv.total>0.005?`<div class="cb-paid"><span class="cb-paid-i">✓</span><div><b>${many?'Faturas pagas':'Fatura paga'}</b><small>${pays.length?`Pagamento de ${R(txValue(pays[0]))} em ${mfDmy(pays[0].d)}`:'Marcada como paga'}</small></div></div>`:''}${!anyOpen&&!many&&inv.total>0.005?'':`<div class="cc-pays">${rowsP}</div>`}${anyOpen?`<button type="button" class="b cb-paybtn" data-ccpayall="${sel}">${many?'Pagar faturas':'Pagar fatura'}</button>`:''}${hist}</details>`;
 /* Configurar cartão (antes "Ciclo do cartão") */
 const cfgD=`<details class="cb-more" data-cbd="cfg"${open.cfg?' open':''}><summary>Configurar cartão</summary>${mfCcCfgForm()}</details>`;
 /* Limite: quanto já foi usado e quanto ainda dá para gastar em cada cartão */
 const limX=L.map((c,i)=>({c,i,x:mfCcLim(c.id)})).filter(o=>o.x.lim>0);
 const limD=limX.length?`<div class="cc-lim-box">${limX.map(({c,i,x})=>{const cl=x.pct>=100?'bad':x.pct>=80?'wa':'ok';
   return `<div class="cc-lim-r"><div class="cc-lim-h"><span>${many?escH(mfCardName(c,i))+' · ':''}Limite usado</span><b class="${cl}">${String(x.pct).replace('.',',')}%</b></div>
   <div class="cc-lim-bar" role="img" aria-label="${String(x.pct).replace('.',',')}% do limite usado"><i class="${cl}" style="width:${Math.min(100,x.pct)}%"></i></div>
   <small>${R(x.usado)} de ${R(x.lim)} · ${x.livre>=0?'disponível':'acima do limite'} <b class="${x.livre>=0?'ok':'bad'}">${R(Math.abs(x.livre))}</b></small></div>`}).join('')}</div>`
  :`<p class="cc-lim-hint mu">Informe o limite em <b>Configurar cartão</b> para acompanhar quanto já usou.</p>`;
 h=h.replace(/<details class="cb-more" data-cbd="list"[\s\S]*?<\/details>/,brk+limD+listD).replace(/<details class="cb-more cb-paybox"[\s\S]*?<\/details>/,payD).replace(/<details class="cb-more" data-cbd="cfg"[\s\S]*?<\/details>/,cfgD);
 return h}})();
function mfCcRead(){const L=mfCards();document.querySelectorAll('#app [data-ccrow]').forEach(r=>{const c=L.find(x=>x.id===r.dataset.ccrow);if(!c)return;const g=f=>(r.querySelector(`[data-ccf="${f}"]`)||{}).value;c.n=String(g('n')||'').trim().slice(0,24);c.due=Math.max(1,Math.min(31,parseInt(g('due'),10)||c.due));c.best=Math.max(1,Math.min(31,parseInt(g('best'),10)||c.best));const lm=String(g('lim')||'').trim();c.lim=lm?Math.max(0,mfNum(lm)):0});
 const c1=L[0];S.cardBilling.dueDay=c1.due;S.cardBilling.bestDay=c1.best}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;let b;
 if(t.closest('[data-ccadd]')){e.preventDefault();e.stopPropagation();mfCcRead();const L=mfCards();if(L.length>=MF_CC_MAX)return;L.push({id:'c'+Date.now().toString(36),n:'',due:10,best:4});window.__cbOpen=Object.assign(window.__cbOpen||{},{cfg:true});save();draw();setTimeout(()=>{const r=[...document.querySelectorAll('#app [data-ccrow]')].pop();const i=r&&r.querySelector('[data-ccf="n"]');if(i)try{i.focus({preventScroll:false})}catch(_){}},60);return}
 if(t.closest('[data-ccsave]')){e.preventDefault();e.stopPropagation();mfCcRead();save();draw();mfToast('Cartões salvos ✓');return}
 if(b=t.closest('[data-ccdel]')){e.preventDefault();e.stopPropagation();const id=b.dataset.ccdel,n=S.tx.filter(x=>x.cc===id).length;if(n){mfToast(`Esse cartão tem ${n} ${n===1?'lançamento':'lançamentos'} e não pode ser removido.`);return}
  const c=mfCardById(id);mfConfirm({title:'Remover cartão?',ok:'Remover',body:`<p class="mf-cf-sub">${escH(mfCardName(c))}</p>`,onOk:()=>{mfCcRead();S.cards=mfCards().filter(x=>x.id!==id);if(S.ccLast===id)delete S.ccLast;if(S.fatvc)delete S.fatvc[id];save();draw();mfToast('Cartão removido')}});return}
 if(b=t.closest('[data-ccpayall]')){e.preventDefault();e.stopPropagation();mfPayCards(b.dataset.ccpayall);return}
 if(b=t.closest('[data-ccpick]')){e.preventDefault();e.stopPropagation();const g=s=>{const x=document.querySelector(s);return x?x.value:undefined};if(g('#fv')!==undefined){F.v=g('#fv');F.dt=g('#fd');F.n=g('#fn')}const sel=document.getElementById('f-installments');if(sel)F.installmentCount=+sel.value||1;F.cc=b.dataset.ccpick;draw();return}},true);
document.addEventListener('input',e=>{const t=e.target;if(t&&t.matches&&t.matches('[data-ccpayv]'))t.style.setProperty('width',(Math.max(4,t.value.length)+0.6)+'ch','important')},true);
/* pagar: cada banco com o valor informado; paga o que falta de cada um */
/* ---- Lançamentos: escolher o cartão quando o pagamento é Crédito ---- */
function mfCcPickSel(){const e=F.id&&S.tx.find(t=>t.id==F.id),L=mfCards();const id=F.cc||(e&&e.t==='Crédito'?mfCardOf(e):null)||mfCcDefault();return L.some(c=>c.id===id)?id:L[0].id}
(function(){const _va=vAdd;vAdd=function(){const h=_va();if(!(F.t==='Crédito'&&F.c!=='Receita')||h.indexOf('mf-inst')<0)return h;const L=mfCards(),cur=mfCcPickSel();
 const chips=`<div class="mf-flab">Cartão</div><div class="mf-pills cc-picks">${L.map((c,i)=>`<button type="button" class="mf-pill ${c.id===cur?'on':''}" data-ccpick="${c.id}" aria-pressed="${c.id===cur}">${escH(mfCardName(c,i))}</button>`).join('')}</div>`;
 return h.replace('<div class="mf-fbtns">',chips+'<div class="mf-fbtns">')}})();
/* grava o cartão escolhido nas compras novas (inclusive todas as parcelas) e na edição */
function mfCcMark(){if(!(F.t==='Crédito'&&F.c!=='Receita'))return;window.__ccPend={cc:mfCcPickSel(),edit:F.id||null,at:Date.now()}}
window.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('#fs'))mfCcMark()},true);
window.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#fs'))mfCcMark()},true);
window.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.querySelector('#app .form-add #fv'))mfCcMark()},true);
window.addEventListener('submit',e=>{if(e.target&&e.target.matches&&e.target.matches('form[data-form="quick"]'))window.__ccPend={cc:mfCcDefault(),edit:null,at:Date.now()}},true);
window.__mfPre.push(function(){try{const ids=window.__txIds,p=window.__ccPend;
 if(ids&&p&&Date.now()-p.at<8000){let ch=false;const ed=p.edit&&S.tx.find(t=>t.id==p.edit),grp=ed&&ed.installmentId;
  S.tx.forEach(t=>{if(t.t!=='Crédito')return;const isNew=!ids.has(t.id),isEd=ed&&(t.id==p.edit||(grp&&t.installmentId===grp));if((isNew||isEd)&&t.cc!==p.cc){t.cc=p.cc;ch=true}});
  if(S.tx.some(t=>!ids.has(t.id)&&t.t==='Crédito')||ed){S.ccLast=p.cc;window.__ccPend=null;F.cc=null}if(ch)setTimeout(()=>save(),0)}
 window.__txIds=new Set(S.tx.map(t=>t.id))}catch(e){console.warn('cc',e)}});

/* ===== Patch 91: check-up — mais rápido com muitos lançamentos (mesmos resultados) · "Reserva" aparece como "Renda fixa" ===== */
/* 1) cartões: a lista é normalizada uma vez e reaproveitada enquanto nada muda */
(function(){const _mc=mfCards;mfCards=function(){const m=window.__ccM,cb=S.cardBilling;
 if(m&&m.S===S&&m.a===S.cards&&m.n===S.cards.length&&cb&&m.du===cb.dueDay&&m.be===cb.bestDay)return m.a;
 const a=_mc();window.__ccM={S,a,n:a.length,du:S.cardBilling.dueDay,be:S.cardBilling.bestDay};return a}})();
/* 2) vencimento de cada compra: guarda o resultado (depende só do cartão, do ciclo dele e da data) */
var __mfDdc=new Map();
(function(){const _idd=invoiceDueDate;invoiceDueDate=function(t){const c=mfCardById(mfCardOf(t)),d=String((t&&t.d)||TD),k=c.id+':'+c.due+':'+c.best+':'+d;let v=__mfDdc.get(k);if(v===undefined){v=_idd(t);if(__mfDdc.size>30000)__mfDdc.clear();__mfDdc.set(k,v)}return v}})();
/* 3) fatura: compras e pagamentos agrupados uma vez por desenho da tela (antes cada fatura percorria todos os lançamentos) */
window.__ccGen=0;
function mfCcIdx(){const x=window.__ccIdx;if(x&&x.tx===S.tx&&x.n===S.tx.length&&x.g===window.__ccGen)return x;
 const rows=new Map(),pays=new Map();
 S.tx.forEach(t=>{if(!t||!t.d)return;if(t.t==='Crédito'){const k=mfCardOf(t)+'|'+invoiceDueDate(t).slice(0,7);let a=rows.get(k);if(!a)rows.set(k,a=[]);a.push(t)}
  if(isInvoicePayment(t)){const k=mfPayCard(t)+'|'+mfPayK(t);pays.set(k,(pays.get(k)||0)+txValue(t))}});
 return window.__ccIdx={tx:S.tx,n:S.tx.length,g:window.__ccGen,rows,pays}}
window.__mfPre.push(function(){window.__ccGen++});
/* ===== Script 1 · Módulo 20 · Investimentos › Análise: Graham, Bazin e Comparativo =====
   Usa dados de mercado: preço do Yahoo (S.quotes), LPA e VPA (Dados B3/CVM, ajustáveis pelo usuário) e, no Bazin, os proventos
   por cota que o PRÓPRIO ATIVO pagou (Dados B3; Yahoo nos FIIs), não o que o usuário recebeu (0.8, mfProvMercadoLoad).
   Sem LPA/VPA o preço justo NÃO é calculado; sem proventos de mercado o teto NÃO é calculado. Contas em js/domain/invest.js. */
var MF_INV_FUND = ['i_fdmeus', 'i_recom', 'i_fdsim'];
function mfFundData() { return (S.quoteUpdatedAt ? new Date(S.quoteUpdatedAt) : null); }
function mfFundQuando() { const d = mfFundData(); return d && !isNaN(d) ? d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'ainda não atualizado'; }
function mfFundVazio(txt) { return `<p class="mf-empty">${txt}</p>`; }
function mfFundMarg(m) { return m == null ? '<span class="mu">—</span>' : `<b class="${m >= 0 ? 'ok' : 'bad'}">${mfPct(m)}</b>`; }
/* LPA e VPA automáticos (função "fundamentos": Dados B3/CVM), guardados no aparelho por um dia. O que o usuário digitar vale mais. */
function mfFundCache() { try { const c = JSON.parse(localStorage.getItem('fin1_fund') || 'null'); return c && c.d ? c : null; } catch (e) { return null; } }
function mfFundAuto(tk) { const c = mfFundCache(); return c && c.d[String(tk || '').toUpperCase()] || null; }
function mfFundLoad() {
 const A = mfHeld().filter(h => h.cls === 'acao').map(h => h.tk).sort(), key = A.join(','), c = mfFundCache();
 if (!A.length || typeof supabaseClient === 'undefined' || !supabaseClient || typeof authUser === 'undefined' || !authUser || !navigator.onLine) return;
 if (c && c.at === TD && c.k === key) return;
 if (window.__fundBusy || (window.__fundTry && Date.now() - window.__fundTry < 300000)) return;
 window.__fundBusy = 1; window.__fundTry = Date.now();
 MF_DB.quotes.fundamentals({ body: { tickers: A } }).then(({ data, error }) => {
  window.__fundBusy = 0; if (error || !data || !data.dados) return;
  try { localStorage.setItem('fin1_fund', JSON.stringify({ at: TD, k: key, d: data.dados })); } catch (_) { }
  if (tab === 'inv' && mfInvMode() === 'fund') mfDrawLater();
 }, () => { window.__fundBusy = 0; });
}
/* 0.8 · Proventos por cota do ATIVO para o Bazin (não o que o usuário recebeu): função "fundamentos" com completo:true
   (Dados B3; Yahoo Finance nos FIIs e como reserva). A função aceita no máximo 3 códigos por chamada, então vai em lotes de 3.
   Fica no aparelho por um dia (fin1_fprov); se um lote falhar, o que já veio é guardado e o resto é tentado de novo em 5 minutos. */
function mfProvMercadoCache() { try { const c = JSON.parse(localStorage.getItem('fin1_fprov') || 'null'); return c && c.d ? c : null; } catch (e) { return null; } }
/* "Atualizar": marca o guardado como vencido (mantém os dados até os novos chegarem) */
function mfProvMercadoVencer() { const c = mfProvMercadoCache(); if (c) { c.at = ''; try { localStorage.setItem('fin1_fprov', JSON.stringify(c)); } catch (_) { } } }
function mfProvMercadoLoad() {
 const A = [...new Set(mfHeld().map(h => h.tk).filter(t => /^[A-Z]{4}\d{1,2}$/.test(t)))].sort(), key = A.join(','), c = mfProvMercadoCache();
 if (!A.length || typeof supabaseClient === 'undefined' || !supabaseClient || typeof authUser === 'undefined' || !authUser || !navigator.onLine) return;
 if (c && c.at === TD && c.k === key) return;
 if (window.__pmBusy || (window.__pmTry && Date.now() - window.__pmTry < 300000)) return;
 window.__pmBusy = 1; window.__pmTry = Date.now();
 const d = c && c.d ? Object.assign({}, c.d) : {}, lotes = []; let ok = 0;
 for (let i = 0; i < A.length; i += 3) lotes.push(A.slice(i, i + 3));
 const guardar = completo => { try { localStorage.setItem('fin1_fprov', JSON.stringify({ at: completo ? TD : ((c && c.at) || ''), k: key, d })); } catch (_) { } };
 (async () => {
  for (const L of lotes) {
   try {
    const { data, error } = await MF_DB.quotes.fundamentals({ body: { tickers: L, completo: true } });
    if (error || !data || !data.dados) continue;
    ok++; L.forEach(tk => { const x = data.dados[tk]; if (x && x.proventos) d[tk] = { proventos: x.proventos, fonte_prov: x.fonte_prov || '', tipo: x.tipo || '' }; });
    guardar(false); if (tab === 'inv' && mfInvMode() === 'fund') mfDrawLater();
   } catch (e) { }
  }
  window.__pmBusy = 0; guardar(ok === lotes.length); if (tab === 'inv' && mfInvMode() === 'fund') mfDrawLater();
 })();
}
(window.__mfAD = window.__mfAD || []).push(() => { try { if (tab === 'inv' && mfInvMode() === 'fund') { mfFundLoad(); mfProvMercadoLoad(); } } catch (e) { } });
/* ===== 0.2 · Graham e Bazin: dois blocos limpos =====
   1) "Meus ativos": cada ativo da carteira com preço justo (Graham) e preço teto (Bazin) e se está dentro da regra.
   2) "Simular": até 3 códigos; busca cotação, LPA, VPA e proventos sozinho (função "fundamentos": Dados B3/CVM + Yahoo Finance). */
function mfFdPct(m) { return m == null ? '<em class="mu">—</em>' : `<em class="${m >= 0 ? 'ok' : 'bad'}">${m >= 0 ? '+' : '−'}${Math.abs(m).toFixed(1).replace('.', ',')}%</em>`; }
function mfFdCol(nome, v, margem, ok, falta, vazio) {
 return `<div class="fdr-c${ok ? (margem >= 0 ? ' pass' : ' fail') : ' na'}"><small>${nome}</small>${ok ? `<b>${mfBRL(v)}</b>${mfFdPct(margem)}` : `<span class="mu">${falta}</span>`}</div>`;
}
/* resultado de um ativo: { g, b } já calculados; regra = passou em tudo o que pode ser calculado (FII só tem Bazin) */
function mfFdRegra(g, b, ehAcao) {
 const L = []; if (ehAcao && g.ok) L.push(g.margem == null || g.margem >= 0); if (b.ok) L.push(b.margem == null || b.margem >= 0);
 return { n: L.length, pass: L.length > 0 && L.every(Boolean), parcial: L.some(Boolean) && !L.every(Boolean) };
}
function mfFdRow(tk, px, g, b, ehAcao, extra, manual) {
 const r = mfFdRegra(g, b, ehAcao);
 const tag = !r.n ? '<span class="fdr-tag na">Sem dados</span>' : r.pass ? '<span class="fdr-tag ok">Na regra</span>' : r.parcial ? '<span class="fdr-tag wa">Em 1 regra</span>' : '<span class="fdr-tag bad">Fora da regra</span>';
 const gFalta = !ehAcao ? 'não se aplica a fundos' : (window.__fundBusy || window.__fdSimBusy) ? 'buscando…' : 'sem LPA/VPA';
 const bFalta = (window.__fundBusy || window.__fdSimBusy) ? 'buscando…' : 'sem proventos';
 return `<div class="fdr${r.pass ? ' is-pass' : ''}"><div class="fdr-h"><b>${escH(tk)}</b><span class="mu">${px ? mfBRL(px) : 'sem preço'}</span>${tag}</div>
  <div class="fdr-m">${mfFdCol('Graham · justo', g.justo, g.margem, g.ok, gFalta)}${mfFdCol('Bazin · teto', b.teto, b.margem, b.ok, bFalta)}</div>
  ${extra || ''}${manual || ''}</div>`;
}
function mfFdPremissas() {
 const P = mfFundPrem();
 return `<div class="fd-prem"><label>Rendimento desejado<span><input type="number" step="0.5" min="0.5" max="30" inputmode="decimal" data-fddy="1" value="${P.dy}"><i>%</i></span></label><label>Anos de proventos<span><input type="number" step="1" min="1" max="10" inputmode="numeric" data-fdanos="1" value="${P.anos}"><i>anos</i></span></label></div>`;
}
/* 0.4: "Meus ativos · Graham e Bazin" virou lista (1.15: Ticker › Meu PM › Graham › Bazin).
   Tocar na linha abre o detalhe (contas, margem, LPA/VPA, proventos por ano e o ajuste manual).
   Os cálculos são os mesmos (mfGraham / mfBazin / mfFdRegra); aqui só muda a forma de mostrar. */
window.__fdOpen = window.__fdOpen || {};
function mfFdLinha(k, v, cls) { return `<div class="fdl-i"><span>${k}</span><b${cls ? ` class="${cls}"` : ''}>${v}</b></div>`; }
function mfFdMargemTxt(m) { return m == null ? '—' : (m >= 0 ? 'Desconto de ' : 'Acima em ') + Math.abs(m).toFixed(1).replace('.', ',') + '%'; }
function mfFdCel(v, margem, ok) {
 return ok ? `<span class="fdl-v ${margem == null ? '' : margem >= 0 ? 'ok' : 'bad'}"><b>${mfBRL(v)}</b>${mfFdPct(margem)}</span>` : '<span class="fdl-v na"><b>—</b></span>';
}
function mfFdDetalhe(h, px, g, b, ehAcao) {
 const ocupado = window.__fundBusy || window.__fdSimBusy, au = mfFundAuto(h.tk) || {}, man = mfFundManual(h.tk), pct = v => String(v).replace('.', ',') + '%';
 const gr = !ehAcao ? '<p class="fdl-n">Graham não se aplica a fundos: eles não têm lucro por ação (LPA) nem valor patrimonial por ação (VPA) do mesmo jeito que uma empresa.</p>'
  : g.ok || g.justo != null ? mfFdLinha('Preço justo', mfBRL(g.justo)) + mfFdLinha('Preço atual', px ? mfBRL(px) : 'sem preço') + mfFdLinha('Margem', mfFdMargemTxt(g.margem), g.margem == null ? '' : g.margem >= 0 ? 'ok' : 'bad') + mfFdLinha('LPA (lucro por ação)', mfBRL(g.lpa)) + mfFdLinha('VPA (patrimônio por ação)', mfBRL(g.vpa)) + `<p class="fdl-n">Conta: √(22,5 × LPA × VPA)${(man.lpa > 0 || man.vpa > 0) ? ' · com ajuste manual' : au.ref ? ' · ' + escH(au.ref) : ''}</p>`
  : `<p class="fdl-n">${ocupado ? 'Buscando LPA e VPA…' : 'Sem LPA/VPA para calcular. Preencha abaixo ou toque em Atualizar.'}</p>`;
 const serie = ((b.prov || {}).serie || []).map(x => `<i><small>${x.y}</small>${x.v > 0 ? mfBRL(x.v) : '—'}</i>`).join('');
 const bz = b.teto != null ? mfFdLinha('Preço teto', mfBRL(b.teto)) + mfFdLinha('Preço atual', px ? mfBRL(px) : 'sem preço') + mfFdLinha('Margem', mfFdMargemTxt(b.margem), b.margem == null ? '' : b.margem >= 0 ? 'ok' : 'bad') + mfFdLinha('Proventos por ano (média)', mfBRL(b.media)) + mfFdLinha('Rendimento desejado', pct(b.dy)) + (b.dyAtual != null ? mfFdLinha('Rendimento no preço atual', pct(b.dyAtual)) : '') + (serie ? `<div class="fdl-s">${serie}</div>` : '') + `<p class="fdl-n">Conta: média dos proventos por cota que o ativo pagou por ano ÷ rendimento desejado${b.prov && b.prov.fonte ? ` · fonte: ${escH(b.prov.fonte)}` : ''}.</p>`
  : `<p class="fdl-n">${ocupado ? 'Buscando proventos…' : 'Sem proventos de mercado deste ativo no período para calcular o teto. Toque em Atualizar.'}</p>`;
 const adj = ehAcao ? `<div class="fdl-adj"><small>Ajustar LPA/VPA${(man.lpa > 0 || man.vpa > 0) ? ' · manual' : ''}</small><div class="mf-fd-in">
    <label><small>LPA</small><input type="number" step="0.01" min="0" inputmode="decimal" data-fdlpa="${escH(h.tk)}" value="${man.lpa || ''}" placeholder="${au.lpa ? String(au.lpa).replace('.', ',') + ' (auto)' : '0,00'}"></label>
    <label><small>VPA</small><input type="number" step="0.01" min="0" inputmode="decimal" data-fdvpa="${escH(h.tk)}" value="${man.vpa || ''}" placeholder="${au.vpa ? String(au.vpa).replace('.', ',') + ' (auto)' : '0,00'}"></label></div></div>` : '';
 return `<div class="fdl-d"><div class="fdl-g"><div class="fdl-c"><h3>Graham · preço justo</h3>${gr}</div><div class="fdl-c"><h3>Bazin · preço teto</h3>${bz}</div></div>${adj}</div>`;
}
function mfFdMeusHtml() {
 const H = mfHeld(), acoes = new Set(H.filter(h => h.cls === 'acao').map(h => h.tk));
 const L = H.map(h => {
  const ehAcao = acoes.has(h.tk), g = ehAcao ? mfGraham(h.tk) : { ok: false, justo: null, margem: null }, b = mfBazin(h.tk);
  const px = g.px || b.px || mfFundPreco(h.tk) || null;
  const pm = +(h.a && h.a.p) || 0;
  const html = `<details class="fdl-r" data-fdrow="${escH(h.tk)}"${window.__fdOpen[h.tk] ? ' open' : ''}><summary><span class="fdl-a"><b>${escH(h.tk)}</b><small>${px ? mfBRL(px) : 'sem preço'}</small></span><span class="fdl-v fdl-pm"><b>${pm > 0 ? mfBRL(pm) : '—'}</b></span>${mfFdCel(g.justo, g.margem, ehAcao && g.ok)}${mfFdCel(b.teto, b.margem, b.ok)}</summary>${mfFdDetalhe(h, px, g, b, ehAcao)}</details>`;
  return { tk: h.tk, html };
 }).sort((a, b) => (a.tk < b.tk ? -1 : 1));
 /* 1.15: colunas Ticker › Meu PM › Graham › Bazin; sem a coluna "Regra" e sem os filtros Na regra / Fora (pedido do usuário) */
 const lista = L.length ? `<div class="fdl"><div class="fdl-h"><span>Ticker</span><span>Meu PM</span><span>Graham</span><span>Bazin</span></div>${L.map(x => x.html).join('')}</div>` : '';
 return B('i_fdmeus') + `<section class="c mf-fund mf-fd-meus"><h2>Meus ativos · Graham e Bazin</h2>
  ${mfFdPremissas()}
  ${lista || (mfFundVazio('Cadastre ações ou fundos na carteira para ver Graham e Bazin.'))}
  <p class="mf-fd-f">Toque em um ativo para ver a conta. LPA/VPA e proventos: Dados B3 (CVM) e Yahoo Finance · preços: Yahoo Finance · ${escH(mfFundQuando())}</p>

  <div class="fd-acts"><button type="button" data-fdref="1">Atualizar</button></div>
</section>`;
}
/* guarda qual linha está aberta, para ela continuar aberta quando a tela for redesenhada */
document.addEventListener('toggle', function (e) { const d = e.target; if (d && d.matches && d.matches('details.fdl-r[data-fdrow]')) window.__fdOpen[d.dataset.fdrow] = d.open; }, true);
/* ---- simulador ---- */
function mfFdSimCache() { try { const c = JSON.parse(localStorage.getItem('fin1_fdsim') || 'null'); return c && c.at === TD && c.d ? c.d : {}; } catch (e) { return {}; } }
window.__fdSim = window.__fdSim || mfFdSimCache();
function mfFdSimList() { const f = mfFundPrem(); f.sim = Array.isArray(f.sim) ? f.sim.slice(0, 3) : []; while (f.sim.length < 3) f.sim.push(''); return f.sim; }
function mfFdSimHtml() {
 const P = mfFundPrem(), tks = mfFdSimList(), busy = !!window.__fdSimBusy;
 const linhas = tks.map(t => String(t || '').toUpperCase().trim()).filter(t => /^[A-Z]{4}\d{1,2}$/.test(t)).map(tk => {
  const d = window.__fdSim[tk];
  if (!d) return `<div class="fdr"><div class="fdr-h"><b>${escH(tk)}</b><span class="mu">${busy ? 'buscando…' : 'toque em Calcular'}</span></div></div>`;
  if (d.erro) return `<div class="fdr"><div class="fdr-h"><b>${escH(tk)}</b><span class="fdr-tag na">Não encontrado</span></div><small class="fdr-d">${escH(d.erro)}</small></div>`;
  const ehAcao = d.tipo !== 'fii', g = ehAcao ? mfGrahamFrom(d.lpa, d.vpa, d.preco) : { ok: false, justo: null, margem: null }, b = mfBazinFrom(d.proventos, d.preco, P.dy, P.anos);
  const det = `<small class="fdr-d">${g.ok ? `LPA ${mfBRL(g.lpa)} · VPA ${mfBRL(g.vpa)}${d.ref ? ' (' + escH(d.ref) + ')' : ''}` : ''}${g.ok && b.ok ? ' · ' : ''}${b.ok ? `proventos ${mfBRL(b.media)}/ano (média de ${b.anos} anos)` : ''}</small>
   <small class="fdr-d">Cotação ${d.preco ? mfBRL(d.preco) : '—'} · ${escH(d.fonte_preco || 'sem fonte')}</small>`;
  return mfFdRow(tk, d.preco, g, b, ehAcao, det, '');
 }).join('');
 const entradas = tks.map((t, i) => `<input type="text" data-fdsim="${i}" value="${escH(t)}" maxlength="6" placeholder="${['BBSE3', 'ITSA4', 'MXRF11'][i]}" autocapitalize="characters" autocomplete="off" spellcheck="false" aria-label="Código ${i + 1}">`).join('');
 return B('i_fdsim') + `<section class="c mf-fund mf-fd-sim"><h2>Simular Graham e Bazin</h2>
  <p class="mf-fd-sub">Digite até 3 códigos. Busco a cotação, o LPA, o VPA e os proventos sozinho.</p>
  <div class="fds-in">${entradas}</div>
  <button type="button" class="primary-btn fds-go" data-fdsimgo="1"${busy ? ' disabled' : ''}>${busy ? 'Buscando…' : 'Calcular'}</button>
  <div class="fd-acts"><button type="button" class="${window.__fdInfo === 'bazin' ? 'on' : ''}" data-fdinfo="bazin">O que é método Bazin</button><button type="button" class="${window.__fdInfo === 'graham' ? 'on' : ''}" data-fdinfo="graham">O que é método Graham</button></div>
  ${window.__fdInfo === 'bazin' ? '<div class="fd-info"><b>Método Bazin</b><p>Criado por Décio Bazin, foca em renda de dividendos. O preço teto é o provento médio por cota dos últimos anos dividido pelo rendimento que você deseja (por padrão, 6% ao ano). Se o preço atual está abaixo do teto, o ativo está dentro da regra.</p></div>' : window.__fdInfo === 'graham' ? '<div class="fd-info"><b>Método Graham</b><p>Criado por Benjamin Graham, foca em valor. O valor justo é a raiz quadrada de 22,5 × LPA × VPA (lucro e valor patrimonial por ação). Se o preço atual está abaixo do valor justo, o ativo está dentro da regra. Vale para ações; fundos não têm LPA.</p></div>' : ''}
  ${linhas || ''}
  ${linhas ? '<p class="mf-fd-f">Usa o rendimento e os anos definidos em "Meus ativos". Fonte: Dados B3 (CVM) e Yahoo Finance.</p>' : ''}</section>`;
}
function mfFdSimGo() {
 const tks = mfFdSimList().map(t => String(t || '').toUpperCase().trim()).filter((t, i, a) => /^[A-Z]{4}\d{1,2}$/.test(t) && a.indexOf(t) === i);
 if (!tks.length) { if (window.mfToast) mfToast('Digite o código de uma ação ou fundo (ex.: BBSE3).'); return; }
 if (typeof supabaseClient === 'undefined' || !supabaseClient || typeof authUser === 'undefined' || !authUser) { if (window.mfToast) mfToast('Entre na sua conta para buscar os dados automáticos.'); return; }
 if (!navigator.onLine) { if (window.mfToast) mfToast('Sem conexão.'); return; }
 window.__fdSimBusy = 1; draw();
 MF_DB.quotes.fundamentals({ body: { tickers: tks, completo: true } }).then(({ data, error }) => {
  window.__fdSimBusy = 0;
  tks.forEach(t => { const d = data && data.dados && data.dados[t]; window.__fdSim[t] = d || { erro: error ? 'Não consegui buscar agora. Tente de novo.' : 'Código sem dados na Dados B3/Yahoo.' }; });
  try { localStorage.setItem('fin1_fdsim', JSON.stringify({ at: TD, d: window.__fdSim })); } catch (_) { }
  draw();
 }, () => { window.__fdSimBusy = 0; tks.forEach(t => { window.__fdSim[t] = { erro: 'Sem conexão com a fonte de dados.' }; }); draw(); });
}
/* ===== 1.11 · Recomendações das casas de análise (aba Análise) =====
   Só os ativos da carteira. Consenso automático (função "recomendacoes": Yahoo Finance, fonte gratuita não oficial: alvo médio, mínimo,
   máximo, nº de analistas e recomendação geral; guardado no aparelho por um dia em fin1_frec). Só leitura: o Yahoo não entrega o preço-alvo
   por casa, e a digitação manual (S.fund.rec) foi retirada da tela na 1.12 (dados já salvos ficam guardados). Nada é inventado. */
var MF_REC_NOMES = { strong_buy: 'Compra forte', buy: 'Compra', hold: 'Neutro', underperform: 'Abaixo do mercado', sell: 'Venda', strong_sell: 'Venda forte' };
function mfRecCache() { try { const c = JSON.parse(localStorage.getItem('fin1_frec') || 'null'); return c && c.d ? c : null; } catch (e) { return null; } }
function mfRecTks() { return [...new Set(mfHeld().map(h => h.tk).filter(t => /^[A-Z]{4}\d{1,2}$/.test(t)))].sort(); }
function mfRecLoad() {
 const A = mfRecTks(), key = A.join(','), c = mfRecCache();
 if (!A.length || typeof supabaseClient === 'undefined' || !supabaseClient || typeof authUser === 'undefined' || !authUser || !navigator.onLine) return;
 if (c && c.at === TD && c.k === key) return;
 if (window.__recBusy || (window.__recTry && Date.now() - window.__recTry < 300000)) return;
 window.__recBusy = 1; window.__recTry = Date.now();
 MF_DB.quotes.recommendations({ body: { tickers: A } }).then(({ data, error }) => {
  window.__recBusy = 0; if (error || !data || !data.dados) return;
  try { localStorage.setItem('fin1_frec', JSON.stringify({ at: TD, k: key, em: data.em || new Date().toISOString(), d: data.dados })); } catch (_) { }
  if (tab === 'inv' && mfInvMode() === 'fund') mfDrawLater();
 }, () => { window.__recBusy = 0; });
}
(window.__mfAD = window.__mfAD || []).push(() => { try { if (tab === 'inv' && mfInvMode() === 'fund') mfRecLoad(); } catch (e) { } });
function mfRecData(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '')); return m ? `${m[3]}/${m[2]}/${m[1]}` : '—'; }
function mfRecHtml() {
 const A = mfRecTks(), c = mfRecCache(), d = (c && c.d) || {}, busy = !!window.__recBusy;
 const lin = A.filter(t => d[t]).map(t => {
  const x = d[t], faixa = x.baixo && x.alto ? `${mfBRL(x.baixo)} a ${mfBRL(x.alto)}` : '', n = x.n ? x.n + (x.n === 1 ? ' analista' : ' analistas') : '',
   rec = MF_REC_NOMES[x.rec] || '', cls = /buy/.test(x.rec) ? ' up' : /sell|underperform/.test(x.rec) ? ' dn' : '';
  return `<div class="rc-r"><b>${escH(t)}</b><span class="rc-v">${x.medio ? mfBRL(x.medio) : '—'}</span>
   <small>${escH([faixa, n].filter(Boolean).join(' · '))}</small>${rec ? `<em class="rc-b${cls}">${escH(rec)}</em>` : '<em></em>'}</div>`;
 }).join('');
 const quando = c && c.em ? mfRecData(String(c.em).slice(0, 10)) : '';
 const corpo = lin ? `<div class="rc-l">${lin}</div><p class="mf-fd-f">Preço-alvo médio dos analistas · Yahoo Finance${quando ? ' · atualizado em ' + quando : ''}</p>`
  : `<p class="mf-empty">${!A.length ? 'Cadastre ações ou fundos na carteira para ver as recomendações.' : busy ? 'Buscando o consenso dos analistas…' : (typeof authUser === 'undefined' || !authUser) ? 'Entre na sua conta para buscar o consenso dos analistas.' : 'Sem consenso de analistas para os seus ativos agora. Toque em Atualizar em Meus ativos.'}</p>`;
 return B('i_recom') + `<section class="c mf-fund mf-rec"><h2>Recomendações das casas de análise</h2>${corpo}</section>`;
}
function mfFundHtml() { return mfFdMeusHtml() + mfRecHtml() + mfFdSimHtml(); }
window.mfFundHtml = mfFundHtml;
document.addEventListener('click', e => {
 const t = e.target; if (!t || !t.closest) return; let b;
 if (b = t.closest('#app [data-fdinfo]')) { e.preventDefault(); e.stopPropagation(); window.__fdInfo = window.__fdInfo === b.dataset.fdinfo ? '' : b.dataset.fdinfo; draw(); return; }
 if (t.closest('#app [data-fdref]')) { e.preventDefault(); e.stopPropagation(); try { localStorage.removeItem('fin1_fund'); } catch (_) { } mfProvMercadoVencer(); try { localStorage.removeItem('fin1_frec'); } catch (_) { } window.__fundTry = 0; window.__pmTry = 0; window.__recTry = 0; mfFundLoad(); mfProvMercadoLoad(); mfRecLoad(); if (window.mfToast) mfToast('Atualizando LPA, VPA e proventos…'); return; }
 if (t.closest('#app [data-fdsimgo]')) { e.preventDefault(); e.stopPropagation(); const a = document.activeElement; if (a && a.blur) a.blur(); mfFdSimGo(); }
}, true);
document.addEventListener('input', e => { const i = e.target; if (i && i.matches && i.matches('[data-fdsim]')) { const p = i.selectionStart; i.value = i.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); try { i.setSelectionRange(p, p); } catch (_) { } mfFdSimList()[+i.dataset.fdsim] = i.value; } }, true);
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.matches && e.target.matches('[data-fdsim]')) { e.preventDefault(); e.target.blur(); mfFdSimGo(); } }, true);
document.addEventListener('change', e => {
 const i = e.target.closest && e.target.closest('[data-fdlpa],[data-fdvpa],[data-fddy],[data-fdanos]');
 if (!i) return;
 const P = mfFundPrem(), v = Math.max(0, +String(i.value).replace(',', '.') || 0);
 if (i.dataset.fddy) P.dy = v || MF_FUND_DY;
 else if (i.dataset.fdanos) P.anos = v || MF_FUND_ANOS;
 else {
  const tk = String(i.dataset.fdlpa || i.dataset.fdvpa).toUpperCase(), a = P.at[tk] = P.at[tk] || {};
  if (i.dataset.fdlpa) a.lpa = v; else a.vpa = v;
  if (!a.lpa && !a.vpa) delete P.at[tk];
 }
 mfFundPrem(); save(); draw();
}, true);
(function () {
 /* os blocos de Graham/Bazin vêm ANTES dos de simulação (que agora também moram em "Análise") */
 const ins = a => { if (!a) return; MF_INV_FUND.forEach(k => { if (a.includes(k)) return; const j = a.findIndex(x => MF_INV_SIM.includes(x)); if (j < 0) a.push(k); else a.splice(j, 0, k); }); };
 window.__mfPre.push(function () {
  try {
   const L = S.lay || (S.lay = {}); if (L.__fd02) return; L.__fd02 = 1;
   if (L.o && Array.isArray(L.o.inv)) { const a = L.o.inv.filter(x => !MF_INV_FUND.includes(x)), j = a.findIndex(x => MF_INV_SIM.includes(x)); a.splice(j < 0 ? a.length : j, 0, ...MF_INV_FUND); L.o.inv = a; }
   if (L.sg && Array.isArray(L.sg.inv)) L.sg.inv = L.sg.inv.filter(x => x !== 'sim');
  } catch (e) { }
 });
 window.__mfPre.push(function () {
  try { const L = S.lay || (S.lay = {}); if (L.__rec01) return; L.__rec01 = 1; if (L.o && Array.isArray(L.o.inv) && !L.o.inv.includes('i_recom')) { const j = L.o.inv.indexOf('i_fdsim'); L.o.inv.splice(j < 0 ? L.o.inv.length : j + 1, 0, 'i_recom'); } } catch (e) { }
 });
 window.__mfPre.push(function () {
  try { const L = S.lay || (S.lay = {}); if (L.__rec02) return; L.__rec02 = 1; [L, S.layD].forEach(Y => { const a = Y && Y.o && Y.o.inv; if (!Array.isArray(a) || !a.includes('i_fdmeus')) return; const k = a.indexOf('i_recom'); if (k >= 0) a.splice(k, 1); a.splice(a.indexOf('i_fdmeus') + 1, 0, 'i_recom'); }); } catch (e) { }
 });
 ins(MF_ORD.inv); ins(MF_ORD_D.inv);
 try { MF_REC_TRAVA.invest_avancado.inv.push(...MF_INV_FUND); } catch (e) { }
 if (typeof MF_VIEW !== 'undefined') {
  MF_VIEW.i_fdmeus = { t: 'Meus ativos · Graham e Bazin', o: [{ k: 'f', l: 'Fonte e data', g: 'Informações secundárias', sel: '.mf-fd-meus .mf-fd-f', t: 'b', d: true }] };
  MF_VIEW.i_recom = { t: 'Recomendações das casas de análise', o: [{ k: 'f', l: 'Fonte', g: 'Informações secundárias', sel: '.mf-rec .mf-fd-f', t: 'b', d: true }] };
  MF_VIEW.i_fdsim = { t: 'Simular Graham e Bazin', o: [{ k: 'ex', l: 'Explicação', g: 'Informações secundárias', sel: '.mf-fd-sim .mf-fd-sub', t: 'b', d: true }, { k: 'f', l: 'Fonte', g: 'Informações secundárias', sel: '.mf-fd-sim .mf-fd-f', t: 'b', d: true }] };
 }
})();

/* ===== Fase 3 · M11 (Dividendos): o calendário de pagamentos usa a mesma mecânica do Calendário do Dashboard =====
   Recolhido: tira de dias com pagamento (arrasta para o lado) · Aberto: o calendário do mês (grade ou lista, como já era).
   Tocar num dia mostra os pagamentos logo abaixo do calendário, sem janela. Os valores continuam os mesmos de antes. */
window.__pvExp = window.__pvExp || false; window.__pvDay = window.__pvDay || null;
(function () {
  const _x = mfPvExtraHtml, W = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  mfPvExtraHtml = function () {
    const h = _x(), m = h.match(/<section class="c mf-pvx mf-pvcal">([\s\S]*?)<\/section>/), ev = window.__pvcalEv || [];
    if (!m || !ev.length) return h;
    const exp = true /* 1.35: só o calendário normal (mês completo), sem faixa de dias nem botão de recolher */, dias = [...new Set(ev.map(e => e.d))].sort(), day = dias.includes(window.__pvDay) ? window.__pvDay : null;
    const tg = '';
    const eco = (m[1].match(/<div class="an-eco">[\s\S]*?<\/div>/) || [''])[0];
    let corpo;
    if (exp) corpo = m[1].replace('<h2>Calendário de pagamentos</h2>', '');
    else {
      let ult = '';
      const chips = dias.map(d => {
        const dt = new Date(d + 'T12:00:00'), tot = ev.filter(e => e.d === d), ok = tot.every(e => e.ok), novoMes = d.slice(0, 7) !== ult; ult = d.slice(0, 7);
        return `<button type="button" class="mf-dia-d${d === day ? ' on' : ''}${d === TD ? ' hoje' : ''}${novoMes ? ' m1' : ''}" data-pvday="${d}" aria-pressed="${d === day}" aria-label="${+d.slice(8)} de ${MESF[+d.slice(5, 7) - 1].toLowerCase()}, ${tot.length} ${tot.length === 1 ? 'pagamento' : 'pagamentos'}">${novoMes ? `<em>${MES[+d.slice(5, 7) - 1]}</em>` : ''}<b>${+d.slice(8)}</b><small>${W[dt.getDay()].slice(0, 3).replace(/^./, c => c.toUpperCase())}</small><span class="mf-dia-dots"><i class="${ok ? 'in' : 'out'}"></i></span></button>`;
      }).join('');
      corpo = eco + `<div class="mf-dia-strip" data-pvstrip>${chips}</div>`;
    }
    let det = '';
    if (day) {
      const E = ev.filter(e => e.d === day), tot = E.reduce((s, e) => s + e.v, 0);
      det = `<div class="mfu-det"><div class="mf-dia-h"><span>${+day.slice(8)} de ${MESF[+day.slice(5, 7) - 1].toLowerCase()} · ${W[new Date(day + 'T12:00:00').getDay()]}</span><div class="mf-dia-t"><em class="ok">${R(tot)}</em></div></div>${E.map(e => `<div class="mf-pvday-r"><span><b>${escH(e.t)}</b><small class="mu">${e.tp}${e.ok ? ' · recebido' : ' · a receber'}</small></span><b class="${e.ok ? 'ok' : ''}">${R(e.v)}</b></div>`).join('')}</div>`;
    } else if (!exp) det = '<p class="mf-empty mf-dia-vz">Toque em um dia para ver os pagamentos.</p>';
    else det = '';
    const novo = `<section class="c mf-pvx mf-pvcal mfu${exp ? ' mfu-cal' : ''}"><div class="mfu-h"><h2>Calendário de pagamentos</h2>${tg}</div>${corpo}${det}</section>`;
    return h.replace(m[0], novo);
  };
  /* tocar num dia: mostra embaixo (antes abria uma janela) */
  mfPvDay = function (d) { if (window.__diaDragged) { window.__diaDragged = false; return; } window.__pvDay = window.__pvDay === d ? null : d; draw(); };
  document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('#app [data-pvexp]'); if (!b) return; e.preventDefault(); e.stopPropagation(); window.__pvExp = !window.__pvExp; draw(); }, true);
  document.addEventListener('scroll', e => { const s = e.target; if (s && s.matches && s.matches('[data-pvstrip]')) window.__pvScroll = s.scrollLeft; }, true);
  window.__mfAD.push(function () { const s = document.querySelector('#app [data-pvstrip]'); if (s && window.__pvScroll) s.scrollLeft = window.__pvScroll; });
})();

/* ===== 1.32 · Investimentos › Proventos mais enxuta =====
   Saem da tela (a pedido): Proventos (lista + histórico de dividendos), Dividend yield (DY antigo), Dividendos nos últimos 12 meses,
   Renda por ativo, Próximos pagamentos e Yield sobre o preço pago. Ficam: topo (A receber/DY da carteira), Calendário de pagamentos,
   Proventos ano a ano e Reinvestir os proventos. Só esconde o desenho: as funções, os dados e os cálculos continuam como estavam. */
(function () {
  const vazio = () => '';
  ['mfProvBlock', 'mfPyldHtml', 'mfPvPrevHtml', 'mfPvComHtml', 'mfPvYocHtml'].forEach(n => { try { if (typeof window[n] === 'function') { window[n] = vazio; } } catch (e) { console.warn(e); } });
  /* "Renda por ativo" vem dentro do bloco do calendário (mfPvExtraHtml): tira só a seção dele */
  const _x = window.mfPvExtraHtml;
  if (typeof _x === 'function') {
    mfPvExtraHtml = function () { return _x().replace(/<!--b:i_pvativo-->[\s\S]*?<\/section>/, ''); };
    window.mfPvExtraHtml = mfPvExtraHtml;
  }
})();
