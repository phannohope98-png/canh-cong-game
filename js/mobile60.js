/* Clear stage framing, compact controls and a single wave action. */
(function(){
 const resize=Camera.resize;
 Camera.resize=function(w,h){const relative=this.minZoom>0?this.zoom/this.minZoom:1;resize.call(this,w,h);this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.minZoom*relative));this.clamp();};
 const oldDecor=MapArt.decor;
 MapArt.decor=function(F,paths,spots,W,H,theme,seed){
  const out=oldDecor.call(this,F,paths,spots,W,H,theme,seed).filter(d=>d.prop||d.y<H-36),rnd=ArtKit.seeded(seed+601),mix={forest:['tree','pine','bush'],castle:['tree','bush','rock'],desert:['palm','rock','cactus'],ice:['snowpine','rock','icecrystal'],lava:['rock','deadtree','redcrystal'],chaos:['voidcrystal','rock','rune']}[theme];
  // Frame the board with complete clusters; leave combat corridors quiet.
  for(let j=0;j<55;j++){const x=48+rnd()*(W-96),y=j%2?H-20-rnd()*26:96+rnd()*15;if(MapArt.wetAt(F,x,y,24)||paths.some(p=>p.nearest(x,y).perp<65)||spots.some(s=>Math.hypot(x-s.x,y-s.y)<65)||out.some(d=>Math.hypot(x-d.x,y-d.y)<32))continue;out.push({k:mix[j%mix.length],x,y,s:.72+rnd()*.2,v:rnd(),flip:rnd()<.5?-1:1});}
  return out.sort((a,b)=>a.y-b.y);
 };
 const build=Level.build;
 Level.build=function(i){const m=build.call(this,i);m.spots=m.spots.filter(s=>s.y<=m.H-82);m.decor=MapArt.decor(m.feat,m.paths,m.spots,m.W,m.H,m.def.theme,i*31+7);return m;};
 UI.updateWaveButtons=function(){
  const box=this.hud.waves,can=Game.state==='playing'&&Waves.canCall,key=can?Waves.state:'off';
  if(box.dataset.k!==key){box.dataset.k=key;box.innerHTML=can?'<button class="wave-btn wave60" data-action="call-wave" aria-label="Gọi đợt quái tiếp theo"><svg class="ring" viewBox="0 0 76 76"><circle cx="38" cy="38" r="35"/></svg><span class="wave60-arrow">»</span><b></b></button>':'';}
  if(!can)return;const b=box.querySelector('button'),left=Waves.state==='waiting'?Waves.timer/CONFIG.match.nextWaveDelay:0;
  b.querySelector('circle').style.strokeDashoffset=220*(1-left);b.querySelector('b').textContent=Waves.state==='waiting'?'+'+Math.floor(Waves.timer*CONFIG.match.earlyCallBonusPerSec):'Gọi đợt';
 };
})();
