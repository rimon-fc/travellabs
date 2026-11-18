/* Display saved Lens outputs. This page never invokes the model. */
(()=>{
  'use strict';
  const data=document.getElementById('waypoint-paper-examples');
  const figure=document.getElementById('decision-explorer');
  if(!data||!figure)return;
  const examples=JSON.parse(data.textContent);
  const buttons=Array.from(figure.querySelectorAll('[data-waypoint-example]'));
  const slider=document.getElementById('waypoint-threshold');
  let index=0;
  function render(){
    const example=examples[index];
    figure.querySelector('[data-waypoint-state]').textContent=example.state;
    figure.querySelector('[data-waypoint-question]').textContent=example.question;
    figure.querySelector('[data-waypoint-note]').textContent=example.note;
    figure.querySelector('[data-waypoint-confidence]').textContent=example.confidence.toFixed(4);
    const bars=figure.querySelector('[data-waypoint-bars]');
    bars.replaceChildren();
    for(const [key,p] of Object.entries(example.probabilities)){
      const row=document.createElement('div');row.className='wp-bar-row';
      const name=document.createElement('span');name.textContent=key.replaceAll('_',' ');
      const track=document.createElement('span');track.className='wp-bar';track.setAttribute('aria-hidden','true');
      const fill=document.createElement('i');fill.style.width=(p*100)+'%';track.appendChild(fill);
      const value=document.createElement('b');value.textContent=(p*100).toFixed(1)+'%';
      row.append(name,track,value);bars.appendChild(row);
    }
    const threshold=Number(slider.value),escalate=example.confidence<threshold;
    document.getElementById('waypoint-threshold-value').textContent=threshold.toFixed(2);
    const decision=figure.querySelector('[data-waypoint-decision]');
    decision.textContent=escalate?'Escalate for review':'Passes this confidence check';
    decision.dataset.escalate=String(escalate);
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{index=Number(button.dataset.waypointExample);render()}));
  slider.addEventListener('input',render);
  render();
})();
