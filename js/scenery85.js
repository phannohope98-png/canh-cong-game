/* Authored terrain props use known ground anchors; motion never moves the gameplay road. */
(function(){
 const root=new URL('../assets/sprites/',document.currentScript.src),cache=new Map();
 const fronts=[[[263,807,'supplies',16],[1210,835,'lantern',25]],[[215,845,'pennant',29],[1495,645,'brazier',16]],[[160,430,'supplies',17],[1480,355,'lantern',26]],[[304,640,'orcflag',29],[1440,852,'brazier',17]],[[877,470,'lantern',25],[1115,867,'supplies',18]],[[1420,806,'lantern',23],[300,820,'pennant',26]]];
 function load(key){if(cache.has(key))return cache.get(key);const img=new Image();img.src=new URL(SCENERY85[key].file,root).href;cache.set(key,img);return img;}
 function anchors(m){if(m.alliance84)return fronts[Game.levelIndex-30].map(([x,y,key,h])=>({x:x*m.sc,y:y*m.sc,key,h}));
  const list=m.civilians84||Civil84.place(m),out=[];for(const a of list.slice(0,2)){const key=a.kind==='farmer'?'harvest':a.kind==='dwarf'?a.action===1?'orecart':'brazier':a.kind==='witch'?a.action===2?'alchemy':'crystal':a.kind==='washer'?'basin':'chime';const x=a.x+17,y=a.y+2;if(x>m.W-15||m.paths.some(p=>p.nearest(x,y).perp<CONFIG.pathWidth*.6)||m.spots.some(p=>Math.hypot(x-p.x,y-p.y)<30))continue;out.push({x,y,key,h:key==='chime'?23:16});}return out;}
 const draw=WaterFx.draw;WaterFx.draw=function(g,t){const result=draw.apply(this,arguments),m=Game.map;if(!m)return result;if(!m.scenery85)m.scenery85=anchors(m);
  for(const a of m.scenery85){const d=SCENERY85[a.key],im=load(a.key);if(!im.complete||!im.naturalWidth)continue;const z=a.h/d.size[1];g.save();g.translate(a.x,a.y);if(['pennant','chime','orcflag'].includes(a.key))g.rotate(Math.sin(t*1.7+a.x)*.013);g.drawImage(im,-d.anchor[0]*z,-d.anchor[1]*z,d.size[0]*z,d.size[1]*z);
   if(['brazier','lantern','crystal','alchemy'].includes(a.key)){const color=a.key==='crystal'||a.key==='alchemy'?'#c995e8':'#ffd19b';g.globalAlpha=.35+.12*Math.sin(t*3+a.x);g.strokeStyle=color;g.lineWidth=.8;for(let i=0;i<3;i++){const p=(t*.5+i/3)%1;g.beginPath();g.arc(Math.sin(i*2+a.x)*3,-a.h*.5-p*11,1-p*.6,0,7);g.stroke();}}
   g.restore();}
  return result;};
 window.Scenery85={anchors,fronts,cache};
})();
