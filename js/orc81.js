/* Region 4: six painted Dwarf Mountain Citadel stages. Routes and build pads are traced in image pixels.
 * The navigation graph follows painted bridges and pad stairs; units cannot cross water or cliffs. */
(function () {
  'use strict';
  const base = new URL('../assets/backgrounds/', document.currentScript.src);
  const scenes = [{"name":"Bến Đá Đỏ","size":[1672,941],"routes":[[[90,350],[200,326],[300,305],[400,333],[470,374],[550,406],[650,400],[750,400],[850,418],[950,447],[1050,470],[1150,464],[1250,473],[1320,446],[1380,384],[1410,330],[1470,293],[1514,252]]],"pads":[[409,207],[726,287],[1044,310],[1307,256],[474,520],[877,544],[1290,564]],"links":[[[409,207],[385,252],[376,299]],[[726,287],[704,330],[704,399]],[[1044,310],[1025,355],[1017,462]],[[1307,256],[1320,297],[1360,318],[1410,330]],[[474,520],[481,475],[478,440],[514,399]],[[877,544],[876,501],[885,452],[892,430]],[[1290,564],[1284,524],[1260,494],[1243,473]]],"story":"Đoàn thuyền tới bến đá đỏ, lần theo dấu cờ chiến.","image":"orc81-1.webp","canopy":true},{"name":"Khe Thác Dung Nham","size":[1672,941],"routes":[[[134,197],[250,219],[350,250],[480,260],[565,285],[611,341],[651,383],[730,411],[779,430],[870,425],[935,440],[1014,427],[1090,445],[1182,468],[1263,505],[1340,510],[1413,472],[1480,433],[1528,402]],[[136,705],[250,691],[340,657],[426,611],[530,575],[600,537],[644,491],[714,456],[779,430],[870,425],[935,440],[1014,427],[1090,445],[1182,468],[1263,505],[1340,510],[1413,472],[1480,433],[1528,402]]],"pads":[[426,143],[581,410],[518,657],[1184,246],[1243,584],[1497,493]],"links":[[[426,143],[465,189],[498,224],[499,263]],[[581,410],[621,434],[660,446],[714,456]],[[518,657],[528,618],[533,575]],[[1184,246],[1220,286],[1300,305],[1340,330],[1310,383],[1230,424],[1182,468]],[[1243,584],[1340,605],[1400,594],[1460,542],[1497,493],[1480,433]],[[1497,493],[1480,468],[1480,433]]],"story":"Vượt khe dung nham để cắt tuyến tiếp tế.","image":"orc81-2.webp","canopy":true},{"name":"Đèo Vòm Nanh","size":[1672,941],"routes":[[[240,168],[287,221],[326,278],[390,330],[434,387],[460,444],[530,490],[605,526],[700,546],[797,552],[886,548],[970,543],[1050,537],[1130,509],[1190,461],[1240,395],[1310,356],[1390,325],[1450,278],[1480,225]]],"pads":[[267,383],[570,262],[515,628],[837,410],[1110,657],[1461,482],[1274,249]],"links":[[[267,383],[329,372],[390,330]],[[570,262],[506,292],[434,330],[434,387]],[[515,628],[555,584],[570,506]],[[837,410],[825,463],[868,510],[886,548]],[[1110,657],[1090,599],[1070,538]],[[1461,482],[1391,462],[1300,440],[1240,395]],[[1274,249],[1330,283],[1380,321]]],"story":"Qua vòm đá và cầu dây tới cao nguyên.","image":"orc81-3.webp","canopy":true},{"name":"Trại Cờ Đỏ","size":[1672,941],"routes":[[[0,133],[250,168],[490,193],[603,235],[655,291],[760,325],[874,361],[1000,419],[1150,390],[1310,364],[1420,320],[1479,297]],[[0,375],[300,393],[560,395],[745,432],[870,448],[1000,419],[1150,390],[1310,364],[1420,320],[1479,297]],[[0,582],[310,626],[510,629],[655,587],[810,549],[934,488],[1000,419],[1150,390],[1310,364],[1420,320],[1479,297]]],"pads":[[478,106],[519,310],[823,233],[1217,275],[447,498],[965,611],[1293,499]],"links":[[[478,106],[477,150],[479,190]],[[519,310],[564,281],[603,259]],[[823,233],[815,277],[784,327]],[[1217,275],[1230,323],[1244,375]],[[447,498],[487,456],[512,404]],[[965,611],[950,570],[895,515]],[[1293,499],[1311,550],[1357,582],[1377,556],[1380,478],[1340,430],[1300,365]]],"story":"Ba đạo quân hội tụ tại trại cờ đỏ.","image":"orc81-4.webp","canopy":true},{"name":"Cổng Thành Nanh Chiến","size":[1672,941],"routes":[[[0,151],[260,216],[450,236],[630,277],[830,312],[1000,374],[1100,394],[1200,369],[1260,321],[1314,270],[1371,234]],[[0,548],[175,519],[380,534],[560,520],[760,531],[875,491],[962,431],[1000,374],[1100,394],[1200,369],[1260,321],[1314,270],[1371,234]]],"pads":[[429,136],[919,225],[1104,321],[394,376],[495,587],[898,597],[1353,499]],"links":[[[429,136],[428,177],[424,225]],[[919,225],[900,271],[875,319]],[[1104,321],[1110,360],[1100,394]],[[394,376],[404,421],[418,475],[445,523]],[[495,587],[517,633],[536,628],[530,588],[533,527]],[[898,597],[871,550],[875,491]],[[1353,499],[1320,459],[1280,433],[1230,405],[1200,369]]],"story":"Phá vòng vây trước Cổng Nanh Chiến.","image":"orc81-5.webp","canopy":true},{"name":"Đại Sảnh Huyết Nanh","size":[1672,941],"routes":[[[104,240],[218,273],[361,276],[522,270],[640,301],[730,350],[849,375],[960,401],[1055,444],[1130,431],[1200,410],[1260,368],[1320,316],[1360,275],[1390,240],[1445,183]],[[106,641],[214,672],[360,656],[474,625],[569,572],[711,547],[857,537],[953,497],[1055,444],[1130,431],[1200,410],[1260,368],[1320,316],[1360,275],[1390,240],[1445,183]]],"pads":[[615,203],[994,305],[459,416],[840,646],[1220,581],[1418,454]],"links":[[[615,203],[605,241],[580,276]],[[994,305],[977,348],[960,401]],[[459,416],[454,464],[440,510],[493,599]],[[840,646],[823,595],[796,544]],[[1220,581],[1200,533],[1171,480],[1130,431]],[[1418,454],[1376,422],[1320,386],[1290,343]]],"story":"Giải phong Ngai Huyết Nanh, hợp nhất năm mảnh Chuông Bình Minh.","image":"orc81-6.webp","canopy":true}];
  const images = new Map();
  function load(d) {
    if (images.has(d.image)) {const a=images.get(d.image);images.delete(d.image);images.set(d.image,a);return a;}
    const a={image:new Image(),loaded:false,error:false};
    a.ready=new Promise((ok,no)=>{
      a.image.onload=()=>{a.loaded=true;ok(a.image);if(Game.map?.orc81===d)Game.renderBg();if(UI._menuMap?.orc81===d){UI._menuBg=null;UI.paintMenu?.();}};
      a.image.onerror=()=>{a.error=true;no(new Error('Không tải được '+d.image));};
    });
    a.ready.catch(()=>{if(Game.map?.orc81===d)UI.toast('Không tải được ảnh Hoang Địa Orc. Hãy tải lại trang.');});
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
    const m=build.call(this,i),d=scenes[i-24];if(!d)return m;
    m.orc81=d;m.W=760;m.H=Math.round(760*d.size[1]/d.size[0]);m.sc=760/d.size[0];
    const p=([x,y])=>({x:x*m.sc,y:y*m.sc});const routes=d.routes.map(a=>a.map(p));
    m.paths=routes.map(a=>new Level.Path(pointLine(a)));m.spots=d.pads.map((a,id)=>({...p(a),id}));
    m.graph81=graphFor(routes,m.spots,d.links.map(a=>a.map(p)));m.entry=m.paths.map(()=>0);m.starts=m.paths.map(a=>({...a.points[0]}));m.exit={...m.paths[0].points.at(-1)};
    m.feat={...m.feat,rivers:[],lakes:[],props:[]};m.decor=[];m.rivers=[];m.river=null;m.pond=[];m.coded=false;m.image=null;
    m.def.spots=m.spots.length;return m;
  };
  scenes.forEach((d,j)=>{const L=CONFIG.levels[j+24];L.name=d.name;L.sub=d.name;L.story=d.story;L.orc81=d;L.ipaths=d.routes.map(path=>path.map(([x,y])=>[x*760/d.size[0],y*760/d.size[0]]));L.bg={...L.bg,x0:0,y0:0,x1:760,y1:480};L.route={...L.route,lanes:d.routes.length,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};});
  const render=Level.renderBackground;
  Level.renderBackground=function(m,res){if(!m.orc81)return render.call(this,m,res);const a=load(m.orc81),c=document.createElement('canvas');res=Math.min(1.5,Math.max(.7,res||1));c.width=Math.ceil(m.W*res);c.height=Math.ceil(m.H*res);const g=c.getContext('2d');g.imageSmoothingQuality='high';if(a.loaded)g.drawImage(a.image,0,0,c.width,c.height);else{g.fillStyle='#442721';g.fillRect(0,0,c.width,c.height);g.fillStyle='#fff1c8';g.font='16px sans-serif';g.textAlign='center';g.fillText(a.error?'Không tải được map Orc':'Đang tải Hoang Địa Orc…',c.width/2,c.height/2);}return c;};
  const plot=Painter.plot;
  Painter.plot=function(g,x,y,on,t){if(!Game.map?.orc81)return plot.apply(this,arguments);g.save();g.strokeStyle=on?'#ffe5ae':'rgba(255,231,172,.65)';g.lineWidth=on?2:1;g.beginPath();g.ellipse(x,y,15,6,0,0,Math.PI*2);g.stroke();g.fillStyle=on?'#fff5ca':'#ffe4ad';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText('+',x,y+3);g.restore();};
  const spotAt=Towers.spotAt;
  Towers.spotAt=function(x,y){if(!Game.map?.orc81)return spotAt.call(this,x,y);let best=null;for(const s of this.spots){const d=Math.hypot(x-s.x,(y-s.y)*1.7);if(d<27&&(!best||d<best.d))best={s,d};}return best?.s||null;};
  const spawn=Enemies.spawn;
  Enemies.spawn=function(...args){const e=spawn.apply(this,args);if(Game.map?.orc81){e.lat=Math.sign(e.lat)*1.3;e.place();}return e;};
  const move=Unit.prototype.moveTo;
  Unit.prototype.moveTo=function(gx,gy,dt){const m=Game.map;if(!m?.orc81?.canopy)return move.call(this,gx,gy,dt);let plan=this.nav81;if(!plan||plan.map!==m||Math.hypot(plan.gx-gx,plan.gy-gy)>7){plan=this.nav81={map:m,gx,gy,path:routeBetween(m.graph81,this.x,this.y,gx,gy),i:0};}
    while(plan.i<plan.path.length&&Math.hypot(this.x-plan.path[plan.i].x,this.y-plan.path[plan.i].y)<1.5)plan.i++;
    if(plan.i>=plan.path.length){this.moving=false;return true;}const q=plan.path[plan.i];const arrived=move.call(this,q.x,q.y,dt);if(arrived)plan.i++;return plan.i>=plan.path.length;
  };
  const update=Unit.prototype.update;
  Unit.prototype.update=function(dt){const m=Game.map;if(m?.orc81?.canopy&&this.active){const q=nearest(m.graph81,this.postX,this.postY);this.postX=q.x;this.postY=q.y;}return update.call(this,dt);};
  const heroMove=Hero.moveHero;
  Hero.moveHero=function(u,x,y){if(Game.map?.orc81?.canopy){const q=nearest(Game.map.graph81,x,y);x=q.x;y=q.y;}return heroMove.call(this,u,x,y);};
  const posts=Units.placePosts;
  Units.placePosts=function(T){const out=posts.call(this,T);if(Game.map?.orc81?.canopy)for(const u of this.list)if(u.tower===T){const q=nearest(Game.map.graph81,u.postX,u.postY);u.postX=q.x;u.postY=q.y;}return out;};

  // All three projectile types must leave the visually scaled tower muzzle.
  const construct=Towers.build;
  Towers.build=function(...args){const t=construct.apply(this,args);if(!t||!Game.map?.orc81)return t;
    const muzzle=t.muzzle;t.muzzle=function(){const q=muzzle.call(this);return{x:this.x+(q.x-this.x)*.70,y:this.y+(q.y-this.y)*.70};};
    const top=t.topY;t.topY=function(){return top.call(this)*.70;};return t;
  };
  // Direct image URLs avoid permanently caching a loading placeholder as a thumbnail.
  const regionCard=UI.regionCard;
  UI.regionCard=function(r){if(r!==4)return regionCard.call(this,r);
    this.overlay(`<div class="ribbon">Hoang Địa Orc</div><p class="rinfo">Qua bến đá đỏ, khe dung nham, đèo vòm nanh và trại cờ đỏ. Chặng 6 chiến đấu bên trong Đại Sảnh Huyết Nanh.</p><div class="chapter-route">${scenes.map((d,s)=>{const i=24+s,lock=i>=Save.data.unlocked;return `<button class="chapter-card ${lock?'locked':''}" data-action="${lock?'map-locked':'level'}" data-index="${i}"><img src="${new URL(d.image,base).href}" alt="${d.name}" loading="lazy"><span><b>${s+1}. ${d.name}</b><small>${s===5?'ĐẠI ĐIỆN · ':''}${'★'.repeat(Save.data.stars[i]||0)||'Chưa hoàn thành'}</small></span></button>`;}).join('')}</div><button class="gbtn gray sm" data-action="overlay-ok">Đóng</button>`);
    document.getElementById('overlay-panel').classList.add('wide');
  };
  const levelCard=UI.levelCard;UI.levelCard=function(i){const out=levelCard.call(this,i),d=scenes[i-24];if(d){const img=document.querySelector('#overlay-panel .lvimg');if(img)img.src=new URL(d.image,base).href;}return out;};
  const result=UI.showResult;
  UI.showResult=function(r){const out=result.apply(this,arguments),d=scenes[Game.levelIndex-24];if(d)setTimeout(()=>{const rib=document.querySelector('.ribbon');if(rib)rib.insertAdjacentHTML('afterend',`<p class="levelup">${r.win?(Game.levelIndex===29?'Đã giải phong Ngai Huyết Nanh. Năm mảnh Chuông Bình Minh hội tụ; năm cõi cùng giữ lại bình minh.':'Đã giữ '+d.name+'. Tiến tới '+scenes[Game.levelIndex-23].name+'.'):'Tuyến '+d.name+' đã bị xuyên thủng. Hãy đổi cách bố trí trụ và điều tướng.'}</p>`);},0);return out;};
  window.Orc81={scenes,load,nearest,routeBetween,version:81};
})();
