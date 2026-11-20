/* 3.11 · Central (antes "Geral"; id interno `geral`) — SÓ CELULAR. Ocupa o lugar da aba "Análises" na barra de baixo.
   Raiz: perfil/configurações no topo, "Atalhos rápidos" (carrossel horizontal de 6 cartões quadrados) e "Todas as áreas" (lista de 8 categorias:
   ícone, nome, descrição, número e seta). Tocar numa área abre a página dela (Voltar no lugar da foto; estado em
   window.__glArea) com a lista das funcionalidades. 3.12: as funcionalidades que o app já tem abrem o módulo/bloco/seção certo (legenda "onde abre" em cada linha); as que ainda
   não existem aparecem como "Em breve". Para ligar mais uma, troque o texto por I(...)/INV(...)/ANAL(...) na tabela AREAS. Nada aqui lê, calcula ou grava dado financeiro.
   3.13: Editar tela da Central (S.lay.glCfg: ordem das áreas e das seções, áreas ocultas, atalhos favoritos; rascunho com Pronto/Cancelar).
   3.10: só os NOMES mudaram (Geral → Central, Planejamento → Contas); a ordem da barra é a original: Lançamentos, Contas, Dashboard, Investimentos, Central.
   Os recentes ficam em S.lay.glRec (por usuário, sincronizado), nunca no aparelho. */
