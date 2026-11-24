/* TravelLabs field journal. Small, local interactions; no external services. */
(() => {
  'use strict';
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
  // Surveyed near-rail contact points in the original 1672 x 941 painting.
  // Interpolate the rail itself, rather than a shortcut across the bend.
  function pathPoint(t) {
    const rail = [[-100,1100],[50,980],[150,915],[200,880],[300,826],[400,776],
      [500,741],[600,714],[700,695],[800,682],[900,672],[1000,665],
      [1100,660],[1200,657],[1280,656],[1400,658]];
    const x=50+1230*t;
    let i=0;while(i<rail.length-2 && x>rail[i+1][0]) i++;
    const [x0,y0]=rail[i],[x1,y1]=rail[i+1],d=x1-x0,u=(x-x0)/d;
    const prev=rail[Math.max(0,i-1)],next=rail[Math.min(rail.length-1,i+2)];
    const m0=(y1-prev[1])/(x1-prev[0]),m1=(next[1]-y0)/(next[0]-x0);
    const y=(2*u*u*u-3*u*u+1)*y0+(u*u*u-2*u*u+u)*d*m0+(-2*u*u*u+3*u*u)*y1+(u*u*u-u*u)*d*m1;
    const slope=((6*u*u-6*u)*y0+(3*u*u-4*u+1)*d*m0+(-6*u*u+6*u)*y1+(3*u*u-2*u)*d*m1)/d;
    return {x:x/1672,y:y/941,dx:1230/1672,dy:slope*1230/941};
  }
  function train(ctx, w, h, t) {
    const journey = (t / 34) % 1;
    if (journey < .08) return;
    const sizeAt = k => 1.7 * (1.15 - Math.max(0,k) * .63) * w / 1672;
    const cars = [];
    let k = journey;
    for (let i=0;i<3;i++) {
      const rail=pathPoint(k),scale=sizeAt(k);
      const speed=Math.hypot(rail.dx*w,rail.dy*h);
      const rear=pathPoint(k-18*scale/speed),front=pathPoint(k+17*scale/speed);
      const angle=Math.atan2((front.y-rear.y)*h,(front.x-rear.x)*w);
      // Fit both bogies to the rail chord, with wheel rims at the contact line.
      const p={x:(rear.x+front.x)/2+.5*scale*Math.cos(angle)/w,
        y:(rear.y+front.y)/2+.5*scale*Math.sin(angle)/h};
      cars.push({k,p,scale,angle});
      // Place connected carriages by distance along the track, including perspective.
      let next=k;
      for(let j=0;j<3;j++) {
        const mid=pathPoint((k+next)*.5);
        const speed=Math.hypot(mid.dx*w,mid.dy*h);
        next=k-(28*(scale+sizeAt(next))+4*scale)/Math.max(speed,1);
      }
      k=next;
    }
    ctx.save();ctx.globalAlpha=Math.min(1,(journey-.08)*12);
    // The painted railway disappears behind this hillside before the station
    // fence. Occlude each carriage at that edge, rather than driving over the
    // platform or fading the whole train while it is still on the bridge.
    ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(1115*w/1672,0);
    for(const [x,y] of [[1115,595],[1108,609],[1117,622],[1110,636],[1120,650],[1124,661],[1124,941]])ctx.lineTo(x*w/1672,y*h/941);
    ctx.lineTo(-w,h);ctx.closePath();ctx.clip();
    for(let i=0;i<cars.length-1;i++) {
      const a=cars[i],b=cars[i+1];
      ctx.strokeStyle='#414d42';ctx.lineWidth=3*Math.min(a.scale,b.scale);
      ctx.beginPath();ctx.moveTo(a.p.x*w,a.p.y*h-7*a.scale);ctx.lineTo(b.p.x*w,b.p.y*h-7*b.scale);ctx.stroke();
    }
    for(let i=cars.length-1;i>=0;i--) {
      const {p,scale,angle}=cars[i];
      ctx.save();ctx.translate(p.x*w,p.y*h);ctx.rotate(angle);ctx.scale(scale,scale);ctx.translate(0,-.9);
      ctx.fillStyle='rgba(24,44,34,.24)';ctx.beginPath();ctx.ellipse(0,1,30,3.2,0,0,TAU);ctx.fill();
      // Bogies sit on the rail; a continuous underframe connects the carriage body.
      ctx.fillStyle='#293b33';ctx.fillRect(-24,-9,48,5);
      for(const bogie of [-18,17]) {
        ctx.fillStyle='#35443a';ctx.fillRect(bogie-5,-5.5,11,4);
        for(const offset of [-3,4]){ctx.fillStyle='#25372e';ctx.beginPath();ctx.arc(bogie+offset,-1.6,2.5,0,TAU);ctx.fill();ctx.fillStyle='#899383';ctx.beginPath();ctx.arc(bogie+offset,-1.6,.8,0,TAU);ctx.fill();}
      }
      // A regional electric train: rounded cab, glazed windows, doors and a pale roof.
      ctx.fillStyle='#285a4e';ctx.beginPath();
      ctx.moveTo(-27,-7);ctx.lineTo(-27,-29);ctx.quadraticCurveTo(-27,-34,-21,-34);
      ctx.lineTo(i===0?17:23,-34);
      if(i===0){ctx.quadraticCurveTo(23,-33,26,-25);ctx.lineTo(29,-13);ctx.quadraticCurveTo(30,-7,25,-7);}
      else{ctx.quadraticCurveTo(28,-34,28,-29);ctx.lineTo(28,-7);}
      ctx.closePath();ctx.fill();
      ctx.fillStyle='#51786a';ctx.fillRect(-25,-13,49,5);
      ctx.fillStyle='#d4be7e';ctx.fillRect(-26,-15,51,2);
      ctx.fillStyle='#b6beb0';ctx.beginPath();ctx.moveTo(-26,-29);ctx.quadraticCurveTo(-27,-34,-20,-35);ctx.lineTo(16,-35);ctx.quadraticCurveTo(23,-34,25,-29);ctx.closePath();ctx.fill();
      ctx.fillStyle='#899c8c';ctx.fillRect(-17,-35,14,1.8);ctx.fillRect(2,-35,9,1.8);
      // Window mullions, reflections and door panels remain readable at hero scale.
      for(let j=0;j<4;j++) {
        const x=-21+j*9;ctx.fillStyle='#193f39';ctx.fillRect(x-1,-28,7,11);
        ctx.fillStyle='#c7d4bd';ctx.fillRect(x,-27,5,8);
        ctx.fillStyle='#e5e2c2';ctx.fillRect(x,-27,1.2,8);ctx.fillStyle='#8faea1';ctx.fillRect(x+1,-20,4,1);
      }
      ctx.strokeStyle='#8aa390';ctx.lineWidth=.6;ctx.strokeRect(-25,-28,7,20);ctx.strokeRect(15,-27,8,19);
      ctx.fillStyle='#bdcdb7';ctx.fillRect(17,-25,4,6);
      ctx.fillStyle='#d9ce9e';ctx.fillRect(21,-17,1,2);
      if(i===0){
        ctx.fillStyle='#194740';ctx.beginPath();ctx.moveTo(18,-29);ctx.lineTo(22,-28);ctx.lineTo(25,-21);ctx.lineTo(19,-21);ctx.closePath();ctx.fill();
        ctx.fillStyle='#a3bfb2';ctx.fillRect(19,-27,2,5);
        ctx.fillStyle='#f5e8b3';ctx.beginPath();ctx.arc(27,-12,1.3,0,TAU);ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // Animate the painted boats themselves. Feathered source patches keep the
  // original brushwork and reflections; their edges remain in open water.
  function prepareSailboats(s) {
    const regions = [
      {x:418,y:599,w:30,h:45,drift:2.2,phase:1.4},
      {x:480,y:592,w:62,h:92,drift:6,phase:0},
      {x:607,y:598,w:30,h:44,drift:2.6,phase:3.2}
    ];
    return regions.map(boat => {
      const layer=document.createElement('canvas');layer.width=boat.w;layer.height=boat.h;
      const c=layer.getContext('2d');
      c.drawImage(s.image,boat.x,boat.y,boat.w,boat.h,0,0,boat.w,boat.h);
      c.globalCompositeOperation='destination-in';
      for(const horizontal of [true,false]) {
        const length=horizontal?boat.w:boat.h;
        const mask=c.createLinearGradient(0,0,horizontal?length:0,horizontal?0:length);
        mask.addColorStop(0,'transparent');mask.addColorStop(.18,'#000');
        mask.addColorStop(.82,'#000');mask.addColorStop(1,'transparent');
        c.fillStyle=mask;c.fillRect(0,0,boat.w,boat.h);
      }
      return {...boat,layer};
    });
  }
  function sailboats(s,t) {
    if(!s.sailboats)s.sailboats=prepareSailboats(s);
    for(const boat of s.sailboats) {
      const dx=Math.sin(t*.16+boat.phase)*boat.drift;
      const dy=Math.sin(t*.72+boat.phase)*.45;
      s.ctx.drawImage(boat.layer,boat.x+dx,boat.y+dy);
    }
  }
  function aeroplane(ctx,w,h,t,night=false) {
    // A distant airliner crosses the open sky below the headline, above the
    // mountain ridge. Its soft colours sit within the painted landscape.
    const u=((t+22)/58)%1;
    const x=w*(.18+u*(night?.48:.52)),y=h*((night?.27:.485)-u*.052);
    ctx.save();ctx.translate(x,y);ctx.rotate(-.055);ctx.scale(night?.65:.85,night?.65:.85);
    ctx.globalAlpha=Math.min(1,u*12,(1-u)*12)*.92;
    const path=(points,fill)=>{ctx.fillStyle=fill;ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fill();};
    // Far wing, tailplane, then the sunlit fuselage and near wing.
    path([[-7,-2],[-18,-18],[-12,-19],[10,-2]],'#c3d6dd');
    path([[-22,-1],[-31,-10],[-25,-10],[-16,-1]],'#d9e3df');
    ctx.fillStyle=night?'#9cacba':'#f3eee0';ctx.beginPath();ctx.moveTo(-29,-3);
    ctx.bezierCurveTo(-9,-4,17,-5,25,-2);ctx.quadraticCurveTo(33,1,25,3);
    ctx.bezierCurveTo(6,5,-13,4,-29,1);ctx.closePath();ctx.fill();
    path([[-29,-2],[-32,-12],[-27,-13],[-20,-2]],'#648e91');
    path([[-2,1],[-16,20],[-9,21],[12,2]],'#e6e5d8');
    ctx.strokeStyle='#9bb5bb';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(-26,2);ctx.quadraticCurveTo(0,6,26,2);ctx.stroke();
    ctx.fillStyle='#557d8d';ctx.fillRect(19,-2,4,1.4);
    for(let i=0;i<8;i++)ctx.fillRect(-13+i*3.4,-1.5,1.2,1);
    ctx.fillStyle='#9bb3b5';ctx.beginPath();ctx.ellipse(1,10,4,1.5,-.1,0,TAU);ctx.fill();
    if(night){
      ctx.fillStyle='#e8b3a0';ctx.beginPath();ctx.arc(-10,20,1.2,0,TAU);ctx.fill();
      ctx.fillStyle='#a6d5c5';ctx.beginPath();ctx.arc(-12,-18,1.2,0,TAU);ctx.fill();
      ctx.fillStyle=`rgba(255,244,216,${.35+.65*Math.pow(Math.max(0,Math.sin(t*2.5)),12)})`;
      ctx.beginPath();ctx.arc(-28,-11,1.8,0,TAU);ctx.fill();
    }
    ctx.restore();
  }

  function drawJourney(s, t) {
    const {ctx} = s, box = imageSpace(s); if (!box) return;
    ctx.save();ctx.translate(box.x,box.y);ctx.scale(box.scale,box.scale);
    const w=box.w,h=box.h;
    sailboats(s,t);
    aeroplane(ctx,w,h,t);
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
  function airportTaxi(s,t){
    const {ctx,image}=s;
    if(!s.taxi){
      const plate=document.createElement('canvas');plate.width=290;plate.height=96;
      const p=plate.getContext('2d');
      // A horizontal runway/sea plate sampled inside the same window pane.
      // Feather only its edges, keeping a fully opaque area over the old plane.
      p.drawImage(image,1143,391,75,96,0,0,290,96);
      p.globalCompositeOperation='destination-in';
      for(const horizontal of [true,false]){
        const length=horizontal?290:96;
        const g=p.createLinearGradient(0,0,horizontal?length:0,horizontal?0:length);
        g.addColorStop(0,'transparent');g.addColorStop(.08,'#000');g.addColorStop(.92,'#000');g.addColorStop(1,'transparent');
        p.fillStyle=g;p.fillRect(0,0,290,96);
      }
      const plane=document.createElement('canvas');plane.width=212;plane.height=78;
      const a=plane.getContext('2d');a.beginPath();
      const outline=[[1230,405],[1242,405],[1267,435],[1383,435],[1405,439],[1426,449],[1423,454],[1404,458],[1404,473],[1394,474],[1394,459],[1360,460],[1353,470],[1338,472],[1328,467],[1321,472],[1310,473],[1308,468],[1308,461],[1274,457],[1250,449],[1225,446],[1224,441],[1243,438]];
      outline.forEach(([x,y],i)=>i?a.lineTo(x-1220,y-400):a.moveTo(x-1220,y-400));a.closePath();a.clip();
      a.drawImage(image,1220,400,212,78,0,0,212,78);
      s.taxi={plate,plane};
    }
    ctx.drawImage(s.taxi.plate,1194,391);
    // The plane travels left-to-right, hidden by the window mullion at entry.
    // Wrap only once the entire aircraft has left the picture.
    const dx=((t*7+330)%700)-330;
    ctx.save();ctx.beginPath();ctx.rect(1138,390,398,100);ctx.clip();
    ctx.drawImage(s.taxi.plane,1220+dx,400);ctx.restore();
  }
  function drawStudio(s,t){
    const box=imageSpace(s);if(!box)return;const {ctx}=s;
    ctx.save();ctx.translate(box.x,box.y);ctx.scale(box.scale,box.scale);
    const w=box.w,h=box.h;
    airportTaxi(s,t);
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
    aeroplane(ctx,w,h,t,true);
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
