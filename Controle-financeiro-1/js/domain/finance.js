/* Domínio · Saldo, lançamentos, transferências, datas e parcelas (1.30 · Fase 4)
   Funções de cálculo movidas SEM alteração de texto (provado por comparação do código de cada função antes/depois).
   Leem o estado global (S, TD…) só na hora da chamada; não mexem na tela. Teste: testes/casos/26-caracterizacao-calculos-130.js */
function isInvoicePayment(t){return !!t&&(t.kind==='pagamento_fatura'||t.t==='Fatura'||/^(pagar|pagamento|quitar|quita[cç][aã]o)\s+(a\s+)?fatura\b|^fatura\s+(do\s+)?cart[aã]o\s+(paga|pagamento)\b/i.test(String(t.n||'').trim()))}
function txValue(t){return Math.abs(+t.v||0)}
function mfAccs(){return Array.isArray(S.contas)?S.contas.filter(a=>a&&a.id):[]}
function mfAccMain(){const L=mfAccs();return L.length?L[0].id:'a1'}
function mfAccName(id){const a=mfAccs().find(x=>x.id===id);return a?a.n:'Conta principal'}
function mfIniEntries(){return mfAccs().filter(a=>Math.abs(+a.ini||0)>0.004).map(a=>({id:'ini_'+a.id,n:'Saldo inicial · '+a.n,v:+a.ini,d:a.iniD||'2000-01-01',c:'',t:'',ini:1,acc:a.id}))}
/* Proventos (dividendos/JCP que o app lança sozinho ou marcados como "Proventos") ficam só em Investimentos › Proventos:
   não entram no saldo, no fluxo de caixa, nas receitas do mês nem na lista de Lançamentos (Script 1 · 15). */
function mfIsProvCx(t){return !!t&&t.c==='Receita'&&(!!t.pva||t.s==='Proventos')}
/* Saldo inicial lançado como receita: entra no saldo, mas não é renda do mês (fica fora das receitas do mês e da economia). */
function mfIsSaldoIni(t){return !!t&&t.c==='Receita'&&(t.s==='Saldo inicial'||!!t.saldoIni||/^saldo\s+inicial\b/i.test(String(t.n||'').trim()))}
function mfIsTr(t){return !!t&&(t.kind==='transf'||t.t==='Transf')}
function mfTrCash(t){const v=+t.v||0;return (String(t.to||'').startsWith('conta:')?v:0)-(String(t.from||'').startsWith('conta:')?v:0)}
function mfTrSide(x){x=String(x||'');return x.startsWith('conta:')?mfAccName(x.slice(6)):x.startsWith('cx:')?x.slice(3):x.startsWith('ativo:')?x.slice(6)+' (venda)':'—'}
/* saldo de uma conta (mesma regra do saldo do app) */
function mfAccBal(id,date){date=date||TD;const main=mfAccMain();let b=0;
 mfAccs().forEach(a=>{if(a.id===id&&(a.iniD||'2000-01-01')<=date)b+=+a.ini||0});
 S.tx.forEach(t=>{if(!t||!t.d||t.d>date)return;const v=+t.v||0;
  if(mfIsTr(t)){if(t.from==='conta:'+id)b-=v;if(t.to==='conta:'+id)b+=v;return}
  if(isInvoicePayment(t)||t.t==='Crédito'||t.t==='Reserva'||isVR(t)||mfIsProvCx(t))return;if((t.acc||main)!==id)return;b+=t.c==='Receita'?v:-v});
 if(id===main)b-=mfFatOut().filter(f=>f.d<=date).reduce((s,f)=>s+f.v,0);return Math.round(b*100)/100}
function mfFatOut(){const keys=new Set();
 S.tx.forEach(t=>{if(!t||!t.d)return;if(t.t==='Crédito'&&+t.v>0){const k=invoiceDueDate(t).slice(0,7);if(k>=AUTO)keys.add(k)}else if(isInvoicePayment(t))keys.add(mfPayK(t))});
 return [...keys].map(k=>{const paid=S.tx.filter(t=>t&&t.d&&isInvoicePayment(t)&&mfPayK(t)===k).reduce((s,t)=>s+txValue(t),0);let inv=null;try{inv=cbInvoice(k)}catch(e){}
  const tot=k>=AUTO&&inv?+inv.total||0:0,v=Math.max(tot,paid),d=(inv&&inv.due)||(k+'-10');return v>0.005?{id:'fo'+k,n:'Fatura do cartão',v,d,c:'',t:'Fatura',auto:1,fo:1,k}:null}).filter(Boolean)}
