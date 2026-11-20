
/* 4) classe "Reserva" (reserva de emergência) aparece como "Renda fixa" nos blocos de Investimentos */
try{IV_NOME.rv='Renda fixa';IV_NOME1.rv='Renda fixa'}catch(e){}

/* ===== Patch 94: fatura acompanha as compras · pagamento por cartão também em Vencimentos · excluir em Vencimentos · Configurar cartão mais claro ===== */
/* 1) O "valor informado" da fatura (valor no banco) só vale quando os pagamentos lançados daquele cartão e mês cobrem esse valor.
      Antes ele ficava fixo mesmo sem pagamento (ex.: 2.700 em dezembro), e a fatura parava de somar as compras novas.
      Nada é apagado dos dados: o valor continua guardado e volta a valer se houver pagamento. */
/* total da fatura (todos os cartões) quando algum cartão tem valor informado válido; senão undefined (as telas usam a soma de sempre) */
function mfFatvEffAll(k){const L=mfCards();if(!L.some(c=>mfFatvEff(c.id,k)!=null))return undefined;return cbInvoice(k).total}

/* 2) Pagar fatura (bloco do cartão): lança o pagamento de cada cartão pelo valor digitado e só depois guarda o valor informado */
function mfPayCards(k){const L=mfCards(),items=[];
 L.forEach((c,i)=>{const inp=document.querySelector(`#app [data-ccpayv="${c.id}"]`);if(!inp)return;const typed=Math.round(mfNum(inp.value)*100)/100,inv=cbInvoice(k,c.id),left=Math.round((typed-inv.paid)*100)/100;if(typed>0.005&&left>0.005)items.push({c,i,typed,left,inv})});
 if(!items.length){mfToast('Informe o valor da fatura.');return}
 mfConfirm({title:'Confirmar pagamento',ok:'Confirmar pagamento',body:`${items.length===1?`<p class="mf-cf-sub">Fatura de ${lab(k).toLowerCase()}${L.length>1?' · '+escH(mfCardName(items[0].c,items[0].i)):''} · vence ${mfDmy(items[0].inv.due)}</p><div class="mf-cf-v">${R(items[0].left)}</div>${items[0].inv.paid>0.005?`<small class="mf-cf-s">Total ${R(items[0].typed)} · já pago ${R(items[0].inv.paid)}</small>`:''}${Math.abs(items[0].typed-items[0].inv.sum)>0.005?`<small class="mf-cf-s">Soma das compras no app: ${R(items[0].inv.sum)}</small>`:''}`:`<p class="mf-cf-sub">Fatura de ${lab(k).toLowerCase()}</p>${items.map(x=>`<div class="cc-cf"><span>${escH(mfCardName(x.c,x.i))} · vence ${mfDmy(x.inv.due)}</span><b>${R(x.left)}</b></div>`).join('')}<div class="cc-cf tot"><span>Total</span><b>${R(items.reduce((s,x)=>s+x.left,0))}</b></div>`}<label class="mf-cf-f"><small>Data do pagamento</small><input type="date" data-cfdate value="${TD}" max="${TD}"></label><p class="mf-cf-note">Quita as faturas. Não entra como despesa nem no 50/30/20: as compras já contam no mês da fatura.</p>`,
  onOk:w=>{const dv=(w.querySelector('[data-cfdate]')||{}).value,dt=/^\d{4}-\d{2}-\d{2}$/.test(dv||'')&&dv<=TD?dv:TD;let n=0;
   items.forEach(x=>{S.tx.push({id:'fp'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),n:'Pagamento da fatura · '+(L.length>1?mfCardName(x.c,x.i)+' · ':'')+mfMs(k),v:x.left,e:'',d:dt,c:'',t:'Fatura',kind:'pagamento_fatura',fk:k,cc:x.c.id});n++;
    mfFatvSet(x.c.id,k,Math.abs(x.typed-x.inv.sum)>0.005?x.typed:null)});
   const P=mfPaidMap();if(mfFatPaid(k))delete P['fat:'+k];save();draw();mfToast(n>1?'Faturas pagas ✓':'Fatura paga ✓')}})}

/* 3) Pagar pela caixinha da fatura em Vencimentos: com mais de um cartão, lança um pagamento para cada cartão (antes ia tudo para o cartão 1) */
function mfPayInvoice(k,typed){const inv=cbInvoice(k),sum=inv.rows.reduce((s,t)=>s+txValue(t),0),total=typed>0?Math.round(typed*100)/100:Math.round(inv.total*100)/100;
 if(!(total>0.005)){mfToast('Informe o valor da fatura.');return}
 const left=Math.round((total-inv.paid)*100)/100;if(left<=0.005){mfToast('Essa fatura já está paga.');return}
 const L=mfCards(),many=L.length>1&&!(typed>0);
 mfConfirm({title:'Confirmar pagamento',ok:'Confirmar pagamento',
  body:`<p class="mf-cf-sub">Fatura de ${lab(k).toLowerCase()} · vence ${mfDmy(inv.due)}</p><div class="mf-cf-v">${R(left)}</div>${inv.paid>0.005?`<small class="mf-cf-s">Total ${R(total)} · já pago ${R(inv.paid)}</small>`:''}${Math.abs(total-sum)>0.005?`<small class="mf-cf-s">Soma das compras no app: ${R(sum)}</small>`:''}${many?inv.cards.filter(x=>x.left>0.005).map(x=>{const i=L.findIndex(c=>c.id===x.cid);return `<div class="cc-cf"><span>${escH(mfCardName(L[i],i))}</span><b>${R(x.left)}</b></div>`}).join(''):''}<label class="mf-cf-f"><small>Data do pagamento</small><input type="date" data-cfdate value="${TD}" max="${TD}"></label><p class="mf-cf-note">Quita a fatura. Não entra como despesa nem no 50/30/20: as compras já contam no mês da fatura.</p>`,
  onOk:w=>{const dv=(w.querySelector('[data-cfdate]')||{}).value,dt=/^\d{4}-\d{2}-\d{2}$/.test(dv||'')&&dv<=TD?dv:TD,nid=()=>'fp'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
   if(many){inv.cards.forEach(x=>{const lf=Math.round(x.left*100)/100;if(lf<=0.005)return;const i=L.findIndex(c=>c.id===x.cid);S.tx.push({id:nid(),n:'Pagamento da fatura · '+mfCardName(L[i],i)+' · '+mfMs(k),v:lf,e:'',d:dt,c:'',t:'Fatura',kind:'pagamento_fatura',fk:k,cc:x.cid})})}
   else{const cid=L[0].id;S.tx.push({id:nid(),n:'Pagamento da fatura · '+mfMs(k),v:left,e:'',d:dt,c:'',t:'Fatura',kind:'pagamento_fatura',fk:k,cc:cid});mfFatvSet(cid,k,Math.abs(total-sum)>0.005?total:null)}
   const P=mfPaidMap();delete P['fat:'+k];save();draw();mfToast('Fatura paga ✓')}})}

/* 4) Compromissos do mês: botão para excluir o lançamento (a fatura automática não tem, ela vem das compras) */
var MF_TRASH_SVG='<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function dashboardDueCenter(k){k=k||ym;const items=mfDueItems(k),pend=items.filter(x=>!x.paid).reduce((s,x)=>s+x.v,0),pago=items.filter(x=>x.paid).reduce((s,x)=>s+x.v,0);
 const rows=items.map(it=>{const [tg,tc]=mfDueTag(it);return `<div class="mf-due ${it.paid?'paid':''}"><button type="button" class="mf-due-c" data-paid="${escH(it.key)}" data-pm="${k}" aria-pressed="${it.paid}" aria-label="${it.paid?'Marcar como pendente':'Marcar como paga'}">${it.paid?'✓':''}</button><div class="mf-due-m"><b>${escH(it.n)}</b><small>${it.d.slice(8,10)}/${it.d.slice(5,7)}${it.sub?' · '+escH(it.sub):''}</small></div><div class="mf-due-r"><b>${R(it.v)}</b><small class="${tc}">${tg}</small></div>${it.fat?'<span class="mf-due-x mf-due-xv" aria-hidden="true"></span>':`<button type="button" class="mf-due-x" data-duedel="${escH(it.key)}" aria-label="Excluir ${escH(it.n)}" title="Excluir">${MF_TRASH_SVG}</button>`}</div>`}).join('');
 return `<section class="c mf-duebox"><h2>Compromissos do mês</h2><div class="mf-due-mon">${lab(k)}</div>${items.length?`<div class="mf-due-sum"><div><small>A pagar</small><b class="${pend>0?'bad':''}">${R(pend)}</b></div><div><small>Pago</small><b class="ok">${R(pago)}</b></div></div><div class="mf-due-list">${rows}</div>`:'<p class="mf-empty">Nada para pagar neste mês.</p>'}</section>`}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-duedel]');if(!b)return;e.preventDefault();e.stopPropagation();
 const cur=S.tx.find(x=>String(x.id)===String(b.dataset.duedel));if(!cur){mfToast('Esse lançamento não existe mais.');draw();return}
 if(cur.fixedId||cur.installmentId){mfSeriesSheet(cur);return}   /* recorrente/parcelado: pergunta "só este mês" ou "todos" (com desfazer) */
 const nome=String(cur.n||cur.c||'Lançamento').replace(/\s*\(\d+\/\d+\)\s*$/,'');
 mfConfirm({title:'Excluir lançamento?',ok:'Excluir',body:`<p class="mf-cf-sub">${escH(nome)} · ${String(cur.d||'').slice(8,10)}/${String(cur.d||'').slice(5,7)}</p><div class="mf-cf-v">${R(+cur.v||0)}</div><p class="mf-cf-note">Vai para a Lixeira. Se precisar, dá para restaurar por lá.</p>`,
  onOk:()=>{try{ensureTools()}catch(_){}S.trash=S.trash||[];S.trash.push({...cur,deletedAt:TD});S.tx=S.tx.filter(x=>String(x.id)!==String(cur.id));const P=mfPaidMap();if(P&&(cur.id in P))delete P[cur.id];save();draw();mfToast('Lançamento excluído · está na Lixeira')}})},true);

/* 5) Configurar cartão: botão de adicionar mais visível, com quantos cartões já existem */
(function(){const _pl=plCardBillingHtml;plCardBillingHtml=function(){let h=_pl();const n=mfCards().length;
 return h.replace('<button type="button" class="cc-add" data-ccadd>＋ Adicionar cartão</button>',`<button type="button" class="cc-add" data-ccadd>＋ Adicionar outro cartão</button><small class="mu cc-hint">Você pode cadastrar até ${MF_CC_MAX} cartões · ${n} de ${MF_CC_MAX} em uso</small>`)}})();

/* 6) Varredura: compra no cartão com "fatura" no nome (ex.: "Fatura do cartão") e COM categoria escolhida entra nos gráficos
      de categoria, 50/30/20, formas de pagamento e maiores gastos — igual já entrava no total de Despesas.
      Sem categoria continua sendo tratada como "fatura lançada inteira" (como antes). */
function mfIsFatLanc(t){if(!t||t.c==='Receita'||isInvoicePayment(t))return false;if(t.c)return false;const n=String(t.n||'');return (t.t==='Crédito'&&/\bfatura\b/i.test(n))||/\bfatura\s+(d[oa]\s+)?cart[aã]o\b/i.test(n)}
/* 7) Economia mensal: no mês atual o valor é só até hoje — o rótulo agora diz isso (a conta não mudou) */
(function(){const _f=dashboardSavingsRate;dashboardSavingsRate=function(){const h=_f();return ym===TD.slice(0,7)?h.replace('<small>Este mês</small>','<small>Este mês até hoje</small>'):h}})();


