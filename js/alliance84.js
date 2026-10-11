/* Human coastal kingdom: six painted stages. Routes and build pads are traced in image pixels.
 * The navigation graph follows painted bridges and pad stairs; units cannot cross water or cliffs. */
(function () {
  'use strict';
  const base = new URL('../assets/backgrounds/', document.currentScript.src);
  const scenes = [{"name":"Cờ Trận Gãy","source":"exec-a2f3ad51-b875-47ae-8c9a-975f96e9a346.png","size":[1672,941],"routes":[[[0,407],[180,386],[360,390],[560,454],[720,497],[860,482],[1020,425],[1200,360],[1350,303],[1460,225],[1520,200]]],"pads":[[347,244],[626,262],[909,282],[1158,232],[391,536],[686,590],[1000,603],[1289,530]],"links":[[[347,244],[357,321],[360,390]],[[626,262],[625,359],[630,475]],[[909,282],[911,380],[911,462]],[[1158,232],[1165,305],[1165,373]],[[391,536],[396,481],[400,403]],[[686,590],[686,559],[686,491]],[[1000,603],[986,531],[986,439]],[[1289,530],[1260,470],[1260,337]]],"story":"Giữ đường rút quân dưới những lá cờ gãy của năm tộc.","image":"alliance84-1.webp","canopy":true},{"name":"Hai Cầu Tro Tàn","source":"exec-7012104f-553c-424a-96d5-511b8b57e05c.png","size":[1672,941],"routes":[[[700,0],[724,120],[679,204],[575,275],[493,341],[452,409],[504,471],[600,528],[710,609],[801,667],[805,772],[815,941]],[[1672,270],[1510,282],[1380,300],[1250,338],[1166,388],[1090,457],[1000,523],[900,600],[801,667],[805,772],[815,941]]],"pads":[[548,124],[326,345],[432,512],[631,681],[1187,169],[1040,285],[1391,414],[1050,680]],"links":[[[548,124],[596,186],[679,204]],[[326,345],[377,386],[452,409]],[[432,512],[471,510],[504,471]],[[631,681],[676,678],[738,628]],[[1187,169],[1191,233],[1250,338]],[[1040,285],[1097,343],[1166,388]],[[1391,414],[1350,400],[1250,338]],[[1050,680],[986,704],[801,667]]],"story":"Giữ hai cây cầu còn lại, ngăn quân địch hợp lưu tại trại cuối.","image":"alliance84-2.webp","canopy":true},{"name":"Trại Cháy Vòng Vây","source":"exec-30e5d494-d5ea-46d9-9731-a218c1fca6a3.png","size":[1672,941],"routes":[[[0,938],[154,857],[346,772],[452,682],[476,605],[445,515],[438,428],[491,329],[550,237],[601,158],[687,128],[829,130],[970,140],[1086,173],[1140,260],[1211,344],[1273,430],[1290,520],[1260,616],[1240,691],[1300,751],[1430,799],[1500,832]]],"pads":[[439,168],[1296,168],[578,446],[1137,445],[286,526],[1448,525],[665,661],[1027,665]],"links":[[[439,168],[488,215],[550,237]],[[1296,168],[1200,221],[1140,260]],[[578,446],[529,465],[438,428]],[[1137,445],[1206,467],[1273,430]],[[286,526],[355,543],[445,515]],[[1448,525],[1390,537],[1290,520]],[[665,661],[583,704],[452,682]],[[1027,665],[1130,712],[1240,691]]],"story":"Sở chỉ huy đã cháy. Lấy lại đường vòng và bảo vệ quân sống sót.","image":"alliance84-3.webp","canopy":true},{"name":"Ba Lỗ Thủng","source":"exec-5fb7ddb5-67e7-4a62-8f93-b4a318c06073.png","size":[1672,941],"routes":[[[89,0],[130,83],[299,146],[470,229],[623,251],[780,246],[920,267],[1030,328],[1105,402],[1154,476],[1270,551],[1370,622],[1450,686],[1500,756],[1580,860],[1672,928]],[[0,415],[180,422],[350,423],[475,473],[561,449],[709,428],[851,450],[1000,447],[1092,413],[1154,476],[1270,551],[1370,622],[1450,686],[1500,756],[1580,860],[1672,928]],[[0,841],[196,787],[365,722],[511,675],[709,669],[865,639],[971,579],[1002,526],[1000,447],[1092,413],[1154,476],[1270,551],[1370,622],[1450,686],[1500,756],[1580,860],[1672,928]]],"pads":[[550,318],[717,333],[900,354],[1188,311],[1011,460],[1280,458],[575,547],[816,535]],"links":[[[550,318],[557,297],[550,241]],[[717,333],[720,293],[717,247]],[[900,354],[909,329],[920,267]],[[1188,311],[1180,371],[1154,476]],[[1011,460],[1010,503],[1002,526]],[[1280,458],[1260,520],[1270,551]],[[575,547],[579,601],[580,673]],[[816,535],[820,591],[820,649]]],"story":"Ba lỗ thủng cùng đổ về cổng. Chọn tuyến giữ và tuyến nhường.","image":"alliance84-4.webp","canopy":true},{"name":"Vòng Siết Thành Vỡ","source":"exec-377c772c-39da-41e8-9c89-4b1009c1af12.png","size":[1672,941],"routes":[[[414,0],[520,58],[584,150],[650,197],[781,183],[960,179],[1120,212],[1234,290],[1290,385],[1262,500],[1270,600],[1251,665],[1120,710],[958,711],[775,692],[626,638],[566,548],[520,465],[445,367],[330,305],[220,248],[180,209],[175,160]],[[1672,813],[1510,741],[1390,708],[1251,665],[1120,710],[958,711],[775,692],[626,638],[566,548],[520,465],[445,367],[330,305],[220,248],[180,209],[175,160]]],"pads":[[742,113],[1021,110],[1252,200],[542,292],[452,511],[579,678],[801,775],[1094,785],[1376,528]],"links":[[[742,113],[739,157],[781,183]],[[1021,110],[997,157],[960,179]],[[1252,200],[1242,249],[1234,290]],[[542,292],[529,343],[445,367]],[[452,511],[496,549],[566,548]],[[579,678],[584,673],[626,638]],[[801,775],[814,744],[815,696]],[[1094,785],[1097,753],[1120,710]],[[1376,528],[1311,572],[1270,600]]],"story":"Hai cánh quân siết quanh thành vỡ. Mở đường vào trận cuối.","image":"alliance84-5.webp","canopy":true},{"name":"Tâm Khe Nứt","source":"exec-351302b0-714a-43fb-b8eb-5d2e3fd4ace2.png","size":[1672,941],"routes":[[[184,70],[283,154],[401,232],[505,315],[612,401],[715,477],[831,528],[838,653],[832,760],[828,941]],[[1500,70],[1386,154],[1288,232],[1187,315],[1080,400],[971,477],[831,528],[838,653],[832,760],[828,941]],[[834,162],[832,248],[831,343],[830,444],[831,528],[838,653],[832,760],[828,941]]],"pads":[[473,257],[622,390],[661,557],[1205,257],[1061,390],[1027,560]],"links":[[[473,257],[496,293],[505,315]],[[622,390],[650,433],[715,477]],[[661,557],[711,571],[831,528]],[[1205,257],[1187,295],[1187,315]],[[1061,390],[1020,439],[971,477]],[[1027,560],[970,570],[831,528]]],"story":"Chúa Tể Hư Không xuất hiện từ đài trung tâm. Giữ cổng Liên Minh đến cùng.","image":"alliance84-6.webp","canopy":true}];
  const images = new Map();
  function load(d) {
    if (images.has(d.image)) {const a=images.get(d.image);images.delete(d.image);images.set(d.image,a);return a;}
    const a={image:new Image(),loaded:false,error:false};
    a.ready=new Promise((ok,no)=>{
      a.image.onload=()=>{a.loaded=true;ok(a.image);if(Game.map?.alliance84===d)Game.renderBg();if(UI._menuMap?.alliance84===d){UI._menuBg=null;UI.paintMenu?.();}};
      a.image.onerror=()=>{a.error=true;no(new Error('Không tải được '+d.image));};
    });
    a.ready.catch(()=>{if(Game.map?.alliance84===d)UI.toast('Không tải được ảnh Chiến Tuyến Liên Minh. Hãy tải lại trang.');});
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
    const m=build.call(this,i),d=scenes[i-30];if(!d)return m;
    m.hand=false;m.alliance84=d;m.W=608;m.H=Math.round(608*d.size[1]/d.size[0]);m.sc=608/d.size[0];
    const p=([x,y])=>({x:x*m.sc,y:y*m.sc});const routes=d.routes.map(a=>a.map(p));
    m.paths=routes.map(a=>new Level.Path(pointLine(a)));m.spots=d.pads.map((a,id)=>({...p(a),id}));
    m.graph83=graphFor(routes,m.spots,d.links.map(a=>a.map(p)));m.entry=m.paths.map(()=>0);m.starts=m.paths.map(a=>({...a.points[0]}));m.exit={...m.paths[0].points.at(-1)};
    m.feat={...m.feat,rivers:[],lakes:[],props:[]};m.decor=[];m.rivers=[];m.river=null;m.pond=[];m.coded=false;m.image=null;
    m.def.spots=m.spots.length;return m;
  };
  scenes.forEach((d,j)=>{const L=CONFIG.levels[30+j];L.name=d.name;L.sub="";L.story=d.story;L.alliance84=d;L.ipaths=d.routes.map(path=>path.map(([x,y])=>[x*760/d.size[0],y*760/d.size[0]]));L.bg={...L.bg,x0:0,y0:0,x1:760,y1:480};L.route={...L.route,lanes:d.routes.length,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};});
  const render=Level.renderBackground;
  Level.renderBackground=function(m,res){if(!m.alliance84)return render.call(this,m,res);const a=load(m.alliance84),c=document.createElement('canvas');res=Math.min(2.75,Math.max(1,res||1));c.width=Math.ceil(m.W*res);c.height=Math.ceil(m.H*res);const g=c.getContext('2d');g.imageSmoothingQuality='high';if(a.loaded)g.drawImage(a.image,0,0,c.width,c.height);else{g.fillStyle='#442721';g.fillRect(0,0,c.width,c.height);g.fillStyle='#fff1c8';g.font='16px sans-serif';g.textAlign='center';g.fillText(a.error?'Không tải được map Liên Minh':'Đang tải Chiến Tuyến Liên Minh…',c.width/2,c.height/2);}return c;};
  const plot=Painter.plot;
  Painter.plot=function(g,x,y,on,t){if(!Game.map?.alliance84)return plot.apply(this,arguments);g.save();g.strokeStyle=on?'#ffe5ae':'rgba(255,231,172,.65)';g.lineWidth=on?2:1;g.beginPath();g.ellipse(x,y,15,6,0,0,Math.PI*2);g.stroke();g.fillStyle=on?'#fff5ca':'#ffe4ad';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText('+',x,y+3);g.restore();};
  const spotAt=Towers.spotAt;
  Towers.spotAt=function(x,y){if(!Game.map?.alliance84)return spotAt.call(this,x,y);let best=null;for(const s of this.spots){const d=Math.hypot(x-s.x,(y-s.y)*1.7);if(d<27&&(!best||d<best.d))best={s,d};}return best?.s||null;};
  const spawn=Enemies.spawn;
  Enemies.spawn=function(...args){const e=spawn.apply(this,args);if(Game.map?.alliance84){e.lat=Math.sign(e.lat)*1.3;e.place();}return e;};
  const move=Unit.prototype.moveTo;
  Unit.prototype.moveTo=function(gx,gy,dt){const m=Game.map;if(!m?.alliance84?.canopy)return move.call(this,gx,gy,dt);let plan=this.nav83;if(!plan||plan.map!==m||Math.hypot(plan.gx-gx,plan.gy-gy)>7){plan=this.nav83={map:m,gx,gy,path:routeBetween(m.graph83,this.x,this.y,gx,gy),i:0};}
    while(plan.i<plan.path.length&&Math.hypot(this.x-plan.path[plan.i].x,this.y-plan.path[plan.i].y)<1.5)plan.i++;
    if(plan.i>=plan.path.length){this.moving=false;return true;}const q=plan.path[plan.i];const arrived=move.call(this,q.x,q.y,dt);if(arrived)plan.i++;return plan.i>=plan.path.length;
  };
  const update=Unit.prototype.update;
  Unit.prototype.update=function(dt){const m=Game.map;if(m?.alliance84?.canopy&&this.active){const q=nearest(m.graph83,this.postX,this.postY);this.postX=q.x;this.postY=q.y;}return update.call(this,dt);};
  const heroMove=Hero.moveHero;
  Hero.moveHero=function(u,x,y){if(Game.map?.alliance84?.canopy){const q=nearest(Game.map.graph83,x,y);x=q.x;y=q.y;}return heroMove.call(this,u,x,y);};
  const posts=Units.placePosts;
  Units.placePosts=function(T){const out=posts.call(this,T);if(Game.map?.alliance84?.canopy)for(const u of this.list)if(u.tower===T){const q=nearest(Game.map.graph83,u.postX,u.postY);u.postX=q.x;u.postY=q.y;}return out;};

  // All three projectile types must leave the visually scaled tower muzzle.
  const construct=Towers.build;
  Towers.build=function(...args){const t=construct.apply(this,args);if(!t||!Game.map?.alliance84)return t;
    const muzzle=t.muzzle;t.muzzle=function(){const q=muzzle.call(this);return{x:this.x+(q.x-this.x),y:this.y+(q.y-this.y)};};
    const top=t.topY;t.topY=function(){return top.call(this);};return t;
  };
  // Direct image URLs avoid permanently caching a loading placeholder as a thumbnail.
  const regionCard=UI.regionCard;
  UI.regionCard=function(r){if(r!==5)return regionCard.call(this,r);
    this.overlay(`<div class="ribbon">Chiến Tuyến Liên Minh</div><p class="rinfo">Qua bãi cờ gãy, hai cầu, trại cháy, ba lỗ thủng và thành vỡ. Chúa Tể Hư Không chờ tại Tâm Khe Nứt.</p><div class="chapter-route">${scenes.map((d,s)=>{const i=30+s,lock=i>=Save.data.unlocked;return `<button class="chapter-card ${lock?'locked':''}" data-action="${lock?'map-locked':'level'}" data-index="${i}"><img src="${new URL(d.image,base).href}" alt="${d.name}" loading="lazy"><span><b>${s+1}. ${d.name}</b><small>${s===5?'BOSS CUỐI · ':''}${'★'.repeat(Save.data.stars[i]||0)||'Chưa hoàn thành'}</small></span></button>`;}).join('')}</div><button class="gbtn gray sm" data-action="overlay-ok">Đóng</button>`);
    document.getElementById('overlay-panel').classList.add('wide');
  };
  const levelCard=UI.levelCard;UI.levelCard=function(i){const out=levelCard.call(this,i),d=scenes[i-30];if(d){const img=document.querySelector('#overlay-panel .lvimg');if(img)img.src=new URL(d.image,base).href;}return out;};
  const result=UI.showResult;
  UI.showResult=function(r){const out=result.apply(this,arguments),d=scenes[Game.levelIndex-30];if(d)setTimeout(()=>{const rib=document.querySelector('.ribbon');if(rib)rib.insertAdjacentHTML('afterend',`<p class="levelup">${r.win?(Game.levelIndex===35?'Đã giữ cổng Liên Minh và khép Khe Nứt. Năm tộc cùng dựng lại chiến tuyến.':'Đã giữ '+d.name+'. Tiến tới '+scenes[Game.levelIndex-29].name+'.'):'Tuyến '+d.name+' đã bị xuyên thủng. Hãy đổi cách bố trí trụ và điều tướng.'}</p>`);},0);return out;};
  window.Alliance84={scenes,load,nearest,routeBetween,version:84};
})();
