/* An illustrative diffusion-style reveal, not a model performance benchmark. */
(() => {
    const RGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const P = { skyT: RGB('#c9d7ef'), skyL: RGB('#f6d4b2'), glow: RGB('#ffe1bd'), sun: RGB('#fff4dc'), hill: RGB('#86a862'), hillD: RGB('#5c7f45'), roof: RGB('#c4604a'), sea1: RGB('#a8cbe2'), sea2: RGB('#4f86c2'), sea3: RGB('#2a5a96'), sand: RGB('#efd8a8'), sand2: RGB('#dfbf86'), coral: RGB('#ef7a62'), win: RGB('#4a5878') };
    const TOWN = ['#e8b48c', '#f2d7a6', '#d98b6a', '#f4e6c8', '#c9d6e6', '#efc4a0', '#e2a37f'].map(RGB);
    const mix = (a, b, t) => a.map((x, i) => x + (b[i] - x) * Math.max(0, Math.min(1, t)));
    const hillTop = (u) => .33 + .05 * Math.sin(u * 7) + .025 * Math.sin(u * 17) + (u > .6 ? (u - .6) * 1.6 : 0);
    const HZ = .52, shore = (u) => .86 - .03 * Math.sin(u * 6 + 1);
    const scene = (u, v) => {
      const sd = Math.hypot((u - .78) * 1.7, v - .26);
      if (v < HZ) {
        const ht = hillTop(u);
        if (v > ht && u < .74) {
          if (v > HZ - .1 && u < .68) {
            const b = Math.floor(u * 44), top = HZ - .1 + (b % 3) * .012;
            if (v < top) return mix(P.hill, P.hillD, .4);
            if (v < top + .014) return P.roof;
            if (Math.floor(u * 260) % 4 === 1 && Math.floor(v * 140) % 3 === 0) return P.win;
            return TOWN[b % TOWN.length];
          }
          return mix(P.hill, P.hillD, (v - ht) / (HZ - ht));
        }
        if (sd < .07) return P.sun;
        const g = mix(P.skyT, P.skyL, v / HZ);
        return sd < .22 ? mix(P.glow, g, (sd - .07) / .15) : g;
      }
      const sh = shore(u);
      if (v > sh) return mix(P.sand, P.sand2, (v - sh) / (1 - sh));
      if (Math.abs(u - .56) < .022 && v > .61 && v < .64) return [252, 250, 244];
      if (Math.abs(u - .56) < .03 && v >= .64 && v < .656) return P.coral;
      const k = (v - HZ) / (sh - HZ);
      let c = k < .3 ? mix(P.sea1, P.sea2, k / .3) : mix(P.sea2, P.sea3, (k - .3) / .7);
      if (Math.abs(u - .78) < .045 * (1 - k * .6) && Math.sin(v * 170) > .2) c = mix(c, P.sun, .55);
      return c;
    };

  const WORDS = ['A', 'quieter', 'coast.', 'A', 'better', 'journey.', 'Ready', 'for', 'review.'];
  const ORDER = [1, 6, 3, 8, 0, 5, 7, 2, 4];
  const NOISE = ['•••', '···', '///', '—', '··', '▧'];
  const END = 9600, PAINT_END = 6400;
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  function snapshot(ms) {
    const p = clamp(ms / PAINT_END), pass = Math.min(8, Math.floor(p * 8));
    const parallel = WORDS.map((w, i) => ms >= 1700 + ORDER[i] * 460 ? w : NOISE[(Math.floor(ms / 240) + i * 3) % NOISE.length]);
    const sequential = WORDS.map((w, i) => ms >= (i + 1) * 1000 ? w : '···');
    return { p, pass, parallel, sequential, complete: ms >= END };
  }
  function drawTarget(ctx, W, H) {
    for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) {
      const c = scene((x + 2) / W, (y + 2) / H);
      ctx.fillStyle = `rgb(${c.map(Math.round).join(',')})`; ctx.fillRect(x, y, 4, 4);
    }
    // Small, deterministic brush marks retain the existing painted-coast character.
    for (let i = 0; i < 24000; i++) {
      const x = hash(i + 1) * W, y = hash(i + 81001) * H, u = x / W, v = y / H;
      const c = scene(u, v), j = (hash(i + 42001) - .5) * 28;
      ctx.fillStyle = `rgb(${c.map(n => Math.round(n + j)).join(',')})`;
      ctx.save(); ctx.translate(x, y);
      ctx.rotate(v < .3 || (v > HZ && v < shore(u)) ? (hash(i + 41) - .5) * .3 : hash(i + 31) * Math.PI);
      ctx.fillRect(-4, -1, 5 + hash(i + 91) * 7, 2 + hash(i + 81) * 2); ctx.restore();
    }
  }
  function drawRefinement(ctx, target, W, H, p) {
    ctx.drawImage(target, 0, 0, W, H);
    if (p >= 1) return;
    const pass = Math.floor(p * 8), cell = Math.max(8, Math.round(44 - pass * 4.5));
    // Every spatial region changes in each pass: no left-to-right sweep.
    for (let y = 0; y < H; y += cell) for (let x = 0; x < W; x += cell) {
      const id = Math.floor(x / cell) + Math.floor(y / cell) * 137;
      const base = scene((x + cell / 2) / W, (y + cell / 2) / H);
      const noise = [205, 211, 225].map((c, i) => c + (hash(id * 3 + i + pass * 179) - .5) * 105);
      const c = mix(noise, base, clamp((p - .08) * 1.2));
      ctx.globalAlpha = (1 - p) * (.64 + hash(id + 87) * .36);
      ctx.fillStyle = `rgb(${c.map(Math.round).join(',')})`; ctx.fillRect(x, y, cell + .5, cell + .5);
    }
    ctx.globalAlpha = 1;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { snapshot, drawTarget, drawRefinement, WORDS, END };
  if (typeof document === 'undefined') return;
  const frame = document.querySelector('[data-diffusion]'); if (!frame) return;
  const canvas = frame.querySelector('canvas'), ctx = canvas.getContext('2d');
  const target = document.createElement('canvas'), tc = target.getContext('2d');
  const parallel = [...frame.querySelectorAll('[data-parallel] span')], sequential = [...frame.querySelectorAll('[data-sequential] span')];
  const progress = frame.querySelector('[data-diffusion-progress]'), status = frame.querySelector('[data-diffusion-status]');
  const pause = frame.querySelector('[data-diffusion-pause]'), replay = frame.querySelector('[data-diffusion-replay]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let W = 0, H = 0, ms = reduce.matches ? END : 0, visible = false, paused = reduce.matches, externalPaused = false, raf = 0, last = 0, lastDraw = -1;
  function render() {
    const s = snapshot(ms);
    drawRefinement(ctx, target, W, H, s.p);
    [parallel, sequential].forEach((els, row) => els.forEach((el, i) => {
      const value = (row ? s.sequential : s.parallel)[i];
      el.textContent = value; el.classList.toggle('settled', value === WORDS[i]);
    }));
    progress.style.width = `${Math.round(s.p * 100)}%`;
    const label = s.p === 1 ? 'Scene resolved' : `Refinement ${String(s.pass + 1).padStart(2, '0')} / 08`;
    if (status.textContent !== label) status.textContent = label;
    pause.textContent = paused ? 'Play' : s.complete ? 'Complete' : 'Pause';
    pause.disabled = s.complete; pause.setAttribute('aria-pressed', String(paused));
  }
  function size() {
    const box = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(box.width)), h = Math.max(1, Math.round(box.height));
    if (w === W && h === H) return;
    W = w; H = h; const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    target.width = Math.min(W, 1400); target.height = Math.round(H * target.width / W);
    drawTarget(tc, target.width, target.height); render();
  }
  const running = () => visible && !document.hidden && !paused && !externalPaused && !reduce.matches && ms < END;
  function tick(now) {
    raf = 0; if (!running()) { last = 0; return; }
    if (last) ms = Math.min(END, ms + Math.min(64, now - last));
    last = now;
    if (now - lastDraw >= 110 || ms === END) { render(); lastDraw = now; }
    if (running()) raf = requestAnimationFrame(tick);
  }
  function sync() {
    if (running()) { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }
    else { cancelAnimationFrame(raf); raf = 0; last = 0; }
  }
  function reset() { ms = reduce.matches ? END : 0; paused = reduce.matches; last = 0; lastDraw = -1; render(); sync(); }
  pause.addEventListener('click', () => { paused = !paused; render(); sync(); });
  replay.addEventListener('click', reset);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', () => { if (reduce.matches) { ms = END; paused = true; render(); } sync(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .15 }).observe(frame);
  new ResizeObserver(size).observe(canvas);
  const carouselPause = document.querySelector('.hc-pause');
  if (carouselPause) {
    const changed = () => { externalPaused = carouselPause.getAttribute('aria-pressed') === 'true'; sync(); };
    new MutationObserver(changed).observe(carouselPause, { attributes: true, attributeFilter: ['aria-pressed'] }); changed();
  }
  window.HERO_REPLAY = window.HERO_REPLAY || {}; window.HERO_REPLAY.a = reset;
  size();
})();