/* ===== Patch 96: Recorrentes no Crédito escolhem o cartão ===== */
/* Com 2 ou mais cartões, o recorrente no Crédito pergunta o cartão; cada mês lançado leva o cartão (cc) e entra na fatura dele, como qualquer compra. */
function mfFxCcSel(){const L=mfCards(),id=window.__fxCc;return L.some(c=>c.id===id)?id:mfCcDefault()}
function mfFxCcChips(){const L=mfCards();if(L.length<2)return '';const cur=mfFxCcSel();return `<div class="ch fx-cc" style="margin-top:8px">${L.map((c,i)=>`<button type="button" data-fx="cc" data-fxv="${c.id}" class="${c.id===cur?'on':''}">${escH(mfCardName(c,i))}</button>`).join('')}</div>`}

/* ===== Patch 97: Importar a fatura do cartão e o extrato do banco (OFX, CSV e PDF) ===== */
/* O arquivo é lido só no aparelho (nada é enviado). Antes de lançar, a lista aparece para conferir: marcar/desmarcar, nome e categoria.
   · Fatura (Contas › Cartão de crédito › Importar fatura): compras viram lançamentos no Crédito do cartão escolhido, na fatura escolhida.
     Compra com data fora do ciclo dessa fatura (ex.: parcela de compra antiga) entra no primeiro ou no último dia do ciclo.
     Pagamentos e estornos aparecem, mas não entram. Compra que já existe na fatura (mesmo valor) vem desmarcada.
   · Extrato (Lançamentos › Importar extrato): saídas viram despesas no Pix e entradas viram receitas.
     Pagamento de fatura, resgate e estorno vêm desmarcados. Lançamento igual já existente (mesmo valor e data próxima) vem desmarcado.
   Depois de lançar dá para desfazer. */
var MF_PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
var MF_IMP_MES={jan:1,fev:2,feb:2,mar:3,abr:4,apr:4,mai:5,may:5,jun:6,jul:7,ago:8,aug:8,set:9,sep:9,out:10,oct:10,nov:11,dez:12,dec:12};
function mfImpNorm(x){return String(x==null?'':x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function mfImpDec(buf){const u=new Uint8Array(buf);let t;try{t=new TextDecoder('utf-8',{fatal:true}).decode(u)}catch(e){try{t=new TextDecoder('windows-1252').decode(u)}catch(_){t=new TextDecoder().decode(u)}}return t.replace(/^﻿/,'')}
/* valor: 1.234,56 · 1,234.56 · -23,45 · (23,45) · 23,45- · 23,45 D/C · R$ 23,45 → {v, sg:-1|0|1} */
function mfImpNum(raw){let s=String(raw==null?'':raw).trim(),neg=false,pos=false;if(!s)return null;
 if(/^\(.*\)$/.test(s)){neg=true;s=s.slice(1,-1)}
 s=s.replace(/r\$|brl/gi,'').replace(/[\s ]+/g,'');
 if(/\d[dc]$/i.test(s)){if(/d$/i.test(s))neg=true;else pos=true;s=s.slice(0,-1)}
 if(/-$/.test(s)){neg=true;s=s.slice(0,-1)}else if(/\+$/.test(s)){pos=true;s=s.slice(0,-1)}
 if(/^[-−]/.test(s)){neg=true;s=s.slice(1)}else if(/^\+/.test(s)){pos=true;s=s.slice(1)}
 if(!/^\d[\d.,]*$/.test(s))return null;
 const lc=s.lastIndexOf(','),ld=s.lastIndexOf('.'),L=Math.max(lc,ld);let n;
 if(L<0)n=parseFloat(s);
 else{const sep=s[L],oth=sep===','?'.':',',dec=s.length-L-1;
  if(s.includes(oth))n=parseFloat(s.split(oth).join('').replace(',','.'));
  else if(dec===3)n=parseFloat(s.split(sep).join(''));
  else{const p=s.split(sep);n=parseFloat(p.slice(0,-1).join('')+'.'+p[p.length-1])}}
 return isFinite(n)?{v:Math.round(n*100)/100,sg:neg?-1:pos?1:0}:null}
/* data: 2026-11-03 · 20261103 · 03/11/2026 · 03/11/26 · 03/11 · 03 nov · 3 de nov. de 2026 → {y (0 = sem ano), m, d} */
function mfImpDate(raw){const s=mfImpNorm(raw).trim();let m;const ok=(y,mo,d)=>mo>=1&&mo<=12&&d>=1&&d<=31?{y,m:mo,d}:null;
 if(m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s))return ok(+m[1],+m[2],+m[3]);
 if(m=/^(\d{4})(\d{2})(\d{2})/.exec(s))return ok(+m[1],+m[2],+m[3]);
 if(m=/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?(?![\d\/.,])/.exec(s)){let y=m[3]?+m[3]:0;if(y&&y<100)y+=2000;const a=+m[1],b=+m[2];
  if(b<=12&&a<=31&&a>=1&&b>=1)return {y,m:b,d:a,p1:a,p2:b};if(a<=12&&b<=31&&a>=1)return {y,m:a,d:b,p1:a,p2:b,us:1};return null}
 if(m=/^(\d{1,2})\s*(?:de\s+)?([a-z]{3})[a-z]*\.?(?:\s*(?:de\s+)?(\d{4}))?(?![a-z])/.exec(s)){const mo=MF_IMP_MES[m[2]];if(mo)return ok(m[3]?+m[3]:0,mo,+m[1])}
 return null}
/* datas 03/11 no padrão americano (mês/dia): só quando nenhuma linha tem o primeiro número maior que 12 */
function mfImpFixUS(L){if(!L.some(x=>x.dt&&x.dt.us)||L.some(x=>x.dt&&x.dt.p1>12))return L;L.forEach(x=>{const d=x.dt;if(d&&d.p1&&!d.us&&d.p1<=12){const a=d.p1,b=d.p2;d.m=a;d.d=b}});return L}
/* nome mais legível: "UBER *TRIP" → "Uber *Trip" (só quando quase tudo está em maiúsculas) */
var MF_IMP_MIN=new Set(['de','da','do','das','dos','e','em','no','na','nos','nas','a','o','com','para','por']);
function mfImpName(n){n=String(n||'').replace(/\s+/g,' ').replace(/^[\s\-–·|]+|[\s\-–·|]+$/g,'').trim();if(!n)return 'Lançamento';
 const L=n.replace(/[^A-Za-zÀ-ÿ]/g,''),U=L.replace(/[^A-ZÀ-Þ]/g,'');
 if(L.length&&U.length/L.length>.6)n=n.toLowerCase().replace(/[a-zà-ÿ]+/g,(w,i)=>i>0&&MF_IMP_MIN.has(w)?w:w[0].toUpperCase()+w.slice(1));return n.slice(0,60)}
/* ---------- leitura dos arquivos ---------- */
function mfImpOfx(t){const out=[],tag=(b,n)=>{const r=new RegExp('<'+n+'>([^<\\r\\n]*)','i').exec(b);return r?r[1].trim():''};
 String(t).split(/<STMTTRN>/i).slice(1).forEach(b=>{b=b.split(/<\/STMTTRN>/i)[0];const dt=mfImpDate(tag(b,'DTPOSTED')||tag(b,'DTUSER')),a=tag(b,'TRNAMT');if(!dt||!a)return;
  const n=parseFloat(a.replace(/\s/g,'').replace(',','.'));if(!isFinite(n)||!n)return;out.push({dt,v:Math.round(Math.abs(n)*100)/100,sg:n<0?-1:1,n:tag(b,'MEMO')||tag(b,'NAME')||tag(b,'PAYEE'),tp:tag(b,'TRNTYPE').toUpperCase()})});
 return out}
function mfImpCsvRows(t){const lines=String(t).split(/\r?\n/).filter(l=>l.trim());if(!lines.length)return [];
 const cnt=(l,d)=>{let n=0,q=false;for(const ch of l){if(ch==='"')q=!q;else if(ch===d&&!q)n++}return n},S0=lines.slice(0,25);
 let dl=';',best=-1;[';','\t',',','|'].forEach(d=>{const c=S0.map(l=>cnt(l,d)).sort((a,b)=>a-b),med=c[Math.floor(c.length/2)];if(med>best){best=med;dl=d}});
 const split=l=>{const r=[];let cur='',q=false;for(let i=0;i<l.length;i++){const ch=l[i];if(q){if(ch==='"'){if(l[i+1]==='"'){cur+='"';i++}else q=false}else cur+=ch}else if(ch==='"')q=true;else if(ch===dl){r.push(cur);cur=''}else cur+=ch}r.push(cur);return r.map(x=>x.trim())};
 return lines.map(split)}
function mfImpCsv(t){const rows=mfImpCsvRows(t);if(!rows.length)return [];
 const isD=x=>/^(data|date|dt)\b/.test(x)||/data (da |de )?(compra|lancamento|transacao|movimento|operacao)/.test(x);
 const isV=x=>/valor|amount|value|quantia|montante/.test(x)&&!/us\$|usd|dolar|cotacao|saldo|limite/.test(x);
 const DES1=/descri|estabelecimento|title|titulo|historico|memo|detalhe|loja|beneficiario|favorecido/,DES2=/lancamento|transacao|movimenta|^nome\b/;
 let hi=-1,cD=-1,cV=-1,cN=[],cP=-1;
 for(let i=0;i<Math.min(10,rows.length);i++){const h=rows[i].map(mfImpNorm),d=h.findIndex(isD);let v=h.findIndex(x=>isV(x)&&/r\$|brl|real|reais/.test(x));if(v<0)v=h.findIndex(isV);
  if(d>=0&&v>=0){hi=i;cD=d;cV=v;cN=h.map((x,j)=>j!==d&&j!==v&&DES1.test(x)?j:-1).filter(j=>j>=0);if(!cN.length)cN=h.map((x,j)=>j!==d&&j!==v&&DES2.test(x)&&!/cartao|titular|portador/.test(x)?j:-1).filter(j=>j>=0);cP=h.findIndex(x=>/parcela/.test(x));break}}
 if(hi<0){/* sem cabeçalho: descobre as colunas pelo conteúdo */
  const R=rows.slice(0,40),nc=Math.max(...R.map(r=>r.length)),sc=f=>Array.from({length:nc},(_,j)=>R.filter(r=>f(r[j])).length);
  const ds=sc(x=>!!mfImpDate(x)),vs=sc(x=>!!mfImpNum(x)&&/[.,]\d{2}\s*[-+DCdc]?\s*$/.test(String(x||'').trim()));cD=ds.indexOf(Math.max(...ds));
  const vv=vs.map((n,j)=>j===cD?-1:n);cV=vv.lastIndexOf(Math.max(...vv));if(!(ds[cD]>0)||!(vv[cV]>0))return [];
  const ln=Array.from({length:nc},(_,j)=>j===cD||j===cV?-1:R.reduce((s,r)=>s+(r[j]&&!mfImpNum(r[j])?String(r[j]).length:0),0));const n0=ln.indexOf(Math.max(...ln));if(n0>=0&&ln[n0]>0)cN=[n0]}
 const out=[];
 rows.slice(hi+1).forEach(r=>{const dt=mfImpDate(r[cD]),a=mfImpNum(r[cV]);if(!dt||!a||!(a.v>0))return;let n=cN.map(j=>r[j]).filter(Boolean).filter((x,i,A)=>A.indexOf(x)===i).join(' · ');
  const pc=cP>=0?String(r[cP]||'').trim():'',pm=/(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})/.exec(pc);if(pm&&+pm[2]>1&&!n.includes(pm[0]))n+=` (${+pm[1]}/${+pm[2]})`;out.push({dt,v:a.v,sg:a.sg,n})});
 return mfImpFixUS(out)}
