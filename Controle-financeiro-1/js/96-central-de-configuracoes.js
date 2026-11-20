
/* ===== Central de Configurações (patch 25) ===== */
(function(){
const H=v=>escH(String(v==null?'':v));
const prof=()=>{S.profile=S.profile&&typeof S.profile==='object'?S.profile:{};return S.profile};
const prefs=()=>{S.prefs=S.prefs&&typeof S.prefs==='object'?S.prefs:{};S.prefs.notif=S.prefs.notif||{};return S.prefs};
const TABN={res:'Dashboard',add:'Lançamentos',mais:'Contas',inv:'Patrimônio',anal:'Análises',geral:'Central'};
const I={
 tema:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
 telas:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
 org:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
 notif:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
 seg:'<path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6Z"/>',
 backup:'<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4.2 4.2 0 0 1-.5 8.5"/><path d="M12 12v8M9 15l3-3 3 3"/>',
 plano:'<path d="M6 3h12l3 6-9 12L3 9Z"/><path d="M3 9h18M9 3l3 6 3-6M12 9v12"/>',
rel:'<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8Z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h5"/>',
 mover:'<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'
};
I.adm='<path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>';const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
let view='main',blocksCache=null;
const row=(v,k,t,sub,tag)=>`<button type="button" class="mfc-row" data-cfgv="${v}"><span class="mfc-ri">${svg(k)}</span><span class="mfc-rt"><b>${t}</b>${sub?`<small>${sub}</small>`:''}</span>${tag?`<em class="mfc-new">${tag}</em>`:''}<span class="mfc-chev">›</span></button>`;
const sw=(key,on,t,sub,dis)=>`<label class="mfc-sw${dis?' dis':''}"><span><b>${t}</b>${sub?`<small>${sub}</small>`:''}</span><input type="checkbox" data-cfgsw="${key}" ${on?'checked':''} ${dis?'disabled':''}><i aria-hidden="true"></i></label>`;
const head=(t,back=true)=>`<div class="mfc-head">${back?'<button type="button" class="mfc-back" data-cfgv="main" aria-label="Voltar">‹</button>':'<span class="mfc-sp"></span>'}<h2>${t}</h2><button type="button" class="mfc-x" data-cfgclose="1" aria-label="Fechar">✕</button></div>`;
const isPriv=()=>{try{return localStorage.getItem('fin1_priv')==='1'}catch(e){return false}};
window.MF_PRIV=isPriv();
const lastSync=()=>{let t=0;try{t=+localStorage.getItem('fin1_lastsync')||0}catch(e){}if(!t)return '—';const d=new Date(t);return d.toLocaleDateString('pt-BR')+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})};
const logged=()=>typeof authUser!=='undefined'&&!!authUser;
const syncTxt=()=>!logged()?'Não conectado: dados só neste aparelho':!navigator.onLine?'Sem internet: alterações ficam guardadas e sobem depois':typeof sync!=='undefined'&&sync==='erro'?'Erro na última sincronização':typeof sync!=='undefined'&&sync==='syncing'?'Sincronizando…':'Sincronizado';

function vMain(){const p=prof(),nome=(p.nome||p.apelido||'').trim()||'Seu perfil';
 return head('Configurações',false)+`<button type="button" class="mfc-prof" data-cfgv="perfil"><span class="mf-avatar">${mfAvatarHtml(56)}</span><span class="mfc-rt"><b>${H(nome)}</b><small>${logged()?H(authUser.email||'Conta conectada'):'Toque para editar seu perfil'}</small></span><span class="mfc-chev">›</span></button>
 <div class="mfc-group">${row('aparencia','tema','Aparência','Tema, telas, lançamento e organização')}</div>
 <div class="mfc-group">${rowNotif()}${row('seguranca','seg','Segurança e privacidade',window.MF_PRIV?'Valores ocultos':'Ocultar valores, sessão')}${row('backup','backup','Backup e sincronização',syncTxt())}</div>
 <div class="mfc-group">${row('relatorios','rel','Central de Relatórios','Gerar relatórios em PDF')}</div><div class="mfc-group">${row('plano','plano','Plano e assinatura',window.__acc&&window.__acc.plano==='premium'?'Premium':'Gratuito · ver planos')}</div>${window.__acc&&window.__acc.admin?`<div class="mfc-group mf-adm-entry">${row('adm','adm','Central administrativa','Usuários, planos, preços e pagamentos')}</div>`:''}${window.mfCfgFoot?mfCfgFoot():''}`}

function vPerfil(){const p=prof();
 return head('Meu perfil')+`<div class="mfc-avwrap"><span class="mf-avatar mfc-big">${mfAvatarHtml(96)}</span><div class="mfc-avbtns"><label class="mfc-btn">Escolher foto<input type="file" accept="image/*" data-cfgphoto hidden></label>${p.photo?'<button type="button" class="mfc-btn ghost" data-cfgact="rmphoto">Remover foto</button>':''}</div></div>
 <div class="mfc-group mfc-pad"><label class="mfc-f">Nome de exibição<input data-cfgp="nome" value="${H(p.nome)}" maxlength="40" placeholder="Ex.: William"></label><label class="mfc-f">Apelido<input data-cfgp="apelido" value="${H(p.apelido)}" maxlength="24" placeholder="Como quer ser chamado"></label><label class="mfc-f">Frase (opcional)<input data-cfgp="frase" value="${H(p.frase)}" maxlength="60" placeholder="Ex.: Rumo à liberdade financeira"></label></div>
 <p class="mfc-note">A saudação do topo usa o apelido (ou o nome). A foto é reduzida e salva junto com seus dados, neste aparelho e na nuvem.</p>`}
function vPlano(){return head('Plano e assinatura')+`<div class="mfc-group mfc-pad">${mfPlanHtml()}</div>`}

/* ===== Aparência (1.14): quatro abas — Tema, Telas, Lançamento e Organização =====
   Na aba Tema nada muda de verdade até tocar em "Aplicar": a escolha fica num rascunho (apD), que é pintado
   na tela para a prévia e desfeito em "Descartar", ao trocar de aba ou ao fechar. */
/* 1.15: Telas e Lançamento moram juntas em Layouts (subabas); 'lancar' acende a aba Layouts */
const AP_TABS=[['aparencia','Tema'],['telas','Layouts'],['organizacao','Organização']];
function apHead(cur){if(cur==='lancar')cur='telas';return head('Aparência')+`<div class="ap-tabs" role="tablist" aria-label="Seções da Aparência">${AP_TABS.map(([v,t])=>`<button type="button" role="tab" class="ap-tab${v===cur?' on':''}" aria-selected="${v===cur}" data-cfgv="${v}">${t}</button>`).join('')}</div>`}
const AP_MODOS=[['escuro','Escuro','dark','',['#0b0b0c','#151517','#212124']],['premium','Escuro Premium','dark','premium',['#000000','#0e0e10','#19191c']],['azulado','Escuro Azulado','dark','azul',['#14213a','#1c2d4c','#2c3b57']],['branco','Branco','light','',['#ececee','#ffffff','#f2f2f4']]];
const AP_RELEVOS=[['','Padrão','Atual'],['a1','Camadas finas','Sombras curtas'],['d3','Brilho de acento','Blocos-chave flutuam']];
let apD=null;
function apReal(k){const L=S.lay||{};return k==='theme'?(L.theme==='light'?'light':'dark'):k==='glass'?!!L.glass:k==='zoom'?Math.round(+L.zoom||100):(L[k]||'')}
function apCur(k){return apD&&k in apD?apD[k]:apReal(k)}
function apPaint(){const real=S.lay=S.lay||{};
 if(!apD){applyLay();mfLookApply();return}
 const tmp=Object.assign({},real,apD);['tom','canto','gap','accent','relevo'].forEach(k=>{if(!tmp[k])delete tmp[k]});
 S.lay=tmp;try{applyLay();mfLookApply()}finally{S.lay=real}}
