(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=false;
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const demos=[...document.querySelectorAll('.demo,.scene')];
function render(el,n,finish=false){
 const steps=[...el.querySelectorAll('.demo-step')];
 steps.forEach((step,i)=>{step.classList.toggle('current',!finish&&i===n%Math.max(1,steps.length));step.classList.toggle('done',finish||i<n%Math.max(1,steps.length));const r=step.querySelector('.step-result');if(r)r.textContent=finish||i<n%steps.length?'✓':i===n%steps.length?'Working':'Ready';});
 if(el.dataset.demo==='rebook'){
  const failure=n>=7&&!finish,step=n%7;
  el.querySelector('[data-original]').textContent=finish||(!failure&&step>=5)?'Released after replacement confirmed':'Confirmed · keep in place';
  el.querySelector('[data-replacement]').textContent=finish?'Replacement confirmed':step<3?'Checking the same trip and terms':failure?'Unavailable · stop here':'Replacement confirmed';
  el.querySelector('[data-safe-result]').textContent=finish||(!failure&&step>=5)?'The new booking is confirmed. The original can be released.':failure&&step>=3?'Keep the original booking. A lower price alone is not enough.':'Secure the replacement before releasing the original.';
 }
}
demos.forEach(el=>{el._frame=0;render(el,0,reduced.matches);});
const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{target._visible=isIntersecting;target.classList.toggle('playing',isIntersecting&&!paused&&!reduced.matches);}),{threshold:.12});demos.forEach(el=>observer.observe(el));
setInterval(()=>{if(paused||reduced.matches||document.hidden)return;demos.forEach(el=>{if(!el._visible)return;el._frame=(el._frame+1)%(el.dataset.demo==='rebook'?14:Math.max(6,el.querySelectorAll('.demo-step').length));render(el,el._frame);});},1500);
const toggle=document.querySelector('.motion-toggle');toggle?.addEventListener('click',()=>{paused=!paused;document.body.classList.toggle('motion-off',paused);toggle.textContent=paused?'▶ Resume motion':'Ⅱ Pause motion';toggle.setAttribute('aria-pressed',String(paused));window.dispatchEvent(new CustomEvent('lab-motion',{detail:{paused}}));});
reduced.addEventListener('change',()=>{demos.forEach(el=>{render(el,el._frame,reduced.matches);el.classList.toggle('playing',el._visible&&!paused&&!reduced.matches);});});

const form=document.querySelector('#brief-form');
if(form){
 const status=form.querySelector('.brief-status');
 const brief=()=>{const d=new FormData(form);return ['TravelLabs — Partnership brief','',`Name: ${String(d.get('name')||'').trim()}`,`Organisation: ${String(d.get('organisation')||'').trim()}`,`Email: ${String(d.get('email')||'').trim()}`,`Interest: ${String(d.get('interest')||'')}`,'','What we want to work on:',String(d.get('challenge')||'').trim()].join('\n');};
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;window.location.href='mailto:rimon@travellabs.systems?subject='+encodeURIComponent('Build travel with us — partnership brief')+'&body='+encodeURIComponent(brief());status.textContent='Review and send the draft in your email app. Nothing has been sent by this page.';});
 form.querySelector('[data-copy-brief]')?.addEventListener('click',async()=>{if(!form.reportValidity())return;try{await navigator.clipboard.writeText(brief());status.textContent='Brief copied. You can paste it into a message.';}catch{status.textContent='Clipboard access is unavailable. Use Draft your email instead.';}});
}
})();
