/* Combat commands and rare relic rules. No healing command or walk-cycle tower crew. */
(function(){
 const ids=['aldric','lyra','selene','borin','nara'],base=new URL('../assets/sprites/',document.currentScript.src),iconImage=new Image(),iconCache=new Map(),active=[];
 const ready=new Promise((ok,no)=>{iconImage.onload=ok;iconImage.onerror=no;});iconImage.src=new URL('skills56.webp',base).href;ArtStylized.ready=Promise.all([ArtStylized.ready,ready]);
 SkillArt.icon=function(id,slot){const k=id+slot;if(iconCache.has(k))return iconCache.get(k);if(!iconImage.complete||!iconImage.naturalWidth)return '';const c=document.createElement('canvas');c.width=c.height=96;const w=iconImage.naturalWidth/5,h=iconImage.naturalHeight/2;c.getContext('2d').drawImage(iconImage,ids.indexOf(id)*w,slot*h,w,h,0,0,96,96);const u=c.toDataURL();iconCache.set(k,u);return u;};
 Items.name=function(it){return it.r===5?this.def(it).relicName:this.def(it).name+' '+this.rar(it).suffix;};
 Items.canFuse=function(it){return !!it&&it.r<4&&this.fuseList(it).length>=3;};
 const nameLore=Items.lore;Items.lore=function(it){return nameLore(it)+(it.r===5?' Chỉ có cơ hội 0,2% từ boss cổng của hai thế giới cuối, với tướng cấp 30 trở lên. Không ghép, không mua, không có bản trùng.':'');};
 const normalRarity=Items.rollRarity;Items.rollRarity=function(region,boss){
  const found=Save.data.relicFound||[];
  if(boss&&!this._relicAttempt&&region>=3&&Game.levelIndex%6===5&&Progress.heroLevel(Progress.selectedHero())>=30&&found.length<24){this._relicAttempt=true;if(Math.random()<CONFIG.items.mythicChance)return 5;}
  const w=boss?[0,0,70,27,3]:[50,34,12,3.5,.5];let q=Math.random()*100;for(let i=0;i<5;i++){q-=w[i];if(q<0)return i;}return 4;
 };
 const add=Items.add;Items.add=function(t,s,r){if(r===5){const key=t+':'+s;Save.data.relicFound=Save.data.relicFound||[];if(Save.data.relicFound.includes(key))return add.call(this,t,s,4);Save.data.relicFound.push(key);}return add.call(this,t,s,r);};
 const salvage=Items.salvage;Items.salvage=function(u,quiet){if(this.find(u)?.r===5)return 0;return salvage.call(this,u,quiet);};
 const drop=Loot.drop;Loot.drop=function(x,y,r){if(r!==5)return drop.call(this,x,y,r);const found=Save.data.relicFound||[],available=[];for(const t of Items.TYPES)for(let s=0;s<6;s++)if(!found.includes(t+':'+s))available.push([t,s]);if(!available.length)return drop.call(this,x,y,4);const [t,s]=available[Math.floor(Math.random()*available.length)],it=Items.add(t,s,5);this.found.push(it);this.list.push({x,y,it,t:0,vx:0});Effects.text(x,y-60,Items.name(it),Items.rar(it).col,18);Effects.ring(x,y,5,70,1.3,Items.rar(it).col,3);};
 const load=Save.load;Save.load=function(){load.call(this);this.data.relicFound=[...new Set([...(this.data.relicFound||[]),...this.data.items.filter(i=>i.r===5).map(i=>i.t+':'+i.s)])];return this.data;};
 const start=Game.start;Game.start=function(i){Items._relicAttempt=false;active.length=0;return start.call(this,i);};
 const near=(x,y,r)=>Enemies.list.filter(e=>e.alive&&Math.hypot(e.x-x,e.y-y)<r).sort((a,b)=>b.dist-a.dist);
 const zone=(id,slot,x,y,r,life,power=1,extra={})=>active.push({id,slot,x,y,r,life,t:0,pulse:0,power,...extra});
 Hero.cast=function(u,slot=0){if(!u?.active||u.state==='dead'||slot===1&&u.level<10||u.commandCd[slot]>0)return false;const id=u.heroId,h=u.heroDef,m=(1+(u.level-1)*CONFIG.heroPerLevel)*(1+Progress.gearMods(id).dmg)*(1+Progress.gearMods(id).skill),e=near(u.x,u.y,270)[0],x=e?.x??u.x,y=e?.y??u.y;
  u.commandCd[slot]=slot?h.skill2.cooldown:h.skill.cooldown;u.atk=0;if(e)u.face=e.x>=u.x?1:-1;if(!slot)u.skillCd=u.commandCd[0];
  if(id==='aldric'){
   if(slot){u.shieldT=4;for(const q of near(u.x,u.y,75)){Combat.hitEnemy(q,h.skill.damage*m*.45,'physical');q.stunT=Math.max(q.stunT||0,q.boss?.15:.65);}zone(id,1,u.x,u.y,70,4,m,{u});}
   else{for(const q of near(u.x,u.y,155)){Combat.hitEnemy(q,h.skill.damage*m,'physical',.15);q.dist=Math.max(0,q.dist-(q.boss?12:35));q.place();q.stunT=Math.max(q.stunT||0,q.boss?.2:.75);}zone(id,0,u.x,u.y,150,.8,m,{face:u.face||1});}
  }else if(id==='lyra'){
   if(slot){if(e){Combat.fire('arrow',u.x,u.y-23,e,{damage:[u.damage[0]*2,u.damage[1]*2],type:'physical',root:.95});e.stunT=Math.max(e.stunT||0,e.boss?.2:1.2);}Hero.moveHero(u,Math.max(30,Math.min(Game.map.W-30,u.x+(e&&e.x<u.x?85:-85))),Math.max(30,u.y-15));u.speedBoostT=2;zone(id,1,u.x,u.y,90,.8,m);}
   else{const targets=near(u.x,u.y,270).slice(0,u.level>=35?6:5);for(const q of targets){q.windMarkT=6;Combat.fire('arrow',u.x,u.y-25,q,{damage:[h.skill.damage*m*.55,h.skill.damage*m*.65],type:'physical',pierce:true});}zone(id,0,u.x,u.y,160,.75,m,{targets,face:u.face});}
  }else if(id==='selene'){
   if(slot){for(const q of near(x,y,90)){q.stunT=Math.max(q.stunT||0,q.boss?.15:2);q.slowT=3;q.slowMul=.5;}zone(id,1,x,y,90,3,m);}
   else{let sx=u.x,sy=u.y-27;for(const q of near(x,y,170).slice(0,u.level>=35?5:4)){Combat.hitEnemy(q,h.skill.damage*m*.65,'magic',.2);zone(id,0,sx,sy,70,.65,m,{tx:q.x,ty:q.y-18});sx=q.x;sy=q.y-18;}}
  }else if(id==='borin'){
   if(slot){for(let i=0;i<3;i++)zone(id,1,x+(i-1)*44,y+(i%2?9:-6),23,12,m,{mine:true,damage:h.skill.damage*m*.9});}
   else{const targets=near(x,y,170).filter(q=>!q.flying).slice(0,3);for(const q of targets)Combat.fire('bomb',u.x,u.y-22,q,{damage:[h.skill.damage*m*.6,h.skill.damage*m*.8],aoe:65,type:'physical'});zone(id,0,u.x,u.y,95,.7,m,{face:u.face});}
  }else{
   if(slot){for(const q of Units.list)if(q.active&&Math.hypot(q.x-u.x,q.y-u.y)<140)q.warCryT=5;zone(id,1,u.x,u.y,140,1.2,m);}
   else{Combat.splash(u.x,u.y,125,[h.skill.damage*m*.85,h.skill.damage*m],'physical',{air:false});for(const q of near(u.x,u.y,125))if(!q.flying)q.bleed56={left:3,pulse:.65,damage:h.skill.damage*m*.12};zone(id,0,u.x,u.y,125,.8,m);}
  }
  AudioSys.play(id==='selene'?'magic':id==='borin'?'cannon':id==='lyra'?'arrow':'sword');return true;
 };
 const unitsUpdate=Units.update;Units.update=function(dt){const changed=[];for(const u of this.list)if(u.active&&u.warCryT>0){const before=u.damage,boost=before.map(v=>v*1.25);u.damage=boost;changed.push([u,before,boost]);}try{return unitsUpdate.call(this,dt);}finally{for(const [u,before,boost]of changed)if(u.damage===boost)u.damage=before;}};
 const update=Effects.update;Effects.update=function(dt){update.call(this,dt);for(const e of Enemies.list){const b=e.bleed56;if(!e.alive||!b)continue;b.left-=dt;b.pulse-=dt;if(b.left<=0){delete e.bleed56;continue;}if(b.pulse<=0){b.pulse+=.65;Combat.hitEnemy(e,b.damage,'physical');Effects.text(e.x,e.y-24,'•','#bc6358',10);}}for(const u of Units.list)u.warCryT=Math.max(0,(u.warCryT||0)-dt);for(let i=active.length-1;i>=0;i--){const z=active[i];z.t+=dt;if(z.u){z.x=z.u.x;z.y=z.u.y;}if(z.t>=z.life){active.splice(i,1);continue;}if(z.mine){if(near(z.x,z.y,z.r+5).some(q=>!q.flying)){Combat.splash(z.x,z.y,65,[z.damage*.8,z.damage],'physical',{air:false});for(const q of near(z.x,z.y,65))q.stunT=Math.max(q.stunT||0,q.boss?.15:.7);Effects.burst(z.x,z.y-8,'#edb45f',10,120,.6,5,80);active.splice(i,1);}continue;}if(!(z.bleed||z.id==='selene'&&z.slot))continue;z.pulse-=dt;if(z.pulse>0)continue;z.pulse=.65;if(z.bleed)Combat.splash(z.x,z.y,z.r,z.damage,'physical',{air:false});else Combat.splash(z.x,z.y,z.r,CONFIG.heroes.selene.damage[1]*z.power*.45,'magic',{air:true});}};
 function fx(g,id,slot,x,y,r,t,life=1,extra={}){
  const col=CONFIG.heroes[id].color,p=Math.min(1,t/.22),fade=Math.min(1,(life-t)*5);g.save();g.translate(x,y);if(!slot&&(id==='lyra'||id==='borin'))g.scale(extra.face||1,1);g.globalAlpha=Math.max(0,fade);g.lineJoin='round';g.lineCap='round';
  if(id==='aldric'&&!slot){const len=r*p;g.strokeStyle='#edf8ff';g.lineWidth=7;g.beginPath();g.moveTo(0,-20);g.lineTo(len*(extra.face||1),-20);g.stroke();g.strokeStyle=col;g.lineWidth=3;g.stroke();for(let i=0;i<3;i++){g.beginPath();g.moveTo(len*(extra.face||1)-i*14,-35+i*4);g.lineTo((len+14)*(extra.face||1)-i*14,-20);g.lineTo(len*(extra.face||1)-i*14,-5-i*4);g.stroke();}}
  else if(id==='aldric'){g.strokeStyle='#dfc987';g.fillStyle='#4b83b377';g.lineWidth=3;g.beginPath();g.moveTo(-22,-46);g.lineTo(22,-46);g.lineTo(18,-13);g.lineTo(0,0);g.lineTo(-18,-13);g.closePath();g.fill();g.stroke();}
  else if(id==='lyra'){g.strokeStyle=slot?'#d7ecb5':'#9fd675';g.lineWidth=3;for(let i=0;i<(slot?3:5);i++){const a=(i-2)*.14,len=r*p;g.save();g.rotate(a);g.beginPath();g.moveTo(slot?-len:0,-20+i*3);g.lineTo(slot?0:len,-20+i*3);g.stroke();g.beginPath();g.moveTo(len-9,-25+i*3);g.lineTo(len,-20+i*3);g.lineTo(len-9,-15+i*3);g.stroke();g.restore();}}
  else if(id==='selene'&&!slot){const tx=(extra.tx??x+r)-x,ty=(extra.ty??y-15)-y;g.strokeStyle='#d2a0f3';g.lineWidth=6;g.beginPath();g.moveTo(0,0);for(let i=1;i<=8;i++){const k=i/8;g.lineTo(tx*k+(i%2?8:-8)*Math.sin(Math.PI*k),ty*k+(i%2?-7:7));}g.stroke();g.strokeStyle='#fff0ff';g.lineWidth=2;g.stroke();}
  else if(id==='selene'){g.strokeStyle='#c892eb';g.lineWidth=3;g.fillStyle='#8060ad22';g.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI/3;g.lineTo(Math.cos(a)*r*.65,Math.sin(a)*r*.3-18);}g.closePath();g.fill();g.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3;g.beginPath();g.moveTo(Math.cos(a)*r*.65,Math.sin(a)*r*.3-18);g.lineTo(Math.cos(a)*r*.65,Math.sin(a)*r*.3-50*p);g.stroke();}}
  else if(id==='borin'){g.strokeStyle='#5f4931';g.lineWidth=2.5;g.fillStyle='#ad7b3d';if(slot){g.beginPath();g.ellipse(0,0,13,6,0,0,7);g.fill();g.stroke();g.fillStyle='#e6ae55';g.beginPath();g.ellipse(0,-4,8,4,0,0,7);g.fill();g.stroke();g.fillStyle='#ffe49d';g.beginPath();g.arc(0,-8,2+Math.sin(t*5)*.5,0,7);g.fill();}else{for(let i=0;i<3;i++){const px=20+i*25*p,py=-35-Math.sin(p*Math.PI)*15+i*7;g.beginPath();g.arc(px,py,6,0,7);g.fill();g.stroke();g.strokeStyle='#f6c16e';g.beginPath();g.moveTo(px-19,py+4);g.lineTo(px-8,py);g.stroke();}}}
  else{g.strokeStyle=slot?'#eda08a':'#f1c7ae';g.lineWidth=slot?4:8;const rr=r*(.4+.5*p);g.beginPath();g.ellipse(0,-19,rr,rr*.48,-.3,slot?0:3.5,slot?Math.PI*2:6.5);g.stroke();if(!slot){g.strokeStyle='#bd6152';g.lineWidth=3;g.stroke();}else for(let i=0;i<7;i++){const a=i*Math.PI*2/7;g.beginPath();g.moveTo(Math.cos(a)*rr*.8,Math.sin(a)*rr*.4-19);g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.5-19);g.stroke();}}
  g.restore();
 }
 SkillArt.fx=fx;const draw=Effects.drawCircles;Effects.drawCircles=function(g){draw.call(this,g);for(const z of active)fx(g,z.id,z.slot,z.x,z.y,z.r,z.t,z.life,z);};
 const clear=Effects.clear;Effects.clear=function(){active.length=0;return clear.call(this);};
 window.Battle56={active,fx};
})();