function apSet(o){apD=apD||{};Object.keys(o).forEach(k=>{if(o[k]===apReal(k))delete apD[k];else apD[k]=o[k]});if(!Object.keys(apD).length)apD=null;apPaint();render()}
function apDrop(msg){if(!apD)return;apD=null;apPaint();if(msg&&typeof mfToast==='function')mfToast('Alterações descartadas')}
function apApply(){if(!apD)return;const L=S.lay=S.lay||{};Object.keys(apD).forEach(k=>{const v=apD[k];if(k==='glass')L.glass=!!v;else if(k==='zoom'||k==='theme')L[k]=v;else if(v)L[k]=v;else delete L[k]});
 apD=null;applyLay();mfLookApply();save();draw();render();if(typeof mfToast==='function')mfToast('Aparência aplicada ✓')}
function apModo(){const th=apCur('theme'),tom=apCur('tom');return th==='light'?'branco':tom==='premium'?'premium':tom==='azul'?'azulado':'escuro'}
function apPrev(){return `<div class="apv-wrap"><div class="apv" aria-hidden="true">
  <div class="apv-top"><i></i><b>Dashboard</b><i></i></div>
  <div class="apv-c apv-hero"><small>Saldo do mês</small><strong>R$ 4.250,00</strong><span class="apv-bar"><em></em></span></div>
  <div class="apv-g"><div class="apv-c"><small>Entradas</small><b>R$ 6.000</b></div><div class="apv-c"><small>Saídas</small><b>R$ 1.750</b></div></div>
  <div class="apv-c apv-li"><span><i></i><u></u><b></b></span><span><i></i><u></u><b></b></span></div>
  <div class="apv-nv"><i class="on"></i><i></i><em>+</em><i></i><i></i></div>
 </div><p class="apv-cap">${apD?'Prévia do que você escolheu. Só vale depois de <b>Aplicar</b>.':'Prévia: é assim que o app está hoje.'}</p></div>`}
