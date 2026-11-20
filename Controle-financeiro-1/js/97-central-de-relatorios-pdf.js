
/* ===== Central de Relatórios em PDF (patch 26) ===== */
(function(){
const H=v=>escH(String(v==null?'':v));
const money=n=>(+n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}).replace(/ /g,' ');
const pct=(n,d=1)=>n==null||!isFinite(n)?'—':(n).toFixed(d).replace('.',',')+'%';
const brDate=iso=>iso?iso.slice(8,10)+'/'+iso.slice(5,7)+'/'+iso.slice(0,4):'';
const varPct=(cur,prev)=>prev>0?((cur-prev)/prev*100):null;
const sgn=p=>p==null?'—':(p>=0?'+':'-')+Math.abs(p).toFixed(0)+'%';
const TIPOS_R={mensal:'Relatório financeiro mensal',gastos:'Relatório de análise de gastos',invest:'Relatório de investimentos',anual:'Relatório anual'};
const st={type:'mensal',month:TD.slice(0,7),year:+TD.slice(0,4),model:null,busy:false,msg:'',ok:true,file:null};
const spendRows=k=>S.tx.filter(t=>t.d&&t.d.slice(0,7)===k&&anSpend(t));
const sub=t=>t.s||inferSub(t.c);
const yearsWithData=()=>{const ys=new Set([+TD.slice(0,4)]);(S.tx||[]).forEach(t=>{const y=+String(t.d||'').slice(0,4);if(y>2000&&y<=+TD.slice(0,4)+1)ys.add(y)});return [...ys].sort((a,b)=>b-a)};
const monthsBack=(k,n)=>Array.from({length:n},(_,i)=>nm(k,i-(n-1)));
const sortObj=o=>Object.entries(o).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]);

function mMensal(k){const [y,m]=k.split('-').map(Number),a=anMonth(y,m),pk=nm(k,-1),b=anMonth(...pk.split('-').map(Number)),cats=sortObj(a.cats),tot=a.exp;
 const ev=monthsBack(k,6).map(x=>{const r=anMonth(...x.split('-').map(Number));return [lab(x),r.rec,r.exp,r.bal]});
 const conc=[];
 conc.push(a.bal>=0?`O mês fechou com saldo positivo de ${money(a.bal)}.`:`O mês fechou com saldo negativo de ${money(-a.bal)}: as despesas passaram as receitas.`);
 if(a.poup!=null)conc.push(`A taxa de economia foi de ${pct(a.poup)} da renda.`);
 if(cats.length)conc.push(`A maior categoria de gasto foi ${cats[0][0]}, com ${money(cats[0][1])} (${pct(cats[0][1]/tot*100,0)} das despesas).`);
 const dv=varPct(a.exp,b.exp);if(dv!=null)conc.push(`As despesas ${dv>=0?'subiram':'caíram'} ${Math.abs(dv).toFixed(0)}% em relação a ${lab(pk)}.`);
 if(!a.rec&&!a.exp)conc.splice(0,conc.length,'Não há lançamentos registrados neste mês.');
 return {title:TIPOS_R.mensal,period:lab(k)+(k>TD.slice(0,7)?' (previsto)':''),
  kpis:[['Receitas',money(a.rec)],['Despesas',money(a.exp)],['Saldo final',money(a.bal)],['Investido',money(a.inv)],['Taxa de economia',pct(a.poup)]],
  sections:[
   {title:'Gastos por categoria',bars:cats.slice(0,10).map(([c,v])=>[c,v]),table:{head:['Categoria','Valor','% das despesas'],rows:cats.map(([c,v])=>[c,money(v),pct(v/tot*100)])},empty:'Sem despesas no mês.'},
   {title:`Comparação com ${lab(pk)}`,table:{head:['Indicador',lab(k),lab(pk),'Variação'],rows:[['Receitas',money(a.rec),money(b.rec),sgn(varPct(a.rec,b.rec))],['Despesas',money(a.exp),money(b.exp),sgn(varPct(a.exp,b.exp))],['Saldo',money(a.bal),money(b.bal),'—'],['Investido',money(a.inv),money(b.inv),sgn(varPct(a.inv,b.inv))]]}},
   {title:'Evolução financeira (últimos 6 meses)',bars:ev.map(r=>[r[0].replace(/ de \d{4}$/,''),r[3]]),barsLabel:'Saldo do mês',table:{head:['Mês','Receitas','Despesas','Saldo'],rows:ev.map(r=>[r[0],money(r[1]),money(r[2]),money(r[3])])}}],
  conclusion:conc}}

