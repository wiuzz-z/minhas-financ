/* Computador: barra lateral, topo, grade de blocos e Investimentos (só roda no modo computador) (1.30 · Fase 6)
   Funções movidas SEM alteração de texto (provado por comparação do código de cada função antes/depois).
   Regra: js/desktop/ e js/mobile/ não chamam um ao outro; o que os dois usam fica nos arquivos compartilhados. */
function mfSideUser(){const P=S.profile||{},nome=(P.nome||P.apelido||'').trim();return `<footer class="mf-sb-user"><button type="button" data-mfcfg="1" aria-label="Configurações e perfil"><span class="mf-avatar">${mfAvatarHtml(36)}</span><span class="mf-sb-un"><b>${escH(nome||'Seu perfil')}</b><small>Configurações</small></span><span class="mf-sb-g">⚙</span></button></footer>`}
function mfDeskTopBase(){const pg=window.mfInvPag&&mfInvPag(),P=S.profile||{},nome=(P.apelido||P.nome||'').trim(),res=tab==='res',ttl=res?(mfSaud()+(nome?', '+escH(nome):'!')):escH(pg?'Investimentos':((S.lay||{}).tn||{})[tab]||MF_TTL[tab]||''),sub=res?'Visão geral das suas finanças':'';
 const eye=mfEyeHtml();   /* 3.7: o mesmo olho animado do celular (js/10) */
 const mid=tab==='anal'?mfAnTop():MF_MTABS.includes(tab)?mfMonthSwitch():'';
 return `<div class="header-bar mf-top mf-dtop"><div class="mf-dt-l${pg?' mf-pag':''}">${pg?'<button type="button" class="mf-voltar" data-invback="1" aria-label="Voltar para Patrimônio"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg><span>Voltar</span></button>':''}<h1>${ttl}</h1>${sub?`<small>${sub}</small>`:''}</div><div class="mf-dt-r">${mid}${eye}<button type="button" class="mf-dt-add" data-quick="1">＋ Novo lançamento</button><button type="button" class="mf-avatar mf-dt-av" data-mfcfg="1" aria-label="Configurações e perfil" title="Configurações"><i class="mf-sync-dot" aria-hidden="true"></i>${mfAvatarHtml(38)}</button></div></div>`}