function led(){let s=0;return [...S.tx.filter(t=>!mfIsProvCx(t)),...autos().map(t=>Object.assign({},t,{est:1})),...mfFatOut(),...mfIniEntries()].sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:(a.fo?1:b.fo?-1:0)).map(t=>{if(t.fo)s-=+t.v||0;else if(t.ini)s+=+t.v||0;else if(mfIsTr(t))s+=mfTrCash(t);else if(isInvoicePayment(t)){/* quitação ou estimativa: o saldo já conta a fatura no vencimento */}else if(t.t!=='Crédito'&&t.t!=='Reserva'&&!isVR(t))s+=t.c==='Receita'?(+t.v||0):-(+t.v||0);return{...t,s}})}
function cashBalanceAt(date=TD){let balance=-mfFatOut().filter(f=>f.d<=date).reduce((a,f)=>a+f.v,0)+mfIniEntries().filter(f=>f.d<=date).reduce((a,f)=>a+f.v,0);S.tx.filter(t=>t.d<=date).sort((a,b)=>a.d.localeCompare(b.d)).forEach(t=>{if(isInvoicePayment(t)||mfIsProvCx(t))return;if(mfIsTr(t)){balance+=mfTrCash(t);return}if(t.t==='Crédito'||t.t==='Reserva'||isVR(t))return;if(t.c==='Receita')balance+=(+t.v||0);else balance-=(+t.v||0)});const reserveMoves=S.tx.filter(t=>t.d<=date&&t.t==='Reserva').reduce((a,t)=>a+(+t.v||0),0);return balance-reserveMoves}
function todayISO(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function anSpend(t){return t&&t.c&&t.c!=='Receita'&&t.c!=='Investimento'&&t.t!=='Fatura'&&t.t!=='Reserva'&&!isVR(t)&&!isInvoicePayment(t)}
function addDaysISO(d,n){const x=new Date((d||TD)+'T12:00:00');x.setDate(x.getDate()+n);return iso(x)}
function shiftMonthDate(d,off){const a=(d||TD).split('-').map(Number),x=new Date(a[0],a[1]-1+off,1);const last=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();x.setDate(Math.min(a[2]||1,last));return iso(x)}
function splitIntoInstallments(row,count,existingId){count=Math.max(1,Math.min(120,parseInt(count,10)||1));if(count<=1){const clean={...row};delete clean.installmentId;delete clean.installmentIndex;delete clean.installmentCount;return [clean]}const totalCents=Math.round(Math.abs(+row.v||0)*100),base=Math.floor(totalCents/count),id='inst'+Date.now()+Math.random().toString(36).slice(2,7),rows=[];for(let i=0;i<count;i++){const cents=i===count-1?totalCents-base*(count-1):base;rows.push({...row,id:i===0?(existingId||row.id||('n'+Date.now())):('n'+Date.now()+i+Math.random().toString(36).slice(2,6)),n:`${String(row.n||'Compra').trim()} (${i+1}/${count})`,v:(row.v<0?-1:1)*cents/100,d:shiftMonthDate(row.d||TD,i),installmentId:id,installmentIndex:i+1,installmentCount:count})}return rows}
function genRecurringMonths(item,start=0,count=12){
  S.recurring=S.recurring||[]; S.tx=S.tx||[];
  // Mantém sempre os próximos 12 meses gerados, mesmo quando a regra foi criada há mais de um ano.
  // Meses que a pessoa apagou ficam em item.skip e NÃO são recriados. Cada mês tem id fixo (recorrente + mês) e guarda o mês de origem (rm),
  // assim dois aparelhos geram o mesmo lançamento e um mês editado/movido não é recriado.
  const base=item.start||TD, baseParts=base.split('-').map(Number), nowParts=TD.split('-').map(Number);
  const offsetNow=Math.max(0,(nowParts[0]-baseParts[0])*12+(nowParts[1]-baseParts[1]));
  const first=Math.max(start,offsetNow),skip=new Set(Array.isArray(item.skip)?item.skip:[]);
  for(let j=first;j<first+count;j++){
    const d=shiftMonthDate(base,j),key=d.slice(0,7);
    if(key<TD.slice(0,7)||skip.has(key)||S.tx.some(t=>t.id==='rc_'+item.id+'_'+key||(t.recurringId===item.id&&(t.rm||(t.d&&t.d.slice(0,7)))===key)))continue;
    S.tx.push({id:'rc_'+item.id+'_'+key,rm:key,n:item.n,v:+item.v||0,e:'',d,c:item.c||'Contas Fixas',g:item.g||inferMain(item.c,item.s),s:item.s||inferSub(item.c||'Contas Fixas'),t:item.t||'Pix',recurringId:item.id,autoRecurring:true,pendingConfirm:!!item.confirm});
  }
}
/* Ao apagar um mês de um recorrente, guarda esse mês no próprio recorrente (sincroniza entre aparelhos) para ele não ser recriado */
function mfRecSkip(t){if(!t||!t.recurringId||!Array.isArray(S.recurring))return;const it=S.recurring.find(x=>x.id===t.recurringId);if(!it)return;const k=t.rm||String(t.d||'').slice(0,7);if(!/^\d{4}-\d{2}$/.test(k))return;const L=Array.isArray(it.skip)?it.skip:(it.skip=[]);if(!L.includes(k)){L.push(k);L.sort()}}
/* Script 1 · 19C: a mesma conta cadastrada nos dois tipos de recorrente (o antigo, que o app gera sozinho, e o da tela Recorrentes)
   cai duas vezes no mesmo mês e o saldo/fluxo contam as duas. Devolve, do mês atual em diante, os meses repetidos que a pessoa
   ainda não marcou como "não é duplicado". Só aponta: não apaga nada. */
function mfDupRec(){const cur=TD.slice(0,7),ok=new Set(Array.isArray(S.dupOk)?S.dupOk:[]),norm=x=>mfNormTxt(x),out=[];
 const fx=S.tx.filter(t=>t&&t.fixedId&&t.d&&t.d.slice(0,7)>=cur);if(!fx.length)return out;
 S.tx.forEach(r=>{if(!r||!r.recurringId||!r.d||r.d.slice(0,7)<cur)return;const m=r.d.slice(0,7),n=norm(r.n);if(!n)return;
  const f=fx.find(t=>t.d.slice(0,7)===m&&norm(t.n)===n&&(t.c==='Receita')===(r.c==='Receita'));if(!f)return;
  const key=r.recurringId+'|'+f.fixedId;if(!ok.has(key))out.push({key,m,n:r.n,rec:r,fx:f})});
 return out.sort((a,b)=>a.m.localeCompare(b.m))}
function mfMonthOf(t){return t&&t.t==='Crédito'?invoiceDueDate(t).slice(0,7):String((t&&t.d)||'').slice(0,7)}
function mfDayOf(t){return t&&t.t==='Crédito'?invoiceDueDate(t):String((t&&t.d)||'')}
function mfIsSpend(t){return !!t&&anSpend(t)&&(+t.v||0)>0}
function mfIsRec(t){return !!t&&t.c==='Receita'&&(!isVR(t)||t.vrFoodIncome)&&!mfIsProvCx(t)&&!mfIsSaldoIni(t)}
/* Compras do mês agrupadas pelo nome parecido (Script 1 · 16): mostra quantas vezes a mesma compra aparece, quanto soma e com que frequência.
   É só um jeito de ver: nenhum lançamento é criado, juntado ou alterado, então não há risco de duplicar nada.
   Conta pela data da compra (igual à Distribuição 50/30/20), não pelo mês da fatura.
   Pagamento de fatura e a própria fatura ficam de fora (já estão nas saídas pelas compras). */
function mfCmpGrupos(k){const M=new Map();
 S.tx.forEach(t=>{if(!t||!t.d||!mfIsSpend(t)||t.d.slice(0,7)!==k)return;if(isInvoicePayment(t)||mfIsFatLanc(t)||mfIsTr(t))return;
  const nome=String(t.n||t.c||'Compra').replace(/\s*\(\d+\/\d+\)\s*$/,'').trim(),ch=mfNormTxt(nome);if(!ch)return;
  let g=M.get(ch);if(!g)M.set(ch,g={ch,n:nome,q:0,v:0,dias:new Set(),cred:0});
  g.q++;g.v+=Math.abs(+t.v||0);g.dias.add(t.d);if(t.t==='Crédito')g.cred++});
 return [...M.values()].map(g=>{const dias=[...g.dias].sort(),span=dias.length>1?Math.round((new Date(dias[dias.length-1]+'T12:00:00')-new Date(dias[0]+'T12:00:00'))/864e5)+1:1;
   const sem=g.q/(Math.max(span,7)/7),v=Math.round(g.v*100)/100;
   return {ch:g.ch,n:g.n,q:g.q,v,med:Math.round(v/g.q*100)/100,cred:g.cred,dias,span,
    ritmo:g.q<2?'':sem>=1.8?Math.round(sem)+' vezes por semana':g.q+' vezes no mês'}})
  .sort((a,b)=>b.v-a.v||b.q-a.q)}
function dashStats(key,monthToDate=false){
 const cut=monthToDate?Math.min(+TD.slice(8),new Date(+key.slice(0,4),+key.slice(5,7),0).getDate()):31,okDay=d=>!monthToDate||+String(d).slice(8,10)<=cut;
 const rec=S.tx.filter(t=>t.d&&t.d.slice(0,7)===key&&mfIsRec(t)&&okDay(t.d)).reduce((a,t)=>a+(+t.v||0),0);
 const rows=mfSpendRows(key).filter(t=>okDay(t.d)),exp=rows.reduce((a,t)=>a+(+t.v||0),0),cats={};
 rows.forEach(t=>{if(mfIsFatLanc(t))return;cats[t.c]=(cats[t.c]||0)+(+t.v||0)});
 return {rec,exp,balance:rec-exp,cats};
}
function mfDaysTo(d){return Math.round((new Date(d+'T12:00:00')-new Date(TD+'T12:00:00'))/864e5)}
