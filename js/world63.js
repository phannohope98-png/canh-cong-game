/* Painted terrain and small faction landmarks are baked once into the board. */
(function(){
 const patterns=new Map(),oldRender=MapArt.render,oldTexture=PaintedWorld.texture,oldBuild=Level.build,oldProp=PaintedWorld.prop;
 let active=null;
 const palettes={forest:['#8fab57','#42683b','#d1cf8b'],castle:['#abb77b','#68794d','#e3ce9d'],desert:['#ddb882','#a27a54','#f0d5a5'],ice:['#ecf4ed','#9ab7c1','#fff9e8'],lava:['#7d6766','#443a45','#c09071'],chaos:['#9683ad','#53476f','#d1b9df']};
 MapArt.render=function(m,res){active=m;try{return oldRender.call(this,m,res);}finally{active=null;}};
 PaintedWorld.texture=function(g,theme,n,size){if(n!==0||!active)return oldTexture.call(this,g,theme,n,size);const m=active,key=m.index;if(patterns.has(key))return g.createPattern(patterns.get(key),'no-repeat');
  const c=document.createElement('canvas');c.width=m.W;c.height=m.H;const p=c.getContext('2d'),C=palettes[theme],rnd=ArtKit.seeded(m.index*8713+631),base=oldTexture.call(this,p,theme,n,size);p.fillStyle=base;p.fillRect(0,0,m.W,m.H);
  const near=(x,y)=>Math.min(...m.paths.map(q=>q.nearest(x,y).perp));
  const free=(x,y,r=24)=>x>r&&x<m.W-r&&y>r&&y<m.H-r&&near(x,y)>r+CONFIG.pathWidth/2&&!MapArt.wetAt(m.feat,x,y,r)&&!m.spots.some(s=>Math.abs(x-s.x)<52+r&&y>s.y-80-r&&y<s.y+15+r);
  // Shallow terraces give the open ground volume without hiding the route.
  for(let i=0;i<32;i++){const x=40+rnd()*(m.W-80),y=45+rnd()*(m.H-90),rx=28+rnd()*40,ry=8+rnd()*12;if(!free(x,y,rx))continue;p.fillStyle=ArtKit.alpha(C[1],.22);p.beginPath();p.ellipse(x,y+5,rx,ry,0,0,7);p.fill();const gr=p.createLinearGradient(x,y-ry,x,y+ry);gr.addColorStop(0,C[0]);gr.addColorStop(1,PaintedWorld.colors[theme][0]);p.fillStyle=gr;p.beginPath();p.ellipse(x,y,rx,ry,0,0,7);p.fill();p.strokeStyle=ArtKit.alpha(C[2],.35);p.lineWidth=1.4;p.beginPath();p.ellipse(x,y,rx*.85,ry*.8,0,3.4,5.9);p.stroke();}
  // Irregular clusters of brush marks replace the empty, uniform lawn.
  for(let i=0;i<220;i++){const x=25+rnd()*(m.W-50),y=25+rnd()*(m.H-50);if(!free(x,y,8))continue;p.strokeStyle=ArtKit.alpha(C[1],.5);p.lineWidth=1.1;p.lineCap='round';const h=2+rnd()*4;p.beginPath();p.moveTo(x-3,y);p.quadraticCurveTo(x-2,y-h,x-4,y-h);p.moveTo(x,y);p.lineTo(x,y-h-1);p.moveTo(x+2,y);p.quadraticCurveTo(x+2,y-h,x+5,y-h);p.stroke();if(i%9===0&&['forest','castle','ice'].includes(theme)){p.fillStyle=i%2?'#f5d890':'#d8cee6';for(let j=0;j<3;j++){p.beginPath();p.arc(x+j*3,y-h-j%2,1.4,0,7);p.fill();}}}
  for(const path of m.paths)for(let d=35;d<path.length-40;d+=24){const q=path.pointAt(d,{});for(const side of [-1,1]){const off=CONFIG.pathWidth/2+4+rnd()*7,x=q.x+q.nx*off*side,y=q.y+q.ny*off*side;if(x<8||x>m.W-8||y<8||y>m.H-8||near(x,y)<CONFIG.pathWidth/2+2||MapArt.wetAt(m.feat,x,y,8))continue;p.fillStyle=ArtKit.alpha(C[1],.32);p.beginPath();p.ellipse(x,y,5+rnd()*5,2,0,0,7);p.fill();p.strokeStyle=ArtKit.alpha(C[0],.8);p.lineWidth=1.5;p.beginPath();p.moveTo(x-3,y);p.lineTo(x-4,y-3);p.moveTo(x,y);p.lineTo(x+2,y-4);p.stroke();}}
  patterns.set(key,c);if(patterns.size>4)patterns.delete(patterns.keys().next().value);return g.createPattern(c,'no-repeat');
 };
 Level.build=function(i){const m=oldBuild.call(this,i),candidates=[];
  for(let y=70;y<m.H-55;y+=18)for(let x=90;x<m.W-90;x+=26){const d=Math.min(...m.paths.map(p=>p.nearest(x,y).perp));if(d<52||m.paths.some(p=>p.points.some(q=>q.x>x-70&&q.x<x+78&&q.y>y-80&&q.y<y+32))||MapArt.wetAt(m.feat,x,y,40)||m.spots.some(s=>Math.abs(x-s.x)<80&&Math.abs(y-s.y)<100)||m.decor.some(p=>p.prop&&Math.hypot(p.x-x,p.y-y)<90))continue;candidates.push({x,y,score:d+Math.sin(x*.017+i)*18});}
  candidates.sort((a,b)=>b.score-a.score);if(candidates.length){const v=candidates[(i*7)%Math.min(8,candidates.length)];m.decor=m.decor.filter(d=>d.prop||Math.hypot(d.x-v.x,d.y-v.y)>65);m.decor.push({k:'landmark63',x:v.x,y:v.y,s:1,region:Math.floor(i/6),stage:i%6,prop:true});m.decor.sort((a,b)=>a.y-b.y);m.landmark63={x:v.x,y:v.y,region:Math.floor(i/6),stage:i%6};}
  return m;
 };
 PaintedWorld.prop=function(g,d,theme){if(d.k!=='landmark63')return oldProp.call(this,g,d,theme);const C=palettes[theme],race=['#5c9dcd','#90b66a','#a791dc','#d5a875','#b76c54','#9ebbc4'][d.region],ink='#4c453c';g.save();g.translate(d.x,d.y);g.lineJoin='round';g.lineCap='round';
  const poly=(pts,col)=>{g.fillStyle=col;g.strokeStyle=ink;g.lineWidth=1.7;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();g.stroke();};
  const stone=(x,y,w,h)=>{const q=g.createLinearGradient(x,y-h,x,y);q.addColorStop(0,C[2]);q.addColorStop(1,C[1]);poly([[x-w/2,y],[x-w*.45,y-h],[x+w*.35,y-h-2],[x+w/2,y-2]],q);};
  g.fillStyle=ArtKit.alpha(C[1],.28);g.beginPath();g.ellipse(0,0,42,11,0,0,7);g.fill();
  if(d.region===0||d.region===4){poly([[-29,-3],[-6,-45],[22,-4]],race);poly([[-6,-45],[30,-11],[22,-4]],ArtKit.shade(race,-.24));poly([[-12,-3],[-6,-28],[4,-4]],'#43372d');g.strokeStyle='#d6b482';g.lineWidth=2;g.beginPath();g.moveTo(-29,-3);g.lineTo(-37,3);g.moveTo(22,-4);g.lineTo(36,2);g.stroke();for(let i=0;i<3;i++)stone(32+i*4,-3-i*4,10,8);}
  else if(d.region===1){for(const x of [-22,22]){stone(x,0,15,33);stone(x,-30,19,8);}poly([[-30,-36],[-21,-45],[22,-43],[31,-35],[25,-29],[-26,-29]],C[2]);g.strokeStyle='#5d804b';g.lineWidth=3;g.beginPath();g.moveTo(-22,0);g.bezierCurveTo(-12,-14,-33,-22,-17,-36);g.stroke();for(let i=0;i<6;i++){g.fillStyle=race;g.beginPath();g.ellipse(-22+Math.sin(i)*6,-i*6,5,2,i,0,7);g.fill();}}
  else if(d.region===2||d.region===5){for(let i=0;i<5;i++){const a=i*1.256;stone(Math.cos(a)*28,Math.sin(a)*8,12,10+i%2*7);}g.strokeStyle=race;g.lineWidth=2;g.beginPath();g.ellipse(0,-1,22,7,0,0,7);g.stroke();poly([[0,-53],[12,-28],[0,-7],[-10,-29]],race);poly([[0,-53],[0,-7],[-10,-29]],ArtKit.shade(race,-.25));g.strokeStyle='#eee9ce';g.lineWidth=1.3;g.beginPath();g.moveTo(0,-47);g.lineTo(6,-29);g.lineTo(0,-14);g.stroke();}
  else{for(let i=0;i<4;i++)stone(-22+i*13,-i%2*4,20,18+i%2*8);poly([[-24,-22],[-24,-43],[-18,-43],[-18,-22]],'#926c46');poly([[20,-16],[20,-40],[26,-40],[26,-16]],'#926c46');g.strokeStyle='#d7b77d';g.lineWidth=3;g.beginPath();g.moveTo(-21,-40);g.lineTo(23,-37);g.stroke();poly([[-10,-39],[-10,-32],[8,-29],[10,-37]],race);}
  // A small chapter pennant makes all six landmarks distinguishable.
  g.strokeStyle=ink;g.lineWidth=2;g.beginPath();g.moveTo(36,-2);g.lineTo(36,-33);g.stroke();poly([[37,-32],[53,-29],[48,-19],[37,-22]],race);g.strokeStyle='#f4dda1';g.lineWidth=1;for(let i=0;i<=d.stage;i++){g.beginPath();g.moveTo(40+i*1.7,-28);g.lineTo(40+i*1.7,-24);g.stroke();}g.restore();return true;
 };
 window.World63={patterns,version:63};
})();
