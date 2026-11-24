/* Trunk's local, depth-sorted orbit. No external animation or asset services. */
(() => {
  const stage=document.querySelector('.belief-universe');if(!stage)return;
  const buttons=[...stage.querySelectorAll('.belief-object')];
  const panels=[...document.querySelectorAll('.belief-copy')];
  const center=stage.querySelector('.belief-center'),hello=stage.querySelector('.trunk-hello'),speech=stage.querySelector('.trunk-speech');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let angle=0,last=0,raf=0,visible=true,paused=document.body.classList.contains('motion-paused'),held=false,focused=false,greet=0,greetingTimer,active=0,elapsed=0;
  const greetings=['Packed light. Brought curiosity.','Mostly ideas. One emergency biscuit.','That question? Definitely coming with us.','A small case of big curiosity.'];
  let width=stage.clientWidth,height=stage.clientHeight;
  function place(){
    buttons.forEach((button,i)=>{
      const a=angle+i*Math.PI/3-.4,depth=(Math.sin(a)+1)/2;
      const x=width*.5+Math.cos(a)*width*.375,y=height*.48+Math.sin(a)*height*.245;
      button.style.left=x+'px';button.style.top=y+'px';
      button.style.transform=`translate(-50%,-50%) scale(${.76+depth*.24})`;
      button.style.zIndex=depth>.43?'7':'3';button.style.opacity=String(.78+depth*.22);
    });
  }
  const moving=()=>!paused&&!reduced.matches&&visible&&!document.hidden&&!held&&!focused;
  function frame(now){raf=0;if(!moving()){last=0;return}if(last){const dt=Math.min(now-last,50);angle+=dt*.00012;elapsed+=dt;if(elapsed>=6500){select((active+1)%buttons.length);sayHello();}}last=now;place();raf=requestAnimationFrame(frame)}
  function sync(){stage.classList.toggle('is-resting',paused||!visible||document.hidden);if(moving()&&!raf)raf=requestAnimationFrame(frame);else if(!moving()){cancelAnimationFrame(raf);raf=0;last=0}}
  function select(index){active=index;elapsed=0;buttons.forEach((button,i)=>button.setAttribute('aria-expanded',String(i===index)));panels.forEach((panel,i)=>{panel.hidden=i!==index});}
  function sayHello(){
    speech.textContent=greetings[greet++%greetings.length];clearTimeout(greetingTimer);center.classList.remove('is-hello');
    // Restart the greeting from its first pose, while respecting the page motion control.
    void center.offsetWidth;center.classList.add('is-hello');greetingTimer=setTimeout(()=>center.classList.remove('is-hello'),2600);
  }
  buttons.forEach((button,i)=>{
    button.addEventListener('pointerenter',event=>{if(event.pointerType==='touch')return;held=true;select(i);sync()});
    button.addEventListener('pointerleave',()=>{held=false;sync()});
    button.addEventListener('click',()=>select(i));
    button.addEventListener('focus',()=>{focused=true;select(i);sync()});
    button.addEventListener('blur',()=>{focused=false;sync()});
    button.addEventListener('keydown',event=>{let n;if(event.key==='ArrowRight'||event.key==='ArrowDown')n=(i+1)%buttons.length;if(event.key==='ArrowLeft'||event.key==='ArrowUp')n=(i+buttons.length-1)%buttons.length;if(event.key==='Home')n=0;if(event.key==='End')n=buttons.length-1;if(n!==undefined){event.preventDefault();buttons[n].focus()}});
  });
  hello.addEventListener('click',sayHello);
  document.querySelector('.belief-reset').addEventListener('click',()=>{angle=0;place();select((greet+1)%buttons.length);sayHello()});
  window.addEventListener('lab-motion',e=>{paused=e.detail.paused;sync()});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  if('IntersectionObserver' in window)new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()},{threshold:.05}).observe(stage);
  if('ResizeObserver' in window)new ResizeObserver(()=>{width=stage.clientWidth;height=stage.clientHeight;place()}).observe(stage);
  else window.addEventListener('resize',()=>{width=stage.clientWidth;height=stage.clientHeight;place()});
  select(0);place();sync();
})();
