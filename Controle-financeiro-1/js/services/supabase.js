/* Repositórios do Supabase (1.30 · Fase 5): único lugar do app com as consultas ao banco, às funções e à autenticação.
   As chamadas são EXATAMENTE as que existiam espalhadas pelo app (mesmas tabelas, colunas, filtros e payloads);
   só mudaram de lugar. Quem chama continua montando os dados (payload) e tratando o resultado/erro como antes.
   Segurança: nada aqui usa chave secreta; a proteção dos dados é a RLS do banco (cada usuário só enxerga o que é dele).
   O cliente (`supabaseClient`) continua sendo a variável global criada no login (91-supabase-login-e-sessao.js) e é lido só na hora da chamada.
   Teste de equivalência: testes/casos/27-chamadas-supabase-130.js e a conferência de texto descrita em docs/MEMORIA.md. */
window.MF_DB={
 /* cliente único (o pedido autenticado/renovação de login é o mfAuthFetch, passado em `f`) */
 client:{
  create:(url,key,f)=>window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},global:{fetch:f}})
 },
 /* app_data: o estado completo do app (um registro por usuário) */
 appData:{
  dataOf:uid=>supabaseClient.from('app_data').select('data').eq('user_id',uid).maybeSingle(),
  dataRevOf:uid=>supabaseClient.from('app_data').select('data,rev').eq('user_id',uid).maybeSingle(),
  rowOf:uid=>supabaseClient.from('app_data').select('*').eq('user_id',uid).maybeSingle(),
  revOf:uid=>supabaseClient.from('app_data').select('rev').eq('user_id',uid).maybeSingle(),
  create:row=>supabaseClient.from('app_data').insert(row),
  upsertLegacy:row=>supabaseClient.from('app_data').upsert(row,{onConflict:'user_id'}),
  saveState:args=>supabaseClient.rpc('mf_salvar_estado',args),
  listen:(uid,onChange,onStatus)=>supabaseClient.channel('app-data-'+uid).on('postgres_changes',{event:'UPDATE',schema:'public',table:'app_data',filter:'user_id=eq.'+uid},onChange).subscribe(onStatus),
  unlisten:ch=>supabaseClient.removeChannel(ch)
 },
 /* tabelas complementares (preferências de layout, módulos, backups) */
 layoutPrefs:{
  mine:uid=>supabaseClient.from('app_layout_preferences').select('preferences,updated_at').eq('user_id',uid).eq('app_id','minhas-financas').maybeSingle(),
  upsert:row=>supabaseClient.from('app_layout_preferences').upsert(row,{onConflict:'user_id,app_id'}),
  exists:(uid,appId)=>supabaseClient.from('app_layout_preferences').select('user_id').eq('user_id',uid).eq('app_id',appId).maybeSingle()
 },
 moduleData:{
  upsert:rows=>supabaseClient.from('app_module_data').upsert(rows,{onConflict:'user_id,app_id,module_key'}),
  keys:(uid,appId)=>supabaseClient.from('app_module_data').select('module_key').eq('user_id',uid).eq('app_id',appId)
 },
 backups:{
  fullSince:(uid,appId,since)=>supabaseClient.from('app_backups').select('id').eq('user_id',uid).eq('app_id',appId).eq('backup_type','full_app').gte('created_at',since).limit(1),
  insert:rows=>supabaseClient.from('app_backups').insert(rows),
  anyFull:(uid,appId)=>supabaseClient.from('app_backups').select('id,backup_type').eq('user_id',uid).eq('app_id',appId).eq('backup_type','full_app').limit(1)
 },
 /* espelho em tabelas por linha (mirrorTables): a tabela é escolhida por quem chama */
 mirror:{
  ids:(table,uid)=>supabaseClient.from(table).select('app_id').eq('user_id',uid),
  upsert:(table,rows)=>supabaseClient.from(table).upsert(rows,{onConflict:'user_id,app_id'}),
  deleteIds:(table,uid,ids)=>supabaseClient.from(table).delete().eq('user_id',uid).in('app_id',ids),
  deleteAll:(table,uid)=>supabaseClient.from(table).delete().eq('user_id',uid)
 },
 errors:{
  insert:rows=>supabaseClient.from('app_erros').insert(rows)
 },
 /* conta, acesso (plano) e presença */
 account:{
  deleteMine:()=>supabaseClient.rpc('mf_excluir_minha_conta'),
  access:()=>supabaseClient.rpc('meu_acesso'),
  presence:args=>supabaseClient.rpc('mf_presenca',args),
  pixLast:uid=>supabaseClient.from('pedidos_pix').select('status,criado_em').eq('user_id',uid).order('criado_em',{ascending:false}).limit(1),
  pixCreate:row=>supabaseClient.from('pedidos_pix').insert(row)
 },
 /* autenticação (login, sessão, senha) */
 auth:{
  signIn:cred=>supabaseClient.auth.signInWithPassword(cred),
  signUp:cred=>supabaseClient.auth.signUp(cred),
  signOut:()=>supabaseClient.auth.signOut(),
  getSession:()=>supabaseClient.auth.getSession(),
  refresh:()=>supabaseClient.auth.refreshSession(),
  refreshWith:opts=>supabaseClient.auth.refreshSession(opts),
  updateUser:attrs=>supabaseClient.auth.updateUser(attrs),
  resetPassword:(email,opts)=>supabaseClient.auth.resetPasswordForEmail(email,opts),
  onChange:cb=>supabaseClient.auth.onAuthStateChange(cb)
 },
 /* histórico da carteira, proventos, cotações e mercado */
 portfolio:{
  monthly:uid=>supabaseClient.from('patrimonio_mensal').select('mes,dia,valor,aplicado,estimado').eq('user_id',uid).order('mes'),
  daily:uid=>supabaseClient.from('carteira_diaria').select('dia,valor,aplicado,estimado').eq('user_id',uid).order('dia')
 },
 proventos:{
  list:uid=>supabaseClient.from('proventos').select('ticker,chave,tipo,data_ex,data_com,data_pagamento,valor_cota,qtd,total').eq('user_id',uid).order('data_com'),
  history:opts=>supabaseClient.functions.invoke('proventos-historico',opts)
 },
 quotes:{
  auto:tks=>supabaseClient.from('cotacoes_auto').select('ticker,price,previous_close,currency,market_state,fonte,atualizado_em').in('ticker',tks),
  refresh:opts=>supabaseClient.functions.invoke('cotacoes',opts),
  market:opts=>supabaseClient.functions.invoke('mercado',opts),
  fundamentals:opts=>supabaseClient.functions.invoke('fundamentos',opts),
  recommendations:opts=>supabaseClient.functions.invoke('recomendacoes',opts)
 },
 /* Radar (Investimentos): dados de MERCADO por ativo, só leitura (RLS); a função radar-sync grava */
 radar:{
  ativos:tks=>supabaseClient.from('radar_ativos').select('ticker,classe,nome,preco,sinais,atualizado_em').in('ticker',tks),
  alertas:(tks,desde)=>supabaseClient.from('radar_alertas').select('id,ticker,nome,classe,categoria,tipo,indicador,antes,depois,variacao_pct,periodo_ref,data_publicacao,coletado_em,fonte,link,texto,nivel').in('ticker',tks).gte('data_publicacao',desde).order('data_publicacao',{ascending:false}).order('id',{ascending:false}).limit(300),
  coleta:()=>supabaseClient.from('radar_coleta').select('fonte,ultima_execucao,ultimo_ok,status'),
  sync:tks=>supabaseClient.functions.invoke('radar-sync',{body:{tickers:tks}}),
  eventos:tks=>supabaseClient.from('radar_eventos').select('id,ticker,nome,classe,tipo,titulo,resumo,data_evento,data_publicacao,data_com,data_pagamento,valor,fonte,link,coletado_em').in('ticker',tks).order('id',{ascending:false}).limit(600),
  noticias:tks=>supabaseClient.from('radar_noticias').select('id,tickers,titulo,trecho,veiculo,categoria,publicado_em,link,fonte,destaque').or(`tickers.ov.{${tks.join(',')}},categoria.neq.empresa`).order('publicado_em',{ascending:false}).limit(250),
  eventosSync:tks=>supabaseClient.functions.invoke('radar-eventos',{body:{tickers:tks}})
 },
 push:{
  save:row=>supabaseClient.from('push_subscriptions').upsert(row,{onConflict:'endpoint'}),
  remove:ep=>supabaseClient.from('push_subscriptions').delete().eq('endpoint',ep)
 },
 /* painel administrativo (as permissões reais são checadas no banco) */
 admin:{
  call:(fn,args)=>supabaseClient.rpc(fn,args||{}),
  plans:()=>supabaseClient.from('adm_planos').select('*').order('preco'),
  config:()=>supabaseClient.from('adm_config').select('*').eq('id',1).maybeSingle()
 }
};
