/* Hero carousel: four scenes play one after another, side by side.
   01 painted coast (with cycling cards) · 02 painted by agents · 03 departures board · 04 one brief in particles */
(() => {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = document.getElementById('hc'), track = document.getElementById('hcTrack');
  if (!frame || !track) return;
  const slides = [...track.children], tabs = [...document.querySelectorAll('.hc-rail [role="tab"]')];
  const pauseBtn = document.querySelector('.hc-pause');
  // How long each scene gets before the next one slides in.
  const DUR = [13500, 15000, 12000, 16000];
  const RESTART = [() => coast.start(), () => window.HERO_REPLAY?.a?.(), () => window.HERO_REPLAY?.b?.(), () => window.HERO_REPLAY?.c?.()];
  let active = 0, elapsed = 0, last = 0, paused = REDUCE, held = false, visible = false, raf = 0, programmatic = 0;

  /* ---- 01 · the coast's cycling cards: ticket → destination → live run ---- */
  const coast = (() => {
    const cards = [...document.querySelectorAll('#hcCards .hc-card')];
    const T = document.getElementById('hcT'), L1 = document.getElementById('hc1'), L2 = document.getElementById('hc2'), L3 = document.getElementById('hc3');
    const runCard = cards.find((c) => c.dataset.card === 'run'), list = document.getElementById('rcSteps');
    const rcState = document.getElementById('rcState'), rcCount = document.getElementById('rcCount'), rcId = document.getElementById('rcId');
    const HC = [['ATFGraph', 'Coordinates durable work', 'Plan', 'saves the job while it waits'], ['Keel', 'Checks supplier calls', 'Check', 'prices and terms checked'], ['ATP', 'Booking + controlled payments', 'Book', 'within approved limits'], ['Emitters', 'Keep watching the trip', 'Watch', 'saved job wakes for work']];
    // Sample trips from the globe prototype. Prices are made up for the demo and the card says so.
    const vec = ([la, lo]) => { const a = la * Math.PI / 180, o = lo * Math.PI / 180; return [Math.cos(a) * Math.sin(o), Math.sin(a), Math.cos(a) * Math.cos(o)]; };
    const HOME = vec([-33.9, 151.2]);
    const DESTS = [
      ['HND', 'Tokyo', 'Japan', [35.7, 139.7], 'mount', 230, 'Shinjuku', 0], ['SIN', 'Singapore', 'Singapore', [1.35, 103.8], 'city', 280, 'Marina Bay', 0],
      ['DPS', 'Bali', 'Indonesia', [-8.7, 115.2], 'beach', 140, 'Seminyak', 0], ['BKK', 'Bangkok', 'Thailand', [13.75, 100.5], 'dome', 120, 'Sukhumvit', 0],
      ['ZQN', 'Queenstown', 'New Zealand', [-45, 168.7], 'mount', 240, 'Lakefront', 0], ['NAN', 'Fiji', 'Fiji', [-17.8, 177.4], 'beach', 260, 'Denarau', 0],
      ['HNL', 'Honolulu', 'Hawaii', [21.3, -157.9], 'beach', 340, 'Waikiki', 0], ['LAX', 'Los Angeles', 'United States', [34, -118.2], 'city', 290, 'Santa Monica', 0],
      ['YVR', 'Vancouver', 'Canada', [49.3, -123.1], 'mount', 250, 'Gastown', 0], ['JFK', 'New York', 'United States', [40.7, -74], 'city', 380, 'Midtown', 1],
      ['GIG', 'Rio de Janeiro', 'Brazil', [-22.9, -43.2], 'beach', 190, 'Copacabana', 1], ['LHR', 'London', 'United Kingdom', [51.5, -0.1], 'dome', 320, 'Covent Garden', 1],
      ['CDG', 'Paris', 'France', [48.86, 2.35], 'tower', 300, 'Le Marais', 1], ['FCO', 'Rome', 'Italy', [41.9, 12.5], 'dome', 250, 'Trastevere', 1],
      ['JTR', 'Santorini', 'Greece', [36.4, 25.4], 'beach', 310, 'Oia', 2], ['KEF', 'Reykjavik', 'Iceland', [64.1, -21.9], 'mount', 270, 'Old Harbour', 2],
      ['DXB', 'Dubai', 'UAE', [25.2, 55.3], 'desert', 270, 'Downtown', 0], ['NBO', 'Nairobi', 'Kenya', [-1.3, 36.8], 'safari', 180, 'Karen', 1],
      ['CPT', 'Cape Town', 'South Africa', [-33.9, 18.4], 'mount', 170, 'Waterfront', 1]
    ].map(([code, name, country, ll, kind, hotel, area, stops]) => {
      const b = vec(ll), km = Math.round(6371 * Math.acos(Math.max(-1, Math.min(1, HOME[0] * b[0] + HOME[1] * b[1] + HOME[2] * b[2]))));
      const mins = Math.round(((km / 830 + .5 + stops * 2.3) * 60) / 5) * 5, fare = Math.round((170 + km * .074 + stops * 60) / 10) * 10;
      return { code, name, country, kind, hotel, area, stops, mins, fare, pack: Math.round((fare * .92 + hotel * 7 * .82) / 10) * 10 };
    });
    // Start with Santorini, then walk the rest in a shuffled order.
    const order = [14, ...DESTS.map((_, i) => i).filter((i) => i !== 14).sort(() => Math.random() - .5)];
    const money = (n) => '$' + n.toLocaleString('en-AU'), dur = (m) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
    const GLYPH = {
      city: ['M3 21V9h5v12M8 21V4h6v17M14 21v-9h7v9M10 7h2M10 10h2M10 13h2M16 15h3M16 18h3M4.5 12h2M4.5 15h2', ''],
      mount: ['M2 20 9 8l4 6 3-4 6 10M7.6 10.4 9 8l1.4 2.3', '<circle class="a" cx="18" cy="6" r="2.4"/>'],
      beach: ['M9 21c0-6 1-10 3-13M12 8c-3-2-6-1-7 1M12 8c3-2 6-1 7 1M12 8c-1-3-4-4-6-3M12 8c1-3 4-4 6-3M3 18c3-1 5-1 8 0s5 1 8 0', '<circle class="a" cx="19" cy="14" r="2.4"/>'],
      dome: ['M5 21v-6h14v6M8 21v-6M12 21v-6M16 21v-6M6 15c0-4 3-7 6-7s6 3 6 7M12 8V5M11 5h2', ''],
      tower: ['M12 2v3M10 5h4M10 5 6 21M14 5l4 16M8.4 13h7.2M7.2 17h9.6M10 21a2 2 0 0 1 4 0', ''],
      desert: ['M12 2v19M10.4 7h3.2M9.6 12h4.8M8.8 17h6.4M2 21c3-3 6-3 8-2M14 19c3-2 6-2 8 0', '<circle class="a" cx="5" cy="7" r="2.4"/>'],
      safari: ['M12 21v-9M12 12 8 9M12 12l4-3M3 9c3-2 15-2 18 0', '<circle class="a" cx="19" cy="16" r="2.4"/>']
    };
    const scene = (k) => { const [d, x] = GLYPH[k] || GLYPH.city; return `<svg viewBox="0 0 250 86" preserveAspectRatio="xMidYMid slice"><defs><pattern id="dHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><path d="M0 0v6"/></pattern></defs><rect class="h" x="0" y="72" width="250" height="14"/><path d="M0 72H250"/><g transform="translate(150 6) scale(2.6)"><path d="${d}"/>${x}</g><path class="d" d="M14 54c14-6 26-10 44-12"/><path class="pl" d="M58 38h12l4-3h2l-2 3 5 1v1.6l-5 .6 2 3h-2l-4-3H58Z"/><circle class="s" cx="226" cy="22" r="8"/></svg>`; };
    const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$';
    const scramble = (el, to, ms = 320) => { if (REDUCE) { el.textContent = to; return; } const t0 = performance.now(), n = to.length; const tick = (t) => { const k = Math.floor(n * Math.min(1, (t - t0) / ms)); let o = ''; for (let i = 0; i < n; i++) o += i < k || to[i] === ' ' ? to[i] : CH[(Math.random() * CH.length) | 0]; el.textContent = o; if (k < n) requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
    const destCard = cards.find((c) => c.dataset.card === 'dest');
    const fill = (d) => {
      destCard.classList.remove('swap'); void destCard.offsetWidth; destCard.classList.add('swap');
      document.getElementById('dScene').innerHTML = scene(d.kind);
      scramble(document.getElementById('dName'), d.name); document.getElementById('dCode').textContent = `${d.code} · ${d.country}`;
      const stops = d.stops ? `${d.stops} stop${d.stops > 1 ? 's' : ''}` : 'nonstop';
      const ul = document.getElementById('dRows');
      ul.innerHTML = [['plane', 'Flights', `SYD → ${d.code} · ${dur(d.mins)} · ${stops}`, d.fare, 'return'], ['bed', 'Hotels', `${d.area} · 4★ · 140+ stays`, d.hotel, 'per night'], ['stack', 'Holiday packages', '7 nights · flights + hotel', d.pack, 'per person']]
        .map(([ic, k, t, p, u]) => `<li><i class="px" data-px="${ic}"></i><span><em>${k}</em>${t}</span><b><small>from</small><span class="dprice">${money(p)}</span><small>${u}</small></b></li>`).join('');
      window.MX?.paintIcons?.(ul);
      ul.querySelectorAll('.dprice').forEach((el) => scramble(el, el.textContent, 420));
    };
    const forCity = (d) => [[`brief: ${d.name}, 7 nights`, 'you'], [`search_fares SYD→${d.code}`, 'keel'], [`search_hotels ${d.area}`, 'keel'], ['check_entry_rules', 'keel'], ['verify plan', 'atfgraph'], ['consultant approval', 'human'], ['run recorded', 'atfgraph']];
    let di = 0;
    let token = 0;
    const show = (name) => cards.forEach((c) => c.classList.toggle('on', c.dataset.card === name));
    const wait = (ms, my) => new Promise((res, rej) => setTimeout(() => (my === token ? res() : rej('stop')), REDUCE ? 0 : ms));
    const ticket = (i) => { const [a, b, c, d] = HC[i % HC.length]; T.textContent = a; L1.textContent = b; L2.textContent = c; L3.textContent = d; };
    const row = ([name, who]) => { const li = document.createElement('li'); li.innerHTML = `<span></span><span class="who">${who}</span><span class="st wait">…</span>`; li.firstChild.textContent = name; return li; };
    async function run(my) {
      for (let loop = 0; my === token; loop++) {
        show('ticket');
        for (let i = 0; i < 2; i++) { ticket(loop * 2 + i); await wait(1800, my); }
        // Two trips on the destination card, then a run that plans the second one.
        let d = DESTS[order[di++ % order.length]]; fill(d); show('dest'); await wait(2300, my);
        d = DESTS[order[di++ % order.length]]; fill(d); await wait(2300, my);
        const STEPS = forCity(d);
        runCard.querySelector('.r-head b').textContent = `trip-desk · ${d.name}`;
        show('run'); runCard.classList.remove('approved');
        list.innerHTML = ''; rcState.textContent = 'running'; rcCount.textContent = '0 / 7';
        rcId.textContent = 'run · ' + Math.floor(4096 + Math.random() * 61439).toString(16);
        for (let i = 0; i < STEPS.length; i++) {
          list.appendChild(row(STEPS[i]));
          while (list.children.length > 3) list.firstChild.remove();
          await wait(i === 5 ? 1100 : i >= 1 && i <= 3 ? 300 : 480, my);
          if (i === 5) { rcState.textContent = 'approved'; runCard.classList.add('approved'); }
          const st = list.lastChild.querySelector('.st'); st.className = 'st ok'; st.textContent = '✓';
          rcCount.textContent = `${i + 1} / ${STEPS.length}`;
        }
        rcState.textContent = 'recorded'; await wait(1200, my);
      }
    }
    return {
      start() { const my = ++token; window.MX?.paintIcons?.(document.getElementById('hcCards')); run(my).catch((e) => { if (e !== 'stop') throw e; }); },
      stop() { token++; }
    };
  })();

  /* ---- carousel mechanics ---- */
  const setTabs = () => tabs.forEach((t, i) => { t.setAttribute('aria-selected', String(i === active)); t.tabIndex = i === active ? 0 : -1; t.style.setProperty('--p', i === active ? Math.min(1, elapsed / DUR[i]) : 0); });
  const activate = (i) => {
    if (i === active && elapsed > 0) return;
    if (active === 0 && i !== 0) coast.stop();
    active = i; elapsed = 0; setTabs();
    slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== i)));
    RESTART[i]();
  };
  const go = (i) => {
    i = (i + slides.length) % slides.length;
    programmatic = performance.now();
    track.scrollTo({ left: i * track.clientWidth, behavior: REDUCE ? 'auto' : 'smooth' });
    activate(i);
  };
  // Manual side scrolling (trackpad, swipe, keys) picks the scene it lands on.
  let st = 0;
  track.addEventListener('scroll', () => {
    clearTimeout(st);
    st = setTimeout(() => {
      if (performance.now() - programmatic < 900) return;
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== active) activate(i);
    }, 120);
  }, { passive: true });
  const loop = (now) => {
    raf = 0;
    const dt = last ? Math.min(100, now - last) : 0; last = now;
    if (visible && !paused && !held && !document.hidden) {
      elapsed += dt;
      if (elapsed >= DUR[active]) go(active + 1);
    }
    setTabs();
    raf = requestAnimationFrame(loop);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => go(i));
    t.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); go(active + d); tabs[active].focus(); } });
  });
  document.querySelectorAll('.hc-arrow').forEach((b) => b.addEventListener('click', () => go(active + Number(b.dataset.dir))));
  track.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); go(active + d); } });
  pauseBtn.addEventListener('click', () => { paused = !paused; pauseBtn.setAttribute('aria-pressed', String(paused)); pauseBtn.textContent = paused ? 'Play' : 'Pause'; });
  if (REDUCE) { pauseBtn.textContent = 'Play'; pauseBtn.setAttribute('aria-pressed', 'true'); }
  // Hovering a scene holds it, so people can read the cards or approve the trip.
  frame.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') held = true; });
  frame.addEventListener('pointerleave', () => { held = false; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: .35 }).observe(frame);
  addEventListener('resize', () => { programmatic = performance.now(); track.scrollTo({ left: active * track.clientWidth, behavior: 'auto' }); });
  slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== 0)));
  coast.start(); setTabs();
  raf = requestAnimationFrame(loop);
})();
