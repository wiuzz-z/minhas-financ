
/* passa na frente do aviso de protótipo do patch 59 */
window.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;const b=t.closest('#mf-cfg [data-planpay]');if(!b||b.dataset.planpay==='free')return;e.preventDefault();e.stopPropagation();mfPixOpen(b.dataset.planpay)},true);

/* ===== Patch 76: assinatura (plano único R$ 9,99) — Pix com prazo de 10 min, "Já paguei", liberação manual
   pelo e-mail (Supabase › planos_liberados) e bloqueios do plano gratuito PRONTOS MAS DESLIGADOS ===== */
/* Para começar a valer: trocar para true (comando "está valendo assinatura") */
var MF_ASSINATURA_ATIVA=true;/* 1.28: valendo — o que o Gratuito não tem fica com desfoque e cadeado (escolhido na Central ADM › Planos) */
/* O que o plano gratuito bloqueia quando estiver valendo */
var MF_TRAVA={};/* montado a partir do que o servidor diz que o plano do usuário tem (mfAccApply) */
var MF_PIX_MIN=10,MF_PIX_VALOR=9.99;
/* plano único: sai o Anual */
MF_PLANS=[{k:'free',n:'Free',p:'Grátis',d:'Para começar a organizar',f:['Lançamentos, contas e cartão','Carteira e lista de ativos']},
 {k:'mensal',n:'Mensal',p:'R$ 9,99',per:'/mês',d:'Tudo liberado',f:['Dashboard completo','Oscilação, proventos, simulador e projeções','Todos os recursos do app']}];
/* ---- situação da assinatura (lida do Supabase) ---- */
function mfDtBr(iso){const d=new Date(iso);return isNaN(d)?'':d.toLocaleDateString('pt-BR')+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
/* ---- bloqueios do plano gratuito (só agem com MF_ASSINATURA_ATIVA = true) ---- */
function mfLockKeys(){const out=[];Object.keys(MF_TRAVA).forEach(tb=>{const v=MF_TRAVA[tb];if(v==='*')out.push(`#app [data-bk^="${tb}|"]`);else if(Array.isArray(v))v.forEach(k=>out.push(`#app [data-bk$="|${k}"]`))});return out.join(',')}
function mfLockOn(){const A=window.__acc;return !!(MF_ASSINATURA_ATIVA&&A&&typeof authUser!=='undefined'&&authUser&&A.__uid===authUser.id&&!A.admin&&A.plano!=='premium')}
function mfLockApply(){const keys=mfLockKeys(),on=mfLockOn()&&!!keys;
 document.querySelectorAll('#app .mf-locked').forEach(el=>{if(!on||!el.matches(keys)){el.classList.remove('mf-locked','mf-locked-sm');el.querySelector(':scope>.mf-lock')?.remove()}});
 if(!on)return;
 const P=(typeof MF_PLANS!=='undefined'&&MF_PLANS.find(x=>x.k==='mensal'))||{},pr=P.p||'';
 document.querySelectorAll(keys).forEach(el=>{if(el.parentElement&&el.parentElement.closest('.mf-locked'))return;el.classList.add('mf-locked');if(el.querySelector(':scope>.mf-lock'))return;
  if(el.offsetHeight&&el.offsetHeight<190)el.classList.add('mf-locked-sm');const d=document.createElement('div');d.className='mf-lock';
  d.innerHTML='<div class="mf-lock-in"><span class="mf-lock-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/></svg></span><b>Recurso Premium</b><small>'+(pr?'Libere tudo por '+pr+'/mês':'Libere tudo com o Premium')+'</small><button type="button" class="mf-lock-go" data-mflock="1">Ver planos</button></div>';el.appendChild(d)})}
/* conteúdo redesenhado dentro de um bloco travado (ex.: trocar mês) continua com o cadeado */
(function(){let t=0;const go=()=>{clearTimeout(t);t=setTimeout(()=>{try{if(mfLockOn())mfLockApply()}catch(e){}},120)};const st=()=>{const a=document.getElementById('app');if(!a)return setTimeout(st,300);new MutationObserver(m=>{if(mfLockOn()&&m.some(r=>!(r.target.closest&&r.target.closest('.mf-lock'))))go()}).observe(a,{childList:true,subtree:true})};st()})();
/* Personalizar telas (editor do bloco) também é do Premium quando o ADM tirar do Gratuito */
(function(){const w=()=>{if(typeof mfLkOpen!=='function'||mfLkOpen.__pl)return setTimeout(w,400);const o=mfLkOpen;window.mfLkOpen=mfLkOpen=function(){if(mfRecOff('personalizar')){mfToast('Personalizar telas é do plano Premium.');window.mfCfgOpen&&mfCfgOpen('plano');setTimeout(()=>{document.querySelector('#mf-cfg .mf-plans')?.scrollIntoView({block:'start'})},80);return}return o.apply(this,arguments)};mfLkOpen.__pl=1};if(document.readyState==='complete')w();else window.addEventListener('load',w)})();
window.__mfAD.push(()=>{try{mfSubLoad(false);mfLockApply()}catch(e){}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mflock]');if(!b)return;e.preventDefault();e.stopPropagation();if(window.mfCfgOpen){mfCfgOpen('plano');setTimeout(()=>{document.querySelector('#mf-cfg .mf-plans')?.scrollIntoView({block:'start'})},80)}},true);
/* ---- tela do plano (Configurações › Perfil) ---- */
function mfPlanHtml(){const pago=mfIsPago(),o=window.__mfSub||{},cur=pago?'mensal':'free',l=o.lib,ped=o.ped;
 const card=x=>`<div class="mf-plan ${x.k==='mensal'?'on':''}"><div class="mf-plan-h"><b>${x.n}</b>${x.k===cur?'<em class="cur">Atual</em>':''}</div><div class="mf-plan-p">${x.p}${x.per?`<small>${x.per}</small>`:''}</div><small class="mf-plan-d">${x.k==='free'&&MF_ASSINATURA_ATIVA?'Uso básico: sem Dashboard e sem os recursos avançados de investimentos':x.d}</small><ul>${x.f.map(i=>`<li>${i}</li>`).join('')}</ul></div>`;
 let act;
 if(pago)act=`<button type="button" class="mfc-btn mf-plan-go" disabled>Plano Mensal ativo${l&&l.valido_ate?` · até ${new Date(l.valido_ate).toLocaleDateString('pt-BR')}`:''}</button>`;
 else act=`${ped&&ped.status==='aguardando'?`<p class="mf-plan-wait">Pagamento informado em ${mfDtBr(ped.criado_em)}. Seu acesso é liberado em até 5 horas.</p>`:''}<button type="button" class="mfc-btn mf-plan-go" data-planpay="mensal">Assinar Mensal com Pix · ${(MF_PLANS.find(x=>x.k==='mensal')||{}).p||'R$ 9,99'}</button>`;
 return `<div class="mfc-lb mf-plan-lb">Plano</div><p class="mf-plan-mot">Todo grande patrimônio começou com o primeiro real guardado. Comece hoje, do seu jeito.</p>
 <div class="mf-plans">${MF_PLANS.map(card).join('')}</div>${act}
 <p class="mfc-note">Pagamento por Pix. Depois de pagar, toque em "Já paguei": o acesso é liberado em até 5 horas.</p>`}
/* ---- janela do Pix: prazo de 10 min, Copiar chave + Já paguei ---- */
function mfPixOpen(){const P=MF_PLANS.find(x=>x.k==='mensal');let until=Date.now()+MF_PIX_MIN*6e4,tm=null;
 const w=mfConfirm({title:'Pagar com Pix',ok:'Copiar chave',cancel:'Fechar',
  body:`<p class="mf-cf-sub">Plano Mensal</p><div class="mf-cf-v">${P.p}<small class="mf-pix-per">${P.per}</small></div>
  <div class="mf-pix-t" aria-live="polite">Tempo para pagar: <b data-pixt>${String(MF_PIX_MIN).padStart(2,'0')}:00</b></div>
  <div class="mf-pix-k"><small>Chave Pix (aleatória)</small><code data-pixkey>${MF_PIX_KEY}</code><span class="mf-pix-exp">Tempo esgotado. Toque em "Gerar de novo" para pagar.</span></div>
  <p class="mf-cf-note">Copie a chave, abra o app do seu banco, escolha Pix › Pagar com chave e cole. Confira o valor de ${P.p}. Depois de pagar, toque em <b>Já paguei</b>: o acesso é liberado em até 5 horas.</p>`,
  onOk:wd=>{if(wd.classList.contains('exp')){until=Date.now()+MF_PIX_MIN*6e4;wd.classList.remove('exp');wd.querySelector('.mf-cf-ok').textContent='Copiar chave';tick();return false}mfPixCopy(MF_PIX_KEY);return false}});
 if(!w)return;w.style.zIndex='9500';w.classList.add('mf-pix-dlg');
 const btns=w.querySelector('.mf-cf-btns'),ok=btns.querySelector('.mf-cf-ok'),paid=document.createElement('button');paid.type='button';paid.className='b mf-pix-paid';paid.textContent='Já paguei';ok.after(paid);
 function tick(){if(!document.body.contains(w)){clearInterval(tm);return}const left=Math.max(0,until-Date.now()),m=Math.floor(left/6e4),s=Math.floor(left%6e4/1e3),t=w.querySelector('[data-pixt]');if(t)t.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  if(left<=0&&!w.classList.contains('exp')){w.classList.add('exp');const o=w.querySelector('.mf-cf-ok');if(o){o.textContent='Gerar de novo';o.disabled=false}}}
 tm=setInterval(tick,1000);tick();
 paid.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clearInterval(tm);mfPixPaidForm(w)})}
function mfPixPaidForm(w){const box=w.querySelector('.mf-cf-box'),logged=typeof authUser!=='undefined'&&authUser&&typeof supabaseClient!=='undefined'&&supabaseClient;
 if(!logged){box.innerHTML='<h3>Já paguei</h3><p class="mf-cf-sub">Entre na sua conta para informar o pagamento.</p><div class="mf-cf-btns"><button type="button" class="b s" data-cf="no">Fechar</button></div>';return}
 box.innerHTML=`<h3>Informar pagamento</h3><p class="mf-cf-sub">Conta: ${escH(String(authUser.email||''))}</p>
 <label class="mf-cf-f"><small>Nome de quem fez o Pix</small><input type="text" data-pixname maxlength="120" autocomplete="name" placeholder="Como aparece no banco"></label>
 <p class="mf-cf-note">Usamos o nome para achar o seu Pix no extrato. O acesso é liberado em até 5 horas.</p>
 <div class="mf-cf-btns"><button type="button" class="b mf-cf-ok mf-pix-send">Enviar</button><button type="button" class="b s" data-cf="no">Cancelar</button></div>`;
 const inp=box.querySelector('[data-pixname]');setTimeout(()=>{try{inp.focus({preventScroll:true})}catch(_){}},60);
 const send=box.querySelector('.mf-pix-send');
 const go=async()=>{if(send.disabled)return;const nome=String(inp.value||'').trim().replace(/\s+/g,' ');if(nome.length<2){mfToast('Informe o nome de quem fez o Pix.');inp.focus();return}
  send.disabled=true;send.textContent='Enviando…';
  try{const {error}=await MF_DB.account.pixCreate({email:String(authUser.email||'').toLowerCase(),nome_pagador:nome,valor:MF_PIX_VALOR});if(error)throw error;
   box.innerHTML='<h3>Pagamento informado ✓</h3><p class="mf-cf-sub">Recebemos o seu aviso.</p><div class="mf-pix-ok">Seu acesso é liberado <b>em até 5 horas</b>, assim que o Pix for conferido.</div><div class="mf-cf-btns"><button type="button" class="b mf-cf-ok" data-cf="no">Fechar</button></div>';
   mfSubLoad(true)}
  catch(err){console.warn('pedido pix',err&&err.message);send.disabled=false;send.textContent='Enviar';mfToast('Não foi possível enviar agora. Tente de novo.')}};
 send.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();go()});inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}})}