function dvTable(I,arts){const tot=I.reduce((s,a)=>s+ivNow(a),0)||1,fil=window.__dvFil||'',sort=window.__dvSort||{k:'val',d:-1},ed=window.__dvEdit;
 const present=IV_ORD.filter(k=>I.some(a=>ivClass(a)===k));
 const col={ativo:a=>String(a.a),cls:a=>IV_NOME[ivClass(a)]||'',q:a=>+a.q||0,pm:a=>+a.p||0,cot:a=>ivQuote(a)||0,val:a=>ivNow(a),res:a=>ivPct(a)??-1e9,pct:a=>ivNow(a)};
 let list=I.map((a,i)=>[a,i]).filter(([a])=>!fil||ivClass(a)===fil);const f=col[sort.k]||col.val;list.sort((x,y)=>{const p=f(x[0]),q=f(y[0]);return (typeof p==='string'?p.localeCompare(q):p-q)*sort.d});
 const th=(k,t,al)=>`<th class="${al||''}"><button type="button" data-dvsort="${k}">${t}${sort.k===k?(sort.d<0?' ↓':' ↑'):''}</button></th>`;
 const rows=list.map(([a,i])=>{const k=ivClass(a),q=ivQuote(a),pc=ivPct(a),g=ivGain(a),w=ivNow(a)/tot*100,badge=escH(String(a.a||'?').replace(/[^A-Za-z0-9]/g,'').slice(0,4).toUpperCase()||'?');
  return `<tr class="${ed===i?'on':''}"><td><div class="dv-asset"><span class="dv-badge" style="--c:${IV_COL[k]||'#8e8e93'}">${badge}</span><div><b>${escH(String(a.a==='NOVO'?'Novo ativo':a.a||'Ativo'))}</b><small>${IV_NOME1[k]||''}${isCdbAsset&&isCdbAsset(a)?' · '+(a.cdbPercent??100)+'% CDI':''}</small></div></div></td><td><span class="dv-tag" style="--c:${IV_COL[k]||'#8e8e93'}">${IV_NOME[k]||'—'}</span></td><td class="dv-r">${a.f?'—':(+a.q||0)}</td><td class="dv-r">${R(+a.p||0)}</td><td class="dv-r">${!a.f&&q?R(q):'—'}</td><td class="dv-r"><b>${R(ivNow(a))}</b></td><td class="dv-r">${pc==null?'<span class="dv-st mu">sem cotação</span>':`<span class="dv-st ${pc>=0?'ok':'bad'}">${pc>=0?'▲':'▼'} ${Math.abs(pc).toFixed(1).replace('.',',')}%</span><small class="${g>=0?'ok':'bad'}">${ivSg(g)}</small>`}</td><td><div class="dv-w"><i><b style="width:${Math.max(1.5,w).toFixed(1)}%"></b></i><span>${w.toFixed(1).replace('.',',')}%</span></div></td><td class="dv-r"><button type="button" class="dv-act" data-dvedit="${i}">${ed===i?'Fechar':'Editar'}</button></td></tr>${ed===i?`<tr class="dv-edit"><td colspan="9">${arts[i]||''}</td></tr>`:''}`}).join('');
 const chips=[['','Todos'],...present.map(k=>[k,IV_NOME[k]])].map(([k,t])=>`<button type="button" class="${fil===k?'on':''}" data-dvfil="${k}">${t}</button>`).join('');
 return B('dv_tab')+`<section class="c dv-card dv-wide"><div class="dv-h"><h2>Meus ativos <em>${I.length}</em></h2><div class="dv-tools"><div class="mf-seg">${chips}</div><button type="button" class="dv-btn" data-refresh-quotes>↻ Cotações</button>${typeof mfLancBtn==='function'?mfLancBtn():''}</div></div>
 <div class="dv-tw"><table class="dv-t"><thead><tr>${th('ativo','Ativo')}${th('cls','Classe')}${th('q','Qtd.','dv-r')}${th('pm','Preço médio','dv-r')}${th('cot','Cotação','dv-r')}${th('val','Valor atual','dv-r')}${th('res','Resultado','dv-r')}${th('pct','% carteira')}<th class="dv-r">Ação</th></tr></thead><tbody>${rows||'<tr><td colspan="9" class="mf-empty">Nenhum ativo nesta classe.</td></tr>'}</tbody></table></div><div class="dv-ap"><button type="button" class="mf-cls-ap" data-ivaporte="${fil||''}">＋ Novo aporte${fil?' · '+(IV_NOME[fil]||''):''}</button></div>
 ${S.quoteUpdatedAt?`<p class="dv-foot">Cotações atualizadas em ${new Date(S.quoteUpdatedAt).toLocaleString('pt-BR')}${S.quoteError?' · '+escH(S.quoteError):''}</p>`:''}</section>`}
function vInvDesk(){const old=vInvOld(),raw=rawBlocks(old),I=S.inv,oldAt=(raw.find(r=>r[0]==='i_ativos')||['',''])[1];
 return dvKpis(I)+ivChartBase(I)+dvTable(I,ivAssetArticles(I,oldAt))+dvMetas(I)+dvSim(I)+dvProj(I)}
function mfIsWide(id){const wd=((S.lay||{}).w||{})[id];if(wd)return wd==='f';return MF_DWIDE.includes(mfBase(id))}
/* 3) computador: mês abaixo do título, menor */
function mfDeskTop52(){let h=mfDeskTopBase();const m=h.match(/<div class="mf-msw[^"]*"[^>]*>[\s\S]*?<\/div>/);if(!m||tab==='res')return h;
 h=h.replace(m[0],'');return h.replace('</h1>','</h1>'+m[0].replace('class="mf-msw','class="mf-msw mf-msw-sub'))}
