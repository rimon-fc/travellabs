(()=>{'use strict';const scene=document.querySelector('.agent-day');if(!scene)return;
const points=[...scene.querySelectorAll('[data-day-point]')],toggle=scene.querySelector('[data-day-toggle]'),media=matchMedia('(prefers-reduced-motion: reduce)');
const states=[
['YOUR AGENT NOTICES','Maya asks. The agent gets started.','The enquiry is saved with her customer record. You don’t need to open the app.','Her new enquiry.','Work starts without a prompt.'],
['YOUR AGENT PREPARES','A trip that feels like Maya.','Her preferences guide the flights, hotel and activities. A plan and price are ready for you.','Her new trip plan.','The customer’s story guides the work.'],
['YOU DECIDE','You check the plan and say yes.','In this example, you approve the plan and payment. In real use, the agent waits for your permission.','The plan you approved.','Your approval comes before booking or payment.'],
['YOUR AGENT BOOKS','The booking is made. The details are saved.','After approval, it books the trip, records the payment and keeps the confirmations with Maya’s record.','Her booking and payment.','Customer records and trip details stay together.'],
['YOUR AGENT KEEPS WATCH','A change is noticed while you’re away.','The agent checks a new flight time against the rest of the trip. An update is ready for your review.','A change to her flight.','It keeps watching. You don’t have to keep asking.'],
['YOUR AGENT REMEMBERS','The trip ends. The story carries on.','Maya’s feedback is saved for next time. Her next enquiry starts with what you already know.','She loved the little hotel.','From the first enquiry to the next trip.']
];let stage=0,visible=false,paused=false,timer=null;
function render(){scene.dataset.dayStage=String(stage);const row=states[stage];['owner','title','copy','memory','status'].forEach((key,i)=>scene.querySelector('[data-day-'+key+']').textContent=row[i]);points.forEach((el,i)=>{el.querySelector('button').setAttribute('aria-pressed',String(i===stage));if(i===stage)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current')});scene.classList.remove('day-enter');if(!media.matches){void scene.offsetWidth;scene.classList.add('day-enter')}}
function sync(){if(timer!==null)clearInterval(timer);timer=null;const playing=visible&&!paused&&!media.matches&&!document.hidden;scene.classList.toggle('day-playing',playing);scene.classList.toggle('day-paused',!playing);toggle.textContent=media.matches?'Motion off · device preference':paused?'Play example':'Pause example';toggle.setAttribute('aria-pressed',String(paused||media.matches));toggle.disabled=media.matches;if(playing)timer=setInterval(()=>{stage=(stage+1)%states.length;render()},2800)}
scene.querySelectorAll('[data-day-select]').forEach(button=>button.addEventListener('click',()=>{stage=Number(button.dataset.daySelect);render();sync()}));
toggle.addEventListener('click',()=>{paused=!paused;sync()});media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync()},{threshold:.12}).observe(scene);else visible=true;render();sync();
})();
