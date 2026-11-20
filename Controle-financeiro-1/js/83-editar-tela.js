/* Editar tela (1.15; celular refeito na 2.2) — personalizar a tela em cima da própria tela, como os widgets do celular.
   Em modo edição cada bloco ganha contorno tracejado e um "−" no canto (ocultar; nos blocos adicionados, remover).
   No fim da tela, o quadro "+" abre a folha "Adicionar blocos" (widgets com prévia e blocos ocultos para trazer de volta).
   Tudo é rascunho: só "Pronto" grava (save). "Cancelar" devolve exatamente o que estava.
   Mesmo esqueleto de blocos do app (S.lay.o / h / w / wg / mvt), por aparelho: celular e computador separados.
   Também aplica o estilo "Compacto" das telas (S.lay.dens = 'c').

   Celular (2.2):
   - Segurar um bloco em qualquer tela entra no "Editar tela" com o bloco já levantado, pronto para arrastar (sem menu).
   - No modo edição: segurar e arrastar move o bloco para qualquer lugar (vaga tracejada mostra onde ele cai; os outros
     abrem espaço com animação). Tocar no bloco mostra a pílula "Editar bloco", que abre a folha #mf-ed-bs com tudo o que
     antes ficava no toque longo (nome, tamanho, largura, modelo, gráfico, cores e efeitos, aba, ocultar).
     A folha fica fora do bloco: o bloco nunca muda de tamanho por estar escolhido, e cada escolha aparece na hora nele.
   - Coluna escolhida ao arrastar: S.lay.cl[id] ('a' esquerda, 'b' direita), usada pelo encaixe (js/83-encaixe.js).
   Computador: igual à 1.15–2.1 (barra dentro do bloco, arrastar com o mouse). */
