/* Keep technical illustrations on the same motion controls as the hero. */
(() => {
  'use strict';
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const figures=[...document.querySelectorAll('.research-schematic')];
  let paused=document.body.classList.contains('motion-paused')||media.matches;
  const visible=new Map(figures.map(svg=>[svg,false]));
  function sync(svg){
    if(paused||media.matches||document.hidden||!visible.get(svg))svg.pauseAnimations?.();
    else svg.unpauseAnimations?.();
  }
  figures.forEach(svg=>{
    // Begin at a readable representative state, including with reduced motion.
    svg.setCurrentTime?.(2);svg.pauseAnimations?.();
    if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{
      visible.set(svg,entry.isIntersecting);sync(svg);
    },{rootMargin:'80px'}).observe(svg);
    else{visible.set(svg,true);sync(svg);}
  });
  window.addEventListener('lab-motion',event=>{paused=event.detail.paused;figures.forEach(sync);});
  media.addEventListener('change',()=>figures.forEach(sync));
  document.addEventListener('visibilitychange',()=>figures.forEach(sync));
  // A tab change can hide a diagram before the intersection callback arrives.
  document.querySelectorAll('.lab-tab,.objective-tab').forEach(tab=>tab.addEventListener('click',()=>{
    figures.forEach(svg=>{if(svg.closest('[hidden]')){visible.set(svg,false);sync(svg);}});
  }));
})();

/* Keep all five objectives available in a compact, keyboard-accessible view. */
(() => {
  const section=document.querySelector('.mission-objectives');
  const list=section?.querySelector('.objective-list');
  if(!list)return;
  const panels=[...list.children];
  const nav=document.createElement('div');
  nav.className='objective-tabs';nav.setAttribute('role','tablist');
  nav.setAttribute('aria-label','Our five objectives');nav.setAttribute('aria-orientation','vertical');
  const buttons=panels.map((panel,i)=>{
    const button=document.createElement('button');button.type='button';button.className='objective-tab';
    button.id=`objective-tab-${i+1}`;button.setAttribute('role','tab');
    const number=document.createElement('span');number.className='objective-number';number.textContent=String(i+1).padStart(2,'0');
    const title=document.createElement('span');title.textContent=panel.querySelector('h4').textContent.replace(/\s+/g,' ').trim();
    button.append(number,title);nav.append(button);
    panel.id=`objective-panel-${i+1}`;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);panel.tabIndex=0;
    button.setAttribute('aria-controls',panel.id);
    return button;
  });
  function select(index,focus=false){
    panels.forEach((panel,i)=>{
      panel.hidden=i!==index;buttons[i].setAttribute('aria-selected',String(i===index));buttons[i].tabIndex=i===index?0:-1;
      if(i!==index)panel.querySelectorAll('svg').forEach(svg=>svg.pauseAnimations?.());
    });
    if(focus)buttons[index].focus();
  }
  buttons.forEach((button,i)=>{
    button.addEventListener('click',()=>select(i));
    button.addEventListener('keydown',event=>{
      let next=i;
      if(event.key==='ArrowDown')next=(i+1)%buttons.length;
      else if(event.key==='ArrowUp')next=(i+buttons.length-1)%buttons.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=buttons.length-1;
      else return;
      event.preventDefault();select(next,true);
    });
  });
  const layout=document.createElement('div');layout.className='objective-explorer';
  list.before(layout);layout.append(nav,list);list.setAttribute('role','presentation');
  section.classList.add('objectives-enhanced');select(0);
})();
