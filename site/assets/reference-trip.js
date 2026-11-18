(()=>{
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = (n) => '$' + Math.round(n).toLocaleString('en-AU');
const passHTML = (t) => `<div class="bp-wrap"><div class="bp"><div class="bp-main"><div class="bp-h"><span>Boarding pass · ${t.pax}</span><span>run ${t.run}</span></div><div class="bp-route"><span>${t.from}</span><i></i><span>${t.to}</span></div><div class="bp-grid"><span>date<b>${t.date}</b></span><span>stay<b>${t.stay}</b></span><span>total<b>${t.total}</b></span><span>checks<b>${t.checks || '7 of 7'}</b></span><span>approved<b>${t.approver || 'consultant'}</b></span><span>saved<b>${t.saved}</b></span></div></div><div class="bp-stub"><span>SEAT<b>${t.seat}</b></span><div class="bp-code">${Array.from({ length: 22 }, (_, i) => `<i style="width:${1 + (i * 7 % 4)}px"></i>`).join('')}</div></div></div><span class="bp-stamp">BOOKED</span></div>`;


(() => {
  const ICON = {
    plane: '<path d="M2 13l8-2 4-8 2 1-2 7 6 1 2-2h1l-1 4 1 4h-1l-2-2-6 1 2 7-2 1-4-8-8-2z" transform="scale(.8) translate(1 0)"/>',
    bed: '<path d="M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6M7 11.5a1.5 1.5 0 1 0 0-.01"/>',
    car: '<path d="M4 16v-4l2-5h12l2 5v4zM4 16v2M20 16v2M7 13h.01M17 13h.01M6 12h12"/>',
    ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM14 7v10"/>',
    rail: '<path d="M7 3h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zM5 10h14M9 14h.01M15 14h.01M8 21l2-4M16 21l-2-4"/>',
    fork: '<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 0-3 3-3 6s1 3 3 3v9"/>'
  };
  const svg = (k) => `<svg viewBox="0 0 24 24">${ICON[k]}</svg>`;
  const TRIPS = [
    { who: 'Emma', sub: 'family of four', av: 'E', brief: 'Bali for the four of us in the July school holidays. A villa with a pool, a car, and something fun for the kids. Around $9,000.',
      facts: [['From', 'Brisbane'], ['To', 'Bali'], ['When', 'July school holidays'], ['Who', '2 adults, 2 kids'], ['Stay', 'villa with a pool'], ['Budget', 'about $9,000']],
      agents: [
        { ic: 'plane', n: 'Flights', scan: '38 airlines', opts: [['Garuda', '$2,860', '1 stop'], ['Jetstar', '$2,980', 'no bags'], ['Qantas', '$3,120', 'direct'], ['Virgin', '$3,240', 'direct']], pick: [2], why: 'Direct, bags in. The cheapest fare had a 9-hour stop.', item: ['Flights', 'BNE → DPS · 4 seats together', 3120] },
        { ic: 'bed', n: 'Stays', scan: '214 villas', opts: [['Resort room', '$3,050', 'no pool'], ['Seminyak villa', '$3,410', 'pool'], ['Canggu villa', '$3,700', 'pool'], ['Villa Kayu', '$3,980', 'pool']], pick: [1], why: 'Private pool, rated 4.8, free cancellation.', item: ['Villa', 'Seminyak · 7 nights · private pool', 3410] },
        { ic: 'car', n: 'Car hire', scan: '9 rental desks', opts: [['Desk D', '$390', '+ seats $200'], ['Desk B', '$420', 'seats in'], ['Desk C', '$465', 'seats in'], ['Desk A', '$510', 'seats in']], pick: [1], why: 'Child seats included. The cheapest charged $25 a day for them.', item: ['Car hire', '7-seater · 8 days · 2 child seats', 420] },
        { ic: 'ticket', n: 'Activities', scan: '120 things to do', opts: [['Waterbom', '$290', 'kids ½'], ['Ubud day trip', '$270', ''], ['Dolphin cruise', '$340', ''], ['Cooking class', '$210', '']], pick: [0, 1], why: 'The two most popular with families, both free to cancel.', item: ['Activities', 'Waterbom park + Ubud day trip', 560] }
      ],
      checks: ['Inside the $9,000 budget', 'Dates match the school holidays', 'Passports valid for 6+ months', 'Free cancellation on the villa', 'Child seats in the car'],
      budget: 9000, budgetL: 'budget $9,000', saved: 640, savedL: 'less than booking each part on its own', ap: ['Jess', 'travel consultant', 'J'],
      pass: { pax: '2 adults · 2 kids', run: 'b4e1', from: 'BNE', to: 'DPS', date: 'Sat 5 Jul', stay: 'Seminyak villa · 7n', seat: '23A–D' } },
    { who: 'Kenji', sub: 'watching every dollar', av: 'K', brief: 'Cheapest sensible way to Tokyo for a week in late March. Somewhere near a train line. Under $2,500 all in.',
      facts: [['From', 'Sydney'], ['To', 'Tokyo'], ['When', 'late March · 7 nights'], ['Who', '1 adult'], ['Must have', 'near a train line'], ['Budget', 'under $2,500']],
      agents: [
        { ic: 'plane', n: 'Flights', scan: '41 airlines', opts: [['Scoot', '$612', '2 stops'], ['Jetstar', '$738', 'direct'], ['ANA', '$1,080', 'direct'], ['JAL', '$1,140', 'direct']], pick: [1], why: 'Direct. With a bag added it is still $280 under the next direct fare.', item: ['Flights', 'SYD → NRT · 1 seat + 1 bag', 798] },
        { ic: 'bed', n: 'Stays', scan: '1,630 hotels', opts: [['Asakusa hostel', '$45/n', '25 min walk'], ['Capsule', '$62/n', 'shared'], ['Ueno hotel', '$98/n', '3 min walk'], ['Shibuya hotel', '$184/n', '']], pick: [2], why: 'Private room, 3 minutes from the station.', item: ['Hotel', 'Ueno · 7 nights · 3 min to station', 686] },
        { ic: 'rail', n: 'Rail', scan: '12 pass types', opts: [['JR Pass 7-day', '$520', ''], ['Day passes', '$84', ''], ['Subway 72h ×2', '$64', ''], ['Top-ups', '$140', '']], pick: [2], why: 'He stays in Tokyo, so the big JR pass would be wasted money.', item: ['Rail', 'Tokyo subway pass · 72h × 2', 64] },
        { ic: 'ticket', n: 'Activities', scan: '300 things to do', opts: [['Mt Fuji tour', '$129', ''], ['teamLab', '$32', ''], ['Sumo morning', '$90', ''], ['Food tour', '$140', '']], pick: [0, 1], why: 'His two most-wanted, both free to cancel.', item: ['Activities', 'Mt Fuji day tour + teamLab', 161] }
      ],
      checks: ['Under the $2,500 budget', 'Bag included in the fare', 'Hotel close to a train line', 'Free cancellation on activities', 'Fare watch stays on after booking'],
      budget: 2500, budgetL: 'budget $2,500', saved: 412, savedL: 'less than the first prices found', ap: ['Jess', 'travel consultant', 'J'],
      pass: { pax: '1 adult', run: '7c02', from: 'SYD', to: 'NRT', date: 'Tue 24 Mar', stay: 'Ueno hotel · 7n', seat: '31C' } },
    { who: 'Daniel', sub: 'business trip', av: 'D', brief: 'London from Sydney, Tuesday to Thursday, for a client meeting in Canary Wharf. Keep it inside our travel policy.',
      facts: [['From', 'Sydney'], ['To', 'London'], ['When', 'Tue to Thu'], ['Who', '1 traveller'], ['Why', 'client meeting'], ['Rule', 'company travel policy']],
      agents: [
        { ic: 'plane', n: 'Flights', scan: '26 airlines', opts: [['Economy', '$2,380', '24h'], ['Emirates', '$7,940', 'business'], ['BA', '$8,120', 'business'], ['Qantas', '$8,410', 'business']], pick: [1], why: 'Policy allows business over 8 hours. This is the lowest business fare.', item: ['Flights', 'SYD → LHR · business · return', 7940] },
        { ic: 'bed', n: 'Stays', scan: '480 hotels', opts: [['Docklands', '$268/n', '25 min'], ['Canary Wharf', '$312/n', '4 min'], ['Serviced flat', '$290/n', ''], ['Mayfair', '$540/n', 'over cap']], pick: [1], why: 'Company rate, a 4-minute walk to the client.', item: ['Hotel', 'Canary Wharf · 2 nights · company rate', 624] },
        { ic: 'rail', n: 'Transfers', scan: '6 options', opts: [['Tube', '$22', '70 min'], ['Heathrow Express', '$64', '35 min'], ['Black cab', '$180', ''], ['Private car', '$260', '']], pick: [1], why: 'Policy prefers rail when it is the quicker option.', item: ['Transfers', 'Heathrow Express + Elizabeth line', 64] },
        { ic: 'fork', n: 'Extras', scan: '40 restaurants', opts: [['Wharf grill', '$420', '6 people'], ['Rooftop bar', '$610', ''], ['Hotel dining', '$380', ''], ['Steakhouse', '$720', 'over limit']], pick: [0], why: 'Client dinner for six near the hotel, inside the meal limit.', item: ['Client dinner', 'Thursday · 6 people', 420] }
      ],
      checks: ['Inside the company travel policy', 'Business class allowed over 8 hours', 'Hotel at the negotiated rate', 'Dinner under the per-head limit', 'Traveller tracked for duty of care'],
      budget: 10500, budgetL: 'policy cap $10,500', saved: 1180, savedL: 'under the usual fares for these dates', ap: ['Ana', 'travel manager', 'A'],
      pass: { pax: '1 traveller · business', run: 'a91f', from: 'SYD', to: 'LHR', date: 'Mon 8 Jun', stay: 'Canary Wharf · 2n', seat: '7K' } }
  ];
  const SAY = [
    (t) => `${t.who} types what ${t.who === 'Emma' ? 'her family' : 'he'} wants, in plain words.`,
    () => 'The AI picks out the facts that matter.',
    (t) => `${t.agents.length} agents search at the same time, each on one part of the trip.`,
    () => 'Each agent keeps the best value that fits, not just the cheapest. Every pick is checked.',
    (t) => `${t.ap[0]}, a ${t.ap[1]}, looks it over and approves. Nothing is charged before this.`,
    () => 'Approved actions are carried out and their confirmations are recorded.'
  ];
  const $ = (id) => document.getElementById(id);
  const rail = [...$('r4').children], say = $('say4'), body = $('b4'), cols = [$('cA'), $('cB'), $('cC')];
  const tr = $('tr4');
  TRIPS.forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = `${t.who} · ${t.sub}`; b.addEventListener('click', () => complete(i)); tr.appendChild(b); });
  let token=0,selectedTrip=2,running=false,visible=true;
  const sleep=(ms,my)=>new Promise((resolve,reject)=>{
    let elapsed=0,last=performance.now();
    const tick=()=>{if(my!==token){reject('stop');return}const now=performance.now();if(!document.hidden&&visible&&!window.TLMotion.paused)elapsed+=Math.min(100,now-last);last=now;if(elapsed>=ms){resolve();return}setTimeout(tick,50)};tick();
  });
  const step = (k, t) => {$('st4').dataset.step=String(k); rail.forEach((li, i) => { li.classList.toggle('on', i === k); li.classList.toggle('done', i < k); }); say.textContent = SAY[k](t); cols.forEach((c, i) => c.classList.toggle('live', [0, 0, 1, 1, -1, 2][k] === i)); };
  function prepare(t){
    $('st4').classList.remove('is-complete');$('b4').inert=false;$('pass4').setAttribute('aria-hidden','true');
    [...tr.querySelectorAll('button')].forEach((b, i) => b.classList.toggle('on', TRIPS[i] === t));
    $('who4').innerHTML = `<span class="av">${t.av}</span><div><b>${t.who}</b><small>${t.sub}</small></div>`;
    $('txt4').textContent = ''; $('facts4').innerHTML = t.facts.map(([a, b]) => `<div class="fact"><small>${a}</small>${b}</div>`).join('');
    $('ags4').innerHTML = t.agents.map(a => `<div class="ag"><span class="ic">${svg(a.ic)}</span><div><div class="ag-n">${a.n}<span></span></div><div class="opts">${a.opts.map(([n, p, e]) => `<span class="opt">${n} ${p}${e ? `<em>${e}</em>` : ''}</span>`).join('')}</div><div class="why">${a.why}</div></div><div class="ag-p">${money(a.item[2])}</div></div>`).join('');
    $('chk4').innerHTML = t.checks.map(c => `<li>${c}</li>`).join('');
    $('trip4').innerHTML = '<div class="empty4">Your trip appears here as agents pick each part.</div>';
    $('tot4').textContent = '$0'; $('met4').style.width = '0'; $('bud4').textContent = t.budgetL; $('sav4').className = 'save4'; $('sav4').innerHTML = '';
    $('stamp4').classList.remove('in'); $('pass4').classList.remove('in'); $('appr4').classList.remove('in'); $('apy4').className = 'yes'; $('apy4').textContent = 'Approve';
    body.classList.remove('out');
  }
  async function run(t,my){
    prepare(t);
    // 1. type the brief
    step(0, t);
    for (let i = 1; i <= t.brief.length; i++) { $('txt4').textContent = t.brief.slice(0, i); await sleep(22, my); }
    await sleep(500, my);
    // 2. facts
    step(1, t);
    for (const f of $('facts4').children) { f.classList.add('in'); await sleep(260, my); }
    await sleep(700, my);
    // 3. agents search in parallel
    step(2, t);
    const ags = [...$('ags4').children];
    ags.forEach((a, i) => { a.classList.add('on'); a.querySelector('.ag-n span').textContent = `searching ${t.agents[i].scan}…`; });
    for (let k = 0; k < 4; k++) { ags.forEach(a => a.querySelectorAll('.opt')[k]?.classList.add('in')); await sleep(260, my); }
    for (let r = 0; r < 8; r++) { ags.forEach((a, i) => { const o = a.querySelectorAll('.opt'); o.forEach((x, j) => x.classList.toggle('scan', j === (r + i) % o.length)); }); await sleep(180, my); }
    ags.forEach(a => a.querySelectorAll('.opt').forEach(x => x.classList.remove('scan')));
    // 4. picks land in the trip, one by one
    step(3, t);
    $('trip4').innerHTML = '';
    let total = 0;
    const chks = [...$('chk4').children];
    for (let i = 0; i < ags.length; i++) {
      const a = ags[i], d = t.agents[i];
      a.querySelectorAll('.opt').forEach((x, j) => x.classList.add(d.pick.includes(j) ? 'pick' : 'drop'));
      a.classList.add('picked'); a.querySelector('.ag-n span').textContent = 'picked';
      a.querySelector('.why').classList.add('in'); a.querySelector('.ag-p').classList.add('in');
      const it = document.createElement('div'); it.className = 'it'; it.innerHTML = `<span class="ic">${svg(d.ic)}</span><div><b>${d.item[0]}</b><span>${d.item[1]}</span><small>confirmed · ref ${(t.who.charCodeAt(0) * 7919 + i * 104729).toString(36).toUpperCase().slice(-6)}</small></div><strong>${money(d.item[2])}</strong>`;
      $('trip4').appendChild(it); requestAnimationFrame(() => it.classList.add('in'));
      total += d.item[2]; $('tot4').textContent = money(total); $('met4').style.width = Math.min(100, total / t.budget * 100) + '%';
      chks[i]?.classList.add('ok');
      await sleep(1000, my);
    }
    chks.forEach(c => c.classList.add('ok'));
    $('sav4').innerHTML = `<b>${money(t.saved)}</b> ${t.savedL}.`; $('sav4').classList.add('in');
    await sleep(1600, my);
    // 5. a person approves
    step(4, t);
    $('apw4').innerHTML = `<span class="av p">${t.ap[2]}</span><div><b>${t.ap[0]}</b><small>${t.ap[1]} · approval needed</small></div>`;
    $('apt4').textContent = `${t.who}'s trip: ${t.agents.length} parts, ${money(total)} total.`;
    $('apl4').innerHTML = t.checks.slice(0, 3).map(c => `<li>${c}</li>`).join('');
    $('appr4').classList.add('in');
    await sleep(1900, my);
    $('apy4').classList.add('press'); await sleep(180, my); $('apy4').className = 'yes done'; $('apy4').textContent = `Approved by ${t.ap[0]} ✓`;
    await sleep(900, my);
    $('appr4').classList.remove('in');
    // 6. booked together
    step(5, t);
    for (const it of $('trip4').children) { it.classList.add('ok'); await sleep(260, my); }
    $('stamp4').classList.add('in');
    rail.forEach(li => { li.classList.remove('on'); li.classList.add('done'); });
    await sleep(1500, my);
    // 7. the boarding pass
    const tot = t.agents.reduce((s, a) => s + a.item[2], 0);
    $('pass4').innerHTML = passHTML({ ...t.pass, total: money(tot), checks: `${t.checks.length} of ${t.checks.length}`, approver: t.ap[0], saved: money(t.saved) }) + `<p>${t.who}'s trip is booked · prices still watched until departure</p>`;
    $('pass4').classList.add('in');$('pass4').setAttribute('aria-hidden','false');$('st4').classList.add('is-complete');$('b4').inert=true;
    say.textContent = `Booked. ${t.who} gets a clear record of the trip.`;
    running=false;$('replayTrip').textContent='Replay the journey ↻';$('skipTrip').hidden=true;
  }
  function complete(i){
    ++token;running=false;selectedTrip=i;const t=TRIPS[i];prepare(t);
    $('txt4').textContent=t.brief;$('facts4').querySelectorAll('.fact').forEach(e=>e.classList.add('in'));
    $('ags4').querySelectorAll('.ag').forEach((e,k)=>{e.classList.add('on','picked');e.querySelectorAll('.opt').forEach((o,j)=>o.classList.add('in',t.agents[k].pick.includes(j)?'pick':'drop'));e.querySelector('.why').classList.add('in');e.querySelector('.ag-p').classList.add('in');});
    $('chk4').querySelectorAll('li').forEach(e=>e.classList.add('ok'));
    const total=t.agents.reduce((s,a)=>s+a.item[2],0);$('tot4').textContent=money(total);$('met4').style.width=(total/t.budget*100)+'%';
    $('trip4').innerHTML=t.agents.map(a=>`<div class="it in ok"><span class="ic">${svg(a.ic)}</span><div><b>${a.item[0]}</b><span>${a.item[1]}</span></div><strong>${money(a.item[2])}</strong></div>`).join('');
    $('pass4').innerHTML=passHTML({...t.pass,total:money(total),checks:`${t.checks.length} of ${t.checks.length}`,approver:t.ap[0],saved:money(t.saved)})+`<p>${t.who}'s trip is booked · care continues until departure</p>`;
    $('pass4').classList.add('in');$('pass4').setAttribute('aria-hidden','false');$('st4').classList.add('is-complete');$('b4').inert=true;$('say4').textContent='A request becomes one complete trip.';rail.forEach(e=>{e.classList.remove('on');e.classList.add('done')});
    $('replayTrip').textContent='Play the journey →';$('skipTrip').hidden=true;
    [...tr.querySelectorAll('button')].forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
  }
  async function go(){
    if(window.TLMotion.reduced){complete(selectedTrip);return}
    const my=++token;running=true;$('replayTrip').textContent='Restart the journey ↻';$('skipTrip').hidden=false;
    try{await run(TRIPS[selectedTrip],my)}catch(e){if(e!=='stop')console.error(e)}
  }
  $('replayTrip').addEventListener('click',()=>{if(window.TLMotion.paused&&!window.TLMotion.reduced)document.getElementById('motion-toggle').click();go()});$('skipTrip').addEventListener('click',()=>complete(selectedTrip));
  new IntersectionObserver(([e])=>{visible=e.isIntersecting}).observe($('st4'));
  window.addEventListener('lab-motion',()=>{if(window.TLMotion.reduced&&running)complete(selectedTrip)});
  complete(2);
})();

})();