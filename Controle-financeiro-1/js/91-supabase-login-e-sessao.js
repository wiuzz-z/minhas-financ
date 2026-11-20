
(()=>{
 const PROJECT_URL=MF_CONFIG.supabaseUrl;
 const PUBLIC_KEY=MF_CONFIG.supabasePublishableKey;
 const overlay=document.getElementById('cloud-auth'),form=document.getElementById('cloud-auth-form'),email=document.getElementById('cloud-email'),password=document.getElementById('cloud-password'),msg=document.getElementById('cloud-auth-msg'),loginBtn=document.getElementById('cloud-login'),signupBtn=document.getElementById('cloud-signup');
 window.updateCloudStatus=(message)=>{try{window.mfSyncDot&&mfSyncDot()}catch(e){}const text=message||(sync==='ok'?'Sincronização ativa':sync==='syncing'?'Sincronizando dados…':sync==='erro'?'Erro na sincronização':authUser?'Conectando à nuvem…':'Sem sessão: somente neste dispositivo');msg.textContent=text;const badge=document.getElementById('cloud-sync-indicator');if(badge){badge.textContent='Nuvem: '+(sync==='ok'?'sincronizada':sync==='syncing'?'sincronizando':sync==='erro'?'erro':authUser?'conectando':'sem sessão');badge.title=text;badge.style.background=sync==='ok'?'#14532d':sync==='erro'?'#7f1d1d':sync==='syncing'?'#5b4a12':'#292f40'}document.querySelectorAll('.sync-indicator').forEach(icon=>{const state=!authUser?'is-disconnected':sync==='syncing'?'is-syncing':'is-connected';icon.classList.toggle('is-connected',state==='is-connected');icon.classList.toggle('is-syncing',state==='is-syncing');icon.classList.toggle('is-disconnected',state==='is-disconnected');const label=state==='is-syncing'?'Sincronizando dados':state==='is-connected'?'Conectado à nuvem':'Não sincronizado';icon.setAttribute('aria-label',label);icon.title=text||label;icon.setAttribute('role','img')});document.querySelectorAll('.cloud-status-text').forEach(el=>el.remove());document.querySelectorAll('.cloud-status-control').forEach(el=>{el.setAttribute('aria-label',authUser?'Status da sincronização':'Entrar na conta');el.title=authUser?'Sincronização da nuvem':'Entrar ou criar conta'})};
 const say=t=>{msg.textContent=t};
 const closeAuth=()=>{overlay.hidden=true;overlay.style.display='none'};
 const openAuth=()=>{overlay.hidden=false;overlay.style.display='flex'};
 window.mfOpenAuth=()=>{openAuth();try{if(authUser&&authUser.email&&!email.value)email.value=authUser.email;password.focus()}catch(_){}};
 document.getElementById('cloud-auth-close')?.addEventListener('click',closeAuth);
 overlay.addEventListener('click',e=>{if(e.target===overlay)closeAuth()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closeAuth()});
 // A tela inicial continua limpa. Toque no ícone da nuvem para entrar/criar conta quando quiser ativar a sincronização.
 document.addEventListener('click',e=>{const control=e.target.closest('.cloud-status-control,.sync-indicator');if(control&&!authUser){openAuth();email.focus();}});
 const setBusy=v=>{loginBtn.disabled=signupBtn.disabled=v;loginBtn.classList.toggle('is-busy',v);const su=form.classList.contains('mf-signup');if(v)loginBtn.innerHTML='<span class="mf-spin" aria-hidden="true"></span>'+(su?'Criando conta…':'Entrando…');else loginBtn.textContent=su?'Criar conta':'Entrar'};
 const init=async()=>{
  try{await window.mfSbReady()}catch(e){say('Não foi possível carregar o módulo de conexão. Atualize a página.');return}
  if(supabaseClient)return; // já iniciado (ex.: reconexão)
  /* Sessão: se o login venceu e não foi renovado, o pedido sairia "sem login" (anônimo) e daria "permission denied".
     Aqui o app renova o login sozinho e repete o pedido uma vez; se não conseguir, pede para entrar de novo. */
  const mfAuthFetch=async(input,init)=>{const url=String((input&&input.url)||input),api=/\/(rest|functions)\/v1\//.test(url),logged_=()=>typeof authUser!=='undefined'&&!!authUser;
   if(api&&logged_()){const h=new Headers((init&&init.headers)||{});if(h.get('Authorization')==='Bearer '+PUBLIC_KEY){const s2=await mfRefreshOnce();if(s2){h.set('Authorization','Bearer '+s2.access_token);init=Object.assign({},init,{headers:h})}else mfSessionLost()}}
   let res=await fetch(input,init);
   if(api&&res.status===401&&logged_()&&!(init&&init.__mfRetry)){const s2=await mfRefreshOnce();if(s2){const h2=new Headers((init&&init.headers)||{});h2.set('Authorization','Bearer '+s2.access_token);res=await fetch(input,Object.assign({},init,{headers:h2,__mfRetry:1}))}else mfSessionLost()}
   return res};
  supabaseClient=MF_DB.client.create(PROJECT_URL,PUBLIC_KEY,mfAuthFetch);
  MF_DB.auth.onChange((ev,ss)=>{if(ss&&ss.refresh_token)window.__mfRt=ss.refresh_token;if(ss&&ss.user)window.__mfLostAt=0});
  const {data:{session},error}=await MF_DB.auth.getSession();
  if(error){say('Erro ao verificar a sessão: '+error.message);return}
  if(session?.user) await establishSession(session.user); else { sync='local'; updateCloudStatus('Sem sessão autenticada. O app abriu sem login; a sincronização na nuvem fica inativa até configurar a autenticação.'); }
  MF_DB.auth.onChange((event,session)=>{if(session?.user&&(!authUser||authUser.id!==session.user.id)){setTimeout(()=>establishSession(session.user),0)}else if(!session?.user){authUser=null;if(event!=='SIGNED_OUT'){sync='local';updateCloudStatus();return}['fin1','fin1_uid','fin1_base','fin1_pending','fin1_rev'].forEach(k=>{try{_storage.removeItem(k)}catch(e){}});cloudRev=null;window.__mfCachedUid=null;S=emptyAccountState();closeAuth();sync='local';dirty=false;cloudLast='';if(cloudChannel){MF_DB.appData.unlisten(cloudChannel);cloudChannel=null}draw();updateCloudStatus('Sessão encerrada. Entre novamente para sincronizar.')}});
 };
 const establishSession=async user=>{
  authUser=user;setBusy(false);say('Conta conectada. Carregando dados…');
  const before=JSON.stringify(S);
  try{
   /* Sync v2: se este aparelho já tem a mesma versão da nuvem, não baixa o estado de novo */
   const baseJ=mfGet('fin1_base'),revJ=mfGet('fin1_rev');
   let same=false,row=null;
   let baseO=null;try{baseO=baseJ?JSON.parse(baseJ):null}catch(e){}
   if(mfGet('fin1_uid')===user.id&&window.__mfCachedUid===user.id&&baseO&&revJ!==null&&!mfPending()){
    const r0=await MF_DB.appData.revOf(user.id);
    if(!r0.error&&r0.data&&r0.data.rev!=null&&String(r0.data.rev)===revJ)same=true;
   }
   if(same){cloudLast=baseJ;lastJ=cloudLast;cloudRev=+revJ;dirty=!(window.mfSameData&&mfSameData(S,baseO));if(dirty)setTimeout(queueCloudSave,300)}
   else{
    const r1=await MF_DB.appData.rowOf(user.id);
    if(r1.error)throw r1.error;row=r1.data;
    if(row&&row.data&&typeof row.data==='object'){
     cloudRev=row.rev!=null?+row.rev:null;mfStore('fin1_rev',cloudRev===null?null:String(cloudRev));
     const remoteJ=JSON.stringify(row.data);S=mfReconcile(user.id,row.data);try{_storage.setItem('fin1',JSON.stringify(S));_storage.setItem('fin1_uid',user.id)}catch(e){};window.__mfCachedUid=user.id;
     mig();mig3();mig4();mig5();mig6();cloudLast=remoteJ;lastJ=cloudLast;mfSetBase(remoteJ);dirty=!(window.mfSameData&&mfSameData(S,row.data));if(dirty){setTimeout(queueCloudSave,300)}else mfClearPending();
    }else{
     // Conta nova: iniciar vazia; nunca copiar dados do navegador/dispositivo para outra conta.
     S=emptyAccountState();
     const initial=JSON.parse(JSON.stringify(S));const {error:saveError}=await MF_DB.appData.create({user_id:user.id,data:initial,updated_at:new Date().toISOString()});
     if(saveError&&saveError.code!=='23505')throw saveError;
     try{_storage.setItem('fin1',JSON.stringify(S));_storage.setItem('fin1_uid',user.id)}catch(e){};window.__mfCachedUid=user.id;
     cloudLast=JSON.stringify(S);mfSetBase(cloudLast);cloudRev=saveError?null:0;mfStore('fin1_rev',cloudRev===null?null:String(cloudRev));
    }
   }
   closeAuth();sync=dirty?'syncing':'ok';
   if(JSON.stringify(S)!==before)draw(); // só redesenha se algo mudou
   window.applyCloudLayoutPreferences?.(readLayoutPreferences());subscribeCloud();updateCloudStatus();
   mfExtrasOpen=true;queueExtras(2500); // layout da nuvem, módulos, backup do dia e espelho: depois, em segundo plano
  }catch(e){const n=window.__mfLoadTry=(window.__mfLoadTry||0)+1;
   if(navigator.onLine&&n<3){console.warn('Supabase load (nova tentativa):',e);sync='syncing';updateCloudStatus();setTimeout(()=>{if(authUser&&authUser.id===user.id)establishSession(user)},n*3000);return}
   console.error('Supabase load:',e);closeAuth();say('Não consegui carregar os dados na nuvem: '+(e.message||'erro desconhecido')+'.');sync='erro';updateCloudStatus()}
 };
 const subscribeCloud=()=>{
  if(cloudChannel)MF_DB.appData.unlisten(cloudChannel);
  cloudChannel=MF_DB.appData.listen(authUser.id,payload=>{
   if(!authUser||cloudBusy||dirty||mfPushing||mfPending())return;const nr=payload.new?.rev;if(nr!=null&&cloudRev!==null&&+nr<=cloudRev)return;const incoming=payload.new?.data;if(!incoming||typeof incoming!=='object')return;const next=JSON.stringify(incoming);
   const adopt=()=>{cloudLast=next;mfSetBase(next);if(nr!=null){cloudRev=+nr;mfStore('fin1_rev',String(cloudRev))}};
   if(next===cloudLast||(window.mfSameData&&mfSameData(incoming,S))){adopt();return}
   cloudBusy=true;try{S=incoming;adopt();try{_storage.setItem('fin1',next)}catch(e){};draw();sync='ok';updateCloudStatus()}finally{cloudBusy=false}
  },status=>{if(status==='SUBSCRIBED'){window.__mfRtTry=0;return}if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){const n=window.__mfRtTry=(window.__mfRtTry||0)+1;clearTimeout(window.__mfRtT);window.__mfRtT=setTimeout(()=>{if(authUser&&navigator.onLine&&document.visibilityState==='visible'){subscribeCloud();window.mfCatchUp&&mfCatchUp()}},[5000,15000,60000][Math.min(n,3)-1])}});
 };
 const doSignup=async()=>{const em=email.value.trim(),pw=password.value,cfi=document.getElementById('cloud-password2'),cf=cfi?cfi.value:'',A=window.mfAuthMsg||(()=>{}),ST=window.mfAuthState||(()=>{});
  const bad=(t,el)=>{ST('err');A('err',t);say('');try{el&&el.focus({preventScroll:true})}catch(_){}};
  if(!em||!email.checkValidity())return bad('Informe um e-mail válido.',email);
  if(!pw)return bad('Crie uma senha.',password);
  if(pw.length<6)return bad('A senha precisa ter pelo menos 6 caracteres.',password);
  if(!cf)return bad('Confirme a senha.',cfi);
  if(pw!==cf)return bad('As senhas não coincidem.',cfi);
  if(!supabaseClient)return bad('Não foi possível carregar o módulo de conexão. Atualize a página.');
  setBusy(true);A('none');say('Criando sua conta…');
  try{const {data,error}=await MF_DB.auth.signUp(Object.assign({email:em,password:pw},/^https?:$/.test(location.protocol)?{options:{emailRedirectTo:location.origin+'/'}}:{}));if(error)throw error;const u=data&&data.user;
   if(!u)throw new Error('Não foi possível criar a conta. Tente de novo.');
   if(Array.isArray(u.identities)&&u.identities.length===0){ST('err');A('err','Este e-mail já tem conta. Toque em “Já tenho conta” e entre.');say('');return}
   ST('ok');say('');
   if(data.session){A('ok','Conta criada com sucesso! Agora você já pode acessar o Controle Alpha.');setTimeout(()=>{establishSession(u)},1600)}
   else{window.mfAuthMode&&mfAuthMode('login',true);A('ok','Conta criada com sucesso! Agora você já pode acessar o Controle Alpha.<small>Se o app pedir confirmação, abra o link enviado para '+em.replace(/[<>&"]/g,'')+' e depois toque em Entrar.</small>');password.value=''}
  }catch(e){ST('err');A('err',(e&&e.message)==='User already registered'?'Este e-mail já tem conta. Toque em “Já tenho conta” e entre.':(e&&e.message)||'Não foi possível criar a conta.');say('')}finally{setBusy(false)}};
 form.addEventListener('submit',async e=>{e.preventDefault();if(form.classList.contains('mf-signup')){await doSignup();return}if(!supabaseClient){say('Não foi possível carregar o módulo de conexão. Atualize a página.');return}window.mfAuthMsg&&mfAuthMsg('none');setBusy(true);say('Verificando acesso…');try{const {data,error}=await MF_DB.auth.signIn({email:email.value.trim(),password:password.value});if(error)throw error;window.mfAuthState&&mfAuthState('ok');await establishSession(data.user)}catch(e){window.mfAuthState&&mfAuthState('err');say(e.message==='Invalid login credentials'?'E-mail ou senha incorretos. Se ainda não tem conta, toque em “Criar conta”.':e.message||'Não foi possível entrar.');}finally{setBusy(false)}});
 signupBtn.addEventListener('click',()=>{say('');if(window.mfAuthMode)mfAuthMode(form.classList.contains('mf-signup')?'login':'signup')});
 window.__mfInit=init;init().catch(e=>{console.error(e);say('Erro ao iniciar conexão. Recarregue a página.')});
})();
