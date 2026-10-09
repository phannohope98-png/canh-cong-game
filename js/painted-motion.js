/* Whole painted poses; never slice a character into horizontal strips. */
(function(){
 const cache=new Map(),W=288,H=150,BASE=100,foot=136;
 function frame(e,n){const key=e.id+':'+n;if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.translate(W/2,foot);ArtStylized.blit(g,e,n,BASE);cache.set(key,c);if(cache.size>240)cache.delete(cache.keys().next().value);return c;}
 function render(g,id,P,size,e){if(P.d!==undefined||!(P.w>=0||P.a>=0))return false;const atk=P.a>=0,phase=atk?Math.min(.999,P.a):((P.w%1)+1)%1,p=phase*6,i=Math.floor(p),f=p-i,row=atk?12:6,next=atk?Math.min(5,i+1):(i+1)%6,a=frame(e,row+i),b=frame(e,row+next),z=size/BASE;
  const mix=Math.max(0,(f-.72)/.28),alpha=g.globalAlpha;
  g.save();g.scale(z,z);g.globalAlpha=alpha*(1-mix);g.drawImage(a,-W/2,-foot);if(mix>0){g.globalAlpha=alpha*mix;g.drawImage(b,-W/2,-foot);}g.restore();return true;
 }
 window.PaintedMotion={render,warmFor(){},clear(){cache.clear();},stats(){return{frames:cache.size,tweens:0,rigs:0};}};
})();
