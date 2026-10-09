/* Whole painted poses; never slice a character into horizontal strips. */
(function(){
 const cache=new Map(),BASE=100;
 function frame(e,n){const key=e.id+':'+n;if(cache.has(key))return cache.get(key);const r=e.registration,s=BASE/r.height;let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const f of r.frames){const x=((f.offset||0)-r.pivot)*s,y=-f.baseline*s;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+f.w*s);y1=Math.max(y1,y+f.h*s);}x0=Math.floor(x0)-4;y0=Math.floor(y0)-4;const c=document.createElement('canvas');c.width=Math.ceil(x1-x0)+4;c.height=Math.ceil(y1-y0)+4;const g=c.getContext('2d');g.translate(-x0,-y0);ArtStylized.blit(g,e,n,BASE);const result={canvas:c,x:x0,y:y0};cache.set(key,result);if(cache.size>240)cache.delete(cache.keys().next().value);return result;}
 function render(g,id,P,size,e){if(P.d!==undefined||!(P.w>=0||P.a>=0))return false;const atk=P.a>=0,phase=atk?Math.min(.999,P.a):((P.w%1)+1)%1,p=phase*6,i=Math.floor(p),f=p-i,row=atk?12:6,next=atk?Math.min(5,i+1):(i+1)%6,a=frame(e,row+i),b=frame(e,row+next),z=size/BASE;
  const mix=Math.max(0,(f-.88)/.12),alpha=g.globalAlpha;
  g.save();g.scale(z,z);g.globalAlpha=alpha*(1-mix);g.drawImage(a.canvas,a.x,a.y);if(mix>0){g.globalAlpha=alpha*mix;g.drawImage(b.canvas,b.x,b.y);}g.restore();return true;
 }
 window.PaintedMotion={render,warmFor(){},clear(){cache.clear();},stats(){return{frames:cache.size,tweens:0,rigs:0};}};
})();
