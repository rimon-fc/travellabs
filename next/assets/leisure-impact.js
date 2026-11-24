(() => {
 const root=document.querySelector('[data-impact-showcase]');if(!root)return;
 const media=matchMedia('(prefers-reduced-motion: reduce)'),tabs=[...root.querySelectorAll('[role=tab]')],panels=[...root.querySelectorAll('[role=tabpanel]')],cells=[...root.querySelectorAll('[data-impact-cell]')],canvas=root.querySelector('[data-impact-flow]'),ctx=canvas?.getContext('2d');
 const title=root.querySelector('[data-impact-title]'),source=root.querySelector('[data-impact-source]');
 const coConsultSource=source.textContent;
 const aibqSource='Since launch · Cost: about $1,295 total ($0.116 per conversation). Latest data dump: 11k users · 24k turns · PII redacted.';
 let index=0,elapsed=0,last=null,frame=0,visible=false,lastColumn=-1;
 const duration=9000;
 function draw(){
  const phase=media.matches?1:elapsed/duration;root.style.setProperty('--impact-progress',String(phase));
  const col=Math.min(9,Math.floor(phase*10));
  if(col!==lastColumn){lastColumn=col;cells.forEach(cell=>{const [r,c]=cell.dataset.impactCell.split(':').map(Number);cell.classList.toggle('is-current',c===col);cell.classList.toggle('is-future',c>col);cell.classList.toggle('is-working',c<=col&&((r*3+c*7)%5<2));});root.querySelector('[data-impact-session]').textContent='STEP '+String(col+1).padStart(2,'0')+' / 10';}
  if(index===3&&ctx){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(rect.width*dpr)||canvas.height!==Math.round(rect.height*dpr)){canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}compactFlow(ctx,rect.width,rect.height,phase);}
 }

 function compactFlow(ctx,w,h,phase){
  ctx.clearRect(0,0,w,h);const left=w<260?52:72,unit=(w-left-8)/9,rows=['Activities','Advice','Hotels','Combine','Proposal'],ranges=[[0,4],[0,6],[0,3],[6,7],[7,9]];
  ctx.font=(w<260?'6':'7')+'px monospace';ctx.textAlign='left';
  rows.forEach((label,i)=>{const y=6+i*((h-10)/4),[start,end]=ranges[i],x=left+start*unit,width=(end-start)*unit;ctx.fillStyle='#62765b';ctx.fillText(label,1,y+2);ctx.fillStyle='#e6ecdf';ctx.fillRect(x,y-3,width,6);ctx.strokeStyle='#b3c0a7';ctx.lineWidth=.5;ctx.strokeRect(x,y-3,width,6);const done=Math.max(0,Math.min(end-start,phase*10-start))*unit;ctx.fillStyle='#587564';for(let k=0;k<done;k+=3)ctx.fillRect(x+k,y-3,Math.min(1.5,done-k),6);if(i<3){ctx.strokeStyle='#9bad91';ctx.setLineDash([1,2]);ctx.beginPath();ctx.moveTo(x+width,y);ctx.bezierCurveTo(x+width+14,y,left+6*unit-14,6+3*((h-10)/4),left+6*unit,6+3*((h-10)/4));ctx.stroke();ctx.setLineDash([]);}});
 }
 function choose(next,focus=false){index=next;title.textContent='Agents in production';source.textContent=index===4?aibqSource:coConsultSource;elapsed=0;lastColumn=-1;tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index});if(focus)tabs[index].focus();draw();}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(i));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();choose(next,true)});});
 const allowed=()=>visible&&!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused');
 function sync(){if(allowed()&&!frame){last=null;frame=requestAnimationFrame(tick)}else if(!allowed()){cancelAnimationFrame(frame);frame=0;last=null}draw()}
 function tick(now){frame=0;if(!allowed()){last=null;return}if(last===null)last=now;const delta=now-last;if(delta>=80){last=now;elapsed+=Math.min(delta,160);if(elapsed>=duration){if(root.contains(document.activeElement)){elapsed=duration-1}else choose((index+1)%panels.length)}draw()}frame=requestAnimationFrame(tick);}
 if('IntersectionObserver'in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.05}).observe(root)}else visible=true;
 window.addEventListener('lab-motion',sync);window.addEventListener('resize',draw);document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);choose(0);sync();
})();
