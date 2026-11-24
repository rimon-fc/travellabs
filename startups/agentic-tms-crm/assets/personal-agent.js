(()=>{'use strict';
const page=document.querySelector('.example-page');if(!page)return;
const buttons=[...document.querySelectorAll('[data-step]')],title=document.getElementById('demo-title'),notes=document.getElementById('demo-notes'),note=document.getElementById('demo-note'),approval=document.getElementById('approve-example'),motion=document.getElementById('demo-motion'),progress=document.getElementById('demo-progress'),announcement=document.getElementById('demo-announcement'),content=document.querySelector('.example-content');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let stage=0,paused=false,visible=false,timer=null;
const states=[
['Maya asks for a trip.',['“Somewhere quiet, by the sea?”','Her agent notices the enquiry.','You don’t have to open the app.'],'The work starts with her message.','Enquiry'],
['It remembers what she likes.',['A quiet room.','A late breakfast.','The little hotel she loved last time.'],'No need to tell the whole story again.','Remember'],
['Her trip takes shape.',['Flights that fit.','A hotel she’ll like.','A plan and price for you to check.'],'The groundwork is ready.','Plan'],
['You check. You say yes.',['You read the plan and price.','You can change anything.','In this example, you approve the booking.'],'The agent waits for your decision in real use.','Approve'],
['It books and keeps watch.',['After your approval, it makes the bookings.','It saves the confirmations.','It flags new replies and changes.'],'You look after Maya. It looks after the details.','Book & watch']
];
function sync(){if(timer!==null)clearInterval(timer);timer=null;const moving=!paused&&!reduced.matches&&!document.hidden;motion.textContent=reduced.matches?'Motion off · device preference':paused?'Play example':'Pause example';motion.setAttribute('aria-pressed',String(paused||reduced.matches));motion.disabled=reduced.matches;page.classList.toggle('example-paused',!moving);if(moving&&visible)timer=setInterval(()=>show((stage+1)%states.length),4200)}
function show(next,manual=false){stage=next;const s=states[stage];page.dataset.demoStage=String(stage);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===stage)));title.textContent=s[0];notes.replaceChildren(...s[1].map(text=>{const li=document.createElement('li');li.textContent=text;return li}));note.textContent=s[2];approval.hidden=stage!==3;progress.textContent=s[3]+' · '+(stage+1)+' of 5';content.classList.remove('demo-enter');if(!reduced.matches){void content.offsetWidth;content.classList.add('demo-enter')}if(manual)announcement.textContent=s[0]+' '+s[2];sync()}
buttons.forEach(b=>b.addEventListener('click',()=>{show(Number(b.dataset.step),true)}));
motion.addEventListener('click',()=>{paused=!paused;sync()});
document.getElementById('reset-example').addEventListener('click',()=>{paused=false;show(0,true)});
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.12}).observe(page);else visible=true;
show(0);
})();