(function () {
 'use strict';
 if (typeof MF_DEV_K !== 'undefined' && !MF_DEV_K.includes('dens')) MF_DEV_K.push('dens');
 const KS = ['o', 'h', 'w', 'wg', 'mvt'];
 /* no celular o rascunho cobre também tamanho, nome, aparência e coluna: "Cancelar" desfaz tudo o que a folha mexeu */
 const KS_MOB = KS.concat(['sz', 'bt', 'lk', 'cl']);
 const CURVA = 'cubic-bezier(.2,.8,.2,1)';
 let ed = null, dg = null, semClique = 0, sheetAba = 'res', busca = '', sheetSel = null, pousando = false;
 const L = () => S.lay || (S.lay = {});
 const ehWg = id => /^p_wg~\d+$/.test(id);
 const idDe = el => String(el.dataset.bk || '').split('|')[1] || '';
 const nomeTela = t => ((S.lay || {}).tn || {})[t] || (typeof MF_TTL !== 'undefined' && MF_TTL[t]) || t;
 const desk = () => !!(window.mfIsDesk && mfIsDesk());
 const semAnim = () => document.documentElement.getAttribute('data-mfanim') === '0' || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
 const vibra = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) { } };
 const toast = m => { if (window.mfToast) mfToast(m); };
 function snap(ks) { const l = L(), o = { __ks: ks }; ks.forEach(k => { if (l[k] !== undefined) o[k] = JSON.parse(JSON.stringify(l[k])); }); if (ks === KS_MOB) o.__view = JSON.stringify(S.view || {}); return o; }
 function volta(b) { const l = L(); (b.__ks || KS).forEach(k => { if (k in b) l[k] = b[k]; else delete l[k]; }); if (b.__view) S.view = JSON.parse(b.__view); }

 /* ---------- estilo Compacto ---------- */
 const applyOrig = applyLay;
 applyLay = function () {
  const r = applyOrig.apply(this, arguments);
  try {
   const root = document.documentElement, c = (S.lay || {}).dens === 'c';
   if (c) { root.setAttribute('data-mfdens', 'c'); root.style.setProperty('--card-pad', '11px'); root.style.setProperty('--layout-gap', '9px'); }
   else root.removeAttribute('data-mfdens');
  } catch (e) { }
  return r;
 };

 /* ---------- abrir / sair ---------- */
 window.mfEdOn = () => !!ed;
 function novoEd(t, sel) { return { t, bak: snap(desk() ? KS : KS_MOB), sel: sel || '', bs: '', sujo: false }; }
 window.mfEdOpen = function (t) {
  if (ed) return;
  const c = document.getElementById('mf-cfg'); if (c && !c.hidden && window.mfCfgClose) mfCfgClose();
  if (t && t !== tab) { tab = t; window.__mfLastTab = null; }
  ed = novoEd(tab);
  document.documentElement.classList.add('mf-ed-on');
  barra(); draw(); scrollTo(0, 0); requestAnimationFrame(() => scrollTo(0, 0));
 };
 /* celular: segurar um bloco fora da edição entra no modo edição sem redesenhar a tela
    (o bloco precisa continuar sendo o mesmo elemento debaixo do dedo, senão o navegador cancela o arrasto) */
 function entraSegurando(b) {
  const id = idDe(b), y0 = b.getBoundingClientRect().top;
  ed = novoEd(tab, id);
  document.documentElement.classList.add('mf-ed-on');
  barra();
  const app = document.getElementById('app'), en = app && app.querySelector('.mf-ed-entry'); if (en) en.remove();
  decora();
  if (window.mfEncaixe) mfEncaixe();
  const d = b.getBoundingClientRect().top - y0; if (Math.abs(d) > .5) scrollBy(0, d);
 }
 function sair(ok) {
  if (!ed) return;
  if (dg) cancelaArrasto();
  fechaBs(true);
  if (ok) save(); else { volta(ed.bak); if (ed.sujo) save(); }
  ed = null; dg = null; fechaSheet();
  document.documentElement.classList.remove('mf-ed-on', 'mf-ed-arrasta', 'mf-ed-bs-on');
  const b = document.getElementById('mf-ed-bar'); if (b) b.remove();
  draw();
  toast(ok ? 'Tela salva ✓' : 'Alterações descartadas');
 }
 window.mfEdClose = sair;
 function muda(f, sel, pop) {
  const antes = desk() ? null : posicoes();
  f(L()); if (sel !== undefined) ed.sel = sel;
  draw();
  if (antes) anima(antes, pop);
 }
 function barra() {
  let b = document.getElementById('mf-ed-bar');
  if (!b) { b = document.createElement('div'); b.id = 'mf-ed-bar'; document.body.appendChild(b); }
  b.innerHTML = `<div class="mf-ed-tt"><small>Editando</small><b>${escH(nomeTela(ed.t))}</b></div><button type="button" class="mf-ed-bt" data-edno="1">Cancelar</button><button type="button" class="mf-ed-bt ok" data-edok="1">Pronto</button>`;
 }

 /* ---------- blocos, posições e animação de reencaixe (FLIP) ---------- */
 function blocos() { return [...document.querySelectorAll('#app [data-bk]')].filter(e => !e.parentElement.closest('#app [data-bk]')); }
 function bloco(id) { return blocos().find(e => idDe(e) === id) || null; }
 /* o que ocupa o lugar na grade: o próprio bloco ou o invólucro de largura inteira dentro de um grupo de duas colunas */
 function unidade(b) { const p = b.parentElement; return p && p.id !== 'app' && !p.classList.contains('g2') && !p.matches('[data-bk]') && p.parentElement && p.parentElement.classList.contains('g2') ? p : b; }
 function posicoes() { const m = new Map(); blocos().forEach(el => m.set(idDe(el), unidade(el).getBoundingClientRect())); return m; }
 function anima(antes, pop, pular) {
  if (!antes || semAnim()) return;
  blocos().forEach(el => {
   const id = idDe(el), u = unidade(el); if (u === pular) return;
   if (u.getAnimations) u.getAnimations().forEach(x => { if (x.id === 'mf-flip') x.cancel(); });
   const a = antes.get(id); if (!a || !u.animate) return;
   const b = u.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
   if (id === pop) { u.animate([{ transform: `translate(${dx}px,${dy}px) scale(.97)` }, { transform: 'none' }], { duration: 220, easing: CURVA, id: 'mf-flip' }); return; }
   if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
   u.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 220, easing: CURVA, id: 'mf-flip' });
  });
 }

 /* ---------- depois de cada desenho: contorno, "−", pílula/barra do bloco escolhido e o quadro "+" ---------- */
 function barraBloco(id) {
  const w = (L().w || {})[id] || '', larg = [['', 'Padrão'], ['f', 'Inteira'], ['h', 'Meia']].concat(desk() ? [['t', 'Um terço']] : []);
  let aba = '';
  if (ehWg(id)) {
   /* 1.16: bloco adicionado ganha Tamanho e Modelo */
   const x = (mfWgList(ed.t) || []).find(y => y.id === id);
   if (x && window.MF_WG && MF_WG[x.k]) {
    const v = mfWgModelo(x.k, x.v), sz = mfWgSz(x.k, x.sz, v), M = MF_WG[x.k].m;
    aba = `<div class="mf-ed-ln"><small>Tamanho</small><span class="mf-ed-wd" role="group" aria-label="Tamanho">${MF_WG_SZ.filter(([k]) => k !== 'x' || mfWgMiniOk(x.k, v)).map(([k, t]) => `<button type="button" class="${sz === k ? 'on' : ''}" data-edwsz="${escH(id)}:${k}">${t}</button>`).join('')}</span></div>`
     + (M.length > 1 ? `<div class="mf-ed-ln"><small>Modelo</small><span class="mf-ed-wd" role="group" aria-label="Modelo">${M.map(([k, t]) => `<button type="button" class="${v === k ? 'on' : ''}" data-edwv="${escH(id)}:${k}">${escH(t)}</button>`).join('')}</span></div>` : '');
   }
  } else {
   const m = (L().mvt || {})[id], casa = (m && m.f) || ed.t, dest = (m && m.t) || casa, abas = tbs().filter(k => k === casa || k !== 'mais');
   aba = `<label class="mf-ed-ln"><small>Mostrar na aba</small><select data-edto="${escH(id)}">${abas.map(k => `<option value="${k}"${k === dest ? ' selected' : ''}>${escH(nomeTela(k))}</option>`).join('')}</select></label>`;
  }
  return `<div class="mf-ed-ctl mf-ed-tb"><div class="mf-ed-ln"><button type="button" class="mf-ed-ar" data-edmv="${escH(id)}:-1" aria-label="Subir">↑</button><button type="button" class="mf-ed-ar" data-edmv="${escH(id)}:1" aria-label="Descer">↓</button><span class="mf-ed-wd" role="group" aria-label="Largura">${larg.map(([v, x]) => `<button type="button" class="${w === v ? 'on' : ''}" data-edw="${escH(id)}:${v}">${x}</button>`).join('')}</span></div>${aba}</div>`;
 }
 function decora() {
  const app = document.getElementById('app'); if (!app) return;
  if (!ed) {
   if (!app.querySelector('.mf-ed-entry') && typeof org !== 'undefined' && !org && tbs().includes(tab)) app.insertAdjacentHTML('beforeend', `<div class="mf-ed-entry"><button type="button" data-edopen="${tab}">Editar tela</button></div>`);
   return;
  }
  if (tab !== ed.t) { ed.t = tab; barra(); fechaBs(true); }
  const mob = !desk();
  if (mob && ed.bs && !bloco(ed.bs)) fechaBs(true);
  blocos().forEach(el => {
   const id = idDe(el); if (!id) return;
   el.classList.add('mf-ed-b'); if (id === ed.sel) el.classList.add('mf-ed-sel'); if (mob && id === ed.bs) el.classList.add('mf-ed-bs-alvo');
   const extra = id !== ed.sel ? '' : mob ? `<button type="button" class="mf-ed-ctl mf-ed-pill" data-edbs="${escH(id)}" aria-label="Editar este bloco">Editar bloco</button>` : barraBloco(id);
   el.insertAdjacentHTML('beforeend', `<button type="button" class="mf-ed-ctl mf-ed-x" data-edx="${escH(id)}" aria-label="${ehWg(id) ? 'Remover' : 'Ocultar'} este bloco">−</button>` + extra);
  });
  const top = app.firstElementChild;
  const dica = `<div class="mf-ed-ctl mf-ed-hint">${desk() ? 'Arraste um bloco para mudar a ordem. Toque nele para mudar a largura. O "−" esconde.' : 'Segure um bloco e arraste para mudar de lugar. Toque nele para editar. O "−" esconde.'}</div>`;
  if (top && !top.matches('[data-bk]')) top.insertAdjacentHTML('afterend', dica); else app.insertAdjacentHTML('afterbegin', dica);
  app.insertAdjacentHTML('beforeend', `<button type="button" class="mf-ed-ctl mf-ed-add" data-edadd="1"><span aria-hidden="true">+</span><b>Adicionar bloco</b></button>`);
  if (mob && ed.bs) pintaBs();
 }
 window.__mfAD.push(decora);
 /* a primeira tela é desenhada antes deste arquivo carregar: o botão "Editar tela" entra quando a página termina de carregar */
 document.addEventListener('DOMContentLoaded', () => { try { decora(); } catch (e) { console.warn('Editar tela', e); } });

 /* ---------- ordem ---------- */
 function ordem() { return ((typeof LAST !== 'undefined' && LAST[ed.t]) || blocos().map(idDe)).slice(); }
 function poe(id, alvo, depois) {
  const a = ordem().filter(x => x !== id), i = a.indexOf(alvo); if (i < 0) return;
  a.splice(depois ? i + 1 : i, 0, id);
  muda(l => { l.o = Object.assign({}, l.o || {}); l.o[ed.t] = a; }, id);
 }
 function sobeDesce(id, d) {
  const vis = blocos().map(idDe), i = vis.indexOf(id), j = i + d; if (i < 0 || j < 0 || j >= vis.length) return;
  poe(id, vis[j], d > 0);
 }

 /* ---------- mudanças de um bloco (usadas pela barra do computador e pela folha do celular) ---------- */
 function semColuna(l, id) { if (l.cl && l.cl[id] !== undefined) { l.cl = Object.assign({}, l.cl); delete l.cl[id]; if (!Object.keys(l.cl).length) delete l.cl; } }
 function wgMuda(id, campo, val) {
  muda(l => {
   const W = Object.assign({}, l.wg || {}); let sz = null;
   W[ed.t] = (W[ed.t] || []).map(x => {
    if (!x || x.id !== id) return x;
    const y = Object.assign({}, x, { [campo]: val });
    /* modelo sem número principal não fica em Mini: passa a Pequeno */
    if (campo === 'v' && y.sz === 'x' && !mfWgMiniOk(y.k, val)) y.sz = 'p';
    if (campo === 'sz' || y.sz !== x.sz) sz = y.sz;
    return y;
   });
   l.wg = W;
   /* Mini e Pequeno = meia largura (Mini no computador: um terço); Grande = inteira; Médio volta à largura padrão */
   if (sz !== null) { l.w = Object.assign({}, l.w || {}); const lg = mfWgLarg(sz); if (lg) l.w[id] = lg; else delete l.w[id]; if (lg !== 'h') semColuna(l, id); }
  }, id, id);
 }
 function tira(id) {
  if (ehWg(id)) muda(l => { const W = Object.assign({}, l.wg || {}); W[ed.t] = (W[ed.t] || []).filter(x => x && x.id !== id); if (!W[ed.t].length) delete W[ed.t]; l.wg = W; if (l.w) delete l.w[id]; semColuna(l, id); }, '');
  else muda(l => { l.h = Object.assign({}, l.h || {}); l.h[id] = true; }, '');
 }

 /* ---------- folha "Editar bloco" (celular) ---------- */
 const SZ_APP = { z: 'm', h: 'a', p: 'n' };
 function wgItem(id) { return (window.mfWgList ? mfWgList(ed.t) || [] : []).find(y => y.id === id) || null; }
 function szApp(id) { return Object.assign({}, SZ_APP, ((L().sz || {})[id]) || {}); }
 function largApp(id) {
  const w = (L().w || {})[id]; if (w) return w === 'h' ? 'h' : 'f';
  const cheio = id.startsWith('c_') ? ((typeof WIDE !== 'undefined' && WIDE.includes(id)) || /^c_.+_\d+$/.test(id)) : true;
  return cheio ? 'f' : 'h';
 }
 function nomePadrao(id) { const el = bloco(id), hd = el && el.querySelector('h2,h3'); return hd ? (hd.dataset.mfdef || hd.textContent.replace(/[▸▾▼›‹✎⚙]/g, '').replace(/\s+/g, ' ').trim()) : ''; }
 function nomeBloco(id) {
  if (ehWg(id)) { const x = wgItem(id); return x && window.MF_WG && MF_WG[x.k] ? MF_WG[x.k].n : 'Bloco'; }
  return ((L().bt || {})[id]) || nomePadrao(id) || id.replace(/^[a-z]+_/, '').replace(/_/g, ' ');
 }
 const seg = (campo, atual, ops, nome, fora) => `<div class="bs-r"><small>${nome}</small><div class="bs-seg" role="group" aria-label="${nome}">${ops.map(([k, t]) => `<button type="button" class="${atual === k ? 'on' : ''}" aria-pressed="${atual === k}"${(fora || []).includes(k) ? ' aria-disabled="true"' : ''} data-bs="${campo}:${k}">${escH(t)}</button>`).join('')}</div></div>`;
 const acao = (k, ic, txt, perigo) => `<button type="button" data-bsac="${k}"${perigo ? ' class="bs-perigo"' : ''}><i class="bs-ic bs-ic-${ic}" aria-hidden="true"></i><span>${txt}</span></button>`;
 function corpoBs(id, mais) {
  if (ehWg(id)) {
   const x = wgItem(id); if (!x || !window.MF_WG || !MF_WG[x.k]) return '';
   const v = mfWgModelo(x.k, x.v), sz = mfWgSz(x.k, x.sz, v), M = MF_WG[x.k].m, mini = mfWgMiniOk(x.k, v);
   return seg('wsz', sz, MF_WG_SZ, 'Tamanho', mini ? [] : ['x'])
    + (M.length > 1 ? seg('wv', v, M, 'Modelo') : '')
    + `<div class="bs-ls">${acao('cor', 'cor', 'Cores, formato, texto e efeitos')}${acao('tira', 'tira', 'Remover bloco', 1)}</div>`;
  }
  const z = szApp(id), def = nomePadrao(id), nm = (L().bt || {})[id] || '';
  const m = (L().mvt || {})[id], casa = (m && m.f) || ed.t, dest = (m && m.t) || casa, abas = tbs().filter(k => k === casa || k !== 'mais');
  const vw = typeof MF_VIEW !== 'undefined' && (MF_VIEW[id] || MF_VIEW[mfBase(id)]);
  return (def ? `<label class="bs-r"><small>Nome do bloco</small><span class="bs-nm"><input type="text" data-bsnome="${escH(id)}" maxlength="40" value="${escH(nm)}" placeholder="${escH(def)}" enterkeyhint="done">${nm ? '<button type="button" data-bsnomer="1">Original</button>' : ''}</span></label>` : '')
   + seg('z', z.z, [['s', 'Pequeno'], ['m', 'Normal'], ['l', 'Grande']], 'Tamanho')
   + seg('w', largApp(id), [['f', 'Inteira'], ['h', 'Meia']], 'Largura')
   + (typeof mfChartRow === 'function' ? mfChartRow(id) : '')
   + `<details class="bs-mais"${mais ? ' open' : ''}><summary>Mais ajustes</summary>${seg('h', z.h, [['c', 'Compacta'], ['a', 'Automática'], ['t', 'Alta']], 'Altura')}${seg('p', z.p, [['j', 'Justo'], ['n', 'Normal'], ['a', 'Amplo']], 'Espaço interno')}</details>`
   + `<label class="bs-r"><small>Mostrar na aba</small><select data-edto="${escH(id)}">${abas.map(k => `<option value="${k}"${k === dest ? ' selected' : ''}>${escH(nomeTela(k))}</option>`).join('')}</select></label>`
   + `<div class="bs-ls">${vw ? acao('info', 'info', 'Gráfico e informações') : ''}${acao('cor', 'cor', 'Cores, formato, texto e efeitos')}${acao('fora', 'fora', 'Ocultar bloco', 1)}</div>`;
 }
 function pintaBs() {
  const s = document.getElementById('mf-ed-bs'); if (!s || !ed || !ed.bs) return;
  const c = s.querySelector('.bs-c'), y = c.scrollTop, mais = !!c.querySelector('.bs-mais[open]'), ae = document.activeElement, foco = ae && c.contains(ae) && ae.matches('input[type="text"]');
  if (foco) return; /* digitando o nome: não troca o campo debaixo do teclado */
  s.querySelector('.bs-tt b').textContent = nomeBloco(ed.bs);
  c.innerHTML = corpoBs(ed.bs, mais);
  c.scrollTop = y;
 }
 function abreBs(id) {
  if (!ed || !bloco(id)) return;
  ed.bs = id; ed.sel = id;
  let s = document.getElementById('mf-ed-bs');
  if (s && s.dataset.sai) { s.remove(); s = null; }
  if (!s) {
   s = document.createElement('div'); s.id = 'mf-ed-bs'; s.setAttribute('role', 'dialog'); s.setAttribute('aria-label', 'Editar bloco');
   s.innerHTML = `<div class="bs"><i class="bs-al" aria-hidden="true"></i><div class="bs-top"><div class="bs-tt"><small>Editar bloco</small><b></b></div><button type="button" class="bs-ok" data-bsfim="1">Concluir</button></div><div class="bs-c"></div></div>`;
   document.body.appendChild(s);
   if (semAnim()) s.classList.add('on'); else requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('on')));
  }
  document.documentElement.classList.add('mf-ed-bs-on');
  draw(); /* marca o bloco, esconde a pílula e pinta a folha (decora) */
  const c = s.querySelector('.bs-c'); if (c) c.scrollTop = 0;
  foca(id);
 }
 function fechaBs(quieto) {
  document.documentElement.classList.remove('mf-ed-bs-on');
  const s = document.getElementById('mf-ed-bs');
  const tinha = !!(ed && ed.bs); if (ed) ed.bs = '';
  if (s) {
   if (document.activeElement && s.contains(document.activeElement)) document.activeElement.blur();
   if (quieto || semAnim()) s.remove(); else { s.dataset.sai = '1'; s.classList.remove('on'); setTimeout(() => s.remove(), 300); }
  }
  if (!quieto && tinha && ed) draw();
 }
 /* a pílula "Editar bloco" não fica escondida atrás da barra Cancelar/Pronto */
 function pilulaVisivel(id) {
  const el = bloco(id), p = el && el.querySelector('.mf-ed-pill'), bar = document.getElementById('mf-ed-bar'); if (!p) return;
  const limite = innerHeight - (bar ? bar.offsetHeight : 0) - 12, r = p.getBoundingClientRect();
  if (r.bottom > limite) scrollBy({ top: r.bottom - limite, behavior: semAnim() ? 'auto' : 'smooth' });
 }
 /* o bloco editado fica à vista, acima da folha */
 function foca(id) {
  setTimeout(() => {
   const el = bloco(id), s = document.querySelector('#mf-ed-bs .bs'); if (!el || !s) return;
   const r = unidade(el).getBoundingClientRect(), livre = innerHeight - s.offsetHeight, alvo = r.height > livre - 32 ? 16 : Math.max(16, (livre - r.height) / 2);
   if (r.top < 16 || r.bottom > livre - 16) scrollBy({ top: r.top - alvo, behavior: semAnim() ? 'auto' : 'smooth' });
  }, 40);
 }
 function bsAplica(campo, val) {
  const id = ed.bs; if (!id) return;
  if (campo === 'wsz' || campo === 'wv') {
   if (campo === 'wsz' && val === 'x') { const x = wgItem(id); if (x && !mfWgMiniOk(x.k, mfWgModelo(x.k, x.v))) return toast('Este modelo não tem versão Mini'); }
   return wgMuda(id, campo === 'wsz' ? 'sz' : 'v', val);
  }
  if (campo === 'w') return muda(l => { l.w = Object.assign({}, l.w || {}); l.w[id] = val; if (val !== 'h') semColuna(l, id); }, id, id);
  if (campo in SZ_APP) return muda(l => {
   l.sz = Object.assign({}, l.sz || {}); const z = Object.assign({}, l.sz[id] || {});
   if (val === SZ_APP[campo]) delete z[campo]; else z[campo] = val;
   if (Object.keys(z).length) l.sz[id] = z; else delete l.sz[id];
  }, id, id);
 }
 function bsAcao(k) {
  const id = ed.bs; if (!id) return;
  if (k === 'cor' || k === 'info') { fechaBs(true); ed.sujo = true; draw(); return mfLkOpen(id, k); }
  fechaBs(true);
  tira(id);
  if (k === 'fora') toast('Bloco oculto. Ele volta pelo "+ Adicionar bloco".');
 }
 function nomeMuda(id, v) { muda(l => { l.bt = Object.assign({}, l.bt || {}); if (v) l.bt[id] = v; else delete l.bt[id]; if (!Object.keys(l.bt).length) delete l.bt; }, id); }

 /* ---------- cliques ---------- */
 document.addEventListener('click', e => {
  const t = e.target;
  const ab = t.closest && t.closest('[data-edopen]');
  if (ab && !ed) { e.preventDefault(); e.stopPropagation(); mfEdOpen(ab.dataset.edopen); return; }
  if (!ed) return;
  if (performance.now() - semClique < 450 || pousando) { e.preventDefault(); e.stopPropagation(); return; }
  if (t.closest('#mf-ed-bs [data-lpchart]')) { ed.sujo = true; return; } /* tipo de gráfico (js/30) grava na hora: "Cancelar" regrava o anterior */
  const c = t.closest('[data-edx],[data-edmv],[data-edw],[data-edadd],[data-edok],[data-edno],[data-edfecha],[data-edseg],[data-edaddk],[data-edshow],[data-edpick],[data-edsz],[data-edmod],[data-edvolta],[data-edwsz],[data-edwv],[data-edbs],[data-bs],[data-bsac],[data-bsfim],[data-bsnomer]');
  if (c) {
   e.preventDefault(); e.stopPropagation();
   const d = c.dataset;
   if (d.edok) return sair(true);
   if (d.edno) return sair(false);
   if (d.edbs) return abreBs(d.edbs);
   if (d.bsfim) return fechaBs();
   if (d.bs) { const k = d.bs.indexOf(':'); return bsAplica(d.bs.slice(0, k), d.bs.slice(k + 1)); }
   if (d.bsac) return bsAcao(d.bsac);
   if (d.bsnomer) return ed.bs && nomeMuda(ed.bs, '');
   if (d.edadd) { fechaBs(true); return abreSheet(); }
   if (d.edfecha) return fechaSheet();
   if (d.edseg) { sheetAba = d.edseg; sheetSel = null; return pintaSheet(); }
   if (d.edpick) { const k = d.edpick; sheetSel = { k, sz: 'm', v: mfWgModelo(k) }; return pintaSheet(); }
   if (d.edvolta) { sheetSel = null; return pintaSheet(); }
   if (d.edsz && sheetSel) { sheetSel.sz = d.edsz; return pintaSheet(); }
   if (d.edmod && sheetSel) { sheetSel.v = d.edmod; if (sheetSel.sz === 'x' && !mfWgMiniOk(sheetSel.k, sheetSel.v)) sheetSel.sz = 'p'; return pintaSheet(); }
   if (d.edwsz || d.edwv) { const r = d.edwsz || d.edwv, k = r.lastIndexOf(':'); return wgMuda(r.slice(0, k), d.edwsz ? 'sz' : 'v', r.slice(k + 1)); }
   if (d.edx) { if (ed.bs === d.edx) fechaBs(true); return tira(d.edx); }
   if (d.edmv) { const k = d.edmv.lastIndexOf(':'); return sobeDesce(d.edmv.slice(0, k), +d.edmv.slice(k + 1)); }
   if (d.edw) { const k = d.edw.lastIndexOf(':'), id = d.edw.slice(0, k), v = d.edw.slice(k + 1); return muda(l => { l.w = Object.assign({}, l.w || {}); if (v) l.w[id] = v; else delete l.w[id]; }, id); }
   if (d.edaddk) {
    const k = d.edaddk, id = mfWgNovoId(), o = sheetSel && sheetSel.k === k ? sheetSel : { sz: 'm', v: mfWgModelo(k) }, it = { id, k }, sz = mfWgSz(k, o.sz, o.v), sub = mfWgSub(ed.t);
    if (sz !== 'm') it.sz = sz;
    if (o.v && o.v !== MF_WG[k].m[0][0]) it.v = o.v;
    if (sub) it.s = sub; /* 1.18: o bloco fica na subaba aberta agora */
    fechaSheet();
    muda(l => { const W = Object.assign({}, l.wg || {}); W[ed.t] = (Array.isArray(W[ed.t]) ? W[ed.t] : []).concat([it]); l.wg = W; const lg = mfWgLarg(sz); if (lg) { l.w = Object.assign({}, l.w || {}); l.w[id] = lg; } }, id);
    return mostra(id);
   }
   if (d.edshow) {
    const id = d.edshow, t = d.edshowt || ed.t; fechaSheet(); muda(l => { l.h = Object.assign({}, l.h || {}); l.h[id] = false; }, t === ed.t ? id : '');
    if (t !== ed.t) { toast('O bloco voltou para ' + nomeTela(t)); return; }
    return mostra(id);
   }
   return;
  }
  if (t.closest('#mf-ed-sheet,#mf-ed-bar,#mf-ed-bs,#mf-lk,select')) return;
  if (t.closest('[data-ctmode],[data-invmode],[data-anmode]')) return; // trocar de subaba continua valendo
  const b = t.closest('#app .mf-ed-b');
  if (b) {
   e.preventDefault(); e.stopPropagation(); const id = idDe(b);
   if (!desk() && ed.bs) { if (id !== ed.bs) abreBs(id); return; } /* com a folha aberta, tocar em outro bloco passa a editar ele */
   ed.sel = ed.sel === id ? '' : id; draw(); if (!desk() && ed.sel) pilulaVisivel(id); return;
  }
  if (t.closest('#app,#nv')) { e.preventDefault(); e.stopPropagation(); }
 }, true);
 document.addEventListener('change', e => {
  if (!ed || !e.target.closest) return;
  const s = e.target.closest('[data-edto]'); if (!s) return;
  const id = s.dataset.edto, v = s.value, m = (L().mvt || {})[id], casa = (m && m.f) || ed.t;
  if (ed.bs === id && v !== ed.t) fechaBs(true);
  muda(l => { l.mvt = Object.assign({}, l.mvt || {}); if (v === casa) delete l.mvt[id]; else l.mvt[id] = { f: casa, t: v }; }, '');
  if (v !== ed.t) toast('O bloco vai para ' + nomeTela(v) + ' quando você tocar em Pronto');
 }, true);
 document.addEventListener('keydown', e => {
  if (!ed || desk() || !ed.bs) return;
  const n = e.target.closest && e.target.closest('[data-bsnome]');
  if (n && e.key === 'Enter') { e.preventDefault(); n.blur(); return; }
  if (e.key === 'Escape' && !document.getElementById('mf-ed-sheet')) { e.preventDefault(); fechaBs(); }
 }, true);
 /* o nome do bloco vale quando o campo perde o foco ("Enter", tocar fora ou o teclado fechar) */
 document.addEventListener('focusout', e => {
  const n = ed && e.target.closest && e.target.closest('[data-bsnome]'); if (!n) return;
  const v = n.value.trim(), id = n.dataset.bsnome; if (v !== (((L().bt || {})[id]) || '')) setTimeout(() => { if (ed) nomeMuda(id, v); }, 0);
 }, true);
 function mostra(id) { setTimeout(() => { const el = document.querySelector(`#app [data-bk$="|${id}"]`); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 60); }

 /* ---------- arrastar ---------- */
 const SEGURA_FORA = 450, SEGURA_ED = 320, FOLGA = 9;
 const JANELAS = '#mf-lk,#mf-confirm,#mf-lock,.quick-backdrop,#cb-pop,#mf-note,#mf-ed-sheet,#mf-lp';
 /* celular, fora da edição: qual bloco o dedo está segurando (null = o toque longo não vale aqui) */
 function blocoFora(t) {
  if (!t || !t.closest || ed || desk() || !t.closest('#app')) return null;
  if ((typeof org !== 'undefined' && org) || !tbs().includes(tab) || document.body.classList.contains('org-on')) return null;
  if (document.documentElement.classList.contains('mf-locked') || document.querySelector(JANELAS)) return null;
  const cfg = document.getElementById('mf-cfg'); if (cfg && !cfg.hidden) return null;
  if (t.closest('input,select,textarea,label,[contenteditable],.header-bar,.mf-seg,.mf-msw,.ia-card details,.mf-form,.mf-ed-entry')) return null;
  let b = t.closest('#app [data-bk]'); if (!b) return null;
  for (let p = b.parentElement && b.parentElement.closest('#app [data-bk]'); p; p = p.parentElement && p.parentElement.closest('#app [data-bk]')) b = p;
  return b;
 }
 document.addEventListener('contextmenu', e => {
  if (desk() || !e.target.closest || e.target.closest('input,textarea,[contenteditable]')) return;
  if (e.target.closest('#app [data-bk]') || dg) e.preventDefault();
 }, true);
 document.addEventListener('pointerdown', e => {
  if (e.button > 0 || dg || pousando) return;
  if (!ed) {
   const b = blocoFora(e.target); if (!b) return;
   dg = { b, id: idDe(b), x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, on: false, fora: true, rato: e.pointerType === 'mouse' };
   dg.tm = setTimeout(() => {
    const g = dg; if (!g || g.on || !g.fora) return;
    if ((window.mfSwOn && mfSwOn()) || !document.contains(g.b)) { dg = null; return; } /* o dedo já está trocando de subaba */
    entraSegurando(g.b); comeca();
   }, SEGURA_FORA);
   return;
  }
  const b = e.target.closest && e.target.closest('#app .mf-ed-b');
  if (!b || e.target.closest('.mf-ed-ctl,select,input')) return;
  if (!desk() && ed.bs) return; /* com a folha aberta, o toque só escolhe o bloco */
  dg = { b, id: idDe(b), x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, on: false, toque: e.pointerType !== 'mouse', rato: e.pointerType === 'mouse', tm: 0, alvo: null, depois: false };
  if (dg.toque) dg.tm = setTimeout(() => { if (dg && !dg.on) comeca(); }, SEGURA_ED);
 }, true);
 function comeca() {
  if (desk()) { dg.on = true; dg.b.classList.add('mf-ed-drag'); document.documentElement.classList.add('mf-ed-arrasta'); vibra(12); return; }
  levanta();
 }
 function limpaAlvo() { document.querySelectorAll('#app .mf-ed-antes,#app .mf-ed-depois').forEach(x => x.classList.remove('mf-ed-antes', 'mf-ed-depois')); }
 document.addEventListener('pointermove', e => {
  if (!dg) return;
  const dx = e.clientX - dg.x, dy = e.clientY - dg.y, dist = Math.hypot(dx, dy);
  if (!dg.on) {
   if (dg.fora || dg.toque) { if (dist > FOLGA) { clearTimeout(dg.tm); dg = null; } return; }
   if (dist < 6) return; comeca();
  }
  e.preventDefault();
  if (!desk()) { dg.lx = e.clientX; dg.ly = e.clientY; return; } /* o laço de animação (laco) cuida do resto */
  dg.b.style.transform = `translate(${dx}px,${dy}px)`;
  dg.b.style.pointerEvents = 'none';
  const el = document.elementFromPoint(e.clientX, e.clientY), alvo = el && el.closest('#app .mf-ed-b');
  limpaAlvo(); dg.alvo = null;
  if (alvo && alvo !== dg.b) {
   const r = alvo.getBoundingClientRect(), lado = r.width < innerWidth * .45 ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2;
   dg.alvo = idDe(alvo); dg.depois = lado; alvo.classList.add(lado ? 'mf-ed-depois' : 'mf-ed-antes');
  }
  if (e.clientY < 90) scrollBy(0, -14); else if (e.clientY > innerHeight - 140) scrollBy(0, 14);
 }, { capture: true, passive: false });
 document.addEventListener('touchmove', e => { if (dg && dg.on) e.preventDefault(); }, { capture: true, passive: false });
 const solta = e => {
  if (!dg) return;
  const g = dg; clearTimeout(g.tm);
  if (!g.on) { dg = null; return; }
  if (!desk()) return pousa(g, e && e.type === 'pointercancel');
  dg = null;
  semClique = performance.now();
  g.b.style.transform = ''; g.b.style.pointerEvents = ''; g.b.classList.remove('mf-ed-drag');
  document.documentElement.classList.remove('mf-ed-arrasta'); limpaAlvo();
  if (g.alvo) poe(g.id, g.alvo, g.depois);
 };
 document.addEventListener('pointerup', solta, true);
 document.addEventListener('pointercancel', solta, true);

 /* ---- celular: levantar, seguir o dedo, abrir espaço e pousar ---- */
 /* elemento que serve de referência para position:fixed (transform, filtro ou contain num ancestral mudam a referência) */
 function referencia(el) {
  for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
   const s = getComputedStyle(p), wc = s.willChange || '', ct = s.contain || '';
   if (s.transform !== 'none' || s.filter !== 'none' || s.perspective !== 'none' || (s.backdropFilter && s.backdropFilter !== 'none') || (s.webkitBackdropFilter && s.webkitBackdropFilter !== 'none') || /transform|filter|perspective/.test(wc) || /paint|layout|strict|content/.test(ct)) return p;
  }
  return null;
 }
 function clona(u, r) {
  const c = u.cloneNode(true);
  c.querySelectorAll('.mf-ed-ctl').forEach(x => x.remove());
  [c, ...c.querySelectorAll('[id],[data-bk],.mf-stagger')].forEach(x => { x.removeAttribute('id'); x.removeAttribute('data-bk'); x.classList.remove('mf-stagger', 'mf-ed-sel', 'mf-ed-vaga', 'mf-ed-bs-alvo'); });
  c.classList.add('mf-ed-clone'); c.setAttribute('aria-hidden', 'true');
  Object.assign(c.style, { width: r.width + 'px', height: r.height + 'px', minHeight: '0', left: '0px', top: '0px', gridColumn: '', gridRowEnd: '', animation: 'none' });
  return c;
 }
 function levanta() {
  const g = dg; if (!g) return;
  clearTimeout(g.tm); g.on = true; g.fora = false;
  const u = unidade(g.b), r = u.getBoundingClientRect();
  g.u = u; g.ox = g.lx - r.left; g.oy = g.ly - r.top;
  g.ini = { pai: u.parentElement, prox: u.nextSibling, col: u.dataset.mzc || '' };
  const pai = u.parentElement;
  g.meia = pai.classList.contains('g2');
  g.preso = u !== g.b || (g.meia && !pai.classList.contains('mf-mz')); /* grade comum (ex.: indicadores do Dashboard): só muda de lugar dentro dela */
  if (u.getAnimations) u.getAnimations().forEach(x => x.finish());
  const app = document.getElementById('app'), c = clona(u, r);
  app.appendChild(c); g.c = c; g.ref = referencia(c);
  u.classList.add('mf-ed-vaga');
  document.documentElement.classList.add('mf-ed-arrasta');
  vibra(12);
  g.ult = { x: g.lx, y: g.ly }; g.trava = 0; g.rolou = false;
  posClone();
  if (!semAnim()) requestAnimationFrame(() => { if (g.c) g.c.classList.add('on'); });
  g.raf = requestAnimationFrame(laco);
 }
 function posClone() {
  const g = dg; if (!g || !g.c) return;
  let bx = 0, by = 0; if (g.ref) { const r = g.ref.getBoundingClientRect(); bx = r.left + g.ref.clientLeft; by = r.top + g.ref.clientTop; }
  g.c.style.left = (g.lx - g.ox - bx) + 'px'; g.c.style.top = (g.ly - g.oy - by) + 'px';
 }
 function laco() {
  const g = dg; if (!g || !g.on || !g.c) return;
  const y = g.ly, H = innerHeight; let v = 0;
  if (y < 90) v = -Math.min(18, 4 + (90 - y) / 5); else if (y > H - 140) v = Math.min(18, 4 + (y - (H - 140)) / 7);
  if (v) { const a = scrollY; scrollBy(0, v); if (scrollY !== a) g.rolou = true; }
  posClone();
  if (performance.now() >= g.trava && (g.rolou || Math.hypot(g.lx - g.ult.x, g.ly - g.ult.y) > 12)) { g.rolou = false; g.ult = { x: g.lx, y: g.ly }; procura(); }
  g.raf = requestAnimationFrame(laco);
 }
 /* o que conta como item na página ou dentro de um grupo (o próprio bloco arrastado e o fantasma ficam de fora) */
 function itensDe(par) {
  const g = dg;
  return [...par.children].filter(k => k !== g.u && k !== g.c && k.nodeType === 1 && (k.matches('[data-bk]') || (k.classList.contains('g2') && [...k.children].some(x => x !== g.u)) || (par.classList.contains('g2') && !!k.querySelector('[data-bk]'))));
 }
 const caixa = k => k.getBoundingClientRect();
 const meioY = k => { const r = caixa(k); return r.top + r.height / 2; };
 function colDe(k, rg) { if (k.dataset.mzc) return k.dataset.mzc; const r = caixa(k); return r.left + r.width / 2 < rg.left + rg.width / 2 ? 'a' : 'b'; }
 function noGrupo(G, x, y) {
  const rg = caixa(G), itens = itensDe(G);
  if (G.classList.contains('mf-mz')) {
   const col = x < rg.left + rg.width / 2 ? 'a' : 'b';
   const ref = itens.filter(k => colDe(k, rg) === col).sort((a, b) => caixa(a).top - caixa(b).top).find(k => meioY(k) > y) || null;
   return { par: G, ref, col, grupo: 1 };
  }
  const ref = itens.find(k => { const q = caixa(k); return y < q.top || (y <= q.bottom && x < q.left + q.width / 2); }) || null;
  return { par: G, ref, col: '', grupo: 1 };
 }
 function procura() {
  const g = dg, u = g.u, x = g.lx, y = g.ly;
  let alvo = null;
  if (g.preso) alvo = noGrupo(u.parentElement, x, y);
  else {
   const P = g.meia ? u.parentElement.parentElement : u.parentElement, uns = itensDe(P);
   if (g.meia) for (const k of uns) if (k.classList.contains('mf-mz')) { const r = caixa(k); if (y >= r.top - 8 && y <= r.bottom + 8) { alvo = noGrupo(k, x, y); break; } }
   if (!alvo) {
    const ref = uns.find(k => meioY(k) > y) || null, ant = ref ? uns[uns.indexOf(ref) - 1] : uns[uns.length - 1];
    if (!g.meia) alvo = { par: P, ref, col: '', depois: ref ? null : ant };
    else if (ref && ref.classList.contains('g2')) alvo = noGrupo(ref, x, -1e9);       /* logo acima de um grupo: entra no topo dele */
    else if (ant && ant.classList.contains('g2')) alvo = noGrupo(ant, x, 1e9);        /* logo abaixo de um grupo: entra no fim dele */
    else alvo = { novo: 1, par: P, ref, depois: ref ? null : ant, col: x < innerWidth / 2 ? 'a' : 'b' };
   }
  }
  if (!alvo || igual(alvo)) return;
  move(alvo);
 }
 function proxItem(el, par) { const its = itensDe(par); for (let n = el.nextElementSibling; n; n = n.nextElementSibling) if (its.includes(n)) return n; return null; }
 function igual(a) {
  const u = dg.u, col = u.dataset.mzc || '';
  if (a.novo) { const G = u.parentElement; return G.classList.contains('mf-mz-novo') && G.parentElement === a.par && proxItem(G, a.par) === a.ref && col === a.col; }
  if (u.parentElement !== a.par || col !== (a.col || '')) return false;
  if (a.grupo && a.col) { const rg = caixa(a.par), mesma = itensDe(a.par).filter(k => colDe(k, rg) === a.col).sort((p, q) => caixa(p).top - caixa(q).top), abaixo = mesma.find(k => caixa(k).top > caixa(u).top) || null; return abaixo === a.ref; }
  return proxItem(u, a.par) === a.ref;
 }
 function move(a) {
  const g = dg, u = g.u, antes = posicoes(), velho = u.parentElement;
  if (a.novo) {
   const ng = document.createElement('div'); ng.className = 'g2 mf-mz mf-mz-novo';
   if (a.ref) a.par.insertBefore(ng, a.ref); else if (a.depois) a.depois.after(ng); else a.par.appendChild(ng);
   ng.appendChild(u);
  } else if (a.ref) a.par.insertBefore(u, a.ref);
  else if (a.depois) a.depois.after(u);
  else if (a.grupo) a.par.appendChild(u);
  if (a.col) u.dataset.mzc = a.col; else delete u.dataset.mzc;
  if (!u.parentElement.classList.contains('g2')) { u.style.gridColumn = ''; u.style.gridRowEnd = ''; u.style.minHeight = ''; }
  if (velho !== u.parentElement && velho.classList.contains('mf-mz-novo') && !velho.children.length) velho.remove();
  vazios();
  if (window.mfEncaixe) mfEncaixe();
  anima(antes, null, u);
  g.trava = performance.now() + 140;
  vibra(6);
 }
 /* grupo que ficou sem blocos durante o arrasto some (sem deixar o espaço dele) */
 function vazios() { document.querySelectorAll('#app .g2').forEach(x => x.classList.toggle('mf-g2-vazio', !x.children.length)); }
 function cancelaArrasto() {
  const g = dg; if (!g) return;
  dg = null; clearTimeout(g.tm); cancelAnimationFrame(g.raf);
  if (g.c) g.c.remove();
  if (g.u) {
   g.u.classList.remove('mf-ed-vaga');
   try { if (g.ini.pai.isConnected) g.ini.pai.insertBefore(g.u, g.ini.prox && g.ini.prox.parentNode === g.ini.pai ? g.ini.prox : null); } catch (_) { }
   if (g.ini.col) g.u.dataset.mzc = g.ini.col; else delete g.u.dataset.mzc;
  }
  document.querySelectorAll('#app .mf-mz-novo').forEach(x => { if (!x.children.length) x.remove(); });
  vazios();
  document.documentElement.classList.remove('mf-ed-arrasta');
  if (window.mfEncaixe) mfEncaixe();
 }
 function pousa(g, cancelado) {
  dg = null; clearTimeout(g.tm); cancelAnimationFrame(g.raf);
  semClique = performance.now();
  if (cancelado) { dg = g; cancelaArrasto(); return; }
  const u = g.u, c = g.c;
  pousando = true;
  const fim = () => {
   pousando = false; if (c) c.remove(); u.classList.remove('mf-ed-vaga');
   document.documentElement.classList.remove('mf-ed-arrasta');
   grava(g);
  };
  if (!c || semAnim()) return fim();
  if (u.getAnimations) u.getAnimations().forEach(x => x.finish());
  const r = u.getBoundingClientRect();
  let bx = 0, by = 0; if (g.ref) { const q = g.ref.getBoundingClientRect(); bx = q.left + g.ref.clientLeft; by = q.top + g.ref.clientTop; }
  c.style.transition = `left .2s ${CURVA},top .2s ${CURVA},width .2s ${CURVA},height .2s ${CURVA},transform .2s ${CURVA},box-shadow .2s ${CURVA}`;
  c.classList.remove('on'); c.classList.add('pousa');
  Object.assign(c.style, { left: (r.left - bx) + 'px', top: (r.top - by) + 'px', width: r.width + 'px', height: r.height + 'px' });
  setTimeout(fim, 210);
 }
 /* grava no rascunho a ordem e as colunas que o usuário deixou na tela */
 function grava(g) {
  const u = g.u, id = g.id, G = u.parentElement;
  const mudou = !(G === g.ini.pai && u.nextSibling === g.ini.prox && (u.dataset.mzc || '') === g.ini.col);
  if (!ed) return;
  ed.sel = id;
  if (!mudou) { draw(); pilulaVisivel(id); return; }
  const vis = blocos().map(idDe), i = vis.indexOf(id), prox = vis[i + 1], ant = vis[i - 1], cols = {};
  if (G.classList.contains('mf-mz')) {
   [...G.children].forEach(k => { if (k.getAnimations) k.getAnimations().forEach(x => x.finish()); });
   const rg = caixa(G);
   [...G.children].forEach(k => { const b = k.matches('[data-bk]') ? k : k.querySelector('[data-bk]'), kid = b && idDe(b); if (kid) cols[kid] = colDe(k, rg); });
  }
  muda(l => {
   const a = ordem().filter(x => x !== id);
   let j = prox ? a.indexOf(prox) : -1; if (j < 0 && ant) { j = a.indexOf(ant); if (j >= 0) j++; } if (j < 0) j = a.length;
   a.splice(j, 0, id);
   l.o = Object.assign({}, l.o || {}); l.o[ed.t] = a;
   const C = Object.assign({}, l.cl || {}); delete C[id]; Object.assign(C, cols);
   if (Object.keys(C).length) l.cl = C; else delete l.cl;
  }, id);
  pilulaVisivel(id);
 }

 /* ---------- folha "Adicionar blocos" ---------- */
 /* 1.18: abas pelas telas do app (Lançamentos, Planejamento, Dashboard, Investimentos, Análises).
    Em cada aba: os blocos novos daquela área e os blocos do app que foram escondidos com "−" naquela tela
    (ex.: "Saldo disponível hoje" escondido no Dashboard volta em Dashboard). A busca procura em todas as abas.
    Os blocos escondidos de todas as telas são lidos uma vez por abertura da folha (mfCollectBlocks, js/96). */
 let ocuCache = null;
 function ocultos() {
  if (ocuCache) return ocuCache;
  const out = [], gone = window.MF_INV_GONE || [];
  try {
   const T = window.mfCollectBlocks ? mfCollectBlocks() : {};
   Object.keys(T).forEach(t => T[t].forEach(([id, nm]) => {
    if (ehWg(id) || !isHid(id) || gone.includes(mfBase(id)) || out.some(x => x.id === id)) return;
    out.push({ id, t, nm: nm || id.replace(/^[a-z]+_/, '').replace(/_/g, ' ') });
   }));
  } catch (e) { console.warn('Editar tela: blocos ocultos', e); }
  return (ocuCache = out);
 }
 function abreSheet() {
  fechaSheet(); busca = ''; sheetSel = null; ocuCache = null;
  sheetAba = (window.MF_WG_AREAS || []).some(([k]) => k === ed.t) ? ed.t : 'res';
  const s = document.createElement('div'); s.id = 'mf-ed-sheet';
  s.innerHTML = `<div class="eds-fundo" data-edfecha="1"></div><div class="eds" role="dialog" aria-modal="true" aria-label="Adicionar blocos"><i class="eds-al" aria-hidden="true"></i><div class="eds-top"><b>Adicionar blocos</b><button type="button" class="eds-x" data-edfecha="1" aria-label="Fechar">×</button></div><label class="eds-busca"><input type="search" placeholder="Buscar bloco" data-edbusca="1" autocomplete="off"></label><div class="eds-seg" role="tablist"></div><div class="eds-g"></div></div>`;
  document.body.appendChild(s);
  pintaSheet();
  requestAnimationFrame(() => s.classList.add('on'));
 }
 function fechaSheet() { const s = document.getElementById('mf-ed-sheet'); if (s) s.remove(); sheetSel = null; ocuCache = null; }
 function pintaSheet() {
  const s = document.getElementById('mf-ed-sheet'); if (!s || !ed) return;
  const W = window.MF_WG || {}, pode = window.mfWgAqui ? mfWgAqui(ed.t) : false, q = busca.toLowerCase(), ach = x => !q || x.toLowerCase().includes(q);
  const O = ocultos(), areas = (window.MF_WG_AREAS || []).filter(([k]) => Object.keys(W).some(w => W[w].a === k) || O.some(x => x.t === k));
  if (!areas.some(([k]) => k === sheetAba) && areas.length) sheetAba = areas[0][0];
  const seg = s.querySelector('.eds-seg'), busc = s.querySelector('.eds-busca');
  seg.hidden = !!sheetSel || !!q; busc.hidden = !!sheetSel;
  seg.innerHTML = areas.map(([k]) => `<button type="button" role="tab" aria-selected="${sheetAba === k}" class="${sheetAba === k ? 'on' : ''}" data-edseg="${k}">${escH(nomeTela(k))}</button>`).join('');
  const g = s.querySelector('.eds-g');
  if (sheetSel && W[sheetSel.k]) { g.innerHTML = detalhe(sheetSel); g.scrollTop = 0; return; }
  const naAba = a => q ? true : a === sheetAba;
  const ks = !pode ? [] : Object.keys(W).filter(k => naAba(W[k].a) && ach(W[k].n));
  const wid = ks.map(k => { const w = W[k], nm = w.m.length; return `<div class="edw"><button type="button" class="edw-pv" data-edpick="${k}" aria-label="Ver ${escH(w.n)} em tamanhos e modelos">${mfWgSecao(k, 'm', '', mfWgExemplo(k), 'edw-card')}</button><b class="edw-n">${escH(w.n)}</b><small class="edw-d">${escH(w.d)}</small><small class="edw-m">${nm > 1 ? nm + ' modelos · ' : ''}${(window.MF_WG_SZ || []).length} tamanhos</small><div class="edw-bs"><button type="button" class="edw-b2" data-edpick="${k}">Personalizar</button><button type="button" class="edw-b" data-edaddk="${k}">Adicionar</button></div></div>`; });
  const ocu = O.filter(x => naAba(x.t) && ach(x.nm)).map(x => `<div class="edw"><div class="edw-pv"><section class="edw-card edw-oc"><h2>${escH(x.nm)}</h2><small class="mf-wg-s">Oculto em ${escH(nomeTela(x.t))}</small></section></div><b class="edw-n">${escH(x.nm)}</b><small class="edw-d">Bloco do app que você escondeu.</small><button type="button" class="edw-b" data-edshow="${escH(x.id)}" data-edshowt="${escH(x.t)}">Mostrar</button></div>`);
  const sub = pode && window.mfWgSub ? mfWgSub(ed.t) : '', subNome = sub ? (([...((window.MF_SEGS || {})[ed.t] || []), ...(ed.t === 'inv' ? ((window.MF_SEGS || {}).invs || []) : [])].find(x => x[0] === sub) || [])[1] || (sub === 'ano' ? 'Ano' : sub)) : '';
  const aviso = !pode && !ocu.length ? '<p class="eds-nota">Esta tela não recebe blocos novos.</p>' : sub ? `<p class="eds-nota">Os blocos novos entram em ${escH(nomeTela(ed.t))} › ${escH(subNome)}.</p>` : '';
  const itens = wid.concat(ocu);
  g.innerHTML = aviso + (itens.length ? `<div class="eds-grade">${itens.join('')}</div>` : (q ? '<p class="eds-nota">Nada encontrado.</p>' : (pode ? '<p class="eds-nota">Nenhum bloco nesta aba.</p>' : '')));
 }
 function detalhe(o) {
  const w = MF_WG[o.k], v = mfWgModelo(o.k, o.v), sz = mfWgSz(o.k, o.sz, v);
  return `<div class="eds-det"><button type="button" class="eds-volta" data-edvolta="1">‹ Blocos</button>
   <div class="eds-pvg eds-pv-${sz}" aria-hidden="true">${mfWgSecao(o.k, sz, v, mfWgExemplo(o.k, v, sz), 'eds-real')}</div>
   <b class="edw-n">${escH(w.n)}</b><small class="edw-d">${escH(w.d)} Prévia com números de exemplo.</small>
   <div class="eds-op"><small>Tamanho</small><div class="eds-ch" role="group" aria-label="Tamanho">${MF_WG_SZ.filter(([k]) => k !== 'x' || mfWgMiniOk(o.k, v)).map(([k, t]) => `<button type="button" class="${sz === k ? 'on' : ''}" aria-pressed="${sz === k}" data-edsz="${k}">${t}</button>`).join('')}</div></div>
   ${w.m.length > 1 ? `<div class="eds-op"><small>Modelo</small><div class="eds-ch" role="group" aria-label="Modelo">${w.m.map(([k, t]) => `<button type="button" class="${v === k ? 'on' : ''}" aria-pressed="${v === k}" data-edmod="${k}">${escH(t)}</button>`).join('')}</div></div>` : ''}
   <button type="button" class="edw-b eds-add" data-edaddk="${o.k}">Adicionar à tela</button></div>`;
 }
 document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-edbusca]'); if (!i) return; busca = i.value.trim(); pintaSheet(); }, true);
 document.addEventListener('keydown', e => { if (e.key !== 'Escape' || !ed) return; const sh = document.getElementById('mf-ed-sheet'); if (!sh) return; if (sheetSel) { sheetSel = null; pintaSheet(); } else fechaSheet(); }, true);
})();
