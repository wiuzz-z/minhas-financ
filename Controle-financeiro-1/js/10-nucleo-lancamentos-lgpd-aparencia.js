
mig();mig3();mig4();mig5();mig6();
// Mantém os lançamentos existentes; não limpar dados automaticamente.
const isVR=t=>t.t==='VR'||(t.c==='Receita'&&/\bvr\b/i.test(t.n||''));
const TCOL={Pix:'#1f9d6b',Crédito:'#d9455f',VR:'#f5a623',Reserva:'#0d9488'};
const B=id=>`<!--b:${id}-->`;
const mk=(y,m)=>y+'-'+String(m).padStart(2,'0');
function mm(y,m){const o={rec:0,sai:0,cat:{},tp:{}};CATS.forEach(c=>o.cat[c]=0);TIPOS.forEach(x=>o.tp[x]=0);
 S.tx.filter(t=>t.d.slice(0,7)==mk(y,m)).forEach(t=>{if(isInvoicePayment(t)){if(t.t in o.tp)o.tp[t.t]+=t.v;return}if(t.c==='Receita'){if(!mfIsProvCx(t)&&!mfIsSaldoIni(t))o.rec+=+t.v||0;}else if(t.c){o.sai+=+t.v||0;o.cat[t.c]=(o.cat[t.c]||0)+(+t.v||0)}if(t.t in o.tp)o.tp[t.t]+=(+t.v||0)});return o}
const AUTO='2026-10';
function autos(){const grouped={};S.tx.filter(t=>t.t==='Crédito'&&t.d&&+t.v>0).forEach(t=>{const due=invoiceDueDate(t),k=due.slice(0,7);if(k>=AUTO)grouped[k]=(grouped[k]||0)+txValue(t)});return Object.keys(grouped).sort().map(k=>{const dueRows=S.tx.filter(t=>t.t==='Crédito'&&t.d&&invoiceDueDate(t).slice(0,7)===k),tot=mfFatvEffAll(k)??grouped[k],pg=S.tx.filter(t=>isInvoicePayment(t)&&t.d&&mfPayK(t)===k).reduce((s,t)=>s+txValue(t),0),a=tot-pg,dueDate=dueRows.map(invoiceDueDate).sort().find(d=>d.slice(0,7)===k)||`${k}-${String(ensureCardBilling().dueDay).padStart(2,'0')}`;return a>.005?{id:'a'+k,n:'Fatura do cartão · vence '+dueDate.slice(8,10)+'/'+dueDate.slice(5,7),v:a,tot,pg,d:dueDate,c:'',t:'Fatura',auto:1}:null}).filter(Boolean)}
/* ===== Ajuda ao lançar: sugere a categoria (histórico e palavras) e avisa quando parece uma fatura ===== */
function mfNormTxt(x){return String(x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\(\d+\/\d+\)/g,'').replace(/[^a-z ]+/g,' ').replace(/\s+/g,' ').trim()}
const MF_SUG_KW=[[/\b(invest|aporte|tesouro|cdb|lci|lca|acoes|fii|reserva)/,'Investimentos'],[/\b(mercado|supermerc|feira|padaria|acougue|hortifruti|ifood|restaurante|lanche|almoco|jantar|cafe|pizza)/,'Alimentação'],[/\b(aluguel|condominio|luz|energia|agua|gas|iptu|casa)\b/,'Moradia'],[/\b(netflix|spotify|prime|disney|hbo|youtube|icloud|assinatura|globoplay)/,'Assinatura'],[/\b(internet|claro|vivo|tim|oi|celular|plano|seguro|escola|faculdade|curso)\b/,'Conta fixa'],[/\b(cinema|show|bar|viagem|passeio|jogo|lazer)/,'Lazer'],[/\b(uber|99|gasolina|combustivel|onibus|metro|estacionamento|pedagio|farmacia|remedio)/,'Variáveis']];
function mfSugCat(desc){const k=mfNormTxt(desc);if(k.length<3)return null;const cnt={};
 S.tx.forEach(t=>{if(!t||t.c==='Receita'||!t.c||isInvoicePayment(t)||mfIsTr(t))return;const n=mfNormTxt(t.n);if(n&&(n===k||(k.length>=4&&n.startsWith(k))||(n.length>=4&&k.startsWith(n)))){const sb=t.s||inferSub(t.c);cnt[sb]=(cnt[sb]||0)+1}});
 const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];if(best)return {s:best[0],why:'como nos seus lançamentos anteriores'};
 const kw=MF_SUG_KW.find(([re])=>re.test(k));return kw?{s:kw[1],why:'pela descrição'}:null}
function mfLancHint(){const fn=document.getElementById('fn');if(!fn)return;let h=document.getElementById('mf-lhint');const fld=fn.closest('.mf-fld')||fn.closest('label')||fn.parentElement,box=fld.parentElement&&fld.parentElement.contains(document.getElementById('fd'))?fld.parentElement:fld;
 if(!h){h=document.createElement('div');h.id='mf-lhint';box.insertAdjacentElement('afterend',h)}
 const v=fn.value||'',k=mfNormTxt(v),out=[];
 if(F.c!=='Receita'&&/\bfatura\b|cartao de credito/.test(k)&&!/^(pagar|pagamento|quitar|quitacao) (a )?fatura/.test(k))out.push(`<div class="mf-lh wa">Parece uma fatura do cartão. Para <b>pagar</b>, use Contas › Cartão de crédito › Pagar fatura (não conta como despesa). Se for uma compra, lance cada compra no Crédito.<button type="button" data-tab="mais">Ir para o cartão</button></div>`);
 const sg=F.c!=='Receita'?mfSugCat(v):null,cur=F.s||inferSub(F.c);
 if(sg&&sg.s!==cur)out.push(`<div class="mf-lh">Categoria sugerida: <b>${escH(sg.s)}</b> <small class="mu">(${sg.why})</small><button type="button" data-fsug="${escH(sg.s)}">Usar</button></div>`);
 h.innerHTML=out.join('');h.hidden=!out.length}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='fn')mfLancHint()},true);
(window.__mfAD=window.__mfAD||[]).push(()=>{try{if(document.getElementById('fn'))mfLancHint()}catch(e){}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-fsug]');if(!b)return;e.preventDefault();e.stopPropagation();const fv=document.getElementById('fv'),fd=document.getElementById('fd'),fn=document.getElementById('fn');if(fv)F.v=fv.value;if(fd)F.dt=fd.value;if(fn)F.n=fn.value;
 const sb=b.dataset.fsug;F.s=sb;F.c=SUB_TO_LEGACY[sb]||'Lazer e Pessoal';F.g=inferMain(F.c,F.s);draw();mfToast('Categoria: '+sb)},true);
/* ===== LGPD: baixar dados, excluir conta ===== */
function mfLgpdDl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function mfLgpdCsv(){const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"',hd=['data','descricao','valor','tipo','categoria','subcategoria','forma_pagamento','conta','de','para'];
 const rows=(S.tx||[]).filter(t=>t&&t.d).sort((a,b)=>a.d<b.d?-1:1).map(t=>[t.d,t.n,String(+t.v||0).replace('.',','),mfIsTr(t)?'transferência':isInvoicePayment(t)?'pagamento de fatura':t.c==='Receita'?'receita':'despesa',t.c||'',t.s||'',t.t||'',t.acc?mfAccName(t.acc):'',t.from?mfTrSide(t.from):'',t.to?mfTrSide(t.to):''].map(q).join(';'));
 return '﻿'+hd.join(';')+'\n'+rows.join('\n')}
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-lgpd]');if(!b)return;e.preventDefault();e.stopPropagation();const k=b.dataset.lgpd,d=TD;
 if(k==='json'){mfLgpdDl(`controle-alpha-meus-dados-${d}.json`,JSON.stringify({exportado_em:new Date().toISOString(),conta:typeof authUser!=='undefined'&&authUser?{email:authUser.email,id:authUser.id}:null,dados:S,preferencias_de_layout:window.getLocalLayoutPreferences?getLocalLayoutPreferences():null},null,2),'application/json');mfToast('Arquivo baixado ✓');return}
 if(k==='csv'){mfLgpdDl(`controle-alpha-lancamentos-${d}.csv`,mfLgpdCsv(),'text/csv;charset=utf-8');mfToast('Planilha baixada ✓');return}
 if(k==='del'){if(typeof authUser==='undefined'||!authUser||!supabaseClient)return;
  mfConfirm({title:'Excluir minha conta',ok:'Excluir para sempre',body:`<p class="mf-cf-sub">Isso apaga a conta <b>${escH(authUser.email||'')}</b> e todos os dados na nuvem. Não dá para desfazer.</p><label class="mfc-f" style="display:grid;gap:4px;margin-top:8px">Digite <b>EXCLUIR</b> para confirmar<input data-lgpdok autocomplete="off" style="padding:10px 12px;border-radius:12px;border:1px solid var(--ln);background:var(--card-2);color:var(--tx)"></label>`,
   onOk:w=>{const i=w.querySelector('[data-lgpdok]');if(!i||i.value.trim().toUpperCase()!=='EXCLUIR'){mfToast('Digite EXCLUIR para confirmar.');return false}
    MF_DB.account.deleteMine().then(({error})=>{if(error){mfToast('Não foi possível excluir: '+(error.message||'erro'));return}
     try{['fin1','fin1_uid','fin1_base','fin1_pending','fin1_rev'].forEach(x=>localStorage.removeItem(x))}catch(_){}mfToast('Conta excluída.');setTimeout(()=>{MF_DB.auth.signOut().finally(()=>location.reload())},900)});return true}})}},true);
/* ===== Registro de erros (Supabase › app_erros): só grava; até 10 por abertura, sem repetir ===== */
var MF_VER=MF_CONFIG.version;
(function(){const q=[],seen=new Set();let sent=0,busy=false;
 const push=(msg,stack,onde)=>{msg=String(msg||'').slice(0,500);if(!msg||/^Script error\.?$/.test(msg)||/ResizeObserver loop/.test(msg))return;const k=msg+'|'+(onde||'');if(seen.has(k)||sent+q.length>=10)return;seen.add(k);
  q.push({msg,stack:stack?String(stack).slice(0,2000):null,onde:String(onde||'').slice(0,200),versao:MF_VER,aparelho:String(navigator.userAgent||'').slice(0,200)});setTimeout(flush,1500)};
 const flush=()=>{if(busy||!q.length||typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser||!navigator.onLine)return;busy=true;const rows=q.splice(0,q.length);
  MF_DB.errors.insert(rows).then(({error})=>{busy=false;if(!error)sent+=rows.length},()=>{busy=false})};
 window.addEventListener('error',e=>{try{push(e.message||(e.error&&e.error.message),e.error&&e.error.stack,(typeof tab!=='undefined'?'aba '+tab:'')+(e.filename?' · '+String(e.filename).split('/').pop()+':'+e.lineno:''))}catch(_){}});
 window.addEventListener('unhandledrejection',e=>{try{const r=e.reason;push((r&&r.message)||String(r),r&&r.stack,(typeof tab!=='undefined'?'aba '+tab:'')+' · promessa')}catch(_){}});
 window.mfLogErro=(m,where)=>push(m&&m.message||m,m&&m.stack,where);setInterval(flush,30000)})();

/* ===== Remover ativo: pede confirmação (o ✕ do card apagava direto) ===== */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rmi^="inv:"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
 const i=+String(b.dataset.rmi).split(':')[1],a=(S.inv||[])[i];if(!a){draw();return}
 const nome=String(a.a||'Ativo'),val=typeof ivNow==='function'?ivNow(a):(+a.q||0)*(+a.p||0);
 mfConfirm({title:'Remover ativo?',ok:'Remover',body:`<p class="mf-cf-sub">${escH(nome)}${a.f?'':` · ${(+a.q||0).toLocaleString('pt-BR')} cotas`}</p><div class="mf-cf-v">${R(val||0)}</div><p class="mf-cf-note">Sai da carteira e do histórico de aportes. Se foi uma venda, use "Vender ativo" em + Lançar.</p>`,
  onOk:()=>{const k=(S.inv||[]).indexOf(a);if(k<0)return;S.inv.splice(k,1);window.__invOpen={};if(typeof F!=='undefined')F.del=null;save();draw();mfToast(nome+' removido')}})},true);

/* ===== Aparência › Blocos e cards: tom das cores, cantos, espaço; barra de abas e animações ===== */
var MF_TONS={dark:[['','Padrão','#151517','#212124','#0b0b0c'],['grafite','Grafite','#25262a','#313237','#16171a'],['azul','Azul','#14213a','#1c2d4c','#0a111e'],['roxo','Roxo','#201933','#2b2245','#110c1c'],['rosa','Rosa','#2b1623','#3b2032','#170b12'],['vinho','Vinho','#2b1417','#3c1d21','#170a0c'],['verde','Verde','#122520','#1a332b','#09140f'],['cafe','Café','#261d16','#34281f','#140f0b'],['premium','Premium','#0e0e10','#19191c','#000000']],
 light:[['','Padrão','#ffffff','#f2f2f4','#ececee'],['grafite','Cinza','#f3f3f5','#e6e6ea','#d9d9de'],['azul','Azul claro','#eef4ff','#dde8fb','#d7e3f6'],['roxo','Lilás','#f5f1ff','#e8e0fb','#e1d9f5'],['rosa','Rosa claro','#fff1f6','#fbe0ea','#f5d8e3'],['vinho','Pêssego','#fff4ee','#fbe3d6','#f4d9ca'],['verde','Menta','#eefbf4','#daf2e5','#d3ecde'],['cafe','Areia','#fbf7ef','#efe7d8','#e8dfcc']]};
/* 1.16: o tom pinta o PLANO DE FUNDO; os cartões ficam um pouco mais claros que o fundo (o Premium continua preto) */
function mfTomCores(th,k,card,c2,bg){if(k==='premium')return{bg,card,c2};return th==='dark'?{bg:card,card:c2,c2:`color-mix(in srgb,${c2} 86%,#fff 14%)`}:{bg:c2,card:card,c2:bg}}
function mfLookCss(){let c='';['dark','light'].forEach(th=>MF_TONS[th].forEach(([k,,card0,c20,bg0])=>{if(!k)return;const{bg,card,c2}=mfTomCores(th,k,card0,c20,bg0);
 c+=`:root[data-theme="${th}"][data-mftom="${k}"]{--card:${card}!important;--card-solid:${card}!important;--card-2:${c2}!important;--field:${c2}!important;--bg:${bg}!important;--dock-bg:${card}!important}`}));
 c+=`:root[data-mfcanto="r"]{--radius:10px!important;--radius-sm:8px!important;--ui-inner-radius:8px!important}html[data-mfcanto="r"][data-theme][data-tab] body #app [data-bk][data-bk]:not(.g2):not(.dv-kpis):not(.mf-cls-wrap),html[data-mfcanto="r"][data-theme][data-tab] body #app .c,html[data-mfcanto="r"][data-theme][data-tab] body #app section[class*="dash-"]{border-radius:10px!important}html[data-mfcanto="r"][data-theme][data-tab] body #app .k[class],html[data-mfcanto="r"][data-theme][data-tab] body #app [data-bk].k:not(.g2):not(.dv-kpis):not(.mf-cls-wrap){border-radius:8px!important}
:root[data-mfcanto="a"]{--radius:32px!important;--radius-sm:24px!important;--ui-inner-radius:18px!important}html[data-mfcanto="a"][data-theme][data-tab] body #app [data-bk][data-bk]:not(.g2):not(.dv-kpis):not(.mf-cls-wrap),html[data-mfcanto="a"][data-theme][data-tab] body #app .c,html[data-mfcanto="a"][data-theme][data-tab] body #app section[class*="dash-"]{border-radius:32px!important}html[data-mfcanto="a"][data-theme][data-tab] body #app .k[class],html[data-mfcanto="a"][data-theme][data-tab] body #app [data-bk].k:not(.g2):not(.dv-kpis):not(.mf-cls-wrap){border-radius:24px!important}
:root[data-mfgap="c"]{--layout-gap:8px!important}html[data-mfgap="c"]:not(.mf-desk)[data-theme][data-tab] body #app [data-bk][data-bk]:not(.k),html[data-mfgap="c"] body #app .c:not(.k){margin-bottom:8px!important}
:root[data-mfgap="a"]{--layout-gap:22px!important}html[data-mfgap="a"]:not(.mf-desk)[data-theme][data-tab] body #app [data-bk][data-bk]:not(.k),html[data-mfgap="a"] body #app .c:not(.k){margin-bottom:22px!important}
:root[data-mfnvl="0"] #nv .nv-l{display:none!important}
:root[data-mfanim="0"] *,:root[data-mfanim="0"] *::before,:root[data-mfanim="0"] *::after{animation:none!important;transition:none!important}
.mf-tons{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:6px 0 14px}
.mf-tom{display:flex!important;flex-direction:column;align-items:center;gap:6px;padding:10px 4px!important;border-radius:14px;border:1px solid var(--ln)!important;background:var(--card-2)!important;color:var(--tx)!important;font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;width:auto!important}
.mf-tom i{width:34px;height:34px;border-radius:50%;display:block;border:1px solid rgba(127,127,127,.35);position:relative;overflow:hidden}
.mf-tom i b{position:absolute;right:0;bottom:0;width:50%;height:50%;display:block}
.mf-tom.on{border-color:var(--tx)!important;box-shadow:0 0 0 1px var(--tx) inset}`;
 let st=document.getElementById('mf-look');if(!st){st=document.createElement('style');st.id='mf-look';document.head.appendChild(st)}if(st.textContent!==c)st.textContent=c}
function mfLookApply(){const L=S.lay||{},r=document.documentElement,set=(a,v)=>{if(v)r.setAttribute(a,v);else r.removeAttribute(a)};mfLookCss();
 set('data-mftom',L.tom||'');set('data-mfcanto',L.canto||'');set('data-mfgap',L.gap||'');set('data-mfnvl',L.nvl==='0'?'0':'');set('data-mftbar',['1','2','3'].includes(L.tbar)?L.tbar:'');set('data-mfanim',L.anim==='0'?'0':'');set('data-relevo',L.relevo==='a1'||L.relevo==='d3'?L.relevo:'')}