function mGastos(k){const rows=spendRows(k),tot=rows.reduce((s,t)=>s+(+t.v||0),0),pk=nm(k,-1),prow=spendRows(pk);
 const by=(arr,f)=>{const o={};arr.forEach(t=>{const g=f(t);o[g]=(o[g]||0)+(+t.v||0)});return o};
 const cat=by(rows,t=>t.c),catP=by(prow,t=>t.c),main=by(rows,t=>inferMain(t.c,t.s)),lazer=rows.filter(t=>sub(t)==='Lazer').reduce((s,t)=>s+(+t.v||0),0);
 const isFixa=t=>!!(t.recurringId||t.autoRecurring)||['Conta fixa','Moradia','Assinatura'].includes(sub(t));
 const fixas=rows.filter(isFixa).reduce((s,t)=>s+(+t.v||0),0);
 const top=rows.slice().sort((a,b)=>(+b.v||0)-(+a.v||0)).slice(0,10);
 const hist=monthsBack(k,6).map(x=>[lab(x).replace(/ de \d{4}$/,''),spendRows(x).reduce((s,t)=>s+(+t.v||0),0)]);
 const allC=new Set([...Object.keys(cat),...Object.keys(catP)]),chg=[...allC].map(c=>[c,(cat[c]||0)-(catP[c]||0),cat[c]||0,catP[c]||0]).filter(r=>Math.abs(r[1])>0.005).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,8);
 const conc=[];if(!rows.length)conc.push('Não há despesas registradas neste mês.');else{
  conc.push(`Você gastou ${money(tot)} em ${lab(k)}, em ${rows.length} lançamentos.`);
  const ess=main['Essencial']||0;conc.push(`Gastos essenciais somaram ${money(ess)} (${pct(ess/tot*100,0)}) e os não essenciais ${money(tot-ess)} (${pct((tot-ess)/tot*100,0)}).`);
  const up=chg.filter(r=>r[1]>0)[0],dn=chg.filter(r=>r[1]<0)[0];if(up)conc.push(`O maior aumento foi em ${up[0]} (+${money(up[1])}).`);if(dn)conc.push(`A maior redução foi em ${dn[0]} (-${money(-dn[1])}).`)}
 return {title:TIPOS_R.gastos,period:lab(k),
  kpis:[['Total de gastos',money(tot)],['Essenciais',money(main['Essencial']||0)],['Não essenciais',money(tot-(main['Essencial']||0))],['Lazer',money(lazer)],['Fixas',money(fixas)],['Variáveis',money(tot-fixas)]],
  sections:[
   {title:'Gastos por categoria',bars:sortObj(cat).slice(0,10),table:{head:['Categoria','Valor','%'],rows:sortObj(cat).map(([c,v])=>[c,money(v),pct(v/tot*100)])},empty:'Sem despesas no mês.'},
   {title:'Maiores despesas',table:{head:['Data','Descrição','Categoria','Valor'],rows:top.map(t=>[brDate(t.d),t.n||'(sem descrição)',t.c,money(t.v)])},empty:'Sem despesas no mês.'},
   {title:'Comparação entre meses',bars:hist,barsLabel:'Gastos por mês',table:{head:['Mês','Gastos'],rows:hist.map(r=>[r[0],money(r[1])])}},
   {title:`Aumentos e reduções em relação a ${lab(pk)}`,table:{head:['Categoria',lab(k),lab(pk),'Diferença'],rows:chg.map(r=>[r[0],money(r[2]),money(r[3]),(r[1]>=0?'+':'-')+money(Math.abs(r[1]))])},empty:'Sem diferenças para comparar.'}],
  conclusion:conc}}