/* PDF: lê as linhas de texto de cada página (pdf.js, carregado só quando precisa) */
function mfImpLoadPdf(){if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);if(window.__pdfjsP)return window.__pdfjsP;
 return window.__pdfjsP=new Promise((ok,no)=>{const s=document.createElement('script');s.src=MF_PDFJS+'pdf.min.js';s.onload=()=>{try{window.pdfjsLib.GlobalWorkerOptions.workerSrc=MF_PDFJS+'pdf.worker.min.js';ok(window.pdfjsLib)}catch(e){no(e)}};s.onerror=()=>{window.__pdfjsP=null;no(new Error('pdfjs'))};document.head.appendChild(s)})}
async function mfImpPdfLines(buf,pw){const lib=await mfImpLoadPdf(),doc=await lib.getDocument({data:new Uint8Array(buf.slice(0)),password:pw||undefined}).promise,lines=[];
 for(let p=1;p<=Math.min(doc.numPages,40);p++){const pg=await doc.getPage(p),tc=await pg.getTextContent(),it=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({s:i.str,x:i.transform[4],y:i.transform[5],w:i.width||0,h:Math.abs(i.transform[3])||8}));
  it.sort((a,b)=>b.y-a.y||a.x-b.x);const rows=[];it.forEach(i=>{const r=rows.find(r=>Math.abs(r.y-i.y)<=Math.max(2,i.h*.45));if(r)r.it.push(i);else rows.push({y:i.y,it:[i]})});
  rows.sort((a,b)=>b.y-a.y).forEach(r=>{r.it.sort((a,b)=>a.x-b.x);/* duas colunas na mesma altura: quebra onde começa outra data */
   let seg=[],cur=null;r.it.forEach((i,k)=>{if(k&&cur&&i.x-cur.end>18&&/^\s*\d/.test(i.s)&&mfImpDate(i.s)&&/\d[.,]\d{2}(\s|$)/.test(cur.t)){seg.push(cur.t);cur=null}if(!cur)cur={t:'',end:0};cur.t+=(cur.t&&i.x-cur.end>1.2?' ':'')+i.s;cur.end=i.x+i.w});if(cur)seg.push(cur.t);
   seg.forEach(t=>lines.push(t.replace(/\s+/g,' ').trim()))})}
 return lines}
var MF_IMP_MONEY=/(?:^|\s)([-−+]?\s*(?:R\$\s*)?[-−+]?\s*(?:\d{1,3}(?:\.\d{3})+|\d+)[.,]\d{2}(?:\s*[-+DC](?![a-z]))?)(?=\s|$)/gi;
function mfImpPdf(lines){const out=[];let due=null;
 lines.forEach(l=>{const nl=mfImpNorm(l);if(!due){const m=/vencimento[^0-9a-z]{0,12}(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{1,2}\s*(?:de\s+)?[a-z]{3}[a-z]*\.?\s*(?:de\s+)?\d{4})/.exec(nl);if(m){const d=mfImpDate(m[1]);if(d&&d.y)due=d}}
  const dm=/^(\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?|\d{1,2}\s*(?:de\s+)?(?:jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-z]*\.?(?:\s*(?:de\s+)?\d{4})?)\s+(.+)$/i.exec(l.trim());if(!dm)return;
  const dt=mfImpDate(dm[1]);if(!dt)return;const rest=dm[2],mm=[...rest.matchAll(MF_IMP_MONEY)].filter(x=>!/us\$|usd/i.test(rest.slice(Math.max(0,x.index-5),x.index+1)));if(!mm.length)return;
  const vals=mm.map(x=>mfImpNum(x[1])).filter(a=>a&&a.v>0),a=vals[vals.length-1];if(!a)return;let n=rest.slice(0,mm[0].index).replace(/\s+(R\$|US\$)\s*$/i,'').trim();
  if(!n||/^\d+$/.test(n))return;out.push({dt,v:a.v,sg:a.sg,n})});
 return {L:mfImpFixUS(out),due}}
/* ---------- montar a lista para conferir ---------- */
var MF_IMP_RX={pag:/pagamento (recebido|efetuado|de fatura|da fatura|fatura)|pagto (de )?fatura|pgto (de )?fatura|pag(amento|to)? (on.?line|debito automatico)|^pagamento$|^pagto$/,est:/estorno|reembolso|cashback|devolu|credito de|ajuste a credito|credito (em|na) (conta|fatura)/,
 skip:/\bsaldo\b|^total\b|subtotal|limite (total|disponivel)|pagamento minimo|valor minimo|total da fatura|fatura anterior/,fat:/fatura|cartao de credito|cartao cred|pagto cartao|pag cartao/,apl:/aplica|resgate|\bcdb\b|tesouro|\blci\b|\blca\b|poupanca|invest/,res:/resgate/};
var MF_IMP_KW=[[/mercado ?livre|mercadolivre|mercado ?pago|shopee|aliexpress|shein|amazon(?! ?prime)|magazine|magalu|americanas|casas bahia|renner|riachuelo|c&a/,'Pessoal'],[/ifood|rappi|restaur|lanch|pizz|burger|mc ?donald|subway|padaria|panific|cafeteria|mercad|supermerc|atacad|assai|carrefour|hortifr|acougue|sacolao|pao de acucar|oxxo|delivery|food/,'Alimentação'],
 [/netflix|spotify|disney|hbo|max\.com|prime ?video|amazon prime|youtube|deezer|globoplay|apple\.com|icloud|google (one|storage|play)|paramount|crunchyroll|xbox|playstation|chatgpt|openai|adobe|canva|microsoft|office/,'Assinatura'],
 [/aluguel|condominio|imobiliaria/,'Moradia'],[/energia|enel|cemig|copel|celesc|equatorial|sabesp|copasa|saneamento|agua |comgas|internet|vivo|claro|\btim\b|\boi\b|telefon/,'Conta fixa'],
 [/cinema|ingresso|teatro|\bbar\b|boteco|cervej|steam|hotel|airbnb|booking|decolar|viagem|show/,'Lazer'],[/farmac|droga|pacheco|panvel|hospital|clinica|laborat|odonto|academia|smartfit|salao|barbearia|cosmetic|boticario|natura/,'Pessoal']];