(window.__mfAD=window.__mfAD||[]).push(()=>{try{mfLookApply()}catch(e){}});
function mfLookGroup(){const L=S.lay||{},th=L.theme==='light'?'light':'dark',chip=(attr,on,t)=>`<button type="button" class="mfc-chip ${on?'on':''}" ${attr}>${t}</button>`;
 return `<div class="mfc-group mfc-pad"><div class="mfc-lb">Cor dos blocos e cards</div><p class="mfc-note" style="margin:0 0 6px">Muda o fundo dos blocos, dos cards e da tela. Cada tema (escuro ou claro) tem seus tons.</p>
 <div class="mf-tons">${MF_TONS[th].filter(x=>x[0]!=='premium').map(([k,t,card,c2])=>`<button type="button" class="mf-tom ${((L.tom||'')===k)?'on':''}" data-mftom="${k}" aria-pressed="${(L.tom||'')===k}"><i style="background:${card}"><b style="background:${c2}"></b></i>${t}</button>`).join('')}</div>
 <div class="mfc-lb">Cantos dos blocos</div><div class="mfc-chips">${chip('data-mfcanto=""',!L.canto,'Padrão')}${chip('data-mfcanto="r"',L.canto==='r','Retos')}${chip('data-mfcanto="a"',L.canto==='a','Bem redondos')}</div>
 <div class="mfc-lb">Espaço entre os blocos</div><div class="mfc-chips">${chip('data-mfgap="c"',L.gap==='c','Compacto')}${chip('data-mfgap=""',!L.gap,'Normal')}${chip('data-mfgap="a"',L.gap==='a','Amplo')}</div></div>
 <div class="mfc-group mfc-pad"><div class="mfc-lb">Barra de abas</div><div class="mfc-chips">${chip('data-mfnvl=""',L.nvl!=='0','Ícone e nome')}${chip('data-mfnvl="0"',L.nvl==='0','Só ícone')}</div>
 <div class="mfc-lb">Animações</div><div class="mfc-chips">${chip('data-mfanim=""',L.anim!=='0','Ligadas')}${chip('data-mfanim="0"',L.anim==='0','Desligadas (mais leve)')}</div>
 <div class="mfc-lb">Animação ao abrir a tela (todos os blocos)</div><div class="mfc-chips">${[['','Nenhuma'],['f','Aparecer'],['s','Subir'],['l','Deslizar'],['z','Crescer'],['b','Pular']].map(([v,t])=>chip(`data-mfanall="${v}"`,(L.anAll||'')===v,t)).join('')}</div><p class="mfc-note" style="margin:4px 0 0">Os blocos entram um depois do outro. Um bloco com animação própria (Editar bloco › Efeitos) usa a dele.</p>
 <button type="button" class="mfc-btn ghost" data-mflookreset="1" style="margin-top:12px;width:100%">Voltar a aparência ao padrão</button></div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mf-cfg [data-mftom],#mf-cfg [data-mfcanto],#mf-cfg [data-mfgap],#mf-cfg [data-mfnvl],#mf-cfg [data-mftbar],#mf-cfg [data-mfanim],#mf-cfg [data-mfanall],#mf-cfg [data-mflookreset]');if(!b)return;e.preventDefault();e.stopPropagation();
 S.lay=S.lay||{};const L=S.lay;
 if(b.dataset.mflookreset){['tom','canto','gap','nvl','tbar','anim','borda','anAll','relevo'].forEach(k=>delete L[k]);mfToast('Aparência no padrão')}
 else{const k=['mftom','mfcanto','mfgap','mfnvl','mftbar','mfanim','mfanall'].find(x=>b.dataset[x]!==undefined),v=b.dataset[k],key={mftom:'tom',mfcanto:'canto',mfgap:'gap',mfnvl:'nvl',mftbar:'tbar',mfanim:'anim',mfanall:'anAll'}[k];if(v)L[key]=v;else delete L[key];if(k==='mfanall')window.__lkScr=null}
 save();mfLookApply();draw();window.mfCfgRender&&mfCfgRender()},true);

/* ===== Sessão: renovar o login sozinho e avisar quando precisar entrar de novo ===== */
function mfRefreshOnce(){if(!window.__mfRefreshing){window.__mfRefreshing=(async()=>{try{let r=await MF_DB.auth.refresh();let ss=r&&r.data&&r.data.session;
  if(!ss&&window.__mfRt){r=await MF_DB.auth.refreshWith({refresh_token:window.__mfRt});ss=r&&r.data&&r.data.session}return ss||null}catch(e){return null}finally{setTimeout(()=>{window.__mfRefreshing=null},2000)}})()}return window.__mfRefreshing}
function mfSessionLost(){const now=Date.now();if(window.__mfLostAt&&now-window.__mfLostAt<60000)return;window.__mfLostAt=now;
 try{sync='erro';window.updateCloudStatus&&updateCloudStatus('Sua sessão expirou. Entre de novo para sincronizar.')}catch(_){}
 if(typeof mfToast==='function')mfToast('Sua sessão expirou. Entre de novo: seus dados continuam guardados neste aparelho.');
 setTimeout(()=>{window.mfOpenAuth&&mfOpenAuth()},400)}
async function mfSessionCheck(){if(typeof supabaseClient==='undefined'||!supabaseClient||typeof authUser==='undefined'||!authUser||!navigator.onLine||document.visibilityState!=='visible')return;
 try{const {data}=await MF_DB.auth.getSession(),ss=data&&data.session;if(ss&&ss.expires_at&&ss.expires_at*1000-Date.now()>120000)return;if(!(await mfRefreshOnce()))mfSessionLost()}catch(_){}}
setInterval(mfSessionCheck,60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(mfSessionCheck,300)});

/* ===== Senha da conta: "Esqueci minha senha", nova senha pelo link do e-mail e "Trocar senha" ===== */
function mfPwModal(title,sub,onSave){mfConfirm({title,ok:'Salvar nova senha',body:`<p class="mf-cf-sub">${sub}</p><label class="mf-cf-f"><small>Nova senha</small><input type="password" data-pw1 autocomplete="new-password" minlength="6" placeholder="Mínimo de 6 caracteres"></label><label class="mf-cf-f"><small>Repita a nova senha</small><input type="password" data-pw2 autocomplete="new-password" minlength="6"></label><p class="mf-cf-note mf-pw-err" hidden></p>`,
 onOk:w=>{const a=w.querySelector('[data-pw1]').value,b=w.querySelector('[data-pw2]').value,er=w.querySelector('.mf-pw-err'),ok=w.querySelector('[data-cf="ok"]'),say=t=>{er.textContent=t;er.hidden=!t};
  if(a.length<6){say('A senha precisa ter pelo menos 6 caracteres.');return false}if(a!==b){say('As duas senhas não são iguais.');return false}
  say('');ok.textContent='Salvando…';Promise.resolve(onSave(a)).then(r=>{if(r&&r.error){ok.disabled=false;ok.textContent='Salvar nova senha';const m=String(r.error.message||'');say(/different|igual/i.test(m)?'A nova senha precisa ser diferente da atual.':/weak|fraca|short/i.test(m)?'Senha fraca: use letras e números.':/reauth|recent/i.test(m)?'Por segurança, saia e entre de novo na conta antes de trocar a senha.':'Não foi possível salvar: '+m);return}w.remove();mfToast('Senha alterada ✓')},()=>{ok.disabled=false;ok.textContent='Salvar nova senha';say('Sem conexão. Tente de novo.')});return false}});
 setTimeout(()=>{const i=document.querySelector('#mf-confirm [data-pw1]');i&&i.focus()},80)}
function mfPwChange(){if(typeof supabaseClient==='undefined'||!supabaseClient||!authUser){mfToast('Entre na conta para trocar a senha.');return}
 mfPwModal('Trocar senha','Conta: '+escH(authUser.email||''),p=>MF_DB.auth.updateUser({password:p}))}
/* link do e-mail de recuperação: o Supabase abre o app já conectado; aqui só pede a nova senha */
(window.__mfAD=window.__mfAD||[]).push(()=>{try{
 if(window.__mfLinkErr&&!window.__mfLinkErrShown){window.__mfLinkErrShown=1;mfToast('O link de recuperação expirou ou já foi usado. Peça outro em "Esqueci minha senha".');try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}}
 if(window.__mfRecovery&&typeof authUser!=='undefined'&&authUser&&!document.getElementById('mf-confirm')){window.__mfRecovery=0;try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}
  mfPwModal('Criar nova senha','Você abriu o link de recuperação. Escolha a nova senha da conta '+escH(authUser.email||'')+'.',p=>MF_DB.auth.updateUser({password:p}))}}catch(e){}});
/* tela de entrar: "Esqueci minha senha" */
(function(){const add=()=>{const f=document.getElementById('cloud-auth-form');if(!f||document.getElementById('cloud-forgot'))return;
 f.insertAdjacentHTML('beforeend','<button type="button" id="cloud-forgot" class="auth-forgot">Esqueci minha senha</button>')};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
 document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('#cloud-forgot');if(!b)return;e.preventDefault();e.stopPropagation();
  const A=window.mfAuthMsg||(()=>{}),em=((document.getElementById('cloud-email')||{}).value||'').trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){A('err','Digite seu e-mail no campo acima e toque de novo em "Esqueci minha senha".');document.getElementById('cloud-email')?.focus();return}
  if(typeof supabaseClient==='undefined'||!supabaseClient){try{await window.mfSbReady()}catch(_){}}
  if(typeof supabaseClient==='undefined'||!supabaseClient){A('err','Sem conexão com o servidor. Tente de novo em instantes.');return}
  b.disabled=true;b.textContent='Enviando…';
  try{const {error}=await MF_DB.auth.resetPassword(em,{redirectTo:location.origin+'/'});
   if(error&&/rate|limit|seconds/i.test(error.message||''))A('err','Já enviamos um link há pouco. Espere um minuto e tente de novo.');else if(error)A('err','Não foi possível enviar: '+escH(error.message||'erro'));
   else A('ok','Se esse e-mail tiver conta, enviamos um link para criar uma nova senha. Veja também a caixa de spam.')}
  catch(_){A('err','Sem conexão. Tente de novo.')}finally{b.disabled=false;b.textContent='Esqueci minha senha'}},true)})();

/* ===== Bloqueio do app com PIN e digital/rosto — fica só neste aparelho (não vai para a nuvem) ===== */
var MF_LOCK_K='fin1_lock',MF_LOCK_F='fin1_lock_f';
const mfLkB64=u=>btoa(String.fromCharCode(...u)),mfLkB64d=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));
function mfLockGet(){try{const L=JSON.parse(localStorage.getItem(MF_LOCK_K)||'null');return L&&L.h&&L.s&&L.n?L:null}catch(e){return null}}
function mfLockSet(L){try{if(L)localStorage.setItem(MF_LOCK_K,JSON.stringify(L));else localStorage.removeItem(MF_LOCK_K)}catch(e){}}
async function mfPinHash(pin,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
 return mfLkB64(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:mfLkB64d(salt),iterations:150000,hash:'SHA-256'},k,256)))}
async function mfPinCheck(pin){const L=mfLockGet();return !!L&&(await mfPinHash(pin,L.s))===L.h}
async function mfBioOk(){try{return !!(window.PublicKeyCredential&&PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())}catch(e){return false}}
async function mfBioRegister(){const u=(typeof authUser!=='undefined'&&authUser&&authUser.email)||'Controle Alpha';
 const c=await navigator.credentials.create({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rp:{name:'Controle Alpha',id:location.hostname},user:{id:crypto.getRandomValues(new Uint8Array(16)),name:u,displayName:u},
  pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'discouraged'},timeout:60000,attestation:'none'}});
 return c?mfLkB64(new Uint8Array(c.rawId)):null}
async function mfBioVerify(id){const a=await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{type:'public-key',id:mfLkB64d(id)}],userVerification:'required',timeout:60000,rpId:location.hostname}});return !!a}
function mfLockFails(){try{return JSON.parse(localStorage.getItem(MF_LOCK_F)||'{"n":0,"u":0}')}catch(e){return {n:0,u:0}}}
function mfUnlock(){document.getElementById('mf-lock')?.remove();document.documentElement.classList.remove('mf-locked');window.__mfLockOn=0;window.__mfHiddenAt=0;try{localStorage.removeItem(MF_LOCK_F)}catch(_){}}
function mfLockShow(){const L=mfLockGet();if(!L){mfUnlock();return}if(document.getElementById('mf-lock'))return;
 document.documentElement.classList.add('mf-locked');window.__mfLockOn=1;document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
 const w=document.createElement('div');w.id='mf-lock';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','App bloqueado');
 const keys=[1,2,3,4,5,6,7,8,9,'bio',0,'del'];
 w.innerHTML=`<div class="mf-lock-box"><div class="mf-lock-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div>
 <h2>Digite seu PIN</h2><div class="mf-lock-dots" aria-live="polite">${Array.from({length:L.n},()=>'<i></i>').join('')}</div><p class="mf-lock-msg" aria-live="assertive"></p>
 <div class="mf-lock-keys">${keys.map(k=>k==='bio'?(L.bio?`<button type="button" data-lk="bio" aria-label="Usar digital ou rosto"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg></button>`:'<span></span>'):k==='del'?'<button type="button" data-lk="del" aria-label="Apagar">⌫</button>':`<button type="button" data-lk="${k}">${k}</button>`).join('')}</div>
 <button type="button" class="mf-lock-forgot" data-lk="forgot">Esqueci o PIN</button></div>`;
 document.body.appendChild(w);let pin='',busy=false;const dots=[...w.querySelectorAll('.mf-lock-dots i')],msg=w.querySelector('.mf-lock-msg');
 const paint=()=>dots.forEach((d,i)=>d.classList.toggle('on',i<pin.length)),say=t=>{msg.textContent=t||''};
 const wait=()=>{const f=mfLockFails(),s=Math.ceil((f.u-Date.now())/1000);return s>0?s:0};
 const tryPin=async()=>{if(busy)return;const s=wait();if(s){say(`Muitas tentativas. Espere ${s} s.`);pin='';paint();return}busy=true;
  const ok=await mfPinCheck(pin).catch(()=>false);busy=false;if(ok){mfUnlock();return}
  const f=mfLockFails();f.n=(f.n||0)+1;if(f.n%5===0)f.u=Date.now()+Math.min(300,30*Math.pow(2,f.n/5-1))*1000;try{localStorage.setItem(MF_LOCK_F,JSON.stringify(f))}catch(_){}
  w.querySelector('.mf-lock-dots').classList.remove('err');void w.offsetWidth;w.querySelector('.mf-lock-dots').classList.add('err');if(navigator.vibrate)try{navigator.vibrate(60)}catch(_){}
  pin='';paint();say(wait()?`PIN incorreto. Espere ${wait()} s.`:'PIN incorreto.')};
 const bio=async()=>{try{if(await mfBioVerify(L.bio))mfUnlock();else say('Não reconhecido. Use o PIN.')}catch(e){say('Digital indisponível agora. Use o PIN.')}};
 w.addEventListener('click',e=>{const b=e.target.closest('[data-lk]');if(!b)return;e.preventDefault();const k=b.dataset.lk;
  if(k==='bio'){bio();return}if(k==='forgot'){mfLockForgot(w);return}if(k==='del'){pin=pin.slice(0,-1);paint();say('');return}
  if(pin.length>=L.n)return;pin+=k;paint();if(pin.length===L.n)setTimeout(tryPin,90)});
 w.addEventListener('keydown',e=>{if(/^\d$/.test(e.key)&&pin.length<L.n){pin+=e.key;paint();if(pin.length===L.n)setTimeout(tryPin,90)}else if(e.key==='Backspace'){pin=pin.slice(0,-1);paint()}});
 w.tabIndex=-1;setTimeout(()=>w.focus(),30)}
/* esqueceu o PIN: confirma com a senha da conta e tira o bloqueio */
function mfLockForgot(w){const box=w.querySelector('.mf-lock-box'),em=(typeof authUser!=='undefined'&&authUser&&authUser.email)||(()=>{try{const k=Object.keys(localStorage).find(x=>/^sb-.*-auth-token$/.test(x));return k?JSON.parse(localStorage.getItem(k)).user.email:''}catch(e){return ''}})();
 if(!em){box.querySelector('.mf-lock-msg').textContent='Sem conta conectada neste aparelho: não dá para redefinir o PIN.';return}
 box.innerHTML=`<h2>Esqueci o PIN</h2><p class="mf-lock-sub">Digite a senha da conta <b>${escH(em)}</b> para tirar o bloqueio. Depois crie um PIN novo em Configurações.</p>
 <form class="mf-lock-pw"><input type="password" autocomplete="current-password" placeholder="Senha da conta" required><p class="mf-lock-msg" aria-live="assertive"></p><button type="submit" class="mfc-btn">Tirar bloqueio</button><button type="button" class="mf-lock-forgot" data-lkback="1">Voltar para o PIN</button></form>`;
 const f=box.querySelector('form'),m=box.querySelector('.mf-lock-msg');setTimeout(()=>f.querySelector('input').focus(),50);
 box.querySelector('[data-lkback]').addEventListener('click',()=>{w.remove();mfLockShow()});
 f.addEventListener('submit',async e=>{e.preventDefault();const pw=f.querySelector('input').value,bt=f.querySelector('[type=submit]');if(!pw)return;bt.disabled=true;m.textContent='Conferindo…';
  try{if(typeof supabaseClient==='undefined'||!supabaseClient)await window.mfSbReady();const {error}=await MF_DB.auth.signIn({email:em,password:pw});
   if(error){m.textContent=/invalid/i.test(error.message||'')?'Senha incorreta.':'Não foi possível conferir: '+(error.message||'erro');bt.disabled=false;return}
   mfLockSet(null);mfUnlock();mfToast('Bloqueio desativado. Crie um PIN novo em Configurações › Segurança.')}catch(_){m.textContent='Sem conexão. Tente de novo.';bt.disabled=false}})}
/* quando bloquear: ao abrir o app e ao voltar depois do tempo escolhido */
document.addEventListener('visibilitychange',()=>{const L=mfLockGet();if(!L)return;if(document.visibilityState==='hidden'){if(!window.__mfLockOn)window.__mfHiddenAt=Date.now();return}
 if(!window.__mfLockOn&&window.__mfHiddenAt&&Date.now()-window.__mfHiddenAt>=(L.t==null?60:L.t)*1000)mfLockShow()});
(function(){const go=()=>{if(window.__mfLockOn||mfLockGet()){if(!(window.crypto&&crypto.subtle)){mfUnlock();return}mfLockShow()}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go()})();
/* Configurações › Segurança: criar, trocar e desligar o PIN; digital; tempo */
function mfLockGroup(){const L=mfLockGet(),T=L?(L.t==null?60:L.t):60,chip=(v,t)=>`<button type="button" class="mfc-chip ${T===v?'on':''}" data-mflock="t:${v}">${t}</button>`;
 if(!L)return `<div class="mfc-group mfc-pad"><div class="mfc-lb">Bloqueio do app</div><p class="mfc-note" style="margin:0 0 10px">Peça um PIN (e a digital ou o rosto, se o celular tiver) para abrir o app neste aparelho. Fica guardado só aqui, não vai para a nuvem.</p><button type="button" class="mfc-btn" data-mflock="create">Criar PIN</button></div>`;
 return `<div class="mfc-group mfc-pad"><div class="mfc-lb">Bloqueio do app</div><p class="mfc-note" style="margin:0 0 10px">Ativado neste aparelho · PIN de ${L.n} números${L.bio?' · digital/rosto ligado':''}.</p>
 <div class="mfc-lb" style="margin-top:4px">Bloquear quando sair do app</div><div class="mfc-chips">${chip(0,'Na hora')}${chip(60,'Após 1 min')}${chip(300,'Após 5 min')}</div>
 <div class="mf-lock-acts">${window.__mfBioAv?`<button type="button" class="mfc-btn ghost" data-mflock="bio">${L.bio?'Desligar digital/rosto':'Usar digital/rosto'}</button>`:''}<button type="button" class="mfc-btn ghost" data-mflock="change">Trocar PIN</button><button type="button" class="mfc-btn ghost mf-danger" data-mflock="off">Desativar bloqueio</button></div></div>`}
function mfPwGroup(){return (typeof logged==='function'?logged():!!authUser)?`<div class="mfc-group mfc-pad"><div class="mfc-lb">Senha da conta</div><p class="mfc-note" style="margin:0 0 10px">Troque a senha usada para entrar no app (vale para todos os aparelhos).</p><button type="button" class="mfc-btn ghost" data-mfpw="change">Trocar senha</button></div>`:''}
mfBioOk().then(v=>{window.__mfBioAv=v});
function mfPinAsk(title,sub,onPin){mfConfirm({title,ok:'Continuar',body:`<p class="mf-cf-sub">${sub}</p><label class="mf-cf-f"><small>PIN (4 a 6 números)</small><input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" data-pin1 autocomplete="off"></label>${onPin.length>1?'<label class="mf-cf-f"><small>Repita o PIN</small><input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" data-pin2 autocomplete="off"></label>':''}<p class="mf-cf-note mf-pw-err" hidden></p>`,
 onOk:w=>{const a=w.querySelector('[data-pin1]').value.trim(),c=w.querySelector('[data-pin2]'),er=w.querySelector('.mf-pw-err'),say=t=>{er.textContent=t;er.hidden=!t};
  if(!/^\d{4,6}$/.test(a)){say('Use de 4 a 6 números.');return false}if(c&&c.value.trim()!==a){say('Os dois PINs não são iguais.');return false}
  const okb=w.querySelector('[data-cf="ok"]');Promise.resolve(onPin(a,true)).then(r=>{if(r===false){okb.disabled=false;say('PIN incorreto.');return}w.remove()});return false}});
 setTimeout(()=>{const i=document.querySelector('#mf-confirm [data-pin1]');i&&i.focus()},80)}
async function mfLockCreate(pin){const s=mfLkB64(crypto.getRandomValues(new Uint8Array(16))),old=mfLockGet()||{};mfLockSet({v:1,s,h:await mfPinHash(pin,s),n:pin.length,t:old.t==null?60:old.t,bio:old.bio||null});mfToast('PIN criado ✓ O app vai pedir o PIN ao abrir.');mfCfgOpen('seguranca')}
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-mflock],[data-mfpw]');if(!b)return;e.preventDefault();e.stopPropagation();
 if(b.dataset.mfpw){mfPwChange();return}const a=b.dataset.mflock,L=mfLockGet();
 if(!(window.crypto&&crypto.subtle)){mfToast('Este navegador não permite o bloqueio.');return}
 if(a==='create')mfPinAsk('Criar PIN','Você vai digitar esse PIN sempre que abrir o app neste aparelho.',(p,_c)=>mfLockCreate(p));
 else if(a==='change')mfPinAsk('Trocar PIN','Primeiro, digite o PIN atual.',async p=>{if(!await mfPinCheck(p))return false;setTimeout(()=>mfPinAsk('Novo PIN','Digite o novo PIN.',(n,_c)=>mfLockCreate(n)),60)});
 else if(a==='off')mfPinAsk('Desativar bloqueio','Digite o PIN atual para desativar.',async p=>{if(!await mfPinCheck(p))return false;mfLockSet(null);mfToast('Bloqueio desativado');mfCfgOpen('seguranca')});
 else if(a==='bio'&&L){if(L.bio){L.bio=null;mfLockSet(L);mfToast('Digital/rosto desligado');mfCfgOpen('seguranca');return}
  try{const id=await mfBioRegister();if(id){L.bio=id;mfLockSet(L);mfToast('Digital/rosto ligado ✓');mfCfgOpen('seguranca')}}catch(err){mfToast('Não foi possível ligar a digital neste aparelho.')}}
 else if(a&&a.startsWith('t:')&&L){L.t=+a.slice(2);mfLockSet(L);mfCfgOpen('seguranca')}},true);

/* ===== Primeiro uso: passo a passo (saldo, renda, cartão e contas fixas) ===== */
function mfOnbNeed(){return typeof authUser!=='undefined'&&!!authUser&&!S.onb&&!(S.tx||[]).length&&!mfAccs().length&&!(S.inv||[]).length&&!(S.recurring||[]).length&&!window.__onbShown}
function mfOnbOpen(){window.__onbShown=1;let st=0;const D={acc:'Conta principal',saldo:'',sal:'',dia:'5',rep:true,cartao:false,cn:'',due:'10',best:'1',fix:[{n:'',v:'',d:'10'},{n:'',v:'',d:'10'},{n:'',v:'',d:'10'}]};
 document.getElementById('mf-tr')?.remove();const w=document.createElement('div');w.id='mf-tr';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Primeiros passos');document.body.appendChild(w);
 const inp=(k,ph,extra)=>`<input data-ob="${k}" value="${escH(D[k])}" placeholder="${ph}" ${extra||''}>`;
 const steps=[
  ['Seu saldo de hoje','Quanto tem na sua conta agora? O app parte desse valor (ele não conta como receita).',`<label class="mfc-f">Nome da conta${inp('acc','Ex.: Nubank')}</label><label class="mfc-f">Saldo atual (R$)${inp('saldo','0,00','inputmode="decimal"')}</label>`],
  ['Sua renda','Seu salário (ou principal entrada) e o dia em que costuma cair.',`<div class="mf-acc-2"><label class="mfc-f">Valor (R$)${inp('sal','0,00','inputmode="decimal"')}</label><label class="mfc-f">Dia do mês${inp('dia','5','inputmode="numeric"')}</label></div><label class="mf-ob-ck"><input type="checkbox" data-obc="rep" ${D.rep?'checked':''}> Repetir todo mês</label>`],
  ['Cartão de crédito','Se usa cartão, informe o vencimento e o melhor dia de compra (fechamento).',`<label class="mf-ob-ck"><input type="checkbox" data-obc="cartao" ${D.cartao?'checked':''}> Tenho cartão de crédito</label><label class="mfc-f">Nome do cartão${inp('cn','Ex.: Inter')}</label><div class="mf-acc-2"><label class="mfc-f">Vencimento (dia)${inp('due','10','inputmode="numeric"')}</label><label class="mfc-f">Melhor dia de compra${inp('best','1','inputmode="numeric"')}</label></div>`],
  ['Contas fixas','Aluguel, internet, celular… Elas aparecem todo mês em Compromissos.',D.fix.map((f,i)=>`<div class="mf-ob-fx"><input data-obf="${i}" data-k="n" value="${escH(f.n)}" placeholder="Nome"><input data-obf="${i}" data-k="v" value="${escH(f.v)}" placeholder="R$" inputmode="decimal"><input data-obf="${i}" data-k="d" value="${escH(f.d)}" placeholder="dia" inputmode="numeric"></div>`).join('')]];
 const read=()=>{w.querySelectorAll('[data-ob]').forEach(i=>D[i.dataset.ob]=i.value);w.querySelectorAll('[data-obc]').forEach(i=>D[i.dataset.obc]=i.checked);w.querySelectorAll('[data-obf]').forEach(i=>D.fix[+i.dataset.obf][i.dataset.k]=i.value)};
 const paint=()=>{const [t,sub,body]=steps[st];w.innerHTML=`<div class="mf-cf-bg"></div><form class="mf-cf-box mf-tr-box"><small class="mu">Primeiros passos · ${st+1} de ${steps.length}</small><h3>${t}</h3><p class="mf-cf-sub">${sub}</p>${body}
  <div class="mf-ob-dots">${steps.map((_,i)=>`<i class="${i===st?'on':''}"></i>`).join('')}</div>
  <div class="mf-cf-btns"><button type="submit" class="b mf-cf-ok">${st===steps.length-1?'Concluir':'Próximo'}</button>${st?'<button type="button" class="b s" data-obb="1">Voltar</button>':''}<button type="button" class="b s" data-obx="1">Pular</button></div></form>`;
  w.querySelector('form').addEventListener('submit',e=>{e.preventDefault();read();if(st<steps.length-1){st++;paint()}else finish()})};
 const day=(x,dflt)=>Math.max(1,Math.min(28,parseInt(x,10)||dflt)),dateOf=dd=>{const [y,m]=TD.split('-').map(Number);const dt=new Date(y,m-1,dd);if(iso(dt)<TD)dt.setMonth(dt.getMonth()+1);return iso(dt)};
 const finish=()=>{const sal=mfNum(D.saldo),sv=mfNum(D.sal);S.contas=[{id:'a1',n:String(D.acc||'').trim()||'Conta principal',ini:Math.round(sal*100)/100,iniD:TD}];
  if(sv>0){const d=dateOf(day(D.dia,5));if(D.rep){const it={id:'onb_sal'+Date.now(),n:'Salário',v:Math.round(sv*100)/100,c:'Receita',g:'',s:'',t:'Pix',start:d,confirm:false,source:'onboarding'};S.recurring=S.recurring||[];S.recurring.push(it);genRecurringMonths(it,0,12)}else S.tx.push({id:'n'+Date.now(),n:'Salário',v:Math.round(sv*100)/100,d,c:'Receita',s:'',t:'',e:''})}
  if(D.cartao){const due=day(D.due,10),best=day(D.best,1);S.cardBilling=Object.assign({},S.cardBilling||{},{dueDay:due,bestDay:best});S.cards=[{id:'c1',n:String(D.cn||'').trim(),due,best}]}
  D.fix.forEach((f,i)=>{const v=mfNum(f.v),n=String(f.n||'').trim();if(!n||!(v>0))return;const it={id:'onb_fx'+Date.now()+i,n,v:Math.round(v*100)/100,c:'Contas Fixas',t:'Pix',start:dateOf(day(f.d,10)),confirm:false,source:'planned-account'};S.recurring=S.recurring||[];S.recurring.push(it);genRecurringMonths(it,0,12)});
  S.onb=1;w.remove();save();draw();mfToast('Tudo pronto ✓ Você pode mudar isso depois em Configurações.')};
 w.addEventListener('click',e=>{if(e.target.closest('[data-obx]')){e.preventDefault();S.onb=1;w.remove();save();return}if(e.target.closest('[data-obb]')){e.preventDefault();read();st=Math.max(0,st-1);paint()}});
 paint()}
(window.__mfAD=window.__mfAD||[]).push(()=>{try{if(mfOnbNeed())setTimeout(()=>{if(mfOnbNeed()&&!document.getElementById('mf-tr')&&!document.getElementById('mf-confirm'))mfOnbOpen()},700)}catch(e){}});
/* ===== Contas e saldo inicial · Transferências e resgates · Reserva ligada à caixinha =====
   Contas: S.contas=[{id,n,ini,iniD}] — o saldo inicial entra no saldo (não é receita).
   Transferência: {c:'',t:'Transf',kind:'transf',from,to} com lados 'conta:<id>' ou 'cx:<nome da caixinha>' — não é receita nem despesa.
   Caixinhas: transferências e pagamentos com "Reserva" ajustam a caixinha sozinhos (CDB: cdbAportes/cdbResgates com id adj_…). */
