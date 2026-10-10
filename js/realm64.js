/* Shorter boards and one scale hierarchy, without changing combat stats. */
(function(){
 const sx=.88;
 CONFIG.world={width:880,height:480};CONFIG.pathWidth=38;
 for(const L of CONFIG.levels){const single=L.ipaths.length===1;
  L.ipaths=L.ipaths.map(path=>path.map(([x,y])=>[x*sx,single?240+(y-240)*.72:y]));
  L.bg={...L.bg,x1:880,y1:480};L.route={...L.route,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};
  L.spots=L.ipaths.length===1?8:L.ipaths.length===2?9:10;
  for(const rv of L.feat.rivers){rv.pts=rv.pts.map(([x,y])=>[x*sx,y]);rv.w=28;}
  for(const lake of L.feat.lakes){lake.x*=sx;lake.rx*=sx;}
  for(const p of L.feat.props){p.x*=sx;if(p.doorX!==undefined)p.doorX*=sx;if(single&&p.gate59){p.y=240+(p.y-240)*.72;p.doorY=p.y;}}
 }
 const H={goblin:27,imp:27,bandit:32,skeleton:32,mummy:34,mushroomShaman:32,orc:36,orcArcher:34,blackOrc:39,warg:29,frostWolf:30,wolfRider:37,scorpion:29,wraith:34,shade:32,voidWalker:36,voidling:36,deathKnight:40,darkKnight:42,drake:40,treant:44,troll:43,iceGolem:44,magmaGolem:44,shellGuard:36};
 for(const [id,e] of Object.entries(CONFIG.enemies))e.drawHeight=e.boss?52:(H[id]||34);
 for(const [id,h] of Object.entries(CONFIG.heroes))h.drawHeight=['borin','haldren'].includes(id)?35:38;
 window.Realm64={width:880,soldier:34,hero:38,dwarf:35,enemyHeights:H};
})();
