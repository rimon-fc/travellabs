/* Co-consult in numbers: tabs that autoplay, count-up numbers and five small illustrative visuals. */
(() => {
  const root = document.querySelector('[data-imp]');
  if (!root) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('.imp-p')];
  const pauseBtn = root.querySelector('.imp-pause');
  const DWELL = 7000;
  let active = 0, paused = REDUCE, visible = false, t0 = 0, raf = 0, held = false;

  // Count a number up, keeping its sign, commas and suffix ("19,400+", "+61%", "83%+").
  const countUp = (el) => {
    const to = el.dataset.to, m = to.match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!m || REDUCE) { el.textContent = to; return; }
    const [, pre, num, suf] = m, target = Number(num.replace(/,/g, '')), comma = num.includes(','), start = performance.now();
    const fmt = (v) => pre + (comma ? Math.round(v).toLocaleString('en-US') : Math.round(v)) + suf;
    const tick = (now) => { const k = Math.min(1, (now - start) / 1100); el.textContent = fmt(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };

  // 01 · specialists at work: five capabilities over ten steps.
  const ROWS = ['Research', 'Recommendations', 'Guardrails', 'Proposals', 'CRM summary'];
  const grid = root.querySelector('[data-grid]');
  grid.innerHTML = '<span class="lb">CAPABILITY</span>' + Array.from({ length: 10 }, (_, c) => `<span class="hd" data-h="${c}">${String(c + 1).padStart(2, '0')}</span>`).join('')
    + ROWS.map((r, i) => `<span class="lb">${r}</span>` + Array.from({ length: 10 }, (_, c) => `<i data-c="${i}:${c}"></i>`).join('')).join('');
  const seed = (r, c) => { const v = Math.sin(r * 127.1 + c * 311.7) * 43758.5453; return v - Math.floor(v); };
  const stepEl = root.querySelector('.imp-step');
  let gstep = 9, gtimer = 0;
  const drawGrid = (s) => {
    grid.querySelectorAll('i').forEach((cell) => {
      const [r, c] = cell.dataset.c.split(':').map(Number), on = seed(r, c) > .55;
      cell.className = c > s ? '' : (c === s ? 'cur' + (on ? ' work' : '') : (on ? 'work' : 'kept'));
    });
    grid.querySelectorAll('.hd').forEach((h) => h.classList.toggle('cur', Number(h.dataset.h) === s));
    stepEl.textContent = `STEP ${s + 1} / 10`;
  };
  drawGrid(9);

  // 04 · research to proposal: parallel lanes that converge on one proposal.
  const cv = root.querySelector('[data-flow]');
  const ctx = cv.getContext('2d');
  const LANES = ['Research', 'Recommendations', 'Guardrails', 'Proposals'];
  let fstart = 0;
  const drawFlow = (now) => {
    const dpr = Math.min(2, devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const q = REDUCE ? 1 : ((now - fstart) % 5200) / 5200, x0 = 70, x1 = W - 92, ox = 24, oy = H / 2;
    const mono = (s, x, y, col, al = 'left', size = 10) => { ctx.font = `500 ${size}px "Geist Mono", ui-monospace, monospace`; ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(s, x, y); };
    let done = 0;
    LANES.forEach((lab, i) => {
      const y = 34 + (H - 68) * i / (LANES.length - 1), k = Math.min(1, Math.max(0, (q - i * .06) / (.55 + i * .05)));
      if (k >= 1) done++;
      ctx.strokeStyle = '#e3e1d9'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.bezierCurveTo(ox + 34, oy, ox + 20, y, x0, y); ctx.lineTo(x1, y); ctx.bezierCurveTo(x1 + 30, y, x1 + 26, oy, W - 30, oy); ctx.stroke();
      ctx.strokeStyle = '#2a3bff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * k, y); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#0f1115'; ctx.lineWidth = 1; ctx.fillRect(x0, y - 18, 116, 14); ctx.strokeRect(x0 + .5, y - 17.5, 115, 13);
      mono(lab.toUpperCase(), x0 + 6, y - 8, '#0f1115', 'left', 9);
      ctx.beginPath(); ctx.arc(x0 + (x1 - x0) * k, y, 4, 0, 7); ctx.fillStyle = '#2a3bff'; ctx.fill();
      if (k >= 1) { ctx.fillStyle = '#d7ff3c'; ctx.fillRect(x1 + 4, y - 7, 14, 14); ctx.strokeStyle = '#0f1115'; ctx.strokeRect(x1 + 4.5, y - 6.5, 13, 13); mono('✓', x1 + 11, y + 4, '#0f1115', 'center', 10); }
    });
    ctx.fillStyle = '#0f1115'; ctx.beginPath(); ctx.arc(ox, oy, 6, 0, 7); ctx.fill();
    const all = done === LANES.length;
    ctx.fillStyle = all ? '#d7ff3c' : '#fff'; ctx.fillRect(W - 30, oy - 12, 24, 24); ctx.strokeStyle = '#0f1115'; ctx.lineWidth = 1.5; ctx.strokeRect(W - 29.25, oy - 11.25, 22.5, 22.5);
    mono('ONE WORKSPACE', 14, 16, '#9a9ca3', 'left', 9);
    mono(all ? 'A PROPOSAL ✓' : `${done} / ${LANES.length}`, W - 8, 16, all ? '#2a3bff' : '#9a9ca3', 'right', 9);
  };

  const show = (i, focus) => {
    active = i; t0 = performance.now();
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; t.style.setProperty('--p', 0); });
    panels.forEach((p, j) => { p.hidden = j !== i; p.classList.remove('go'); });
    const p = panels[i]; void p.offsetWidth; p.classList.add('go');
    countUp(p.querySelector('.imp-n'));
    if (focus) tabs[i].focus();
    if (i === 0) { clearInterval(gtimer); gstep = -1; const adv = () => { gstep = Math.min(9, gstep + 1); drawGrid(gstep); if (gstep === 9) clearInterval(gtimer); }; if (REDUCE) drawGrid(9); else { adv(); gtimer = setInterval(adv, 550); } }
    if (i === 3) { fstart = performance.now(); drawFlow(fstart); }
  };

  const loop = (now) => {
    raf = 0;
    if (!visible) return;
    if (active === 3) drawFlow(now);
    if (!paused && !held) {
      const k = Math.min(1, (now - t0) / DWELL);
      tabs[active].style.setProperty('--p', k);
      if (k >= 1) show((active + 1) % tabs.length);
    } else t0 = now - (Number(tabs[active].style.getPropertyValue('--p')) || 0) * DWELL;
    raf = requestAnimationFrame(loop);
  };
  const sync = () => { if (visible && !raf && !REDUCE) raf = requestAnimationFrame(loop); };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      const n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (n) { e.preventDefault(); show((i + n + tabs.length) % tabs.length, true); }
      if (e.key === 'Home') { e.preventDefault(); show(0, true); }
      if (e.key === 'End') { e.preventDefault(); show(tabs.length - 1, true); }
    });
  });
  root.addEventListener('pointerenter', () => { held = true; });
  root.addEventListener('pointerleave', () => { held = false; });
  if (REDUCE) { pauseBtn.disabled = true; pauseBtn.textContent = 'Still view · reduced motion'; }
  pauseBtn.addEventListener('click', () => {
    paused = !paused; pauseBtn.setAttribute('aria-pressed', String(paused)); pauseBtn.textContent = paused ? 'Play animation' : 'Pause animation';
  });
  new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) { if (!t0) show(active); sync(); } }, { threshold: .2 }).observe(root);
  if (REDUCE) { show(0); drawFlow(performance.now()); }
})();