function mfTrLabel(t){return 'Transferência · '+mfTrSide(t.from)+' → '+mfTrSide(t.to)}
/* caixinhas: aplica transferências e o uso da Reserva sem repetir (idempotente) */
function mfSyncCx(){try{
 if(!S.reserveStamp){S.reserveStamp=Date.now();S.reserveApplied={};return}
 const stamp=S.reserveStamp,isNew=t=>{const m=/^n(\d{10,})/.exec(String(t.id||''));return !!m&&+m[1]>=stamp},want={},put=(nm,key,v,d)=>{const k=String(nm||'').toLowerCase();if(!k)return;(want[k]=want[k]||{})[key]={v:Math.round(v*100)/100,d}};
 let ra=(S.inv||[]).find(a=>/reserva\s*(de\s*)?em/i.test(a.a||''));
 (S.tx||[]).forEach(t=>{if(!t||!t.d||t.d>TD||!((+t.v||0)>0))return;
  if(t.t==='Reserva'&&isNew(t)){if(t.c==='Investimento')put(ra?ra.a:'RESERVA EM','r_'+t.id,+t.v,t.d);else if(t.c&&t.c!=='Receita')put(ra?ra.a:'RESERVA EM','r_'+t.id,-t.v,t.d)}
  if(mfIsTr(t)){if(String(t.to||'').startsWith('cx:'))put(t.to.slice(3),'t_'+t.id,+t.v,t.d);if(String(t.from||'').startsWith('cx:'))put(t.from.slice(3),'t_'+t.id+'_o',-t.v,t.d)}});
 const ap=S.cxApplied&&typeof S.cxApplied==='object'?S.cxApplied:(S.cxApplied={});
 if(!S.__cx1){Object.entries(S.reserveApplied||{}).forEach(([id,v])=>{ap['r_'+id]={a:String(ra?ra.a:'RESERVA EM').toLowerCase(),v:+v||0}});S.__cx1=1}
 if(!ra&&want['reserva em']&&Object.values(want['reserva em']).some(o=>o.v>0)){ra={a:'RESERVA EM',q:0,p:0,d:0,k:'Seguro',f:1};S.inv.push(ra)}
 let changed=false,moved=0;
 (S.inv||[]).filter(a=>a&&a.f).forEach(a=>{const k=String(a.a||'').toLowerCase(),W=want[k]||{};
  if(isCdbAsset(a)){ensureCdbData(a);const ad=(a.cdbAportes||[]).filter(x=>String(x.id||'').startsWith('adj_')),rs=(a.cdbResgates||[]).filter(x=>String(x.id||'').startsWith('adj_'));
   const nA=[],nR=[];Object.entries(W).forEach(([key,o])=>{(o.v>=0?nA:nR).push({id:'adj_'+key,v:Math.abs(o.v),d:o.d})});
   const sig=x=>JSON.stringify(x.map(y=>[y.id,y.v,y.d]).sort());
   if(sig(ad)!==sig(nA)||sig(rs)!==sig(nR)){const before=ad.reduce((s,x)=>s+x.v,0)-rs.reduce((s,x)=>s+x.v,0),after=nA.reduce((s,x)=>s+x.v,0)-nR.reduce((s,x)=>s+x.v,0);moved+=after-before;
    a.cdbAportes=(a.cdbAportes||[]).filter(x=>!String(x.id||'').startsWith('adj_')).concat(nA);a.cdbResgates=(a.cdbResgates||[]).filter(x=>!String(x.id||'').startsWith('adj_')).concat(nR);
    a.p=Math.round(((+a.cdbPrincipal||0)+a.cdbAportes.reduce((s,x)=>s+(+x.v||0),0)-mfCdbRes(a))*100)/100;changed=true}
   Object.keys(ap).forEach(key=>{if(ap[key]&&ap[key].a===k)delete ap[key]});return}
  const keys=new Set([...Object.keys(W),...Object.keys(ap).filter(key=>ap[key]&&ap[key].a===k)]);
  keys.forEach(key=>{const w=W[key]?W[key].v:0,o=ap[key]?ap[key].v:0,dl=Math.round((w-o)*100)/100;if(Math.abs(dl)>0.004){a.p=Math.round(((+a.p||0)+dl)*100)/100;moved+=dl;changed=true}if(w)ap[key]={a:k,v:w};else delete ap[key]})});
 if(changed){save();if(Math.abs(moved)>0.004&&typeof mfToast==='function')setTimeout(()=>mfToast(moved>0?`+${R(moved)} na caixinha`:`${R(Math.abs(moved))} saíram da caixinha`),50)}
}catch(e){console.warn('Caixinhas:',e)}}

/* ---------- Configurações › Contas e saldo inicial ---------- */
function mfAccView(head){const L=mfAccs(),tot=L.reduce((s,a)=>s+mfAccBal(a.id),0);
 const rows=L.length?L.map((a,i)=>`<div class="mfc-group mfc-pad mf-acc-c"><div class="mf-acc-h"><b>${escH(a.n)}</b>${i===0?'<small class="mu">principal</small>':''}<span class="${mfAccBal(a.id)>=0?'ok':'bad'}">${R(mfAccBal(a.id))}</span></div>
  <label class="mfc-f">Nome<input data-accf="n" data-accid="${a.id}" value="${escH(a.n)}" maxlength="30"></label>
  <div class="mf-acc-2"><label class="mfc-f">Saldo inicial (R$)<input data-accf="ini" data-accid="${a.id}" inputmode="decimal" value="${(+a.ini||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}"></label><label class="mfc-f">Na data<input type="date" data-accf="iniD" data-accid="${a.id}" value="${a.iniD||TD}" max="${TD}"></label></div>
  ${i>0?`<button type="button" class="mfc-btn ghost" data-accdel="${a.id}">Remover conta</button>`:''}</div>`).join('')
  :'<p class="mfc-note">Nenhuma conta ainda. Crie a sua conta principal e informe o saldo que ela tinha numa data — o app passa a calcular o saldo a partir dele.</p>';
 return head('Contas e saldo inicial')+`<p class="mfc-note">Informe quanto cada conta tinha numa data (o saldo do extrato). Esse valor entra no saldo do app, mas não conta como receita.</p>${L.length?`<div class="mfc-group mfc-pad"><div class="mf-acc-h"><b>Total nas contas</b><span class="${tot>=0?'ok':'bad'}">${R(tot)}</span></div></div>`:''}${rows}<button type="button" class="mfc-btn" data-accadd="1" style="width:100%;margin-top:6px">＋ ${L.length?'Adicionar conta':'Criar conta principal'}</button>`}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('[data-accf]'))return;const a=mfAccs().find(x=>x.id===t.dataset.accid);if(!a)return;const f=t.dataset.accf;
 if(f==='ini'){const v=mfNum(String(t.value||'0'));a.ini=Number.isFinite(v)?Math.round(v*100)/100:0}else if(f==='iniD'){a.iniD=/^\d{4}-\d{2}-\d{2}$/.test(t.value)&&t.value<=TD?t.value:TD}else a.n=String(t.value||'').trim()||a.n;save();draw();window.mfCfgRender&&mfCfgRender()},true);
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;let b;
 if(t.closest('[data-accadd]')){e.preventDefault();e.stopPropagation();S.contas=mfAccs();const n=S.contas.length;S.contas.push({id:n?'a'+Date.now().toString(36):'a1',n:n?'Conta '+(n+1):'Conta principal',ini:0,iniD:TD});save();draw();window.mfCfgRender&&mfCfgRender();return}
 if(b=t.closest('[data-accdel]')){e.preventDefault();e.stopPropagation();const id=b.dataset.accdel,main=mfAccMain();if(!confirm('Remover esta conta? Os lançamentos dela passam para a conta principal.'))return;
  S.tx.forEach(x=>{if(x.acc===id)x.acc=main;if(x.from==='conta:'+id)x.from='conta:'+main;if(x.to==='conta:'+id)x.to='conta:'+main});S.contas=mfAccs().filter(a=>a.id!==id);save();draw();window.mfCfgRender&&mfCfgRender()}},true);

/* Script 1 · 15: o saldo inicial de cada conta vira um lançamento de Receita "Saldo inicial", uma vez só (id fixo por conta).
   O saldo do app não muda (mesmo valor, mesma data). Saldo inicial negativo continua como estava: não cabe como receita. */
function mfIniToTx(){const A=mfAccs();let n=0;A.forEach(a=>{const v=Math.round((+a.ini||0)*100)/100;if(!(v>0.004))return;const id='saldo_ini_'+a.id,d=a.iniD||'2000-01-01',old=S.tx.find(t=>t.id===id);
 if(old){old.v=v;old.d=d}else S.tx.push({id,n:'Saldo inicial'+(A.length>1?' · '+a.n:''),v,e:'',d,c:'Receita',s:'Saldo inicial',t:'',acc:a.id,saldoIni:1});
 a.ini=0;a.iniTx=id;n++});return n}
(window.__mfPre=window.__mfPre||[]).push(function(){try{if(mfIniToTx())save()}catch(e){console.warn('saldo inicial',e)}});
/* Saldo inicial negativo oculto: a opção saiu da tela, mas o valor continuava na conta e entrava no "Dinheiro" do Dashboard.
   Zera uma vez só (flag em S.lay) e guarda o valor antigo em S.iniBak para poder desfazer. Nenhum lançamento é tocado. */
window.__mfPre.push(function(){try{const L=S.lay||(S.lay={});if(L.__ini0)return;L.__ini0=1;const bak=[];(S.contas||[]).forEach(a=>{if(a&&Math.abs(+a.ini||0)>0.004){bak.push({id:a.id,ini:a.ini,iniD:a.iniD||''});a.ini=0}});if(bak.length)S.iniBak=(S.iniBak||[]).concat(bak);save()}catch(e){console.warn('saldo inicial oculto',e)}});
/* ---------- Transferência ou resgate (janela) ---------- */
function mfTrOpts(sel){const A=mfAccs(),acc=(A.length?A:[{id:'a1',n:'Conta principal'}]).map(a=>[`conta:${a.id}`,a.n]),cx=mfCxList().map(n=>[`cx:${n}`,n+' (caixinha)']);return acc.concat(cx).map(([v,t])=>`<option value="${escH(v)}" ${v===sel?'selected':''}>${escH(t)}</option>`).join('')}
function mfCxList(){return (S.inv||[]).filter(a=>a&&a.f).map(a=>String(a.a))}
function mfTrOpen(id){if(id){const tv=S.tx.find(x=>x.id===id);if(tv&&tv.venda){const vd=mfVendas().find(x=>x.id===tv.venda);mfConfirm({title:tv.n,ok:'Desfazer venda',cancel:'Fechar',body:vd?`<p class="mf-cf-sub">${vd.d.split('-').reverse().join('/')} · ${vd.q.toLocaleString('pt-BR')} × ${R(vd.p)} · preço médio ${R(vd.pm)}</p><div class="mf-cf-v">${R(vd.v)}</div><small class="mf-cf-s">${vd.lucro>=0?'Lucro':'Prejuízo'}: ${R(Math.abs(vd.lucro))}. Desfazer devolve as cotas à carteira.</small>`:'',onOk:()=>mfVendaUndo(tv.venda)});return}}const t=id?S.tx.find(x=>x.id===id):null,main='conta:'+mfAccMain(),cx=mfCxList()[0];
 document.getElementById('mf-tr')?.remove();const w=document.createElement('div');w.id='mf-tr';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Transferência');
 w.innerHTML=`<div class="mf-cf-bg" data-trx="1"></div><form class="mf-cf-box mf-tr-box"><h3>${t?'Editar transferência':'Transferência ou resgate'}</h3><p class="mf-cf-sub">Dinheiro mudando de lugar: não conta como receita nem como despesa.</p>
 <label class="mfc-f">Valor (R$)<input name="v" inputmode="decimal" required value="${t?(+t.v).toLocaleString('pt-BR',{minimumFractionDigits:2}):''}" placeholder="0,00"></label>
 <div class="mf-acc-2"><label class="mfc-f">De<select name="from">${mfTrOpts(t?t.from:(cx?'cx:'+cx:main))}</select></label><label class="mfc-f">Para<select name="to">${mfTrOpts(t?t.to:main)}</select></label></div>
 <div class="mf-acc-2"><label class="mfc-f">Data<input type="date" name="d" value="${t?t.d:TD}" required></label><label class="mfc-f">Descrição<input name="n" maxlength="60" value="${t?escH(t.n||''):''}" placeholder="Ex.: Resgate da caixinha"></label></div>
 <div class="mf-cf-btns"><button type="submit" class="b mf-cf-ok">${t?'Salvar':'Transferir'}</button>${t?'<button type="button" class="b s" data-trdel="1">Excluir</button>':''}<button type="button" class="b s" data-trx="1">Cancelar</button></div></form>`;
 document.body.appendChild(w);
 w.addEventListener('click',e=>{if(e.target.closest('[data-trx]')){e.preventDefault();w.remove();return}if(e.target.closest('[data-trdel]')){e.preventDefault();if(!confirm('Excluir esta transferência?'))return;ensureTools();S.trash.push({...t,deletedAt:TD});S.tx=S.tx.filter(x=>x.id!==t.id);w.remove();save();draw();return}});
 w.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target),v=mfNum(String(f.get('v')||'')),from=String(f.get('from')),to=String(f.get('to'));
  if(!(v>0)){mfToast('Informe um valor maior que zero.');return}if(from===to){mfToast('Escolha origem e destino diferentes.');return}
  const row={n:String(f.get('n')||'').trim()||(from.startsWith('cx:')?'Resgate · '+from.slice(3):to.startsWith('cx:')?'Aplicação · '+to.slice(3):'Transferência'),v:Math.round(v*100)/100,d:String(f.get('d')||TD),c:'',t:'Transf',kind:'transf',from,to,e:''};
  if(t)Object.assign(t,row);else S.tx.push(Object.assign({id:'n'+Date.now()},row));w.remove();save();draw();mfToast(t?'Transferência salva ✓':'Transferência registrada ✓')})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mftr]');if(!b)return;e.preventDefault();e.stopPropagation();mfTrOpen()},true);

/* Pagamento de fatura = quitação de dívida (tipo pagamento_fatura): não é despesa e não mexe no saldo.
   A fatura sai do saldo UMA vez, na data de vencimento, paga ou não: valor = maior entre o total da fatura e o que foi pago. */
function invClass(a){const n=String(a.a||'').toUpperCase();if(/RESERVA/i.test(n))return 'reserve';if(a.f||/CDB|TESOURO|LCI|LCA|LIG|RENDA FIXA/i.test(n))return 'fixed';if(/^(GPCA11|IVVB11|BOVA11|SMAL11|DIVO11|NASD11|HASH11|XINA11)$/i.test(n))return 'etf';if(/11$/.test(n)&&n!=='BRBI11')return 'fii';return 'stocks'}
const nm=(k,n)=>{let[y,m]=k.split('-').map(Number);m+=n;while(m<1){m+=12;y--}while(m>12){m-=12;y++}return mk(y,m)};
const MESF=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],lab=k=>MESF[+k.slice(5)-1]+' de '+k.slice(0,4);
const bars=a=>{const mx=Math.max(1,...a.map(i=>i[1]));return a.map(([n,v,c])=>`<div class=br><span style="color:${c};font-weight:600">${n}</span><i style="width:${Math.max(0,v)/mx*100}%;background:${c}"></i><b>${R(v)}</b></div>`).join('')};
const mnav=()=>`<div class=mn><button data-m=-1 aria-label="Mês anterior">‹</button><b>${lab(ym)}</b><button data-m=1 aria-label="Próximo mês">›</button></div>`;