(function () {
  'use strict';
  const KEY = 'fin1_geral_rec', MAXREC = 8;
  const ESC = s => (typeof escH === 'function' ? escH(s) : String(s));
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

  /* ícones de linha; as classes gl-a* são os movimentos suaves (css/93-geral.css) */
  const ICO = {
    pat: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle class="gl-a-dial" cx="12" cy="12" r="3.4"/><path d="M12 8.6V12l1.8 1"/><path d="M6.5 19.5v1.5M17.5 19.5v1.5"/>'),
    hist: svg('<circle cx="12" cy="12" r="8.5"/><path class="gl-a-hand" d="M12 12V7"/><path class="gl-a-hand2" d="M12 12l3.2 1.8"/>'),
    plp: svg('<circle cx="12" cy="12" r="8.5"/><path class="gl-a-needle" d="M15.6 8.4l-2 5.2-5.2 2 2-5.2z"/>'),
    org: svg('<path class="gl-a-bob" d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>'),
    fer: svg('<rect x="5" y="2.8" width="14" height="18.4" rx="3"/><path d="M8.2 7.2h7.6"/><circle class="gl-a-k1" cx="9" cy="12" r=".9"/><circle class="gl-a-k2" cx="12" cy="12" r=".9"/><circle class="gl-a-k3" cx="15" cy="12" r=".9"/><circle class="gl-a-k2" cx="9" cy="16" r=".9"/><circle class="gl-a-k3" cx="12" cy="16" r=".9"/><circle class="gl-a-k1" cx="15" cy="16" r=".9"/>'),
    ana: svg('<path d="M4 20h16"/><rect class="gl-a-b1" x="6" y="11" width="3" height="9" rx="1"/><rect class="gl-a-b2" x="10.5" y="6" width="3" height="14" rx="1"/><rect class="gl-a-b3" x="15" y="9" width="3" height="11" rx="1"/>'),
    met: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle class="gl-a-dot" cx="12" cy="12" r="1.4" fill="currentColor"/>'),
    int: svg('<path class="gl-a-bob" d="M12 3.5l1.9 4.9 4.9 1.9-4.9 1.9L12 17.1l-1.9-4.9-4.9-1.9 4.9-1.9z"/><circle class="gl-a-k1" cx="18.2" cy="17.8" r="1.1"/><circle class="gl-a-k2" cx="5.8" cy="18.4" r=".9"/>'),
    sau: svg('<path class="gl-a-beat" d="M12 19.8S4.6 15.4 4.6 9.9a3.9 3.9 0 0 1 7.4-1.7 3.9 3.9 0 0 1 7.4 1.7c0 5.5-7.4 9.9-7.4 9.9z"/><path d="M7.2 12.2h2.6l1.4-2.4 1.8 3.8 1.2-1.4h2.6"/>')
  };
  const CHEV = svg('<path d="M9 6l6 6-6 6"/>');
  const VOLTAR_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';

  /* As 8 áreas (ordem pedida). `it` = funcionalidades. Texto simples = ainda sem módulo ("Em breve").
     Objeto = abre algo que já existe no app: { t, w (onde abre, legenda), go (mfGoTo: tab + inv/ct/lc + blk = bloco a destacar),
     an ('mes'|'ano') e sec (seção das Análises), ou cfg (página de Configurações) }. Nada aqui calcula ou grava dado financeiro. */
  const I = (t, w, go, x) => Object.assign({ t, w, go }, x || {});
  const INV = (t, w, modo, blk) => I(t, 'Investimentos › ' + w, { tab: 'inv', inv: modo, blk });
  const ANAL = (t, w, an, sec, blk) => I(t, 'Análises › ' + w, { tab: 'anal', blk }, { an, sec });
  const AREAS = [
    { id: 'pat', n: '01', t: 'Patrimônio', d: 'Quanto você possui, em um só lugar', o: 'Apresenta a situação patrimonial completa.', ic: 'pat',
      it: [INV('Resumo patrimonial', 'Resumo', 'resumo'), INV('Patrimônio total', 'Resumo', 'resumo', 'dv_kpi'), 'Patrimônio líquido', INV('Distribuição dos ativos', 'Resumo', 'resumo', 'i_chart'), 'Evolução patrimonial', 'Histórico do patrimônio'] },
    { id: 'hist', n: '02', t: 'Histórico de investimentos', d: 'Onde você investiu e como evoluiu', o: 'Centraliza o histórico e o acompanhamento dos investimentos.', ic: 'hist',
      it: [INV('Posição de investimentos', 'Posição', 'meus'), ANAL('Histórico de aportes', 'Ano › Evolução dos investimentos', 'ano', 'inv'), INV('Proventos e dividendos', 'Proventos', 'prov'), 'Histórico de rentabilidade', INV('Análise de ativos', 'Análises', 'fund'), INV('Radar de oportunidades', 'Radar', 'radar'), 'Histórico de compras e vendas'] },
    { id: 'plp', n: '03', t: 'Planejamento patrimonial', d: 'Onde você quer chegar', o: 'Planeja a construção e a evolução do patrimônio.', ic: 'plp',
      it: [INV('Número mágico', 'Metas', 'metas', 's_magico'), 'Independência financeira', INV('Reserva de emergência', 'Metas', 'metas', 'i_reserva'), 'Reserva de oportunidade', 'Projeção de patrimônio', 'Metas de renda passiva', INV('Simulação de acumulação patrimonial', 'Metas › Simulador de metas', 'metas', 'p_metas')] },
    { id: 'int', n: '04', t: 'Análise inteligente', d: 'O que acontece e o que pode melhorar', o: 'Interpreta os seus dados reais e aponta diagnósticos e recomendações.', ic: 'int',
      it: [ANAL('Diagnóstico financeiro', 'Mês › Diagnóstico do mês', 'mes', 'diag'), I('Identificação de gastos excessivos', 'Contas › Tetos por categoria', { tab: 'mais', ct: 'contas', blk: 'p_teto' }), ANAL('Análise de receitas e despesas', 'Mês › Resultado do mês', 'mes', 'res'), 'Padrões de consumo',
        ANAL('Comparação entre meses', 'Mês › Mês atual x mês anterior', 'mes', 'res', 'n_mcmp'), I('Previsão de saldo', 'Dashboard › Fluxo de caixa', { tab: 'res', blk: 'cashflow' }), 'Oportunidades de economia', I('Alertas financeiros inteligentes', 'Dashboard › Avisos', { tab: 'res', blk: 'd_alert' }), 'Recomendações personalizadas', 'Resumo financeiro automático'] },
    { id: 'fer', n: '05', t: 'Ferramentas e calculadoras', d: 'Cálculos e simulações', o: 'Oferece ferramentas de cálculo e simulação.', ic: 'fer',
      it: [INV('Calculadora Graham', 'Análises › Simular Graham e Bazin', 'fund', 'i_fdsim'), INV('Calculadora Bazin', 'Análises › Simular Graham e Bazin', 'fund', 'i_fdsim'), 'Juros compostos', INV('Simulador de aportes', 'Resumo › Simulador de aporte', 'resumo', 'dv_sim'), 'Simulador de dividendos', 'Simulador de financiamento', 'Comparador de investimentos', 'Calculadora de rentabilidade', 'Simulador de independência financeira'] },
    { id: 'ana', n: '06', t: 'Análises e relatórios', d: 'Como foram os seus resultados', o: 'Apresenta relatórios organizados sobre o desempenho financeiro.', ic: 'ana',
      it: [Object.assign(ANAL('Análise mensal', 'Mês', 'mes'), { id: 'anm' }), Object.assign(ANAL('Análise anual', 'Ano', 'ano'), { id: 'ana1' }),
        ANAL('Receitas versus despesas', 'Ano › Receitas x despesas', 'ano', 'res', 'n_aflux'), ANAL('Evolução dos gastos', 'Ano › Evolução dos gastos', 'ano', 'gastos'), 'Relatório patrimonial', I('Relatório de investimentos', 'Relatórios em PDF', null, { cfg: 'relatorios' }), ANAL('Histórico de resultados', 'Ano › Retrospecto anual', 'ano', 'retro'), I('Exportação de relatórios', 'Relatórios em PDF', null, { cfg: 'relatorios' })] },
    { id: 'met', n: '07', t: 'Planejamento e metas', d: 'Seus objetivos e o progresso', o: 'Organiza os objetivos financeiros e acompanha o progresso.', ic: 'met',
      it: [INV('Metas financeiras', 'Metas › Simulador de metas', 'metas', 'p_metas'), 'Metas de economia', 'Objetivos de compra', 'Planejamento de viagens', INV('Cronograma de objetivos', 'Metas › Simulador de metas', 'metas', 'p_metas'), INV('Acompanhamento de progresso', 'Metas › Simulador de metas', 'metas', 'p_metas'), INV('Valor acumulado', 'Metas › Simulador de metas', 'metas', 'p_metas'), INV('Prazo para conclusão', 'Metas › Simulador de metas', 'metas', 'p_metas')] },
    { id: 'sau', n: '08', t: 'Saúde financeira', d: 'Sua condição financeira hoje', o: 'Avalia a situação financeira por meio de indicadores.', ic: 'sau',
      it: ['Pontuação de saúde financeira', ANAL('Equilíbrio entre receitas e despesas', 'Ano › Saúde financeira', 'ano', 'saude'), ANAL('Capacidade de poupança', 'Ano › Saúde financeira', 'ano', 'saude'), 'Nível de endividamento', ANAL('Comprometimento da renda', 'Ano › Saúde financeira', 'ano', 'saude'), ANAL('Nível de reserva financeira', 'Ano › Saúde financeira', 'ano', 'saude'), 'Capacidade de pagamento', 'Evolução da saúde financeira', 'Indicadores de estabilidade financeira'] }
  ];
  /* cada funcionalidade vira objeto com id (a1, a2…); as que já tinham id fixo (anm, ana1) mantêm */
  AREAS.forEach(a => { a.it = a.it.map((x, i) => Object.assign({ id: a.id + '~' + i }, typeof x === 'string' ? { t: x } : x)); });
  const ATALHOS = ['pat', 'hist', 'met', 'fer', 'sau', 'int'];  /* os 6 atalhos rápidos abrem a área correspondente */
  const area = id => AREAS.find(a => a.id === id);
  const ITENS = AREAS.flatMap(a => a.it);
  const abre = o => !!(o.go || o.cfg);
  const item = id => ITENS.find(x => x.id === id);
  const atual = () => area(window.__glArea);

  /* recentes: só ids de áreas/itens, no S.lay (por usuário). A chave antiga do aparelho era vista por qualquer conta no mesmo celular: é apagada. */
  try { localStorage.removeItem(KEY); } catch (e) { }
  const valido = id => !!(area(id) || item(id));
  function lerRec() { try { const a = (S.lay || {}).glRec; return Array.isArray(a) ? a.filter(valido) : []; } catch (e) { return []; } }
  function gravaRec(id) { try { const L = S.lay = S.lay || {}; L.glRec = [id, ...lerRec().filter(x => x !== id)].slice(0, MAXREC); if (typeof save === 'function') save(); } catch (e) { } }

  /* ---- Editar tela da Central (3.13) ----
     Só a apresentação, por usuário: S.lay.glCfg = { sec: ['at','ar'] (ordem das duas seções), ar: [ids] (ordem das áreas), hid: [ids] (áreas ocultas),
     at: [ids] (atalhos rápidos, até 6) }. Sem glCfg vale o padrão. Rascunho (window.__glEd): Pronto grava, Cancelar descarta. Não toca em dados financeiros
     nem no editor de blocos do app (js/83); o botão "Editar tela" do js/83 fica escondido na Central (css/93) e o daqui toma o lugar. */
  const MAXAT = 6;
  const padrao = () => ({ sec: ['at', 'ar'], ar: AREAS.map(a => a.id), hid: [], at: ATALHOS.slice() });
  const copia = o => JSON.parse(JSON.stringify(o));
  const mesmo = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  function norm(c) {   /* aceita qualquer coisa salva (ids que não existem mais, lista vazia…) e devolve uma configuração válida */
    const p = padrao(); if (!c || typeof c !== 'object') return p;
    const ids = v => Array.isArray(v) ? [...new Set(v.filter(id => !!area(id)))] : [];
    const ar0 = ids(c.ar), ar = [...ar0, ...p.ar.filter(id => !ar0.includes(id))];
    let hid = ids(c.hid); if (hid.length >= ar.length) hid = [];   /* nunca esconde todas */
    const at = Array.isArray(c.at) ? ids(c.at).slice(0, MAXAT) : p.at;
    const sec = Array.isArray(c.sec) && c.sec.length === 2 && c.sec.includes('at') && c.sec.includes('ar') ? c.sec.slice() : p.sec;
    return { sec, ar, hid, at };
  }
  const salva = () => norm((S.lay || {}).glCfg);
  const ed = () => window.__glEd || null;
  const vista = () => (ed() ? ed().d : salva());

  const tile = (a, i) => `<button type="button" class="gl-at" data-ar="${a.id}" data-gl="${a.id}" style="--i:${i}"><span class="gl-ic">${ICO[a.ic]}</span><b>${ESC(a.t)}</b></button>`;
  const tileEd = (a, i) => `<div class="gl-at gl-at-ed" data-ar="${a.id}" style="--i:${i}"><button type="button" class="gl-x gl-x-at" data-gled="at-:${a.id}" aria-label="Remover atalho ${ESC(a.t)}">−</button><span class="gl-ic">${ICO[a.ic]}</span><b>${ESC(a.t)}</b></div>`;
  const card = (a, i) => `<button type="button" class="gl-ar" data-ar="${a.id}" data-gl="${a.id}" style="--i:${i}"><span class="gl-ic">${ICO[a.ic]}</span><span class="gl-ar-tx"><b>${ESC(a.t)}</b><small>${ESC(a.d)}</small></span><em class="gl-ar-n">${a.n}</em><i class="gl-chev">${CHEV}</i></button>`;
  const cardEd = (a, i, vis) => {
    const k = vis.indexOf(a.id);
    return `<div class="gl-ar gl-ar-ed" data-ar="${a.id}" style="--i:${i}"><span class="gl-ic">${ICO[a.ic]}</span><span class="gl-ar-tx"><b>${ESC(a.t)}</b><small>${ESC(a.d)}</small></span><span class="gl-ctl"><button type="button" data-gled="mv:${a.id}:-1" aria-label="Mover ${ESC(a.t)} para cima"${k === 0 ? ' disabled' : ''}>↑</button><button type="button" data-gled="mv:${a.id}:1" aria-label="Mover ${ESC(a.t)} para baixo"${k === vis.length - 1 ? ' disabled' : ''}>↓</button><button type="button" class="gl-x" data-gled="hide:${a.id}" aria-label="Ocultar ${ESC(a.t)}">−</button></span></div>`;
  };
  const mvSec = (k, v) => { const i = v.sec.indexOf(k); return `<span class="gl-mv"><button type="button" data-gled="sec:${k}:-1" aria-label="Subir seção"${i === 0 ? ' disabled' : ''}>↑</button><button type="button" data-gled="sec:${k}:1" aria-label="Descer seção"${i === 1 ? ' disabled' : ''}>↓</button></span>`; };

  function secAt(v, E) {
    if (!E && !v.at.length) return '';
    const corpo = E ? v.at.map((id, i) => tileEd(area(id), i)).join('') + (v.at.length < MAXAT ? `<button type="button" class="gl-at gl-at-add" data-gled="addat"><span class="gl-ic">+</span><b>Adicionar atalho</b></button>` : '')
      : v.at.map((id, i) => tile(area(id), i)).join('');
    const livres = AREAS.filter(a => !v.at.includes(a.id));
    const pick = E && E.pick ? `<div class="gl-pick">${livres.map(a => `<button type="button" class="gl-pick-b" data-ar="${a.id}" data-gled="at+:${a.id}"><span class="gl-ic">${ICO[a.ic]}</span><b>${ESC(a.t)}</b></button>`).join('') || '<small>Todas as áreas já estão nos atalhos.</small>'}</div>` : '';
    return `<section class="gl-sec"><div class="gl-h"><b>Atalhos rápidos</b>${E ? mvSec('at', v) : ''}</div><div class="gl-ats">${corpo}</div>${pick}</section>`;
  }
  function secAr(v, E) {
    const vis = v.ar.filter(id => !v.hid.includes(id));
    const corpo = vis.map((id, i) => (E ? cardEd(area(id), i, vis) : card(area(id), i))).join('');
    return `<section class="gl-sec"><div class="gl-h"><b>Todas as áreas</b>${E ? mvSec('ar', v) : `<small>${vis.length} ${vis.length === 1 ? 'área' : 'áreas'}</small>`}</div><div class="gl-ars">${corpo}</div></section>`;
  }
  function ocultas(v) {
    if (!v.hid.length) return '';
    return `<section class="gl-sec"><div class="gl-h"><b>Áreas ocultas</b><small>${v.hid.length}</small></div><div class="gl-oc">${v.hid.map(id => { const a = area(id); return `<button type="button" class="gl-oc-b" data-ar="${a.id}" data-gled="show:${a.id}"><span class="gl-ic">${ICO[a.ic]}</span><b>${ESC(a.t)}</b><em>+ Mostrar</em></button>`; }).join('')}</div></section>`;
  }
  const barra = () => `<div class="gl-edbar" role="toolbar" aria-label="Editar tela"><b>Editar tela</b><span><button type="button" data-gled="reset">Restaurar padrão</button><button type="button" data-gled="cancel">Cancelar</button><button type="button" class="pri" data-gled="done">Pronto</button></span></div><p class="gl-hint">Use ↑ ↓ nas linhas para mudar a ordem das áreas, − para ocultar e ↑ ↓ nos títulos para trocar as seções. Só a apresentação da Central muda.</p>`;

  function raiz() {
    const E = ed(), v = vista(), mapa = { at: () => secAt(v, E), ar: () => secAr(v, E) };
    return `<div class="gl-wrap${E ? ' gl-editando' : ''}" data-nosw>
${mfTopPerfil().replace('class="header-bar mf-top"', 'class="header-bar mf-top gl-perfil"').replace(mfEyeHtml(), '')}
${E ? barra() : ''}${v.sec.map(k => mapa[k]()).join('')}${E ? ocultas(v) : '<div class="gl-ed-entry"><button type="button" data-gled="open">Editar tela</button></div>'}
</div>`;
  }
  function pagina(a) {
    const fn = a.it.map((o, i) => abre(o)
      ? `<button type="button" class="gl-fn" data-gl="${o.id}" style="--i:${i}"><span class="gl-dot"></span><span class="gl-fn-tx"><b>${ESC(o.t)}</b><small>${ESC(o.w || '')}</small></span><i class="gl-chev">${CHEV}</i></button>`
      : `<button type="button" class="gl-fn gl-fn-soon" data-glsoon="${ESC(o.t)}" style="--i:${i}"><span class="gl-dot"></span><span class="gl-fn-tx"><b>${ESC(o.t)}</b></span><em class="gl-soon">Em breve</em></button>`).join('');
    return `<div class="gl-wrap" data-nosw data-ar="${a.id}">
<section class="gl-hero"><span class="gl-ic gl-ic-big">${ICO[a.ic]}</span><div class="gl-hero-tx"><small>Área ${a.n}</small><b>${ESC(a.t)}</b><p>${ESC(a.o)}</p></div></section>
<section class="gl-sec"><div class="gl-h"><b>Funcionalidades</b><small>${a.it.filter(abre).length} de ${a.it.length} já abrem</small></div><div class="gl-fns">${fn}</div></section>
</div>`;
  }
  window.mfGeralHtml = function () { const a = atual(); return a ? pagina(a) : raiz(); };

  function abrir(id) {
    const a = area(id);
    if (a) { gravaRec(id); window.__glArea = id; if (typeof draw === 'function') draw(); try { scrollTo(0, 0); } catch (e) { } return; }
    const s = item(id); if (!s || !abre(s)) return;
    gravaRec(id);
    if (s.cfg) { if (typeof mfCfgOpen === 'function') mfCfgOpen(s.cfg); return; } /* página de Configurações por cima da área; ao fechar volta para ela */
    if (s.an) { window.__anMode = s.an; if (s.sec) { if (s.an === 'ano') window.__anSecA = s.sec; else window.__anSecM = s.sec; } }
    if (typeof mfGoTo === 'function') mfGoTo(Object.assign({}, s.go, { gl: { t: '' } })); /* gl: a página aberta mostra Voltar (js/mobile/paginas.js) e volta para a Central */
    try { scrollTo(0, 0); } catch (e) { }
  }
  /* comandos do Editar tela (data-gled="comando:arg:arg") */
  function editar(cmd) {
    const [k, x, y] = cmd.split(':'); let E = ed();
    if (k === 'open') { window.__glEd = { d: copia(salva()), pick: false }; }
    else if (!E) return;
    else if (k === 'cancel') { window.__glEd = null; if (typeof mfToast === 'function') mfToast('Alterações descartadas'); }
    else if (k === 'done') {
      const L = S.lay = S.lay || {}; if (mesmo(E.d, padrao())) delete L.glCfg; else L.glCfg = copia(E.d);
      window.__glEd = null; if (typeof save === 'function') save(); if (typeof mfToast === 'function') mfToast('Central salva ✓');
    }
    else if (k === 'reset') { E.d = padrao(); E.pick = false; }
    else if (k === 'sec') { const a = E.d.sec, i = a.indexOf(x), j = i + (+y); if (j >= 0 && j < a.length) { [a[i], a[j]] = [a[j], a[i]]; } }
    else if (k === 'mv') {
      const vis = E.d.ar.filter(id => !E.d.hid.includes(id)), i = vis.indexOf(x), j = i + (+y);
      if (i >= 0 && j >= 0 && j < vis.length) { const p = E.d.ar.indexOf(vis[i]), q = E.d.ar.indexOf(vis[j]); [E.d.ar[p], E.d.ar[q]] = [E.d.ar[q], E.d.ar[p]]; }
    }
    else if (k === 'hide') {
      if (E.d.ar.length - E.d.hid.length <= 1) { if (typeof mfToast === 'function') mfToast('Mantenha ao menos uma área visível'); return; }
      if (!E.d.hid.includes(x)) E.d.hid.push(x);
    }
    else if (k === 'show') { E.d.hid = E.d.hid.filter(id => id !== x); }
    else if (k === 'at-') { E.d.at = E.d.at.filter(id => id !== x); }
    else if (k === 'addat') { E.pick = !E.pick; }
    else if (k === 'at+') { if (!E.d.at.includes(x) && E.d.at.length < MAXAT) E.d.at.push(x); E.pick = false; }
    if (typeof draw === 'function') draw(); if (k === 'open' || k === 'done' || k === 'cancel') { try { scrollTo(0, 0); } catch (e) { } }
  }
  document.addEventListener('click', e => {
    const g = e.target && e.target.closest && e.target.closest('#app [data-gled]');
    if (g) { e.preventDefault(); e.stopPropagation(); editar(g.dataset.gled); return; }
    const v = e.target && e.target.closest && e.target.closest('#app [data-glvoltar]');
    if (v) { e.preventDefault(); e.stopPropagation(); window.__glArea = null; if (typeof draw === 'function') draw(); try { scrollTo(0, 0); } catch (err) { } return; }
    const t = e.target && e.target.closest && e.target.closest('#app .gl-wrap [data-gl],#app .gl-wrap [data-glsoon]'); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    if (t.dataset.glsoon !== undefined) { if (typeof mfToast === 'function') mfToast(t.dataset.glsoon + ': em breve'); return; }
    abrir(t.dataset.gl);
  }, true);
  /* tocar num botão da barra de baixo (inclusive na própria Central) volta para a raiz e descarta uma edição não concluída */
  window.addEventListener('click', e => { if (e.target.closest && e.target.closest('nav#nv [data-tab]')) { window.__glArea = null; window.__glEd = null; } }, true);

  /* ---- liga a aba na barra de baixo e na tela ---- */
  try {
    if (!TB0.includes('geral')) TB0.push('geral');
    TN.geral = [`<svg class="nav-vibrant-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#E8EEFB"/><rect x="6.2" y="6.2" width="4.6" height="4.6" rx="1.2" fill="#5B7FD6"/><rect x="13.2" y="6.2" width="4.6" height="4.6" rx="1.2" fill="#5B7FD6"/><rect x="6.2" y="13.2" width="4.6" height="4.6" rx="1.2" fill="#5B7FD6"/><rect x="13.2" y="13.2" width="4.6" height="4.6" rx="1.2" fill="#5B7FD6"/></svg>`, 'Central'];
    NV_MONO.geral = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>`;
  } catch (e) { console.warn('Central: barra', e); return; }

  const _vf = viewFor;
  viewFor = function (k) { return k === 'geral' ? (() => window.mfGeralHtml()) : _vf(k); };

  /* topo: título "Central"; dentro de uma área, o Voltar no canto da foto e o nome da área (mesmo cabeçalho das páginas com Voltar) */
  const _tb = mfTopBar;
  mfTopBar = function () {
    if (tab !== 'geral') return _tb();
    const a = atual();
    return a ? `<div class="header-bar mf-top mf-ttl2 mf-pag"><button type="button" class="mf-voltar" data-glvoltar aria-label="Voltar para Central">${VOLTAR_SVG}</button><h1 class="gl-pg-h1">${ESC(a.t)}</h1></div>`
      : '<div class="header-bar mf-top mf-ttl2"><h1>Central</h1></div>';
  };
})();
