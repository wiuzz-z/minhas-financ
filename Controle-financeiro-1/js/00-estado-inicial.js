

const _storage = (function(){
  try {
    const k = '__fin_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return localStorage;
  } catch(e) {
    const mem = {};
    return {
      getItem: k => mem[k] ?? null,
      setItem: (k,v) => { mem[k] = String(v); },
      removeItem: k => { delete mem[k]; }
    };
  }
})();

const SEED={"tx":[],"inv":[{"a":"AXIA3","q":105,"p":52.07,"d":0,"k":"Crescimento"},{"a":"BBSE3","q":130,"p":34.94,"d":257,"k":"Dividendos"},{"a":"BRBI11","q":165,"p":14.17,"d":0,"k":"Crescimento"},{"a":"CXSE3","q":130,"p":14.16,"d":0,"k":"Dividendos"},{"a":"BBAS3","q":100,"p":26,"d":0,"k":"Dividendos"},{"a":"TAEE4","q":100,"p":11.93,"d":0,"k":"Seguro"},{"a":"ISAE4","q":50,"p":23.87,"d":0,"k":"Seguro"},{"a":"ITUB3","q":0,"p":0,"d":0,"k":"Dividendos"},{"a":"GGRC11","q":609,"p":10.28,"d":0,"k":"Dividendos"},{"a":"KNSC11","q":0,"p":0,"d":0,"k":"Dividendos"},{"a":"GPCA11","q":58,"p":25.81,"d":0,"k":"Seguro"},{"a":"IVVB11","q":0,"p":0,"d":0,"k":"Crescimento"},{"a":"CDB 118%","q":0,"p":1025,"d":0,"k":"Seguro","f":1},{"a":"TESOURO+","q":0,"p":100,"d":0,"k":"Seguro","f":1},{"a":"CDB","q":0,"p":2450,"d":0,"k":"Seguro","f":1},{"a":"RESERVA OP","q":0,"p":0,"d":0,"k":"Seguro","f":1},{"a":"RESERVA EM","q":0,"p":3900,"d":0,"k":"Seguro","f":1}],"rate":0.139,"orc":{"sal":"2029","metas":[{"n":"Essencial","v":"1150-39.99","m":0.55},{"n":"Investimento","v":"420","m":0.2},{"n":"Gasto pessoal","v":"500","m":0.25}],"contas":[{"n":"Mercado","v":"400/2","g":"Essencial","p":0},{"n":"Feira","v":"150/2","g":"Essencial","p":0},{"n":"Aluguel","v":"500","g":"Essencial","p":0},{"n":"Plano celular","v":"39.9","g":"Conta Fixa","p":0},{"n":"Internet casa","v":"100/2","g":"Conta Fixa","p":0},{"n":"Lazer","v":"400","g":"Lazer","p":0},{"n":"Investimento","v":"400","g":"Investimentos","p":0}]},"rop":{"ini":0,"meta":60,"m":[{"b":0,"c":0},{"b":0,"c":0},{"b":0,"c":0},{"b":0,"c":0},{"b":0,"c":0},{"b":0,"c":0},{"b":0,"c":0},{"b":0,"c":0},{"b":65,"c":322},{"b":2644.9,"c":644.9},{"b":100.9,"c":0},{"b":700,"c":0}]},"sim":{"w":3900,"j":7400,"custo":2200,"meses":6,"prazo":12},"ap":{"v":"400","l":[{"n":"Reserva","p":0.9},{"n":"Reserva de OP","p":0.05}]},"ver":6};
let CATS=['Moradia','Alimentação','Contas Fixas','Lazer e Pessoal','Investimento','Transporte','Saúde','Variáveis','Lazer'];const BASE_CATS=['Moradia','Alimentação','Contas Fixas','Lazer e Pessoal','Investimento','Transporte','Saúde','Variáveis','Lazer'];const SUBCATS=['Variáveis','Lazer','Moradia','Conta fixa','Investimentos','Alimentação','Pessoal','Assinatura'];const SUB_TO_LEGACY={'Variáveis':'Variáveis','Lazer':'Lazer','Moradia':'Moradia','Conta fixa':'Contas Fixas','Investimentos':'Investimento','Alimentação':'Alimentação','Pessoal':'Lazer e Pessoal','Assinatura':'Contas Fixas'};const LEGACY_TO_SUB={'Moradia':'Moradia','Alimentação':'Alimentação','Contas Fixas':'Conta fixa','Lazer e Pessoal':'Pessoal','Investimento':'Investimentos','Transporte':'Variáveis','Saúde':'Variáveis','Variáveis':'Variáveis','Lazer':'Lazer'};const inferSub=c=>LEGACY_TO_SUB[c]||'Pessoal';const inferMain=(c,s)=>{s=s||inferSub(c);if(s==='Dia a dia')s='Variáveis';if(s==='Investimentos'||c==='Investimento')return 'Investimentos';if(['Moradia','Alimentação','Conta fixa'].includes(s))return 'Essencial';return 'Não essencial'};const rule503020Group=(main)=>main==='Investimentos'?'20% · Investimentos':main==='Essencial'?'50% · Essencial':'30% · Não essencial';const ensureCategoryConfig=()=>{S.catConfig=S.catConfig&&typeof S.catConfig==='object'?S.catConfig:{};CATS=[...BASE_CATS];};const TIPOS=['Pix','Crédito','VR','Fatura','Reserva'];
const COL={'Moradia':'#6c8cff','Alimentação':'#2fbf8f','Contas Fixas':'#f5a623','Lazer e Pessoal':'#e86a92','Investimento':'#8a6cf0','Transporte':'#22b8cf','Saúde':'#4caf50','Variáveis':'#e879f9','Lazer':'#fb923c'};
const MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const R=n=>window.MF_PRIV?'R$ •••••':(+n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),P=n=>((+n||0)*100).toFixed(0)+'%';
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const TD=iso(new Date());
// Antes da autenticação, nunca carregar dados do navegador nem os dados de demonstração.
// Cada conta recebe seu próprio estado vazio quando ainda não possui dados na nuvem.
function emptyAccountState(){
 const x=JSON.parse(JSON.stringify(SEED));
 x.tx=[];x.inv=[];
 if(x.orc){x.orc.sal='';x.orc.metas=[];x.orc.contas=[];x.orc.grupos=[]}
 if(x.rop){x.rop.ini=0;x.rop.meta=0;x.rop.m=Array.from({length:12},()=>({b:0,c:0}))}
 if(x.sim){x.sim={w:0,j:0,custo:0,meses:0,prazo:0}}
 if(x.ap){x.ap={v:'0',l:[]}}
 x.goals=[];x.categoryBudgets={};x.subscriptions={};x.house=[];x.shopping=[];x.tasks=[];x.recurring=[];x.trash=[];x.closedMonths=[];x.fatv={};x.cx=[];x.invReview={};
 return x;
}
let S=emptyAccountState();try{const _u=_storage.getItem('fin1_uid'),_j=_storage.getItem('fin1');if(_u&&_j){const _o=JSON.parse(_j);if(_o&&typeof _o==='object'&&Array.isArray(_o.tx)){S=_o;window.__mfCachedUid=_u}}}catch(e){}
function mig3(){if((S.ver||0)<3){const t=S.tx.find(x=>x.id=='s137');if(t){t.v=2507.06;t.d='2026-11-10';t.e=''}S.fatv=Object.assign({'2026-10':2507.06},S.fatv||{});S.ver=3;save()}}
function mig6(){if((S.ver||0)<6){if(S.lay&&S.lay.o)delete S.lay.o.res;S.ver=6;save()}}
function mig5(){if((S.ver||0)<5){S.tx.forEach(t=>{if(t.c==='Receita')t.t=''});S.ver=5;save()}}
function mig4(){if((S.ver||0)<4){S.tx=S.tx.filter(t=>t.d<'2026-11-01');S.ver=4;save()}}
function mig(){if((S.ver||0)<SEED.ver){const ids=new Set(SEED.tx.map(t=>t.id));S.tx=S.tx.filter(t=>!ids.has(t.id)).concat(JSON.parse(JSON.stringify(SEED.tx)));S.ver=SEED.ver;save()}mig3()}
let tab='res',ym=TD.slice(0,7),yr=+TD.slice(0,4),F={c:'Lazer e Pessoal',g:'Não essencial',s:'Pessoal',showSubs:true,showPay:false,t:'Pix',installmentCount:1,id:null,search:'',from:'',to:'',cat:'',pay:'',kind:''},analysisYear=+TD.slice(0,4),dueFilter='todos',tm;
let supabaseClient=null,authUser=null,cloudChannel=null,cloudTimer=null,cloudBusy=false,cloudLast='';
/* Sync v2: versão do estado na nuvem (app_data.rev). null = desconhecida → usa o caminho antigo. */
let cloudRev=null,mfPushing=false,mfPushAgain=false;
/* 1.18: "1.900,50" (ponto de milhar, como o campo mostra enquanto digita) = 1900.5; "1.5" continua 1.5 */
const ev=s=>{s=String(s).replace(/\s/g,'').replace(/(?<![\d.])[1-9]\d{0,2}(?:\.\d{3})+(?![\d.])/g,m=>m.replace(/\./g,'')).replace(/,/g,'.');if(!/^[\d+\-*/().]+$/.test(s))return NaN;try{return +Function('return('+s+')')()}catch(e){return NaN}};
let dirty=false,lastJ='',sync='local';
let extendedSaveTimer=null,extendedBusy=false;
const readLayoutPreferences=()=>{
 try{
  const live=window.getLocalLayoutPreferences?.();
  if(live&&typeof live==='object')return live;
  return {styles:JSON.parse(localStorage.getItem('mf-card-custom-styles-v1')||'{}')||{},hiddenCards:JSON.parse(localStorage.getItem('mf-card-hidden-v1')||'{}')||{}};
 }catch(e){return {styles:{},hiddenCards:{}}}
};
const loadCloudLayoutPreferences=async()=>{
 if(!supabaseClient||!authUser)return;
 const {data,error}=await MF_DB.layoutPrefs.mine(authUser.id);
 if(error)throw error;
 if(data?.preferences&&typeof data.preferences==='object')window.applyCloudLayoutPreferences?.(data.preferences);
};
const syncExtendedData=async(state,makeBackup=true)=>{
 if(!supabaseClient||!authUser)return;
 while(extendedBusy)await new Promise(resolve=>setTimeout(resolve,40));
 extendedBusy=true;
 try{
  const uid=authUser.id,appId='minhas-financas',now=new Date().toISOString();
  const prefs=readLayoutPreferences();
  const {error:prefError}=await MF_DB.layoutPrefs.upsert({user_id:uid,app_id:appId,preferences:prefs,updated_at:now});
  if(prefError)throw new Error('Preferências do layout: '+prefError.message);
  const st=state&&typeof state==='object'?state:{};
  const modules=[
   {module_key:'dashboard',data:{tx:st.tx||[],inv:st.inv||[],orc:st.orc||{},sim:st.sim||{},ap:st.ap||{},month:ym}},
   {module_key:'transactions',data:{tx:st.tx||[],trash:st.trash||[]}},
   {module_key:'investments',data:{inv:st.inv||[],invReview:st.invReview||{},rate:st.rate}},
   {module_key:'planning',data:{orc:st.orc||{},recurring:st.recurring||[],house:st.house||[],shopping:st.shopping||[],tasks:st.tasks||[],closedMonths:st.closedMonths||[],fatv:st.fatv||{},cx:st.cx||[]}},
   {module_key:'reserve',data:{sim:st.sim||{},ap:st.ap||{},rop:st.rop||{},goals:st.goals||[],categoryBudgets:st.categoryBudgets||{}}},
   {module_key:'annual_view',data:{tx:st.tx||[],inv:st.inv||[],orc:st.orc||{},analysisYear}},
   {module_key:'settings',data:{lay:st.lay||{},ver:st.ver||0,subscriptions:st.subscriptions||{},categoryBudgets:st.categoryBudgets||{}}}
  ].map(m=>({user_id:uid,app_id:appId,module_key:m.module_key,data:m.data,updated_at:now}));
  const {error:modError}=await MF_DB.moduleData.upsert(modules);
  if(modError)throw new Error('Dados por módulo: '+modError.message);
  if(makeBackup){
   const today=new Date();today.setHours(0,0,0,0);
   const {data:existing,error:checkError}=await MF_DB.backups.fullSince(uid,appId,today.toISOString());
   if(checkError)throw new Error('Verificação de backup: '+checkError.message);
   if(!existing||existing.length===0){
    const financial={tx:st.tx||[],inv:st.inv||[],orc:st.orc||{},sim:st.sim||{},ap:st.ap||{},rop:st.rop||{},goals:st.goals||[],categoryBudgets:st.categoryBudgets||{},recurring:st.recurring||[],house:st.house||[],shopping:st.shopping||[],tasks:st.tasks||[],closedMonths:st.closedMonths||[],fatv:st.fatv||{},cx:st.cx||[],trash:st.trash||[]};
    const backups=[
     {user_id:uid,app_id:appId,backup_type:'layout',label:'Backup automático do layout '+today.toISOString().slice(0,10),payload:prefs},
     {user_id:uid,app_id:appId,backup_type:'financial_data',label:'Backup automático financeiro '+today.toISOString().slice(0,10),payload:financial},
     {user_id:uid,app_id:appId,backup_type:'full_app',label:'Backup automático completo '+today.toISOString().slice(0,10),payload:{state:st,layout_preferences:prefs}}
    ];
    const {error:backupError}=await MF_DB.backups.insert(backups);
    if(backupError)throw new Error('Criação de backup: '+backupError.message);
   }
  }
 }finally{extendedBusy=false}
};
window.queueLayoutPreferencesSave=()=>{if(!supabaseClient||!authUser||window._applyingCloudLayoutPrefs)return;clearTimeout(extendedSaveTimer);extendedSaveTimer=setTimeout(()=>queueExtras(0),800)};
const verifyExtendedData=async()=>{
 const uid=authUser.id,appId='minhas-financas';
 const checks=await Promise.all([
  MF_DB.layoutPrefs.exists(uid,appId),
  MF_DB.moduleData.keys(uid,appId),
  MF_DB.backups.anyFull(uid,appId)
 ]);
 const failed=checks.find(x=>x.error);if(failed)throw failed.error;
 const moduleRows=checks[1].data||[];
 if(!checks[0].data||moduleRows.length<7||!(checks[2].data||[]).length)throw new Error('A verificação de leitura das tabelas complementares não confirmou todos os registros.');
 return true;
};
const queueCloudSave=()=>{if(!supabaseClient||!authUser||cloudBusy)return;clearTimeout(cloudTimer);sync='syncing';updateCloudStatus();cloudTimer=setTimeout(mfPush,500)};
const mirrorTables=async()=>{
 if(!supabaseClient||!authUser)return;
 const uid=authUser.id;
 // Movimentações espelha todas as entradas e saídas do aplicativo; app_data guarda o estado completo.
 const txRows=(Array.isArray(S.tx)?S.tx:[]).map((t,i)=>({user_id:uid,app_id:String(t.id??('lancamento-'+i)),descricao:String(t.n||t.descricao||'Lançamento'),valor:Math.abs(Number(t.v??t.valor??0)||0),categoria:mfIsTr(t)?'Transferência':isInvoicePayment(t)?'Pagamento de fatura':String(t.c||t.categoria||''),data_gasto:String(t.d||t.data_gasto||new Date().toISOString().slice(0,10)).slice(0,10),tipo:mfIsTr(t)?'transferencia':isInvoicePayment(t)?'pagamento_fatura':(String(t.tipo||'').toLowerCase()==='entrada'||String(t.tipo||'').toLowerCase()==='saida')?String(t.tipo).toLowerCase():(t.c==='Receita'?'entrada':'saida')}));
 const invRows=(Array.isArray(S.inv)?S.inv:[]).map((a,i)=>({user_id:uid,app_id:String(a.id??a.a??('ativo-'+i)),"Ticker":String(a.a||a.Ticker||''),"Quantidade":Number(a.q??a.Quantidade??0)||0,preco_medio:Number(a.p??a.preco_medio??0)||0,setor:String(a.k||a.setor||'')}));
 const syncOne=async(table,rows)=>{
  const {data:oldRows,error:readErr}=await MF_DB.mirror.ids(table,uid);
  if(readErr)throw readErr;
  if(rows.length){const {error}=await MF_DB.mirror.upsert(table,rows);if(error)throw error;}
  const keep=new Set(rows.map(r=>r.app_id));
  const gone=(oldRows||[]).map(o=>o.app_id).filter(id=>id&&!keep.has(id));for(let i=0;i<gone.length;i+=100){const {error}=await MF_DB.mirror.deleteIds(table,uid,gone.slice(i,i+100));if(error)throw error;}
  if(!rows.length){const {error}=await MF_DB.mirror.deleteAll(table,uid);if(error)throw error;}
 };
 await syncOne('lancamentos',txRows);
 await syncOne('Ativos',invRows);
};
/* Sync v2: as cópias complementares (app_module_data, backup do dia, lancamentos/Ativos) rodam em segundo plano,
   uma de cada vez, e só quando os dados ou o layout mudaram desde a última cópia. A tela nunca espera por elas. */
