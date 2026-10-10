/* Raised terrain, coherent border masses and region-specific painted surfaces. */
(function(){
 const colors={forest:['#426a52','#2a483d','#a1bc79','#c9cc99'],castle:['#657b50','#3d5138','#adc081','#d6c49a'],desert:['#af885f','#76533f','#d6ad78','#f0d39c'],ice:['#93b6c4','#55768d','#cde3e1','#f3f5e7'],lava:['#66545f','#392d3c','#937477','#d9aa82'],chaos:['#555575','#303148','#8985ac','#bfb0d1']};
 const oldTexture=PaintedWorld.texture,oldRender=MapArt.render,oldDecor=MapArt.decor,cache=new Map();let current=null;
 MapArt.render=function(m,res){current=m;try{return oldRender.call(this,m,res);}finally{current=null;}};
 PaintedWorld.texture=function(g,theme,n,size){if(n!==0||!current)return oldTexture.call(this,g,theme,n,size);const m=current;if(cache.has(m.index))return g.createPattern(cache.get(m.index),'no-repeat');const c=document.createElement('canvas');c.width=m.W;c.height=m.H;const p=c.getContext('2d'),C=colors[theme],rnd=ArtKit.seeded(m.def.scene65.seed);
  p.fillStyle=C[0];p.fillRect(0,0,m.W,m.H);const safe=(x,y,rx,ry)=>!MapArt.wetAt(m.feat,x,y,rx*.6)&&!m.spots.some(s=>Math.abs(x-s.x)<rx+45&&Math.abs(y-s.y)<ry+80)&&!m.paths.some(path=>{for(let d=0;d<path.length;d+=14){const q=path.pointAt(d,{});if(Math.abs(q.x-x)<rx+24&&Math.abs(q.y-y)<ry+27)return true;}return false;});
  // Choose the largest actual clearings: geographic masses belong between roads.
  const masses=[],sites=[];for(let y=85;y<m.H-35;y+=20)for(let x=70;x<m.W-65;x+=24){
   const gap=Math.min(...m.paths.map(path=>path.nearest(x,y).perp));
   for(let radius=Math.min(112,gap-30);radius>=28;radius-=10)if(safe(x,y,radius,radius*.36)){sites.push({x,y,rx:radius,ry:radius*.36,score:radius+Math.sin(x*.014+m.index)*4});break;}
  }sites.sort((a,b)=>b.score-a.score);for(const site of sites){if(masses.some(a=>Math.hypot(a.x-site.x,(a.y-site.y)*2)<a.rx+site.rx+12))continue;masses.push(site);if(masses.length===5)break;}
  for(const {x,y,rx,ry} of masses){const pts=[];for(let j=0;j<14;j++){const a=j*Math.PI/7,r=.88+rnd()*.2;pts.push([x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r]);}const shape=()=>{p.beginPath();const last=pts.at(-1),first=pts[0];p.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);pts.forEach((q,i)=>{const next=pts[(i+1)%pts.length];p.quadraticCurveTo(q[0],q[1],(q[0]+next[0])/2,(q[1]+next[1])/2);});p.closePath();};
   p.save();p.translate(0,10);shape();p.fillStyle=C[1];p.fill();p.restore();shape();const grad=p.createLinearGradient(x,y-ry,x,y+ry);grad.addColorStop(0,C[2]);grad.addColorStop(1,C[0]);p.fillStyle=grad;p.strokeStyle=C[1];p.lineWidth=2;p.fill();p.stroke();p.strokeStyle=ArtKit.alpha(C[3],.48);p.lineWidth=1.5;p.beginPath();pts.slice(7,13).forEach((q,i)=>i?p.lineTo(q[0],q[1]+1):p.moveTo(q[0],q[1]+1));p.stroke();for(let j=0;j<5;j++){const xx=x-rx*.7+j*rx*.33;p.strokeStyle=ArtKit.alpha(C[2],.45);p.lineWidth=1;p.beginPath();p.moveTo(xx,y+ry);p.lineTo(xx-3,y+ry+7);p.stroke();}}
  // Brush marks and moss tie raised ground to the surrounding soil.
  for(const {x,y,rx,ry} of masses){
   p.save();p.globalAlpha=.4;for(let j=0;j<24;j++){const a=rnd()*Math.PI*2,rad=Math.sqrt(rnd())*.8,xx=x+Math.cos(a)*rx*rad,yy=y+Math.sin(a)*ry*rad;p.fillStyle=j%3?C[2]:C[1];p.beginPath();p.ellipse(xx,yy,3+rnd()*7,1+rnd()*2,0,0,7);p.fill();}p.restore();
   for(let j=0;j<8;j++){const xx=x-rx*.75+j*rx*.21,yy=y+Math.sqrt(Math.max(0,1-((xx-x)/rx)**2))*ry;p.strokeStyle=ArtKit.alpha(C[1],.7);p.lineWidth=1;p.beginPath();p.moveTo(xx,yy+1);p.lineTo(xx-2,yy+6);p.lineTo(xx+1,yy+9);p.stroke();}
  }
  // Continuous rocky ledges frame the scene; leave openings at actual entrances.
  for(const bottom of [false,true])for(let x=-12;x<m.W;x+=32){const yy=bottom?m.H-14:29+Math.sin(x*.018+m.index)*8;const near=Math.min(...m.paths.map(path=>path.nearest(x+16,yy).perp));if(near<55||MapArt.wetAt(m.feat,x+16,yy,24))continue;const depth=bottom?18:22,rise=bottom?-10:-15;p.fillStyle=C[1];p.strokeStyle=ArtKit.shade(C[1],-.2);p.lineWidth=1;p.beginPath();p.moveTo(x,yy+rise);p.lineTo(x+15,yy+rise-3);p.lineTo(x+34,yy+rise+2);p.lineTo(x+34,yy+depth-3);p.lineTo(x+17,yy+depth+3);p.lineTo(x,yy+depth);p.closePath();p.fill();p.stroke();p.fillStyle=ArtKit.shade(C[0],.06);p.beginPath();p.moveTo(x,yy+rise);p.lineTo(x+15,yy+rise-3);p.lineTo(x+34,yy+rise+2);p.lineTo(x+32,yy);p.lineTo(x+14,yy-2);p.lineTo(x,yy+2);p.closePath();p.fill();p.strokeStyle=ArtKit.alpha(C[2],.5);p.lineWidth=1.3;p.beginPath();p.moveTo(x+2,yy+3);p.lineTo(x+12,yy+1);p.moveTo(x+20,yy+2);p.lineTo(x+22,yy+depth-2);p.stroke();}
  // Field texture stays quiet; accents form clusters rather than isolated confetti.
  for(let k=0;k<250;k++){const x=rnd()*m.W,y=rnd()*m.H;p.fillStyle=ArtKit.alpha(k%3?C[2]:C[1],.13);p.beginPath();p.ellipse(x,y,4+rnd()*12,1+rnd()*3,0,0,7);p.fill();}
  for(let k=0;k<45;k++){const x=30+rnd()*(m.W-60),y=30+rnd()*(m.H-60);if(!safe(x,y,10,5))continue;for(let j=0;j<4;j++){p.strokeStyle=C[1];p.lineWidth=1.4;p.beginPath();p.moveTo(x+j*3,y);p.lineTo(x+j*3-1,y-3-rnd()*4);p.stroke();}if(k%3===0){p.fillStyle=theme==='chaos'?'#ac8aca':theme==='lava'?'#b37965':'#d6d39b';for(let j=0;j<3;j++){p.beginPath();p.arc(x+j*3,y-4,1.3,0,7);p.fill();}}}
  // Darkened outer corners frame the fighting field without tinting its actors.
  const edge=p.createRadialGradient(m.W*.5,m.H*.5,m.H*.3,m.W*.5,m.H*.5,m.W*.58);edge.addColorStop(0,C[1]+'00');edge.addColorStop(1,C[1]+'70');p.fillStyle=edge;p.fillRect(0,0,m.W,m.H);cache.set(m.index,c);if(cache.size>4)cache.delete(cache.keys().next().value);return g.createPattern(c,'no-repeat');
 };
 MapArt.decor=function(F,paths,spots,W,H,theme,seed){const out=oldDecor.call(this,F,paths,spots,W,H,theme,seed),rnd=ArtKit.seeded(seed+6501),centers=[[80,112],[W-85,115],[85,H-40],[W-90,H-45],[W*.35,115],[W*.65,115],[W*.35,H-35],[W*.65,H-35]],mix={forest:['tree','pine','bush','rock'],castle:['tree','bush','ruin','rock'],desert:['rock','palm','cactus','drybush'],ice:['snowpine','rock','icecrystal'],lava:['rock','deadtree','bones','redcrystal'],chaos:['rock','voidcrystal','rune','deadtree']}[theme];
  // Replace scattered interior trees with complete groups outside the action.
  const filtered=out.filter(d=>d.prop||!['tree','pine','palm','snowpine'].includes(d.k)||d.y<140||d.y>H-90);
  for(let k=0;k<140;k++){const q=centers[k%centers.length],x=q[0]+(rnd()-.5)*120,y=q[1]+(rnd()-.5)*40;if(x<38||x>W-38||y<100||y>H-20||paths.some(p=>p.nearest(x,y).perp<68)||spots.some(s=>Math.abs(x-s.x)<58&&Math.abs(y-s.y)<90)||MapArt.wetAt(F,x,y,22)||filtered.some(d=>Math.hypot(d.x-x,d.y-y)<25))continue;filtered.push({k:mix[k%mix.length],x,y,s:.7+rnd()*.18,v:rnd(),flip:rnd()<.5?-1:1});}
  return filtered.sort((a,b)=>a.y-b.y);
 };
 for(const [theme,C] of Object.entries(colors)){MapArt.TH[theme].roadD=ArtKit.shade(C[0],.22);MapArt.TH[theme].road=['lava','chaos'].includes(theme)?'#aaa0ad':theme==='forest'?'#c0b289':theme==='desert'?'#e0c599':theme==='ice'?'#e6ece0':'#c6b68e';MapArt.TH[theme].roadL='#e6d8b9';}
 window.World65={cache,version:65};
})();