function vAparencia(){const th=apCur('theme'),tom=apCur('tom'),z=apCur('zoom'),acc=apCur('accent'),canto=apCur('canto'),gap=apCur('gap'),modo=apModo(),L=S.lay||{};
 const chip=(attr,on,t)=>`<button type="button" class="mfc-chip ${on?'on':''}" aria-pressed="${!!on}" ${attr}>${t}</button>`;
 const own=acc&&!MF_ACCS.some(x=>x[0]===acc);
 return apHead('aparencia')+apPrev()+`<div class="mfc-group mfc-pad"><div class="mfc-lb">Modo</div>
 <div class="ap-modos">${AP_MODOS.map(([k,t,,,c])=>`<button type="button" class="ap-modo${modo===k?' on':''}" aria-pressed="${modo===k}" data-apvmodo="${k}"><span class="ap-sw" style="background:${c[0]}"><i style="background:${c[1]}"></i><i style="background:${c[2]}"></i></span><b>${t}</b></button>`).join('')}</div>
 <label class="mfc-sw ap-glass"><span><b>Liquid Glass</b><small>Cartões de vidro translúcido. Funciona nos modos escuros e no branco.</small></span><input type="checkbox" data-apvsw="glass" ${apCur('glass')?'checked':''}><i aria-hidden="true"></i></label></div>
 <div class="mfc-group mfc-pad ap-relevo"><div class="mfc-lb">Relevo dos blocos</div>
 <div class="ap-rvs">${AP_RELEVOS.map(([k,t,d])=>`<button type="button" class="ap-rv${apCur('relevo')===k?' on':''}" aria-pressed="${apCur('relevo')===k}" data-apvrelevo="${k}"><span class="ap-rvsw rv-${k||'p'}"><i></i><i></i></span><b>${t}</b><small>${d}</small></button>`).join('')}</div>
 <p class="mfc-note" style="margin:6px 0 0">Muda a profundidade de blocos, cards e widgets: luz no topo e sombras. Vale no celular e combina com o Liquid Glass.</p></div>
 <div class="mfc-group mfc-pad"><div class="mfc-lb">Cor de destaque</div><div class="mf-accs">${MF_ACCS.map(([c,t])=>`<button type="button" class="mf-acc ${acc===c?'on':''}" data-apvacc="${c}" title="${t}" aria-label="${t}" aria-pressed="${acc===c}"><i style="${c?`background:${c}`:'background:linear-gradient(135deg,#fff 50%,#111 50%)'}"></i></button>`).join('')}<label class="mf-acc mf-acc-own ${own?'on':''}" title="Escolher outra cor"><i style="background:${own?acc:'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)'}"></i><input type="color" data-apvaccc value="${/^#[0-9a-f]{6}$/i.test(acc)?acc:'#e8572f'}"></label></div>
 <p class="mfc-note" style="margin:6px 0 0">Automático: branco nos modos escuros e preto no branco. Vale para o botão Lançar, o calendário, os botões e os seletores.</p>
 <div class="mfc-lb">Cor do plano de fundo</div><div class="mf-tons mf-tons-bg">${MF_TONS[th].filter(x=>x[0]!=='premium').map(([k,t,card,c2,bg])=>{const o=k?mfTomCores(th,k,card,c2,bg):{bg,card};return `<button type="button" class="mf-tom ${tom===k?'on':''}" data-apvtom="${k}" aria-pressed="${tom===k}"><i style="background:${o.bg}"><b style="background:${o.card}"></b></i>${t}</button>`}).join('')}</div>
 <p class="mfc-note" style="margin:6px 0 0">Pinta o fundo do app. Os blocos acompanham num tom um pouco mais claro.</p></div>
 <div class="mfc-group mfc-pad"><div class="mfc-lb">Cantos dos blocos</div><div class="mfc-chips">${chip('data-apvcanto=""',!canto,'Padrão')}${chip('data-apvcanto="r"',canto==='r','Retos')}${chip('data-apvcanto="a"',canto==='a','Bem redondos')}</div>
 <div class="mfc-lb">Bordas dos blocos</div><div class="ap-bordas">${(window.MF_BORDAS||[]).map(([k,t])=>{const cur=((S.lay||{}).borda==='sem'?'':(S.lay||{}).borda)||'';return `<button type="button" class="mf-borda ${cur===k?'on':''}" data-cfgborda="${k}" aria-pressed="${cur===k}"><i class="b-${k||'sem'}"></i><span>${t}</span></button>`}).join('')}</div>
 <div class="mfc-lb">Espaço entre os blocos</div><div class="mfc-chips">${chip('data-apvgap="c"',gap==='c','Compacto')}${chip('data-apvgap=""',!gap,'Normal')}${chip('data-apvgap="a"',gap==='a','Amplo')}</div>
 <div class="mfc-lb">Tamanho da interface</div><div class="mfc-chips">${[[90,'Menor'],[100,'Padrão'],[110,'Maior']].map(([v,t])=>chip(`data-apvzoom="${v}"`,z===v,t)).join('')}</div></div>
 <div class="mfc-group mfc-pad"><div class="mfc-lb">Tab bar</div><div class="mfc-chips">${chip('data-mftbar=""',!L.tbar,'Padrão')}${chip('data-mftbar="1"',L.tbar==='1','v.1 · Pílula')}${chip('data-mftbar="2"',L.tbar==='2','v.2 · Aba')}${chip('data-mftbar="3"',L.tbar==='3','v.3 · Texto')}</div><p class="mfc-note" style="margin:4px 0 0">Muda as pílulas das subabas de Lançamentos e de Contas (só no celular).</p>
 <div class="mfc-lb">Barra de abas</div><div class="mfc-chips">${chip('data-mfnvl=""',L.nvl!=='0','Ícone e nome')}${chip('data-mfnvl="0"',L.nvl==='0','Só ícone')}</div>
 <div class="mfc-lb">Animações</div><div class="mfc-chips">${chip('data-mfanim=""',L.anim!=='0','Ligadas')}${chip('data-mfanim="0"',L.anim==='0','Desligadas (mais leve)')}</div>
 <div class="mfc-lb">Animação ao abrir a tela (todos os blocos)</div><div class="mfc-chips">${[['','Nenhuma'],['f','Aparecer'],['s','Subir'],['l','Deslizar'],['z','Crescer'],['b','Pular']].map(([v,t])=>chip(`data-mfanall="${v}"`,(L.anAll||'')===v,t)).join('')}</div>
 <p class="mfc-note" style="margin:4px 0 0">Estas três opções valem na hora. Os blocos entram um depois do outro; um bloco com animação própria (Editar bloco › Efeitos) usa a dele.</p>
 <button type="button" class="mfc-btn ghost" data-mflookreset="1" style="margin-top:12px;width:100%">Voltar a aparência ao padrão</button></div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mf-cfg [data-apvmodo],#mf-cfg [data-apvacc],#mf-cfg [data-apvtom],#mf-cfg [data-apvcanto],#mf-cfg [data-apvgap],#mf-cfg [data-apvrelevo],#mf-cfg [data-apvzoom],#mf-cfg [data-apvok],#mf-cfg [data-apvx],#mf-cfg [data-mflookreset]');if(!b)return;
 const d=b.dataset;if(d.mflookreset){apD=null;apPaint();render();return} // o padrão já foi gravado pelo js/10; aqui só some o rascunho
 e.preventDefault();e.stopPropagation();
 if(d.apvok){apApply();return}
 if(d.apvx){apDrop(1);render();return}
 if(d.apvmodo){const m=AP_MODOS.find(x=>x[0]===d.apvmodo);if(m)apSet({theme:m[2],tom:m[3]});return}
 if(d.apvacc!==undefined){apSet({accent:d.apvacc});return}
 if(d.apvtom!==undefined){apSet({tom:d.apvtom});return}
 if(d.apvcanto!==undefined){apSet({canto:d.apvcanto});return}
 if(d.apvgap!==undefined){apSet({gap:d.apvgap});return}
 if(d.apvrelevo!==undefined){apSet({relevo:d.apvrelevo});return}
 if(d.apvzoom){apSet({zoom:+d.apvzoom})}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches)return;
 if(t.matches('#mf-cfg [data-apvsw="glass"]')){e.stopPropagation();apSet({glass:!!t.checked});return}
 if(t.matches('#mf-cfg [data-apvaccc]')){e.stopPropagation();apSet({accent:t.value})}},true);
function apNomes(){const L=S.lay||{};return `<div class="mfc-group mfc-pad"><div class="mfc-lb">Nomes das abas</div><p class="mfc-note" style="margin:4px 0 0">Deixe em branco para usar o nome original.</p>${[['res','Dashboard'],['add','Lançamentos'],['mais','Contas'],['inv','Investimentos'],['anal','Análises']].map(([k,d])=>`<label class="mf-tn-f"><small>${d}</small><input type="text" data-mftn="${k}" maxlength="18" value="${escH((L.tn||{})[k]||'')}" placeholder="${d}"></label>`).join('')}
 <p class="mfc-note" style="margin:4px 0 0">Para renomear um bloco: segure o bloco › "Nome do bloco".</p></div>`}
function apAparelho(){const chip=(attr,on,t)=>`<button type="button" class="mfc-chip ${on?'on':''}" ${attr}>${t}</button>`;
 return `<div class="mfc-group mfc-pad"><div class="mfc-lb">Layout deste aparelho</div><div class="mfc-chips">${[['auto','Automático'],['celular','Celular'],['computador','Computador']].map(([v,t])=>chip(`data-cfgdev="${v}"`,((window.mfAparelho&&mfAparelho().forcado)||'auto')===v,t)).join('')}</div>
 <p class="mfc-note" style="margin:4px 0 0">Automático: computador só com mouse/trackpad e janela larga; tablets e telas de toque usam o layout de celular. Vale só neste aparelho.</p></div>`}
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('[data-mftn]');if(!i)return;const k=i.dataset.mftn,v=i.value.trim();S.lay=S.lay||{};S.lay.tn=S.lay.tn||{};if(v)S.lay.tn[k]=v;else delete S.lay.tn[k];save();draw();if(typeof mfToast==='function')mfToast('Nome da aba salvo ✓')},true);

function collectBlocks(){window.__mfAllModes=1;const cur=tab,L=S.lay=S.lay||{},h0=L.h,box=document.createElement('div'),out={};L.h={};
 try{[...new Set([...tbs(),'anal'])].forEach(t=>{out[t]=[];try{tab=t;box.innerHTML=lay(t,withMoved(t,viewFor(t)()));const seen=new Set();box.querySelectorAll('[data-bk]').forEach(el=>{const id=String(el.dataset.bk||'').split('|')[1];if(!id||seen.has(id))return;seen.add(id);const hEl=el.querySelector('h2,h3')||el.querySelector('small,b');let tt=(hEl&&hEl.textContent||'').replace(/[▸▾▼›‹✎⚙]/g,'').replace(/\s+/g,' ').trim();out[t].push([id,(tt||id.replace(/^c_/,'').replace(/_/g,' ')).slice(0,48)])})}catch(e){console.warn('Configurações: aba',t,e)}})}
 finally{L.h=h0;tab=cur;window.__mfAllModes=0}return out}
/* ===== Aparência › Layouts (1.15) =====
   Telas: estilo (Padrão / Compacto), "Editar tela" (abre o editor em cima da tela real, js/83-editar-tela.js),
   barra principal (ordem e quais telas aparecem) e atalhos do topo de Contas e Investimentos.
   Lançamento: layouts do formulário (vLancar). As duas partes ficam na aba Layouts (subabas Telas | Lançamento).
   Tudo aqui é rascunho até "Aplicar"; "Ver na tela" mostra o app de verdade com o rascunho.
   Celular e computador guardam separado (S.lay / S.layD). Ocultar só esconde: nada é apagado. */
function telaList(t) { if (!blocksCache) blocksCache = collectBlocks(); return blocksCache[t] || []; }
const TL_K = ['o', 'h', 'w', 'mvt', 'to', 'ht', 'sg', 'wg', 'dens', 'sn'];
let tlBak = null;
function tlSnap() { const L = S.lay || {}, o = {}; TL_K.forEach(k => { if (L[k] !== undefined) o[k] = JSON.parse(JSON.stringify(L[k])); }); return o; }
function telaSave(f) { S.lay = S.lay || {}; if (!tlBak) tlBak = tlSnap(); f(S.lay); blocksCache = null; if (peek) { applyLay(); draw(); } render(); }
function tlDrop(msg) { if (!tlBak) return; const L = S.lay || {}, b = tlBak; tlBak = null; TL_K.forEach(k => { if (k in b) L[k] = b[k]; else delete L[k]; }); blocksCache = null; applyLay(); draw(); if (msg && window.mfToast) mfToast('Alterações descartadas'); }
function tlApply() { if (!tlBak) return; tlBak = null; save(); applyLay(); draw(); blocksCache = null; render(); if (window.mfToast) mfToast('Layouts aplicados ✓'); }
function lySub(cur) { return `<div class="ap-sub" role="tablist" aria-label="Layouts">${[['telas', 'Telas'], ['lancar', 'Lançamento']].map(([v, t]) => `<button type="button" role="tab" class="${v === cur ? 'on' : ''}" aria-selected="${v === cur}" data-cfgv="${v}">${t}</button>`).join('')}</div>`; }
/* estilo das telas: a prévia usa cartões do app com números de exemplo, no espaço de cada estilo */
const LY_ESTILOS = [['', 'Padrão', 'Espaço confortável entre os blocos.'], ['c', 'Compacto', 'Blocos mais justos: cabe mais na tela.']];
function lyEstilo() {
 const cur = (S.lay || {}).dens === 'c' ? 'c' : '', pv = k => window.MF_WG && MF_WG[k] ? `<section class="edw-card mf-wg"><h2>${H(MF_WG[k].n)}</h2>${mfWgExemplo(k)}</section>` : '';
 return `<div class="ly-est">${LY_ESTILOS.map(([v, n, d]) => `<button type="button" class="ly-e${v === cur ? ' on' : ''}" data-tldens="${v}" aria-pressed="${v === cur}"><span class="ly-e-pv ly-e-${v || 'p'}" aria-hidden="true">${pv('saldo')}${pv('mes')}</span><b>${n}</b><small>${d}</small></button>`).join('')}</div>`;
}
function lyTelas() {
 return `<div class="ly-tg">${[...new Set(tbs().map(k => k === 'geral' ? 'anal' : k))].map(k => { const n = telaList(k).filter(([id]) => !isHid(id)).length; return `<div class="ly-t"><div class="ly-t-tx"><b>${H(TABN[k] || k)}</b><small>${n} ${n === 1 ? 'bloco visível' : 'blocos visíveis'}</small></div><button type="button" class="ly-t-ed" data-edopen="${k}">Editar tela</button><button type="button" class="ly-t-pad" data-mftpad="${k}">Restaurar padrão</button></div>`; }).join('')}</div>`;
}
function vTelas() {
 const ts = tbs(), HT = (S.lay || {}).ht || {}, vis = ts.filter(k => !HT[k]);
 return apHead('telas') + lySub('telas')
  + `<div class="mfc-lb">Estilo das telas</div>
 ${lyEstilo()}
 <div class="mfc-lb mfc-lbo">Editar uma tela</div>
 <p class="mfc-note">Abre a tela de verdade em modo edição: arraste os blocos, toque no "−" para esconder e use o "+" para adicionar blocos novos.</p>
 ${lyTelas()}
 ${lyBarra()}
 ${lyAtalhos()}`;
}
/* 1.16: Barra principal e Atalhos do topo — réplica ao vivo em cima, arrastar pela alça e olho para mostrar/esconder */
let sgTab = 'mais';
const SV_H = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>';
const SV_OLHO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const SV_FECHADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.6A10 10 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.9 3.7M6.6 6.7C3.9 8.4 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1"/></svg>';
function tbIco(k) { const s = document.querySelector(`nav button[data-tab="${k}"] svg`); return s ? s.outerHTML : ''; }
function lyBarra() {
 const ts = tbs(), HT = (S.lay || {}).ht || {}, vis = ts.filter(k => !HT[k]), fora = ts.filter(k => HT[k]);
 const row = (k, on) => `<div class="mft-row mft-dr" data-mftid="${k}">${on ? `<button type="button" class="mft-h" data-mfth="bar" aria-label="Mover ${H(TABN[k] || k)}: arraste ou use as setas do teclado">${SV_H}</button>` : '<span class="mft-h0"></span>'}<span class="mft-ic">${tbIco(k)}</span><b class="mft-n">${H(TABN[k] || k)}</b>
  <button type="button" class="mft-eye${on ? ' on' : ''}" data-mftht="${k}" aria-pressed="${on}"${on && vis.length < 2 ? ' disabled' : ''} aria-label="${on ? 'Tirar' : 'Pôr'} ${H(TABN[k] || k)} ${on ? 'da' : 'na'} barra">${on ? SV_OLHO : SV_FECHADO}</button></div>`;
 return `<div class="mfc-lb mfc-lbo">Barra principal</div>
 <div class="mft-rep" aria-hidden="true">${vis.map(k => `<span><i>${tbIco(k)}</i><b>${H(TABN[k] || k)}</b></span>`).join('')}</div>
 <p class="mfc-note">É assim que a barra de baixo fica (no computador, o menu lateral). Arraste pela alça para mudar a ordem e toque no olho para tirar ou pôr uma tela. Pelo menos uma fica sempre na barra.</p>
 <div class="mfc-group mft-dl" data-mftdl="bar">${vis.map(k => row(k, true)).join('')}</div>
 ${fora.length ? `<div class="mft-sub">Fora da barra</div><div class="mfc-group mft-fora">${fora.map(k => row(k, false)).join('')}</div>` : ''}
 <div class="mfc-chips"><button type="button" class="mfc-chip" data-mftbpad="1">Voltar ao padrão da barra</button></div>`;
}
function lyAtalhos() {
 /* 2.1: 'invs' = abas da página Investimentos; cada botão pode ganhar outro nome (S.lay.sn[tela][chave]; em branco = nome original) */
 const TS = ['add', 'mais', 'inv', 'invs'], NM = t => t === 'invs' ? 'Investimentos' : TABN[t];
 const k = TS.includes(sgTab) ? sgTab : 'mais', L = mfSegList(k), base = Object.fromEntries((window.MF_SEGS || {})[k] || []), SN = (((S.lay || {}).sn) || {})[k] || {};
 return `<div class="mfc-lb mfc-lbo">Atalhos do topo</div>
 <div class="mft-sgt" role="tablist" aria-label="Tela dos atalhos">${TS.map(t => `<button type="button" role="tab" class="${t === k ? 'on' : ''}" aria-selected="${t === k}" data-mftsgt="${t}">${H(NM(t))}</button>`).join('')}</div>
 <div class="mft-rep mft-rep-sg" aria-hidden="true">${L.map(([, nm], i) => `<span class="${i ? '' : 'on'}"><b>${H(nm)}</b></span>`).join('')}</div>
 <p class="mfc-note">Os botões pequenos do alto de ${H(NM(k))}${k === 'invs' ? ' (a página que abre ao tocar em Investimentos, dentro de Patrimônio)' : ''}. O primeiro é o que abre primeiro. Arraste pela alça para mudar a ordem e escreva no campo para trocar o nome; em branco, volta o nome original. Nenhum botão some.</p>
 <div class="mfc-group mft-dl" data-mftdl="sg:${k}">${L.map(([id, nm]) => `<div class="mft-row mft-dr" data-mftid="${id}"><button type="button" class="mft-h" data-mfth="sg:${k}" aria-label="Mover ${H(nm)}: arraste ou use as setas do teclado">${SV_H}</button><input type="text" class="mft-nm" maxlength="14" data-mftsn="${k}:${id}" value="${H(SN[id] || '')}" placeholder="${H(base[id] || nm)}" aria-label="Nome do botão ${H(base[id] || nm)}"></div>`).join('')}</div>
 <div class="mfc-chips"><button type="button" class="mfc-chip" data-mftsgpad="1">Voltar ao padrão dos atalhos</button></div>`;
}
/* nome novo de um botão do topo */
document.addEventListener('change', e => {
 const i = e.target.closest && e.target.closest('#mf-cfg [data-mftsn]'); if (!i) return;
 const [t, id] = i.dataset.mftsn.split(':'), v = i.value.trim().slice(0, 14);
 telaSave(l => { l.sn = Object.assign({}, l.sn || {}); l.sn[t] = Object.assign({}, l.sn[t] || {}); if (v) l.sn[t][id] = v; else delete l.sn[t][id]; });
 });
/* grava a nova ordem de uma lista (bar = abas visíveis; sg:aba = atalhos) */
function mftOrdem(kind, ids) {
 if (kind === 'bar') { const HT = (S.lay || {}).ht || {}; const a = ids.concat(tbs().filter(k => HT[k])); telaSave(l => { l.to = a; }); return; }
 const k = kind.slice(3); telaSave(l => { l.sg = Object.assign({}, l.sg || {}); l.sg[k] = ids; });
}
function mftIds(list) { return [...list.querySelectorAll(':scope>.mft-dr')].map(r => r.dataset.mftid); }
/* arrastar pela alça (dedo ou mouse) */
let mftDg = null;
document.addEventListener('pointerdown', e => {
 const h = e.target.closest && e.target.closest('#mf-cfg .mft-h[data-mfth]');
 if (!h || e.button > 0) return;
 const row = h.closest('.mft-dr'), list = row && row.parentElement; if (!list) return;
 e.preventDefault();
 const rows = [...list.querySelectorAll(':scope>.mft-dr')], rc = rows.map(r => r.getBoundingClientRect());
 mftDg = { h, row, list, rows, rc, i: rows.indexOf(row), j: rows.indexOf(row), y0: e.clientY, hh: rc[rows.indexOf(row)].height, kind: h.dataset.mfth, id: e.pointerId };
 try { h.setPointerCapture(e.pointerId); } catch (_) { }
 row.classList.add('mft-arr'); list.classList.add('mft-arrl');
}, true);
document.addEventListener('pointermove', e => {
 const g = mftDg; if (!g || e.pointerId !== g.id) return;
 e.preventDefault();
 const dy = e.clientY - g.y0, y = g.rc[g.i].top + g.hh / 2 + dy;
 let j = g.rows.length - 1; for (let n = 0; n < g.rc.length; n++) { if (y < g.rc[n].top + g.rc[n].height / 2) { j = n; break; } }
 g.j = j; g.row.style.transform = `translateY(${dy}px)`;
 g.rows.forEach((r, n) => { if (r === g.row) return; const s = g.i < j ? (n > g.i && n <= j ? -g.hh : 0) : (n >= j && n < g.i ? g.hh : 0); r.style.transform = s ? `translateY(${s}px)` : ''; });
}, { capture: true, passive: false });
function mftSolta(e) {
 const g = mftDg; if (!g || (e && e.pointerId !== g.id)) return; mftDg = null;
 g.rows.forEach(r => { r.style.transform = ''; }); g.row.classList.remove('mft-arr'); g.list.classList.remove('mft-arrl');
 if (g.j === g.i) return;
 const ids = mftIds(g.list); ids.splice(g.j, 0, ids.splice(g.i, 1)[0]); mftOrdem(g.kind, ids);
 try { navigator.vibrate && navigator.vibrate(8); } catch (_) { }
}
document.addEventListener('pointerup', mftSolta, true);
document.addEventListener('pointercancel', mftSolta, true);
/* teclado: setas na alça sobem/descem um lugar */
document.addEventListener('keydown', e => {
 const h = e.target.closest && e.target.closest('#mf-cfg .mft-h[data-mfth]');
 if (!h || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
 e.preventDefault();
 const row = h.closest('.mft-dr'), ids = mftIds(row.parentElement), i = ids.indexOf(row.dataset.mftid), j = i + (e.key === 'ArrowUp' ? -1 : 1);
 if (j < 0 || j >= ids.length) return;
 ids.splice(j, 0, ids.splice(i, 1)[0]); const kind = h.dataset.mfth, id = row.dataset.mftid; mftOrdem(kind, ids);
 setTimeout(() => { const n = document.querySelector(`#mf-cfg [data-mftdl="${kind}"] [data-mftid="${id}"] .mft-h`); if (n) n.focus(); }, 30);
}, true);
document.addEventListener('click', e => {
 const b = e.target.closest && e.target.closest('#mf-cfg [data-mftpad],#mf-cfg [data-mftht],#mf-cfg [data-mftsgt],#mf-cfg [data-mftbpad],#mf-cfg [data-mftsgpad],#mf-cfg [data-tlok],#mf-cfg [data-tlx],#mf-cfg [data-tldens]');
 if (!b) return; e.preventDefault(); e.stopPropagation();
 const d = b.dataset;
 if (d.tlok) { tlApply(); return; }
 if (d.tlx) { tlDrop(1); render(); return; }
 if (d.tldens !== undefined) { const v = d.tldens; telaSave(l => { if (v) l.dens = v; else delete l.dens; }); return; }
 if (d.mftpad) {
  const t = d.mftpad, ids = telaList(t).map(x => x[0]);
  telaSave(l => {
   if (l.o) delete l.o[t];
   if (l.wg && l.wg[t]) { const W = Object.assign({}, l.wg); delete W[t]; l.wg = W; }
   ids.forEach(id => { if (l.h) delete l.h[id]; if (l.w) delete l.w[id]; if (l.mvt) delete l.mvt[id]; });
   if (l.mvt) Object.keys(l.mvt).forEach(id => { if (l.mvt[id] && l.mvt[id].f === t) delete l.mvt[id]; });
  });
  return;
 }
 if (d.mftsgt) { sgTab = d.mftsgt; render(); return; }
 if (d.mftht) {
  if (b.disabled) return;
  const k = d.mftht, HT = Object.assign({}, (S.lay || {}).ht || {});
  if (HT[k]) delete HT[k]; else HT[k] = 1;
  if (!tbs().filter(x => !HT[x]).length) return;
  telaSave(l => { l.ht = HT; }); return;
 }
 if (d.mftsgpad) { telaSave(l => { delete l.sg; delete l.sn; }); return; }
 if (d.mftbpad) { telaSave(l => { delete l.to; l.ht = {}; }); return; }
}, true);
/* "Ver na tela": esconde as Configurações e mostra o app de verdade com o rascunho (Tema ou Layouts) */
let peek = false;
function peekOn() {
 peek = true; document.documentElement.classList.add('mf-cfg-peek');
 if (tlBak) { applyLay(); draw(); }
 let p = document.getElementById('mf-peek'); if (!p) { p = document.createElement('div'); p.id = 'mf-peek'; document.body.appendChild(p); }
 p.innerHTML = `<div class="mfp-tx"><small>Prévia</small><b>Assim fica o app</b></div><button type="button" class="mfp-b" data-cfgunpeek="1">Voltar</button><button type="button" class="mfp-b ok" data-cfgpeekok="1">Aplicar</button>`;
 scrollTo(0, 0);
}
function peekOff() { peek = false; document.documentElement.classList.remove('mf-cfg-peek'); const p = document.getElementById('mf-peek'); if (p) p.remove(); }
document.addEventListener('click', e => {
 const b = e.target.closest && e.target.closest('[data-cfgpeek],[data-cfgunpeek],[data-cfgpeekok]');
 if (!b) return; e.preventDefault(); e.stopPropagation();
 if (b.dataset.cfgpeek) return peekOn();
 peekOff();
 if (b.dataset.cfgpeekok) { if (apD) apApply(); if (tlBak) tlApply(); }
 render();
}, true);

