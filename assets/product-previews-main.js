(() => {
'use strict';
const previewRoot=document.getElementById('product-previews');if(!previewRoot)return;
const products = [
 {id:'co-consult',name:'Co-consult',tag:'Consultant workspace',phases:['You ask','AI understands','Agents search','Best value picked','A person approves','Booked together'],caption:'Illustrative family-trip example. Prices and booking outcomes are sample data.'},
 {id:'aibq',name:'AIBQ',tag:'After booking',phases:['Find the upcoming trip','Ask Miles a question','Identify the right flight','Keep the booking in context'],caption:'Illustrative app journey. No live booking data or baggage allowance is shown.'},
 {id:'iqr',name:'IQR',tag:'Enquiry to proposal',phases:['Receive the enquiry','Extract traveller intent','Match existing inventory','Prepare a branded proposal'],caption:'Supplied project figures. Under one minute is a response-time target; Salesforce CRM integration is underway.'},
 {id:'chatgpt',name:'ChatGPT App',tag:'Travel discovery',phases:['Read the travel request','Explore possible directions','Show travel ideas in the app','Refine the selected idea'],caption:'Illustrative conversation. Select a destination to change the follow-up question.'},
 {id:'conductor',name:'Conductor',tag:'Engineering support',phases:['Triage the incoming issue','Prepare context for an agent','Work through the issue','Hand off for review'],caption:'Issue-board artwork based on the supplied Conductor reference. The moving issue is an illustrative workflow.'},
 {id:'ctrlplane',name:'CTRLPLANE',tag:'Travel servicing',phases:['07:00 / Sweep the desk','08:00 / Check cancellation windows','08:30 / Follow up refunds','12:00 / Chase suppliers','14:00 / Prepare quotes'],caption:'Illustrative servicing schedule based on the supplied CTRLPLANE reference.'},
 {id:'waypoint',name:'Waypoint',tag:'Travel decision model',phases:['Read context and constraints','Compare eligible options','Explain the best fit','Prepare for review'],caption:'Conceptual decision sequence. Bars show illustrative relative fit, not measured model scores.'},
 {id:'maverick',name:'Maverick AI',tag:'Market & fare intelligence',phases:['Collect market signals','Compare fares and patterns','Identify a movement','Explain the next action'],caption:'Supplied project figures, not live analytics. The chart illustrates a monitoring sequence; it contains no actual fares.'}
];
const $ = (s,root=previewRoot)=>root.querySelector(s), $$=(s,root=previewRoot)=>[...root.querySelectorAll(s)];
const tabs=$$('.tab'), panels=products.map(p=>document.getElementById(p.id));
const media=matchMedia('(prefers-reduced-motion: reduce)');
let selected=0, phase=0, paused=media.matches, elapsed=0, previous=0, visible=true, chosen='Hoi An', manualUntil=0;
const durations=[2200,2600,3000,5000,5500];
const query='A week away. Good food, a little exploring and time to slow down.';
products.forEach((product,index)=>{
 const footer=$('.phasebar',panels[index]);
 const label=document.createElement('span');label.className='phase-label';label.innerHTML='<i class="live-square" aria-hidden="true"></i><span class="phase-text"></span>';footer.append(label);
 const nav=document.createElement('div');nav.className='phase-nav';nav.setAttribute('aria-label',product.name+' animation steps');
 if(product.id==='co-consult'){footer.append(nav);return;}
 product.phases.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.className='phase-dot';b.title=name;b.setAttribute('aria-label',`Step ${i+1}: ${name}`);b.addEventListener('click',()=>{phase=i;elapsed=0;manualUntil=performance.now()+7000;render();$('#announce').textContent=name});nav.append(b)});footer.append(nav);
});
function setText(selector,text){$(selector).textContent=text}
function render(){
 const panel=panels[selected], product=products[selected];panel.dataset.phase=String(phase);
 $$('.reveal',panel).forEach(n=>{const pending=phase<Number(n.dataset.from);n.classList.toggle('pending',pending);n.setAttribute('aria-hidden',String(pending));if(n.tagName==='BUTTON')n.disabled=pending;$$('button',n).forEach(b=>b.disabled=pending)});
 setText('#caption-copy',product.caption);
 $('.phase-text',panel).textContent=String(phase+1).padStart(2,'0')+' / '+product.phases[phase];
 $$('.phase-dot',panel).forEach((n,i)=>{n.classList.toggle('done',i<phase);if(i===phase)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current')});
 if(product.id==='aibq'){
  $$('[data-phone]',panel).forEach((n,i)=>n.classList.toggle('focus-phone',i===Math.min(phase,2)));
  $('#miles-typing').hidden=phase!==1;
 }
 if(product.id==='chatgpt'){
  setText('#typed-query',phase===0?query.slice(0,Math.max(1,Math.floor(elapsed/22))):query);
  setText('#chat-answer',phase<2?'Finding a few directions for your trip…':'Here are three directions we can explore together.');
  $('#chat-typing').hidden=phase!==1;
  $$('[data-runtime]').forEach((n,i)=>n.classList.toggle('active',i<=phase));
  setText('#chat-log',['intent.read','destinations.explore','travel_ideas.render','preferences.refine'][phase]);
  $$('[data-destination]').forEach(n=>{const active=phase>=3&&n.dataset.destination===chosen;n.classList.toggle('selected',active);n.setAttribute('aria-pressed',String(active))});
  setText('#chat-followup',({Bali:'For Bali, would you spend more time by the coast, or exploring around Ubud?',Kyoto:'For Kyoto, are you drawn more to gardens and quiet streets, or food and neighbourhood exploring?','Hoi An':'For Hoi An, how would you split your time between the old town and the coast?'})[chosen]);
 }
 if(product.id==='conductor'){
  const issue=$('#moving-issue'), lane=$('[data-lane="'+phase+'"]');
  if(issue.parentElement!==lane){lane.insertBefore(issue,$('.lane-title',lane).nextSibling)}
  $$('.preview-lane').forEach(n=>$('.lane-count',n).textContent=String($$('.issue',n).length));
  setText('#issue-state',['Needs triage','Agent ready','Working','Review requested'][phase]);
  setText('#conductor-log',['triage.issue → collect context','agent.assign → load issue + project context','work.execute → reproduce · change · check','review.request → evidence + proposed change'][phase]);
  setText('#conductor-status',['QUEUED','ASSIGNED','IN PROGRESS','HUMAN REVIEW'][phase]);
 }
 if(product.id==='ctrlplane'){
  const data=[
   [0,'Queue sweep','Start with what needs attention.','Review the desk, identify waiting work and route it to the right specialist.','schedule.tick → servicing.queue_sweep'],
   [2,'Cancellation check','Keep an eye on the window.','Check fare rules, penalties and approaching cancellation deadlines.','heartbeat.tick → cancellations.check_windows'],
   [3,'Refund follow-up','Keep waiting refunds moving.','Review ageing items and prepare the next follow-up with context.','routine.run → refunds.review_ageing'],
   [5,'Supplier chase','Follow through on the hand-off.','Track outstanding waivers and supplier responses across the desk.','schedule.tick → suppliers.follow_up'],
   [6,'Quote preparation','Bring the details together.','Prepare priced itineraries and client-ready travel documents.','routine.run → quotes.prepare']
  ][phase];
  $$('[data-team]').forEach(n=>n.classList.toggle('executing',Number(n.dataset.team)===data[0]));
  setText('#routine-title',data[1]);setText('#routine-head',data[2]);setText('#routine-copy',data[3]);setText('#ctrl-log',data[4]);
  $$('.time-track i').forEach((n,i)=>n.classList.toggle('on',i<=Math.floor(phase*1.75)));
 }
 if(product.id==='waypoint'){
  $$('[data-rank]').forEach(n=>n.style.width=(phase>=1?n.dataset.rank:18)+'%');
  setText('#waypoint-log',['context.load → preferences + constraints','options.compare → eligible combinations','decision.explain → why this option fits','proposal.prepare → human review'][phase]);
 }
 if(product.id==='maverick'){
  $$('.source').forEach((n,i)=>n.classList.toggle('receiving',phase===0?i<3:true));
  $('.market-line').style.strokeDashoffset=phase===0?'520':'0';$('#chart-alert').style.opacity=phase>=2?'1':'0';
  $$('.markets span').forEach((n,i)=>n.classList.toggle('current',i===(phase%5)));
  setText('#market-heading',['Signals, brought together.','A wider view of the market.','A movement worth reviewing.','Context for the next decision.'][phase]);
  setText('#market-copy',['Connect GDS, API and competitor intelligence across the five markets.','Compare fare movements with airline-direct and competitor context.','Surface a pricing pattern that needs the commercial team’s attention.','Explain what changed, why it matters and where the team can act.'][phase]);
  setText('#market-action',['sources → normalise → monitor','fares → compare → patterns','movement → context → alert','insight → recommendation → team'][phase]);
 }
}
function motion(){previewRoot.classList.toggle('paused',paused);$('#pause').textContent=paused?'▶ Play':'Ⅱ Pause';$('#pause').setAttribute('aria-pressed',String(paused))}
function select(index,focus=false,writeHash=true){
 selected=index;phase=index===0&&window.coConsultStage!==undefined?window.coConsultStage:media.matches?products[index].phases.length-1:0;elapsed=0;manualUntil=0;chosen='Hoi An';
 tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;$('.plus',tab).textContent=i===index?'×':'+';panels[i].hidden=i!==index});
 if(focus)tabs[index].focus();if(writeHash){try{history.replaceState(null,'','#'+products[index].id)}catch(e){}}
 render();$('#announce').textContent=products[index].name+' preview selected';
}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',event=>{const delta={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[event.key];const next=delta?(i+delta+tabs.length)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;if(next!==null){event.preventDefault();select(next,true)}})});
$('#pause').addEventListener('click',()=>{paused=!paused;motion()});
$('#replay').addEventListener('click',()=>{if(selected===0)window.coConsultPreview?.replay();phase=0;elapsed=0;manualUntil=0;chosen='Hoi An';render();$('#announce').textContent=products[selected].name+' sequence restarted'});
$$('[data-destination]').forEach(button=>button.addEventListener('click',()=>{chosen=button.dataset.destination;phase=3;elapsed=0;manualUntil=performance.now()+10000;render();$('#announce').textContent=$('#chat-followup').textContent}));
media.addEventListener('change',event=>{paused=event.matches;if(event.matches)phase=products[selected].phases.length-1;elapsed=0;motion();render()});
window.addEventListener('hashchange',()=>{const index=products.findIndex(p=>p.id===location.hash.slice(1));if(index>=0)select(index,false,false)});
if('IntersectionObserver' in window){new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.05}).observe($('.frame'))}
function tick(now){const delta=previous?Math.min(now-previous,100):0;previous=now;
 if(selected!==0&&!paused&&!document.hidden&&visible&&now>=manualUntil){elapsed+=delta;const duration=durations[phase]||5000;if(elapsed>=duration){phase=(phase+1)%products[selected].phases.length;elapsed=0;render()}else if(products[selected].id==='chatgpt'&&phase===0){setText('#typed-query',query.slice(0,Math.max(1,Math.floor(elapsed/22))))}}
 requestAnimationFrame(tick);
}
window.addEventListener('co-consult-step',e=>{if(selected===0){phase=e.detail;render();}});
const legacy={'product-panel-0':'co-consult','product-panel-1':'aibq','product-panel-2':'iqr','product-panel-chatgpt':'chatgpt','product-panel-3':'conductor','product-panel-4':'ctrlplane','product-panel-5':'waypoint'};
const initial=products.findIndex(p=>p.id===(legacy[location.hash.slice(1)]||location.hash.slice(1)));select(initial<0?0:initial,false,false);motion();requestAnimationFrame(tick);
})();

