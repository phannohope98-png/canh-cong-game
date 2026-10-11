/* Authored bow, drum, powder keg and six wing poses. */
(function(){
 'use strict';const root=new URL('../assets/sprites/',document.currentScript.src),ready=[];
 CONFIG.enemies.ashHarpy={...CONFIG.enemies.imp,name:'Hắc Điểu Tro',desc:'Quái bay vượt lính chặn; cung và phép có thể bắn hạ.',hp:190,speed:52,reward:12,radius:11,drawHeight:32,flying:true,armor:.08,mres:.15,art:'ashHarpy'};
 for(const [key,d] of Object.entries(ACTORS83)){
  const img=new Image(),e={id:key+'83',img,loaded:false,cols:6,rows:3,registration:d.registration};
  e.ready=new Promise(resolve=>{img.onload=()=>{e.loaded=true;Painter.clear();window.PaintedMotion?.clear();resolve(e);};img.onerror=()=>{console.error('Enemy atlas missing',key);resolve(e);};});ready.push(e.ready);img.src=new URL(d.file+'?v=83.2',root).href;ArtStylized.atlases.set(key,e);ArtStylized.atlases.delete(key+'-walk');
  const base=ArtChars[key]||ArtChars.imp||ArtChars.orc;
  ArtChars[key]={...base,tall:48,dr:12,box:[192,120,100,100],chibi:true,__3d:false,draw(g,P){if(key==='ashHarpy')return ArtStylized.draw(g,key,{...P,a:-1,w:((P.t||0)*.8)%1},48);return ArtStylized.draw(g,key,P,48);}};
  for(const suffix of ['_b','_f','_s',...Array.from({length:8},(_,i)=>'_a'+i)])ArtChars[key+suffix]=ArtChars[key];
  const def=CONFIG.enemies[key];if(def){def.art=key;delete def.artFrom;}
 }
 CONFIG.levels.forEach((L,i)=>{if(i>=12&&i%6>=2)L.waves=L.waves.map((v,n)=>n===2||n===4?v+', ashHarpy:'+Math.min(3,1+Math.floor(i/12)):v);});
 const draw=ArtStylized.draw;
 ArtStylized.draw=function(g,id,P,h){if(id==='ashHarpy'&&P.d===undefined)P={...P,a:-1,w:(((P.t||0)+(P.w>=0?P.w:0))*.8)%1};return draw.call(this,g,id,P,h);};
 window.Actors83={ready:Promise.all(ready),version:83};
 // Environment motion is composited at 24 fps; fighters and projectiles keep the main frame rate.
 const water=WaterFx.draw;let scene=null;
 WaterFx.draw=function(g,t){if(!Game.mobile63)return water.apply(this,arguments);const m=Game.map;if(!m)return;const res=1.5;
  if(!scene||scene.map!==m||scene.bg!==Game.bg){const c=document.createElement('canvas');c.width=Math.ceil(m.W*res);c.height=Math.ceil(m.H*res);scene={map:m,bg:Game.bg,c,last:-1};}
  if(t<scene.last||t-scene.last>=1/24||scene.last<0){const q=scene.c.getContext('2d');q.clearRect(0,0,scene.c.width,scene.c.height);q.save();q.scale(res,res);water.call(this,q,t);q.restore();scene.last=t;}
  g.drawImage(scene.c,0,0,m.W,m.H);
 };
})();
