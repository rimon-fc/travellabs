/* A research concept inspired by the Ambient Co-Consult film. No external calls. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-ambient]').forEach(demo => {
    const panels = [...demo.querySelectorAll('.ambient-panel')];
    const steps = [...demo.querySelectorAll('[data-ambient-step]')];
    const pause = demo.querySelector('.ambient-pause');
    const caption = demo.querySelector('[data-ambient-caption]');
    const number = demo.querySelector('[data-ambient-number]');
    const captions = [
      'The enquiry arrives. Your agent notices first.',
      'Past trips and preferences come with the customer.',
      'Flights, stays and experiences. The groundwork is done.',
      'One tailored proposal. You decide what gets sent.',
      'Replies, rate changes and follow-ups. Still keeping watch.'
    ];
    let current = 0, paused = reduced.matches, visible = false, timer;
    const schedule = () => {
      clearTimeout(timer);
      if (!paused && visible && !document.hidden) timer = setTimeout(() => select((current + 1) % panels.length), 5500);
    };
    const select = i => {
      current = i;
      panels.forEach((p,j) => { p.hidden = j !== i; });
      steps.forEach((b,j) => b.setAttribute('aria-pressed', String(j === i)));
      caption.textContent = captions[i];
      number.textContent = `0${i + 1} / 05`;
      schedule();
    };
    const setPaused = value => {
      paused = value;
      pause.textContent = paused ? 'Play example' : 'Pause example';
      pause.setAttribute('aria-pressed', String(paused));
      demo.classList.toggle('is-paused', paused);
      schedule();
    };
    pause.addEventListener('click', () => setPaused(!paused));
    steps.forEach((b,i) => b.addEventListener('click', () => { setPaused(true); select(i); }));
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold:.15}).observe(demo);
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', e => { if (e.matches) setPaused(true); });
    demo.classList.add('is-ready');
    setPaused(paused);
  });
})();