/* computador: Gastos por mês com eixo redondo e barras visíveis */
function mfDashBars(){const nB=+mfView('d_bar','per','8')===12?12:8,ks=Array.from({length:nB},(_,i)=>nm(ym,i-nB+1)),vals=ks.map(k=>dashStats(k,false).exp),top=mfNice(Math.max(...vals,1)/4)*4,W=560,H=230,T=26,Bt=24,L=56,Rr=8,slot=(W-L-Rr)/nB,bw=Math.min(46,slot*.62),Y=v=>T+(H-T-Bt)*(1-v/top),lnB=mfChart('d_bar','barras')==='linha';
 const grid=[0,.25,.5,.75,1].map(f=>{const v=top*f,y=Y(v);return `<line x1="${L}" x2="${W-Rr}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--ln)" stroke-dasharray="3 5"/><text x="${L-8}" y="${(y+3).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--mu)">${anK(v)}</text>`}).join('');
 const lnP=vals.map((v,i)=>[L+slot*(i+.5),Y(v)]),lnD=lnP.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
 const bars=(lnB?`<path d="${lnD}" fill="none" style="stroke:var(--ac)" stroke-width="2.6" stroke-linejoin="round"/>`:'')+vals.map((v,i)=>{const x=L+slot*(i+.5)-bw/2,y=Y(v),last=i===nB-1;return `${lnB?`<circle cx="${(x+bw/2).toFixed(1)}" cy="${y.toFixed(1)}" r="${last?5:3.5}" style="fill:${last?'var(--ac)':'var(--mf-bar)'}"/>`:''}<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(2,Y(0)-y).toFixed(1)}" rx="10" style="fill:${last?'var(--ac)':'var(--mf-bar)'}${lnB?';display:none':''}"><title>${lab(ks[i])}: ${R(v)}</title></rect>${last?`<g><rect x="${(x+bw/2-42).toFixed(1)}" y="${(y-24).toFixed(1)}" width="84" height="18" rx="6" fill="var(--tx)"/><text x="${(x+bw/2).toFixed(1)}" y="${(y-11.5).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--bg)">${R(v)}</text></g>`:''}<text x="${(L+slot*(i+.5)).toFixed(1)}" y="${H-6}" text-anchor="middle" font-size="10" fill="var(--mu)">${MES[+ks[i].slice(5)-1]}</text>`}).join('');
 const pv=vals[nB-2],d=pv>0?(vals[nB-1]-pv)/pv*100:null;
 return B('d_bar')+`<section class="c mf-dbar"><div class="dash-section-head"><div><h2>Gastos por mês</h2></div><span class="mf-dbar-s">${d==null?'':`<span class="mf-dpill ${Math.abs(d)<0.05?'mu':d<=0?'ok':'bad'}">${Math.abs(d)<0.05?'':d>=0?'↑ ':'↓ '}${Math.abs(d).toFixed(1).replace('.',',')}%</span> este mês vs anterior`}</span></div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gastos por mês" style="width:100%;height:auto;display:block">${grid}${bars}</svg></section>`}
function mfDeskTop(){let h=mfDeskTop52();if(MF_NOMONTH.includes(tab))h=mfStripMonth(h);const sg=MF_TOPSEG[tab];h=sg?h.replace('<div class="mf-dt-r">','<div class="mf-dt-r">'+sg()):h;
 const d=new Date(TD+'T12:00:00'),dt=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]+', '+String(d.getDate()).padStart(2,'0')+' '+MES[d.getMonth()]+' '+d.getFullYear();
 return h.replace('<div class="mf-dt-r">',`<div class="mf-dt-r"><label class="mf-dt-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="search" data-dtq placeholder="Buscar lançamentos" aria-label="Buscar lançamentos" value="${tab==='add'?escH(window.__txQ||''):''}"><kbd>Enter</kbd></label><span class="mf-dt-date"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>${dt}</span>`)}

/* ===== Fase 3 · M5: menu lateral recolhível (só no computador) =====
   O menu lateral que já existia ganhou um botão para ficar só com os ícones (a escolha fica guardada neste aparelho) e
   a página atual passa a ser anunciada (aria-current). No celular nada muda: continua a barra de baixo. */
(function () {
  const K = 'fin1_nvc', R = document.documentElement;
  const lido = () => { try { return localStorage.getItem(K) === '1'; } catch (_) { return false; } };
  const aplica = on => { R.classList.toggle('mf-nvc', !!on); try { localStorage.setItem(K, on ? '1' : '0'); } catch (_) { } };
  if (lido()) R.classList.add('mf-nvc');
  const rotulo = (b, on) => { b.setAttribute('aria-label', on ? 'Expandir o menu lateral' : 'Recolher o menu lateral'); b.setAttribute('aria-expanded', String(!on)); b.title = on ? 'Expandir o menu' : 'Recolher o menu'; };
  (window.__mfAD = window.__mfAD || []).push(function () {
    const nv = document.getElementById('nv'); if (!nv || !R.classList.contains('mf-desk')) return;
    const on = R.classList.contains('mf-nvc'), br = nv.querySelector('.mf-sb-brand');
    if (br && !br.querySelector('[data-nvcol]')) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'mf-nvcol'; b.dataset.nvcol = '1'; rotulo(b, on);
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
      br.appendChild(b);
    }
    nv.querySelectorAll('button[data-tab]').forEach(b => {
      if (b.classList.contains('on')) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      const l = b.querySelector('.nv-l'); if (l && !b.title) b.title = l.textContent;
    });
  });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#nv [data-nvcol]'); if (!b) return;
    e.preventDefault(); e.stopPropagation(); aplica(!R.classList.contains('mf-nvc')); rotulo(b, R.classList.contains('mf-nvc'));
  }, true);
})();