function mInvest(y){const I=(S.inv||[]).filter(a=>a&&a.a);const now=a=>ivNow(a)||0,cost=a=>ivCost(a)||0,has=a=>ivHasGain(a);
 const tot=I.reduce((s,a)=>s+now(a),0),ctot=I.reduce((s,a)=>s+cost(a),0),G=I.filter(has),gain=G.reduce((s,a)=>s+(now(a)-cost(a)),0),gcost=G.reduce((s,a)=>s+cost(a),0);
 const lucro=G.reduce((s,a)=>s+Math.max(0,now(a)-cost(a)),0),prej=G.reduce((s,a)=>s+Math.min(0,now(a)-cost(a)),0);
 const cls={};I.forEach(a=>{const k=IV_NOME[ivClass(a)]||'Outros';cls[k]=(cls[k]||0)+now(a)});
 const ap=Array.from({length:12},(_,i)=>{const k=mk(y,i+1);return [MES[i],S.tx.filter(t=>t.d&&t.d.slice(0,7)===k&&t.c==='Investimento').reduce((s,t)=>s+(+t.v||0),0)]}),apT=ap.reduce((s,r)=>s+r[1],0);
 let acc=0;const apAcc=ap.map(r=>[r[0],acc+=r[1]]);
 const conc=[];if(!I.length)conc.push('Nenhum ativo cadastrado na carteira.');else{
  conc.push(`O patrimônio investido hoje é de ${money(tot)}, distribuído em ${I.length} ativos.`);
  if(G.length)conc.push(`Nos ativos com cotação, o resultado é de ${money(gain)} (${pct(gcost?gain/gcost*100:null)}) sobre o valor aplicado.`);
  const c=sortObj(cls)[0];if(c)conc.push(`A maior classe é ${c[0]}, com ${pct(c[1]/tot*100,0)} da carteira.`)}
 conc.push(`Em ${y} você registrou ${money(apT)} em aportes. Aportes são dinheiro novo e não entram no cálculo de rentabilidade.`);
 return {title:TIPOS_R.invest,period:`Carteira atual · aportes de ${y}`,
  kpis:[['Patrimônio investido',money(tot)],['Valor aplicado',money(ctot)],['Aportes no ano',money(apT)],['Rentabilidade',G.length?pct(gcost?gain/gcost*100:null):'—'],['Lucros',money(lucro)],['Prejuízos',money(prej)]],
  sections:[
   {title:'Distribuição por classe de ativos',bars:sortObj(cls),table:{head:['Classe','Valor','% da carteira'],rows:sortObj(cls).map(([c,v])=>[c,money(v),pct(v/tot*100)])},empty:'Nenhum ativo cadastrado.'},
   {title:'Ativos',table:{head:['Ativo','Classe','Aplicado','Atual','Resultado'],rows:I.slice().sort((a,b)=>now(b)-now(a)).map(a=>[String(a.a),IV_NOME[ivClass(a)]||'',money(cost(a)),money(now(a)),has(a)?`${money(now(a)-cost(a))} (${pct(cost(a)?(now(a)-cost(a))/cost(a)*100:null)})`:'sem cotação'])},empty:'Nenhum ativo cadastrado.'},
   {title:`Aportes realizados em ${y}`,bars:ap.filter(r=>r[1]>0),barsLabel:'Aportes por mês',table:{head:['Mês','Aporte','Acumulado'],rows:ap.map((r,i)=>[r[0],money(r[1]),money(apAcc[i][1])])}},
   {title:'Dividendos e proventos',text:'Não há proventos registrados no app. Esta seção fica vazia até que eles sejam lançados.'},
   {title:'Evolução patrimonial',text:'O app ainda não guarda o histórico do valor da carteira mês a mês. A tabela de aportes acima mostra quanto dinheiro novo entrou ao longo do ano.'}],
  conclusion:conc}}

