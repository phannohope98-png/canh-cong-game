/* Architectural equipment uses one drawing in inventory and on the building.
 * Skill animation is time-based geometry; the painted atlas remains HUD art. */
(function(){
 const types=['barracks','archer','mage','artillery'],iconCache=new Map();
 const spans={barracks:[.30,.29,.12,.70,.19,.19],archer:[.12,.28,.16,.16,.13,.25],mage:[.17,.38,.10,.29,.12,.23],artillery:[.22,.21,.19,.18,.20,.40]};
 const baseFitting=PaintedWorld.drawFitting;
 PaintedWorld.drawFitting=function(g,type,tier,it,time,f){
  baseFitting(g,type,tier,it,time,f);
  // A fitted inset, rather than a floating halo, distinguishes sacred hardware.
  if(it.r!==5||it.s===0||it.s===3)return;
  let p=PaintedWorld.mounts[type][tier-1][it.s];
  if(type==='artillery')p=[[.7,.55],[.85,.55],[.43,.57],[.72,.79],[.43,.37],[.6,.91]][it.s];
  const rr=f.h*.012;g.save();g.translate(p[0]*f.w,p[1]*f.h);g.strokeStyle='#fff0bf';g.lineWidth=f.h*.004;g.lineCap='round';g.beginPath();
  // Slot-specific engraved marks live within the actual component surface.
  for(let k=0;k<2+it.s%3;k++){const a=k*2.4+types.indexOf(type)*.8;g.moveTo(Math.cos(a)*rr*.4,Math.sin(a)*rr*.4);g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}
  g.stroke();g.restore();
 };
 function barrelPart(g,it){const gold=it.r>=3?'#e2bc78':'#abb0a5',metal=g.createLinearGradient(0,-8,0,8);metal.addColorStop(0,'#d2dbd0');metal.addColorStop(.3,'#8f9e9d');metal.addColorStop(.6,'#596d74');metal.addColorStop(1,'#344950');g.strokeStyle='#493b2b';g.lineWidth=3;g.fillStyle=metal;
  if(it.s===0){g.beginPath();g.roundRect(-17,-7,34,14,4);g.fill();g.stroke();g.strokeStyle=gold;g.lineWidth=2;g.beginPath();g.moveTo(-12,-6);g.lineTo(-12,6);g.moveTo(10,-6);g.lineTo(10,6);g.stroke();g.fillStyle='#438b98';g.strokeStyle=gold;g.beginPath();g.ellipse(16,0,4,8,0,0,7);g.fill();g.stroke();g.strokeStyle='#e3ffe8';g.lineWidth=1.5;g.beginPath();g.ellipse(15,-2,2,4,0,3.3,5.6);g.stroke();g.strokeStyle=gold;g.lineWidth=3;g.beginPath();g.moveTo(-9,8);g.lineTo(-9,18);g.lineTo(8,18);g.stroke();}
  else{g.fillStyle=gold;g.beginPath();g.ellipse(0,0,9,18,-.1,0,7);g.fill();g.stroke();g.fillStyle='#405257';g.beginPath();g.ellipse(0,0,5,13,-.1,0,7);g.fill();g.stroke();g.strokeStyle='#fff0bc';g.lineWidth=1.5;g.beginPath();g.ellipse(-1,-1,7,16,-.1,3.2,5.3);g.stroke();}
 }
 function component(g,it){
  const f={w:200,h:200},type=it.t,s=it.s,tier=1;
  let p=PaintedWorld.mounts[type][0][s];if(type==='artillery')p=[[.7,.55],[.85,.55],[.43,.57],[.72,.79],[.43,.37],[.6,.91]][s];
  if(type==='barracks'&&s===3)p=[.51,.30];
  const z=72/(200*spans[type][s]);g.save();g.translate(48,48);g.scale(z,z);g.translate(-p[0]*200,-p[1]*200);
  if(type==='artillery'&&s<2){g.translate(p[0]*200,p[1]*200);barrelPart(g,it);}else PaintedWorld.drawFitting(g,type,tier,it,0,f);
  g.restore();
 }
 Items.iconUrl=function(it){const key=it.t+':'+it.s+':'+it.r;if(iconCache.has(key))return iconCache.get(key);const c=document.createElement('canvas');c.width=c.height=96;component(c.getContext('2d'),it);const u=c.toDataURL();iconCache.set(key,u);return u;};
 Items.drawBadge=function(g,it,x,y,r){g.save();g.translate(x-r,y-r);g.scale(r/48,r/48);component(g,it);g.restore();};

 const oldFx=SkillFx59.draw,colors={aldric:'#8dd1ed',veyra:'#efc57d',lyra:'#a9df80',thalen:'#7ed4a4',selene:'#bd99ff',oria:'#d5b0ff',borin:'#ffb85d',haldren:'#e9c59a',nara:'#fa9c6d',brakka:'#ef8979'};
 const clamp=n=>Math.max(0,Math.min(1,n));
 SkillFx59.draw=function(g,id,slot,x,y,r,t,life=1.5,z={}){
  if(z.physical&&id==='oria')id='borin';
  const color=colors[id]||'#e9d3a4',R=Math.min(105,r),impact=z.impact??.25,fall=z.impact!==undefined,fade=clamp(t*12)*clamp((life-t)*5),after=t-impact;
  g.save();g.translate(x,y);g.lineCap='round';g.lineJoin='round';
  const ring=(radius,alpha,width=2)=>{g.globalAlpha=fade*alpha;g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.ellipse(0,0,radius,radius*.34,0,0,Math.PI*2);g.stroke();};
  const glow=(xx,yy,rad,alpha)=>{g.globalAlpha=fade*alpha;const q=g.createRadialGradient(xx,yy,0,xx,yy,rad);q.addColorStop(0,color+'b0');q.addColorStop(1,color+'00');g.fillStyle=q;g.beginPath();g.ellipse(xx,yy,rad,rad*.7,0,0,7);g.fill();};
  // Ground warning contracts into the exact scheduled impact point.
  if(fall&&t<impact){const q=clamp(t/impact);ring(R*(.65-.25*q),.35+q*.35,1.5);g.globalAlpha=fade*.55;g.strokeStyle=color;g.lineWidth=1.5;for(let i=0;i<4;i++){const a=i*Math.PI/2;g.beginPath();g.moveTo(Math.cos(a)*R*.48,Math.sin(a)*R*.16);g.lineTo(Math.cos(a)*R*.6,Math.sin(a)*R*.2);g.stroke();}glow(0,-4,14+q*9,.3);}
  if(after>=0&&after<.7){const q=after/.7;ring(R*(.16+.84*q),Math.pow(1-q,2)*.8,4*(1-q)+.7);glow(0,-6,25+q*R*.3,(1-q)*.8);}
  g.restore();
  // Existing hand-drawn shapes now animate, instead of returning a static FX image.
  oldFx(g,id,slot,x,y,r,t,life,z);
  g.save();g.translate(x,y);g.lineCap='round';
  const magic=['selene','oria'].includes(id),nature=['lyra','thalen'].includes(id);
  if(fall&&after>=0&&after<.9){const q=after/.9;
   if(magic){g.globalAlpha=fade*(1-q)**2;g.fillStyle='#fff2ff';g.beginPath();for(let i=0;i<12;i++){const a=i*Math.PI/6,rad=(i%2?7:29)*(1-q);g.lineTo(Math.cos(a)*rad,-10+Math.sin(a)*rad);}g.closePath();g.fill();
    g.strokeStyle=color;g.lineWidth=2*(1-q)+.5;for(let i=0;i<5;i++){const a=i*1.25;g.beginPath();g.moveTo(0,-10);g.lineTo(Math.cos(a)*R*q*.4+4,-10+Math.sin(a)*R*q*.15);g.lineTo(Math.cos(a)*R*q*.65,-10+Math.sin(a)*R*q*.28);g.stroke();}}
   else{for(let i=0;i<7;i++){const a=i*Math.PI*2/7,dx=Math.cos(a)*R*q*.55,dy=Math.sin(a)*R*q*.17-14*q,rad=(7+i%3*3)*(1-q*.6);g.globalAlpha=fade*(1-q)*.32;const dust=g.createRadialGradient(dx,dy,1,dx,dy,rad);dust.addColorStop(0,'#e8ce99');dust.addColorStop(.65,'#bfa582');dust.addColorStop(1,'#bfa58200');g.fillStyle=dust;g.beginPath();g.arc(dx,dy,rad,0,7);g.fill();}
    g.globalAlpha=fade*(1-q)*.65;g.strokeStyle='#605047';g.lineWidth=1.5;for(let i=0;i<5;i++){const a=i*1.27;g.beginPath();g.moveTo(Math.cos(a)*9,Math.sin(a)*3);g.lineTo(Math.cos(a)*R*.25,Math.sin(a)*R*.08);g.lineTo(Math.cos(a+.15)*R*.4,Math.sin(a+.15)*R*.13);g.stroke();}}
  }
  if(id==='nara'&&slot){for(let i=0;i<3;i++){const q=clamp((t-i*.12)/.65);if(q<=0||q>=1)continue;g.globalAlpha=fade*(1-q)*.65;g.strokeStyle=i?'#efb278':'#fff0c6';g.lineWidth=3*(1-q)+1;g.beginPath();g.ellipse(0,-17,R*q,R*q*.4,0,.1,3);g.stroke();}}
  if(after>=0&&after<.8&&!z.mine){const q=after/.8,count=magic?14:nature?10:12;for(let i=0;i<count;i++){const a=i*Math.PI*2/count+(slot*.37),speed=R*(.35+(i%4)*.12),dx=Math.cos(a)*speed*q,dy=Math.sin(a)*speed*q*.32-25*Math.sin(q*Math.PI)*(1+i%3*.2);g.globalAlpha=fade*(1-q)**2;g.fillStyle=i%3===0?'#fff4d5':color;g.strokeStyle=color;g.lineWidth=1.6;g.beginPath();if(nature){g.ellipse(dx,dy,4*(1-q)+1,1.8,a+q*3,0,7);g.fill();}else{g.moveTo(dx,dy);g.lineTo(dx-Math.cos(a)*5*(1-q),dy+5*(1-q));g.stroke();}}}
  if(magic&&slot){for(let i=0;i<6;i++){const a=i*Math.PI/3+t*1.4,dx=Math.cos(a)*R*.65,dy=Math.sin(a)*R*.22-10;g.globalAlpha=fade*(.2+.2*Math.sin(t*5+i)**2);g.strokeStyle=color;g.lineWidth=1.2;g.beginPath();g.moveTo(dx,dy+12);g.quadraticCurveTo(dx-8,dy-10,dx+4,dy-26);g.stroke();}}
  if(!slot&&['nara','brakka','thalen'].includes(id)){const face=z.u?.face||Units.hero?.face||1;g.scale(face,1);for(let k=0;k<3;k++){const q=clamp((t-k*.04)/.5);if(q>=1)continue;g.globalAlpha=fade*(1-q)*(.6-k*.12);g.strokeStyle=k===0?'#fff4d5':color;g.lineWidth=6-k*2;g.beginPath();g.ellipse(0,-17,R*.7,R*.29,-.2,-2.8+q*3.5,-2+q*3.5);g.stroke();}}
  if(z.mine){g.globalAlpha=fade*(.5+.5*Math.sin(t*4)**2);g.fillStyle='#fff0a8';g.beginPath();g.arc(0,-5,1.5,0,7);g.fill();}
  g.restore();return true;
 };
 window.Polish62={component,barrelPart,version:62};
})();
