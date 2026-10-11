/* Explicit native-pixel anchors: residents work on a shore, porch, forge or floor. */
(function(){
 'use strict';const root=new URL('../assets/sprites/',document.currentScript.src),cache=new Map();
 const A=(kind,action,x,y,surface,height=24,flip=false)=>({kind,action,x,y,surface,height,flip});
 const stages={
 0:[A('farmer',0,845,210,'wheat field',23),A('farmer',0,1110,295,'wheat field',23)],
 1:[A('farmer',0,235,420,'wheat field',23),A('farmer',0,1110,325,'wheat field',23)],
 2:[A('farmer',0,370,870,'wheat field',23),A('farmer',0,250,260,'wheat field',23)],
 6:[A('elf',0,289,264,'hut porch'),A('elf',1,1335,239,'lookout deck'),A('washer',0,970,615,'left stream bank',25),A('elf',3,1140,595,'right stream bank',24,true)],
 7:[A('elf',0,1390,250,'tree gate porch'),A('elf',1,1540,160,'upper tree stair'),A('washer',0,1075,770,'right pool bank',25),A('elf',3,650,685,'left pool bank')],
 8:[A('elf',0,265,625,'treehouse side porch'),A('elf',1,1140,150,'upper house porch')],
 9:[A('elf',0,535,195,'treehouse porch'),A('elf',1,1260,140,'upper house porch')],
 10:[A('elf',0,675,190,'treehouse porch'),A('elf',1,215,270,'tree side porch'),A('washer',0,1090,466,'raised pool terrace',25)],
 11:[A('elf',0,170,142,'treehouse porch'),A('elf',1,420,825,'treehouse lower porch')],
 12:[A('witch',0,455,185,'portal stone terrace'),A('witch',2,415,835,'lower island work terrace',27),A('witch',3,1510,645,'right island meadow')],
 13:[A('witch',0,385,195,'hut doorstep'),A('witch',1,1180,285,'small hut island',27),A('witch',2,1540,790,'lower hut doorstep',27)],
 14:[A('witch',0,480,478,'ritual circle'),A('witch',1,1500,228,'castle side garden',27),A('witch',2,280,885,'lower hut doorstep',27)],
 15:[A('witch',0,275,130,'upper hut terrace'),A('witch',2,1470,80,'upper castle terrace',27)],
 16:[A('witch',0,1210,285,'castle garden terrace'),A('witch',1,275,110,'upper garden terrace',27),A('witch',2,1450,675,'pool-side work terrace',27)],
 17:[A('witch',0,480,120,'hall floor'),A('witch',1,1250,130,'hall floor',27),A('witch',2,450,760,'hall workshop',27),A('witch',3,1450,740,'hall floor')],
 18:[A('dwarf',0,1460,665,'harbor forge apron',23),A('dwarf',1,146,655,'mine entrance rock',23)],
 19:[A('dwarf',2,850,245,'mill loading platform',24),A('dwarf',3,765,208,'mill workshop platform',24)],
 20:[A('dwarf',1,1540,610,'mine entrance',23),A('dwarf',0,790,385,'workshop terrace',23)],
 21:[A('dwarf',2,1440,440,'forge loading apron',24),A('dwarf',3,170,240,'workshop terrace',24)],
 22:[A('dwarf',1,365,190,'mine entrance',23),A('dwarf',0,1510,365,'forge courtyard',23)],
 23:[A('dwarf',0,430,130,'hall forge',23),A('dwarf',1,1200,190,'hall ore pile',23),A('dwarf',2,420,655,'hall floor',24),A('dwarf',3,1450,740,'hall workbench',24)]
 };
 function sheet(key){if(cache.has(key))return cache.get(key);const img=new Image(),q={img,loaded:false};q.ready=new Promise((ok,no)=>{img.onload=()=>{q.loaded=true;ok(q);};img.onerror=()=>no(new Error('Missing civilian '+key));});img.src=new URL(CIVIL84[key].file,root).href;cache.set(key,q);return q;}
 function blit(g,a,t){if(!CIVIL84[a.kind])return Civil83.blit(g,a.kind,a.action,t,a.x,a.y,a.height,a.flip);const q=sheet(a.kind);if(!q.loaded)return;const d=CIVIL84[a.kind],f=d.frames[Math.floor(t*d.fps)%6],s=a.height/d.height;g.save();g.translate(a.x,a.y);if(a.flip)g.scale(-1,1);g.drawImage(q.img,f.x,f.y,f.w,f.h,-f.pivot*s,-d.baseline*s,f.w*s,f.h*s);g.restore();}
 function place(m){const sc=m.sc||m.W/1672;return (stages[Game.levelIndex]||[]).map((a,i)=>({...a,native:[a.x,a.y],x:a.x*sc,y:a.y*sc,phase:i*.81}));}
 const draw=WaterFx.draw;WaterFx.draw=function(g,t){const out=draw.apply(this,arguments),m=Game.map;if(!m)return out;if(!m.civilians84)m.civilians84=place(m);for(const a of m.civilians84)blit(g,a,t+a.phase);return out;};
 window.Civil84={stages,place,blit,sheet,cache,version:84};
})();
