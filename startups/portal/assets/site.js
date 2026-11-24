(()=>{'use strict';
const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('mobile-nav');
function closeMenu(){nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.textContent='Menu'}
menu.addEventListener('click',()=>{const open=nav.hidden;nav.hidden=!open;menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu'});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){closeMenu();menu.focus()}});document.addEventListener('click',e=>{if(!nav.hidden&&!nav.contains(e.target)&&!menu.contains(e.target))closeMenu()});
const dialog=document.getElementById('enquiry-dialog'),form=document.getElementById('enquiry-form'),result=dialog.querySelector('.enquiry-result'),output=document.getElementById('enquiry-output'),status=dialog.querySelector('.form-status');let opener;
document.querySelectorAll('[data-enquire]').forEach(button=>button.addEventListener('click',()=>{opener=button;dialog.showModal();status.textContent=''}));
dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const entries=[...new FormData(form)].filter(([,v])=>String(v).trim());output.value=document.title.split(' — ')[0]+' enquiry\n\n'+entries.map(([k,v])=>k+': '+String(v).trim()).join('\n\n');form.hidden=true;result.hidden=false;status.textContent='';output.focus()});
dialog.querySelector('[data-edit]').addEventListener('click',()=>{form.hidden=false;result.hidden=true;status.textContent='';form.querySelector('input,textarea').focus()});
dialog.querySelector('[data-copy]').addEventListener('click',async()=>{try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(output.value);status.textContent='Copied. You can paste this into a message.'}catch{output.focus();output.select();status.textContent='The enquiry is selected. Use your device’s Copy command to copy it.'}});
const steps=[...document.querySelectorAll('[data-step]')];if(!steps.length)return;
const title=document.getElementById('demo-title'),notes=document.getElementById('demo-notes'),note=document.getElementById('demo-note'),approve=document.getElementById('approve-example'),demoStatus=document.getElementById('demo-status');let approved=false;
const states=[
 ['The little things matter.',['Somewhere quiet, by the sea','A late breakfast, please','The room she loved last time'],'Remembered for next time.'],
 ['A plan, ready to review.',['A quiet coastal stay','Room and travel options prepared','Price and terms for you to check'],'Ready for your judgement.'],
 ['Your say-so comes first.',['Check the plan, price and terms','Make any changes you want','Approve only when you’re ready'],'Nothing booked. Nothing paid.'],
 ['Your example trip is booked.',['Booking confirmations recorded','Changes will be brought to you','Maya’s details stay with her trip'],'You look after Maya. We help with the rest.']
];
function show(n){if(n===3&&!approved)n=2;const s=states[n];steps.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));title.textContent=s[0];notes.replaceChildren(...s[1].map(t=>{const li=document.createElement('li');li.textContent=t;return li}));note.textContent=s[2];approve.hidden=n!==2;demoStatus.textContent=n===3?'Example only. No real booking or payment was made.':'No real booking or payment is made.'}
steps.forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.step))));approve.addEventListener('click',()=>{approved=true;show(3)});document.getElementById('reset-example').addEventListener('click',()=>{approved=false;show(0)});show(0);
})();
