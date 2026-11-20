/* Domínio · Proventos e DY (1.30 · Fase 4)
   Funções de cálculo movidas SEM alteração de texto (provado por comparação do código de cada função antes/depois).
   Leem o estado global (S, TD…) só na hora da chamada; não mexem na tela. Teste: testes/casos/26-caracterizacao-calculos-130.js */
function mfIsProv(t){return !!t&&t.c==='Receita'&&(t.s==='Proventos'||/divid|provent|\bjcp\b|juros sobre|rendiment|amortiza/i.test(t.n||'')||/\b[A-Z]{4}\d{1,2}\b/.test(t.n||''))}
function mfProvAll(){const tx=S.tx.filter(t=>t&&t.d&&mfIsProv(t)),rows=((window.__pva||{}).rows||[]).concat((S.pvHist&&Array.isArray(S.pvHist.rows))?S.pvHist.rows:[]),cut=nm(TD.slice(0,7),-12)+'-01';if(!rows.length)return tx;
 const has=new Set(tx.flatMap(t=>[t.id,t.pvk].filter(Boolean))),man=new Set(tx.map(t=>(mfProvTk(t)||'')+'|'+t.d.slice(0,7))),out=tx.slice();
 rows.forEach(r=>{const d=mfPvaDate(r),id=mfPvaId(r),v=Math.round((+r.total||0)*100)/100,tk=String(r.ticker||'').toUpperCase();
  if(!d||d>TD||d>=MF_PVA_DESDE||d<cut||!(v>0)||has.has(id)||man.has(tk+'|'+d.slice(0,7)))return;has.add(id);
  out.push({id:'h_'+id,n:'Proventos '+tk,v,d,c:'Receita',s:'Proventos',tk,tp:r.tipo||'',hist:1})});
 return out}
function mfProvRows(){return mfProvAll().filter(t=>t.d&&t.d<=TD&&mfIsProv(t)).sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0)}
function mfFutData(k){const sum=(L,dt)=>{let r=0,p=0;L.forEach(t=>{const v=Math.abs(+t.v||0);if(String(dt(t)).slice(0,10)<=TD)r+=v;else p+=v});return {r,p,t:r+p}};
 const e=sum(S.tx.filter(t=>t.d&&t.d.slice(0,7)===k&&mfIsRec(t)),t=>t.d),
  s=sum(mfSpendRows(k,true),t=>t.d),
  i=sum(S.tx.filter(t=>t.d&&t.d.slice(0,7)===k&&t.c==='Investimento'),t=>t.d);
 return {k,e,s,i,bal:e.t-s.t-i.t}}
/* gráfico ano a ano (todos os proventos já lançados: automáticos e manuais) */
function mfProvYears(){const m={};mfProvAll().forEach(t=>{if(t.d&&t.d<=TD&&mfIsProv(t)){const y=t.d.slice(0,4);m[y]=(m[y]||0)+(+t.v||0)}});
 const ys=Object.keys(m).sort();if(!ys.length)return null;const all=[];for(let y=+ys[0];y<=+TD.slice(0,4);y++)all.push(String(y));return all.map(y=>({y,v:m[y]||0}))}
/* todos os proventos (pagos e anunciados) numa lista só: {tk, d, tp, vc, qt, v, pago} */
/* Proventos JÁ RECEBIDOS nos meses pedidos, separados em dividendos (inclui rendimento de FII e amortização) e JCP (Script 1 · 18).
   Sai de mfIvEvents(), que junta os lançados à mão e os automáticos sem repetir nenhum. Serve para a rentabilidade da carteira,
   não para o fluxo de caixa: dividendos e JCP não entram no saldo do app. */
function mfPvPeriodo(meses){const M=new Set(meses||[]),o={div:0,jcp:0,tot:0,porMes:new Map()};
 mfIvEvents().forEach(e=>{if(!e||!e.pago||!e.d)return;const k=e.d.slice(0,7);if(!M.has(k))return;const v=+e.v||0;if(!(v>0))return;
  if(/jcp|juros/i.test(e.tp||''))o.jcp+=v;else o.div+=v;o.tot+=v;o.porMes.set(k,(o.porMes.get(k)||0)+v)});
 const r=x=>Math.round(x*100)/100;o.div=r(o.div);o.jcp=r(o.jcp);o.tot=r(o.tot);return o}
function mfIvEvents(){const out=[],seen=new Set(),H=mfHeld(),qOf=tk=>(H.find(x=>x.tk===tk)||{}).q||0,tp=t=>/JCP|JUROS/i.test(t||'')?'JCP':/RENDIMENTO/i.test(t||'')?'Rendimento':/AMORTIZ/i.test(t||'')?'Amortização':'Dividendo';
 const add=(tk,d,t,vc,qt,v,k)=>{if(!d||!(v>0))return;const key=tk+'|'+d+'|'+tp(t)+'|'+(k||'');if(seen.has(key))return;seen.add(key);out.push({tk,d,tp:tp(t),vc:+vc||0,qt:+qt||0,v:Math.round(v*100)/100,pago:d<=TD})},pids=new Set();
 ((window.__pva||{}).rows||[]).forEach(r=>{const d=mfPvaDate(r),tk=String(r.ticker||'').toUpperCase();pids.add(mfPvaId(r));const vc=+r.valor_cota||0,v=+r.total||0,qt=+r.qtd||(vc>0?Math.round(v/vc):0);add(tk,d,r.tipo,vc,qt,v)});
 ((((mfMkt()||{}).d)||{}).proximos||[]).forEach(p=>{const q=qOf(p.ticker);if(!(q>0)||!p.pag||p.pag<=TD)return;const tk=String(p.ticker||'').toUpperCase(),dup=out.some(e=>e.tk===tk&&e.d===p.pag);if(!dup)add(tk,p.pag,p.tipo,+p.valor,q,+p.valor*q)});
 mfProvAll().filter(t=>t&&t.d&&mfIsProv(t)).forEach(t=>{if(t.pvk&&pids.has(t.pvk))return;const tk=mfProvTk(t)||String(t.n||'Provento').replace(/^Proventos?\s*/i,'').trim()||'Provento',dup=out.some(e=>e.tk===tk&&e.d===t.d&&Math.abs(e.v-(+t.v||0))<0.02);if(!dup)add(tk,t.d,t.tp||t.n,t.vc,t.qt||(t.vc>0?Math.round(t.v/t.vc):0),+t.v||0,t.id)});
 return out.sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0)}
