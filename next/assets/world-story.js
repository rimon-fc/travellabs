/* Traveller scenarios adapted from hero-ideas-v2.html, Idea 1.
   All prices are illustrative. Approval precedes any booking or payment. */
(function(root){
  'use strict';
  const stories = [
    {name:'Honeymoon',who:'Mia & Leo',brief:'Ten nights, an ocean-view suite, a short cruise and private tours.',saving:'$1,230 on the example flights',stops:[['airport','Business class × 2','$9,840','$8,610'],['hotel','Ocean suite / night','$1,180','$940'],['harbour','Three-night cruise','$4,200','$3,650'],['tours','Private guide','$1,100','$880']]},
    {name:'Backpacking',who:'Sam',brief:'Two weeks backpacking. An affordable fare, a clean hostel and trains between cities.',saving:'$174 on the example flight',stops:[['airport','Economy fare','$612','$438'],['hostel','Hostel bed / night','$68','$49'],['station','14-day rail pass','$420','$365'],['tours','Walking tours','$90','$60']]},
    {name:'Conference',who:'Priya',brief:'Melbourne to Singapore. A good fare, a hotel near the venue and a car for two days.',saving:'$189 on the example flight',watch:true,stops:[['airport','Return fare','$1,240','$1,051'],['hotel','Hotel / night','$289','$241'],['car','Car hire / two days','$180','$142']]},
    {name:'Family holiday',who:'The Lees',brief:'Four of us in the school holidays. Flights, a hotel with a pool, a car and a couple of tours.',saving:'$740 on the example package',stops:[['package','Holiday package','$9,660','$8,920'],['airport','Four seats together','','Included'],['hotel','Family room + pool','','Included'],['car','Seven-seater','','Included'],['tours','Theme park + reef','','Included']]}
  ];
  const steps = [
    {label:'Brief',title:'Start with the traveller.',text:s=>s.who+(s.who==='Mia & Leo'||s.who==='The Lees'?' describe':' describes')+' the trip in plain words. Their preferences and constraints stay with the job.',focus:'consultant'},
    {label:'Plan',title:'One trip. Agents working together.',text:s=>'ATFGraph coordinates '+s.stops.length+' supplier tasks in parallel. Durable state keeps the brief, progress and results together.',focus:'lab'},
    {label:'Check',title:'Every supplier call goes through Keel.',text:()=> 'Checked tools validate inputs and apply travel rules. Searches respect supplier limits; prices and terms are checked before action.',focus:'keel'},
    {label:'Compare',title:'Find value that fits the brief.',text:s=>s.name==='Family holiday'?'Compare the package with booking the parts separately, including the family’s needs and the terms.':'Compare eligible options on price, preferences and terms. These example quotes are ready for review, not booked.',focus:'hotel'},
    {label:'Approve',title:'Wait for a person’s approval.',text:()=> 'The consultant and traveller review the proposal. ATFGraph saves the job while it waits. A changed price or scope needs fresh approval.',focus:'consultant'},
    {label:'Book',title:'Coordinate the approved trip.',text:()=> 'ATP coordinates supplier commitments; controlled payments stay within approved limits. Record each outcome and recover or compensate if a part fails.',focus:'payments'},
    {label:'Watch',title:'The work continues after booking.',text:s=>s.watch?'An emitter spots a fare change and wakes the saved job. Agents check the fare rules and propose a change for approval before rebooking.':'Emitters watch for schedule changes, supplier responses and other trip events. The saved job wakes when there is work to do.',focus:'lab'}
  ];
  const duration=5.5, cycle=steps.length*duration+3;
  function mount(host,onChange){
    const choices=host.querySelector('.world-story-choices');
    const timeline=host.querySelector('.world-story-steps');
    const pins=host.querySelector('.world-pins');
    let index=0,offset=0,lastKey='',manual=null,currentTime=0,lastState;
    let places=[],pinButtons=new Map();
    const choicesButtons=stories.map((s,i)=>{
      const b=document.createElement('button');b.type='button';b.textContent=s.name;b.setAttribute('aria-pressed',String(i===0));
      b.addEventListener('click',()=>{index=i;offset=currentTime;manual=null;lastKey='';onChange();});choices.append(b);return b;
    });
    const stepButtons=steps.map((s,i)=>{
      const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span>'+s.label;
      b.addEventListener('click',()=>{index=lastState?.index??index;offset=currentTime-i*duration;if(manual!==null)manual=i;lastKey='';onChange();});li.append(b);timeline.append(li);return b;
    });
    function state(time){
      currentTime=time;
      const elapsed=Math.max(0,time-offset);
      const idx=manual===null?(index+Math.floor(elapsed/cycle))%stories.length:index;
      const phase=manual===null?Math.min(6,Math.floor((elapsed%cycle)/duration)):manual;
      lastState={story:stories[idx],phase,index:idx,focus:steps[phase].focus,stops:stories[idx].stops.map(s=>s[0]),manual:manual!==null};
      return lastState;
    }
    function update(s){
      const key=s.index+':'+s.phase+':'+s.manual;if(key===lastKey)return;lastKey=key;
      choicesButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===s.index)));
      stepButtons.forEach((b,i)=>{if(i===s.phase)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');b.classList.toggle('is-complete',i<s.phase);});
      host.querySelector('.world-story-who').textContent=s.story.who;
      host.querySelector('.world-story-brief').textContent='“'+s.story.brief+'”';
      host.querySelector('.world-story-title').textContent=steps[s.phase].title;
      host.querySelector('.world-story-text').textContent=steps[s.phase].text(s.story);
      const results=host.querySelector('.world-story-results');results.replaceChildren();
      s.story.stops.forEach((stop)=>{
        const li=document.createElement('li'),label=document.createElement('span'),value=document.createElement('strong');
        label.textContent=stop[1];value.textContent=s.phase<3?'Searching':stop[3];
        if(s.phase>=3&&stop[2]){const before=document.createElement('s');before.textContent=stop[2];value.prepend(before,' ');}
        li.append(label,value);results.append(li);
      });
      host.querySelector('.world-story-result-title').textContent=s.phase<3?'Tasks in this trip':s.phase<5?'Example options · awaiting approval':'Example trip · approved terms';
      host.querySelector('.world-story-outcome').textContent=s.phase>=3?(s.phase===6&&s.story.watch?'A further $118 fare drop found · review required':s.story.saving):'One brief, connected supplier tasks.';
      host.querySelector('.world-story-mode').textContent=s.manual?'Illustrative journey · still view':'Illustrative journey · autoplay';
    }
    function setPlaces(items){
      places=items;items.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='world-pin';b.textContent=p.name;b.setAttribute('aria-label',p.name+': '+p.text);b.addEventListener('click',()=>{host.querySelector('.world-inspect').textContent=p.name+' — '+p.text;});pins.append(b);pinButtons.set(p.id,b);});
    }
    function render(world,w,h,time,progress,reduced){
      const s=state(time);update(s);
      const visibleIds=new Set(['lab','keel','consultant','payments',...s.stops]);
      const labels=places.filter(p=>visibleIds.has(p.id)).map(p=>{const xy=world.project(p.x,p.y+.55,p.z);return{p,x:xy[0],y:xy[1]};}).sort((a,b)=>a.y-b.y);
      const rects=[];
      pinButtons.forEach((b,id)=>{b.hidden=!visibleIds.has(id)||progress<3;});
      for(const a of labels){
        const b=pinButtons.get(a.p.id);if(b.hidden)continue;
        const bw=b.offsetWidth||90,bh=b.offsetHeight||26;
        let x=Math.max(8,Math.min(w-bw-8,a.x-bw/2)),y=Math.max(12,a.y-bh-8);
        for(let tries=0;tries<12;tries++){
          if(!rects.some(r=>x<r.x+r.w+5&&x+bw+5>r.x&&y<r.y+r.h+5&&y+bh+5>r.y))break;
          y-=bh+6;if(y<8){y=Math.min(h-64,a.y+14);x=Math.max(8,Math.min(w-bw-8,x+bw+8));}
        }
        rects.push({x,y,w:bw,h:bh});world.labelLeader?.(x,y,bw,bh,a.p);b.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;
        b.classList.toggle('is-active',a.p.id===s.focus);b.classList.toggle('is-supplier',s.stops.includes(a.p.id));
      }
      return s;
    }
    function replay(time){index=lastState?.index||0;offset=time;manual=null;lastKey='';}
    function showComplete(time){index=lastState?.index||0;offset=time;manual=6;lastKey='';}
    function resume(time){if(manual!==null){offset=time-manual*duration;manual=null;lastKey='';}}
    return{state,render,setPlaces,replay,showComplete,resume};
  }
  root.TravelWorldStory={stories,steps,mount,cycle};
})(globalThis);
