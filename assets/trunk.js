/* Trunk, redrawn in the mcpx style. Four commitments orbit him with depth; he says hello.
   Usage: <div class="trunk-stage" data-trunk data-href="manifesto.html"></div>
   data-href is the page that holds the belief spreads (#b1 to #b4). Leave it empty on that page. */
(() => {
  const BELIEFS = [
  [
    "We are impact players.",
    "check",
    "We are impact players."
  ],
  [
    "Let your work speak for itself.",
    "search",
    "Put friction in the right places."
  ],
  [
    "Follow your curiosity deeply.",
    "refresh",
    "Follow your curiosity deeply."
  ],
  [
    "Bring your vision to life.",
    "book",
    "Bring your vision to life."
  ]
];
  const GREETINGS = BELIEFS.map(([, , speech]) => speech);

  // Ink outline, blue case, lime straps and a hard offset shadow, like the mcpx sketches.
  const TRUNK = `<svg viewBox="0 0 220 210" aria-hidden="true">
    <rect x="44" y="62" width="150" height="122" rx="10" fill="#0f1115"/>
    <path d="M86 52V36q0-10 10-10h28q10 0 10 10v16" fill="none" stroke="#0f1115" stroke-width="7" stroke-linecap="round"/>
    <rect x="34" y="52" width="150" height="122" rx="10" fill="#2a3bff" stroke="#0f1115" stroke-width="3"/>
    <rect x="62" y="52" width="16" height="122" fill="#d7ff3c" stroke="#0f1115" stroke-width="2.5"/>
    <rect x="140" y="52" width="16" height="122" fill="#d7ff3c" stroke="#0f1115" stroke-width="2.5"/>
    <rect x="58" y="104" width="24" height="16" rx="2" fill="#fff" stroke="#0f1115" stroke-width="2.5"/>
    <rect x="136" y="104" width="24" height="16" rx="2" fill="#fff" stroke="#0f1115" stroke-width="2.5"/>
    <g class="tk-face">
      <g class="tk-eyes"><circle cx="96" cy="94" r="9" fill="#fff" stroke="#0f1115" stroke-width="2.5"/><circle cx="124" cy="94" r="9" fill="#fff" stroke="#0f1115" stroke-width="2.5"/><circle class="tk-pupil" cx="98" cy="95" r="3.6" fill="#0f1115"/><circle class="tk-pupil" cx="126" cy="95" r="3.6" fill="#0f1115"/></g>
      <path d="M99 122q11 10 22 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <rect x="92" y="146" width="36" height="14" rx="2" fill="#fff" stroke="#0f1115" stroke-width="2.5"/>
    <path d="M98 153h24" stroke="#2a3bff" stroke-width="2" stroke-dasharray="3 3"/>
    <circle cx="58" cy="184" r="9" fill="#fff" stroke="#0f1115" stroke-width="3"/>
    <circle cx="160" cy="184" r="9" fill="#fff" stroke="#0f1115" stroke-width="3"/>
  </svg>`;

  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-trunk]').forEach((stage) => {
    const base = stage.dataset.href || '';
    stage.innerHTML = `
      <div class="tk-line" aria-hidden="true"></div>
      <span class="tk-spark s1" aria-hidden="true">✦</span><span class="tk-spark s2" aria-hidden="true">✧</span>
      <div class="tk-center">
        <span class="tk-speech" aria-live="polite">${GREETINGS[0]}</span>
        <button class="tk-hello" type="button" aria-label="Say hello to Trunk">${TRUNK}<span class="tk-label">Meet Trunk ↗</span></button>
      </div>
      <div class="tk-chips">${BELIEFS.map(([t, ic, h], i) => `<a class="tk-chip" href="${base}#b${i + 1}" aria-label="${h}" data-i="${i}"><i class="px" data-px="${ic}"></i><span>${t}</span></a>`).join('')}</div>
      <p class="tk-hint">A little orbit of ideas. Hover or tap to explore.</p>`;
    window.MX?.paintIcons?.(stage);

    const chips = [...stage.querySelectorAll('.tk-chip')];
    const center = stage.querySelector('.tk-center'), speech = stage.querySelector('.tk-speech'), hello = stage.querySelector('.tk-hello');
    let angle = 0, last = 0, raf = 0, visible = true, held = false, active = 0, elapsed = 0, greet = 1, showBelief = false, timer;
    let W = stage.clientWidth, H = stage.clientHeight;
    const flat = () => W < 520;

    const place = () => {
      stage.classList.toggle('is-flat', flat());
      chips.forEach((c, i) => {
        if (flat()) { c.style.cssText = ''; return; }
        const a = angle + i * 2 * Math.PI / chips.length - .4, depth = (Math.sin(a) + 1) / 2;
        c.style.left = (W * .5 + Math.cos(a) * Math.max(0, W / 2 - c.offsetWidth / 2 - 12)) + 'px';
        c.style.top = (H * .5 + Math.sin(a) * Math.max(50, H / 2 - 58)) + 'px';
        c.style.transform = `translate(-50%,-50%) scale(${.8 + depth * .2})`;
        c.style.zIndex = depth > .45 ? '7' : '3';
        c.style.opacity = String(.72 + depth * .28);
      });
    };
    const say = (text) => {
      speech.textContent = text;
      center.classList.remove('is-hello'); void center.offsetWidth; center.classList.add('is-hello');
      clearTimeout(timer); timer = setTimeout(() => center.classList.remove('is-hello'), 2400);
    };
    const select = (i, speak = true) => {
      active = i; elapsed = 0;
      chips.forEach((c, j) => c.classList.toggle('on', j === i));
      if (speak) say(BELIEFS[i][2]);
    };
    const moving = () => !REDUCE.matches && visible && !document.hidden && !held;
    const frame = (now) => {
      raf = 0; if (!moving()) { last = 0; return; }
      if (last) {
        const dt = Math.min(now - last, 50); angle += dt * .00012; elapsed += dt;
        // Every few seconds Trunk either greets you or reads out the next belief.
        if (elapsed >= 5200) { showBelief = !showBelief; if (showBelief) select((active + 1) % chips.length); else { elapsed = 0; say(GREETINGS[greet++ % GREETINGS.length]); } }
      }
      last = now; place(); raf = requestAnimationFrame(frame);
    };
    const sync = () => { if (moving() && !raf) raf = requestAnimationFrame(frame); else if (!moving()) { cancelAnimationFrame(raf); raf = 0; last = 0; } };

    chips.forEach((c, i) => {
      c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'touch') return; held = true; select(i); sync(); });
      c.addEventListener('pointerleave', () => { held = false; sync(); });
      c.addEventListener('focus', () => { held = true; select(i); sync(); });
      c.addEventListener('blur', () => { held = false; sync(); });
    });
    hello.addEventListener('click', () => say(GREETINGS[greet++ % GREETINGS.length]));
    document.addEventListener('visibilitychange', sync);
    REDUCE.addEventListener('change', sync);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: .05 }).observe(stage);
    new ResizeObserver(() => { W = stage.clientWidth; H = stage.clientHeight; place(); }).observe(stage);
    select(0, false); place(); sync();

    // A proper hello: jump, wave and a sparkle burst. Used by the "Meet Trunk" links.
    const wave = () => {
      center.classList.remove("is-wave"); void center.offsetWidth; center.classList.add("is-wave");
      say(greet % GREETINGS.length === 0 ? GREETINGS[0] : GREETINGS[greet++ % GREETINGS.length]);
      setTimeout(() => center.classList.remove("is-wave"), 1800);
    };
    stage.trunkHello = wave;
    hello.addEventListener("click", wave);
    const id = stage.id;
    if (id) {
      document.querySelectorAll(`a[href="#${id}"]`).forEach((a) => a.addEventListener("click", (e) => {
        e.preventDefault();
        stage.scrollIntoView({ behavior: REDUCE.matches ? "auto" : "smooth", block: "center" });
        setTimeout(wave, REDUCE.matches ? 0 : 550);
      }));
      // Arriving from another page via manifesto.html#trunk.
      if (location.hash === "#" + id) setTimeout(() => { stage.scrollIntoView({ block: "center" }); wave(); }, 700);
    }
  });
})();
