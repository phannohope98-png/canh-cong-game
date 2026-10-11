/* Native-resolution board, robust rotation and visible wave action. */
(function(){
 'use strict';
 const setup=UI.setupBattle;
 UI.setupBattle=function(){const r=setup.apply(this,arguments);delete this.hud.waves.dataset.k;return r;};
 UI.updateWaveButtons=function(){
  if(!this.hud?.waves)return;const box=this.hud.waves,can=Game.state==='playing'&&Waves.canCall;
  if(!can){if(box.childElementCount)box.replaceChildren();delete box.dataset.k;return;}
  if(!box.querySelector('[data-action="call-wave"]'))box.innerHTML='<button class="wave-btn wave83" data-action="call-wave" aria-label="Gọi đợt quái"><span>'+Icon('skull')+'</span><svg class="ring" viewBox="0 0 76 76"><circle cx="38" cy="38" r="35"/></svg><b></b></button>';
  const b=box.firstElementChild,waiting=Waves.state==='waiting';b.querySelector('circle').style.strokeDashoffset=waiting?220*(1-Math.max(0,Waves.timer)/CONFIG.match.nextWaveDelay):0;
  b.querySelector('b').textContent=waiting?'+'+Math.floor(Waves.timer*CONFIG.match.earlyCallBonusPerSec):'Gọi đợt';b.disabled=Game.paused;box.dataset.k=Waves.state;
 };
 UI.tryLandscape=function(){};
 UI.toggleFullscreen=async function(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else this.toast('Dùng Thêm vào màn hình chính để chơi toàn màn hình.');}catch(e){this.toast('Trình duyệt chưa cho phép toàn màn hình.');}scheduleResize();};
 Game.measure=function(){
  const r=this.wrap.getBoundingClientRect();if(r.width<2||r.height<2)return;
  this.viewW=r.width;this.viewH=r.height;this.mobile63=matchMedia('(pointer:coarse)').matches||r.width<=1000;
  const native=Math.max(1,window.devicePixelRatio||1);this.q=1;
  this.dpr=Math.min(native,2.75,Math.sqrt(3200000/(r.width*r.height)));
  const cw=Math.round(r.width*this.dpr),ch=Math.round(r.height*this.dpr);if(this.canvas.width!==cw||this.canvas.height!==ch){this.canvas.width=cw;this.canvas.height=ch;}
  this.canvas.style.width=r.width+'px';this.canvas.style.height=r.height+'px';this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';Painter.ppuCap=4;
 };
 Game.renderBg=function(){if(this.map)this.bg=Level.renderBackground(this.map,Math.min(2.75,Math.max(1.25,Camera.zoom*this.dpr)));};
 Game.perfWatch=function(){/* Keep pixels crisp; scene extras use a bounded budget instead. */};
 Game.resize=function(){if(!this.map||this.state==='idle'||this.wrap.getBoundingClientRect().width<2)return;this.measure();Camera.resize(this.viewW,this.viewH);this.renderBg();this.pointers.clear();this.gesture=null;Camera.vx=Camera.vy=0;UI.closeRing();this.render();if(UI.hud)UI.tick();};
 let raf=0;
 function scheduleResize(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;Game.resize();});}
 window.addEventListener('resize',scheduleResize,{passive:true});window.addEventListener('orientationchange',scheduleResize,{passive:true});document.addEventListener('fullscreenchange',scheduleResize);window.visualViewport?.addEventListener('resize',scheduleResize,{passive:true});
 const observer=new ResizeObserver(scheduleResize);observer.observe(document.getElementById('game-wrap'));
 const buildMap=Level.build,background=Level.renderBackground;
 Level.build=function(i){const m=buildMap.call(this,i);if(m.W<=620)return m;const k=.8;
  m.background83={...m};m.W*=k;m.H*=k;m.sc=(m.sc||1)*k;
  m.paths=m.paths.map(p=>new Level.Path(p.points.map(q=>({x:q.x*k,y:q.y*k}))));m.spots=m.spots.map(q=>({...q,x:q.x*k,y:q.y*k}));m.starts=m.starts?.map(q=>({...q,x:q.x*k,y:q.y*k}));m.exit={...m.exit,x:m.exit.x*k,y:m.exit.y*k};m.entry=m.entry?.map(v=>v*k);
  m.feat={...m.feat,rivers:(m.feat.rivers||[]).map(v=>({...v,w:v.w*k,pts:v.pts.map(q=>Array.isArray(q)?q.map(n=>n*k):{...q,x:q.x*k,y:q.y*k})})),lakes:(m.feat.lakes||[]).map(v=>({...v,x:v.x*k,y:v.y*k,rx:v.rx*k,ry:v.ry*k}))};
  return m;
 };
 Level.renderBackground=function(m,res){return background.call(this,m.background83||m,(res||1)*(m.background83?.W?m.W/m.background83.W:1));};
 // Scale footprints and muzzle together, then enlarge only the tower crew around their foot pivot.
 if(window.Alive81)for(const k of Object.keys(Alive81.RING))Alive81.RING[k]*=.8;
 const painted=Painter.tower,figure=ArtStylized.draw;let onTower=false;
 Painter.tower=function(){const prev=onTower;onTower=true;try{return painted.apply(this,arguments);}finally{onTower=prev;}};
 const crewHeights={elf:29,mage:29,dwarf:25};
 ArtStylized.draw=function(g,id,P,h){const k=id.replace(/^crew-/,'');const towerK=window.Alive81?.towerScale(Game.map)||1;return figure.call(this,g,id,P,onTower&&crewHeights[k]?crewHeights[k]/towerK:h);};
 const crewLayout=PaintedWorld.layout;PaintedWorld.layout=function(type,tier,scale=1){const L=crewLayout.apply(this,arguments);if(type==='artillery'){const f=WORLD55.towers55.frames[12+tier-1];L.crew=['crew-dwarf',(.21-.5)*f.w/f.h*L.h,(.47-1)*L.h];L.crewSize=25;}return L;};
 const buildTower=Towers.build;
 Towers.build=function(){const t=buildTower.apply(this,arguments);if(!t)return t;const muzzle=t.muzzle;
  t.muzzle=function(){const q=muzzle.call(this),m=Game.map,painted=m&&(m.alliance84||m.human83||m.elf78||m.witch79||m.dwarf80||m.orc81),k=painted?Alive81.towerScale(m):1,off=painted?(Alive81.RING[Game.levelIndex]||45)*.12:0;return{x:this.x+(q.x-this.x)*k,y:this.y+off+(q.y-this.y)*k};};return t;
 };
 // Full viewport colour under the undistorted fitted board; no black bars or clipped routes.
 const render=Game.render;
 Game.render=function(){const r=render.apply(this,arguments);if(!this.bg||!this.map)return r;const g=this.ctx,z=Camera.zoom,d=this.dpr,W=this.canvas.width,H=this.canvas.height;
  const x=d*(this.viewW/2-Camera.x*z),y=d*(this.viewH/2-Camera.y*z),w=this.map.W*z*d,h=this.map.H*z*d;
  if(x>.5||y>.5||x+w<W-.5||y+h<H-.5){g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-over';const s=Math.max(W/this.bg.width,H/this.bg.height);g.drawImage(this.bg,(W-this.bg.width*s)/2,(H-this.bg.height*s)/2,this.bg.width*s,this.bg.height*s);g.restore();}return r;
 };
 // Arrows have a small forged head, wooden shaft and readable feathers, not a glowing laser.
 const combat=Combat.draw;
 Combat.draw=function(g){const shots=this.shots;this.shots=shots.filter(p=>p.kind!=='arrow'&&p.kind!=='enemyArrow');try{combat.call(this,g);}finally{this.shots=shots;}
  for(const p of shots){if(p.kind!=='arrow'&&p.kind!=='enemyArrow')continue;g.save();g.translate(p.x,p.y);g.rotate(p.angle);g.lineCap='round';g.lineJoin='round';g.strokeStyle='#38291c';g.lineWidth=2;g.beginPath();g.moveTo(-8,0);g.lineTo(4,0);g.stroke();g.strokeStyle='#cf9a56';g.lineWidth=.85;g.stroke();
   g.fillStyle=p.o?.pierce?'#edca72':'#dbe7e8';g.strokeStyle='#374b55';g.lineWidth=.65;g.beginPath();g.moveTo(3,-2);g.lineTo(8,0);g.lineTo(3,2);g.lineTo(4,0);g.closePath();g.fill();g.stroke();
   g.fillStyle=p.kind==='enemyArrow'?'#bd6c50':p.o?.poison?'#96ba5b':'#e8ddbf';for(const n of [-1,1]){g.beginPath();g.moveTo(-9,0);g.lineTo(-12,n*2.5);g.lineTo(-7,n*1.3);g.lineTo(-6,0);g.closePath();g.fill();g.stroke();}g.restore();
  }
 };
 window.Mobile83={version:89,scheduleResize,crewHeights};
})();
