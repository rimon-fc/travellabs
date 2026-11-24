(() => {
  const title = document.querySelector('[data-hero-type]');
  if (!title) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const chars = [...title.querySelectorAll('.hero-type-char')];
  let count = 0, elapsed = 0, previous = null, frame = 0;
  let paused = document.body.classList.contains('motion-paused') || document.body.classList.contains('motion-off');
  function finish() {
    cancelAnimationFrame(frame); frame = 0;
    title.classList.remove('hero-type-running');
    count = chars.length;
  }
  function tick(now) {
    frame = 0;
    if (paused || document.hidden || count === chars.length) { previous = null; return; }
    if (previous !== null) elapsed += Math.min(now - previous, 100);
    previous = now;
    const target = Math.min(chars.length, Math.max(0, Math.floor((elapsed - 250) / 42)));
    while (count < target) chars[count++].classList.add('is-typed');
    if (count === chars.length) finish();
    else frame = requestAnimationFrame(tick);
  }
  function resume() {
    previous = null;
    if (!frame && !paused && !document.hidden && count < chars.length) frame = requestAnimationFrame(tick);
  }
  title.classList.add('hero-type-running');
  window.addEventListener('lab-motion', event => {
    paused = Boolean(event.detail.paused);
    if (paused) finish(); // Keep the complete message readable while motion is off.
    else resume();
  });
  document.addEventListener('visibilitychange', resume);
  reduced.addEventListener('change', event => { if (event.matches) finish(); });
  if (paused) finish(); else resume();
})();
