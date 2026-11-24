/* Hover previews reuse each tab group's click controller and its ARIA state. */
(() => {
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let pending, timer;
  const clear = () => { clearTimeout(timer); pending = null; };
  document.addEventListener('pointerover', event => {
    const tab = event.target.closest?.('button[role="tab"][aria-controls]');
    if (!pointer.matches || event.pointerType === 'touch' || !tab || tab.disabled || tab.contains(event.relatedTarget)) return;
    clear();
    if (tab.getAttribute('aria-selected') === 'true') return;
    pending = tab;
    timer = setTimeout(() => { if (pending === tab && tab.isConnected) tab.click(); clear(); }, 90);
  });
  document.addEventListener('pointerout', event => {
    if (pending && pending.contains(event.target) && !pending.contains(event.relatedTarget)) clear();
  });
  document.addEventListener('pointerdown', clear);
  document.addEventListener('keydown', clear);
  window.addEventListener('blur', clear);
  const animations = new WeakMap();
  new MutationObserver(records => {
    const selected = new Set(records.map(record => record.target));
    selected.forEach(tab => {
      if (!tab.matches('button[role="tab"][aria-controls]') || tab.getAttribute('aria-selected') !== 'true') return;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (!panel || panel.hidden) return;
      animations.get(panel)?.cancel();
      if (reduced.matches || document.querySelector('.motion-paused,.motion-off') || !panel.animate) return;
      animations.set(panel, panel.animate([{opacity:.45,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}], {duration:200,easing:'ease-out'}));
    });
  }).observe(document.body, {subtree:true,attributes:true,attributeFilter:['aria-selected']});
})();
