/* Painted blue-roof architecture and complete tower-footprint clearance for the six Human districts. */
(function(){
 const frames=[[18,9,359,360],[456,9,150,368],[714,90,320,267],[1091,84,333,278],[29,412,317,272],[398,392,298,291],[744,387,303,332],[1097,366,317,339],[90,685,190,389],[368,690,354,375],[758,752,347,291],[1220,715,114,352]];
 const img=new Image();let loaded=false;const ready=new Promise((ok,no)=>{img.onload=()=>{loaded=true;ok();};img.onerror=no;});img.src=new URL('../assets/sprites/env-castle-painted52.webp',document.currentScript.src).href;ArtStylized.ready=Promise.all([ArtStylized.ready,ready]);
 function painted(g,n,d,h){if(!loaded)return false;if(['tower','keep','bhouse'].includes(d.k)&&d.y>0)h=Math.min(h,d.y-4);const f=frames[n],w=f[2]/f[3]*h;g.save();g.translate(d.x,d.y);if(d.flip<0)g.scale(-1,1);g.drawImage(img,...f,-w/2,-h,w,h);g.restore();return true;}
 const D=HumanKit.D;
 for(const [kind,n,height] of [['bhouse',7,80],['tower',8,95],['tree',0,94],['bush',2,33],['rock',4,35],['keep',9,150],['crates',10,30],['lamp',11,42]]){const old=D[kind];D[kind]=(g,d)=>{if(!painted(g,kind==='tree'&&d.v===1?1:n,d,height*(d.s||1)))old(g,d);};}
 const hall=D.hall;D.hall=(g,d)=>{if(!painted(g,7,d,(d.h||34)*1.6+(d.d||24)*.35))hall(g,d);};
 // All samples of a max-tier silhouette must be on dry ground and outside the lane.
 const masks=new Map();
 function mask(m){let hit=masks.get(m.index);if(hit)return hit;const c=document.createElement('canvas');c.width=Math.ceil(m.W/4);c.height=Math.ceil(m.H/4);const g=c.getContext('2d',{willReadFrequently:true});g.scale(.25,.25);g.lineJoin=g.lineCap='round';g.strokeStyle='#fff';g.lineWidth=CONFIG.pathWidth+16;for(const path of m.paths){g.beginPath();path.points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();}hit={data:g.getImageData(0,0,c.width,c.height).data,w:c.width};masks.set(m.index,hit);return hit;}
 function clear(m,x,y){if(x<40||x>m.W-40||y<108||y>m.H-25)return false;const hit=mask(m);for(const ox of [-32,0,32])for(const oy of [-60,-30,8]){if(HumanKit.wet(m.hand,x+ox,y+oy,3)||hit.data[(Math.floor((y+oy)/4)*hit.w+Math.floor((x+ox)/4))*4+3])return false;}if(m.index===5&&Math.abs(x-380)<118&&y<238)return false;return true;}
 const siteCache=new Map();
 function fitSites(m){if(siteCache.has(m.index))return siteCache.get(m.index).map(p=>({...p}));const original=m.spots,chosen=[];for(const s of original){const pool=[];for(let dy=-80;dy<=90;dy+=8)for(let dx=-80;dx<=80;dx+=8){const x=s.x+dx,y=s.y+dy;if(clear(m,x,y)&&chosen.every(q=>Math.hypot(q.x-x,(q.y-y)*1.25)>76))pool.push({x,y,score:Math.hypot(dx,dy)});}pool.sort((a,b)=>a.score-b.score);if(pool.length)chosen.push(pool[0]);}
  if(chosen.length<8){const pool=[];for(let y=110;y<m.H-25;y+=8)for(let x=44;x<m.W-44;x+=10)if(clear(m,x,y))pool.push({x,y});while(chosen.length<8){let best=null,score=-1;for(const p of pool){if(chosen.some(q=>Math.hypot(q.x-p.x,(q.y-p.y)*1.25)<77))continue;const near=Math.min(...m.paths.map(q=>q.nearest(p.x,p.y).perp));if(near>125)continue;const spread=chosen.length?Math.min(...chosen.map(q=>Math.hypot(q.x-p.x,q.y-p.y))):100;const rank=spread-near*.6;if(rank>score){score=rank;best=p;}}if(!best)break;chosen.push(best);}}
  const result=chosen.slice(0,10).map(({x,y},id)=>({x,y,id}));siteCache.set(m.index,result);return result.map(p=>({...p}));
 }
 const build=Level.build;Level.build=function(i){const m=build.call(this,i);if(!m.hand)return m;m.spots=fitSites(m);m.def.spots=m.spots.length;
  // Relocation is small and deliberate; remove scenery only where a full building would actually cover it.
  m.decor=m.decor.filter(d=>d.free||!m.spots.some(s=>Math.abs(s.x-d.x)<43&&d.y>s.y-70&&d.y<s.y+35));return m;
 };
 const result=UI.showResult;UI.showResult=function(r){const out=result.apply(this,arguments),i=Game.levelIndex;if(i<6)setTimeout(()=>{const panel=document.querySelector('#overlay-panel');if(!panel)return;for(const p of panel.querySelectorAll('p')){if(r.win&&i===5&&p.textContent.startsWith('Đã mở vùng mới:'))p.textContent='Đã mở vùng mới: Rừng Cổ Elf!';if(!r.win&&p.textContent.startsWith('Mẹo:'))p.textContent='Mẹo: phối hợp trụ, đổi điểm tập kết lính và điều khiển tướng để giữ các khúc cua.';}},0);return out;};
 window.HumanArt74={ready,painted,clear,fitSites};
})();
