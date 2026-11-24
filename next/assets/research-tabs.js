/* Compact research selectors; unenhanced HTML keeps every item readable. */
(() => {
  function enhance(selector,key,label,upcoming=false){
    const source=document.querySelector(selector);if(!source)return;
    const items=[...source.children];
    const layout=document.createElement('div');layout.className='research-tab-layout '+(upcoming?'upcoming-tabs-layout':'capability-tabs-layout');
    const tabs=document.createElement('div');tabs.className='research-tab-list';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',label);tabs.setAttribute('aria-orientation','vertical');
    const stage=document.createElement('div');stage.className='research-tab-stage';
    const panels=[],buttons=[];
    items.forEach((item,i)=>{
      const heading=item.querySelector(upcoming?'summary>span':'h4');
      const status=item.querySelector(upcoming?'summary>small':':scope>span');
      const button=document.createElement('button');button.type='button';button.className='research-choice';button.id=key+'-tab-'+i;button.setAttribute('role','tab');
      const name=document.createElement('span');name.textContent=heading.textContent;button.append(name);
      if(upcoming){const meta=document.createElement('small');meta.textContent=status.textContent;button.append(meta);}
      const panel=document.createElement('section');panel.className='research-choice-panel';panel.id=key+'-panel-'+i;panel.tabIndex=0;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);button.setAttribute('aria-controls',panel.id);
      if(upcoming){const title=document.createElement('h3');title.textContent=heading.textContent;panel.append(title);const badge=document.createElement('span');badge.className='research-choice-status';badge.textContent=status.textContent;panel.append(badge);item.querySelector('summary').remove();}
      while(item.firstChild)panel.append(item.firstChild);
      tabs.append(button);stage.append(panel);panels.push(panel);buttons.push(button);
    });
    function select(index,focus=false){
      panels.forEach((panel,i)=>{panel.hidden=i!==index;buttons[i].tabIndex=i===index?0:-1;buttons[i].setAttribute('aria-selected',String(i===index));if(i!==index)panel.querySelectorAll('svg').forEach(svg=>svg.pauseAnimations?.());});
      if(focus)buttons[index].focus();
    }
    buttons.forEach((button,i)=>{
      button.addEventListener('click',()=>select(i));
      button.addEventListener('keydown',e=>{
        let next=i;
        if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(i+1)%buttons.length;
        else if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(i+buttons.length-1)%buttons.length;
        else if(e.key==='Home')next=0;
        else if(e.key==='End')next=buttons.length-1;
        else return;
        e.preventDefault();select(next,true);
      });
    });
    layout.append(tabs,stage);source.replaceWith(layout);select(0);
  }
  enhance('.roadmap-grid','capability','Travel model research capabilities');
  enhance('.next-list','upcoming','Upcoming work',true);
})();
