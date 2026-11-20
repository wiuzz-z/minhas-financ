/* Contas › Diário (1.15) — simulador: "se eu gastar R$ X por dia, quanto sobra até tal dia?"
   É só uma conta de cabeça: NÃO lê nem grava lançamentos, saldo, cartão ou recorrentes.
   Os números digitados ficam só neste aparelho (localStorage 'fin1_diasim'). */
(function () {
 'use strict';
 const KEY = 'fin1_diasim', MAX_DIAS = 120;
 const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
 const dt = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
 const hoje = () => (typeof TD === 'string' && TD) || iso(new Date());
 const mesQue = () => { const d = dt(hoje()), n = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()); if (n.getMonth() !== (d.getMonth() + 1) % 12) n.setDate(0); return iso(n); };
 const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
 const num = v => { let s = String(v == null ? '' : v).trim().replace(/[^\d,.\-]/g, ''); if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); const n = parseFloat(s); return isFinite(n) ? n : 0; };
 const padrao = () => ({ saldo: '', dia: '30', venc: mesQue() });
 let st = null;
 function carrega() {
  if (st) return st;
  st = padrao();
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o === 'object') Object.keys(st).forEach(k => { if (typeof o[k] === 'string') st[k] = o[k]; }); } catch (_) { }
  if (st.venc < hoje()) st.venc = mesQue();
  return st;
 }
 function guarda() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) { } }
 /* a conta: gasta o valor do dia em cada dia, de hoje até o dia escolhido (os dois entram) */
 function calcula() {
  const s = carrega(), saldo = num(s.saldo), dia = Math.max(0, num(s.dia)), ini = hoje(), fim = s.venc;
  if (!fim || fim < ini) return { erro: 'Escolha um dia a partir de hoje.' };
  const a = dt(ini), n = Math.round((dt(fim) - a) / 864e5) + 1;
  if (n > MAX_DIAS) return { erro: 'Escolha um dia em até ' + MAX_DIAS + ' dias.' };
  const linhas = []; let cur = saldo;
  for (let i = 0; i < n; i++) { cur -= dia; linhas.push({ d: iso(new Date(a.getFullYear(), a.getMonth(), a.getDate() + i)), gasto: dia, saldo: cur, v: i === n - 1 }); }
  const max = Math.max(0, Math.floor(saldo / n * 100) / 100), falha = linhas.find(l => l.saldo < -0.005);
  return { n, linhas, sobra: cur, max, dia, fim, falha, ok: cur >= -0.005 };
 }
 function saidaHtml() {
  const c = calcula();
  if (c.erro) return `<p class="dsim-erro">${escH(c.erro)}</p>`;
  const dias = c.n + ' dia' + (c.n === 1 ? '' : 's');
  const topo = c.ok
   ? `<div class="dsim-res ok"><small>Dá para chegar até ${mfDmy(c.fim)}</small><b>Sobram ${R(c.sobra)}</b><span>gastando ${R(c.dia)} por dia durante ${dias}.</span></div>`
   : `<div class="dsim-res ruim"><small>O dinheiro não chega até ${mfDmy(c.fim)}</small><b>Faltam ${R(-c.sobra)}</b><span>${c.falha ? 'Acaba em ' + mfDmy(c.falha.d) + '. ' : ''}Para chegar até lá, gaste no máximo ${R(c.max)} por dia.</span></div>`;
  const rows = c.linhas.map(l => {
   const dd = dt(l.d), neg = l.saldo < -0.005;
   return `<div class="dsim-li${l.v ? ' v' : ''}${neg ? ' neg' : ''}"><span class="dsim-d"><b>${String(dd.getDate()).padStart(2, '0')}/${String(dd.getMonth() + 1).padStart(2, '0')}</b><small>${SEMANA[dd.getDay()]}</small></span><span class="dsim-n">${l.gasto ? '−' + R(l.gasto) : '—'}</span><span class="dsim-s">${R(l.saldo)}</span></div>`;
  }).join('');
  return topo + `<div class="dsim-lb">Dia a dia</div><div class="dsim-lista">${rows}</div>`;
 }
 /* no computador o simulador ocupa a largura toda (como os blocos largos do app) */
 try { if (typeof MF_DWIDE !== 'undefined' && !MF_DWIDE.includes('p_dsim')) MF_DWIDE.push('p_dsim'); } catch (_) { }
 const miolo = campo => `<p class="dsim-nt">Simulador: nada daqui entra nos seus lançamentos nem no saldo. Veja quanto sobra gastando um valor fixo por dia.</p>
  <div class="dsim-g">${campo('saldo', 'Quanto tenho hoje', '0,00')}${campo('dia', 'Quero gastar por dia', '30,00')}${campo('venc', 'Até o dia', '', 'date')}</div>
  <div class="dsim-out" id="dsim-out">${saidaHtml()}</div>
  <button type="button" class="dsim-rs" data-dsimreset="1">Limpar simulação</button>`;
 window.mfDiarioSimHtml = function () {
  const s = carrega(), campo = (k, t, ph, tp) => `<label class="dsim-f"><small>${t}</small><input type="${tp || 'text'}" ${tp === 'date' ? '' : 'inputmode="decimal" '}data-dsim="${k}" value="${escH(s[k])}" placeholder="${ph || ''}" autocomplete="off"></label>`;
  return B('p_dsim') + `<section class="c mf-dsim"><h2>Diário</h2>${miolo(campo)}</section>`;
 };
 /* 2.9: o mesmo simulador como bloco "Simular gastos diário" (catálogo de blocos, js/84: qualquer tela) */
 window.mfDiarioSimMiolo = function () {
  const s = carrega(), campo = (k, t, ph, tp) => `<label class="dsim-f"><small>${t}</small><input type="${tp || 'text'}" ${tp === 'date' ? '' : 'inputmode="decimal" '}data-dsim="${k}" value="${escH(s[k] || '')}" placeholder="${ph}"></label>`;
  return `<div class="mf-dsim mf-dsim-wg">${miolo(campo)}</div>`;
 };
 document.addEventListener('input', e => {
  const i = e.target.closest && e.target.closest('[data-dsim]'); if (!i) return;
  carrega(); st[i.dataset.dsim] = i.value; guarda();
  const o = document.getElementById('dsim-out'); if (o) o.innerHTML = saidaHtml();
 }, true);
 document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-dsimreset]'); if (!b) return;
  e.preventDefault(); e.stopPropagation(); st = padrao(); guarda();
  document.querySelectorAll('[data-dsim]').forEach(i => { i.value = st[i.dataset.dsim]; });
  const o = document.getElementById('dsim-out'); if (o) o.innerHTML = saidaHtml();
 }, true);
})();
