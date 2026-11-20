/* Plataforma (1.30 · Fase 3; detecção por capacidades na Fase 8): único lugar que decide celular x computador.
   Regra: layout de COMPUTADOR = janela com 900px ou mais E ponteiro preciso com "hover" (mouse/trackpad).
          Todo o resto = CELULAR (inclui tablets e telas de toque, mesmo largas).
   Se o navegador não souber responder sobre o ponteiro, vale a regra antiga pelo user agent.
   Opção manual (só neste aparelho, fica no navegador): Automático / Celular / Computador — Configurações › Aparência,
   ou no endereço: ?aparelho=celular | ?aparelho=computador | ?aparelho=auto. "Computador" continua exigindo 900px de largura.
   Carrega no <head>, antes da primeira pintura, para a classe mf-desk/mf-mob já estar certa. */
(function(){var ua=navigator.userAgent||'',d=navigator.userAgentData,h=document.documentElement,KEY='mf_aparelho';
var mobUA=!!(d&&d.mobile)||/Android|iPhone|iPod|iPad|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
var mq=null;try{mq=window.matchMedia&&matchMedia('(hover: hover) and (pointer: fine)');if(mq&&mq.media==='not all')mq=null}catch(e){mq=null}
try{var m=/[?&]aparelho=(auto|celular|computador)(?:&|#|$)/.exec(location.search);if(m){if(m[1]==='auto')localStorage.removeItem(KEY);else localStorage.setItem(KEY,m[1])}}catch(e){}
function forced(){try{var f=localStorage.getItem(KEY);return f==='celular'||f==='computador'?f:''}catch(e){return ''}}
function fine(){return mq?mq.matches:!mobUA}
function wantsDesk(){var f=forced();if(window.innerWidth<900||f==='celular')return false;return f==='computador'?true:fine()}
function ap(){var on=wantsDesk(),was=h.classList.contains('mf-desk');window.MF_DEVICE=on?'desktop':'mobile';h.classList.toggle('mf-desk',on);h.classList.toggle('mf-mob',!on);if(was!==on&&typeof window.draw==='function'){try{window.draw()}catch(e){}}}
window.mfIsDesk=function(){return h.classList.contains('mf-desk')};
window.mfAparelho=function(){return {modo:h.classList.contains('mf-desk')?'computador':'celular',forcado:forced()||'auto',ponteiroFino:fine(),largura:window.innerWidth,porUA:mobUA?'celular':'computador'}};
window.mfSetAparelho=function(v){try{if(v==='celular'||v==='computador')localStorage.setItem(KEY,v);else localStorage.removeItem(KEY)}catch(e){}ap()};
ap();var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(ap,150)});window.addEventListener('orientationchange',function(){setTimeout(ap,250)});
if(mq){try{mq.addEventListener('change',ap)}catch(e){try{mq.addListener(ap)}catch(e2){}}}})();
function mfIsIOS(){return /iP(hone|ad|od)/.test(navigator.userAgent)}
function mfStandalone(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true}
