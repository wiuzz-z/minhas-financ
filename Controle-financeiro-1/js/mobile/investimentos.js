/* 0.1 · Aba "Investimentos" no celular (era "Patrimônio"). SÓ CELULAR; computador não muda.
   Pedido: tirar o Resumo e trocar o nome para Investimentos. Como as subabas já não abrem página própria (2.9), a aba mostra direto
   as telas de investimentos numa barra só: Posição | Proventos | Análises | Radar | Metas (sem Voltar).
   Só muda o que aparece: os dados (S.inv, S.bens, metas) e as telas de cada subaba continuam os mesmos. O Resumo antigo (patrimônio
   líquido, bens) deixa de aparecer no celular; nada é apagado. */
(function () {
  'use strict';
  const desk = () => !!(window.mfIsDesk && mfIsDesk());
  const NOME = 'Investimentos';

  /* nome da aba (título do topo e barra de baixo); um nome trocado pela pessoa em Configurações continua valendo */
  try {
    const tt = MF_TTL.inv; Object.defineProperty(MF_TTL, 'inv', { configurable: true, enumerable: true, get: () => (desk() ? tt : NOME) });
    const tn = TN.inv[1]; Object.defineProperty(TN.inv, 1, { configurable: true, enumerable: true, get: () => (desk() ? tn : NOME) });
  } catch (e) { console.warn('Investimentos: nome', e); }

  /* subabas: as de dentro de Investimentos + Metas */
  const lista = () => [...mfSegList('invs'), ...mfSegList('inv').filter(x => x[0] === 'metas')];
  const primeira = () => (lista()[0] || ['pos'])[0];

  const _of = mfInvModeOf;
  mfInvModeOf = function (m) {
    const r = _of(m);
    if (desk()) return r;
    return r === 'resumo' || r === 'bens' || r === 'inv' ? primeira() : r;
  };
  const _pag = mfInvPag;
  mfInvPag = function () { return desk() ? _pag() : false; };
  /* 0.1 · modelo novo (aprovado no Figma): a barra de subabas sai do topo.
     Na tela inicial as outras subabas (Posição = Meus ativos, Proventos, Análises, Radar, Metas) viram botões logo abaixo do Patrimônio total (mfInvAtalhos);
     dentro de uma subaba, o topo mostra só "‹ Posição" para voltar. */
  const inicio = () => (lista().some(x => x[0] === 'pos') ? 'pos' : primeira());
  const naInicio = () => mfInvMode() === inicio();
  const _seg = mfInvSeg;
  /* 3.4: o "‹ Posição" no meio da tela saiu. Dentro de uma subaba o voltar é só um círculo com "<" no canto do topo (onde ficava a foto; ver abaixo). */
  mfInvSeg = function () { return desk() ? _seg() : ''; };

  const _tcI = mfTopCompact;
  mfTopCompact = function () {
    let h = _tcI();
    if (desk() || tab !== 'inv' || naInicio()) return h;
    const volta = `<button type="button" class="mf-voltar" data-invmode="${inicio()}" aria-label="Voltar para Posição"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>`;
    /* 3.7: o título é o da página aberta (Proventos, Análises, Radar, Metas), não mais "Investimentos" */
    const pg = (lista().find(x => x[0] === mfInvMode()) || [])[1];
    if (pg) h = h.replace(/<h1>[\s\S]*?<\/h1>/, '<h1>' + escH(pg) + '</h1>');
    return h.replace('class="header-bar mf-top mf-ttl2"', 'class="header-bar mf-top mf-ttl2 mf-pag"').replace(/(<div class="header-bar[^>]*>)/, '$1' + volta);
  };

  /* botões das subabas (todas menos a Posição). Saem da mesma lista da barra antiga: subaba nova ou renomeada aparece aqui sozinha. */
  const ICONES = {
    meus: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    prov: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.6 9.6c0-1 1.1-1.6 2.4-1.6s2.4.6 2.4 1.6-1 1.4-2.4 1.8-2.4.8-2.4 1.8 1.1 1.6 2.4 1.6 2.4-.6 2.4-1.6"/>',
    fund: '<path d="M5 20v-6M12 20V6M19 20v-10"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 12l6-6"/>',
    metas: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
  };
  const ICONE_PADRAO = '<rect x="4" y="4" width="16" height="16" rx="4"/>';
  window.mfInvAtalhos = function () {
    if (desk()) return '';
    const bs = lista().filter(x => x[0] !== inicio()), i = bs.findIndex(x => x[0] === 'meus');
    if (i > 0) bs.unshift(bs.splice(i, 1)[0]);                   // Posição (Meus ativos) vem primeiro, ao lado de Proventos
    if (!bs.length) return '';
    return `<div class="iv-at" data-n="${bs.length}" style="--n:${bs.length}">${bs.map(([k, nome]) => `<div class="iv-at-i"><button type="button" data-invmode="${k}" aria-label="${escH(nome)}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONES[k] || ICONE_PADRAO}</svg></button><span>${escH(nome)}</span></div>`).join('')}</div>`;
  };

  /* marca a tela inicial (html.iv-topo) antes de desenhar: o CSS deixa o topo transparente e pinta o brilho de fundo.
     A cor do brilho é a variável --iv-glow (r,g,b) no html: dá para trocar a cor ou animar depois sem mexer no layout. */
  window.__mfPre.push(function () {
    try {
      const on = !desk() && typeof tab !== 'undefined' && ((tab === 'inv' && naInicio()) || tab === 'res');   // 3.4: o Dashboard (Saldo atual) tem o mesmo fundo animado
      document.documentElement.classList.toggle('iv-topo', on);
    } catch (e) { console.warn('Investimentos: topo', e); }
  });
})();
