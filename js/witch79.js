/* Region 3: six painted Witch Realm stages. Routes and build pads are traced in image pixels.
 * The navigation graph follows painted bridges and pad stairs; units cannot cross water or cliffs. */
(function () {
  'use strict';
  const base = new URL('../assets/backgrounds/', document.currentScript.src);
  const scenes = [{"name":"Bờ Biển Pha Lê","size":[1672,941],"image":"witch79-1.webp","canopy":true,"routes":[[[0,462],[125,449],[220,371],[330,343],[440,344],[550,405],[620,449],[740,448],[850,468],[960,483],[1040,482],[1160,474],[1240,520],[1330,487],[1420,389],[1500,405],[1580,428],[1672,426]]],"pads":[[368,249],[683,348],[1067,369],[1438,317],[414,554],[895,646],[1309,618]],"links":[[[368,249],[375,290],[392,340]],[[683,348],[649,391],[636,448]],[[1067,369],[1055,412],[1050,481]],[[1438,317],[1430,358],[1420,389]],[[414,554],[460,515],[520,439]],[[895,646],[945,594],[959,553],[967,486]],[[1309,618],[1287,568],[1270,515]]],"story":"Rời Chính Điện Trăng, đoàn hộ tống cập bờ Cõi Phù Thủy. Giữ cây cầu pha lê giữa hai đảo để vượt cửa biển."},{"name":"Bậc Thác Ngân Lam","size":[1672,941],"image":"witch79-2.webp","canopy":true,"routes":[[[0,667],[120,651],[215,605],[335,566],[460,564],[520,523],[568,428],[630,363],[709,329],[779,331],[839,365],[901,385],[969,405],[1030,434],[1128,438],[1214,410],[1295,418],[1394,452],[1484,490],[1543,468],[1618,456]]],"pads":[[329,458],[664,644],[731,218],[1024,546],[1376,345],[1329,599]],"links":[[[329,458],[356,501],[355,565]],[[664,644],[623,596],[580,561],[551,505]],[[731,218],[749,269],[771,329]],[[1024,546],[1044,500],[1078,438]],[[1376,345],[1361,388],[1360,440]],[[1329,599],[1373,559],[1410,506],[1440,474]]],"story":"Theo dòng Ngân Lam qua các bậc thác. Cổng Trăng ở cuối cầu mở lối vào khu rừng quanh cung điện."},{"name":"Ngã Rẽ Rừng Trăng","size":[1672,941],"image":"witch79-3.webp","canopy":true,"routes":[[[0,237],[180,240],[330,226],[450,236],[540,268],[635,311],[730,332],[820,350],[900,380],[960,430],[1040,480],[1130,484],[1250,454],[1360,438],[1450,441],[1530,469],[1672,495]],[[0,665],[180,668],[290,640],[400,594],[500,579],[610,593],[720,591],[820,559],[900,550],[960,522],[1040,480],[1130,484],[1250,454],[1360,438],[1450,441],[1530,469],[1672,495]]],"pads":[[434,150],[1050,250],[1433,328],[770,470],[564,688],[1255,625]],"links":[[[434,150],[428,193],[423,230]],[[1050,250],[1041,291],[1020,331],[968,412]],[[1433,328],[1424,376],[1420,441]],[[770,470],[805,496],[828,538],[839,555]],[[564,688],[560,642],[555,583]],[[1255,625],[1208,573],[1145,530],[1142,482]]],"story":"Hai lối trong Rừng Trăng hội tụ tại cầu Đông. Chia trụ giữ từng nhánh và điều tướng tới nơi áp lực cao trước khi đoàn tới Đài Thiên Văn."},{"name":"Cầu Đài Thiên Văn","size":[1672,941],"image":"witch79-4.webp","canopy":true,"routes":[[[80,0],[125,54],[190,106],[278,158],[299,218],[289,294],[297,351],[350,397],[398,461],[418,518],[476,558],[572,584],[687,606],[790,597],[865,597],[960,616],[1068,610],[1173,591],[1263,561],[1320,503],[1342,443],[1402,390],[1420,332],[1410,256],[1402,197],[1435,137],[1500,89],[1565,41],[1590,0]]],"pads":[[442,272],[259,485],[561,681],[1160,473],[1449,550],[1293,272]],"links":[[[442,272],[387,273],[296,274]],[[259,485],[290,443],[321,404]],[[561,681],[574,634],[581,588]],[[1160,473],[1159,525],[1153,594]],[[1449,550],[1400,512],[1354,470]],[[1293,272],[1360,273],[1412,274]]],"story":"Cầu vòng ôm Đài Thiên Văn dẫn tới cung điện. Giữ hai bờ cầu, vượt vùng thác và ngăn địch chặn đường hộ tống."},{"name":"Sân Cung Trăng Khuyết","size":[1672,941],"image":"witch79-5.webp","canopy":true,"routes":[[[0,199],[150,228],[260,290],[350,315],[475,320],[590,345],[660,396],[710,447],[780,475],[875,495],[960,474],[1010,464],[1110,400],[1170,345],[1240,325],[1305,308],[1336,270]],[[0,652],[140,683],[265,709],[390,721],[510,701],[607,638],[706,594],[797,566],[895,566],[970,530],[1010,464],[1110,400],[1170,345],[1240,325],[1305,308],[1336,270]]],"pads":[[543,200],[341,445],[715,757],[882,451],[1022,304],[1152,669]],"links":[[[543,200],[519,246],[491,322]],[[341,445],[370,396],[400,320]],[[715,757],[663,712],[642,666],[610,637]],[[882,451],[878,499],[876,566]],[[1022,304],[1067,354],[1090,412]],[[1152,669],[1085,632],[1017,580],[988,548]]],"story":"Đoàn vượt hai cổng vườn để tới Cung Trăng Khuyết. Giữ sân trước khi bước qua cửa phép vào chính điện, nơi mảnh Chuông Bình Minh đang bị phong ấn."},{"name":"Chính Điện Cõi Phù Thủy","size":[1672,941],"image":"witch79-6.webp","canopy":true,"routes":[[[0,253],[120,277],[200,330],[295,364],[420,375],[555,384],[645,424],[705,478],[790,500],[879,489],[1000,448],[1115,424],[1201,394],[1230,348],[1309,293]],[[0,897],[95,832],[212,751],[320,684],[431,646],[548,612],[640,597],[721,574],[790,528],[879,489],[1000,448],[1115,424],[1201,394],[1230,348],[1309,293]]],"pads":[[566,263],[911,319],[345,481],[1313,527],[1075,648],[682,746]],"links":[[[566,263],[548,307],[520,380]],[[911,319],[949,365],[975,425]],[[345,481],[401,436],[435,377]],[[1313,527],[1273,485],[1220,416]],[[1075,648],[1020,597],[948,539]],[[682,746],[612,699],[552,643],[530,618]]],"story":"Trong chính điện, Ngai Trăng giữ mảnh Chuông Bình Minh của Phù Thủy. Bảo vệ hai cửa sảnh, đánh bại kẻ giữ ấn và giải phong lõi phép để tiếp tục hành trình sang lãnh địa Người Lùn."}];
  const images = new Map();
  function load(d) {
    if (images.has(d.image)) {const a=images.get(d.image);images.delete(d.image);images.set(d.image,a);return a;}
    const a={image:new Image(),loaded:false,error:false};
    a.ready=new Promise((ok,no)=>{
      a.image.onload=()=>{a.loaded=true;ok(a.image);if(Game.map?.witch79===d)Game.renderBg();if(UI._menuMap?.witch79===d){UI._menuBg=null;UI.paintMenu?.();}};
      a.image.onerror=()=>{a.error=true;no(new Error('Không tải được '+d.image));};
    });
    a.ready.catch(()=>{if(Game.map?.witch79===d)UI.toast('Không tải được ảnh Cõi Phù Thủy. Hãy tải lại trang.');});
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
    const m=build.call(this,i),d=scenes[i-12];if(!d)return m;
    m.witch79=d;m.W=760;m.H=Math.round(760*d.size[1]/d.size[0]);m.sc=760/d.size[0];
    const p=([x,y])=>({x:x*m.sc,y:y*m.sc});const routes=d.routes.map(a=>a.map(p));
    m.paths=routes.map(a=>new Level.Path(pointLine(a)));m.spots=d.pads.map((a,id)=>({...p(a),id}));
    m.graph79=graphFor(routes,m.spots,d.links.map(a=>a.map(p)));m.entry=m.paths.map(()=>0);m.starts=m.paths.map(a=>({...a.points[0]}));m.exit={...m.paths[0].points.at(-1)};
    m.feat={...m.feat,rivers:[],lakes:[],props:[]};m.decor=[];m.rivers=[];m.river=null;m.pond=[];m.coded=false;m.image=null;
    m.def.spots=m.spots.length;return m;
  };
  scenes.forEach((d,j)=>{const L=CONFIG.levels[j+12];L.name=d.name;L.sub=d.name;L.story=d.story;L.witch79=d;L.ipaths=d.routes.map(path=>path.map(([x,y])=>[x*760/d.size[0],y*760/d.size[0]]));L.bg={...L.bg,x0:0,y0:0,x1:760,y1:480};L.route={...L.route,lanes:d.routes.length,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};});
  const render=Level.renderBackground;
  Level.renderBackground=function(m,res){if(!m.witch79)return render.call(this,m,res);const a=load(m.witch79),c=document.createElement('canvas');res=Math.min(1.5,Math.max(.7,res||1));c.width=Math.ceil(m.W*res);c.height=Math.ceil(m.H*res);const g=c.getContext('2d');g.imageSmoothingQuality='high';if(a.loaded)g.drawImage(a.image,0,0,c.width,c.height);else{g.fillStyle='#302044';g.fillRect(0,0,c.width,c.height);g.fillStyle='#ecd8ff';g.font='16px sans-serif';g.textAlign='center';g.fillText(a.error?'Không tải được map Phù Thủy':'Đang tải Cõi Phù Thủy…',c.width/2,c.height/2);}return c;};
  const plot=Painter.plot;
  Painter.plot=function(g,x,y,on,t){if(!Game.map?.witch79)return plot.apply(this,arguments);g.save();g.strokeStyle=on?'#ffe5ae':'rgba(230,209,255,.65)';g.lineWidth=on?2:1;g.beginPath();g.ellipse(x,y,15,6,0,0,Math.PI*2);g.stroke();g.fillStyle=on?'#fff5ca':'#dac4f2';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText('+',x,y+3);g.restore();};
  const spotAt=Towers.spotAt;
  Towers.spotAt=function(x,y){if(!Game.map?.witch79)return spotAt.call(this,x,y);let best=null;for(const s of this.spots){const d=Math.hypot(x-s.x,(y-s.y)*1.7);if(d<27&&(!best||d<best.d))best={s,d};}return best?.s||null;};
  const spawn=Enemies.spawn;
  Enemies.spawn=function(...args){const e=spawn.apply(this,args);if(Game.map?.witch79){e.lat=Math.sign(e.lat)*1.3;e.place();}return e;};
  const move=Unit.prototype.moveTo;
  Unit.prototype.moveTo=function(gx,gy,dt){const m=Game.map;if(!m?.witch79?.canopy)return move.call(this,gx,gy,dt);let plan=this.nav79;if(!plan||plan.map!==m||Math.hypot(plan.gx-gx,plan.gy-gy)>7){plan=this.nav79={map:m,gx,gy,path:routeBetween(m.graph79,this.x,this.y,gx,gy),i:0};}
    while(plan.i<plan.path.length&&Math.hypot(this.x-plan.path[plan.i].x,this.y-plan.path[plan.i].y)<1.5)plan.i++;
    if(plan.i>=plan.path.length){this.moving=false;return true;}const q=plan.path[plan.i];const arrived=move.call(this,q.x,q.y,dt);if(arrived)plan.i++;return plan.i>=plan.path.length;
  };
  const update=Unit.prototype.update;
  Unit.prototype.update=function(dt){const m=Game.map;if(m?.witch79?.canopy&&this.active){const q=nearest(m.graph79,this.postX,this.postY);this.postX=q.x;this.postY=q.y;}return update.call(this,dt);};
  const heroMove=Hero.moveHero;
  Hero.moveHero=function(u,x,y){if(Game.map?.witch79?.canopy){const q=nearest(Game.map.graph79,x,y);x=q.x;y=q.y;}return heroMove.call(this,u,x,y);};
  const posts=Units.placePosts;
  Units.placePosts=function(T){const out=posts.call(this,T);if(Game.map?.witch79?.canopy)for(const u of this.list)if(u.tower===T){const q=nearest(Game.map.graph79,u.postX,u.postY);u.postX=q.x;u.postY=q.y;}return out;};

  // All three projectile types must leave the visually scaled tower muzzle.
  const construct=Towers.build;
  Towers.build=function(...args){const t=construct.apply(this,args);if(!t||!Game.map?.witch79)return t;
    const muzzle=t.muzzle;t.muzzle=function(){const q=muzzle.call(this);return{x:this.x+(q.x-this.x)*.70,y:this.y+(q.y-this.y)*.70};};
    const top=t.topY;t.topY=function(){return top.call(this)*.70;};return t;
  };
  // Direct image URLs avoid permanently caching a loading placeholder as a thumbnail.
  const regionCard=UI.regionCard;
  UI.regionCard=function(r){if(r!==2)return regionCard.call(this,r);
    this.overlay(`<div class="ribbon">Cõi Phù Thủy</div><p class="rinfo">Qua bờ pha lê, rừng trăng và cung điện. Chặng 6 chiến đấu bên trong chính điện.</p><div class="chapter-route">${scenes.map((d,s)=>{const i=12+s,lock=i>=Save.data.unlocked;return `<button class="chapter-card ${lock?'locked':''}" data-action="${lock?'map-locked':'level'}" data-index="${i}"><img src="${new URL(d.image,base).href}" alt="${d.name}" loading="lazy"><span><b>${s+1}. ${d.name}</b><small>${s===5?'CHÍNH ĐIỆN · ':''}${'★'.repeat(Save.data.stars[i]||0)||'Chưa hoàn thành'}</small></span></button>`;}).join('')}</div><button class="gbtn gray sm" data-action="overlay-ok">Đóng</button>`);
    document.getElementById('overlay-panel').classList.add('wide');
  };
  const levelCard=UI.levelCard;UI.levelCard=function(i){const out=levelCard.call(this,i),d=scenes[i-12];if(d){const img=document.querySelector('#overlay-panel .lvimg');if(img)img.src=new URL(d.image,base).href;}return out;};
  const result=UI.showResult;
  UI.showResult=function(r){const out=result.apply(this,arguments),d=scenes[Game.levelIndex-12];if(d)setTimeout(()=>{const rib=document.querySelector('.ribbon');if(rib)rib.insertAdjacentHTML('afterend',`<p class="levelup">${r.win?(Game.levelIndex===17?'Đã giải phong Ngai Trăng. Đoàn tiếp tục sang lãnh địa Người Lùn.':'Đã giữ '+d.name+'. Tiến tới '+scenes[Game.levelIndex-11].name+'.'):'Tuyến '+d.name+' đã bị xuyên thủng. Hãy đổi cách bố trí trụ và điều tướng.'}</p>`);},0);return out;};
  window.Witch79={scenes,load,nearest,routeBetween,version:79};
})();
