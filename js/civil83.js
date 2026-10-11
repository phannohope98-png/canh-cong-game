/* Occupation sprites: actual tool/arm poses, four-frame loops, four residents per scene. */
(function(){
 'use strict';const cache=new Map(),base=new URL('../assets/sprites/',document.currentScript.src);
 const positions={
  elf:[[[320,270],[1450,260],[1240,570],[660,635]],[[620,218],[1410,248],[445,408],[1015,717]],[[150,240],[1500,690],[245,775],[1235,575]],[[340,250],[1240,170],[350,650],[1180,700]],[[650,150],[1290,270],[260,220],[1420,570]],[[190,270],[1100,210],[410,740],[1310,660]]],
  dwarf:[[[1420,580],[470,225],[1170,620],[230,590]],[[1460,440],[290,570],[1320,480],[1430,385]],[[1550,290],[180,300],[1330,235],[650,690]],[[1450,350],[270,360],[1410,570],[1470,570]],[[1180,180],[250,270],[400,650],[1390,470]],[[430,130],[1200,190],[420,655],[1450,740]]],
  witch:[[[420,140],[1300,280],[570,590],[1450,660]],[[260,240],[1270,345],[460,660],[1510,540]],[[440,170],[1440,250],[525,790],[1210,590]],[[210,110],[990,320],[1450,240],[590,650]],[[1520,390],[380,180],[1450,700],[720,650]],[[480,120],[1250,130],[450,760],[1450,740]]]
 };
 function sheet(kind){if(cache.has(kind))return cache.get(kind);const img=new Image(),s={img,ready:false};img.onload=()=>s.ready=true;img.onerror=()=>console.warn('civil83 missing',kind);img.src=new URL(CIVIL83[kind].file,base).href;cache.set(kind,s);return s;}
 function blit(g,kind,action,t,x,y,h,flip){const s=sheet(kind);if(!s.ready)return;const a=CIVIL83[kind].actions[action],f=a.frames[Math.floor(t*a.fps)%4],z=h/a.height;g.save();g.translate(x,y);if(flip)g.scale(-1,1);g.drawImage(s.img,f.x,f.y,f.w,f.h,-(f.pivot||a.pivot)*z,-a.baseline*z,f.w*z,f.h*z);g.restore();}
 const draw=WaterFx.draw;
 WaterFx.draw=function(g,t){const r=draw.apply(this,arguments),m=Game.map;if(!m||window.Civil84)return r;const kind=m.elf78?'elf':m.dwarf80?'dwarf':m.witch79?'witch':null;if(!kind)return r;
  if(!m.civilians83){const points=positions[kind][Game.levelIndex%6],sc=m.sc||m.W/1672;m.civilians83=points.map((p,i)=>({kind,action:i,x:p[0]*sc,y:p[1]*sc,phase:i*.93,height:kind==='dwarf'?21:i===2?29:24,flip:i%2===1})).filter(a=>m.paths.every(p=>p.nearest(a.x,a.y).perp>14)&&m.spots.every(s=>Math.hypot(s.x-a.x,s.y-a.y)>27&&!(Math.abs(s.x-a.x)<32&&a.y>s.y-75&&a.y<s.y+20)));}
  for(const a of m.civilians83)blit(g,a.kind,a.action,t+a.phase,a.x,a.y,a.height,a.flip);return r;
 };
 window.Civil83={positions,sheet,blit,cache,version:83};
})();