/* ===== Patch 77: "Atualizar cotações" pelo Supabase (Edge Function cotacoes, Yahoo Finance) =====
   Funciona pelo site e também com o arquivo aberto direto no celular/PC. Mesmo resultado em S.quotes. */
async function mfQuotesFetch(stocks,fiis){
 let lastErr=null;
 if(typeof supabaseClient!=='undefined'&&supabaseClient&&typeof authUser!=='undefined'&&authUser){
  try{const {data,error}=await MF_DB.quotes.refresh({body:{stocks,fiis}});
   if(!error&&data&&typeof data==='object')return data;
   let msg='';try{const j=error&&error.context&&typeof error.context.json==='function'?await error.context.json():null;msg=j&&j.message||''}catch(_){}
   lastErr=new Error(msg||'O servidor de cotações não respondeu.')}catch(e){lastErr=e}}
 if(typeof authUser==='undefined'||!authUser)throw new Error('Entre na sua conta para atualizar as cotações.');
 throw lastErr||new Error('Sem conexão com o servidor de cotações.')}
async function refreshYahooQuotes(){
 const btn=document.querySelector('[data-refresh-quotes]');
 if(btn){btn.disabled=true;btn.textContent='Consultando…'}
 try{
  const stocks=[...new Set(S.inv.filter(a=>!a.f&&+a.q>0&&['stocks','etf'].includes(invClass(a))).map(a=>String(a.a||'').trim().toUpperCase()).filter(x=>/^[A-Z0-9.^-]{3,15}$/.test(x)))];
  const fiis=[...new Set(S.inv.filter(a=>!a.f&&+a.q>0&&invClass(a)==='fii').map(a=>String(a.a||'').trim().toUpperCase()).filter(x=>/^[A-Z0-9.^-]{3,15}$/.test(x)))];
  if(!stocks.length&&!fiis.length){mfToast('Não há ações, ETFs ou FIIs com quantidade para consultar.');return}
  if(!navigator.onLine){mfToast('Sem internet agora. Tente de novo quando conectar.');return}
  const body=await mfQuotesFetch(stocks,fiis);
  S.quotes=S.quotes&&typeof S.quotes==='object'?S.quotes:{};
  Object.entries(body.quotes||{}).forEach(([symbol,q])=>{if(q&&Number.isFinite(Number(q.price)))S.quotes[symbol]=q});
  const got=Object.keys(body.quotes||{}).length;
  if(got){S.quoteUpdatedAt=body.requestedAt||new Date().toISOString()}
  S.quoteError=(body.warnings||[]).join(' ');
  save();draw();
  const tot=stocks.length+fiis.length;
  if(!got)mfToast('Não foi possível obter as cotações agora. Tente de novo em alguns minutos.');
  else mfToast(got<tot?`Cotações atualizadas: ${got} de ${tot} ativos ✓`:'Cotações atualizadas ✓');
 }catch(e){console.warn('cotações:',e&&e.message);mfToast(e&&e.message?e.message:'Falha ao atualizar cotações.')}
 finally{const b=document.querySelector('[data-refresh-quotes]');if(b){b.disabled=false;b.textContent='↻ Atualizar cotações'}}
}

/* ===== Patch 78: cotações automáticas (Supabase › cotacoes_auto, atualizada 5x por dia nos dias úteis) =====
   Ao abrir/voltar ao app, copia para S.quotes os preços que forem mais novos que a última atualização.
   O botão "Atualizar cotações" continua funcionando igual. Preço médio e quantidade não são tocados. */
function mfQaLoad(force){const o=window.__mfQa||(window.__mfQa={});
 if(typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser||!cloudLast)return;
 if(o.busy||(!force&&o.at&&o.uid===authUser.id&&Date.now()-o.at<6e5))return;
 const tks=[...new Set((S.inv||[]).filter(a=>!a.f&&+a.q>0).map(a=>String(a.a||'').trim().toUpperCase()).filter(x=>/^[A-Z]{4}\d{1,2}$/.test(x)))];
 if(!tks.length)return;o.busy=true;const uid=authUser.id;
 MF_DB.quotes.auto(tks)
  .then(({data,error})=>{o.busy=false;o.at=Date.now();o.uid=uid;if(error||!Array.isArray(data)||!data.length)return;mfQaApply(data)},()=>{o.busy=false;o.at=Date.now()})}
function mfQaApply(rows){const last=Date.parse(S.quoteUpdatedAt||0)||0;let n=0,mx=last;
 S.quotes=S.quotes&&typeof S.quotes==='object'?S.quotes:{};
 rows.forEach(r=>{const ts=Date.parse(r.atualizado_em)||0,p=Number(r.price);if(!(ts>last)||!(p>0))return;
  S.quotes[r.ticker]={price:p,previousClose:r.previous_close!=null?Number(r.previous_close):null,currency:r.currency||'BRL',marketState:r.market_state||null,source:r.fonte||'Yahoo Finance',symbol:r.ticker+'.SA'};n++;if(ts>mx)mx=ts});
 if(!n)return;S.quoteUpdatedAt=new Date(mx).toISOString();S.quoteError='';save();draw()}
window.__mfAD.push(()=>{try{mfQaLoad(false)}catch(e){}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){try{mfQaLoad(true);window.mfPvaLoad&&mfPvaLoad(true)}catch(e){}}});

/* ===== Patch 79: fatura do cartão sem categoria (fora do 50/30/20) + bloco "Diário" em Contas ===== */
/* Lançamento que representa a FATURA do cartão (ex.: "fatura do cartão" no crédito, que cai no vencimento):
   continua somando na fatura, no saldo e nas despesas, mas não tem categoria — fica fora do 50/30/20,
   do Essencial x não essencial, dos gastos por categoria e dos limites. O pagamento da fatura já ficava de fora. */
