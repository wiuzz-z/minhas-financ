/* Domínio · Investimentos: custo, valor atual, ganho, carteira e vendas (IR) (1.30 · Fase 4)
   Funções de cálculo movidas SEM alteração de texto (provado por comparação do código de cada função antes/depois).
   Leem o estado global (S, TD…) só na hora da chamada; não mexem na tela. Teste: testes/casos/26-caracterizacao-calculos-130.js */
function mfCdbRes(a){return (a&&Array.isArray(a.cdbResgates)?a.cdbResgates:[]).reduce((s,x)=>s+(+x.v||0),0)}
function isCdbAsset(a){return !!a&&!!a.f&&(String(a.cdbType||'').toUpperCase()==='CDB'||/\bCDB\b/i.test(String(a.a||'')))}
function ensureCdbData(a){if(!isCdbAsset(a))return a;const today=TD||(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})();if(a.cdbPercent===undefined){const m=String(a.a||'').match(/(120|118|100)\s*%/i);a.cdbPercent=m?Number(m[1]):100}if(!a.cdbDate)a.cdbDate=today;if(a.cdbPrincipal===undefined)a.cdbPrincipal=Math.max(0,+a.p||0);if(!Array.isArray(a.cdbAportes))a.cdbAportes=[];return a}
function invValue(a){if(a&&a.f&&isCdbAsset(a)){ensureCdbData(a);const pct=Math.max(0,+a.cdbPercent||0),rate=Math.max(0,+((S.cxc&&S.cxc.cdi)||0))/100,daily=Math.pow(1+rate,1/252)-1,grow=(v,d)=>{const days=Math.max(0,(Date.now()-new Date(String(d||todayISO())+'T12:00:00').getTime())/86400000),businessDays=Math.round(days*252/365);return Math.max(0,+v||0)*Math.pow(1+daily*pct/100,businessDays)};return Math.max(0,grow(a.cdbPrincipal,a.cdbDate)+(a.cdbAportes||[]).reduce((sum,x)=>sum+grow(x.v,x.d),0)-(a.cdbResgates||[]).reduce((sum,x)=>sum+grow(x.v,x.d),0))}return a&&a.f?(+a.p||0):(+a.q||0)*(+a.p||0)}
function ivQuote(a){const q=S.quotes&&S.quotes[String(a.a||'').toUpperCase()];return q&&Number(q.price)>0?Number(q.price):0}
function ivCost(a){if(a.f){if(isCdbAsset(a)){const c=(+a.cdbPrincipal||0)+(a.cdbAportes||[]).reduce((z,x)=>z+(+x.v||0),0)-mfCdbRes(a);return c>0?c:(+a.p||0)}return +a.p||0}return (+a.q||0)*(+a.p||0)}
function ivNow(a){if(a.f)return isCdbAsset(a)?invValue(a):(+a.p||0);const q=ivQuote(a);return q?q*(+a.q||0):ivCost(a)}
function ivHasGain(a){return a.f?isCdbAsset(a)&&ivCost(a)>0:ivQuote(a)>0&&(+a.p||0)>0}
function ivGain(a){return ivHasGain(a)?ivNow(a)-ivCost(a):null}
function ivPct(a){const g=ivGain(a),c=ivCost(a);return g==null||!(c>0)?null:g/c*100}
function mfHeld(){return (S.inv||[]).filter(a=>!a.f&&(+a.q||0)>0).map(a=>({a,tk:String(a.a).toUpperCase(),q:+a.q||0,p:ivQuote(a),cls:fcl(a)}))}
function mfVendas(){return Array.isArray(S.vendas)?S.vendas:(S.vendas=[])}
function mfVendaCls(tk){const a=(S.inv||[]).find(x=>!x.f&&String(x.a).toUpperCase()===tk);const c=a?fcl(a):'';return c==='fii'||(!c&&/11$/.test(tk))?'fii':c==='etf'?'etf':'acao'}
/* imposto estimado por mês: ações isentas até R$ 20 mil vendidos no mês (15% sobre o lucro acima disso); FII 20%; ETF 15% */
function mfVendaIR(k){const L=mfVendas().filter(x=>x.d.slice(0,7)===k),soma=c=>L.filter(x=>x.cls===c),tot=c=>soma(c).reduce((s,x)=>s+x.v,0),luc=c=>soma(c).reduce((s,x)=>s+x.lucro,0);
 const ac=tot('acao')<=20000?0:Math.max(0,luc('acao'))*0.15,fi=Math.max(0,luc('fii'))*0.2,et=Math.max(0,luc('etf'))*0.15;return {ac,fi,et,tot:ac+fi+et,vendAcoes:tot('acao')}}

