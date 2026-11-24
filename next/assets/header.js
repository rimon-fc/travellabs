(() => {
 const header=document.querySelector('.unified-site-header .site-nav-row');
 if(!header)return;
 const menu=header.querySelector('.header-menu'),nav=header.querySelector('nav');
 const compact=matchMedia('(max-width:1120px)');
 const close=()=>{header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false')};
 compact.addEventListener('change',()=>close());
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';header.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open))});
 nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});
 document.addEventListener('click',e=>{if(!header.contains(e.target))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('menu-open')){close();menu.focus()}});
})();