/* ---- Diário: botões dos dias (desliza para o lado) e o que entrou/saiu no dia ---- */
/* patch 85: começa sempre no dia 1 do mês atual e vai até o fim do mês seguinte */
function mfDiaKeys(){const out=[],y=+TD.slice(0,4),m=+TD.slice(5,7),n=new Date(y,m+1,0,12).getDate()+new Date(y,m,0,12).getDate();for(let i=0;i<n;i++){const d=new Date(y,m-1,1+i,12);out.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))}return out}
function mfDiaKind(t){if(mfIsTr(t))return 'tr';if(t.c==='Receita')return 'in';if(isInvoicePayment(t))return 'fat';if(t.c==='Investimento')return 'inv';return (+t.v||0)>0?'out':'x'}
function mfDiaRows(d){return S.tx.filter(t=>t.d===d&&!mfIsProvCx(t)).map(t=>({t,k:mfDiaKind(t)})).filter(x=>x.k!=='x')}
function mfDiarioHtml(){const keys=mfDiaKeys(),sel=keys.includes(window.__diaSel)?window.__diaSel:null,W=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
 const by={};S.tx.forEach(t=>{if(t.d&&t.d>=keys[0]&&t.d<=keys[keys.length-1]){const k=mfDiaKind(t)==='inv'?'out':mfDiaKind(t);if(k==='in'||k==='out'){(by[t.d]=by[t.d]||{});by[t.d][k]=1}}});
 const chips=keys.map(d=>{const dt=new Date(d+'T12:00:00'),f=by[d]||{};return `<button type="button" class="mf-dia-d${d===sel?' on':''}${d===TD?' hoje':''}${d.slice(8)==='01'?' m1':''}" data-diad="${d}" aria-pressed="${d===sel}" aria-label="${dt.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}">${d.slice(8)==='01'?`<em>${MES[+d.slice(5,7)-1]}</em>`:''}<b>${+d.slice(8)}</b><small>${W[dt.getDay()]}</small><span class="mf-dia-dots">${f.in?'<i class="in"></i>':''}${f.out?'<i class="out"></i>':''}</span></button>`}).join('');
 const rows=sel?mfDiaRows(sel):[],inn=rows.filter(x=>x.k==='in').reduce((s,x)=>s+(+x.t.v||0),0),out=rows.filter(x=>x.k==='out'||x.k==='inv').reduce((s,x)=>s+(+x.t.v||0),0);
 const lbl={in:'Entrada',out:'',inv:'Investido',fat:'Pagamento de fatura',tr:'Transferência'},dtl=sel?new Date(sel+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'}):'';
 const list=rows.length?rows.sort((a,b)=>(a.k==='in'?0:1)-(b.k==='in'?0:1)||(+b.t.v||0)-(+a.t.v||0)).map(({t,k})=>{const sub=[k==='out'?(mfIsFatLanc(t)?'Fatura do cartão':(t.c||'')):lbl[k],t.t||''].filter(Boolean).join(' · ');
   return `<button type="button" class="mf-dia-r" data-e="${escH(t.id)}" aria-label="Editar ${escH(String(t.n||'lançamento'))}"><span class="mf-dia-n"><b>${escH(String(t.n||'Lançamento'))}</b><small>${escH(sub)}</small></span><b class="${k==='in'?'ok':k==='out'?'bad':k==='inv'?'wa':'mu'}">${k==='in'?'+':k==='out'||k==='inv'?'−':''}${R(+t.v||0)}</b></button>`}).join('')
  :`<p class="mf-empty mf-dia-vz">${sel>TD?'Nada lançado para este dia ainda.':'Nenhum gasto ou entrada neste dia.'}</p>`;
 return B('p_diario')+`<section class="c mf-diario"><h2>Diário</h2><div class="mf-dia-strip" data-diastrip>${chips}</div>
 ${sel?`<div class="mf-dia-h"><span>${dtl.charAt(0).toUpperCase()+dtl.slice(1)}</span>${rows.length?`<div class="mf-dia-t">${inn>0?`<em class="ok">+${R(inn)}</em>`:''}${out>0?`<em class="bad">−${R(out)}</em>`:''}</div>`:''}</div>
 <div class="mf-dia-l">${list}</div>`:'<p class="mf-empty mf-dia-vz">Toque em um dia para ver os lançamentos.</p>'}</section>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-diad]');if(!b)return;e.preventDefault();e.stopPropagation();if(window.__diaDragged){window.__diaDragged=false;return}const s=document.querySelector('#app [data-diastrip]');if(s)window.__diaScroll=s.scrollLeft;window.__diaSel=window.__diaSel===b.dataset.diad?null:b.dataset.diad;draw()},true);
document.addEventListener('scroll',e=>{const s=e.target;if(s&&s.matches&&s.matches('[data-diastrip]'))window.__diaScroll=s.scrollLeft},true);
/* depois de desenhar: enquanto você usa, mantém a posição do deslize; ao abrir Contas (ou recarregar) volta para o começo do mês (patch 85) */
window.__mfPre.push(function(){const k=tab+'|'+(tab==='mais'&&window.mfCtMode?mfCtMode():'');if(k!==window.__diaView){window.__diaView=k;window.__diaScroll=null;window.__diaSel=null}});
window.__mfAD.push(function(){const s=document.querySelector('#app [data-diastrip]');if(!s)return;
 /* 1.9: ao abrir, o dia de hoje fica no centro da faixa (se não houver "hoje", começa no início) */
 if(window.__diaScroll==null){const h=s.querySelector('.mf-dia-d.hoje');window.__diaScroll=h?Math.max(0,Math.round(h.getBoundingClientRect().left-s.getBoundingClientRect().left+s.scrollLeft-(s.clientWidth-h.offsetWidth)/2)):0}
 s.scrollLeft=window.__diaScroll});
/* ===== 3.7 · Calendário em roleta (carrossel) =====
   Troca só a tira de dias do card "Calendário" (recolhido): 7 dias visíveis, o do centro na frente (tamanho e opacidade 100%); os dos lados
   diminuem (escala 1 − 0,16 × distância, mínimo 0,5) e esmaecem (0,27 por posição; além de 3,5 posições somem). Arrastar move a faixa e, ao soltar,
   ela encaixa no dia mais próximo; tocar num dia leva ele ao centro e mostra os lançamentos dele; ‹ e › andam um dia e param nas pontas.
   Mesmos dados da tira antiga (mfDiaKeys, entradas e saídas); o card mantém as medidas. Computador e celular usam o mesmo código. */
window.__rol = window.__rol || { pos: null, alvo: null };
function mfRoletaTroca(h) {
  const keys = mfDiaKeys(), sel = keys.includes(window.__diaSel) ? window.__diaSel : null, W = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], by = {};
  S.tx.forEach(t => { if (t.d && t.d >= keys[0] && t.d <= keys[keys.length - 1]) { const k = mfDiaKind(t) === 'inv' ? 'out' : mfDiaKind(t); if (k === 'in' || k === 'out') { (by[t.d] = by[t.d] || {}); by[t.d][k] = 1; } } });
  const R0 = window.__rol, ini = Math.max(0, keys.indexOf(sel || TD));
  if (R0.pos == null) { R0.pos = ini; R0.alvo = ini; }
  const chips = keys.map((d, i) => { const dt = new Date(d + 'T12:00:00'), f = by[d] || {};
    return `<button type="button" class="mf-dia-d mf-rol-d${d === sel ? ' on' : ''}${d === TD ? ' hoje' : ''}" data-rolid="${i}" tabindex="-1" aria-pressed="${d === sel}" aria-label="${dt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}">${d.slice(8) === '01' ? `<em>${MES[+d.slice(5, 7) - 1]}</em>` : ''}<b>${+d.slice(8)}</b><small>${W[dt.getDay()]}</small><span class="mf-dia-dots">${f.in ? '<i class="in"></i>' : ''}${f.out ? '<i class="out"></i>' : ''}</span></button>`; }).join('');
  const SETA = (d, t) => `<button type="button" class="mf-rol-seta" data-rolseta="${d}" aria-label="${d < 0 ? 'Dia anterior' : 'Próximo dia'}">${t}</button>`;
  const nav = `<div class="mf-rol-nav">${SETA(-1, '‹')}<span class="mf-rol-tx">${sel ? '' : 'Arraste ou toque em um dia para ver os lançamentos.'}</span>${SETA(1, '›')}</div>`;
  const stage = `<div class="mf-rol" data-rol data-nosw data-n="${keys.length}" role="group" aria-label="Dias do calendário">${chips}</div>${nav}`;
  return h.replace(/<div class="mf-dia-strip" data-diastrip>[\s\S]*?<\/div>/, stage).replace('<p class="mf-empty mf-dia-vz">Toque em um dia para ver os lançamentos.</p>', '');
}
(function () {
  const R0 = window.__rol, semMov = () => document.documentElement.dataset.mfanim === '0' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let raf = 0;
  const desenha = (st, pos) => {
    const gap = Math.min(64, st.clientWidth / 7.2), chips = st.children;
    for (let i = 0; i < chips.length; i++) {
      const c = chips[i]; if (!c.classList.contains('mf-rol-d')) continue;
      const o = i - pos, a = Math.abs(o), op = a > 3.5 ? 0 : Math.max(0, 1 - 0.27 * a);
      c.style.setProperty('transform', `translate(-50%,-50%) translateX(${(o * gap).toFixed(2)}px) scale(${Math.max(0.5, 1 - 0.16 * a).toFixed(3)})`, 'important');   // important: o :active global do app (scale .96) não pode soltar o dia pressionado do lugar
      c.style.opacity = op.toFixed(3); c.style.zIndex = Math.round(10 - a); c.style.visibility = op <= 0 ? 'hidden' : 'visible';
      c.classList.toggle('cen', a < 0.5);
    }
    const n = +st.dataset.n, setas = st.parentElement.querySelectorAll('.mf-rol-seta');
    if (setas[0]) setas[0].disabled = Math.round(pos) <= 0; if (setas[1]) setas[1].disabled = Math.round(pos) >= n - 1;
  };
  const vai = (st, i) => {
    const MAX = +st.dataset.n - 1; i = Math.max(0, Math.min(MAX, i)); R0.alvo = i; cancelAnimationFrame(raf);
    if (semMov()) { R0.pos = i; desenha(st, i); return; }
    const passo = () => { if (!st.isConnected) return; R0.pos += (R0.alvo - R0.pos) * 0.25; if (Math.abs(R0.alvo - R0.pos) < 0.002) { R0.pos = R0.alvo; desenha(st, R0.pos); return; } desenha(st, R0.pos); raf = requestAnimationFrame(passo); };
    raf = requestAnimationFrame(passo);
  };
  /* depois de cada desenho da tela: liga a roleta nova (o elemento é refeito a cada draw; a posição fica em window.__rol) */
  window.__mfAD.push(function () {
    const st = document.querySelector('#app [data-rol]'); if (!st) return;
    const MAX = +st.dataset.n - 1; desenha(st, R0.pos);
    if (R0.alvo !== R0.pos) vai(st, R0.alvo);
    let g = null;
    st.addEventListener('pointerdown', e => { if (e.button) return; cancelAnimationFrame(raf); g = { x: e.clientX, p: R0.pos, arr: false }; try { st.setPointerCapture(e.pointerId); } catch (_) { } });
    st.addEventListener('pointermove', e => {
      if (!g) return; const dx = e.clientX - g.x;
      if (!g.arr && Math.abs(dx) > 4) { g.arr = true; st.classList.add('arr'); }
      if (g.arr) { const gap = Math.min(64, st.clientWidth / 7.2); R0.pos = Math.max(-0.4, Math.min(MAX + 0.4, g.p - dx / gap)); R0.alvo = R0.pos; desenha(st, R0.pos); }
    });
    const fim = e => {
      if (!g) return; const o = g; g = null; st.classList.remove('arr');
      if (o.arr) { vai(st, Math.round(R0.pos)); return; }
      if (e.type === 'pointercancel') return;
      const r = st.getBoundingClientRect(), gap = Math.min(64, st.clientWidth / 7.2), i = Math.max(0, Math.min(MAX, Math.round(R0.pos + (e.clientX - (r.left + r.width / 2)) / gap)));
      const keys = mfDiaKeys(), d = keys[i], ja = window.__diaSel === d && Math.round(R0.pos) === i;
      window.__diaSel = ja ? null : d; R0.alvo = i; draw();   // a posição atual fica guardada: o desenho novo anima daqui até o dia tocado
    };
    st.addEventListener('pointerup', fim); st.addEventListener('pointercancel', fim);
    const nav = st.parentElement.querySelector('.mf-rol-nav');
    if (nav) nav.addEventListener('click', e => { const b = e.target.closest('[data-rolseta]'); if (!b || b.disabled) return; e.stopPropagation(); vai(st, Math.round(R0.alvo) + (+b.dataset.rolseta)); });
  });
  /* ao abrir outra tela a roleta volta a centrar no hoje (ou no dia escolhido) */
  window.__mfPre.push(function () { const k = tab + '|' + (tab === 'mais' && window.mfCtMode ? mfCtMode() : ''); if (k !== window.__rolView) { window.__rolView = k; R0.pos = null; R0.alvo = null; } });
})();
/* ===== Fase 3 · M11: Diário e Calendário do Dashboard numa experiência só =====
   Recolhido: Diário (tira de dias que se arrasta para o lado) · Aberto: Calendário completo do mês · O título é sempre "Calendário".
   Tocar num dia mostra os lançamentos logo abaixo (sem janela). O Diário e o Calendário antigos continuam existindo como funções:
   aqui só se escolhe qual deles aparece dentro do bloco. */
window.__calExp = window.__calExp || false;
(function () {
  const _d = mfDiarioHtml, _c = dashboardCalendar;
  const tog = exp => `<button type="button" class="mfu-tg" data-calexp aria-expanded="${exp}" aria-label="${exp ? 'Recolher o calendário' : 'Abrir o calendário completo'}">${exp ? 'Recolher' : 'Mês completo'}</button>`;
  mfDiarioHtml = function () {
    const exp = !!window.__calExp;
    if (!exp) return mfRoletaTroca(_d().replace('<h2>Diário</h2>', `<div class="mfu-h"><h2>Calendário</h2>${tog(false)}</div>`).replace('class="c mf-diario"', 'class="c mf-diario mfu"'));
    const x = _c(), inner = (x.match(/<section class="dash-calendar">([\s\S]*)<\/section>\s*$/) || [])[1];
    if (inner == null) return _d();
    return B('p_diario') + `<section class="c mf-diario mfu mfu-cal"><div class="mfu-h"><h2>Calendário</h2>${tog(true)}</div>${inner.replace(/<div class="dash-section-head">[\s\S]*?<\/p><\/div><\/div>/, '')}</section>`;
  };
  /* o bloco "Calendário" antigo do Dashboard some quando o unificado está visível (senão apareceriam dois) */
  dashboardCalendar = function () { if (tab === 'res' && !isHid('p_diario')) return ''; return _c(); };
})();
document.addEventListener('click', e => {
  const b = e.target && e.target.closest && e.target.closest('#app [data-calexp]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  if (window.__calExp) { if (dashCalDay) window.__diaSel = dashCalDay; }
  else if (window.__diaSel && window.__diaSel.slice(0, 7) === ym) dashCalDay = window.__diaSel;
  window.__calExp = !window.__calExp; draw();
}, true);
/* mouse/trackpad: arrastar a tira de dias com o botão pressionado (no toque ela já desliza sozinha) */
(function () {
  let s = null;
  document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; const el = e.target.closest && e.target.closest('[data-diastrip],[data-pvstrip]'); if (el) s = { el, x: e.clientX, l: el.scrollLeft, m: false }; });
  document.addEventListener('pointermove', e => { if (!s) return; const dx = e.clientX - s.x; if (Math.abs(dx) > 4) s.m = true; if (s.m) s.el.scrollLeft = s.l - dx; });
  /* depois de arrastar, o "clique" que o navegador solta no fim não deve escolher um dia (o tratador do dia confere esta marca) */
  const fim = () => { if (s && s.m) { window.__diaDragged = true; setTimeout(() => { window.__diaDragged = false; }, 60); } s = null; };
  document.addEventListener('pointerup', fim); document.addEventListener('pointercancel', fim);
})();
/* lugar: logo acima de Recorrentes (também na ordem salva) */
(function(){const ins=a=>{if(!a||a.includes('p_diario'))return;const i=a.indexOf('p_fixos');a.splice(i<0?a.length:i,0,'p_diario')};ins(MF_ORD.mais);if(MF_ORD_D.mais)ins(MF_ORD_D.mais)})();
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__diario79)return;if(L.o&&Array.isArray(L.o.mais)&&!L.o.mais.includes('p_diario')){const a=L.o.mais,i=a.indexOf('p_fixos');a.splice(i<0?a.length:i,0,'p_diario')}L.__diario79=1;save()}catch(e){}});
if(!MF_VIEW.p_diario)MF_VIEW.p_diario={t:'Diário',o:[{k:'tot',l:'Total do dia',g:'Valores',sel:'.mf-dia-t',t:'b',d:true},{k:'dots',l:'Pontos de entrada e saída',g:'Indicadores',sel:'.mf-dia-dots',t:'b',d:true}]};

/* ===== Patch 83: Central administrativa + acesso por plano vindo do servidor (Supabase › meu_acesso) =====
   Segurança real fica no banco (funções adm_* conferem o ADM; RLS impede gravar quando bloqueado/manutenção).
   Aqui é só a interface: menu "Central administrativa" aparece quando o servidor diz admin=true. */
var MF_REC={dashboard:'Dashboard',analises:'Análises',invest_avancado:'Investimentos avançados',simulacao:'Simulação e planejamento',relatorios_pdf:'Relatórios em PDF',personalizar:'Personalizar telas',lancamentos:'Lançamentos',contas:'Contas e cartão',compras:'Lista de compras',carteira:'Carteira de investimentos',sync:'Sincronização',aparencia:'Aparência'};
var MF_REC_TRAVA={dashboard:{res:'*'},analises:{anal:'*'},lancamentos:{add:'*'},
 carteira:{inv:['dv_kpi','dv_chart','dv_tab','i_chart','i_cls','i_pie','i_tipo','i_reserva','i_setor','i_dest']},
 invest_avancado:{inv:['i_ivtop','i_ivevo','i_ivativo','i_ivmeus','i_osc','i_evo','i_prov','i_pyld','i_pvprev','i_pvativo','i_pvcal','i_pvcom','i_pano','i_pvreinv','i_pvyoc','i_pvtipo','i_barb','dv_sim','dv_proj','p_proj']},
 simulacao:{mais:['p_gasto','p_simc'],inv:['dv_sim','dv_proj','p_proj','p_metas','i_ap','s_reinv','s_magico']},
 contas:{mais:['p_faturas','p_diario','p_fixos','p_venc','calendar','budgetalerts','p_teto','p_div','p_sit']},compras:{mais:['p_shop','p_parc','p_cmpg']}};
var MF_LIM={lancamentos_mes:'Lançamentos por mês',recorrentes:'Recorrentes',ativos:'Ativos na carteira'};
function mfBRL(v){return (+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
/* ---------- acesso do usuário (servidor) ---------- */
function mfSubLoad(force){const o=window.__mfSub||(window.__mfSub={});
 if(typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser){if(o.uid||window.__acc){window.__mfSub={};window.__acc=null;mfAccApply()}return}
 if(o.busy||(!force&&o.at&&o.uid===authUser.id&&Date.now()-o.at<12e4))return;o.busy=true;const uid=authUser.id;
 Promise.all([MF_DB.account.access(),MF_DB.account.pixLast(uid)])
  .then(([a,b])=>{o.busy=false;o.at=Date.now();o.uid=uid;const before=JSON.stringify([window.__acc,o.ped]);
   if(a&&!a.error&&a.data&&typeof a.data==='object')window.__acc=Object.assign({},a.data,{__uid:uid});
   o.ped=b&&!b.error&&b.data&&b.data[0]?b.data[0]:null;
   const A=window.__acc;o.lib=A&&A.plano==='premium'?{plano:'premium',valido_ate:A.admin?null:A.valido_ate}:null;
   if(before!==JSON.stringify([window.__acc,o.ped])){mfAccApply();const c=document.getElementById('mf-cfg');if(c&&!c.hidden&&window.mfCfgRender)mfCfgRender()}},()=>{o.busy=false;o.at=Date.now()})}
function mfIsPago(){const A=window.__acc;return !!(A&&typeof authUser!=='undefined'&&authUser&&A.__uid===authUser.id&&A.plano==='premium')}
function mfAccApply(){const A=window.__acc;
 if(A&&A.recursos&&A.plano!=='premium'){const T={};Object.keys(MF_REC_TRAVA).forEach(k=>{if(A.recursos[k]===false){const m=MF_REC_TRAVA[k];Object.keys(m).forEach(tb=>{if(m[tb]==='*')T[tb]='*';else if(T[tb]!=='*')T[tb]=[...new Set([...(T[tb]||[]),...m[tb]])]})}});MF_TRAVA=T}
 if(A&&+A.preco_premium>0){const P=MF_PLANS.find(x=>x.k==='mensal');if(P)P.p=mfBRL(A.preco_premium);MF_PIX_VALOR=Math.round(+A.preco_premium*100)/100}
 try{mfLockApply()}catch(e){}mfAccOverlay();try{mfPlanoPop()}catch(e){}}
/* acabou a cortesia ou o tempo do Premium: convida para assinar (uma vez por abertura do app) */
function mfPlanoPop(){const A=window.__acc;if(!A||A.admin||!A.vencido||typeof authUser==='undefined'||!authUser||A.__uid!==authUser.id||window.__plPop||document.getElementById('mf-acc'))return;window.__plPop=1;
 const cort=A.tipo==='cortesia',quando=A.valido_ate?new Date(A.valido_ate).toLocaleDateString('pt-BR'):'';
 mfConfirm({title:cort?'Sua cortesia terminou':'Seu plano Premium terminou',ok:'Assinar agora',cancel:'Agora não',body:`<p class="mf-cf-sub">${cort?'O período de cortesia':'O seu plano Premium'}${quando?' acabou em '+quando:' acabou'}. Assine para continuar com todos os recursos liberados.</p>`,onOk:()=>{window.mfCfgOpen&&mfCfgOpen('plano');setTimeout(()=>{document.querySelector('#mf-cfg .mf-plans')?.scrollIntoView({block:'start'})},80)}})}
/* convite para o Premium (gratuito e cortesia): o intervalo é escolhido na Central ADM › Ajustes (desligado, 5, 10 ou 20 minutos) */
function mfUpsellMin(){const m=+((window.__acc||{}).convite_min)||0;return [5,10,20].includes(m)?m:0}
function mfUpsellQuem(){const A=window.__acc;if(!A||A.admin||typeof authUser==='undefined'||!authUser||A.__uid!==authUser.id||A.bloqueado)return false;return A.plano!=='premium'||A.tipo==='cortesia'}
function mfUpsellTick(){const MIN=mfUpsellMin();if(!MIN||document.visibilityState!=='visible'||!mfUpsellQuem())return;if(['mf-confirm','mf-lk','mf-cfg','mf-lock','mf-acc','mf-lp','mf-vw-sheet'].some(i=>document.getElementById(i))||document.documentElement.classList.contains('mf-locked'))return;
 let last=0;try{last=+localStorage.getItem('fin1_upsell')||0}catch(e){}const now=Date.now();if(!last){try{localStorage.setItem('fin1_upsell',String(now))}catch(e){}return}if(now-last<MIN*60000)return;try{localStorage.setItem('fin1_upsell',String(now))}catch(e){}mfUpsellShow()}
function mfUpsellShow(){const P=(typeof MF_PLANS!=='undefined'&&MF_PLANS.find(x=>x.k==='mensal'))||{p:'R$ 9,99',per:'/mês'},A=window.__acc||{},cort=A.tipo==='cortesia';
 mfConfirm({title:cort?'Continue com tudo liberado':'Saia do básico',ok:'Ver planos e assinar',cancel:'Agora não',body:`<div class="mf-ups"><p class="mf-cf-sub">${cort?'Você está na cortesia. Assine o Premium para não perder nada quando ela acabar.':'Você está no plano gratuito. Com o Premium você entende de verdade para onde vai o seu dinheiro:'}</p>
  <ul class="mf-ups-l"><li><b>📊</b>Análises completas do mês e do ano</li><li><b>💰</b>Proventos automáticos, DY e calendário de pagamentos</li><li><b>📈</b>Desempenho, evolução do patrimônio e simulações</li><li><b>🎨</b>Personalização completa dos blocos</li></ul>
  <div class="mf-ups-p"><small>Premium</small><b>${P.p}</b><span>${P.per||''}</span></div></div>`,onOk:()=>{window.mfCfgOpen&&mfCfgOpen('plano');setTimeout(()=>{document.querySelector('#mf-cfg .mf-plans')?.scrollIntoView({block:'start'})},80)}})}
setInterval(()=>{try{mfUpsellTick()}catch(e){}},60000);
/* 1.23: presença para a Central ADM (a cada minuto com o app aberto; ao abrir marca a entrada) */
function mfPresenca(abriu){if(typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser||!navigator.onLine||document.visibilityState!=='visible')return;
 const mob=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);MF_DB.account.presence({p_abriu:!!abriu,p_aparelho:mob?'celular':'computador'}).then(()=>{},()=>{})}
(function(){let ab=true;const go=()=>{if(typeof authUser!=='undefined'&&authUser){mfPresenca(ab);ab=false}};setTimeout(go,4000);setInterval(go,60000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')go()})})();
/* bloqueado / manutenção / acesso fechado / gratuito desativado: aviso por cima do app (o banco já impede gravar) */
var MF_SUPORTE_EMAIL='contatowillians@outlook.com';
function mfAccOverlay(){const A=window.__acc;let el=document.getElementById('mf-acc');
 let t='',m='',plan=false,sup=false;
 if(A&&!A.admin&&typeof authUser!=='undefined'&&authUser&&A.__uid===authUser.id){
  if(A.bloqueado){t='Acesso suspenso';m='Sua conta está suspensa no momento. Para voltar a usar o app, fale com o suporte ou efetue o pagamento.';sup=true}
  else if(A.manutencao){t='Em manutenção';m=A.manutencao_msg||'O app está em manutenção. Volte em alguns minutos.'}
  else if(A.acesso_geral===false){t='Acesso temporariamente fechado';m='O acesso ao app está fechado no momento. Tente novamente mais tarde.'}
  else if(A.gratuito_ativo===false&&A.plano!=='premium'){t='Assine para continuar';m='O plano gratuito não está disponível no momento. Assine o Premium para continuar usando o app.';plan=true}}
 if(!t){if(el)el.remove();return}
 if(!el){el=document.createElement('div');el.id='mf-acc';el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');document.body.appendChild(el)}
 el.innerHTML=`<div class="mf-acc-box"><span class="mf-acc-ic" aria-hidden="true">${plan?'💎':'🔒'}</span><h2>${t}</h2><p>${escH(m)}</p>${sup?`<div class="mf-acc-sup"><small>Suporte</small><a href="mailto:${MF_SUPORTE_EMAIL}?subject=${encodeURIComponent('Conta suspensa - Controle Alpha')}" data-accmail>${MF_SUPORTE_EMAIL}</a><button type="button" class="mf-acc-copy" data-acccopy>Copiar</button></div>`:''}<div class="mf-acc-b">${plan?'<button type="button" class="mfc-btn" data-accplan>Ver plano</button>':''}${sup?'<button type="button" class="mfc-btn" data-accpay>Efetuar pagamento</button>':''}<button type="button" class="mfc-btn ghost" data-accretry>Verificar de novo</button></div></div>`}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 if(t.closest('[data-accretry]')){e.preventDefault();window.__mfSub&&(window.__mfSub.at=0);mfSubLoad(true);mfToast('Verificando…');return}
 if(t.closest('[data-accplan]')){e.preventDefault();window.mfCfgOpen&&mfCfgOpen('plano');return}
 if(t.closest('[data-accpay]')){e.preventDefault();window.mfPixOpen&&mfPixOpen();return}
 if(t.closest('[data-acccopy]')){e.preventDefault();const v=MF_SUPORTE_EMAIL,ok=()=>mfToast('E-mail copiado ✓');
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(ok,()=>{mfCopyOld(v);ok()});else{mfCopyOld(v);ok()}}},true);
function mfCopyOld(v){try{const x=document.createElement('textarea');x.value=v;x.setAttribute('readonly','');x.style.position='fixed';x.style.opacity='0';document.body.appendChild(x);x.select();document.execCommand('copy');x.remove()}catch(e){}}
/* recursos do plano que não são blocos: Relatórios em PDF e Personalizar telas */
function mfRecOff(k){const A=window.__acc;return !!(MF_ASSINATURA_ATIVA&&A&&A.plano!=='premium'&&A.recursos&&A.recursos[k]===false)}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mf-cfg [data-cfgv]');if(!b)return;const v=b.dataset.cfgv,k=v==='relatorios'?'relatorios_pdf':(v==='telas'||v==='organizacao')?'personalizar':'';
 if(k&&mfRecOff(k)){e.preventDefault();e.stopPropagation();mfToast(`${MF_REC[k]} é do plano Premium.`);mfCfgOpen('plano');setTimeout(()=>{document.querySelector('#mf-cfg .mf-plans')?.scrollIntoView({block:'start'})},80)}},true);
/* limite de lançamentos por mês do gratuito (só quando a assinatura estiver valendo) */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#fs');if(!b||!MF_ASSINATURA_ATIVA)return;const A=window.__acc;if(!A||A.plano==='premium'||!A.limites)return;const lim=+A.limites.lancamentos_mes||0;if(!lim||(typeof F!=='undefined'&&F.id))return;
 const n=S.tx.filter(t=>t.d&&t.d.slice(0,7)===TD.slice(0,7)&&!t.pva).length;if(n<lim)return;e.preventDefault();e.stopPropagation();mfToast(`Limite do plano gratuito: ${lim} lançamentos por mês. Assine o Premium para lançar sem limite.`)},true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){try{window.__mfSub&&(window.__mfSub.at=0);mfSubLoad(true)}catch(e){}}});

/* ================= CENTRAL ADMINISTRATIVA ================= */
var MF_ADM_SIT={gratuito:'Gratuito',premium:'Premium',cortesia:'Cortesia',vencido:'Vencida',bloqueado:'Bloqueado'};
var MF_ADM_ACAO={liberar_premium:'Premium liberado',cortesia:'Cortesia concedida',retirar_premium:'Premium retirado',bloquear:'Usuário bloqueado',desbloquear:'Usuário desbloqueado',config:'Configurações alteradas',plano:'Plano alterado'};
function mfAdm(){return window.__adm||(window.__adm={tab:'resumo',busca:'',filtro:'todos',sel:null,form:null,d:{},busy:{}})}
function mfAdmRpc(fn,args){return MF_DB.admin.call(fn,args).then(({data,error})=>{if(error)throw error;return data})}
function mfAdmLoad(k,force){const A=mfAdm();if(A.busy[k]||(!force&&A.d[k]!==undefined))return;A.busy[k]=1;
 const p=k==='resumo'?mfAdmRpc('adm_resumo'):k==='usuarios'?mfAdmRpc('adm_usuarios',{p_busca:null}):k==='pedidos'?mfAdmRpc('adm_pedidos',{p_status:'aguardando'}):k==='pedall'?mfAdmRpc('adm_pedidos',{p_status:null}):k==='hist'?mfAdmRpc('adm_historico_lista',{p_user:null,p_limite:100}):k==='online'?mfAdmRpc('adm_online')
  :k==='planos'?MF_DB.admin.plans().then(({data,error})=>{if(error)throw error;return data}):k==='config'?MF_DB.admin.config().then(({data,error})=>{if(error)throw error;return data})
  :k.startsWith('h_')?mfAdmRpc('adm_historico_lista',{p_user:k.slice(2),p_limite:30}):Promise.resolve(null);
 p.then(v=>{A.d[k]=v;A.busy[k]=0;if(k==='planos')A.pe=JSON.parse(JSON.stringify(v||[]));window.mfCfgRender&&mfCfgRender()},err=>{A.busy[k]=0;A.d[k]=null;A.err=err&&err.message||'erro';window.mfCfgRender&&mfCfgRender()})}
function mfAdmReload(...ks){const A=mfAdm();ks.forEach(k=>{delete A.d[k]});window.mfCfgRender&&mfCfgRender()}
function mfAdmDM(v){if(!v)return '—';const d=new Date(v),y=d.getFullYear()!==new Date().getFullYear();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+(y?'/'+d.getFullYear():'')+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
function mfAdmPedUser(id){const L=(mfAdm().d.pedall||[]).filter(p=>p.user_id===id);return L}
function mfAdmDt(v,h){if(!v)return '—';const d=new Date(v);return h?d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('pt-BR')}
function mfAdmView(head){const A=mfAdm(),acc=window.__acc;
 if(!acc||!acc.admin)return head('Central administrativa')+'<p class="mfc-note">Acesso restrito ao administrador.</p>';
 const tabs=[['resumo','Resumo'],['usuarios','Usuários'],['pedidos','Pagamentos'],['planos','Planos'],['config','Ajustes'],['hist','Histórico'],['online','● Online']];
 const ld='<p class="mfc-note">Carregando…</p>',er=k=>A.d[k]===null?`<p class="mfc-note bad">Não foi possível carregar${A.err?': '+escH(A.err):''}. <button type="button" class="mf-adm-link" data-admreload="${k}">Tentar de novo</button></p>`:'';
 let body='';
 if(A.tab==='resumo'){mfAdmLoad('resumo');const r=A.d.resumo;
  body=r?`<div class="mf-adm-kpis">${[['total','Usuários',''],['premium','Premium','ok'],['cortesia','Cortesias','ok'],['gratuitos','Gratuitos',''],['vencidos','Vencidas','wa'],['bloqueados','Bloqueados','bad']].map(([k,t,c])=>`<button type="button" class="mf-adm-k" data-admgo="usuarios" data-admf="${k==='total'?'todos':k==='gratuitos'?'gratuito':k==='vencidos'?'vencido':k==='bloqueados'?'bloqueado':k}"><small>${t}</small><b class="${c}">${r[k]||0}</b></button>`).join('')}</div>
   <button type="button" class="mfc-row mf-adm-ped" data-admgo="pedidos"><span class="mfc-rt"><b>Pagamentos aguardando</b><small>Avisos de "Já paguei" para conferir</small></span><em class="mf-adm-badge${r.pedidos_aguardando?' on':''}">${r.pedidos_aguardando||0}</em><span class="mfc-chev">›</span></button>`:er('resumo')||ld}
 else if(A.tab==='usuarios'){mfAdmLoad('usuarios');mfAdmLoad('pedall');body=A.sel?mfAdmUser():mfAdmList()||er('usuarios')||ld}
 else if(A.tab==='pedidos'){mfAdmLoad('pedidos');mfAdmLoad('usuarios');const L=A.d.pedidos;
  body=L?(L.length?`<div class="mfc-group">${L.map(p=>{const d=new Date(p.criado_em);return `<div class="mf-adm-ped-r"><div class="mf-adm-dt" aria-hidden="true"><b>${String(d.getDate()).padStart(2,'0')}</b><small>${MES[d.getMonth()]}</small></div><div><b>${escH(p.nome_pagador||'—')}</b><small class="mf-adm-pg">Pagou em ${mfAdmDM(p.criado_em)}</small><small>${escH(p.email)}</small></div><span>${mfBRL(p.valor)}</span><button type="button" class="mfc-btn" data-admpay="${escH(p.user_id)}" data-admpayn="${escH(p.nome_pagador||'')}" data-admpayv="${p.valor}" data-admpayd="${escH(p.criado_em)}">Liberar</button></div>`}).join('')}</div><p class="mfc-note">Confira o Pix no extrato do banco antes de liberar. Ao liberar, o aviso sai desta lista.</p>`:'<p class="mfc-note">Nenhum pagamento aguardando conferência.</p>'):er('pedidos')||ld}
 else if(A.tab==='planos'){mfAdmLoad('planos');body=A.pe?mfAdmPlanos():er('planos')||ld}
 else if(A.tab==='config'){mfAdmLoad('config');const c=A.d.config;
  const sw=(k,t,sub)=>`<label class="mfc-sw"><span><b>${t}</b><small>${sub}</small></span><input type="checkbox" data-admcfg="${k}" ${c&&c[k]?'checked':''}><i aria-hidden="true"></i></label>`;
  body=c?`<div class="mfc-group">${sw('cadastro_aberto','Novos cadastros','Permite criar conta nova')}${sw('gratuito_ativo','Plano gratuito','Desligado: quem não é Premium vê só a tela de assinar')}${sw('acesso_geral','Acesso geral','Desligado: ninguém usa o app (menos você)')}${sw('manutencao','Modo manutenção','Ligado: o app mostra a mensagem e ninguém grava (menos você)')}</div>
   <div class="mfc-group mfc-pad"><label class="mfc-f">Mensagem da manutenção<input data-admmsg value="${escH(c.manutencao_msg||'')}" maxlength="160"></label><button type="button" class="mfc-btn" data-admsavemsg>Salvar mensagem</button></div>
   <div class="mfc-group mfc-pad"><div class="mfc-lb" style="margin-top:0">Convite para o Premium</div><p class="mfc-note" style="margin:0 0 8px">De quanto em quanto tempo quem está no gratuito ou na cortesia vê o convite para assinar (com o valor e o botão para os planos).</p>
   <div class="mfc-chips">${[[0,'Desligado'],[5,'5 min'],[10,'10 min'],[20,'20 min']].map(([v,t])=>`<button type="button" class="mfc-chip ${(+c.convite_min||0)===v?'on':''}" data-admconv="${v}">${t}</button>`).join('')}</div>
   <button type="button" class="mfc-btn ghost" data-admconvver style="margin-top:10px;width:100%">Ver como fica o convite</button></div>
   <p class="mfc-note">As mudanças valem na hora para todos, sem atualizar o app. O banco de dados também impede gravar quando a conta está bloqueada, em manutenção ou com o acesso fechado.</p>`:er('config')||ld}
 else if(A.tab==='online'){mfAdmLoad('online');body=A.d.online?mfAdmOnline():er('online')||ld}
 else if(A.tab==='hist'){mfAdmLoad('hist');const H=A.d.hist;body=H?(H.length?`<div class="mfc-group">${H.map(mfAdmHistRow).join('')}</div>`:'<p class="mfc-note">Nenhuma ação registrada ainda.</p>'):er('hist')||ld}
 return head('Central administrativa')+`<div class="mf-adm-tabs" role="tablist">${tabs.map(([k,t])=>`<button type="button" role="tab" class="mfc-chip ${A.tab===k?'on':''}" data-admtab="${k}" aria-selected="${A.tab===k}">${t}</button>`).join('')}</div><div class="mf-adm">${body}</div>`}
function mfAdmHistRow(h){const det=[h.dias?h.dias+' dias':'',h.valido_ate?'até '+mfAdmDt(h.valido_ate):'',h.valor!=null&&h.acao!=='plano'?mfBRL(h.valor):'',h.forma||'',h.acao==='plano'&&h.valor!=null?'preço '+mfBRL(h.valor):'',h.motivo?'“'+h.motivo+'”':''].filter(Boolean).join(' · ');
 return `<div class="mf-adm-h"><div><b>${MF_ADM_ACAO[h.acao]||escH(h.acao)}${h.plano&&h.acao==='plano'?' · '+(h.plano==='free'?'Gratuito':'Premium'):''}</b><small>${h.alvo_email?escH(h.alvo_email)+' · ':''}${mfAdmDt(h.criado_em,1)}</small>${det?`<small>${escH(det)}</small>`:''}</div></div>`}
/* 1.23: quem está no app (o app avisa a cada minuto; online = visto nos últimos 2 minutos) */
function mfAdmRel(v){if(!v)return 'nunca';const s=(Date.now()-new Date(v))/1000;if(s<60)return 'agora';if(s<3600)return 'há '+Math.round(s/60)+' min';if(s<86400)return 'há '+Math.round(s/3600)+' h';return mfAdmDM(v)}
function mfAdmOnline(){const A=mfAdm(),L=A.d.online||[],on=u=>u.visto_em&&Date.now()-new Date(u.visto_em)<120000,hoje=u=>u.visto_em&&new Date(u.visto_em).toDateString()===new Date().toDateString();
 const nOn=L.filter(on).length,nHoje=L.filter(hoje).length,f=A.onf||'todos',R2=L.filter(u=>f==='on'?on(u):f==='hoje'?hoje(u):true);
 return `<div class="mf-adm-kpis mf-onl-k"><div class="mf-adm-k"><small>Online agora</small><b class="ok">${nOn}</b></div><div class="mf-adm-k"><small>Usaram hoje</small><b>${nHoje}</b></div><div class="mf-adm-k"><small>Usuários</small><b>${L.length}</b></div></div>
 <div class="mf-adm-tabs">${[['todos','Todos'],['on','Online agora'],['hoje','Hoje']].map(([k,t])=>`<button type="button" class="mfc-chip ${f===k?'on':''}" data-admonf="${k}">${t}</button>`).join('')}</div>
 ${R2.length?`<div class="mfc-group">${R2.map(u=>`<button type="button" class="mfc-row mf-onl-r" data-admonl="${escH(u.user_id)}"><i class="mf-onl-dot ${on(u)?'on':''}" aria-label="${on(u)?'Online':'Offline'}"></i><span class="mfc-rt"><b>${escH(u.nome||u.email)}</b><small>${on(u)?'<span class="ok">Online agora</span>':'Visto '+mfAdmRel(u.visto_em)}${u.aparelho?' · '+escH(u.aparelho):''}</small><small>Entrou: ${u.entrou_em?mfAdmDM(u.entrou_em):'—'} · Editou: ${u.editado_em?mfAdmDM(u.editado_em):'—'}</small></span><em class="mf-adm-tag ${u.situacao}">${MF_ADM_SIT[u.situacao]||u.situacao}</em><span class="mfc-chev">›</span></button>`).join('')}</div>`:'<p class="mfc-note">Ninguém neste filtro.</p>'}
 <p class="mfc-note">Atualiza sozinho a cada 20 segundos. "Entrou" é quando abriu o app; "Editou" é a última vez que salvou algo. Só a data e a hora são guardadas.</p>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mf-cfg [data-admonf]');if(!b)return;e.preventDefault();e.stopPropagation();mfAdm().onf=b.dataset.admonf;window.mfCfgRender&&mfCfgRender()},true);
setInterval(()=>{try{const c=document.getElementById('mf-cfg');if(c&&typeof mfAdm==='function'&&mfAdm().tab==='online'&&c.querySelector('.mf-onl-k'))mfAdmLoad('online',true)}catch(e){}},20000);
function mfAdmList(){const A=mfAdm(),L=A.d.usuarios;if(!L)return '';const q=A.busca.trim().toLowerCase();
 const F=[['todos','Todos'],['gratuito','Gratuitos'],['premium','Premium'],['bloqueado','Bloqueados'],['cortesia','Cortesias'],['vencido','Vencidas']];
 const rows=L.filter(u=>(!q||String(u.email).toLowerCase().includes(q)||String(u.nome||'').toLowerCase().includes(q))&&(A.filtro==='todos'||u.situacao===A.filtro));
 return `<div class="mfc-group mfc-pad mf-adm-busca"><input type="search" data-admbusca value="${escH(A.busca)}" placeholder="Pesquisar por e-mail ou nome" aria-label="Pesquisar usuário" autocomplete="off"></div>
 <div class="mf-adm-tabs">${F.map(([k,t])=>`<button type="button" class="mfc-chip ${A.filtro===k?'on':''}" data-admf="${k}">${t} <em>${k==='todos'?L.length:L.filter(u=>u.situacao===k).length}</em></button>`).join('')}</div>
 ${rows.length?`<div class="mfc-group">${rows.map(u=>`<button type="button" class="mfc-row mf-adm-u" data-admuser="${escH(u.user_id)}"><span class="mfc-rt"><b>${escH(u.nome||u.email)}</b><small>${u.nome?escH(u.email)+' · ':''}desde ${mfAdmDt(u.criado_em)}${u.valido_ate&&u.situacao!=='gratuito'?' · até '+mfAdmDt(u.valido_ate):''}</small></span>${u.admin?'<em class="mf-adm-tag adm">ADM</em>':`<em class="mf-adm-tag ${u.situacao}">${MF_ADM_SIT[u.situacao]||u.situacao}</em>`}<span class="mfc-chev">›</span></button>`).join('')}</div>`:'<p class="mfc-note">Nenhum usuário encontrado.</p>'}`.replace(/(data-admuser="([^"]+)"[\s\S]*?)(<em class="mf-adm-tag )/g,(m0,a,id,c)=>{const p=mfAdmPedUser(id).find(x=>x.status==='aguardando');return p?a+`<em class="mf-adm-tag pay">Pagou ${mfAdmDM(p.criado_em).split(' às ')[0]}</em>`+c:m0})}
