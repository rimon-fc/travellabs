/* TravelLabs living travel studies. Colour-field brush technique adapted from the user-supplied MCPX site; independent animation lifecycle and new product compositions. */
(()=>{
'use strict';
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
    coast: (() => {
      const c = P({ top: '#f7f1e6', peach: '#f5cfa6', blue: '#cddcef', sun: '#fff5e0', glow: '#ffd9a3', cloud: '#fffaf2', seaN: '#e9bf95', seaM: '#4f80c0', seaD: '#2b4d8c', gold: '#ffd89b', cliffL: '#dca774', cliffS: '#8c7192', house: '#f4ede1', roof: '#d97a50', g1: '#6f8f5a', g2: '#a9ba70', g3: '#4c6b47' });
      const hz = .6, sx = .66, sy = .5;
      return {
        field(u, v, t, a) {
          const edge = .78 + .07 * fbm(v * 5, 1) - Math.max(0, v - .32) * .32;
          if (u > edge && v > .33 + .05 * fbm(u * 6, 2)) {
            const n = fbm(u * 9, v * 9);
            if (v < .5 && h2(Math.floor(u * 70), Math.floor(v * 60)) > .7) return [h2(Math.floor(u * 70) + 1, Math.floor(v * 60)) > .55 ? c.roof : c.house, 0, 0];
            return [u - edge < .05 + .05 * n ? L(c.cliffL, c.house, n * .3) : L(c.cliffS, c.cliffL, n * .45), 1.1 + (n - .5), 0];
          }
          if (v > .9 - .05 * Math.sin(u * 9) - .04 * fbm(u * 8, 3) && u < .5) { const n = fbm(u * 14, v * 14); return [n < .42 ? c.g3 : n < .6 ? c.g1 : c.g2, -1 + n * 2, 0]; }
          if (v < hz) {
            let col = L(c.top, c.peach, sm(.1, hz, v));
            col = L(col, c.blue, (1 - v / hz) * u * .6);
            const d = Math.hypot((u - sx) * a, v - sy);
            col = L(col, c.glow, sm(.34, .05, d) * .75);
            col = L(col, c.sun, sm(.075, .05, d));
            const cl = fbm(u * 3 + t * .01, v * 9);
            if (v < hz - .14 && cl > .62) col = L(col, c.cloud, (cl - .62) * 4);
            return [col, (fbm(u * 2, v * 6) - .5) * .5, cl > .58 ? 1 : 0];
          }
          const k = (v - hz) / (1 - hz);
          let col = k < .14 ? L(c.seaN, c.seaM, k / .14) : L(c.seaM, c.seaD, (k - .14) / .86);
          const sp = Math.sin(v * 150 + u * 23 - t * 1.6) * .5 + .5;
          if (Math.abs((u - sx) * a) < .03 + k * .22 && sp > .5) col = L(col, c.gold, .5 + .5 * sp);
          else if (fbm(u * 30, v * 60 + t * .4) > .7) col = L(col, c.top, .3);
          return [col, (fbm(u * 4, v * 20) - .5) * .25, 1];
        }
      };
    })(),
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
    dunes: (() => {
      const c = P({ sky1: '#fbe8cf', sky2: '#f2b98a', sun: '#fff3da', d0: '#f2cfa2', d1: '#eab57c', d2: '#d9894f', d3: '#bd6a3c', s0: '#d8a59a', s1: '#b37a78', s2: '#93596b', s3: '#6f4459' });
      const D = [[.56, c.d0, c.s0], [.66, c.d1, c.s1], [.78, c.d2, c.s2], [.92, c.d3, c.s3]];
      return {
        field(u, v, t, a) {
          for (let i = 3; i >= 0; i--) {
            const [b, lit, sh] = D[i], f = u * (3 + i * .9) + i * 1.7, y = b - .07 * Math.sin(f) - .03 * fbm(u * 4, i);
            if (v > y) { const isLit = Math.cos(f) * (i % 2 ? -1 : 1) > -.2; const n = fbm(u * 18, v * 18); return [L(isLit ? lit : sh, isLit ? c.sun : sh, n * .18), isLit ? -.25 : .35, 0]; }
          }
          const d = Math.hypot((u - .5) * a, v - .4);
          let col = L(c.sky1, c.sky2, sm(.1, .6, v)); col = L(col, c.sun, sm(.2, .12, d) * .9);
          return [col, (fbm(u * 2, v * 8) - .5) * .3, d < .3 ? 1 : 0];
        }
      };
    })(),
    city: (() => {
      const c = P({ sky1: '#b4b0dc', sky2: '#f6c2a6', glow: '#ffe1c2', b1: '#5a6a99', b2: '#6f7cab', b3: '#47547f', edge: '#3a4570', win: '#ffd27a', winOff: '#8790b8', river: '#4b5a8b', river2: '#7a83b5' });
      const bTop = (i) => (i === 15 ? .16 : .8 - (.16 + .36 * h2(i, 4)));
      const bld = (u, v, t) => {
        const i = Math.floor(u * 26), top = bTop(i), fx = u * 26 - i;
        if (v < top) return null;
        if (i === 15 && v < top + .05 && fx > .35 && fx < .65) return [c.b2, -1.57];
        if (h2(Math.floor(u * 130), Math.floor(v * 90)) > .7 && fx > .1 && fx < .86) { const on = h2(Math.floor(u * 130), Math.floor(v * 90) + Math.floor(t * .3 + h2(i, 1) * 5)) > .35; return [on ? c.win : c.winOff, 0]; }
        return [fx > .82 ? c.edge : [c.b1, c.b2, c.b3][i % 3], -1.57];
      };
      return {
        field(u, v, t) {
          if (v < .8) { const b = bld(u, v, t); if (b) return [b[0], b[1], b[0] === c.win || b[0] === c.winOff ? 1 : 0]; let col = L(c.sky1, c.sky2, sm(0, .8, v)); col = L(col, c.glow, sm(.4, 0, Math.hypot(u - .3, v - .78)) * .6); return [col, (fbm(u * 2, v * 7) - .5) * .4, 0]; }
          const m = .8 - (v - .8) * 1.6 + .01 * Math.sin(v * 140 - t * 2); const b = bld(u, m, t);
          const base = L(c.river, c.river2, fbm(u * 6, v * 30 + t * .2));
          return [b ? L(b[0], base, .45) : base, 0, 1];
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
    runway: (() => {
      const c = P({ sky1: '#86ade0', sky2: '#cfe0f2', sky3: '#f7dcc6', sun: '#fff4e2', cw: '#fffaf3', cs: '#c6cbe6', cp: '#f3d2c6', wing: '#aab2c4', wingS: '#7f889d', tip: '#2a3bff' });
      const hz = .5;
      return {
        field(u, v, t, a) {
          const wy = .98 - u * .5;
          if (u < .5 && v > wy && v < wy + .1 + u * .05) return [v < wy + .015 ? c.wingS : L(c.wing, c.cw, fbm(u * 10, v * 10) * .3), -.46, 0];
          if (u < .06 && v > .73 && v < .76) return [c.tip, -.46, 0];
          if (v < hz) { let col = v < .25 ? L(c.sky1, c.sky2, v / .25) : L(c.sky2, c.sky3, (v - .25) / .25); col = L(col, c.sun, sm(.25, .03, Math.hypot((u - .74) * a, v - .44)) * .9); return [col, (fbm(u * 2, v * 5) - .5) * .3, 0]; }
          const n = fbm(u * 5 + t * .03, v * 12), k = (v - hz) / (1 - hz);
          let col = L(c.cs, c.cw, n * 1.4 - .1); col = L(col, c.cp, (1 - k) * .5 * (1 - n));
          return [col, (n - .5) * .6, 1];
        }
      };
    })(),
    road: (() => {
      const c = P({ sky1: '#e5eef6', sky2: '#f7e5cc', sea: '#6fa3cb', h0: '#c5d29a', h1: '#a3bb73', h2: '#7f9c5c', h3: '#64824f', s1: '#6c7e5c', road: '#ecd0a4', edge: '#c9a576', line: '#fffaf0' });
      const H3 = [[.48, c.h0], [.58, c.h1], [.7, c.h2], [.84, c.h3]];
      return {
        field(u, v, t) {
          if (v > .46) { const cx = .52 + .26 * Math.sin((1 - v) * 4.4) * (1.1 - v), hw = .004 + (v - .46) * .26, d = Math.abs(u - cx); if (d < hw) return [d < hw * .06 && Math.sin(v * 70) > 0 ? c.line : d > hw * .86 ? c.edge : L(c.road, c.edge, fbm(u * 30, v * 30) * .4), Math.atan2(1, -.26 * 4.4 * Math.cos((1 - v) * 4.4)) - Math.PI / 2, 0]; }
          for (let i = 3; i >= 0; i--) { const [b, col] = H3[i], y = b - .05 * Math.sin(u * (4 + i) + i) - .03 * fbm(u * 5, i); if (v > y) { const n = fbm(u * 16, v * 16); return [L(col, n > .55 ? c.s1 : col, .5), (n - .5) * 1.2, 0]; } }
          if (v > .4) return [L(c.sea, c.sky1, fbm(u * 20, v * 40 + t * .3) * .5), 0, 1];
          return [L(c.sky1, c.sky2, sm(0, .4, v)), (fbm(u * 2, v * 6) - .5) * .4, 0];
        },
        extras(W, H, k, rnd, out) { for (let i = 0; i < 7; i++) { const v = .5 + i * .06, cx = .52 + .26 * Math.sin((1 - v) * 4.4) * (1.1 - v), hw = (v - .46) * .26 + .03; cypress(W * (cx + (i % 2 ? hw : -hw) * 1.2), H * v, H * (.06 + i * .03), k, rnd, out); } }
      };
    })(),
    hotel: (() => {
      const c = P({ sky1: '#dbeef6', sky2: '#f8eedf', wall: '#f6f1e8', wallS: '#e2d6c4', roof: '#d07a52', roofS: '#a95e40', glass: '#7fa6c8', frame: '#6f6a72', bloom: '#d9719c', bloom2: '#f0a4c2', pool: '#7fd3dc', poolD: '#4fb4c6', ripple: '#d2f3f4', deck: '#ecdfcb', deckS: '#d8c6ab', leaf: '#5f8a52' });
      return {
        field(u, v, t) {
          if (v > .74 && v < .93 && u > .08 && u < .92) { const r = Math.sin(u * 60 + Math.sin(v * 40) * 2 - t * 1.8); return [r > .75 ? c.ripple : L(c.pool, c.poolD, (v - .74) * 4), 0, 1]; }
          if (v > .68) return [L(c.deck, c.deckS, fbm(u * 30, v * 30)), 0, 0];
          if (u > .16 && u < .84 && v > .26 && v < .68) {
            if (v < .31) return [u > .62 ? c.roofS : c.roof, 0, 0];
            const col = Math.floor((u - .16) / .68 * 6), fx = (u - .16) / .68 * 6 - col, row = v < .48 ? 0 : 1, fy = row ? (v - .48) / .2 : (v - .31) / .17;
            const archTop = .25 + .25 * Math.pow(Math.abs(fx - .5) * 2, 2);
            if (fx > .22 && fx < .78 && fy > archTop && fy < .9) return [fx < .3 || fx > .7 ? c.frame : L(c.glass, c.sky1, fbm(u * 20, v * 20) * .5), -1.57, 0];
            if (u < .3 && fbm(u * 18, v * 18) > .55) return [fbm(u * 40, v * 40) > .5 ? c.bloom : c.bloom2, (fbm(u * 9, v * 9) - .5) * 3, 0];
            return [u > .66 ? c.wallS : L(c.wall, c.wallS, fbm(u * 12, v * 12) * .3), -1.57, 0];
          }
          return [L(c.sky1, c.sky2, sm(0, .68, v)), (fbm(u * 2, v * 6) - .5) * .4, 0];
        },
        extras(W, H, k, rnd, out) { palm(W * .08, H * .72, H * .5, k, rnd, out); palm(W * .93, H * .72, H * .42, k, rnd, out); }
      };
    })(),
    balloons: (() => {
      const c = P({ sky1: '#cddbf0', sky2: '#f8dcc3', glow: '#fff0dc', r1: '#e8c49a', r2: '#d3a274', r3: '#b9846a', sh: '#9b7377', far: '#d9c3c0' });
      return {
        field(u, v, t, a) {
          const near = .7 + .1 * Math.abs(Math.sin(u * 11)) * fbm(u * 6, 1) - .06 * fbm(u * 3, 2);
          if (v > near) { const n = fbm(u * 14, v * 14), lit = Math.cos(u * 11) > 0; return [L(lit ? c.r1 : c.r3, lit ? c.r2 : c.sh, n * .6), lit ? -.9 : .9, 0]; }
          const far = .62 + .04 * Math.sin(u * 5) + .04 * fbm(u * 8, 3);
          if (v > far) return [L(c.far, c.r1, fbm(u * 10, v * 10) * .5), 0, 0];
          let col = L(c.sky1, c.sky2, sm(.1, .62, v)); col = L(col, c.glow, sm(.3, 0, Math.hypot((u - .3) * a, v - .6)) * .7);
          return [col, (fbm(u * 2, v * 6) - .5) * .4, 0];
        },
        extras(W, H, k, rnd, out) {
          const SETS = [['#e2553f', '#f2b531'], ['#3e7cc2', '#f4efe6'], ['#2a3bff', '#d7ff3c'], ['#d9719c', '#f6c1a4'], ['#3f8f7a', '#f2e3b3'], ['#f08a3c', '#fff1d6']].map(s => s.map(HX));
          [[.2, .38, .07], [.48, .22, .1], [.74, .42, .06], [.36, .56, .04], [.88, .2, .05], [.62, .6, .035]].forEach(([bx, by, r], i) => {
            const R = r * H, cx = bx * W, cy = by * H, set = SETS[i % SETS.length];
            for (let j = 0; j < R * R * .5; j++) { const ang = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * R, x = cx + Math.cos(ang) * d * .92, y = cy + Math.sin(ang) * d * (1.05 + (Math.sin(ang) > 0 ? .1 : 0)); const stripe = Math.floor((x - cx + R) / R * 3) % 2; const col = L(set[stripe], [40, 40, 60], Math.max(0, (x - cx) / R) * .3); out.push({ x, y, len: R * .25, wid: Math.max(1.6, R * .09), ang: 1.57 + (x - cx) / R * .5, c: col }); }
            out.push({ x: cx, y: cy + R * 1.35, len: R * .25, wid: R * .18, ang: 0, c: HX('#6f5440') });
            out.push({ x: cx - R * .35, y: cy + R * 1.1, len: R * .45, wid: 1, ang: 1.2, c: HX('#6f5440') }, { x: cx + R * .35, y: cy + R * 1.1, len: R * .45, wid: 1, ang: 1.94, c: HX('#6f5440') });
          });
        }
      };
    })(),
    snow: (() => {
      const c = P({ sky1: '#d4e0ee', sky2: '#f2ece6', snow: '#f7f8fb', snowS: '#c3cfe2', rock: '#8a95b4', ground: '#f3f6fa', groundS: '#d3dcea', cabin: '#7a5440', roof: '#f7f8fb', win: '#ffcf7a' });
      return {
        field(u, v, t) {
          if (v > .66 - .04 * Math.sin(u * 5)) { if (u > .58 && u < .74 && v > .62 && v < .76) { if (v < .66) return [c.roof, .3, 0]; const w = (u > .62 && u < .66 || u > .68 && u < .71) && v > .69 && v < .73; return [w ? c.win : c.cabin, -1.57, w ? 1 : 0]; } return [L(c.ground, c.groundS, fbm(u * 10, v * 20)), (fbm(u * 3, v * 3) - .5) * .6, 0]; }
          const top = .2 + .26 * Math.abs(Math.sin(u * 3.3 + .4)) + .04 * fbm(u * 9, 1);
          if (v > top) { const lit = Math.cos(u * 3.3 + .4) * Math.sign(Math.sin(u * 3.3 + .4)) > 0; const n = fbm(u * 15, v * 15); return [n > .68 ? c.rock : lit ? c.snow : c.snowS, lit ? -1 : 1, 0]; }
          return [L(c.sky1, c.sky2, sm(0, .5, v)), (fbm(u * 2, v * 6) - .5) * .4, 0];
        },
        extras(W, H, k, rnd, out) { for (let i = 0; i < 9; i++) pine(W * (.05 + i * .11 + (rnd() - .5) * .04), H * (.72 + rnd() * .2), H * (.16 + rnd() * .12), k, rnd, out); },
        live(W, H, t, ctx, k) { ctx.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 40; i++) { const x = (h2(i, 1) * W + Math.sin(t + i) * 8) % W, y = (h2(i, 2) * H + t * (14 + h2(i, 3) * 16)) % H; ctx.fillRect(x, y, 2 * k, 2 * k); } }
      };
    })(),
    harbour: (() => {
      const c = P({ sky1: '#e3eef6', sky2: '#f7e8d4', hill: '#80996b', hill2: '#a6b57e', sea: '#5f94c0', seaD: '#2f5e92', roof: '#c8694a' });
      const HOUSES = ['#f2c48d', '#e98e6e', '#f4e3c1', '#d7d0a0', '#e6b0a0', '#f0d9a8', '#c9d6c2'].map(HX);
      const town = (u, v) => { const i = Math.floor(u * 22), j = Math.floor(v * 30), top = .3 + .1 * Math.sin(u * 4) + .04 * h2(i, 2); if (v < top || v > .52) return null; if (v - top < .02) return c.roof; return HOUSES[Math.floor(h2(i, j) * HOUSES.length)]; };
      return {
        field(u, v, t) {
          if (v < .52) { const tw = town(u, v); if (tw) return [h2(Math.floor(u * 110), Math.floor(v * 80)) > .82 ? L(tw, [60, 60, 70], .5) : tw, -1.57, 0]; if (v > .16 + .06 * Math.sin(u * 3)) return [L(c.hill, c.hill2, fbm(u * 12, v * 12)), (fbm(u * 5, v * 5) - .5) * 2, 0]; return [L(c.sky1, c.sky2, sm(0, .3, v)), (fbm(u * 2, v * 6) - .5) * .4, 0]; }
          const m = .52 - (v - .52) * .9 + .01 * Math.sin(v * 160 - t * 2), tw = town(u, m), base = L(c.sea, c.seaD, (v - .52) * 2);
          return [tw ? L(tw, base, .5 + .2 * Math.sin(v * 200 + u * 30 - t * 2)) : L(base, c.sky1, fbm(u * 30, v * 80 + t * .3) > .72 ? .4 : 0), 0, 1];
        },
        extras(W, H, k, rnd, out) { const HUL = ['#d9533d', '#f0c14b', '#2f6f9f', '#f4f1ea', '#3f8f7a'].map(HX); for (let i = 0; i < 9; i++) { const x = W * (.06 + i * .105 + (rnd() - .5) * .03), y = H * (.6 + rnd() * .3), s = (.6 + (y / H - .6)) * k * 1.6; out.push({ x, y, len: 16 * s, wid: 5 * s, ang: 0, c: HUL[i % HUL.length] }); out.push({ x: x - 2 * s, y: y - 4 * s, len: 6 * s, wid: 4 * s, ang: 0, c: HX('#f7f4ee') }); out.push({ x, y: y + 5 * s, len: 16 * s, wid: 2 * s, ang: 0, c: HX('#2f5e92') }); } }
      };
    })()
  };

  /* surreal scenes, built from the painted fields above */
  SCENES.door = (() => {
    const wood = HX('#8a5a3c'), woodL = HX('#b07a52'), shade = HX('#7a4f5c');
    const x0 = .66, x1 = .8, y0 = .24, y1 = .8;
    return {
      field(u, v, t, a) {
        const inX = u > x0 && u < x1, inY = v > y0 && v < y1, fw = .012;
        if (inX && inY) {
          if (u < x0 + fw || u > x1 - fw || v < y0 + fw * a) return [u > x1 - fw ? wood : woodL, -1.57, 0];
          const r = SCENES.coast.field((u - x0) / (x1 - x0), (v - y0) / (y1 - y0) * .95 + .02, t, (x1 - x0) / (y1 - y0) * a);
          return [r[0], r[1], r[2]];
        }
        const r = SCENES.dunes.field(u, v, t, a);
        if (v > y1 && v < y1 + .07 && u > x0 + (v - y1) * 1.5 && u < x1 + .25 - (v - y1) * 1.2) return [L(r[0], shade, .45), r[1], 0];
        return r;
      }
    };
  })();
  SCENES.floating = (() => {
    const c = P({ sky1: '#cfdff2', sky2: '#f7e6d6', cloud: '#fffaf3', cloudS: '#d9dcec', grass: '#7fa865', grass2: '#a8c27a', rock: '#a07a62', rockS: '#6f5a66', rock2: '#c49a78', run: '#7d7f88', line: '#fffaf0', fall: '#e8f4fb', fall2: '#9fc6e6' });
    const isl = (u, v, cx, cy, w, d) => { const dx = (u - cx) / w; if (Math.abs(dx) > 1) return 0; const top = cy - .02 * (1 - dx * dx); if (v < top) return 0; if (v < cy + .012) return 1; return v < cy + d * (1 - Math.abs(dx) ** 1.3) * (1 - .25 * vn(u * 30, 1)) ? 2 : 0; };
    return {
      field(u, v, t, a) {
        if (u > .6 && u < .63 && v > .47 && v < .95) return [fbm(u * 80, v * 30 - t * 2) > .5 ? c.fall : c.fall2, 1.57, 1];
        for (const [cx, cy, w, d, big] of [[.5, .45, .2, .32, 1], [.16, .3, .06, .1, 0], [.84, .26, .05, .08, 0]]) {
          const k = isl(u, v, cx, cy, w, d);
          if (k === 1) { if (big && Math.abs(v - (cy - .004)) < .006 && Math.abs(u - cx) < w * .7) return [Math.abs(v - (cy - .004)) < .0015 && Math.sin(u * 300) > 0 ? c.line : c.run, 0, 0]; return [fbm(u * 40, v * 40) > .5 ? c.grass : c.grass2, (fbm(u * 9, 1) - .5), 0]; }
          if (k === 2) { const n = fbm(u * 18, v * 18); return [L(u < cx ? c.rock2 : c.rockS, c.rock, n), 1.57 + (n - .5), 0]; }
        }
        if (v > .78) { const n = fbm(u * 5 + t * .02, v * 10); return [L(c.cloudS, c.cloud, n * 1.4 - .1), (n - .5) * .6, 1]; }
        let col = L(c.sky1, c.sky2, sm(0, .8, v)); const cl = fbm(u * 3 + t * .01, v * 7); if (cl > .64) col = L(col, c.cloud, (cl - .64) * 4);
        return [col, (fbm(u * 2, v * 6) - .5) * .4, cl > .6 ? 1 : 0];
      },
      extras(W, H, k, rnd, out) { const x = W * .44, y = H * .425 - 6 * k; out.push({ x, y, len: 22 * k, wid: 3 * k, ang: -.15, c: HX('#f7f4ee') }, { x: x + 2 * k, y: y - 1 * k, len: 4 * k, wid: 9 * k, ang: 1.4, c: HX('#f7f4ee') }, { x: x - 8 * k, y: y + 1 * k, len: 3 * k, wid: 3 * k, ang: -.15, c: HX('#2a3bff') }); }
    };
  })();


/* renderer appended below */
SCENES['paper-grid']={field:(u,v,t)=>[[248,248,243],0,0]};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=document.body.classList.contains('motion-paused'), pageHidden=document.hidden, clock=0,last=0,raf=0;
const pieces=[];
const active=()=>!paused&&!reduced.matches&&!pageHidden;
function cover(ctx,img,w,h){const r=Math.max(w/img.width,h/img.height),sw=w/r,sh=h/r;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,w,h);}
function ink(ctx,w,h,t,kind){
 ctx.save();ctx.lineCap='round';
 if(kind==='routes'||kind==='neural'){
  const n=kind==='neural'?70:26;
  const points=Array.from({length:n},(_,i)=>({x:(.09+h2(i,21)*.82)*w,y:(.12+h2(i,12)*.74)*h}));
  ctx.strokeStyle='rgba(255,248,218,.3)';ctx.lineWidth=.7;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
   const a=points[i],b=points[j],d=Math.hypot(a.x-b.x,a.y-b.y);
   if(d>w*.17)continue;
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
   const k=(t*.18+h2(i,j))%1;
   ctx.fillStyle='rgba(255,246,190,.8)';ctx.beginPath();ctx.arc(a.x+(b.x-a.x)*k,a.y+(b.y-a.y)*k,1.4,0,7);ctx.fill();
  }
  points.forEach((p,i)=>{ctx.fillStyle=i%5?'rgba(247,240,210,.6)':'rgba(242,197,104,.9)';ctx.beginPath();ctx.arc(p.x,p.y,1.2+Math.sin(t+i)*.4,0,7);ctx.fill();});
 }
 if(kind==='sound'){
  const cx=w*.5,cy=h*.55;
  for(let i=0;i<37;i++){const q=(i-18)/18,amp=(Math.sin(t*2+i*.46)*.5+.5)*Math.exp(-q*q*2.8);ctx.strokeStyle=`rgba(255,252,228,${.5+amp*.4})`;ctx.lineWidth=2.1;ctx.beginPath();ctx.moveTo(cx+q*w*.35,cy-6-amp*h*.22);ctx.lineTo(cx+q*w*.35,cy+6+amp*h*.22);ctx.stroke();}
 }
 if(kind==='paths'){
  for(let i=0;i<3;i++){ctx.strokeStyle=i===1?'rgba(255,241,161,.9)':'rgba(250,250,244,.38)';ctx.lineWidth=i===1?2.3:1;ctx.beginPath();ctx.moveTo(w*.12,h*.74);ctx.bezierCurveTo(w*.37,h*(.7-i*.2),w*.63,h*(.08+i*.18),w*.87,h*.3);ctx.stroke();
   const k=(t*.14+i*.24)%1;const x=w*(.12+.75*k),y=h*(.74*(1-k)+.3*k)-Math.sin(k*Math.PI)*h*(.14+i*.08);ctx.fillStyle='#fff3b9';ctx.beginPath();ctx.arc(x,y,i===1?3:1.7,0,7);ctx.fill();}
 }
 if(kind==='scribble'){
  ctx.strokeStyle='rgba(52,83,76,.55)';ctx.lineWidth=1.1;const k=(t*.08)%1;ctx.setLineDash([w*.8*k,w]);ctx.beginPath();ctx.moveTo(w*.16,h*.65);ctx.bezierCurveTo(w*.4,h*.1,w*.44,h*.94,w*.82,h*.39);ctx.stroke();ctx.setLineDash([]);
 }
 if(kind==='pixels'){
  for(let x=0;x<64;x++)for(let y=0;y<17;y++){const wave=Math.sin(x*.15+t*.45)+Math.cos(y*.36-t*.3);if(wave>.4+Math.sin(x*y*.1)*.6){ctx.fillStyle=`rgba(45,87,80,${.08+Math.max(0,wave)*.16})`;ctx.fillRect(w*.06+x*w*.014,h*.2+y*h*.035,2,2);}}
 }
 if(kind==='train'){
  const k=(t*.09)%1;ctx.globalAlpha=Math.sin(k*Math.PI)*.65;ctx.strokeStyle='#fff7cf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*(.16+.52*k),h*(.72-.19*k));ctx.lineTo(w*(.18+.52*k),h*(.71-.19*k));ctx.stroke();
 }
 ctx.restore();
}
function mount(canvas){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const piece={canvas,ctx,visible:false,w:0,h:0,strokes:[],live:[],extra:[],img:null,base:null,ready:false,t:0};
 const scene=SCENES[canvas.dataset.scene]||SCENES.coast;
 const imageSrc=canvas.dataset.image;
 function size(){
  const box=canvas.getBoundingClientRect();if(box.width<2||box.height<2)return;
  const width=Math.min(1200,Math.round(box.width)),height=Math.round(width*box.height/box.width);
  if(width===piece.w&&height===piece.h)return;
  piece.w=width;piece.h=height;const dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  piece.base=document.createElement('canvas');piece.base.width=width;piece.base.height=height;
  const b=piece.base.getContext('2d');
  if(imageSrc){if(piece.img?.naturalWidth){cover(b,piece.img,width,height);piece.ready=true;}return;}
  const rnd=RND(strHash(canvas.dataset.scene+canvas.dataset.variant));const a=width/height;
  const scale=Math.max(.45,Math.sqrt(width*height)/650),cell=5;
  for(let y=0;y<height;y+=cell)for(let x=0;x<width;x+=cell){const [c]=scene.field(x/width,y/height,0,a);b.fillStyle=`rgb(${c.map(cl8).join(',')})`;b.fillRect(x,y,cell+1,cell+1);}
  piece.strokes=[];piece.live=[];piece.extra=[];
  const count=Math.round(width*height/15);
  for(let i=0;i<count;i++){
   const x=rnd()*width,y=rnd()*height,[c,ang,live]=scene.field(x/width,y/height,0,a);
   const s={x,y,ang:ang+(rnd()-.5)*.35,len:(6+rnd()*13)*scale,wid:(2+rnd()*4)*scale,c,b:(rnd()-.5)*22};piece.strokes.push(s);if(live)piece.live.push(s);
  }
  scene.extras?.(width,height,scale,rnd,piece.extra);
  for(const s of [...piece.strokes,...piece.extra])drawStroke(b,s,s.c);
  piece.ready=true;
 }
 function drawStroke(g,s,c){g.strokeStyle=`rgb(${c.map(v=>cl8(v+(s.b||0))).join(',')})`;g.lineWidth=s.wid;g.lineCap='round';g.beginPath();const dx=Math.cos(s.ang)*s.len*.5,dy=Math.sin(s.ang)*s.len*.5;g.moveTo(s.x-dx,s.y-dy);g.lineTo(s.x+dx,s.y+dy);g.stroke();}
 piece.draw=(time)=>{
  size();if(!piece.ready||!piece.base)return;
  const {w,h}=piece;
  if(!imageSrc){
   const b=piece.base.getContext('2d');
   const length=piece.live.length,count=Math.min(600,Math.ceil(length*.07));
   for(let i=0;i<count;i++){const n=(Math.floor(time*17)*count+i*53)%length,s=piece.live[n];if(s){const [c]=scene.field(s.x/w,s.y/h,time*1.5,w/h);drawStroke(b,s,c);}}
  }
  ctx.drawImage(piece.base,0,0,w,h);
  const effect=canvas.dataset.effect;
  if(effect==='water'){
   for(let y=Math.floor(h*.55);y<h;y+=2){const k=(y/h-.55)/.45,dx=Math.sin(y*.13-time*2)*k*3+Math.sin(y*.04+time)*k*1.4;ctx.drawImage(piece.base,0,y,w,2,dx,y,w,2);}
  }
  if(effect==='light'){
   const gradient=ctx.createRadialGradient(w*(.3+Math.sin(time*.28)*.14),h*.35,0,w*.35,h*.4,w*.52);gradient.addColorStop(0,'rgba(255,242,190,.16)');gradient.addColorStop(1,'rgba(255,242,190,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  }
  if(effect==='portal'){
   for(let i=0;i<16;i++){const k=(time*.025+i/16)%1;ctx.fillStyle=`rgba(255,248,222,${Math.sin(k*Math.PI)*.5})`;ctx.beginPath();ctx.arc(w*(.25+h2(i,2)*.6),h*(1-k),1+h2(i,6)*2,0,7);ctx.fill();}
  }
  if(canvas.dataset.overlay)ink(ctx,w,h,time,canvas.dataset.overlay);
 };
 if(imageSrc){piece.img=new Image();piece.img.onload=()=>{piece.w=0;piece.draw(clock);schedule();};piece.img.src=imageSrc;}
 new ResizeObserver(()=>{piece.w=0;piece.draw(clock);schedule();}).observe(canvas);
 new IntersectionObserver(([entry])=>{piece.visible=entry.isIntersecting;if(piece.visible){piece.draw(clock);schedule();}},{rootMargin:'60px'}).observe(canvas);
 pieces.push(piece);piece.draw(0);
}
function schedule(){if(!raf&&active()&&pieces.some(p=>p.visible))raf=requestAnimationFrame(tick);}
function tick(now){raf=0;if(!active())return;if(!last)last=now;const elapsed=now-last;if(elapsed>=80){clock+=Math.min(elapsed,180)/1000;last=now;for(const piece of pieces)if(piece.visible)piece.draw(clock);}schedule();}
document.querySelectorAll('canvas[data-living-art]').forEach(mount);
window.addEventListener('lab-motion',e=>{paused=Boolean(e.detail.paused);last=0;schedule();});
document.addEventListener('visibilitychange',()=>{pageHidden=document.hidden;last=0;schedule();});
reduced.addEventListener('change',()=>{last=0;for(const piece of pieces)if(piece.visible)piece.draw(reduced.matches?0:clock);schedule();});
// Render tab content immediately on reveal; the observer resumes it only while visible.
document.querySelectorAll('[role="tab"],.research-tabs button').forEach(tab=>tab.addEventListener('click',()=>requestAnimationFrame(()=>{for(const p of pieces)if(p.canvas.getBoundingClientRect().width>0)p.draw(clock);})));
})();
