/* Painted pixels remain the artwork. Continuous limb rig / silhouette tween supplies motion. */
(function(){
  const TAU=Math.PI*2,frames=new Map(),tweens=new Map(),rigs=new Map(),CW=240,CH=120,BASE=80,BAND=2,STEPS=4;
  function rasterPose(g,entry,index,height){const r=entry.registration,f=r.frames[index],s=height/r.height,dx=((f.offset||0)-r.pivot)*s,dy=-f.baseline*s;if(!f.clipRects){g.drawImage(entry.img,f.x,f.y,f.w,f.h,dx,dy,f.w*s,f.h*s);return;}const c=document.createElement('canvas');c.width=f.w;c.height=f.h;const p=c.getContext('2d');p.drawImage(entry.img,f.x,f.y,f.w,f.h,0,0,f.w,f.h);const mask=document.createElement('canvas');mask.width=f.w;mask.height=f.h;const m=mask.getContext('2d');m.fillStyle='#fff';for(const b of f.clipRects)m.fillRect(...b);p.globalCompositeOperation='destination-in';p.drawImage(mask,0,0);g.drawImage(c,dx,dy,f.w*s,f.h*s);}
  function frame(entry,index){const key=entry.id+':'+index;if(frames.has(key))return frames.get(key);const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');g.translate(CW/2,CH-15);rasterPose(g,entry,index,BASE);const data=c.getContext('2d').getImageData(0,0,CW,CH).data,rows=[];
    for(let y=0;y<CH;y+=BAND){const spans=[];let start=-1,gap=0;for(let x=0;x<CW;x++){let on=false;for(let dy=0;dy<BAND;dy++)if(data[((y+dy)*CW+x)*4+3]>18)on=true;if(on){if(start<0)start=x;gap=0;}else if(start>=0&&++gap>3){spans.push([start,x-gap+1]);start=-1;}}if(start>=0)spans.push([start,CW]);rows.push(spans);}const out={c,rows};frames.set(key,out);return out;
  }
  function tween(entry,index,next,u){const step=Math.round(u*STEPS),key=entry.id+':'+index+':'+step;if(tweens.has(key))return tweens.get(key);const a=frame(entry,index),b=frame(entry,next),c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d'),p=step/STEPS;g.imageSmoothingEnabled=true;
    // Morph disjoint painted silhouettes independently; there are no doubled transparent feet.
    for(let row=0;row<a.rows.length;row++){const as=a.rows[row],bs=b.rows[row],y=row*BAND;for(let j=0;j<as.length;j++){const [x0,x1]=as[j];let target=bs.length===as.length?bs[j]:null;if(!target){target=bs.reduce((best,s)=>Math.abs((s[0]+s[1])-(x0+x1))<Math.abs((best?.[0]??9999)+(best?.[1]??9999)-(x0+x1))?s:best,null);}if(!target||Math.abs(target[0]-x0)>55)target=[x0,x1];const left=x0+(target[0]-x0)*p,right=x1+(target[1]-x1)*p;g.drawImage(a.c,x0,y,Math.max(1,x1-x0),BAND,left,y,Math.max(1,right-left),BAND);}}
    if(tweens.size>=1536){const k=tweens.keys().next().value;tweens.delete(k);}tweens.set(key,c);return c;
  }
  function segment(src,a,b,width){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d'),ang=Math.atan2(b[1]-a[1],b[0]-a[0]),nx=-Math.sin(ang)*width,ny=Math.cos(ang)*width;g.beginPath();g.moveTo(a[0]+nx,a[1]+ny);g.lineTo(b[0]+nx,b[1]+ny);g.lineTo(b[0]-nx,b[1]-ny);g.lineTo(a[0]-nx,a[1]-ny);g.closePath();g.clip();g.drawImage(src,0,0);return {img:c,a,b,len:Math.hypot(b[0]-a[0],b[1]-a[1])};}
  function rig(id,entry){if(rigs.has(id))return rigs.get(id);const c=document.createElement('canvas');c.width=360;c.height=300;const g=c.getContext('2d');g.translate(180,285);rasterPose(g,entry,0,265);
    const d=g.getImageData(0,0,360,300).data;let x0=360,x1=0,y0=300,y1=0;for(let y=0;y<300;y++)for(let x=0;x<360;x++)if(d[(y*360+x)*4+3]>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
    const W=x1-x0,H=y1-y0,point=(x,y)=>[x0+x*W,y0+y*H];
    const defs=id==='wolfRider'?[[.44,.78,.47,.9,.5,.97],[.78,.76,.86,.86,.94,.96],[.31,.77,.23,.86,.19,.98],[.63,.75,.64,.88,.66,.99]]:id==='frostWolf'?[[.45,.52,.43,.74,.45,.86],[.74,.52,.83,.73,.89,.87],[.41,.51,.28,.75,.225,.91],[.56,.51,.64,.74,.684,.95]]:[[.44,.59,.47,.8,.49,.91],[.79,.56,.86,.76,.95,.93],[.33,.60,.23,.78,.19,.96],[.62,.56,.63,.79,.65,.98]];
    const legs=defs.map((v,i)=>{const hip=point(v[0],v[1]),knee=point(v[2],v[3]),foot=point(v[4],v[5]),w=W*(i>1?.064:.049);return {hip,knee,foot,upper:segment(c,hip,knee,w),lower:segment(c,knee,foot,w*.87),w};});
    const body=document.createElement('canvas');body.width=c.width;body.height=c.height;const bg=body.getContext('2d');
    // Remove the complete original leg region, including the outline. Leaving thin strips
    // of a baked leg behind would produce phantom fifth legs when its rig swings away.
    const lower=id==='wolfRider'?[[1,.8],[.8,.82],[.62,.84],[.43,.83],[.25,.85],[0,.79]]:[[1,.61],[.8,.64],[.65,.65],[.5,.69],[.36,.67],[.19,.7],[0,.61]];
    bg.beginPath();bg.moveTo(x0-5,y0-5);bg.lineTo(x1+5,y0-5);for(const [x,y] of lower)bg.lineTo(x0+x*W,y0+y*H);bg.closePath();bg.clip();bg.drawImage(c,0,0);
    const r={body,legs,W,H,x0,x1,y0,y1};rigs.set(id,r);return r;
  }
  function bone(g,s,a,b){const angle=Math.atan2(b[1]-a[1],b[0]-a[0])-Math.atan2(s.b[1]-s.a[1],s.b[0]-s.a[0]),len=Math.hypot(b[0]-a[0],b[1]-a[1]);g.save();g.translate(...a);g.rotate(angle);g.scale(len/s.len,1);g.translate(-s.a[0],-s.a[1]);g.drawImage(s.img,0,0);g.restore();}
  function ik(hip,foot,l1,l2,side){const dx=foot[0]-hip[0],dy=foot[1]-hip[1],d=Math.max(.1,Math.min(Math.hypot(dx,dy),l1+l2-.1)),a=Math.atan2(dy,dx),q=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));return[hip[0]+Math.cos(a+side*q)*l1,hip[1]+Math.sin(a+side*q)*l1];}
  function quadruped(g,id,P,H){const entry=ArtStylized.atlases.get(id+'-walk');if(!entry?.loaded)return false;const r=rig(id,entry),phase=((P.w%1)+1)%1,stance=id==='wolfRider'?.72:id==='frostWolf'?.55:.62,offset=id==='wolfRider'?[.5,0,.25,.75]:id==='frostWolf'?[.15,.65,0,.5]:[.5,0,0,.5],stride=r.H*(id==='wolfRider'?.1:.3),bob=-Math.sin(phase*TAU*2)*r.H*.008;
    g.save();g.scale(H/265,H/265);g.translate(-180,-285);
    function leg(i){const l=r.legs[i],p=(phase+offset[i])%1,foot=[...l.foot];if(p<stance)foot[0]+=stride*(.5-p/stance);else{const s=(p-stance)/(1-stance);foot[0]+=stride*(-.5+(s-Math.sin(s*TAU)/TAU));foot[1]-=Math.sin(Math.PI*s)*r.H*.13;}const hip=[l.hip[0],l.hip[1]+bob],knee=ik(hip,foot,l.upper.len,l.lower.len,i===0||i===2?-1:1);bone(g,l.upper,hip,knee);bone(g,l.lower,knee,foot);}
    g.save();g.filter='brightness(.88)';leg(0);leg(1);g.restore();g.save();g.translate(0,bob);g.drawImage(r.body,0,0);g.restore();leg(2);leg(3);g.restore();return true;
  }
  const profiles={goblin:1.08,bandit:1.13,skeleton:.82,mummy:.7,orc:.83,blackOrc:.79,deathKnight:.72,darkKnight:.72,treant:.55,treantKing:.5,iceGolem:.6,magmaGolem:.57,magmaLord:.5,troll:.68,trollKing:.57,scorpion:1.3,voidling:1.18,imp:1.24};
  window.PaintedMotion={render(g,id,P,H,src,index,n,phase){
    if(P.w>=0&&P.a<0&&['warg','frostWolf','wolfRider'].includes(id))return quadruped(g,id,P,H);
    if(P.d!==undefined)return false;
    if(P.w<0&&P.a<0)return false;
    const row=P.a>=0?12:src===ArtStylized.atlases.get(id+'-walk')?0:6,next=P.a>=0?Math.min(index+1,row+5):row+(index-row+1)%n,u=phase*n-Math.floor(phase*n),c=tween(src,index,next,u);
    g.save();if(P.w>=0&&['wraith','shade','voidWalker'].includes(id))g.translate(0,Math.sin(phase*TAU)*H*.025);g.drawImage(c,-CW/2*H/BASE,-(CH-15)*H/BASE,CW*H/BASE,CH*H/BASE);g.restore();return true;
  },warmFor(ids){for(const key of new Set(ids)){const id=ArtStylized.atlasKey(ArtStylized.identify(key)),entry=ArtStylized.atlases.get(id+'-walk')||ArtStylized.atlases.get(id);if(!entry?.loaded)continue;if(['warg','frostWolf','wolfRider'].includes(id)){rig(id,entry);continue;}const start=entry.id.endsWith('-walk')?0:6,n=entry.id.endsWith('-walk')?12:6;for(let i=0;i<n;i++)frame(entry,start+i);}},stride(id,H){if(['warg','frostWolf','wolfRider'].includes(id))return H*(id==='wolfRider'?.14:id==='frostWolf'?.545:.484);return Math.max(24,H*(profiles[id]||1)*.75);},cache:()=>({frames:frames.size,tweens:tweens.size,rigs:rigs.size})};
})();