function mfAdmUser(){const A=mfAdm();if(!A.d.usuarios)return A.d.usuarios===null?'':'<p class="mfc-note">Carregando…</p>';const u=A.d.usuarios.find(x=>x.user_id===A.sel);if(!u){A.sel=null;return mfAdmList()}
 mfAdmLoad('h_'+u.user_id);const H=A.d['h_'+u.user_id],f=A.form,prem=u.plano==='premium';
 const info=[['E-mail',escH(u.email)],['Nome',escH(u.nome||'—')],['Cadastro',mfAdmDt(u.criado_em,1)],['Último acesso',mfAdmDt(u.ultimo_acesso,1)],['Plano',u.admin?'Completo (ADM)':prem?'Premium':'Gratuito'],['Situação',u.admin?'Administrador':MF_ADM_SIT[u.situacao]||u.situacao],['Validade',u.valido_ate?mfAdmDt(u.valido_ate):'—']];
 let act;
 if(f){const custom=f.dias==='x';act=`<div class="mfc-group mfc-pad mf-adm-form"><div class="mfc-lb">${f.cort?'Conceder cortesia':'Liberar Premium'}</div>
  <div class="mfc-lb">Validade</div><div class="mfc-chips">${[30,90,180,365].map(d=>`<button type="button" class="mfc-chip ${f.dias===d?'on':''}" data-admdias="${d}">${d} dias</button>`).join('')}<button type="button" class="mfc-chip ${custom?'on':''}" data-admdias="x">Personalizada</button></div>
  ${custom?`<label class="mfc-f">Válido até<input type="date" data-admate value="${escH(f.ate||'')}" min="${TD}"></label>`:''}
  ${f.cort?'':`<label class="mfc-f">Valor recebido (R$)<input data-admvalor inputmode="decimal" value="${escH(f.valor||'')}" placeholder="0,00"></label><label class="mfc-f">Forma de pagamento<select data-admforma>${['Pix','Dinheiro','Transferência','Cartão','Outro'].map(x=>`<option ${f.forma===x?'selected':''}>${x}</option>`).join('')}</select></label>`}
  ${f.ped?`<p class="mf-adm-pnote">Pagamento informado em <b>${mfAdmDM(f.ped.d)}</b> · ${mfBRL(f.ped.v)}${f.ped.n?' · '+escH(f.ped.n):''}. Confira no extrato do banco.</p>`:''}
  <label class="mfc-f">Motivo / observação<input data-admmotivo value="${escH(f.motivo||'')}" maxlength="140" placeholder="${f.cort?'Ex.: parceria, teste, amigo':'Ex.: Pix conferido no extrato'}"></label>
  ${prem&&u.valido_ate&&new Date(u.valido_ate)>new Date()?'<p class="mfc-note" style="margin:0 0 8px">Já é Premium: os dias escolhidos somam ao que falta.</p>':''}
  ${u.bloqueado?`<label class="mf-adm-chk"><input type="checkbox" data-admdesb ${f.desb?'checked':''}><span>Desbloquear a conta também (hoje está bloqueada)</span></label>`:''}
  <div class="mf-adm-btns"><button type="button" class="mfc-btn" data-admconf>Confirmar</button><button type="button" class="mfc-btn ghost" data-admcancel>Cancelar</button></div></div>`}
 else act=`<div class="mf-adm-btns">${u.admin?'':`<button type="button" class="mfc-btn" data-admopen="pago">${prem?'Renovar Premium':'Liberar Premium'}</button><button type="button" class="mfc-btn ghost" data-admopen="cort">Conceder cortesia</button>`}${prem&&!u.admin?'<button type="button" class="mfc-btn ghost bad" data-admretirar>Retirar Premium</button>':''}${u.admin?'':u.bloqueado?'<button type="button" class="mfc-btn ghost" data-admbloq="0">Desbloquear</button>':'<button type="button" class="mfc-btn ghost bad" data-admbloq="1">Bloquear</button>'}</div>${u.admin?'<p class="mfc-note">Esta é a conta administradora: sempre tem acesso completo.</p>':''}`;
 const PU=mfAdmPedUser(u.user_id).slice(0,5),pays=PU.length?`<div class="mfc-lb mfc-lbo">Pagamentos informados</div><div class="mfc-group">${PU.map(p=>`<div class="mf-adm-h"><div><b>Pagou em ${mfAdmDM(p.criado_em)}</b><small>${mfBRL(p.valor)}${p.nome_pagador?' · '+escH(p.nome_pagador):''} · ${p.status==='aguardando'?'<span class="wa">aguardando liberação</span>':'<span class="ok">liberado</span>'}</small></div></div>`).join('')}</div>`:'';
 return `<button type="button" class="mf-adm-back" data-admback>‹ Usuários</button>
 <div class="mfc-group mf-adm-info">${info.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>${act}${pays}
 <div class="mfc-lb mfc-lbo">Histórico deste usuário</div>${H?(H.length?`<div class="mfc-group">${H.map(mfAdmHistRow).join('')}</div>`:'<p class="mfc-note">Nenhuma ação ainda.</p>'):'<p class="mfc-note">Carregando…</p>'}`}
