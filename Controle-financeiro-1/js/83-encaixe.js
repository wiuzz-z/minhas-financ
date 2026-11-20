/* Encaixe sem buracos (2.2) — só no celular.
   Os blocos de meia largura ficam em grupos de duas colunas (<div class="g2"> montado por lay(), js/10).
   Uma grade comum alinha por linha: a linha fica com a altura do bloco mais alto e sobra um buraco ao lado do menor.
   Aqui cada grupo vira um "tijolinho": linhas de 1 px e cada bloco ocupa tantas linhas quanto a própria altura + o espaço
   entre blocos; com grid-auto-flow:dense cada bloco sobe até encostar no de cima, na coluna mais curta
   (ou na coluna que o usuário escolheu ao arrastar: S.lay.cl[id] = 'a' esquerda · 'b' direita).
   Blocos vizinhos com alturas quase iguais (até 16 px) ficam nivelados, para pares parecidos não ficarem "em escada".
   Grupos só de cartões "c_" (indicadores do Dashboard), grupos com bloco de largura inteira e grades que não são de blocos
   ficam como estavam. A ordem dos elementos na página não muda. O computador não passa por aqui. */
(function () {
 'use strict';
 if (typeof MF_DEV_K !== 'undefined' && !MF_DEV_K.includes('cl')) MF_DEV_K.push('cl');
 const NIVEL = 16;
 const mob = () => !(window.mfIsDesk && mfIsDesk());
 const espaco = () => document.documentElement.getAttribute('data-mfdens') === 'c' ? 8 : 16;   // 16 = distância padrão entre cartões (2.8/3.0); Compacto continua 8
 const idDe = el => { const b = el.matches('[data-bk]') ? el : el.querySelector('[data-bk]'); return b ? String(b.dataset.bk).split('|')[1] || '' : ''; };
 const medido = new WeakMap();
 let ro = null, agendado = 0, rodando = false;

 function cheio(k) { return /grid-column:\s*1\s*\/\s*-1/.test(k.getAttribute('style') || '') && !k.dataset.mzc; }
 function serve(g) {
  if (g.classList.contains('mf-mz')) return true;
  if (g.closest('.filter-content,.mf-form,#mf-ed-sheet,#mf-ed-bs') || (g.parentElement && g.parentElement.closest('.g2'))) return false;
  const k = [...g.children];
  if (!k.length || k.some(x => !idDe(x) || cheio(x))) return false;
  if (!k.some(x => !idDe(x).startsWith('c_'))) return false;
  return getComputedStyle(g).display === 'grid';
 }

 function encaixa(g) {
  const G = espaco(), cl = ((S.lay || {}).cl) || {};
  g.classList.add('mf-mz'); g.style.setProperty('--mz-gap', G + 'px');
  const kids = [...g.children].filter(k => k.nodeType === 1);
  kids.forEach(k => {
   const c = k.dataset.mzc || cl[idDe(k)];
   k.style.gridColumn = c === 'a' ? '1' : c === 'b' ? '2' : '';
   if (k.dataset.mzmh) { k.style.minHeight = ''; delete k.dataset.mzmh; }
   k.style.gridRowEnd = '';
  });
  const hs = kids.map(k => k.getBoundingClientRect().height);
  kids.forEach((k, i) => { k.style.gridRowEnd = 'span ' + Math.max(1, Math.ceil(hs[i] + G)); });
  /* nivelar pares que começam na mesma altura, lado a lado */
  const rs = kids.map(k => k.getBoundingClientRect());
  for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
   if (Math.abs(rs[i].top - rs[j].top) > 1.5 || Math.abs(rs[i].left - rs[j].left) < 4) continue;
   const d = hs[i] - hs[j]; if (Math.abs(d) < .5 || Math.abs(d) > NIVEL) continue;
   const baixo = d < 0 ? i : j, alto = Math.max(hs[i], hs[j]);
   kids[baixo].style.minHeight = alto + 'px'; kids[baixo].dataset.mzmh = '1';
   kids[baixo].style.gridRowEnd = 'span ' + Math.ceil(alto + G);
  }
  kids.forEach(k => { medido.set(k, k.getBoundingClientRect().height); if (ro) ro.observe(k); });
  medido.set(g, g.clientWidth); if (ro) ro.observe(g);
 }

 function mfEncaixe() {
  if (rodando) return;
  rodando = true;
  try {
   if (ro) ro.disconnect();
   const app = document.getElementById('app');
   if (!app || !mob() || (typeof org !== 'undefined' && org)) return;
   app.querySelectorAll('.g2').forEach(g => { if (serve(g)) encaixa(g); });
  } catch (e) { console.warn('Encaixe', e); }
  finally { rodando = false; }
 }
 window.mfEncaixe = mfEncaixe;

 /* conteúdo que muda de altura depois do desenho (abrir/fechar o "⌄", dados chegando, fonte carregando) */
 if (typeof ResizeObserver === 'function') ro = new ResizeObserver(ents => {
  if (rodando) return;
  const mudou = ents.some(en => {
   const el = en.target, v = el.classList.contains('g2') ? el.clientWidth : el.getBoundingClientRect().height, a = medido.get(el);
   return a === undefined || Math.abs(a - v) > .5;
  });
  if (!mudou || agendado) return;
  agendado = requestAnimationFrame(() => { agendado = 0; if (!document.documentElement.classList.contains('mf-ed-arrasta')) mfEncaixe(); });
 });

 (window.__mfAD = window.__mfAD || []).push(mfEncaixe);
 document.addEventListener('DOMContentLoaded', () => { try { mfEncaixe(); } catch (e) { } });
})();