const sv=x=>`<svg viewBox="0 0 360 170" style="width:100%;height:auto;display:block">${x}</svg>`,
cx=i=>28+(i+.5)*27.33,
ax=mx=>[0,.5,1].map(f=>`<line x1=28 x2=356 y1=${140-f*120} y2=${140-f*120} stroke="var(--ln)"/><text x=24 y=${143-f*120} text-anchor=end font-size=8 fill="var(--mu)">${Math.round(mx*f)}</text>`).join('')+MES.map((n,i)=>`<text x=${cx(i)} y=154 text-anchor=middle font-size=8 fill="var(--mu)">${n}</text>`).join(''),
lg=a=>`<div class=lg>${a.map(([n,c])=>`<span><i style="background:${c}"></i>${n}</span>`).join('')}</div>`,
rc=(x,v,mx,w,c,t)=>`<rect x=${x} y=${140-Math.max(0,v)/mx*120} width=${w} height=${Math.max(0,v)/mx*120} fill="${c}" rx=1.5><title>${t}: ${R(v)}</title></rect>`;
function donut(a,co){
  const active=CATS.filter(c=>a.cat[c]>0);
  const T=active.reduce((s,c)=>s+a.cat[c],0)||0;
  const C=2*Math.PI*40; let o=0;
  const seg=active.map(c=>{
    const d=T?a.cat[c]/T*C:0;
    const x=`<circle cx=60 cy=60 r=40 fill=none stroke="${COL[c]}" stroke-width=18 stroke-dasharray="${d} ${C-d}" stroke-dashoffset="${-o}" transform="rotate(-90 60 60)"><title>${c}: ${R(a.cat[c])}</title></circle>`;
    o+=d; return x;
  }).join('');
  return `<h2>Para onde foi</h2><div class=c>
    <svg viewBox="0 0 120 120" style="display:block;margin:0 auto;width:150px;height:150px">
      <circle cx=60 cy=60 r=40 fill=none stroke="var(--ln)" stroke-width=18 />${seg}
      <text x=60 y=57 text-anchor=middle font-size=9 fill="var(--mu)">Total</text>
      <text x=60 y=70 text-anchor=middle font-size=11 font-weight=700 fill="var(--tx)">${R(T)}</text>
    </svg>
    <div style="margin-top:12px">
      ${active.map(c=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--ln)">
        <span style="color:${COL[c]};font-weight:600">● ${c}</span>
        <span><b>${R(a.cat[c])}</b> <span class=mu style="font-size:12px">${T?Math.round(a.cat[c]/T*100):0}%</span></span>
      </div>`).join('')||'<div class=mu>Nenhum gasto categorizado neste mês.</div>'}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--ln)">
      <span style="font-weight:700">Saldo livre<br><small class=mu style="font-weight:400">entrou − saiu no mês</small></span>
      <b class="${a.rec-co<0?'bad':'ok'}" style="font-size:17px">${R(a.rec-co)}</b>
    </div>
  </div>`;
}
const WIDE=['c_sal','c_res'],K=(id,t,v,col,subs,x)=>B(id)+`<div class=k${id==='c_inv'?' dashboard-invested-month-card':''}${WIDE.includes(id)?' style="grid-column:1/-1"':''}> ${x?`<div style="display:flex;gap:12px;align-items:${id=='c_sal'?'flex-start':'center'}"><div style="flex:1;min-width:0">`:''}<small>${t}</small><b style="color:${col}">${v}</b>${subs.filter(Boolean).map(q=>`<small>${q}</small>`).join('')}${x?`</div><div style="width:44%;flex:none">${x}</div></div>`:''}</div>`,
 dm=d=>d.slice(8)+'/'+d.slice(5,7)+'/'+d.slice(0,4);

function snapRes(){const ra=S.inv.find(a=>/reserva\s*(de\s*)?em/i.test(a.a));if(!ra)return;const v=ra.f?+ra.p||0:(+ra.q||0)*(+ra.p||0),rh=S.rh=S.rh||{},cur=TD.slice(0,7),ks=Object.keys(rh).sort();let c=false;if(ks.length){let k=ks[ks.length-1];while(k<cur){k=nm(k,1);if(k<cur&&rh[k]==null){rh[k]=rh[nm(k,-1)];c=true}}}if(rh[cur]!==v){rh[cur]=v;c=true}if(c)save()}



let dashChartMonths=6;
let dashCalDay='';

const MF_RULES=[['503020','50/30/20',[50,30,20]],['603010','60/30/10',[60,30,10]],['702010','70/20/10',[70,20,10]],['403030','40/30/30',[40,30,30]],['custom','Personalizada',null]];
const MF_BG_NOMES=['Essencial','Não essencial','Investimentos'];
/* Script 1 · 16: além dos percentuais, dá para trocar o nome de cada grupo e fixar o limite em reais (0 = usar a % da renda). */
function mfRule(){const r=S.budgetRule||{},p=MF_RULES.find(x=>x[0]===r.k)||MF_RULES[0];const v=p[2]||[+r.p?.[0]||0,+r.p?.[1]||0,+r.p?.[2]||0];
 const nomes=MF_BG_NOMES.map((d,i)=>String(((r.n||[])[i])||'').trim().slice(0,22)||d);
 const lim=[0,1,2].map(i=>Math.max(0,Math.round((+((r.lim||[])[i])||0)*100)/100));
 return {k:p[0],nome:v.join('/'),p:v,f:v.map(x=>x/100),soma:v[0]+v[1]+v[2],nomes,lim}}
function mfRuleCfg(){const r=mfRule(),c=r.k==='custom';return `<details class="iv-edit mf-rule-cfg" ${window.__brEdit?'open':''}><summary>Configurar</summary><div class="iv-fields" style="grid-template-columns:1fr"><label class="iv-meta-l">Regra de orçamento<select data-br-rule>${MF_RULES.map(x=>`<option value="${x[0]}" ${x[0]===r.k?'selected':''}>${x[1]}</option>`).join('')}</select></label></div>${c?`<div class="iv-fields" style="grid-template-columns:1fr 1fr 1fr">${[0,1,2].map(i=>`<label class="iv-meta-l">${escH(r.nomes[i])} %<input type="text" inputmode="numeric" value="${r.p[i]}" data-br-p="${i}"></label>`).join('')}</div><div class="iv-sub ${r.soma!==100?'bad':''}">Soma: ${r.soma}%${r.soma!==100?' (deve dar 100%)':''}</div>`:''}
 <div class="iv-sub" style="margin-top:8px">Nome e limite de cada grupo (deixe o limite em branco para usar a % da sua renda)</div>
 ${[0,1,2].map(i=>`<div class="iv-fields mf-br-g" style="grid-template-columns:1.4fr 1fr"><label class="iv-meta-l">Nome<input type="text" maxlength="22" value="${escH(r.nomes[i])}" placeholder="${escH(MF_BG_NOMES[i])}" data-br-n="${i}"></label><label class="iv-meta-l">Limite (R$)<input type="text" inputmode="decimal" value="${r.lim[i]>0?mfMoney(r.lim[i]):''}" placeholder="% da renda" data-br-l="${i}"></label></div>`).join('')}</details>`}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches)return;if(t.matches('[data-br-rule]')){const o=S.budgetRule||{};S.budgetRule=Object.assign({},o,{k:t.value,p:t.value==='custom'?(o.p||mfRule().p):o.p});window.__brEdit=true;save();draw();return}
 if(t.matches('[data-br-p]')){const r=mfRule(),p=r.p.slice();p[+t.dataset.brP]=Math.max(0,Math.min(100,Math.round(+String(t.value).replace(',','.')||0)));S.budgetRule=Object.assign({},S.budgetRule||{},{k:'custom',p});window.__brEdit=true;save();draw();return}
 if(t.matches('[data-br-n]')){const o=S.budgetRule||{},n=(o.n||[]).slice();n[+t.dataset.brN]=String(t.value||'').trim().slice(0,22);S.budgetRule=Object.assign({},o,{n});window.__brEdit=true;save();draw();return}
 if(t.matches('[data-br-l]')){const o=S.budgetRule||{},L=(o.lim||[]).slice(),v=String(t.value||'').trim();L[+t.dataset.brL]=v?Math.max(0,mfNum(v)):0;S.budgetRule=Object.assign({},o,{lim:L});window.__brEdit=true;save();draw();return}},true);
document.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('mf-rule-cfg'))window.__brEdit=e.target.open},true);

function dashboardCalendar(){
 const [yy,mmn]=ym.split('-').map(Number),first=new Date(yy,mmn-1,1),days=new Date(yy,mmn,0).getDate(),offset=((S.prefs||{}).weekStart==='dom'?first.getDay():(first.getDay()+6)%7),prevDays=new Date(yy,mmn-1,0).getDate();
 const evs=[...S.tx,...autos()].filter(t=>t.d&&t.d.slice(0,7)===ym&&t.c!=='Investimento'&&t.t!=='Reserva'&&!isVR(t)&&!mfIsProvCx(t)).map(t=>({...t,kind:t.c==='Receita'?'Receita':t.pendingConfirm?'A confirmar':t.t==='Fatura'?'Fatura':t.autoRecurring?'Recorrente':t.t==='Crédito'?'Crédito/ parcela':'Despesa'}));
 const byDay={};evs.forEach(t=>{const d=+t.d.slice(8);(byDay[d]||(byDay[d]=[])).push(t)});
 const today=TD.slice(0,7)===ym?+TD.slice(8):0,selected=dashCalDay&&dashCalDay.slice(0,7)===ym?+dashCalDay.slice(8):0;
 let cells='';for(let i=0;i<offset;i++){const d=prevDays-offset+i+1;cells+=`<div class="dash-calendar-day muted" aria-hidden="true">${d}</div>`}
 for(let d=1;d<=days;d++){const date=ym+'-'+String(d).padStart(2,'0'),items=byDay[d]||[],hasInc=items.some(x=>x.c==='Receita'),hasExp=items.some(x=>x.c!=='Receita'&&!mfIsTr(x)&&!(isInvoicePayment(x)&&!x.auto));cells+=`<button class="dash-calendar-day ${d===selected?'selected':''} ${d===today?'today':''}" data-calday="${date}" aria-label="${date}, ${items.length} compromissos"><span>${d}</span><span class="dash-calendar-dots">${hasInc?'<i style="background:var(--ok)"></i>':''}${hasExp?'<i style="background:var(--bad)"></i>':''}${items.some(x=>x.pendingConfirm)?'<i style="background:var(--wa)"></i>':''}</span></button>`}
 const used=(offset+days)%7;if(used)for(let d=1;d<=7-used;d++)cells+=`<div class="dash-calendar-day muted" aria-hidden="true">${d}</div>`;
 const items=(byDay[selected]||[]).sort((a,b)=>a.d.localeCompare(b.d)),dayIncome=items.filter(t=>t.c==='Receita').reduce((a,t)=>a+(+t.v||0),0),dayExpense=items.filter(t=>t.c!=='Receita').reduce((a,t)=>a+(+t.v||0),0);
 return `${B('calendar')}<section class="dash-calendar"><div class="dash-section-head"><div><span class="dash-section-kicker">AGENDA FINANCEIRA</span><h2>Calendário</h2><p class="mu" style="font-size:10px;margin:5px 0 0">Selecione um dia para ver lançamentos, contas e faturas.</p></div></div><div class="dash-calendar-grid">${((S.prefs||{}).weekStart==='dom'?['DOM','SEG','TER','QUA','QUI','SEX','SÁB']:['SEG','TER','QUA','QUI','SEX','SÁB','DOM']).map(x=>`<div class="dash-calendar-weekday">${x}</div>`).join('')}${cells}</div><div class="dash-history-legend" style="justify-content:flex-start;margin:9px 0 0"><span><i style="background:var(--ok)"></i>Receita</span><span><i style="background:var(--bad)"></i>Despesa/fatura</span><span><i style="background:var(--wa)"></i>A confirmar</span></div>${selected?`<div class="dash-calendar-events"><h3>${String(selected).padStart(2,'0')} de ${lab(ym).toLowerCase()}</h3>${items.length?items.map(t=>{const tr=mfIsTr(t),pf=tr||isInvoicePayment(t)&&!t.auto;return `<div class="dash-list-row"><span class="dash-transaction-icon ${t.c==='Receita'?'income':pf?'':'expense'}">${t.c==='Receita'?'↙':pf?'✓':'↗'}</span><div class="dash-list-main"><b>${escH(t.n||t.c||t.kind)}</b><small>${escH(tr?mfTrLabel(t):pf?'Pagamento de fatura · não é despesa':t.kind)}${t.pendingConfirm?' · aguardando confirmação':''}</small></div><b class="${t.c==='Receita'?'ok':pf?'mu':'bad'}">${t.c==='Receita'?'+':'−'}${R(t.v)}</b></div>`}).join(''):'<div class="dash-empty">Nenhum compromisso registrado para este dia.</div>'}</div>`:''}</section>`;
}

function dashboardCashflow(){
 const days=[7,30,90].includes(+(S.cashflowHorizon||30))?+(S.cashflowHorizon||30):30,end=addDaysISO(TD,days),opening=cashBalanceAt(TD);
 const txFuture=S.tx.filter(t=>t.d>TD&&t.d<=end&&t.t!=='Crédito'&&!isVR(t)&&!isInvoicePayment(t)&&!mfIsProvCx(t));
 let income=0,outflow=0;const events=[];
 txFuture.forEach(t=>{if(mfIsTr(t)){const c=mfTrCash(t);if(c>0)income+=c;else if(c<0)outflow-=c;return}const v=txValue(t),inc=t.c==='Receita'&&!isInvoicePayment(t);if(inc)income+=v;else outflow+=v;events.push({...t,kind:inc?'Entrada':isInvoicePayment(t)?'Pagamento de fatura':t.t==='Reserva'?'Transferência para reserva':t.c==='Investimento'?'Aporte previsto':'Saída prevista',amount:v,income:inc})});
 const invs=mfFatOut().filter(t=>t.d>TD&&t.d<=end);invs.forEach(t=>{outflow+=txValue(t);events.push({...t,kind:'Fatura do cartão',amount:txValue(t),income:false})});
 const projected=opening+income-outflow,sorted=events.sort((a,b)=>a.d.localeCompare(b.d)).slice(0,3);
 return `${B('cashflow')}<section class="dash-cashflow"><div class="dash-section-head"><div><h2>Fluxo de caixa</h2></div><button class="dash-text-btn" data-tab="mais">Contas ↗</button></div><div class="dash-period">${[7,30,90].map(n=>`<button data-cashflow-days="${n}" class="${days===n?'active':''}">${n} dias</button>`).join('')}</div><div class="dash-cashflow-main"><div class="dash-cashflow-balance-copy"><small>Saldo previsto em ${days} dias</small><span>Hoje: ${R(opening)}</span></div><b class="${projected<0?'bad':'ok'}">${R(projected)}</b></div><div class="dash-cashflow-summary"><div><small>Entradas previstas</small><b class="ok">+${R(income)}</b></div><div><small>Saídas previstas</small><b class="bad">−${R(outflow)}</b></div></div><div style="margin-top:12px;padding:10px 12px;border-radius:10px;background:${projected<0?'rgba(239,68,68,.09)':'var(--sf2,rgba(127,127,127,.07))'};border:1px solid ${projected<0?'rgba(239,68,68,.25)':'var(--ln)'};font-size:11px"><b>${projected<0?'Atenção: saldo projetado negativo':'Projeção do período'}</b><div class="mu" style="margin-top:3px">${projected<0?'Faltariam '+R(Math.abs(projected))+' se os lançamentos cadastrados se confirmarem.':'Após as movimentações previstas, a estimativa é de '+R(projected)+'.'}</div></div>${(()=>{const G=mfDupRecGroups();return G.length?`<p class="mf-dup-cf" role="note">⚠ ${G.length===1?escH(G[0].n)+' parece estar cadastrado':G.length+' contas parecem estar cadastradas'} duas vezes (recorrente repetido): a projeção pode estar contando em dobro. <button type="button" class="dash-text-btn" data-tab="add">Ver em Lançamentos ↗</button></p>`:''})()}<p class="dash-networth-note">Estimativa com base nos lançamentos.</p></section>`;
}


function vResumoBase(){const[y,m]=ym.split('-').map(Number),a=mm(y,m),ra=S.inv.find(a=>/reserva\s*(de\s*)?em/i.test(a.a)),rs=ra?(ra.f?+ra.p||0:(+ra.q||0)*(+ra.p||0)):0,cm=+S.sim.custo||0,mt=+S.sim.meses||0,mi=(((S.orc||{}).grupos||[]).find(g=>/invest/i.test(g.n))||{}).i,L=led(),im=L.filter(t=>!t.fo&&!t.ini&&t.d.slice(0,7)==ym),sm=f=>im.filter(f).reduce((s,t)=>s+t.v,0),co=sm(t=>t.c&&t.c!=='Receita'&&t.t!=='Crédito'&&t.t!=='Fatura'&&t.t!=='Reserva'&&t.t!=='VR'&&!isInvoicePayment(t)),vr=S.tx.filter(t=>t.d<=TD).reduce((s,t)=>s+(t.c==='Receita'?(isVR(t)?t.v:0):t.t==='VR'?-t.v:0),0),fp=sm(t=>t.t==='Fatura'),hoje=L.filter(t=>t.d<=TD).pop();
 const rc=im.filter(t=>t.c==='Receita'),pv=nm(ym,-1),nx=nm(ym,1),pa=mm(...pv.split('-').map(Number)).tp['Crédito'],fv=mfFatvEffAll(ym)??a.tp['Crédito'],cr=im.filter(t=>t.t==='Crédito'&&t.c&&t.c!=='Receita'),dias=Math.round((new Date(nx+'-10')-new Date(TD))/864e5),ap=ev(S.ap.v)||0;
 const ru=S.tx.filter(t=>t.t==='Reserva'&&t.v>0),rum=ru.filter(t=>t.d.slice(0,7)==ym).reduce((s,t)=>s+t.v,0),rl=[...ru].sort((x,z)=>x.d<z.d?1:-1)[0],pn=MESF[+pv.slice(5)-1].toLowerCase(),saldo=(hoje?hoje.s:0)+vr,ult=L.filter(t=>!t.fo&&!t.ini&&t.d.slice(0,7)==ym).sort((x,z)=>x.d<z.d?1:-1).slice(0,3);
 const proximas=L.filter(t=>!t.fo&&!t.ini&&t.d>TD&&t.d.slice(0,7)<=nm(TD.slice(0,7),1)&&t.c!=='Receita'&&t.t!=='Crédito'&&t.t!=='Reserva'&&!isVR(t)).sort((x,z)=>x.d<z.d?-1:1).slice(0,3);
 return dashboardCashflow()+((window.mfIsDesk&&mfIsDesk())?mfDashBars():'')+B('d_cat')+dashboardCategoryBreakdown()+B('d_eco')+dashboardSavingsRate()+
 B('c_sal')+`<div class="k dash-balance" style="grid-column:1/-1"><div class="dash-balance-top"><div><small>${window.mfIsDesk&&mfIsDesk()?'Saldo disponível hoje':'Saldo atual'}</small><div class="dash-balance-value">${R(saldo)}</div></div><span class="dash-balance-icon">↗</span>${window.mfIsDesk&&mfIsDesk()?'':mfEyeHtml()}</div><div class="dash-balance-meta"><span>Dinheiro <b>${R(hoje?hoje.s:0)}</b></span><span>Vale-refeição <b>${R(vr)}</b></span></div>${diaria()}</div>`+
 K('c_ent','Receitas do mês',R(a.rec),'#48a8ff',[`Entradas registradas`])+K('c_sai','Despesas do mês',R(co),'var(--bad)',[`Gastos: ${R(co-fp)}`,`Fatura lançada: ${R(fp)}`])+K('c_inv','Investido no mês',R(a.cat.Investimento),'var(--wa)',[`Aporte: ${R(ap)}`,a.rec?`${Math.round(a.cat.Investimento/a.rec*100)}% da renda`+(mi!=null?` · meta ${Math.round(mi*100)}%`:''):'sem entrada no mês'])+K('c_fat','Fatura do cartão',R(fv),'var(--bad)',[`Vencimento 10/${nx.slice(5)} · ${dias>0?'em '+dias+(dias==1?' dia':' dias'):dias==0?'hoje':'há '+(-dias)+' dias'}`])
 }






function dd(){const[y,m]=ym.split('-').map(Number),l=new Date(y,m,0).getDate();return ym===TD.slice(0,7)?TD:ym+'-'+String(Math.min(+TD.slice(8),l)).padStart(2,'0')}
const ip=(p,i,k,v,t='n')=>`<input data-p="${p}" data-i="${i}" data-k="${k}" data-t="${t}" ${t=='m'?`type=text inputmode=decimal data-raw="${String(v??0).replace(/"/g,'')}"`:t=='n'?'type=text inputmode=decimal':'type=text'} value="${(t=='m'?R(ev(v)||0):String(v??'')).replace(/"/g,'&quot;')}">`;
const sem=(x,m)=>x<=m?'🟢':x<=m+.01?'🟡':'🔴';
/* ===== Planejamento: projeção compacta, simulador de metas (caixinhas) e simulação de gastos ===== */
function plNum(t){t=String(t==null?'':t).replace(/R\$/gi,'').replace(/\s/g,'');if(!t)return 0;let x;if(/,/.test(t))x=parseFloat(t.replace(/\./g,'').replace(',','.'));else if(/^\d{1,3}(\.\d{3})+$/.test(t))x=parseFloat(t.replace(/\./g,''));else x=parseFloat(t);return Number.isFinite(x)?x:0}
function plFmt(v){return v?String(Math.round(v*100)/100).replace('.',','):''}
function plSave(){save();draw()}
function plParseGasto(txt){const m=String(txt||'').trim().match(/^(.*?)[\s\-–—:=]*(?:R\$\s*)?(\d[\d.,]*)\s*(?:reais|real|r\$)?\s*$/i);if(!m)return null;const v=plNum(m[2]);if(!(v>0))return null;let n=m[1].replace(/[\s\-–—:=]+$/,'').replace(/R\$\s*$/i,'').trim();n=n?n.charAt(0).toUpperCase()+n.slice(1):'Gasto';return {n,v}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.pl===undefined)return;const P=plEnsure(),p=t.dataset.pl.split('.');
 if(p[0]==='proj'){P.proj[p[1]]=plNum(t.value)}else if(p[0]==='gasto'){P.gasto.sal=plNum(t.value)}else if(p[0]==='meta'){const c=P.metas[+p[1]];if(!c)return;if(p[2]==='base'){if(String(t.value).trim()==='')delete c.base;else c.base=plNum(t.value)}else c[p[2]]=plNum(t.value)}
 plSave()});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='pl-g'){e.preventDefault();plAct('gasto-add')}});
function plAct(a,i){const P=plEnsure(),val=id=>(document.getElementById(id)||{}).value||'';
 if(a==='meta-add'){const n=val('pl-n').trim(),meta=plNum(val('pl-meta'));if(!n||!(meta>0)){if(typeof mfToast==='function')mfToast('Informe o nome e a meta da caixinha.');return}const b=val('pl-base').trim();P.metas.push({id:Date.now(),n,meta,aporte:plNum(val('pl-ap')),taxa:plNum(val('pl-tx')),...(b===''?{}:{base:plNum(b)}),aportes:[]});plSave()}
 else if(a==='meta-del'){if(confirm('Remover esta caixinha?')){P.metas.splice(i,1);window.__plAp=-1;plSave()}}
 else if(a==='ap-open'){window.__plAp=i;draw()}
 else if(a==='ap-cancel'){window.__plAp=-1;draw()}
 else if(a==='ap-save'){const v=plNum(val('pl-apv'));if(!(v>0))return;const c=P.metas[i];if(!c)return;c.aportes=c.aportes||[];c.aportes.push({d:TD,v});window.__plAp=-1;plSave()}
 else if(a==='ap-undo'){const c=P.metas[i];if(c&&c.aportes&&c.aportes.length){c.aportes.pop();plSave()}}
 else if(a==='gasto-add'){const r=plParseGasto(val('pl-g'));if(!r){if(typeof mfToast==='function')mfToast('Use o formato: nome - valor (ex.: aluguel - 1000)');return}P.gasto.itens.push(r);plSave()}
 else if(a==='gasto-del'){P.gasto.itens.splice(i,1);plSave()}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-plact]');if(!b)return;if(document.body.classList.contains('org-on'))return;e.preventDefault();e.stopPropagation();plAct(b.dataset.plact,b.dataset.pli===undefined?undefined:+b.dataset.pli)},true);

const ETFx=/^(GPCA11|IVVB11|BOVA11|SMAL11|DIVO11|NASD11|HASH11|XINA11)$/i,fcl=a=>/reserva/i.test(a.a)||a.f?'rf':ETFx.test(a.a)?'etf':(/11$/i.test(a.a)&&!/^BRBI11$/i.test(a.a))?'fii':'acao';
function ord(I){const tt=a=>a.f?+a.p||0:(+a.q||0)*(+a.p||0),n=(g)=>(x,y)=>g(y[0])-g(x[0]),f={tot:n(tt),totm:(x,y)=>tt(x[0])-tt(y[0]),q:n(a=>+a.q||0),qm:(x,y)=>(+x[0].q||0)-(+y[0].q||0),p:n(a=>+a.p||0),d:n(a=>+a.d||0),az:(x,y)=>x[0].a.localeCompare(y[0].a)}[F.ord||''],r=I.map((a,i)=>[a,i]).filter(([a])=>!F.fil||fcl(a)==F.fil);return f?r.sort(f):r}
const xb=k=>`<button class="b s" style="padding:4px 10px;width:auto${F.del==k?';background:var(--bad);color:#fff':''}" data-rmi="${k}">${F.del==k?'Apagar?':'✕'}</button>`;
const pie=ps=>{const T=ps.reduce((s,p)=>s+p[1],0)||1,C=2*Math.PI*20;let o=0;return `<svg viewBox="0 0 120 120" style="display:block;margin:0 auto;width:150px;height:150px"><g transform="rotate(-90 60 60)">${ps.map(([n,v,c])=>{const d=v/T*C,x=`<circle cx=60 cy=60 r=20 fill=none stroke="${c}" stroke-width=40 stroke-dasharray="${d} ${C-d}" stroke-dashoffset="${-o}"><title>${n}: ${R(v)}</title></circle>`;o+=d;return x}).join('')}</g></svg>`},
 PCO=['#6c8cff','#f5a623','#2fbf8f','#e86a92','#8a6cf0'];
function cxResumo(){if(!S.cx||!S.cxc)cdiBlock();const cdi=(+(S.cxc&&S.cxc.cdi)||0)/100,T0=new Date(TD+'T12:00:00');let br=0,ok=false,mensal=0;(S.cx||[]).forEach(c=>{const v=+c.v||0,pct=(+c.tx||0)/100;if(!(cdi>0&&pct>0&&v>0))return;const d1=Math.pow(1+cdi,1/252)-1;mensal+=v*(Math.pow(1+d1*pct,21)-1);if(c.d){const dias=Math.max(0,Math.round((T0-new Date(c.d+'T12:00:00'))/864e5));br+=v*(Math.pow(1+d1*pct,Math.round(dias*252/365))-1);ok=true}});return{br,ok,mensal,cdi}}
function cdiBlock(){
  if(!S.cx)S.cx=S.inv.filter(a=>a.f&&/cdb|caixinha/i.test(a.a)&&!/reserva/i.test(a.a)).map(a=>{
    const m=a.a.match(/(\d{2,3}(?:[.,]\d+)?)\s*%/);
    return{n:a.a,v:+(a.ap>0?a.ap:a.p)||0,tx:m?parseFloat(m[1].replace(',','.')):100,d:''};
  });
  S.cxc=S.cxc||{cdi:(S.rf&&+S.rf.cdi)||0};
  const cdi=(+S.cxc.cdi||0)/100;
  const T0=new Date(TD+'T12:00:00');
  const dd=c=>c.d?Math.max(0,Math.round((T0-new Date(c.d+'T12:00:00'))/864e5)):null;
  let tA=0,tS=0,tL=0,tB=0,falta=false;

  const cards=S.cx.map((c,i)=>{
    const dias=dd(c), pct=(+c.tx||0)/100, v=+c.v||0;
    const ok=cdi>0&&dias!=null&&pct>0;
    if(dias==null)falta=true;
    let br=0,liq=0;
    if(ok){
      const du=Math.round(dias*252/365);
      const f=Math.pow(1+(Math.pow(1+cdi,1/252)-1)*pct,du);
      br=v*(f-1);
      const io=br*iofT(dias), ir=(br-io)*IRR(dias);
      liq=v+br-io-ir;
      tA+=v; tB+=br; tS+=v+br; tL+=liq;
    }
    return `<div style="padding:14px 0;${i<S.cx.length-1?'border-bottom:1px solid var(--ln)':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">
        <input data-p="cx" data-i="${i}" data-k="n" data-t="t" value="${String(c.n||'').replace(/"/g,'&quot;')}" style="flex:1;min-width:0;padding:6px 10px;font-size:14px;font-weight:600">
        <button class="b s" style="padding:4px 8px;width:auto;font-size:12px" data-rmi="cx:${i}">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div><small class=mu>Valor aplicado</small>
          <input data-p="cx" data-i="${i}" data-k="v" data-t="m" data-raw="${String(c.v??0).replace(/"/g,'')}" value="${R(v)}" inputmode=decimal style="padding:6px 8px;font-size:13px;margin-top:2px">
        </div>
        <div><small class=mu>Taxa (% CDI)</small>
          <input data-p="cx" data-i="${i}" data-k="tx" data-t="n" value="${c.tx}" style="padding:6px 8px;font-size:13px;margin-top:2px">
        </div>
        <div><small class=mu>Data da compra</small>
          <input type=date data-p="cx" data-i="${i}" data-k="d" data-t="t" value="${c.d||''}" style="padding:6px 8px;font-size:13px;margin-top:2px">
        </div>
        <div><small class=mu>Dias</small>
          <div style="padding:6px 8px;font-size:13px;margin-top:2px;color:var(--mu)">${dias==null?'—':dias+' dias'}</div>
        </div>
      </div>
      ${ok?`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:10px;background:rgba(255,255,255,0.03);border-radius:10px">
        <div><small class=mu>Rendimento</small><br><b class="ok" style="font-size:13px">+${R(br)}</b><br><small class=mu>+${v?(br/v*100).toFixed(2).replace('.',','):'0'}%</small></div>
        <div><small class=mu>Saldo bruto</small><br><b style="font-size:13px">${R(v+br)}</b></div>
        <div><small class=mu>Líquido</small><br><b style="font-size:13px">${R(liq)}</b></div>
      </div>`:'<div class=mu style="font-size:12px">Informe CDI e data da compra para ver o rendimento.</div>'}
    </div>`;
  }).join('');

  return `${B('i_cdi')}<h2>Rendimento do CDI</h2>
<div class=c>
  <div style="max-width:200px;margin-bottom:12px">
    <small class=mu>CDI hoje (% a.a.)</small>
    ${ip('cxc',0,'cdi',S.cxc.cdi||'')}
  </div>
  ${cdi>0?'':'<div style="color:var(--wa);font-size:13px;margin-bottom:10px">Informe o CDI de hoje para calcular.</div>'}
  ${cdi>0&&falta?'<div style="color:var(--wa);font-size:13px;margin-bottom:10px">Informe a data de compra de cada caixinha.</div>':''}
  ${cards||'<div class=mu style="padding:8px 0">Nenhuma caixinha cadastrada.</div>'}
  ${tA?`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--ln)">
    <div><small class=mu>Total aplicado</small><br><b>${R(tA)}</b></div>
    <div><small class=mu>Rendimento</small><br><b class="ok">+${R(tB)}</b></div>
    <div><small class=mu>Líquido</small><br><b>${R(tL)}</b></div>
  </div>`:''}
  <button class="b s" data-add=cx style="width:100%;margin-top:12px">+ caixinha</button>
  <div class=mu style="font-size:11px;margin-top:10px">Estimativa com o CDI de hoje. Líquido desconta IR e IOF.</div>
</div>`;
}

