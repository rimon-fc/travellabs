/* Hand-drawn scenes for the six "next" postcards on the research page, in the mcpx
   sketch style: wobbly ink, offset flat fills, Caveat handwriting, boiling at 5fps.
   Usage: <canvas class="art" data-m="1" data-next="tms|canvas|voice|models|payments|concierge"> */
(() => {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { ink: '#2b2a2e', paper: '#fbf7ee', blue: '#5b7be0', coral: '#ef7a62', yellow: '#f5c451', green: '#69a883', pink: '#f3a9c6', lilac: '#b9a8ea', ultra: '#2a3bff', lime: '#d7ff3c', rule: '#d8d1c0' };

  // Same drawing kit as the mcpx sketches, so these sit naturally beside them.
  const kit = (ctx, U) => {
    let seed = 1;
    const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const j = (v, a) => v + (r() - .5) * 2 * a;
    const k = {
      reseed(n) { seed = 1000 + n * 7919; },
      line(pts, w = 1.7, col = C.ink) {
        ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let p = 0; p < 2; p++) {
          ctx.lineWidth = p ? w * .6 : w; ctx.globalAlpha = p ? .35 : .92; ctx.beginPath();
          pts.forEach(([x, y], i) => { const X = j(x, U * .5), Y = j(y, U * .5); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      },
      fill(pts, col, off = U * 1.4) { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + off, y + off * .8) : ctx.moveTo(x + off, y + off * .8))); ctx.closePath(); ctx.fill(); },
      hatch(pts, col, gap = U * 2.2) {
        ctx.save(); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), mx = Math.min(...xs), Mx = Math.max(...xs), my = Math.min(...ys), My = Math.max(...ys);
        ctx.strokeStyle = col; ctx.lineWidth = U * .7; ctx.globalAlpha = .8;
        for (let x = mx - (My - my); x < Mx; x += gap) { ctx.beginPath(); ctx.moveTo(j(x, U * .4), My); ctx.lineTo(j(x + (My - my), U * .4), my); ctx.stroke(); }
        ctx.restore(); ctx.globalAlpha = 1;
      },
      shape(pts, col, hatchCol) { if (col) k.fill(pts, col); if (hatchCol) k.hatch(pts, hatchCol); k.line([...pts, pts[0]]); },
      circ(cx, cy, rx, ry = rx, n = 22) { return Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }); },
      rect(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; },
      text(s, x, y, size, col = C.ink, align = 'left') { ctx.font = `600 ${size * 1.12}px Caveat, "Comic Sans MS", cursive`; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); },
      mono(s, x, y, size, col = C.ink, align = 'left') { ctx.font = `500 ${size}px "Geist Mono", ui-monospace, monospace`; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); },
      tick(x, y, s, col = C.ultra) { k.line([[x, y], [x + s * .35, y + s * .4], [x + s, y - s * .45]], s * .28, col); },
      face(cx, cy, rad, col, t) {
        k.shape(k.circ(cx, cy, rad), col);
        const blink = (t % 4) < .12; ctx.fillStyle = C.ink;
        if (blink) { k.line([[cx - rad * .45, cy - rad * .1], [cx - rad * .2, cy - rad * .1]], U * .8); k.line([[cx + rad * .2, cy - rad * .1], [cx + rad * .45, cy - rad * .1]], U * .8); }
        else { ctx.beginPath(); ctx.arc(cx - rad * .32, cy - rad * .12, rad * .1, 0, 7); ctx.arc(cx + rad * .32, cy - rad * .12, rad * .1, 0, 7); ctx.fill(); }
        k.line([[cx - rad * .35, cy + rad * .3], [cx, cy + rad * .45], [cx + rad * .35, cy + rad * .3]], U * .8);
      },
      arc(x, y, r, from, to, w = 1.4, col = C.ink) { const pts = Array.from({ length: 9 }, (_, i) => { const a = from + (to - from) * i / 8; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; }); k.line(pts, w, col); },
      cursor(x, y, col, label, s) {
        k.shape([[x, y], [x, y + 6 * s], [x + 1.6 * s, y + 4.6 * s], [x + 3 * s, y + 7.2 * s], [x + 4 * s, y + 6.6 * s], [x + 2.7 * s, y + 4 * s], [x + 4.6 * s, y + 4 * s]], col);
        if (label) { k.shape(k.rect(x + 4 * s, y + 7 * s, label.length * 1.9 * s + 2 * s, 4.6 * s), col); k.text(label, x + 5 * s, y + 10.6 * s, 3.8 * s, C.ink); }
      }
    };
    return k;
  };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  // Keep the top-right corner clear: the postcard stamp sits there.
  const SCENES = {
    // One customer, the whole journey: a notebook that remembers, then five steps.
    tms(k, W, H, t, U) {
      const q = t % 11, nx = 6 * U, ny = 10 * U, nw = Math.min(W * .5, 74 * U), nh = H - 22 * U;
      k.shape(k.rect(nx, ny, nw, nh), C.paper);
      k.line([[nx + 6 * U, ny], [nx + 6 * U, ny + nh]], U * .5, C.coral);
      for (let i = 1; i < 8; i++) k.line([[nx + 2 * U, ny + 8 * U + i * 8.5 * U], [nx + nw - 2 * U, ny + 8 * U + i * 8.5 * U]], U * .35, C.rule);
      k.text('Maya’s next escape', nx + 9 * U, ny + 11 * U, 6.4 * U);
      ['A quiet room.', 'Breakfast, no rush.', 'Time by the sea.'].forEach((s, i) => {
        const y = ny + 26 * U + i * 10 * U; k.text(s, nx + 15 * U, y, 5 * U);
        if (q > 2 + i * .9) k.tick(nx + 9 * U, y - 2.6 * U, 3.6 * U);
      });
      if (q > 4.8) k.text('remembered from last time', nx + 9 * U, ny + nh - 5 * U, 4.4 * U, C.ultra);
      k.shape([[nx + nw - 12 * U, ny], [nx + nw - 6 * U, ny], [nx + nw - 6 * U, ny + 14 * U], [nx + nw - 9 * U, ny + 11 * U], [nx + nw - 12 * U, ny + 14 * U]], C.coral);
      // The enquiry, pinned beside the notebook.
      const cx = nx + nw + 8 * U, cw = W - cx - 6 * U, cy = H * .3;
      if (q > .4) {
        k.shape(k.rect(cx, cy, cw, 20 * U), C.yellow);
        k.text('“somewhere quiet', cx + 3 * U, cy + 8 * U, 4.8 * U); k.text('by the sea?”', cx + 3 * U, cy + 15 * U, 4.8 * U);
        k.line([[cx + cw / 2, cy - 3 * U], [cx + cw / 2, cy + 2 * U]], U * .9, C.coral);
      }
      // Five steps along the bottom, one lit at a time.
      const steps = ['asks', 'remembers', 'plans', 'approve', 'keeps watch'], s = Math.min(4, Math.floor(q / 2.1)), sy = cy + 32 * U;
      steps.forEach((_, i) => { const x = cx + 3 * U + i * (cw - 6 * U) / 4; k.shape(k.circ(x, sy, 2.2 * U, 2.2 * U, 10), i < s ? C.ultra : i === s ? C.lime : C.paper); if (i < 4) k.line([[x + 2.6 * U, sy], [x + (cw - 6 * U) / 4 - 2.6 * U, sy]], U * .5, C.rule); });
      k.shape(k.rect(cx, sy + 6 * U, cw, 9 * U), C.lime); k.text(`0${s + 1} · ${s === 3 ? 'you approve' : (s === 0 ? 'Maya ' : 'it ') + steps[s]}`, cx + 3 * U, sy + 12.4 * U, 4.6 * U);
    },

    // A shared planning board: brief, stays and things to do, moved by two people.
    canvas(k, W, H, t, U) {
      const q = t % 9, bx = 5 * U, by = 14 * U, bw = W - 10 * U, bh = H - 20 * U;
      k.text('Bali · 10 days · 2 people', bx, 10 * U, 5.4 * U);
      k.shape(k.rect(bx, by, bw, bh), C.paper);
      const cols = ['Brief', 'Stay', 'Do'], cw = bw / 3;
      cols.forEach((c, i) => { k.mono(c.toUpperCase(), bx + i * cw + 3 * U, by + 6 * U, 3.2 * U, '#6b6b6b'); if (i) k.line([[bx + i * cw, by + 2 * U], [bx + i * cw, by + bh - 2 * U]], U * .4, C.rule); });
      const note = (x, y, w, col, a, b) => { k.shape(k.rect(x, y, w, 15 * U), col); k.text(a, x + 2 * U, y + 6.5 * U, 4.4 * U); if (b) k.text(b, x + 2 * U, y + 12.5 * U, 3.9 * U); };
      const nw = cw - 6 * U;
      note(bx + 3 * U, by + 10 * U, nw, C.yellow, 'Ten days.', 'time to slow down');
      note(bx + 3 * U, by + 30 * U, nw, C.lilac, 'Two of us.', 'a little exploring');
      note(bx + cw + 3 * U, by + 10 * U, nw, C.green, 'Ubud', 'gardens, quiet room');
      // Canggu is dragged from Do into Stay by the consultant.
      const drag = clamp((q - 2) / 2.2), sx = bx + 2 * cw + 3 * U, ex = bx + cw + 3 * U, dx = sx + (ex - sx) * (1 - Math.pow(1 - drag, 3)), dy = by + 30 * U + Math.sin(drag * Math.PI) * -6 * U;
      note(dx, dy, nw, C.pink, 'Canggu', 'a few days by the coast');
      note(bx + 2 * cw + 3 * U, by + 10 * U, nw, C.blue, 'Markets', 'then a long lunch');
      if (q > 5) { note(bx + 2 * cw + 3 * U, by + 30 * U + (q > 5.5 ? 0 : 4 * U), nw, C.yellow, 'Leave room', 'an afternoon free'); }
      if (q > 6.2) k.text('check the transfers!', bx + cw + 3 * U, by + bh - 4 * U, 4.2 * U, C.coral);
      k.cursor(dx + nw * .6, dy + 9 * U, C.lime, 'consultant', U);
      const tx = bx + bw * .2 + Math.sin(t * .9) * 8 * U, ty = by + bh * .74 + Math.cos(t * .7) * 3 * U;
      k.cursor(tx, ty, C.coral, 'traveller', U);
    },

    // Everyday questions aloud, in more languages; changes go to a person.
    voice(k, W, H, t, U) {
      const q = t % 9, px = 8 * U, py = 12 * U, pw = 30 * U, ph = H - 24 * U;
      k.shape(k.rect(px, py, pw, ph), C.blue);
      k.shape(k.rect(px + 3 * U, py + 5 * U, pw - 6 * U, ph - 10 * U), C.paper);
      // A small waveform that moves while the traveller speaks.
      for (let i = 0; i < 7; i++) { const x = px + 6 * U + i * 3 * U, a = (q < 3.5 ? 1 : .25) * (2 + Math.abs(Math.sin(t * 6 + i * 1.3)) * 7) * U; k.line([[x, py + ph / 2 - a], [x, py + ph / 2 + a]], U * 1.1, i % 2 ? C.coral : C.ultra); }
      for (let i = 0; i < 3; i++) { const r = (20 + i * 7 + (t * 9) % 7) * U * .7; if (q < 3.5) k.arc(px + pw + 2 * U, py + ph / 2, r, -.6, .6, 1.3); }
      const bx = px + pw + 14 * U, bw = W - bx - 5 * U;
      if (q > .6) { k.shape(k.rect(bx, H * .2, bw, 18 * U), C.yellow); k.text('“Where do I find my', bx + 3 * U, H * .2 + 7.5 * U, 4.6 * U); k.text('baggage allowance?”', bx + 3 * U, H * .2 + 14 * U, 4.6 * U); }
      if (q > 3.6) { k.shape(k.rect(bx, H * .2 + 24 * U, bw, 18 * U), C.paper); k.text('✳ Check the baggage', bx + 3 * U, H * .2 + 31.5 * U, 4.6 * U, C.ultra); k.text('section on your ticket.', bx + 3 * U, H * .2 + 38 * U, 4.6 * U, C.ultra); }
      const langs = ['English', 'Español', 'Français'], on = Math.floor(t / 1.6) % 3;
      langs.forEach((l, i) => { const x = bx + i * (bw / 3); k.shape(k.rect(x, H - 16 * U, bw / 3 - 2 * U, 8 * U), i === on ? C.lime : C.paper); k.text(l, x + 2 * U, H - 10.4 * U, 4.2 * U); });
      if (q > 6) k.text('booking changes → consultant', px, H - 3 * U, 4 * U, C.coral);
    },

    // Learn what makes a trip fit: a brief, three ranked options, a consultant's choice.
    models(k, W, H, t, U) {
      const q = t % 9, bx = 6 * U, by = 12 * U, bw = Math.min(W * .36, 52 * U);
      k.shape(k.rect(bx, by, bw, 30 * U), C.yellow);
      k.text('“A quiet hotel,', bx + 3 * U, by + 9 * U, 4.8 * U); k.text('near a train line.', bx + 3 * U, by + 16 * U, 4.8 * U); k.text('Somewhere to settle.”', bx + 3 * U, by + 23 * U, 4.4 * U);
      k.face(bx + 12 * U, by + 46 * U, 7 * U, C.coral, t);
      k.text('consultant', bx + 22 * U, by + 48 * U, 4.2 * U);
      const ox = bx + bw + 8 * U, ow = W - ox - 5 * U, opts = [['01 · quieter neighbourhood', .92, C.green], ['02 · right in the centre', .62, C.lilac], ['03 · more space, longer walk', .44, C.pink]];
      opts.forEach(([s, v, col], i) => {
        const y = 22 * U + i * 21 * U, grow = clamp((q - .6 - i * .5) / 1.6);
        k.shape(k.rect(ox, y, ow, 17 * U), C.paper);
        k.text(s, ox + 3 * U, y + 7 * U, 4.4 * U);
        k.line([[ox + 3 * U, y + 12 * U], [ox + ow - 3 * U, y + 12 * U]], U * .4, C.rule);
        if (grow > 0) k.shape(k.rect(ox + 3 * U, y + 10.5 * U, (ow - 6 * U) * v * grow, 3 * U), col);
      });
      if (q > 4.2) { k.shape(k.circ(ox + ow - 6 * U, 22 * U + 6 * U, 4.4 * U), C.lime); k.tick(ox + ow - 8.6 * U, 22 * U + 6 * U, 5 * U); }
      if (q > 4.8) k.text('strong match · preferences + location', ox, H - 4 * U, 4.2 * U, C.ultra);
    },

    // One trip, a clear limit: a booking-bound card, three checks and a receipt.
    payments(k, W, H, t, U) {
      const q = t % 9, cx = 7 * U, cy = 16 * U, cw = Math.min(W * .42, 62 * U), ch = cw * .62;
      k.shape(k.rect(cx, cy, cw, ch), C.ultra);
      k.text('A$2,500', cx + 4 * U, cy + 11 * U, 7 * U, '#ffffff'); k.text('approved maximum', cx + 4 * U, cy + 17.5 * U, 4.2 * U, '#dfe3ff');
      k.shape(k.rect(cx + 4 * U, cy + 21 * U, 8 * U, 6 * U), C.yellow);
      k.text('•••• 2048', cx + 4 * U, cy + ch - 4 * U, 5 * U, '#ffffff');
      k.text('one booking', cx + cw - 3 * U, cy + ch - 4 * U, 4 * U, C.lime, 'right');
      const lx = cx + cw + 9 * U, checks = ['traveller approval', 'spend within the terms', 'keep the outcome'];
      checks.forEach((s, i) => { const y = 24 * U + i * 12 * U; k.shape(k.rect(lx, y - 5 * U, 6 * U, 6 * U), q > 1 + i * 1.1 ? C.lime : C.paper); if (q > 1 + i * 1.1) k.tick(lx + 1 * U, y - 2.4 * U, 4 * U); k.text(s, lx + 9 * U, y, 4.6 * U); });
      if (q > 4.6) {
        const rx = lx, ry = H - 24 * U, rw = W - rx - 6 * U;
        k.shape([[rx, ry], [rx + rw, ry], [rx + rw, ry + 17 * U], [rx + rw * .75, ry + 15 * U], [rx + rw * .5, ry + 17 * U], [rx + rw * .25, ry + 15 * U], [rx, ry + 17 * U]], C.paper);
        k.mono('TL–2048', rx + 3 * U, ry + 6 * U, 3.4 * U, '#6b6b6b'); k.text('A$2,140 · approval recorded', rx + 3 * U, ry + 12.5 * U, 4.4 * U, C.ultra);
      }
      if (q > 5.6) k.line([[cx + cw * .6, cy + ch + 2 * U], [cx + cw * .7, H - 12 * U], [lx - 2 * U, H - 14 * U]], U * 1, C.coral);
    },

    // One conversation from voice to messages, with the trip kept in view.
    concierge(k, W, H, t, U) {
      const q = t % 10, fx = 14 * U, fy = H * .42;
      k.face(fx, fy, 8 * U, C.coral, t);
      if (q < 3.2) for (let i = 0; i < 3; i++) k.arc(fx + 9 * U, fy, (6 + i * 4 + (t * 8) % 4) * U, -.7, .7, 1.2, C.ultra);
      k.text('voice', fx - 6 * U, fy + 16 * U, 4.4 * U, C.ultra);
      const ax = fx + 14 * U;
      if (q > 1.4) { k.line([[ax, fy], [ax + 10 * U, fy - U], [ax + 16 * U, fy]], U * 1.2, C.ultra); k.line([[ax + 13 * U, fy - 3 * U], [ax + 16 * U, fy], [ax + 13 * U, fy + 3 * U]], U * 1.2, C.ultra); }
      const px = ax + 20 * U, pw = Math.min(W * .4, 58 * U), py = 12 * U, ph = H - 22 * U;
      k.shape(k.rect(px, py, pw, ph), C.lilac); k.shape(k.rect(px + 3 * U, py + 4 * U, pw - 6 * U, ph - 8 * U), C.paper);
      k.mono('MESSAGES', px + 5 * U, py + 9 * U, 3 * U, '#6b6b6b');
      if (q > 1.8) { k.shape(k.rect(px + 5 * U, py + 13 * U, pw - 12 * U, 15 * U), C.yellow); k.text('“We arrive early.', px + 7 * U, py + 19 * U, 4.2 * U); k.text('Check in before lunch?”', px + 7 * U, py + 25 * U, 4.2 * U); }
      if (q > 3.6) { k.shape(k.rect(px + 9 * U, py + 32 * U, pw - 14 * U, 15 * U), C.paper); k.text('✳ I’ve kept your', px + 11 * U, py + 38 * U, 4.2 * U, C.ultra); k.text('arrival details.', px + 11 * U, py + 44 * U, 4.2 * U, C.ultra); }
      if (q > 5.4) {
        const cx = px + pw + 6 * U, cw = W - cx - 5 * U, cy = H * .48;
        if (cw > 24 * U) {
          k.shape(k.rect(cx, cy, cw, 24 * U), C.lime);
          k.text('for your consultant', cx + 2 * U, cy + 7 * U, 4 * U);
          k.text('early check-in', cx + 2 * U, cy + 13.5 * U, 4.6 * U);
          k.text('context ready ✓', cx + 2 * U, cy + 20 * U, 4.2 * U, C.ultra);
        }
      }
    }
  };

  const mount = (cv, fn) => {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, vis = false, raf = 0, last = 0;
    const t0 = performance.now();
    const size = () => { const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const frame = (now) => {
      raf = 0; if (!vis) return; if (!W) size();
      if (now - last > 190 || REDUCE) {
        last = now;
        const t = REDUCE ? 8.6 : (now - t0) / 1000, U = Math.min(W / 1.6, H) / 100, k = kit(ctx, U);
        ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
        k.reseed(Math.floor(t * 5) % 3); fn(k, W, H, t, U);
      }
      if (!REDUCE) raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }).observe(cv);
    new ResizeObserver(() => { W = 0; if (vis && !raf) raf = requestAnimationFrame(frame); }).observe(cv);
  };
  document.querySelectorAll('canvas[data-next]').forEach((cv) => { const fn = SCENES[cv.dataset.next]; if (fn) mount(cv, fn); });
})();
