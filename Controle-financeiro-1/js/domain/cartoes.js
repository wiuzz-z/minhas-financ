/* Domínio · Cartões e faturas (1.30 · Fase 4)
   Funções de cálculo movidas SEM alteração de texto (provado por comparação do código de cada função antes/depois).
   Leem o estado global (S, TD…) só na hora da chamada; não mexem na tela. Teste: testes/casos/26-caracterizacao-calculos-130.js */
function ensureCardBilling(){S.cardBilling=S.cardBilling&&typeof S.cardBilling==='object'?S.cardBilling:{};S.cardBilling.dueDay=Math.max(1,Math.min(31,parseInt(S.cardBilling.dueDay||10,10)||10));S.cardBilling.bestDay=Math.max(1,Math.min(31,parseInt(S.cardBilling.bestDay||4,10)||4));if(!S.cardBillingMigrationV1){S.fatv=S.fatv&&typeof S.fatv==='object'?S.fatv:{};const moved={};Object.entries(S.fatv).forEach(([k,v])=>{const nx=nm(k,1);moved[nx]=v});S.fatv=moved;S.cardBillingMigrationV1=true;}return S.cardBilling}
function fat(){const cfg=ensureCardBilling(),dueKey=ym,creditRows=S.tx.filter(t=>t.t==='Crédito'&&t.d&&invoiceDueDate(t).slice(0,7)===dueKey),cp=creditRows.reduce((sum,t)=>sum+txValue(t),0),ov=(S.fatv||{})[dueKey],v=ov??cp,pg=S.tx.filter(t=>isInvoicePayment(t)&&t.d&&mfPayK(t)===dueKey).reduce((s,t)=>s+txValue(t),0),ab=Math.max(0,v-pg),dueDate=creditRows.map(invoiceDueDate).sort()[0]||`${dueKey}-${String(cfg.dueDay).padStart(2,'0')}`,df=v-cp;
 return `<div class=c style="margin-top:8px"><h3>Fatura com vencimento em ${lab(dueKey)} · dia ${dueDate.slice(8,10)}/${dueDate.slice(5,7)}/${dueDate.slice(0,4)}</h3><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><b class=bad style="font-size:19px">${R(ab)}</b><br><small class=mu>${dueKey>=AUTO?(TD>=dueDate?'data de vencimento atingida':'vencimento previsto em '+dueDate.slice(8,10)+'/'+dueDate.slice(5,7)):(ab?'a pagar':'✔ paga')} · total da fatura ${R(v)}${pg?' · já pago '+R(pg):''}</small></div>${ab>0&&dueKey<AUTO?`<button class=b style="width:auto" data-pay=1 data-val="${ab.toFixed(2)}" data-dt="${dueDate}">Lançar pagamento</button>`:''}</div>
 <div class=r style="margin:8px 0 0;align-items:center"><small class=mu style="flex:2">Valor da fatura no banco (deixe vazio para usar a soma dos lançamentos)</small><input data-fv inputmode=decimal placeholder="${cp.toFixed(2).replace('.',',')}" value="${ov!=null?String(ov).replace('.',','):''}"></div>${Math.abs(df)>.005?`<small class=mu>Compras vinculadas a esta fatura: ${R(cp)} · ${df>0?'faltam '+R(df)+' em compras sem lançar':'lançamentos passam '+R(-df)+' da fatura'}</small>`:''}</div>`}
function mfFatKey(k){const cfg=ensureCardBilling(),cur=TD.slice(0,7);if(k!==cur)return k;const due=Math.min(cfg.dueDay,new Date(+k.slice(0,4),+k.slice(5,7),0).getDate());return +TD.slice(8,10)>due?nm(k,1):k}
function mfPaidMap(){S.paid=S.paid&&typeof S.paid==='object'?S.paid:{};if(!S.paidSince){S.paidSince=TD;try{save()}catch(e){}}return S.paid}
/* o pagamento fica ligado à fatura certa (fk), não ao mês em que foi pago */
function mfPayK(t){return t&&t.fk?String(t.fk):String((t&&t.d)||'').slice(0,7)}
function mfFatPaid(k){const inv=cbInvoice(k);if(inv.total>0.005&&inv.paid>0.005&&inv.left<=0.005)return true;const P=mfPaidMap(),key='fat:'+k;if(key in P)return !!P[key];return inv.left<=0.005||inv.due<(S.paidSince||TD)}
function mfFatCur(){return mfFatKey(TD.slice(0,7))}
function mfFatState(k,inv){inv=inv||cbInvoice(k);if(!(inv.total>0.005))return {k:'none',t:'Sem fatura',c:'mu'};if(mfFatPaid(k))return {k:'paid',t:'Pago',c:'ok'};const d=mfDaysTo(inv.due);if(d<0)return {k:'late',t:'Vencida',c:'bad'};if(k>mfFatCur())return {k:'future',t:'Futura',c:'mu'};return {k:'open',t:d===0?'Vence hoje':'Vence em '+d+(d===1?' dia':' dias'),c:d<=5?'bad':'wa'}}
function mfFatPays(k){return S.tx.filter(t=>isInvoicePayment(t)&&t.d&&mfPayK(t)===k).sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0)}
/* status da fatura no Dashboard com o mesmo texto: Pago */
function mfFatStatus(inv,k){if(!(inv.total>0))return 'Sem fatura';if(mfFatPaid(k))return 'Pago';const d=mfDaysTo(inv.due),dt=inv.due.slice(8,10)+'/'+inv.due.slice(5,7);return d>0?`Vence ${dt} · em ${d} ${d===1?'dia':'dias'}`:d===0?`Vence hoje (${dt})`:`Venceu ${dt} · há ${-d} ${d===-1?'dia':'dias'}`}
function mfFatDays(){const v=parseInt((S.prefs||{}).fatDias,10);return [1,2,3,5,7].includes(v)?v:3}
function mfCards(){const cb=ensureCardBilling();if(!Array.isArray(S.cards))S.cards=[];S.cards=S.cards.filter(c=>c&&c.id).slice(0,MF_CC_MAX);
 let c1=S.cards.find(c=>c.id==='c1');if(!c1){c1={id:'c1',n:''};S.cards.unshift(c1)}else if(S.cards[0]!==c1){S.cards=[c1,...S.cards.filter(c=>c!==c1)]}
 c1.due=cb.dueDay;c1.best=cb.bestDay;S.cards.forEach((c,i)=>{c.due=Math.max(1,Math.min(31,parseInt(c.due,10)||10));c.best=Math.max(1,Math.min(31,parseInt(c.best,10)||4));c.n=String(c.n||'').slice(0,24);const lm=Math.max(0,Math.round((+c.lim||0)*100)/100);if(lm>0)c.lim=lm;else delete c.lim});return S.cards}