function vOrg(){const p=prefs(),opt=(v,cur,t)=>`<option value="${v}" ${v===cur?'selected':''}>${t}</option>`;
 return apHead('organizacao')+`<div class="mfc-group mfc-pad"><label class="mfc-f">Tela inicial ao abrir o app<select data-cfgpref="startTab">${tbs().map(t=>opt(t,p.startTab||'res',TABN[t]||t)).join('')}</select></label>
 <label class="mfc-f">Primeiro dia da semana (calendário)<select data-cfgpref="weekStart">${opt('seg',p.weekStart||'seg','Segunda-feira')}${opt('dom',p.weekStart||'seg','Domingo')}</select></label>
 <label class="mfc-f">Formato de data<select disabled><option>DD/MM/AAAA (padrão brasileiro)</option></select></label>
 <label class="mfc-f">Moeda padrão<select disabled><option>Real brasileiro (R$)</option></select></label></div>
 <p class="mfc-note">O app usa sempre datas no padrão brasileiro e valores em reais.</p>${apAparelho()}${apNomes()}`}

/* 0.4: Notificações reúne as novidades da versão e as preferências de aviso.
   1.18: saiu a lista "Avisos de agora" (os avisos continuam no bloco Avisos do Dashboard). */
function rowNotif(){const N=window.MF_NOVIDADES,novo=!!(N&&window.mfNovPendente&&mfNovPendente());
 return row('notif','notif','Notificações',novo?`Novidades da versão ${H(N.ver)}`:'Novidades e preferências de aviso',novo?'Novo':'')}
