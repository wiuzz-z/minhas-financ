
/* Stagger dos cards: entrada em cascata quando a tela abre.
   - Não repete a cada atualização da mesma tela (senão os cartões piscam a cada toque), igual à troca de aba e aos efeitos dos blocos.
   - Bloco com efeito próprio (Editar bloco › Efeitos) usa o efeito e o tempo dele: a cascata não mexe nele.
   - "Animações: Desligadas" e o "reduzir movimento" do aparelho já desligam pelo CSS. */
(window.__mfAD=window.__mfAD||[]).push(function(){
  try{
    var app=document.getElementById('app');
    if(!app)return;
    var scr=typeof mfLkScreen==='function'?mfLkScreen():(typeof tab!=='undefined'?String(tab):'');
    if(window.__mfStagScr===scr)return;
    window.__mfStagScr=scr;
    var nodes=app.querySelectorAll('[data-bk], section[class*="dash-"], .c, .k, .invest-donut-card, .dash-extra-card');
    var i=0,max=14;
    nodes.forEach(function(el){
      if(i>=max)return;
      if(el.closest('.layout-panel'))return;
      if(el.closest('[data-lkan]'))return;
      if(el.dataset.mfStaggered==='1')return;
      el.dataset.mfStaggered='1';
      el.classList.add('mf-stagger');
      el.style.animationDelay=(i*0.045)+'s';
      i++;
      el.addEventListener('animationend',function(){
        el.classList.remove('mf-stagger');
        el.style.animationDelay='';
      },{once:true});
    });
  }catch(e){}
});