/* Limite do cartão (Script 1 · 14): quanto do limite está preso em faturas ainda não pagas.
   usado = soma, mês a mês, do que falta pagar de cada fatura (compras − pagamentos, nunca negativo).
   Assim as parcelas futuras já seguram o limite, um pagamento libera na hora e nada é contado duas vezes. */
function mfCcMeses(cid){const I=mfCcIdx(),ks=new Set();
 I.rows.forEach((v,k)=>{const i=k.lastIndexOf('|');if(k.slice(0,i)===cid&&v&&v.length)ks.add(k.slice(i+1))});
 I.pays.forEach((v,k)=>{const i=k.lastIndexOf('|');if(k.slice(0,i)===cid&&v>0.005)ks.add(k.slice(i+1))});
 return [...ks].sort()}
function mfCcLim(cid){const c=mfCards().find(x=>x.id===cid),lim=Math.max(0,Math.round((+(c&&c.lim)||0)*100)/100);
 let usado=0;mfCcMeses(cid).forEach(k=>{usado+=cbInvoice(k,cid).left});usado=Math.round(usado*100)/100;
 return {cid,lim,usado,livre:lim>0?Math.round((lim-usado)*100)/100:null,pct:lim>0?Math.round(usado/lim*1000)/10:null}}
function mfCardName(c,i){return c&&c.n?c.n:'Cartão '+((i!=null?i:mfCards().indexOf(c))+1)}
function mfCardOf(t){const id=t&&t.cc;return id&&mfCards().some(c=>c.id===id)?id:'c1'}
function mfCardById(id){return mfCards().find(c=>c.id===id)||mfCards()[0]}
/* vencimento de cada compra pelo ciclo do cartão dela */
function invoiceDueDate(t){const c=mfCardById(mfCardOf(t)),purchase=String(t?.d||TD),parts=purchase.split('-').map(Number);if(parts.length!==3||!parts[0]||!parts[1]||!parts[2])return purchase;let y=parts[0],m=parts[1];const day=parts[2];
 if(day>c.best){m++;if(m>12){m=1;y++}}if(c.due<=c.best){m++;if(m>12){m=1;y++}}const last=new Date(y,m,0).getDate();return `${y}-${String(m).padStart(2,'0')}-${String(Math.min(c.due,last)).padStart(2,'0')}`}
/* valor informado da fatura (cartão 1 continua em S.fatv, como antes) */
function mfFatvGet(cid,k){if(cid==='c1')return (S.fatv||{})[k];const o=(S.fatvc||{})[cid];return o?o[k]:undefined}
function mfFatvEff(cid,k){const fv=mfFatvGet(cid,k);if(fv==null)return undefined;const paid=mfCcIdx().pays.get(cid+'|'+k)||0;return paid>0.005&&paid>=fv-0.005?fv:undefined}
function cbInvoice(k,cid){
 if(cid){const c=mfCardById(cid),I=mfCcIdx(),rows=(I.rows.get(cid+'|'+k)||[]).slice(),sum=rows.reduce((s,t)=>s+txValue(t),0),fv=mfFatvEff(cid,k),total=fv??sum,
   paid=I.pays.get(cid+'|'+k)||0,left=Math.max(0,total-paid),
   due=rows.map(invoiceDueDate).sort()[0]||`${k}-${String(Math.min(c.due,new Date(+k.slice(0,4),+k.slice(5,7),0).getDate())).padStart(2,'0')}`;
  return{k,cid,rows,total,paid,left,due,sum}}
 const P=mfCards().map(c=>cbInvoice(k,c.id)),rows=[].concat(...P.map(x=>x.rows)),act=P.filter(x=>x.total>0.005),due=(act.length?act:P).map(x=>x.due).sort()[0];
 return{k,rows,total:P.reduce((s,x)=>s+x.total,0),paid:P.reduce((s,x)=>s+x.paid,0),left:P.reduce((s,x)=>s+x.left,0),due,cards:P}}
