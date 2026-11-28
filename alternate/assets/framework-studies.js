(() => {
 const root=document.querySelector('.framework-studies');if(!root)return;
 const button=document.querySelector('[data-framework-pause]');const media=matchMedia('(prefers-reduced-motion: reduce)');let paused=false,visible=!('IntersectionObserver' in window);
 function sync(){root.classList.toggle('framework-paused',paused||media.matches||document.hidden||!visible);button.disabled=media.matches;button.textContent=media.matches?'Reduced motion':paused?'Play diagrams':'Pause diagrams';button.setAttribute('aria-pressed',String(paused||media.matches));}
 button.hidden=false;button.addEventListener('click',()=>{paused=!paused;sync()});media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()}).observe(root);
 sync();
})();