function vInvOld(){const I=S.inv,tot=a=>a.f?+a.p||0:(+a.q||0)*(+a.p||0),sm=k=>I.filter(a=>a.k==k).reduce((s,a)=>s+tot(a),0),T=I.reduce((s,a)=>s+tot(a),0),seg=sm('Seguro')+sm('Dividendos'),ris=sm('Crescimento'),r=S.rop,cs=S.sim;
 let ac=0;const rr=r.m.map((x,i)=>{ac=(i==0?(+r.ini||0)+divs():ac)+(+x.b||0)-(+x.c||0);return ac});function divs(){return I.reduce((s,a)=>s+(+a.d||0),0)}
 const apt=r.m.reduce((s,x)=>s+(+x.b||0),0),usd=r.m.reduce((s,x)=>s+(+x.c||0),0),jw=cs.w/2,jj=cs.j/2,atual=jw+jj,meta=cs.custo*cs.meses,ap=cs.prazo>0?Math.max(0,(meta-atual)/cs.prazo/2):0,av=ev(S.ap.v)||0;
 ['Reserva','Reserva de OP','Ações','FIIs','ETF'].forEach(n=>{if(!S.ap.l.some(x=>x.n==n))S.ap.l.push({n,p:0})});
 const disp=(+r.ini||0)+divs()+apt-usd,proj=disp+(+r.meta||0)*12,ETFr=/^(GPCA11|IVVB11|BOVA11|SMAL11|DIVO11|NASD11|HASH11|XINA11)$/i,isE=a=>!a.f&&ETFr.test(a.a),isF=a=>!a.f&&/11$/i.test(a.a)&&!ETFr.test(a.a)&&!/^BRBI11$/i.test(a.a),tv=f=>I.filter(f).reduce((s,a)=>s+tot(a),0),rA=I.find(a=>/reserva\s*(de\s*)?em/i.test(a.a)),
 HJ={r:rA?tot(rA):0,o:disp,a:tv(a=>!a.f&&!isE(a)&&!isF(a)),f:tv(isF),e:tv(isE)},ky=n=>/oportun|op\b/i.test(n)?'o':/a[çc][õo]/i.test(n)?'a':/fii/i.test(n)?'f':/etf/i.test(n)?'e':'r',sp=S.ap.l.reduce((s,x)=>s+(+x.p||0),0);
 const lucroAtivos=I.reduce((s,a)=>{const q=S.quotes?.[String(a.a||'').toUpperCase()];return s+(q&& !a.f && (+a.p||0)>0 ? ((Number(q.price)-(+a.p||0))*(+a.q||0)) : 0)},0),lucroTemCotacao=I.some(a=>S.quotes?.[String(a.a||'').toUpperCase()]&&!a.f&&(+a.p||0)>0);const cr=cxResumo(),sg=v=>(v>=0?'+':'')+R(v);
 return K('c_it','Valor total investido',R(T+lucroAtivos),'var(--ok)',[`Lucro da carteira: ${lucroTemCotacao?sg(lucroAtivos):'—'}`]) +vRunwayCard()+`
 ${B('i_ativos')}<details class="invest-portfolio-fold" open><summary><span><b>Minha carteira</b><small>Ativos, cotações e desempenho em um só lugar.</small></span><span class="invest-portfolio-arrow">⌄</span></summary>
<div class="c invest-assets-panel"><div class="invest-assets-intro"><span>${I.length} ativo(s) na carteira</span><button type="button" class="mini-btn" data-refresh-quotes>↻ Atualizar cotações</button></div><div class="mu" style="font-size:10px;margin:-5px 0 10px">${S.quoteUpdatedAt?`Última consulta: ${new Date(S.quoteUpdatedAt).toLocaleString("pt-BR")}`:"Cotações fornecidas pelo Yahoo Finance"}${S.quoteError?` · ${escH(S.quoteError)}`:""}</div><div class="ch invest-filters">${[['todos','Todos'],['acao','Ações'],['etf','ETFs'],['fii','FIIs'],['rf','Renda fixa']].map(([k,n])=>`<button data-fil="${k}" class="${(F.fil||'todos')==k?'on':''}">${n}</button>`).join('')}</div><div class="invest-list-toolbar"><span class="mu" style="font-size:11px">Seus investimentos</span></div><div class="invest-asset-list">${ord(I).map(([a,i])=>`<article class="invest-asset-row" data-invest-index="${i}"><div class="invest-asset-top"><div class="invest-asset-id"><div><b>${escH(a.a||'Novo ativo')}</b><small>${a.f?'Renda fixa':escH(fcl(a)==='acao'?'Ação':fcl(a)==='etf'?'ETF':fcl(a)==='fii'?'FII':'Ativo')} · ${a.f?'Saldo cadastrado':(Number(a.q)||0)+' cotas'}</small></div></div><div style="display:flex;align-items:center;gap:8px"><div class="invest-asset-value"><b>${R(tot(a))}</b><small>valor investido</small></div><span class="invest-delete-small">${xb('inv:'+i)}</span></div></div><div class="invest-metrics"><div><small>Preço médio</small><b>${R(+a.p||0)}</b></div><div><small>Cotação atual</small><b class="${a.f&&isCdbAsset(a)?(Number(S.cxc?.cdi||0)>0?'':'invest-pending'):S.quotes?.[String(a.a||'').toUpperCase()]?'':'invest-pending'}">${a.f&&isCdbAsset(a)?(Number(S.cxc?.cdi||0)>0?Number(S.cxc.cdi).toLocaleString('pt-BR',{maximumFractionDigits:2})+'% a.a. CDI':'Informe o CDI'):a.f?'—':(S.quotes?.[String(a.a||'').toUpperCase()]?R(S.quotes[String(a.a||'').toUpperCase()].price):'—')}</b></div><div><small>Rentabilidade</small><b class="${a.f&&isCdbAsset(a)?(invValue(a)>=((+a.cdbPrincipal||0)+(a.cdbAportes||[]).reduce((z,x)=>z+(+x.v||0),0))?'ok':'bad'):S.quotes?.[String(a.a||'').toUpperCase()]&&(+a.p||0)>0?(Number(S.quotes[String(a.a||'').toUpperCase()].price)-(+a.p||0))>=0?'ok':'bad':'invest-pending'}">${a.f&&isCdbAsset(a)?(((invValue(a)/Math.max(1,(+a.cdbPrincipal||0)+(a.cdbAportes||[]).reduce((z,x)=>z+(+x.v||0),0))-1)*100).toLocaleString('pt-BR',{maximumFractionDigits:2,minimumFractionDigits:2})+'%'):a.f?'—':(S.quotes?.[String(a.a||'').toUpperCase()]&&(+a.p||0)>0?((Number(S.quotes[String(a.a||'').toUpperCase()].price)-(+a.p||0))/(+a.p||1)*100).toLocaleString('pt-BR',{maximumFractionDigits:2,minimumFractionDigits:2})+'%':'—')}</b></div><div><small>Lucro</small><b class="${a.f&&isCdbAsset(a)?(invValue(a)-((+a.cdbPrincipal||0)+(a.cdbAportes||[]).reduce((z,x)=>z+(+x.v||0),0)))>=0?'ok':'bad':S.quotes?.[String(a.a||'').toUpperCase()]&&(+a.p||0)>0?((Number(S.quotes[String(a.a||'').toUpperCase()].price)-(+a.p||0))*(+a.q||0))>=0?'ok':'bad':'invest-pending'}">${a.f&&isCdbAsset(a)?R(invValue(a)-((+a.cdbPrincipal||0)+(a.cdbAportes||[]).reduce((z,x)=>z+(+x.v||0),0))):a.f?'—':(S.quotes?.[String(a.a||'').toUpperCase()]&&(+a.p||0)>0?R((Number(S.quotes[String(a.a||'').toUpperCase()].price)-(+a.p||0))*(+a.q||0)):'—')}</b></div></div><details class="invest-edit-details"${(window.__invOpen||{})[i]?' open':''}><summary>Editar dados <span>＋</span></summary><div class="invest-asset-fields"><label><small>Ticker / código</small><input data-p="inv" data-i="${i}" data-k="a" data-t="t" type="text" value="${escH(String(a.a==='NOVO'?'':(a.a||'')))}" placeholder="Ex.: BBAS3, GGRC11" autocapitalize="characters" spellcheck="false"></label><label><small>Quantidade</small>${a.f?'<span class="invest-static">—</span>':ip('inv',i,'q',a.q)}</label><label><small>Preço médio / saldo</small>${ip('inv',i,'p',a.p,'m')}</label><label class="invest-category-field"><small>Perfil</small><select data-p="inv" data-i="${i}" data-k="k" data-t="t">${['Crescimento','Dividendos','Seguro'].map(k=>`<option ${k==a.k?'selected':''}>${k}</option>`).join('')}</select></label></div>${isCdbAsset(a)?`<div style="padding:10px 11px;border:1px solid var(--ln);border-radius:12px;margin:2px 0 10px"><label style="display:block"><small>Data de compra / aplicação</small><input data-cdb-date data-i="${i}" type="date" value="${escH(a.cdbDate||todayISO())}" style="width:100%;margin-top:5px"></label><label style="display:block;margin-top:9px"><small>CDI atual (% ao ano) — informe manualmente</small><input data-cdb-cdi type="number" min="0" step="0.01" value="${Number(S.cxc?.cdi||0)}" style="width:100%;margin-top:5px"></label><div class="mu" style="font-size:10px;margin-top:5px">Atualize quando o CDI mudar. Estimativa bruta.</div></div><div class="mu" style="font-size:11px;padding:0 2px 8px">Aplicado em ${escH(/^\d{4}-\d{2}-\d{2}$/.test(a.cdbDate||'')?a.cdbDate.split('-').reverse().join('/'):(a.cdbDate||'—'))} · ${escH(String(a.cdbPercent??100))}% do CDI · ${((a.cdbAportes||[]).length)} aporte(s) adicional(is) · saldo bruto estimado: ${R(invValue(a))}</div><div style="display:flex;justify-content:flex-end;margin:0 0 8px"><button type="button" class="b s" data-tool="cdb-aporte" data-i="${i}" style="padding:7px 12px;color:#2fbf8f;border-color:#2fbf8f">＋ Novo aporte</button></div>`:''}<div style="display:flex;justify-content:flex-end;margin-top:9px"><button type="button" class="b" data-tool="inv-save" data-i="${i}" style="min-width:76px;padding:7px 14px">OK</button></div></details></article>`).join('')||'<div class="mu" style="padding:18px 4px;text-align:center">Nenhum ativo nesse filtro. Adicione um ativo para começar.</div>'}</div><div class="invest-total-row"><span>Total investido</span><b>${R(T)}</b></div><div class="invest-bottom-actions"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px"><button class="b" data-add="inv" style="width:100%">＋ Adicionar novo ativo</button><button class="b s" data-add="fixed" style="width:100%">＋ Adicionar renda fixa</button></div><p class="mu" style="font-size:11px;margin:7px 0 0;text-align:center">Para excluir, use o botão ✕ ao lado do valor do ativo. A exclusão pede confirmação.</p></div><p class="mu" style="font-size:10px;margin-top:8px">Cotações do Yahoo Finance. Rentabilidade = cotação × preço médio.</p></div></details>
 ${B('i_barb')}<h2>Barbell 80/20</h2>
<div class=c>
  <div style="display:flex;align-items:center;gap:20px;margin-bottom:14px;flex-wrap:wrap">
    <div style="flex-shrink:0;margin:0 auto">${pie([['Seguro',seg,'#2fbf8f'],['Risco',ris,'#e86a92']])}</div>
    <div style="flex:1;min-width:180px">
      ${[['Seguro',seg,.8,'#2fbf8f'],['Risco',ris,.2,'#e86a92']].map(([n,v,mt,c])=>{
        const g=mt*T-v;
        const pct=T?v/T:0;
        return `<div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <span style="color:${c};font-weight:600">● ${n}</span>
            <b>${R(v)}</b>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:2px">
            <span class=mu>${P(pct)} · meta ${P(mt)}</span>
            <span style="color:${Math.abs(g/T)<.005?'var(--ok)':g>0?'var(--wa)':'var(--ac)'};font-weight:600">${Math.abs(g/T)<.005?'✔ na meta':g>0?'faltam '+R(g):'acima '+R(-g)}</span>
          </div>
          <div style="height:6px;background:var(--ln);border-radius:99px;overflow:hidden;margin-top:5px">
            <i style="display:block;height:100%;width:${Math.min(100,pct*100)}%;background:${c};border-radius:99px"></i>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>
  <div style="font-size:13px;padding-top:12px;border-top:1px solid var(--ln)">
    ${Math.abs(seg/T-.8)<.005
      ? '✔ Você está na meta 80/20.'
      : `<b>Para chegar em 80/20:</b> aportar <b>${R(seg/T<.8?ris*4-seg:seg/4-ris)}</b> em ${seg/T<.8?'Seguro':'Risco'} <span class=mu>(ou rebalancear ${R(Math.abs(.8*T-seg))})</span>`}
  </div>
</div>
${B('i_peso')}<h2>Distribuição da carteira</h2>
<div class="invest-donut-dashboard">
${(()=>{
 const palette=['#6488ff','#27b98a','#f5a623','#e86a92','#9b7af7','#23a6a1','#e07845','#b4a447','#d66bce','#7c91a6','#45a5d9','#83b64a','#d65c67','#5e70bf','#8bbaad'];
 const amount=a=>a.f?(+a.p||0):(+a.q||0)*(+a.p||0);
 const all=I.map(a=>({name:String(a.a||'Ativo'),value:amount(a),type:a.f?'rf':fcl(a)})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
 const total=all.reduce((s,x)=>s+x.value,0);
 const money=v=>R(v);
 const donut=(title,items,subtitle='')=>{
  const rows=items.filter(x=>x.value>0).sort((a,b)=>b.value-a.value),sum=rows.reduce((s,x)=>s+x.value,0),circ=2*Math.PI*39;
  let offset=0;
  const arcs=rows.map((x,i)=>{const len=sum?x.value/sum*circ:0,seg=`<circle cx="60" cy="60" r="39" fill="none" stroke="${palette[i%palette.length]}" stroke-width="15" stroke-dasharray="${len} ${circ-len}" stroke-dashoffset="${-offset}"/>`;offset+=len;return seg}).join('');
  const legends=rows.map((x,i)=>`<div class="invest-donut-legend-row"><span class="invest-donut-name"><i style="background:${palette[i%palette.length]}"></i><span title="${escH(x.name)}">${escH(x.name)}</span></span><span class="invest-donut-pct">${sum?(x.value/sum*100).toFixed(1).replace('.',','):'0,0'}%</span><b>${money(x.value)}</b></div>`).join('');
  return `<section class="invest-donut-card"><div class="invest-donut-title"><h3>${title}</h3>${subtitle?`<small>${subtitle}</small>`:''}</div>${rows.length?`<div class="invest-donut-main"><div class="invest-donut-visual"><svg viewBox="0 0 120 120" role="img" aria-label="${title}"><circle cx="60" cy="60" r="39" fill="none" stroke="var(--ln)" stroke-width="15"/> <g transform="rotate(-90 60 60)">${arcs}</g><text x="60" y="56" text-anchor="middle" class="invest-donut-center-label">${rows.length}</text><text x="60" y="69" text-anchor="middle" class="invest-donut-center-sub">ativo(s)</text></svg><div class="invest-donut-total">${money(sum)}</div></div><div class="invest-donut-legend">${legends}</div></div>`:'<p class="mu" style="font-size:12px">Ainda não há valores cadastrados nessa categoria.</p>'}</section>`;
 };
 const groups=[
  {name:'Ações',key:'acao',color:'#6488ff'},
  {name:'FIIs',key:'fii',color:'#27b98a'},
  {name:'Renda fixa',key:'rf',color:'#f5a623'},
  {name:'ETFs',key:'etf',color:'#9b7af7'}
 ];
 const byType=groups.map(g=>({...g,value:all.filter(x=>x.type===g.key).reduce((s,x)=>s+x.value,0)}));
 return donut('Peso por classe',byType.map(x=>({name:x.name,value:x.value,color:x.color})).map(x=>({...x})), 'Participação no total da carteira')+
 donut('Peso de cada ação',all.filter(x=>x.type==='acao'), 'Percentual dentro das ações')+
 donut('Peso de cada FII',all.filter(x=>x.type==='fii'), 'Percentual dentro dos FIIs')+
 donut('Peso de cada renda fixa',all.filter(x=>x.type==='rf'), 'Percentual dentro da renda fixa')+
 donut('Peso de todos os ativos',all, 'Percentual de cada ativo sobre a carteira inteira');
})()}
</div>
<details class="c fold-card"><summary><span>Reserva de oportunidade</span><span class="filter-arrow">⌄</span></summary><div class="fold-card-body">
  <div class=g style="margin-bottom:14px">
    <div class=k><small>Atual</small><b class="ok" style="font-size:16px">${R(disp)}</b></div>
    <div class=k><small>Utilizado</small><b class="bad" style="font-size:16px">${R(usd)}</b></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
    <div><small class=mu>Início</small>${ip('rop',0,'ini',r.ini,'m')}</div>
    <div><small class=mu>Meta mensal</small>${ip('rop',0,'meta',r.meta,'m')}</div>
  </div>
  <div class=mu style="font-size:12px;margin-bottom:10px">Meta no ano: ${R(r.meta*12)} · Dividendos: ${R(divs())} · Aportes: ${R(apt)}</div>
  <div class=sc>
    <table>
      <thead><tr><th>Mês</th><th>Aporte</th><th>Compras</th><th>Acumulado</th></tr></thead>
      <tbody>${r.m.map((x,i)=>`<tr>
        <td>${MES[i]}</td>
        <td>${ip('rop.m',i,'b',x.b,'m')}</td>
        <td>${ip('rop.m',i,'c',x.c,'m')}</td>
        <td><b>${R(rr[i])}</b></td>
      </tr>`).join('')}</tbody>
    </table>
  </div>
</div></details>
${B('i_ap')}<h2>Separar aporte do mês</h2><div class="c sm"><div style="max-width:200px">Aporte do mês ${ip('ap',0,'v',S.ap.v,'m')}</div><div style="display:flex;height:10px;border-radius:5px;overflow:hidden;margin:10px 0;background:var(--ln)">${S.ap.l.map((x,i)=>`<i style="width:${Math.max(0,x.p)*100}%;background:${PCO[i%5]}"></i>`).join('')}</div>
 <div class=sc><table><thead><tr><th>Destino</th><th>%</th><th>Aporte</th><th>Hoje</th><th>Depois</th></tr></thead><tbody>${S.ap.l.map((x,i)=>{const hj=HJ[ky(x.n)],ad=av*x.p;return`<tr><td style="color:${PCO[i%5]};font-weight:600">● ${x.n}</td><td>${ip('ap.l',i,'p',+(x.p*100).toFixed(2))} %</td><td>${R(ad)}</td><td>${R(hj)}</td><td>${R(hj+ad)}</td></tr>`}).join('')}</tbody><tfoot><tr><td>Total</td><td>${P(sp)}</td><td>${R(av*sp)}</td><td></td><td></td></tr></tfoot></table></div><div class=mu style="font-size:12px;margin-top:6px">${Math.abs(sp-1)<.001?'✔ Todo o aporte está dividido.':sp<1?`Sem destino: ${P(1-sp)} (${R(av*(1-sp))}).`:`⚠ Passou de 100% em ${P(sp-1)}.`} “Hoje” é o valor atual de cada grupo na carteira.</div></div>` + vAdvancedInvest(I,tot,T)}


function vAdvancedInvest(I,tot,T){
 S.advInvest=S.advInvest||{monthly:300,rate:8,years:20,inflation:4};
 const plan=S.advInvest;
 const totalMonthly=Math.max(0,+plan.monthly||0),years=Math.max(1,Math.min(60,+plan.years||20)),rate=Math.max(-99,+plan.rate||0)/100,infl=Math.max(0,+plan.inflation||0)/100,n=years*12,rm=Math.pow(1+rate,1/12)-1;
 const fv=(initial,monthly,monthlyRate,months)=>{if(months<=0)return initial;if(Math.abs(monthlyRate)<1e-8)return initial+monthly*months;return initial*Math.pow(1+monthlyRate,months)+monthly*(Math.pow(1+monthlyRate,months)-1)/monthlyRate};
 const nominal=fv(T,totalMonthly,rm,n),real=nominal/Math.pow(1+infl,years),gain=nominal-T-totalMonthly*n;
 return `<h2>Projeção patrimonial</h2><div class="c"><p class="mu" style="font-size:12px;margin-bottom:10px">Simule a evolução do patrimônio usando o valor atual cadastrado em Investir, os aportes mensais, uma rentabilidade estimada e a inflação. Os resultados são estimativas e não incluem impostos, taxas nem oscilações reais dos ativos.</p><form data-form="adv-invest"><div class="g2"><label><small class="mu">Aporte mensal (R$)</small><input name="monthly" type="number" min="0" step="10" value="${totalMonthly}"></label><label><small class="mu">Retorno estimado ao ano (%)</small><input name="rate" type="number" min="-99" max="100" step="0.1" value="${+plan.rate||0}"></label><label><small class="mu">Prazo (anos)</small><input name="years" type="number" min="1" max="60" step="1" value="${years}"></label><label><small class="mu">Inflação estimada ao ano (%)</small><input name="inflation" type="number" min="0" max="100" step="0.1" value="${+plan.inflation||0}"></label></div><button class="b" type="submit" style="margin-top:10px">Atualizar projeção</button></form><div class="g2" style="margin-top:12px"><div class="k"><small>Patrimônio nominal estimado</small><b>${R(nominal)}</b></div><div class="k"><small>Valor em poder de compra de hoje</small><b>${R(real)}</b></div><div class="k"><small>Patrimônio atual</small><b>${R(T)}</b></div><div class="k"><small>Total de aportes futuros</small><b>${R(totalMonthly*n)}</b></div><div class="k"><small>Rendimento estimado</small><b class="ok">${R(gain)}</b></div></div></div>`;
}

function mfEssentialAvg(){
 const rows=S.tx.filter(t=>t.d&&t.d<=TD&&t.c&&t.c!=='Receita'&&t.c!=='Investimento'&&t.t!=='Fatura'&&t.t!=='Reserva'&&t.t!=='VR'&&!isInvoicePayment(t)&&!isVR(t)&&!mfIsFatLanc(t)&&(t.g||inferMain(t.c,t.s))==='Essencial');
 const monthKeys=[...new Set(rows.map(t=>t.d.slice(0,7)))].sort().slice(-6);
 const monthly=monthKeys.map(k=>rows.filter(t=>t.d.slice(0,7)===k).reduce((a,t)=>a+(+t.v||0),0)).filter(v=>v>0);
 return{avg:monthly.length?monthly.reduce((a,v)=>a+v,0)/monthly.length:0,n:monthly.length};
}
function vRunwayCard(){
 const avg=mfEssentialAvg().avg;
 const ledg=led().filter(t=>t.d<=TD),cash=ledg.length?Math.max(0,+ledg[ledg.length-1].s||0):0;
 const reserveItem=S.inv.find(a=>/reserva\s*(de\s*)?em/i.test(a.a||''));const reserve=reserveItem?(reserveItem.f?+reserveItem.p||0:(+reserveItem.q||0)*(+reserveItem.p||0)):0;
 const months=avg>0?reserve/avg:0,days=avg>0?Math.floor(months*30.4375):0;
 return `${B('c_reserva')}<div class="k" style="margin:0;min-width:0"><small>Reserva de emergência</small><b style="color:var(--ok);overflow-wrap:anywhere">${R(reserve)}</b><small class="${months<3?'bad':months<6?'':'ok'}">${avg>0?`${months.toFixed(1).replace('.',',')} meses dos gastos essenciais`: 'Cobertura: —'}</small></div>`;
}
const IRR=d=>d<=180?.225:d<=360?.2:d<=720?.175:.15,IOFT=[96,93,90,86,83,80,76,73,70,66,63,60,56,53,50,46,43,40,36,33,30,26,23,20,16,13,10,6,3,0],iofT=d=>d>=30?0:IOFT[Math.max(1,Math.floor(d))-1]/100;
let org=false;const LAST={},TN={add:['<svg class="nav-vibrant-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#F0E9F8"/><path d="M7 8h10M7 12h10M7 16h6" stroke="#8B6BC1" stroke-width="1.8" stroke-linecap="round"/></svg>','Lançamentos'],res:['<svg class="nav-vibrant-icon" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="#FFFFFF"/><path d="M9 10.5Q9 8.5 11 8.5H21Q23 8.5 23 10.5V21Q23 23 21 23H11Q9 23 9 21Z" fill="#3267D5"/><path d="M27 10.5Q27 8.5 29 8.5H37Q39 8.5 39 10.5V21Q39 23 37 23H29Q27 23 27 21Z" fill="#3267D5"/><path d="M9 27Q9 25 11 25H21Q23 25 23 27V37Q23 39 21 39H11Q9 39 9 37Z" fill="#3267D5"/><path d="M27 27Q27 25 29 25H37Q39 25 39 27V37Q39 39 37 39H29Q27 39 27 37Z" fill="#3267D5"/></svg>','Dashboard'],inv:['<svg class="nav-vibrant-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#E7F4EC"/><path d="M6 16.5 10 12.5l2.5 2 5.5-7" fill="none" stroke="#4C9872" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>','Patrimônio'],mais:['<svg class="nav-vibrant-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#FAEFE2"/><rect x="6" y="7" width="12" height="11" rx="1.5" fill="none" stroke="#C88745" stroke-width="1.6"/><path d="M8 5.5v4M16 5.5v4M6.5 11h11" stroke="#C88745" stroke-width="1.6" stroke-linecap="round"/></svg>','Contas'],anal:['<svg class="nav-vibrant-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#F8E8F0"/><path d="M7 17V12M12 17V7M17 17V10" stroke="#B85E91" stroke-width="2" stroke-linecap="round"/></svg>','Análises']},TB0=['add','mais','res','inv','anal'],tbs=()=>{let o=[];try{o=((S.lay||{}).to||[]).filter(k=>TB0.includes(k))}catch(e){}const L=[...new Set([...o,...TB0])];if((window.mfIsDesk&&mfIsDesk())||!TB0.includes('geral'))return L.filter(k=>k!=='geral');if(o.includes('geral'))return L.filter(k=>k!=='anal');return L.filter(k=>k!=='geral').map(k=>k==='anal'?'geral':k)};
const MF_ORD={res:['c_sal','calendar','cashflow','c_ent','c_sai','c_fat','c_inv','budgetalerts','d_cat','d_eco'],add:['form','ext_sum','ext_all','ext_fixos'],inv:['dv_kpi','i_chart','i_cls','dv_meta','dv_sim','dv_proj','i_ap','i_reserva','i_pie','i_tipo','i_barb','p_metas','p_proj'],mais:['calendar','p_faturas','budgetalerts','p_fixos','p_gasto','a_ritmo','a_semana','a_top','p_venc','p_cmpg'],anal:['n_mres','n_mcmp','n_mdesp','n_cat','n_msub','n_top','n_ritmo','n_grupo','n_pag','a_semana','n_mcc','n_mparc','n_minv','n_mativo','n_mprov','n_mdiag','n_ares','n_aflux','n_asaldo','n_agastos','n_aexpm','n_acat','n_asub','n_ainv','n_ainvm','n_aativo','n_aprov','n_apat','n_asaude','n_areserva','n_apoup','n_aretro','n_adiag','n_kpi','n_akpi','n_aacum','n_amelhor']};
function lay(t,html){const p=html.split(/<!--b:([\w~]+)-->/),bl=[];for(let i=1;i<p.length;i+=2)if(p[i+1].trim())mfSplit(p[i],p[i+1]).forEach(u=>{if(!mvAway(u[0],t)&&(t!=='mais'||/^(p_|a_|calendar|budgetalerts)/.test(u[0])))bl.push(u)});
 const L=S.lay||{},o=(L.o||{})[t]||((window.mfIsDesk&&mfIsDesk()&&MF_ORD_D[t])||MF_ORD[t])||[],hid=L.h||{},wd=L.w||{},ix=id=>{let k=o.indexOf(id);if(k>=0)return k;const b0=mfBase(id);if(b0!==id){k=o.indexOf(b0);if(k>=0)return k+.001*(+(id.split('~')[1]||(/_(\d+)$/.exec(id)||[])[1])||0)}const af={payments:'c_fat'}[id],q=af?o.indexOf(af):-1;return q>=0?q+.5:1e6},s=bl.map((b,i)=>[b,i]).sort((x,y)=>ix(x[0][0])-ix(y[0][0])||x[1]-y[1]).map(x=>x[0]);LAST[t]=s.map(b=>b[0]);
 let out=p[0],g='';const fl=()=>{if(g){out+=`<div class=g2>${g}</div>`;g=''}};
 s.forEach(([id,h])=>{const cd=id.startsWith('c_'),hd=isHid(id),hf=!cd&&wd[id]==='h'&&!(window.mfIsDesk&&mfIsDesk());if(hd&&!org)return;const full=wd[id]?wd[id]=='f':(WIDE.includes(id)||/^c_.+_\d+$/.test(id)),hh=mfMark(cd?mfDeskCard(id,h.replace(' style="grid-column:1/-1"','')):mfBlockMonth(id,h),t,id),
  w=org?(hd?`<div class=blk style="grid-column:1/-1;padding:5px 0"><div class=mv><span style="font-size:11px;opacity:.7;flex:1">${escH(id.replace(/^c_/, '').replace(/_/g,' '))} oculto</span><button data-hd="${id}">👁 mostrar</button></div></div>`:`<div class=blk style="${cd&&full?'grid-column:1/-1':''}"><div class=mv><button data-mv="${t}|${id}|top">⤒</button><button data-mv="${t}|${id}|-1">${cd?'◀':'▲'}</button><button data-mv="${t}|${id}|1">${cd?'▶':'▼'}</button><button data-mv="${t}|${id}|end">⤓</button>${cd?`<button data-wd="${id}|${full?'h':'f'}">${full?'↔ meia':'↔ inteira'}</button>`:''}<button data-mvtab="${t}|${id}" title="Mover este bloco para outra aba">⇄ aba</button><button data-hd="${id}">🙈 ocultar</button>${MF_VIEW[id]?`<button data-vw="${id}">⚙ exibir</button>`:''}<button data-edit-card="${id}" title="Editar aparência deste bloco">✎ editar</button></div>${hh}</div>`):(cd&&full?`<div style="grid-column:1/-1">${hh}</div>`:hh);
  if(cd||hf)g+=w;else{fl();out+=(window.mfIsDesk&&mfIsDesk())?`<div class="mf-dblk${mfIsWide(id)?' mf-dwide':((S.lay||{}).w||{})[id]==='t'?' mf-dthird':''}">${w}</div>`:w}});fl();out=balanceDivs(out);return out}
const MF_ORD_D={inv:['dv_kpi','dv_chart','dv_tab','dv_meta','dv_sim','dv_proj'],res:['c_sal','c_ent','c_sai','c_fat','c_inv','d_bar','calendar','cashflow','budgetalerts','d_cat','d_eco'],add:['form','ext_sum','ext_all','ext_fixos']};
function mfAvatarHtml(sz){const P=S.profile||{};return P.photo?`<img src="${P.photo}" alt="" style="width:${sz}px;height:${sz}px">`:`<svg viewBox="0 0 24 24" width="${Math.round(sz*.55)}" height="${Math.round(sz*.55)}" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4.2"/><path d="M3.8 21a8.2 8.2 0 0 1 16.4 0Z"/></svg>`}
const MF_TTL={add:'Lançamentos',mais:'Contas',inv:'Patrimônio',anal:'Análises',res:'Dashboard'},MF_MTABS=['add','mais','anal'];
function mfMonthSwitch(){return `<div class="mf-msw" aria-label="Selecionar mês"><button type="button" data-m="-1" aria-label="Mês anterior">‹</button><span>${MESF[+ym.slice(5)-1]} ${ym.slice(0,4)}</span><button type="button" data-m="1" aria-label="Próximo mês">›</button></div>`}
/* 3.4 · o olho (esconder valores) é montado à parte: mora no cabeçalho de perfil da Geral e, no celular, dentro dos blocos Saldo atual e Valor atual */
/* 3.7 · Olho de privacidade animado: aberto = valores à mostra; fechado (com cílios) = valores ocultos. O estado vem de window.MF_PRIV (antes lia S.privacy, que nunca era
   gravado: o olho ficava sempre aberto). Ao tocar, o olho abre/fecha com animação (classes mf-eye-fechar / mf-eye-abrir, css/99-topo-titulo.css). */
function mfEyeHtml(){const o=!!window.MF_PRIV;return `<button type="button" class="mf-eye ${o?'on':''}" data-mfpriv="1" aria-pressed="${o}" aria-label="${o?'Mostrar valores':'Ocultar valores'}" title="${o?'Mostrar valores':'Ocultar valores'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="eye-bot" d="M2.5 12C4 15.5 7.5 18 12 18s8-2.5 9.5-6"/><path class="eye-top" d="M2.5 12C4 8.5 7.5 6 12 6s8 2.5 9.5 6"/><circle class="eye-pu" cx="12" cy="12" r="3"/><path class="eye-ls" d="M6.6 16.3l-1.3 2.1M12 18.2v2.5M17.4 16.3l1.3 2.1"/></svg></button>`}
(window.__mfAD=window.__mfAD||[]).push(function(){const a=window.__eyeAnim;if(!a)return;window.__eyeAnim=null;document.querySelectorAll('.mf-eye').forEach(e=>e.classList.add('mf-eye-'+a))});
/* cabeçalho de perfil/configurações (foto, saudação e olho): no celular só a aba Geral o usa; no computador continua sendo o topo do Dashboard */
function mfTopPerfil(){const P=S.profile||{},nome=(P.apelido||P.nome||'').trim();return `<div class="header-bar mf-top"><button type="button" class="mf-avatar" data-mfcfg="1" aria-label="Configurações e perfil" title="Configurações"><i class="mf-sync-dot" aria-hidden="true"></i>${mfAvatarHtml(44)}</button><div class="mf-hello"><b>${mfSaud()+(nome?', '+escH(nome):'!')}</b>${P.frase?`<small>${escH(P.frase)}</small>`:''}</div>${mfEyeHtml()}</div>`}
function mfTopBar(){if(window.mfIsDesk&&mfIsDesk())return mfDeskTop();return mfTopCompact()}
const MF_MONTHLY=['p_shop'];/* p_shop: a Lista de compras filtra pelo mês escolhido e mostra o seletor dentro do bloco (Fase 3 · M13) */
function mfBlockMonth(id,h){if(!MF_MONTHLY.includes(mfBase(id))||/class="mf-bmn"/.test(h))return h;const k=h.indexOf('</h2>');if(k<0)return h;return h.slice(0,k+5)+`<div class="mf-bmn">${mnav()}</div>`+h.slice(k+5)}
const MF_DWIDE=['i_ivtop','i_ivevo','i_ivativo','i_ivmeus','ext_all','a_ano_tab','i_ativos','n_kpi','n_akpi','dv_kpi','dv_chart','dv_tab','dv_proj'];
function applyLay(){try{
 const L=S.lay||{},root=document.documentElement;if(L.glass)root.setAttribute('data-glass','1');else root.removeAttribute('data-glass');L.bgTheme='animatedBlue';S.lay=L;root.setAttribute('data-theme',L.theme||'dark');root.style.setProperty('--ui-zoom',String(Math.max(.8,Math.min(1.3,(+L.zoom||100)/100))));{const AL=L.all||{};[['pad','p'],['rad','r'],['gap','g']].forEach(([k,a])=>{if(AL[k]!==undefined){root.style.setProperty('--all-'+k,AL[k]+'px');root.setAttribute('data-all'+a,'1')}else{root.style.removeProperty('--all-'+k);root.removeAttribute('data-all'+a)}})}if((L.theme||'dark')==='light'){document.body.style.backgroundImage='';document.body.style.backgroundSize='';document.body.style.animation='';document.body.style.backgroundAttachment='';document.body.style.backgroundColor=''}else{document.body.style.backgroundImage='linear-gradient(135deg,#0b192c,#1e3e62,#000000,#2a4759)';document.body.style.backgroundSize='400% 400%';document.body.style.animation='financeGradientAnimation 15s ease infinite';document.body.style.backgroundAttachment='fixed'}
 document.body.style.fontSize='15px';root.style.setProperty('--ac',L.ac||'#6b8aff');mfApplyAccent(root,L);
 root.style.setProperty('--radius','16px');root.style.setProperty('--radius-sm','12px');
 root.style.setProperty('--ln',L.bd==='strong'?(L.theme==='light'?'rgba(25,35,55,.22)':'rgba(255,255,255,.17)'):(L.theme==='light'?'rgba(25,35,55,.10)':'rgba(255,255,255,.07)'));
 const tones={blue:['rgba(35,70,112,ALPHA)','rgba(30,57,91,0.98)'],midnight:['rgba(20,39,72,ALPHA)','rgba(18,31,55,0.98)'],violet:['rgba(57,43,91,ALPHA)','rgba(43,32,69,0.98)'],teal:['rgba(25,73,77,ALPHA)','rgba(21,57,61,0.98)'],smoke:['rgba(64,72,86,ALPHA)','rgba(46,51,62,0.98)'],black:['rgba(13,17,27,ALPHA)','rgba(9,12,19,0.98)']};const tone=tones[L.cardTone||'blue']||tones.blue;const alpha=({high:0.48,medium:0.68,low:0.88}[L.transparency||'high']||0.48);root.style.setProperty('--card',tone[0].replace('ALPHA',alpha));root.style.setProperty('--card-solid',tone[1]);root.style.setProperty('--card-pad','16px');root.style.setProperty('--layout-gap','14px');root.style.setProperty('--btn-radius','10px');
 let st=document.getElementById('dens');if(!st){st=document.createElement('style');st.id='dens';document.head.appendChild(st)}
 st.textContent=`main{max-width:780px}.c{padding:var(--card-pad);margin-bottom:var(--layout-gap);border-radius:var(--radius)}.k{padding:14px;border-radius:var(--radius-sm)}button,.layout-chip,.layout-tab-row input,.layout-visibility{border-radius:var(--btn-radius)}${L.shadow==='none'?'.c,.k,#app section[class*="dash-"],#app .invest-donut-card,#app details.invest-portfolio-fold{box-shadow:none!important}':L.shadow==='soft'?'.c,.k,#app section[class*="dash-"],#app .invest-donut-card,#app details.invest-portfolio-fold{box-shadow:0 2px 8px rgba(0,0,0,.08)!important}':''}${L.surface==='flat'?'.c,.k,#app section[class*="dash-"],#app .invest-donut-card,#app details.invest-portfolio-fold{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:var(--card-solid)!important}':''}`;
 }catch(e){}}

function layPanel(){
 const L=S.lay||{},fs=L.fs||0,ac=L.ac||'#6b8aff',dn=L.dn||'n',tn=L.tn||{},ti=L.ti||{},ht=L.ht||{},cw=+(L.cw||780),rad=+(L.rad||16),bd=L.bd||'soft',AL=L.all||{},theme=L.theme||'dark',zm=Math.round(+L.zoom||100),SW=['#6b8aff','#34d399','#fbbf24','#f472b6','#a78bfa','#22d3ee','#f97316','#0f766e'],on='background:var(--ac);color:var(--ac-fg,#fff);border-color:var(--ac)',chip=(a,o,t)=>`<button type="button" data-lo="${a}" class="layout-chip ${o?'selected':''}" ${o?`style="${on}"`:''}>${t}</button>`,lb=t=>`<div class="layout-label">${t}</div>`,range=(key,label,val,min,max,step,unit)=>`<label class="layout-range"><span>${label}</span><b>${val}${unit||''}</b><input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-lrange="${key}"></label>`;
 return `<section class="layout-panel"><header class="layout-heading"><div><span class="dash-section-kicker">PERSONALIZAÇÃO</span><h3>Temas</h3><p class="mu">Toque num cartão para editar só ele. Os botões de cada bloco movem ou ocultam.</p></div><div class="layout-heading-actions"><button type="button" class="layout-reset-top" data-lo="reset|1">Restaurar padrão</button><button type="button" class="layout-close-btn" data-org="close" aria-label="Feito">Feito ✓</button></div></header>
 <details class="layout-section layout-accordion" data-acc="theme" ${(window.__mfAcc||{}).theme?'open':''}><summary><span>1. Tema e aparência</span><span class="filter-arrow">⌄</span></summary><div class="layout-accordion-body">
 ${lb('Tema do aplicativo')}<div class="mf-glass-wrap layout-glass"><div class="mf-glass-sw ${theme==='light'?'on':''}" data-lo-theme-toggle="1" role="switch" aria-checked="${theme==='light'}" aria-label="Alternar tema claro e escuro">
  <div class="mf-glass-track"><div class="mf-glass-filament"></div>
   <div class="mf-glass-glyph moon"><svg viewBox="0 0 36 36"><path d="M24 6.5a12 12 0 1 0 0 23 9.5 9.5 0 1 1 0-23z" fill="currentColor"/></svg></div>
   <div class="mf-glass-glyph sun"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="6.5" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="18" y1="4" x2="18" y2="8"/><line x1="18" y1="28" x2="18" y2="32"/><line x1="4" y1="18" x2="8" y2="18"/><line x1="28" y1="18" x2="32" y2="18"/><line x1="8.5" y1="8.5" x2="11.2" y2="11.2"/><line x1="24.8" y1="24.8" x2="27.5" y2="27.5"/><line x1="8.5" y1="27.5" x2="11.2" y2="24.8"/><line x1="24.8" y1="11.2" x2="27.5" y2="8.5"/></g></svg></div>
  </div>
  <div class="mf-glass-knob"><div class="mf-glass-rim"></div><div class="mf-glass-lens"><div class="mf-glass-lens-c">
   <svg class="moon-svg" viewBox="0 0 36 36"><path d="M24 6.5a12 12 0 1 0 0 23 9.5 9.5 0 1 1 0-23z" fill="currentColor"/></svg>
   <svg class="sun-svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="6.5" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="4" x2="18" y2="8"/><line x1="18" y1="28" x2="18" y2="32"/><line x1="4" y1="18" x2="8" y2="18"/><line x1="28" y1="18" x2="32" y2="18"/><line x1="8.5" y1="8.5" x2="11.2" y2="11.2"/><line x1="24.8" y1="24.8" x2="27.5" y2="27.5"/><line x1="8.5" y1="27.5" x2="11.2" y2="24.8"/><line x1="24.8" y1="11.2" x2="27.5" y2="8.5"/></g></svg>
  </div></div></div>
 </div><span class="mf-glass-label">${theme==='light'?'Modo Claro':'Modo Escuro'}</span></div>
 ${lb('Fundo de tela')}<div class="layout-chips">${chip('bgTheme|animatedBlue',true,'Liso')}</div>
 ${lb('Cor de destaque')}<div class="layout-colors">${SW.map(c=>`<button type="button" aria-label="Cor ${c}" title="Cor de destaque" data-lo="ac|${c}" style="background:${c};border:${ac==c?'3px solid var(--tx)':'2px solid var(--ln)'}" class="layout-color"></button>`).join('')}</div>
 ${lb('Bordas')}<div class="layout-chips">${chip('bd|soft',bd==='soft','Discretas')}${chip('bd|strong',bd==='strong','Mais visíveis')}</div>
 ${lb('Sombra dos cartões')}<div class="layout-chips">${chip('shadow|default',(L.shadow||'default')==='default','Padrão')}${chip('shadow|soft',L.shadow==='soft','Suave')}${chip('shadow|none',L.shadow==='none','Sem sombra')}</div>
 ${lb('Fundo dos cartões')}<div class="layout-chips">${chip('surface|glass',(L.surface||'glass')==='glass','Translúcido')}${chip('surface|flat',L.surface==='flat','Sólido')}</div>
 ${lb('Paleta dos cartões')}<div class="layout-chips">${chip('cardTone|blue',(L.cardTone||'blue')==='blue','Azul oceano')}${chip('cardTone|midnight',L.cardTone==='midnight','Azul noite')}${chip('cardTone|violet',L.cardTone==='violet','Roxo')}${chip('cardTone|teal',L.cardTone==='teal','Verde petróleo')}${chip('cardTone|smoke',L.cardTone==='smoke','Cinza')}${chip('cardTone|black',L.cardTone==='black','Preto vidro')}</div>
 ${lb('Transparência dos cartões')}<div class="layout-chips">${chip('transparency|high',(L.transparency||'high')==='high','Mais translúcido')}${chip('transparency|medium',L.transparency==='medium','Equilibrado')}${chip('transparency|low',L.transparency==='low','Mais opaco')}</div>
 </div></details>
 <details class="layout-section layout-accordion" data-acc="all" ${(window.__mfAcc||{}).all?'open':''}><summary><span>2. Todos os cartões e blocos</span><span class="filter-arrow">⌄</span></summary><div class="layout-accordion-body"><p class="mu">Ajusta tudo de uma vez. Edições feitas em um cartão específico continuam valendo.</p>${[['pad','Espaço interno dos cartões',6,26,AL.pad,16],['rad','Arredondamento',4,30,AL.rad,16],['gap','Espaço entre blocos',4,28,AL.gap,14]].map(([k,l,mn,mx,v,d])=>`<label class="layout-range"><span>${l}</span><b id="mfAll_${k}">${v===undefined?'padrão':v+'px'}</b><input type="range" min="${mn}" max="${mx}" step="1" value="${v===undefined?d:v}" data-all-range="${k}"></label>`).join('')}<div class="layout-chips"><button type="button" class="layout-chip" data-lo="allreset|1">Voltar ao padrão</button></div></div></details>
<details class="layout-section layout-accordion" data-acc="size" ${(window.__mfAcc||{}).size?'open':''}><summary><span>3. Tamanho</span><span class="filter-arrow">⌄</span></summary><div class="layout-accordion-body"><p class="mu">Escolha o tamanho de todo o aplicativo. Tudo é ajustado junto, mantendo o alinhamento.</p>${lb('Tamanho')}<div class="layout-chips">${chip('zoom|88',zm===88,'Compacto')}${chip('zoom|94',zm===94,'Médio')}${chip('zoom|100',zm===100,'Normal')}${chip('zoom|112',zm===112,'Grande')}</div><label class="layout-range"><span>Tamanho personalizado</span><b id="mfZoomOut">${zm}%</b><input type="range" min="80" max="130" step="2" value="${zm}" data-zoom-range="1"></label></div></details>

 <div class="layout-footnote">As mudanças visuais não apagam seus lançamentos financeiros. A personalização é salva neste navegador/aparelho.</div></section>`
}


/* ===== Mover blocos entre abas (Dashboard ⇄ Planejamento ⇄ …) ===== */
function mvAway(id,t){const M=(S.lay||{}).mvt||{},m=M[id]||M[mfBase(id)];return !!m&&m.t!=='mais'&&m.f===t&&m.t!==t}
function blocksOf(html){const p=String(html).split(/<!--b:([\w~]+)-->/),r=[];for(let i=1;i<p.length;i+=2)if(p[i+1].trim())mfSplit(p[i],p[i+1]).forEach(u=>r.push(u));return r}
function trimExtraClose(h){let x=String(h);const o=(x.match(/<div\b/g)||[]).length;let c=(x.match(/<\/div>/g)||[]).length;while(c>o&&/<\/div>\s*$/.test(x)){x=x.replace(/<\/div>\s*$/,'');c--}return x}
function balanceDivs(h){const o=(h.match(/<div\b/g)||[]).length,c=(h.match(/<\/div>/g)||[]).length;return o>c?h+'</div>'.repeat(o-c):h}
function withMoved(tab,html){
 const MV=(S.lay||{}).mvt||{},ids=Object.keys(MV).filter(id=>MV[id]&&MV[id].t===tab&&tab!=='mais'&&MV[id].f!==tab&&!html.includes('<!--b:'+id+'-->'));
 if(!ids.length)return html;
 const cache={};let mi='';
 ids.forEach(id=>{const f=MV[id].f;if(cache[f]===undefined){try{const vf=viewFor(f);cache[f]=vf?blocksOf(vf()):[]}catch(e){console.warn('Bloco movido indisponível:',e);cache[f]=[]}}
  cache[f].filter(b=>b[0]===id||(mfBase(b[0])===id&&!MV[b[0]])).forEach(b=>{mi+='<!--b:'+b[0]+'-->'+trimExtraClose(b[1])})});
 if(!mi)return html;
 return tab==='mais'&&/<\/div>\s*$/.test(html)?html.replace(/<\/div>\s*$/,mi+'</div>'):html+mi}
function mfToast(m){document.querySelectorAll('.mf-toast').forEach(t=>t.remove());const x=document.createElement('div');x.className='mf-toast';x.textContent=m;document.body.appendChild(x);setTimeout(()=>x.remove(),2800)}
function mvTabSheet(arg){
 const[t,id]=String(arg).split('|'),L=S.lay||{},cur=(L.mvt||{})[id],home=cur?cur.f:t,tn=k=>k==='anal'?'Análises':((L.tn||{})[k]||TN[k][1]);
 const old=document.getElementById('mf-mv-sheet');if(old)old.remove();
 const wrap=document.createElement('div');wrap.id='mf-mv-sheet';
 wrap.innerHTML=`<div class="mf-mv-back" data-mvgo="close"></div><section class="mf-mv-box" role="dialog" aria-modal="true" aria-label="Mover bloco"><h3>Mover para qual aba?</h3><p>O bloco sai desta aba e aparece na aba escolhida. Seus dados não mudam e você pode devolver o bloco depois.</p><div class="mf-mv-list">${tbs().filter(k=>k!==t&&k!=='mais').map(k=>`<button type="button" data-mvgo="${k}">${k===home?'↩ ':''}${escH(tn(k))}${k===home?' <small>(aba original)</small>':''}</button>`).join('')}</div><button type="button" class="mf-mv-cancel" data-mvgo="close">Cancelar</button></section>`;
 wrap.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-mvgo]');if(!b)return;const k=b.dataset.mvgo;wrap.remove();if(k==='close')return;lset(l=>{l.mvt=l.mvt||{};if(k===home)delete l.mvt[id];else l.mvt[id]={f:home,t:k}});mfToast('Bloco movido para '+tn(k)+'.')});
 document.body.appendChild(wrap)}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const s=document.getElementById('mf-mv-sheet');if(s)s.remove()}});

