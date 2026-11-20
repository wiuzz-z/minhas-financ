/* ===== Planejamento › Dívidas e Simular (cálculos puros) =====
   Só contas: não lê nem grava S, lançamentos, saldo ou cartão. A tela (js/45) chama estas funções
   e passa de fora o que depende do app (data de hoje, vencimento da fatura). */

/* data ISO + n meses, com o dia limitado ao último dia do mês (31/01 + 1 = 28 ou 29/02) */
function mfPlMesMais(iso, n) {
  const a = String(iso).split('-').map(Number), x = new Date(a[0], a[1] - 1 + n, 1), last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(Math.min(a[2] || 1, last)).padStart(2, '0');
}

/* uma dívida cadastrada, com os números arrumados (nada negativo, parcelas inteiras, dia de 1 a 31) */
function mfDivNorm(d) {
  d = d || {};
  const n2 = v => Math.max(0, Math.round((+v || 0) * 100) / 100);
  return {
    id: String(d.id || ''), n: String(d.n || '').trim() || 'Dívida', cred: String(d.cred || '').trim(),
    saldo: n2(d.saldo), parc: n2(d.parc), rest: Math.max(0, Math.round(+d.rest || 0)),
    dia: Math.min(31, Math.max(1, Math.round(+d.dia || 1))), q: !!d.q
  };
}

/* próxima parcela e mês da última, a partir de hoje (td = 'AAAA-MM-DD'):
   se o dia do vencimento ainda não passou neste mês, a próxima é neste mês; senão, no mês seguinte */
function mfDivDatas(d, td) {
  d = mfDivNorm(d);
  if (d.q || d.rest < 1) return { prox: '', fim: '' };
  const [y, m, dd] = td.split('-').map(Number), base = y + '-' + String(m).padStart(2, '0') + '-' + String(d.dia).padStart(2, '0');
  const esteMes = mfPlMesMais(base, 0), prox = d.dia >= dd && esteMes >= td ? esteMes : mfPlMesMais(base, 1);
  return { prox, fim: mfPlMesMais(prox, d.rest - 1).slice(0, 7) };
}

/* resumo das dívidas em aberto: quanto ainda devo, quanto sai por mês e quantas estão em aberto */
function mfDivResumo(lista, td) {
  const ab = (Array.isArray(lista) ? lista : []).map(mfDivNorm).filter(d => !d.q);
  return {
    total: Math.round(ab.reduce((s, d) => s + d.saldo, 0) * 100) / 100,
    mensal: Math.round(ab.filter(d => d.rest > 0).reduce((s, d) => s + d.parc, 0) * 100) / 100,
    n: ab.length,
    itens: ab.map(d => Object.assign(d, mfDivDatas(d, td)))
  };
}

/* "se eu comprar R$ v em n parcelas": divide em centavos como o app faz ao lançar compra parcelada
   (a última parcela leva a sobra) e diz em que fatura cai cada parcela. venc(data) = vencimento da fatura dessa data. */
function mfSimCompra(v, n, data, venc) {
  const tot = Math.round((+v || 0) * 100), q = Math.max(1, Math.min(48, Math.round(+n || 1)));
  if (!(tot > 0)) return [];
  const base = Math.floor(tot / q), out = [];
  for (let i = 0; i < q; i++) {
    const c = i === q - 1 ? tot - base * (q - 1) : base, d = mfPlMesMais(data, i), due = venc ? venc(d) : d;
    out.push({ i: i + 1, d, due, k: String(due).slice(0, 7), v: c / 100 });
  }
  return out;
}
