/* Whole painted poses; never slice a character into horizontal strips. */
(function(){
 const cache=new Map(),states=new WeakMap(),BASE=100;let warmGeneration=0;
 function frame(e,n){const key=e.id+':'+n;if(cache.has(key))return cache.get(key);const r=e.registration,s=BASE/r.height;let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const f of r.frames){const x=((f.offset||0)-r.pivot)*s,y=-f.baseline*s;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+f.w*s);y1=Math.max(y1,y+f.h*s);}x0=Math.floor(x0)-4;y0=Math.floor(y0)-4;const c=document.createElement('canvas');c.width=Math.ceil(x1-x0)+4;c.height=Math.ceil(y1-y0)+4;const g=c.getContext('2d');g.translate(-x0,-y0);ArtStylized.blit(g,e,n,BASE);const result={canvas:c,x:x0,y:y0};cache.set(key,result);if(cache.size>240)cache.delete(cache.keys().next().value);return result;}
 function render(g,id,P,size,e){if(P.d!==undefined)return false;const atk=P.a>=0,walk=P.w>=0,mode=atk?'atk':walk?'walk':'idle',phase=atk?Math.min(.999,P.a):walk?((P.w%1)+1)%1:(((P.t||0)*.28)%1+1)%1,p=phase*6,i=Math.floor(p),f=p-i,row=atk?12:walk?6:0,next=atk?Math.min(5,i+1):(i+1)%6,a=frame(e,row+i),b=frame(e,row+next),z=size/BASE;
  const u=Math.max(0,Math.min(1,(f-.45)/.55)),mix=u*u*(3-2*u),alpha=g.globalAlpha;
  const pose={a,b,mix};let previous=null,blend=1;
  if(P._actor&&(typeof P._actor==='object'||typeof P._actor==='function')){const now=window.Game?.time||0;let state=states.get(P._actor);
   if(!state||state.id!==id){state={id,mode,pose};states.set(P._actor,state);}
   if(state.mode!==mode){state.from=state.pose;state.since=now;state.mode=mode;}
   if(state.from){const t=Math.max(0,Math.min(1,(now-state.since)/.09));blend=t*t*(3-2*t);previous=state.from;if(t>=1)state.from=null;}
   state.pose=pose;
  }
  function paint(q,opacity){g.globalAlpha=alpha*opacity*(1-q.mix);g.drawImage(q.a.canvas,q.a.x,q.a.y);if(q.mix>0){g.globalAlpha=alpha*opacity*q.mix;g.drawImage(q.b.canvas,q.b.x,q.b.y);}}
  g.save();g.scale(z,z);if(previous&&blend<1)paint(previous,1-blend);paint(pose,blend);g.restore();return true;
 }
 window.PaintedMotion={render,warmFor(keys){const generation=++warmGeneration,queue=[];for(const id of [...new Set(keys)].slice(0,9)){const e=ArtStylized.atlases.get(ArtStylized.identify(id));if(!e?.loaded)continue;for(const n of [0,6,7,8,9,10,11,12,13,14,15,16,17])queue.push([e,n]);}function batch(){if(generation!==warmGeneration)return;const start=performance.now();while(queue.length&&performance.now()-start<3){const [e,n]=queue.shift();frame(e,n);}if(queue.length)setTimeout(batch,16);}setTimeout(batch,0);},clear(){warmGeneration++;cache.clear();},stats(){return{frames:cache.size,tweens:0,rigs:0};}};
})();
