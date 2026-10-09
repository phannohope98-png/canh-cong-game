/* Bound pixel work on phones; simulation, targeting and combat remain at full rate. */
(function(){
 const measure=Game.measure,frame=Game.frame,water=WaterFx.draw,setup=WaterFx.setup,glows=new Map();
 const phone=()=>matchMedia('(pointer:coarse)').matches||Game.viewW<=1000;
 Game.measure=function(){measure.call(this);this.mobile63=phone();const cap=this.mobile63?1.5:2.25,d=Math.min(cap,this.dpr,Math.sqrt(1800000/(this.viewW*this.viewH)));if(d!==this.dpr){this.dpr=d;this.canvas.width=Math.round(this.viewW*d);this.canvas.height=Math.round(this.viewH*d);}this.ctx.imageSmoothingEnabled=true;};
 Game.renderBg=function(){const res=Math.min(this.mobile63?1.25:1.8,Math.max(.8,Camera.zoom*this.dpr));this.bg=Level.renderBackground(this.map,res);};
 Game.frame=function(ts){const a=performance.now();frame.call(this,ts);this.workMs63=performance.now()-a;};
 Game.perfWatch=function(){if(this.paused||this.state!=='playing'||this.time<3||!(this.workMs63>=0))return;const p=this.perf63||(this.perf63={sum:0,n:0,good:0});p.sum+=this.workMs63;if(++p.n<120)return;const avg=p.sum/p.n;p.sum=0;p.n=0;
  if(avg>21&&this.q>.6){this.q=Math.max(.6,this.q-.1);p.good=0;this.measure();this.renderBg();}
  else if(avg<10&&this.q<1&&++p.good>=3){this.q=Math.min(1,this.q+.1);p.good=0;this.measure();this.renderBg();}else if(avg>=10)p.good=0;
 };
 WaterFx.setup=function(m){setup.call(this,m);this.last63=-Infinity;};
 WaterFx.draw=function(g,t){if(!this.items)return;if(Game.mobile63&&t-this.last63<1/30){g.save();g.globalCompositeOperation='lighter';g.drawImage(this.buffer,0,0);g.restore();return;}this.last63=t;water.call(this,g,t);};
 Game.drawAtmosphere=function(g,t){const m=this.map,theme=m.def.theme,color={forest:'#ffeda2',castle:'#f8eac0',desert:'#eacb9b',ice:'#effaff',lava:'#ff9a59',chaos:'#caabfa'}[theme];if(!glows.has(theme)){const c=document.createElement('canvas');c.width=c.height=24;const p=c.getContext('2d'),q=p.createRadialGradient(12,12,0,12,12,12);q.addColorStop(0,color+'bb');q.addColorStop(.35,color+'44');q.addColorStop(1,color+'00');p.fillStyle=q;p.fillRect(0,0,24,24);glows.set(theme,c);}g.save();
  const n=this.mobile63?(this.q<.8?8:14):24,speed=theme==='ice'?12:theme==='lava'?-17:theme==='desert'?3:-3;
  for(let i=0;i<n;i++){const x=(i*377.7+Math.sin(t*.35+i)*17+3000+(theme==='desert'?t*7:0))%m.W,y=((i*211.3+t*speed)%m.H+m.H)%m.H;g.globalAlpha=.18+.15*Math.sin(t*1.7+i);g.drawImage(glows.get(theme),x-5,y-5,10,10);}
  // Three slow butterflies/embers live at the scene edge, outside combat lanes.
  for(let i=0;i<3;i++){const x=110+(m.index*73+i*251)%760+Math.sin(t*.4+i)*9,y=42+i*7+Math.cos(t*.6+i)*5;g.globalAlpha=.55;g.fillStyle=color;g.beginPath();g.ellipse(x-2,y,2,1.5*Math.abs(Math.sin(t*5+i))+.4,.3,0,7);g.ellipse(x+2,y,2,1.5*Math.abs(Math.sin(t*5+i))+.4,-.3,0,7);g.fill();}g.restore();
 };
 window.Mobile63={phone,glows,version:63};
})();
