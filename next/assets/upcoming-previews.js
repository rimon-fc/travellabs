/* Small editorial demos. All trips, payments and conversations are illustrative. */
(() => {
 const studies=[...document.querySelectorAll('[data-product-study]')];if(!studies.length)return;
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const copy={
  tms:['Preferences recalled. A trip takes shape.','The traveller reviews the trip before any booking.','After approval and booking, the same record keeps the journey in view.'],
  canvas:['Keep ideas, places and the itinerary on one shared board.','Compare stays and experiences with your consultant.','Keep the traveller’s question next to the working itinerary.'],
  voice:['Listening to an everyday travel question.','Answering from approved travel guidance.','A change request goes to a consultant.'],
  models:['Compare recommendations against the traveller’s brief.','A consultant’s judgement adds the reason behind a choice.','Evaluate with booking outcomes before putting a model to use.'],
  payments:['The booking and the traveller’s permission stay together.','Check the amount, expiry and allowed use.','An example payment outcome returns to the booking record.'],
  concierge:['The conversation continues from voice to messaging.','Trip details stay with the question.','A consultant receives the context and the open request.']
 };
 const states=new Map(studies.map(el=>[el,{step:0,elapsed:0,visible:false}]));
 function put(el,selector,text){const node=el.querySelector(selector);if(node&&node.textContent!==text)node.textContent=text;}
 function render(el,step){
  const kind=el.dataset.productStudy;
  put(el,'[data-study-status]',copy[kind][step]);
  el.querySelectorAll('[data-study-step]').forEach(node=>node.classList.toggle('is-active',Number(node.dataset.studyStep)===step));
  el.querySelectorAll('.study-progress i').forEach((node,i)=>node.classList.toggle('is-active',i===step));
  if(kind==='canvas'){
   el.dataset.boardPhase=String(step);
   el.querySelectorAll('[data-board-note]').forEach(node=>node.classList.toggle('is-active',Number(node.dataset.boardNote)===[0,1,4][step]));
  }
  if(kind==='voice'){
   put(el,'[data-study-question]',step===2?'“Could you change my flight as well?”':'“Where do I find my baggage allowance?”');
   put(el,'[data-study-answer]',['Let’s check the baggage section on your ticket.','Your ticket lists the allowance for your booking.','A consultant can help with a booking change.'][step]);
   put(el,'[data-study-answer-detail]',step===2?'The request is passed on. No booking changes are made here.':'Guidance from approved travel FAQs.');
  }
  if(kind==='models'){
   el.querySelectorAll('.study-card').forEach((node,i)=>node.classList.toggle('is-active',i===0));
   put(el,'[data-study-feedback]',['Consultant choice adds context.','Why the quieter stay was chosen.','Check what worked in the actual trip.'][step]);
   put(el,'[data-study-feedback-detail]',['What was chosen, what mattered, and why.','The traveller valued a calm stay and easy train access.','Use feedback and outcomes to evaluate the recommendation.'][step]);
  }
  if(kind==='payments')put(el,'[data-study-payment]',['Approval recorded','Within the approved limit','Example receipt saved'][step]);
  if(kind==='concierge'){
   put(el,'[data-study-answer]',['I’ve kept your arrival details with the request.','Your hotel and arrival time are here, so you don’t need to repeat them.','I’ll pass the early check-in request to your consultant.'][step]);
   put(el,'[data-study-answer-detail]',step===2?'Availability still needs confirmation. The conversation goes with the handoff.':'No need to start again when you switch to messaging.');
   put(el,'[data-study-handoff]',['Context ready','Request prepared','Ready for a person'][step]);
  }
 }
 const allowed=()=>!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused');
 let frame=0,last=null;
 function sync(){const play=allowed();studies.forEach(el=>el.classList.toggle('is-running',play&&states.get(el).visible));const any=play&&studies.some(el=>states.get(el).visible);if(any&&!frame){last=null;frame=requestAnimationFrame(tick)}else if(!any){cancelAnimationFrame(frame);frame=0;last=null}}
 function tick(now){frame=0;if(!allowed()){sync();return}if(last===null)last=now;const dt=Math.min(now-last,200);last=now;studies.forEach(el=>{const state=states.get(el);if(!state.visible)return;state.elapsed+=dt;if(state.elapsed>=4800){state.elapsed=0;state.step=(state.step+1)%3;render(el,state.step)}});if(studies.some(el=>states.get(el).visible))frame=requestAnimationFrame(tick);}
 studies.forEach(el=>render(el,0));
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{states.get(target).visible=isIntersecting});sync()},{threshold:.05});studies.forEach(el=>observer.observe(el));}else{studies.forEach(el=>states.get(el).visible=true)}
 document.addEventListener('visibilitychange',sync);window.addEventListener('lab-motion',sync);media.addEventListener('change',sync);sync();
})();