function mAnual(y){const cur=+TD.slice(0,4),lastM=y===cur?+TD.slice(5,7):12,M=anYear(y).slice(0,lastM);
 const rec=M.reduce((s,r)=>s+r.rec,0),exp=M.reduce((s,r)=>s+r.exp,0),inv=M.reduce((s,r)=>s+r.inv,0),bal=rec-exp;
 const cats={};M.forEach(r=>Object.entries(r.cats||{}).forEach(([c,v])=>cats[c]=(cats[c]||0)+v));
 const best=M.filter(r=>r.rec||r.exp).sort((a,b)=>b.bal-a.bal);
 const conc=[];if(!rec&&!exp)conc.push(`Não há lançamentos registrados em ${y}.`);else{
  conc.push(`Em ${y}${y===cur?' (até '+MESF[lastM-1].toLowerCase()+')':''}, as receitas somaram ${money(rec)} e as despesas ${money(exp)}, com saldo de ${money(bal)}.`);
  if(rec>0)conc.push(`A taxa de economia do ano foi de ${pct(bal/rec*100)}.`);
  if(best.length)conc.push(`O melhor mês foi ${MESF[best[0].m-1].toLowerCase()} (saldo de ${money(best[0].bal)}) e o mais apertado foi ${MESF[best[best.length-1].m-1].toLowerCase()} (${money(best[best.length-1].bal)}).`);
  const c=sortObj(cats)[0];if(c)conc.push(`A categoria com mais gastos no ano foi ${c[0]} (${money(c[1])}).`)}
 return {title:TIPOS_R.anual,period:String(y)+(y===cur?' (até '+MESF[lastM-1].toLowerCase()+')':''),
  kpis:[['Receitas acumuladas',money(rec)],['Despesas acumuladas',money(exp)],['Saldo acumulado',money(bal)],['Total investido',money(inv)],['Taxa de economia anual',rec>0?pct(bal/rec*100):'—']],
  sections:[
   {title:'Evolução mês a mês',bars:M.map(r=>[MES[r.m-1],r.bal]),barsLabel:'Saldo do mês',table:{head:['Mês','Receitas','Despesas','Saldo','Investido','Economia'],rows:M.map(r=>[MESF[r.m-1],money(r.rec),money(r.exp),money(r.bal),money(r.inv),pct(r.poup)])}},
   {title:'Gastos por categoria no ano',bars:sortObj(cats).slice(0,10),table:{head:['Categoria','Valor','%'],rows:sortObj(cats).map(([c,v])=>[c,money(v),pct(v/exp*100)])},empty:'Sem despesas no ano.'},
   {title:'Evolução do patrimônio',text:'O app ainda não guarda o histórico do patrimônio mês a mês, então esta parte não é mostrada para não inventar dados. O total investido no ano aparece no resumo.'}],
  conclusion:conc}}

function build(){const k=st.month,y=+st.year;return st.type==='gastos'?mGastos(k):st.type==='invest'?mInvest(y):st.type==='anual'?mAnual(y):mMensal(k)}

/* ---------- visualização na tela ---------- */
function barsHtml(data,label){if(!data||!data.length)return '';const mx=Math.max(...data.map(r=>Math.abs(r[1])),1);
 return `<div class="mfr-bars">${label?`<small>${label}</small>`:''}${data.map(([n,v])=>`<div class="mfr-bar"><span>${H(n)}</span><i><b style="width:${Math.abs(v)/mx*100}%;${v<0?'background:var(--bad)':''}"></b></i><em>${money(v)}</em></div>`).join('')}</div>`}
