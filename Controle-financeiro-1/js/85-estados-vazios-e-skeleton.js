/* ===== Fase 3 · M6 · Estados vazios Premium e Skeleton Loading =====
   Cada mensagem "vazia" que o app já tinha (as .mf-empty) ganha ícone, título que diz o que é, o texto original e, quando faz
   sentido, o botão da ação certa. Os cinco casos são separados de verdade:
     · ausência de dados  → ícone + título + botão (ex.: "Nenhuma compra cadastrada" › Adicionar item)
     · carregando         → skeleton (barras no formato do bloco), nunca uma tela vazia nem mensagem de erro
     · erro               → "Não foi possível carregar" com "Tentar de novo"
     · sem conexão        → "Sem conexão" (o app continua com os dados locais)
     · dados indisponíveis→ precisa entrar na conta
     · sincronizando      → skeleton "Sincronizando seus dados…" só enquanto o aparelho ainda não tem nada e a primeira sincronização corre
   Só troca o desenho de mensagens que já existiam: nenhum formulário é desmontado, nenhum dado é lido ou alterado. */
(function () {
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const IC = {
    box: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
    chart: '<path d="M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.6 10c.5-.7 1.4-1.1 2.4-1.1 1.4 0 2.4.7 2.4 1.8 0 2.2-4.8 1.1-4.8 3.4 0 1.1 1 1.8 2.4 1.8 1 0 1.9-.4 2.4-1.1"/>',
    cart: '<circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/><path d="M3 4h2.5l2 10h10l1.7-7H6.2"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    wifi: '<path d="M3 9a13 13 0 0 1 18 0M6 12.5a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0M12 19.5v.1"/><path d="M4 4l16 16"/>',
    warn: '<path d="M12 4 2.5 20h19Z"/><path d="M12 10v4.5M12 17.5v.1"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    check: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.3l2.6 2.6 4.4-5"/>'
  };
  /* [regex da mensagem, tipo, ícone, título, texto do botão, ação] — a primeira que casar vale */
  const R = [
    [/^(carregando|buscando)/i, 'load'],
    [/não foi possível/i, 'err', 'warn', 'Não foi possível carregar', 'Tentar de novo', 'retry'],
    [/^entre na sua conta/i, 'auth', 'user', 'Dados indisponíveis', 'Entrar', 'auth'],
    [/^(nenhum aviso agora|tudo comprado)/i, 'ok', 'check'],
    [/cadastre (seus )?ativos|cadastre ações|adicione ativos|ações, fiis ou etf/i, 'vazio', 'chart', 'Nenhum investimento registrado', 'Cadastrar ativo', 'ativo'],
    [/provento|pagamento anunciado|pagamentos? anunciad/i, 'vazio', 'coin', 'Nenhum provento disponível', '', ''],
    [/compra|item em/i, 'vazio', 'cart', 'Nenhuma compra cadastrada', 'Adicionar compra', 'compra'],
    [/nada para pagar|nenhuma conta|contas fixas|próximos meses|nenhuma parcela/i, 'vazio', 'cal', 'Nenhuma conta pendente', 'Ver Recorrentes', 'rec'],
    [/sem (despesas|gastos|lançamentos)|nada neste mês|nenhum aporte|registre receitas|reserva registrada/i, 'vazio', 'box', 'Nenhum lançamento no período', 'Novo lançamento', 'lanc']
  ];
  const sk = txt => `<div class="mf-sk" role="status" aria-busy="true"><i class="mf-sk-l w60"></i><i class="mf-sk-l"></i><i class="mf-sk-l w80"></i><span class="mf-sr">${txt}</span></div>`;
  function enhance() {
    const app = document.getElementById('app'); if (!app) return;
    const off = typeof navigator !== 'undefined' && navigator.onLine === false;
    const primeira = typeof sync !== 'undefined' && sync === 'syncing' && !(S.tx || []).length && performance.now() < 25000;
    app.querySelectorAll('.mf-empty:not(.mf-dia-vz):not([data-es])').forEach(p => {
      const txt = (p.textContent || '').trim(), blk = String(((p.closest('[data-bk]') || {}).dataset || {}).bk || '');
      let r = R.find(x => x[0].test(txt)); if (!r) return;
      let [, k, ic, t, bt, act] = r;
      p.dataset.es = k;
      if (k === 'load' || (primeira && k === 'vazio')) { const w = document.createElement('div'); w.innerHTML = sk(primeira && k === 'vazio' ? 'Sincronizando seus dados…' : txt); p.replaceWith(w.firstChild); return; }
      if ((k === 'err' || k === 'auth') && off) { ic = 'wifi'; t = 'Sem conexão'; k = 'off'; bt = 'Tentar de novo'; act = 'retry'; }
      if (k === 'compra' || act === 'compra') { if (!/p_shop/.test(blk)) { bt = 'Lançar compra'; act = 'lanc'; } }
      const w = document.createElement('div'); w.className = `mf-es mf-es-${k}`;
      w.innerHTML = `<span class="mf-es-i">${svg(IC[ic] || IC.box)}</span>${t ? `<b class="mf-es-t">${t}</b>` : ''}`;
      p.replaceWith(w); p.classList.add('mf-es-d'); w.appendChild(p);
      if (k === 'off') p.textContent = 'Você está sem internet. Seus dados continuam salvos neste aparelho e voltam a atualizar quando a conexão voltar.';
      if (bt && act) { const b = document.createElement('button'); b.type = 'button'; b.className = 'mf-es-b'; b.dataset.esAct = act; b.textContent = bt; w.appendChild(b); }
    });
  }
  (window.__mfAD = window.__mfAD || []).push(enhance);
  document.addEventListener('click', e => {
    const b = e.target && e.target.closest && e.target.closest('#app [data-es-act]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const a = b.dataset.esAct;
    if (a === 'lanc') { tab = 'add'; ym = TD.slice(0, 7); if (window.mfAddInicio) mfAddInicio(); window.__mfLastTab = null; draw(); scrollTo(0, 0); setTimeout(() => { const i = document.getElementById('fv'); if (i) { try { i.focus({ preventScroll: true }); } catch (_) { } } }, 80); }
    else if (a === 'ativo') { if (typeof mfLancOpen === 'function') mfLancOpen(); }
    else if (a === 'compra') { const i = document.querySelector('#app .mf-shadd input[name="n"]'); if (i) { try { i.focus(); } catch (_) { } } }
    else if (a === 'rec') { if (typeof mfGoTo === 'function') mfGoTo({ tab: 'add', lc: 'lista', blk: 'p_fixos' }); /* 2.3: Recorrentes fica em Lançamentos › Lista */ }
    else if (a === 'retry') { try { if (window.__osc) window.__osc.err = false; if (typeof mfOscLoad === 'function') mfOscLoad(true); } catch (_) { } draw(); }
    else if (a === 'auth') { if (typeof mfCfgOpen === 'function') mfCfgOpen('perfil'); }
  }, true);
})();
