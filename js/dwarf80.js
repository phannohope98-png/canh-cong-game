/* Region 4: six painted Dwarf Mountain Citadel stages. Routes and build pads are traced in image pixels.
 * The navigation graph follows painted bridges and pad stairs; units cannot cross water or cliffs. */
(function () {
  'use strict';
  const base = new URL('../assets/backgrounds/', document.currentScript.src);
  const scenes = [{"name":"Cảng Đồng Biên Sơn","size":[1672,941],"routes":[[[0,370],[105,371],[193,339],[270,285],[345,253],[422,250],[500,273],[567,316],[662,337],[753,342],[840,345],[939,353],[1020,387],[1110,433],[1210,453],[1280,442],[1335,405],[1364,345],[1380,294],[1435,265],[1493,249],[1545,219]]],"pads":[[369,161],[675,245],[1038,278],[1296,167],[414,480],[839,526],[1251,535]],"links":[[[369,161],[373,198],[375,253]],[[675,245],[663,281],[659,337]],[[1038,278],[1024,315],[1009,383]],[[1296,167],[1315,204],[1334,250],[1400,281]],[[414,480],[456,433],[511,401],[546,363],[542,328]],[[839,526],[817,477],[779,440],[747,410],[729,380],[701,358]],[[1251,535],[1280,517],[1297,492],[1291,475],[1250,461]]],"story":"Rời Ngai Trăng, đoàn hộ tống cập Cảng Đồng. Giữ cây cầu qua cửa biển và bảo vệ lối lên mỏ của Sơn Thành.","image":"dwarf80-1.webp","canopy":true},{"name":"Guồng Nước Tuyết Tan","size":[1672,941],"routes":[[[107,162],[184,201],[276,235],[371,247],[478,239],[565,250],[610,292],[644,343],[711,379],[784,403],[860,411],[938,408],[1030,413],[1108,427],[1196,429],[1284,414],[1360,383],[1425,341],[1494,311],[1558,282],[1610,254]],[[93,557],[180,585],[280,584],[377,559],[478,552],[570,536],[632,504],[672,465],[712,433],[784,403],[860,411],[938,408],[1030,413],[1108,427],[1196,429],[1284,414],[1360,383],[1425,341],[1494,311],[1558,282],[1610,254]]],"pads":[[368,143],[544,374],[418,638],[1295,281],[1364,552]],"links":[[[368,143],[363,179],[360,246]],[[544,374],[587,403],[621,432],[660,443]],[[418,638],[460,604],[484,556]],[[1295,281],[1322,325],[1354,387]],[[1364,552],[1335,514],[1286,459],[1270,419]]],"story":"Hai cửa mỏ dẫn về guồng nước khổng lồ. Giữ cầu hợp lưu để dòng Tuyết Tan tiếp tục cấp sức cho lò rèn.","image":"dwarf80-2.webp","canopy":true},{"name":"Đèo Ray Quặng","size":[1672,941],"routes":[[[80,0],[128,36],[228,74],[288,115],[349,169],[411,208],[434,264],[429,326],[439,400],[469,446],[539,480],[651,511],[772,541],[898,557],[1024,558],[1134,536],[1230,493],[1300,455],[1338,401],[1354,344],[1389,291],[1465,269],[1545,244],[1610,211]]],"pads":[[583,260],[283,364],[583,584],[849,414],[1077,624],[1260,224],[1471,480]],"links":[[[583,260],[518,267],[434,274]],[[283,364],[349,375],[436,385]],[[583,584],[588,546],[590,496]],[[849,414],[897,460],[946,505],[965,558]],[[1077,624],[1037,599],[1013,558]],[[1260,224],[1300,256],[1380,303]],[[1471,480],[1416,455],[1380,425],[1340,404]]],"story":"Đường ray chở lõi quặng chạy quanh đèo. Đoàn đi trên đường bộ cạnh ray, vượt thác và các miệng mỏ để tới xưởng thợ rèn.","image":"dwarf80-3.webp","canopy":true},{"name":"Ba Cầu Thợ Rèn","size":[1672,941],"routes":[[[65,152],[188,162],[300,163],[431,186],[524,202],[644,220],[753,255],[817,300],[868,355],[943,390],[1030,400],[1111,411],[1190,415],[1283,400],[1370,379],[1447,352],[1495,330]],[[60,366],[194,379],[313,400],[420,432],[514,416],[600,416],[697,430],[784,429],[873,428],[943,416],[1030,400],[1111,411],[1190,415],[1283,400],[1370,379],[1447,352],[1495,330]],[[91,650],[209,654],[321,674],[431,683],[543,661],[653,636],[772,607],[860,573],[919,529],[962,478],[1030,400],[1111,411],[1190,415],[1283,400],[1370,379],[1447,352],[1495,330]]],"pads":[[400,93],[402,333],[399,583],[1013,269],[1225,600]],"links":[[[400,93],[422,126],[443,188]],[[402,333],[413,370],[431,431]],[[399,583],[442,610],[468,676]],[[1013,269],[1034,309],[1048,400]],[[1225,600],[1180,563],[1122,520],[1078,482],[1055,408]]],"story":"Ba cửa mỏ dồn quân lên ba cây cầu thợ rèn. Phân chia hỏa lực ở mỗi nhánh, rồi giữ sân hợp lưu trước đại xưởng.","image":"dwarf80-4.webp","canopy":true},{"name":"Sân Thành Mái Vàng","size":[1672,941],"routes":[[[20,204],[124,237],[245,257],[376,268],[507,274],[625,299],[731,341],[832,379],[928,415],[1002,453],[1094,446],[1188,427],[1252,397],[1282,351],[1300,301],[1333,266],[1367,228],[1400,205]],[[24,504],[133,542],[244,566],[376,549],[491,522],[603,520],[728,523],[835,508],[931,473],[1002,453],[1094,446],[1188,427],[1252,397],[1282,351],[1300,301],[1333,266],[1367,228],[1400,205]]],"pads":[[434,175],[453,395],[533,661],[911,265],[934,635],[1338,533]],"links":[[[434,175],[458,210],[470,273]],[[453,395],[474,435],[493,522]],[[533,661],[512,606],[498,523]],[[911,265],[931,306],[951,424]],[[934,635],[907,584],[883,539],[875,490]],[[1338,533],[1285,493],[1240,449],[1208,419]]],"story":"Hai đường đèo hội tụ trước thành mái vàng. Bảo vệ sân thành, mở cổng và đưa lõi Chuông Bình Minh vào đại điện.","image":"dwarf80-5.webp","canopy":true},{"name":"Đại Điện Tim Núi","size":[1672,941],"routes":[[[85,215],[153,248],[269,271],[403,284],[533,314],[614,349],[684,389],[774,420],[894,433],[1014,455],[1120,446],[1200,414],[1245,377],[1290,335],[1351,307],[1390,264],[1432,226],[1470,197]],[[108,619],[180,652],[288,649],[386,616],[475,580],[576,570],[690,568],[796,533],[905,505],[1014,455],[1120,446],[1200,414],[1245,377],[1290,335],[1351,307],[1390,264],[1432,226],[1470,197]]],"pads":[[622,220],[399,444],[801,643],[958,324],[1198,596],[1383,451]],"links":[[[622,220],[599,255],[570,329]],[[399,444],[429,490],[462,585]],[[801,643],[744,600],[712,565]],[[958,324],[943,366],[931,439]],[[1198,596],[1144,550],[1105,514],[1080,451]],[[1383,451],[1314,430],[1265,397],[1250,372]]],"story":"Lõi Chuông Bình Minh nằm trong Ngai Tim Núi giữa đại điện. Giữ hai cửa sảnh, phá phong ấn của kẻ chiếm lò và đưa đoàn sang Hoang Địa Orc.","image":"dwarf80-6.webp","canopy":true}];
  const images = new Map();
  function load(d) {
    if (images.has(d.image)) {const a=images.get(d.image);images.delete(d.image);images.set(d.image,a);return a;}
    const a={image:new Image(),loaded:false,error:false};
    a.ready=new Promise((ok,no)=>{
      a.image.onload=()=>{a.loaded=true;ok(a.image);if(Game.map?.dwarf80===d)Game.renderBg();if(UI._menuMap?.dwarf80===d){UI._menuBg=null;UI.paintMenu?.();}};
      a.image.onerror=()=>{a.error=true;no(new Error('Không tải được '+d.image));};
    });
    a.ready.catch(()=>{if(Game.map?.dwarf80===d)UI.toast('Không tải được ảnh Sơn Thành Người Lùn. Hãy tải lại trang.');});
    a.image.src=new URL(d.image,base).href;images.set(d.image,a);
    while(images.size>2)images.delete(images.keys().next().value);
    return a;
  }
  function pointLine(points) {const out=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/5));for(let k=0;k<n;k++)out.push({x:a.x+(b.x-a.x)*k/n,y:a.y+(b.y-a.y)*k/n});}out.push({...points.at(-1)});return out;}
  function graphFor(routes,pads,links) {
    const nodes=[],edges=[],ids=new Map();
    const node=p=>{const k=Math.round(p.x*10)+','+Math.round(p.y*10);if(ids.has(k))return ids.get(k);const i=nodes.length;nodes.push({...p});ids.set(k,i);return i;};
    const edge=(a,b)=>{if(a!==b&&!edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))edges.push({a,b,length:Math.hypot(nodes[a].x-nodes[b].x,nodes[a].y-nodes[b].y)});};
    for(const route of routes)for(let i=1;i<route.length;i++)edge(node(route[i-1]),node(route[i]));
    const graph={nodes,edges};
    for(let i=0;i<pads.length;i++){
      const chain=links[i]||[pads[i]],anchor=chain.at(-1),q=nearest(graph,anchor.x,anchor.y),old=edges[q.edge],id=node(q);
      edges.splice(q.edge,1);edge(old.a,id);edge(id,old.b);
      let previous=id;for(const p of [...chain].reverse()){const next=node(p);edge(previous,next);previous=next;}
    }
    return graph;
  }
  function nearest(graph,x,y) {
    let best=null;graph.edges.forEach((e,index)=>{const a=graph.nodes[e.a],b=graph.nodes[e.b],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy))),px=a.x+dx*t,py=a.y+dy*t,dist=Math.hypot(x-px,y-py);if(!best||dist<best.dist)best={x:px,y:py,dist,t,edge:index};});return best;
  }
  function routeBetween(graph,x,y,gx,gy) {
    const s=nearest(graph,x,y),t=nearest(graph,gx,gy),N=graph.nodes.length,nodes=[...graph.nodes,s,t],adj=nodes.map(()=>[]);
    const link=(a,b,w)=>{adj[a].push([b,w]);adj[b].push([a,w]);};
    for(const e of graph.edges)link(e.a,e.b,e.length);
    for(const [id,q] of [[N,s],[N+1,t]]){const e=graph.edges[q.edge];link(id,e.a,e.length*q.t);link(id,e.b,e.length*(1-q.t));}
    if(s.edge===t.edge)link(N,N+1,Math.hypot(s.x-t.x,s.y-t.y));
    const dist=nodes.map(()=>Infinity),prev=[],done=new Set();dist[N]=0;
    while(done.size<nodes.length){let u=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(u<0||dist[i]<dist[u]))u=i;if(u<0||!Number.isFinite(dist[u])||u===N+1)break;done.add(u);for(const [v,w]of adj[u])if(dist[u]+w<dist[v]){dist[v]=dist[u]+w;prev[v]=u;}}
    const path=[];for(let i=N+1;i!==undefined;i=prev[i]){path.unshift(nodes[i]);if(i===N)break;}return path;
  }
  const build=Level.build;
  Level.build=function(i){
    const m=build.call(this,i),d=scenes[i-18];if(!d)return m;
    m.dwarf80=d;m.W=760;m.H=Math.round(760*d.size[1]/d.size[0]);m.sc=760/d.size[0];
    const p=([x,y])=>({x:x*m.sc,y:y*m.sc});const routes=d.routes.map(a=>a.map(p));
    m.paths=routes.map(a=>new Level.Path(pointLine(a)));m.spots=d.pads.map((a,id)=>({...p(a),id}));
    m.graph80=graphFor(routes,m.spots,d.links.map(a=>a.map(p)));m.entry=m.paths.map(()=>0);m.starts=m.paths.map(a=>({...a.points[0]}));m.exit={...m.paths[0].points.at(-1)};
    m.feat={...m.feat,rivers:[],lakes:[],props:[]};m.decor=[];m.rivers=[];m.river=null;m.pond=[];m.coded=false;m.image=null;
    m.def.spots=m.spots.length;return m;
  };
  scenes.forEach((d,j)=>{const L=CONFIG.levels[j+18];L.name=d.name;L.sub=d.name;L.story=d.story;L.dwarf80=d;L.ipaths=d.routes.map(path=>path.map(([x,y])=>[x*760/d.size[0],y*760/d.size[0]]));L.bg={...L.bg,x0:0,y0:0,x1:760,y1:480};L.route={...L.route,lanes:d.routes.length,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};});
  const render=Level.renderBackground;
  Level.renderBackground=function(m,res){if(!m.dwarf80)return render.call(this,m,res);const a=load(m.dwarf80),c=document.createElement('canvas');res=Math.min(1.5,Math.max(.7,res||1));c.width=Math.ceil(m.W*res);c.height=Math.ceil(m.H*res);const g=c.getContext('2d');g.imageSmoothingQuality='high';if(a.loaded)g.drawImage(a.image,0,0,c.width,c.height);else{g.fillStyle='#253440';g.fillRect(0,0,c.width,c.height);g.fillStyle='#fff1c8';g.font='16px sans-serif';g.textAlign='center';g.fillText(a.error?'Không tải được map Người Lùn':'Đang tải Sơn Thành Người Lùn…',c.width/2,c.height/2);}return c;};
  const plot=Painter.plot;
  Painter.plot=function(g,x,y,on,t){if(!Game.map?.dwarf80)return plot.apply(this,arguments);g.save();g.strokeStyle=on?'#ffe5ae':'rgba(255,231,172,.65)';g.lineWidth=on?2:1;g.beginPath();g.ellipse(x,y,15,6,0,0,Math.PI*2);g.stroke();g.fillStyle=on?'#fff5ca':'#ffe4ad';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText('+',x,y+3);g.restore();};
  const spotAt=Towers.spotAt;
  Towers.spotAt=function(x,y){if(!Game.map?.dwarf80)return spotAt.call(this,x,y);let best=null;for(const s of this.spots){const d=Math.hypot(x-s.x,(y-s.y)*1.7);if(d<27&&(!best||d<best.d))best={s,d};}return best?.s||null;};
  const spawn=Enemies.spawn;
  Enemies.spawn=function(...args){const e=spawn.apply(this,args);if(Game.map?.dwarf80){e.lat=Math.sign(e.lat)*1.3;e.place();}return e;};
  const move=Unit.prototype.moveTo;
  Unit.prototype.moveTo=function(gx,gy,dt){const m=Game.map;if(!m?.dwarf80?.canopy)return move.call(this,gx,gy,dt);let plan=this.nav80;if(!plan||plan.map!==m||Math.hypot(plan.gx-gx,plan.gy-gy)>7){plan=this.nav80={map:m,gx,gy,path:routeBetween(m.graph80,this.x,this.y,gx,gy),i:0};}
    while(plan.i<plan.path.length&&Math.hypot(this.x-plan.path[plan.i].x,this.y-plan.path[plan.i].y)<1.5)plan.i++;
    if(plan.i>=plan.path.length){this.moving=false;return true;}const q=plan.path[plan.i];const arrived=move.call(this,q.x,q.y,dt);if(arrived)plan.i++;return plan.i>=plan.path.length;
  };
  const update=Unit.prototype.update;
  Unit.prototype.update=function(dt){const m=Game.map;if(m?.dwarf80?.canopy&&this.active){const q=nearest(m.graph80,this.postX,this.postY);this.postX=q.x;this.postY=q.y;}return update.call(this,dt);};
  const heroMove=Hero.moveHero;
  Hero.moveHero=function(u,x,y){if(Game.map?.dwarf80?.canopy){const q=nearest(Game.map.graph80,x,y);x=q.x;y=q.y;}return heroMove.call(this,u,x,y);};
  const posts=Units.placePosts;
  Units.placePosts=function(T){const out=posts.call(this,T);if(Game.map?.dwarf80?.canopy)for(const u of this.list)if(u.tower===T){const q=nearest(Game.map.graph80,u.postX,u.postY);u.postX=q.x;u.postY=q.y;}return out;};

  // All three projectile types must leave the visually scaled tower muzzle.
  const construct=Towers.build;
  Towers.build=function(...args){const t=construct.apply(this,args);if(!t||!Game.map?.dwarf80)return t;
    const muzzle=t.muzzle;t.muzzle=function(){const q=muzzle.call(this);return{x:this.x+(q.x-this.x)*.70,y:this.y+(q.y-this.y)*.70};};
    const top=t.topY;t.topY=function(){return top.call(this)*.70;};return t;
  };
  // Direct image URLs avoid permanently caching a loading placeholder as a thumbnail.
  const regionCard=UI.regionCard;
  UI.regionCard=function(r){if(r!==3)return regionCard.call(this,r);
    this.overlay(`<div class="ribbon">Sơn Thành Người Lùn</div><p class="rinfo">Qua cảng đồng, guồng nước, đèo ray và ba cầu thợ rèn. Chặng 6 chiến đấu bên trong Đại Điện Tim Núi.</p><div class="chapter-route">${scenes.map((d,s)=>{const i=18+s,lock=i>=Save.data.unlocked;return `<button class="chapter-card ${lock?'locked':''}" data-action="${lock?'map-locked':'level'}" data-index="${i}"><img src="${new URL(d.image,base).href}" alt="${d.name}" loading="lazy"><span><b>${s+1}. ${d.name}</b><small>${s===5?'ĐẠI ĐIỆN · ':''}${'★'.repeat(Save.data.stars[i]||0)||'Chưa hoàn thành'}</small></span></button>`;}).join('')}</div><button class="gbtn gray sm" data-action="overlay-ok">Đóng</button>`);
    document.getElementById('overlay-panel').classList.add('wide');
  };
  const levelCard=UI.levelCard;UI.levelCard=function(i){const out=levelCard.call(this,i),d=scenes[i-18];if(d){const img=document.querySelector('#overlay-panel .lvimg');if(img)img.src=new URL(d.image,base).href;}return out;};
  const result=UI.showResult;
  UI.showResult=function(r){const out=result.apply(this,arguments),d=scenes[Game.levelIndex-18];if(d)setTimeout(()=>{const rib=document.querySelector('.ribbon');if(rib)rib.insertAdjacentHTML('afterend',`<p class="levelup">${r.win?(Game.levelIndex===23?'Đã giải phong Ngai Tim Núi. Đoàn tiếp tục sang Hoang Địa Orc.':'Đã giữ '+d.name+'. Tiến tới '+scenes[Game.levelIndex-17].name+'.'):'Tuyến '+d.name+' đã bị xuyên thủng. Hãy đổi cách bố trí trụ và điều tướng.'}</p>`);},0);return out;};
  window.Dwarf80={scenes,load,nearest,routeBetween,version:80};
})();
