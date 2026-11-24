/* Original geometric characters: curiosity through gaze, blinking and small gestures. */
(() => {
 document.querySelectorAll('.research-minds').forEach(scene=>{
  const characters=[...scene.querySelectorAll('[data-mind]')],caption=scene.querySelector('figcaption');
  const media=matchMedia('(prefers-reduced-motion: reduce)');let visible=false,paused=document.body.classList.contains('motion-paused'),frame=0,point=null,tourFrame=0,last=0,elapsed=0,active=0;
  const running=()=>visible&&!paused&&!media.matches&&!document.hidden;
  function resetEyes(){characters.forEach(c=>c.querySelectorAll('.mind-pupil').forEach(p=>p.style.transform=''))}
  function tour(now){tourFrame=0;if(!running()){last=0;return}if(last)elapsed+=Math.min(now-last,100);last=now;if(elapsed>=4500){elapsed=0;greet(characters[active++%characters.length]);}tourFrame=requestAnimationFrame(tour)}
  function sync(){if(running()&&!tourFrame)tourFrame=requestAnimationFrame(tour);if(!running()){cancelAnimationFrame(tourFrame);tourFrame=0;last=0;}scene.classList.toggle('is-still',!running());if(!running()){cancelAnimationFrame(frame);frame=0;resetEyes()}}
  function look(){frame=0;if(!running()||!point)return;characters.forEach(c=>{const b=c.getBoundingClientRect(),dx=point.x-b.left-b.width/2,dy=point.y-b.top-b.height/2,len=Math.max(1,Math.hypot(dx,dy));c.querySelectorAll('.mind-pupil').forEach(p=>p.style.transform=`translate(${(dx/len*4).toFixed(2)}px,${(dy/len*3).toFixed(2)}px)`);})}
  scene.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!running())return;point={x:e.clientX,y:e.clientY};if(!frame)frame=requestAnimationFrame(look)});
  scene.addEventListener('pointerleave',()=>{point=null;resetEyes()});
  function show(c){caption.textContent=c.dataset.phrase}
  function greet(c){show(c);if(!running())return;c.classList.remove('is-greeting');void c.getBoundingClientRect();c.classList.add('is-greeting')}
  characters.forEach((c,i)=>{
   c.addEventListener('pointerenter',()=>show(c));c.addEventListener('focus',()=>show(c));c.addEventListener('click',()=>greet(c));
   c.addEventListener('animationend',e=>{if(e.animationName==='mind-pop')c.classList.remove('is-greeting')});
   c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();greet(c)}else if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?characters.length-1:(i+(e.key==='ArrowRight'?1:-1)+characters.length)%characters.length;characters[j].focus()}});
  });
  window.addEventListener('lab-motion',e=>{paused=e.detail.paused;sync()});media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  if('IntersectionObserver' in window)new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()},{threshold:.05}).observe(scene);else visible=true;
  sync();
 });
})();
