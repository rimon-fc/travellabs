(() => {
'use strict';
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = typeof window.gsap !== 'undefined';
const M = window.Motion || null;
if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
const safe = (name, fn) => { try { fn(); } catch (e) { console.warn('[travellabs]', name, e); } };
const TAU = Math.PI * 2;
const hash = (a, b = 0, s = 0) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(s | 0, 1013904223)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const sm = (t) => t * t * (3 - 2 * t);
const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = sm(x - xi), v = sm(y - yi); const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };

/* ---------- the stack: isometric layers, auto-cycling ---------- */
safe('stack', () => {
  const svg = document.getElementById('stackSvg'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a = {}, p) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); if (p) p.appendChild(n); return n; };
  const CO = .866, W = 230, OX = 330, GAP = 118;
  const P = (oy, u, v, z = 0) => [OX + (u - v) * CO, oy + (u + v) * .5 - z];
  const pts = (a) => a.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
  const items = [...document.querySelectorAll('.st-item')];
  const SK = [
    { top: '#f8f6f1', l: '#e8e4da', r: '#d5d0c1', on: ['#ff93ed', '#c56bb6', '#a85a9b'] },
    { top: '#f8f6f1', l: '#e8e4da', r: '#d5d0c1', on: ['#b6d6e3', '#8fb4c3', '#7aa0af'] },
    { top: '#f8f6f1', l: '#e8e4da', r: '#d5d0c1', on: ['#2176ff', '#203f72', '#18305c'] },
    { top: '#f8f6f1', l: '#e8e4da', r: '#d5d0c1', on: ['#d5d0c1', '#c3bca9', '#a9a28c'] }
  ];
  const DECO = [
    (g, oy) => { [['B2C', 40, 40], ['B2B', 130, 120]].forEach(([t, u, v]) => { el('polygon', { points: pts([P(oy, u, v, 16), P(oy, u + 60, v, 16), P(oy, u + 60, v + 60, 16), P(oy, u, v + 60, 16)]), class: 'sx-b' }, g); el('polygon', { points: pts([P(oy, u, v + 60, 16), P(oy, u + 60, v + 60, 16), P(oy, u + 60, v + 60), P(oy, u, v + 60)]), class: 'sx-bl' }, g); el('polygon', { points: pts([P(oy, u + 60, v, 16), P(oy, u + 60, v + 60, 16), P(oy, u + 60, v + 60), P(oy, u + 60, v)]), class: 'sx-br' }, g); }); },
    (g, oy) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) el('polygon', { points: pts([P(oy, 20 + i * 52, 20 + j * 52), P(oy, 60 + i * 52, 20 + j * 52), P(oy, 60 + i * 52, 60 + j * 52), P(oy, 20 + i * 52, 60 + j * 52)]), class: 'sx-cell' }, g); },
    (g, oy) => { const N = [[30, 115], [80, 115], [140, 50], [140, 115], [140, 180], [200, 115]]; [[0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5]].forEach(([a, b]) => { const A = P(oy, ...N[a]), B = P(oy, ...N[b]); el('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: 'sx-edge' }, g); }); N.forEach(n => { el('polygon', { points: pts([P(oy, n[0] - 9, n[1] - 9), P(oy, n[0] + 9, n[1] - 9), P(oy, n[0] + 9, n[1] + 9), P(oy, n[0] - 9, n[1] + 9)]), class: 'sx-node' }, g); }); },
    (g, oy) => { for (let k = 1; k < 8; k++) { const A = P(oy, k * 28, 4), B = P(oy, k * 28, W - 4); el('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: 'sx-rule' }, g); } }
  ];
  const layers = items.map((_, i) => {
    const g = el('g', { class: 'sx-layer' }, svg), oy = 30 + i * GAP, z = 14, s = SK[i];
    const lf = el('polygon', { points: pts([P(oy, 0, W), P(oy, W, W), P(oy, W, W, -z), P(oy, 0, W, -z)]), fill: s.l, class: 'sx-s' }, g);
    const rf = el('polygon', { points: pts([P(oy, W, 0), P(oy, W, W), P(oy, W, W, -z), P(oy, W, 0, -z)]), fill: s.r, class: 'sx-s' }, g);
    const tp = el('polygon', { points: pts([P(oy, 0, 0), P(oy, W, 0), P(oy, W, W), P(oy, 0, W)]), fill: s.top, class: 'sx-s' }, g);
    DECO[i](g, oy);
    const [lx, ly] = P(oy, 0, W, -z / 2);
    el('line', { x1: lx - 10, y1: ly, x2: 70, y2: ly, class: 'sx-lead' }, g);
    const t = el('text', { x: 64, y: ly + 4, 'text-anchor': 'end', class: 'sx-lab' }, g); t.textContent = items[i].dataset.short;
    return { g, lf, rf, tp, s };
  });
  // draw bottom first so upper layers overlap correctly
  layers.slice().reverse().forEach(L => svg.appendChild(L.g));
  let cur = -1, acc = 0, hover = false, last = 0, raf = 0, visible = false;
  const set = (i) => {
    cur = i; acc = 0;
    items.forEach((it, k) => it.classList.toggle('on', k === i));
    layers.forEach((L, k) => {
      const on = k === i;
      L.tp.setAttribute('fill', on ? L.s.on[0] : L.s.top); L.lf.setAttribute('fill', on ? L.s.on[1] : L.s.l); L.rf.setAttribute('fill', on ? L.s.on[2] : L.s.r);
      L.g.classList.toggle('on', on);
      if (hasGsap && !REDUCE) gsap.to(L.g, { y: on ? -14 : 0, duration: .5, ease: 'power3.out' }); else L.g.setAttribute('transform', `translate(0 ${on ? -14 : 0})`);
    });
  };
  items.forEach((it, i) => { it.addEventListener('pointerenter', () => { hover = true; set(i); }); it.addEventListener('pointerleave', () => { hover = false; }); it.addEventListener('focus', () => set(i)); });
  set(0);
  const tick = (t) => {
    raf=0; if(!visible || document.hidden || window.TLMotion.paused) {last=0;return;}
    const dt=last?Math.min(60,t-last):0;last=t;
    if(!hover){acc+=dt;if(acc>3400)set((cur+1)%items.length);}
    raf=requestAnimationFrame(tick);
  };
  const sync=()=>{if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(visible&&!document.hidden&&!window.TLMotion.paused)raf=requestAnimationFrame(tick)};
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()}).observe(svg);
  window.addEventListener('lab-motion',sync);document.addEventListener('visibilitychange',sync);
});
/* ---------- v6 artwork: clean line scenes on canvas ---------- */
// Every canvas[data-scene] gets a draw(ctx, W, H, t, k). k is the before/after blend for the problem cards.
safe('scenes', () => {
  const C = { paper: '#f1eee7', paper2: '#e8e4da', khaki: '#d5d0c1', card: '#f8f6f1', ink: '#272b2d', ink2: '#403e34', muted: '#6c6a60', soft: '#9a968a', line: '#d3cdbd', line2: '#c3bca9', blue: '#2176ff', navy: '#203f72', pink: '#ff93ed', sky: '#b6d6e3', sky2: '#e9f2f6' };
  const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const lerp = (a, b, k) => a + (b - a) * k;
  const bez = (p0, p1, p2, p3, u) => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };
  const CYCLE = 9000;
  const phase = (t) => { const q = t % CYCLE; if (q < 3400) return 0; if (q < 4400) return ease((q - 3400) / 1000); if (q < 8000) return 1; return 1 - ease((q - 8000) / 1000); };
  const ICON = {
    plane: new Path2D('M14 7.4 9.6 6V2.2L8 .8 6.4 2.2V6L2 7.4v1.4l4.4-.9v3.3L5 12.4v1.2l3-.8 3 .8v-1.2l-1.4-1.2V7.9l4.4.9Z'),
    bed: new Path2D('M1 3h1.4v5H14a1 1 0 0 1 1 1v4h-1.4v-1.6H2.4V13H1Zm2.4 1.6h3v2.6h-3Zm4.2.6h4.4a1.6 1.6 0 0 1 1.6 1.6v.4H7.6Z'),
    card: new Path2D('M.4 2.4h15.2v11.2H.4Zm1.2 4.8v5.2h12.8V7.2Zm0-3.6V6h12.8V3.6Zm2 6.2h2v1.4h-2Z'),
    doc: new Path2D('M2.6 1h7l3.8 3.8V15H2.6Zm1.2 1.2v11.6h8.4V5.4H9V2.2Zm1.6 5h5.2v1.2H5.4Zm0 2.4h5.2v1.2H5.4Z'),
    train: new Path2D('M3 1.4h10v10.2l-1.4 1.4 1.2 1.6h-1.5l-1-1.2H5.7l-1 1.2H3.2l1.2-1.6L3 11.6Zm1.2 1.2v4h7.6v-4Zm1 6.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm5.6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z'),
    bag: new Path2D('M5 2.4h6v2h3.6v9.2H1.4V4.4H5Zm1.2 1.2v.8h3.6v-.8Zm-3.6 2v6.8h10.8V5.6Z'),
    graph: new Path2D('M1.4 6.6h3.2v1h2.2l2-3h-.4V1.4h3.2v3.2H9.4l-2 3 2 3h.2v-.2h3.2v3.2H9.6v-2.4l-2-3H4.6v1H1.4Z')
  };
  const icon = (ctx, name, x, y, s, color) => { ctx.save(); ctx.translate(x, y); ctx.scale(s / 16, s / 16); ctx.fillStyle = color; ctx.fill(ICON[name]); ctx.restore(); };
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const box = (ctx, x, y, w, h, r, fill, stroke = C.ink, lw = 1) => { rr(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } };
  const txt = (ctx, s, x, y, color = C.muted, size = 10.5, align = 'left', weight = '') => { ctx.font = `${weight}${size}px "JetBrains Mono", monospace`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); };
  const line = (ctx, a, b, color = C.ink, lw = 1, dash) => { ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); if (dash) ctx.setLineDash([]); };
  const check = (ctx, x, y, s, color = '#fff') => { ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x - s * .3, y + s * .7); ctx.lineTo(x + s, y - s * .7); ctx.stroke(); };
  const dotGrid = (ctx, W, H, step = 18, color = C.line) => { ctx.fillStyle = color; for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) ctx.fillRect(x, y, 1.2, 1.2); };
  const chip = (ctx, s, x, y, on, size = 10) => { ctx.font = `${size}px "JetBrains Mono", monospace`; const w = ctx.measureText(s).width + 14, h = size + 9; box(ctx, x, y - h / 2, w, h, h / 2, on ? C.blue : C.card, on ? C.blue : C.ink); txt(ctx, s, x + 7, y + .5, on ? '#fff' : C.ink, size); return w; };

  const SCENES = {
    /* ----- problem cards (before -> after) ----- */
    sprawl(ctx, W, H, t, k) {
      const names = ['plane', 'bed', 'card', 'doc', 'train', 'bag'];
      const ax = W * .86, ay = H * .52, as = H * .2, gx = W * .5, ts = H * .1;
      const S = names.map((_, i) => [W * .1, H * (.26 + i * .114)]), E = [ax - as / 2, ay];
      if (k > .02) { ctx.globalAlpha = k; box(ctx, gx - 9, H * .22, 18, H * .66, 9, C.khaki); txt(ctx, 'keel', gx, H * .18, C.ink, 10.5, 'center'); ctx.globalAlpha = 1; }
      names.forEach((nm, i) => {
        const w1 = Math.sin(t / 700 + i * 1.7) * H * .05, w2 = Math.cos(t / 900 + i) * H * .06;
        const tc1 = [W * (.25 + .3 * hash(i, 1)), H * (.05 + .9 * hash(i, 2)) + w1], tc2 = [W * (.45 + .3 * hash(i, 3)), H * (.05 + .9 * hash(i, 4)) + w2];
        const c1 = [lerp(tc1[0], W * .62, k), lerp(tc1[1], S[i][1], k)], c2 = [lerp(tc2[0], W * .7, k), lerp(tc2[1], ay, k)], P0 = [S[i][0] + ts / 2 + 4, S[i][1]];
        ctx.beginPath(); ctx.moveTo(...P0); ctx.bezierCurveTo(...c1, ...c2, ...E);
        ctx.strokeStyle = k > .5 ? C.navy : C.ink2; ctx.globalAlpha = lerp(.45, .9, k); ctx.lineWidth = lerp(1, 1.4, k); ctx.setLineDash(k > .5 ? [] : [3, 3]); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        for (let p = 0; p < 2; p++) {
          let u = ((t / (1500 + i * 120)) + i * .17 + p * .5) % 1;
          const fail = k < .5 && i % 3 === 0 && u > .42; if (fail) u = .42;
          const [x, y] = bez(P0, c1, c2, E, u);
          if (fail) { line(ctx, [x - 4, y - 4], [x + 4, y + 4], C.pink, 2); line(ctx, [x + 4, y - 4], [x - 4, y + 4], C.pink, 2); }
          else { ctx.fillStyle = k > .5 ? C.blue : C.ink; ctx.fillRect(x - 2.5, y - 2.5, 5, 5); }
        }
        if (k > .5) { ctx.fillStyle = C.blue; ctx.fillRect(gx - 3, S[i][1] - 3, 6, 6); }
        box(ctx, S[i][0] - ts / 2, S[i][1] - ts / 2, ts, ts, 3, C.card); icon(ctx, nm, S[i][0] - ts * .32, S[i][1] - ts * .32, ts * .64, C.ink);
      });
      ctx.fillStyle = C.ink; rr(ctx, ax - as / 2 + 3, ay - as / 2 + 3, as, as, 5); ctx.fill();
      box(ctx, ax - as / 2, ay - as / 2, as, as, 5, k > .5 ? C.blue : C.card); icon(ctx, 'graph', ax - as * .3, ay - as * .3, as * .6, k > .5 ? '#fff' : C.ink);
      txt(ctx, 'agent', ax, ay + as / 2 + 12, C.ink, 10.5, 'center');
      txt(ctx, k > .5 ? '6 typed MCP tools' : '6 APIs · 6 formats · guesswork', W * .04, H * .92, k > .5 ? C.blue : C.muted);
    },
    drift(ctx, W, H, t, k) {
      const bx = W * .3, by = H * .27, bw = W * .4, bh = H * .46, ns = H * .13;
      const N = [[W * .14, H * .52], [W * .34, H * .26], [W * .34, H * .52], [W * .34, H * .78], [W * .56, H * .52], [W * .78, H * .52]];
      const cells = N.map((_, i) => [bx + (i % 3) * bw / 3, by + Math.floor(i / 3) * bh / 2, bw / 3, bh / 2]);
      if (k > .02) { ctx.globalAlpha = k; [[0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5]].forEach(([a, b]) => line(ctx, N[a], N[b], C.ink, 1.2)); ctx.globalAlpha = 1; }
      if (k < .98) {
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = C.ink2; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
        const q = (t / 2600) % 1, P = (u) => [bx + bw + u * W * .26, H * .5 + Math.sin(u * 9 + t / 600) * H * .08 * u + u * u * H * .32];
        for (let s = 0; s <= 70 * q; s++) { const [x, y] = P(s / 70); s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke(); ctx.setLineDash([]);
        const [x, y] = P(q); ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
        if (q > .55) txt(ctx, '?', x + 9, y - 8, C.ink, 13);
        ctx.globalAlpha = 1;
      }
      const step = Math.floor((t % 4200) / 520);
      N.forEach((p, i) => {
        const [cx, cy, cw, ch] = cells[i];
        const w = lerp(cw, ns, k), h = lerp(ch, ns, k), x = lerp(cx + cw / 2, p[0], k) - w / 2, y = lerp(cy + ch / 2, p[1], k) - h / 2;
        const done = k > .9 && i < step, cur = k > .9 && i === step;
        box(ctx, x, y, w, h, lerp(0, 4, k), done ? C.blue : C.card, cur ? C.pink : C.ink, cur ? 2.2 : lerp(.6, 1, k));
        if (done) check(ctx, p[0], p[1], 5);
      });
      if (k < .5) {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.strokeRect(bx, by, bw, bh);
        txt(ctx, 'one prompt', bx + bw / 2, by + bh / 2, C.ink, 12, 'center');
        ctx.fillStyle = C.line; ctx.fillRect(bx, by + bh + 12, bw, 4); ctx.fillStyle = C.ink2; ctx.fillRect(bx, by + bh + 12, bw * (.35 + .15 * Math.sin(t / 900)), 4);
        txt(ctx, 'checks skipped', bx, by - 10);
      } else {
        const s = Math.min(step, 5);
        txt(ctx, ['plan', 'fares', 'stays', 'rules', 'verify', 'record'][s], N[s][0], N[s][1] + ns / 2 + 12, C.blue, 10.5, 'center');
        txt(ctx, `${Math.min(step, 6)} / 6 checked`, W * .04, H * .92, C.blue);
      }
    },
    record(ctx, W, H, t, k) {
      const cx = W * .27, cy = H * .55, bs = H * .38;
      for (let p = 0; p < 4; p++) { const u = ((t / 1300) + p / 4) % 1; ctx.fillStyle = C.ink; ctx.fillRect(W * .02 + u * (cx - bs / 2 - W * .02) - 2, cy - 2, 4, 4); }
      const layers = [['brief', C.card], ['steps · 6', C.sky2], ['approval · human', C.card], ['record · a91f', C.sky]];
      const active = Math.floor(t / 900) % 4;
      for (let i = layers.length - 1; i >= 0; i--) {
        const off = (i - 1.5) * H * .17 * k, lw = lerp(bs, W * .34, k), lh = lerp(bs, H * .12, k), sk = lerp(0, lh * .9, k), x = cx - lw / 2, y = cy + off - lh / 2;
        ctx.beginPath(); ctx.moveTo(x + sk, y); ctx.lineTo(x + lw + sk, y); ctx.lineTo(x + lw, y + lh); ctx.lineTo(x, y + lh); ctx.closePath();
        const lit = k > .9 && i === active;
        ctx.fillStyle = k < .5 ? C.ink : lit ? C.blue : layers[i][1]; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
        if (k > .6) txt(ctx, layers[i][0], x + sk + 12, y + lh / 2, lit ? '#fff' : C.ink, 11);
      }
      if (k < .5) {
        ctx.fillStyle = C.ink; ctx.fillRect(cx - bs / 2 + 4, cy - bs / 2 + 4, bs, bs);
        if (Math.floor(t / 500) % 2) txt(ctx, '?', cx, cy, C.paper, 26, 'center');
        for (let p = 0; p < 3; p++) { const u = ((t / 1500) + p / 3) % 1; ctx.fillStyle = C.ink; ctx.fillRect(cx + bs / 2 + 4 + u * W * .2, cy - 2, 4, 4); }
        txt(ctx, 'what did it do?', W * .04, H * .92);
      } else {
        const rows = ['brief received', 'search_fares SYD→HND', 'search_hotels Shinjuku', 'check_entry_rules', 'verify 6/6', 'consultant approval', 'run recorded'];
        const lx = W * .54, lw = W * .43, top = H * .24, rh = H * .086, s = Math.floor(t / 700);
        ctx.save(); ctx.globalAlpha = k;
        box(ctx, lx, top - 22, lw, rh * 7 + 30, 0, C.card);
        txt(ctx, 'run a91f · log', lx + 8, top - 11, C.soft, 9); ctx.fillStyle = C.line; ctx.fillRect(lx, top - 2, lw, 1);
        for (let r = 0; r < 7; r++) {
          const idx = (s + r) % rows.length, y = top + r * rh + rh / 2 + 2, last = r === 6;
          if (!last || Math.floor(t / 300) % 2) { ctx.fillStyle = last ? C.pink : C.blue; ctx.fillRect(lx + 8, y - 3, 6, 6); }
          txt(ctx, rows[idx], lx + 20, y, last ? C.ink : C.ink2, 9.5);
        }
        ctx.restore();
        txt(ctx, 'every step on the record', W * .04, H * .92, C.blue);
      }
    },

    /* ----- product cards ----- */
    // keel: specs and documents go into the press, typed tools come out into a scanned bundle
    forge(ctx, W, H, t) {
      dotGrid(ctx, W, H, 20);
      const docs = ['openapi.yaml', 'schema.graphql', 'fare-rules.pdf', 'postman.json'], tools = ['search_fares', 'search_hotels', 'hold_room', 'check_rules'];
      const D = 1600, n = Math.floor(t / D), p = (t % D) / D;
      const mx = W * .36, my = H * .26, mw = W * .25, mh = H * .5;
      // stack of documents waiting
      for (let i = 2; i >= 0; i--) box(ctx, W * .05 + i * 5, H * .32 - i * 5, W * .17, H * .3, 3, C.card);
      txt(ctx, 'specs + docs', W * .05, H * .72, C.muted, 9.5);
      // the moving document
      const dx = lerp(W * .05 + 10, mx + 6, ease(Math.min(1, p * 1.6))), da = p < .6 ? 1 : 1 - (p - .6) / .25;
      if (da > 0) { ctx.globalAlpha = Math.max(0, da); box(ctx, dx, H * .3, W * .17, H * .3, 3, '#fff'); txt(ctx, docs[n % 4], dx + 6, H * .36, C.ink, 9); for (let l = 0; l < 4; l++) { ctx.fillStyle = C.line; ctx.fillRect(dx + 6, H * .42 + l * 8, W * .12 - (l % 2) * 14, 2); } ctx.globalAlpha = 1; }
      // press
      ctx.fillStyle = C.ink; rr(ctx, mx + 4, my + 4, mw, mh, 6); ctx.fill();
      box(ctx, mx, my, mw, mh, 6, C.khaki);
      txt(ctx, 'keel build', mx + mw / 2, my + 14, C.ink, 10, 'center');
      const stages = ['parse', 'type', 'test', 'scan'];
      stages.forEach((s, i) => { const on = Math.floor(p * 5) > i; box(ctx, mx + 10, my + 28 + i * (mh - 40) / 4, mw - 20, (mh - 40) / 4 - 5, 3, on ? C.blue : C.card, C.ink); txt(ctx, s, mx + 18, my + 28 + i * (mh - 40) / 4 + ((mh - 40) / 4 - 5) / 2, on ? '#fff' : C.ink, 9.5); if (on) check(ctx, mx + mw - 22, my + 28 + i * (mh - 40) / 4 + ((mh - 40) / 4 - 5) / 2, 3.5); });
      // conveyor to the bundle
      const cy = my + mh * .78;
      line(ctx, [mx + mw, cy + 10], [W * .74, cy + 10], C.ink, 1);
      ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t / 40; line(ctx, [mx + mw, cy + 14], [W * .74, cy + 14], C.soft, 1); ctx.setLineDash([]); ctx.lineDashOffset = 0;
      if (p > .55) { const q = (p - .55) / .45, x = lerp(mx + mw + 4, W * .7, q); chip(ctx, tools[n % 4], x - 30, cy, true, 8.5); }
      // bundle crate
      const bx = W * .74, by = H * .34, bw = W * .2, bh = H * .4;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 10, by - 10); ctx.lineTo(bx + bw + 10, by - 10); ctx.lineTo(bx + bw, by); ctx.closePath(); ctx.fillStyle = C.paper2; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw + 10, by - 10); ctx.lineTo(bx + bw + 10, by + bh - 10); ctx.lineTo(bx + bw, by + bh); ctx.closePath(); ctx.fillStyle = C.khaki; ctx.fill(); ctx.stroke();
      box(ctx, bx, by, bw, bh, 0, C.card);
      const fill = (n % 4) + (p > .9 ? 1 : 0);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = i < fill ? C.blue : C.line; ctx.fillRect(bx + 8, by + bh - 14 - i * 12, bw - 16, 8); }
      txt(ctx, 'trip-desk.mcpb', bx, by + bh + 12, C.ink, 9);
      txt(ctx, 'sha256 9f2c…e1', bx, by + bh + 25, C.soft, 8.5);
      if (fill >= 4) { box(ctx, bx + bw - 34, by - 32, 38, 18, 9, C.pink); txt(ctx, 'L3 ✓', bx + bw - 15, by - 23, C.ink, 9, 'center'); }
    },
    // atfgraph: a brief unfolds into a graph that runs, waits for a person, and records
    graphrun(ctx, W, H, t) {
      dotGrid(ctx, W, H, 20);
      const T = 7000, q = (t % T) / T;
      const N = { brief: [W * .08, H * .5], plan: [W * .24, H * .5], a: [W * .42, H * .22], b: [W * .42, H * .5], c: [W * .42, H * .78], verify: [W * .6, H * .5], approve: [W * .76, H * .5], record: [W * .92, H * .5] };
      const E = [['brief', 'plan', 0], ['plan', 'a', .12], ['plan', 'b', .12], ['plan', 'c', .12], ['a', 'verify', .42], ['b', 'verify', .42], ['c', 'verify', .42], ['verify', 'approve', .56], ['approve', 'record', .8]];
      const lit = { brief: 0, plan: .1, a: .4, b: .32, c: .44, verify: .54, approve: .78, record: .9 };
      E.forEach(([a, b, s]) => { const on = q > s; line(ctx, N[a], N[b], on ? C.navy : C.line2, on ? 1.4 : 1); if (q > s && q < s + .3) { const u = Math.min(1, (q - s) / (b === 'record' ? .1 : b === 'approve' ? .2 : .28)), x = lerp(N[a][0], N[b][0], u), y = lerp(N[a][1], N[b][1], u); ctx.fillStyle = C.blue; ctx.fillRect(x - 3, y - 3, 6, 6); } });
      const labels = { brief: 'brief', plan: 'plan', a: 'fares', b: 'stays', c: 'rules', verify: 'verify', approve: 'human', record: 'record' };
      for (const key in N) {
        const [x, y] = N[key], s = 22, on = q > lit[key], waiting = key === 'approve' && q > .58 && q < .78;
        if (waiting) { const pr = (t % 900) / 900; ctx.strokeStyle = C.pink; ctx.globalAlpha = 1 - pr; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, s * .6 + pr * 14, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
        box(ctx, x - s / 2, y - s / 2, s, s, 5, waiting ? C.pink : on ? C.blue : C.card);
        if (on && !waiting) check(ctx, x, y, 4.5);
        txt(ctx, labels[key], x, y + s / 2 + 11, on ? C.ink : C.soft, 9.5, 'center');
      }
      // verification rungs above verify
      for (let i = 0; i < 7; i++) { const on = q > .44 + i * .014; ctx.fillStyle = on ? C.blue : C.line; ctx.fillRect(N.verify[0] - 10, N.verify[1] - 30 - i * 5, 20, 3); }
      // recorded film strip grows along the bottom
      const fw = (W * .84) * Math.min(1, Math.max(0, (q - .88) / .1));
      if (fw > 2) { box(ctx, W * .08, H * .9, fw, 10, 2, C.ink, null); for (let x = W * .08 + 4; x < W * .08 + fw - 4; x += 9) { ctx.fillStyle = C.paper; ctx.fillRect(x, H * .9 + 3, 4, 4); } }
      txt(ctx, q < .58 ? 'running · 3 in parallel' : q < .78 ? 'waiting for consultant' : 'run a91f recorded', W * .04, H * .08, q > .58 && q < .78 ? '#c03aa8' : C.blue, 10);
    },

    /* ----- how it works ----- */
    briefchat(ctx, W, H, t) {
      dotGrid(ctx, W, H, 20);
      const T = 6500, q = (t % T) / T, msg = '3 nights in Lisbon, flights + hotel, under €1,500';
      const n = Math.floor(Math.min(1, q / .4) * msg.length);
      const bx = W * .08, by = H * .14, bw = W * .84, bh = H * .22;
      box(ctx, bx, by, bw, bh, 12, C.card); txt(ctx, 'you', bx + 12, by - 8, C.soft, 9);
      ctx.font = '12px "Inter", sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(msg.slice(0, n) + (q < .4 && Math.floor(t / 300) % 2 ? '▌' : ''), bx + 14, by + bh / 2);
      const fields = [['dest', 'LIS'], ['nights', '3'], ['needs', 'flight · hotel'], ['cap', '€1,500']];
      fields.forEach(([k, v], i) => {
        const on = q > .45 + i * .08; if (!on) return;
        const x = W * .08 + (i % 2) * W * .43, y = H * .52 + Math.floor(i / 2) * H * .2;
        line(ctx, [bx + bw * (.2 + .2 * i), by + bh], [x + 40, y - 12], C.line2, 1, [2, 3]);
        box(ctx, x, y - 14, W * .4, 28, 6, i === 3 ? C.sky2 : '#fff', C.ink);
        txt(ctx, k, x + 10, y, C.soft, 9.5); txt(ctx, v, x + W * .4 - 10, y, C.ink, 11, 'right');
      });
      if (q > .8) txt(ctx, 'brief → 4 facts', W * .08, H * .93, C.blue, 10);
    },
    plugtools(ctx, W, H, t) {
      dotGrid(ctx, W, H, 20);
      const sup = [['plane', 'airline NDC'], ['bed', 'bedbank'], ['doc', 'fare rules'], ['card', 'payments']];
      const T = 6000, q = (t % T) / T, ax = W * .78;
      box(ctx, ax - 6, H * .12, 40, H * .76, 6, C.khaki); txt(ctx, 'agent', ax + 14, H * .08, C.ink, 10, 'center');
      sup.forEach(([ic, name], i) => {
        const y = H * (.2 + i * .2), sx = W * .14, plugged = q > .15 + i * .18, p = Math.min(1, Math.max(0, (q - .02 - i * .18) / .13));
        box(ctx, sx - 16, y - 16, 32, 32, 5, C.card); icon(ctx, ic, sx - 10, y - 10, 20, C.ink); txt(ctx, name, sx + 24, y - 14, C.muted, 9);
        const end = [lerp(sx + 18, ax - 8, ease(p)), y];
        ctx.strokeStyle = plugged ? C.navy : C.ink2; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(sx + 16, y); ctx.bezierCurveTo(sx + 60, y + 18, end[0] - 60, y + 18, end[0], end[1]); ctx.stroke();
        ctx.fillStyle = plugged ? C.blue : C.ink; ctx.fillRect(end[0] - 6, end[1] - 4, 8, 8);
        if (plugged) { box(ctx, ax + 4, y - 6, 20, 12, 3, C.blue, null); txt(ctx, 'L3 ✓', W * .5, y - 11, C.blue, 9, 'center'); }
      });
    },
    racelanes(ctx, W, H, t) {
      dotGrid(ctx, W, H, 20);
      const T = 5200, q = (t % T) / T, lanes = [['flights', .9, 612], ['hotels', 1.15, 540], ['rules', 1.6, 0]];
      const x0 = W * .2, x1 = W * .86, cap = x0 + (x1 - x0) * .9;
      lanes.forEach(([name, sp, cost], i) => {
        const y = H * (.24 + i * .22), p = Math.min(1, q * sp * 1.3);
        txt(ctx, name, W * .05, y, C.ink, 10.5);
        box(ctx, x0, y - 8, x1 - x0, 16, 8, C.card);
        rr(ctx, x0, y - 8, Math.max(16, (x1 - x0) * p), 16, 8); ctx.fillStyle = p >= 1 ? C.blue : C.sky; ctx.fill();
        if (p >= 1) check(ctx, x0 + (x1 - x0) - 12, y, 4);
        txt(ctx, cost ? `€${Math.round(cost * p)}` : (p >= 1 ? 'ok' : '…'), x0 + 8, y + 18, C.muted, 9);
      });
      line(ctx, [cap, H * .12], [cap, H * .74], '#c03aa8', 1, [3, 3]); txt(ctx, 'cap €1,500', cap, H * .08, '#c03aa8', 9, 'center');
      const total = Math.round(612 * Math.min(1, q * 1.17) + 540 * Math.min(1, q * 1.5));
      txt(ctx, `€${total} / €1,500`, W * .05, H * .9, C.ink, 10.5); if (q > .8) txt(ctx, 'plan ready', W * .95, H * .9, C.blue, 10.5, 'right');
    },
    stamp(ctx, W, H, t) {
      dotGrid(ctx, W, H, 20);
      const T = 6000, q = (t % T) / T, rungs = ['accept', 'schema', 'invariants', 're-derive', 'adversary', 'cost', 'human'];
      rungs.forEach((r, i) => { const y = H * (.86 - i * .11), on = q > .06 + i * .08, hum = i === 6; box(ctx, W * .06, y - 8, W * .3, 16, 3, on ? (hum ? C.pink : C.blue) : C.card); txt(ctx, r, W * .06 + 8, y, on && !hum ? '#fff' : C.ink, 9); });
      // ticket
      const tx = W * .48, ty = H * .2, tw = W * .44, th = H * .58;
      box(ctx, tx, ty, tw, th, 6, '#fff');
      txt(ctx, 'HOLD · LIS', tx + 12, ty + 16, C.ink, 10.5, 'left', '500 ');
      [['flight', '€612'], ['hotel', '€540'], ['total', '€1,152']].forEach(([a, b], i) => { txt(ctx, a, tx + 12, ty + 40 + i * 18, C.muted, 9.5); txt(ctx, b, tx + tw - 12, ty + 40 + i * 18, C.ink, 9.5, 'right'); });
      if (q > .68) {
        const s = q < .74 ? 1.6 - (q - .68) / .06 * .6 : 1, a = Math.min(1, (q - .68) / .04);
        ctx.save(); ctx.globalAlpha = a; ctx.translate(tx + tw / 2, ty + th * .75); ctx.rotate(-.12); ctx.scale(s, s);
        box(ctx, -48, -14, 96, 28, 4, null, '#c03aa8', 2); txt(ctx, 'APPROVED', 0, 0, '#c03aa8', 11, 'center', '600 ');
        ctx.restore();
      }
    },
    film(ctx, W, H, t) {
      dotGrid(ctx, W, H, 20);
      const steps = ['brief', 'plan', 'fares', 'stays', 'rules', 'verify', 'approve', 'hold', 'record'];
      const fw = W * .26, off = (t / 22) % fw, y = H * .2, h = H * .46;
      box(ctx, 0, y - 12, W, h + 24, 0, C.ink, null);
      for (let i = -1; i < W / fw + 1; i++) {
        const x = i * fw - off, idx = ((Math.floor(t / 22 / fw) + i) % steps.length + steps.length) % steps.length;
        box(ctx, x + 8, y, fw - 16, h, 3, C.card, null);
        txt(ctx, steps[idx], x + 16, y + 14, C.ink, 10);
        txt(ctx, `+${(idx * .47).toFixed(1)}s`, x + 16, y + h - 12, C.soft, 9);
        ctx.fillStyle = idx === 6 ? C.pink : C.blue; ctx.fillRect(x + 16, y + h / 2 - 3, (fw - 40) * (.4 + .6 * hash(idx, 3)), 6);
        for (let s = 0; s < 6; s++) { ctx.fillStyle = C.paper; ctx.fillRect(x + 8 + s * (fw / 6), y - 8, 6, 4); ctx.fillRect(x + 8 + s * (fw / 6), y + h + 4, 6, 4); }
      }
      line(ctx, [W / 2, y - 18], [W / 2, y + h + 18], C.pink, 2);
      txt(ctx, 'run a91f · 9 steps · 4.2s · linkable', W * .05, H * .9, C.ink, 10);
    },

    /* ----- why now / why we win ----- */
    dawn(ctx, W, H, t) {
      const hz = H * .64, cx = W * .55, rise = Math.min(1, (t % 14000) / 5000), sr = H * .26, sy = hz + sr * .6 - rise * sr * .9;
      // sun with ruled stripes, clipped to the horizon
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, hz); ctx.clip();
      ctx.beginPath(); ctx.arc(cx, sy, sr, 0, 7); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.save(); ctx.clip(); for (let y = sy - sr; y < sy + sr; y += 7) line(ctx, [cx - sr, y], [cx + sr, y], C.sky, 2); ctx.restore();
      for (let a = 0; a < 12; a++) { const an = Math.PI + a / 11 * Math.PI; line(ctx, [cx + Math.cos(an) * (sr + 10), sy + Math.sin(an) * (sr + 10)], [cx + Math.cos(an) * (sr + 24), sy + Math.sin(an) * (sr + 24)], C.ink, 1, [2, 3]); }
      ctx.restore();
      line(ctx, [0, hz], [W, hz], C.ink, 1.2);
      // tower silhouette and a far runway
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(W * .12, hz - H * .3, 10, H * .3); ctx.beginPath(); ctx.moveTo(W * .1, hz - H * .3); ctx.lineTo(W * .12 + 14, hz - H * .3); ctx.lineTo(W * .12 + 18, hz - H * .36); ctx.lineTo(W * .1 - 4, hz - H * .36); ctx.closePath(); ctx.stroke();
      // three streams converge on the sun
      const streams = [['MCP standard', [W * .02, H * .98]], ['capable models', [W * .5, H * 1.02]], ['API-first suppliers', [W * .98, H * .98]]];
      streams.forEach(([name, s], i) => {
        const c = [lerp(s[0], cx, .3), hz + (H - hz) * .2], end = [cx, hz];
        ctx.strokeStyle = C.navy; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(...s); ctx.quadraticCurveTo(...c, ...end); ctx.stroke();
        for (let p = 0; p < 3; p++) { const u = ((t / 2400) + p / 3 + i * .11) % 1, v = 1 - u; const x = v * v * s[0] + 2 * v * u * c[0] + u * u * end[0], y = v * v * s[1] + 2 * v * u * c[1] + u * u * end[1]; ctx.fillStyle = i === 1 ? C.pink : C.blue; ctx.fillRect(x - 3, y - 3, 6, 6); }
        const lx = lerp(s[0], c[0], .35), ly = lerp(s[1], c[1], .35) - 10;
        txt(ctx, name, Math.min(W - 8, Math.max(8, lx)), ly, C.ink, 10, i === 0 ? 'left' : i === 2 ? 'right' : 'center');
      });
    },
    lighthouse(ctx, W, H, t) {
      const sea = H * .66, lx = W * .76, top = H * .2, lampY = top + 14;
      // beam sweeps across the water and catches ships
      const ang = Math.PI - .08 - (Math.sin(t / 2200) + 1) / 2 * .5;
      ctx.beginPath(); ctx.moveTo(lx, lampY); ctx.lineTo(lx + Math.cos(ang - .09) * W * 1.2, lampY + Math.sin(ang - .09) * W * 1.2); ctx.lineTo(lx + Math.cos(ang + .09) * W * 1.2, lampY + Math.sin(ang + .09) * W * 1.2); ctx.closePath();
      ctx.fillStyle = 'rgba(182,214,227,.55)'; ctx.fill();
      // sea
      for (let r = 0; r < 6; r++) { ctx.beginPath(); for (let x = 0; x <= W; x += 6) { const y = sea + r * 12 + Math.sin(x / 26 + t / 800 + r) * 2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = r ? C.line2 : C.ink; ctx.lineWidth = 1; ctx.stroke(); }
      // ships: lit when inside the beam
      for (let i = 0; i < 3; i++) {
        const sx = ((t / (60 + i * 25)) + i * W * .4) % (W * .7), sy = sea - 2 + i * 14;
        const a = Math.atan2(sy - lampY, sx - lx), inBeam = Math.abs(((a - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < .11;
        ctx.beginPath(); ctx.moveTo(sx - 16, sy - 6); ctx.lineTo(sx + 16, sy - 6); ctx.lineTo(sx + 10, sy + 2); ctx.lineTo(sx - 12, sy + 2); ctx.closePath(); ctx.fillStyle = inBeam ? C.blue : C.card; ctx.fill(); ctx.strokeStyle = C.ink; ctx.stroke();
        line(ctx, [sx, sy - 6], [sx, sy - 20], C.ink, 1); ctx.fillStyle = inBeam ? C.pink : C.ink; ctx.fillRect(sx, sy - 20, 9, 6);
      }
      // rock and tower
      ctx.beginPath(); ctx.moveTo(lx - W * .16, sea + 6); ctx.lineTo(lx - W * .08, sea - 14); ctx.lineTo(lx + W * .06, sea - 18); ctx.lineTo(lx + W * .18, sea + 6); ctx.closePath(); ctx.fillStyle = C.khaki; ctx.fill(); ctx.strokeStyle = C.ink; ctx.stroke();
      const bw = 18, tw = 30, base = sea - 16;
      ctx.beginPath(); ctx.moveTo(lx - tw / 2, base); ctx.lineTo(lx - bw / 2, top + 26); ctx.lineTo(lx + bw / 2, top + 26); ctx.lineTo(lx + tw / 2, base); ctx.closePath(); ctx.fillStyle = C.card; ctx.fill(); ctx.stroke();
      for (let b = 0; b < 3; b++) { const y0 = top + 40 + b * (base - top - 50) / 3, hh = 12, f0 = (y0 - top - 26) / (base - top - 26), f1 = (y0 + hh - top - 26) / (base - top - 26); ctx.beginPath(); ctx.moveTo(lx - lerp(bw, tw, f0) / 2, y0); ctx.lineTo(lx + lerp(bw, tw, f0) / 2, y0); ctx.lineTo(lx + lerp(bw, tw, f1) / 2, y0 + hh); ctx.lineTo(lx - lerp(bw, tw, f1) / 2, y0 + hh); ctx.closePath(); ctx.fillStyle = C.blue; ctx.fill(); }
      box(ctx, lx - 14, top + 6, 28, 20, 2, C.sky2); ctx.beginPath(); ctx.moveTo(lx - 16, top + 6); ctx.lineTo(lx, top - 8); ctx.lineTo(lx + 16, top + 6); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
      ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(lx, lampY + 2, 4, 0, 7); ctx.fill();
      // connector library stacking on the dock
      const crates = 3 + Math.floor((t % 9000) / 1500);
      for (let i = 0; i < crates; i++) { const cx = W * .06 + (i % 4) * 22, cy = sea - 16 - Math.floor(i / 4) * 16; box(ctx, cx, cy, 20, 14, 2, i === crates - 1 ? C.blue : C.card); }
      txt(ctx, `${crates * 16} bundles`, W * .06, sea + 92 > H ? H - 10 : sea + 92, C.ink, 9.5);
    },

    /* ----- CTA runway on the dark section ----- */
    runway(ctx, W, H, t) {
      const vx = W / 2, vy = H * .42, P = (u, side) => [lerp(vx + side * 4, vx + side * W * .34, u), lerp(vy, H, u)];
      for (let i = 0; i < 90; i++) { const x = hash(i, 1) * W, y = hash(i, 2) * vy * .95, tw = (Math.sin(t / 700 + i) + 1) / 2; ctx.fillStyle = `rgba(241,238,231,${.15 + .45 * tw})`; ctx.fillRect(x, y, 1.6, 1.6); }
      line(ctx, [0, vy], [W, vy], 'rgba(241,238,231,.35)', 1);
      ctx.beginPath(); ctx.moveTo(...P(0, -1)); ctx.lineTo(...P(1, -1)); ctx.lineTo(...P(1, 1)); ctx.lineTo(...P(0, 1)); ctx.closePath(); ctx.fillStyle = 'rgba(241,238,231,.04)'; ctx.fill();
      line(ctx, P(0, -1), P(1, -1), 'rgba(241,238,231,.6)', 1.2); line(ctx, P(0, 1), P(1, 1), 'rgba(241,238,231,.6)', 1.2);
      // centre line dashes rushing toward the viewer
      for (let i = 0; i < 14; i++) { const u0 = ((i / 14) + t / 4000) % 1, u1 = u0 + .025; const a = Math.pow(u0, 2.2), b = Math.pow(Math.min(1, u1), 2.2); line(ctx, [vx, lerp(vy, H, a)], [vx, lerp(vy, H, b)], 'rgba(241,238,231,.55)', 1 + a * 3); }
      // edge lights with a chasing pulse
      for (let i = 0; i < 18; i++) { const u = Math.pow(i / 18, 2), on = ((i / 18 - t / 2600) % 1 + 1) % 1 < .08; for (const s of [-1, 1]) { const [x, y] = P(u, s * 1.06); ctx.fillStyle = on ? '#2176ff' : 'rgba(241,238,231,.5)'; const r = 1 + u * 3; ctx.fillRect(x - r, y - r, r * 2, r * 2); } }
      // pink approach lights near the threshold
      for (let i = 0; i < 5; i++) { const [x, y] = P(.92, (i - 2) * .25); ctx.fillStyle = Math.floor(t / 400 + i) % 2 ? '#ff93ed' : 'rgba(255,147,237,.35)'; ctx.fillRect(x - 3, y - 3, 6, 6); }
      // plane taking off from the vanishing point
      const q = (t % 9000) / 9000, px = vx + q * W * .4, py = vy - 6 - q * q * H * .32, s = .6 + q * 1.4;
      ctx.save(); ctx.translate(px, py); ctx.rotate(-.18 - q * .2); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(12, 0); ctx.lineTo(16, 2); ctx.lineTo(12, 4); ctx.lineTo(-16, 4); ctx.closePath(); ctx.moveTo(-2, 2); ctx.lineTo(-10, 12); ctx.lineTo(-4, 12); ctx.lineTo(6, 2); ctx.moveTo(-14, 0); ctx.lineTo(-18, -7); ctx.lineTo(-13, -7); ctx.lineTo(-8, 0);
      ctx.fillStyle = 'rgba(241,238,231,.9)'; ctx.fill(); ctx.restore();
    }
  };

  // problem cards blend before/after; everything else just runs
  const BLEND = { sprawl: 1, drift: 1, record: 1 };
  document.querySelectorAll('canvas[data-scene]').forEach((cv,n)=>{
    const ctx=cv.getContext('2d'),draw=SCENES[cv.dataset.scene];if(!ctx||!draw)return;
    let W=0,H=0,raf=0,visible=false,last=0,time=4500+n*700;
    const paint=()=>{ctx.clearRect(0,0,W,H);draw(ctx,W,H,time,1)};
    const size=()=>{const r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.max(1,W*d);cv.height=Math.max(1,H*d);ctx.setTransform(d,0,0,d,0,0);paint()};
    const loop=t=>{raf=0;if(!visible||document.hidden||window.TLMotion.paused){last=0;return}if(!last||t-last>32){time+=last?Math.min(80,t-last):0;last=t;paint()}raf=requestAnimationFrame(loop)};
    const sync=()=>{if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(visible&&!document.hidden&&!window.TLMotion.paused)raf=requestAnimationFrame(loop);else paint()};
    new ResizeObserver(size).observe(cv);size();new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()}).observe(cv);
    window.addEventListener('lab-motion',sync);document.addEventListener('visibilitychange',sync);document.fonts.ready.then(paint);
  });
});

})();
