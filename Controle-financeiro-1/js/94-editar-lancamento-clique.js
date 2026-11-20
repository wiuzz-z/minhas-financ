
document.addEventListener('click',function(e){const btn=e.target.closest('.tx-row-edit[data-e]');if(!btn)return;e.preventDefault();e.stopPropagation();const id=btn.getAttribute('data-e');if(id)openTxEditModal(id)},true);
