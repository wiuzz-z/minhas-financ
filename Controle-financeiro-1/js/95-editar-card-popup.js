
(function(){
 const $=id=>document.getElementById(id);
 function ensureBackdrop(){let b=$('uiCardEditBackdrop');if(!b){b=document.createElement('div');b.id='uiCardEditBackdrop';document.body.appendChild(b);b.addEventListener('click',()=>closePopup())}return b}
 function closePopup(quiet){const p=$('uiCardCustomizer'),b=$('uiCardEditBackdrop');if(p){p.classList.remove('open');p.style.display='none'}if(b)b.classList.remove('open');if(window.__mfSelectedCard){window.__mfSelectedCard.classList.remove('ui-card-selected');window.__mfSelectedCard=null}if(quiet!==true)document.dispatchEvent(new Event('mf-card-close'))}
 ensureBackdrop();
 function openFor(target){
  const panel=$('uiCardCustomizer');if(!panel||!target)return;
  if(window.mfEnsureCardId)mfEnsureCardId(target);
  if(window.__mfSelectedCard&&window.__mfSelectedCard!==target)window.__mfSelectedCard.classList.remove('ui-card-selected');
  window.__mfSelectedCard=target;target.classList.add('ui-card-selected');
  const backdrop=ensureBackdrop();backdrop.classList.add('open');
  document.dispatchEvent(new CustomEvent('mf-select-card',{detail:{card:target}}));
  panel.classList.add('open');panel.style.setProperty('display','block','important');
  panel.style.setProperty('position','fixed','important');panel.style.setProperty('left','50%','important');panel.style.setProperty('top','50%','important');panel.style.setProperty('right','auto','important');panel.style.setProperty('bottom','auto','important');panel.style.setProperty('transform','translate(-50%,-50%)','important');panel.style.setProperty('z-index','10020','important');panel.style.setProperty('width','min(330px,calc(100vw - 28px))','important');panel.style.setProperty('max-height','76dvh','important');panel.style.setProperty('overflow','auto','important');
 }
 window.mfOpenCardEditor=openFor;
 document.addEventListener('click',function(e){
  const btn=e.target.closest('[data-edit-card]');if(!btn)return;
  const block=btn.closest('.blk');if(!block)return;
  openFor(block.querySelector(MF_CARD_SEL)||block);
 },true);
 // Em Organizar: tocar em qualquer cartão (mesmo dentro de um bloco) abre a edição só dele.
 document.addEventListener('click',function(e){
  if(!document.body.classList.contains('org-on'))return;
  const t=e.target;if(!t||!t.closest)return;
  if(t.closest('#uiCardCustomizer,#uiCardEditBackdrop,.layout-panel,.blk>.mv,#mf-mv-sheet,nav,.header-bar,.mf-toast'))return;
  if(!t.closest('#app'))return;
  const el=window.mfCardFrom&&mfCardFrom(t);if(!el)return;
  e.preventDefault();e.stopPropagation();openFor(el);
 },true);
 document.addEventListener('mf-card-close',()=>closePopup(true));
 const close=$('uiCardClose');if(close)close.addEventListener('click',function(){closePopup(true)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closePopup()});
})();