/* ===== Planejamento: alertas inteligentes de orçamento ===== */
function mfMs(k){return MES[+k.slice(5)-1]+'/'+k.slice(2,4)}
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='mf-bud-det')window.__mfBudOpen=e.target.open},true);

/* ===== Planejamento: central de parcelas do cartão ===== */

/* ===== Planejamento: simulador de decisões financeiras (não altera lançamentos) ===== */
function simState(){return window.__mfSim=window.__mfSim||{kind:'parc',total:'',n:'10',juros:'',extra:'',taxa:'',hor:'12',sobra:''}}
function simNum(v){const x=ev(String(v==null?'':v).trim());return Number.isFinite(x)?x:0}
function simBaseline(){const o=S.orc||{},salary=(o.salarios||[]).reduce((sum,x)=>sum+(ev(x.v)||0),0),saldo=0,sobra=salary;return{saldo,sobra,fonte:'renda mensal cadastrada na aba Contas'}}
function simChart(base,alt){
 const W=300,Ht=112,pd=8,all=base.concat(alt),mn=Math.min(...all,0),mxx=Math.max(...all,0),rg=(mxx-mn)||1,H=base.length;
 const X=i=>pd+(H>1?i*(W-2*pd)/(H-1):(W-2*pd)/2),Y=v=>Ht-pd-(v-mn)/rg*(Ht-2*pd),pts=a=>a.map((v,i)=>X(i).toFixed(1)+','+Y(v).toFixed(1)).join(' ');
 return `<svg viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Comparação do saldo futuro com e sem a decisão" style="width:100%;height:auto;display:block"><line x1="${pd}" x2="${W-pd}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}" stroke="var(--ln)" stroke-width="1"/><polyline points="${pts(base)}" fill="none" stroke="var(--mu)" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts(alt)}" fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
function simFormHtml(){
 const st=simState(),b0=simBaseline(),inp=(k,ph)=>`<input data-sim="${k}" type="text" inputmode="decimal" autocomplete="off" value="${escH(st[k])}" placeholder="${escH(ph)}" style="min-width:0;width:100%">`,lbl=t=>`<label style="font-size:12px;font-weight:650;display:block;margin-bottom:4px">${t}</label>`;
 const kinds=[['parc','Comprar algo parcelado'],['despesa','Simular gasto mensal (ex.: aluguel)'],['aporte','Aumentar meus aportes'],['guardar','Guardar mais dinheiro']];
 const fields=st.kind==='parc'?`<div>${lbl('Valor da compra (R$)')}${inp('total','Ex.: 3000')}</div><div>${lbl('Nº de parcelas')}${inp('n','Ex.: 10')}</div><div style="grid-column:1/-1">${lbl('Juros ao mês (%) — opcional')}${inp('juros','0 = sem juros')}</div>`:`<div>${lbl(st.kind==='despesa'?'Gasto mensal (R$)':st.kind==='aporte'?'Aporte extra por mês (R$)':'Guardar a mais por mês (R$)')}${inp('extra','Ex.: 1200')}</div><div>${lbl(st.kind==='despesa'?'Nome do gasto (opcional)':'Rendimento ao ano (%) — opcional')}${st.kind==='despesa'?inp('n','Ex.: Aluguel'):inp('taxa','0 = sem rendimento')}</div>`;
 return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div style="grid-column:1/-1">${lbl('O que você quer testar?')}<select data-sim="kind" style="width:100%">${kinds.map(([v,l])=>`<option value="${v}" ${st.kind===v?'selected':''}>${l}</option>`).join('')}</select></div>${fields}<div>${lbl('Período')}<select data-sim="hor" style="width:100%">${[6,12,24,36].map(h=>`<option value="${h}" ${+st.hor===h?'selected':''}>${h} meses</option>`).join('')}</select></div><div>${lbl('Sobra mensal (opcional)')}${inp('sobra','Auto: '+R(b0.sobra))}</div></div><div class="mu" style="font-size:11px;margin-top:8px;line-height:1.45">Ponto de partida: saldo disponível de <b>${R(b0.saldo)}</b> e sobra mensal estimada de <b>${R(b0.sobra)}</b> (${b0.fonte}).</div>`}