/* ===== Script 1 · Módulo 20 · Análise fundamentalista (Graham e Bazin) =====
   Só calcula com o que o app realmente tem: o preço vem do Yahoo (S.quotes, mesma fonte do resto do app)
   e os proventos por cota saem de mfIvEvents() (automáticos do Dados B3 + os lançados à mão), já pagos.
   LPA e VPA não vêm de nenhuma fonte do app: o usuário informa por ativo. Faltando um dado, o cálculo
   NÃO é feito e a tela diz o que falta — nenhum indicador é inventado. Premissas em S.fund. */
var MF_FUND_DY = 6, MF_FUND_ANOS = 5;
function mfFundPrem() {
 const f = S.fund = (S.fund && typeof S.fund === 'object' && !Array.isArray(S.fund)) ? S.fund : {};
 if (!(+f.dy > 0)) f.dy = MF_FUND_DY;
 if (!(+f.anos > 0)) f.anos = MF_FUND_ANOS;
 if (!f.at || typeof f.at !== 'object') f.at = {};
 f.dy = Math.min(30, Math.max(0.5, Math.round(+f.dy * 100) / 100));
 f.anos = Math.min(10, Math.max(1, Math.round(+f.anos)));
 return f;
}
/* LPA/VPA: o que o usuário digitou (manual) vale mais; sem isso, vale o que veio automático da função "fundamentos" (Dados B3/CVM) */
function mfFundManual(tk) { const a = mfFundPrem().at[String(tk || '').toUpperCase()] || {}; return { lpa: +a.lpa || 0, vpa: +a.vpa || 0 }; }
function mfFundAtivo(tk) {
 const T = String(tk || '').toUpperCase(), m = mfFundManual(T), au = (typeof mfFundAuto === 'function' ? mfFundAuto(T) : null) || {};
 return { lpa: m.lpa > 0 ? m.lpa : (+au.lpa > 0 ? +au.lpa : 0), vpa: m.vpa > 0 ? m.vpa : (+au.vpa > 0 ? +au.vpa : 0) };
}
function mfFundPreco(tk) { const q = (S.quotes || {})[String(tk || '').toUpperCase()]; return q && +q.price > 0 ? +q.price : 0; }
/* proventos por cota que o PRÓPRIO ATIVO pagou, por ano (dado de mercado: Dados B3; Yahoo Finance nos FIIs e como reserva).
   NÃO é o que o usuário recebeu: vem da função "fundamentos" (completo:true) e fica guardado no aparelho (mfProvMercadoLoad, js/70). */
