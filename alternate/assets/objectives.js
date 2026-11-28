/* Accessible objective tabs and locally controlled SVG motion. */
(() => {
  'use strict';
  const section = document.querySelector('#objectives');
  const panels = [...(section?.querySelectorAll('.obj-panel') || [])];
  if (!panels.length) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = section.querySelector('.obj-pause');
  const list = section.querySelector('.obj-panels');
  const figures = panels.map(panel => panel.querySelector('svg'));
  let selected = 0, paused = false, visible = !('IntersectionObserver' in window);
  const nav = document.createElement('div');
  nav.className = 'obj-tabs';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'TravelLabs objectives');
  nav.setAttribute('aria-orientation', 'vertical');
  const buttons = panels.map((panel, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'obj-tab';
    button.id = `obj-tab-${index + 1}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    const number = document.createElement('span');
    number.className = 'obj-tab-number';
    number.textContent = String(index + 1).padStart(2, '0');
    const label = document.createElement('span');
    label.textContent = panel.querySelector('h3').textContent;
    button.append(number, label);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.tabIndex = 0;
    nav.append(button);
    return button;
  });
  const layout = document.createElement('div');
  layout.className = 'obj-explorer';
  list.before(layout);
  const sidebar = document.createElement('div');
  sidebar.className = 'obj-sidebar';
  sidebar.append(nav);
  const moreLink = section.querySelector('.obj-more-link');
  if (moreLink) sidebar.append(moreLink);
  layout.append(sidebar, list);
  section.classList.add('objectives-enhanced');
  function syncMotion() {
    figures.forEach((svg, index) => {
      if (!svg) return;
      if (index !== selected || paused || media.matches || document.hidden || !visible) svg.pauseAnimations?.();
      else svg.unpauseAnimations?.();
    });
    pause.disabled = media.matches;
    pause.textContent = media.matches ? 'Reduced motion' : paused ? 'Play animation' : 'Pause animation';
    pause.setAttribute('aria-pressed', String(paused || media.matches));
  }
  function select(index, focus = false) {
    selected = index;
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
      buttons[i].setAttribute('aria-selected', String(i === index));
      buttons[i].tabIndex = i === index ? 0 : -1;
    });
    syncMotion();
    if (focus) buttons[index].focus();
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % panels.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + panels.length - 1) % panels.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = panels.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });
  figures.forEach(svg => { svg?.pauseAnimations?.(); svg?.setCurrentTime?.(2); });
  pause.hidden = false;
  pause.addEventListener('click', () => { paused = !paused; syncMotion(); });
  media.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); }, { threshold: 0 }).observe(section);
  }
  select(0);
})();