function vNotif(){const n=prefs().notif,N=window.MF_NOVIDADES,novo=!!(N&&window.mfNovPendente&&mfNovPendente());
 if(novo)setTimeout(()=>{if(window.mfNovVisto)mfNovVisto()},0); // abrir esta tela já conta como "novidades vistas"
 const nov=N?`<div class="mfc-lb mfc-lbo" id="mfc-nov">Novidades da versão ${H(N.ver)}${novo?'<em class="mfc-new">Novo</em>':''}</div><div class="mfc-group mfc-nov">${N.itens.map(([t,d])=>`<div class="mfc-nv"><i aria-hidden="true"></i><span><b>${H(t)}</b><small>${H(d)}</small></span></div>`).join('')}</div>`:'';
 return head('Notificações')+nov+`<div class="mfc-lb mfc-lbo">Preferências</div>
 <div class="mfc-group">${sw('n:contas',n.contas!==false,'Contas próximas do vencimento','No celular, 1 dia antes, as contas de Vencimentos que ainda não foram pagas.')}${sw('n:faturas',n.faturas!==false,'Faturas próximas do vencimento','Antes do vencimento e no dia, com valor e data. Para quando a fatura é paga.')}${sw('n:lembretes',!!n.lembretes,'Lembretes financeiros')}${sw('n:invest',!!n.invest,'Eventos de investimentos')}</div>
 <div class="mfc-group mfc-pad"><label class="mfc-f">Avisar sobre a fatura<select data-cfgpref="fatDias">${[1,2,3,5,7].map(v=>`<option value="${v}" ${String(v)===String(window.mfFatDays?mfFatDays():3)?'selected':''}>${v} ${v===1?'dia':'dias'} antes</option>`).join('')}</select></label></div>
 <p class="mfc-note">Os avisos de fatura aparecem no bloco Avisos do Dashboard e, se você ativar abaixo, também no celular com o app fechado.</p>${window.mfPushHtml?mfPushHtml():''}`}

