(()=>{'use strict';
const desk=document.querySelector('.agent-desk');if(!desk)return;
const toggle=document.querySelector('[data-desk-toggle]'),status=document.querySelector('[data-desk-status]'),story=[...document.querySelectorAll('[data-story-step]')],media=matchMedia('(prefers-reduced-motion: reduce)');
const messages=['Maya asks for a trip.','It remembers what Maya likes.','It prepares a trip for you to check.','You check the plan and say yes.','After approval, it books and keeps watch.'];
let phase=0,paused=false,visible=true,timer=null;
function render(){desk.dataset.deskPhase=String(phase);status.textContent=messages[phase];story.forEach((item,i)=>{if(i===phase)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current')})}
function sync(){if(timer!==null)clearInterval(timer);timer=null;const playing=!paused&&!media.matches&&!document.hidden&&visible;desk.classList.toggle('desk-is-playing',playing);desk.classList.toggle('desk-is-paused',!playing);toggle.textContent=media.matches?'Motion off · device preference':paused?'Play example':'Pause example';toggle.setAttribute('aria-pressed',String(paused||media.matches));toggle.disabled=media.matches;if(playing)timer=setInterval(()=>{phase=(phase+1)%messages.length;render()},2200)}
toggle.addEventListener('click',()=>{paused=!paused;sync()});
document.addEventListener('visibilitychange',sync);media.addEventListener('change',()=>{if(media.matches){phase=3;render()}sync()});
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.target===desk){visible=e.isIntersecting;sync()}}},{threshold:.12});observer.observe(desk)}
if(media.matches)phase=3;render();sync();
})();
