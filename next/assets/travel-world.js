/* An original, locally rendered travel world. No remote libraries or services. */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const noise = (n) => { const v = Math.sin(n * 91.345 + 73.46) * 47453.545; return v - Math.floor(v); };
  const ease = v => 1 - Math.pow(1 - clamp(v, 0, 1), 3);
  const places = [
    {id:'airport',name:'Flights',x:-3,z:-5.6,y:1.3,text:'Airline tools search and compare fares, availability and fare conditions.'},
    {id:'lab',name:'ATFGraph',x:-.3,z:-.6,y:3.3,text:'Durable jobs coordinate agents, keep progress and wait for the right signal.'},
    {id:'keel',name:'Keel',x:2.6,z:-1.2,y:2.3,text:'The gateway checks tool inputs, supplier rules, prices and permission before action.'},
    {id:'hotel',name:'Hotels',x:5.4,z:-3.1,y:4.4,text:'Compare rooms against preferences, rates and cancellation terms.'},
    {id:'station',name:'Rail',x:-6.7,z:3.6,y:1.9,text:'Rail legs form part of the same trip, with their own supplier terms.'},
    {id:'harbour',name:'Cruises',x:8.2,z:7.5,y:1.8,text:'Cruise options join the proposal alongside flights, stays and experiences.'},
    {id:'consultant',name:'Consultant',x:-3.5,z:5.4,y:1.9,text:'Review the proposal with the traveller. Approval is required before booking or payment.'},
    {id:'payments',name:'ATP · payments',x:3.2,z:3.8,y:1.5,text:'Coordinate commitments and controlled payments; record outcomes and recover when parts fail.'},
    {id:'hostel',name:'Hostel',x:-1.5,z:6.2,y:1.4,text:'Budget options still need location, quality and cancellation checks.'},
    {id:'car',name:'Car hire',x:-5.4,z:.3,y:1,text:'Compare total rental cost, vehicle size, excess and collection arrangements.'},
    {id:'tours',name:'Experiences',x:4.3,z:1.9,y:1,text:'Choose activities that suit the people, destination and available time.'},
    {id:'package',name:'Packages',x:.4,z:7.4,y:1.4,text:'Compare a combined holiday offer with the individual parts.'}
  ];
  function createWorld(ctx) {
    let W, H, U, yaw, objects, time, build, focus;
    const project = (x, y, z) => {
      const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
      const rz = x * Math.sin(yaw) + z * Math.cos(yaw);
      return [W * .5 + rx * U, H * .57 + rz * U * .52 - y * U];
    };
    function polygon(points, fill, stroke, width = .65) {
      ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
    }
    const poly = (pts, fill, stroke, width) => polygon(pts.map(p => project(...p)), fill, stroke, width);
    function line(points, colour, width = 1) {
      ctx.beginPath();points.map(p => project(...p)).forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.stroke();
    }
    function disc(x, y, z, r, fill, ry = .48) {
      const p=project(x,y,z);ctx.beginPath();ctx.ellipse(p[0],p[1],r*U,r*U*ry,0,0,TAU);ctx.fillStyle=fill;ctx.fill();
    }
    function box(x,z,w,d,h,col,y=0) {
      const a=x-w/2,b=x+w/2,c=z-d/2,e=z+d/2;
      // The two camera-facing elevations change as the world turns.
      if(Math.sin(yaw)<0)poly([[a,y,c],[a,y+h,c],[a,y+h,e],[a,y,e]],col[1], '#52645735');
      else poly([[b,y,e],[b,y+h,e],[b,y+h,c],[b,y,c]],col[1], '#52645735');
      if(Math.cos(yaw)>0)poly([[a,y,e],[a,y+h,e],[b,y+h,e],[b,y,e]],col[2], '#52645735');
      else poly([[b,y,c],[b,y+h,c],[a,y+h,c],[a,y,c]],col[2], '#52645735');
      poly([[a,y+h,c],[b,y+h,c],[b,y+h,e],[a,y+h,e]],col[0], '#52645755');
    }
    function add(x,z,fn,order=0) {objects.push({depth:x*Math.sin(yaw)+z*Math.cos(yaw)+order,fn});}
    const growth = i => ease((build-i*.19)/.9);
    function tree(x,z,size,seed=0) {
      const g=growth(3+seed%7);if(!g)return;
      add(x,z,()=>{
        disc(x+.18,0,z+.12,size*.63,'#38543c12');
        line([[x,0,z],[x,size*1.8*g,z]],'#777554',Math.max(1,U*.055));
        const p=project(x,size*1.8*g,z),r=U*size;
        const grad=ctx.createRadialGradient(p[0]-r*.3,p[1]-r*.5,0,p[0],p[1],r);
        grad.addColorStop(0,'#b9c58d');grad.addColorStop(.55,'#839c73');grad.addColorStop(1,'#536f59');
        for(let j=0;j<9;j++){
          const a=j*2.4,rr=(.4+noise(seed+j)*.18)*r;
          ctx.beginPath();ctx.ellipse(p[0]+Math.cos(a)*r*.36,p[1]+Math.sin(a)*r*.4,rr,rr*.95,0,0,TAU);ctx.fillStyle=grad;ctx.fill();
        }
        for(let j=0;j<21;j++){ctx.fillStyle=j%2?'#e4e7bd45':'#294e3d20';ctx.fillRect(p[0]+(noise(seed+j+90)-.5)*r*1.35,p[1]+(noise(seed+j+20)-.5)*r*1.3,1.3,1.3);}
      });
    }
    function building(x,z,w,d,h,idx,style='cream') {
      const g=growth(idx);if(!g)return;
      const colours=style==='teal'?['#b4c7b6','#6b9184','#8eab97']:style==='rose'?['#ead7ba','#bb9d83','#d8b8a0']:['#eee8d2','#bdbba6','#d8d4be'];
      poly([[x-w/2,.02,z-d/2],[x+w/2,.02,z-d/2],[x+w/2+1.25,.02,z+d/2+.85],[x-w/2+.8,.02,z+d/2+.85]],'#58684b18');
      add(x,z,()=>{
        box(x+.13,z+.12,w+.2,d+.2,.08,['#596d4616','#596d4616','#596d4616']);
        box(x,z,w,d,h*g,colours);
        const roof=h*g;
        box(x,z,w+.12,d+.12,.1,['#eee8d6','#a5ac94','#bcc0a8'],roof);
        const front=Math.cos(yaw)>0?z+d/2+.008:z-d/2-.008;
        const side=Math.sin(yaw)<0?x-w/2-.008:x+w/2+.008;
        const rows=Math.max(1,Math.floor(h/.8)),cols=Math.max(2,Math.floor(w/.6));
        for(let row=0;row<rows;row++)for(let j=0;j<cols;j++){
          const wx=x-w/2+(j+.5)*w/cols,wy=(.25+row*.77)*g;
          poly([[wx-.14,wy,front],[wx+.14,wy,front],[wx+.14,wy+.36*g,front],[wx-.14,wy+.36*g,front]],(j+row)%4===0?'#e9cc8e':'#6c8b848f');
          line([[wx-.16,wy,front],[wx+.16,wy,front]],'#f4efda',.7);
          line([[wx,wy+.02,front],[wx,wy+.34*g,front]],'#d4d9c7',.4);
        }
        for(let row=0;row<rows;row++)for(let j=0;j<Math.floor(d/.65);j++){
          const zz=z-d/2+(j+.5)*d/Math.floor(d/.65),yy=(.25+row*.77)*g;
          poly([[side,yy,zz-.13],[side,yy,zz+.13],[side,yy+.36*g,zz+.13],[side,yy+.36*g,zz-.13]],'#597e7680');
        }
        for(let j=0;j<34;j++){const wx=x-w/2+noise(j+idx*40)*w, yy=noise(j+idx*80)*roof;line([[wx,yy,front],[wx+.025,yy,front]],'#4a5a4220',.6);}
        // A planted terrace, skylight and ventilation details anchor the miniature in reality.
        box(x-w*.22,z-d*.18,w*.28,d*.28,.12,['#b4c8bd','#80998f','#9bb4a7'],roof+.1);
        box(x+w*.25,z+d*.2,.32,.32,.18,['#e8debe','#b6b197','#c8c3a9'],roof+.1);
        for(let k=0;k<4;k++)disc(x-w*.32+k*w*.2,roof+.13,z+d*.35,.08,'#7d9468',.8);
      });
    }
    function railway() {
      const g=growth(1);if(!g)return;
      for(let k=0;k<75;k++){
        const z=-9+k*.25;
        line([[-8.7,.04,z],[-7.5,.04,z]],'#b6ab90',Math.max(.5,U*.045));
      }
      line([[-8.5,.07,-9],[-8.5,.07,9.5]],'#7d877c',1.2);
      line([[-7.7,.07,-9],[-7.7,.07,9.5]],'#7d877c',1.2);
      const tz=-9+((time*.65+6)%18);
      for(let i=0;i<3;i++)add(-8.1,tz-i*1.35,()=>{
        box(-8.1,tz-i*1.35,.78,1.24,.48,['#d6dfcc','#456f61','#729383'],.14);
        for(let k=0;k<3;k++)box(-8.5,tz-i*1.35-.4+k*.36,.018,.2,.16,['#f2dca0','#e7d9ac','#e7d9ac'],.36);
        line([[-8.51,.29,tz-i*1.35-.59],[-8.51,.29,tz-i*1.35+.59]],'#dbba6c',1.4);
      });
    }
    function plane(t) {
      const p=(t*.025+.19)%1,x=-14+p*29,z=-9+p*5,y=2.7+Math.sin(p*Math.PI)*1.8;
      if(build<1.5)return;
      disc(x,0,z,.9,'#34524712',.24);
      add(x,z,()=>{
        poly([[x-1.3,y,z],[x+.9,y,z-.13],[x+1.45,y,z],[x+.8,y,z+.15]],'#fbf5dd','#64786d',.8);
        poly([[x-.25,y,z],[x-.7,y,z-1.4],[x+.05,y,z-1.25],[x+.5,y,z],[x+.05,y,z+1.25],[x-.7,y,z+1.4]],'#ecebd9','#64786d',.7);
        poly([[x-1.1,y,z],[x-1.5,y,z-.5],[x-.9,y,z-.4],[x-.65,y,z],[x-.9,y,z+.4],[x-1.5,y,z+.5]],'#477f76','#64786d',.7);
        line([[x-.9,y+.03,z],[x+1.25,y+.03,z]],'#b9c8b7',1.5);
      },8);
    }
    function boat(x,z,speed=0) {
      const bz=z+Math.sin(time*.25+speed)*.4;
      add(x,bz,()=>{
        line([[x-.35,.01,bz+1.1],[x-.42,.01,bz+1.8]],'#f6f8e2a0',1.2);
        line([[x+.35,.01,bz+1.1],[x+.42,.01,bz+1.8]],'#f6f8e2a0',1.2);
        poly([[x-.35,.1,bz+.8],[x+.35,.1,bz+.8],[x+.4,.13,bz-.3],[x,.14,bz-.85],[x-.4,.13,bz-.3]],'#fbf1d6','#7a9d90',.8);
        line([[x,.2,bz],[x,2,bz]],'#7a8872',1);
        poly([[x,1.96,bz],[x,.4,bz],[x+.8,.4,bz+.4]],'#f8edd2','#c8c6ad',.6);
      });
    }
    function draw(w,h,t=8,angle=-.58,progress=8,selected='lab',story=null) {
      W=w;H=h;U=Math.min(w/31.5,h/21);yaw=angle;time=t;build=progress;focus=selected;objects=[];
      ctx.clearRect(0,0,w,h);
      const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#eef1e5');bg.addColorStop(.5,'#e4ebdc');bg.addColorStop(1,'#dbe6dc');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      // Quiet atmospheric contours, a printed-paper texture and a soft island shadow.
      const glow=ctx.createRadialGradient(w*.65,h*.25,0,w*.65,h*.25,w*.5);glow.addColorStop(0,'#fff5d798');glow.addColorStop(1,'#fff5d700');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
      const sh=project(0,-.5,0);const shadow=ctx.createRadialGradient(sh[0],sh[1]+U,0,sh[0],sh[1]+U,U*13);shadow.addColorStop(0,'#506a4b26');shadow.addColorStop(1,'#506a4b00');ctx.fillStyle=shadow;ctx.fillRect(0,0,w,h);
      // Water is one continuous basin; the island terraces are separate from it.
      poly([[-11,-.25,-10],[10,-.25,-10],[11,-.25,11],[-10,-.25,11]],'#92b8ad','#80a798');
      for(let i=0;i<190;i++){
        const x=-10+noise(i+1)*20,z=-9+noise(i+1000)*19;
        line([[x,-.22,z],[x+.18+Math.sin(time*.8+i)*.07,-.22,z]],i%3?'#e0eadd50':'#4b8c8525',.7);
      }
      const land=[[-10.5,0,-9.5],[9.5,0,-9.5],[9.5,0,-.5],[8.5,0,-.5],[8.5,0,2.5],[2.5,0,8.5],[-.5,0,9.5],[-9.5,0,9.5],[-9.5,0,6.5],[-10.5,0,6.5]];
      const landFill=ctx.createLinearGradient(0,h*.2,w,h);landFill.addColorStop(0,'#d4dabc');landFill.addColorStop(.5,'#e0e2c8');landFill.addColorStop(1,'#bdcba7');
      poly(land.map(([x,y,z])=>[x,-.15,z]),'#a7b59a','#98ad94');
      poly(land,landFill,'#acbba1',.8);
      for(let i=0;i<160;i++){
        const x=-10+noise(i+100)*19,z=-9+noise(i+300)*18;if(x+z>10.5||x>8&&z>0)continue;
        disc(x,.005,z,.08+noise(i+200)*.2,i%2?'#7b9b6511':'#f7f2d729');
      }
      const quay=[[8.5,.015,-.5],[8.5,.015,2.5],[2.5,.015,8.5],[-1,.015,8.5]];
      line(quay,'#eee4c9',U*.18);line(quay,'#acb7a1',.75);
      if(build>.4){
        // Walking routes, road markings and a runway are painted into the ground.
        line([[-6,.035,-4],[6,.035,-4],[6,.035,1],[1,.035,1],[1,.035,7]],'#e9e5ce',U*.75);
        line([[-6,.04,-4],[-6,.04,7]],'#c4cbb8',U*.85);
        for(let z=-3;z<7;z+=.65)line([[-6,.05,z],[-6,.05,z+.22]],'#f4edd4',.8);
        poly([[-9,.03,-8.3],[4,.03,-8.3],[4,.03,-6.7],[-9,.03,-6.7]],'#a6b5a5');
        for(let x=-8;x<4;x++)line([[x,.04,-7.5],[x+.42,.04,-7.5]],'#f8eed5',1.1);
        for(let x of [-8.7,3.4])for(let z=-8.05;z<-6.7;z+=.22)line([[x,.05,z],[x+.28,.05,z]],'#e6e9d6',1.5);
      }
      railway();
      building(-3,-5.6,4.4,1.35,1.05,1,'teal'); // airport terminal
      building(.3,-5.5,.55,.6,2.7,2,'cream');
      const tower=growth(2);if(tower)add(.3,-5.5,()=>box(.3,-5.5,1,1,.45,['#c9d4bf','#6c8f84','#9bb3a1'],2.6*tower));
      building(-.3,-.6,3.4,2.3,2.6,3,'cream'); // lab
      building(1.4,.5,1.6,1.8,1.1,3,'teal');
      building(5.4,-3.1,2.2,2.5,4.1,4,'rose'); // hotel
      building(5.7,-.8,2.9,.9,1,4,'rose');
      building(-6.7,3.6,1.3,3.6,1.2,5,'cream'); // station
      building(-3.5,5.4,1.6,1.6,1.55,6,'rose');
      building(-1.5,6.2,1.3,1.3,1.05,7,'teal');
      building(3.2,3.8,1.6,1.4,1.1,6,'cream');
      // The original story's infrastructure has visible places in the city.
      if(build>1.5){
        add(2.6,-1.2,()=>{
          const c=['#b5c6b0','#547968','#789583'];
          box(2.6,-2,.22,.22,1.8,c);box(2.6,-.4,.22,.22,1.8,c);
          box(2.6,-1.2,.35,2,.28,c,1.8);
        });
        add(3.2,3.8,()=>{box(3.2,3.8,1.75,1.55,.18,['#cabb8f','#9a956f','#b4ab7f'],1.2);});
        building(.4,7.4,1.25,1.15,.9,7,'teal');
        add(-5.4,.3,()=>{
          for(let k=0;k<3;k++)box(-5.4,.3+k*.6,.4,.48,.24,['#dfc28c','#8c9b7a','#c0b58b'],.08);
        });
      }
      // A rooftop observatory and a sloping station roof give the buildings their own character.
      if(growth(3))add(-.2,-.6,()=>{
        const y=2.7*growth(3);
        box(-.65,-.8,.18,.18,.55,['#b8beaa','#929f8d','#a0ad96'],y);
        const p=project(-.65,y+.55,-.8);ctx.beginPath();ctx.ellipse(p[0],p[1],U*.31,U*.15,-.45,0,TAU);ctx.fillStyle='#e9e5ce';ctx.fill();ctx.strokeStyle='#a6b49c';ctx.lineWidth=.8;ctx.stroke();
        line([[-.65,y+.56,-.8],[-.65,y+.8,-.8]],'#8c9c85',.8);
      });
      if(growth(5))add(-6.7,3.6,()=>{
        const y=1.3*growth(5);
        poly([[-7.4,y,1.8],[-6.7,y+.5,1.8],[-6.7,y+.5,5.4],[-7.4,y,5.4]],'#819e8b','#647f70',.6);
        poly([[-6.7,y+.5,1.8],[-6,y,1.8],[-6,y,5.4],[-6.7,y+.5,5.4]],'#a8bca3','#647f70',.6);
        for(let k=0;k<14;k++){let z=1.8+k*.26;line([[-7.4,y,z],[-6.7,y+.5,z],[-6,y,z]],'#e3e8d02a',.6);}
      });
      // A glass station canopy, rooftop equipment and a greenhouse.
      if(growth(5))add(-7.1,3.7,()=>box(-7.55,3.7,.8,4.2,.12,['#c7d6c39c','#a0bca9','#b3c9b5'],1.45*growth(5)));
      for(let i=0;i<7;i++)tree(-4.7,-2.8+i*1.4,.38,18+i);
      for(let [x,z,s] of [[-8,-9,.45],[7,-7,.65],[8,-5.7,.5],[7.5,-2,.4],[2,5.7,.55],[.4,8,.45],[-4,7.5,.65],[-5,7,.4],[-2.8,2.1,.65],[-3.8,.8,.45],[3.2,-5,.4],[7,1.3,.48],[-9.3,0,.32],[-9.3,1,.32],[-9.3,2,.32]])tree(x,z,s,Math.floor((x+z)*12+99));
      if(growth(6)){
        // Curved garden paths, flowerbeds, benches and a small fountain.
        disc(-2.7,0,2.7,1.4,'#e9e3ca');disc(-2.7,.03,2.7,.65,'#b5c6ad');disc(-2.7,.06,2.7,.49,'#8fb7aa');
        for(let k=0;k<5;k++)line([[-2.7,.08,2.7],[-2.7+Math.cos(k*1.25+time)*.19,.3,2.7+Math.sin(k*1.25+time)*.19]],'#f2f2da95',.6);
        for(let k=0;k<8;k++)disc(-4+k*.25,0,4.8,.11,k%2?'#caab87':'#9fae75',.7);
        add(-1,3.8,()=>box(-1,3.8,.9,.25,.25,['#c2a879','#969174','#b5a27b']));
        for(let k=0;k<3;k++){
          const x=3.4+k*.65,z=1.9;
          add(x,z,()=>{line([[x,0,z],[x,.6,z]],'#9e9f7f',.8);disc(x,.64,z,.25,k%2?'#d7bd8b':'#e6ddbe',.5);disc(x,.65,z,.09,'#eee5c9',.5);});
        }
        // Marina pontoons follow the coast.
        for(let i=0;i<3;i++){const x=5.7-i*1.3,z=5.4+i*1.3;box(x,z,.2,2,.08,['#c5ba99','#9ca78e','#b8b49a'],-.02);}
        boat(6.4,5.5,1);boat(4.9,7,2);boat(8.4,8+Math.sin(time*.15),3);
      }
      // Slow street movement is separate from the aircraft and railway animation.
      const carZ=-2+(time*.38)%8;
      if(build>2)add(-6,carZ,()=>{box(-6,carZ,.36,.66,.25,['#dcb66e','#ac925d','#c7ac72'],.07);box(-6,carZ-.02,.3,.3,.12,['#a5beb0','#839d90','#849d8f'],.32);});
      plane(time);
      objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.fn());
      // Routes explain the work: plan through Keel, approve, commit, then watch.
      if(story&&build>3){
        const byId=id=>places.find(p=>p.id===id);
        const route=(from,to,colour,moving,offset=0)=>{
          const a=byId(from),b=byId(to);if(!a||!b)return;
          const start=project(a.x,a.y,a.z),end=project(b.x,b.y,b.z);
          const bend=[(start[0]+end[0])/2,Math.min(start[1],end[1])-Math.min(55,U*1.6)];
          ctx.save();ctx.beginPath();ctx.moveTo(...start);ctx.quadraticCurveTo(...bend,...end);
          ctx.strokeStyle=colour;ctx.lineWidth=1.5;ctx.setLineDash([4,5]);ctx.stroke();ctx.setLineDash([]);
          if(moving){const u=(time*.33+offset)%1,q=1-u,x=q*q*start[0]+2*q*u*bend[0]+u*u*end[0],y=q*q*start[1]+2*q*u*bend[1]+u*u*end[1];ctx.fillStyle=colour;ctx.fillRect(x-3,y-3,6,6);}
          ctx.restore();
        };
        const k=story.phase,go=!story.manual;
        if(k===0)route('consultant','lab','#a98a50',go);
        if(k>=1&&k<=3){route('lab','keel','#456b53',go);story.stops.forEach((id,i)=>route(k===3?id:'keel',k===3?'lab':id,'#6e8f7c',go,i*.17));}
        if(k===4)route('lab','consultant','#a98a50',go);
        if(k===5){route('consultant','payments','#a98a50',go);story.stops.forEach((id,i)=>route('payments',id,'#456b53',go,i*.17));}
        if(k===6){route('airport','lab','#6e8f7c',go);route('lab','consultant','#a98a50',go,.3);}
      }
      // Grain stays anchored to the paper, not to moving objects.
      for(let i=0;i<2800;i++){ctx.fillStyle=i%2?'#4d67430b':'#fffce510';ctx.fillRect(noise(i+340)*w,noise(i+7780)*h,1,1);}
      if(build>3){
        const site=places.find(p=>p.id===focus)||places[1],p=project(site.x,site.y+.8,site.z);
        const pulse=3+Math.sin(time*2)*.5;
        ctx.fillStyle='#fbf5e6';ctx.strokeStyle='#5c8070';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p[0],p[1],pulse+3,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#537f6a';ctx.beginPath();ctx.arc(p[0],p[1],2,0,TAU);ctx.fill();
        line([[site.x,site.y+.6,site.z],[site.x,site.y+.2,site.z]],'#688a7480',1);
      }
    }
    function labelLeader(x,y,width,height,site){
      const point=project(site.x,site.y+.2,site.z);
      const start=[clamp(point[0],x+4,x+width-4),y+height];
      if(Math.hypot(point[0]-start[0],point[1]-start[1])<12)return;
      ctx.save();ctx.strokeStyle='#6e8f7c90';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(...start);ctx.lineTo(...point);ctx.stroke();
      ctx.fillStyle='#f7f8f2';ctx.beginPath();ctx.arc(...point,2,0,TAU);ctx.fill();ctx.restore();
    }
    return {draw, places, project, labelLeader};
  }
  root.TravelWorld = {create: createWorld, places};
  if(typeof document === 'undefined')return;
  const canvas=document.querySelector('#travel-world');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const world=createWorld(ctx),media=matchMedia('(prefers-reduced-motion: reduce)');
  let w=0,h=0,angle=-.58,time=0,progress=media.matches?8:0,last=0,raf=0,visible=true,selected='lab';
  let paused=document.body.classList.contains('motion-paused')||media.matches;
  let drag=null;
  const replay=document.querySelector('#rebuild-world');
  const fallback=document.querySelector('.world-poster');
  const exhibit=canvas.closest('.world-exhibit');
  const story=root.TravelWorldStory&&exhibit?root.TravelWorldStory.mount(exhibit,()=>paint()):null;
  if(story){story.setPlaces(places);if(media.matches)story.showComplete(time);}
  function paint(){if(w>0&&h>0){const state=story?.state(time);world.draw(w,h,time,angle,progress,state?.focus||selected,state);story?.render(world,w,h,time,progress,media.matches);if(fallback)fallback.hidden=true;}}
  function resize(){const r=canvas.getBoundingClientRect();w=Math.round(r.width);h=Math.round(r.height);const d=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);paint();}
  function running(){return !paused&&!media.matches&&!document.hidden&&visible;}
  function schedule(){if(!raf&&running())raf=requestAnimationFrame(tick);}
  function tick(now){raf=0;if(!running()){last=0;return;}if(!last)last=now;const dt=now-last;if(dt>=33){time+=Math.min(dt,80)/1000;progress+=Math.min(dt,80)/1000;last=now;paint();}schedule();}
  function setMotion(){paused=document.body.classList.contains('motion-paused')||media.matches;if(media.matches){progress=8;story?.showComplete(time);}else story?.resume(time);replay.disabled=paused;last=0;paint();schedule();}
  window.addEventListener('lab-motion',setMotion);
  media.addEventListener('change',setMotion);
  document.addEventListener('visibilitychange',()=>{last=0;schedule();});
  replay.addEventListener('click',()=>{if(!paused){progress=0;story?.replay(time+3);paint();schedule();}});
  document.querySelectorAll('[data-world-place]').forEach(button=>button.addEventListener('click',()=>{
    selected=button.dataset.worldPlace;
    document.querySelectorAll('[data-world-place]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    const p=places.find(item=>item.id===selected);document.querySelector('#world-description').textContent=p.text;paint();
  }));
  const rotate=delta=>{angle+=delta;paint();};
  document.querySelector('#world-left').addEventListener('click',()=>rotate(-.2));
  document.querySelector('#world-right').addEventListener('click',()=>rotate(.2));
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,angle};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
  canvas.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){angle=drag.angle+(e.clientX-drag.x)*.006;paint();}});
  const end=()=>{drag=null;canvas.classList.remove('dragging');};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
  canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotate(e.key==='ArrowLeft'?-.2:.2);}});
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize);
  if('IntersectionObserver'in window)new IntersectionObserver(([e])=>{visible=e.isIntersecting;last=0;schedule();},{threshold:.01}).observe(canvas);
  resize();setMotion();
})(globalThis);
