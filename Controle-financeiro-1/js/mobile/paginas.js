/* Páginas próprias (SÓ CELULAR). Computador não muda.
   Regra única: uma tela é "base" ou "página". Base fixa: Lançamentos › Início (botão "Lançamentos") e Contas › página inicial 'home' (e as telas principais). Tocar numa
   pílula (ou num botão do Cartão) ABRE uma página: a barra de pílulas sai, o topo ganha o Voltar no lugar da foto e o título da página
   ocupa o espaço. Dentro do Cartão há páginas em cima de páginas (window.__ctPg + pilha window.__ctPilha, em js/mobile/cartoes.js).
   Voltar (botão, gesto da borda esquerda ou botão voltar do aparelho) devolve a tela anterior exatamente como estava (rolagem e o que foi digitado).
   Aqui fica só o que muda no topo, o estado das páginas e a decisão "abrir ou voltar"; a animação da troca é do js/90-gesto-abas.js
   e a da pílula é do js/mobile/pilula.js. Páginas abertas pela Geral (Voltar → Central) seguem as mesmas regras. */
(function () {
  'use strict';
  const desk = () => !!(window.mfIsDesk && mfIsDesk());
  const VOLTAR = (att, rot) => `<button type="button" class="mf-voltar" ${att} aria-label="${rot}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>`;
  const BASE = () => ({ add: 'inicio', mais: mfCtBase() });   // subaba que é a tela-base fixa de cada aba
  const salvo = {};                                           // rolagem de cada tela, guardada ao abrir uma página por cima dela
  const tabAtual = () => { try { return tab; } catch (e) { return ''; } };

  /* ---- estado: onde estamos ---- */
  const modo = t => t === 'add' ? mfAddMode() : t === 'mais' ? mfCtMode() : '';
  const idTela = () => { const t = tabAtual(); return t + '|' + (t === 'mais' && window.__ctPg ? window.__ctPg : modo(t)); };
  /* página aberta numa aba com subabas: { título } ou null se estamos na base */
  function paginaAtual() {
    const t = tabAtual(), base = BASE()[t];
    if (!base) return null;
    if (t === 'mais' && window.__ctPg) return { t, titulo: (window.MF_CT_PGS && MF_CT_PGS[window.__ctPg]) || '' };
    const m = modo(t); if (m === base) return null;
    const it = mfSegList(t).find(x => x[0] === m);
    return { t, titulo: it ? it[1] : '' };
  }
  const naBase = () => !paginaAtual();
  window.mfPgNaBase = naBase;

  /* ---- topo: Voltar no lugar da foto, título da página, sem a barra de pílulas ---- */
  function comVoltar(h, voltar, titulo) {
    h = h.replace('class="header-bar mf-top mf-ttl2"', 'class="header-bar mf-top mf-ttl2 mf-pag"');
    if (/<button type="button" class="mf-voltar"[^>]*data-invback[\s\S]*?<\/button>/.test(h)) h = h.replace(/<button type="button" class="mf-voltar"[^>]*data-invback[\s\S]*?<\/button>/, voltar);
    else if (/<button type="button" class="mf-avatar"/.test(h)) h = h.replace(/<button type="button" class="mf-avatar"[\s\S]*?<\/button>/, voltar);
    else h = h.replace(/(<div class="header-bar[^>]*>)/, '$1' + voltar);       // sem foto no topo, o Voltar entra no canto onde ela ficava
    if (titulo) h = h.replace(/<h1>[\s\S]*?<\/h1>/, '<h1>' + (typeof escH === 'function' ? escH(titulo) : titulo) + '</h1>');
    return h;
  }
  /* Voltar = botão pequeno e redondo, só com "<" (o nome fica no aria-label) */
  const CHEV = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const redondo = h => h.replace(/(<button type="button" class="mf-voltar"[^>]*>)[\s\S]*?<\/button>/g, '$1' + CHEV + '</button>');
  const noGeral = () => { const f = window.__glFrom; return f && f.tab === tabAtual() ? f : null; };
  /* 3.24 · Contas (teste): pílulas FIXAS no topo (Cartão, Situação, Compromissos, Dívidas), nenhuma marcada na página inicial 'home'
     (resumos de tudo logo abaixo); dentro de uma página a barra continua e só a da página fica marcada. Lançamentos segue como antes. */
  const _sl = mfSegList;
  mfSegList = function (t) {                                // Contas no celular: Situação logo depois do Cartão
    const r = _sl.apply(this, arguments);
    if (!desk() && t === 'mais') { const i = r.findIndex(x => x[0] === 'sit'), c = r.findIndex(x => x[0] === 'contas'); if (i > 0 && c >= 0) r.splice(c + 1, 0, r.splice(i, 1)[0]); }
    return r;
  };
  const _tc = mfTopCompact;
  mfTopCompact = function () {
    const h = _tc(); if (desk()) return h;
    const g = noGeral(), p = paginaAtual();
    if (g) return redondo(comVoltar(h, VOLTAR('data-pgback="gl"', 'Voltar para Central'), g.t || ''));
    if (p) { const r = redondo(comVoltar(h, VOLTAR('data-pgback="sub"', 'Voltar'), p.titulo)); return p.t === 'mais' ? r : r.replace(/<div class="mf-anseg">[\s\S]*$/, ''); }   // Contas mantém a barra de pílulas; Lançamentos tira (como antes)
    return redondo(h);
  };

  /* quem abre pela Geral manda { gl: { t: título } } no mfGoTo; qualquer outro mfGoTo desfaz a marca */
  const _go = mfGoTo;
  mfGoTo = function (g) { window.__glFrom = g && g.gl ? Object.assign({ tab: g.tab }, g.gl) : null; return _go.apply(this, arguments); };

  /* ---- abrir ou voltar? (o js/90 usa isto para escolher a animação: página nova entra pela direita, voltar sai pela direita) ---- */
  window.mfPgTipo = function (b) {
    if (!b || !b.matches) return null;
    if (b.matches('.mf-voltar')) return 'voltar';
    if (b.matches('.cx-stack') && window.__ccMoveu) return null;                     // o clique que sobra de um arrasto de cartão não abre nada
    if (b.matches('[data-ctpg], #app .gl-wrap [data-gl], #app .iv-at button')) return 'abrir';
    if (b.matches('#app [data-addmode], #app [data-ctmode]')) {
      const alvo = b.dataset.addmode || b.dataset.ctmode;
      return naBase() && alvo !== BASE()[tabAtual()] ? 'abrir' : null;               // a pílula da base já está ativa: nada a fazer
    }
    return null;
  };

  /* 3.24 · sem animação de deslizar em Contas: pílulas (e botões que levam a elas) trocam a página na hora, e o "<" de uma página dessas também.
     O js/90 pergunta isto antes de animar; a única animação é a do toque no botão (js/90 · trocarSeco). */
  window.mfPgSemAnim = function (b) {
    if (desk() || !b || !b.matches || tabAtual() !== 'mais') return false;
    if (b.matches('#app [data-ctmode]')) return true;
    return b.matches('#app [data-pgback="sub"]') && !window.__ctPg;
  };

  /* ---- guardar a rolagem (e o digitado) ao abrir; devolver ao voltar ---- */
  let devolver = false;
  window.addEventListener('click', e => {                  // na window: roda ANTES dos ouvintes do app (que já trocariam a tela)
    if (desk() || !e.target.closest) return;
    const nb = e.target.closest('nav#nv [data-tab]');
    if (nb) {                                                // outra aba: some a marca e as páginas do Cartão; Lançamentos e Contas abrem sempre na tela inicial
      window.__glFrom = null; window.__ctPg = null; window.__ctPilha = null;
      if (nb.dataset.tab === 'mais') window.__ctMode = mfCtBase();
      return;
    }
    const b = e.target.closest('#app [data-addmode], #app [data-ctmode], #app [data-ctpg], #app [data-pgback="sub"]'); if (!b) return;
    const tipo = window.mfPgTipo(b), t = tabAtual();
    if (tipo === 'abrir') {
      salvo[idTela()] = scrollY;
      if (t === 'add' && typeof F !== 'undefined') {                    // o que já foi digitado no Novo lançamento volta junto com a base
        const g = id => document.getElementById(id);
        if (g('fv')) F.v = g('fv').value; if (g('fd')) F.dt = g('fd').value; if (g('fn')) F.n = g('fn').value;
      }
    }
    if (b.dataset.ctmode) { window.__ctPg = null; window.__ctPilha = []; }  // pílula de Contas: abre a página do Cartão/Compromissos/Dívidas/Situação do zero (também de dentro de uma página do Cartão)
    if (tipo === 'voltar') devolver = true;
  }, true);
  /* depois de desenhar a tela de baixo de novo, a rolagem volta para onde estava (o app manda a página ao topo logo depois do desenho; por isso adia) */
  (window.__mfAD = window.__mfAD || []).push(function () {
    if (!devolver) return;
    devolver = false;
    const y = salvo[idTela()];
    if (y > 0) queueMicrotask(() => { try { scrollTo(0, y); } catch (e) { } });
  });

  /* 3.19 · página com um bloco só: o título do bloco repete o do topo (o CSS o esconde, css/100-pagina-interna.css); aqui o bloco é marcado
     e desdobrado, para o conteúdo continuar à mostra mesmo que o bloco tenha sido recolhido antes */
  (window.__mfAD = window.__mfAD || []).push(function () {
    if (desk()) return;
    const a = document.getElementById('app');
    if (!a || !a.querySelector(':scope > .header-bar.mf-pag')) return;
    const bl = [...a.querySelectorAll(':scope > [data-bk], :scope > .planning-page > [data-bk]')];   // Contas põe os blocos dentro de .planning-page
    if (bl.length === 1) { bl[0].classList.add('mf-pg-uno'); bl[0].classList.remove('mf-folded'); }
  });

  /* ---- Voltar ---- */
  window.mfPgVoltar = function () {
    const t = tabAtual();
    if (t === 'mais' && window.__ctPg) { const p = window.__ctPilha || []; window.__ctPg = p.length ? p.pop() : null; }   // página dentro do Cartão: volta uma
    else if (t === 'add') mfAddInicio();
    else if (t === 'mais') window.__ctMode = mfCtBase();
    window.__mfLastTab = null; draw(); try { scrollTo(0, 0); } catch (e) { }
  };
  document.addEventListener('click', e => {
    const b = e.target && e.target.closest && e.target.closest('#app [data-pgback]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.dataset.pgback === 'gl') { window.__glFrom = null; tab = 'geral'; window.__mfLastTab = null; draw(); try { scrollTo(0, 0); } catch (err) { } }
    else window.mfPgVoltar();
  }, true);

  /* botão/gesto de voltar do aparelho: se há uma página aberta, fecha ela (a tela de baixo volta como estava) */
  window.mfPageBack = function () {
    if (desk()) return false;
    const v = document.querySelector('#app .header-bar .mf-voltar');
    if (!v || !v.offsetParent) return false;
    v.click(); return true;
  };
})();
