/* Technical pixel studies inspired by the supplied CamelAI references.
   Sequence positions and matrix activity are illustrative, not production telemetry. */
((root)=>{
 function checker(ctx,x,y,w,h,ink='#587564'){
  ctx.fillStyle='#e3e8dd';ctx.fillRect(x,y,w,h);ctx.fillStyle=ink;
  for(let yy=y;yy<y+h;yy+=4)for(let xx=x;xx<x+w;xx+=4){ctx.fillRect(xx,yy,Math.min(2,x+w-xx),Math.min(2,y+h-yy));if(xx+2<x+w&&yy+2<y+h)ctx.fillRect(xx+2,yy+2,Math.min(2,x+w-xx-2),Math.min(2,y+h-yy-2));}
 }
 function field(ctx,w,h,time){
  ctx.clearRect(0,0,w,h);const left=148,right=w-24,unit=(right-left)/9,ys=[65,108,151,194,237],scale=h/300;
  ctx.save();ctx.scale(1,scale);ctx.font='12px monospace';ctx.textAlign='center';
  for(let i=0;i<10;i++){const x=left+i*unit;ctx.fillStyle='#68756d';ctx.fillText(String(i),x,25);ctx.strokeStyle='#cdd5c7';ctx.setLineDash([2,5]);ctx.beginPath();ctx.moveTo(x,40);ctx.lineTo(x,265);ctx.stroke();}
  ctx.setLineDash([]);const labels=['Activities','Advice','Hotels','Combine','Proposal'],ranges=[[0,4],[0,6],[0,3],[6,7],[7,9]],cursor=(time*.8)%11;
  for(let i=0;i<5;i++){const [start,end]=ranges[i],x=left+start*unit,width=(end-start)*unit,y=ys[i];ctx.fillStyle='#365347';ctx.textAlign='left';ctx.fillText(labels[i],12,y+5);ctx.fillStyle='#f7f8f2';ctx.fillRect(x,y-13,width,26);ctx.strokeStyle='#91a58e';ctx.strokeRect(x,y-13,width,26);const done=Math.max(0,Math.min(end-start,cursor-start))*unit;if(done>0)checker(ctx,x+1,y-12,Math.max(0,done-2),24);}
  // Travelling signals meet before the proposal step.
  for(let i=0;i<3;i++){const from=ranges[i][1],x=left+from*unit,y=ys[i],toX=left+6*unit,toY=ys[3];ctx.strokeStyle='#8ba294';ctx.setLineDash([2,5]);ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+40,y,toX-35,toY,toX,toY);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#f7f8f2';ctx.fillRect(x-4,y-4,8,8);ctx.strokeRect(x-4,y-4,8,8);ctx.fillStyle='#4f7975';ctx.fillRect(x-1.5,y-1.5,3,3);const u=(time*.45+i*.27)%1,v=1-u,px=v*v*v*x+3*v*v*u*(x+40)+3*v*u*u*(toX-35)+u*u*u*toX,py=v*v*v*y+3*v*v*u*y+3*v*u*u*toY+u*u*u*toY;ctx.fillRect(px-2,py-2,4,4);}
  const now=left+Math.min(9,cursor)*unit;ctx.strokeStyle='#365347';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(now,39);ctx.lineTo(now,268);ctx.stroke();ctx.fillStyle='#365347';ctx.fillRect(now-3,36,6,3);ctx.font='10px monospace';ctx.textAlign='left';ctx.fillStyle='#68756d';ctx.fillText('ILLUSTRATIVE STEPS / NOT ELAPSED TIME',left,290);ctx.restore();
 }
 root.LeisureStatsArt={field};
 if(typeof document==='undefined')return;
 const page=document.body,buttons=[...document.querySelectorAll('[data-role]')],ticker=document.querySelector('[data-rotating-stat]');
 const nodes=[...document.querySelectorAll('[data-stats-field],[data-stats-scene],[data-rotating-stat]')];if(!nodes.length)return;
 const media=matchMedia('(prefers-reduced-motion: reduce)'),visible=new Map(nodes.map(n=>[n,false]));
 const canvases=[...document.querySelectorAll('[data-stats-field]')].map(canvas=>({canvas,ctx:canvas.getContext('2d'),w:0,h:0}));
 const diagram=document.querySelector('.stats-agent-visual'),cells=[...document.querySelectorAll('[data-matrix-cell]')];
 const functionsAt=[0,1,1,2,2,2,4,5,0,3,5,1,1];
 const metrics=[['13','specialised capabilities'],['11','distinct LLM roles'],['9–13','agent interactions / session']];
 let active=0,roleTime=0,clock=0,last=null,frame=0,tickerTime=0,tickerIndex=0,lastColumn=-1;
 function matrix(){const column=media.matches?5:Math.floor(clock/.6)%6;if(column===lastColumn)return;lastColumn=column;cells.forEach(cell=>{const [row,col]=cell.dataset.matrixCell.split(':').map(Number),at=functionsAt[row];cell.classList.toggle('is-current',col===column);cell.classList.toggle('is-working',col===at&&col<=column);cell.classList.toggle('is-future',col>column);});}
 function select(index){active=index;roleTime=0;buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===index));b.closest('tr')?.classList.toggle('is-active',i===index)});const label=buttons[index].querySelector('span:last-child'),copy=label.cloneNode(true);copy.querySelector('small').remove();document.querySelector('[data-current-role]').textContent=copy.textContent.trim();document.querySelector('[data-current-group]').textContent=label.querySelector('small').textContent;}
 buttons.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
 function changeMetric(){tickerIndex=(tickerIndex+1)%metrics.length;const [value,label]=metrics[tickerIndex],box=ticker.querySelector('.leisure-stat-ticker');ticker.querySelector('[data-ticker-number]').textContent=value;ticker.querySelector('[data-ticker-label]').textContent=label;box.classList.remove('is-changing');void box.offsetWidth;box.classList.add('is-changing');const progress=ticker.querySelector('.leisure-ticker-progress');progress.classList.add('has-selection');progress.querySelectorAll('i').forEach((p,i)=>p.classList.toggle('is-active',i===tickerIndex));}
 const allowed=()=>!media.matches&&!document.hidden&&!page.classList.contains('motion-paused');
 function draw(all=false){canvases.forEach(({canvas,ctx,w,h})=>{if(ctx&&w&&h&&(all||visible.get(canvas)))field(ctx,w,h,media.matches?11.25:clock);});matrix();}
 function resize(){canvases.forEach(item=>{const rect=item.canvas.getBoundingClientRect(),dpr=Math.min(root.devicePixelRatio||1,2);item.w=Math.round(rect.width);item.h=Math.round(rect.height);item.canvas.width=Math.round(item.w*dpr);item.canvas.height=Math.round(item.h*dpr);item.ctx?.setTransform(dpr,0,0,dpr,0,0);});draw(true);}
 function running(){return allowed()&&nodes.some(n=>visible.get(n));}
 function sync(){nodes.forEach(n=>n.classList.toggle('is-running',allowed()&&visible.get(n)));if(running()&&!frame){last=null;frame=requestAnimationFrame(tick)}else if(!running()){cancelAnimationFrame(frame);frame=0;last=null;}}
 function tick(now){frame=0;if(!running()){last=null;return}if(last===null)last=now;const elapsed=now-last;if(elapsed>=80){const dt=Math.min(elapsed,160)/1000;last=now;clock+=dt;if(diagram&&visible.get(diagram)){roleTime+=dt;if(roleTime>=3.6)select((active+1)%buttons.length);}if(ticker&&visible.get(ticker)){tickerTime+=dt;if(tickerTime>=4.5){tickerTime=0;changeMetric();}}draw();}frame=requestAnimationFrame(tick);}
 if('IntersectionObserver'in root){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>visible.set(e.target,e.isIntersecting));sync();},{threshold:.01});nodes.forEach(n=>observer.observe(n));}else nodes.forEach(n=>visible.set(n,true));
 if('ResizeObserver'in root)new ResizeObserver(resize).observe(page);else root.addEventListener('resize',resize);
 root.addEventListener('lab-motion',sync);document.addEventListener('visibilitychange',sync);media.addEventListener('change',()=>{sync();draw(true);});
 if(buttons.length)select(0);resize();sync();
})(globalThis);
