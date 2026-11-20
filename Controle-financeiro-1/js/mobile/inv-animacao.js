/* 0.1 · Fundo animado do topo de Investimentos (SÓ CELULAR; o computador não muda).
   A área do topo (cabeçalho + Patrimônio total + botões das subabas) ganha um fundo próprio, desenhado numa camada
   atrás do conteúdo (#iv-fx). A pessoa escolhe o que aparece ali em "Editar bloco › Animação", no bloco do
   Valor atual (dv_kpi) e, desde a 3.4, também no Saldo atual do Dashboard (c_sal). Nada é apagado: sem escolha, fica a cor lisa de sempre.

   O que guarda (em S.lay.lk.dv_kpi, junto das outras opções do bloco):
     ivfx  efeito: '' cor lisa · 'meteoros' · 'brilho' · 'meu' (desenho próprio, ainda sem conteúdo)
     ivn   quantidade (meteoros): 5 a 60
     ivsp  velocidade: 'l' lenta · '' média · 'r' rápida
     ivdir direção: '' para a esquerda · 'd' para a direita
     ivc   cor do fundo/efeito (hex) — vazio = cor do tema (sem brilho colorido)
     ivi   intensidade: '25' | '50' | '' (75) | '100'

   Desenho próprio: quando chegar o desenho, basta definir window.MF_IV_DESENHO = () => '<svg…>' (ou uma função que
   devolva o HTML da animação). Enquanto não existir, a opção aparece com um aviso de que ainda não há desenho. */
