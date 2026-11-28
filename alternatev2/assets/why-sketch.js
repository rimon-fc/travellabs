/* Six original travel studies in the site's hand-drawn postcard style. */
(() => {
  'use strict';
  const C={ink:'#2b2a2e',paper:'#ffffff',blue:'#5b7be0',coral:'#ef7a62',yellow:'#f5c451',green:'#69a883',pink:'#f3a9c6',lilac:'#b9a8ea',ultra:'#2a3bff',rule:'#cec8bb'};
  const KEYS=['uncertainty','complexity','fragmentation','interdependence','personalisation','commercial-risk'];
  const STILL={'uncertainty':4.5,'complexity':11,'fragmentation':5,'interdependence':12.5,'personalisation':10,'commercial-risk':4};
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  function renderWhyScene(key,time=0){
    if(!KEYS.includes(key))throw new Error('Unknown travel study: '+key);
    let seed=113+Math.floor(time*5)%3,out='';
    const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647};
    const n=x=>+(x+(rand()-.5)*2).toFixed(2);
    const line=(pts,col=C.ink,width=2,dash='')=>{
      for(let pass=0;pass<2;pass++)out+=`<path d="${pts.map((p,i)=>(i?'L':'M')+n(p[0])+','+n(p[1])).join(' ')}" fill="none" stroke="${col}" stroke-width="${pass?width*.6:width}" opacity="${pass?.3:.95}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
    };
    const shape=(pts,fill=C.paper,hatch='')=>{
      if(fill)out+=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${fill}" transform="translate(3 3)"/>`;
      if(hatch)out+=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="url(#why-${key}-${hatch})"/>`;
      line([...pts,pts[0]]);
    };
    const box=(x,y,w,h,fill=C.paper,hatch='')=>shape([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],fill,hatch);
    const circle=(x,y,r,fill=C.paper)=>shape(Array.from({length:24},(_,i)=>[x+Math.cos(i*Math.PI/12)*r,y+Math.sin(i*Math.PI/12)*r]),fill);
    const text=(s,x,y,size=25,col=C.ink,anchor='start')=>{out+=`<text x="${x}" y="${y}" font-family="Caveat, 'Comic Sans MS', cursive" font-size="${size}" font-weight="600" fill="${col}" text-anchor="${anchor}">${esc(s)}</text>`};
    const tick=(x,y,col=C.ultra)=>line([[x-6,y],[x,y+6],[x+12,y-10]],col,3);
    const cross=(x,y)=>{line([[x-7,y-7],[x+7,y+7]],C.coral,3);line([[x+7,y-7],[x-7,y+7]],C.coral,3)};
    const arrow=(pts,col=C.ink,dash='')=>{
      line(pts,col,1.8,dash);let a=pts.at(-2),b=pts.at(-1),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
      line([[b[0]-9*Math.cos(angle-.6),b[1]-9*Math.sin(angle-.6)],b,[b[0]-9*Math.cos(angle+.6),b[1]-9*Math.sin(angle+.6)]],col,1.8);
    };
    const face=(x,y,r=17,col=C.coral)=>{circle(x,y,r,col);if((time%4)>.18){out+=`<circle cx="${x-r*.32}" cy="${y-3}" r="2" fill="${C.ink}"/><circle cx="${x+r*.32}" cy="${y-3}" r="2" fill="${C.ink}"/>`}else line([[x-8,y-3],[x+8,y-3]],C.ink,1);line([[x-7,y+5],[x,y+9],[x+8,y+4]],C.ink,1.5)};
    const plane=(x,y,s=1)=>{shape([[x-27*s,y],[x+27*s,y-2*s],[x+30*s,y+2*s],[x-27*s,y+4*s]],C.paper);line([[x,y],[x-10*s,y-18*s]],C.ink,2);line([[x,y+3*s],[x-10*s,y+20*s]],C.ink,2);line([[x-22*s,y],[x-29*s,y-9*s]],C.ink,2)};
    const bed=(x,y,s=1)=>{line([[x-27*s,y-20*s],[x-27*s,y+20*s]],C.ink,2);box(x-27*s,y,54*s,14*s,C.lilac);box(x-17*s,y-10*s,15*s,10*s,C.paper);line([[x+27*s,y+14*s],[x+27*s,y+20*s]],C.ink,2)};
    const car=(x,y,s=1)=>{shape([[x-30*s,y+12*s],[x-30*s,y-3*s],[x-17*s,y-7*s],[x-10*s,y-22*s],[x+15*s,y-22*s],[x+23*s,y-7*s],[x+31*s,y-3*s],[x+31*s,y+12*s]],C.yellow);circle(x-18*s,y+14*s,7*s,C.ink);circle(x+20*s,y+14*s,7*s,C.ink);line([[x-10*s,y-18*s],[x-13*s,y-7*s],[x+17*s,y-7*s],[x+12*s,y-18*s]],C.ink,1)};
    const ticket=(x,y,w=75,h=43,col=C.yellow)=>{shape([[x,y],[x+w,y],[x+w,y+h*.35],[x+w-6,y+h*.5],[x+w,y+h*.65],[x+w,y+h],[x,y+h],[x,y+h*.65],[x+6,y+h*.5],[x,y+h*.35]],col);line([[x+w*.7,y+4],[x+w*.7,y+h-4]],C.ink,1,'3 4')};
    const clock=(x,y,r=32)=>{circle(x,y,r);const a=time*1.3;line([[x,y],[x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7]],C.ink,2);line([[x,y],[x,y-r*.5]],C.ink,2)};
    const note=(s,x,y,w,col=C.yellow)=>{box(x,y,w,34,col);text(s,x+8,y+24,23)};
    if(key==='uncertainty'){
      const phase=Math.floor(time/3)%4,prices=['$420','$480','—','$455'],status=['Available','Last Seat','Sold Out','Price Changed'];
      box(145,24,252,350,C.blue);box(158,43,225,306);line([[239,34],[300,34]],C.ink,2);circle(272,361,5);
      text('Find a trip',177,77,28);plane(338,68,.55);box(177,91,186,50,C.yellow);text(prices[phase],270,128,35,C.ink,'middle');
      text('Flight seats',177,174,23);
      for(let i=0;i<6;i++){box(180+i*29,189,20,25,i<(phase===0?5:phase===1?1:phase===2?0:3)?C.green:C.paper);if(phase===2||i>3)line([[184+i*29,202],[196+i*29,202]],C.rule,1.5)}
      text('Hotel rooms',177,245,23);for(let i=0;i<5;i++){box(180+i*35,259,26,27,(i+phase)%3===0?C.paper:C.lilac);if((i+phase)%3!==0)line([[186+i*35,273],[200+i*35,273]],C.ink,1)}
      note(status[phase],169,309,205,[C.green,C.yellow,C.coral,C.pink][phase]);
      clock(485,95,35);text('Still changing…',476,164,25,C.ink,'middle');
      arrow([[465,202],[435,224],[416,265]],C.ultra,'4 6');
      const yy=253+Math.sin(time)*7;ticket(438,yy,117,55,C.yellow);text('new price?',450,yy+35,23);
      line([[76,115],[100,115]],C.ink,2);line([[88,103],[88,127]],C.ink,2);
    }
    if(key==='complexity'){
      const q=time%15,narrow=q>8;box(155,143,292,161);box(167,155,268,135,C.paper,'lilac');shape([[155,304],[447,304],[472,328],[131,328]],C.blue);
      const float=(i)=>Math.sin(time*.8+i)*8;
      box(38,50+float(0),120,65,C.paper);plane(99,83+float(0),.8);
      box(220,25+float(1),146,72,C.paper);text('Fri → Mon',294,56+float(1),25,C.ink,'middle');line([[230,68+float(1)],[355,68+float(1)]],C.ink,1);text('Which dates?',294,87+float(1),21,C.ink,'middle');
      box(462,54+float(2),100,84,C.paper);bed(512,98+float(2),.8);
      shape([[24,205+float(3)],[65,193+float(3)],[106,209+float(3)],[106,282+float(3)],[64,267+float(3)],[24,281+float(3)]],C.paper,'green');line([[65,195+float(3)],[64,266+float(3)]],C.ink,1.3);
      ticket(484,231+float(4),86,60,C.yellow);text('Explore',495,267+float(4),24);
      if(!narrow){
        for(let i=0;i<3;i++){line([[187,185+i*30],[241,225-i*15],[304,178+i*35],[347,243-i*25],[414,186+i*31]],[C.blue,C.coral,C.green][i],1.7,'4 4');}
        [[195,193],[244,233],[305,181],[365,228],[405,267]].forEach(([x,y],i)=>circle(x,y,5,[C.pink,C.yellow,C.green][i%3]));
        text('So many ways…',300,367,29,C.ink,'middle');
      }else{
        box(203,166,195,112,C.paper);text('One itinerary',218,192,26);
        ['Fly','Stay','Explore'].forEach((s,i)=>{text(s,222,218+i*24,23);if(q>8+i*1.2)tick(367,212+i*24)});
        text('One trip that fits.',300,367,29,C.ultra,'middle');
      }
      [[139,116],[299,104],[476,145],[119,252],[475,276]].forEach(([x,y],i)=>{if(narrow)arrow([[x,y],[(x+300)/2,(y+224)/2]],C.green);else line([[x,y],[(x+300)/2,(y+224)/2]],C.rule,1.5,'3 6')});
    }
    if(key==='fragmentation'){
      const names=['Airlines','Hotels','Cruises','Agency','Payments','Activities'],cols=[C.blue,C.green,C.pink,C.lilac,C.yellow,C.coral];
      // Broken, crossing routes occupy the open space between the separate windows.
      for(let i=0;i<6;i++){
        const a=93+(i%3)*207,b=93+((i+1)%3)*207;
        const mid=185+Math.sin(time*.6+i)*13;
        line([[a,146],[a+(i%2?32:-22),mid],[b,214]],cols[i],1.8,'5 8');
        const f=(time*.12+i*.18)%1;if(f<.43||f>.66)circle(a+(b-a)*f,146+(214-146)*f,3,cols[i]);
      }
      names.forEach((name,i)=>{
        const x=18+(i%3)*196,y=i<3?26:244;box(x,y,172,114);line([[x,y+30],[x+172,y+30]],C.ink,1.4);circle(x+12,y+14,3,cols[i]);text(name,x+25,y+22,24);
        if(i===0){text('fare / seats',x+12,y+58,22);box(x+12,y+70,145,29,cols[i]);text('SYD → ?',x+22,y+92,23)}
        if(i===1){for(let row=0;row<2;row++)for(let col=0;col<4;col++)box(x+17+col*37,y+45+row*28,27,20,(row+col)%2?C.paper:cols[i]);}
        if(i===2){text('<cabin> 12',x+12,y+61,23);text('deck / sailing',x+12,y+91,23)}
        if(i===3){text('Client · dates',x+12,y+59,23);line([[x+12,y+72],[x+155,y+72]],C.rule,1);text('Notes…',x+12,y+95,23)}
        if(i===4){text('{ amount: … }',x+10,y+60,22);text('currency: AUD',x+10,y+91,22)}
        if(i===5){ticket(x+18,y+48,132,47,cols[i]);text('tour / slots',x+28,y+78,23)}
      });
      text(['Different formats','Disconnected systems','Tangled connections'][Math.floor(time/4)%3],300,390,28,C.ink,'middle');
    }
    if(key==='interdependence'){
      const phase=Math.min(4,Math.floor((time%18)/3));
      const nodes=[[115,91,'Flight'],[463,91,'Transfer'],[463,280,'Hotel'],[115,280,'Activity']];
      arrow([[204,94],[369,94]],phase>=2?C.coral:C.green,'5 5');arrow([[463,149],[463,219]],phase>=3?C.coral:C.green,'5 5');arrow([[370,281],[205,281]],phase>=4?C.coral:C.green,'5 5');
      nodes.forEach(([x,y,label],i)=>{
        const bad=phase>=i+1;out+=`<g transform="rotate(${bad?Math.sin(time*1.5+i)*2:0} ${x} ${y})">`;
        box(x-89,y-56,178,114,bad?'#fae3db':C.paper);text(label,x-73,y-30,25);
        if(i===0)plane(x,y+6,.9);if(i===1)car(x,y+5,.85);if(i===2)bed(x,y+4,.9);if(i===3){ticket(x-39,y-10,78,40,C.yellow);text('Tour',x-23,y+18,23)}
        if(bad)cross(x+66,y-32);out+='</g>';
        const status=bad?['Cancelled','Missed','Check-in shifts','Unavailable'][i]:['Scheduled','Booked','Check-in 3pm','Reserved'][i];
        text(status,x,y+82,26,bad?C.coral:C.green,'middle');
      });
      text(phase===0?'One connected journey':'A chain reaction',285,201,29,phase===0?C.ink:C.coral,'middle');
    }
    if(key==='personalisation'){
      const q=time%14;
      const labels=['Family','Solo adventurer','Luxury traveller'];
      [100,300,500].forEach((x,i)=>{
        text(labels[i],x,35,27,C.ink,'middle');
        if(i===0){face(x-24,80,17,C.coral);face(x+24,80,17,C.yellow);face(x,107,13,C.green);line([[x-25,98],[x-40,136],[x+40,136],[x+25,98]],C.ink,2)}
        if(i===1){box(x-25,82,47,55,C.green);face(x,79,21,C.yellow);line([[x-12,103],[x-13,143],[x-26,162]],C.ink,2);line([[x+11,103],[x+15,142],[x+28,161]],C.ink,2);line([[x+31,91],[x+34,159]],C.ink,2)}
        if(i===2){face(x,79,21,C.pink);shape([[x-12,101],[x-30,151],[x+30,151],[x+12,101]],C.lilac);line([[x-12,102],[x,122],[x+12,102]],C.ink,2);ticket(x+27,116,35,27,C.yellow)}
        const notes=[['Kid-friendly','Space to play','$$'],['Hikes + freedom','Flexible dates','$'],['Suite + spa','Private transfers','$$$']][i];
        text(notes[0],x,187,25,C.ink,'middle');text(notes[1],x,215,24,C.ink,'middle');text(notes[2],x,244,28,C.ultra,'middle');
        arrow([[x,255],[x,280]],q>3+i*2?C.green:C.rule);
        box(x-86,291,172,91,[C.yellow,C.green,C.lilac][i]);
        const plans=[['Family stay','Easy beach day'],['Trail cabin','Mountain hike'],['Hotel suite','Private tour']][i];
        if(q>3+i*2){text(plans[0],x-72,322,25);text(plans[1],x-72,353,25);tick(x+65,367)}
        else{text('Their own trip…',x,339,24,C.ink,'middle')}
      });
    }
    if(key==='commercial-risk'){
      const angle=Math.sin(time*.6)*.1;
      text('Customer trust',116,46,27,C.ink,'middle');text('Satisfaction',116,75,25,C.ink,'middle');
      text('Revenue',480,46,27,C.ink,'middle');text('Profitability',480,75,25,C.ink,'middle');
      box(246,18,111,84,C.paper);text('Booking',258,45,24);text('confirmed',258,69,22);tick(329,88);
      shape([[280,335],[300,149],[320,335]],C.lilac);box(240,335,120,16,C.blue);circle(300,158,9,C.yellow);
      const lx=300-166*Math.cos(angle),ly=158-166*Math.sin(angle),rx=300+166*Math.cos(angle),ry=158+166*Math.sin(angle);
      line([[lx,ly],[rx,ry]],C.ink,3);
      [[lx,ly,C.green],[rx,ry,C.yellow]].forEach(([x,y,col])=>{line([[x,y],[x-55,y+105]],C.ink,1.6);line([[x,y],[x+55,y+105]],C.ink,1.6);shape([[x-65,y+105],[x+65,y+105],[x+43,y+127],[x-43,y+127]],col)});
      face(lx-18,ly+77,22,C.pink);shape([[lx+19,ly+93],[lx+4,ly+76],[lx+13,ly+65],[lx+20,ly+72],[lx+28,ly+64],[lx+38,ly+76]],C.coral);
      for(let i=0;i<4;i++){circle(rx-18+i*12,ry+87-i*7,13,C.yellow);text('$',rx-18+i*12,ry+94-i*7,20,C.ink,'middle')}
      const drift=Math.sin(time)*5;
      ticket(34,309+drift,122,48,C.paper);text('★★★★★',46,340+drift,23,C.ultra);
      const yy=306-drift;shape([[440,yy],[554,yy],[554,yy+61],[544,yy+54],[534,yy+61],[524,yy+54],[514,yy+61],[504,yy+54],[494,yy+61],[484,yy+54],[474,yy+61],[464,yy+54],[454,yy+61],[440,yy+54]],C.paper);text('Receipt',454,yy+27,24);line([[453,yy+38],[540,yy+38]],C.rule,1.5);
      circle(393+Math.cos(time)*7,115+Math.sin(time)*7,13,C.yellow);text('$',393+Math.cos(time)*7,122+Math.sin(time)*7,20,C.ink,'middle');
      text('Every decision matters.',300,389,28,C.ink,'middle');
    }
    const defs=['blue','green','lilac'].map(name=>`<pattern id="why-${key}-${name}" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="${C[name]}" stroke-width="2" fill="none"/></pattern>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" aria-hidden="true" focusable="false"><defs>${defs}</defs><rect width="600" height="400" fill="none"/>${out}</svg>`;
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={renderWhyScene,KEYS,STILL};
  if(typeof document==='undefined')return;
  const section=document.querySelector('.mission-editorial');
  const nodes=[...(section?.querySelectorAll('[data-why-scene]')||[])];
  if(!nodes.length)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const pause=section.querySelector('[data-why-pause]');
  const states=nodes.map(node=>({node,key:node.dataset.whyScene,time:media.matches?STILL[node.dataset.whyScene]:0,visible:!('IntersectionObserver' in window)}));
  let paused=false,timer=null,last=performance.now();
  const render=state=>{state.node.innerHTML=renderWhyScene(state.key,state.time)};
  function running(){return !paused&&!media.matches&&!document.hidden&&states.some(s=>s.visible)}
  function schedule(){clearTimeout(timer);timer=null;last=performance.now();if(running())timer=setTimeout(tick,200)}
  function tick(){const now=performance.now(),delta=Math.min(1,(now-last)/1000);states.forEach(s=>{if(s.visible){s.time+=delta;render(s)}});schedule()}
  function controls(){pause.disabled=media.matches;pause.textContent=media.matches?'Reduced motion':paused?'Play illustrations':'Pause illustrations';pause.setAttribute('aria-pressed',String(paused||media.matches));schedule()}
  states.forEach(render);pause.hidden=false;
  pause.addEventListener('click',()=>{paused=!paused;controls()});
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{const state=states.find(s=>s.node===entry.target);if(state)state.visible=entry.isIntersecting});schedule()},{threshold:.05});states.forEach(s=>observer.observe(s.node));}
  media.addEventListener('change',()=>{if(media.matches)states.forEach(s=>{s.time=STILL[s.key];render(s)});controls()});
  document.addEventListener('visibilitychange',schedule);
  controls();
})();