function simResultHtml(){
 const st=simState(),b0=simBaseline(),sobra=st.sobra!==''?simNum(st.sobra):b0.sobra,H=[6,12,24,36].includes(+st.hor)?+st.hor:12,cur=TD.slice(0,7);
 let valid,parcela=0,n=0,tot=0,extra=0,jr=0;
 if(st.kind==='parc'){tot=simNum(st.total);n=Math.max(1,Math.min(120,parseInt(st.n,10)||1));jr=simNum(st.juros)/100;parcela=tot>0?(jr>0?tot*jr/(1-Math.pow(1+jr,-n)):tot/n):0;valid=tot>0}else{extra=simNum(st.extra);valid=extra>0}
 if(!valid)return `<div class="mu" style="font-size:12px;padding:12px 2px 2px">${st.kind==='parc'?'Informe o valor da compra e o número de parcelas':'Informe quanto a mais por mês você quer separar'} para ver o impacto no seu saldo futuro.</div>`;
 const r=Math.pow(1+simNum(st.taxa)/100,1/12)-1,base=[],alt=[],acc=[];let b=b0.saldo,a=b0.saldo,ac=0;
 for(let i=1;i<=H;i++){b+=sobra;a+=sobra;if(st.kind==='parc'){if(i<=n)a-=parcela}else if(st.kind==='despesa'){a-=extra}else{a-=extra;ac=ac*(1+r)+extra}base.push(b);alt.push(a);acc.push(ac)}
 const lastB=base[H-1],lastA=alt[H-1],diff=lastA-lastB,minV=Math.min(...alt),minI=alt.indexOf(minV),negI=alt.findIndex(v=>v<0),mlab=i=>mfMs(nm(cur,i+1));
 const tile=(t,v,c)=>`<div class="k"><small>${t}</small><b class="${c||''}">${R(v)}</b></div>`;
 const accTot=acc[H-1],yieldV=accTot-extra*H;
 const info=st.kind==='parc'?`Parcela de <b>${R(parcela)}</b> por ${n}x${jr>0?` (total pago ${R(parcela*n)}, sendo ${R(parcela*n-tot)} de juros)`:''}.${sobra>0?` Compromete <b>${Math.round(parcela/sobra*100)}%</b> da sua sobra mensal.`:''} Pagando à vista, o saldo cairia ${R(tot)} hoje.${n>H?` Ainda restariam ${n-H} parcela${n-H>1?'s':''} depois do período simulado.`:''}`:st.kind==='despesa'?`O gasto ${st.n?'<b>'+escH(st.n)+'</b> ':''}reduz o saldo em <b>${R(extra)}</b> por mês, totalizando <b>${R(extra*H)}</b> em ${H} meses.`:`Seu saldo livre cai <b>${R(extra*H)}</b> no período, mas você acumula <b>${R(accTot)}</b>${r>0?` (rendimento estimado de ${R(yieldV)})`:''}. Patrimônio total (saldo + acumulado): <b>${R(lastA+accTot)}</b> contra ${R(lastB)} sem a decisão.`;
 const warn=negI>=0?`<div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.25);font-size:12px"><b class="bad">⚠ Atenção:</b> com esta decisão o saldo fica negativo a partir de <b>${mlab(negI)}</b>.</div>`:`<div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:var(--sf2,rgba(127,127,127,.07));border:1px solid var(--ln);font-size:12px"><b class="ok">✔ Saldo positivo</b> durante todo o período. Menor saldo: <b>${R(minV)}</b> em ${mlab(minI)}.</div>`;
 const table=base.map((v,i)=>`<div style="display:grid;grid-template-columns:48px 1fr 1fr 1fr;gap:6px;padding:5px 0;border-bottom:1px solid var(--ln);font-size:11px"><span>${mlab(i)}</span><span style="text-align:right">${R(v)}</span><span style="text-align:right">${R(alt[i])}</span><b class="${alt[i]-v<0?'bad':'ok'}" style="text-align:right">${R(alt[i]-v)}</b></div>`).join('');
 return `<div class="g" style="margin:14px 0 4px">${tile('Em '+H+' meses, sem a decisão',lastB)}${tile('Com a decisão',lastA,lastA<0?'bad':'')}${tile('Diferença',diff,diff<0?'bad':'ok')}</div><div style="font-size:12px;line-height:1.55;margin:8px 0 6px">${info}</div>${warn}<div style="margin-top:12px">${simChart(base,alt)}<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mu);margin-top:3px"><span>${mlab(0)}</span><span>${mlab(H-1)}</span></div><div class="dash-history-legend" style="justify-content:flex-start;margin:6px 0 0"><span><i style="background:var(--mu)"></i>Sem a decisão</span><span><i style="background:var(--ac)"></i>Com a decisão</span></div></div><details style="margin-top:10px"><summary style="cursor:pointer;font-size:12px;font-weight:650">Ver mês a mês</summary><div style="display:grid;grid-template-columns:48px 1fr 1fr 1fr;gap:6px;padding:8px 0 4px;font-size:10px;color:var(--mu)"><span>Mês</span><span style="text-align:right">Sem</span><span style="text-align:right">Com</span><span style="text-align:right">Diferença</span></div>${table}</details><div class="mu" style="font-size:10px;margin-top:10px;line-height:1.45">Simulação apenas: nada é lançado nem alterado nos seus dados. Parte do saldo de hoje e da sobra mensal (${st.sobra!==''?'informada por você':b0.fonte}); não considera imprevistos nem variações de renda.</div>`}
function mfSimSet(t){const st=simState(),k=t.dataset.sim;st[k]=t.value;if(k==='kind'){const f=document.getElementById('mf-sim-form');if(f)f.innerHTML=simFormHtml()}const r=document.getElementById('mf-sim-result');if(r)r.innerHTML=simResultHtml()}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.sim!==undefined)mfSimSet(t)});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.sim!==undefined)mfSimSet(t)});



/* ===== Cartões livres: cada cartão vira um bloco próprio + edição individual ===== */
const MF_CARD_SEL='.c,.k,.uic,section[class*="dash-"],.dash-wealth-highlight,.dash-payment-summary,.invest-donut-card,.invest-asset-row,details.invest-portfolio-fold';
function mfBase(id){const m=/^c_(.+)_\d+$/.exec(String(id));return m?m[1]:String(id).split('~')[0]}
function isHid(id){const h=(S.lay||{}).h||{},b=mfBase(id);return h[id]!==undefined?!!h[id]:h[b]!==undefined?!!h[b]:(window.MF_DEFHID||[]).includes(b)}
function mfMark(h,t,id){return String(h).replace(/^(\s*)<([a-zA-Z][\w-]*)(?![\w-])/,'$1<$2 data-bk="'+t+'|'+id+'"')}
function mfSplit(id,h){
 if(id.startsWith('c_')||id.includes('~'))return [[id,h]];
 let doc;try{doc=new DOMParser().parseFromString('<body>'+h+'</body>','text/html')}catch(e){return [[id,h]]}
 const kids=[...doc.body.childNodes];
 if(kids.some(n=>n.nodeType===8||(n.nodeType===3&&n.textContent.trim())))return [[id,h]];
 const els=kids.filter(n=>n.nodeType===1);if(els.length<2)return [[id,h]];
 const isHead=n=>/^H[1-6]$/.test(n.tagName),isNote=n=>/^(P|SMALL)$/.test(n.tagName),isGrid=n=>n.children.length>=2&&[...n.children].every(c=>c.matches('.invest-donut-card'));
 const subs=[];let lead=[];
 els.forEach(n=>{
  if(isHead(n)){lead.push(n);return}
  if(isNote(n)){if(lead.length||!subs.length)lead.push(n);else subs[subs.length-1].push(n);return}
  if(isGrid(n)){
   if(lead.length){subs.push(lead);lead=[]}
   [...n.children].forEach(c=>{const u=[c];u.card=true;subs.push(u)});return;
  }
  subs.push(lead.concat([n]));lead=[];
 });
 if(lead.length){if(subs.length)subs[subs.length-1]=subs[subs.length-1].concat(lead);else subs.push(lead)}
 if(subs.length<2)return [[id,h]];
 let k=0,j=0;return subs.map(g=>g.card?['c_'+id+'_'+(++k),g.map(n=>n.outerHTML).join('')]:[j++?id+'~'+(j-1):id,g.map(n=>n.outerHTML).join('')]);
}

/* ===== Organizar › Tamanho (zoom do app inteiro) ===== */
function mfSetZoom(v){S.lay=S.lay||{};S.lay.zoom=Math.max(80,Math.min(130,Math.round(+v||100)));applyLay()}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.zoomRange!==undefined){mfSetZoom(t.value);const o=document.getElementById('mfZoomOut');if(o)o.textContent=Math.round(+t.value)+'%'}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.zoomRange!==undefined){mfSetZoom(t.value);save();draw()}});
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.acc){window.__mfAcc=window.__mfAcc||{};window.__mfAcc[t.dataset.acc]=t.open}},true);

function mfFlowToggle(k){const sec=document.querySelector('#app .mf-sum'),h0=sec?sec.offsetHeight:0;
 window.__mfFlow=window.__mfFlow===k?'':k;setTimeout(()=>{if(sec&&typeof mfAnimH==='function')mfAnimH(sec,h0,!!window.__mfFlow);if(k==='all'&&window.mfTxApply)mfTxApply()},0);
 document.querySelectorAll('.mf-flow-tile').forEach(t=>t.setAttribute('aria-expanded',String(t.dataset.flow===window.__mfFlow)));
 document.querySelectorAll('.mf-flow-list').forEach(l=>{l.hidden=l.dataset.flowList!==window.__mfFlow});
}
document.addEventListener('click',e=>{if(document.body.classList.contains('org-on'))return;const t=e.target.closest&&e.target.closest('.mf-flow-tile');if(t)mfFlowToggle(t.dataset.flow)});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest&&e.target.closest('.mf-flow-tile');if(t){e.preventDefault();mfFlowToggle(t.dataset.flow)}});
function mfSetAll(k,v){S.lay=S.lay||{};S.lay.all=S.lay.all||{};S.lay.all[k]=Math.round(+v);applyLay()}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.allRange!==undefined){mfSetAll(t.dataset.allRange,t.value);const o=document.getElementById('mfAll_'+t.dataset.allRange);if(o)o.textContent=Math.round(+t.value)+'px'}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.allRange!==undefined){mfSetAll(t.dataset.allRange,t.value);save();draw()}});
function mfSelUpdate(){const n=document.querySelectorAll('.row-sel:checked').length,c=document.getElementById('mfSelCount');if(c)c.textContent=n+' selecionado'+(n===1?'':'s');const d=document.querySelector('[data-mfsel="del"]');if(d)d.disabled=!n}
function mfSel(a){
 if(a==='toggle'){window.__mfSelOn=!window.__mfSelOn;draw()}
 else if(a==='all'){document.querySelectorAll('.mf-selmode .row-sel').forEach(c=>c.checked=true);mfSelUpdate()}
 else if(a==='del'){const ids=[...document.querySelectorAll('.row-sel:checked')].map(c=>String(c.dataset.sel));if(!ids.length)return;if(!confirm('Excluir '+ids.length+' lançamento'+(ids.length>1?'s':'')+'?'))return;const set=new Set(ids);S.trash=Array.isArray(S.trash)?S.trash:[];S.tx.filter(t=>set.has(String(t.id))).forEach(t=>{S.trash.push({...t,deletedAt:TD});mfRecSkip(t)});S.tx=S.tx.filter(t=>!set.has(String(t.id)));window.__mfSelOn=false;save();draw()}
}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-mfsel],.mf-selmode .row');if(!t)return;
 if(t.dataset&&t.dataset.mfsel){e.preventDefault();e.stopPropagation();mfSel(t.dataset.mfsel);return}
 const cb=t.querySelector('.row-sel');if(!cb)return;e.stopPropagation();
 if(e.target===cb){setTimeout(mfSelUpdate,0);return}
 e.preventDefault();cb.checked=!cb.checked;mfSelUpdate()},true);
window.__mfFolded=window.__mfFolded||{};
function mfBigSvg(sv){const r=sv.getBoundingClientRect();return r.width>=90&&r.height>=50}
function mfEnhance(){
 const root=document.getElementById('app');if(!root)return;
 root.querySelectorAll('p.mu,.dash-section-head p,small.mu').forEach(el=>{if(el.classList.contains('mf-clamp')||el.closest('.layout-panel,form,.quick-box,.row,.tool-line,.k,summary,table,.mf-selbar'))return;if((el.textContent||'').trim().length>70)el.classList.add('mf-clamp')});
 root.querySelectorAll('section.c,section[class*="dash-"],.c,.dash-extra-card').forEach(card=>{
  if(card.classList.contains('mf-foldable')||card.classList.contains('mf-sibfold')||card.classList.contains('mf-nofold')||card.matches('details,.k,.form-add,.dash-history,.invest-donut-card')||card.closest('.layout-panel,.quick-box'))return;
  if(card.parentElement&&card.parentElement.closest('.c,section[class*="dash-"]'))return;
  let hd=[...card.children].find(e=>e.matches('h2,h3,.dash-section-head,.mf-card-head')||(e===card.firstElementChild&&e.matches('div:not([class])')&&/^▤/.test(e.textContent.trim())));
  let sib=false;
  if(!hd){const pv=card.previousElementSibling;if(pv&&/^H[23]$/.test(pv.tagName)&&!pv.querySelector('.mf-fold')){hd=pv;sib=true}}
  if(!hd)return;
  if(!card.classList.contains('fold-ok')&&(card.querySelector('.mfchart,.invest-donut-card')||[...card.querySelectorAll('svg')].some(sv=>!sv.closest('button')&&mfBigSvg(sv))))return;
  const key=(window.tab||'')+':'+(hd.textContent||'').replace(/[▸▾]/g,'').replace(/\s+/g,' ').trim().slice(0,48),on=!!window.__mfFolded[key];
  card.dataset.mfFoldKey=key;
  if(sib){card.classList.add('mf-sibfold');hd.__mfCard=card}else card.classList.add('mf-foldable');
  hd.classList.add('mf-keep');
  hd.insertAdjacentHTML('beforeend','<button type="button" class="mf-fold" aria-label="Recolher ou abrir" aria-expanded="'+(!on)+'">▸</button>');
  if(on)card.classList.add('mf-folded');
 });
}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.mf-fold');if(!b){const c=e.target.closest&&e.target.closest('.mf-clamp');if(c&&!document.body.classList.contains('org-on')&&!e.target.closest('a,button'))c.classList.toggle('mf-open');return}
 if(document.body.classList.contains('org-on'))return;e.preventDefault();e.stopPropagation();
 const card=b.closest('.mf-foldable')||(b.parentElement&&b.parentElement.__mfCard);if(!card)return;const h0=card.offsetHeight,f=card.classList.toggle('mf-folded');mfAnimH(card,h0,!f);b.setAttribute('aria-expanded',String(!f));const k=card.dataset.mfFoldKey;if(k){if(f)window.__mfFolded[k]=1;else delete window.__mfFolded[k]}},true);
/* 1.21: abrir e recolher com animação (altura + conteúdo aparecendo); respeita "Animações desligadas" */
function mfNoAnim(){return document.documentElement.getAttribute('data-mfanim')==='0'||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function mfAnimH(el,h0,abrindo){if(mfNoAnim()||!el.animate)return;const h1=el.offsetHeight;if(Math.abs(h1-h0)<4)return;const ov=el.style.overflow;el.style.overflow='hidden';
 const a=el.animate([{height:h0+'px'},{height:h1+'px'}],{duration:abrindo?320:240,easing:'cubic-bezier(.2,.8,.2,1)'});a.onfinish=a.oncancel=()=>{el.style.overflow=ov};
 if(abrindo)[...el.children].forEach((c,i)=>{if(c.matches('h2,summary,.mf-keep,.mf-fold'))return;c.animate&&c.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:300,delay:Math.min(160,i*30),easing:'ease',fill:'backwards'})})}
document.addEventListener('click',e=>{const s=e.target.closest&&e.target.closest('#app details>summary');if(!s||e.defaultPrevented||document.body.classList.contains('org-on'))return;const d=s.parentElement;d.__mfUser=Date.now();
 if(!d.open||mfNoAnim()||!d.animate)return;e.preventDefault();const h0=d.offsetHeight,h1=s.offsetHeight+(d.offsetHeight-d.clientHeight);d.style.overflow='hidden';
 const a=d.animate([{height:h0+'px'},{height:h1+'px'}],{duration:220,easing:'ease'});a.onfinish=()=>{d.open=false;d.style.overflow=''}});
document.addEventListener('toggle',e=>{const d=e.target;if(!d||!d.matches||!d.matches('#app details')||!d.open||!(Date.now()-(d.__mfUser||0)<600))return;const s=d.querySelector(':scope>summary');mfAnimH(d,s?s.offsetHeight+(d.offsetHeight-d.clientHeight):0,true)},true);
document.addEventListener('mf-card-close',()=>mfEnhance());
setTimeout(mfEnhance,300);
/* ===== Investir (nova estrutura) ===== */
const IV_COL={acao:'#5b8def',fii:'#38a889',etf:'#9b8afb',rf:'#d5a348',rv:'#e56b7b'};
const IV_NOME={acao:'Ações',fii:'FIIs',etf:'ETFs',rf:'Renda fixa',rv:'Reserva'};
const IV_NOME1={acao:'Ação',fii:'FII',etf:'ETF',rf:'Renda fixa',rv:'Reserva'};
function ivClass(a){return /reserva/i.test(a.a||'')?'rv':fcl(a)}
function ivSg(v){return (v>=0?'+':'−')+R(Math.abs(v))}
function ivSp(v){return (v>=0?'+':'−')+Math.abs(v).toFixed(1).replace('.',',')+'%'}
function ivEnsure(){S.invView=S.invView&&typeof S.invView==='object'?S.invView:{};const V=S.invView;V.rShow=Array.isArray(V.rShow)?V.rShow:['essencial','falta'];V.rMeses=+V.rMeses>0?+V.rMeses:6;return V}
function ivMeusAtivos(I,oldHtml){
 const doc=new DOMParser().parseFromString('<body>'+oldHtml+'</body>','text/html'),edits={},dels={};
 doc.querySelectorAll('article.invest-asset-row').forEach(ar=>{const i=ar.getAttribute('data-invest-index');const d=ar.querySelector('details.invest-edit-details');if(d)edits[i]=d.outerHTML})
 const total=I.reduce((s,a)=>s+ivNow(a),0)||1,fil=F.fil||'',sort='val',view='cards';
 let list=I.map((a,i)=>[a,i]).filter(([a])=>!fil||fcl(a)==fil);
 const cmp={val:(x,y)=>ivNow(y[0])-ivNow(x[0]),rent:(x,y)=>(ivPct(y[0])??-1e9)-(ivPct(x[0])??-1e9),az:(x,y)=>String(x[0].a).localeCompare(String(y[0].a))}[sort]||null;if(cmp)list.sort(cmp);
 const card=([a,i])=>{const k=ivClass(a),col=IV_COL[k],now=ivNow(a),cost=ivCost(a),g=ivGain(a),pc=ivPct(a),q=ivQuote(a),w=now/total*100,nm_=escH(String(a.a==='NOVO'?'Novo ativo':(a.a||'Novo ativo')));
  const badge=escH(String(a.a||'?').replace(/[^A-Za-z0-9]/g,'').slice(0,4).toUpperCase()||'?');
  const sub=a.f?(IV_NOME1[k]+(isCdbAsset(a)?` · ${a.cdbPercent??100}% CDI`:'')):`${IV_NOME1[k]} · ${(+a.q||0)} cota${(+a.q||0)===1?'':'s'}`;
  const pill=pc==null?'<span class="iv-pill mu">sem cotação</span>':`<span class="iv-pill ${pc>=0?'ok':'bad'}">${pc>=0?'▲':'▼'} ${Math.abs(pc).toFixed(1).replace('.',',')}%</span>`;
  const meta=`<span>PM <b>${R(+a.p||0)}</b></span>${!a.f&&q?`<span>Cotação <b>${R(q)}</b></span>`:''}${g!=null?`<span class="${g>=0?'ok':'bad'}">Lucro <b>${ivSg(g)}</b></span>`:''}<span>${w.toFixed(1).replace('.',',')}% da carteira</span>`;
  return `<article class="ia-card ${view==='list'?'ia-list':''}" data-invest-index="${i}" style="--ia:${col}"><div class="ia-top"><div class="ia-badge">${badge}</div><div class="ia-id"><b>${nm_}</b><small>${sub}</small></div><div class="ia-val"><b>${R(now)}</b>${pill}</div><span class="ia-del">${xb('inv:'+i)}</span></div><div class="iv-bar iv-bar-s"><i style="width:${Math.max(1.5,w).toFixed(1)}%;background:${col}"></i></div><div class="ia-meta">${meta}</div>${edits[i]||''}</article>`};
 const chips=(items,cur,attr)=>items.map(([k,n])=>`<button type="button" data-${attr}="${k}" class="${cur===k?'on':''}">${n}</button>`).join('');
 return `${B('i_ativos')}<section class="c ia-panel"><h2>Meus ativos</h2>
 <div class="ia-head"><span class="mu" style="font-size:12px">${I.length} ativo${I.length===1?'':'s'} · <b style="color:var(--tx)">${R(total===1&&!I.length?0:total)}</b></span><button type="button" class="mini-btn" data-refresh-quotes>↻ Cotações</button></div>
 <div class="ia-add"><button class="b" data-add="inv">＋ Novo ativo</button><button class="b s" data-add="fixed">＋ Renda fixa</button></div>
 <div class="ch invest-filters">${[['','Todos'],['acao','Ações'],['etf','ETFs'],['fii','FIIs'],['rf','Renda fixa']].map(([k,n])=>`<button data-fil="${k==''?'todos':k}" class="${(F.fil||'todos')==(k||'todos')?'on':''}">${n}</button>`).join('')}</div>
 <div class="ia-grid ${view==='list'?'is-list':''}">${list.map(card).join('')||'<div class="mu" style="padding:18px 4px;text-align:center">Nenhum ativo aqui. Toque em “Novo ativo”.</div>'}</div>
 ${S.quoteUpdatedAt?`<div class="iv-sub" style="margin-top:8px">Cotações: ${new Date(S.quoteUpdatedAt).toLocaleString('pt-BR')}${S.quoteError?' · '+escH(S.quoteError):''}</div>`:''}</section>`}
function rawBlocks(html){const p=String(html).split(/<!--b:([\w~]+)-->/),r=[];for(let i=1;i<p.length;i+=2)r.push([p[i],p[i+1]]);return r}
document.addEventListener('click',e=>{
 const r=e.target.closest&&e.target.closest('[data-ivr]');if(r){e.preventDefault();e.stopPropagation();const V=ivEnsure(),k=r.dataset.ivr,i=V.rShow.indexOf(k);if(i>=0)V.rShow.splice(i,1);else V.rShow.push(k);window.__ivEdit=true;save();draw();return}
 const s=e.target.closest&&e.target.closest('[data-isort]');if(s){e.stopPropagation();F.isort=s.dataset.isort;draw();return}
 const v=e.target.closest&&e.target.closest('[data-iview]');if(v){e.stopPropagation();F.iview=v.dataset.iview;draw();return}
},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.matches&&t.matches('[data-ivr-gasto]')){const V=ivEnsure();V.rGasto=plNum(t.value);window.__ivEdit=true;save();draw();return}if(t&&t.matches&&t.matches('[data-ivr-meses]')){const V=ivEnsure();V.rMeses=Math.max(1,Math.min(60,parseInt(t.value,10)||6));window.__ivEdit=true;save();draw()}});

document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('iv-edit'))window.__ivEdit=t.open},true);

/* ===== Central de contas ===== */
function plEnsure(){
 S.plan=S.plan&&typeof S.plan==='object'?S.plan:{};const P=S.plan;
 P.proj=Object.assign({aporte:300,taxa:8,anos:10},P.proj||{});P.metas=Array.isArray(P.metas)?P.metas:[];
 P.gasto=Object.assign({sal:0,itens:[]},P.gasto||{});if(!Array.isArray(P.gasto.itens))P.gasto.itens=[];
 if(!Array.isArray(P.rendas)){P.rendas=[];if(+P.gasto.sal>0)P.rendas.push({n:'Salário',desc:'',v:+P.gasto.sal,dc:0});P.gasto.sal=0}
 return P}
