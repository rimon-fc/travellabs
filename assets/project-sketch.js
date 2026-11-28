/* MCPX research postcards: deterministic ink drawings, with independent playback. */
(() => {
  const C = {ink:'#2b2a2e',paper:'#fbf7ee',blue:'#5b7be0',coral:'#ef7a62',yellow:'#f5c451',green:'#69a883',pink:'#f3a9c6',lilac:'#b9a8ea',ultra:'#2a3bff',lime:'#d7ff3c',rule:'#d8d1c0'};
  const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  function drawScene(key, stage, progress) {
    let out = '', seed = 71 + Math.floor(progress * 4) % 2;
    const rand = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
    const wobble = n => +(n + (rand() - .5) * 1.5).toFixed(2);
    const line = (points, color=C.ink, width=1.8, dash='') => {
      const d=points.map((p,i)=>(i?'L':'M')+wobble(p[0])+','+wobble(p[1])).join(' ');
      out+=`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
    };
    const polygon = (points, fill=C.paper) => {
      const p=points.map(x=>`${wobble(x[0])},${wobble(x[1])}`).join(' ');
      out+=`<polygon points="${p}" fill="${fill}" transform="translate(3 3)"/><polygon points="${p}" fill="none" stroke="${C.ink}" stroke-width="1.7" stroke-linejoin="round"/>`;
    };
    const box=(x,y,w,h,fill=C.paper)=>polygon([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],fill);
    const circle=(x,y,r,fill=C.paper)=>polygon(Array.from({length:20},(_,i)=>[x+Math.cos(i*Math.PI/10)*r,y+Math.sin(i*Math.PI/10)*r]),fill);
    const text=(s,x,y,size=22,color=C.ink,anchor='start',mono=false)=>{
      out+=`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="${mono?'Geist Mono,monospace':'Caveat,Comic Sans MS,cursive'}" font-size="${size}" font-weight="${mono?500:600}">${escape(s)}</text>`;
    };
    const tick=(x,y,color=C.ultra)=>line([[x-5,y],[x,y+5],[x+10,y-8]],color,3);
    const cross=(x,y)=>{line([[x-5,y-5],[x+5,y+5]],C.coral,3);line([[x+5,y-5],[x-5,y+5]],C.coral,3)};
    const packet=(a,b,offset=0,color=C.ultra)=>{const q=(progress+offset)%1;box(a[0]+(b[0]-a[0])*q-3,a[1]+(b[1]-a[1])*q-3,6,6,color)};
    const face=(x,y,r=18,color=C.coral)=>{circle(x,y,r,color);out+=`<circle cx="${x-6}" cy="${y-3}" r="2" fill="${C.ink}"/><circle cx="${x+6}" cy="${y-3}" r="2" fill="${C.ink}"/>`;line([[x-7,y+5],[x,y+8],[x+7,y+4]],C.ink,1.8)};
    const agent=(x,y,label,fill=C.lilac)=>{circle(x,y,25,fill);line([[x-11,y],[x+11,y]],C.ink,2);line([[x,y-11],[x,y+11]],C.ink,2);line([[x-8,y-8],[x+8,y+8]],C.ink,2);text(label,x,y+45,19,C.ink,'middle')};
    const banner=(s,fill=C.lime)=>{box(24,329,548,33,fill);text(s,298,353,21,C.ink,'middle')};

    if(key==='distribution') {
      box(24,25,216,64,C.yellow);text('“A week away, by the sea.”',36,53,21);text('one intent · any starting point',36,76,14,C.ink,'start',true);
      face(58,170);text('Traveller',58,209,20,C.ink,'middle');
      line([[82,170],[175,170]],C.ultra);packet([82,170],[175,170]);
      agent(204,170,'Personal agent',C.lime);
      const nodes=[[351,71,'Airline',C.blue],[513,95,'Hotel',C.green],[533,225,'Cruise',C.pink],[390,267,'Touring',C.yellow],[298,238,'Agency',C.lilac]];
      if(stage>=1) {
        nodes.forEach(([x,y,name,col],i)=>{
          const failing=stage===4&&i===2&&progress<.5;
          line([[228,170],[(228+x)/2,(170+y)/2+12],[x,y]],failing?C.coral:stage>=3?C.green:C.rule,1.8,failing?'4 6':'');
          if(stage>=2&&!failing)packet([228,170],[x,y],i*.17,stage>=3?C.green:C.ultra);
        });
        if(stage>=2){line([[351,71],[513,95],[533,225],[390,267],[298,238]],C.ultra,1.2,'4 5');packet([351,71],[513,95],.2)}
        if(stage===4){line([[513,95],[563,154],[533,225]],C.green,2.4);text('new route ↗',456,177,21,C.ultra);if(progress<.5)cross(400,198);else tick(400,198)}
        nodes.forEach(([x,y,name,col])=>{agent(x,y,name,col);if(stage>=3)tick(x+20,y-18)});
      } else {text('Your agent takes it from here.',96,271,27,C.ultra);line([[232,177],[313,192],[347,168]],C.rule,1.5,'4 6')}
      banner(['Intent starts the journey.','Five kinds of agent. One ecosystem.','Requirements ↔ offers ↔ commercial terms','Negotiate. Validate. Authorised transactions.','Learn, adapt and reconnect.'][stage]);
    }
    if(key==='inventory') {
      const names=['GDS','NDC','Airlines','Hotels','Cruises','Touring','Activities','Independent'];
      const colors=[C.blue,C.lilac,C.yellow,C.green,C.pink,C.coral,C.yellow,C.lilac];
      text(stage<2?'Different suppliers. Different systems.':'One living travel inventory.',25,43,28);
      const startX=[25,169,313,455,45,180,330,463],startY=[86,108,72,108,202,193,204,195];
      names.forEach((name,i)=>{
        const unified=stage>=2;
        const x=unified?66+(i%4)*116:startX[i],y=unified?91+Math.floor(i/4)*96:startY[i];
        const w=unified?116:106,h=76;
        polygon([[x,y],[x+w*.4,y],[x+w*.4,y-9],[x+w*.62,y-9],[x+w*.62,y],[x+w,y],[x+w,y+h*.35],[x+w+8,y+h*.35],[x+w+8,y+h*.65],[x+w,y+h*.65],[x+w,y+h],[x,y+h]],colors[i]);
        text(name,x+w/2,y+34,name==='Independent'?17:22,C.ink,'middle');
        if(stage===1)text(['USD · seats','XML · fares','EUR · rules','rooms · rates','cabins · GBP','departures','slots · JPY','local formats'][i],x+w/2,y+59,12,C.ink,'middle',true);
        else if(stage>=3)tick(x+w/2,y+56);
        else if(stage===2)text('linked + normalised',x+w/2,y+59,10,C.ink,'middle',true);
      });
      if(stage===2){text('duplicates resolved ✓',300,298,22,C.ultra,'middle')}
      if(stage===3){text('price  ✓   availability  ✓   rules  ✓',300,298,19,C.ultra,'middle')}
      if(stage===4){line([[72,280],[530,280]],C.ultra,2);['Traveller','Consultant','Developer','AI agent'].forEach((s,i)=>{const x=85+i*143;line([[x,265],[x,292]],C.ultra,1.5);text(s,x,312,18,C.ink,'middle')})}
      banner(['Supply, scattered across the world.','Understand formats, currencies and rules.','Connect the pieces. Resolve the duplicates.','Continuously checked. Ready for use.','Search. Compare. Transact.'][stage]);
    }
    if(key==='disruption') {
      text('One journey. Everything connected.',24,43,28);
      const xs=[70,225,380,532],labels=['Flight','Transfer','Hotel','Activity'];
      if(stage===0){text('flight updates · weather · suppliers',300,87,17,C.ultra,'middle');line([[70,101],[532,101]],C.rule,1,'3 5');packet([70,101],[532,101])}
      const bad=stage===1||stage===2;
      xs.slice(0,3).forEach((x,i)=>{line([[x+30,156],[xs[i+1]-30,156]],bad?C.coral:C.green,2,bad?'5 6':'');if(stage===0||stage>=3)packet([x+30,156],[xs[i+1]-30,156],i*.2,C.green)});
      xs.forEach((x,i)=>{box(x-29,127,58,55,bad?C.pink:stage>=3?C.green:C.blue);if(i===0&&bad)cross(x,151);else if(stage>=3)tick(x,151);else text(String(i+1),x,164,28,C.paper,'middle');text(labels[i],x,209,22,C.ink,'middle')});
      if(stage===1){text('Cancelled',70,104,23,C.coral,'middle');[225,380,532].forEach((x,i)=>{const r=33+((progress+i*.17)%1)*15;out+=`<circle cx="${x}" cy="154" r="${r}" fill="none" stroke="${C.coral}" stroke-width="1.3" opacity=".6"/>`});text('One cancellation. A ripple through the trip.',300,279,25,C.coral,'middle')}
      if(stage===2){['Other flights','Policies + cost','What suits them'].forEach((s,i)=>{box(28+i*190,245,165,48,[C.yellow,C.lilac,C.green][i]);text(s,110+i*190,276,21,C.ink,'middle')});text('Reason across the whole journey.',300,91,23,C.ultra,'middle')}
      if(stage===3){line([[70,126],[70,82],[225,82],[225,126]],C.ultra,2);text('Alternative secured',151,69,20,C.ultra,'middle');text('Flight replaced · transfers rescheduled',300,259,24,C.ultra,'middle');text('Hotel coordinated · activities rearranged',300,289,24,C.ultra,'middle')}
      if(stage===4){face(144,262,15,C.yellow);text('Traveller informed',172,270,22);face(367,262,15,C.lilac);text('Consultant updated',395,270,20);text('Validated. Watching again.',300,89,25,C.ultra,'middle')}
      banner(['Watching over confirmed bookings.','Connected reservations are at risk.','Weigh alternatives, preferences and policies.','Repair within authorised limits.','The journey changes. The holiday continues.'][stage]);
    }
    if(key==='commerce') {
      box(23,29,197,72,C.yellow);text('A trip that fits.',35,57,25);text('dates · budget · preferences',35,83,13,C.ink,'start',true);
      const colors=[C.blue,C.green,C.pink,C.lilac,C.yellow];
      for(let i=0;i<35;i++){
        const x=25+(i%7)*25,y=143+Math.floor(i/7)*31;
        const feasible=i%6===0||stage<2;
        box(x,y,16,19,stage===0?C.rule:feasible?colors[i%5]:C.paper);
        if(stage>=2&&!feasible&&i%3===0)cross(x+8,y+9);
      }
      text(stage>=2?'Feasible choices':'Many possibilities',110,317,21,C.ink,'middle');
      line([[217,190],[256,190]],C.ultra,1.5);if(stage>=1)packet([217,190],[256,190]);
      polygon([[257,107],[386,107],[386,244],[345,279],[299,279],[257,244]],C.lilac);
      text('Neuro-symbolic',321,138,20,C.ink,'middle');text('optimisation',321,163,25,C.ink,'middle');
      ['Experience','Cost / convenience','Conversion','Profitability'].forEach((s,i)=>text(s,321,188+i*22,11,C.ink,'middle',true));
      line([[386,190],[432,190]],stage>=2?C.ultra:C.rule,1.8);if(stage>=2)packet([386,190],[432,190]);
      box(439,112,135,187,stage>=2?C.paper:'#ece7dc');text('Your journey',507,139,22,C.ink,'middle');
      ['Flight','Stay','Experience'].forEach((s,i)=>{box(450,157+i*39,109,29,stage>=2?colors[i]:C.rule);text(s,461,178+i*39,20);if(stage>=3)tick(544,170+i*39)});
      if(stage===3){text('Approval ✓',508,88,22,C.ultra,'middle');text('offers validated',507,316,16,C.ultra,'middle')}
      if(stage===4){box(401,52,166,48,C.lime);text('Better value ↗',484,84,24,C.ink,'middle');line([[494,111],[494,102]],C.ultra,2);text('Keep improving',508,316,20,C.ultra,'middle')}
      banner(['Start with intent, preferences and constraints.','Discover flights, stays, activities and transport.','Rule out the impossible. Balance what matters.','Negotiate. Approve. Book securely.','Watch prices, needs and new opportunities.'][stage]);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" aria-hidden="true" focusable="false"><rect width="600" height="380" fill="${C.paper}"/>${out}</svg>`;
  }
  // Export the pure renderer for source-level rendering checks, without a browser.
  if(typeof module!=='undefined'&&module.exports)module.exports={drawScene};
  if(typeof document==='undefined')return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-project-card]').forEach(card=>{
    const scene=card.querySelector('[data-project-scene]'),buttons=[...card.querySelectorAll('[data-project-step]')];
    const descriptions=[...card.querySelectorAll('[data-project-description]')].map(el=>el.textContent);
    const copy=card.querySelector('.project-stage-copy'),pause=card.querySelector('.project-pause'),status=card.querySelector('[data-project-status]');
    let stage=0,elapsed=0,paused=reduced.matches,visible=false,timer,last=0;
    const render=()=>{scene.innerHTML=drawScene(card.dataset.projectCard,stage,elapsed/7500)};
    const labels=()=>{buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===stage)));copy.textContent=descriptions[stage];status.textContent=`0${stage+1} / 05 · ${buttons[stage].dataset.projectStep}`};
    const schedule=()=>{clearTimeout(timer);last=performance.now();if(visible&&!paused&&!document.hidden)timer=setTimeout(tick,220)};
    const tick=()=>{elapsed+=performance.now()-last;if(elapsed>=7500){elapsed%=7500;stage=(stage+1)%5;labels()}render();schedule()};
    const setPaused=value=>{paused=value;pause.textContent=paused?'Play animation':'Pause animation';pause.setAttribute('aria-pressed',String(paused));schedule()};
    buttons.forEach((b,i)=>b.addEventListener('click',()=>{setPaused(true);stage=i;elapsed=3750;labels();render()}));
    pause.addEventListener('click',()=>setPaused(!paused));
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule()},{threshold:.1}).observe(card);
    document.addEventListener('visibilitychange',schedule);
    reduced.addEventListener('change',e=>{if(e.matches)setPaused(true)});
    labels();render();setPaused(paused);
  });
})();
