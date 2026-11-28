/* Preserve the research examples; organise them into an accessible vertical selector. */
(() => {
  const host = document.querySelector('#next > .wrap');
  const ambient = document.querySelector('#ambient-ai');
  const cards = [...document.querySelectorAll('.pcs-sec .pc')];
  if (!host || !ambient || cards.length !== 8) return;
  const names = ['Ambient AI', 'Autonomous Travel Distribution', 'Universal Travel Inventory', 'Autonomous Disruption Management', 'Autonomous Travel Commerce & Optimisation', 'Agentic TMS', 'Travel Canvas', 'Proprietary travel models', 'Agentic payments'];
  const sources = [ambient, ...cards];
  const layout = document.createElement('div'); layout.className = 'rd-tabs';
  const list = document.createElement('div'); list.className = 'rd-list';
  list.setAttribute('role', 'tablist'); list.setAttribute('aria-label', 'Current research and development'); list.setAttribute('aria-orientation', 'vertical');
  const stage = document.createElement('div'); stage.className = 'rd-stage';
  const buttons = [], panels = [];
  sources.forEach((source, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.id = 'rd-tab-' + i;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', 'rd-panel-' + i);
    const number = document.createElement('span'); number.className = 'rd-number'; number.textContent = String(i + 1).padStart(2, '0');
    const title = document.createElement('span'); title.textContent = names[i]; button.append(number, title);
    const panel = document.createElement('section'); panel.className = 'rd-panel'; panel.id = 'rd-panel-' + i; panel.tabIndex = 0;
    panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', button.id);
    panel.append(source); list.append(button); stage.append(panel); buttons.push(button); panels.push(panel);
    source.querySelectorAll('[data-in]').forEach(el => el.removeAttribute('data-in'));
  });
  document.querySelectorAll('.pcs-sec').forEach(el => el.remove());
  layout.append(list, stage); host.append(layout);
  function select(index, focus = false) {
    panels.forEach((panel, i) => {
      const active = i === index; panel.hidden = !active;
      buttons[i].setAttribute('aria-selected', String(active)); buttons[i].tabIndex = active ? 0 : -1;
    });
    if (focus) buttons[index].focus();
  }
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', event => {
      const delta = {ArrowDown:1, ArrowRight:1, ArrowUp:-1, ArrowLeft:-1}[event.key];
      const next = delta ? (i + delta + buttons.length) % buttons.length : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null;
      if (next === null) return;
      event.preventDefault(); select(next, true);
    });
  });
  function revealHash() {
    const id = window.location.hash.slice(1);
    const target = id && document.getElementById(id);
    const index = target ? panels.findIndex(panel => panel === target || panel.contains(target)) : -1;
    if (index >= 0) { select(index); target.scrollIntoView?.({block:'nearest'}); }
  }
  select(0); revealHash(); window.addEventListener('hashchange', revealHash);
})();
