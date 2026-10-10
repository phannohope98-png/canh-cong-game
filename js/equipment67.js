/* One architectural component renderer for the inventory and the live tower. */
(function(){
 const types=['barracks','archer','mage','artillery'],cache=new Map(),fittingCache=new Map();let state=null;
 const dimensions={barracks:[[.22,.18],[.16,.22],[.12,.12],[.62,.3],[.13,.17],[.13,.16]],archer:[[.12,.12],[.26,.14],[.13,.13],[.13,.13],[.13,.13],[.27,.14]],mage:[[.16,.13],[.36,.10],[.12,.12],[.11,.24],[.13,.13],[.25,.08]],artillery:[[.22,.13],[.13,.21],[.11,.14],[.15,.13],[.13,.14],[.34,.15]]};
 const bodyMounts=[[.7,.55],[.85,.55],[.43,.57],[.72,.79],[.43,.37],[.6,.91]];
 const roofs=[[[.24,.33],[.53,.13],[.78,.41],[.43,.46]],[[.18,.29],[.5,.11],[.74,.39],[.42,.44]],[[.29,.29],[.56,.10],[.78,.37],[.43,.4]],[[.27,.23],[.53,.09],[.72,.30],[.44,.37]]];
 function palette(it){const race={barracks:'#276ead',archer:'#407e44',mage:'#7654ac',artillery:'#a9672c'}[it.t],rarity=['#9c9983','#c7bdaa','#aad08a','#b2a0df','#e9c366','#82e7df'][it.r];return {race,rarity,metal:it.r===0?'#969b99':it.r===1?'#b2bcae':it.r===2?'#c5ccbd':it.r===3?'#cfbce8':'#e2bd65',ink:'#372d31',dark:'#52545a',wood:'#96653e',myth:it.r===5,rank:it.r};}
 function part(g,it,w,h,time=0,open=0){
  const C=palette(it),s=it.s;g.save();g.scale(w/100,h/100);g.lineJoin='round';g.lineCap='round';
  const grad=(color,light=.28)=>{const a=g.createLinearGradient(-35,-45,30,45);a.addColorStop(0,ArtKit.shade(color,light));a.addColorStop(.5,color);a.addColorStop(1,ArtKit.shade(color,-.3));return a;};
  const fill=(fn,color,stroke=C.ink,lw=3)=>{g.beginPath();fn();g.fillStyle=typeof color==='string'?grad(color):color;g.strokeStyle=stroke;g.lineWidth=lw;g.fill();g.stroke();};
  const poly=(a,color,stroke,lw)=>fill(()=>{a.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();},color,stroke,lw);
  const line=(a,color=C.metal,width=4)=>{g.beginPath();a.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokeStyle=C.ink;g.lineWidth=width+3;g.stroke();g.strokeStyle=color;g.lineWidth=width;g.stroke();};
  const box=(x,y,W,H,col,r=5)=>fill(()=>g.roundRect(x,y,W,H,r),col);
  const rivet=(x,y,r=3)=>fill(()=>g.arc(x,y,r,0,7),'#f5e4ac',C.ink,1.5);
  const jewel=(x,y,r,col=C.rarity)=>{poly([[x,y-r],[x+r*.66,y-r*.2],[x+r*.54,y+r*.55],[x,y+r],[x-r*.54,y+r*.55],[x-r*.66,y-r*.2]],col,C.metal,3);poly([[x,y-r*.8],[x-r*.44,y],[x,y+r*.72],[x+r*.1,y]],ArtKit.shade(col,.35),col,1);line([[x-r*.3,y-r*.18],[x,y-r*.6]],'#fff6dd',1.5);};
  const leaf=(x,y,angle,col=C.race)=>{g.save();g.translate(x,y);g.rotate(angle);fill(()=>{g.moveTo(0,15);g.bezierCurveTo(-21,8,-17,-10,0,-27);g.bezierCurveTo(17,-10,21,8,0,15);g.closePath();},col);line([[0,12],[0,-21]],C.metal,1.8);g.restore();};
  const wings=(x,y)=>{for(const side of [-1,1]){g.save();g.translate(x,y);g.scale(side,1);poly([[3,2],[14,-11],[32,-18],[24,-3],[14,8]],C.metal);line([[10,1],[25,-11]],'#fff0bc',1.5);g.restore();}};
  const seal=(x,y,r=12)=>{fill(()=>g.ellipse(x,y,r,r*.85,0,0,7),C.dark,C.metal,3);jewel(x,y,r*.6,C.rarity);};
  if(it.t==='barracks'){
   if(s===0){const wave=Math.sin(time*2)*3;fill(()=>{g.moveTo(-47,-42);g.bezierCurveTo(-14,-50,13,-32,46,-42+wave);g.lineTo(40,22);g.lineTo(22,42);g.lineTo(1,28);g.bezierCurveTo(-12,28,-32,18,-47,24);g.closePath();},C.race);line([[-44,-38],[-44,21]],C.metal,2);line([[-36,-35],[35,-34]],C.metal,2);wings(-1,-3);jewel(-1,-3,14,'#f1d683');if(C.myth){line([[-20,21],[-1,29],[16,23]],C.metal,2);jewel(22,-23,7);}}
   else if(s===1){
    const door=()=>{g.moveTo(-42,46);g.lineTo(-42,-12);g.quadraticCurveTo(-41,-46,0,-46);g.quadraticCurveTo(41,-46,42,-12);g.lineTo(42,46);g.closePath();};
    fill(door,'#302926',C.metal,5);
    const panels=()=>{fill(door,C.wood,C.metal,4);for(let x=-30;x<=30;x+=15)line([[x,-17],[x,40]],'#6d452f',1.4);for(const y of [-9,26]){line([[-38,y],[38,y]],C.metal,5);for(const x of [-29,29])rivet(x,y);}line([[0,-31],[0,43]],'#5e4230',2);seal(0,-25,11);rivet(-8,8,3);rivet(8,8,3);};
    if(open>0){for(const side of [-1,1]){g.save();g.translate(side*42,0);g.scale(Math.max(.08,1-open),1);g.translate(-side*42,0);g.beginPath();g.rect(side<0?-50:0,-50,50,100);g.clip();panels();g.restore();}}else panels();
    if(C.myth){line([[-40,36],[-40,-11],[-32,-26]],C.metal,2);line([[40,36],[40,-11],[32,-26]],C.metal,2);}
   }
   else if(s===2){poly([[-38,-39],[38,-39],[34,12],[0,46],[-34,12]],C.metal);poly([[-29,-29],[29,-29],[25,8],[0,32],[-25,8]],C.race);wings(0,-4);jewel(0,-4,14,C.rarity);if(C.myth)poly([[-27,-36],[-20,-48],[-9,-38],[0,-48],[9,-38],[20,-48],[27,-36]],C.metal);}
   else if(s===3){poly([[-48,12],[0,-43],[48,12],[0,44]],C.race);for(let i=0;i<4;i++)line([[-30+i*10,-10+i*9],[5+i*10,-4+i*9]],C.metal,2);line([[-42,12],[0,-35],[42,12]],C.metal,4);seal(0,8,12);}
   else if(s===4){box(-42,-42,84,86,'#989e99');for(const x of [-27,27]){box(x-7,-43,14,87,C.metal,2);for(const y of [-28,0,28])rivet(x,y);}box(-18,-24,36,49,C.race);seal(0,0,14);}
   else{line([[-43,-39],[43,-39]],C.wood,7);line([[0,-36],[0,-24]],C.metal,5);fill(()=>{g.moveTo(-36,30);g.quadraticCurveTo(-26,18,-25,-11);g.quadraticCurveTo(0,-48,25,-11);g.quadraticCurveTo(26,18,36,30);g.closePath();},C.metal);line([[-32,26],[32,26]],'#f8e1a2',2);fill(()=>g.ellipse(0,35,30,7,0,0,7),C.dark);rivet(0,39,5);seal(0,0,11);}
  }else if(it.t==='archer'){
   if(s===0){for(let k=0;k<4;k++){g.save();g.rotate(k*Math.PI/2+Math.sin(time*.45)*.15);leaf(0,-10,.5,C.myth?'#68b49b':C.race);g.restore();}seal(0,0,12);}
   else if(s===1){line([[-44,36],[44,36]],C.wood,9);for(const x of [-29,0,29]){g.save();g.translate(x,-3);fill(()=>{g.moveTo(-8,-40);g.bezierCurveTo(25,-25,25,16,-8,32);g.lineTo(-4,24);g.bezierCurveTo(15,11,15,-20,-4,-33);g.closePath();},C.metal);line([[-8,-40],[-8,32]],'#f9e8b4',1.4);jewel(7,-4,7,C.rarity);g.restore();}for(const x of [-32,32])rivet(x,36);}
   else if(s===2){for(let i=-1;i<=1;i++){line([[i*22,22],[i*22,-40]],'#d7c395',3);poly([[i*22,-46],[i*22+8,-31],[i*22,-34],[i*22-8,-31]],C.metal);leaf(i*22,7,.35,C.race);}box(-38,8,76,38,C.wood);line([[-35,15],[35,15]],C.metal,4);line([[-34,39],[34,39]],C.metal,4);seal(0,26,11);}
   else if(s===3){box(-16,12,32,30,C.wood);box(-45,-13,78,26,C.wood,8);fill(()=>g.ellipse(32,0,12,19,0,0,7),C.metal);fill(()=>g.ellipse(35,0,7,12,0,0,7),'#86d5cd');line([[-33,-15],[-33,15]],C.metal,5);leaf(-8,-23,-.4);}
   else if(s===4){box(-42,30,84,16,C.wood);fill(()=>{g.moveTo(-31,30);g.lineTo(-34,-10);g.quadraticCurveTo(0,-33,34,-10);g.lineTo(31,30);g.closePath();},C.metal);fill(()=>g.ellipse(0,-9,32,9,0,0,7),'#294e42');fill(()=>g.ellipse(0,-10,25,5,0,0,7),C.myth?'#7be2bd':'#8fb958');leaf(0,-17,-.3);seal(0,11,9);}
   else{for(const x of [-32,0,32]){g.beginPath();g.moveTo(x,-43);g.bezierCurveTo(x-25,-11,x+22,6,x+Math.sign(x)*10,42);g.strokeStyle=C.ink;g.lineWidth=12;g.stroke();g.strokeStyle=C.wood;g.lineWidth=7;g.stroke();leaf(x,-19,x*.015);}for(const x of [-31,31])jewel(x,10,8,C.rarity);}
  }else if(it.t==='mage'){
   if(s===0){wings(0,21);poly([[-25,40],[-19,24],[19,24],[25,40]],C.metal);jewel(0,-9,35,C.rarity);if(C.myth){jewel(-31,8,10,'#ab98f5');jewel(31,8,10,'#ab98f5');}}
   else if(s===1){for(const y of [-22,0,22]){g.strokeStyle=C.ink;g.lineWidth=8;g.beginPath();g.ellipse(0,y,44,12,-.08,0,7);g.stroke();g.strokeStyle=C.metal;g.lineWidth=4;g.stroke();}for(const side of [-1,1])jewel(side*35,0,10,C.rarity);seal(0,-1,10);}
   else if(s===2){line([[0,10],[0,43]],C.metal,7);for(const side of [-1,1])line([[side*12,14],[side*29,-9],[side*18,-27]],C.metal,4);jewel(0,-13,26,C.rarity);}
   else if(s===3){g.beginPath();g.moveTo(-13,-44);g.lineTo(-13,19);g.quadraticCurveTo(-13,38,7,38);g.lineTo(35,38);g.strokeStyle=C.ink;g.lineWidth=22;g.stroke();g.strokeStyle='#82bbca';g.lineWidth=15;g.stroke();g.strokeStyle='#d2f2ee';g.lineWidth=3;g.stroke();for(const y of [-30,2])line([[-28,y],[1,y]],C.metal,6);seal(-12,-13,10);jewel(20,35,10,C.rarity);}
   else if(s===4){wings(0,-19);fill(()=>g.ellipse(0,2,32,37,0,0,7),C.dark,C.metal,7);fill(()=>g.ellipse(0,2,24,28,0,0,7),C.rarity,C.metal,2);line([[-11,3],[0,-16],[10,5],[0,22],[-11,3]],'#fff0e1',2);for(const x of [-30,30])rivet(x,0);}
   else{box(-48,-35,96,70,'#685583',6);for(let k=-1;k<=1;k++){const x=k*29;line([[x-9,-19],[x+7,-3],[x-8,15],[x+8,21]],C.rarity,3);}line([[-43,29],[43,29]],C.metal,3);for(const x of [-41,41])rivet(x,-27);}
  }else{
   if(s===0){line([[-21,19],[-21,44],[19,44]],C.metal,6);box(-45,-19,74,35,C.dark,9);for(const x of [-34,13])line([[x,-21],[x,19]],C.metal,6);fill(()=>g.ellipse(30,-2,13,26,0,0,7),C.metal);fill(()=>g.ellipse(34,-2,8,17,0,0,7),'#57b9c4');line([[32,-12],[36,-17]],'#eefdea',2);seal(-6,-1,9);}
   else if(s===1){fill(()=>g.ellipse(0,0,34,46,-.08,0,7),C.metal);fill(()=>g.ellipse(2,0,21,33,-.08,0,7),C.dark);line([[-19,-27],[-22,0],[-15,27]],'#ffedb2',2);for(let k=0;k<8;k++){const a=k*Math.PI/4;rivet(Math.cos(a)*27,Math.sin(a)*38,3);}if(C.myth)jewel(-29,0,11);}
   else if(s===2){box(-38,-43,76,86,C.dark);for(const y of [-31,29])line([[-40,y],[40,y]],C.metal,7);for(const x of [-29,29])for(const y of [-31,29])rivet(x,y);poly([[-19,-7],[19,-7],[14,17],[-14,17]],C.wood);seal(0,1,15);}
   else if(s===3){for(let k=0;k<10;k++){g.save();g.rotate(k*Math.PI/5);box(-7,-46,14,18,C.metal,2);g.restore();}fill(()=>g.arc(0,0,35,0,7),C.metal);fill(()=>g.arc(0,0,23,0,7),C.dark);for(let k=0;k<6;k++){const a=k*Math.PI/3;line([[Math.cos(a)*12,Math.sin(a)*12],[Math.cos(a)*27,Math.sin(a)*27]],C.metal,5);}seal(0,0,12);}
   else if(s===4){box(-39,-42,78,85,C.dark);box(-30,-26,60,55,'#4c352d',14);fill(()=>{g.moveTo(0,28);g.bezierCurveTo(-36,10,-14,-3,-19,-12);g.bezierCurveTo(-6,-8,-5,-23,4,-30);g.bezierCurveTo(7,-15,22,-3,19,6);g.bezierCurveTo(31,7,25,28,0,28);g.closePath();},'#f6b24a');jewel(0,13,12,'#ffdb82');line([[-29,-31],[29,-31]],C.metal,5);for(const x of [-31,31])rivet(x,35);}
   else{for(const side of [-1,1]){line([[side*29,-44],[side*36,18],[side*46,34]],C.metal,11);poly([[side*25,25],[side*48,25],[side*48,43],[side*22,43]],C.dark);for(const y of [-29,5])rivet(side*(y<0?31:35),y);}line([[-34,10],[34,10]],C.metal,5);seal(0,10,12);}
  }
  // A unique engraved sign for each sacred slot, held inside its physical surface.
  if(C.rank>=3&&!(it.t==='barracks'&&s===1)&&s!==0){g.save();g.translate(0,it.t==='mage'&&s===2?26:0);g.globalAlpha=.7;const k=types.indexOf(it.t)*6+s;g.strokeStyle=C.myth?'#d9fff1':'#fff2c4';g.lineWidth=1.4;g.beginPath();for(let j=0;j<3+k%4;j++){const a=j*Math.PI*2/(3+k%4)+k*.16;g.moveTo(Math.cos(a)*3,Math.sin(a)*3);g.lineTo(Math.cos(a)*8,Math.sin(a)*8);}g.stroke();g.restore();}
  g.restore();
 }
 function drawPart(g,it,w,h,time=0,open=0){
  if(it.t==='barracks'&&it.s<2||it.t==='archer'&&it.s===0){part(g,it,w,h,time,open);return;}
  const key=it.t+':'+it.s+':'+it.r+':'+(w/h).toFixed(3),size=Math.max(w,h);let c=fittingCache.get(key);
  if(!c){c=document.createElement('canvas');c.width=c.height=128;const p=c.getContext('2d');p.translate(64,64);part(p,it,w/size*112,h/size*112);fittingCache.set(key,c);if(fittingCache.size>192)fittingCache.delete(fittingCache.keys().next().value);}
  g.drawImage(c,-size*64/112,-size*64/112,size*128/112,size*128/112);
 }
 function mount(type,tier,s,f){const p=type==='artillery'?bodyMounts[s]:PaintedWorld.mounts[type][tier-1][s],d=dimensions[type][s];return {x:p[0]*f.w,y:p[1]*f.h,w:d[0]*f.w,h:d[1]*f.h};}
 PaintedWorld.drawFitting=function(g,type,tier,it,time,f){
  const a=mount(type,tier,it.s,f);g.save();
  if(type==='barracks'&&it.s===3){const poly=roofs[tier-1];g.beginPath();poly.forEach(([x,y],i)=>i?g.lineTo(x*f.w,y*f.h):g.moveTo(x*f.w,y*f.h));g.closePath();g.clip();g.translate(poly.reduce((a,p)=>a+p[0],0)*f.w/4,poly.reduce((a,p)=>a+p[1],0)*f.h/4);drawPart(g,it,f.w*.64,f.h*.35,time);g.restore();return;}
  g.translate(a.x,a.y);if(type==='barracks'&&it.s===0)g.translate(a.w*.5,a.h*.5);
  const open=type==='barracks'&&it.s===1&&state?.door>0?Math.sin(Math.min(1,state.door/.95)*Math.PI/2):0;
  drawPart(g,it,a.w,a.h,time,open);g.restore();
 };
 const tower=Painter.tower;Painter.tower=function(...args){const prev=state;state=args[7];try{return tower.apply(this,args);}finally{state=prev;}};
 // Door hardware now moves with the equipped door panels, instead of being painted over them.
 const oldDoor=Cannon58.door;Cannon58.door=function(g,tier,f,z,st){if(!Items.equippedAt('barracks',1))oldDoor.call(this,g,tier,f,z,st);};
 Polish62.barrelPart=function(g,it){drawPart(g,it,it.s===0?38:20,it.s===0?26:36,0);};
 function icon(g,it,x=48,y=48,size=82){const d=dimensions[it.t][it.s],aspect=Math.min(2.3,Math.max(.55,d[0]/d[1])),w=aspect>=1?size:size*aspect,h=aspect>=1?size/aspect:size;g.save();g.translate(x,y);part(g,it,w,h,0);g.restore();}
 Items.iconUrl=function(it){const key=it.t+':'+it.s+':'+it.r;if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=c.height=96;icon(c.getContext('2d'),it);const u=c.toDataURL();cache.set(key,u);return u;};
 Items.drawBadge=function(g,it,x,y,r){icon(g,it,x,y,r*1.8);};
 Polish62.component=function(g,it){icon(g,it);};
 window.Equipment67={part,icon,mount,dimensions,cache,fittingCache,version:67};
})();