(() => {
 const root=document.querySelector('#product-previews .brief-trip');if(!root)return;
 const media=matchMedia('(prefers-reduced-motion: reduce)');let REDUCE=media.matches, visible=false;
 media.addEventListener('change',()=>{REDUCE=media.matches;if(started)go(n%TRIPS.length)});
const money = (n) => '$' + Math.round(n).toLocaleString('en-AU');
const passHTML = (t) => `<div class="bp-wrap"><div class="bp"><div class="bp-main"><div class="bp-h"><span>Trip record · ${t.pax}</span><span>run ${t.run}</span></div><div class="bp-route"><span>${t.from}</span><i></i><span>${t.to}</span></div><div class="bp-grid"><span>date<b>${t.date}</b></span><span>stay<b>${t.stay}</b></span><span>total<b>${t.total}</b></span><span>checks<b>${t.checks || '7 of 7'}</b></span><span>approved<b>${t.approver || 'consultant'}</b></span><span>saved<b>${t.saved}</b></span></div></div><div class="bp-stub"><span>SEAT<b>${t.seat}</b></span><div class="bp-code">${Array.from({ length: 22 }, (_, i) => `<i style="width:${1 + (i * 7 % 4)}px"></i>`).join('')}</div></div></div><span class="bp-stamp">BOOKED</span></div>`;

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
    () => 'The approved trip is recorded together. Each booking result is checked.'
  ];
  const $ = (id) => root.querySelector('#'+id);
  const rail = [...$('r4').children], say = $('say4'), body = $('b4'), cols = [$('cA'), $('cB'), $('cC')];
  const tr = $('tr4');
  TRIPS.forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = `${t.who} · ${t.sub}`; b.addEventListener('click', () => go(i)); tr.appendChild(b); });
  let token = 0;
  const sleep = (ms,my) => new Promise((resolve,reject)=>{
 let remaining=ms,last=performance.now();
 function tick(){if(my!==token){reject('stop');return}const now=performance.now();if(REDUCE){resolve();return}if(visible&&!document.hidden&&!document.getElementById('product-previews').classList.contains('paused'))remaining-=now-last;last=now;if(remaining<=0)resolve();else setTimeout(tick,60)}tick();
 });
  const step = (k, t) => { window.coConsultStage=k; window.dispatchEvent(new CustomEvent('co-consult-step',{detail:k})); rail.forEach((li, i) => { li.classList.toggle('on', i === k); li.classList.toggle('done', i < k); }); say.textContent = SAY[k](t); cols.forEach((c, i) => c.classList.toggle('live', [0, 0, 1, 1, -1, 2][k] === i)); };
  async function run(t, my) {
    [...tr.querySelectorAll('button')].forEach((b, i) => b.classList.toggle('on', TRIPS[i] === t));
    $('who4').innerHTML = `<span class="av">${t.av}</span><div><b>${t.who}</b><small>${t.sub}</small></div>`;
    $('txt4').textContent = ''; $('facts4').innerHTML = t.facts.map(([a, b]) => `<div class="fact"><small>${a}</small>${b}</div>`).join('');
    $('ags4').innerHTML = t.agents.map(a => `<div class="ag"><span class="ic">${svg(a.ic)}</span><div><div class="ag-n">${a.n}<span></span></div><div class="opts">${a.opts.map(([n, p, e]) => `<span class="opt">${n} ${p}${e ? `<em>${e}</em>` : ''}</span>`).join('')}</div><div class="why">${a.why}</div></div><div class="ag-p">${money(a.item[2])}</div></div>`).join('');
    $('chk4').innerHTML = t.checks.map(c => `<li>${c}</li>`).join('');
    $('trip4').innerHTML = '<div class="empty4">Your trip appears here as agents pick each part.</div>';
    $('tot4').textContent = '$0'; $('met4').style.width = '0'; $('bud4').textContent = t.budgetL; $('sav4').className = 'save4'; $('sav4').innerHTML = '';
    $('stamp4').classList.remove('in'); $('pass4').classList.remove('in'); $('appr4').classList.remove('in'); $('apy4').className = 'yes'; $('apy4').textContent = 'Approve';
    body.classList.remove('out','complete');
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
    body.classList.add('complete');step(4, t);
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
    $('pass4').classList.add('in');
    say.textContent = `Booked. ${t.who} gets one record for the whole trip.`;
    if (REDUCE) return; // Keep the completed trip visible in the still version.
    await sleep(4400, my);
    $('pass4').classList.remove('in');
    body.classList.add('out');
    await sleep(500, my);
  }
  let n = 0;
  async function go(i) {
    const my = ++token; n = i;
    try { while (my === token) { await run(TRIPS[n % TRIPS.length], my); n++; if (REDUCE) break; } } catch (e) { if (e !== 'stop') throw e; }
  }
  window.coConsultPreview={replay:()=>go(n%TRIPS.length)};
  const replay=document.createElement('button');replay.type='button';replay.textContent='Replay ↻';replay.addEventListener('click',()=>go(n%TRIPS.length));tr.appendChild(replay);
  let started = false;
  new IntersectionObserver(([e]) => { visible=e.isIntersecting; if (visible && !started) { started = true; go(0); } }, { threshold: .01 }).observe($('st4'));
})();

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


document.querySelectorAll('#product-previews canvas[data-preview-art]').forEach(cv => {
  if (cv.dataset.paintMounted) return;
  cv.dataset.paintMounted = 'true';
  cv.dataset.art = cv.dataset.previewArt;
  mountPaint(cv, SCENES[cv.dataset.previewArt]);
});
})();