function mfImpKey(n){return mfImpNorm(n).replace(/[0-9*#.\/\\_-]+/g,' ').replace(/\s+/g,' ').trim().split(' ').slice(0,3).join(' ')}
function mfImpHist(){const H={};(S.tx||[]).slice().sort((a,b)=>String(a.d).localeCompare(String(b.d))).forEach(t=>{if(t&&t.n&&t.s&&t.c!=='Receita'&&t.s!=='Investimentos'){const k=mfImpKey(t.n);if(k)H[k]=t.s}});return H}
function mfImpCat(n,H){const k=mfImpKey(n);if(k&&H[k])return H[k];const s=mfImpNorm(n);for(const [rx,c] of MF_IMP_KW)if(rx.test(s))return c;return 'Variáveis'}
function mfImpCycle(cid,k){const p=k.split('-').map(Number);let a=null,b=null;for(let dt=new Date(p[0],p[1]-4,1),end=new Date(p[0],p[1],0);dt<=end;dt.setDate(dt.getDate()+1)){const d=iso(dt);if(invoiceDueDate({d,cc:cid,t:'Crédito'}).slice(0,7)===k){if(!a)a=d;b=d}}return {a,b}}
function mfImpIso(y,m,d){return `${y}-${String(m).padStart(2,'0')}-${String(Math.min(d,new Date(y,m,0).getDate())).padStart(2,'0')}`}
function mfImpBuild(st){const raw=st.raw,old=st.rows||[],H=st.H||(st.H=mfImpHist()),R=MF_IMP_RX;
 const L=raw.map((x,i)=>({x,i,nn:mfImpNorm(x.n)})).filter(o=>!R.skip.test(o.nn));
 let rows;
 if(st.mode==='fat'){const kw=o=>R.pag.test(o.nn)||R.est.test(o.nn),base=L.filter(o=>!kw(o)),neg=base.filter(o=>o.x.sg<0).length,ps=neg>base.length-neg?-1:1;
  const cy=mfImpCycle(st.cc,st.k),ky=+st.k.slice(0,4);
  rows=L.map(o=>{const x=o.x,dt=x.dt;let kind='buy';if(R.pag.test(o.nn))kind='pag';else if(R.est.test(o.nn)||(ps<0?x.sg>=0:x.sg<0))kind='cred';
   let d;if(dt.y)d=mfImpIso(dt.y,dt.m,dt.d);else{d=null;for(const y of [ky+1,ky,ky-1]){const c=mfImpIso(y,dt.m,dt.d);if(!cy.b||c<=cy.b){d=c;break}}if(!d)d=mfImpIso(ky,dt.m,dt.d)}
   const d0=d;if(cy.a&&d<cy.a)d=cy.a;if(cy.b&&d>cy.b)d=cy.b;return {i:o.i,kind,d,d0,adj:d!==d0,v:x.v,n:mfImpName(x.n)}});
  const have=cbInvoice(st.k,st.cc).rows.map(t=>({v:txValue(t),u:false}));rows.forEach(r=>{if(r.kind!=='buy')return;const h=have.find(h=>!h.u&&Math.abs(h.v-r.v)<0.005);if(h){h.u=true;r.dup=true}})}
 else{const hasNeg=L.some(o=>o.x.sg<0);
  rows=L.map(o=>{const x=o.x,dt=x.dt,out=hasNeg?x.sg<0:x.sg<=0;let kind=out?'out':'in';
   if(out){if(R.fat.test(o.nn))kind='fat';else if(R.apl.test(o.nn))kind='apl'}else{if(R.res.test(o.nn)||R.apl.test(o.nn))kind='res';else if(R.est.test(o.nn))kind='cred'}
   let d;if(dt.y)d=mfImpIso(dt.y,dt.m,dt.d);else{const y=+TD.slice(0,4);d=mfImpIso(y,dt.m,dt.d);if(d>TD)d=mfImpIso(y-1,dt.m,dt.d)}
   return {i:o.i,kind,d,v:x.v,n:mfImpName(x.n)}});
  const day=d=>Math.round(new Date(d+'T12:00').getTime()/864e5),used=new Set(),byV=new Map();
  (S.tx||[]).forEach(t=>{if(t&&t.d&&t.t!=='Crédito'){const c=Math.round(txValue(t)*100);if(!byV.has(c))byV.set(c,[]);byV.get(c).push(t)}});
  rows.forEach(r=>{const inc=r.kind==='in'||r.kind==='res'||r.kind==='cred',t=(byV.get(Math.round(r.v*100))||[]).find(t=>!used.has(t.id)&&(t.c==='Receita')===inc&&Math.abs(day(t.d)-day(r.d))<=2);if(t){used.add(t.id);r.dup=true}})}
 rows.forEach(r=>{const o=old.find(z=>z.i===r.i);r.s=o&&o.s?o.s:(r.kind==='buy'||r.kind==='out'?mfImpCat(r.n,H):r.kind==='apl'?'Investimentos':'');if(o&&o.ed)r.n=o.n;r.ed=o&&o.ed;
  const def=(r.kind==='buy'||r.kind==='out'||r.kind==='in'||r.kind==='apl')&&!r.dup;r.lock=st.mode==='fat'&&r.kind!=='buy';r.on=r.lock?false:(o&&o.tc?o.on:def);r.tc=o&&o.tc});
 st.rows=rows;return st}
/* ---------- tela de conferência ---------- */
function mfImpOk(st){return st.rows.filter(r=>r.on)}
function mfImpFoot(st){const L=mfImpOk(st),tot=L.reduce((s,r)=>s+((r.kind==='in'||r.kind==='res'||r.kind==='cred')?0:r.v),0),inc=L.reduce((s,r)=>s+((r.kind==='in'||r.kind==='res'||r.kind==='cred')?r.v:0),0),w=document.getElementById('mf-imp');if(!w)return;
 const word=st.mode==='fat'?(L.length===1?'compra':'compras'):(L.length===1?'lançamento':'lançamentos');
 const b=w.querySelector('[data-migo]');if(b){b.textContent=L.length?`Lançar ${L.length} ${word}`:'Marque o que vai lançar';b.disabled=!L.length}
 const s=w.querySelector('.mi-sum');if(s)s.innerHTML=st.mode==='fat'?`Marcadas: <b>${R(tot)}</b>`:`Saídas <b>${R(tot)}</b> · Entradas <b class="ok">${R(inc)}</b>`;
 const a=w.querySelector('[data-miall]');if(a){const can=st.rows.filter(r=>!r.lock);a.checked=can.length>0&&can.every(r=>r.on)}}
function mfImpTag(st,r){if(r.kind==='pag')return 'pagamento · não entra';if(r.kind==='cred')return st.mode==='fat'?'estorno · não entra':'estorno';if(r.kind==='fat')return 'pagamento de fatura';if(r.kind==='res')return 'resgate';if(r.kind==='apl')return 'investimento';if(r.kind==='in')return 'entrada';return ''}
function mfImpRender(){const st=window.__mfImp,w=document.getElementById('mf-imp');if(!st||!w)return;const box=w.querySelector('.mi-box'),ttl=st.mode==='fat'?'Importar fatura':'Importar extrato';
 const scr=(w.querySelector('.mi-list')||{}).scrollTop||0;let body='';
 if(st.step==='load')body=`<div class="mi-msg"><span class="mi-spin" aria-hidden="true"></span><p>Lendo ${escH(st.file||'arquivo')}…</p></div>`;
 else if(st.step==='pw')body=`<div class="mi-msg"><p><b>Este PDF tem senha.</b><br>Alguns bancos usam os primeiros números do CPF.</p><input type="password" class="mi-pw" data-mipw autocomplete="off" placeholder="Senha do PDF"><button type="button" class="mi-go" data-mipwgo>Abrir</button>${st.err?`<small class="bad">${escH(st.err)}</small>`:''}</div>`;
 else if(st.step==='err')body=`<div class="mi-msg"><p>${st.err}</p><button type="button" class="mi-go" data-mipick>Escolher outro arquivo</button></div>`;
 else{const L=mfCards(),many=L.length>1,sub=SUBCATS.filter(s=>st.mode==='ext'||s!=='Investimentos');
  const opts=`${st.mode==='fat'?`<div class="mi-opt"><span>Fatura</span><div class="mi-k"><button type="button" data-mik="-1" aria-label="Fatura anterior">‹</button><b>${mfMs(st.k)}</b><button type="button" data-mik="1" aria-label="Próxima fatura">›</button></div></div>${many?`<div class="mi-opt"><span>Cartão</span><div class="mi-ccs">${L.map((c,i)=>`<button type="button" class="${c.id===st.cc?'on':''}" data-micc="${c.id}">${escH(mfCardName(c,i))}</button>`).join('')}</div></div>`:''}`:''}`;
  const rows=st.rows.map((r,j)=>{const tag=mfImpTag(st,r),inc=st.mode==='ext'&&(r.kind==='in'||r.kind==='res'||r.kind==='cred'),neg=st.mode==='fat'&&r.lock,sel=(r.kind==='buy'||r.kind==='out'||r.kind==='apl'||(st.mode==='ext'&&r.kind==='fat'))?`<select data-mis="${j}" aria-label="Categoria">${sub.map(s=>`<option ${s===(r.s||'Variáveis')?'selected':''}>${escH(s)}</option>`).join('')}</select>`:'';
   return `<div class="mi-row${r.on?'':' off'}${r.lock?' lock':''}"><label class="mi-ck"><input type="checkbox" data-mion="${j}" ${r.on?'checked':''} ${r.lock?'disabled':''} aria-label="Lançar ${escH(r.n)}"></label><div class="mi-mid"><input class="mi-n" data-min="${j}" value="${escH(r.n)}" maxlength="60" aria-label="Nome" ${r.lock?'disabled':''}><div class="mi-sub"><span>${r.d.slice(8,10)}/${r.d.slice(5,7)}</span>${sel}${tag?`<em class="mi-tag">${tag}</em>`:''}${r.dup?'<em class="mi-tag wa">já existe no app</em>':''}${r.adj?`<em class="mi-tag" title="Compra de ${mfDmy(r.d0)}">data ajustada à fatura</em>`:''}</div></div><b class="mi-v${inc?' ok':''}">${inc?'+':neg?'−':''}${R(r.v)}</b></div>`}).join('');
  body=`<div class="mi-opts">${opts}<div class="mi-bar"><label class="mi-all"><input type="checkbox" data-miall> Marcar todas</label><span class="mi-sum"></span></div></div><div class="mi-list">${rows||'<p class="mi-empty">Nada para lançar.</p>'}</div>
  <footer class="mi-f"><button type="button" class="mi-go" data-migo>Lançar</button><small>${st.mode==='fat'?'Entram no Crédito do cartão, nesta fatura.':'Saídas entram como despesas no Pix e entradas como receitas.'} Dá para desfazer logo depois.</small></footer>`}
 box.innerHTML=`<div class="mi-grab"></div><header class="mi-h"><div><b>${ttl}</b><small>${escH(st.file||'')}${st.step==='list'?` · ${st.rows.length} ${st.rows.length===1?'linha':'linhas'}`:''}</small></div><button type="button" class="mi-x" data-close aria-label="Fechar">✕</button></header>${body}`;
 if(st.step==='list'){mfImpFoot(st);const l=w.querySelector('.mi-list');if(l)l.scrollTop=scr}
 if(st.step==='pw')setTimeout(()=>{const i=w.querySelector('[data-mipw]');if(i)i.focus()},60)}
function mfImpSheet(){let w=document.getElementById('mf-imp');if(w)return w;w=document.createElement('div');w.id='mf-imp';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');
 w.innerHTML='<div class="mi-bg" data-close></div><section class="mi-box"></section>';document.body.appendChild(w);requestAnimationFrame(()=>w.classList.add('on'));
 w.addEventListener('click',e=>{const t=e.target,st=window.__mfImp;let b;if(!st)return;
  if(t.closest('[data-close]')){e.preventDefault();w.remove();window.__mfImp=null;return}
  if(t.closest('[data-mipick]')){e.preventDefault();mfImpPick(st.mode);return}
  if(b=t.closest('[data-mik]')){e.preventDefault();st.k=nm(st.k,+b.dataset.mik);mfImpBuild(st);mfImpRender();return}
  if(b=t.closest('[data-micc]')){e.preventDefault();st.cc=b.dataset.micc;window.__impCc=st.cc;mfImpBuild(st);mfImpRender();return}
  if(t.closest('[data-mipwgo]')){e.preventDefault();const i=w.querySelector('[data-mipw]');mfImpRead(st.buf,st.file,st.mode,i?i.value:'');return}
  if(t.closest('[data-migo]')){e.preventDefault();mfImpGo();return}});
 w.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-mipw]')){e.preventDefault();const st=window.__mfImp;if(st)mfImpRead(st.buf,st.file,st.mode,e.target.value)}});
 w.addEventListener('change',e=>{const t=e.target,st=window.__mfImp;if(!st||st.step!=='list')return;
  if(t.matches('[data-mion]')){const r=st.rows[+t.dataset.mion];if(r&&!r.lock){r.on=t.checked;r.tc=true;t.closest('.mi-row').classList.toggle('off',!r.on)}mfImpFoot(st);return}
  if(t.matches('[data-mis]')){const r=st.rows[+t.dataset.mis];if(r)r.s=t.value;return}
  if(t.matches('[data-miall]')){st.rows.forEach(r=>{if(!r.lock){r.on=t.checked;r.tc=true}});w.querySelectorAll('[data-mion]').forEach(c=>{const r=st.rows[+c.dataset.mion];if(r){c.checked=r.on;c.closest('.mi-row').classList.toggle('off',!r.on)}});mfImpFoot(st)}});
 w.addEventListener('input',e=>{const t=e.target,st=window.__mfImp;if(st&&t.matches('[data-min]')){const r=st.rows[+t.dataset.min];if(r){r.n=t.value.slice(0,60);r.ed=true}}});
 return w}
function mfImpPick(mode){const i=document.createElement('input');i.type='file';/* no celular sem filtro: alguns Android escondem o .ofx quando há filtro */if(window.mfIsDesk&&mfIsDesk())i.accept='.ofx,.qfx,.csv,.txt,.pdf';i.style.display='none';
 i.addEventListener('change',()=>{const f=i.files&&i.files[0];i.remove();if(!f)return;const r=new FileReader();window.__mfImp=Object.assign(window.__mfImp||{},{mode,file:f.name,step:'load'});mfImpSheet();mfImpRender();
  r.onload=()=>mfImpRead(r.result,f.name,mode,'');r.onerror=()=>{window.__mfImp.step='err';window.__mfImp.err='Não foi possível abrir o arquivo.';mfImpRender()};r.readAsArrayBuffer(f)});
 document.body.appendChild(i);i.click()}
async function mfImpRead(buf,file,mode,pw){const prev=window.__mfImp||{},st=window.__mfImp={mode,file,buf,step:'load',cc:prev.cc||null};mfImpSheet();mfImpRender();
 const ext=(String(file).toLowerCase().match(/\.([a-z0-9]+)$/)||[])[1]||'',head=new Uint8Array(buf.slice(0,5)),isPdf=head[0]===0x25&&head[1]===0x50&&head[2]===0x44&&head[3]===0x46;let raw=[],due=null;
 try{if(isPdf||ext==='pdf'){const lines=await mfImpPdfLines(buf,pw);const r=mfImpPdf(lines);raw=r.L;due=r.due}
  else{const t=mfImpDec(buf);if(/<OFX>|OFXHEADER|<STMTTRN>/i.test(t))raw=mfImpOfx(t);else if(['ofx','qfx','csv','txt',''].includes(ext)||/[;,\t]/.test(t))raw=mfImpCsv(t);
   else{st.step='err';st.err='Formato não reconhecido. Use o arquivo OFX, CSV ou PDF do banco.';mfImpRender();return}}}
 catch(e){if(e&&(e.name==='PasswordException'||/password/i.test(e.message||''))){st.step='pw';st.err=pw?'Senha incorreta. Tente de novo.':'';mfImpRender();return}
  st.step='err';st.err=/pdfjs/.test(String(e&&e.message))?'Para ler PDF é preciso internet na primeira vez. Tente de novo conectado ou use o arquivo OFX ou CSV.':'Não foi possível ler este arquivo. Tente o arquivo OFX ou CSV do banco.';mfImpRender();return}
 if(!raw.length){st.step='err';st.err=mode==='fat'?'Não encontramos compras neste arquivo.<br><small>Tente o arquivo OFX ou CSV da fatura. No PDF, a lista precisa ter data, descrição e valor em cada linha.</small>':'Não encontramos lançamentos neste arquivo.<br><small>Tente o arquivo OFX ou CSV do extrato.</small>';mfImpRender();return}
 st.raw=raw;
 if(mode==='fat'){const L=mfCards();st.cc=L.some(c=>c.id===st.cc)?st.cc:(L.some(c=>c.id===window.__impCc)?window.__impCc:mfCcDefault());
  const cnt={};raw.forEach(x=>{if(x.dt&&x.dt.y){const k=invoiceDueDate({d:mfImpIso(x.dt.y,x.dt.m,x.dt.d),cc:st.cc,t:'Crédito'}).slice(0,7);cnt[k]=(cnt[k]||0)+1}});
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];st.k=due?mfImpIso(due.y,due.m,due.d).slice(0,7):top?top[0]:mfCbMonth()}
 mfImpBuild(st);st.step='list';mfImpRender()}
function mfImpGo(){const st=window.__mfImp;if(!st||st.busy||st.step!=='list')return;const L=mfImpOk(st);if(!L.length){mfToast('Marque pelo menos um lançamento.');return}st.busy=true;
 const snap={tx:JSON.stringify(S.tx||[]),shopping:JSON.stringify(S.shopping||[]),fixed:JSON.stringify(S.fixed||[]),trash:JSON.stringify(S.trash||[])},batch='imp'+Date.now().toString(36),base=Date.now();
 L.forEach((r,i)=>{const id='n'+base+'m'+i+Math.random().toString(36).slice(2,5),n=String(r.n||'').trim()||'Lançamento';
  if(r.kind==='in'||r.kind==='res'||r.kind==='cred'){S.tx.push({id,n,v:r.v,e:'',d:r.d,c:'Receita',g:'',s:'',t:'',imp:batch});return}
  const s=r.kind==='apl'&&!r.s?'Investimentos':(r.s||'Variáveis'),c=SUB_TO_LEGACY[s]||'Variáveis',o={id,n,v:r.v,e:'',d:r.d,c,g:inferMain(c,s),s,t:st.mode==='fat'?'Crédito':'Pix',imp:batch};if(st.mode==='fat')o.cc=st.cc;S.tx.push(o)});
 const w=document.getElementById('mf-imp');if(w)w.remove();window.__mfImp=null;
 if(st.mode==='fat'){window.__cbm=st.k;window.__cbPop='list'}
 save();draw();mfUndoToast(st.mode==='fat'?`${L.length} ${L.length===1?'compra lançada':'compras lançadas'} na fatura de ${mfMs(st.k)}`:`${L.length} ${L.length===1?'lançamento importado':'lançamentos importados'}`,snap)}
/* ---------- onde fica o botão ---------- */
/* Cartão de crédito: o botão "Importar fatura" fica no bloco do cartão (patch 98) */
/* Lançamentos: "Importar extrato" embaixo de Salvar lançamento (só no lançamento novo) */
(function(){const _va=vAdd;vAdd=function(){const h=_va(),a='<button class=b id=fs>Salvar lançamento</button>';if(h.indexOf(a)<0)return h;const A=mfAccs(),cur=F.acc||mfAccMain(),ac=A.length>1&&F.t!=='Crédito'&&F.t!=='VR'&&F.t!=='Reserva'?`<div class="mf-flab">Conta</div><div class="mf-pills">${A.map(x=>`<button type="button" class="mf-pill ${x.id===cur?'on':''}" data-facc="${x.id}">${escH(x.n)}</button>`).join('')}</div>`:'';return h.replace(a,ac+a)}})();
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-facc]');if(!b)return;e.preventDefault();e.stopPropagation();const fv=document.getElementById('fv'),fd=document.getElementById('fd'),fn=document.getElementById('fn');if(fv)F.v=fv.value;if(fd)F.dt=fd.value;if(fn)F.n=fn.value;F.acc=b.dataset.facc;draw()},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mfimp]');if(!b||document.body.classList.contains('org-on'))return;e.preventDefault();e.stopPropagation();
 window.__mfImp={mode:b.dataset.mfimp,cc:window.__impCc||null};mfImpPick(b.dataset.mfimp)},true);

