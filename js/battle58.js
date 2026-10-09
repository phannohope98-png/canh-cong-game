/* Grounded footprints, readable command clocks, and guarded building exits. */
(function(){
 const build=Level.build;
 Level.build=function(index){const m=build.call(this,index),cand=[],hw=53,hh=98,pad=CONFIG.pathWidth/2+8;
  for(let y=126;y<m.H-28;y+=22)for(let x=90;x<m.W-170;x+=22){
   if(MapArt.wetAt(m.feat,x,y,28))continue;
   if(m.feat.props.some(p=>Math.hypot(p.x-x,p.y-y)<100))continue;
   let blocked=false,near=Infinity;for(const p of m.paths){near=Math.min(near,p.nearest(x,y).perp);for(const q of p.points)if(q.x>x-hw-pad&&q.x<x+hw+pad&&q.y>y-hh-pad&&q.y<y+14+pad){blocked=true;break;}if(blocked)break;}
   if(!blocked&&near<185)cand.push({x,y,score:Math.abs(near-114)});
  }
  cand.sort((a,b)=>a.score-b.score||a.x-b.x);const spots=[];
  while(cand.length&&spots.length<m.def.spots){let best=-1,score=-Infinity;for(let i=0;i<cand.length;i++){const p=cand[i];if(spots.some(s=>Math.hypot(s.x-p.x,s.y-p.y)<142))continue;let covered=0;for(const path of m.paths)for(let d=80;d<path.length-100;d+=90){const q=path.pointAt(d,{});if(Math.hypot(q.x-p.x,q.y-p.y)<180&&!spots.some(s=>Math.hypot(q.x-s.x,q.y-s.y)<160))covered++;}const value=covered*16-p.score;if(value>score){best=i;score=value;}}
   if(best<0)break;spots.push({...cand.splice(best,1)[0],id:spots.length});
  }
  m.spots=spots;m.decor=MapArt.decor(m.feat,m.paths,spots,m.W,m.H,m.def.theme,index*31+7);return m;
 };
 const tick=UI.tick;UI.tick=function(){tick.call(this);const u=Units.hero;if(this.current!=='screen-game'||!u)return;for(let i=0;i<2;i++){const e=document.getElementById('command-time-'+i);if(!e)continue;const b=e.parentElement,total=i?u.heroDef.skill2.cooldown:u.heroDef.skill.cooldown,left=u.commandCd[i],lock=i&&u.level<10;e.textContent=lock?'10':'';b.setAttribute('aria-label',(i?u.heroDef.skill2.name:u.heroDef.skill.name)+(left>0?' · '+Math.ceil(left)+' giây':''));b.style.setProperty('--cool-angle',(Math.max(0,Math.min(1,left/total))*360)+'deg');b.classList.toggle('cooling58',left>0);b.classList.toggle('locked58',!!lock);}};
 const create=Units.createFor;Units.createFor=function(T){T.anim.door=.95;const result=create.call(this,T);let n=0;for(const u of this.list)if(u.tower===T){u.exitDelay=.18+n++*.24;u.exitT=.6;u.x=T.x;u.y=T.y-7;u.state='move';u.alpha=0;}return result;};
 const update=Unit.prototype.update;Unit.prototype.update=function(dt){if(this.exitDelay>0){this.exitDelay-=dt;this.moving=false;return;}if(this.exitT>0){this.exitT-=dt;if(this.tower)this.tower.anim.door=Math.max(this.tower.anim.door,.3);this.alpha=Math.min(1,(.6-this.exitT)/.3);}return update.call(this,dt);};
 const respawn=Unit.prototype.respawn;Unit.prototype.respawn=function(){respawn.call(this);if(this.tower){this.exitDelay=.18;this.exitT=.6;this.tower.anim.door=.95;this.x=this.tower.x;this.y=this.tower.y-7;this.state='move';}};
 PaintedWorld.foundation=function(g,x,y,type,tier,drop){if(drop<.32)return;const C=PaintedWorld.colors[Game.map.def.theme];g.save();g.translate(x,y+1);g.fillStyle=Game.map.theme.dirt||C[0];g.globalAlpha=.65;g.beginPath();g.ellipse(0,0,35,5,0,0,Math.PI*2);g.fill();g.globalAlpha=1;g.fillStyle=C[0];for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(i*8-3,4);g.lineTo(i*8,0);g.lineTo(i*8+6,4);g.fill();}g.restore();};
 // The painted entrance meets the chapter exit; its own banners belong to the faction.
 const prop=PaintedWorld.prop;PaintedWorld.prop=function(g,d,theme){if(!d.gate58)return prop.call(this,g,d,theme);const sheet=this.sheets.buildings58;if(!sheet?.loaded)return false;const f=sheet.frames[d.race],h=147,z=h/f.h;g.save();g.translate(d.x,d.y);g.fillStyle=MapArt.TH[theme].road;g.beginPath();g.ellipse(-13,-12,57,18,0,0,7);g.fill();g.drawImage(sheet.img,f.x,f.y,f.w,f.h,-f.w*z/2,-h,f.w*z,h);g.restore();return true;};
 window.Battle58={footprint:{halfWidth:53,height:98},version:58};
})();
