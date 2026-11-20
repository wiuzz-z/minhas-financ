/* ===== Investimentos › Radar (só celular) =====
   Etapa 1 (1.19): estrutura com quatro áreas. Etapa 2 (1.20): Monitoramento e Oportunidades. Etapa 3 (1.21): Eventos e Notícias
   (tabelas radar_eventos e radar_noticias, gravadas pela função radar-eventos: Dados B3/B3, CVM IPE e Yahoo RSS).
   - Os dados de MERCADO vêm das tabelas radar_ativos / radar_alertas / radar_coleta (Supabase, só leitura; quem grava é a
     função radar-sync, uma vez por dia: Dados B3 recalculada dos arquivos da CVM + preço do Yahoo). Ficam num cache do
     aparelho (fin1_radar, 30 min), nunca no estado S.
   - Do usuário só sai a lista de observação: S.radar.obs = [{ tk, alvo, em }] (sincroniza com o resto dos dados).
   - Ativo novo na lista de observação: pede à radar-sync só esse ativo (até 5 de uma vez), sem esperar a coleta do dia.
   - Nada de redesenhar a tela com um campo em foco (o teclado não fecha, o texto não some).
   O modo 'radar' (window.__invMode) é tratado em js/40 (mfInvModeOf, mfSegList, viewFor). No computador ele não existe. */
