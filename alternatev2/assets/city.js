/* The isometric travel city from the old homepage, repainted in the mcpx look
   and used to show how ATFGraph and Keel work. Ground is laid down as brush
   dabs fixed in world space, buildings get a painted overlay and ink edges,
   and the active route, selected place and moving agents use ultra blue. */
(() => {
  'use strict';
  const host = document.querySelector('[data-city]');
  if (!host) return;
  const canvas = host.querySelector('.city-canvas');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const noise = (n) => { const v = Math.sin(n * 91.345 + 73.46) * 47453.545; return v - Math.floor(v); };
  const ease = (v) => 1 - Math.pow(1 - clamp(v, 0, 1), 3);
  // Same value noise and seeded random as the painted scenes in site.js.
  const RND = (seed) => { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1000003) / 1000003; }; };
  const h2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf); const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
  const fbm = (x, y) => .5 * vn(x, y) + .3 * vn(x * 2.1 + 5.2, y * 2.1 + 1.3) + .2 * vn(x * 4.3 + 9.1, y * 4.3 + 7.7);
  const HX = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const cl8 = (n) => (n < 0 ? 0 : n > 255 ? 255 : n | 0);

  /* ---------- palette ---------- */
  const INK = '#0f1115', ULTRA = '#2a3bff', LIME = '#d7ff3c', PAPER = '#fbf7ee';
  const EDGE = 'rgba(15,17,21,.82)', SOFT_EDGE = 'rgba(15,17,21,.35)';
  const COL = {
    cream: ['#f7ecd2', '#d6bf94', '#ecd8b0'],
    rose: ['#f6c9ab', '#cf7a58', '#e59b78'],
    teal: ['#dfe8f3', '#7fa6c8', '#a9c4de'],
    slab: ['#fbf7ee', '#cfccc2', '#e3e1d9'],
    terrace: ['#a3bb73', '#6a9c55', '#8fae6a'],
    vent: ['#f4efe6', '#b9b6ad', '#d8d4ca'],
    shadow: ['#0f111512', '#0f111512', '#0f111512'],
    keel: ['#5b6bff', '#1a27c9', ULTRA],
    atp: [LIME, '#a8c62a', '#c4e632'],
    rental: ['#f5c451', '#c9952f', '#e5b13f'],
    tower: ['#dfe8f3', '#7fa6c8', '#a9c4de'],
    train: ['#5b6bff', '#1a27c9', ULTRA],
    car: ['#ef7a62', '#c0563f', '#df6a50'],
    glass: ['#cddcef', '#9db6d6', '#b5cae4'],
    canopy: ['#cddcefb8', '#9db6d6', '#b5cae4'],
    pontoon: ['#d9b487', '#a98258', '#c49c6c'],
    bench: ['#c48a5e', '#8a5a3c', '#b07a52']
  };
  const GROUND = {
    sea: ['#6fa3cb', '#5f94c0', '#4f80c0', '#86b4d6'],
    shallow: ['#8fc8d4', '#a8d8d0', '#7fb8cc'],
    grass: ['#c5d29a', '#a3bb73', '#b8c98a', '#8fae6a', '#d3dca8'],
    sand: ['#f2dcae', '#ecd0a4', '#f6e6c4']
  };
  const TREE = ['#3f7a4a', '#4f8a50', '#6a9c55', '#8fae6a', '#a3bb73'];

  const places = [
    { id: 'airport', name: 'Flights', x: -3, z: -5.6, y: 1.3, text: 'Airline tools search and compare fares, availability and fare conditions.' },
    { id: 'lab', name: 'ATFGraph', x: -.3, z: -.6, y: 3.3, text: 'Durable jobs coordinate agents, keep progress and wait for the right signal.' },
    { id: 'keel', name: 'Keel', x: 2.6, z: -1.2, y: 2.3, text: 'The gateway checks tool inputs, supplier rules, prices and permission before action.' },
    { id: 'hotel', name: 'Hotels', x: 5.4, z: -3.1, y: 4.4, text: 'Compare rooms against preferences, rates and cancellation terms.' },
    { id: 'station', name: 'Rail', x: -6.7, z: 3.6, y: 1.9, text: 'Rail legs form part of the same trip, with their own supplier terms.' },
    { id: 'harbour', name: 'Cruises', x: 8.2, z: 7.5, y: 1.8, text: 'Cruise options join the proposal alongside flights, stays and experiences.' },
    { id: 'consultant', name: 'Consultant', x: -3.5, z: 5.4, y: 1.9, text: 'Review the proposal with the traveller. Approval is required before booking or payment.' },
    { id: 'payments', name: 'ATP · payments', x: 3.2, z: 3.8, y: 1.5, text: 'Coordinate commitments and controlled payments; record outcomes and recover when parts fail.' },
    { id: 'hostel', name: 'Hostel', x: -1.5, z: 6.2, y: 1.4, text: 'Budget options still need location, quality and cancellation checks.' },
    { id: 'car', name: 'Car hire', x: -5.4, z: .3, y: 1, text: 'Compare total rental cost, vehicle size, excess and collection arrangements.' },
    { id: 'tours', name: 'Experiences', x: 4.3, z: 1.9, y: 1, text: 'Choose activities that suit the people, destination and available time.' },
    { id: 'package', name: 'Packages', x: .4, z: 7.4, y: 1.4, text: 'Compare a combined holiday offer with the individual parts.' }
  ];

  /* ---------- ground dabs, laid out once in world space ---------- */
  const LAND = [[-10.5, -9.5], [9.5, -9.5], [9.5, -.5], [8.5, -.5], [8.5, 2.5], [2.5, 8.5], [-.5, 9.5], [-9.5, 9.5], [-9.5, 6.5], [-10.5, 6.5]];
  const SEA = [[-11, -10], [10, -10], [11, 11], [-10, 11]];
  const inside = (pts, x, z) => {
    let hit = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) hit = !hit;
    }
    return hit;
  };
  const segDist = (x, z, [ax, az], [bx, bz]) => {
    const dx = bx - ax, dz = bz - az, t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
    return Math.hypot(x - ax - dx * t, z - az - dz * t);
  };
  const edgeDist = (pts, x, z) => Math.min(...pts.map((p, i) => segDist(x, z, p, pts[(i + 1) % pts.length])));
  const WALK = [[-6, -4], [6, -4], [6, 1], [1, 1], [1, 7]];
  const onPath = (x, z) =>
    WALK.slice(1).some((p, i) => segDist(x, z, WALK[i], p) < .42) ||
    segDist(x, z, [-6, -4], [-6, 7]) < .46 ||
    (x > -9.1 && x < 4.1 && z > -8.4 && z < -6.6) ||
    (x > -8.8 && x < -7.4 && z > -9.2) ||
    Math.hypot(x + 2.7, z - 2.7) < 1.45;

  // Returns [palette, angle] for a dab, or null where crisp paint should show.
  const groundField = (x, z) => {
    if (inside(LAND, x, z)) {
      if (onPath(x, z)) return null;
      const n = fbm(x * .35 + 3, z * .35 + 7);
      const coast = edgeDist(LAND, x, z) < .55 && (x > 8 || z > 5 || x + z > 9);
      return [coast ? GROUND.sand : n > .62 ? GROUND.sand : GROUND.grass, (fbm(x * .2, z * .2) - .5) * 2.4, n];
    }
    if (!inside(SEA, x, z)) return null;
    const shore = edgeDist(LAND, x, z) < .9;
    return [shore ? GROUND.shallow : GROUND.sea, (fbm(x * .3, z * .3) - .5) * .5, fbm(x * .5, z * .5)];
  };

  // Each dab keeps its own seeded colour so nothing boils between frames.
  // Dabs are grouped by colour and width so each group is one stroke call.
  const DABS = (() => {
    const rnd = RND(9127), groups = new Map();
    for (let i = 0; i < 5200; i++) {
      const x = -11 + rnd() * 22, z = -10 + rnd() * 21, f = groundField(x, z);
      if (!f) { rnd(); rnd(); rnd(); rnd(); continue; }
      const [pal, ang, n] = f;
      const base = HX(pal[Math.floor((n * .7 + rnd() * .5) * pal.length) % pal.length]);
      const b = Math.round(((rnd() - .5) * 26 + (rnd() < .08 ? 22 : 0)) / 6) * 6;
      const big = rnd() < .55, wide = big ? 2 : 1;
      const len = big ? .42 + rnd() * .38 : .22 + rnd() * .2, a = ang + (rnd() - .5) * .5;
      const col = `rgb(${cl8(base[0] + b)},${cl8(base[1] + b)},${cl8(base[2] + b)})`, key = col + wide;
      if (!groups.has(key)) groups.set(key, { col, wide, segs: [] });
      groups.get(key).segs.push([x - Math.cos(a) * len / 2, z - Math.sin(a) * len / 2, x + Math.cos(a) * len / 2, z + Math.sin(a) * len / 2]);
    }
    return [...groups.values()];
  })();

  // A small tile of light and dark strokes laid over painted faces.
  const overlay = (() => {
    const t = document.createElement('canvas'); t.width = t.height = 96;
    const g = t.getContext('2d'), rnd = RND(77);
    g.lineCap = 'round';
    for (let i = 0; i < 240; i++) {
      const x = rnd() * 96, y = rnd() * 96, len = 3 + rnd() * 7, a = (rnd() - .5) * .9, light = rnd() < .55;
      g.strokeStyle = light ? `rgba(255,252,240,${.12 + rnd() * .16})` : `rgba(60,40,25,${.05 + rnd() * .07})`;
      g.lineWidth = 1.6 + rnd() * 1.8;
      g.beginPath(); g.moveTo(x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2); g.lineTo(x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2); g.stroke();
    }
    return ctx.createPattern(t, 'repeat');
  })();

  /* ---------- the city renderer ---------- */
  function createWorld() {
    let W, H, U, yaw, objects, time, build, focus, bg = null, grain = null;
    const project = (x, y, z) => {
      const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
      const rz = x * Math.sin(yaw) + z * Math.cos(yaw);
      return [W * .5 + rx * U, H * .57 + rz * U * .52 - y * U];
    };
    function polygon(points, fill, stroke, width = .65, tex = false) {
      ctx.beginPath(); points.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); if (tex) { ctx.fillStyle = overlay; ctx.fill(); } }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
    }
    const poly = (pts, fill, stroke, width, tex) => polygon(pts.map((p) => project(...p)), fill, stroke, width, tex);
    function line(points, colour, width = 1) {
      ctx.beginPath(); points.map((p) => project(...p)).forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.stroke();
    }
    function disc(x, y, z, r, fill, ry = .48, stroke) {
      const p = project(x, y, z); ctx.beginPath(); ctx.ellipse(p[0], p[1], r * U, r * U * ry, 0, 0, TAU); ctx.fillStyle = fill; ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    }
    function box(x, z, w, d, h, col, y = 0, edge = SOFT_EDGE, tex = false, ew = .8) {
      const a = x - w / 2, b = x + w / 2, c = z - d / 2, e = z + d / 2;
      // The two camera-facing elevations change as the world turns.
      if (Math.sin(yaw) < 0) poly([[a, y, c], [a, y + h, c], [a, y + h, e], [a, y, e]], col[1], edge, ew, tex);
      else poly([[b, y, e], [b, y + h, e], [b, y + h, c], [b, y, c]], col[1], edge, ew, tex);
      if (Math.cos(yaw) > 0) poly([[a, y, e], [a, y + h, e], [b, y + h, e], [b, y, e]], col[2], edge, ew, tex);
      else poly([[b, y, c], [b, y + h, c], [a, y + h, c], [a, y, c]], col[2], edge, ew, tex);
      poly([[a, y + h, c], [b, y + h, c], [b, y + h, e], [a, y + h, e]], col[0], edge, ew, tex);
    }
    function add(x, z, fn, order = 0) { objects.push({ depth: x * Math.sin(yaw) + z * Math.cos(yaw) + order, fn }); }
    const growth = (i) => ease((build - i * .19) / .9);

    function tree(x, z, size, seed = 0) {
      const g = growth(3 + seed % 7); if (!g) return;
      add(x, z, () => {
        disc(x + .18, 0, z + .12, size * .63, '#0f111514');
        line([[x, 0, z], [x, size * 1.8 * g, z]], '#6f5440', Math.max(1, U * .06));
        const p = project(x, size * 1.8 * g, z), r = U * size * g;
        ctx.lineCap = 'round';
        // Foliage is a bundle of short brush strokes, darker at the bottom.
        for (let j = 0; j < 15; j++) {
          const a = j * 2.4 + seed, q = .25 + noise(seed + j) * .6, dx = Math.cos(a) * r * .5 * q, dy = Math.sin(a) * r * .46 * q;
          const tone = clamp(Math.floor((dy / r + .55) * 3.2 + noise(seed + j + 40) * 1.6), 0, 4);
          const ang = -.6 + noise(seed + j + 7) * 1.2, len = r * (.38 + noise(seed + j + 9) * .3);
          ctx.strokeStyle = TREE[4 - tone]; ctx.lineWidth = Math.max(1.6, r * .36);
          ctx.beginPath(); ctx.moveTo(p[0] + dx - Math.cos(ang) * len / 2, p[1] + dy - Math.sin(ang) * len / 2); ctx.lineTo(p[0] + dx + Math.cos(ang) * len / 2, p[1] + dy + Math.sin(ang) * len / 2); ctx.stroke();
        }
        ctx.strokeStyle = '#d3dca8'; ctx.lineWidth = Math.max(1.2, r * .2);
        for (let j = 0; j < 3; j++) { const ox = (noise(seed + j + 90) - .7) * r * .6, oy = -r * .25 - noise(seed + j + 20) * r * .2; ctx.beginPath(); ctx.moveTo(p[0] + ox - r * .12, p[1] + oy + r * .04); ctx.lineTo(p[0] + ox + r * .12, p[1] + oy - r * .04); ctx.stroke(); }
      });
    }

    function building(x, z, w, d, h, idx, style = 'cream') {
      const g = growth(idx); if (!g) return;
      const colours = COL[style] || COL.cream;
      poly([[x - w / 2, .02, z - d / 2], [x + w / 2, .02, z - d / 2], [x + w / 2 + 1.25, .02, z + d / 2 + .85], [x - w / 2 + .8, .02, z + d / 2 + .85]], '#0f111512');
      add(x, z, () => {
        box(x + .13, z + .12, w + .2, d + .2, .08, COL.shadow, 0, null);
        box(x, z, w, d, h * g, colours, 0, EDGE, true, 1);
        const roof = h * g;
        box(x, z, w + .12, d + .12, .1, COL.slab, roof, EDGE, false, 1);
        const front = Math.cos(yaw) > 0 ? z + d / 2 + .008 : z - d / 2 - .008;
        const side = Math.sin(yaw) < 0 ? x - w / 2 - .008 : x + w / 2 + .008;
        const rows = Math.max(1, Math.floor(h / .8)), cols = Math.max(2, Math.floor(w / .6));
        for (let row = 0; row < rows; row++) for (let j = 0; j < cols; j++) {
          const wx = x - w / 2 + (j + .5) * w / cols, wy = (.25 + row * .77) * g;
          poly([[wx - .14, wy, front], [wx + .14, wy, front], [wx + .14, wy + .36 * g, front], [wx - .14, wy + .36 * g, front]], (j + row) % 4 === 0 ? '#ffd27a' : '#3e5f96c8');
          line([[wx - .16, wy, front], [wx + .16, wy, front]], '#fffaf0', .9);
        }
        for (let row = 0; row < rows; row++) for (let j = 0; j < Math.floor(d / .65); j++) {
          const zz = z - d / 2 + (j + .5) * d / Math.floor(d / .65), yy = (.25 + row * .77) * g;
          poly([[side, yy, zz - .13], [side, yy, zz + .13], [side, yy + .36 * g, zz + .13], [side, yy + .36 * g, zz - .13]], '#2f4f86a8');
        }
        // A planted terrace, skylight and a row of pots on every roof.
        box(x - w * .22, z - d * .18, w * .28, d * .28, .12, COL.terrace, roof + .1, SOFT_EDGE);
        box(x + w * .25, z + d * .2, .32, .32, .18, COL.vent, roof + .1, SOFT_EDGE);
        for (let k = 0; k < 4; k++) disc(x - w * .32 + k * w * .2, roof + .13, z + d * .35, .08, '#6a9c55', .8);
      });
    }

    function railway() {
      const g = growth(1); if (!g) return;
      for (let k = 0; k < 75; k++) { const z = -9 + k * .25; line([[-8.7, .04, z], [-7.5, .04, z]], '#b07a52', Math.max(.5, U * .045)); }
      line([[-8.5, .07, -9], [-8.5, .07, 9.5]], '#30343b', 1.2);
      line([[-7.7, .07, -9], [-7.7, .07, 9.5]], '#30343b', 1.2);
      const tz = -9 + ((time * .65 + 6) % 18);
      for (let i = 0; i < 3; i++) add(-8.1, tz - i * 1.35, () => {
        box(-8.1, tz - i * 1.35, .78, 1.24, .48, COL.train, .14, EDGE, false, 1);
        for (let k = 0; k < 3; k++) box(-8.5, tz - i * 1.35 - .4 + k * .36, .018, .2, .16, [LIME, LIME, LIME], .36, null);
        line([[-8.51, .29, tz - i * 1.35 - .59], [-8.51, .29, tz - i * 1.35 + .59]], LIME, 1.6);
      });
    }

    function plane(t) {
      const p = (t * .025 + .19) % 1, x = -14 + p * 29, z = -9 + p * 5, y = 2.7 + Math.sin(p * Math.PI) * 1.8;
      if (build < 1.5) return;
      disc(x, 0, z, .9, '#0f111514', .24);
      add(x, z, () => {
        poly([[x - 1.3, y, z], [x + .9, y, z - .13], [x + 1.45, y, z], [x + .8, y, z + .15]], '#fffaf0', INK, 1);
        poly([[x - .25, y, z], [x - .7, y, z - 1.4], [x + .05, y, z - 1.25], [x + .5, y, z], [x + .05, y, z + 1.25], [x - .7, y, z + 1.4]], '#f4efe6', INK, 1);
        poly([[x - 1.1, y, z], [x - 1.5, y, z - .5], [x - .9, y, z - .4], [x - .65, y, z], [x - .9, y, z + .4], [x - 1.5, y, z + .5]], ULTRA, INK, 1);
        line([[x - .9, y + .03, z], [x + 1.25, y + .03, z]], ULTRA, 1.5);
      }, 8);
    }

    function boat(x, z, speed = 0) {
      const bz = z + Math.sin(time * .25 + speed) * .4;
      add(x, bz, () => {
        line([[x - .35, .01, bz + 1.1], [x - .42, .01, bz + 1.8]], '#f6fbf8d0', 1.4);
        line([[x + .35, .01, bz + 1.1], [x + .42, .01, bz + 1.8]], '#f6fbf8d0', 1.4);
        poly([[x - .35, .1, bz + .8], [x + .35, .1, bz + .8], [x + .4, .13, bz - .3], [x, .14, bz - .85], [x - .4, .13, bz - .3]], '#fffaf0', INK, 1);
        line([[x, .2, bz], [x, 2, bz]], INK, 1);
        poly([[x, 1.96, bz], [x, .4, bz], [x + .8, .4, bz + .4]], '#fffaf0', INK, .8);
      });
    }

    // Paper ground and the island's soft shadow do not move, so cache them.
    function backdrop() {
      bg = document.createElement('canvas'); bg.width = canvas.width; bg.height = canvas.height;
      const g = bg.getContext('2d'), d = canvas.width / W; g.scale(d, d);
      g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
      const glow = g.createRadialGradient(W * .68, H * .22, 0, W * .68, H * .22, W * .55); glow.addColorStop(0, '#fff3dacc'); glow.addColorStop(1, '#fff3da00'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
      const sx = W * .5, sy = H * .57 + U * .5, sh = g.createRadialGradient(sx, sy + U, 0, sx, sy + U, U * 13); sh.addColorStop(0, '#0f111518'); sh.addColorStop(1, '#0f111500'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
      grain = document.createElement('canvas'); grain.width = canvas.width; grain.height = canvas.height;
      const k = grain.getContext('2d'); k.scale(d, d);
      for (let i = 0; i < 3200; i++) { k.fillStyle = i % 2 ? '#0f11150c' : '#fffcf018'; k.fillRect(noise(i + 340) * W, noise(i + 7780) * H, 1, 1); }
    }

    function draw(w, h, t = 8, angle = -.58, progress = 8, selected = 'lab', story = null) {
      if (w !== W || h !== H || !bg || bg.width !== canvas.width) { W = w; H = h; U = w < 600 ? Math.min(w / 28, h / 19) : Math.min(w / 29.5, h / 20); backdrop(); }
      yaw = angle; time = t; build = progress; focus = selected; objects = [];
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0);
      const dpr = canvas.width / W; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      // Water is one continuous basin; the island terraces are separate from it.
      poly(SEA.map(([x, z]) => [x, -.25, z]), '#5f94c0', INK, 1.25);
      poly(LAND.map(([x, z]) => [x, -.15, z]), '#c9a576', EDGE, 1);
      poly(LAND.map(([x, z]) => [x, 0, z]), '#b8c98a', INK, 1.25);
      // Painted ground: fixed dabs projected each frame so they turn with the city.
      ctx.lineCap = 'round';
      const yS = (x, z) => (inside(LAND, x, z) ? .004 : -.24);
      DABS.forEach((grp) => {
        ctx.strokeStyle = grp.col; ctx.lineWidth = Math.max(1.2, U * (grp.wide === 2 ? .2 : .13));
        ctx.beginPath();
        grp.segs.forEach((s) => { const y = s.y ?? (s.y = yS(s[0], s[1])); const a = project(s[0], y, s[1]), b = project(s[2], y, s[3]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); });
        ctx.stroke();
      });
      for (let i = 0; i < 150; i++) {
        const x = -10 + noise(i + 1) * 20, z = -9 + noise(i + 1000) * 19;
        if (inside(LAND, x, z)) continue;
        line([[x, -.22, z], [x + .22 + Math.sin(time * .8 + i) * .09, -.22, z]], i % 3 ? '#f6fbf8a0' : '#2b4d8c55', 1.4);
      }
      ctx.lineCap = 'butt';
      poly(LAND.map(([x, z]) => [x, 0, z]), null, INK, 1.25);
      const quay = [[8.5, .015, -.5], [8.5, .015, 2.5], [2.5, .015, 8.5], [-1, .015, 8.5]];
      line(quay, '#f6e6c4', U * .18); line(quay, INK, .9);
      if (build > .4) {
        // Walking routes, road markings and a runway are painted into the ground.
        line(WALK.map(([x, z]) => [x, .035, z]), '#f4e6c8', U * .75);
        line([[-6, .04, -4], [-6, .04, 7]], '#d8d4ca', U * .85);
        for (let z = -3; z < 7; z += .65) line([[-6, .05, z], [-6, .05, z + .22]], '#fffaf0', 1);
        poly([[-9, .03, -8.3], [4, .03, -8.3], [4, .03, -6.7], [-9, .03, -6.7]], '#bdb9ae', EDGE, .9, true);
        for (let x = -8; x < 4; x++) line([[x, .04, -7.5], [x + .42, .04, -7.5]], '#fffaf0', 1.3);
        for (const x of [-8.7, 3.4]) for (let z = -8.05; z < -6.7; z += .22) line([[x, .05, z], [x + .28, .05, z]], '#fffaf0', 1.5);
      }
      railway();
      building(-3, -5.6, 4.4, 1.35, 1.05, 1, 'teal'); // airport terminal
      building(.3, -5.5, .55, .6, 2.7, 2, 'cream');
      const tower = growth(2); if (tower) add(.3, -5.5, () => box(.3, -5.5, 1, 1, .45, COL.tower, 2.6 * tower, EDGE, true, 1));
      building(-.3, -.6, 3.4, 2.3, 2.6, 3, 'cream'); // lab
      building(1.4, .5, 1.6, 1.8, 1.1, 3, 'teal');
      building(5.4, -3.1, 2.2, 2.5, 4.1, 4, 'rose'); // hotel
      building(5.7, -.8, 2.9, .9, 1, 4, 'rose');
      building(-6.7, 3.6, 1.3, 3.6, 1.2, 5, 'cream'); // station
      building(-3.5, 5.4, 1.6, 1.6, 1.55, 6, 'rose');
      building(-1.5, 6.2, 1.3, 1.3, 1.05, 7, 'teal');
      building(3.2, 3.8, 1.6, 1.4, 1.1, 6, 'cream');
      // Keel's gate, the ATP roof, packages and car hire each get a place in town.
      if (build > 1.5) {
        add(2.6, -1.2, () => {
          box(2.6, -2, .22, .22, 1.8, COL.keel, 0, EDGE, false, 1); box(2.6, -.4, .22, .22, 1.8, COL.keel, 0, EDGE, false, 1);
          box(2.6, -1.2, .35, 2, .28, COL.keel, 1.8, EDGE, false, 1);
        });
        add(3.2, 3.8, () => { box(3.2, 3.8, 1.75, 1.55, .18, COL.atp, 1.2, EDGE, true, 1); });
        building(.4, 7.4, 1.25, 1.15, .9, 7, 'teal');
        add(-5.4, .3, () => { for (let k = 0; k < 3; k++) box(-5.4, .3 + k * .6, .4, .48, .24, COL.rental, .08, EDGE, false, .9); });
      }
      // A rooftop observatory on the lab and a sloping station roof.
      if (growth(3)) add(-.2, -.6, () => {
        const y = 2.7 * growth(3);
        box(-.65, -.8, .18, .18, .55, COL.vent, y, EDGE);
        const p = project(-.65, y + .55, -.8); ctx.beginPath(); ctx.ellipse(p[0], p[1], U * .31, U * .15, -.45, 0, TAU); ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
        line([[-.65, y + .56, -.8], [-.65, y + .8, -.8]], INK, 1);
      });
      if (growth(5)) add(-6.7, 3.6, () => {
        const y = 1.3 * growth(5);
        poly([[-7.4, y, 1.8], [-6.7, y + .5, 1.8], [-6.7, y + .5, 5.4], [-7.4, y, 5.4]], '#c8694a', EDGE, 1, true);
        poly([[-6.7, y + .5, 1.8], [-6, y, 1.8], [-6, y, 5.4], [-6.7, y + .5, 5.4]], '#e98e6e', EDGE, 1, true);
        for (let k = 0; k < 14; k++) { const z = 1.8 + k * .26; line([[-7.4, y, z], [-6.7, y + .5, z], [-6, y, z]], '#fffaf040', .7); }
      });
      // A glass station canopy.
      if (growth(5)) add(-7.1, 3.7, () => box(-7.55, 3.7, .8, 4.2, .12, COL.canopy, 1.45 * growth(5), SOFT_EDGE));
      for (let i = 0; i < 7; i++) tree(-4.7, -2.8 + i * 1.4, .38, 18 + i);
      for (const [x, z, s] of [[-8, -9, .45], [7, -7, .65], [8, -5.7, .5], [7.5, -2, .4], [2, 5.7, .55], [.4, 8, .45], [-4, 7.5, .65], [-5, 7, .4], [-2.8, 2.1, .65], [-3.8, .8, .45], [3.2, -5, .4], [7, 1.3, .48], [-9.3, 0, .32], [-9.3, 1, .32], [-9.3, 2, .32]]) tree(x, z, s, Math.floor((x + z) * 12 + 99));
      if (growth(6)) {
        // Garden paths, flowerbeds, a bench and a small fountain.
        disc(-2.7, 0, 2.7, 1.4, '#f4e6c8', .48, SOFT_EDGE); disc(-2.7, .03, 2.7, .65, '#a3bb73', .48, SOFT_EDGE); disc(-2.7, .06, 2.7, .49, '#6fa3cb', .48, INK);
        for (let k = 0; k < 5; k++) line([[-2.7, .08, 2.7], [-2.7 + Math.cos(k * 1.25 + time) * .19, .3, 2.7 + Math.sin(k * 1.25 + time) * .19]], '#fffaf0', .8);
        for (let k = 0; k < 8; k++) disc(-4 + k * .25, 0, 4.8, .11, k % 2 ? '#ef7a62' : '#f5c451', .7);
        add(-1, 3.8, () => box(-1, 3.8, .9, .25, .25, COL.bench, 0, EDGE));
        for (let k = 0; k < 3; k++) {
          const x = 3.4 + k * .65, z = 1.9;
          add(x, z, () => { line([[x, 0, z], [x, .6, z]], INK, .9); disc(x, .64, z, .25, k % 2 ? ULTRA : LIME, .5, INK); disc(x, .65, z, .09, '#fffaf0', .5); });
        }
        // Marina pontoons follow the coast.
        for (let i = 0; i < 3; i++) { const x = 5.7 - i * 1.3, z = 5.4 + i * 1.3; box(x, z, .2, 2, .08, COL.pontoon, -.02, SOFT_EDGE); }
        boat(6.4, 5.5, 1); boat(4.9, 7, 2); boat(8.4, 8 + Math.sin(time * .15), 3);
      }
      // Slow street movement is separate from the aircraft and railway.
      const carZ = -2 + (time * .38) % 8;
      if (build > 2) add(-6, carZ, () => { box(-6, carZ, .36, .66, .25, COL.car, .07, EDGE, false, .9); box(-6, carZ - .02, .3, .3, .12, COL.glass, .32, SOFT_EDGE); });
      plane(time);
      objects.sort((a, b) => a.depth - b.depth).forEach((o) => o.fn());
      // Each step lists its own routes: agents fanning out, signals waking a job,
      // calls passing through Keel. A still view keeps the dashes but stops the agents.
      if (story && build > 3) {
        const byId = (id) => places.find((p) => p.id === id);
        const route = (from, to, colour, moving, offset = 0, width = 2) => {
          const a = byId(from), b = byId(to); if (!a || !b) return;
          const start = project(a.x, a.y, a.z), end = project(b.x, b.y, b.z);
          const bend = [(start[0] + end[0]) / 2, Math.min(start[1], end[1]) - Math.min(55, U * 1.6)];
          ctx.save(); ctx.beginPath(); ctx.moveTo(...start); ctx.quadraticCurveTo(...bend, ...end);
          ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
          if (moving) {
            const u = (time * .33 + offset) % 1, q = 1 - u, x = q * q * start[0] + 2 * q * u * bend[0] + u * u * end[0], y = q * q * start[1] + 2 * q * u * bend[1] + u * u * end[1];
            ctx.fillStyle = colour; ctx.fillRect(x - 3.5, y - 3.5, 7, 7); ctx.strokeStyle = PAPER; ctx.lineWidth = 1; ctx.strokeRect(x - 3.5, y - 3.5, 7, 7);
          }
          ctx.restore();
        };
        const tone = { u: [ULTRA, 2.2], f: ['#2a3bffa8', 1.6], k: [INK, 2] };
        story.routes.forEach(([from, to, kind, still, offset]) => {
          const [colour, width] = tone[kind] || tone.u;
          route(from, to, colour, !story.manual && !still, offset || 0, width);
        });
      }
      // Grain stays anchored to the paper, not to moving objects.
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(grain, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (build > 3) {
        const site = places.find((p) => p.id === focus) || places[1], p = project(site.x, site.y + .8, site.z);
        const pulse = 4 + Math.sin(time * 2) * .8;
        line([[site.x, site.y + .6, site.z], [site.x, site.y + .2, site.z]], INK, 1.2);
        ctx.fillStyle = LIME; ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p[0], p[1], pulse + 3, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = ULTRA; ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, TAU); ctx.fill();
      }
    }
    function labelLeader(x, y, width, height, site) {
      const point = project(site.x, site.y + .2, site.z);
      const start = [clamp(point[0], x + 4, x + width - 4), y + height];
      if (Math.hypot(point[0] - start[0], point[1] - start[1]) < 12) return;
      ctx.save(); ctx.strokeStyle = 'rgba(15,17,21,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(...start); ctx.lineTo(...point); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(...point, 2.2, 0, TAU); ctx.fill(); ctx.restore();
    }
    return { draw, project, labelLeader };
  }

  /* ---------- the story: two frameworks, a few steps each ---------- */
  // Words come from the research page's foundation studies and the place texts above.
  // Route entries are [from, to, tone, still, offset]; tone u = ultra, f = faded ultra, k = ink.
  const fan = (from, ids, tone, back) => ids.map((id, i) => (back ? [id, from, tone, false, i * .17] : [from, id, tone, false, i * .17]));
  const frameworks = [
    {
      name: 'ATFGraph', tag: 'Durable jobs + graph server', line: 'A durable runtime for agentic work.',
      steps: [
        { label: 'Durable jobs', title: 'A durable runtime for agentic work.', text: 'Run agents built with any framework. Durable state preserves progress; temporal execution lets a job wait for an approval or booking update, then continue with its context.', focus: 'lab', lit: ['airport', 'hotel', 'station', 'harbour'], routes: [...fan('lab', ['airport', 'hotel', 'station', 'harbour'], 'u'), ...fan('lab', ['airport', 'hotel', 'station', 'harbour'], 'f', true).map((r) => [...r.slice(0, 4), r[4] + .5])] },
        { label: 'Wait', title: 'Durable jobs coordinate agents, keep progress and wait for the right signal.', text: 'Review the proposal with the traveller. Approval is required before booking or payment.', focus: 'consultant', lit: ['consultant'], routes: [['lab', 'consultant', 'k', true]] },
        { label: 'Emitter compute', title: 'Emitter compute', text: 'Schedules, incoming events and shared monitoring wake the agents that need to act.', focus: 'lab', lit: ['airport', 'station', 'harbour'], routes: fan('lab', ['airport', 'station', 'harbour'], 'u', true) },
        { label: 'Recovery & oversight', title: 'Recovery & oversight', text: 'Recorded steps, retry rules, human approvals and shadow mode make long-running work inspectable.', focus: 'lab', lit: ['consultant'], routes: [['lab', 'keel', 'u'], ['lab', 'consultant', 'k', false, .4]] },
        { label: 'Why it matters', title: 'Why it matters in travel', text: 'A disruption arrives after booking. The relevant agent wakes, retrieves the trip context and prepares the next action for approval.', focus: 'lab', lit: ['airport', 'consultant'], routes: [['airport', 'lab', 'u'], ['lab', 'consultant', 'k', false, .3]] }
      ]
    },
    {
      name: 'Keel', tag: 'Governed runtime + audit chain', line: 'Travel tools. ATP. Controlled payments.',
      steps: [
        { label: 'Travel tools', title: 'Travel tools. ATP. Controlled payments.', text: 'Connect supply through checked MCP tools and MCP-Apps. The gateway checks tool inputs, supplier rules, prices and permission before action.', focus: 'keel', lit: ['airport', 'hotel', 'harbour', 'tours'], routes: [['lab', 'keel', 'u'], ...fan('keel', ['airport', 'hotel', 'harbour', 'tours'], 'f').map((r) => [...r.slice(0, 4), r[4] + .3])] },
        { label: 'ATP', title: 'Agentic Travel Protocol', text: 'ATP—the Agentic Travel Protocol—coordinates checking, reserving, booking, changing and cancelling across the parts of a trip.', focus: 'payments', lit: ['payments', 'airport', 'hotel', 'harbour'], routes: [['payments', 'keel', 'u'], ...fan('keel', ['airport', 'hotel', 'harbour'], 'f').map((r) => [...r.slice(0, 4), r[4] + .3])] },
        { label: 'Payments', title: 'Agentic Payment for Travel', text: 'Booking-linked virtual cards bound spending to the approved purchase, amount and expiry.', focus: 'payments', lit: ['payments', 'consultant', 'airport', 'hotel'], routes: [['consultant', 'payments', 'k'], ['payments', 'keel', 'u', false, .3], ...fan('keel', ['airport', 'hotel'], 'f').map((r) => [...r.slice(0, 4), r[4] + .6])] },
        { label: 'Controls', title: 'Supplier & transaction controls', text: 'Look-to-book protection, fresh price checks and permissions govern actions; booking and payment outcomes stay traceable.', focus: 'keel', lit: ['airport', 'hotel', 'harbour', 'tours', 'car'], routes: [...fan('keel', ['airport', 'hotel', 'harbour', 'tours', 'car'], 'u', true), ['keel', 'lab', 'k', true]] },
        { label: 'Why it matters', title: 'Why it matters in travel', text: 'A trip spans several suppliers. ATP coordinates each supported step, records the outcome and routes failed bookings or payment exceptions for recovery.', focus: 'payments', lit: ['payments', 'airport', 'hotel', 'harbour', 'station', 'consultant'], routes: [['payments', 'keel', 'u'], ...fan('keel', ['airport', 'hotel', 'harbour', 'station'], 'f').map((r) => [...r.slice(0, 4), r[4] + .3]), ['keel', 'consultant', 'k', false, .6]] }
      ]
    }
  ];
  const ICON = { airport: 'plane', hotel: 'bed', hostel: 'bed', harbour: 'ship', tours: 'pin', station: 'train', car: 'car', package: 'stack', lab: 'stack', keel: 'shield', payments: 'card', consultant: 'check' };
  const duration = 5.5;
  const cycleOf = (f) => f.steps.length * duration + 3;
  const $ = (s) => host.querySelector(s);
  const paintIcons = (root) => { if (window.MX && window.MX.paintIcons) window.MX.paintIcons(root); };
  const byId = (id) => places.find((p) => p.id === id);

  function mountStory(onChange) {
    const choices = $('.city-choices'), timeline = $('.city-steps'), pins = $('.city-pins');
    let index = 0, offset = 0, lastKey = '', manual = null, currentTime = 0, lastState, railFor = -1;
    let stepButtons = [];
    const pinButtons = new Map();
    const choiceButtons = frameworks.map((f, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = f.name; b.setAttribute('aria-pressed', String(i === 0));
      // manual is left alone so a still view stays a still view.
      b.addEventListener('click', () => { index = i; offset = currentTime; lastKey = ''; if (manual !== null) manual = 0; onChange(); });
      choices.append(b); return b;
    });
    // The rail is rebuilt when the framework changes, since each has its own steps.
    function buildRail(fi) {
      if (railFor === fi) return; railFor = fi;
      timeline.replaceChildren();
      timeline.style.setProperty('--n', frameworks[fi].steps.length);
      stepButtons = frameworks[fi].steps.map((s, i) => {
        const li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
        b.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b>';
        b.append(s.label);
        b.addEventListener('click', () => { index = lastState ? lastState.index : index; offset = currentTime - i * duration; if (manual !== null) manual = i; lastKey = ''; onChange(); });
        li.append(b); timeline.append(li); return li;
      });
    }
    function state(time) {
      currentTime = time;
      const elapsed = Math.max(0, time - offset);
      let idx = index, rest = elapsed;
      if (manual === null) {
        // Autoplay runs one framework's steps, pauses briefly, then moves to the next.
        while (rest >= cycleOf(frameworks[idx])) { rest -= cycleOf(frameworks[idx]); idx = (idx + 1) % frameworks.length; }
      }
      const f = frameworks[idx], n = f.steps.length;
      const phase = manual === null ? Math.min(n - 1, Math.floor(rest / duration)) : Math.min(n - 1, manual);
      const step = f.steps[phase];
      lastState = { framework: f, index: idx, phase, step, focus: step.focus, lit: step.lit, routes: step.routes, manual: manual !== null };
      return lastState;
    }
    function update(s) {
      const key = s.index + ':' + s.phase + ':' + s.manual; if (key === lastKey) return; lastKey = key;
      buildRail(s.index);
      choiceButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === s.index)));
      stepButtons.forEach((li, i) => {
        const b = li.firstChild;
        if (i === s.phase) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        li.classList.toggle('on', i === s.phase); li.classList.toggle('done', i < s.phase);
      });
      $('.city-name').textContent = s.framework.name;
      $('.city-tag').textContent = s.framework.tag;
      $('.city-line').textContent = s.framework.line;
      $('.city-title').textContent = s.step.title;
      $('.city-text').textContent = s.step.text;
      const list = $('.city-places'); list.replaceChildren();
      [...new Set([s.focus, ...s.lit])].forEach((id) => {
        const p = byId(id), li = document.createElement('li'), ic = document.createElement('i'), name = document.createElement('span');
        ic.className = 'px'; ic.dataset.px = ICON[id] || 'pin'; name.textContent = p.name;
        li.classList.toggle('is-focus', id === s.focus);
        li.append(ic, name); list.append(li);
      });
      paintIcons(list);
      $('.city-mode').textContent = s.manual ? 'Illustrative journey · still view' : 'Illustrative journey · autoplay';
    }
    function setPlaces(items) {
      items.forEach((p) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'city-pin'; b.textContent = p.name; b.hidden = true;
        b.setAttribute('aria-label', p.name + ': ' + p.text);
        b.addEventListener('click', () => {
          $('.city-inspect').textContent = p.name + ' — ' + p.text;
          pinButtons.forEach((other) => other.classList.toggle('is-picked', other === b));
        });
        pins.append(b); pinButtons.set(p.id, b);
      });
    }
    function render(world, w, h, time, progress) {
      const s = state(time); update(s);
      const visibleIds = new Set(['lab', 'keel', s.focus, ...s.lit]);
      const labels = places.filter((p) => visibleIds.has(p.id)).map((p) => { const xy = world.project(p.x, p.y + .55, p.z); return { p, x: xy[0], y: xy[1] }; }).sort((a, b) => a.y - b.y);
      const rects = [];
      pinButtons.forEach((b, id) => { b.hidden = !visibleIds.has(id) || progress < 3; });
      for (const a of labels) {
        const b = pinButtons.get(a.p.id); if (b.hidden) continue;
        const bw = b.offsetWidth || 90, bh = b.offsetHeight || 26;
        let x = Math.max(8, Math.min(w - bw - 8, a.x - bw / 2)), y = Math.max(10, a.y - bh - 8);
        for (let tries = 0; tries < 12; tries++) {
          if (!rects.some((r) => x < r.x + r.w + 5 && x + bw + 5 > r.x && y < r.y + r.h + 5 && y + bh + 5 > r.y)) break;
          y -= bh + 6; if (y < 8) { y = Math.min(h - 64, a.y + 14); x = Math.max(8, Math.min(w - bw - 8, x + bw + 8)); }
        }
        rects.push({ x, y, w: bw, h: bh }); world.labelLeader(x, y, bw, bh, a.p);
        b.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
        b.classList.toggle('is-active', a.p.id === s.focus); b.classList.toggle('is-supplier', s.lit.includes(a.p.id) && a.p.id !== s.focus);
      }
      return s;
    }
    const replay = (time) => { index = lastState ? lastState.index : 0; offset = time; manual = null; lastKey = ''; };
    const showComplete = (time) => { index = lastState ? lastState.index : 0; offset = time; manual = 0; lastKey = ''; };
    const resume = (time) => { if (manual !== null) { offset = time - manual * duration; manual = null; lastKey = ''; } };
    return { state, render, setPlaces, replay, showComplete, resume };
  }

  /* ---------- wiring: resize, loop, pause, drag and keys ---------- */
  const world = createWorld(), media = matchMedia('(prefers-reduced-motion: reduce)');
  const replayBtn = $('.city-replay'), pauseBtn = $('.city-pause');
  let w = 0, h = 0, angle = -.58, time = 0, progress = media.matches ? 8 : 0, last = 0, raf = 0, visible = false;
  let paused = media.matches, drag = null;
  const story = mountStory(() => paint());
  story.setPlaces(places);
  if (media.matches) story.showComplete(time);

  function paint() {
    if (w > 0 && h > 0) { const s = story.state(time); world.draw(w, h, time, angle, progress, s.focus, s); story.render(world, w, h, time, progress); }
  }
  function resize() {
    const r = canvas.getBoundingClientRect(); w = Math.round(r.width); h = Math.round(r.height);
    const d = Math.min(devicePixelRatio || 1, 1.6); canvas.width = Math.round(w * d); canvas.height = Math.round(h * d);
    paint();
  }
  const running = () => !paused && !media.matches && !document.hidden && visible;
  function schedule() { if (!raf && running()) raf = requestAnimationFrame(tick); }
  function tick(now) {
    raf = 0; if (!running()) { last = 0; return; }
    if (!last) last = now;
    const dt = now - last;
    if (dt >= 33) { time += Math.min(dt, 80) / 1000; progress += Math.min(dt, 80) / 1000; last = now; paint(); }
    schedule();
  }
  function setMotion() {
    pauseBtn.disabled = media.matches;
    pauseBtn.textContent = media.matches ? 'Still artwork · reduced motion' : paused ? 'Play animation' : 'Pause animation';
    pauseBtn.setAttribute('aria-pressed', String(paused));
    replayBtn.disabled = paused;
    if (media.matches) { progress = 8; story.showComplete(time); } else story.resume(time);
    last = 0; paint(); schedule();
  }
  pauseBtn.addEventListener('click', () => { if (media.matches) return; paused = !paused; setMotion(); });
  media.addEventListener('change', () => { paused = media.matches; setMotion(); });
  document.addEventListener('visibilitychange', () => { last = 0; schedule(); });
  replayBtn.addEventListener('click', () => { if (!paused) { progress = 0; story.replay(time + 3); paint(); schedule(); } });

  const rotate = (delta) => { angle += delta; paint(); };
  $('.city-left').addEventListener('click', () => rotate(-.2));
  $('.city-right').addEventListener('click', () => rotate(.2));
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, angle };
    // Synthetic events have no live pointer to capture.
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* drag still works without capture */ }
    canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointermove', (e) => { if (drag && drag.id === e.pointerId) { angle = drag.angle + (e.clientX - drag.x) * .006; paint(); } });
  const end = () => { drag = null; canvas.classList.remove('dragging'); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => canvas.addEventListener(t, end));
  canvas.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); rotate(e.key === 'ArrowLeft' ? -.2 : .2); } });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = 0; schedule(); }, { threshold: .01 }).observe(canvas);
  resize(); setMotion();
})();