/* --- Cartão de crédito e faturas --- */
/* --- Simulador de gastos --- */
/* --- ações --- */
function plAct2(a,i,sub){
 const P=plEnsure(),v=id=>((document.getElementById(id)||{}).value||'').trim(),toast=m=>typeof mfToast==='function'&&mfToast(m);
 if(a==='cb-month'){window.__cbm=sub;draw();return}
 if(a==='cancel'){window.__plEd=null;draw();return}
 if(a==='r-add'){const n=v('pl-rn'),val=plNum(v('pl-rv'));if(!n||!(val>0)){toast('Informe o nome e o valor da renda.');return}const r={n,desc:v('pl-rdesc'),v:val,dc:plNum(v('pl-rdc'))},ed=window.__plEd;if(ed&&ed.t==='r'&&P.rendas[ed.i])P.rendas[ed.i]=r;else P.rendas.push(r);window.__plEd=null;plSave();return}
 if(a==='r-edit'){window.__plEd={t:'r',i};draw();return}
 if(a==='r-del'){if(confirm('Remover esta renda?')){P.rendas.splice(i,1);window.__plEd=null;plSave()}return}
 if(a==='g-add'){let n=v('pl-gn'),val=plNum(v('pl-gv')),d=v('pl-gdesc');if(!(val>0)){const r=plParseGasto(n);if(r){n=r.n;val=r.v}}if(!n||!(val>0)){toast('Informe o nome e o valor do gasto.');return}const g={n:n.charAt(0).toUpperCase()+n.slice(1),desc:d,v:val},ed=window.__plEd;if(ed&&ed.t==='g'&&P.gasto.itens[ed.i])P.gasto.itens[ed.i]=g;else P.gasto.itens.push(g);window.__plEd=null;plSave();return}
 if(a==='g-edit'){window.__plEd={t:'g',i};draw();return}
 if(a==='g-del'){P.gasto.itens.splice(i,1);window.__plEd=null;plSave();return}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pc]');if(!b||document.body.classList.contains('org-on'))return;e.preventDefault();e.stopPropagation();plAct2(b.dataset.pc,b.dataset.pci===undefined?undefined:+b.dataset.pci,b.dataset.pcs)},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&(e.target.id==='pl-gn'||e.target.id==='pl-gv'||e.target.id==='pl-gdesc')){e.preventDefault();plAct2('g-add')}else if(e.key==='Enter'&&e.target&&/^pl-r/.test(e.target.id||'')){e.preventDefault();plAct2('r-add')}});

/* ===== Simulador de metas (visual) ===== */

/* ===== Lançamentos por vários meses (fixos) ===== */
function fxEnsure(){S.fixed=Array.isArray(S.fixed)?S.fixed:[];return S.fixed}
function fxRows(id){return S.tx.filter(t=>t.fixedId===id).sort((a,b)=>a.d.localeCompare(b.d))}
function fxRowFor(it,i){const base=`${it.start}-${String(it.day).padStart(2,'0')}`,d=i?shiftMonthDate(base,i):base,rec=it.kind==='Receita',c=rec?'Receita':(SUB_TO_LEGACY[it.s||'Pessoal']||'Lazer e Pessoal');return{id:'n'+Date.now()+'f'+i+Math.random().toString(36).slice(2,5),n:it.n,v:+it.v,e:'',d,c,g:rec?'':inferMain(c,it.s),s:rec?'':(it.s||'Pessoal'),t:rec?'':it.t,fixedId:it.id,...(!rec&&it.t==='Crédito'&&it.cc?{cc:it.cc}:{})}}
/* guarda o que já foi digitado no "Novo recorrente" ao trocar Despesa/Receita, pagamento ou cartão (a troca redesenha a tela) */
function fxKeep(){const ids=['fx-n','fx-v','fx-m','fx-d','fx-s','fx-c'],v={};ids.forEach(i=>{const el=document.getElementById(i);if(el)v[i]=el.value});
 return ()=>ids.forEach(i=>{const el=document.getElementById(i);if(!el||v[i]===undefined)return;if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===v[i]))return;el.value=v[i]})}
/* Script 1 · 19C: aviso de recorrente cadastrado duas vezes. A pessoa escolhe: apagar só as cópias repetidas (vão para a Lixeira) ou dizer que não é duplicado. */
function mfDupRecGroups(){const g=new Map();mfDupRec().forEach(x=>{const o=g.get(x.key)||{key:x.key,n:String(x.n||'').replace(/\s*\(\d+\/\d+\)\s*$/,''),meses:[],vr:+x.rec.v||0,vf:+x.fx.v||0};o.meses.push(x.m);g.set(x.key,o)});return [...g.values()]}
function mfDupRecHtml(){const G=mfDupRecGroups();if(!G.length)return '';
 return `<div class="mf-dup" role="note"><b>Possível duplicado</b>${G.map(o=>`<div class="mf-dup-it"><span>${escH(o.n)} aparece 2 vezes em ${o.meses.length} ${o.meses.length===1?'mês':'meses'} (a partir de ${mfMs(o.meses[0])}): uma aqui (${R(o.vf)}) e outra num lançamento automático antigo (${R(o.vr)}). O saldo e o fluxo de caixa contam as duas.</span><div class="mf-dup-b"><button type="button" class="b" data-dupfix="${escH(o.key)}">Apagar as cópias repetidas</button><button type="button" class="b s" data-dupok="${escH(o.key)}">Não é duplicado</button></div></div>`).join('')}</div>`}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;let b;
 if(b=t.closest('[data-dupok]')){e.preventDefault();e.stopPropagation();S.dupOk=Array.isArray(S.dupOk)?S.dupOk:[];if(!S.dupOk.includes(b.dataset.dupok))S.dupOk.push(b.dataset.dupok);save();draw();return}
 if(b=t.closest('[data-dupfix]')){e.preventDefault();e.stopPropagation();const key=b.dataset.dupfix,gone=mfDupRec().filter(x=>x.key===key).map(x=>x.rec);if(!gone.length)return;
  if(!confirm(`Apagar ${gone.length} ${gone.length===1?'cópia repetida':'cópias repetidas'} (o lançamento automático antigo nesses meses)? Vão para a Lixeira e o recorrente desta tela continua.`))return;
  S.trash=Array.isArray(S.trash)?S.trash:[];gone.forEach(x=>{S.trash.push({...x,deletedAt:TD});mfRecSkip(x)});const ids=new Set(gone.map(x=>x.id));S.tx=S.tx.filter(x=>!ids.has(x.id));save();draw();try{mfToast('Cópias repetidas na Lixeira ✓')}catch(_){}}},true);
function fixedHtml(){
 const L=fxEnsure(),ed=window.__fxEd,subs=Object.keys(SUB_TO_LEGACY),kind=window.__fxKind||'Despesa',pay=window.__fxPay||'Pix';
 const rows=L.map(it=>{const r=fxRows(it.id),first=r[0],last=r[r.length-1],isEd=ed===it.id;
  return `<div class="fx-item"><div class="fx-top"><div style="min-width:0"><b style="overflow-wrap:anywhere">${escH(it.n)}</b><small class="mu" style="display:block">${r.length} ${r.length===1?'mês':'meses'}${first?` · ${mfMs(first.d.slice(0,7))} a ${mfMs(last.d.slice(0,7))}`:''} · ${it.kind==='Receita'?'Receita':escH(it.t||'')+(it.t==='Crédito'&&it.cc&&mfCards().length>1?' · '+escH(mfCardName(mfCardById(it.cc))):'')}</small></div><div class="fx-act"><b class="${it.kind==='Receita'?'ok':'bad'}">${R(+it.v||0)}</b><button type="button" data-fx="edit" data-fxi="${it.id}" aria-label="Editar em todos os meses">✎</button><button type="button" data-fx="del" data-fxi="${it.id}" aria-label="Apagar de todos os meses">✕</button></div></div>
  ${isEd?`<div class="fx-edit"><label><small class="fld-l">Nome</small><input id="fx-en" value="${escH(it.n)}"></label><label><small class="fld-l fld-v">Valor (R$)</small><input id="fx-ev" inputmode="decimal" value="${escH(plFmt(+it.v))}"></label><div class="pl-btns" style="grid-column:1/-1"><button type="button" class="b" data-fx="save" data-fxi="${it.id}">Salvar em todos os meses</button><button type="button" class="b s" data-fx="cancel">Cancelar</button></div></div>`:''}</div>`}).join('');
 const chip=(attr,val,cur,label)=>`<button type="button" data-fx="${attr}" data-fxv="${val}" class="${cur===val?'on':''}">${label}</button>`;
 return B('ext_fixos')+`<section class="c fx-box"><h2>Recorrentes</h2><p class="mf-bsub">Cadastre uma vez e o app lança a conta ou receita sozinho todo mês, no mesmo dia.</p>${mfDupRecHtml()}
 <details class="cb-more fx-new" ${L.length&&!window.__fxNew?'':'open'}><summary>＋ Novo recorrente</summary>
 <div class="ch" style="margin-top:8px">${chip('kind','Despesa',kind,'Despesa')}${chip('kind','Receita',kind,'Receita')}</div>
 <div class="pl-grid" style="margin-top:8px"><label class="pl-f"><small class="fld-l">Descrição</small><input id="fx-n" placeholder="Ex.: Aluguel"></label><label class="pl-f"><small class="fld-l fld-v">Valor (R$)</small><input id="fx-v" inputmode="decimal" placeholder="0,00"></label><label class="pl-f"><small class="fld-l">Quantos meses</small><input id="fx-m" inputmode="numeric" value="12"></label><label class="pl-f"><small class="fld-l">Dia do mês</small><input id="fx-d" inputmode="numeric" value="${Math.min(28,+TD.slice(8,10)||5)}"></label><label class="pl-f"><small class="fld-l">Começa em</small><input id="fx-s" type="month" value="${ym}"></label>${kind==='Despesa'?`<label class="pl-f"><small class="fld-l">Categoria</small><select id="fx-c">${subs.map(s=>`<option ${s==='Moradia'?'selected':''}>${escH(s)}</option>`).join('')}</select></label>`:''}</div>
 ${kind==='Despesa'?`<div class="ch" style="margin-top:8px">${['Pix','Crédito','VR'].map(t=>chip('pay',t,pay,t)).join('')}</div>`:''}${kind==='Despesa'&&pay==='Crédito'?mfFxCcChips():''}
 <button type="button" class="b" data-fx="create" style="width:100%;margin-top:10px">Lançar em todos os meses</button></details>
 <div class="fx-list"><div class="mf-day"><span>Seus recorrentes</span><small>${L.length}</small></div>${rows||'<div class="mf-es"><span class="mf-es-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg></span><b class="mf-es-t">Nenhum recorrente ainda</b><p class="mf-es-d">Crie um acima para lançar, por exemplo, o aluguel de uma vez nos próximos meses.</p></div>'}</div></section>`}
function fxAct(a,id,val){
 const L=fxEnsure(),g=i=>((document.getElementById(i)||{}).value||'').trim(),toast=m=>typeof mfToast==='function'&&mfToast(m);
 if(a==='kind'){const r=fxKeep();window.__fxKind=val;draw();r();return}
 if(a==='pay'){const r=fxKeep();window.__fxPay=val;draw();r();return}
 if(a==='cc'){const r=fxKeep();window.__fxCc=val;draw();r();return}
 if(a==='edit'){window.__fxEd=id;draw();return}
 if(a==='cancel'){window.__fxEd=null;draw();return}
 if(a==='save'){const it=L.find(x=>x.id===id);if(!it)return;const n=g('fx-en'),v=plNum(g('fx-ev'));if(!n||!(v>0)){toast('Informe nome e valor.');return}it.n=n;it.v=v;S.tx.forEach(t=>{if(t.fixedId===id){t.n=n;t.v=v}});window.__fxEd=null;save();draw();return}
 if(a==='del'){const it=L.find(x=>x.id===id);if(!it)return;const n=fxRows(id).length;if(!confirm(`Apagar “${it.n}” de todos os meses (${n} lançamento${n===1?'':'s'})?`))return;S.tx=S.tx.filter(t=>t.fixedId!==id);S.fixed=L.filter(x=>x.id!==id);window.__fxEd=null;save();draw();return}
 if(a==='create'){const kind=window.__fxKind||'Despesa',n=g('fx-n'),v=plNum(g('fx-v')),m=Math.max(1,Math.min(120,parseInt(g('fx-m'),10)||1)),day=Math.max(1,Math.min(28,parseInt(g('fx-d'),10)||1)),start=g('fx-s')||ym;if(!n||!(v>0)){toast('Informe a descrição e o valor.');return}
  const it={id:'fx'+Date.now(),n,v,kind,t:kind==='Receita'?'':(window.__fxPay||'Pix'),s:kind==='Receita'?'':(g('fx-c')||'Moradia'),start,day,months:m};if(it.t==='Crédito')it.cc=mfFxCcSel();window.__fxNew=false;L.push(it);for(let i=0;i<m;i++)S.tx.push(fxRowFor(it,i));save();draw();toast(`${m} lançamentos criados.`)}}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.classList&&d.classList.contains('fx-new'))window.__fxNew=d.open},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-fx]');if(!b||document.body.classList.contains('org-on'))return;e.preventDefault();e.stopPropagation();fxAct(b.dataset.fx,b.dataset.fxi,b.dataset.fxv)},true);

/* ===== Modo offline: mesclagem local-primeiro ===== */
function mfKey(o){return o&&typeof o==='object'&&!Array.isArray(o)?(o.id!==undefined?'i:'+o.id:(o.a!==undefined&&o.q!==undefined?'a:'+o.a:null)):null}
function mfMerge(base,local,remote){
 const J=JSON.stringify;
 if(J(local)===J(remote))return local;
 if(base!==undefined&&J(local)===J(base))return remote;
 if(base!==undefined&&J(remote)===J(base))return local;
 if(Array.isArray(local)&&Array.isArray(remote)){
  const b=Array.isArray(base)?base:[];
  if(![...local,...remote,...b].every(x=>mfKey(x)!==null))return local;
  const mp=a=>{const m=new Map();a.forEach(x=>m.set(mfKey(x),x));return m},L=mp(local),Rm=mp(remote),B=mp(b),out=[];
  [...remote.map(mfKey),...local.map(mfKey)].filter((k,i,a)=>a.indexOf(k)===i).forEach(k=>{
   const l=L.get(k),r=Rm.get(k),bb=B.get(k);
   if(l&&r)out.push(mfMerge(bb,l,r));
   else if(l){if(!bb||J(l)!==J(bb))out.push(l)}   // remoto apagou: só mantém se o local alterou
   else if(r){if(!bb)out.push(r)}                    // local apagou: continua apagado
  });
  return out}
 if(local&&remote&&typeof local==='object'&&typeof remote==='object'&&!Array.isArray(local)&&!Array.isArray(remote)){
  const out={},b=base&&typeof base==='object'&&!Array.isArray(base)?base:{};
  new Set([...Object.keys(local),...Object.keys(remote)]).forEach(k=>{
   const inL=k in local,inR=k in remote;
   if(inL&&inR)out[k]=(k==='skip'||k==='dupOk')&&Array.isArray(local[k])&&Array.isArray(remote[k])?[...new Set([...remote[k],...local[k]])].sort():mfMerge(b[k],local[k],remote[k]);
   else if(inL){if(!(k in b)||J(local[k])!==J(b[k]))out[k]=local[k]}
   else{if(!(k in b))out[k]=remote[k]}
  });
  return out}
 return local}
function mfStore(k,v){try{if(v===null)_storage.removeItem(k);else _storage.setItem(k,v)}catch(e){}}
function mfGet(k){try{return _storage.getItem(k)}catch(e){return null}}
function mfSetBase(j){mfStore('fin1_base',j)}
function mfClearPending(){mfStore('fin1_pending','0');mfNetUpdate()}
function mfPending(){return mfGet('fin1_pending')==='1'}
function mfReconcile(uid,remote){
 let local=null,base=null;
 if(mfGet('fin1_uid')===uid&&mfPending()){try{local=JSON.parse(mfGet('fin1')||'null');base=JSON.parse(mfGet('fin1_base')||'null')}catch(e){}}
 if(local&&typeof local==='object')return mfMerge(base||remote,local,remote);
 return remote}
async function mfPush(){
 if(!supabaseClient||!authUser)return;
 if(!navigator.onLine){sync='offline';window.updateCloudStatus?.();mfNetUpdate();mfBgSync();return}
 if(mfPushing){mfPushAgain=true;return} // um envio por vez: evita gravações cruzadas
 mfPushing=true;
 const snapshot=JSON.stringify(S);
 try{
  if(cloudRev!==null&&cloudLast&&(snapshot===cloudLast||(window.mfSameData&&mfSameData(JSON.parse(snapshot),JSON.parse(cloudLast))))){dirty=false;mfClearPending();sync='ok';window.updateCloudStatus?.();return}
  sync='syncing';window.updateCloudStatus?.();
  let toPush=JSON.parse(snapshot),merged=false,done=false,rev=cloudRev,baseJ=cloudLast||mfGet('fin1_base')||'';
  /* caminho novo: grava só se a versão na nuvem ainda é a que este aparelho conhece; senão junta as duas e tenta de novo */
  if(rev!==null){
   for(let i=0;i<4&&!done;i++){
    const {data:res,error}=await MF_DB.appData.saveState({p_data:toPush,p_rev:rev});
    if(error){if(error.code==='PGRST202'||error.code==='42883'){rev=null;break}throw error}
    if(res&&res.ok){rev=+res.rev;done=true;break}
    const remote=res&&res.data;if(!remote||typeof remote!=='object')throw new Error('Resposta inválida do servidor');
    let base;try{base=baseJ?JSON.parse(baseJ):undefined}catch(e){}
    toPush=mfMerge(base===undefined?remote:base,toPush,remote);merged=true;baseJ=JSON.stringify(remote);rev=+res.rev;
   }
   if(!done&&rev!==null)throw new Error('Os dados mudaram em outro aparelho várias vezes seguidas; tento de novo em instantes.');
  }
  /* caminho antigo (servidor sem a função mf_salvar_estado) */
  if(!done){
   const {data:row,error:e0}=await MF_DB.appData.dataOf(authUser.id);if(e0)throw e0;
   if(row&&row.data&&JSON.stringify(row.data)!==baseJ){let base;try{base=baseJ?JSON.parse(baseJ):undefined}catch(e){}toPush=mfMerge(base===undefined?row.data:base,toPush,row.data);merged=true}
   const {error}=await MF_DB.appData.upsertLegacy({user_id:authUser.id,data:toPush,updated_at:new Date().toISOString()});if(error)throw error;
  }
  const pj=JSON.stringify(toPush);
  cloudRev=rev;cloudLast=pj;mfSetBase(pj);mfStore('fin1_rev',rev===null?null:String(rev));
  if(merged){
   /* traz para a tela o que veio de outro aparelho, sem perder o que foi digitado durante o envio */
   const now=JSON.stringify(S);let next=toPush;
   if(now!==snapshot){try{next=mfMerge(JSON.parse(snapshot),S,toPush)}catch(e){next=S}}
   const same=window.mfSameData&&mfSameData(S,next);S=next;mfStore('fin1',JSON.stringify(S));if(!same)draw();
  }
  queueExtras(15000);
  if(JSON.stringify(S)===pj){dirty=false;mfClearPending()}else{mfStore('fin1_pending','1');queueCloudSave()}
  window.__mfPushFails=0;sync='ok';window.updateCloudStatus?.();mfNetUpdate()
 }catch(e){const n=window.__mfPushFails=(window.__mfPushFails||0)+1;mfStore('fin1_pending','1');
  if(navigator.onLine&&n<4){sync='syncing';window.updateCloudStatus?.();console.warn('Supabase save (nova tentativa '+n+'):',e);setTimeout(()=>{if(authUser&&(dirty||mfPending()))queueCloudSave()},[3000,8000,20000][n-1])}
  else{sync=navigator.onLine?'erro':'offline';window.updateCloudStatus?.(navigator.onLine?'Falha ao salvar na nuvem. Suas alterações estão salvas neste aparelho.':undefined);console.error('Supabase save:',e)}mfNetUpdate()}
 finally{mfPushing=false;if(mfPushAgain){mfPushAgain=false;queueCloudSave()}}}
/* Ao voltar para o app (ou a internet voltar): confere a nuvem e retoma a sincronização sozinho */
let mfCatchBusy=false;
async function mfCatchUp(){
 if(typeof supabaseClient==='undefined'||!supabaseClient||!authUser||!navigator.onLine||mfCatchBusy||mfPushing)return;
 if(dirty||mfPending()){window.__mfPushFails=0;queueCloudSave();return}
 mfCatchBusy=true;
 try{const {data:row,error}=await MF_DB.appData.dataRevOf(authUser.id);if(error)throw error;
  if(row&&row.data&&typeof row.data==='object'&&!dirty&&!mfPending()&&!mfPushing&&(row.rev==null||cloudRev===null||+row.rev>cloudRev)){const j=JSON.stringify(row.data);
   if(j!==cloudLast){const same=window.mfSameData&&mfSameData(S,row.data);S=row.data;mfStore('fin1',j);cloudLast=j;mfSetBase(j);if(!same)draw()}
   if(row.rev!=null){cloudRev=+row.rev;mfStore('fin1_rev',String(cloudRev))}}
  window.__mfPushFails=0;if(sync==='erro')sync='ok';window.updateCloudStatus?.();mfNetUpdate()}
 catch(e){console.warn('Retomar sincronização:',e)}finally{mfCatchBusy=false}}
window.mfCatchUp=mfCatchUp;
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&typeof authUser!=='undefined'&&authUser)setTimeout(mfCatchUp,800)});
/* Background Sync: o service worker avisa quando a internet voltou */
try{navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.type==='mf-sync'&&authUser&&(dirty||mfPending()))queueCloudSave()})}catch(e){}
window.mfSyncDot=function(){const st=typeof authUser==='undefined'||!authUser||!navigator.onLine||sync==='erro'||sync==='offline'?'bad':(sync==='syncing'||dirty||mfPending())?'busy':'ok',tt=st==='ok'?'Sincronizado':st==='busy'?'Sincronizando…':'Não sincronizado';document.querySelectorAll('.mf-sync-dot').forEach(d=>{d.className='mf-sync-dot '+st;d.title=tt})};
(window.__mfAD=window.__mfAD||[]).push(()=>{try{mfSyncDot()}catch(e){}});
/* OK ao preencher: aparece junto do campo em edição; tocar confirma (salva) e fecha o teclado */
(function(){let pill=null,cur=null;const isTxt=el=>!!el&&(el.tagName==='TEXTAREA'||(el.tagName==='INPUT'&&/^(text|number|tel|email|search|url|password|)$/i.test(el.type||'')))&&!el.readOnly&&!el.disabled;
 const where=el=>el.closest('#app,#mf-cfg,#mf-lp,#mf-vw-sheet,.tx-edit-modal,#asset-modal-backdrop,#fixed-income-backdrop');
 const clear=c=>!c||c==='transparent'||/rgba\([^)]*,\s*0\)$/.test(c);
 const boxOf=el=>{const cs=getComputedStyle(el);if(!clear(cs.backgroundColor)||parseFloat(cs.borderTopWidth)>0)return el;const p=el.parentElement;if(p&&p.matches('label,.mf-fld,.mfc-f')&&!clear(getComputedStyle(p).backgroundColor))return p;return el};
 const inside=el=>{if(el.tagName!=='INPUT'||/^(date|time|month)$/i.test(el.type||''))return null;const bx=boxOf(el),r=bx.getBoundingClientRect();return r.width>=220&&r.height>=38?r:null};
 const place=()=>{if(!pill||!cur||!cur.isConnected){hide();return}const r=cur.getBoundingClientRect(),vv=window.visualViewport,vh=vv?vv.height+vv.offsetTop:innerHeight;
  const ib=inside(cur);if(ib){pill.classList.add('in');if(!cur.dataset.okpad){cur.dataset.okpad=cur.style.paddingRight||'-';cur.style.setProperty('padding-right','78px','important')}const ph=pill.offsetHeight||30,pw=pill.offsetWidth||64;pill.style.top=(ib.top+(ib.height-ph)/2)+'px';pill.style.left=(ib.right-pw-7)+'px';return}
  pill.classList.remove('in');unpad(cur);let top=r.top-36;if(top<56)top=r.bottom+6;if(top+34>vh-4)top=Math.max(4,r.top-38);pill.style.top=top+'px';pill.style.left=Math.max(8,Math.min(innerWidth-74,r.right-66))+'px'};
 const show=el=>{if(cur&&cur!==el)unpad(cur);cur=el;if(!pill){pill=document.createElement('button');pill.type='button';pill.id='mf-okpill';pill.textContent='OK ✓';pill.setAttribute('aria-label','Confirmar');
  pill.addEventListener('pointerdown',e=>e.preventDefault());pill.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const c=cur;hide();if(c)c.blur()});document.body.appendChild(pill)}pill.hidden=false;place()};
 const unpad=el=>{if(el&&el.dataset&&el.dataset.okpad){const v=el.dataset.okpad;delete el.dataset.okpad;el.style.removeProperty('padding-right');if(v!=='-')el.style.paddingRight=v}};
 const hide=()=>{if(pill)pill.hidden=true;unpad(cur);cur=null};
 document.addEventListener('focusin',e=>{const t=e.target;if(isTxt(t)&&where(t))show(t);else hide()},true);
 document.addEventListener('focusout',e=>{setTimeout(()=>{if(cur&&document.activeElement!==cur)hide()},120)},true);
 addEventListener('scroll',place,{passive:true,capture:true});addEventListener('resize',place);window.visualViewport&&visualViewport.addEventListener('resize',place)})();
function mfNetUpdate(){try{mfSyncDot()}catch(e){}document.querySelectorAll('.sync-indicator').forEach(i=>i.classList.toggle('is-offline',!navigator.onLine));const old=document.getElementById('mf-net');if(old)old.remove()}