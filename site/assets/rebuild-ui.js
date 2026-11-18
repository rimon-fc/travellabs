(()=>{'use strict';
const media=matchMedia('(prefers-reduced-motion: reduce)');
let manual=false;try{manual=localStorage.getItem('travellabs-fancy-pause')==='true'}catch{}
window.TLMotion={paused:manual||media.matches,reduced:media.matches};
const button=document.getElementById('motion-toggle');
function update(){window.TLMotion.paused=manual||media.matches;window.TLMotion.reduced=media.matches;document.body.classList.toggle('motion-off',window.TLMotion.paused);button.textContent=media.matches?'Reduced motion ✓':manual?'Resume motion ▷':'Pause motion Ⅱ';button.setAttribute('aria-pressed',String(window.TLMotion.paused));window.dispatchEvent(new CustomEvent('lab-motion',{detail:{paused:window.TLMotion.paused}}))}
button.addEventListener('click',()=>{if(media.matches)return;manual=!manual;try{localStorage.setItem('travellabs-fancy-pause',String(manual))}catch{}update()});media.addEventListener('change',update);update();
const menu=document.getElementById('menu-toggle'),nav=document.getElementById('site-nav');
function close(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu +'}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close −':'Menu +'});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();menu.focus()}});
document.addEventListener('click',e=>{if(e.target!==menu&&!nav.contains(e.target))close()});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
})();
