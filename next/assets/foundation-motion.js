/* Freeze live SVG flows in place; keep the same vector artwork visible. */
(() => {
  const drawings = [...document.querySelectorAll('.foundation-flow-art')];
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  function sync() {
    const paused = media.matches || document.hidden || document.body.classList.contains('motion-paused') || document.body.classList.contains('motion-off');
    drawings.forEach(svg => svg.classList.toggle('is-flow-paused', Boolean(paused)));
  }
  window.addEventListener('lab-motion', sync);
  document.addEventListener('visibilitychange', sync);
  media.addEventListener('change', sync);
  sync();
})();
