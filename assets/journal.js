/* TravelLabs field journal. Small, local interactions; no external services. */
(() => {
  'use strict';
  const header = document.querySelector('.header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu() { header?.classList.remove('menu-open'); menu?.setAttribute('aria-expanded', 'false'); }
  menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; header.classList.toggle('menu-open', open); menu.setAttribute('aria-expanded', String(open)); });
  nav?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (header && !header.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && header?.classList.contains('menu-open')) { closeMenu(); menu.focus(); } });

  const tabs = [...document.querySelectorAll('.product-tab')];
  function selectProduct(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectProduct(tab));
    tab.addEventListener('keydown', e => {
      let target;
      if (['ArrowDown', 'ArrowRight'].includes(e.key)) target = (index + 1) % tabs.length;
      if (['ArrowUp', 'ArrowLeft'].includes(e.key)) target = (index - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') target = 0;
      if (e.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { e.preventDefault(); selectProduct(tabs[target], true); }
    });
  });
  function followHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    if (target.matches('details')) target.open = true;
    if (target.matches('.product-panel')) selectProduct(document.getElementById(target.getAttribute('aria-labelledby')));
  }
  window.addEventListener('hashchange', followHash);
  document.querySelectorAll('a[href="#model-roadmap"]').forEach(link => link.addEventListener('click', () => { document.getElementById('model-roadmap').open = true; }));
  followHash();

  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = [...document.querySelectorAll('.motion-toggle')];
  const trunk = document.querySelector('.trunk-companion');
  const replay = document.querySelector('.trunk-replay');
  let paused = media.matches, trunkVisible = false, arrived = false;
  function arrive() {
    if (!trunk || paused || media.matches) return;
    arrived = true; trunk.classList.remove('arriving');
    requestAnimationFrame(() => requestAnimationFrame(() => trunk.classList.add('arriving')));
  }
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused);
    document.body.classList.toggle('motion-off', paused);
    buttons.forEach(button => {
      button.hidden = false; button.disabled = media.matches;
      button.textContent = media.matches ? 'Still artwork · reduced motion' : paused ? 'Play animation' : 'Pause animation';
      button.setAttribute('aria-pressed', String(paused));
      button.title = media.matches ? 'Your device requests reduced motion. The artwork remains still.' : 'Control all animated artwork on this page';
    });
    if (replay) { replay.disabled = paused; replay.textContent = media.matches ? 'Still pose · reduced motion' : paused ? 'Play animation to say hello' : 'Say hello again'; }
    window.dispatchEvent(new CustomEvent('lab-motion', { detail: { paused } }));
    if (trunkVisible && !arrived && trunk.querySelector('img').complete) arrive();
  }
  buttons.forEach(button => button.addEventListener('click', () => { if (media.matches) return; paused = !paused; updateMotion(); }));
  media.addEventListener('change', () => { paused = media.matches; updateMotion(); });
  replay?.addEventListener('click', arrive);
  if (trunk) {
    const image = trunk.querySelector('img');
    image.addEventListener('load', () => { if (trunkVisible && !arrived) arrive(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { trunkVisible = entry.isIntersecting; if (trunkVisible && image.complete && !arrived) arrive(); }, { threshold: .65 }).observe(trunk);
    else { trunkVisible = true; if (image.complete) arrive(); }
  }
  updateMotion();

  const scenes = [], TAU = Math.PI * 2;
  let raf = 0, last = 0, time = 0;
  const rnd = (i, seed = 1) => { const n = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return n - Math.floor(n); };
  function imageSpace(scene) {
    const image = scene.image;
    if (!image?.naturalWidth) return null;
    const scale = Math.max(scene.w / image.naturalWidth, scene.h / image.naturalHeight);
    return { scale, x: (scene.w - image.naturalWidth * scale) / 2, y: (scene.h - image.naturalHeight * scale) / 2, w: image.naturalWidth, h: image.naturalHeight };
  }
  function pathPoint(t) {
    const a = 1 - t;
    return { x: a*a*.036 + 2*a*t*.317 + t*t*.745, y: a*a*.935 + 2*a*t*.701 + t*t*.696, dx: 2*a*(.317-.036)+2*t*(.745-.317), dy: 2*a*(.701-.935)+2*t*(.696-.701) };
  }
  function train(ctx, w, h, t) {
    const journey = (t / 34) % 1;
    if (journey < .08 || journey > .94) return;
    ctx.save(); ctx.globalAlpha = Math.min(1, (journey-.08)*12, (.94-journey)*15);
    for (let i = 2; i >= 0; i--) {
      const k = journey - i * .029, p = pathPoint(k);
      const scale = (1.15 - k * .63) * w / 1672;
      ctx.save(); ctx.translate(p.x*w, p.y*h); ctx.rotate(Math.atan2(p.dy*h,p.dx*w)); ctx.scale(scale,scale);
      ctx.fillStyle='rgba(24,44,34,.22)';ctx.beginPath();ctx.ellipse(0,1,21,3,0,0,TAU);ctx.fill();
      ctx.fillStyle='#2e5d52';ctx.fillRect(-19,-21,37,19);ctx.fillStyle='#67857a';ctx.fillRect(-19,-23,37,4);
      ctx.fillStyle='#d4b86f';ctx.fillRect(-19,-7,37,2);ctx.fillStyle='#e6e2bb';
      for(let j=0;j<4;j++)ctx.fillRect(-14+j*8,-18,5,7);
      ctx.fillStyle='#293e34';ctx.beginPath();ctx.arc(-11,-1,2.3,0,TAU);ctx.arc(11,-1,2.3,0,TAU);ctx.fill();ctx.restore();
    }
    ctx.restore();
  }
  function drawJourney(s, t) {
    const {ctx} = s, box = imageSpace(s); if (!box) return;
    ctx.save();ctx.translate(box.x,box.y);ctx.scale(box.scale,box.scale);
    const w=box.w,h=box.h;
    // Ripples stay within the open bay, above the viaduct.
    for(let i=0;i<42;i++){
      const x=(.19+rnd(i,3)*.32)*w, y=(.65+rnd(i,8)*.053)*h;
      const a=(Math.sin(t*1.8+i*.7)*.5+.5)*.28;
      ctx.strokeStyle=`rgba(255,250,218,${a})`;ctx.lineWidth=.8;
      ctx.beginPath();ctx.moveTo(x+Math.sin(t*.5+i)*3,y);ctx.lineTo(x+5+rnd(i,1)*18+Math.sin(t*.5+i)*3,y);ctx.stroke();
    }
    // A real journey in the scene, rather than moving the entire painting.
    train(ctx,w,h,t+8);
    for(let i=0;i<3;i++){
      const x=((t*.004+i*.32)%1)*w, y=h*(.17+i*.038);
      const g=ctx.createRadialGradient(x,y,0,x,y,w*.075);g.addColorStop(0,'rgba(255,252,237,.13)');g.addColorStop(1,'rgba(255,252,237,0)');ctx.fillStyle=g;ctx.fillRect(x-w*.08,y-h*.08,w*.16,h*.16);
    }
    ctx.restore();
  }
  function drawStudio(s,t){
    const box=imageSpace(s);if(!box)return;const {ctx}=s;
    ctx.save();ctx.translate(box.x,box.y);ctx.scale(box.scale,box.scale);
    const w=box.w,h=box.h;
    // Steam rises from the cup; a point travels along the sketched route on the glass.
    for(let i=0;i<3;i++){
      const k=(t*.16+i/3)%1;
      ctx.strokeStyle=`rgba(255,255,243,${Math.sin(k*Math.PI)*.42})`;ctx.lineWidth=1.4;
      ctx.beginPath();ctx.moveTo(w*(.815+i*.006),h*(.69-k*.055));ctx.bezierCurveTo(w*(.82+Math.sin(t+i)*.003),h*(.67-k*.055),w*(.81+Math.cos(t+i)*.003),h*(.65-k*.055),w*.819,h*(.63-k*.055));ctx.stroke();
    }
    const u=(t*.05)%1,x=w*(.06+.21*u),y=h*(.38-.08*Math.sin(u*Math.PI));
    ctx.fillStyle='rgba(78,119,120,.6)';ctx.beginPath();ctx.arc(x,y,2.2,0,TAU);ctx.fill();
    ctx.restore();
  }
  function drawNight(s,t){
    const box=imageSpace(s);if(!box)return;const {ctx}=s;ctx.save();ctx.translate(box.x,box.y);ctx.scale(box.scale,box.scale);const w=box.w,h=box.h;
    for(let i=0;i<40;i++){
      const x=(.13+rnd(i,8)*.57)*w,y=(.04+rnd(i,13)*.42)*h;
      ctx.fillStyle=`rgba(245,244,212,${.1+Math.max(0,Math.sin(t*.55+i))* .48})`;ctx.beginPath();ctx.arc(x,y,.5+rnd(i,4)*.65,0,TAU);ctx.fill();
    }
    for(let i=0;i<5;i++){
      const x=w*(.15+rnd(i,7)*.35+Math.sin(t*.06+i)*.015),y=h*(.65+rnd(i,3)*.23);
      const fog=ctx.createRadialGradient(x,y,0,x,y,w*.13);fog.addColorStop(0,`rgba(181,205,223,${.04+Math.sin(t*.15+i)*.025})`);fog.addColorStop(1,'rgba(181,205,223,0)');ctx.fillStyle=fog;ctx.fillRect(0,h*.55,w*.55,h*.45);
    }
    ctx.restore();
  }
  function drawFrontier(s,t){
    const {ctx,w,h}=s;ctx.save();
    for(let line=0;line<52;line++){
      const start=(line/51)*h*.78+h*.04;
      ctx.strokeStyle=`rgba(64,105,78,${.12+(line%7===0?.14:0)})`;ctx.lineWidth=line%7===0?1.1:.55;
      ctx.beginPath();
      for(let i=0;i<=70;i++){
        const u=i/70,x=u*w,y=start*(1-u)+h*.36*u+Math.sin(u*6+line*.1+t*.18)*Math.sin(u*Math.PI)*h*.18;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }ctx.stroke();
      if(line%7===0){const u=(t*.035+line*.031)%1,x=u*w,y=start*(1-u)+h*.36*u+Math.sin(u*6+line*.1+t*.18)*Math.sin(u*Math.PI)*h*.18;ctx.fillStyle='#b28e46';ctx.beginPath();ctx.arc(x,y,2,0,TAU);ctx.fill();}
    }
    ctx.restore();
  }
  function drawPixels(s,t){
    const {ctx,w,h}=s,step=5;
    for(let x=0;x<w;x+=step)for(let y=0;y<h;y+=step){const d=Math.hypot((x-w*.5)/w,(y-h*.5)/h);const wave=Math.sin(x*.065+t*.35)+Math.cos(y*.1-t*.3);if(d<.5&&wave>.25){ctx.fillStyle=`rgba(78,115,76,${Math.max(0,.4-d)*1.1})`;ctx.fillRect(x,y,2,2);}}
  }
  const painters={journey:drawJourney,studio:drawStudio,night:drawNight,frontier:drawFrontier,pixels:drawPixels};
  function paint(s){
    const rect=s.canvas.getBoundingClientRect();if(rect.width<2||rect.height<2)return;
    const w=Math.round(rect.width),h=Math.round(rect.height),dpr=Math.min(devicePixelRatio||1,1.5);
    if(w!==s.w||h!==s.h){s.w=w;s.h=h;s.canvas.width=Math.round(w*dpr);s.canvas.height=Math.round(h*dpr);s.ctx.setTransform(dpr,0,0,dpr,0,0);}
    s.ctx.clearRect(0,0,w,h);painters[s.canvas.dataset.scene]?.(s,time);
  }
  const canAnimate=()=>!paused&&!media.matches&&!document.hidden;
  function schedule(){if(!raf&&canAnimate()&&scenes.some(s=>s.visible))raf=requestAnimationFrame(tick);}
  function tick(now){raf=0;if(!canAnimate())return;if(!last)last=now;const delta=now-last;if(delta>=40){time+=Math.min(delta,120)/1000;last=now;scenes.forEach(s=>{if(s.visible)paint(s);});}schedule();}
  document.querySelectorAll('canvas[data-scene]').forEach(canvas=>{
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const s={canvas,ctx,w:0,h:0,visible:false,image:canvas.parentElement.querySelector('.scene-image')};scenes.push(s);
    if(s.image){s.image.addEventListener('load',()=>{paint(s);schedule();});}
    if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{s.visible=entry.isIntersecting;if(s.visible){paint(s);schedule();}},{rootMargin:'100px'}).observe(canvas);else s.visible=true;
    if('ResizeObserver' in window)new ResizeObserver(()=>{paint(s);schedule();}).observe(canvas);else window.addEventListener('resize',()=>paint(s));
    paint(s);
  });
  window.addEventListener('lab-motion',()=>{last=0;schedule();});
  document.addEventListener('visibilitychange',()=>{last=0;schedule();});
  schedule();
})();
