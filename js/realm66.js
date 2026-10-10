/* Compact tactical junctions, not full-board parallel sine waves. */
(function(){
 const routes=[
  [[-25,260],[120,260],[225,165],[380,165],[490,260],[665,260],[905,220]],
  [[-25,180],[155,180],[285,295],[445,295],[565,185],[720,185],[905,215]],
  [[310,-25],[310,105],[195,205],[300,305],[490,305],[655,230],[905,230]],
  [[340,505],[340,385],[195,285],[280,175],[470,175],[635,245],[905,245]],
  [[-25,290],[140,290],[245,210],[415,210],[530,310],[695,310],[905,260]],
  [[-25,205],[135,205],[245,285],[405,285],[530,205],[715,205],[905,235]]
 ];
 for(let i=0;i<36;i++){
  const L=CONFIG.levels[i],r=i/6|0,s=i%6,v=(s+r)%6,n=L.ipaths.length,gate=L.feat.props.find(p=>p.gate59);
  let paths;
  if(n===1) paths=[routes[v].map(p=>p.slice())];
  else {
   // Upper route and lower route share short approaches around a buildable island.
   paths=[
    [[-25,235],[140,235],[255,145],[415,145],[540,230],[695,235],[905,235]],
    [[-25,235],[140,235],[265,335],[425,335],[550,250],[695,235],[905,235]]
   ];
   if(v===1)paths=[
    [[-25,240],[150,240],[285,150],[475,150],[675,175],[905,175]],
    [[-25,240],[150,240],[280,330],[475,330],[675,315],[905,315]]];
   if(v===2)paths=[
    [[-25,145],[160,145],[300,195],[455,195],[600,270],[905,270]],
    [[-25,355],[175,355],[315,300],[465,315],[600,270],[905,270]]];
   if(v===3)paths=[
    [[-25,300],[155,300],[285,200],[455,200],[600,285],[905,285]],
    [[465,-25],[465,90],[560,150],[600,285],[905,285]]];
   if(v===4)paths=[
    [[-25,180],[170,180],[300,275],[460,275],[600,195],[905,195]],
    [[465,505],[465,385],[570,320],[600,195],[905,195]]];
   if(v===5)paths=[
    [[-25,150],[155,150],[295,215],[410,240],[595,320],[745,250],[905,250]],
    [[-25,360],[155,360],[295,290],[410,240],[595,320],[745,250],[905,250]]];
   if(n===3) paths.push(v%2?
    [[565,505],[565,385],[655,315],[695,235],[905,235]]:
    [[585,-25],[585,95],[660,160],[695,235],[905,235]]);
  }
  // Variations are restrained so the map remains compact on a phone.
  for(const path of paths)for(let k=1;k<path.length-2;k++){
   path[k][0]+=(r-2)*5+(s-2)*3;
   path[k][1]+=Math.sin(i*.65+k)*9;
  }
  if(gate)for(const path of paths){path[path.length-2]=[gate.x-90,gate.y];path[path.length-1]=[gate.x,gate.y];}
  L.ipaths=paths;L.route={...L.route,entry:paths[0][0],exit:paths[0].at(-1)};
  // Some encounters have no river; others have one deliberate crossing after the junction.
  if(L.feat.rivers.length){const x=715+(s%3-1)*20;for(const river of L.feat.rivers)river.pts=[[x-30,-40],[x-15,130],[x+10,280],[x+20,520]];}
  L.scene65={...L.scene65,seed:i*7919+6601};
 }
 const sx=760/880;CONFIG.world.width=760;
 for(const L of CONFIG.levels){
  L.ipaths=L.ipaths.map(path=>path.map(([x,y])=>[x*sx,y]));L.bg.x1=760;
  for(const river of L.feat.rivers)river.pts=river.pts.map(([x,y])=>[x*sx,y]);
  for(const lake of L.feat.lakes){lake.x*=sx;lake.rx*=sx;}
  for(const p of L.feat.props){p.x*=sx;if(p.doorX!==undefined)p.doorX*=sx;}
  L.route={...L.route,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};
 }
 window.Realm66={version:66,width:760};
})();