function modelHtml(m){return `<div class="mfr-prev"><div class="mfr-ph"><b>${H(m.title)}</b><small>${H(m.period)}</small></div>
 <div class="mfr-kpis">${m.kpis.map(([l,v])=>`<div><small>${H(l)}</small><b>${H(v)}</b></div>`).join('')}</div>
 ${m.sections.map(s=>`<div class="mfr-sec"><h3>${H(s.title)}</h3>${s.text?`<p>${H(s.text)}</p>`:''}${barsHtml(s.bars,s.barsLabel)}${s.table?(s.table.rows.length?`<div class="mfr-tw"><table><thead><tr>${s.table.head.map(h=>`<th>${H(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r=>`<tr>${r.map(c=>`<td>${H(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:`<p>${H(s.empty||'Sem dados.')}</p>`):''}</div>`).join('')}
 <div class="mfr-sec"><h3>Conclusão</h3>${m.conclusion.map(c=>`<p>${H(c)}</p>`).join('')}</div></div>`}

window.mfReportsView=function(head){const per=st.type==='mensal'||st.type==='gastos'?`<label class="mfc-f">Mês<input type="month" data-rp="month" value="${st.month}"></label>`:`<label class="mfc-f">Ano<select data-rp="year">${yearsWithData().map(y=>`<option value="${y}" ${y===+st.year?'selected':''}>${y}</option>`).join('')}</select></label>`;
 return head('Central de Relatórios')+`<div class="mfc-group mfc-pad"><label class="mfc-f">Tipo de relatório<select data-rp="type">${Object.entries(TIPOS_R).map(([k,t])=>`<option value="${k}" ${k===st.type?'selected':''}>${t}</option>`).join('')}</select></label>${per}
 <div class="mfr-btns"><button type="button" class="mfc-btn ghost" data-rpact="ver">Visualizar relatório</button><button type="button" class="mfc-btn" data-rpact="pdf" ${st.busy?'disabled':''}>${st.busy?'Gerando PDF…':'Gerar PDF'}</button>${st.file&&navigator.canShare&&navigator.canShare({files:[st.file]})?'<button type="button" class="mfc-btn ghost" data-rpact="share">Compartilhar</button>':''}</div>
 ${st.msg?`<div class="mfr-msg ${st.ok?'ok':'bad'}">${H(st.msg)}</div>`:''}</div>
 <p class="mfc-note">O PDF é montado no próprio aparelho, com os seus lançamentos e a sua carteira. Nenhum dado financeiro é enviado para fora.</p>
 ${st.model?modelHtml(st.model):''}`};

/* ---------- PDF ---------- */
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'];
const loadJs=src=>new Promise((ok,no)=>{if(document.querySelector(`script[src="${src}"]`)&&window.jspdf)return ok();const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('falha ao carregar '+src));document.head.appendChild(s)});
async function libs(){if(!(window.jspdf&&window.jspdf.jsPDF))await loadJs(LIBS[0]);const D=window.jspdf.jsPDF;if(!D.API.autoTable)await loadJs(LIBS[1]);return window.jspdf.jsPDF}
const clean=t=>String(t==null?'':t).replace(/[−–]/g,'-').replace(/[•]/g,'*');
function pdf(m,JsPDF){const doc=new JsPDF({unit:'mm',format:'a4'}),W=210,Hh=297,M=16,CW=W-2*M,P=S.profile||{},now=new Date();let y=M;
 const ink=[17,17,19],mu=[110,110,118],ln=[226,226,230],soft=[244,244,246],green=[31,157,85],red=[229,72,60];
 const need=h=>{if(y+h>Hh-18){doc.addPage();y=M}};
 // capa / cabeçalho
 doc.setFillColor(...ink);doc.rect(0,0,W,46,'F');
 let tx=M;if(P.photo&&/^data:image\/(jpe?g|png)/.test(P.photo)){try{doc.addImage(P.photo,P.photo.includes('png')?'PNG':'JPEG',M,10,26,26);tx=M+32}catch(e){}}
 doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(19);doc.text(clean(m.title),tx,21);
 doc.setFont('helvetica','normal');doc.setFontSize(11);doc.text(clean(m.period),tx,28.5);
 const nome=(P.nome||P.apelido||'').trim();doc.setFontSize(9);doc.setTextColor(200,200,205);doc.text(clean((nome?nome+' · ':'')+'Controle Alpha'),tx,35.5);
 y=56;doc.setTextColor(...ink);
 // resumo
 doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Resumo',M,y);y+=4;
 const cols=3,gap=4,bw=(CW-gap*(cols-1))/cols,bh=17;
 m.kpis.forEach((k,i)=>{const c=i%cols,r=Math.floor(i/cols),x=M+c*(bw+gap),yy=y+r*(bh+gap);doc.setFillColor(...soft);doc.roundedRect(x,yy,bw,bh,3,3,'F');doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...mu);doc.text(clean(k[0]),x+4,yy+6);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(...ink);doc.text(clean(k[1]),x+4,yy+13)});
 y+=Math.ceil(m.kpis.length/cols)*(bh+gap)+4;
 const bars=(data,label)=>{if(!data||!data.length)return;const rowH=6.2,h=data.length*rowH+(label?6:2);need(h+2);if(label){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...mu);doc.text(clean(label),M,y+3);y+=6}
  const mx=Math.max(...data.map(r=>Math.abs(r[1])),1),lw=38,vw=30,bwid=CW-lw-vw-4;
  data.forEach(([n,v])=>{doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...ink);doc.text(clean(String(n)).slice(0,24),M,y+4);doc.setFillColor(...soft);doc.roundedRect(M+lw,y+1,bwid,3.6,1.5,1.5,'F');const w=Math.max(.8,Math.abs(v)/mx*bwid);doc.setFillColor(...(v<0?red:ink));doc.roundedRect(M+lw,y+1,w,3.6,1.5,1.5,'F');doc.setTextColor(...(v<0?red:ink));doc.text(clean(money(v)),W-M,y+4,{align:'right'});y+=rowH});y+=2};
 m.sections.forEach(s=>{need(s.bars&&s.bars.length?Math.min(70,s.bars.length*6.2+26):34);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(...ink);doc.text(clean(s.title),M,y+5);y+=9;
  if(s.text){doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(...mu);const L=doc.splitTextToSize(clean(s.text),CW);need(L.length*4.6);doc.text(L,M,y+3);y+=L.length*4.6+3}
  bars(s.bars,s.barsLabel);
  if(s.table){if(s.table.rows.length){doc.autoTable({startY:y,head:[s.table.head.map(clean)],body:s.table.rows.map(r=>r.map(clean)),margin:{left:M,right:M,bottom:20},theme:'plain',styles:{font:'helvetica',fontSize:8.5,cellPadding:2.2,textColor:ink,lineColor:ln,lineWidth:{bottom:.2}},headStyles:{fillColor:ink,textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[250,250,251]},didDrawPage:()=>{}});y=doc.lastAutoTable.finalY+7}
   else{doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(...mu);doc.text(clean(s.empty||'Sem dados.'),M,y+3);y+=8}}
  y+=2});
 need(24);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(...ink);doc.text('Conclusão',M,y+5);y+=10;
 doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(40,40,44);m.conclusion.forEach(c=>{const L=doc.splitTextToSize(clean('- '+c),CW);need(L.length*5);doc.text(L,M,y);y+=L.length*5+1.5});
 // rodapé
 const n=doc.getNumberOfPages(),gen='Gerado em '+now.toLocaleDateString('pt-BR')+' às '+now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
 for(let i=1;i<=n;i++){doc.setPage(i);doc.setDrawColor(...ln);doc.setLineWidth(.2);doc.line(M,Hh-13,W-M,Hh-13);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...mu);doc.text(clean('Controle Alpha · '+gen),M,Hh-8);doc.text(`Página ${i} de ${n}`,W-M,Hh-8,{align:'right'})}
 return doc}
