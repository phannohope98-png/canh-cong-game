/* Support affects actual combat, with capped non-stacking buffs and visible expiry. */
(function(){
 const zones=[],metrics={casts:0,granted:0,expired:0};
 const cast=Hero.cast;Hero.cast=function(u,slot=0,point){if(!['ilyen','maera'].includes(u?.heroId))return cast.apply(this,arguments);
  if(!u.active||u.state==='dead'||slot&&u.level<10||u.commandCd[slot]>0)return false;
  const h=u.heroDef,s=slot?h.skill2:h.skill,p=point||u;
  if(Math.hypot(p.x-u.x,p.y-u.y)>140){UI.toast('Đặt hỗ trợ trong tầm của tướng');return false;}
  u.commandCd[slot]=s.cooldown;if(!slot)u.skillCd=s.cooldown;u.atk=0;u.heroSupport85=1.4;
  const kind=u.heroId==='ilyen'?(slot?'rescue':'haste'):(slot?'power':'ward');
  const scale=1+Math.min(.25,Progress.gearMods(u.heroId).skill),strength={haste:.18,rescue:.15,power:.16,ward:.2}[kind]*scale;
  zones.push({kind,id:u.heroId,slot,x:p.x,y:p.y,r:(s.radius||100)*.8,t:0,life:kind==='rescue'?4:kind==='power'?5:6,strength,healed:new Set()});metrics.casts++;AudioSys.play('magic');return true;
 };
 const tick=Effects.update;Effects.update=function(dt){tick.call(this,dt);for(let i=zones.length-1;i>=0;i--){const z=zones[i];z.t+=dt;if(z.t>=z.life){zones.splice(i,1);continue;}
  const friends=Units.list.filter(u=>u.active&&u.state!=='dead'&&Math.hypot(u.x-z.x,u.y-z.y)<z.r).sort((a,b)=>Math.hypot(a.x-z.x,a.y-z.y)-Math.hypot(b.x-z.x,b.y-z.y)).slice(0,6);
  for(const u of friends){u.buffs85=u.buffs85||{};const b=u.buffs85[z.kind];if(!b||b.left<=0)metrics.granted++;u.buffs85[z.kind]={left:.18,strength:Math.max(b?.strength||0,z.strength)};
   if(z.kind==='rescue'&&!z.healed.has(u)){z.healed.add(u);u.hp=Math.min(u.maxHp,u.hp+u.maxHp*.1);}
  }
 }};
 const update=Unit.prototype.update;Unit.prototype.update=function(dt){this.heroSupport85=Math.max(0,(this.heroSupport85||0)-dt);const B=this.buffs85||{};for(const b of Object.values(B)){const before=b.left;b.left=Math.max(0,b.left-dt);if(before>0&&!b.left)metrics.expired++;}
  const rate=this.rate,damage=this.damage;try{if(B.haste?.left>0)this.rate=rate/(1+B.haste.strength);if(B.power?.left>0)this.damage=damage.map(v=>v*(1+B.power.strength));return update.call(this,dt);}finally{this.rate=rate;this.damage=damage;}
 };
 const hit=Combat.hitUnit;Combat.hitUnit=function(u,dmg){const B=u.buffs85||{},reduction=Math.max(B.ward?.left>0?B.ward.strength:0,B.rescue?.left>0?B.rescue.strength:0);return hit.call(this,u,Array.isArray(dmg)?dmg.map(v=>v*(1-reduction)):dmg*(1-reduction));};
 const draw=Effects.drawCircles;Effects.drawCircles=function(g){draw.call(this,g);for(const z of zones){const f=Math.min(5,Math.floor((z.t%1.3)/1.3*6));ArtVfx85.paint(g,z.id==='ilyen'?2:3,f,z.x,z.y-12,Math.min(76,z.r*.65));
   g.save();g.strokeStyle=z.id==='ilyen'?'#b7d787':'#abcfe6';g.globalAlpha=.25;g.lineWidth=1;g.beginPath();g.ellipse(z.x,z.y,z.r,z.r*.36,0,0,7);g.stroke();g.restore();}
  for(const u of Units.list)if(u.active&&Object.values(u.buffs85||{}).some(b=>b.left>0)){g.save();g.strokeStyle=u.buffs85.haste?.left>0?'#b7d787':'#accfe6';g.lineWidth=1;g.beginPath();g.arc(u.x,u.y-36,3,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,Math.max(...Object.values(u.buffs85).map(b=>b.left))/.18));g.stroke();g.restore();}
 };
 const clear=Effects.clear;Effects.clear=function(){zones.length=0;return clear.call(this);};
 window.Support85={zones,metrics};
})();
