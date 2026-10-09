/* Distinct stage layouts share boundary coordinates, not identical curves. */
(function(){
 const clamp=v=>Math.max(100,Math.min(535,v)),counts=[1,2,1,3,2,3];
 for(let r=0;r<5;r++)for(let s=0;s<6;s++){
  const L=CONFIG.levels[r*6+s],entry=320+65*Math.sin((s+r*.65)*1.4),exit=320+65*Math.sin((s+1+r*.65)*1.4),n=counts[(s+r)%6],amp=90+(s*23+r*17)%75,frequency=1+(s%3)*.5;
  const paths=[];for(let lane=0;lane<n;lane++){
   const points=[];for(let k=0;k<=20;k++){const x=k*64,t=x/1280,base=entry+(exit-entry)*t,envelope=Math.sin(Math.PI*t)**2;
    let y;if(n===1)y=base+amp*envelope*Math.sin(t*Math.PI*2*frequency+r*.75+s*.55);
    else{const split=Math.sin(Math.PI*Math.max(0,Math.min(1,(t-.07)/.83)))**.6,offset=(lane-(n-1)/2)*(n===3?170:250);y=base+offset*split+28*envelope*Math.sin(t*Math.PI*(3+s%2)+r+lane);}
    points.push([x,clamp(y)]);
   }paths.push([[-64,entry],...points,[1344,exit]]);
  }
  L.ipaths=paths;L.route={...L.route,entry:[0,entry],exit:[1280,exit],lanes:n};L.spots=n===3?6:r<3?6:5;
  L.feat.props=(L.feat.props||[]).filter(p=>!['castle','fort','portal','gateway'].includes(p.k));
  if(s===5)L.feat.props.push({k:'castle',x:1194,y:exit+12,prop:true,gate58:true,race:r,s:1});
  L.layout58=r*6+s;
 }
 for(const h of Object.values(CONFIG.heroes)){h.skill.cooldown=Math.round(h.skill.cooldown*1.25);h.skill2.cooldown=Math.round(h.skill2.cooldown*1.25);}
 window.Realm58={counts};
})();
