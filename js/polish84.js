/* Compact-map scale contract; final boss owns the central breach. */
(function(){
 'use strict';
 [52,46,50,35,44,39].forEach((r,i)=>Alive81.RING[30+i]=r);
 for(const [id,h] of Object.entries(CONFIG.heroes))h.drawHeight=(h.race==='dwarf'||id==='borin'||id==='haldren')?29:32;
 for(const d of Object.values(CONFIG.enemies)){const h=d.drawHeight||32;d.drawHeight=d.boss?Math.min(56,h*.86):h>40?Math.min(44,h*.84):Math.min(34,h);}
 CONFIG.enemies.imp.drawHeight=26;CONFIG.enemies.drake.drawHeight=34;CONFIG.enemies.wraith.drawHeight=28;if(CONFIG.enemies.crystalWraith)CONFIG.enemies.crystalWraith.drawHeight=28;
 const spawn=Enemies.spawn;Enemies.spawn=function(type,pathIndex,hpMul){if(Game.levelIndex===35&&type==='voidLord')pathIndex=2;return spawn.call(this,type,pathIndex,hpMul);};
 const last=CONFIG.levels[35];last.waves=last.waves.map((wave,i)=>{let q=wave.replace(/(?:^|,)\s*voidLord\s*:\s*\d+/g,'').replace(/^,|,$/g,'');return i===last.waves.length-1?q+', voidLord:1':q;});
 window.Polish84={version:84,sizes:{hero:32,dwarfHero:29,soldier:28,summoned:26},finalBoss:'voidLord',bossLane:2};
 // A few separate authored props sit outside combat lanes; the painted map carries the main scenery.
 const decor=[[[150,160,'embers',15],[1220,805,'fallen-warrior',18]],[[140,825,'elf-flag',26],[1510,660,'embers',15]],[[870,440,'fallen-warrior',16]],[[315,650,'broken-pillar',23]],[[875,475,'broken-cannon',24]],[[1420,805,'fallen-warrior',16],[300,820,'witch-flag',26]]],images=new Map(),root=new URL('../assets/sprites/',document.currentScript.src);
 const water=WaterFx.draw;WaterFx.draw=function(g,t){const v=water.apply(this,arguments),m=Game.map;if(!m?.alliance84)return v;for(const [x,y,key,h]of decor[Game.levelIndex-30]||[]){const d=FRONT84[key];let q=images.get(key);if(!q){q=new Image();q.src=new URL(d.file,root).href;images.set(key,q);}if(q.complete&&q.naturalWidth){const z=h/d.size[1];g.drawImage(q,x*m.sc-d.anchor[0]*z,y*m.sc-d.anchor[1]*z,d.size[0]*z,d.size[1]*z);}}return v;};
 Polish84.decor=decor;
})();
