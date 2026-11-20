/* Valor com pontuação enquanto digita (1.18).
   Nos campos de dinheiro, o milhar ganha ponto e a vírgula separa os centavos à medida que a pessoa digita:
   "1900" → "1.900", "1900,5" → "1.900,5", "1234567,89" → "1.234.567,89".
   - Não completa centavos sozinho e não muda o valor: quem lê o campo (ev, mfNum, plNum) entende "1.900,50".
   - O ponto digitado (teclado numérico do Android) vira vírgula quando ainda não há vírgula.
   - Conta no campo de lançamento ("100+50") fica como está: com sinal de conta, o campo não é formatado.
   - Só os campos de dinheiro da lista abaixo; quantidade de cotas, percentuais e campos type="number" ficam de fora. */
(function () {
 'use strict';
 const CAMPOS = [
  '#fv', '#qac-v', '#tx-edit-value',                 // lançamento: novo, rápido e edição
  'input[name="v"][inputmode="decimal"]',            // transferência e preço na compra de ativo
  '[data-accf="ini"]',                               // saldo inicial da conta
  '[data-cbpayv]', '[data-ccpayv]',                  // pagar fatura
  '#fx-v', '#fx-ev',                                 // contas fixas
  '[data-ccf="lim"]',                                // limite do cartão
  '[data-obf][data-k="v"]',                          // contas fixas do primeiro acesso
  '[data-provmeta]', '[data-dvsim="aporte"]', '[data-pvsim="ap"]', '[data-shprice]'
 ].join(',');
 const ehCampo = el => !!(el && el.matches && el.type !== 'number' && el.matches(CAMPOS));
 const temConta = v => /[+*/]/.test(v) || /.-/.test(v);
 const milhar = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

 /* devolve o texto formatado a partir do texto digitado */
 function formata(v) {
  const neg = /^\s*-/.test(v), i = v.indexOf(',');
  let int = (i < 0 ? v : v.slice(0, i)).replace(/\D/g, ''), dec = i < 0 ? null : v.slice(i + 1).replace(/\D/g, '').slice(0, 2);
  int = int.replace(/^0+(?=\d)/, '');
  if (!int && dec !== null) int = '0';
  return (neg ? '-' : '') + milhar(int) + (dec !== null ? ',' + dec : '');
 }
 window.mfValorFmt = formata;

 document.addEventListener('input', e => {
  const el = e.target; if (!ehCampo(el)) return;
  let v = el.value, pos = el.selectionStart == null ? v.length : el.selectionStart;
  if (temConta(v)) return;
  /* ponto digitado como decimal: vira vírgula */
  if (e.data === '.' && pos > 0 && v[pos - 1] === '.' && v.indexOf(',') < 0) v = v.slice(0, pos - 1) + ',' + v.slice(pos);
  /* quantos dígitos (e vírgula) ficam antes do cursor: o cursor volta para o mesmo ponto depois de formatar */
  const antes = v.slice(0, pos).replace(/[^\d,]/g, '').length;
  const novo = formata(v);
  if (novo === el.value) return;
  el.value = novo;
  let n = 0, p = 0;
  while (p < novo.length && n < antes) { if (/[\d,]/.test(novo[p])) n++; p++; }
  if (novo[0] === '0' && /^0,/.test(novo) && !/^0/.test(v.replace(/^-/, ''))) p++; // ",5" → "0,5"
  try { if (document.activeElement === el) el.setSelectionRange(p, p); } catch (_) { }
 }, true);

 /* ao desenhar a tela, um valor que já vem preenchido (editar um lançamento: "1900,5") aparece formatado */
 function arruma() {
  document.querySelectorAll(CAMPOS).forEach(el => {
   if (el.type === 'number' || document.activeElement === el) return;
   const v = el.value; if (!/^-?\d+(,\d+)?$/.test(v)) return;
   const f = formata(v); if (f !== v) el.value = f;
  });
 }
 if (window.__mfAD) window.__mfAD.push(arruma);
 document.addEventListener('DOMContentLoaded', arruma);
})();
