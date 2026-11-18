/* Progressively enhance the portfolio; every entry remains readable without JS. */
(()=>{
  'use strict';
  const root=document.getElementById('leisure-ai');
  if(!root)return;
  const list=root.querySelector('.portfolio-tabs');
  const tabs=Array.from(list.querySelectorAll('.portfolio-tab'));
  const panels=tabs.map(tab=>document.getElementById(tab.hash.slice(1)));
  if(!tabs.length||panels.some(panel=>!panel))return;
  list.setAttribute('role','tablist');
  list.setAttribute('aria-orientation','vertical');
  root.classList.add('portfolio-enhanced');
  tabs.forEach((tab,i)=>{
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',panels[i].id);
    panels[i].setAttribute('role','tabpanel');
    panels[i].setAttribute('aria-labelledby',tab.id);
    panels[i].tabIndex=0;
    tab.addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();select(i,true);
    });
    tab.addEventListener('keydown',event=>{
      let next=i;
      if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(i+1)%tabs.length;
      else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else if(event.key===' ') {event.preventDefault();select(i,true);return;}
      else return;
      event.preventDefault();select(next,true);tabs[next].focus();
    });
  });
  function select(index,updateURL=false){
    tabs.forEach((tab,i)=>{
      tab.setAttribute('aria-selected',String(i===index));
      tab.tabIndex=i===index?0:-1;
      panels[i].hidden=i!==index;
    });
    if(updateURL){try{history.replaceState(history.state,'',tabs[index].hash)}catch{}}
  }
  function fromHash(){
    const index=tabs.findIndex(tab=>tab.hash===location.hash);
    if(index!==-1)select(index);
    return index;
  }
  if(fromHash()===-1)select(0);
  window.addEventListener('hashchange',fromHash);
})();
