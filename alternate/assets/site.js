// Shared header, footer, pixel icons, dithered artwork and small widgets for mcpx.travel.
(() => {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = (n, sym = '$') => sym + Math.round(n).toLocaleString('en-US');

  /* ---------- pixel icons (12 x 12) ---------- */
  const PX = {
    plane: '<path d="M12 2.5c.9 0 1.5.8 1.5 1.8V9l7.5 4.5V16l-7.5-2.3V19l2.2 1.6V22L12 21l-3.7 1v-1.4L10.5 19v-5.3L3 16v-2.5L10.5 9V4.3c0-1 .6-1.8 1.5-1.8z"/>',
    bed: '<path d="M3 18.5V6M3 13.5h18v5M21 13.5V12a3 3 0 0 0-3-3h-7v4.5"/><circle cx="7" cy="10.8" r="1.7"/>',
    car: '<path d="M4.5 16.5V12l2.2-5h10.6l2.2 5v4.5z"/><path d="M4.5 16.5V19h2.5v-2.5M17 16.5V19h2.5v-2.5M4.5 12h15"/><circle cx="8" cy="14.2" r=".9"/><circle cx="16" cy="14.2" r=".9"/>',
    pin: '<path d="M12 21.5s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z"/><circle cx="12" cy="10.5" r="2.3"/>',
    train: '<rect x="5.5" y="3" width="13" height="14" rx="3"/><path d="M5.5 11h13M9 14.2h.01M15 14.2h.01M8 21l1.8-4M16 21l-1.8-4"/>',
    chat: '<path d="M4 4.5h16v11.5H9.5L4 20.5z"/><path d="M8 9h8M8 12.3h5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3.5 6l8.5 7 8.5-7"/>',
    voice: '<path d="M4 10v4M8 6.5v11M12 3.5v17M16 7.5v9M20 10.5v3"/>',
    browser: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 8.5h18M6 6.3h.01M8.5 6.3h.01"/>',
    team: '<circle cx="8.5" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6M15 15.3c.6-.2 1.3-.3 2-.3 2 0 3.7 2.1 3.7 5"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
    term: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15h4.5"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="M2.5 9.5h19M6 15h4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2.1 2.1L15.2 10"/>',
    bolt: '<path d="M13 2.5L4.5 13.5H11L10 21.5l8.5-11H12z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3C9.5 5.6 8.2 8.6 8.2 12s1.3 6.4 3.8 9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>',
    cart: '<path d="M2.5 4h3l2.4 11h10.6l2-8H7"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
    spark: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/>',
    stack: '<path d="M12 3l9 4.5-9 4.5-9-4.5z"/><path d="M3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5C10.5 5 7 4.5 7 6.5S10 8.5 12 8.5zM12 8.5c1.5-3.5 5-4 5-2s-3 2-5 2z"/>',
    chart: '<path d="M4 20h16M7 16.5V12M11 16.5V8M15 16.5v-6M19 16.5V5.5"/>',
    book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/>',
    ship: '<path d="M3 15.5l2 4.5h14l2-4.5z"/><path d="M6 15.5V10h12v5.5M9 10V6.5h6V10M12 3.5v3"/>'
  };
  const pxSVG = (name) => (PX[name] ? `<svg viewBox="0 0 24 24" aria-hidden="true">${PX[name]}</svg>` : '');
  const icon = (n) => `<i class="px" data-px="${n}">${pxSVG(n)}</i>`;
  const paintIcons = (root = document) => $$('[data-px]', root).forEach(el => { if (!el.firstElementChild) el.innerHTML = pxSVG(el.dataset.px); });

  const MARK = `<svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><rect width="7" height="7" fill="#0f1115"/><g fill="#2a3bff"><rect x="1" y="1" width="1" height="1"/><rect x="5" y="1" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="1" y="5" width="1" height="1"/><rect x="5" y="5" width="1" height="1"/></g><rect x="3" y="3" width="1" height="1" fill="#d7ff3c"/></svg>`;

  /* ---------- header + footer ---------- */
  const NX = "";
  const NAV = [[NX + "research.html", "Research Projects", "spark", "Frameworks, Leisure AI and what’s next"], [NX + "papers.html", "Papers", "book", "Ideas, made inspectable"], [NX + "about.html", "About us", "team", "Curious minds. Shared purpose."], [NX + "manifesto.html", "Manifesto", "stack", "The principles that guide us"]];
  const page = document.body.dataset.page || "";
  const identityStyle=document.createElement('style');identityStyle.textContent=`.tl-animated-logo{display:block;height:26px;width:auto;max-width:none;overflow:visible}.f-brand .tl-animated-logo{height:30px}.f-logos .tl-animated-logo{height:34px}.tl-logo-spin{transform-origin:24px 24px;animation:tl-identity-turn 28s linear infinite}@keyframes tl-identity-turn{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.tl-logo-spin{animation:none}}`;document.head.append(identityStyle);
  const LOGO = `<a class="logo tl-logo" href="index.html" aria-label="TravelLabs home"><svg class="tl-animated-logo" viewBox="0 0 301 66" role="img" aria-label="TravelLabs" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 0) scale(1.375)"><g class="tl-logo-spin" fill="#292d2d"><path d="M21 3h9l-5 15h-4Z" transform="rotate(0 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(45 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(90 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(135 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(180 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(225 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(270 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(315 24 24)"/></g><rect x="20" y="20" width="8" height="8" fill="#3034f2"/></g><svg x="82" y="0" width="219" height="66" viewBox="82 0 219 66" overflow="hidden"><image href="assets/img/travellabs.png" x="0" y="0" width="301" height="66"/></svg></svg></a>`;
  const header = `
    <header class="site-h" id="siteH">
      <div class="endorse"><div class="wrap"><span class="e-txt">TravelLabs is the R&amp;D division of</span><img class="e-fctg" src="assets/img/fctg.png" alt="Flight Centre Travel Group" width="324" height="52"><span class="e-tag">An AI Lab for the world of Travel</span></div></div>
      <div class="wrap nav-row">
      ${LOGO}
      <nav class="menu" aria-label="Main">${NAV.map(([h, t]) => `<a class="mi${h.replace(".html", "") === page ? " on" : ""}" href="${h}">${t}</a>`).join("")}</nav>
      <div class="h-cta"><a class="btn sec" href="index.html#inside">Explore the lab</a><a class="btn pri" href="${NX}contact.html">Get in touch</a><button class="burger" aria-label="Menu" id="burger"><i></i></button></div>
    </div></header>
    <nav class="mnav" aria-label="Mobile">
      <h6>Inside TravelLabs</h6>${NAV.map(([h, t, i]) => `<a href="${h}">${icon(i)}${t}</a>`).join("")}
      <div class="btns"><a class="btn pri" href="${NX}contact.html">Get in touch</a><a class="btn" href="index.html#inside">Explore the lab</a></div>
    </nav>`;
  const footer = `
    <footer class="site-f"><div class="wrap">
      <div class="f-group">
        <p><b>TravelLabs is the research and development division of Flight Centre Travel Group.</b> An AI Lab for the world of Travel.</p>
        <div class="f-logos"><img src="assets/img/fctg.png" alt="Flight Centre Travel Group" width="324" height="52"><i class="e-sep" aria-hidden="true"></i><svg class="tl-animated-logo" viewBox="0 0 301 66" role="img" aria-label="TravelLabs" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 0) scale(1.375)"><g class="tl-logo-spin" fill="#292d2d"><path d="M21 3h9l-5 15h-4Z" transform="rotate(0 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(45 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(90 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(135 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(180 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(225 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(270 24 24)"/><path d="M21 3h9l-5 15h-4Z" transform="rotate(315 24 24)"/></g><rect x="20" y="20" width="8" height="8" fill="#3034f2"/></g><svg x="82" y="0" width="219" height="66" viewBox="82 0 219 66" overflow="hidden"><image href="assets/img/travellabs.png" x="0" y="0" width="301" height="66"/></svg></svg></div>
      </div>
      <div class="f-top">
        <div class="f-brand">${LOGO}<p>An AI Lab. Solving the hardest problems in travel with frontier AI.</p><a class="link" href="${NX}contact.html">Start a conversation →</a></div>
        <div><h6>Research Projects</h6><ul><li><a href="${NX}research.html#frameworks">Frameworks</a></li><li><a href="${NX}research.html#built">Leisure AI</a></li><li><a href="${NX}research.html#next">What’s next</a></li></ul></div>
        <div><h6>Papers</h6><ul><li><a href="${NX}paper-atfgraph.html">ATFGraph</a></li><li><a href="${NX}paper-keel.html">Keel</a></li><li><a href="${NX}paper-atp.html">ATP</a></li><li><a href="${NX}papers.html">All papers</a></li></ul></div>
        <div><h6>About us</h6><ul><li><a href="${NX}about.html">About us</a></li><li><a href="${NX}manifesto.html">Manifesto</a></li><li><a href="${NX}careers.html">Careers</a></li></ul></div>
        <div><h6>Get in touch</h6><ul><li><a href="${NX}contact.html">Contact</a></li><li><a href="#top">Back to top</a></li></ul><h6 style="margin-top:28px">Legal</h6><ul><li><a href="terms-of-use.html">Terms of Use</a></li><li><a href="privacy-policy.html">Privacy Policy</a></li></ul></div>
      </div>
      <div class="f-bot"><span>© 2026 Flight Centre Travel Group. TravelLabs, an AI Lab for the world of Travel.</span><nav><a href="#top">Back to top</a></nav></div>
    </div></footer>`;
  const hSlot = $('[data-header]'), fSlot = $('[data-footer]');
  if (hSlot) hSlot.outerHTML = header;
  if (fSlot) fSlot.outerHTML = footer;
  const burger = $('#burger');
  burger?.addEventListener('click', () => document.body.classList.toggle('open'));
  $$('.mnav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('open')));
  const siteH = $('#siteH');
  addEventListener('scroll', () => siteH?.classList.toggle('scrolled', scrollY > 10), { passive: true });
  paintIcons();

  /* ---------- reveal ---------- */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: .12 });
  $$('[data-in]').forEach(el => rio.observe(el));

  /* ---------- counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, suf = el.dataset.suffix || '', pre = el.dataset.prefix || '';
    const fmt = (v) => pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US')) + suf;
    if (REDUCE) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const tick = (t) => { const k = Math.min(1, (t - t0) / 1400); el.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .4 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- painted artwork ---------- */
  // Impressionist travel scenes. Each scene is a colour field; the canvas is
  // painted with thousands of short brush strokes sampled from it, revealed
  // on first view. Water, sky and lights keep shimmering by repainting a few
  // strokes each frame with a time-shifted colour.
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

  /* sketch and scribble: wobbly ink lines, offset flat fills, boiling at 5fps */
  const SKC = { ink: '#2b2a2e', paper: '#fbf7ee', blue: '#5b7be0', coral: '#ef7a62', yellow: '#f5c451', green: '#69a883', pink: '#f3a9c6', lilac: '#b9a8ea', ultra: '#2a3bff', lime: '#d7ff3c' };
  const sketchKit = (ctx, U) => {
    let seed = 1;
    const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const j = (v, amt) => v + (r() - .5) * 2 * amt;
    const api = {
      reseed(n) { seed = 1000 + n * 7919; },
      line(pts, w = 1.7, col = SKC.ink) { ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; for (let p = 0; p < 2; p++) { ctx.lineWidth = p ? w * .6 : w; ctx.globalAlpha = p ? .35 : .92; ctx.beginPath(); pts.forEach(([x, y], i) => { const X = j(x, U * .5), Y = j(y, U * .5); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); } ctx.globalAlpha = 1; },
      fill(pts, col, off = U * 1.4) { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + off, y + off * .8) : ctx.moveTo(x + off, y + off * .8))); ctx.closePath(); ctx.fill(); },
      hatch(pts, col, gap = U * 2.2) { ctx.save(); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip(); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), mx = Math.min(...xs), Mx = Math.max(...xs), my = Math.min(...ys), My = Math.max(...ys); ctx.strokeStyle = col; ctx.lineWidth = U * .7; ctx.beginPath(); for (let x = mx - (My - my); x < Mx; x += gap) { ctx.moveTo(j(x, U * .3), My); ctx.lineTo(j(x + (My - my), U * .3), my); } ctx.stroke(); ctx.restore(); },
      shape(pts, col, hatchCol) { if (col) api.fill(pts, col); if (hatchCol) api.hatch(pts, hatchCol); api.line([...pts, pts[0]]); },
      circ(cx, cy, rx, ry = rx, n = 22) { return Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }); },
      rect(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; },
      text(s, x, y, size, col = SKC.ink, align = 'left') { ctx.font = `600 ${size}px Caveat, "Comic Sans MS", cursive`; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); },
      face(cx, cy, rad, col, t) { api.shape(api.circ(cx, cy, rad), col); const blink = (t % 4) < .12; ctx.fillStyle = SKC.ink; if (blink) { api.line([[cx - rad * .45, cy - rad * .1], [cx - rad * .2, cy - rad * .1]], U * .8); api.line([[cx + rad * .2, cy - rad * .1], [cx + rad * .45, cy - rad * .1]], U * .8); } else { ctx.beginPath(); ctx.arc(cx - rad * .32, cy - rad * .1, U * .9, 0, 7); ctx.arc(cx + rad * .32, cy - rad * .1, U * .9, 0, 7); ctx.fill(); } api.line([[cx - rad * .35, cy + rad * .3], [cx, cy + rad * .45], [cx + rad * .35, cy + rad * .3]], U * .9); },
      plane(x, y, s, ang = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); api.shape([[-s, 0], [s * .9, -s * .12], [s, 0], [s * .9, s * .12]], SKC.paper); api.line([[-s * .1, 0], [-s * .4, -s * .6]]); api.line([[-s * .1, 0], [-s * .4, s * .6]]); api.line([[-s * .85, 0], [-s, -s * .3]]); ctx.restore(); }
    };
    return api;
  };
  const SKETCH = {
    'sk-chat'(k, W, H, t, U) {
      const pw = 34 * U, ph = 64 * U, px = W / 2 - pw / 2 - 6 * U, py = H / 2 - ph / 2 + 4 * U;
      k.shape(k.rect(px, py, pw, ph), SKC.blue); k.shape(k.rect(px + 3 * U, py + 6 * U, pw - 6 * U, ph - 12 * U), SKC.paper);
      const q = t % 7;
      if (q > .5) { k.shape(k.rect(px + 5 * U, py + 10 * U, 22 * U, 9 * U), null, SKC.lilac); k.text('somewhere warm?', px + 6 * U, py + 16.5 * U, 4.6 * U); }
      if (q > 2) { k.shape(k.rect(px + 9 * U, py + 23 * U, 21 * U, 9 * U), SKC.yellow); k.text('Fiji · $2,380', px + 10 * U, py + 29.5 * U, 4.6 * U); }
      if (q > 3.6) { k.shape(k.rect(px + 5 * U, py + 36 * U, 22 * U, 15 * U), null, SKC.green); k.shape(k.circ(px + 21 * U, py + 41 * U, 3 * U), SKC.coral); k.line([[px + 10 * U, py + 49 * U], [px + 12 * U, py + 41 * U]]); k.line([[px + 12 * U, py + 41 * U], [px + 8 * U, py + 39 * U]]); k.line([[px + 12 * U, py + 41 * U], [px + 16 * U, py + 39 * U]]); }
      if (q > 5) { k.shape(k.rect(px + 12 * U, py + 53 * U, 18 * U, 6 * U), SKC.lime); k.text('held ✓', px + 14 * U, py + 57.6 * U, 4.4 * U); }
      const a = t * .9, ox = W / 2 + Math.cos(a) * 32 * U, oy = H / 2 + Math.sin(a) * 26 * U;
      k.plane(ox, oy, 6 * U, a + Math.PI / 2);
      k.line([[W * .82, H * .2], [W * .86, H * .2]]); k.line([[W * .84, H * .17], [W * .84, H * .23]]);
    },
    'sk-team'(k, W, H, t, U) {
      const lx = W / 2 - 30 * U, ly = H * .32;
      k.shape(k.rect(lx, ly, 60 * U, 36 * U), SKC.paper, null); k.shape(k.rect(lx + 3 * U, ly + 3 * U, 54 * U, 30 * U), null, SKC.lilac);
      k.shape([[lx - 8 * U, ly + 36 * U], [lx + 68 * U, ly + 36 * U], [lx + 74 * U, ly + 42 * U], [lx - 14 * U, ly + 42 * U]], SKC.blue);
      k.shape(k.rect(lx + 7 * U, ly + 7 * U, 34 * U, 8 * U), SKC.paper); k.text('team trip to Lisbon?', lx + 8 * U, ly + 13 * U, 4.4 * U);
      const votes = Math.min(3, Math.floor((t % 6) / 1.2));
      for (let i = 0; i < votes; i++) k.text('✓', lx + 10 * U + i * 7 * U, ly + 25 * U, 7 * U, SKC.ultra);
      [[lx - 14 * U, ly + 18 * U, SKC.coral], [lx + 74 * U, ly + 14 * U, SKC.yellow], [lx + 66 * U, ly + 58 * U, SKC.green]].forEach(([x, y, col], i) => k.face(x, y + Math.sin(t * 2 + i) * U, 8 * U, col, t + i));
      if ((t % 6) > 4) { const hx = W / 2, hy = H * .2 - ((t % 6) - 4) * 4 * U; k.shape([[hx, hy + 4 * U], [hx - 5 * U, hy - U], [hx - 2.5 * U, hy - 4 * U], [hx, hy - 1.5 * U], [hx + 2.5 * U, hy - 4 * U], [hx + 5 * U, hy - U]], SKC.pink); }
    },
    'sk-voice'(k, W, H, t, U) {
      const cx = W * .4, cy = H * .55;
      k.shape([[cx - 18 * U, cy + 10 * U], [cx - 22 * U, cy - 4 * U], [cx - 12 * U, cy - 10 * U], [cx - 6 * U, cy], [cx + 6 * U, cy], [cx + 12 * U, cy - 10 * U], [cx + 22 * U, cy - 4 * U], [cx + 18 * U, cy + 10 * U]], SKC.coral);
      for (let i = 0; i < 3; i++) { const r = (12 + i * 8 + (t * 10) % 8) * U, al = 1 - ((t * 10) % 8) / 8; ctx_arc(k, cx + 6 * U, cy - 14 * U, r, al); }
      const ck = W * .76, cky = H * .36; k.shape(k.circ(ck, cky, 11 * U), SKC.paper); const ha = t * .8; k.line([[ck, cky], [ck + Math.cos(ha) * 8 * U, cky + Math.sin(ha) * 8 * U]]); k.line([[ck, cky], [ck, cky - 5 * U]]);
      k.shape(k.rect(W * .1, H * .14, 46 * U, 9 * U), SKC.yellow); k.text('"move my flight to 7am"', W * .1 + 2 * U, H * .14 + 6.3 * U, 4.6 * U);
    },
    'sk-app'(k, W, H, t, U) {
      const bx = W * .12, by = H * .16, bw = W * .76, bh = H * .7;
      k.shape(k.rect(bx, by, bw, bh), SKC.paper); k.line([[bx, by + 7 * U], [bx + bw, by + 7 * U]]); [3, 7, 11].forEach(d => k.shape(k.circ(bx + d * U + 1 * U, by + 3.5 * U, 1.3 * U, 1.3 * U, 8), SKC.pink));
      const coast = Array.from({ length: 14 }, (_, i) => [bx + 6 * U + i * (bw - 12 * U) / 13, by + bh * .55 + Math.sin(i * 1.3) * 5 * U]);
      k.line(coast); k.hatch([...coast, [bx + bw - 6 * U, by + bh - 4 * U], [bx + 6 * U, by + bh - 4 * U]], SKC.blue, 3 * U);
      const A = [bx + bw * .2, by + bh * .32], B = [bx + bw * .78, by + bh * .4];
      [A, B].forEach(([x, y], i) => { k.shape(k.circ(x, y, 3 * U), i ? SKC.coral : SKC.green); });
      const q = (t % 5) / 5, x = A[0] + (B[0] - A[0]) * q, y = A[1] + (B[1] - A[1]) * q - Math.sin(q * Math.PI) * 14 * U;
      for (let i = 0; i < 20; i++) { const p = i / 20; if (p > q) break; const px = A[0] + (B[0] - A[0]) * p, py = A[1] + (B[1] - A[1]) * p - Math.sin(p * Math.PI) * 14 * U; k.line([[px, py], [px + U, py]], U * .9); }
      k.plane(x, y, 5 * U, Math.atan2(-Math.cos(q * Math.PI) * 14 * U * Math.PI, B[0] - A[0]));
      if (q > .85) { k.shape(k.rect(B[0] - 12 * U, B[1] + 6 * U, 24 * U, 8 * U), SKC.lime); k.text('booked ✓', B[0] - 10 * U, B[1] + 11.8 * U, 4.6 * U); }
    },
    'sk-flyer'(k, W, H, t, U) {
      const fx = W * .1, fy = H * .14, fw = W * .44, fh = H * .7;
      k.shape(k.rect(fx, fy, fw, fh), SKC.paper); for (let i = 0; i < 7; i++) k.line([[fx + 2 * U, fy + 14 * U + i * 7 * U], [fx + fw - 2 * U, fy + 14 * U + i * 7 * U]], U * .4, '#c9c2b2');
      k.text('Harbour morning walk', fx + 4 * U, fy + 11 * U, 6 * U); k.text('Sat 9:00 · small group', fx + 4 * U, fy + 25 * U, 4.6 * U); k.text('$45 pp · guide incl.', fx + 4 * U, fy + 32 * U, 4.6 * U); k.text('call Mia to book!', fx + 4 * U, fy + 46 * U, 4.6 * U, SKC.coral);
      k.line([[fx + fw - 10 * U, fy - 4 * U], [fx + fw - 10 * U, fy + 10 * U], [fx + fw - 6 * U, fy + 10 * U], [fx + fw - 6 * U, fy - 2 * U]], U * 1.1, '#8a8a8a');
      const q = t % 7, ax = fx + fw + 4 * U, ay = H * .45;
      if (q > 1) k.line([[ax, ay], [ax + 14 * U, ay - 2 * U], [ax + 22 * U, ay]], U * 1.4, SKC.ultra);
      if (q > 1) k.line([[ax + 18 * U, ay - 4 * U], [ax + 22 * U, ay], [ax + 18 * U, ay + 4 * U]], U * 1.4, SKC.ultra);
      const steps = [['read', SKC.lilac], ['ask', SKC.yellow], ['confirm', SKC.lime]];
      steps.forEach(([s, col], i) => { if (q > 2 + i * 1.3) { const sy = H * .22 + i * 13 * U; k.shape(k.rect(ax + 26 * U, sy, 30 * U, 9 * U), col); k.text((i + 1) + ' · ' + s + ' ✓', ax + 28 * U, sy + 6.4 * U, 4.6 * U); } });
    }
  };
  function ctx_arc(k, x, y, r, al) { const pts = Array.from({ length: 9 }, (_, i) => { const a = -.9 + i / 8 * 1.8; return [x + Math.cos(a - Math.PI / 2) * r, y + Math.sin(a - Math.PI / 2) * r]; }); if (al > .05) k.line(pts, 1.4); }
  function mountSketch(cv, fn) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, vis = false, raf = 0, last = 0;
    const t0 = performance.now();
    const size = () => { const r = cv.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const frame = (now) => {
      raf = 0; if (!vis) return; if (!W) size();
      if (now - last > 190 || REDUCE) {
        last = now; const t = REDUCE ? 6.5 : (now - t0) / 1000, U = Math.min(W, H) / 100, k = sketchKit(ctx, U);
        ctx.fillStyle = SKC.paper; ctx.fillRect(0, 0, W, H);
        k.reseed(Math.floor(t * 5) % 3); fn(k, W, H, t, U);
      }
      if (!REDUCE) raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }).observe(cv);
    new ResizeObserver(() => { W = 0; }).observe(cv);
  }

  /* thin-line technical diagrams for feature cards */
  const INK = '#22252b', MID = '#a19d92', GRID = '#ebe6db', ULTRA = '#2a3bff', LIME = '#d7ff3c';
  const mono = (ctx, s, x, y, col, size = 10, align = 'left') => { ctx.font = `500 ${size}px "Geist Mono", ui-monospace, monospace`; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); };
  const TECH = {
    scan(ctx, W, H, t, labels) {
      const n = 4, gap = 10, cw = Math.min(70, (W - 40 - gap * 3) / n), ch = Math.min(H - 50, cw * 1.15), x0 = (W - (cw * n + gap * 3)) / 2, y0 = (H - ch) / 2 + 6;
      const q = (t % 6.4) / 6.4, scan = q * 4.6 - .3;
      mono(ctx, 'SEARCH · LIVE', 14, 20, MID, 9);
      labels.forEach((lab, i) => {
        const x = x0 + i * (cw + gap), done = scan > i + 1, active = Math.floor(scan) === i;
        ctx.fillStyle = '#fff'; ctx.fillRect(x, y0, cw, ch); ctx.strokeStyle = done ? ULTRA : INK; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y0 + .5, cw - 1, ch - 1);
        if (done) { ctx.fillStyle = ULTRA; ctx.fillRect(x, y0, cw, 4); }
        ctx.strokeStyle = MID; [12, 20, 28].forEach((dy, k) => { ctx.beginPath(); ctx.moveTo(x + 8, y0 + dy); ctx.lineTo(x + cw - 8 - k * 8, y0 + dy); ctx.stroke(); });
        mono(ctx, done ? '✓ ' + lab : lab, x + 8, y0 + ch - 9, done ? ULTRA : INK, 9);
        if (active) { const mx = x + cw * (scan - i), my = y0 + ch * .45, r = cw * .26; ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(mx, my, r, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(mx + r * .7, my + r * .7); ctx.lineTo(mx + r * 1.4, my + r * 1.4); ctx.stroke(); ctx.lineWidth = 1; }
      });
    },
    hold(ctx, W, H, t) {
      const y = H * .62, x0 = 22, x1 = W - 22, gx = W * .55, q = (t % 6.4) / 6.4, open = q > .66;
      mono(ctx, 'HOLD → COMMIT', 14, 20, MID, 9);
      ctx.setLineDash([2, 4]); ctx.strokeStyle = MID; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(x0, y, 5, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(x1, y, 5, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx, y - 16); ctx.lineTo(gx, y + 10); ctx.moveTo(gx + 22, y - 16); ctx.lineTo(gx + 22, y + 10); ctx.stroke();
      if (!open) { ctx.strokeStyle = ULTRA; ctx.beginPath(); ctx.moveTo(gx, y - 6); ctx.lineTo(gx + 22, y - 6); ctx.stroke(); }
      let px; if (q < .3) px = x0 + (gx - 8 - x0) * (q / .3); else if (q < .66) px = gx - 8; else if (q < .97) px = gx - 8 + (x1 - gx + 8) * ((q - .66) / .31); else px = x1;
      if (q > .3 && q < .66) { const r = 8 + ((t * 30) % 12); ctx.strokeStyle = `rgba(42,59,255,${1 - (r - 8) / 12})`; ctx.beginPath(); ctx.arc(px, y, r, 0, 7); ctx.stroke(); }
      ctx.fillStyle = ULTRA; ctx.beginPath(); ctx.arc(px, y, 4.5, 0, 7); ctx.fill();
      if (q > .3 && q < .66) mono(ctx, 'HELD · 18:40', gx + 11, y - 26, ULTRA, 10, 'center');
      if (q >= .97 || q > .9) { ctx.fillStyle = LIME; ctx.fillRect(x1 - 58, y - 34, 58, 18); ctx.strokeStyle = INK; ctx.strokeRect(x1 - 57.5, y - 33.5, 57, 17); mono(ctx, 'BOOKED', x1 - 29, y - 21, INK, 9, 'center'); }
    },
    trace(ctx, W, H, t) {
      const x0 = 30, x1 = W - 20, y0 = 34, y1 = H - 24, q = Math.min(1, (t % 5.6) / 4.4);
      mono(ctx, 'LOOK AFTER · PRICE', 14, 20, MID, 9);
      ctx.strokeStyle = GRID; for (let x = x0; x <= x1; x += 24) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
      ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      const py = y0 + (y1 - y0) * .25; ctx.setLineDash([4, 4]); ctx.strokeStyle = MID; ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x1, py); ctx.stroke(); ctx.setLineDash([]); mono(ctx, 'you paid', x0 + 4, py - 5, MID, 9);
      const N = 40, pts = Array.from({ length: N }, (_, i) => [x0 + (x1 - x0) * i / (N - 1), py + (y1 - y0) * (.05 + .45 * (i / N) ** 1.4 + .08 * Math.sin(i * 1.3) * (1 - i / N))]);
      const n = Math.max(2, Math.floor(q * N));
      ctx.strokeStyle = ULTRA; ctx.lineWidth = 1.5; ctx.beginPath(); pts.slice(0, n).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.lineWidth = 1;
      const [ex, ey] = pts[n - 1]; ctx.fillStyle = ULTRA; ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, 7); ctx.fill();
      if (q >= 1) { ctx.fillStyle = LIME; ctx.fillRect(ex - 56, ey - 30, 50, 18); ctx.strokeStyle = INK; ctx.strokeRect(ex - 55.5, ey - 29.5, 49, 17); mono(ctx, '−$120', ex - 31, ey - 17, INK, 10, 'center'); }
    },
    fanout(ctx, W, H, t) {
      const ox = 26, oy = H / 2 + 8, x1 = W - 26, cyc = Math.floor(t / 4.2), q = (t % 4.2) / 4.2, n = 4; let done = 0;
      for (let i = 0; i < n; i++) {
        const y = 40 + (H - 60) * i / (n - 1), k = Math.min(1, q / (.4 + h2(cyc, i) * .45)); if (k >= 1) done++;
        ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.bezierCurveTo(ox + 40, oy, ox + 30, y, ox + 70, y); ctx.lineTo(x1, y); ctx.stroke();
        ctx.strokeStyle = ULTRA; ctx.beginPath(); ctx.moveTo(ox + 70, y); ctx.lineTo(ox + 70 + (x1 - ox - 70) * k, y); ctx.stroke();
        ctx.strokeStyle = k >= 1 ? ULTRA : INK; ctx.beginPath(); ctx.arc(x1, y, 5, 0, 7); ctx.stroke(); if (k >= 1) { ctx.fillStyle = ULTRA; ctx.fill(); }
      }
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ox, oy, 5, 0, 7); ctx.fill();
      mono(ctx, done === n ? 'ALL BACK · 1.2s' : 'SEARCHING ' + done + '/' + n, 14, 20, done === n ? ULTRA : MID, 9);
    }
  };

  function mountPaint(cv, sc) {
    const ctx = cv.getContext('2d'), gouache = cv.dataset.style === 'gouache';
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
      if (REDUCE) { strokes.forEach(s => draw(s, s.c)); shown = strokes.length; }
    };
    const loop = (now) => {
      raf = 0; if (!vis) return;
      if (!built) build();
      const t = (now - t0) / 1000;
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

  function mountTech(cv, fn) {
    const ctx = cv.getContext('2d'), labels = (cv.dataset.labels || 'FLT,HTL,TUR,EAT').split(',');
    let W = 0, H = 0, vis = false, raf = 0;
    const t0 = performance.now();
    const size = () => { const r = cv.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const frame = (now) => {
      raf = 0; if (!vis) return; if (!W) size();
      ctx.fillStyle = '#f7f4ee'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = GRID; ctx.lineWidth = 1; for (let x = .5; x < W; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = .5; y < H; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      fn(ctx, W, H, REDUCE ? 5 : (now - t0) / 1000, labels);
      if (!REDUCE) raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); }).observe(cv);
    new ResizeObserver(() => { W = 0; }).observe(cv);
  }

  function mountArt(cv) {
    const name = cv.dataset.art;
    if (TECH[name]) return mountTech(cv, TECH[name]);
    if (SKETCH[name]) return mountSketch(cv, SKETCH[name]);
    mountPaint(cv, SCENES[name] || SCENES.coast);
  }
  const mountAll = (root = document) => $$('canvas.art:not([data-m])', root).forEach(cv => { cv.dataset.m = 1; mountArt(cv); });
  mountAll();

  /* ---------- tiny helpers shared by pages ---------- */
  window.MX = { $, $$, REDUCE, money, icon, pxSVG, paintIcons, mountAll };

  /* ---------- earnings panel: smart markup inside your limits ---------- */
  // Each example: what the supplier charges, what the market charges, and the
  // markup the rules end up using. Lowest 11%, highest 30%, aim 3% under market.
  window.MX.earnings = (root) => {
    const LOW = .11, HIGH = .30, GAP = .03, SCALE = .4;
    const EX = [
      { tab: 'Hotel · 4 nights', what: 'Alfama guesthouse, Lisbon', net: 345.60, market: 410.39 },
      { tab: 'Flight · SYD → NAN', what: 'Return, 1 adult, bag included', net: 512.00, market: 551.20 },
      { tab: 'Tour · sunrise balloon', what: 'Cappadocia, 2 people', net: 140.00, market: 236.00 }
    ];
    const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    root.innerHTML = `
      <div class="earn-h"><span>Smart markup</span><button type="button" class="sw on" aria-pressed="true" aria-label="Smart markup on or off"><i></i></button><b class="sw-l">On</b><span class="dot">example only</span></div>
      <div class="earn-tabs">${EX.map((e, i) => `<button type="button"${i ? '' : ' class="on"'}>${e.tab}</button>`).join('')}</div>
      <dl class="earn-lim"><div><dt>Lowest markup</dt><dd>11%</dd></div><div><dt>Aim under market</dt><dd>−3%</dd></div><div><dt>Highest markup</dt><dd>30%</dd></div></dl>
      <div class="earn-track"><div class="band" style="left:${LOW / SCALE * 100}%;width:${(HIGH - LOW) / SCALE * 100}%"></div><span class="tk" style="left:${LOW / SCALE * 100}%">11%</span><span class="tk" style="left:${HIGH / SCALE * 100}%">30%</span><span class="mk"><b>+0%</b></span></div>
      <p class="earn-note"></p>
      <div class="earn-lad">
        <div class="r"><span>Supplier cost</span><i><s class="net"></s></i><b class="v-net"></b></div>
        <div class="r mkt"><span>Market price</span><i><s class="mkt"></s></i><b class="v-mkt"></b></div>
        <div class="r you"><span>Your price</span><i><s class="you"></s></i><b class="v-you"></b></div>
      </div>
      <div class="earn-out"><span><em class="what"></em>You keep</span><b class="v-earn">+$0.00</b></div>`;
    const $r = (s) => root.querySelector(s);
    const tabs = [...root.querySelectorAll('.earn-tabs button')], sw = $r('.sw');
    let cur = 0, on = true, timer = 0;
    const show = (i) => {
      cur = i; tabs.forEach((b, j) => b.classList.toggle('on', j === i));
      const e = EX[i], target = e.market * (1 - GAP);
      let mk = target / e.net - 1, note;
      if (!on) { mk = 0; note = 'Smart markup off. You still earn the standard commission.'; }
      else if (mk < LOW) { mk = LOW; note = 'Lowest markup kept, so this sale still pays. It lands a little over market.'; }
      else if (mk > HIGH) { mk = HIGH; note = 'Highest markup reached. The traveller still pays well under market.'; }
      else note = 'Inside your limits, 3% under the market price.';
      const price = e.net * (1 + mk), earn = price - e.net, top = Math.max(e.market, price) * 1.06;
      $r('.mk').style.left = Math.min(100, mk / SCALE * 100) + '%'; $r('.mk b').textContent = '+' + (mk * 100).toFixed(1) + '%';
      root.classList.toggle('clamp', on && (mk === LOW || mk === HIGH));
      $r('.earn-note').textContent = note;
      $r('s.net').style.width = (e.net / top * 100) + '%'; $r('s.mkt').style.width = (e.market / top * 100) + '%'; $r('s.you').style.width = (price / top * 100) + '%';
      $r('.v-net').textContent = fmt(e.net); $r('.v-mkt').textContent = fmt(e.market); $r('.v-you').textContent = fmt(price);
      $r('.what').textContent = e.what;
      const el = $r('.v-earn'), from = parseFloat(el.dataset.v || '0'), t0 = performance.now(); el.dataset.v = earn;
      const tick = (t) => { const k = Math.min(1, (t - t0) / 700), v = from + (earn - from) * (1 - Math.pow(1 - k, 3)); el.textContent = '+' + fmt(v); if (k < 1) requestAnimationFrame(tick); };
      REDUCE ? (el.textContent = '+' + fmt(earn)) : requestAnimationFrame(tick);
    };
    const auto = () => { clearInterval(timer); if (!REDUCE) timer = setInterval(() => show((cur + 1) % EX.length), 4200); };
    tabs.forEach((b, i) => b.addEventListener('click', () => { show(i); auto(); }));
    sw.addEventListener('click', () => { on = !on; sw.classList.toggle('on', on); sw.setAttribute('aria-pressed', on); $r('.sw-l').textContent = on ? 'On' : 'Off'; show(cur); auto(); });
    let started = false;
    new IntersectionObserver(([en]) => { if (en.isIntersecting && !started) { started = true; show(0); auto(); } }, { threshold: .3 }).observe(root);
  };
  $$('[data-earn]').forEach(el => window.MX.earnings(el));

  /* ---------- departures board (product pages) ---------- */
  window.MX.board = (root, items, regions, unit) => {
    const input = $('input', root), grid = $('.dep-g', root), cnt = $('.dep-n', root), fl = $('.dep-f', root);
    let region = 'All';
    const esc = (t) => String(t).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
    fl.innerHTML = ['All', ...regions].map(r => `<button type="button" class="${r === 'All' ? 'on' : ''}">${r}</button>`).join('');
    $$('button', fl).forEach(b => b.addEventListener('click', () => { region = b.textContent; $$('button', fl).forEach(x => x.classList.toggle('on', x === b)); render(); }));
    const render = () => {
      const q = input.value.trim().toLowerCase();
      const rows = items.filter(it => (region === 'All' || it.r === region) && (!q || [it.code, it.place, it.sub, it.col3].join(' ').toLowerCase().includes(q)));
      cnt.textContent = `${rows.length} ${unit} shown`;
      grid.innerHTML = rows.length
        ? rows.map((it, i) => `<div class="dep-r${i < 14 ? ' flip' : ''}" style="animation-delay:${i * 40}ms"><span class="c">${esc(it.code)}</span><span>${esc(it.place)}${it.sub ? `<div class="m">${esc(it.sub)}</div>` : ''}</span><span class="m">${esc(it.col3)}</span><span class="m">${esc(it.r)}</span><span class="s">LIVE</span></div>`).join('')
        : `<div class="dep-n">No match yet. Ask us about coverage for "${esc(input.value)}".</div>`;
    };
    input.addEventListener('input', render);
    render();
    // Every so often one row re-flips, like a real departures board.
    if (!REDUCE) setInterval(() => { const r = $$('.dep-r', grid); if (!r.length) return; const el = r[Math.floor(Math.random() * Math.min(r.length, 12))]; el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip'); }, 1400);
  };
})();
