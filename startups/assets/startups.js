(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const globalButton = document.getElementById('preview-motion');
  let allPaused = reduce.matches;
  const items = Array.from(document.querySelectorAll('.startup-card')).map(card => ({
    card, viewport:card.querySelector('.site-preview'), mount:card.querySelector('.preview-mount'),
    button:card.querySelector('.preview-toggle'), status:card.querySelector('.preview-state'),
    visible:false, enabled:!reduce.matches, iframe:null
  }));
  function size(item) {
    item.viewport.style.setProperty('--preview-scale', String(item.viewport.clientWidth / 1280));
  }
  function update(item) {
    const play = item.enabled && item.visible && !document.hidden;
    if (play && !item.iframe) {
      const frame = document.createElement('iframe');
      frame.title = item.viewport.dataset.name + ' animated website preview';
      frame.tabIndex = -1;
      frame.setAttribute('aria-hidden', 'true');
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      frame.src = item.viewport.dataset.url;
      frame.addEventListener('load', () => { if (item.iframe === frame) item.viewport.classList.add('ready'); });
      item.iframe = frame;
      item.mount.append(frame);
      size(item);
    } else if (!play && item.iframe) {
      item.iframe.remove();item.iframe=null;item.viewport.classList.remove('ready');
    }
    item.button.textContent=item.enabled?'Pause preview Ⅱ':'Play preview ▷';
    item.button.setAttribute('aria-pressed',String(item.enabled));
    item.button.setAttribute('aria-label',(item.enabled?'Pause ':'Play ')+item.viewport.dataset.name+' website preview');
    item.status.textContent=play?'Animated website preview':'Concept illustration · preview paused';
  }
  function globalLabel() {
    globalButton.textContent=allPaused?'Play previews ▷':'Pause previews Ⅱ';
    globalButton.setAttribute('aria-pressed',String(allPaused));
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const item=items.find(x=>x.viewport===entry.target);item.visible=entry.isIntersecting;update(item);});
  },{threshold:.12});
  const resize=new ResizeObserver(entries=>entries.forEach(entry=>{const item=items.find(x=>x.viewport===entry.target);if(item)size(item);}));
  items.forEach(item=>{
    observer.observe(item.viewport);resize.observe(item.viewport);update(item);
    item.button.addEventListener('click',()=>{item.enabled=!item.enabled;update(item);allPaused=items.every(x=>!x.enabled);globalLabel();});
  });
  function setPaused(paused){allPaused=paused;items.forEach(item=>{item.enabled=!paused;update(item);});globalLabel();}
  globalButton.addEventListener('click',()=>setPaused(!allPaused));
  reduce.addEventListener('change',event=>setPaused(event.matches));
  document.addEventListener('visibilitychange',()=>items.forEach(update));
  window.addEventListener('message',event=>{
    if(event.data?.type!=='travellabs-preview-ready')return;
    const item=items.find(x=>x.iframe?.contentWindow===event.source);
    if(item)item.viewport.classList.add('ready');
  });
  window.addEventListener('lab-motion',event=>setPaused(event.detail.paused));
  if(document.body.classList.contains('motion-off'))setPaused(true);else globalLabel();
})();