function vSeg(){
 return head('Segurança e privacidade')+`<div class="mfc-group">${sw('priv',window.MF_PRIV,'Modo privacidade','Esconde os valores em R$ neste aparelho. Também pelo olho no topo.')}</div>
 ${mfLockGroup()}${mfPwGroup()}
 <div class="mfc-group mfc-pad"><div class="mfc-lb">Sessão</div>${logged()?`<p class="mfc-note" style="margin:0 0 10px">Conectado como <b>${H(authUser.email||'')}</b>.</p><button type="button" class="mfc-btn ghost" data-cfgact="logout">Sair da conta</button>`:`<p class="mfc-note" style="margin:0 0 10px">Você não está conectado. Entre para sincronizar celular e computador.</p><button type="button" class="mfc-btn cloud-status-control">Entrar ou criar conta</button>`}</div>
 <div class="mfc-group mfc-pad"><div class="mfc-lb">Seus dados (LGPD)</div><p class="mfc-note" style="margin:0 0 10px">Baixe uma cópia de tudo o que você guardou no app ou leia como seus dados são tratados.</p>
  <div class="mf-lgpd-b"><button type="button" class="mfc-btn" data-lgpd="json">Baixar meus dados (completo)</button><button type="button" class="mfc-btn ghost" data-lgpd="csv">Baixar lançamentos (planilha CSV)</button></div>
  <p class="mfc-note" style="margin:10px 0 0"><a href="/privacidade.html" target="_blank" rel="noopener">Política de privacidade</a> · <a href="/termos.html" target="_blank" rel="noopener">Termos de uso</a></p></div>
 ${logged()?`<div class="mfc-group mfc-pad mf-lgpd-del"><div class="mfc-lb">Excluir conta</div><p class="mfc-note" style="margin:0 0 10px">Apaga a sua conta e <b>todos</b> os seus dados da nuvem (lançamentos, investimentos, backups e avisos). Não dá para desfazer. Baixe seus dados antes, se quiser guardar.</p><button type="button" class="mfc-btn mf-danger" data-lgpd="del">Excluir minha conta</button></div>`:''}`}

