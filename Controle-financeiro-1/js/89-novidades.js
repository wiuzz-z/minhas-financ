/* ===== 0.4 · Novidades da versão =====
   Único lugar para contar ao usuário o que mudou. A cada versão nova: troque `ver` e a lista `itens` (título, explicação).
   - A lista aparece em Configurações › Notificações.
   - Uma vez por versão, ao abrir o app, aparece o aviso "App atualizado" (mesmo estilo do aviso de fatura).
   - Enquanto a lista não for aberta, o acesso às Configurações mostra uma bolinha e a linha Notificações mostra "Novo".
   Guarda só duas marcas neste aparelho (localStorage): fin1_novaviso (aviso já mostrado) e fin1_novvisto (lista já aberta).
   Nenhum dado financeiro é lido ou alterado aqui. */
(function () {
  const NOV = window.MF_NOVIDADES = {
    ver: '3.25',
    itens: [
      ['Tab bar: 3 modelos para as pílulas (3.25)', 'Em Configurações › Aparência › Tab bar você escolhe o visual das pílulas de Lançamentos e de Contas: v.1 Pílula, v.2 Aba de pasta e v.3 Só texto com ponto verde.'],
      ['Contas com pílulas fixas, em teste (3.24)', 'Ao abrir Contas, as pílulas (Cartão, Situação, Compromissos, Dívidas) ficam no topo, nenhuma marcada, e logo abaixo ficam os resumos de tudo. Tocar numa pílula abre a página na hora, sem deslizar; os botões usam a cor do tema e só o texto leva a cor de destaque.'],
    ]
  };
  const ler = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
  const marca = () => document.documentElement.classList.toggle('mf-nov', ler('fin1_novvisto') !== NOV.ver);
  const fechar = () => { const w = document.getElementById('mf-note-nov'); if (w) { w.classList.remove('on'); setTimeout(() => w.remove(), 300); } };

  window.mfNovPendente = () => ler('fin1_novvisto') !== NOV.ver;
  window.mfNovVisto = () => { gravar('fin1_novvisto', NOV.ver); gravar('fin1_novaviso', NOV.ver); marca(); fechar(); };

  /* aviso "App atualizado": só com o app aberto de verdade (sem tela de bloqueio, sem outra janela por cima) */
  function livre() {
    const app = document.getElementById('app'), cfg = document.getElementById('mf-cfg');
    return !!(app && app.querySelector('[data-bk]')) && !document.documentElement.classList.contains('mf-locked') &&
      !document.getElementById('mf-note') && !(cfg && !cfg.hidden);
  }
  function aviso(n) {
    if (ler('fin1_novaviso') === NOV.ver || document.getElementById('mf-note-nov')) return;
    if (!livre()) { if (n < 20) setTimeout(() => aviso(n + 1), 3000); return; }
    gravar('fin1_novaviso', NOV.ver);
    const w = document.createElement('div');
    w.id = 'mf-note-nov'; w.className = 'mf-note nov'; w.setAttribute('role', 'status');
    w.innerHTML = '<span class="mf-note-i" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 16v4M17 18h4"/></svg></span>' +
      '<div class="mf-note-b"><b>App atualizado · versão ' + NOV.ver + '</b><span>Veja o que mudou nesta atualização.</span>' +
      '<div class="mf-note-a"><button type="button" data-nov="ver">Ver novidades</button><button type="button" data-nov="ok">Ok</button></div></div>';
    w.addEventListener('click', e => {
      const b = e.target.closest('[data-nov]'); if (!b) return;
      e.preventDefault(); e.stopPropagation(); fechar();
      if (b.dataset.nov === 'ver' && window.mfCfgOpen) {
        mfCfgOpen('notif');
        setTimeout(() => { const el = document.getElementById('mfc-nov'); if (el) el.scrollIntoView({ block: 'start' }); }, 60);
      }
    });
    document.body.appendChild(w);
    requestAnimationFrame(() => w.classList.add('on'));
    setTimeout(fechar, 12000);
  }
  let pediu = false;
  (window.__mfAD = window.__mfAD || []).push(function () {
    try { marca(); if (!pediu) { pediu = true; setTimeout(() => aviso(0), 1600); } } catch (e) { }
  });
  marca();
})();