function mfAdmPlanos(){const A=mfAdm(),P=A.pe,fr=P.find(x=>x.codigo==='free')||{recursos:{},limites:{}},pr=P.find(x=>x.codigo==='premium')||{recursos:{}};
 const tg=(c,k,on)=>`<label class="mf-adm-tg"><input type="checkbox" data-admrec="${c}|${k}" ${on?'checked':''}><i aria-hidden="true"></i></label>`;
 return `<div class="mfc-group mfc-pad"><div class="mfc-lb">Preço do Premium (por mês)</div><div class="mf-adm-preco"><em>R$</em><input data-admpreco inputmode="decimal" value="${A.peP!=null?escH(A.peP):(+pr.preco||0).toFixed(2).replace('.',',')}" aria-label="Preço do Premium"></div><small class="mfc-note" style="margin:6px 0 0;display:block">O Gratuito custa sempre R$ 0. Depois de mudar, toque em <b>Salvar planos</b>.</small></div>
 <div class="mfc-group"><div class="mf-adm-rh"><span>Função</span><span>Gratuito</span><span>Premium</span></div>${Object.keys(MF_REC).map(k=>`<div class="mf-adm-rr"><span>${MF_REC[k]}</span>${tg('free',k,fr.recursos[k]!==false)}${tg('premium',k,pr.recursos[k]!==false)}</div>`).join('')}</div>
 <div class="mfc-group mfc-pad"><div class="mfc-lb">Limites do Gratuito (0 = sem limite)</div>${Object.keys(MF_LIM).map(k=>`<label class="mfc-f">${MF_LIM[k]}<input data-admlim="${k}" inputmode="numeric" value="${+fr.limites[k]||0}"></label>`).join('')}</div>
 <button type="button" class="mfc-btn mf-adm-save" data-admsaveplanos>Salvar planos</button>
 <p class="mfc-note">Vale para todos na hora, sem atualizar o app. ${MF_ASSINATURA_ATIVA?'':'Os bloqueios do Gratuito só passam a valer quando você der o comando “está valendo assinatura”.'}</p>`}