const fname=m=>('relatorio-'+({[TIPOS_R.mensal]:'mensal',[TIPOS_R.gastos]:'gastos',[TIPOS_R.invest]:'investimentos',[TIPOS_R.anual]:'anual'}[m.title]||'financeiro')+'-'+(st.type==='mensal'||st.type==='gastos'?st.month:st.year)+'.pdf');
async function gerar(){if(st.busy)return;st.busy=true;st.msg='';st.model=build();mfCfgRender();
 try{const J=await libs(),doc=pdf(st.model,J),blob=doc.output('blob'),name=fname(st.model);st.file=new File([blob],name,{type:'application/pdf'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
  st.ok=true;st.msg='PDF pronto: '+name+'. Se o download não abrir, use Compartilhar.';window.__mfLastPdf={name,size:blob.size,pages:doc.getNumberOfPages()}}
 catch(e){console.error('Relatório PDF:',e);st.ok=false;st.msg=/carregar/.test(e.message)?'Não foi possível carregar o gerador de PDF. Verifique a internet e tente de novo.':'Não foi possível gerar o PDF: '+e.message}
 finally{st.busy=false;mfCfgRender()}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#mf-cfg')||!t.dataset.rp)return;e.stopPropagation();st[t.dataset.rp]=t.value;st.model=null;st.msg='';st.file=null;mfCfgRender()},true);
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#mf-cfg [data-rpact]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.rpact;
 if(a==='ver'){st.model=build();st.msg='';mfCfgRender();setTimeout(()=>{const p=document.querySelector('#mf-cfg .mfr-prev');if(p)p.scrollIntoView({behavior:'smooth',block:'start'})},50)}
 else if(a==='pdf')gerar();
 else if(a==='share'&&st.file){navigator.share({files:[st.file],title:st.model?st.model.title:'Relatório'}).catch(()=>{})}},true);
window.mfReportBuild=t=>{const o=st.type;if(t)st.type=t;const m=build();st.type=o;return m};
})();
