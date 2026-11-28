// Reuses the existing MCPX peaks/island colour fields and brush-stroke renderer from site.js.
(() => {
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RND = (seed) => { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1000003) / 1000003; }; };
  const h2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf); const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
  const fbm = (x, y) => .5 * vn(x, y) + .3 * vn(x * 2.1 + 5.2, y * 2.1 + 1.3) + .2 * vn(x * 4.3 + 9.1, y * 4.3 + 7.7);
  const HX = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const L = (a, b, t) => { t = Math.max(0, Math.min(1, t)); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const cl8 = (n) => (n < 0 ? 0 : n > 255 ? 255 : n | 0);
  const strHash = (s) => [...(s || 'x')].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261);
  const P = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, HX(v)]));

  // Helpers that return extra strokes for objects (palms, balloons, boats).
  const palm = (x, y, hgt, k, rnd, out) => {
    const trunk = HX('#6f5440'), f1 = HX('#3f7a4a'), f2 = HX('#6a9c55');
    for (let i = 0; i < 14; i++) { const q = i / 14; out.push({ x: x + Math.sin(q * 2.2) * hgt * .12, y: y - q * hgt, len: hgt / 10, wid: 3.2 * k, ang: -1.45 + Math.cos(q * 2.2) * .25, c: trunk }); }
    const tx = x + Math.sin(2.2) * hgt * .12, ty = y - hgt;
    for (let f = 0; f < 8; f++) {
      const dir = -Math.PI + f / 7 * Math.PI + (rnd() - .5) * .3;
      for (let i = 1; i < 9; i++) { const q = i / 9, d = q * hgt * .42; out.push({ x: tx + Math.cos(dir) * d, y: ty + Math.sin(dir) * d * .55 + q * q * hgt * .14, len: 6 * k + rnd() * 4 * k, wid: (3.6 - q * 2) * k, ang: dir + q * .6 * Math.sign(Math.cos(dir)), c: rnd() < .5 ? f1 : f2 }); }
    }
  };
  const cypress = (x, y, hgt, k, rnd, out) => { const g1 = HX('#3d5a3c'), g2 = HX('#56744a'); for (let i = 0; i < 26; i++) { const q = rnd(), w = (1 - q) * hgt * .1 + 1; out.push({ x: x + (rnd() - .5) * w * 2, y: y - q * hgt, len: 5 * k + rnd() * 5 * k, wid: 2.6 * k, ang: -1.5 + (rnd() - .5) * .5, c: rnd() < .6 ? g1 : g2 }); } };
  const pine = (x, y, hgt, k, rnd, out, col) => { const g = col || HX('#33503f'), g2 = HX('#4b6b55'), sn = HX('#f4f6f9'); for (let r = 0; r < 9; r++) { const q = r / 9, w = (1 - q) * hgt * .38 + 2; for (let i = 0; i < 3; i++) out.push({ x: x + (rnd() - .5) * w, y: y - q * hgt, len: w * .9, wid: 2.6 * k, ang: (rnd() - .5) * .2, c: rnd() < .2 ? sn : rnd() < .6 ? g : g2 }); } };