function mfAdmConfirm(o){const w=mfConfirm(o);if(w){w.style.zIndex='10060';w.classList.add('mf-adm-cf')}return w}
function mfAdmDo(p,okMsg,reload){return p.then(()=>{mfToast(okMsg);mfAdmReload(...reload)}).catch(err=>{mfToast('Não foi possível: '+(err&&err.message||'erro'))})}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#mf-cfg'))return;const A=mfAdm(),q=s=>t.closest(s);let b;
 if(b=q('[data-admconv]')){e.preventDefault();const v=+b.dataset.admconv;mfAdmDo(mfAdmRpc('adm_salvar_config',{p:{convite_min:v}}),v?'Convite a cada '+v+' minutos ✓':'Convite desligado ✓',['config','hist']);if(window.__acc)window.__acc.convite_min=v;return}
 if(b=q('[data-admconvver]')){e.preventDefault();mfUpsellShow();return}
 if(b=q('[data-admonl]')){e.preventDefault();A.tab='usuarios';A.sel=b.dataset.admonl;A.form=null;mfAdmLoad('usuarios');window.mfCfgRender&&mfCfgRender();return}
 if(b=q('[data-admtab]')){e.preventDefault();A.tab=b.dataset.admtab;A.sel=null;A.form=null;if(A.tab!=='planos'){delete A.pe;delete A.peP;delete A.d.planos}window.mfCfgRender&&mfCfgRender();return}
 if(b=q('[data-admgo]')){e.preventDefault();A.tab=b.dataset.admgo;if(b.dataset.admf)A.filtro=b.dataset.admf;A.sel=null;A.form=null;mfCfgRender();return}
 if(b=q('[data-admreload]')){e.preventDefault();mfAdmReload(b.dataset.admreload);return}
 if(b=q('[data-admf]')){e.preventDefault();A.filtro=b.dataset.admf;mfCfgRender();return}
 if(b=q('[data-admuser]')){e.preventDefault();A.sel=b.dataset.admuser;A.form=null;mfCfgRender();document.querySelector('#mf-cfg .mfc-panel')&&(document.querySelector('#mf-cfg .mfc-panel').scrollTop=0);return}
 if(q('[data-admback]')){e.preventDefault();A.sel=null;A.form=null;mfCfgRender();return}
 if(b=q('[data-admopen]')){e.preventDefault();const cort=b.dataset.admopen==='cort',u0=(A.d.usuarios||[]).find(x=>x.user_id===A.sel);A.form={cort,dias:30,ate:'',valor:cort?'':String((+(window.__acc||{}).preco_premium||0).toFixed(2)).replace('.',','),forma:'Pix',motivo:'',desb:!cort&&!!(u0&&u0.bloqueado)};mfCfgRender();return}
 if(q('[data-admcancel]')){e.preventDefault();A.form=null;mfCfgRender();return}
 if(b=q('[data-admdias]')){e.preventDefault();A.form.dias=b.dataset.admdias==='x'?'x':+b.dataset.admdias;mfCfgRender();return}
 if(b=q('[data-admpay]')){e.preventDefault();A.tab='usuarios';A.sel=b.dataset.admpay;const pd=b.dataset.admpayd||'',dm=pd?mfAdmDM(pd).split(' às ')[0]:'',u0=(A.d.usuarios||[]).find(x=>x.user_id===b.dataset.admpay);A.form={cort:false,dias:30,ate:'',valor:String(b.dataset.admpayv||'').replace('.',','),forma:'Pix',motivo:'Pix de '+(b.dataset.admpayn||'')+(dm?' em '+dm:''),ped:pd?{d:pd,n:b.dataset.admpayn||'',v:+b.dataset.admpayv||0}:null,desb:!!(u0&&u0.bloqueado)};mfCfgRender();return}
 if(q('[data-admconf]')){e.preventDefault();const f=A.form,u=(A.d.usuarios||[]).find(x=>x.user_id===A.sel);if(!f||!u)return;
  if(f.dias==='x'&&!f.ate){mfToast('Escolha a data de validade.');return}
  const val=f.cort?null:(String(f.valor||'').trim()?mfNum(f.valor):null),ateTxt=f.dias==='x'?new Date(f.ate+'T23:59:00').toLocaleDateString('pt-BR'):f.dias+' dias';
  mfAdmConfirm({title:f.cort?'Conceder cortesia':'Liberar Premium',ok:'Confirmar',body:`<p class="mf-cf-sub">${escH(u.email)}</p><p class="mf-cf-note">Validade: <b>${ateTxt}</b>${val!=null?` · Valor: <b>${mfBRL(val)}</b> (${escH(f.forma)})`:''}${f.ped?`<br>Pagamento de ${mfAdmDM(f.ped.d)}`:''}${u.bloqueado&&f.desb?'<br>A conta também será desbloqueada.':''}</p>`,
   onOk:()=>{const desb=u.bloqueado&&!!f.desb;mfAdmDo(mfAdmRpc('adm_liberar',{p_user:u.user_id,p_dias:f.dias==='x'?null:f.dias,p_ate:f.dias==='x'?new Date(f.ate+'T23:59:00').toISOString():null,p_cortesia:!!f.cort,p_valor:val,p_forma:f.cort?null:f.forma,p_motivo:f.motivo||null}).then(()=>desb?mfAdmRpc('adm_bloquear',{p_user:u.user_id,p_bloquear:false,p_motivo:f.cort?'Cortesia concedida':'Pagamento confirmado'}):null),(f.cort?'Cortesia concedida':'Premium liberado')+(desb?' e conta desbloqueada ✓':' ✓'),['usuarios','resumo','pedidos','pedall','hist','h_'+u.user_id]);A.form=null}});return}
 if(q('[data-admretirar]')){e.preventDefault();const u=(A.d.usuarios||[]).find(x=>x.user_id===A.sel);if(!u)return;
  mfAdmConfirm({title:'Retirar Premium?',ok:'Retirar',body:`<p class="mf-cf-sub">${escH(u.email)}</p><p class="mf-cf-note">A pessoa volta para o plano Gratuito agora.</p><label class="mf-cf-f"><small>Motivo (opcional)</small><input data-admcfmot maxlength="140"></label>`,
   onOk:w=>{const m=(w.querySelector('[data-admcfmot]')||{}).value||null;mfAdmDo(mfAdmRpc('adm_retirar',{p_user:u.user_id,p_motivo:m}),'Premium retirado',['usuarios','resumo','hist','h_'+u.user_id])}});return}
 if(b=q('[data-admbloq]')){e.preventDefault();const u=(A.d.usuarios||[]).find(x=>x.user_id===A.sel),bl=b.dataset.admbloq==='1';if(!u)return;
  mfAdmConfirm({title:bl?'Bloquear usuário?':'Desbloquear usuário?',ok:bl?'Bloquear':'Desbloquear',body:`<p class="mf-cf-sub">${escH(u.email)}</p><p class="mf-cf-note">${bl?'A pessoa continua vendo os próprios dados, mas não consegue gravar nem sincronizar até ser desbloqueada.':'A pessoa volta a usar o app normalmente.'}</p>${bl?'<label class="mf-cf-f"><small>Motivo (opcional)</small><input data-admcfmot maxlength="140"></label>':''}`,
   onOk:w=>{const m=bl?((w.querySelector('[data-admcfmot]')||{}).value||null):null;mfAdmDo(mfAdmRpc('adm_bloquear',{p_user:u.user_id,p_bloquear:bl,p_motivo:m}),bl?'Usuário bloqueado':'Usuário desbloqueado',['usuarios','resumo','hist','h_'+u.user_id])}});return}
 if(q('[data-admsaveplanos]')){e.preventDefault();const P=A.pe||[],fr=P.find(x=>x.codigo==='free'),pr=P.find(x=>x.codigo==='premium');const preco=mfNum((document.querySelector('#mf-cfg [data-admpreco]')||{}).value);
  if(!(preco>0)){mfToast('Informe o preço do Premium.');return}
  document.querySelectorAll('#mf-cfg [data-admlim]').forEach(i=>{fr.limites[i.dataset.admlim]=Math.max(0,Math.round(+String(i.value).replace(/\D/g,'')||0))});
  mfAdmConfirm({title:'Salvar planos?',ok:'Salvar',body:`<p class="mf-cf-note">Premium: <b>${mfBRL(preco)}</b> por mês. As funções e limites passam a valer para todos agora.</p>`,
   onOk:()=>{mfAdmDo(Promise.all([mfAdmRpc('adm_salvar_plano',{p_codigo:'premium',p_preco:preco,p_recursos:pr.recursos,p_limites:pr.limites||{}}),mfAdmRpc('adm_salvar_plano',{p_codigo:'free',p_preco:0,p_recursos:fr.recursos,p_limites:fr.limites})]).then(()=>{delete A.pe;delete A.peP;window.__mfSub&&(window.__mfSub.at=0);mfSubLoad(true)}),'Planos salvos ✓',['planos','hist'])}});return}
 if(q('[data-admsavemsg]')){e.preventDefault();const m=(document.querySelector('#mf-cfg [data-admmsg]')||{}).value||'';mfAdmDo(mfAdmRpc('adm_salvar_config',{p:{manutencao_msg:m}}),'Mensagem salva ✓',['config','hist']);return}
},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#mf-cfg'))return;const A=mfAdm();
 if(t.matches('[data-admcfg]')){e.stopPropagation();const k=t.dataset.admcfg,v=t.checked,risky=(k==='manutencao'&&v)||(k==='acesso_geral'&&!v)||(k==='gratuito_ativo'&&!v)||(k==='cadastro_aberto'&&!v);
  const go=()=>mfAdmDo(mfAdmRpc('adm_salvar_config',{p:{[k]:v}}),'Ajuste salvo ✓',['config','hist']);
  if(risky){t.checked=!v;mfAdmConfirm({title:'Confirmar ajuste',ok:'Confirmar',body:`<p class="mf-cf-note">${{manutencao:'Ligar o modo manutenção: ninguém além de você grava dados até desligar.',acesso_geral:'Fechar o acesso geral: ninguém além de você usa o app.',gratuito_ativo:'Desligar o plano gratuito: quem não é Premium passa a ver só a tela de assinar.',cadastro_aberto:'Fechar novos cadastros: ninguém consegue criar conta nova.'}[k]}</p>`,onOk:()=>{go()}})}else go();return}
 if(t.matches('[data-admrec]')){const [c,k]=t.dataset.admrec.split('|'),p=(A.pe||[]).find(x=>x.codigo===c);if(p){p.recursos=Object.assign({},p.recursos,{[k]:t.checked})}return}
 if(t.matches('[data-admate]')){A.form&&(A.form.ate=t.value);return}
 if(t.matches('[data-admforma]')){A.form&&(A.form.forma=t.value);return}
 if(t.matches('[data-admdesb]')){A.form&&(A.form.desb=t.checked);return}},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#mf-cfg'))return;const A=mfAdm();
 if(t.matches('[data-admbusca]')){A.busca=t.value;clearTimeout(A.tb);A.tb=setTimeout(()=>{const pos=t.selectionStart;mfCfgRender();const i=document.querySelector('#mf-cfg [data-admbusca]');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(_){}}},220);return}
 if(t.matches('[data-admvalor]')){A.form&&(A.form.valor=t.value);return}
 if(t.matches('[data-admmotivo]')){A.form&&(A.form.motivo=t.value);return}
 if(t.matches('[data-admpreco]')){A.peP=t.value;return}
 if(t.matches('[data-admlim]')){const fr=(A.pe||[]).find(x=>x.codigo==='free');if(fr){fr.limites=Object.assign({},fr.limites,{[t.dataset.admlim]:Math.max(0,Math.round(+String(t.value).replace(/\D/g,'')||0))})}return}},true);
