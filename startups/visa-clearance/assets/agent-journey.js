(()=>{
  'use strict';
  const figure=document.querySelector('.agent-figure');if(!figure)return;
  const scene=figure.querySelector('.agent-scene'),buttons=Array.from(figure.querySelectorAll('[data-agent-select]'));
  const toggle=figure.querySelector('[data-agent-motion]'),media=matchMedia('(prefers-reduced-motion: reduce)');
  const stages=[
    ['AI agent / checks','“What does this traveller need?”','The agent checks the passport country, route and stops. It puts the papers needed into a clear list.'],
    ['AI agent / prepares','“Let’s get the forms ready.”','The agent uses the trip details to prepare the forms and points out any missing papers.'],
    ['A real person / reviews','“A person checks before we send.”','A trained reviewer checks the application. Preparing the forms is not the same as approval.'],
    ['AI agent / follows up','“Here’s what happens next.”','The agent follows progress and checks for rule changes before departure. The government decides the outcome.']
  ];
  let step=0,paused=false,visible=false,timer=null;
  function render(){
    const [owner,title,detail]=stages[step];scene.dataset.agentStage=String(step);
    figure.querySelector('[data-agent-owner]').textContent=owner;
    figure.querySelector('[data-agent-title]').textContent=title;
    figure.querySelector('[data-agent-detail]').textContent=detail;
    figure.querySelector('[data-agent-count]').textContent=`0${step+1} / 04`;
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===step)));
    figure.querySelectorAll('.agent-progress i').forEach((dot,i)=>dot.classList.toggle('current',i===step));
  }
  function sync(){
    if(timer!==null){clearInterval(timer);timer=null;}
    const off=paused||media.matches,playing=!off&&visible&&!document.hidden;
    document.body.classList.toggle('visa-motion-paused',off);
    document.body.classList.toggle('visa-motion-playing',playing);
    toggle.textContent=media.matches?'Reduced motion':paused?'Play motion ▷':'Pause motion Ⅱ';
    toggle.setAttribute('aria-pressed',String(off));toggle.disabled=media.matches;
    if(playing)timer=setInterval(()=>{step=(step+1)%stages.length;render()},6000);
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{step=Number(button.dataset.agentSelect);paused=true;render();sync()}));
  toggle.addEventListener('click',()=>{paused=!paused;sync()});
  document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync()},{threshold:.12}).observe(figure)}else visible=true;
  render();sync();
})();
