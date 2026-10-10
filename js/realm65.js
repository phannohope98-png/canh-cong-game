/* Authored routes wrap clearings and ridges; chapters keep their own layouts. */
(function(){
 const single=[
 [[-30,200],[100,200],[235,325],[405,325],[545,150],[715,150],[910,235]],
 [[-30,320],[140,320],[245,150],[430,130],[570,290],[735,310],[910,260]],
 [[390,-30],[390,90],[215,160],[200,305],[420,330],[640,205],[910,205]],
 [[330,520],[330,385],[150,285],[185,130],[420,130],[620,280],[910,280]],
 [[-30,155],[155,155],[235,315],[425,330],[585,155],[720,150],[910,225]],
 [[-30,275],[150,275],[245,130],[430,140],[570,315],[720,300],[910,240]]
 ];
 for(let i=0;i<36;i++){const L=CONFIG.levels[i],r=Math.floor(i/6),s=i%6,n=L.ipaths.length,v=(s+r*2)%6,gate=L.feat.props.find(p=>p.gate59),shift=(r%3-1)*9;
  if(n===1)L.ipaths=[single[v].map(([x,y],k)=>[x,y+(k>0&&k<6?shift:0)])];
  else if(n===2){const upper=[[-30,240],[100,240],[220,112+shift],[420,120],[600,185+shift],[755,240],[910,240]],lower=[[-30,240],[100,240],[235,350],[430,365-shift],[615,290-shift],[755,240],[910,240]];
   if(v%3===1){upper[3]=[420,185];upper[4]=[600,105];lower[2]=[220,315];lower[3]=[430,375];}
   if(v%3===2){upper[2]=[210,100];upper[3]=[380,120];upper[4]=[565,200];lower[2]=[235,355];lower[3]=[460,315];lower[4]=[635,365];}
   L.ipaths=[upper,lower];
  }else L.ipaths=[
   [[-30,240],[90,240],[225,90+shift],[425,90],[605,150],[755,240],[910,240]],
   [[-30,240],[90,240],[260,245-shift],[460,225+shift],[635,255],[755,240],[910,240]],
   [[-30,240],[90,240],[230,385],[430,390-shift],[615,330],[755,240],[910,240]]
  ];
  for(const path of L.ipaths)for(let k=2;k<path.length-2;k++){path[k][0]+=(s-2)*3;path[k][1]+=Math.sin(i*.51+k)*4;}
  if(gate)for(const path of L.ipaths)path.splice(path.length-2,2,[725,path.at(-2)[1]],[gate.x,gate.y]);
  L.route={...L.route,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};
  // The river bends away from the first split, making bridges part of the scene.
  for(const river of L.feat.rivers)river.pts=[[495+shift,-40],[480+shift,145],[505+shift,335],[490+shift,520]];
  L.scene65={r,s,v,seed:i*7919+6501};
 }
 // Keep combat roads lighter than terrain, including the darker magic/Orc regions.
 window.Realm65={version:65};
})();