/* ===== Patch 98: bloco Cartão de crédito mais limpo (botões 2 × 2 que abrem em janela) · Importar fatura por cartão · Diário no topo de Contas ===== */
/* Os botões Compras da fatura / Pagar fatura / Importar fatura / Configurar cartão abrem uma janela com o mesmo conteúdo de antes.
   O conteúdo continua dentro do #app (mesmas regras e campos de sempre); só é mostrado por cima da tela. */
(function(){const _pl=plCardBillingHtml;plCardBillingHtml=function(){let h=_pl(),n=0;const panes={};
 h=h.replace(/<details class="cb-more[^"]*" data-cbd="(list|pay|cfg)"[^>]*>([\s\S]*?)<\/details>/g,(m,k,inner)=>{panes[k]=inner.replace(/^\s*<summary>[\s\S]*?<\/summary>/,'');return n++?'':'@@CBTILES@@'});
 if(!n)return h;
 const sel=mfCbMonth(),inv=cbInvoice(sel),paid=inv.total>0.005&&mfFatPaid(sel),L=mfCards(),many=L.length>1,cid=L.some(c=>c.id===window.__impCc)?window.__impCc:mfCcDefault(),c=mfCardById(cid),nmC=escH(mfCardName(c,L.indexOf(c))),iv=cbInvoice(sel,cid);
 const imp=`<div class="cbp-imp">${many?`<div class="cbp-ccs" role="group" aria-label="Cartão">${L.map((x,i)=>`<button type="button" class="${x.id===cid?'on':''}" data-cbimpcc="${x.id}" aria-pressed="${x.id===cid}">${escH(mfCardName(x,i))}</button>`).join('')}</div>`:''}<div class="cbp-sum"><small>Fatura de ${lab(sel).toLowerCase()} · ${nmC}</small><b>${R(iv.total)}</b><small>${iv.rows.length} ${iv.rows.length===1?'compra':'compras'} no app</small></div><button type="button" class="primary-btn" data-mfimp="fat">Escolher arquivo da fatura do ${nmC}</button><small class="mu">OFX, CSV ou PDF. No app do banco: Cartão › Fatura › Exportar ou Baixar. O arquivo é lido só no seu aparelho e você confere tudo antes de lançar.</small></div>`;
 const T=[['list','Compras da fatura',inv.rows.length?String(inv.rows.length):'',`Compras da fatura · ${mfMs(sel)}`],['pay','Pagar fatura',paid?'Pago':'',`Pagar fatura · ${mfMs(sel)}`],['imp','Importar fatura','',`Importar fatura do ${mfCardName(c,L.indexOf(c))}`],['cfg','Configurar cartão','','Configurar cartão']];
 const tiles=`<div class="cb-tiles">${T.map(([k,l,b])=>`<button type="button" class="cb-tile" data-cbtile="${k}" aria-haspopup="dialog"><span>${l}</span>${b?`<em class="${k==='pay'?'ok':''}">${b}</em>`:''}</button>`).join('')}</div><div class="cb-panes" hidden>${T.map(([k,,,t])=>`<div class="cbp-pane" data-cbpane="${k}" data-t="${escH(t)}">${k==='imp'?imp:(panes[k]||'')}</div>`).join('')}</div>`;
 return h.replace('@@CBTILES@@',tiles)}})();
/* janela: monta depois de cada desenho, levando o conteúdo do botão tocado para cima da tela */
function mfCbPopClose(){window.__cbPop=null;window.__cbPopLast=null;const w=document.getElementById('cb-pop');if(w)w.remove();draw()}
window.__mfAD.push(function(){const k=window.__cbPop;let w=document.getElementById('cb-pop');if(w)w.remove();if(!k)return;
 const pane=document.querySelector(`#app [data-cbpane="${k}"]`),app=document.getElementById('app');if(!pane||!app){window.__cbPop=null;window.__cbPopLast=null;return}
 const again=window.__cbPopLast===k;w=document.createElement('div');w.id='cb-pop';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label',pane.dataset.t||'');if(again)w.className='on still';
 w.innerHTML=`<div class="cbp-bg" data-cbpx></div><section class="cbp-box"><div class="cbp-grab"></div><header class="cbp-h"><b>${escH(pane.dataset.t||'')}</b><button type="button" class="cbp-x" data-cbpx aria-label="Fechar">✕</button></header><div class="cbp-body"></div></section>`;
 w.querySelector('.cbp-body').appendChild(pane);app.appendChild(w);window.__cbPopLast=k;if(!again)requestAnimationFrame(()=>w.classList.add('on'))});
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;let b;
 if(b=t.closest('#app [data-cbtile]')){if(document.body.classList.contains('org-on'))return;e.preventDefault();e.stopPropagation();window.__cbPop=b.dataset.cbtile;window.__cbPopLast=null;draw();return}
 if(t.closest('#cb-pop [data-cbpx]')){e.preventDefault();e.stopPropagation();mfCbPopClose();return}
 if(b=t.closest('#cb-pop [data-cbimpcc]')){e.preventDefault();e.stopPropagation();window.__impCc=b.dataset.cbimpcc;draw();return}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&window.__cbPop&&!document.querySelector('#mf-confirm,#mf-imp')){mfCbPopClose()}});
/* voltar (gesto/botão do celular) fecha a janela do cartão; o que estiver por cima dela fecha antes */
(function(){const b=window.mfBack;if(typeof b!=='function')return;window.mfBack=function(){if(window.__cbPop&&!document.querySelector('#mf-confirm,#mf-imp,#mf-ser,#mf-lp,#tx-edit-backdrop')){mfCbPopClose();return true}return b.apply(this,arguments)}})();
/* "Escolher o que mostrar" do cartão continua escondendo Compras da fatura e Configurar cartão */
try{(MF_VIEW.p_faturas.o||[]).forEach(o=>{if(o.sel==='details[data-cbd="list"]')o.sel='[data-cbtile="list"]';if(o.sel==='details[data-cbd="cfg"]'){o.sel='[data-cbtile="cfg"]';o.l='Configurar cartão'}})}catch(e){}
/* Contas: Diário primeiro */
(function(){const top=a=>{if(!a)return;const i=a.indexOf('p_diario');if(i>0)a.splice(i,1);if(a[0]!=='p_diario')a.unshift('p_diario')};top(MF_ORD.mais);if(MF_ORD_D.mais)top(MF_ORD_D.mais)})();
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__dia98)return;const a=L.o&&L.o.mais;if(Array.isArray(a)){const i=a.indexOf('p_diario');if(i>0)a.splice(i,1);if(a[0]!=='p_diario')a.unshift('p_diario')}L.__dia98=1;save()}catch(e){}});

