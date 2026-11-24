(() => {
  const toc=document.querySelector('.toc details');
  if(toc && window.matchMedia('(max-width:760px)').matches) toc.open=false;
  const links=[...document.querySelectorAll('.toc ol a')];
  const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress').style.width=(max>0?scrollY/max*100:0)+'%';let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<160)current=s;for(const a of links){const active=a.hash==='#'+current?.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}};
  let queued=false;addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{update();queued=false;});}},{passive:true});update();
  document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
  const dialog=document.querySelector('.figure-dialog');let opener=null;
  const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const setFlowMotion=(figure,paused)=>{
    const img=figure.querySelector('img');
    const button=figure.querySelector('[data-pause-flow]');
    const src=paused?img.dataset.stillSrc:img.dataset.animatedSrc;
    img.src=src;
    figure.querySelector('[data-enlarge]').dataset.enlarge=src;
    button.setAttribute('aria-pressed',String(paused));
    button.textContent=paused?'Play motion':'Pause motion';
    button.setAttribute('aria-label',(paused?'Play':'Pause')+' animation for '+figure.id.replace('-',' '));
    if(dialog.open && opener?.closest('figure')===figure)dialog.querySelector('img').src=src;
  };
  document.querySelectorAll('.flow-figure').forEach(figure=>{
    setFlowMotion(figure,motionPreference.matches);
    figure.querySelector('[data-pause-flow]').addEventListener('click',e=>setFlowMotion(figure,e.currentTarget.getAttribute('aria-pressed')!=='true'));
  });
  motionPreference.addEventListener('change',e=>document.querySelectorAll('.flow-figure').forEach(f=>setFlowMotion(f,e.matches)));
  let printMotionState=[];
  addEventListener('beforeprint',()=>{
    printMotionState=[...document.querySelectorAll('.flow-figure')].map(f=>[f,f.querySelector('[data-pause-flow]').getAttribute('aria-pressed')==='true']);
    printMotionState.forEach(([f])=>setFlowMotion(f,true));
  });
  addEventListener('afterprint',()=>{printMotionState.forEach(([f,paused])=>setFlowMotion(f,paused));printMotionState=[];});
  document.querySelectorAll('[data-enlarge]').forEach(button=>button.addEventListener('click',()=>{const fig=button.closest('figure');opener=button;dialog.querySelector('img').src=button.dataset.enlarge;dialog.querySelector('img').alt=fig.querySelector('img').alt;dialog.querySelector('p').textContent=fig.querySelector('figcaption').textContent.replace('TikZ source','').replace('Vector SVG','').replace('Vector plot','').replace('Vector figure','').trim();dialog.showModal();}));
  const close=()=>dialog.close();dialog.querySelector('[data-close-figure]').addEventListener('click',close);dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  const sketchHost=document.querySelector('[data-sketch-graph]');
  let sketchPaused=false;
  const escapeSketch=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function drawSketch(labels,stop,branch=''){
    if(!sketchHost)return;
    const final=Math.min(stop,labels.length-1), step=690/labels.length;
    const xs=labels.map((_,i)=>110+i*step);
    let drawing='<svg viewBox="0 0 800 290" role="img" aria-label="'+escapeSketch(labels.slice(0,final+1).join(' → ')+(stop<labels.length?' — '+(branch||'stopped'):' — completed'))+'"><defs><pattern id="scenario-check" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h2v2H0zM2 2h2v2H2z" fill="#376d69"/></pattern></defs><rect width="800" height="290" fill="#f5f4ef"/><text x="18" y="25" class="matrix-heading">SCENARIO / STATE TRANSITIONS</text>';
    for(let i=1;i<xs.length;i++){
      const x=xs[i-1],xx=xs[i],d='M'+x+' 69C'+(x+step*.3)+' 110 '+(xx-step*.3)+' 110 '+xx+' 69';
      drawing+='<path d="'+d+'" class="matrix-wire"/>';
      if(i<=final)drawing+='<path d="'+d+'" class="matrix-flow" style="animation-delay:-'+i*.4+'s"/>';
    }
    labels.forEach((label,i)=>{
      const x=xs[i];
      drawing+='<text x="'+x+'" y="50" text-anchor="middle" class="matrix-label">'+escapeSketch(label)+'</text><rect x="'+(x-7)+'" y="62" width="14" height="14" fill="'+(i<stop?'url(#scenario-check)':'#f5f4ef')+'" stroke="#68716c"/><path d="M'+x+' 112V243" class="matrix-guide"/>';
    });
    ['checked',branch||'stopped','not reached'].forEach((name,row)=>{
      const y=137+row*43;
      drawing+='<text x="18" y="'+(y+15)+'" class="matrix-label">'+escapeSketch(name)+'</text>';
      xs.forEach((x,i)=>{
        const active=(row===0&&i<stop)||(row===1&&i===stop)||(row===2&&i>stop);
        drawing+='<rect x="'+(x-10)+'" y="'+y+'" width="20" height="20" fill="'+(active?(row===1?'#a37c3a':row===0?'url(#scenario-check)':'#e4ebe5'):'none')+'" stroke="#a5aaa4"/>';
      });
    });
    drawing+='<path d="M18 257H782" class="matrix-guide"/><text x="18" y="278" class="matrix-note">Illustrative state only · selected paths do not report live execution</text></svg>';
    sketchHost.innerHTML=drawing;sketchHost.classList.toggle('is-paused',sketchPaused);
  }
  document.querySelector('[data-pause-sketch]')?.addEventListener('click',e=>{sketchPaused=!sketchPaused;sketchHost?.classList.toggle('is-paused',sketchPaused);e.currentTarget.setAttribute('aria-pressed',String(sketchPaused));e.currentTarget.textContent=sketchPaused?'Resume animation':'Pause animation';});
  const data=document.querySelector('#scenario-data');
  if(data){const d=JSON.parse(data.textContent);const buttons=[...document.querySelectorAll('[data-scenario]')];const stages=[...document.querySelectorAll('.scenario-stages li')];const set=i=>{const s=d.cases[i];buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));stages.forEach((li,j)=>{li.classList.toggle('done',j<s.stop);li.classList.toggle('blocked',j===s.stop);});document.querySelector('[data-outcome-title]').textContent=s.title;document.querySelector('[data-outcome-copy]').textContent=s.text;drawSketch(d.stages,s.stop);};buttons.forEach((b,i)=>b.addEventListener('click',()=>set(i)));set(0);}
  const probability=document.querySelector('#probability');
  if(probability){const updateConfidence=()=>{const p=Number(probability.value)/100;const h=-(p===0?0:p*Math.log(p))-((1-p)===0?0:(1-p)*Math.log(1-p));const c=1-h/Math.log(2);document.querySelector('#probability-value').textContent=Math.round(p*100)+'%';document.querySelector('#confidence-value').textContent='Entropy confidence: '+c.toFixed(3);document.querySelector('#confidence-route').textContent=c<.5?'this comparison escalates':'this comparison passes';drawSketch(['Options','Distribution','Entropy',c<.5?'Escalate':'Pass threshold','Check authority'],4,'separate check');};probability.addEventListener('input',updateConfidence);updateConfidence();}
  document.querySelector('[data-copy-citation]')?.addEventListener('click',async()=>{const text=document.querySelector('[data-citation]').textContent;const status=document.querySelector('.citation-status');try{await navigator.clipboard.writeText(text);status.textContent='Citation copied.';}catch{const sel=getSelection(),r=document.createRange();r.selectNodeContents(document.querySelector('[data-citation]'));sel.removeAllRanges();sel.addRange(r);status.textContent='Citation selected. Copy it using your keyboard.';}});
})();
