(() => {
  const header = document.querySelector('.header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeMenu = () => { header.classList.remove('menu-open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); header.classList.toggle('menu-open', open);
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && header.classList.contains('menu-open')) { closeMenu(); menu.focus(); } });
  document.addEventListener('click', e => { if (!header.contains(e.target)) closeMenu(); });
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus = false) {
    tabs.forEach(t => { const selected = t === tab; t.setAttribute('aria-selected', String(selected)); t.tabIndex = selected ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !selected; });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); selectTab(tabs[next], true); }
    });
  });
  function followHash() {
    const name = location.hash.slice(1);
    const tab = tabs.find(t => t.getAttribute('aria-controls') === name);
    if (tab) { selectTab(tab); document.getElementById('research').scrollIntoView(); }
  }
  window.addEventListener('hashchange', followHash); followHash();
  document.querySelectorAll('.desktop-shortcuts a').forEach(link => link.addEventListener('click', () => { const tab = tabs.find(t => '#' + t.getAttribute('aria-controls') === link.hash); if (tab) selectTab(tab); }));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.querySelector('.motion-toggle');
  let paused = reduced.matches;
  const updateMotion = () => {
    document.body.classList.toggle('motion-paused', paused);
    window.dispatchEvent(new CustomEvent('lab-motion', { detail: { paused } }));
    motion.setAttribute('aria-pressed', String(paused));
    motion.hidden = false;
    motion.disabled = reduced.matches;
    motion.innerHTML = reduced.matches ? 'Motion off · system setting' : paused ? '<span aria-hidden="true">▷</span> Resume motion' : '<span aria-hidden="true">Ⅱ</span> Pause motion';
    motion.title = reduced.matches ? 'Your device requests reduced motion. Animations are shown as still artwork.' : '';
    const replay = document.querySelector('.trunk-replay');
    if (replay) {
      replay.disabled = paused || reduced.matches;
      replay.textContent = reduced.matches ? 'Still pose · reduced motion' : paused ? 'Resume motion to replay' : 'Replay his arrival';
    }
  };
  motion.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); }); updateMotion();
  const trunkStage = document.querySelector('.trunk-studio');
  const replayTrunk = () => {
    if (!trunkStage || reduced.matches || paused) return;
    trunkStage.classList.remove('trunk-arriving');
    requestAnimationFrame(() => requestAnimationFrame(() => trunkStage.classList.add('trunk-arriving')));
  };
  document.querySelector('.trunk-replay')?.addEventListener('click', replayTrunk);
  if (trunkStage) {
    const trunkImage = trunkStage.querySelector('img');
    const appear = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { if (trunkImage.complete) replayTrunk(); else trunkImage.addEventListener('load', replayTrunk, { once: true }); appear.disconnect(); } }, { threshold: .55 });
    appear.observe(trunkStage);
  }
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }); }, { threshold: 0.08 });
    document.querySelectorAll('.intro, .section-heading, .about-art, .about-copy, .careers, .manifesto-heading').forEach(el => { el.classList.add('reveal-ready'); observer.observe(el); });
  }
})();