/* abrir a Central: recarrega os dados sempre que entrar */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mf-cfg [data-cfgv="adm"]');if(!b)return;const A=mfAdm();A.d={};A.sel=null;A.form=null;delete A.pe;delete A.peP},true);

/* ===== Patch 84: Investimentos — bloco único Patrimônio + Rentabilidade (verde/vermelho) com botões Investimentos|Simulação ===== */
/* 1) Bloco do topo: mesmas contas de antes (patrimônio, aplicado, rentabilidade das cotações), só o visual muda */
function dvKpis(I){const now=I.reduce((s,a)=>s+ivNow(a),0),cost=I.reduce((s,a)=>s+ivCost(a),0),G=I.filter(a=>ivHasGain(a)),gc=G.reduce((s,a)=>s+ivCost(a),0),gn=G.reduce((s,a)=>s+ivNow(a)-ivCost(a),0),rent=gc>0?gn/gc*100:null;
 const ap=ivAportes(12),apM=ap[11],apP=ap[10];
 const card=(k,c,lbl,val,sub,subCls,vis)=>`<div class="k dv-k" data-k="${k}" style="--dv:${c}"><div class="dv-kt"><small>${lbl}</small></div><b>${val}</b><span class="dv-ks ${subCls||''}">${sub}</span>${vis}</div>`;
 const dv=apP>0?(apM-apP)/apP*100:null;
 const st=rent==null?(cost&&now-cost<-0.005?'bad':cost&&now-cost>0.005?'ok':'mu'):rent>=0?'ok':'bad';
 const arrow=st==='bad'?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7l6 6 4-4 8 8M21 11v6h-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8M21 13V7h-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 const cls=ivGroups(I).filter(g=>g.rent!=null).map(g=>`<span class="${g.rent>=0?'ok':'bad'}">${IV_NOME[g.k]||'Outros'} <b>${ivSp(g.rent)}</b></span>`).join('');
 /* nova organização (Patrimônio): os botões Resumo|Patrimônio|Investimentos|Metas ficam sempre no topo, como nas outras abas; não vão mais para dentro deste bloco */
 const seg='';
 const hero=`<div class="dv-hero ${st}"><div class="dv-hero-t"><small>${window.mfIsDesk&&mfIsDesk()?'Patrimônio total':'Valor atual'}</small><em class="dv-pill">${I.length} ativos</em>${window.mfIsDesk&&mfIsDesk()?'':mfEyeHtml()}</div><b class="dv-hero-v">${R(now)}</b>
  <div class="dv-hero-r ${st}">${rent==null?'<span>Rentabilidade · sem cotações</span>':`${arrow}<span>${ivSg(gn)} (${ivSp(rent)})</span>`}</div>
  <div class="dv-hero-s">${cost?`Aplicado ${R(cost)} · ${ivSg(now-cost)} sobre o aplicado`:'Nenhum valor aplicado ainda'}</div>
  ${cls?`<div class="dv-hero-cls">${cls}</div>`:''}${seg}</div>`;
 const MOB=!(window.mfIsDesk&&mfIsDesk());const ATALHOS=(window.mfInvAtalhos?mfInvAtalhos():'');return B('dv_kpi')+`<div class="dv-kpis dv-kpis-h">${hero}${MOB?ATALHOS:''}${MOB?'':card('ap','#fb923c','Aportado no mês',R(apM),dv==null?'sem base no mês anterior':`${dv>=0?'▲':'▼'} ${Math.abs(dv).toFixed(0)}% vs mês anterior`,dv==null?'':dv>=0?'ok':'bad',mfSpark(ap,'#fb923c'))}${MOB?'':(()=>{/* Dividendos do mês (patch 79): recebidos no mês + o que ainda cai este mês */
  const mk0=TD.slice(0,7),pk0=nm(mk0,-1),sm=k=>S.tx.filter(t=>t.d&&t.d.slice(0,7)===k&&window.mfIsProv&&mfIsProv(t)).reduce((s,t)=>s+(+t.v||0),0),cur=sm(mk0),prv=sm(pk0);
  const done=new Set(Array.isArray(S.pvaDone)?S.pvaDone:[]),fut=((window.__pva&&window.__pva.rows)||[]).filter(r=>{const d=r.data_pagamento||r.data_com;return d&&d>TD&&d.slice(0,7)===mk0&&!done.has('pva_'+(r.chave||(r.ticker+'_'+r.data_ex)))}).reduce((s,r)=>s+(+r.total||0),0);
  const dlt=prv>0?(cur-prv)/prv*100:null,sub=fut>0?`+ ${R(fut)} a receber este mês`:dlt==null?(cur>0?'recebidos este mês':'nenhum provento ainda'):`${dlt>=0?'▲':'▼'} ${Math.abs(dlt).toFixed(0)}% vs mês anterior`;
  return card('dv','#34d399','Dividendos do mês',R(cur),sub,fut>0?'ok':dlt==null?'':dlt>=0?'ok':'bad','')})()}</div>`}