(function () {
  'use strict';
  const desk = () => !!(window.mfIsDesk && mfIsDesk());
  /* 3.4: o mesmo fundo vale em dois blocos: Valor atual (Investimentos › Posição, dv_kpi) e Saldo atual (Dashboard, c_sal). As opções de cada um ficam no próprio bloco. */
  const BLOCOS = ['dv_kpi', 'c_sal'];
  const BLOCO_DA_TELA = () => (document.documentElement.dataset.tab === 'res' ? 'c_sal' : 'dv_kpi');

  const EFEITOS = [['nenhum', 'Nenhum'], ['meteoros', 'Meteoros'], ['brilho', 'Brilho suave'], ['meu', 'Desenho próprio']];
  const CORES = [['', 'Cor do tema'], ['#3d4d14', 'Verde'], ['#0f3a5f', 'Azul'], ['#3b1f6b', 'Roxo'], ['#5c1f3a', 'Rosa'], ['#5c3a0f', 'Âmbar'], ['#14494a', 'Turquesa'], ['#1c1c1e', 'Grafite']];
  const VEL = { l: 11, '': 7, r: 4 };     // segundos que um meteoro leva para atravessar
  const INT = { f: .4, m: .7, '': 1 };    // '' = forte (o padrão aprovado)

  /* padrão de teste: meteoros ligados; 'nenhum' = desligado */
  const efeitoDe = L => (L.ivfx === undefined ? 'meteoros' : L.ivfx === 'nenhum' ? '' : L.ivfx);
  const cfg = () => (typeof mfLkGet === 'function' && mfLkGet(BLOCO_DA_TELA())) || {};
  const hexRgb = h => { const m = /^#([0-9a-f]{6})$/i.exec(h || ''); if (!m) return null; const n = parseInt(m[1], 16); return { r: n >> 16, g: n >> 8 & 255, b: n & 255 }; };
  const parado = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.mfanim === '0';

  /* ---------- a camada ---------- */
  /* 3.20: o fundo entra e sai com esmaecimento (antes sumia de uma vez ao abrir uma página e voltava de repente, como um clarão) */
  function limpar() {
    const el = document.getElementById('iv-fx'); if (!el || el.__sai) return;
    el.__sai = true; el.classList.add('iv-sai');
    setTimeout(() => { if (el.__sai) el.remove(); }, 160);
  }

  function montar() {
    const html = document.documentElement;
    if (desk() || !html.classList.contains('iv-topo')) { limpar(); return; }
    const L = cfg(), fx = efeitoDe(L);

    /* cor do fundo: só existe se a pessoa escolher uma em Editar bloco › Animação (html.iv-cor).
       Sem escolha, o topo fica na cor do próprio tema; o brilho suave usa a cor de destaque do tema. */
    const c = hexRgb(L.ivc);
    html.classList.toggle('iv-cor', !!c);
    if (c) html.style.setProperty('--iv-glow', `${c.r},${c.g},${c.b}`); else html.style.removeProperty('--iv-glow');
    html.style.setProperty('--iv-int', String(INT[L.ivi] ?? INT['']));

    if (!fx) { limpar(); return; }

    /* altura: do alto da página até um pouco abaixo dos botões das subabas, mais a faixa em que o fundo esmaece */
    const bts = document.querySelector('#app .iv-at') || document.querySelector('#app .dash-balance');   // Posição: até os botões; Dashboard: até o fim do Saldo atual
    const FADE = 140;                                                           // faixa final em que o fundo esmaece (css/98: --iv-fade); nunca termina numa linha reta
    const fim = (bts ? bts.getBoundingClientRect().bottom + scrollY + 24 : 420) + FADE;

    let el = document.getElementById('iv-fx');
    if (!el) { el = document.createElement('div'); el.id = 'iv-fx'; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); }
    if (el.__sai) { el.__sai = false; el.classList.remove('iv-sai'); el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }   // voltou antes de sumir: entra de novo suave
    el.style.height = Math.round(fim) + 'px'; el.style.setProperty('--iv-fade', FADE + 'px');
    el.dataset.fx = fx;
    el.dataset.dir = L.ivdir || '';

    /* só refaz o conteúdo quando a receita muda (evita recomeçar a animação a cada desenho da tela) */
    const receita = [fx, L.ivn || '', L.ivsp || '', L.ivdir || '', L.ivc || '', L.ivi || '', parado() ? 'p' : ''].join('/');
    if (el.__receita === receita) return;
    el.__receita = receita;
    el.innerHTML = conteudo(fx, L);
  }

  function conteudo(fx, L) {
    if (parado()) return '';                       // respeita "reduzir movimento" do aparelho
    if (fx === 'brilho') return '<i class="iv-fx-br"></i>';
    if (fx === 'meu') {
      const f = window.MF_IV_DESENHO;
      if (typeof f === 'function') { try { return String(f() || ''); } catch (e) { console.warn('Desenho próprio', e); return ''; } }
      return '';                                   // ainda não há desenho: fica só a cor
    }
    if (fx !== 'meteoros') return '';
    const n = Math.max(5, Math.min(60, +L.ivn || 25));
    const dur = VEL[L.ivsp] ?? VEL[''];
    let h = '';
    for (let i = 0; i < n; i++) {
      const esq = 10 + (i * 83 % 145);             // espalha sem repetir o mesmo lugar (entra pela direita, sai pela esquerda)
      const atraso = (i * 0.37 % dur).toFixed(2);
      const tempo = (dur * (0.7 + (i % 5) * 0.15)).toFixed(2);
      const risco = 40 + (i % 4) * 18;
      h += `<i class="iv-mt" style="left:${esq}%;animation-delay:${atraso}s;animation-duration:${tempo}s;--mw:${risco}px"></i>`;
    }
    return h;
  }

  /* refaz a camada depois de cada desenho da tela e quando a janela muda de tamanho */
  const refazer = () => { try { montar(); } catch (e) { console.warn('Fundo de Investimentos', e); } };
  (window.__mfAD = window.__mfAD || []).push(refazer);
  addEventListener('resize', refazer);

  /* prévia ao vivo: mexer numa opção do Editar bloco passa por mfLkApply, que não redesenha a tela */
  const _apply = window.mfLkApply;
  if (typeof _apply === 'function') window.mfLkApply = function () { const r = _apply.apply(this, arguments); refazer(); return r; };

  /* ---------- aba "Animação" no Editar bloco (só deste bloco, só no celular) ---------- */
  const daqui = w => w && w.__id && BLOCOS.some(b => w.__id === b || (typeof mfBase === 'function' && mfBase(w.__id) === b)) && !desk();

  const _open = window.mfLkOpen;
  if (typeof _open === 'function') window.mfLkOpen = function (id, tb) {
    _open.call(this, id, tb);
    const w = document.getElementById('mf-lk');
    if (!daqui(w)) return;
    const tabs = w.querySelector('.lk-tabs');
    if (!tabs || tabs.querySelector('[data-lktab="anim"]')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.lktab = 'anim'; b.textContent = 'Animação';
    tabs.insertBefore(b, tabs.children[1] || null);
    if (w.__tab === 'anim') mfLkRender();
  };

  const _render = window.mfLkRender;
  if (typeof _render === 'function') window.mfLkRender = function () {
    const w = document.getElementById('mf-lk');
    if (!daqui(w) || w.__tab !== 'anim') return _render.call(this);
    w.querySelectorAll('.lk-tabs button').forEach(b => b.classList.toggle('on', b.dataset.lktab === 'anim'));
    const body = w.querySelector('.lk-body'); if (!body) return;
    const L = cfg(), fx = efeitoDe(L), st = body.scrollTop;
    let h = '<p class="lk-tip">O fundo do topo desta tela: vale do alto até os botões das subabas. Muda na hora, aqui em cima.</p>';
    h += mfLkRow('O que aparece no fundo', 'ivfx', EFEITOS, L.ivfx === undefined ? 'meteoros' : (L.ivfx || 'nenhum'), 'l');
    if (fx === 'meteoros') {
      h += mfLkRow('Quantidade', 'ivn', [['10', 'Poucos'], ['25', 'Normal'], ['40', 'Muitos'], ['60', 'Cheio']], String(L.ivn || 25), 'l')
        + mfLkRow('Velocidade', 'ivsp', [['l', 'Lenta'], ['', 'Média'], ['r', 'Rápida']], L.ivsp || '', 'l')
        + mfLkRow('Direção', 'ivdir', [['', '↙ Para a esquerda'], ['d', '↘ Para a direita']], L.ivdir || '', 'l');
    }
    if (fx === 'meu') {
      h += `<p class="lk-tip">${typeof window.MF_IV_DESENHO === 'function' ? 'Desenho próprio ligado.' : 'Ainda não há desenho aqui. Por enquanto fica só a cor do fundo; quando o desenho ficar pronto ele entra neste lugar.'}</p>`;
    }
    h += mfLkSwatch('Cor do fundo', 'ivc', CORES, L.ivc)
      + mfLkRow('Intensidade', 'ivi', [['f', 'Fraca'], ['m', 'Média'], ['', 'Forte']], L.ivi || '', 'l');
    if (parado()) h += '<p class="lk-tip">O aparelho está com "reduzir movimento" ligado: o fundo fica parado, só com a cor.</p>';
    h += `<div class="lk-foot"><button type="button" data-lk="a|reset|">Restaurar este bloco</button></div>`;
    body.innerHTML = h; body.scrollTop = st;
  };
})();