function mfHash(t){let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)+'.'+t.length}
let mfExtrasTimer=null,mfExtrasBusy=false,mfExtrasOpen=false;
const mfExtrasRun=async()=>{
 if(!supabaseClient||!authUser||!navigator.onLine)return;
 const uid=authUser.id,key='fin1_extra_'+uid;
 if(mfExtrasOpen){mfExtrasOpen=false;try{await loadCloudLayoutPreferences()}catch(e){console.error('Supabase layout:',e)}}
 const J=cloudLast||JSON.stringify(S),h=mfHash(J+'|'+JSON.stringify(readLayoutPreferences())),day=TD;
 const last=(mfGet(key)||'').split('|'),backup=last[0]!==day;
 if(!backup&&last[1]===h)return; // nada mudou desde a última cópia e o backup de hoje já existe
 try{await syncExtendedData(JSON.parse(J),backup);if(backup)await verifyExtendedData()}
 catch(e){console.warn('Supabase complementary tables:',e);queueExtras(60000);return} // os dados principais já estão salvos: tenta a cópia de novo depois, sem mostrar erro
 try{await mirrorTables();window.__mfMirrorErr=null}
 catch(e){console.warn('Supabase table mirror:',e);window.__mfMirrorErr={msg:String((e&&(e.message||e.details))||'erro'),at:Date.now()};window.updateCloudStatus?.();return}
 mfStore(key,day+'|'+h);
 if(sync==='erro'&&!dirty){sync='ok';window.updateCloudStatus?.()}
};
const queueExtras=(ms)=>{if(!supabaseClient||!authUser)return;clearTimeout(mfExtrasTimer);mfExtrasTimer=setTimeout(async()=>{
 if(mfExtrasBusy||mfPushing||dirty){queueExtras(4000);return}
 mfExtrasBusy=true;try{await mfExtrasRun()}catch(e){console.warn('Supabase extras:',e)}finally{mfExtrasBusy=false}},ms==null?15000:ms)};
const queueTableMirror=()=>queueExtras(15000);
const mfBgSync=()=>{try{navigator.serviceWorker&&navigator.serviceWorker.ready.then(r=>r.sync&&r.sync.register('mf-sync')).catch(()=>{})}catch(e){}};
const save=()=>{const J0=JSON.stringify(S);if(!navigator.onLine)mfBgSync();if(!authUser){if(window.__mfCachedUid){try{_storage.setItem('fin1',J0);_storage.setItem('fin1_pending','1')}catch(e){}dirty=true;sync=navigator.onLine?'local':'offline';window.updateCloudStatus?.();window.mfNetUpdate&&mfNetUpdate()}else{sync='local';window.updateCloudStatus?.()}return}try{_storage.setItem('fin1',J0);_storage.setItem('fin1_uid',authUser.id);_storage.setItem('fin1_pending','1')}catch(e){}dirty=true;sync='syncing';window.updateCloudStatus?.();queueCloudSave();queueTableMirror();window.mfNetUpdate&&mfNetUpdate()};