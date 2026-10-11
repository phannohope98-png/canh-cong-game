/* Wind-up -> committed direction -> contact -> recovery. Targets may dodge during travel. */
(function(){
 const bolts=[],flares=[],metrics={breaths:0,rolls:0,casts:0,contacts:0,cancelled:0};
 const near=(e,r)=>Units.list.filter(u=>u.active&&u.state!=='dead'&&u.alpha>=.5&&Math.hypot(e.x-u.x,e.y-u.y)<r).sort((a,b)=>Math.hypot(e.x-a.x,e.y-a.y)-Math.hypot(e.x-b.x,e.y-b.y));
 function cancel(e){if(e.special85){metrics.cancelled++;e.special85=null;e.rolling85=false;e.atk=-1;e.meleeImpact=null;e.bowTarget83=null;e.cool85=1.2;}}
 function update(e,dt){const kind=e.def.attack85;if(!kind)return false;
  if(e.stunT>0){cancel(e);return false;}
  e.cool85=(e.cool85??(1.1+(e.uid%5)*.35))-dt;
  if(!e.special85&&e.cool85<=0){const target=near(e,kind==='breath'?90:kind==='hex'?140:64)[0];
   if(!target){e.cool85=.4;return false;}
   const dx=target.x-e.x,dy=target.y-e.y,l=Math.max(1,Math.hypot(dx,dy));e.face=dx>=0?1:-1;
   e.special85={kind,t:0,dx:dx/l,dy:dy/l,target,hit:new Set(),acc:0};e.bowTarget83=null;e.meleeImpact=null;e.atk=0;metrics[kind==='breath'?'breaths':kind==='roll'?'rolls':'casts']++;
  }
  const a=e.special85;if(!a)return false;a.t+=dt;e.state='fight';e.atk=Math.min(.98,a.t/2.1);
  if(kind==='roll'){
   e.rolling85=a.t>=.65&&a.t<1.95;
   if(e.rolling85){const step=e.speed*1.8*(e.slowMul||1)*dt;e.dist+=step;e.place();e.walk+=step/32;
    for(const u of near(e,e.radius+15))if(!a.hit.has(u)){a.hit.add(u);Combat.hitUnit(u,e.def.damage);u.stun=Math.max(u.stun||0,.35);metrics.contacts++;Effects.burst(u.x,u.y-6,'#8dcbdc',5,42,.35,2,60);}
    if(e.dist>=e.path.length){cancel(e);Game.enemyEscaped(e);return true;}
   }
  }else if(kind==='breath'&&a.t>=.7&&a.t<1.5){
   a.acc+=dt;if(a.acc>=.25){a.acc-=.25;
    for(const u of near(e,88)){const dx=u.x-e.x,dy=u.y-e.y,dot=dx*a.dx+dy*a.dy,cross=Math.abs(dx*a.dy-dy*a.dx);if(dot>0&&cross<8+dot*.32){Combat.hitUnit(u,e.def.damage.map(v=>v*.24));metrics.contacts++;}}
   }
  }else if(kind==='hex'&&!a.fired&&a.t>=.7){a.fired=true;const sx=e.x+e.face*12,sy=e.y-e.height*.52,t=a.target,tx=t.x,ty=t.y-12,dx=tx-sx,dy=ty-sy,l=Math.max(1,Math.hypot(dx,dy));bolts.push({x:sx,y:sy,dx:dx/l,dy:dy/l,t:0,life:Math.min(1.7,l/110+.3),hit:false,damage:e.def.damage});}
  if(a.t>=2.1){e.special85=null;e.rolling85=false;e.atk=-1;e.cd=.45;e.cool85=e.def.rate;}
  return true;
 }
 const tick=Effects.update;Effects.update=function(dt){tick.call(this,dt);for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.t+=dt;b.x+=b.dx*110*dt;b.y+=b.dy*110*dt;let victim=null;for(const u of Units.list)if(u.active&&u.state!=='dead'&&Math.hypot(u.x-b.x,u.y-12-b.y)<u.radius+5){victim=u;break;}
   if(victim){Combat.hitUnit(victim,b.damage);metrics.contacts++;flares.push({x:b.x,y:b.y,t:0});bolts.splice(i,1);}else if(b.t>b.life)bolts.splice(i,1);
  }for(let i=flares.length-1;i>=0;i--){flares[i].t+=dt;if(flares[i].t>.65)flares.splice(i,1);}};
 const draw=Effects.drawCircles;Effects.drawCircles=function(g){draw.call(this,g);for(const e of Enemies.list){const a=e.special85;if(!e.alive||!a)continue;
   if(a.t<.7){g.save();g.strokeStyle=a.kind==='breath'?'#efaa67':a.kind==='hex'?'#c99bec':'#89c8d7';g.globalAlpha=.7;g.lineWidth=1.4;g.setLineDash([4,3]);g.beginPath();g.moveTo(e.x,e.y);g.lineTo(e.x+a.dx*75,e.y+a.dy*75);g.stroke();g.restore();}
   if(a.kind==='breath'&&a.t>=.7&&a.t<1.5){g.save();g.translate(e.x+e.face*10,e.y-e.height*.3);g.rotate(Math.atan2(a.dy,a.dx));ArtVfx85?.paint(g,0,Math.min(5,Math.floor((a.t-.7)/.8*6)),0,0,86,true);g.restore();}
  }for(const b of bolts)ArtVfx85?.paint(g,1,Math.floor(b.t*10)%3,b.x,b.y,20);for(const f of flares)ArtVfx85?.paint(g,1,3+Math.min(2,Math.floor(f.t/.65*3)),f.x,f.y,42);};
 const clear=Effects.clear;Effects.clear=function(){bolts.length=flares.length=0;return clear.call(this);};
 // Large existing drakes gain a readable attack; ordinary airborne imps still flap and travel.
 CONFIG.enemies.drake.attack85='breath';
 for(let i=2;i<36;i++){const L=CONFIG.levels[i];L.waves=L.waves.map((wave,n)=>{if(n===0)return wave;if(i<6)return n===2?wave+', cindermaw:1':wave;const extra=n%3===0?'hexbinder':n%3===1?'shardback':'cindermaw';return wave+', '+extra+':'+Math.min(3,1+Math.floor(i/15));});}
 window.Monster85={update,cancel,metrics,bolts,flares};
})();