function mfFundProvMercado(tk) { const c = mfProvMercadoCache(), d = c && c.d[String(tk || '').toUpperCase()]; return d && d.proventos ? d : null; }
/* Bazin: preço teto = provento médio por cota que o ativo pagou nos últimos <anos> anos (o ano corrente entra) ÷ rendimento desejado */
function mfBazin(tk, dy, anos) {
 const P = mfFundPrem(), T = String(tk || '').toUpperCase(), y = Math.min(30, Math.max(0.5, +dy || P.dy)), n = Math.max(1, +anos || P.anos), m = mfFundProvMercado(T), px = mfFundPreco(T);
 const f = mfBazinFrom(m ? m.proventos : {}, px, y, n);
 const falta = []; if (!f.ok) falta.push('proventos'); if (!(px > 0)) falta.push('preço');
 const prov = { tk: T, anos: n, serie: f.serie, media: f.media, comProv: f.serie.filter(x => x.v > 0).length, fonte: m ? (m.fonte_prov || '') : '' };
 if (!f.ok) return { tk: T, dy: y, px: px || null, media: 0, teto: null, margem: null, prov, falta, ok: false };
 return { tk: T, dy: y, px: f.px, media: f.media, teto: f.teto, margem: f.margem, dyAtual: f.dyAtual, prov, falta, ok: !falta.length };
}
/* Graham: valor intrínseco = √(22,5 × LPA × VPA) */
function mfGraham(tk) {
 const T = String(tk || '').toUpperCase(), a = mfFundAtivo(T), px = mfFundPreco(T), r2 = v => Math.round(v * 100) / 100;
 const falta = []; if (!(a.lpa > 0)) falta.push('LPA'); if (!(a.vpa > 0)) falta.push('VPA'); if (!(px > 0)) falta.push('preço');
 if (!(a.lpa > 0) || !(a.vpa > 0)) return { tk: T, lpa: a.lpa, vpa: a.vpa, px: px ? r2(px) : null, justo: null, margem: null, falta, ok: false };
 const justo = r2(Math.sqrt(22.5 * a.lpa * a.vpa));
 const margem = px > 0 ? Math.round((justo - px) / justo * 1000) / 10 : null;
 return { tk: T, lpa: a.lpa, vpa: a.vpa, px: px ? r2(px) : null, justo, margem, falta, ok: !falta.length };
}
/* Versões "puras" (sem ler a carteira) para o simulador: mesmas contas de mfGraham e mfBazin, com os dados informados.
   serie = { 'AAAA': provento por cota no ano }; usa os últimos <anos> anos (o ano corrente entra, igual ao mfBazin dos Meus ativos, que chama esta conta). */
function mfGrahamFrom(lpa, vpa, px) {
 const r2 = v => Math.round(v * 100) / 100, falta = [];
 if (!(+lpa > 0)) falta.push('LPA'); if (!(+vpa > 0)) falta.push('VPA');
 if (falta.length) return { lpa: +lpa || 0, vpa: +vpa || 0, px: +px > 0 ? r2(+px) : null, justo: null, margem: null, falta, ok: false };
 const justo = r2(Math.sqrt(22.5 * +lpa * +vpa)), margem = +px > 0 ? Math.round((justo - +px) / justo * 1000) / 10 : null;
 return { lpa: +lpa, vpa: +vpa, px: +px > 0 ? r2(+px) : null, justo, margem, falta, ok: true };
}
function mfBazinFrom(serie, px, dy, anos) {
 const y = Math.min(30, Math.max(0.5, +dy || MF_FUND_DY)), n = Math.max(1, +anos || MF_FUND_ANOS), r2 = v => Math.round(v * 100) / 100, cur = +TD.slice(0, 4);
 const L = []; for (let a = cur - n + 1; a <= cur; a++) L.push({ y: String(a), v: Math.round(((serie || {})[a] || 0) * 1e6) / 1e6 });
 const tem = L.some(x => x.v > 0), media = tem ? Math.round(L.reduce((t, x) => t + x.v, 0) / L.length * 1e6) / 1e6 : 0;
 if (!(media > 0)) return { dy: y, px: +px > 0 ? r2(+px) : null, media: 0, teto: null, margem: null, serie: L, anos: n, falta: ['proventos'], ok: false };
 const teto = r2(media / (y / 100)), margem = +px > 0 ? Math.round((teto - +px) / teto * 1000) / 10 : null;
 return { dy: y, px: +px > 0 ? r2(+px) : null, media: Math.round(media * 1e4) / 1e4, teto, margem, dyAtual: +px > 0 ? Math.round(media / +px * 1000) / 10 : null, serie: L, anos: n, falta: [], ok: true };
}
/* um por ativo da carteira, para o comparativo (cada método com a sua própria conta) */
function mfFundTodos() { return mfHeld().map(h => ({ tk: h.tk, cls: h.cls, q: h.q, graham: mfGraham(h.tk), bazin: mfBazin(h.tk) })); }
