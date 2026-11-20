/* ===== Patrimônio › Resumo e Patrimônio (bens): cálculos puros =====
   Só contas: não lê nem grava S. A tela (js/46) passa a lista de bens, o total investido e o total das dívidas. */

/* [chave, nome do grupo, nome de um] */
var MF_BEM_TIPOS = [['imovel', 'Imóveis', 'Imóvel'], ['veiculo', 'Veículos', 'Veículo'], ['outro', 'Outros', 'Outro']];

/* um bem cadastrado, com os números arrumados (valor nunca negativo, tipo conhecido) */
function mfBemNorm(b) {
  b = b || {};
  return {
    id: String(b.id || ''), n: String(b.n || '').trim() || 'Bem',
    tipo: MF_BEM_TIPOS.some(x => x[0] === b.tipo) ? b.tipo : 'outro',
    v: Math.max(0, Math.round((+b.v || 0) * 100) / 100), at: String(b.at || '')
  };
}

/* total dos bens e o total de cada tipo (na ordem Imóveis, Veículos, Outros; tipos sem bem ficam de fora) */
function mfBensResumo(lista) {
  const L = (Array.isArray(lista) ? lista : []).map(mfBemNorm);
  const tipos = MF_BEM_TIPOS.map(([k, nome]) => {
    const itens = L.filter(b => b.tipo === k);
    return { k, nome, itens, total: Math.round(itens.reduce((s, b) => s + b.v, 0) * 100) / 100 };
  }).filter(t => t.itens.length);
  return { total: Math.round(L.reduce((s, b) => s + b.v, 0) * 100) / 100, n: L.length, tipos };
}

/* patrimônio líquido = bens + investimentos − dívidas; e quanto bens e investimentos pesam no que você tem */
function mfPatLiq(bens, inv, div) {
  const b = Math.max(0, +bens || 0), i = Math.max(0, +inv || 0), d = Math.max(0, +div || 0), tem = b + i;
  return {
    bens: b, inv: i, div: d, tem,
    liq: Math.round((tem - d) * 100) / 100,
    pBens: tem > 0 ? Math.round(b / tem * 100) : 0,
    pInv: tem > 0 ? 100 - Math.round(b / tem * 100) : 0
  };
}
