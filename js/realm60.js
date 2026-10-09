/* Compact battle boards. Lanes are composed inside separate corridors, never clamped. */
(function(){
 CONFIG.world={width:1000,height:480};CONFIG.pathWidth=44;
 const waves=[[0,.8,-.65,.55,-.8,.5,0],[0,-.55,.85,-.5,.7,-.7,0],[0,.7,.8,-.7,-.8,.65,0],[0,-.8,-.3,.9,.3,-.8,0],[0,.3,-.9,-.3,.85,.45,0],[0,-.7,.65,.85,-.65,-.3,0]];
 for(let i=0;i<36;i++){
  const L=CONFIG.levels[i],r=Math.floor(i/6),s=i%6,n=L.ipaths.length,pattern=waves[(s+r*2)%6],amp=n===1?88:n===2?34:8,mid=n===1?[240]:n===2?[160,320]:[92,240,388],gate=s===5,endY=250+(r%3-1)*20;
  L.ipaths=mid.map((cy,lane)=>{
   const pts=pattern.map((v,k)=>[k===0?-35:k===6?1035:65+k*143+(r%3-1)*9,cy+v*amp+Math.sin(k*.8+i*.31)*7]);
   // Split from a shared approach, then rejoin. Branches have room to defend.
   if(n>1){pts[0][1]=pts[1][1]=240+(r%3-1)*14;pts[5][1]=240+(s%3-1)*18;pts[6][1]=pts[5][1];}
   // Straight approaches to narrow rivers keep bridges short and readable.
   if(gate)pts.splice(5,2,[795,cy+pattern[5]*amp],[875,endY+(cy-endY)*.35],[930,endY]);
   if(n>1)pts.splice(1,0,[80,pts[0][1]]);
   return pts;
  });
  L.bg={...L.bg,x0:0,y0:0,x1:1000,y1:480};L.route={chapter:r,lanes:n,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};
  L.spots=n===1?5:n===2?5:6;
  const rx=455+(i%4)*33;L.feat={void:false,props:[],rivers:[],lakes:[]};
  if([1,2,5].includes(L.scene59.kind))L.feat.rivers=[{pts:[[rx,-40],[rx+5,120],[rx-5,320],[rx,520]],w:30,kind:r===4?'lava':r===5?'void':'water'}];
  else if(s%2===0)L.feat.lakes=[{x:650+(i%3)*60,y:48,rx:55,ry:18,kind:r===4?'lava':r===5?'void':'water'}];
  L.feat.props.push({k:r===5?'rune':r===4?'redcrystal':'rock',x:140+(i*47)%680,y:58,s:.8});
  if(L.scene59.kind===3)L.feat.props.push({k:r===0?'house':r===1?'stump':r===2?'rune':r===3?'ruin':r===4?'tent':'voidcrystal',x:730+(r%2)*80,y:75,s:.7});
  if(gate)L.feat.props.push({k:'castle',gate59:true,race:r<5?r:2,x:930,y:endY,doorX:930,doorY:endY,s:1});
  L.compact60=true;
 }
 window.Realm60={width:1000,height:480};
})();