/* ===== Patch 100: pagamento da fatura dentro da fatura (Lançamentos) ===== */
/* O pagamento não aparece mais solto na lista: fica dentro da linha "Fatura do cartão" da fatura que ele pagou (abre em cascata, junto das compras). */
function mfPaySub(t){const L=mfCards();return 'Pagamento em '+t.d.slice(8,10)+'/'+t.d.slice(5,7)+(L.length>1&&isInvoicePayment(t)&&t.t==='Fatura'?' · '+mfCardName(mfCardById(mfPayCard(t))):'')}
function mfPayRow(t){return `<div class="row mf-tx mf-payrow" data-e="${t.id}" data-kind="fat" data-pay="${escH(t.t||'')}" data-kid="fat"><input type="checkbox" class="row-sel" data-sel="${t.id}" aria-label="Selecionar lançamento"><span class="mf-txi ok">✓</span><div class="mf-txm"><b>${escH(t.n||'Pagamento da fatura')}</b><small>${escH(mfPaySub(t))}</small></div><b class="mf-txv">−${R(Math.abs(+t.v||0))}</b></div>`}
function mfPayTr(t,open){return `<tr class="row mf-kid${open?'':' mf-closed'} mf-paytr" data-e="${t.id}" data-kind="fat" data-pay="${escH(t.t||'')}" data-kid="fat"><td class="mf-tsel"><input type="checkbox" class="row-sel" data-sel="${t.id}" aria-label="Selecionar"></td><td>${t.d.slice(8)}/${t.d.slice(5,7)}/${t.d.slice(0,4)}</td><td><b>${escH(t.n||'Pagamento da fatura')}</b><small>${escH(mfPaySub(t))}</small></td><td>Pagamento</td><td><span class="mf-tag">Fatura</span></td><td class="dv-r"><b>−${R(Math.abs(+t.v||0))}</b></td><td class="dv-r"><button type="button" class="dv-act" data-e="${t.id}">Editar</button></td></tr>`}

/* ===== Patch 9c: Investimentos — "＋ Lançar" discreto no topo (só nesta aba) · "＋ Novo aporte" no fim de cada categoria · renda fixa simples · Patrimônio sem brilho por fora ===== */
/* Lançar abre a escolha: Ação, FII, ETF ou Renda fixa. Ação/FII/ETF: ticker, quantidade e preço médio (se o ativo já existe, soma as cotas e recalcula o preço médio).
   Renda fixa: nome da caixinha, valor aplicado e taxa (% do CDI); se a caixinha já existe, entra como aporte nela. */
var MF_LANC_OPTS=[['acao','Ação'],['fii','FII'],['etf','ETF'],['rf','Renda fixa']];
/* 0.4: o botão saiu do topo de Investimentos; agora fica dentro de "Posição", junto de "Meus ativos", com o nome "Novo lançamento". */
function mfLancBtn(){return '<button type="button" class="mf-lanc-btn" data-ivlanc aria-label="Novo lançamento de investimento">＋ Novo lançamento</button>'}
/* classe escolhida no lançamento vale quando o ticker não deixa claro (ex.: ETF que não está na lista) */
(function(){const _c=ivClass;ivClass=function(a){return a&&!a.f&&['acao','fii','etf'].includes(a.cls)&&!/reserva/i.test(a.a||'')?a.cls:_c(a)}})();
/* ===== Venda de ativos: baixa as cotas, guarda o lucro realizado e coloca o dinheiro na conta (transferência, não é receita) ===== */
function mfVendaOpen(){const I=(S.inv||[]).filter(a=>!a.f&&(+a.q||0)>0).sort((a,b)=>String(a.a).localeCompare(String(b.a)));
 if(!I.length){mfToast('Nenhum ativo com cotas para vender.');return}
 document.getElementById('mf-tr')?.remove();const w=document.createElement('div');w.id='mf-tr';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Vender ativo');
 const A=mfAccs(),accs=(A.length?A:[{id:'a1',n:'Conta principal'}]);
 w.innerHTML=`<div class="mf-cf-bg" data-trx="1"></div><form class="mf-cf-box mf-tr-box"><h3>Vender ativo</h3><p class="mf-cf-sub">Baixa as cotas da carteira e o valor da venda entra na conta (não conta como receita).</p>
 <label class="mfc-f">Ativo<select name="tk">${I.map(a=>`<option value="${escH(String(a.a).toUpperCase())}">${escH(a.a)} · ${(+a.q).toLocaleString('pt-BR')} cotas · PM ${R(+a.p||0)}</option>`).join('')}</select></label>
 <div class="mf-acc-2"><label class="mfc-f">Quantidade vendida<input name="q" inputmode="decimal" required placeholder="0"></label><label class="mfc-f">Preço por cota (R$)<input name="p" inputmode="decimal" required placeholder="0,00"></label></div>
 <div class="mf-acc-2"><label class="mfc-f">Data da venda<input type="date" name="d" value="${TD}" max="${TD}" required></label><label class="mfc-f">Entra na conta<select name="acc">${accs.map(a=>`<option value="${a.id}">${escH(a.n)}</option>`).join('')}</select></label></div>
 <p class="mf-vd-prev mu" aria-live="polite"></p>
 <div class="mf-cf-btns"><button type="submit" class="b mf-cf-ok">Registrar venda</button><button type="button" class="b s" data-trx="1">Cancelar</button></div></form>`;
 document.body.appendChild(w);const f=w.querySelector('form'),prev=w.querySelector('.mf-vd-prev');
 const calc=()=>{const tk=f.tk.value,a=I.find(x=>String(x.a).toUpperCase()===tk),q=mfNum(f.q.value),p=mfNum(f.p.value);if(!a||!(q>0)||!(p>0)){prev.textContent='';return}
  const l=(p-(+a.p||0))*Math.min(q,+a.q||0);prev.innerHTML=`Recebe ${R(q*p)} · ${l>=0?'lucro':'prejuízo'} de <b class="${l>=0?'ok':'bad'}">${R(Math.abs(l))}</b> sobre o preço médio${q>(+a.q||0)?` · <b class="bad">você só tem ${(+a.q).toLocaleString('pt-BR')} cotas</b>`:''}`};
 f.addEventListener('input',calc);f.addEventListener('change',calc);
 w.addEventListener('click',e=>{if(e.target.closest('[data-trx]')){e.preventDefault();w.remove()}});
 f.addEventListener('submit',e=>{e.preventDefault();const tk=f.tk.value,a=(S.inv||[]).find(x=>!x.f&&String(x.a).toUpperCase()===tk),q=mfNum(f.q.value),p=mfNum(f.p.value),d=/^\d{4}-\d{2}-\d{2}$/.test(f.d.value)&&f.d.value<=TD?f.d.value:TD;
  if(!a){mfToast('Escolha o ativo.');return}if(!(q>0)||!(p>0)){mfToast('Informe quantidade e preço.');return}if(q>(+a.q||0)+1e-9){mfToast(`Você só tem ${(+a.q).toLocaleString('pt-BR')} cotas de ${a.a}.`);return}
  const id='vd'+Date.now().toString(36),pm=+a.p||0,v=Math.round(q*p*100)/100,lucro=Math.round((p-pm)*q*100)/100;
  a.q=Math.round(((+a.q||0)-q)*1e6)/1e6;(a.ops=Array.isArray(a.ops)?a.ops:[]).push({d,q:-q,p,v:-v,venda:id});
  mfVendas().push({id,d,tk,q,p,pm,v,lucro,cls:mfVendaCls(tk)});
  S.tx.push({id:'n'+Date.now(),n:`Venda ${tk} · ${q.toLocaleString('pt-BR')} cotas`,v,d,c:'',t:'Transf',kind:'transf',from:'ativo:'+tk,to:'conta:'+(f.acc.value||mfAccMain()),venda:id,e:''});
  w.remove();save();draw();mfToast(`Venda registrada · ${lucro>=0?'lucro':'prejuízo'} de ${R(Math.abs(lucro))}`)})}
/* desfazer uma venda (a partir do lançamento dela) */
function mfVendaUndo(vid){const vd=mfVendas().find(x=>x.id===vid);if(!vd)return;const a=(S.inv||[]).find(x=>!x.f&&String(x.a).toUpperCase()===vd.tk);
 if(a){a.q=Math.round(((+a.q||0)+vd.q)*1e6)/1e6;a.ops=(a.ops||[]).filter(o=>o.venda!==vid)}S.vendas=mfVendas().filter(x=>x.id!==vid);S.tx=S.tx.filter(t=>t.venda!==vid);save();draw();mfToast('Venda desfeita ✓')}
function mfVendasHtml(){const V=mfVendas();if(!V.length)return '';const y=TD.slice(0,4),cur=TD.slice(0,7),va=V.filter(x=>x.d.slice(0,4)===y),vm=V.filter(x=>x.d.slice(0,7)===cur),s=a=>a.reduce((t,x)=>t+x.lucro,0),ir=mfVendaIR(cur);
 const meses=[...new Set(va.map(x=>x.d.slice(0,7)))],irAno=meses.reduce((t,k)=>t+mfVendaIR(k).tot,0);
 return B('i_vendas')+`<section class="c mf-pvx"><h2>Vendas e lucro realizado</h2>${anKpis([['Lucro no mês',anSig(s(vm)),s(vm)>=0?'ok':'bad'],['Lucro no ano',anSig(s(va)),s(va)>=0?'ok':'bad'],['IR estimado no mês',R(ir.tot),ir.tot>0?'bad':'',`<small class="mf-dl mu">${ir.vendAcoes>0&&ir.vendAcoes<=20000?'ações isentas (até R$ 20 mil)':'DARF até o último dia útil do mês seguinte'}</small>`],['IR estimado no ano',R(irAno),'']])}
 ${anRows(V.slice().sort((a,b)=>a.d<b.d?1:-1).slice(0,8).map(x=>[`${escH(x.tk)}<small class="mu" style="display:block;font-weight:500">${x.d.slice(8,10)}/${x.d.slice(5,7)} · ${x.q.toLocaleString('pt-BR')} × ${R(x.p)} (PM ${R(x.pm)})</small>`,R(x.v),{t:anSig(x.lucro),c:x.lucro>=0?'ok':'bad'}]))}
 <p class="mf-cmp">Estimativa simples (operações comuns, sem day trade e sem compensar prejuízos de meses anteriores). Confira com o seu contador.</p></section>`}

function mfLancOpen(){document.getElementById('mf-lanc')?.remove();const w=document.createElement('div');w.id='mf-lanc';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Lançar investimento');
 const sub={acao:'Ticker, quantidade e preço médio',fii:'Ticker, quantidade e preço médio',etf:'Ticker, quantidade e preço médio',rf:'Nome da caixinha, valor aplicado e taxa'};
 w.innerHTML=`<div class="ml-bg" data-close></div><section class="ml-box"><div class="ml-grab"></div><header class="ml-h"><b>Lançar investimento</b><button type="button" class="ml-x" data-close aria-label="Fechar">✕</button></header><div class="ml-list">${MF_LANC_OPTS.map(([k,n])=>`<button type="button" data-lancopt="${k}"><span class="ml-i" style="background:${IV_COLS[k]}"></span><span class="ml-t"><b>${n}</b><small>${sub[k]}</small></span><em aria-hidden="true">›</em></button>`).join('')}<button type="button" data-lancvenda="1"><span class="ml-i" style="background:var(--bad)"></span><span class="ml-t"><b>Vender ativo</b><small>Quantidade, preço de venda e data</small></span><em aria-hidden="true">›</em></button></div></section>`;
 document.body.appendChild(w);requestAnimationFrame(()=>w.classList.add('on'));
 w.addEventListener('click',e=>{const t=e.target;if(t.closest('[data-close]')){w.remove();return}if(t.closest('[data-lancvenda]')){w.remove();mfVendaOpen();return}const b=t.closest('[data-lancopt]');if(b){w.remove();mfIvForm(b.dataset.lancopt,false)}})}