function vBackup(){
 return head('Backup e sincronização')+`<div class="mfc-group mfc-pad"><div class="mfc-kv"><span>Status</span><b>${syncTxt()}</b></div><div class="mfc-kv"><span>Última sincronização</span><b>${logged()?lastSync():'—'}</b></div>${logged()?`<div class="mfc-kv"><span>Cópia em tabelas</span><b class="${window.__mfMirrorErr?'bad':''}">${window.__mfMirrorErr?'Falha':'OK'}</b></div>${window.__mfMirrorErr?`<p class="mfc-note" style="margin:6px 0 0">Seus dados estão salvos. Só a cópia extra nas tabelas lancamentos/Ativos falhou: ${H(window.__mfMirrorErr.msg)}</p>`:''}`:''}${logged()&&typeof queueCloudSave==='function'?'<button type="button" class="mfc-btn" data-cfgact="syncnow" style="margin-top:10px">Sincronizar agora</button>':''}</div>
 <div class="mfc-group mfc-pad"><div class="mfc-lb">Exportar</div><p class="mfc-note" style="margin:0 0 10px">Baixa um arquivo com todos os seus dados (lançamentos, contas, investimentos e configurações).</p><button type="button" class="mfc-btn" data-cfgact="export">Exportar dados (.json)</button></div>
 <div class="mfc-group mfc-pad"><div class="mfc-lb">Restaurar</div><p class="mfc-note" style="margin:0 0 10px">Substitui os dados atuais pelos de um arquivo de backup. O app pede confirmação e, antes de trocar, baixa uma cópia dos dados atuais.</p><label class="mfc-btn ghost">Escolher arquivo de backup<input type="file" accept="application/json,.json" data-cfgrestore hidden></label></div>`}

function vRel(){return typeof window.mfReportsView==='function'?window.mfReportsView(head):head('Central de Relatórios')+'<p class="mfc-note">Carregando…</p>'}