(function () {
  const AREAS = [['mon', 'Monitoramento'], ['opp', 'Oportunidades'], ['evt', 'Eventos'], ['not', 'Notícias']];
  const IC = {
    pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    news: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
  };
  const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
  const E = x => (typeof escH === 'function' ? escH(x) : String(x == null ? '' : x));
  const atual = () => AREAS.some(a => a[0] === window.__rdTab) ? window.__rdTab : 'mon';
  const isTk = t => /^[A-Z]{4}\d{1,2}$/.test(t);
  const NIVEL = { critico: 'Crítico', atencao: 'Atenção', info: 'Informativo' };
  const CAT = { preco: 'Preço', fundamento: 'Resultados', documento: 'Documentos' };
  const TIPO = { lucro_virou_prejuizo: 'Lucro virou prejuízo', prejuizo_virou_lucro: 'Prejuízo virou lucro', caixa_negativo: 'Caixa operacional ficou negativo', crescimento: 'Crescimento', queda: 'Queda', melhora: 'Melhora', piora: 'Piora', queda_dia: 'Queda no dia', alta_dia: 'Alta no dia', lucro_prejuizo: 'Lucro ou prejuízo', faixa_margem: 'Margem mudou de faixa', faixa_divida: 'Dívida mudou de faixa', reapresentacao: 'Balanço reapresentado', bandeira: 'Bandeira de confiança', informe_reenviado: 'Informe reenviado', faixa_pvp: 'P/VP mudou de faixa', faixa_dy: 'DY mudou de faixa' };
  const IND = { lucro_liq: 'Lucro líquido', receita: 'Receita', cfo: 'Geração de caixa operacional', roe: 'ROE', roic: 'ROIC', margem_liquida: 'Margem líquida', dl_ebitda: 'Dívida líquida/EBITDA', cotacao: 'Cotação' };
  const nomeDe = (m, k) => m[k] || String(k || '').replace(/_/g, ' ');
  const DIAS = 180, VIDA = 30 * 60e3, KEY = 'fin1_radar';
  const LIM = 6; // 2.1: toda lista do Radar mostra 6; o resto abre no botão "Mostrar mais"
  const maisBtn = (resto, chave) => resto > 0 ? `<button type="button" class="rd-mais" data-rdver="${chave}">Mostrar mais ${resto}</button>` : '';
  const visto = k => !!(window.__rdVer || {})[k];

  // ---------- dados ----------
  const obs = () => (S.radar && Array.isArray(S.radar.obs)) ? S.radar.obs : [];
  function tksCarteira() { try { return typeof mfRecTks === 'function' ? mfRecTks() : [...new Set(mfHeld().map(h => h.tk))].filter(isTk).sort(); } catch (e) { return []; } }
  function tksTodos() { return [...new Set([...tksCarteira(), ...obs().map(o => o.tk)])].filter(isTk).sort(); }
  function cache() { try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c && Array.isArray(c.ativos) ? c : null; } catch (e) { return null; } }
  const logado = () => typeof supabaseClient !== 'undefined' && !!supabaseClient && typeof authUser !== 'undefined' && !!authUser;
  const desde = () => { const d = new Date(Date.now() - DIAS * 864e5); return d.toISOString().slice(0, 10); };

  function redesenhar() {
    if (typeof tab === 'undefined' || tab !== 'inv' || typeof mfInvMode !== 'function' || mfInvMode() !== 'radar') return;
    const ae = document.activeElement;
    if (ae && ae.closest && ae.closest('#app .rd') && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) { window.__rdPend = 1; return; }
    if (window.mfDrawLater) mfDrawLater(); else draw();
  }
  document.addEventListener('focusout', e => { if (window.__rdPend && e.target && e.target.closest && e.target.closest('#app .rd')) setTimeout(() => { const ae = document.activeElement; if (ae && ae.closest && ae.closest('#app .rd') && /^(INPUT|SELECT)$/.test(ae.tagName)) return; window.__rdPend = 0; redesenhar(); }, 120); }, true);

  function carregar(forcar) {
    const tks = tksTodos(), k = tks.join(','), c = cache();
    if (!tks.length || !logado() || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
    if (!forcar && c && c.k === k && Date.now() - c.at < VIDA) return;
    if (window.__rdBusy) return;
    if (!forcar && window.__rdTry && Date.now() - window.__rdTry < 60e3) return;
    window.__rdBusy = 1; window.__rdTry = Date.now(); window.__rdErr = 0;
    const R = MF_DB.radar;
    const opc = p => p.then(r => r, () => ({ data: [], error: 1 })); // eventos e notícias falham sozinhos, sem derrubar o resto
    Promise.all([R.ativos(tks), R.alertas(tks, desde()), R.coleta(), opc(R.eventos(tks)), opc(R.noticias(tks))]).then(([a, b, cl, ev, no]) => {
      window.__rdBusy = 0;
      if (a.error || b.error) { window.__rdErr = 1; redesenhar(); return; }
      const novo = { k, at: Date.now(), ativos: a.data || [], alertas: b.data || [], coleta: (cl && cl.data) || [], eventos: (ev && !ev.error && ev.data) || [], noticias: (no && !no.error && no.data) || [], falhaEv: !!(ev && ev.error), falhaNot: !!(no && no.error) };
      try { localStorage.setItem(KEY, JSON.stringify(novo)); } catch (e) { window.__rdMem = novo; }
      redesenhar();
      // ativos da lista de observação ainda sem retrato: pede só eles (a coleta do dia cuida dos outros)
      const tem = new Set(novo.ativos.map(x => x.ticker)), faltam = obs().map(o => o.tk).filter(t => !tem.has(t) && !(window.__rdSyncTk || {})[t]).slice(0, 5);
      if (faltam.length) {
        window.__rdSyncTk = Object.assign(window.__rdSyncTk || {}, Object.fromEntries(faltam.map(t => [t, 1]))); window.__rdSync = 1; redesenhar();
        Promise.allSettled([R.sync(faltam), R.eventosSync ? R.eventosSync(faltam) : null]).then(() => { window.__rdSync = 0; carregar(true); });
      }
    }, () => { window.__rdBusy = 0; window.__rdErr = 1; redesenhar(); });
  }
  const dados = () => { const c = cache() || window.__rdMem || null; return c && c.k === tksTodos().join(',') ? c : (c ? { ...c, velho: 1 } : null); };
  (window.__mfAD = window.__mfAD || []).push(() => { try { if (typeof tab !== 'undefined' && tab === 'inv' && mfInvMode() === 'radar') carregar(false); } catch (e) { } });

  // ---------- formatação (ausente = "não informado", nunca zero) ----------
  const NI = 'não informado';
  const br = (v, d = 2) => (+v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const dt = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || '')); return m ? `${m[3]}/${m[2]}/${m[1]}` : NI; };
  const dth = s => { const d = new Date(s); return isNaN(d) ? NI : d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
  function valor(ind, tipo, v) {
    if (v === null || v === undefined || v === '') return NI; v = +v; if (!isFinite(v)) return NI;
    const k = String(ind || tipo || '');
    if (k === 'cotacao') return 'R$ ' + br(v);
    if (/receita|lucro|cfo|ebit/.test(k)) return 'R$ ' + br(v / 1e6, 1) + ' mi';
    if (/margem|roe|roic|dy|vacancia/.test(k)) return br(v * 100, 1) + '%';
    if (/pvp|dl_ebitda|divida/.test(k)) return br(v, 2);
    return br(v, 2);
  }
  const lk = u => { if (!/^https?:\/\//.test(String(u || ''))) return ''; const t = /cvm\.gov\.br/.test(u) ? 'Ver o documento na CVM' : /dadosb3/.test(u) ? 'Ver na Dados B3' : /yahoo/.test(u) ? 'Ver no Yahoo Finance' : 'Ver a fonte'; return `<a class="rd-lk" href="${E(u)}" target="_blank" rel="noopener noreferrer">${t} ↗</a>`; };

  // ---------- telas ----------
  function vazio(ic, titulo, txt) { return `<div class="rd-vazio"><span class="rd-ic">${svg(ic)}</span><b>${titulo}</b><p>${txt}</p></div>`; }

  function telaMon(D, tks) {
    if (!tks.length) return vazio('pulse', 'Nenhum ativo para acompanhar', 'Cadastre ações ou FIIs na carteira, ou adicione um ativo à lista de observação em Oportunidades.');
    if (!D) return window.__rdBusy ? `<p class="rd-load">Buscando os alertas dos seus ativos…</p>` : vazio('pulse', 'Sem dados ainda', logado() ? (window.__rdErr ? 'Não foi possível buscar agora. Tente de novo em instantes.' : 'Os alertas aparecem assim que a busca terminar.') : 'Entre na sua conta para ver o Radar.');
    const set = new Set(tks), cat = window.__rdCat || 'todos';
    const todos = (D.alertas || []).filter(a => set.has(a.ticker)).sort((x, y) => String(y.data_publicacao || '').localeCompare(String(x.data_publicacao || '')) || (+y.id || 0) - (+x.id || 0));
    const L = todos.filter(a => cat === 'todos' || a.categoria === cat);
    const n = k => todos.filter(a => k === 'todos' || a.categoria === k).length;
    const chips = `<div class="rd-chips" data-nosw>${[['todos', 'Todos'], ['preco', 'Preço'], ['fundamento', 'Resultados'], ['documento', 'Documentos']].map(([k, t]) => `<button type="button" class="${k === cat ? 'on' : ''}" data-rdcat="${k}">${t} <small>${n(k)}</small></button>`).join('')}</div>`;
    if (!L.length) return chips + vazio('pulse', 'Nenhum alerta', `Nada ${cat === 'todos' ? '' : 'nesta categoria '}nos últimos ${DIAS} dias para os seus ativos.`);
    const max = visto('mon') ? L.length : LIM, ab = window.__rdOpen || {};
    const itens = L.slice(0, max).map(a => {
      const id = 'a' + a.id, aberto = !!ab[id];
      const det = aberto ? `<dl class="rd-det">
        <dt>Ativo</dt><dd>${E(a.ticker)}${a.nome ? ' · ' + E(a.nome) : ''}</dd>
        <dt>Tipo</dt><dd>${E(CAT[a.categoria] || a.categoria)} · ${E(nomeDe(TIPO, a.tipo))}</dd>
        ${a.indicador ? `<dt>Indicador</dt><dd>${E(nomeDe(IND, a.indicador))}</dd>` : ''}
        <dt>Antes → depois</dt><dd>${valor(a.indicador, a.tipo, a.antes)} → ${valor(a.indicador, a.tipo, a.depois)}</dd>
        ${a.variacao_pct !== null && a.variacao_pct !== undefined ? `<dt>Variação</dt><dd>${+a.variacao_pct > 0 ? '+' : ''}${br(a.variacao_pct, 1)}%</dd>` : ''}
        <dt>Período</dt><dd>${E(a.periodo_ref || NI)}</dd>
        <dt>Publicado em</dt><dd>${dt(a.data_publicacao)}</dd>
        <dt>Coletado em</dt><dd>${dth(a.coletado_em)}</dd>
        <dt>Fonte</dt><dd>${E(a.fonte || NI)}</dd></dl>${lk(a.link)}` : '';
      return `<div class="rd-al lv-${E(a.nivel)}${aberto ? ' on' : ''}"><button type="button" class="rd-al-h" data-rdtog="${id}" aria-expanded="${aberto}">
        <span class="rd-lv">${NIVEL[a.nivel] || ''}</span><b>${E(a.ticker)}</b><small>${E(CAT[a.categoria] || '')} · ${dt(a.data_publicacao)}</small></button>
        <p class="rd-tx">${E(a.texto)}</p>${det}</div>`;
    }).join('');
    const mais = maisBtn(L.length - max, 'mon');
    return chips + `<div class="rd-lista">${itens}</div>${mais}<p class="rd-nota">Movimento de preço e mudança nos números da empresa aparecem separados: uma queda de cotação, sozinha, não diz que os resultados pioraram. Toque num alerta para ver os números e o documento original.</p>`;
  }

  function criterios(s) {
    return `<ul class="rd-crit">${(s.criterios || []).map(c => `<li class="${c.ok === true ? 'ok' : c.ok === false ? 'no' : 'nd'}"><i aria-hidden="true">${c.ok === true ? '✓' : c.ok === false ? '✕' : '–'}</i><span><b>${E(c.nome)}</b><small>${E(c.valor || NI)}</small></span></li>`).join('')}</ul><p class="rd-regra">${E(s.regra || '')}${s.base ? ' Base: ' + E(s.base) + '.' : ''}</p>`;
  }
  function cartaoAtivo(a, destaque) {
    const s = a.sinais, p = a.preco || {}, id = 'o' + a.ticker, aberto = !!(window.__rdOpen || {})[id];
    const st = !s ? 'Sem dados de fundamentos' : s.oportunidade ? 'Atende aos critérios' : s.suficiente ? 'Não atende aos critérios' : 'Dados insuficientes para avaliar';
    const ok = s ? (s.criterios || []).filter(c => c.ok === true).length : 0, tot = s ? (s.criterios || []).filter(c => c.ok !== null).length : 0;
    return `<div class="rd-op${destaque ? ' dest' : ''}${aberto ? ' on' : ''}"><button type="button" class="rd-op-h" data-rdtog="${id}" aria-expanded="${aberto}">
      <b>${E(a.ticker)}</b><span class="rd-op-st">${st}${s && tot ? ` · ${ok} de ${tot}` : ''}</span><small>${p.ultimo ? 'R$ ' + br(p.ultimo) : NI}${p.queda52 !== null && p.queda52 !== undefined ? ` · ${br(p.queda52, 1)}% da máxima de 12 meses` : ''}</small></button>
      ${aberto && s ? criterios(s) + `<p class="rd-fonte">${E(a.nome || '')}${a.nome ? ' · ' : ''}atualizado em ${dth(a.atualizado_em)} · Dados B3 (CVM) e Yahoo Finance</p>` : ''}</div>`;
  }

  function telaOpp(D, tks) {
    const O = obs(), ativos = new Map(((D && D.ativos) || []).map(a => [a.ticker, a]));
    // lista de observação
    const form = `<div class="rd-obs-f" data-nosw><input id="rd-obs-tk" type="text" inputmode="text" autocapitalize="characters" maxlength="7" placeholder="Ativo (ex.: WEGE3)" autocomplete="off"><input id="rd-obs-alvo" type="text" inputmode="decimal" maxlength="12" placeholder="Preço de interesse" autocomplete="off"><button type="button" class="primary-btn" data-rdobsadd="1">Observar</button></div>`;
    const linhasL = O.map(o => {
      const a = ativos.get(o.tk), pr = a && a.preco && a.preco.ultimo, alvo = +o.alvo || 0;
      const dist = pr && alvo ? ((pr - alvo) / alvo) * 100 : null, chegou = pr && alvo && pr <= alvo;
      const info = !a ? (window.__rdSync && (window.__rdSyncTk || {})[o.tk] ? 'buscando os dados…' : 'os dados chegam na próxima coleta (todo dia de manhã)') : `${pr ? 'R$ ' + br(pr) : NI}${alvo ? ` · interesse R$ ${br(alvo)}${dist !== null ? ` (${dist > 0 ? '+' : ''}${br(dist, 1)}%)` : ''}` : ''}`;
      return `<li class="${chegou ? 'hit' : ''}"><b>${E(o.tk)}</b><span>${info}${chegou ? '<em>No preço de interesse</em>' : ''}</span><button type="button" class="rd-x" data-rdobsdel="${E(o.tk)}" aria-label="Tirar ${E(o.tk)} da lista">×</button></li>`;
    });
    const nObs = visto('obs') ? O.length : LIM;
    const lista = `<h3 class="rd-h3">Lista de observação</h3>${form}${O.length ? `<ul class="rd-obs">${linhasL.slice(0, nObs).join('')}</ul>${maisBtn(O.length - nObs, 'obs')}` : '<p class="rd-nota">Acompanhe ativos que você ainda não tem. Informe um preço de interesse (opcional) para ver quando a cotação chegar nele.</p>'}`;
    if (!tks.length) return lista;
    if (!D) return lista + (window.__rdBusy ? `<p class="rd-load">Buscando os dados…</p>` : vazio('target', 'Sem dados ainda', logado() ? 'Os critérios aparecem assim que a busca terminar.' : 'Entre na sua conta para ver o Radar.'));
    const A = tks.map(t => ativos.get(t)).filter(Boolean).filter(a => a.classe !== 'outro');
    const dest = A.filter(a => a.sinais && a.sinais.oportunidade), resto = A.filter(a => !(a.sinais && a.sinais.oportunidade));
    const semDado = tks.filter(t => !ativos.has(t));
    return lista
      + `<h3 class="rd-h3">Em destaque</h3>` + (dest.length ? dest.slice(0, visto('dest') ? dest.length : LIM).map(a => cartaoAtivo(a, true)).join('') + maisBtn(visto('dest') ? 0 : dest.length - LIM, 'dest') : `<p class="rd-nota">Nenhum dos seus ativos atende a todos os critérios hoje.</p>`)
      + (resto.length ? `<h3 class="rd-h3">Outros ativos analisados</h3>${resto.slice(0, visto('resto') ? resto.length : LIM).map(a => cartaoAtivo(a, false)).join('')}${maisBtn(visto('resto') ? 0 : resto.length - LIM, 'resto')}` : '')
      + (semDado.length ? `<p class="rd-nota">Ainda sem dados: ${semDado.map(E).join(', ')}.</p>` : '')
      + `<p class="rd-nota">Critérios objetivos sobre dados públicos, sempre com os números. Não é recomendação de compra. Graham e Bazin continuam na aba Análise.</p>`;
  }

  // ---------- Eventos: próximos (datas que a fonte já informou) e linha do tempo; datas sempre com o nome ----------
  const HOJE = () => (typeof TD !== 'undefined' ? TD : new Date().toISOString().slice(0, 10));
  const EV_GRUPO = { anuncio_provento: 'prov', pagamento: 'prov', data_com: 'prov', agenda: 'prov', resultado: 'res', release_resultado: 'res', reapresentacao: 'res', fato_relevante: 'fato', comunicado: 'com', aviso_acionistas: 'com', calendario: 'com', societario: 'com', assembleia: 'ass' };
  const EV_NOME = { anuncio_provento: 'Provento', pagamento: 'Provento', data_com: 'Provento', agenda: 'Provento', resultado: 'Resultado entregue', release_resultado: 'Release de resultado', reapresentacao: 'Balanço reapresentado', fato_relevante: 'Fato relevante', comunicado: 'Comunicado ao mercado', aviso_acionistas: 'Aviso aos acionistas', calendario: 'Calendário corporativo', societario: 'Evento societário', assembleia: 'Assembleia' };
  const PROV = { DIVIDENDO: 'Dividendo', JCP: 'JCP', RENDIMENTO: 'Rendimento', AMORTIZACAO: 'Amortização', AMORTIZAÇÃO: 'Amortização', PROVENTO: 'Provento' };
  function tituloEv(e) {
    if (EV_GRUPO[e.tipo] !== 'prov') return e.titulo;
    const m = /^([A-Za-zÀ-ú]+)/.exec(e.titulo || ''), tp = m ? (PROV[m[1].toUpperCase()] || m[1]) : 'Provento';
    return `${tp}${e.valor !== null && e.valor !== undefined ? ' de R$ ' + (+e.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + ' por ' + (e.classe === 'fii' || /RENDIMENTO|AMORTIZ/i.test(e.titulo) ? 'cota' : 'ação') : ''}`;
  }
  // data que ordena o próximo evento: pagamento ou data-com futuros
  const proxData = e => { const h = HOJE(), c = [e.data_pagamento, e.data_com].filter(d => d && d >= h).sort(); return c[0] || null; };
  function datasEv(e) {
    const L = [];
    if (EV_GRUPO[e.tipo] === 'prov') { L.push(['Data-com', e.data_com ? dt(e.data_com) : 'não informada'], ['Pagamento', e.data_pagamento ? dt(e.data_pagamento) : 'não informado']); if (e.data_publicacao) L.push(['Aprovado/anunciado em', dt(e.data_publicacao)]); }
    else { L.push(['Publicado em', e.data_publicacao ? dt(e.data_publicacao) : 'não informado']); if (e.data_evento) L.push([/resultado|reapresentacao/.test(e.tipo) ? 'Período de referência' : e.tipo === 'societario' ? 'Data-ex' : 'Data de referência', dt(e.data_evento)]); }
    return L;
  }
  function itemEv(e, prox) {
    const id = 'e' + e.id, aberto = !!(window.__rdOpen || {})[id], pd = prox ? proxData(e) : null;
    const prov = EV_GRUPO[e.tipo] === 'prov';
    const quando = prox ? `${pd === e.data_pagamento ? 'Pagamento' : 'Data-com'} ${dt(pd)}`
      : prov ? (e.data_pagamento ? 'Pagamento em ' + dt(e.data_pagamento) : e.data_com ? 'Data-com ' + dt(e.data_com) : 'data não informada')
        : (e.data_publicacao ? 'Publicado em ' + dt(e.data_publicacao) : e.data_evento ? 'Referência ' + dt(e.data_evento) : 'data não informada');
    const det = aberto ? `${e.resumo ? `<p class="rd-tx">${E(e.resumo)}</p>` : ''}<dl class="rd-det">${datasEv(e).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}<dt>Fonte</dt><dd>${E(e.fonte || NI)}</dd><dt>Coletado em</dt><dd>${dth(e.coletado_em)}</dd></dl>${lk(e.link)}` : '';
    return `<div class="rd-al rd-ev g-${EV_GRUPO[e.tipo] || 'com'}${aberto ? ' on' : ''}"><button type="button" class="rd-al-h" data-rdtog="${id}" aria-expanded="${aberto}"><span class="rd-lv">${E(EV_NOME[e.tipo] || e.tipo)}</span><b>${E(e.ticker)}</b><small>${E(quando)}</small></button><p class="rd-tx">${E(tituloEv(e))}</p>${det}</div>`;
  }
  function telaEvt(D, tks) {
    if (!tks.length) return vazio('cal', 'Nenhum ativo para acompanhar', 'Cadastre ações ou FIIs na carteira, ou adicione um ativo à lista de observação em Oportunidades.');
    if (!D) return window.__rdBusy ? `<p class="rd-load">Buscando os eventos…</p>` : vazio('cal', 'Sem dados ainda', logado() ? 'Os eventos aparecem assim que a busca terminar.' : 'Entre na sua conta para ver o Radar.');
    const set = new Set(tks), cat = window.__rdEvCat || 'todos', h = HOJE();
    // proventos: o mesmo pagamento pode vir do anúncio e da agenda; fica um (o que tem link da CVM, se houver)
    const vistos = new Map();
    for (const e of (D.eventos || []).filter(e => set.has(e.ticker))) {
      const k = EV_GRUPO[e.tipo] === 'prov' ? `p|${e.ticker}|${e.data_com}|${e.data_pagamento || ''}|${e.valor}` : 'i|' + e.id;
      const j = vistos.get(k); if (!j || (!j.link && e.link)) vistos.set(k, e);
    }
    const todos = [...vistos.values()], n = g => todos.filter(e => g === 'todos' || EV_GRUPO[e.tipo] === g).length;
    const L = todos.filter(e => cat === 'todos' || EV_GRUPO[e.tipo] === cat);
    const chips = `<div class="rd-chips" data-nosw>${[['todos', 'Todos'], ['prov', 'Proventos'], ['res', 'Resultados'], ['fato', 'Fatos relevantes'], ['com', 'Comunicados'], ['ass', 'Assembleias']].filter(([k]) => k === 'todos' || n(k)).map(([k, t]) => `<button type="button" class="${k === cat ? 'on' : ''}" data-rdevcat="${k}">${t} <small>${n(k)}</small></button>`).join('')}</div>`;
    if (!L.length) return chips + vazio('cal', 'Nenhum evento', D.falhaEv ? 'Não foi possível buscar os eventos agora. Tente de novo em instantes.' : 'Nada registrado para os seus ativos nesta categoria nos últimos meses.');
    const prox = L.filter(e => proxData(e)).sort((a, b) => proxData(a).localeCompare(proxData(b)));
    const lim = new Date(Date.now() - 120 * 864e5).toISOString().slice(0, 10);
    const quandoFoi = e => EV_GRUPO[e.tipo] === 'prov' ? (e.data_pagamento || e.data_com || '') : (e.data_publicacao || e.data_evento || '');
    const pass = L.filter(e => !proxData(e)).filter(e => quandoFoi(e) >= lim).sort((a, b) => quandoFoi(b).localeCompare(quandoFoi(a)) || b.id - a.id);
    const maxP = visto('evp') ? prox.length : LIM, maxT = visto('evt') ? pass.length : LIM;
    return chips
      + `<h3 class="rd-h3">Próximos</h3>` + (prox.length ? `<div class="rd-lista">${prox.slice(0, maxP).map(e => itemEv(e, true)).join('')}</div>${maisBtn(prox.length - maxP, 'evp')}` : `<p class="rd-nota">Nenhuma data-com ou pagamento futuro informado pela fonte.</p>`)
      + `<h3 class="rd-h3">Linha do tempo</h3>` + (pass.length ? `<div class="rd-lista">${pass.slice(0, maxT).map(e => itemEv(e, false)).join('')}</div>${maisBtn(pass.length - maxT, 'evt')}` : `<p class="rd-nota">Nada nos últimos 120 dias.</p>`)
      + `<p class="rd-nota">Datas sempre com o nome: publicação, referência, data-com e pagamento são coisas diferentes. Só aparecem datas futuras que a fonte já informou. Fontes: CVM (documentos oficiais) e B3, via Dados B3. Toque num evento para ver as datas e o documento original.</p>`;
  }

  // ---------- Notícias: só título + trecho do próprio veículo + link; nada gerado ----------
  const NOT_CAT = { empresa: 'Empresas', economia: 'Economia brasileira', juros_inflacao: 'Juros e inflação', regulacao: 'Regulação' };
  const quandoN = s => { const d = new Date(s); return isNaN(d) ? 'data não informada' : d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
  /* 2.1: só notícias em português. A fonte (Yahoo) manda quase tudo em inglês; aqui a manchete só entra se o título e o trecho
     tiverem mais palavras do português do que do inglês (acentos contam a favor). Nada é traduzido nem reescrito. */
  const PT = new Set('de da do das dos que em para com não uma um os as no na nos nas por ao aos é são mais após sobre entre também já seu sua lucro ações ação tem diz e ou se pelo pela até como foi vai alta queda trimestre resultado dividendos juros'.split(' '));
  const EN = new Set('the of and to in for on with is are at by from its after says said stocks stock shares earnings rises falls what why how this that will be has have was were an it than snapshot quarter reported offering'.split(' '));
  function emPortugues(n) {
    const tx = String((n.titulo || '') + ' ' + (n.trecho || '')).toLowerCase();
    let pt = (tx.match(/[ãõçáàâéêíóôú]/g) || []).length ? 2 : 0, en = 0;
    for (const w of tx.split(/[^a-zà-ú]+/)) { if (PT.has(w)) pt++; else if (EN.has(w)) en++; }
    return pt > en;
  }
  function itemNot(n) {
    const rel = (n.tickers || []).filter(Boolean), id = 'n' + (n.id || n.link), aberto = !!(window.__rdOpen || {})[id];
    const det = aberto ? `${n.trecho ? `<p class="rd-tx rd-nt-tr">${E(n.trecho)}</p>` : ''}<dl class="rd-det"><dt>Veículo</dt><dd>${E(n.veiculo || NI)}</dd><dt>Publicado em</dt><dd>${quandoN(n.publicado_em)}</dd>${rel.length ? `<dt>Ativos</dt><dd>${rel.map(E).join(', ')}</dd>` : ''}<dt>Assunto</dt><dd>${E(NOT_CAT[n.categoria] || n.categoria)}</dd></dl><a class="rd-lk" href="${E(n.link)}" target="_blank" rel="noopener noreferrer">Abrir a matéria ↗</a>` : '';
    return `<div class="rd-al rd-nt${n.destaque ? ' dest' : ''}${aberto ? ' on' : ''}"><button type="button" class="rd-al-h" data-rdtog="${E(id)}" aria-expanded="${aberto}"><span class="rd-lv">${E(NOT_CAT[n.categoria] || n.categoria)}</span><b>${rel.length ? rel.map(E).join(', ') : E(n.veiculo || '')}</b><small>${E(n.veiculo || NI)} · ${quandoN(n.publicado_em)}</small></button><p class="rd-tx">${E(n.titulo)}</p>${det}</div>`;
  }
  function telaNot(D, tks) {
    if (!D) return window.__rdBusy ? `<p class="rd-load">Buscando as notícias…</p>` : vazio('news', 'Sem dados ainda', logado() ? 'As notícias aparecem assim que a busca terminar.' : 'Entre na sua conta para ver o Radar.');
    const set = new Set(tks), tk = window.__rdNotTk || 'todos', cat = window.__rdNotCat || 'todas';
    const todas = (D.noticias || []).filter(n => n.categoria !== 'empresa' || (n.tickers || []).some(t => set.has(t))).filter(emPortugues);
    const comTk = tks.filter(t => todas.some(n => (n.tickers || []).includes(t)));
    const cats = Object.keys(NOT_CAT).filter(c => todas.some(n => n.categoria === c));
    const L = todas.filter(n => (tk === 'todos' || (n.tickers || []).includes(tk)) && (cat === 'todas' || n.categoria === cat));
    L.sort((a, b) => String(b.publicado_em || '').localeCompare(String(a.publicado_em || '')));
    const fTk = comTk.length ? `<div class="rd-chips" data-nosw><button type="button" class="${tk === 'todos' ? 'on' : ''}" data-rdnotk="todos">Todos os ativos</button>${comTk.map(t => `<button type="button" class="${tk === t ? 'on' : ''}" data-rdnotk="${E(t)}">${E(t)}</button>`).join('')}</div>` : '';
    const fCat = cats.length > 1 ? `<div class="rd-chips" data-nosw><button type="button" class="${cat === 'todas' ? 'on' : ''}" data-rdnocat="todas">Todas</button>${cats.map(c => `<button type="button" class="${cat === c ? 'on' : ''}" data-rdnocat="${c}">${NOT_CAT[c]}</button>`).join('')}</div>` : '';
    const nota = `<p class="rd-nota">Só manchetes em português. Aparecem o título e o trecho publicado pelo próprio veículo; a matéria completa abre no site original. Comunicados oficiais das empresas ficam em Eventos.</p>`;
    if (!L.length) return fTk + fCat + vazio('news', 'Nenhuma notícia em português', D.falhaNot ? 'Não foi possível buscar as notícias agora. Tente de novo em instantes.' : 'A fonte atual publica quase tudo em inglês, e essas manchetes não aparecem aqui.') + nota;
    const max = visto('not') ? L.length : LIM;
    return fTk + fCat + `<div class="rd-lista">${L.slice(0, max).map(itemNot).join('')}</div>${maisBtn(L.length - max, 'not')}` + nota;
  }

  function mfRadarHtml() {
    const cur = atual(), tks = tksTodos(), D = dados();
    const col = D && D.coleta ? D.coleta : [], okEm = col.map(c => c.ultimo_ok).filter(Boolean).sort()[0];
    const falha = col.filter(c => c.status === 'falha').map(c => /yahoo/.test(c.fonte) ? 'Yahoo' : 'Dados B3');
    const sub = !logado() ? 'Entre na sua conta para ver o Radar.'
      : window.__rdBusy && !D ? 'Atualizando…'
        : okEm ? `Dados de ${dth(okEm)} · Dados B3 (CVM) e Yahoo Finance${falha.length ? ` · ${[...new Set(falha)].join(' e ')} falhou na última coleta` : ''}` : 'Dados B3 (CVM) e Yahoo Finance';
    const pane = cur === 'mon' ? telaMon(D, tks) : cur === 'opp' ? telaOpp(D, tks)
      : cur === 'evt' ? telaEvt(D, tks) : telaNot(D, tks);
    return B('i_radar') + `<section class="c rd"><h2>Radar</h2>
  <p class="rd-sub">${E(sub)}</p>
  <div class="rd-tabs" role="tablist" data-nosw>${AREAS.map(x => `<button type="button" role="tab" aria-selected="${x[0] === cur}" class="${x[0] === cur ? 'on' : ''}" data-rdtab="${x[0]}">${x[1]}</button>`).join('')}</div>
  <div class="rd-pane" role="tabpanel">${pane}</div>
</section>`;
  }
  window.mfRadarHtml = mfRadarHtml;
  window.mfRadarCarregar = carregar;

  // ---------- toques ----------
  document.addEventListener('click', e => {
    const t = e.target; if (!t || !t.closest || !t.closest('#app .rd')) return; let b;
    const para = () => { e.preventDefault(); e.stopPropagation(); };
    if (b = t.closest('[data-rdtab]')) { para(); window.__rdTab = b.dataset.rdtab; window.__rdVer = {}; draw(); return; }
    if (b = t.closest('[data-rdcat]')) { para(); window.__rdCat = b.dataset.rdcat; window.__rdVer = {}; draw(); return; }
    if (b = t.closest('[data-rdver]')) { para(); (window.__rdVer = window.__rdVer || {})[b.dataset.rdver] = 1; draw(); return; }
    if (b = t.closest('[data-rdevcat]')) { para(); window.__rdEvCat = b.dataset.rdevcat; window.__rdVer = {}; draw(); return; }
    if (b = t.closest('[data-rdnotk]')) { para(); window.__rdNotTk = b.dataset.rdnotk; window.__rdVer = {}; draw(); return; }
    if (b = t.closest('[data-rdnocat]')) { para(); window.__rdNotCat = b.dataset.rdnocat; window.__rdVer = {}; draw(); return; }
    if (b = t.closest('[data-rdtog]')) { para(); const o = window.__rdOpen = window.__rdOpen || {}; o[b.dataset.rdtog] = !o[b.dataset.rdtog]; draw(); return; }
    if (b = t.closest('[data-rdobsdel]')) { para(); if (!S.radar) return; S.radar.obs = obs().filter(o => o.tk !== b.dataset.rdobsdel); save(); draw(); return; }
    if (t.closest('[data-rdobsadd]')) {
      para();
      const tk = String((document.getElementById('rd-obs-tk') || {}).value || '').toUpperCase().replace(/\.SA$/, '').trim();
      let av = String((document.getElementById('rd-obs-alvo') || {}).value || '').trim().replace(/^R\$\s*/i, '');
      if (av.includes(',')) av = av.replace(/\./g, '').replace(',', '.'); // 1.234,56 → 1234.56; 58.5 fica 58.5
      if (!isTk(tk)) { if (window.mfToast) mfToast('Informe o código do ativo (ex.: WEGE3).'); return; }
      const alvo = av === '' ? null : +av;
      if (alvo !== null && !(alvo > 0)) { if (window.mfToast) mfToast('Preço de interesse inválido.'); return; }
      const R = S.radar = S.radar || {}; R.obs = Array.isArray(R.obs) ? R.obs : [];
      const ja = R.obs.find(o => o.tk === tk);
      if (ja) ja.alvo = alvo; else R.obs.push({ tk, alvo, em: typeof TD !== 'undefined' ? TD : new Date().toISOString().slice(0, 10) });
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      window.__rdPend = 0; save(); draw(); carregar(true);
    }
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.closest && e.target.closest('#app .rd-obs-f')) { e.preventDefault(); const b = document.querySelector('#app [data-rdobsadd]'); if (b) b.click(); } }, true);

  try { MF_REC_TRAVA.invest_avancado.inv.push('i_radar'); } catch (e) { }
})();
