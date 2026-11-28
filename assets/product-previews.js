(() => {
 const root=document.querySelector('.product-explorer');if(!root)return;
 const tabs=[...root.querySelectorAll('.product-tab')],panels=tabs.map(t=>document.getElementById(t.getAttribute('aria-controls')));
 const media=matchMedia('(prefers-reduced-motion: reduce)');const pause=root.querySelector('[data-product-pause]');let paused=media.matches,visible=true;
 function select(i,focus=false){tabs.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=i===j?0:-1;panels[j].hidden=i!==j});if(focus)tabs[i].focus();window.dispatchEvent(new Event('lab-motion'));}
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(i));t.addEventListener('keydown',e=>{const d={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];const n=d?(i+d+tabs.length)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;if(n===null)return;e.preventDefault();select(n,true)})});
 function motion(){root.classList.toggle('previews-paused',paused||media.matches);pause.textContent=paused||media.matches?'Play previews':'Pause previews';pause.setAttribute('aria-pressed',String(paused||media.matches));window.dispatchEvent(new Event('lab-motion'));}
 pause.addEventListener('click',()=>{paused=!paused;motion()});media.addEventListener('change',()=>{paused=media.matches;motion()});
 function hash(){const id=location.hash.slice(1);const target=document.getElementById(id);const index=panels.findIndex(p=>p===target||p.contains(target));if(index>=0)select(index)}
 window.addEventListener('hashchange',hash);select(0);hash();motion();
 let phase=0;setInterval(()=>{if(paused||media.matches||document.hidden||!visible)return;phase=(phase+1)%3;panels.filter(p=>!p.hidden).forEach(p=>p.dataset.productPhase=String(phase))},2600);
 new IntersectionObserver(([e])=>{visible=e.isIntersecting},{threshold:.01}).observe(root);
})();
