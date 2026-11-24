/* Hero ideation prototypes: A painted by agents, B departures board, C one brief in particles. */
(() => {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onVisible = (el, cb) => new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold: .15 }).observe(el);
  const replay = {};
  document.querySelectorAll('[data-replay]').forEach((b) => b.addEventListener('click', () => replay[b.dataset.replay]?.()));

  /* ------------------------------------------------------------------ A */
  (() => {
    const frame = document.getElementById('aFrame'); if (!frame) return;
    const paint = document.getElementById('aCanvas');
    const over = document.createElement('canvas'); over.setAttribute('aria-hidden', 'true'); frame.insertBefore(over, paint.nextSibling);
    const pc = paint.getContext('2d'), oc = over.getContext('2d');
    const jobsEl = document.getElementById('aJobs'), pctEl = document.getElementById('aPct'), barEl = document.getElementById('aBar');
    const approveEl = document.getElementById('aApprove'), approveBtn = document.getElementById('aBtn');
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
    const AGENTS = [
      { name: 'fares.search', r: [0, 0, 1, .3] },
      { name: 'hotels.search', r: [0, .26, .66, .55] },
      { name: 'fare.watch', r: [.55, .14, 1, .55] },
      { name: 'tours.search', r: [0, .5, 1, .86] },
      { name: 'trip.rank', r: [0, .8, 1, 1] }
    ];
    let W = 0, H = 0, CS = 14, cols = 0, rows = 0, cov, total = 0, done = 0, agents = [], state = 'paint', tState = 0, vis = false, raf = 0, last = 0, plane = null, approved = false, autoT = 0;
    const size = () => {
      const r = frame.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
      [paint, over].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); c.style.width = W + 'px'; c.style.height = H + 'px'; c.style.position = 'absolute'; c.style.inset = '0'; });
      pc.setTransform(dpr, 0, 0, dpr, 0, 0); oc.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const sketch = () => {
      pc.fillStyle = '#fbf8f1'; pc.fillRect(0, 0, W, H);
      pc.strokeStyle = 'rgba(43,42,46,.32)'; pc.lineWidth = 1.1; pc.lineCap = 'round';
      const wob = (pts) => { pc.beginPath(); pts.forEach(([x, y], i) => { const X = x + (Math.random() - .5) * 1.4, Y = y + (Math.random() - .5) * 1.4; i ? pc.lineTo(X, Y) : pc.moveTo(X, Y); }); pc.stroke(); };
      wob(Array.from({ length: 60 }, (_, i) => [i / 59 * W, HZ * H]));
      wob(Array.from({ length: 50 }, (_, i) => { const u = i / 49 * .74; return [u * W, Math.min(hillTop(u), HZ) * H]; }));
      wob(Array.from({ length: 50 }, (_, i) => { const u = i / 49; return [u * W, shore(u) * H]; }));
      wob(Array.from({ length: 30 }, (_, i) => { const a = i / 29 * Math.PI * 2; return [(.78 * W) + Math.cos(a) * .07 * H / 1.7 * 1.7, .26 * H + Math.sin(a) * .07 * H]; }));
      for (let b = 0; b < 30; b++) { const u = b / 44, x = u * W, w = W / 44, top = (HZ - .1 + (b % 3) * .012) * H; pc.strokeRect(x + 1, top, w - 2, HZ * H - top); }
      wob([[.536 * W, .64 * H], [.586 * W, .64 * H], [.576 * W, .656 * H], [.546 * W, .656 * H], [.536 * W, .64 * H]]);
      pc.font = '600 15px Caveat, cursive'; pc.fillStyle = 'rgba(43,42,46,.45)';
      pc.fillText('sky', W * .12, H * .12); pc.fillText('town', W * .2, H * .44); pc.fillText('sea', W * .3, H * .74); pc.fillText('sand', W * .7, H * .95);
    };
    const reset = () => {
      cancelAnimationFrame(raf); raf = 0; size(); sketch();
      CS = Math.max(12, Math.round(W / 80)); cols = Math.ceil(W / CS); rows = Math.ceil(H / CS);
      cov = new Uint8Array(cols * rows); total = cols * rows; done = 0;
      agents = AGENTS.map((a, i) => ({ ...a, x: (a.r[0] + a.r[2]) / 2 * W, y: (a.r[1] + a.r[3]) / 2 * H, tx: 0, ty: 0, done: false, trail: [], hue: i }));
      agents.forEach(pick); state = 'paint'; tState = performance.now(); approved = false; plane = null; autoT = 0;
      approveEl.classList.remove('on'); renderJobs();
      if (REDUCE) { paintAll(); finish(); drawOverlay(0); return; }
      if (vis) raf = requestAnimationFrame(loop);
    };
    const cellIn = (a, c, r) => { const u = (c + .5) * CS / W, v = (r + .5) * CS / H; return u >= a.r[0] && u <= a.r[2] && v >= a.r[1] && v <= a.r[3]; };
    function pick(a) {
      let best = null, bd = 1e9;
      for (let n = 0; n < 40; n++) {
        const c = Math.floor((a.r[0] + Math.random() * (a.r[2] - a.r[0])) * cols), r = Math.floor((a.r[1] + Math.random() * (a.r[3] - a.r[1])) * rows);
        if (c < 0 || r < 0 || c >= cols || r >= rows || cov[r * cols + c]) continue;
        const d = Math.hypot(c * CS - a.x, r * CS - a.y); if (d < bd) { bd = d; best = [c, r]; }
      }
      if (!best) { for (let r = 0; r < rows && !best; r++) for (let c = 0; c < cols; c++) if (!cov[r * cols + c] && cellIn(a, c, r)) { best = [c, r]; break; } }
      if (!best) { a.done = true; return; }
      a.tx = (best[0] + .5) * CS; a.ty = (best[1] + .5) * CS;
    }
    const dab = (x, y, n = 10, rad = 15) => {
      for (let i = 0; i < n; i++) {
        const px = x + (Math.random() - .5) * 2 * rad, py = y + (Math.random() - .5) * 2 * rad;
        if (px < 0 || py < 0 || px > W || py > H) continue;
        const u = px / W, v = py / H, c = scene(u, v), j = (Math.random() - .5) * 18;
        pc.fillStyle = `rgb(${c[0] + j | 0},${c[1] + j | 0},${c[2] + j | 0})`;
        const water = v > HZ && v < shore(u), sky = v < .3;
        const ang = water || sky ? (Math.random() - .5) * .3 : Math.random() * Math.PI, len = water ? 9 + Math.random() * 9 : 5 + Math.random() * 6, w = 2.4 + Math.random() * 2;
        pc.save(); pc.translate(px, py); pc.rotate(ang); pc.fillRect(-len / 2, -w / 2, len, w); pc.restore();
        const c0 = Math.floor(px / CS), r0 = Math.floor(py / CS), id = r0 * cols + c0;
        if (!cov[id]) { cov[id] = 1; done++; }
      }
    };
    const paintAll = () => { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { for (let k = 0; k < 3; k++) dab((c + .5) * CS, (r + .5) * CS, 4, CS * .7); } done = total; };
    const renderJobs = () => {
      const st = (a) => state === 'paint' ? (a.done ? ['done ✓', 'ok'] : ['painting…', '']) : state === 'wait' ? ['done ✓', 'ok'] : a.name === 'fare.watch' ? ['watching', 'ok'] : ['booked ✓', 'ok'];
      jobsEl.innerHTML = agents.map((a) => { const [t, c] = st(a); return `<div class="ln ${c}"><span>${a.name}</span><em>${t}</em></div>`; }).join('') + `<div class="ln ${state !== 'paint' ? 'ok' : ''}"><span>a person</span><em>${state === 'paint' ? '—' : state === 'wait' ? 'approves?' : 'approved ✓'}</em></div>`;
      const pct = Math.min(100, Math.round(done / total * 100)); pctEl.textContent = state === 'paint' ? pct + '%' : state === 'wait' ? 'waiting' : 'watching'; barEl.style.width = pct + '%';
    };
    const finish = () => { state = 'wait'; tState = performance.now(); approveEl.classList.add('on'); renderJobs(); };
    const approve = () => { if (state !== 'wait') return; state = 'after'; tState = performance.now(); approveEl.classList.remove('on'); plane = { t: 0 }; renderJobs(); if (REDUCE) drawOverlay(0); };
    approveBtn.addEventListener('click', approve);
    let lastJobs = 0;
    function drawOverlay(now) {
      oc.clearRect(0, 0, W, H);
      agents.forEach((a) => {
        if (state === 'after' && a.name !== 'fare.watch') return;
        oc.strokeStyle = 'rgba(42,59,255,.35)'; oc.setLineDash([2, 4]); oc.beginPath(); a.trail.forEach(([x, y], i) => (i ? oc.lineTo(x, y) : oc.moveTo(x, y))); oc.stroke(); oc.setLineDash([]);
        oc.fillStyle = a.done && state === 'paint' ? '#d7ff3c' : '#2a3bff'; oc.fillRect(a.x - 6, a.y - 6, 12, 12);
        oc.strokeStyle = '#0f1115'; oc.lineWidth = 1.5; oc.strokeRect(a.x - 6, a.y - 6, 12, 12);
        oc.font = '500 10.5px "Geist Mono", ui-monospace, monospace'; const label = state === 'after' ? 'fare.watch · fare change, job wakes' : a.name, tw = oc.measureText(label).width;
        const lx = Math.min(W - tw - 16, a.x + 10), ly = a.y - 22;
        oc.fillStyle = 'rgba(255,255,255,.92)'; oc.fillRect(lx, ly, tw + 10, 16); oc.strokeStyle = '#0f1115'; oc.lineWidth = 1; oc.strokeRect(lx + .5, ly + .5, tw + 9, 15);
        oc.fillStyle = '#0f1115'; oc.fillText(label, lx + 5, ly + 11.5);
      });
      if (plane) {
        const t = REDUCE ? 1 : plane.t, x = -40 + (W + 80) * t, y = H * (.2 - .08 * Math.sin(t * Math.PI));
        oc.strokeStyle = 'rgba(255,255,255,.95)'; oc.lineWidth = 2; oc.setLineDash([6, 6]); oc.beginPath();
        for (let i = 0; i <= 40; i++) { const s = t * i / 40, px = -40 + (W + 80) * s, py = H * (.2 - .08 * Math.sin(s * Math.PI)); i ? oc.lineTo(px, py) : oc.moveTo(px, py); } oc.stroke(); oc.setLineDash([]);
        oc.save(); oc.translate(x, y); oc.rotate(-.08 * Math.cos(t * Math.PI));
        oc.fillStyle = '#ffffff'; oc.strokeStyle = '#0f1115'; oc.lineWidth = 1.4;
        oc.beginPath(); oc.moveTo(-18, 0); oc.lineTo(16, -2); oc.lineTo(20, 0); oc.lineTo(16, 2); oc.closePath(); oc.fill(); oc.stroke();
        oc.beginPath(); oc.moveTo(-2, 0); oc.lineTo(-8, -10); oc.lineTo(-3, -10); oc.lineTo(6, 0); oc.moveTo(-2, 0); oc.lineTo(-8, 10); oc.lineTo(-3, 10); oc.lineTo(6, 0); oc.fillStyle = '#2a3bff'; oc.fill(); oc.stroke();
        oc.restore();
        if (t >= 1) { oc.font = '500 11px "Geist Mono", monospace'; const s = 'booked · the trip is watched after booking'; const tw = oc.measureText(s).width; oc.fillStyle = '#d7ff3c'; oc.fillRect(W / 2 - tw / 2 - 8, H * .1 - 14, tw + 16, 22); oc.strokeStyle = '#0f1115'; oc.strokeRect(W / 2 - tw / 2 - 7.5, H * .1 - 13.5, tw + 15, 21); oc.fillStyle = '#0f1115'; oc.textAlign = 'center'; oc.fillText(s, W / 2, H * .1 + 1); oc.textAlign = 'left'; }
      }
    }
    function loop(now) {
      raf = 0; if (!vis) return;
      const dt = Math.min(50, now - (last || now)); last = now;
      if (state === 'paint') {
        agents.forEach((a) => {
          if (a.done) return;
          const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), sp = .34 * dt;
          if (d < sp) { a.x = a.tx; a.y = a.ty; pick(a); } else { a.x += dx / d * sp; a.y += dy / d * sp; }
          dab(a.x, a.y, 9, CS * 1.05);
          a.trail.push([a.x, a.y]); if (a.trail.length > 26) a.trail.shift();
        });
        if (agents.every((a) => a.done)) { paintAll(); finish(); autoT = now; }
      } else if (state === 'wait') {
        if (now - autoT > 6000) approve();
      } else if (state === 'after') {
        if (plane && plane.t < 1) plane.t = Math.min(1, plane.t + dt / 3200);
        const w = agents.find((a) => a.name === 'fare.watch'); w.x = W * (.55 + .2 * Math.sin(now / 1400)); w.y = H * (.68 + .05 * Math.cos(now / 1100)); w.trail.push([w.x, w.y]); if (w.trail.length > 40) w.trail.shift();
        if (now - tState > 9000) { reset(); return; }
      }
      if (now - lastJobs > 250) { renderJobs(); lastJobs = now; }
      drawOverlay(now);
      raf = requestAnimationFrame(loop);
    }
    // Visitors can paint too.
    let down = false;
    frame.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; down = true; frame.setPointerCapture(e.pointerId); });
    frame.addEventListener('pointerup', () => { down = false; });
    frame.addEventListener('pointermove', (e) => { if (!down || state !== 'paint') return; const r = frame.getBoundingClientRect(); dab(e.clientX - r.left, e.clientY - r.top, 14, 18); });
    onVisible(frame, (v) => { vis = v; if (v && !raf && !REDUCE) { last = 0; raf = requestAnimationFrame(loop); } });
    new ResizeObserver(() => { const r = frame.getBoundingClientRect(); if (Math.abs(r.width - W) > 2) reset(); }).observe(frame);
    replay.a = reset;
    reset();
  })();

  /* ------------------------------------------------------------------ B */
  (() => {
    const hero = document.getElementById('bHero'); if (!hero) return;
    const head = document.getElementById('bHead'), rowsEl = document.getElementById('bRows'), clock = document.getElementById('bClock');
    const CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.·+-/✓';
    const mkLine = (parent, len) => { const d = document.createElement('div'); d.className = 'fline'; for (let i = 0; i < len; i++) { const s = document.createElement('span'); s.className = 'fl'; s.textContent = ' '; d.appendChild(s); } parent.appendChild(d); return [...d.children]; };
    const HL = 24, C1 = 13, C2 = 24, C3 = 13;
    const headLines = [mkLine(head, HL), mkLine(head, HL), mkLine(head, HL)];
    const rowCells = Array.from({ length: 5 }, () => { const r = document.createElement('div'); r.className = 'b-row'; rowsEl.appendChild(r); return { el: r, c: [mkLine(r, C1), mkLine(r, C2), mkLine(r, C3)] }; });
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const setLine = (cells, text, delay = 0, hl = false) => {
      const s = text.toUpperCase().padEnd(cells.length).slice(0, cells.length);
      cells.forEach((cell, i) => {
        cell.classList.toggle('hl', hl);
        if (REDUCE) { cell.textContent = s[i]; return; }
        if (cell.textContent === s[i]) return;
        const steps = 3 + Math.floor(Math.random() * 7);
        for (let k = 0; k <= steps; k++) later(() => { cell.textContent = k === steps ? s[i] : CH[Math.floor(Math.random() * CH.length)]; cell.classList.remove('flip'); void cell.offsetWidth; cell.classList.add('flip'); }, delay + i * 28 + k * 55);
      });
    };
    const PAGES = [
      { head: ['SOLVING THE HARDEST', 'PROBLEMS IN TRAVEL', 'WITH FRONTIER AI.'], cols: ['Problem', 'In travel', 'Status'],
        rows: [['PRICES', 'CHANGE BY THE MINUTE', 'CHECKED ✓'], ['ONE TRIP', 'MANY BUSINESSES', 'COORDINATED'], ['REAL MONEY', 'IS AT STAKE', 'WITHIN LIMITS'], ['APPROVAL', 'ARRIVES HOURS LATER', 'SAVED · WAITS'], ['AFTER BOOKING', 'PLANS CHANGE', 'WATCHING']] },
      { head: ['BIG QUESTIONS.', 'REAL JOURNEYS.', 'FOR THE WORLD OF TRAVEL.'], cols: ['Framework', 'What it does', 'Status'],
        rows: [['ATFGRAPH', 'RUNS THE WORK OVER TIME', 'DURABLE'], ['KEEL', 'CHECKS SUPPLIER CALLS', 'GOVERNED'], ['ATP', 'BOOKING + PAYMENTS', 'CONSENT ✓'], ['EMITTERS', 'KEEP WATCHING THE TRIP', 'WATCHING'], ['A PERSON', 'APPROVES THE PROPOSAL', 'IN CONTROL']] }
    ];
    let page = 0, vis = false, held = false, cycle = 0, started = false;
    const show = (p) => {
      timers.forEach(clearTimeout); timers.clear();
      const P = PAGES[p];
      ['bC1', 'bC2', 'bC3'].forEach((id, i) => { document.getElementById(id).textContent = P.cols[i]; });
      P.head.forEach((t, i) => setLine(headLines[i], t, i * 380));
      P.rows.forEach((r, i) => {
        const d = 1500 + i * 420;
        setLine(rowCells[i].c[0], r[0], d); setLine(rowCells[i].c[1], r[1], d + 120);
        setLine(rowCells[i].c[2], 'SEARCHING', d + 240);
        later(() => setLine(rowCells[i].c[2], r[2], 0, true), REDUCE ? 0 : d + 2200 + i * 260);
      });
    };
    const tick = () => { const d = new Date(); clock.textContent = 'Local time ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
    tick(); setInterval(tick, 15000);
    const run = () => { clearInterval(cycle); if (REDUCE) return; cycle = setInterval(() => { if (vis && !held) { page = (page + 1) % PAGES.length; show(page); } }, 13000); };
    rowsEl.addEventListener('pointerenter', () => { held = true; }); rowsEl.addEventListener('pointerleave', () => { held = false; });
    onVisible(hero, (v) => { vis = v; if (v && !started) { started = true; show(0); run(); } });
    replay.b = () => { page = 0; headLines.flat().forEach((c) => { c.textContent = ' '; }); rowCells.forEach((r) => r.c.flat().forEach((c) => { c.textContent = ' '; })); show(0); run(); };
  })();

  /* ------------------------------------------------------------------ C */
  (() => {
    const hero = document.getElementById('cHero'); if (!hero) return;
    const cv = document.getElementById('cCanvas'), ctx = cv.getContext('2d');
    const stepEl = document.getElementById('cStep'), capEl = document.getElementById('cCap'), dots = [...document.querySelectorAll('#cDots i')];
    const BRIEF = ['“Ten nights, an ocean-view suite,', 'a short cruise and private tours.”'];
    const HEAD = ['Solving the hardest', 'problems in travel', 'with frontier AI.'];
    const NODES = ['FLIGHTS', 'HOTELS', 'RAIL', 'CRUISES', 'EXPERIENCES', 'PAYMENTS'];
    const STEPS = [
      ['01', 'One brief', 'brief', '“Ten nights, an ocean-view suite, a short cruise and private tours.”'],
      ['02', 'Many businesses · one durable job', 'net', 'ATFGraph coordinates supplier tasks in parallel. Durable state keeps the brief, progress and results together.'],
      ['03', 'Checked, then approved', 'gate', 'Every supplier call goes through Keel. A person approves the proposal before ATP books.'],
      ['04', 'Solving the hardest problems', 'head', 'Emitters keep watching the trip after booking. The work continues.']
    ];
    const T = [0, 5.2, 11.6, 16.4, 23.5];
    let W = 0, H = 0, dpr = 1, parts = [], briefPts = [], headPts = [], nodes = [], hub = null, vis = false, raf = 0, t0 = 0, phase = -1, mouse = { x: -999, y: -999 };
    const sample = (lines, maxW, maxH, cy) => {
      const oc = document.createElement('canvas'); oc.width = Math.ceil(W); oc.height = Math.ceil(H);
      const o = oc.getContext('2d'); let size = 90;
      const fit = () => { o.font = `500 ${size}px Geist, system-ui, sans-serif`; return Math.max(...lines.map((l) => o.measureText(l).width)); };
      while ((fit() > maxW || size * 1.12 * lines.length > maxH) && size > 14) size -= 2;
      o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle';
      const lh = size * 1.12, y0 = cy - (lines.length - 1) * lh / 2;
      lines.forEach((l, i) => o.fillText(l, W / 2, y0 + i * lh));
      const d = o.getImageData(0, 0, oc.width, oc.height).data, gap = W < 600 ? 3 : 4, pts = [];
      for (let y = 0; y < oc.height; y += gap) for (let x = 0; x < oc.width; x += gap) if (d[(y * oc.width + x) * 4 + 3] > 140) pts.push([x, y]);
      for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
      return pts;
    };
    const layout = () => {
      const r = hero.getBoundingClientRect(); dpr = Math.min(1.5, devicePixelRatio || 1); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      briefPts = sample(BRIEF, W * .86, H * .4, H * .46);
      headPts = sample(HEAD, W * .8, H * .56, H * .47);
      const cx = W / 2, cy = H * .5, rx = Math.min(W * .36, 420), ry = Math.min(H * .3, 170);
      hub = { x: cx, y: cy, r: Math.min(48, W * .06) };
      nodes = NODES.map((n, i) => { const a = -Math.PI / 2 + i / NODES.length * Math.PI * 2 + .3; return { name: n, x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, ok: false }; });
      const N = Math.min(3400, Math.max(briefPts.length, headPts.length, 900));
      const old = parts; parts = Array.from({ length: N }, (_, i) => old[i] || { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: W / 2, ty: H / 2, c: 0, s: Math.random() * 2, node: i % NODES.length, role: 0, sz: 1.3 + Math.random() * 1.1 });
    };
    const ring = (x, y, r, k, n) => { const a = k / n * Math.PI * 2; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; };
    const bez = (p0, p1, s) => { const mx = (p0.x + p1.x) / 2 + (p1.y - p0.y) * .22, my = (p0.y + p1.y) / 2 - (p1.x - p0.x) * .22; const u = 1 - s; return [u * u * p0.x + 2 * u * s * mx + s * s * p1.x, u * u * p0.y + 2 * u * s * my + s * s * p1.y]; };
    const setPhase = (p) => {
      phase = p; const st = STEPS[p];
      stepEl.innerHTML = `<b>${st[0]}</b> · ${st[1]}`; capEl.textContent = st[3]; dots.forEach((d, i) => d.classList.toggle('on', i <= p));
      if (st[2] === 'brief') parts.forEach((q, i) => { const pt = briefPts[i]; q.role = pt ? 1 : 0; if (pt) { q.tx = pt[0]; q.ty = pt[1]; } else { q.tx = Math.random() * W; q.ty = Math.random() * H; } q.c = 0; });
      if (st[2] === 'net') { nodes.forEach((n) => { n.ok = false; }); parts.forEach((q, i) => { if (i < 70) { q.role = 2; [q.tx, q.ty] = ring(hub.x, hub.y, hub.r, i, 70); } else if (i < 70 + NODES.length * 36) { q.role = 3; q.node = Math.floor((i - 70) / 36); [q.tx, q.ty] = ring(nodes[q.node].x, nodes[q.node].y, 16, (i - 70) % 36, 36); } else { q.role = 4; q.node = i % NODES.length; q.s = Math.random() * 2; } q.c = 0; }); }
      if (st[2] === 'head') parts.forEach((q, i) => { const pt = headPts[i]; q.role = pt ? 1 : 5; if (pt) { q.tx = pt[0]; q.ty = pt[1]; q.c = Math.random() < .12 ? 2 : 0; } else { q.s = Math.random() * Math.PI * 2; } });
    };
    const COL = ['rgba(236,235,229,.9)', 'rgba(143,155,255,.95)', 'rgba(215,255,60,.95)', 'rgba(239,122,98,.95)'];
    const frame = (now) => {
      raf = 0; if (!vis) return;
      const t = ((now - t0) / 1000) % T[4], p = T.findIndex((x, i) => t >= x && t < T[i + 1]);
      if (p !== phase) setPhase(p);
      const gateOn = phase === 2, gateR = hub.r * 2.4;
      ctx.fillStyle = 'rgba(12,14,19,.32)'; ctx.fillRect(0, 0, W, H);
      if (phase === 1 || phase === 2) {
        ctx.strokeStyle = 'rgba(143,155,255,.12)'; ctx.lineWidth = 1;
        nodes.forEach((n) => { ctx.beginPath(); for (let s = 0; s <= 1.001; s += .05) { const [x, y] = bez(hub, n, s); s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
        if (gateOn) { ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(215,255,60,.7)'; ctx.beginPath(); ctx.arc(hub.x, hub.y, gateR, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
      }
      const tp = t - T[phase];
      parts.forEach((q, i) => {
        if (q.role === 4) {
          q.s = (q.s + .006 + (i % 7) * .0004) % 2; const n = nodes[q.node];
          const out = q.s < 1, s = out ? q.s : 2 - q.s; [q.tx, q.ty] = bez(hub, n, s);
          if (gateOn) { const d = Math.hypot(q.tx - hub.x, q.ty - hub.y); if (out && d > gateR) q.c = 2; if (!out && d < gateR * .9) q.c = 2; if (tp > 1.4) n.ok = true; } else q.c = 1;
        } else if (q.role === 3 && gateOn && nodes[q.node].ok) q.c = 2;
        else if (q.role === 2) q.c = gateOn ? 2 : 1;
        else if (q.role === 5) { q.s += .004; const rr = Math.min(W, H) * .44 + (i % 30) * 2; q.tx = W / 2 + Math.cos(q.s + i) * rr; q.ty = H / 2 + Math.sin(q.s + i) * rr * .5; q.c = i % 9 === 0 ? 2 : 1; }
        const k = q.role === 4 ? .09 : .045, dx = q.tx - q.x, dy = q.ty - q.y;
        q.vx = (q.vx + dx * k) * .84; q.vy = (q.vy + dy * k) * .84;
        const mx = q.x - mouse.x, my = q.y - mouse.y, md = mx * mx + my * my;
        if (md < 9000) { const f = (9000 - md) / 9000 * 4; const m = Math.sqrt(md) || 1; q.vx += mx / m * f; q.vy += my / m * f; }
        q.x += q.vx; q.y += q.vy;
        ctx.fillStyle = COL[q.c]; ctx.fillRect(q.x, q.y, q.sz, q.sz);
      });
      if (phase === 1 || phase === 2) {
        ctx.font = '500 11px "Geist Mono", ui-monospace, monospace'; ctx.textAlign = 'center';
        const a = Math.min(1, tp / .8);
        nodes.forEach((n) => { ctx.fillStyle = n.ok && gateOn ? `rgba(215,255,60,${a})` : `rgba(207,210,218,${a})`; ctx.fillText(n.name + (n.ok && gateOn ? ' ✓' : ''), n.x, n.y + 34); });
        ctx.fillStyle = `rgba(215,255,60,${a})`; ctx.fillText('ATFGRAPH', hub.x, hub.y + 4);
        if (gateOn) {
          ctx.fillStyle = 'rgba(215,255,60,.9)'; ctx.fillText('KEEL · CHECKED TOOLS', hub.x, hub.y - gateR - 10);
          if (tp > 2.4) { const pa = Math.min(1, (tp - 2.4) / .5), bw = 210, bx = hub.x - bw / 2, by = H * .08; ctx.fillStyle = `rgba(215,255,60,${pa})`; ctx.fillRect(bx, by, bw, 30); ctx.fillStyle = `rgba(12,14,19,${pa})`; ctx.font = '500 12px "Geist Mono", monospace'; ctx.fillText('A PERSON APPROVES ✓', hub.x, by + 19); }
        }
        ctx.textAlign = 'left';
      }
      // Cursor: a small lime reticle.
      if (mouse.x > 0) { ctx.strokeStyle = 'rgba(215,255,60,.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#d7ff3c'; ctx.fillRect(mouse.x - 1.5, mouse.y - 1.5, 3, 3); }
      raf = requestAnimationFrame(frame);
    };
    const still = () => { ctx.fillStyle = '#0c0e13'; ctx.fillRect(0, 0, W, H); setPhase(3); parts.forEach((q, i) => { const pt = headPts[i]; if (!pt) return; ctx.fillStyle = COL[i % 8 === 0 ? 2 : 0]; ctx.fillRect(pt[0], pt[1], 2, 2); }); };
    hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    const start = () => { layout(); t0 = performance.now(); phase = -1; if (REDUCE) { still(); return; } if (vis && !raf) raf = requestAnimationFrame(frame); };
    onVisible(hero, (v) => { vis = v; if (v && !raf && !REDUCE) raf = requestAnimationFrame(frame); });
    new ResizeObserver(() => { const r = hero.getBoundingClientRect(); if (Math.abs(r.width - W) > 2) start(); }).observe(hero);
    replay.c = start;
    (document.fonts?.ready || Promise.resolve()).then(start);
  })();
})();