function mfIvForm(k,aporte){const nm={acao:'ação',fii:'FII',etf:'ETF'}[k];
 if(k==='rf'||k==='rv'){openFixedIncomeModal();const f=document.querySelector('#fixed-income-backdrop form');if(!f)return;f.classList.add('mf-ff');f.dataset.cls=k;
  const lab=(n,t)=>{const i=f.querySelector(`[name="${n}"]`),l=i&&i.closest('label');if(l&&t!=null)l.querySelector('small').textContent=t;return l};
  [lab('fixed-type')].forEach(l=>{if(l)l.hidden=true});{const dl=lab('fixed-date','Data da aplicação'),di=f.querySelector('[name="fixed-date"]');if(di){di.max=TD;if(!di.value)di.value=TD}}const box=f.querySelector('.quick-fields>div');if(box)box.hidden=true;
  const ln=lab('fixed-name','Nome da caixinha');lab('fixed-principal','Valor aplicado (R$)');lab('fixed-percent','Taxa (% do CDI)');if(ln)ln.classList.add('mf-ff-n');
  const ni=f.querySelector('[name="fixed-name"]');ni.required=true;ni.placeholder='Ex.: Reserva, Caixinha Nubank';
  const L=(S.inv||[]).filter(a=>a.f&&(k==='rv'?ivClass(a)==='rv':true)).map(a=>String(a.a));if(L.length){const dl=document.createElement('datalist');dl.id='mf-cx';dl.innerHTML=L.map(t=>`<option value="${escH(t)}">`).join('');f.appendChild(dl);ni.setAttribute('list','mf-cx')}
  const cls=(S.inv||[]).filter(a=>a.f&&ivClass(a)===k);if(aporte&&cls.length===1)ni.value=cls[0].a;
  const h=f.querySelector('h2');if(h)h.textContent=aporte?`Novo aporte · ${IV_NOME[k]}`:'Lançar renda fixa';const sb=f.querySelector('button[type="submit"]');if(sb)sb.textContent=aporte?'Lançar aporte':'Adicionar';
  setTimeout(()=>{try{(ni.value?f.querySelector('[name="fixed-principal"]'):ni).focus()}catch(_){}},60);return}
 openAssetModal();const f=document.querySelector('#asset-modal-backdrop form');if(!f)return;f.dataset.cls=k;
 const h=f.querySelector('h2');if(h)h.textContent=aporte?`Novo aporte · ${IV_NOME[k]}`:`Lançar ${nm}`;if(aporte){const pl=f.querySelector('[name="asset-price"]');const sm=pl&&pl.closest('label')&&pl.closest('label').querySelector('small');if(sm)sm.textContent='Preço por cota (R$)'}const sb=f.querySelector('button[type="submit"]');if(sb)sb.textContent=aporte?'Lançar aporte':'Adicionar';
 const L=(S.inv||[]).filter(a=>!a.f&&ivClass(a)===k).map(a=>String(a.a).toUpperCase());if(L.length){const dl=document.createElement('datalist');dl.id='mf-tk';dl.innerHTML=L.map(t=>`<option value="${escH(t)}">`).join('');f.appendChild(dl);f.querySelector('[name="asset-ticker"]').setAttribute('list','mf-tk')}}
/* ativo: se o ticker já existe, soma as cotas e recalcula o preço médio (não cria linha repetida) */
document.addEventListener('submit',e=>{const form=e.target;if(!form||form.dataset.form!=='new-asset')return;e.preventDefault();e.stopImmediatePropagation();
 const fd=new FormData(form),tk=String(fd.get('asset-ticker')||'').trim().toUpperCase(),q=Number(fd.get('asset-qty')),p=Number(fd.get('asset-price')),k=form.dataset.cls||'',dd0=String(fd.get('asset-date')||''),dd=/^\d{4}-\d{2}-\d{2}$/.test(dd0)&&dd0<=TD?dd0:TD;
 if(!tk){mfToast('Informe o ticker ou código do ativo.');return}if(!Number.isFinite(q)||q<0||!Number.isFinite(p)||p<0){mfToast('Confira a quantidade e o preço médio.');return}
 const ex=(S.inv||[]).find(a=>!a.f&&String(a.a||'').trim().toUpperCase()===tk);
 if(ex){if(!(q>0)){mfToast('Informe a quantidade comprada.');return}const q0=+ex.q||0,p0=+ex.p||0,qn=q0+q;ex.p=Math.round((q0*p0+q*p)/qn*10000)/10000;ex.q=qn;(ex.ops=Array.isArray(ex.ops)?ex.ops:[]).push({d:dd,q,p,v:Math.round(q*p*100)/100});save();form.closest('#asset-modal-backdrop')?.remove();draw();mfToast(`${tk}: +${q} ${q===1?'cota':'cotas'} · preço médio ${R(ex.p)}`);return}
 const a={a:tk,q,p,d:0,k:'Crescimento'};if(q>0&&p>0)a.ops=[{d:dd,q,p,v:Math.round(q*p*100)/100}];if(['acao','fii','etf'].includes(k)&&fcl(a)!==k)a.cls=k;S.inv.push(a);save();form.closest('#asset-modal-backdrop')?.remove();draw();mfToast(`${tk} adicionado`)},true);
/* renda fixa: caixinha que já existe recebe o valor como aporte */
document.addEventListener('submit',e=>{const form=e.target;if(!form||form.dataset.form!=='fixed-income')return;const fd=new FormData(form),nm=String(fd.get('fixed-name')||'').trim(),v=Number(fd.get('fixed-principal')),d=String(fd.get('fixed-date')||TD);
 const ex=nm&&(S.inv||[]).find(a=>a.f&&String(a.a||'').trim().toLowerCase()===nm.toLowerCase());if(!ex)return;e.preventDefault();e.stopImmediatePropagation();
 if(!Number.isFinite(v)||v<=0){mfToast('Informe um valor aplicado maior que zero.');return}
 if(isCdbAsset(ex)){ensureCdbData(ex);ex.cdbAportes.push({id:'cdbap'+Date.now(),v,d});ex.cdbPrincipal=Math.max(0,+ex.cdbPrincipal||0);ex.p=ex.cdbPrincipal+ex.cdbAportes.reduce((s,x)=>s+(+x.v||0),0)}else ex.p=(+ex.p||0)+v;
 save();form.closest('#fixed-income-backdrop')?.remove();draw();mfToast(`${ex.a}: aporte de ${R(v)}`)},true);
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||document.body.classList.contains('org-on'))return;let b;
 if(t.closest('[data-ivlanc]')){e.preventDefault();e.stopPropagation();mfLancOpen();return}
 if(b=t.closest('[data-ivaporte]')){e.preventDefault();e.stopPropagation();const k=b.dataset.ivaporte;if(k)mfIvForm(k,true);else mfLancOpen()}},true);


try{const st0=(S.prefs||{}).startTab;if(st0&&TN[st0]){tab=st0;if(st0==='res')ym=TD.slice(0,7)}}catch(e){}
try{window.MF_PRIV=localStorage.getItem('fin1_priv')==='1'}catch(e){}
draw();
// A autenticação e a sincronização Supabase são inicializadas após o carregamento do app.

/* ===== Script 1 · 16: bloco "Compras do mês" (agrupadas) em Contas › Compras ===== */
function mfCmpHtml(){const G=mfCmpGrupos(ym),rep=G.filter(g=>g.q>1),nT=G.reduce((s,g)=>s+g.q,0),vT=G.reduce((s,g)=>s+g.v,0),vR=rep.reduce((s,g)=>s+g.v,0);
 const head=`<div class="mf-lmn mf-lnav" role="group" aria-label="Mês das compras"><button type="button" data-m="-1" aria-label="Mês anterior">‹</button><span aria-live="polite"><b>${MESF[+ym.slice(5)-1]} ${ym.slice(0,4)}</b></span><button type="button" data-m="1" aria-label="Próximo mês">›</button></div>`;
 if(!G.length)return B('p_cmpg')+`<section class="c mf-cmpg"><h2>Compras do mês</h2>${head}<p class="mf-empty">Nenhuma compra lançada em ${mfMs(ym)}.</p></section>`;
 const lim=20,mostra=G.slice(0,lim);
 const linha=g=>`<div class="mf-cmpg-r"><div class="mf-cmpg-n"><b>${escH(g.n)}</b><small class="mu">${g.q===1?'1 compra':g.q+' compras'}${g.ritmo?' · '+g.ritmo:''}${g.q>1?' · média '+R(g.med):''}${g.cred?' · '+(g.cred===g.q?'no crédito':g.cred+' no crédito'):''}</small></div><b class="mf-cmpg-v">${R(g.v)}</b></div>`;
 return B('p_cmpg')+`<section class="c mf-cmpg"><h2>Compras do mês</h2>${head}
 <div class="mf-cmpg-kv"><div><small>Compras</small><b>${nT}</b></div><div><small>Total</small><b>${R(vT)}</b></div><div><small>Repetidas</small><b>${rep.length?R(vR):'—'}</b></div></div>
 ${rep.length?`<p class="mf-cmpg-h">Compras que se repetem</p>${rep.slice(0,lim).map(linha).join('')}`:''}
 <p class="mf-cmpg-h">Todas as compras agrupadas${G.length>lim?` (${lim} maiores de ${G.length})`:''}</p>${mostra.map(linha).join('')}
 <small class="mu mf-cmpg-f">As compras parecidas são agrupadas só para você ver o total; os lançamentos continuam separados, um por compra. Conta pela data da compra (como na Distribuição), não pelo mês da fatura.</small></section>`}

/* ===== Fase 3 · M8: card do cartão compacto e clicável =====
   Fechado: título, valor da fatura centralizado e só "Importar fatura" e "Configurar cartão".
   Aberto (tocando no card): meses, compras da fatura em cascata (da mais recente para a mais antiga), parcelamentos e Pagar fatura.
   0.4: a legenda das bolinhas e as barras por categoria (Lazer, Pessoal…) saíram do card aberto; abrir e recolher têm animação suave (js/88).
   Nada de cálculo mudou (fechamento, vencimento e contabilização são os mesmos): só mudou onde cada coisa aparece.
   As janelas de "Pagar fatura", "Compras da fatura" e "Importar fatura" continuam as mesmas (data-cbtile). */