/* Personalizar telas: mesmas chaves (k1..k4) apontando para o novo bloco */
if(typeof MF_VIEW!=='undefined'&&MF_VIEW.dv_kpi){const V='Valores',S2='Informações secundárias',I_='Indicadores',o=(k,l,g,sel)=>({k,l,g,sel,t:'b',d:true});
 MF_VIEW.dv_kpi={t:window.mfIsDesk&&mfIsDesk()?'Patrimônio total':'Valor atual',o:[o('k1',window.mfIsDesk&&mfIsDesk()?'Patrimônio total':'Valor atual',V,'.dv-hero-v'),o('k2','Rentabilidade',V,'.dv-hero-r'),o('k3','Aportado no mês',V,'.dv-k[data-k="ap"]'),o('k4','Dividendos do mês',V,'.dv-k[data-k="dv"]'),o('sec','Textos abaixo dos valores',S2,'.dv-ks,.dv-hero-s'),o('ind','Rentabilidade por classe e etiquetas',I_,'.dv-hero-cls,.dv-pill')]}}
/* Botões Investimentos|Simulação: dentro do bloco quando ele está visível e liberado; senão continuam no topo */
window.__mfAD.push(function(){const h=document.querySelector('#app .dv-hero-seg'),blk=h&&h.closest('[data-bk]'),inside=!!(h&&h.offsetParent!==null&&!(blk&&blk.classList.contains('mf-locked')));
 const on=inside&&tab==='inv'&&!!(window.mfIsDesk&&mfIsDesk()); /* 1.34: no celular o seletor fica só na barra abaixo do título (padrão das abas); dentro do card só no computador */document.documentElement.classList.toggle('mf-invseg-in',on);
 document.querySelectorAll('.mf-seg').forEach(sg=>{if(!sg.querySelector('[data-invmode]')||sg.closest('.dv-hero-seg'))return;const w=sg.parentElement&&sg.parentElement.classList.contains('mf-anseg')?sg.parentElement:sg;w.style.display=on?'none':''})});

/* ===== Patch 85: ajustes — blocos recolhidos ficam como você deixou; Novo lançamento recolhível; Investimentos › Proventos; Dashboard: 50/30/20 no lugar do Fluxo de caixa ===== */
/* ---- 1) Recolher/abrir: guarda o estado de cada bloco (S.lay.fold, sincroniza entre celular e computador) ---- */
function mfFoldStore(){const L=S.lay||(S.lay={});if(!L.fold||typeof L.fold!=='object'||Array.isArray(L.fold))L.fold={};return L.fold}
function mfFoldKey(c){const own=c.getAttribute('data-bk'),up=c.closest('[data-bk]'),bk=own||(up&&up.dataset.bk);return bk?'bk:'+bk:(c.dataset.mfFoldKey?'h:'+c.dataset.mfFoldKey:'')}
window.__mfAD.push(function(){
 /* Novo lançamento ganha o mesmo botão de recolher dos outros blocos */
 const f=document.querySelector('#app .form-add[data-bk]');
 if(f&&!f.classList.contains('mf-foldable')){const h=f.querySelector(':scope>h2');if(h){f.classList.add('mf-foldable');f.dataset.mfFoldKey=':Novo lançamento';h.classList.add('mf-keep');h.insertAdjacentHTML('beforeend','<button type="button" class="mf-fold" aria-label="Recolher ou abrir" aria-expanded="true">▸</button>')}}
 const st=mfFoldStore();
 document.querySelectorAll('#app .mf-foldable,#app .mf-sibfold').forEach(c=>{const k=mfFoldKey(c);if(!k||!(k in st))return;const on=!!st[k];c.classList.toggle('mf-folded',on);
  const b=c.querySelector('.mf-fold')||(c.previousElementSibling&&c.previousElementSibling.querySelector('.mf-fold'));if(b)b.setAttribute('aria-expanded',String(!on));
  const ok=c.dataset.mfFoldKey;if(ok&&window.__mfFolded){if(on)window.__mfFolded[ok]=1;else delete window.__mfFolded[ok]}})});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.mf-fold');if(!b||document.body.classList.contains('org-on'))return;
 const c=b.closest('.mf-foldable')||(b.parentElement&&b.parentElement.__mfCard);if(!c)return;const k=mfFoldKey(c);if(!k)return;mfFoldStore()[k]=c.classList.contains('mf-folded');save()},true);