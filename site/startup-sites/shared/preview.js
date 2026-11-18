(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('portfolio-preview') !== '1') return;
  document.documentElement.classList.add('startup-preview');
  function frame() {
    const target = document.querySelector(location.pathname.endsWith('keel-github.html') ? '#what' : location.pathname.endsWith('atfgraph-github.html') ? '#time' : location.pathname.includes('/mcpx-travel/') ? '.hx-frame' : '.hero, .hx');
    if (target) window.scrollTo({top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - 16), behavior:'instant'});
    parent.postMessage({type:'travellabs-preview-ready'}, '*');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', frame, {once:true});
  else requestAnimationFrame(frame);
  window.addEventListener('load', frame, {once:true});
})();