/* ===== Fase 3 · M17 · Layout de lançamento: escolher entre 5 organizações do mesmo formulário ===== */
function lyWire(id) {
 const b = c => `<i class="lyw-${c}"></i>`;
 const W = {
  classico: b('t') + b('amt') + `<div class="lyw-row">${b('f')}${b('f')}</div><div class="lyw-grid">${b('g').repeat(8)}</div>` + `<div class="lyw-pl">${b('p').repeat(4)}</div>` + b('btn'),
  valor: b('t') + b('amt big') + `<div class="lyw-row">${b('f')}${b('f')}</div><div class="lyw-sc">${b('p').repeat(5)}</div><div class="lyw-sc">${b('p').repeat(5)}</div>` + b('btn'),
  compacto: `<div class="lyw-row">${b('t')}${b('amt sm')}</div><div class="lyw-row">${b('f')}${b('f')}</div><div class="lyw-sc">${b('p').repeat(5)}</div><div class="lyw-sc">${b('p').repeat(5)}</div>` + b('btn'),
  lista: `<div class="lyw-li lyw-ficha">${b('l')}${b('l')}${b('l')}${b('l')}</div><div class="lyw-pl">${b('p').repeat(4)}</div><div class="lyw-pl">${b('p').repeat(3)}</div>` + b('btn'),
  passos: `<div class="lyw-dots">${b('d on')}${b('d')}${b('d')}${b('d')}</div>` + b('amt big') + b('f wide') + `<div class="lyw-row">${b('btn s')}${b('btn')}</div>`,
  cartao: `<div class="lyw-card">${b('t')}${b('amt big')}</div><div class="lyw-row">${b('f')}${b('f')}</div><div class="lyw-grid g2">${b('g').repeat(6)}</div>` + b('btn')
 };
 return `<div class="lyw lyw-${id}" aria-hidden="true">${W[id] || ''}</div>`;
}
/* 1.16: prévia grande em cima (o layout tocado) e miniaturas pequenas embaixo; só grava em "Usar este layout" */
let lySel = null;
function vLancar() {
 const cur = mfLancLay(), sel = MF_LANC_LAYS.some(x => x[0] === lySel) ? lySel : cur, it = MF_LANC_LAYS.find(x => x[0] === sel);
 return apHead('lancar') + lySub('lancar')
  + `<div class="lyl-top"><div class="lyl-pv" aria-hidden="true">${lyWire(sel)}</div><div class="lyl-tx"><b>${H(it[1])}${sel === cur ? ' <em>Em uso</em>' : ''}</b><small>${H(it[2])}</small>
   <div class="lyl-bt"><button type="button" class="mfc-btn" data-cfglay="${sel}"${sel === cur ? ' disabled' : ''}>${sel === cur ? 'Em uso ✓' : 'Usar este layout'}</button><button type="button" class="mfc-btn ghost" data-cfglyv="${sel}">Ver no app</button></div></div></div>
  <p class="mfc-note">Toque num modelo para ver em cima. Todos têm os mesmos campos: só muda a organização. Vale para o celular e para o computador.</p>
  <div class="lyl-grid" role="listbox" aria-label="Layouts de lançamento">${MF_LANC_LAYS.map(([id, nm]) => `<button type="button" role="option" class="lyl-it${id === sel ? ' on' : ''}" aria-selected="${id === sel}" data-cfglysel="${id}">${lyWire(id)}<b>${H(nm)}</b>${id === cur ? '<small>Em uso</small>' : ''}</button>`).join('')}</div>`;
}
document.addEventListener('click', e => {
 const b = e.target.closest && e.target.closest('#mf-cfg [data-cfglay],#mf-cfg [data-cfglyv],#mf-cfg [data-cfglysel]');
 if (!b) return; e.preventDefault(); e.stopPropagation();
 /* 2.3: tocar num modelo já aplica: salva, limpa uma pré-visualização antiga (__lyTry, que escondia a escolha) e redesenha o Novo lançamento atrás da janela */
 const aplica = id => { prefs().lanLay = id; lySel = null; window.__lyTry = null; window.__lstep = 1; save(); try { draw(); } catch (_) { } render(); if (window.mfToast) mfToast('Layout de lançamento salvo ✓'); };
 if (b.dataset.cfglysel) { aplica(b.dataset.cfglysel); return; }
 if (b.dataset.cfglay) { aplica(b.dataset.cfglay); return; }
 window.__lyTry = b.dataset.cfglyv; window.__lstep = 1; window.mfCfgClose && mfCfgClose(); tab = 'add'; if (window.mfAddInicio) mfAddInicio(); window.__mfLastTab = null; draw(); scrollTo(0, 0);
}, true);
const VIEWS={main:vMain,lancar:vLancar,perfil:vPerfil,aparencia:vAparencia,telas:vTelas,organizacao:vOrg,notif:vNotif,seguranca:vSeg,backup:vBackup,relatorios:vRel,plano:vPlano,contas:()=>mfAccView(head),adm:()=>window.mfAdmView?mfAdmView(head):head('Central administrativa')};
function box(){let el=document.getElementById('mf-cfg');if(!el){el=document.createElement('div');el.id='mf-cfg';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Configurações');el.innerHTML='<div class="mfc-back-dr" data-cfgclose="1"></div><div class="mfc-panel"></div>';document.body.appendChild(el)}return el}
function render(){const el=box(),p=el.querySelector('.mfc-panel'),st=view===p.dataset.v?p.scrollTop:0;p.innerHTML=(VIEWS[view]||vMain)()+(view==='telas'&&tlBak?'<div class="mfc-done ap-done"><button type="button" class="mfc-btn ghost" data-tlx="1">Descartar</button><button type="button" class="mfc-btn ghost" data-cfgpeek="1">Ver na tela</button><button type="button" class="mfc-btn" data-tlok="1">Aplicar</button></div>':view==='aparencia'&&apD?'<div class="mfc-done ap-done"><button type="button" class="mfc-btn ghost" data-apvx="1">Descartar</button><button type="button" class="mfc-btn ghost" data-cfgpeek="1">Ver na tela</button><button type="button" class="mfc-btn" data-apvok="1">Aplicar</button></div>':view!=='main'&&view!=='adm'?'<div class="mfc-done"><button type="button" class="mfc-btn" data-cfgdone="1">Feito</button></div>':'');p.dataset.v=view;p.scrollTop=st;if(apD&&view==='aparencia')apPaint()}
window.mfCfgRender=render;
/* 1.18: a folha "Adicionar blocos" (js/83) usa a mesma leitura dos blocos de todas as telas para achar os ocultos */
window.mfCollectBlocks=collectBlocks;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cfgdone]');if(!b)return;e.preventDefault();e.stopPropagation();try{document.activeElement&&document.activeElement.blur()}catch(_){}setTimeout(()=>{window.mfCfgClose&&mfCfgClose();mfToast('Alterações salvas ✓')},60)},true);
document.addEventListener('click',e=>{const sw=e.target.closest&&e.target.closest('[data-lo-theme-toggle]');if(!sw)return;e.preventDefault();e.stopPropagation();S.lay=S.lay||{};S.lay.theme=(S.lay.theme==='light')?'dark':'light';document.documentElement.setAttribute('data-theme',S.lay.theme);save();draw()},true);
window.mfCfgOpen=v=>{apDrop();tlDrop();view=v||'main';blocksCache=null;const el=box();el.hidden=false;document.documentElement.classList.add('mf-cfg-on');render()};
window.mfCfgClose=()=>{peekOff();apDrop(1);tlDrop(1);const el=document.getElementById('mf-cfg');if(el)el.hidden=true;document.documentElement.classList.remove('mf-cfg-on');draw()};
const commit=()=>{save();draw()};
function dl(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
const stamp=()=>new Date().toISOString().slice(0,10);
function exportData(prefix){dl(`${prefix||'financeiro-backup'}-${stamp()}.json`,JSON.stringify(S,null,1))}
function photoFrom(file){if(!file||!/^image\//.test(file.type))return;const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{const N=256,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),m=Math.min(img.width,img.height);g.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,N,N);prof().photo=c.toDataURL('image/jpeg',.82);commit();render()};img.onerror=()=>alert('Não foi possível ler esta imagem.');img.src=fr.result};fr.readAsDataURL(file)}
function restoreFrom(file){if(!file)return;const fr=new FileReader();fr.onload=()=>{let d;try{d=JSON.parse(fr.result)}catch(e){alert('Arquivo inválido: não é um backup do app.');return}
 if(!d||typeof d!=='object'||!Array.isArray(d.tx)){alert('Arquivo inválido: não encontrei lançamentos neste backup.');return}
 const cur=(S.tx||[]).length,nv=d.tx.length;
 if(!confirm(`Substituir os dados atuais (${cur} lançamentos) pelos do arquivo (${nv} lançamentos)?\n\nAntes de trocar, uma cópia dos dados atuais será baixada.`))return;
 exportData('financeiro-antes-de-restaurar');S=d;commit();blocksCache=null;view='backup';render();alert('Backup restaurado.')};fr.readAsText(file)}

document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 const top=t.closest('[data-mfcfg],[data-mfpriv]');
 if(top){e.preventDefault();e.stopPropagation();if(top.dataset.mfcfg)window.mfCfgOpen('main');else{window.MF_PRIV=!window.MF_PRIV;window.__eyeAnim=window.MF_PRIV?'fechar':'abrir';try{localStorage.setItem('fin1_priv',window.MF_PRIV?'1':'0')}catch(err){}draw()}return}
 const root=t.closest('#mf-cfg');if(!root)return;
 if(t.closest('.cloud-status-control'))return; // abre o login existente
 const b=t.closest('[data-cfgv],[data-cfgclose],[data-cfgtheme],[data-cfgtheme-toggle],[data-cfgzoom],[data-cfgdev],[data-cfgact],[data-cfgorg]');if(!b)return;
 e.preventDefault();e.stopPropagation();const d=b.dataset;
 if(d.cfgclose){window.mfCfgClose();return}
 if(d.cfgv){if(d.cfgv!==view){apDrop(1);tlDrop(1)}view=d.cfgv;render();root.querySelector('.mfc-panel').scrollTop=0;return}
 if(d.cfgorg){window.mfCfgClose();org=true;draw();scrollTo(0,0);return}
 if(d.cfgthemeToggle!==undefined){S.lay=S.lay||{};S.lay.theme=(S.lay.theme==='light')?'dark':'light';document.documentElement.setAttribute('data-theme',S.lay.theme);commit();render();return}
 if(d.cfgtheme){S.lay=S.lay||{};S.lay.theme=d.cfgtheme;document.documentElement.setAttribute('data-theme',S.lay.theme);commit();render();return}
 if(d.cfgzoom){S.lay=S.lay||{};S.lay.zoom=+d.cfgzoom;commit();render();return}
 if(d.cfgdev){if(window.mfSetAparelho)mfSetAparelho(d.cfgdev);render();return}
 const a=d.cfgact;
 if(a==='rmphoto'){if(confirm('Remover a foto de perfil?')){delete prof().photo;commit();render()}}
 else if(a==='export')exportData();
 else if(a==='syncnow'){try{queueCloudSave()}catch(err){console.error(err)}setTimeout(render,1500)}
 else if(a==='logout'){if(confirm('Sair da conta neste aparelho? Seus dados continuam salvos na nuvem.')){Promise.resolve(typeof supabaseClient!=='undefined'&&supabaseClient?MF_DB.auth.signOut():null).catch(err=>console.error(err)).finally(()=>location.reload())}}
},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#mf-cfg'))return;const d=t.dataset;
 if(d.cfgp!==undefined){prof()[d.cfgp]=String(t.value||'').trim();commit();return}
 if(t.matches('[data-cfgphoto]')){photoFrom(t.files&&t.files[0]);t.value='';return}
 if(t.matches('[data-cfgrestore]')){restoreFrom(t.files&&t.files[0]);t.value='';return}
 if(d.cfgpref){prefs()[d.cfgpref]=t.value;commit();return}
 if(d.cfgsw){const k=d.cfgsw,on=t.checked;
  if(k==='glass'){S.lay=S.lay||{};S.lay.glass=!!on;applyLay();commit();render();return}
  if(k==='priv'){window.MF_PRIV=on;try{localStorage.setItem('fin1_priv',on?'1':'0')}catch(err){}draw();return}
  if(k.startsWith('n:')){prefs().notif[k.slice(2)]=on;save();return}
  if(k.startsWith('hid:')){S.lay=S.lay||{};S.lay.h=S.lay.h||{};S.lay.h[k.slice(4)]=!on;commit();return}}
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const el=document.getElementById('mf-cfg');if(el&&!el.hidden)window.mfCfgClose()}});
// guarda o horário da última sincronização bem-sucedida
(function hook(n){const u=window.updateCloudStatus;if(typeof u==='function'&&!u.__mf){const w=function(){try{if(typeof sync!=='undefined'&&sync==='ok'&&logged())localStorage.setItem('fin1_lastsync',String(Date.now()))}catch(err){}return u.apply(this,arguments)};w.__mf=1;window.updateCloudStatus=w}else if(n<30)setTimeout(()=>hook(n+1),1000)})(0);
})();
