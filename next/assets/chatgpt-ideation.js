(() => {
 const root=document.querySelector('.mcp-results-preview');if(!root)return;
 const tabs=[...root.querySelectorAll('[data-mcp-scene]')],panels=[...root.querySelectorAll('[data-mcp-panel]')],media=matchMedia('(prefers-reduced-motion: reduce)');
 const questions=['Find me Fiji holiday package deals.','Find me flights from Melbourne to Tokyo, departing 12 August and returning 26 August.'];
 const answers=['Compare the stays, inclusions and price in the conversation. Open a card to explore the example.','Compare return options via Singapore, Bangkok or Kuala Lumpur, with baggage shown alongside the fare.'];
 const details={
  'holiday-0':'Example: DoubleTree Resort by Hilton, Sonaisali Island. Seven nights on Fiji’s Coral Coast, with flights. The supplied example starts at A$2,299 per person.',
  'holiday-1':'Example: The Naviti Resort. Seven nights on Fiji’s Coral Coast, with flights. The supplied example starts at A$2,499 per person.',
  'holiday-2':'Example: South Pacific Escape. A cruise covering New Caledonia, Vanuatu and Fiji, with flights. The supplied example starts at A$4,990 per person.',
  'flight-0':'Example: Singapore Airlines via Singapore, A$1,551.62 return, with 25 kg checked baggage. Compare the flight times before choosing.',
  'flight-1':'Example: Thai Airways via Bangkok, A$1,627.68 return, with 23 kg checked baggage. Flight and fare details shown here are illustrative.',
  'flight-2':'Example: Malaysia Airlines via Kuala Lumpur, A$1,644.85 return, with 25 kg checked baggage. Exact flight times are not shown in this example.'
 };
 let index=0,elapsed=0,last=null,frame=0,visible=false;
 function select(next,focus=false){index=next;elapsed=0;tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index});root.querySelector('[data-mcp-question]').textContent=questions[index];root.querySelector('[data-mcp-answer]').textContent=answers[index];root.querySelector('[data-mcp-worked]').textContent=index?'Comparing return flight options':'Finding holiday options';root.querySelectorAll('.mcp-deal-card').forEach(card=>card.classList.remove('is-selected'));if(focus)tabs[index].focus();}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();select(e.key==='Home'?0:e.key==='End'?1:1-i,true)});});
 root.querySelectorAll('[data-mcp-result]').forEach(button=>button.addEventListener('click',()=>{elapsed=0;root.querySelectorAll('.mcp-deal-card').forEach(card=>card.classList.toggle('is-selected',card===button.closest('.mcp-deal-card')));root.querySelector('[data-mcp-answer]').textContent=details[button.dataset.mcpResult];}));
 const running=()=>visible&&!document.hidden&&!media.matches&&!document.body.classList.contains('motion-paused');
 function tick(now){frame=0;if(!running()){last=null;return}if(last===null)last=now;elapsed+=Math.min(now-last,160);last=now;if(elapsed>=11000&&!root.contains(document.activeElement))select(1-index);frame=requestAnimationFrame(tick)}
 function sync(){root.classList.toggle('is-running',running());if(running()&&!frame){last=null;frame=requestAnimationFrame(tick)}else if(!running()){cancelAnimationFrame(frame);frame=0;last=null}}
 window.addEventListener('lab-motion',sync);document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
 if('IntersectionObserver'in window)new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()},{threshold:.01}).observe(root);else{visible=true;sync()}select(0);
})();
