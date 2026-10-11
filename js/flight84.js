/* Airborne poses use a wing clock, never the ground gait or distance walked. */
(function(){
 'use strict';const root=new URL('../assets/sprites/',document.currentScript.src),pending=[],entries=new Map();
 const aliases={crystalWraith:'wraith'};
 const sheets={...FLIGHT84};if(!ArtStylized.atlases.has('ashHarpy')&&window.ACTORS83){sheets.ashHarpy=ACTORS83.ashHarpy;CONFIG.enemies.ashHarpy={...CONFIG.enemies.imp,name:'Hắc Điểu Tro',flying:true,art:'ashHarpy'};}
 for(const [key,d] of Object.entries(sheets)){
  const img=new Image(),e={id:key+'flight84',img,loaded:false,cols:6,rows:3,registration:d.registration};
  e.ready=new Promise((ok,no)=>{img.onload=()=>{e.loaded=true;if(window.Painter){Painter.clear();window.PaintedMotion?.clear();}ok(e);};img.onerror=()=>no(new Error('Không tải được sprite bay '+key));});pending.push(e.ready);img.src=new URL(d.file+'?v=84',root).href;entries.set(key,e);ArtStylized.atlases.set(key,e);ArtStylized.atlases.delete(key+'-walk');
 }
 for(const [key,base] of Object.entries(aliases))ArtStylized.atlases.set(key,entries.get(base));
 const air=new Set([...entries.keys(),'crystalWraith','ashHarpy']);
 // Some authored character definitions captured an older draw closure. Rebind all air variants.
 for(const key of air){const d=ArtChars[key]||ArtChars.imp;ArtChars[key]={...d,tall:48,chibi:true,__3d:false,draw:(g,P)=>ArtStylized.draw(g,key,P,48)};for(const suffix of ['_b','_f','_s',...Array.from({length:8},(_,i)=>'_a'+i)])ArtChars[key+suffix]=ArtChars[key];if(CONFIG.enemies[key]){CONFIG.enemies[key].art=key;delete CONFIG.enemies[key].artFrom;}}
 function frame(key,P,t=window.Game?.time??P.t??0){const base=aliases[key]||key,d=FLIGHT84[base],fps=d?.fps||7,seed=(P._actor?.uid||0)*.173;const phase=((t*fps+seed)%6+6)%6;return P.a>=0?12+Math.min(5,Math.floor(P.a*6)):6+Math.floor(phase);}
 const draw=ArtStylized.draw;
 ArtStylized.draw=function(g,key,P,H=48){const id=this.identify(key);if(!air.has(id)||P.d!==undefined)return draw.apply(this,arguments);const e=entries.get(aliases[id]||id)||this.atlases.get(id);if(!e?.loaded)return false;g.save();ArtStylized.blit(g,e,frame(id,P),H);g.restore();return true;};
 window.Flight84={ready:Promise.all(pending),entries,frame,types:[...air],version:84};
})();
