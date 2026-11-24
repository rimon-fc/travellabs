/* Automatic examples only. No messages, bookings or payments are sent. */
(() => {
 const roots=[...document.querySelectorAll('[data-story-preview]')];if(!roots.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const tms=[
 ['One familiar customer','A little time by the sea.','Her next trip starts with what you already know.','Maya’s enquiry arrives. Her agent gets started.'],
 ['Preferences remembered','Her kind of escape.','Quiet rooms. Late breakfasts. The little hotel she loved.','Her preferences stay in the customer notebook.'],
 ['Prepared for your review','A coastal escape.','Flights, a stay and things to do. One plan and price to check.','The agent brings the trip together for review.'],
 ['Waiting for your decision','You check. You say yes.','Nothing is booked or paid until you approve.','The plan and price wait for a person’s approval.'],
 ['After example approval','Booked. Still looked after.','Changes, questions and replies stay with the trip.','After approval, it books and keeps watch.']
 ];
 const aibq=[
 ['What is my baggage allowance?','Let’s check the flights in your booking.','Find Miles alongside your upcoming trip.'],
 ['What is my baggage allowance?','Your trip details are already here. Which flight can I help with?','Open your booked trip and ask Miles.'],
 ['What is my baggage allowance?','You have three flights in this example trip. Which flight is your question about?','Miles keeps the question connected to the booking.'],
 ['BNE → ATH, please.','Let’s look at the baggage details for that flight in your booking.','A specific flight. A more useful answer.'],
 ['Can I change that flight?','A consultant can help with changes. I can point you in the right direction.','Booking changes and refunds go to a consultant.']
 ];
 const states=new Map(roots.map(el=>[el,{step:0,elapsed:0,visible:false}]));
 function put(el,sel,text){const n=el.querySelector(sel);if(n)n.textContent=text}
 function show(el,step){const s=states.get(el);s.step=step;s.elapsed=0;el.dataset.phase=String(step);
  el.querySelectorAll('[data-story-step]').forEach(b=>{if(b.closest('.story-controls'))b.setAttribute('aria-pressed',String(Number(b.dataset.storyStep)===step))});
  if(el.dataset.storyPreview==='tms'){const c=tms[step];put(el,'[data-tms-label]',c[0]);put(el,'[data-tms-heading]',c[1]);put(el,'[data-tms-detail]',c[2]);put(el,'[data-story-status]',c[3]);el.querySelector('[data-tms-stamp]').hidden=step!==4}
  else{const c=aibq[step];put(el,'[data-miles-question]',c[0]);put(el,'[data-miles-answer]',c[1]);put(el,'[data-story-status]',c[2]);el.querySelector('[data-miles-routes]').hidden=step>2}
 }
 const allowed=()=>!reduced.matches&&!document.hidden&&!document.body.classList.contains('motion-paused');
 let frame=0,last=null;
 function sync(){const active=allowed()&&roots.some(el=>states.get(el).visible);roots.forEach(el=>el.classList.toggle('is-playing',allowed()&&states.get(el).visible));if(active&&!frame){last=null;frame=requestAnimationFrame(tick)}else if(!active){cancelAnimationFrame(frame);frame=0;last=null}}
 function tick(now){frame=0;if(!allowed()){sync();return}const dt=last===null?0:Math.min(now-last,200);last=now;roots.forEach(el=>{const s=states.get(el);if(!s.visible||el.contains(document.activeElement))return;s.elapsed+=dt;if(s.elapsed>=5000)show(el,(s.step+1)%5)});if(roots.some(el=>states.get(el).visible))frame=requestAnimationFrame(tick)}
 roots.forEach(el=>{show(el,0);el.querySelectorAll('[data-story-step]').forEach(b=>b.addEventListener('click',()=>{show(el,Number(b.dataset.storyStep));if(el.dataset.storyPreview==='aibq'){const chat=el.querySelector('.miles-chat'),rail=el.querySelector('.miles-phones');rail.scrollTo({left:chat.offsetLeft-rail.offsetLeft,behavior:reduced.matches?'instant':'smooth'})}}))});
 if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{entries.forEach(e=>states.get(e.target).visible=e.isIntersecting);sync()},{threshold:.05});roots.forEach(el=>io.observe(el))}else{states.forEach(s=>s.visible=true)}
 document.addEventListener('visibilitychange',sync);window.addEventListener('lab-motion',sync);reduced.addEventListener('change',sync);sync();
})();
