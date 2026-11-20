
(function(){
 const $=id=>document.getElementById(id);
 const toggle=$('uiCardEditToggle'), panel=$('uiCardCustomizer'), controls=$('uiCardControls');
 const ids=['uiCardWidth','uiCardHeight','uiCardPadding','uiCardRadius','uiCardText','uiCardControlsRadius'];
 const hiddenCardsKey='mf-card-hidden-v1';let hiddenCards={};try{hiddenCards=JSON.parse(localStorage.getItem(hiddenCardsKey)||'{}')||{}}catch(e){}
 let editing=false, selected=null, styles={};
 try{styles=JSON.parse(localStorage.getItem('mf-card-custom-styles-v1')||'{}')||{}}catch(e){styles={}}
 function allCards(){return [...document.querySelectorAll(MF_CARD_SEL+',.blk,[data-ui-inner]')].filter(el=>!el.closest('#uiCardCustomizer')&&(!el.classList.contains('blk')||!el.querySelector(MF_CARD_SEL)))}
function isInteractive(el){return /^(BUTTON|INPUT|SELECT|TEXTAREA|A|LABEL|SUMMARY|SVG|PATH|IMG|CANVAS|CIRCLE|RECT|LINE|TEXT|POLYLINE|G|TITLE|I|B|SPAN|SMALL|STRONG|EM|H1|H2|H3|H4|P)$/i.test(el.tagName)}
 function boxLike(el){
   if(!el||el.id==='app'||el.nodeType!==1||isInteractive(el))return false;
   const cs=getComputedStyle(el);if(cs.display==='inline'||cs.display==='contents'||cs.display==='none')return false;
   const bg=cs.backgroundColor,hasBg=(bg&&!/^rgba?\(\s*0,\s*0,\s*0,\s*0\s*\)$|^transparent$/.test(bg))||(cs.backgroundImage&&cs.backgroundImage!=='none');
   const full=['Top','Right','Bottom','Left'].every(s=>parseFloat(cs['border'+s+'Width'])>0&&cs['border'+s+'Style']!=='none'&&!/,\s*0\)$/.test(cs['border'+s+'Color']));
   const r=el.getBoundingClientRect();return (hasBg||full)&&r.width>=56&&r.height>=28;
 }
 function isBigSvg(sv){const r=sv.getBoundingClientRect();return r.width>=90&&r.height>=50&&!sv.closest('nav,#uiCardCustomizer,button')}
 function chartTarget(sv){const p=sv.parentElement;return p&&p.id!=='app'&&p.tagName==='DIV'&&p.children.length===1&&!p.matches(MF_CARD_SEL)?p:sv}
 function markCharts(){document.querySelectorAll('#app svg').forEach(sv=>{if(isBigSvg(sv))chartTarget(sv).setAttribute('data-ui-chart','1')})}
 function cardFrom(t){const app=document.getElementById('app');const sv=t.closest&&t.closest('svg');if(sv&&app.contains(sv)&&isBigSvg(sv)){const c=chartTarget(sv);c.setAttribute('data-ui-chart','1');return c}for(let el=t;el&&el!==app&&el!==document.body;el=el.parentElement){if(el.nodeType===1&&(el.matches(MF_CARD_SEL)||boxLike(el)))return el}return null}
 function innerId(el){
   if(el.dataset.uiCardId)return el.dataset.uiCardId;
   const anc=el.parentElement&&el.parentElement.closest('[data-ui-card-id]');if(!anc)return null;
   const path=[];let e=el;while(e&&e!==anc){const p=e.parentElement;path.unshift([...p.children].indexOf(e));e=p}
   const id=anc.dataset.uiCardId+'>'+path.join('.');el.dataset.uiCardId=id;el.dataset.uiInner='1';return id;
 }
 window.mfEnsureCardId=innerId;window.mfCardFrom=cardFrom;
 function stableIds(){
   const root=document.getElementById('app');if(!root)return;let cur='x',n=0;
   root.querySelectorAll('[data-bk],'+MF_CARD_SEL).forEach(el=>{
     if(el.closest('#uiCardCustomizer'))return;
     if(el.hasAttribute('data-bk')){cur=el.getAttribute('data-bk').replace('|','-');n=0}
     if(!el.matches(MF_CARD_SEL)||el.dataset.uiInner==='1')return;
     const id=cur+(n?'.'+n:'');n++;
     if(el.dataset.uiAuto==='1'||!el.dataset.uiCardId){el.dataset.uiCardId=id;el.dataset.uiAuto='1'}
   });
 }
 function applyInner(){
   const keys=[...new Set([...Object.keys(styles),...Object.keys(hiddenCards)])].filter(k=>k.includes('>')).sort((a,b)=>a.split('>').length-b.split('>').length);
   keys.forEach(k=>{
     const i=k.lastIndexOf('>'),base=k.slice(0,i),path=k.slice(i+1).split('.').map(Number);
     const anc=[...document.querySelectorAll('#app [data-ui-card-id]')].find(e=>e.dataset.uiCardId===base);if(!anc)return;
     let el=anc;for(const x of path){el=el&&el.children[x]}
     if(el&&el.nodeType===1){el.dataset.uiCardId=k;el.dataset.uiInner='1';if(el.matches('svg')||(el.children.length===1&&el.firstElementChild.matches('svg')))el.setAttribute('data-ui-chart','1')}
   });
 }
 function initIds(){stableIds();applyInner();if(org)markCharts();applyAll()}
 function save(){try{localStorage.setItem('mf-card-custom-styles-v1',JSON.stringify(styles))}catch(e){} if(!window._applyingCloudLayoutPrefs)window.queueLayoutPreferencesSave?.()}
 function saveHidden(){try{localStorage.setItem(hiddenCardsKey,JSON.stringify(hiddenCards))}catch(e){} if(!window._applyingCloudLayoutPrefs)window.queueLayoutPreferencesSave?.()}
 window.getLocalLayoutPreferences=()=>({styles:JSON.parse(JSON.stringify(styles||{})),hiddenCards:JSON.parse(JSON.stringify(hiddenCards||{}))});
 window.applyCloudLayoutPreferences=(prefs)=>{if(!prefs||typeof prefs!=='object')return;window._applyingCloudLayoutPrefs=true;try{if(prefs.styles&&typeof prefs.styles==='object')styles=prefs.styles;if(prefs.hiddenCards&&typeof prefs.hiddenCards==='object')hiddenCards=prefs.hiddenCards;localStorage.setItem('mf-card-custom-styles-v1',JSON.stringify(styles));localStorage.setItem(hiddenCardsKey,JSON.stringify(hiddenCards));applyAll()}catch(e){console.warn('Não foi possível aplicar preferências da nuvem:',e)}finally{window._applyingCloudLayoutPrefs=false}};
 function chartApply(el,d){
   if(!el.__mfOrig)el.__mfOrig={w:el.style.width,h:el.style.height,d:el.style.display,ml:el.style.marginLeft,mr:el.style.marginRight,mw:el.style.maxWidth};
   const o=el.__mfOrig;
   if(!(+d.w||+d.h>0)){el.style.width=o.w;el.style.height=o.h;el.style.display=o.d;el.style.marginLeft=o.ml;el.style.marginRight=o.mr;el.style.maxWidth=o.mw;return}
   el.style.display='block';el.style.marginLeft='auto';el.style.marginRight='auto';el.style.maxWidth='100%';
   el.style.width=(+d.w?d.w+'%':o.w);el.style.height=(+d.h>0?d.h+'px':'auto');
 }
 function apply(el,v){
   if(!el)return;
   const d=v||{};
   if(el.hasAttribute('data-ui-chart')){chartApply(el,d);return}
   el.style.width=(+d.w&&+d.w<100?d.w+'%':'');
   el.style.minHeight=(+d.h>0?d.h+'px':'');
   el.style.padding=(d.p!==undefined?d.p+'px':'');
   el.style.borderRadius=(d.r!==undefined?d.r+'px':'');
   el.style.fontSize=(+d.t&&+d.t!==100?d.t+'%':'');
   el.style.maxWidth=(+d.w&&+d.w<100?'100%':'');
   el.style.setProperty('--ui-inner-radius',(d.cr!==undefined?d.cr:10)+'px');
   el.querySelectorAll('button,input,select,textarea,.layout-chip,.mini-btn').forEach(x=>{x.style.borderRadius='var(--ui-inner-radius)'});
 }
 function applyAll(){allCards().forEach(el=>{const id=el.dataset.uiCardId,st=styles[id],off=!!hiddenCards[id];if(el.dataset.uiInner==='1'&&!st&&!off)return;apply(el,st);if(el.hasAttribute('data-ui-chart')){if(off&&!org)el.style.display='none'}else el.style.display=off&&!org?'none':'';el.classList.toggle('ui-card-off',off&&!!org);});}
 function values(){return selected?(styles[selected.dataset.uiCardId]||{w:100,h:0,p:selected.classList.contains('k')?14:16,r:selected.classList.contains('k')?12:16,t:100}):{}}
 function updateOutputs(){
   $('uiCardWidthOut').textContent=$('uiCardWidth').value+'%';
   $('uiCardHeightOut').textContent=+$('uiCardHeight').value?$('uiCardHeight').value+' px':'Auto';
   $('uiCardPaddingOut').textContent=$('uiCardPadding').value+' px';
   $('uiCardRadiusOut').textContent=$('uiCardRadius').value+' px';
   $('uiCardTextOut').textContent=$('uiCardText').value+'%';
   $('uiCardControlsRadiusOut').textContent=$('uiCardControlsRadius').value+' px';
 }
 function loadSelected(){
   const v=values();
   $('uiCardTitle').textContent=selected?'Editar cartão selecionado':'Personalização dos cartões';
   $('uiCardHelp').textContent=selected?'Ajuste o tamanho e o visual deste cartão. As alterações são salvas automaticamente.':'Ative a edição e toque em qualquer cartão para personalizá-lo.';
   controls.hidden=!selected;{const w=$('uiCardWho');if(w)w.textContent=selected?'Selecionado: '+(selected.textContent||'').replace(/\s+/g,' ').trim().slice(0,38)+((selected.textContent||'').trim().length>38?'…':''):'';const isCh=!!(selected&&selected.hasAttribute('data-ui-chart'));if(w&&isCh)w.textContent='Selecionado: gráfico (só ele)';['uiCardPadding','uiCardRadius','uiCardText','uiCardControlsRadius'].forEach(i=>{const f=$(i)&&$(i).closest('.ui-field');if(f)f.style.display=isCh?'none':''});const pb=$('uiCardParent');if(pb)pb.hidden=!(selected&&window.mfCardFrom&&selected.parentElement&&mfCardFrom(selected.parentElement))}
   if(!selected)return;
   $('uiCardWidth').value=v.w??100;$('uiCardHeight').value=v.h??0;
   $('uiCardPadding').value=v.p??(selected.classList.contains('k')?14:16);
   $('uiCardRadius').value=v.r??(selected.classList.contains('k')?12:16);
   $('uiCardText').value=v.t??100;$('uiCardControlsRadius').value=v.cr??10;$('uiCardHidden').checked=!hiddenCards[selected.dataset.uiCardId];updateOutputs();
 }
 function setVal(){
   if(!selected)return;
   const v={w:+$('uiCardWidth').value,h:+$('uiCardHeight').value,p:+$('uiCardPadding').value,r:+$('uiCardRadius').value,t:+$('uiCardText').value,cr:+$('uiCardControlsRadius').value};
   styles[selected.dataset.uiCardId]=v;apply(selected,v);selected.style.display=hiddenCards[selected.dataset.uiCardId]&&!org?'none':'';save();updateOutputs();
 }
 document.addEventListener('click',e=>{
   const editBtn=e.target.closest('[data-edit-card]');
   if(!editBtn)return;
   e.preventDefault();e.stopPropagation();
   const wrap=editBtn.closest('.blk');
   const el=wrap&&(wrap.querySelector(MF_CARD_SEL)||wrap);
   if(!el)return;
   const blockId=editBtn.dataset.editCard||'bloco';const tabId=(wrap.querySelector('[data-mv]')?.dataset.mv||'tela').split('|')[0];el.dataset.uiCardId=tabId+'-'+blockId;
   if(selected)selected.classList.remove('ui-card-selected');
   selected=el;selected.classList.add('ui-card-selected');
   editing=true;document.body.classList.add('ui-editing');
   toggle.classList.add('active');toggle.textContent='✓ Concluir';toggle.setAttribute('aria-expanded','true');
   panel.style.display='block';panel.classList.add('open');loadSelected();
 },true);
 $('uiCardClose').addEventListener('click',()=>{panel.classList.remove('open');panel.style.display='none';if(selected)selected.classList.remove('ui-card-selected');selected=null;editing=false;document.body.classList.remove('ui-editing');toggle.classList.remove('active');toggle.textContent='✎ Personalizar';toggle.setAttribute('aria-expanded','false');loadSelected();});
 toggle.addEventListener('click',()=>{
   editing=!editing;document.body.classList.toggle('ui-editing',editing);
   toggle.classList.toggle('active',editing);toggle.textContent=editing?'✓ Concluir':'✎ Personalizar';
   toggle.setAttribute('aria-expanded',String(editing));panel.classList.toggle('open',editing);panel.style.display=editing?'block':'none';
   if(!editing){if(selected)selected.classList.remove('ui-card-selected');selected=null;loadSelected();}
   else loadSelected();
 });
 document.addEventListener('click',e=>{
   if(!editing||e.target.closest('#uiCardCustomizer')||e.target.closest('#uiCardEditToggle'))return;
   const el=e.target.closest('.dash-wealth-highlight')||e.target.closest('.dash-payment-summary')||e.target.closest('.c,.k');if(!el||el.closest('#uiCardCustomizer'))return;
   e.preventDefault();e.stopPropagation();
   if(selected)selected.classList.remove('ui-card-selected');
   selected=el;selected.classList.add('ui-card-selected');panel.style.display='block';panel.classList.add('open');loadSelected();
 },true);
 ids.forEach(id=>$(id).addEventListener('input',setVal));
 $('uiCardHidden').addEventListener('change',()=>{if(!selected)return;hiddenCards[selected.dataset.uiCardId]=!$('uiCardHidden').checked;saveHidden();selected.style.display=$('uiCardHidden').checked||org?(selected.hasAttribute('data-ui-chart')&&styles[selected.dataset.uiCardId]?'block':''):'none';selected.classList.toggle('ui-card-off',!$('uiCardHidden').checked&&!!org);});
 $('uiCardCompact').addEventListener('click',()=>{if(!selected)return;$('uiCardWidth').value=100;$('uiCardHeight').value=0;$('uiCardPadding').value=8;$('uiCardRadius').value=10;$('uiCardText').value=90;$('uiCardControlsRadius').value=8;setVal();});
 $('uiCardComfort').addEventListener('click',()=>{if(!selected)return;$('uiCardWidth').value=100;$('uiCardHeight').value=0;$('uiCardPadding').value=22;$('uiCardRadius').value=20;$('uiCardText').value=110;$('uiCardControlsRadius').value=14;setVal();});
 $('uiCardReset').addEventListener('click',()=>{if(!selected)return;delete styles[selected.dataset.uiCardId];apply(selected,{});save();loadSelected();});
 $('uiCardResetAll').addEventListener('click',()=>{if(!confirm('Restaurar o visual original de todos os cartões?'))return;styles={};hiddenCards={};save();saveHidden();allCards().forEach(el=>{apply(el,{});el.style.display='';el.classList.remove('ui-card-off');});if(selected){selected.classList.remove('ui-card-selected');selected=null}loadSelected();});

 document.addEventListener('mf-card-close',()=>{if(selected)selected.classList.remove('ui-card-selected');selected=null;editing=false;document.body.classList.remove('ui-editing');toggle.classList.remove('active');toggle.textContent='✎ Personalizar';toggle.setAttribute('aria-expanded','false');loadSelected()});
 $('uiCardParent').addEventListener('click',()=>{if(!selected||!selected.parentElement)return;const p=mfCardFrom(selected.parentElement);if(p){innerId(p);window.mfOpenCardEditor&&mfOpenCardEditor(p)}});
 document.addEventListener('mf-select-card',function(e){const card=e.detail&&e.detail.card;if(!card)return;if(selected)selected.classList.remove('ui-card-selected');selected=card;selected.classList.add('ui-card-selected');editing=true;document.body.classList.add('ui-editing');panel.style.display='block';panel.classList.add('open');loadSelected();});

 function placeCustomizer(){
   const slot=$('uiCardCustomizerSlot');
   const button=$('uiCardEditToggle'), panel=$('uiCardCustomizer');
   if(slot&&button&&panel){
     if(button.parentElement!==slot){slot.appendChild(button);slot.appendChild(panel);}
     button.style.display='';panel.style.display=panel.classList.contains('open')?'block':'none';
     button.classList.add('in-organize');panel.classList.add('in-organize');
   }else{
     if(button){button.classList.remove('in-organize');button.style.display='none';}
     if(panel){panel.classList.remove('in-organize');const _bd=document.getElementById('uiCardEditBackdrop');if(!(_bd&&_bd.classList.contains('open'))){panel.style.display='none';panel.classList.remove('open');}}
   }
 }
 const observer=new MutationObserver(()=>{placeCustomizer();initIds()});
 observer.observe(document.body,{childList:true,subtree:true});
 placeCustomizer();initIds();
})();
