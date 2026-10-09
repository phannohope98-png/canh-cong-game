/* Ground-targeted commands create real units, projectiles and timed impacts. */
(function(){
 const extra=['veyra','thalen','oria','haldren','brakka'],image=new Image(),icons=new Map(),oldIcon=SkillArt.icon,zones=[];
 const ready=new Promise((ok,no)=>{image.onload=ok;image.onerror=no;});image.src=new URL('../assets/sprites/skills57.webp',document.currentScript.src).href;ArtStylized.ready=Promise.all([ArtStylized.ready,ready]);
 SkillArt.icon=function(id,slot){if(id==='aldric'&&!slot){id='veyra';slot=1;}if(!extra.includes(id))return oldIcon(id,slot);const key=id+slot;if(icons.has(key))return icons.get(key);if(!image.naturalWidth)return '';const c=document.createElement('canvas');c.width=c.height=96;c.getContext('2d').drawImage(image,extra.indexOf(id)*image.naturalWidth/5,slot*image.naturalHeight/2,image.naturalWidth/5,image.naturalHeight/2,0,0,96,96);const url=c.toDataURL();icons.set(key,url);return url;};
 const near=(x,y,r)=>Enemies.list.filter(e=>e.alive&&Math.hypot(e.x-x,e.y-y)<r).sort((a,b)=>b.dist-a.dist);
 function post(x,y){let best=null;for(const p of Game.map.paths){const n=p.nearest(x,y);if(!best||n.perp<best.perp)best={...n,path:p};}return best.path.pointAt(best.dist,{});}
 function summon(u,x,y,n,life,art='soldier',illusion=false){const p=post(x,y);for(let i=0;i<n;i++){const px=p.x+(i-(n-1)/2)*24,py=p.y+(i%2?9:-9),hp=(illusion?90:145)*(1+(u.level-1)*.012),damage=illusion?u.damage.map(v=>v*.4):[u.damage[0]*.4,u.damage[1]*.5];Units.list.push(new Unit({temp:true,life,art,x:px,y:py-32,postX:px,postY:py,state:'move',alpha:0,radius:8,speed:90,rate:1.5,engage:140,maxHp:hp,hp,damage,armor:illusion?.05:.3,regen:0,scale:(illusion?43:32)/48,range:illusion?150:0,proj:illusion?'bolt':null,dtype:illusion?'magic':'physical',air:illusion}));Effects.ring(px,py,4,24,.45,illusion?'#b9a0e6':'#a0cbe3',3);Effects.burst(px,py-8,illusion?'#cab3eb':'#dfd9b8',8,65,.5,3,30);}}
 const add=z=>zones.push({t:0,done:0,pulse:0,...z}),oldCast=Hero.cast;
 Hero.cast=function(u,slot=0,point){if(!u?.active||u.state==='dead'||slot&&u.level<10||u.commandCd[slot]>0)return false;const h=u.heroDef,id=u.heroId,target=near(u.x,u.y,300)[0],p=point||{x:target?.x??u.x,y:target?.y??u.y},m=.5*(1+Math.min(1.1,(u.level-1)*.018))*(1+Math.min(.35,Progress.gearMods(id).skill));p.x=Math.max(24,Math.min(Game.map.W-24,p.x));p.y=Math.max(24,Math.min(Game.map.H-24,p.y));if(id==='brakka'&&slot&&!near(p.x,p.y,80).length){UI.toast('Chọn một quái trong tầm móc');return false;}if(point&&Math.hypot(p.x-u.x,p.y-u.y)>320){UI.toast('Chọn điểm trong tầm của tướng');return false;}
  if(!extra.includes(id)&&id!=='aldric'){
   /* The original four retain their own command behavior; clicked ground selects the target group. */
   if(id==='lyra'&&slot)return oldCast.call(this,u,slot);{const targets=near(p.x,p.y,180);if(id==='lyra'&&!slot){u.commandCd[0]=h.skill.cooldown;u.skillCd=u.commandCd[0];u.atk=0;for(const e of targets.slice(0,6)){e.windMarkT=6;Combat.fire('arrow',u.x,u.y-25,e,{damage:[h.skill.damage*m*.55,h.skill.damage*m*.65],type:'physical'});}add({id,slot,x:p.x,y:p.y,r:80,life:.75});return true;}
    if(id==='selene'){u.commandCd[slot]=slot?h.skill2.cooldown:h.skill.cooldown;u.atk=0;if(slot){for(const e of near(p.x,p.y,90)){e.stunT=e.boss?.15:1.1;e.slowT=3;e.slowMul=.5;}add({id,slot,x:p.x,y:p.y,r:90,life:3,damage:30*m});}else for(const e of targets.slice(0,5)){Combat.hitEnemy(e,h.skill.damage*m*.65,'magic',.2);add({id,slot,x:u.x,y:u.y-25,tx:e.x,ty:e.y-20,r:90,life:.65});}return true;}
    if(id==='nara'){u.commandCd[slot]=slot?h.skill2.cooldown:h.skill.cooldown;u.atk=0;if(slot){for(const a of Units.list)if(a.active&&Math.hypot(a.x-p.x,a.y-p.y)<140)a.warCryT=5;add({id,slot,x:p.x,y:p.y,r:140,life:1.2});}else{Hero.moveHero(u,p.x,p.y);u.speedBoostT=2;add({id,slot,u,x:p.x,y:p.y,r:125,life:.8,charge:true,damage:h.skill.damage*m,bleed:true});}return true;}
    if(id==='borin'){u.commandCd[slot]=slot?h.skill2.cooldown:h.skill.cooldown;u.atk=0;if(slot)for(let i=0;i<3;i++)add({id,slot,x:p.x+(i-1)*35,y:p.y,r:23,life:12,mine:true,damage:90*m});else{for(let i=0;i<3;i++)add({id:'oria',slot:0,x:p.x+(i-1)*28,y:p.y,r:60,life:1.8,impact:.45+i*.25,damage:h.skill.damage*m*.7,physical:true});}return true;}
   }
   return oldCast.call(this,u,slot);
  }
  u.commandCd[slot]=slot?h.skill2.cooldown:h.skill.cooldown;if(!slot)u.skillCd=u.commandCd[0];u.atk=0;u.face=p.x>=u.x?1:-1;
  if(id==='aldric'){
   if(!slot){summon(u,p.x,p.y,2,16);add({id,slot,x:p.x,y:p.y,r:55,life:.8});}
   else{u.shieldT=4;Hero.moveHero(u,p.x,p.y);u.speedBoostT=2;add({id,slot,u,x:p.x,y:p.y,r:80,life:1.1,charge:true,damage:95*m});}
  }else if(id==='veyra'){
   if(slot){summon(u,p.x,p.y,2,14);add({id:'aldric',slot:0,x:p.x,y:p.y,r:55,life:.8});}
   else for(let i=0;i<3;i++)add({id,slot,x:p.x+(i-1)*22,y:p.y,r:72,life:1.8,impact:.25+i*.38,damage:h.skill.damage*m*.55});
  }else if(id==='thalen'){
   if(slot)add({id,slot,x:p.x,y:p.y,r:80,life:3.5,damage:12*m});
   else{Hero.moveHero(u,p.x,p.y);u.speedBoostT=2;add({id,slot,u,x:p.x,y:p.y,r:85,life:1,charge:true,damage:h.skill.damage*m});}
  }else if(id==='oria'){
   if(slot){summon(u,p.x,p.y,1,12,'oria',true);add({id,slot,x:p.x,y:p.y,r:50,life:1});}
   else for(let i=0;i<3;i++)add({id,slot,x:p.x+(i-1)*24,y:p.y,r:68,life:1.8,impact:.45+i*.3,damage:h.skill.damage*m*.55});
  }else if(id==='haldren'){
   if(slot){for(const a of Units.list)if(a.active&&Math.hypot(a.x-p.x,a.y-p.y)<130)a.shieldT=Math.max(a.shieldT||0,6);add({id,slot,x:p.x,y:p.y,r:130,life:1.3});}
   else add({id,slot,x:p.x,y:p.y,r:125,life:1.3,impact:.35,damage:h.skill.damage*m});
  }else{
   if(slot){const e=near(p.x,p.y,80)[0];if(e){e.dist=Math.max(0,e.dist-(e.boss?15:90));e.place();Combat.hitEnemy(e,70*m,'physical');e.stunT=e.boss?.15:1.1;add({id,slot,x:u.x,y:u.y-24,tx:e.x,ty:e.y-16,r:90,life:.75});}}
   else{Hero.moveHero(u,p.x,p.y);u.speedBoostT=2;add({id,slot,u,x:p.x,y:p.y,r:100,life:1.8,charge:true,spin:true,damage:h.skill.damage*m});}
  }
  AudioSys.play(id==='oria'?'magic':id==='haldren'||id==='veyra'?'explode':'sword');return true;
 };
 const update=Effects.update;Effects.update=function(dt){update.call(this,dt);for(let i=zones.length-1;i>=0;i--){const z=zones[i];z.t+=dt;if(z.charge){if(z.u?.active&&Math.hypot(z.u.x-z.x,z.u.y-z.y)>24&&z.t<2.5)continue;z.charge=false;z.t=0;z.u.atk=0;}if(z.t>z.life){zones.splice(i,1);continue;}
   if(z.mine){if(near(z.x,z.y,28).some(e=>!e.flying)){Combat.splash(z.x,z.y,65,[z.damage*.8,z.damage],'physical',{air:false});Effects.explosion(z.x,z.y-6,42,'#eda65b');zones.splice(i,1);}continue;}
   if(z.impact!==undefined&&!z.done&&z.t>=z.impact){z.done=1;Combat.splash(z.x,z.y,z.r,[z.damage*.85,z.damage],z.id==='oria'&&!z.physical?'magic':'physical',{air:z.id==='oria'&&!z.physical});for(const e of near(z.x,z.y,z.r))if(!e.flying&&z.id!=='oria')e.stunT=Math.max(e.stunT||0,e.boss?.15:.7);Effects.burst(z.x,z.y,'#d7b583',10,90,.45,4,160);Effects.shake(2,.12);}
   if(z.id==='thalen'&&z.slot){for(const e of near(z.x,z.y,z.r)){e.slowT=.8;e.slowMul=e.boss?.8:.45;if(!e.boss)e.stunT=Math.max(e.stunT||0,.25);}}
   if(z.damage&&z.impact===undefined&&!z.mine){z.pulse-=dt;if(z.pulse<=0){z.pulse=z.spin?.6:z.id==='selene'?.7:99;if(z.bleed)for(const e of near(z.x,z.y,z.r))if(!e.flying)e.bleed56={left:3,pulse:.65,damage:z.damage*.12};Combat.splash(z.x,z.y,z.r,z.damage,z.id==='selene'?'magic':'physical',{air:z.id==='selene'});}}
  }};
 const oldFx=SkillArt.fx;function fx(g,id,slot,x,y,r,t,life=1.5,z={}){
  if(window.SkillFx59)return SkillFx59.draw(g,id,slot,x,y,r,t,life,z);
  if(!extra.includes(id)&&id!=='aldric'){oldFx(g,id,slot,x,y,r,t,life,z);return;}
  const fade=Math.min(1,t*9,(life-t)*5),p=Math.min(1,t/.5);g.save();g.translate(x,y);g.globalAlpha=Math.max(0,fade);g.lineCap='round';g.lineJoin='round';
  if(id==='aldric'&&!slot){g.strokeStyle='#b1d4e3';g.fillStyle='#84a5bd22';g.lineWidth=2;g.beginPath();g.ellipse(0,0,r*p,r*p*.32,0,0,7);g.fill();g.stroke();for(const q of [-1,1]){g.save();g.translate(q*18,-8);ArtStylized.draw(g,'soldier',{w:-1,a:-1,t},28);g.restore();}}
  else if(id==='oria'&&!slot||id==='veyra'&&!slot){const impact=z.impact??.65,fall=Math.min(1,t/impact),py=-150*(1-fall);if(t<impact){g.strokeStyle=id==='oria'?'#c4a2ec':'#e4c595';g.lineWidth=4;g.beginPath();g.moveTo(-12,py-25);g.lineTo(0,py);g.stroke();if(id==='oria'){g.fillStyle='#b27bd4';g.strokeStyle='#eee1fa';g.lineWidth=2;g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5;g.lineTo(Math.cos(a)*(i%2?6:13),py+Math.sin(a)*(i%2?6:13));}g.closePath();g.fill();g.stroke();}else{g.fillStyle='#ba9457';g.strokeStyle='#534635';g.lineWidth=2;g.fillRect(-4,py-8,8,30);g.strokeRect(-4,py-8,8,30);g.fillStyle='#bfc3b7';g.fillRect(-17,py-17,34,18);g.strokeRect(-17,py-17,34,18);}}else{const k=Math.min(1,(t-impact)*3);g.strokeStyle=id==='oria'?'#d7b7f0':'#e0bd83';g.lineWidth=5*(1-k)+1;g.beginPath();g.ellipse(0,0,r*k,r*k*.38,0,0,7);g.stroke();}}
  else if(id==='thalen'&&slot){g.strokeStyle='#5c7742';g.lineWidth=5;for(let i=0;i<7;i++){const a=i*Math.PI*2/7;g.beginPath();g.moveTo(Math.cos(a)*r*.7,Math.sin(a)*r*.3);g.quadraticCurveTo(Math.cos(a)*r*.4,-20-Math.sin(t*2+i)*4,Math.cos(a)*r*.2,-8);g.stroke();g.fillStyle='#b1c77b';g.beginPath();g.ellipse(Math.cos(a)*r*.45,-17,7,3,a,0,7);g.fill();}}
  else if(id==='brakka'&&slot){g.strokeStyle='#c9bba0';g.lineWidth=3;const tx=(z.tx??x+r)-x,ty=(z.ty??y)-y;for(let i=0;i<12;i++){const k=i/12;g.beginPath();g.ellipse(tx*k,ty*k,5,2.5,Math.atan2(ty,tx),0,7);g.stroke();}}
  else if(id==='haldren'&&!slot){g.strokeStyle='#b99a71';g.lineWidth=4;for(let i=0;i<3;i++){const a=Math.max(0,p-i*.2);g.beginPath();g.ellipse(0,0,r*a,r*a*.4,0,0,7);g.stroke();}for(let i=0;i<7;i++){const a=i*Math.PI*2/7;g.fillStyle='#987e62';g.beginPath();g.moveTo(Math.cos(a)*r*.65,-12*p+Math.sin(a)*r*.26);g.lineTo(Math.cos(a)*r*.65+7,Math.sin(a)*r*.26);g.lineTo(Math.cos(a)*r*.65-6,Math.sin(a)*r*.26+3);g.closePath();g.fill();}}
  else if(id==='haldren'||id==='aldric'){g.fillStyle='#82b6c244';g.strokeStyle='#e5c884';g.lineWidth=3;g.beginPath();g.moveTo(-19,-42);g.lineTo(19,-42);g.lineTo(15,-12);g.lineTo(0,0);g.lineTo(-15,-12);g.closePath();g.fill();g.stroke();}
  else if(id==='oria'){for(const q of [-1,1]){g.save();g.globalAlpha*=.6;g.translate(q*17,0);ArtStylized.draw(g,'oria',{w:-1,a:-1,t},45);g.restore();}}
  else{g.strokeStyle=id==='thalen'?'#d8e6b4':'#edb7a1';g.lineWidth=5;g.beginPath();g.ellipse(0,-20,r*.75,r*.33,t*9,3.1,6.2);g.stroke();g.strokeStyle='#fff1cb';g.lineWidth=1.5;g.stroke();}
  g.restore();
 }
 SkillArt.fx=fx;const draw=Effects.drawCircles;Effects.drawCircles=function(g){draw.call(this,g);if(Game.heroSkillAim){const u=Game.heroSkillAim.u;g.save();g.strokeStyle='#e9d399';g.lineWidth=2;g.setLineDash([8,6]);g.beginPath();g.arc(u.x,u.y,320,0,Math.PI*2);g.stroke();g.restore();}for(const z of zones)if(!z.charge)fx(g,z.id,z.slot,z.x,z.y,z.r,z.t,z.life,z);};
 const clear=Effects.clear;Effects.clear=function(){zones.length=0;Game.heroSkillAim=null;return clear.call(this);};
 const act=UI.act;UI.act=function(a,d,el){if(a!=='hero-command')return act.call(this,a,d,el);const u=Units.hero,slot=+d.skill;if(u?.heroId==='lyra'&&slot===1){Hero.cast(u,slot);return;}if(!u?.active||u.commandCd[slot]>0||slot&&u.level<10){this.toast('Kỹ năng chưa sẵn sàng');return;}if(Game.heroSkillAim?.slot===slot){Game.heroSkillAim=null;this.tip(null);return;}Game.heroSkillAim={u,slot};Game.sel=null;Game.rallyFor=null;Spells.armed=null;this.closeRing();this.tip((slot?u.heroDef.skill2:u.heroDef.skill).name+' · Chạm điểm trong vòng tầm');};
 const tap=Game.onTap;Game.onTap=function(x,y){if(this.heroSkillAim){const a=this.heroSkillAim;if(!a.u.active||a.u!==Units.hero){this.heroSkillAim=null;UI.tip(null);return;}if(Hero.cast(a.u,a.slot,{x,y})){this.heroSkillAim=null;UI.tip(null);}return;}return tap.call(this,x,y);};
 window.Battle57={zones,fx,summon};
})();