const SCENES = {
    peaks: (() => {
      const c = P({ sky1: '#dfe8f3', sky2: '#f6e9dc', glow: '#fff1dc', snow: '#f9f7f4', snowS: '#c8cde4', rock: '#9192b9', rockS: '#5f6998', far: '#b8c0dd', farS: '#9ea8cf', pine: '#3e5b4b', pine2: '#5e7c59', lake: '#86b8cc', lake2: '#4d87a6' });
      const base = .66, PK = [[.12, .36, 1.1], [.4, .48, 1.2], [.7, .42, 1.05], [.96, .33, 1.2]];
      const topN = (u) => Math.min(...PK.map(([x, h, s]) => base - h + Math.abs(u - x) * s));
      const near = (u) => PK.reduce((b, p) => (Math.abs(u - p[0]) < Math.abs(u - b[0]) ? p : b));
      const land = (u, v) => {
        const tn = topN(u) + .012 * (fbm(u * 30, 1) - .5);
        if (v > tn) { const pk = near(u), lit = u < pk[0] + .02 * (fbm(v * 20, 4) - .5), snowy = v < base - pk[1] * .55 + .05 * fbm(u * 12, 2); const n = fbm(u * 16, v * 16); return [snowy ? (lit ? L(c.snow, c.snowS, n * .3) : c.snowS) : (lit ? L(c.rock, c.far, n * .4) : L(c.rockS, c.rock, n * .3)), lit ? -1 : 1]; }
        const tf = .44 + .05 * Math.sin(u * 7) + .05 * fbm(u * 5, 1);
        if (v > tf) return [L(c.far, c.farS, fbm(u * 10, v * 10)), (fbm(u * 4, 2) - .5)];
        let col = L(c.sky1, c.sky2, sm(0, base, v)); col = L(col, c.glow, sm(.4, 0, Math.hypot((u - .25) * 1.6, v - .2)) * .6);
        return [col, (fbm(u * 3, v * 5) - .5) * .4];
      };
      return {
        field(u, v, t) {
          if (v < base) { if (v > base - .035 - .02 * fbm(u * 20, 5)) return [fbm(u * 40, v * 40) > .5 ? c.pine : c.pine2, -1.5, 0]; const [col, ang] = land(u, v); return [col, ang, 0]; }
          const m = base - (v - base) * 1.25 + .006 * Math.sin(v * 120 - t * 1.5);
          const [rc] = land(u, Math.max(0, m));
          return [L(L(rc, c.lake, .35), c.lake2, (v - base) * 1.5), 0, 1];
        }
      };
    })(),

    island: (() => {
      const c = P({ sky1: '#d9eff5', sky2: '#f7eedf', seaN: '#8fd8d6', seaM: '#3aa2bd', seaD: '#25779c', shallow: '#a8e6d8', sand: '#f2dcae', sandS: '#ddbd88', green: '#6f9a5a', foam: '#f6fbf8' });
      const hz = .56;
      return {
        field(u, v, t, a) {
          if (v > .9 - .03 * Math.sin(u * 7)) return [L(c.sand, c.sandS, fbm(u * 20, v * 20)), .1, 0];
          const ix = .62, iw = .2, ih = .08, dx = (u - ix) / iw;
          if (Math.abs(dx) < 1 && v < hz + .01 && v > hz - ih * (1 - dx * dx)) return [v < hz - ih * .55 * (1 - dx * dx) ? c.green : L(c.sand, c.sandS, fbm(u * 25, v * 25)), 0, 0];
          if (v < hz) { const col = L(c.sky1, c.sky2, sm(0, hz, v)); const cl = fbm(u * 3 + t * .01, v * 8); return [cl > .63 && v < hz - .12 ? L(col, c.foam, (cl - .63) * 4) : col, (fbm(u * 2, v * 6) - .5) * .4, cl > .6 ? 1 : 0]; }
          const k = (v - hz) / (.9 - hz);
          let col = k < .15 ? L(c.seaN, c.seaM, k / .15) : L(c.seaM, c.seaD, (k - .15) / .5); if (k > .7) col = L(col, c.shallow, (k - .7) / .3);
          if (fbm(u * 26, v * 70 + t * .5) > .7) col = L(col, c.foam, .45);
          return [col, (fbm(u * 4, v * 20) - .5) * .2, 1];
        },
        extras(W, H, k, rnd, out) { palm(W * .58, H * .55, H * .32, k, rnd, out); palm(W * .68, H * .56, H * .24, k, rnd, out); palm(W * .1, H * .93, H * .5, k, rnd, out); }
      };
    })(),
};
  function mountPaint(cv, sc) {
    const ctx = cv.getContext?.('2d'), gouache = cv.dataset.style === 'gouache';
    if (!ctx) return;
    let W = 0, H = 0, strokes = [], extra = [], live = [], shown = 0, built = false, vis = false, raf = 0, last = 0, k = 1, off = null;
    const t0 = performance.now();
    const draw = (s, c) => {
      const b = s.b || 0, j = s.j || [0, 0, 0];
      ctx.strokeStyle = `rgb(${cl8(c[0] + b + j[0])},${cl8(c[1] + b + j[1])},${cl8(c[2] + b + j[2])})`;
      ctx.lineWidth = s.wid; const dx = Math.cos(s.ang) * s.len / 2, dy = Math.sin(s.ang) * s.len / 2;
      ctx.beginPath(); ctx.moveTo(s.x - dx, s.y - dy); ctx.lineTo(s.x + dx, s.y + dy); ctx.stroke();
    };
    // Smooth gouache: the field sampled at half size, a little film grain, then crisp objects on top.
    const smooth = (t) => {
      const w = Math.ceil(W / 2), h = Math.ceil(H / 2), a = W / H, g = off.getContext('2d'), img = g.createImageData(w, h), d = img.data, fr = Math.floor(t * 6);
      for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) { const [c] = sc.field((x + .5) / w, (y + .5) / h, t, a), n = (h2(x + fr * 13, y * 1.7 + fr) - .5) * 16; d[i] = cl8(c[0] + n); d[i + 1] = cl8(c[1] + n); d[i + 2] = cl8(c[2] + n); d[i + 3] = 255; }
      g.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, W, H);
      extra.forEach(s => draw(s, s.c));
    };
    const build = () => {
      const r = cv.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
      W = r.width; H = r.height; const dpr = Math.min(1.5, devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = 'round';
      const a = W / H, rnd = RND(strHash(cv.dataset.art) ^ Math.round(W * 7 + H));
      k = Math.max(.4, Math.min(1.3, Math.sqrt(W * H) / 720));
      extra = [];
      if (sc.extras) { sc.extras(W, H, k, rnd, extra); extra.forEach(s => { s.j = [(rnd() - .5) * 16, (rnd() - .5) * 16, (rnd() - .5) * 16]; s.b = (rnd() - .5) * 18; }); }
      if (gouache) { off = off || document.createElement('canvas'); off.width = Math.ceil(W / 2); off.height = Math.ceil(H / 2); smooth(0); built = true; return; }
      const cell = Math.max(3, Math.round(6 * k));
      for (let y = 0; y < H; y += cell) for (let x = 0; x < W; x += cell) { const [c] = sc.field((x + cell / 2) / W, (y + cell / 2) / H, 0, a); ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; ctx.fillRect(x, y, cell + 1, cell + 1); }
      strokes = []; live = [];
      const n = Math.round(W * H / (k < .7 ? 16 : 26));
      for (let i = 0; i < n; i++) {
        const big = i < n * .55, x = rnd() * W, y = rnd() * H, [c, ang, lv] = sc.field(x / W, y / H, 0, a);
        const s = { x, y, len: (big ? 9 + rnd() * 15 : 4 + rnd() * 7) * k, wid: (big ? 4 + rnd() * 4 : 2 + rnd() * 2.4) * k, ang: ang + (rnd() - .5) * .4, j: [(rnd() - .5) * 20, (rnd() - .5) * 14, (rnd() - .5) * 16], b: (rnd() - .5) * 24 + (rnd() < .1 ? 26 : 0), c };
        strokes.push(s); if (lv) live.push(s);
      }
      strokes.push(...extra);
      shown = 0; built = true;
      strokes.forEach(s => draw(s, s.c)); shown = strokes.length;
    };
    const loop = (now) => {
      raf = 0; if (!vis) return;
      if (!built) build();
      if (!built) { if (!REDUCE) raf = requestAnimationFrame(loop); return; }
      const stopped = document.hidden || cv.closest('[hidden], .paused, .previews-paused');
      if (stopped) { if (!REDUCE) raf = requestAnimationFrame(loop); return; }
      const t = REDUCE ? 0 : (now - t0) / 1000;
      if (gouache) { if (!cv.classList.contains('idle') && now - last > 160) { last = now; smooth(t); } }
      else if (shown < strokes.length) { const end = Math.min(strokes.length, shown + Math.ceil(strokes.length / 70)); for (let i = shown; i < end; i++) draw(strokes[i], strokes[i].c); shown = end; }
      else if (!cv.classList.contains('idle') && now - last > 60) {
        last = now; const a = W / H, m = Math.min(live.length, Math.max(12, Math.round(live.length * .025)));
        for (let i = 0; i < m; i++) { const s = live[(Math.random() * live.length) | 0], [c] = sc.field(s.x / W, s.y / H, t, a); draw(s, c); }
      }
      if (!REDUCE) raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(loop); }, { rootMargin: '80px' }).observe(cv);
    let rt = 0, cw = 0, chh = 0;
    new ResizeObserver(() => { const r = cv.getBoundingClientRect(); if (built && Math.abs(r.width - cw) < 2 && Math.abs(r.height - chh) < 2) return; cw = r.width; chh = r.height; clearTimeout(rt); rt = setTimeout(() => { built = false; if (vis && !raf) raf = requestAnimationFrame(loop); }, built ? 150 : 0); }).observe(cv);
  }


document.querySelectorAll('canvas[data-preview-art]').forEach(cv => {
  if (cv.dataset.paintMounted) return;
  cv.dataset.paintMounted = 'true';
  cv.dataset.art = cv.dataset.previewArt;
  mountPaint(cv, SCENES[cv.dataset.previewArt]);
});
})();