window.__cbExp = window.__cbExp || false;
function mfCbxParcelas(inv) {
  const baseN = n => String(n || 'Compra').replace(/\s*\(\d+\/\d+\)\s*$/, '');
  const key = t => t.installmentId || (baseN(t.n) + '|' + t.installmentCount);
  const out = [];
  inv.rows.forEach(t => {
    if (!(+t.installmentCount > 1)) return;
    const k = key(t), cur = +t.installmentIndex || 0;
    const rest = (S.tx || []).filter(x => +x.installmentCount > 1 && key(x) === k && (+x.installmentIndex || 0) > cur);
    out.push({ n: baseN(t.n), i: cur, c: +t.installmentCount, v: txValue(t), falta: rest.length, tot: rest.reduce((s, x) => s + txValue(x), 0) });
  });
  return out;
}
(function () {
  const _pl = plCardBillingHtml;
  plCardBillingHtml = function () {
    let h = _pl();
    if (h.indexOf('class="cb-strip"') < 0 || h.indexOf('class="cb-hero"') < 0 || h.indexOf('class="cb-panes"') < 0) return h;
    const exp = !!window.__cbExp, sel = mfCbMonth(), inv = cbInvoice(sel), paid = inv.total > 0.005 && mfFatPaid(sel);
    const take = rx => { const m = h.match(rx); if (!m) return ''; h = h.replace(m[0], ''); return m[0]; };
    /* tira um <div class="X"> inteiro, contando as aberturas e fechamentos (o limite do cartão tem divs dentro de divs) */
    const takeDiv = cls => {
      const i = h.indexOf('<div class="' + cls + '"'); if (i < 0) return '';
      const re = /<(\/?)div\b/g; re.lastIndex = i; let d = 0, m;
      while ((m = re.exec(h))) { d += m[1] ? -1 : 1; if (!d) { const f = h.indexOf('>', m.index) + 1, out = h.slice(i, f); h = h.slice(0, i) + h.slice(f); return out; } }
      return '';
    };
    const lim = takeDiv('cc-lim-box'), strip = take(/<div class="cb-strip"[\s\S]*?<\/div>/), legend = take(/<div class="cb-legend"[\s\S]*?<\/div>/),
      cats = takeDiv('cb-cats'), hint = take(/<p class="cc-lim-hint[^>]*>[\s\S]*?<\/p>/);
    h = h.replace(/<button type="button" class="cb-tile" data-cbtile="(?:list|pay)"[^>]*>[\s\S]*?<\/button>/g, '');
    h = h.replace('<section class="c card-billing-compact cb-card">', `<section class="c card-billing-compact cb-card cbx${exp ? ' cbx-on' : ''}" data-cbxtog>`);
    h = h.replace('<div class="cb-hero">', `<div class="cb-hero" data-cbxh role="button" tabindex="0" aria-expanded="${exp}" aria-label="${exp ? 'Recolher' : 'Abrir'} os detalhes do cartão">`);
    /* limite usado/disponível fica sempre visível logo abaixo da fatura (barra fina, não pesa no card compacto) */
    if (lim) h = h.replace('<div class="cb-tiles">', lim + '<div class="cb-tiles">');
    if (!exp) return h;
    const rows = inv.rows.slice().sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : txValue(b) - txValue(a))), N = 12;
    const cmp = `<div class="cbx-sec cbx-list"><div class="cbx-h"><b>Compras da fatura</b><small>${rows.length}</small></div>${rows.length
      ? rows.slice(0, N).map((t, i) => `<div class="cbx-r" style="--i:${i}"><span><b>${escH(String(t.n || 'Compra').replace(/\s*\(\d+\/\d+\)\s*$/, ''))}</b><small>${t.d.slice(8, 10)}/${t.d.slice(5, 7)}${t.c ? ' · ' + escH(t.c) : ''}${t.installmentCount > 1 ? ` · parcela ${t.installmentIndex}/${t.installmentCount}` : ''}</small></span><b>${R(txValue(t))}</b></div>`).join('')
      : '<p class="mu cbx-e">Nenhuma compra no crédito nesta fatura.</p>'}${rows.length > N ? `<button type="button" class="cbx-more" data-cbtile="list">Ver todas as ${rows.length} compras</button>` : ''}</div>`;
    const P = mfCbxParcelas(inv);
    const par = `<div class="cbx-sec cbx-par"><div class="cbx-h"><b>Parcelamentos</b><small>${P.length}</small></div>${P.length
      ? P.map((p, i) => `<div class="cbx-r" style="--i:${Math.min(rows.length, N) + i}"><span><b>${escH(p.n)}</b><small>parcela ${p.i}/${p.c}${p.falta ? ` · faltam ${p.falta} (${R(p.tot)})` : ' · última parcela'}</small></span><b>${R(p.v)}</b></div>`).join('')
      : '<p class="mu cbx-e">Nenhuma compra parcelada nesta fatura.</p>'}</div>`;
    const pay = `<div class="cbx-sec cbx-pay"><button type="button" class="b cbx-paybtn${paid ? ' is-paid' : ''}" data-cbtile="pay">${paid ? '✓ Fatura paga' : 'Pagar fatura'}</button></div>`;
    return h.replace('<div class="cb-panes"', `<div class="cbx-body">${strip}${cmp}${par}${pay}${hint}</div><div class="cb-panes"`);
  };
})();
/* abre ou recolhe o card. Ao recolher, a camada de polimento (js/88) pode animar antes de redesenhar. */
function mfCbxToggle() {
  const abrir = !window.__cbExp, vai = () => { window.__cbExp = abrir; window.__cbxAbriu = abrir; draw(); };
  if (!abrir && typeof window.mfCbxFechar === 'function') window.mfCbxFechar(vai); else vai();
}
document.addEventListener('click', e => {
  const t = e.target; if (!t || !t.closest) return;
  const c = t.closest('#app [data-cbxtog]');
  if (!c || document.body.classList.contains('org-on') || t.closest('.cbx-body') || t.closest('button,a,input,select,textarea,label,summary,[data-cbtile]')) return;
  mfCbxToggle();
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches && e.target.matches('#app [data-cbxh]')) { e.preventDefault(); mfCbxToggle(); }
});
/* "Escolher o que mostrar": a opção "Compras da fatura" agora esconde a lista dentro do card aberto */
try { (MF_VIEW.p_faturas.o || []).forEach(o => { if (o.k === 'list') o.sel = '.cbx-list,[data-cbtile="list"]'; }); } catch (e) {}

/* ===== Fase 3 · M17: layouts de lançamento (seis desde a 1.18) =====
   Todos usam o MESMO formulário (vAdd) e a mesma lógica de salvar: aqui só se escolhe a organização (classe mf-lay-X) e, no "Passo a passo",
   os campos do mesmo formulário são agrupados em etapas. Nada de cadastro foi duplicado. A escolha fica em S.prefs.lanLay (de cada usuário). */
/* 1.18: seis layouts limpos. Os que saíram (Cartões grandes, Minimalista, Valor colorido, Rápido, Bolhas) continuam
   valendo para quem já tinha escolhido: passam para o mais parecido (MF_LANC_ANTIGOS). A escolha salva não é apagada. */
var MF_LANC_LAYS = [
  ['classico', 'Clássico', 'Como sempre foi: tipo, valor, data e descrição, categorias e pagamento, um embaixo do outro.'],
  ['valor', 'Valor em destaque', 'O valor grande no centro. Categorias e formas de pagamento numa linha que desliza para o lado.'],
  ['cartao', 'Cartão', 'Tipo e valor juntos num cartão no alto. Categorias em duas colunas, com ícone e nome.'],
  ['lista', 'Ficha', 'Tudo numa ficha só: cada campo numa linha, com o nome à esquerda e o que você digita à direita.'],
  ['compacto', 'Compacto', 'Menos espaço: campos baixos e categorias numa linha que desliza. Bom para lançar vários seguidos.'],
  ['passos', 'Passo a passo', 'Uma pergunta por vez: valor, descrição, categoria e pagamento. O botão Salvar aparece no último passo.']
];
var MF_LANC_ANTIGOS = { cartoes: 'cartao', colorido: 'cartao', minimal: 'lista', rapido: 'compacto', bolhas: 'compacto' };
window.__lstep = window.__lstep || 1;
function mfLancLay() { let v = (S.prefs || {}).lanLay; v = MF_LANC_ANTIGOS[v] || v; return MF_LANC_LAYS.some(x => x[0] === v) ? v : 'valor'; }
function mfLancNome(id) { const x = MF_LANC_LAYS.find(y => y[0] === id); return x ? x[1] : ''; }
(function () {
  const _va = vAdd;
  vAdd = function () {
    let h = _va();
    const ABRE = 'class="c form-add mf-form"';
    if (h.indexOf(ABRE) < 0) return h;
    const tryId = MF_LANC_LAYS.some(x => x[0] === window.__lyTry) ? window.__lyTry : null;
    let lay = tryId || mfLancLay();
    if (lay === 'passos' && F.id) lay = 'classico'; /* editar um lançamento existente mostra tudo de uma vez */
    const banner = tryId ? `<div class="mf-lytry"><span>Pré-visualização: <b>${escH(mfLancNome(tryId))}</b></span><button type="button" data-lyuse="${tryId}">Usar este</button><button type="button" data-lyno="1">Voltar</button></div>` : '';
    if (lay !== 'passos') return h.replace(ABRE, `class="c form-add mf-form mf-lay-${lay}"`).replace(`mf-lay-${lay}">`, `mf-lay-${lay}">${banner}`);
    /* Passo a passo: agrupa os campos do mesmo formulário em etapas */
    const t = document.createElement('template'); t.innerHTML = h;
    const f = t.content.querySelector('.mf-form'); if (!f) return h;
    const G = { 1: [], 2: [], 3: [], 4: [] }, kids = [...f.children];
    kids.forEach((el, i) => {
      if (el.tagName === 'H2' || el.classList.contains('mf-fbtns')) return;
      let n = 4;
      if (el.classList.contains('mf-type') || el.classList.contains('mf-amt')) n = 1;
      else if (el.classList.contains('mf-frow')) n = 2;
      else if (el.classList.contains('mf-cats')) n = 3;
      else if (el.classList.contains('mf-flab') && kids[i + 1] && kids[i + 1].classList.contains('mf-cats')) n = 3;
      G[n].push(el);
    });
    const fb = f.querySelector('.mf-fbtns'), present = [1, 2, 3, 4].filter(n => G[n].length);
    present.forEach(n => { const w = document.createElement('div'); w.className = 'lstp'; w.dataset.lp = n; G[n].forEach(el => w.appendChild(el)); f.insertBefore(w, fb); });
    const cur = tryId ? present[0] : (present.includes(window.__lstep) ? window.__lstep : present[0]);
    f.className = 'c form-add mf-form mf-lay-passos' + (cur === present[0] ? ' lini' : '') + (cur === present[present.length - 1] ? ' lfim' : ''); f.dataset.lstep = cur; f.dataset.lsteps = present.join(',');
    const nav = document.createElement('div'); nav.className = 'mf-lynav';
    nav.innerHTML = `<div class="mf-ldots" aria-hidden="true">${present.map(n => `<i data-ld="${n}"></i>`).join('')}</div><div class="mf-lgo"><button type="button" class="b s" data-lgo="-1">Voltar</button><button type="button" class="b" data-lgo="1">Próximo</button></div>`;
    f.insertBefore(nav, fb);
    if (banner) { const b = document.createElement('div'); b.innerHTML = banner; f.insertBefore(b.firstChild, f.firstChild); }
    return t.innerHTML;
  };
})();
document.addEventListener('click', e => {
  const t = e.target; if (!t || !t.closest) return;
  const g = t.closest('#app [data-lgo]');
  if (g) {
    e.preventDefault(); e.stopPropagation();
    const f = g.closest('.mf-form'), L = (f.dataset.lsteps || '1').split(',').map(Number), i = L.indexOf(+f.dataset.lstep), j = Math.max(0, Math.min(L.length - 1, i + (+g.dataset.lgo)));
    f.dataset.lstep = L[j]; if (!window.__lyTry) window.__lstep = L[j]; f.classList.toggle('lini', j === 0); f.classList.toggle('lfim', j === L.length - 1);
    const inp = f.querySelector(`.lstp[data-lp="${L[j]}"] input,.lstp[data-lp="${L[j]}"] select`); if (inp && L[j] !== 1) { try { inp.focus({ preventScroll: true }); } catch (_) { } }
    return;
  }
  if (t.closest('#app #fs')) window.__lstep = 1; /* Salvar (ou faltou o valor): volta para o primeiro passo */
  const u = t.closest('#app [data-lyuse]');
  if (u) { e.preventDefault(); e.stopPropagation(); S.prefs = S.prefs || {}; S.prefs.lanLay = u.dataset.lyuse; window.__lyTry = null; save(); draw(); if (window.mfToast) mfToast('Layout de lançamento salvo ✓'); return; }
  if (t.closest('#app [data-lyno]')) { e.preventDefault(); e.stopPropagation(); window.__lyTry = null; draw(); window.mfCfgOpen && mfCfgOpen('lancar'); }
}, true);
window.__mfPre.push(function () { if (tab !== 'add') { window.__lyTry = null; window.__lstep = 1; } });
