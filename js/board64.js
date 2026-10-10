/* More build choices, checked against the full tower footprint and wet ground. */
(function(){
 const build=Level.build;
 Level.build=function(i){const m=build.call(this,i),samples=m.paths.flatMap(p=>{const out=[];for(let d=0;d<=p.length;d+=8)out.push(p.pointAt(d,{}));return out;}),candidates=[];
  for(let y=94;y<=m.H-84;y+=12)for(let x=65;x<m.W-65;x+=16){const near=Math.min(...m.paths.map(p=>p.nearest(x,y).perp));if(near<30||near>125||MapArt.wetAt(m.feat,x,y,35)||m.feat.props.some(p=>Math.hypot(p.x-x,p.y-y)<83)||samples.some(q=>Math.abs(q.x-x)<58&&q.y>y-95&&q.y<y+30))continue;candidates.push({x,y,near});}
  const spots=[];while(candidates.length&&spots.length<m.def.spots){let best=-1,bscore=-Infinity;for(let k=0;k<candidates.length;k++){const c=candidates[k];if(spots.some(s=>Math.abs(s.x-c.x)<85&&Math.abs(s.y-c.y)<82))continue;let fresh=0;for(const path of m.paths)for(let d=55;d<path.length-35;d+=80){const p=path.pointAt(d,{});if(Math.hypot(p.x-c.x,p.y-c.y)<155&&!spots.some(s=>Math.hypot(p.x-s.x,p.y-s.y)<135))fresh++;}const score=fresh*20-c.near*.35+(spots.length?Math.min(...spots.map(s=>Math.hypot(s.x-c.x,s.y-c.y)))*.015:0);if(score>bscore){best=k;bscore=score;}}if(best<0)break;const c=candidates.splice(best,1)[0];spots.push({x:c.x,y:c.y,id:spots.length});}
  m.spots=spots;m.decor=MapArt.decor(m.feat,m.paths,spots,m.W,m.H,m.def.theme,i*31+7);return m;
 };
 const create=Hero.create;Hero.create=function(m){const u=create.call(this,m);u.scale=u.heroDef.drawHeight/48;return u;};
 const update=Units.update;Units.update=function(dt){for(const u of this.list)if(u.temp&&!u.isHero)u.scale=32/48;return update.call(this,dt);};
 window.Board64={width:880,footprint:{halfWidth:35,height:68},version:64};
})();
