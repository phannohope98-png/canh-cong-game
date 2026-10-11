/* Human coastal kingdom: six painted stages. Routes and build pads are traced in image pixels.
 * The navigation graph follows painted bridges and pad stairs; units cannot cross water or cliffs. */
(function () {
  'use strict';
  const base = new URL('../assets/backgrounds/', document.currentScript.src);
  const scenes = [{"name":"Cảng Biên Giới","source":"exec-c8c9c5fa-0a5f-4399-a0f8-3c2f941bca83.png","size":[1672,941],"routes":[[[258,460],[380,435],[520,410],[660,398],[800,419],[940,473],[1070,490],[1180,482],[1300,444],[1420,457],[1500,453],[1552,390]]],"pads":[[494,349],[759,324],[1071,390],[607,493],[875,530],[1115,585],[1361,540]],"links":[[[494,349],[490,384],[490,414]],[[759,324],[759,360],[754,407]],[[1071,390],[1040,431],[1023,484]],[[607,493],[615,461],[615,415]],[[875,530],[881,486],[878,455]],[[1115,585],[1120,542],[1100,490]],[[1361,540],[1344,499],[1330,447]]],"image":"human83-1.webp","canopy":true,"story":"Giữ bến cảng trước đoàn thuyền yêu tinh."},{"name":"Làng Lúa Vàng","source":"exec-11fc2cbe-7666-4b06-9dc3-da13bf780f7c.png","size":[1672,941],"routes":[[[168,135],[274,217],[440,263],[580,315],[695,370],[786,426],[866,424],[1000,449],[1170,453],[1310,478],[1440,523],[1529,519]],[[123,825],[236,728],[400,687],[535,695],[636,648],[680,577],[738,510],[786,426],[866,424],[1000,449],[1170,453],[1310,478],[1440,523],[1529,519]]],"pads":[[427,175],[642,270],[1025,362],[495,602],[815,572],[396,744],[1135,534]],"links":[[[427,175],[405,213],[390,252]],[[642,270],[632,306],[626,338]],[[1025,362],[1008,397],[990,446]],[[495,602],[480,641],[470,691]],[[815,572],[777,538],[750,520]],[[396,744],[370,723],[355,694]],[[1135,534],[1124,497],[1120,451]]],"image":"human83-2.webp","canopy":true,"story":"Bảo vệ đường làng và mùa lúa bên suối."},{"name":"Cầu Đá Bắc","source":"exec-930b84b3-6fe0-472d-bd43-c2571ec5c2a2.png","size":[1672,941],"routes":[[[0,275],[133,351],[271,398],[405,406],[545,383],[665,370],[751,397],[870,445],[992,472],[1130,485],[1270,487],[1380,480],[1440,455],[1495,409],[1540,360]]],"pads":[[342,322],[542,262],[333,518],[1279,344],[1385,423],[1179,583],[1405,628]],"links":[[[342,322],[359,364],[365,404]],[[542,262],[568,305],[593,344],[625,367]],[[333,518],[353,470],[357,408]],[[1279,344],[1254,389],[1245,437],[1250,484]],[[1385,423],[1420,452],[1440,455]],[[1179,583],[1172,540],[1164,487]],[[1405,628],[1360,605],[1290,576],[1280,537],[1270,487]]],"image":"human83-3.webp","canopy":true,"story":"Giữ cây cầu đá bắc qua cửa sông."},{"name":"Phố Canh Gác","source":"exec-fb06acd9-724e-48a9-b258-a331cd83858f.png","size":[1672,941],"routes":[[[74,68],[170,128],[275,231],[460,276],[643,290],[779,357],[912,416],[1055,479],[1210,500],[1380,539],[1515,545]],[[0,414],[153,461],[286,505],[441,538],[648,546],[815,527],[975,505],[1055,479],[1210,500],[1380,539],[1515,545]],[[0,770],[143,720],[342,698],[506,712],[732,699],[868,646],[990,587],[1055,479],[1210,500],[1380,539],[1515,545]]],"pads":[[411,157],[883,259],[340,425],[793,449],[1030,690],[667,738]],"links":[[[411,157],[421,198],[425,248],[446,276]],[[883,259],[860,306],[833,347],[813,374]],[[340,425],[309,473],[282,505]],[[793,449],[832,485],[848,520]],[[1030,690],[962,679],[912,651],[935,619]],[[667,738],[655,707],[650,701]]],"image":"human83-4.webp","canopy":true,"story":"Ba ngả phố hợp lưu trước khu canh gác."},{"name":"Đường Tới Vương Thành","source":"exec-6916e7dd-bfaa-4396-80cd-b36a5ddce102.png","size":[1672,941],"routes":[[[138,160],[263,204],[361,265],[462,294],[607,350],[702,414],[790,457],[930,453],[1070,468],[1184,417],[1260,365],[1320,297],[1394,224]],[[145,569],[305,559],[440,578],[535,569],[650,552],[746,498],[790,457],[930,453],[1070,468],[1184,417],[1260,365],[1320,297],[1394,224]]],"pads":[[576,227],[768,316],[1037,359],[585,468],[917,535],[1338,463]],"links":[[[576,227],[551,271],[533,320]],[[768,316],[740,351],[732,400]],[[1037,359],[1074,392],[1098,452]],[[585,468],[577,507],[571,564]],[[917,535],[930,487],[933,454]],[[1338,463],[1269,433],[1240,400],[1230,385]]],"image":"human83-5.webp","canopy":true,"story":"Đưa đoàn hộ tống qua sân ngoài Vương Thành."},{"name":"Đại Điện Bình Minh","source":"exec-abba639b-6e8b-4ef4-a25f-a8db4d1057f5.png","size":[1672,941],"routes":[[[0,147],[150,203],[325,263],[492,330],[640,374],[800,425],[963,458],[1055,488],[1170,419],[1254,370],[1344,291],[1390,218],[1460,172]],[[0,504],[134,561],[284,638],[404,657],[535,633],[664,601],[855,551],[977,510],[1055,488],[1170,419],[1254,370],[1344,291],[1390,218],[1460,172]]],"pads":[[615,253],[915,309],[1398,463],[744,727],[1001,661]],"links":[[[615,253],[600,303],[566,350]],[[915,309],[897,362],[865,417]],[[1398,463],[1342,436],[1290,406],[1254,370]],[[744,727],[754,668],[777,610],[807,565]],[[1001,661],[1030,711],[1010,760],[959,754],[937,695],[930,614],[908,540]]],"image":"human83-6.webp","canopy":true,"story":"Giữ Đại Điện Bình Minh, thức tỉnh mảnh Chuông đầu tiên."}];
  const images = new Map();
  function load(d) {
    if (images.has(d.image)) {const a=images.get(d.image);images.delete(d.image);images.set(d.image,a);return a;}
    const a={image:new Image(),loaded:false,error:false};
    a.ready=new Promise((ok,no)=>{
      a.image.onload=()=>{a.loaded=true;ok(a.image);if(Game.map?.human83===d)Game.renderBg();if(UI._menuMap?.human83===d){UI._menuBg=null;UI.paintMenu?.();}};
      a.image.onerror=()=>{a.error=true;no(new Error('Không tải được '+d.image));};
    });
    a.ready.catch(()=>{if(Game.map?.human83===d)UI.toast('Không tải được ảnh Vương Quốc Người. Hãy tải lại trang.');});
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
    const m=build.call(this,i),d=scenes[i];if(!d)return m;
    m.hand=false;m.human83=d;m.W=608;m.H=Math.round(608*d.size[1]/d.size[0]);m.sc=608/d.size[0];
    const p=([x,y])=>({x:x*m.sc,y:y*m.sc});const routes=d.routes.map(a=>a.map(p));
    m.paths=routes.map(a=>new Level.Path(pointLine(a)));m.spots=d.pads.map((a,id)=>({...p(a),id}));
    m.graph83=graphFor(routes,m.spots,d.links.map(a=>a.map(p)));m.entry=m.paths.map(()=>0);m.starts=m.paths.map(a=>({...a.points[0]}));m.exit={...m.paths[0].points.at(-1)};
    m.feat={...m.feat,rivers:[],lakes:[],props:[]};m.decor=[];m.rivers=[];m.river=null;m.pond=[];m.coded=false;m.image=null;
    m.def.spots=m.spots.length;return m;
  };
  scenes.forEach((d,j)=>{const L=CONFIG.levels[j];L.name=d.name;L.sub="";L.story=d.story;L.human83=d;L.ipaths=d.routes.map(path=>path.map(([x,y])=>[x*760/d.size[0],y*760/d.size[0]]));L.bg={...L.bg,x0:0,y0:0,x1:760,y1:480};L.route={...L.route,lanes:d.routes.length,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};});
  const render=Level.renderBackground;
  Level.renderBackground=function(m,res){if(!m.human83)return render.call(this,m,res);const a=load(m.human83),c=document.createElement('canvas');res=Math.min(2.25,Math.max(1,res||1));c.width=Math.ceil(m.W*res);c.height=Math.ceil(m.H*res);const g=c.getContext('2d');g.imageSmoothingQuality='high';if(a.loaded)g.drawImage(a.image,0,0,c.width,c.height);else{g.fillStyle='#442721';g.fillRect(0,0,c.width,c.height);g.fillStyle='#fff1c8';g.font='16px sans-serif';g.textAlign='center';g.fillText(a.error?'Không tải được map Người':'Đang tải Vương Quốc Người…',c.width/2,c.height/2);}return c;};
  const plot=Painter.plot;
  Painter.plot=function(g,x,y,on,t){if(!Game.map?.human83)return plot.apply(this,arguments);g.save();g.strokeStyle=on?'#ffe5ae':'rgba(255,231,172,.65)';g.lineWidth=on?2:1;g.beginPath();g.ellipse(x,y,15,6,0,0,Math.PI*2);g.stroke();g.fillStyle=on?'#fff5ca':'#ffe4ad';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText('+',x,y+3);g.restore();};
  const spotAt=Towers.spotAt;
  Towers.spotAt=function(x,y){if(!Game.map?.human83)return spotAt.call(this,x,y);let best=null;for(const s of this.spots){const d=Math.hypot(x-s.x,(y-s.y)*1.7);if(d<27&&(!best||d<best.d))best={s,d};}return best?.s||null;};
  const spawn=Enemies.spawn;
  Enemies.spawn=function(...args){const e=spawn.apply(this,args);if(Game.map?.human83){e.lat=Math.sign(e.lat)*1.3;e.place();}return e;};
  const move=Unit.prototype.moveTo;
  Unit.prototype.moveTo=function(gx,gy,dt){const m=Game.map;if(!m?.human83?.canopy)return move.call(this,gx,gy,dt);let plan=this.nav83;if(!plan||plan.map!==m||Math.hypot(plan.gx-gx,plan.gy-gy)>7){plan=this.nav83={map:m,gx,gy,path:routeBetween(m.graph83,this.x,this.y,gx,gy),i:0};}
    while(plan.i<plan.path.length&&Math.hypot(this.x-plan.path[plan.i].x,this.y-plan.path[plan.i].y)<1.5)plan.i++;
    if(plan.i>=plan.path.length){this.moving=false;return true;}const q=plan.path[plan.i];const arrived=move.call(this,q.x,q.y,dt);if(arrived)plan.i++;return plan.i>=plan.path.length;
  };
  const update=Unit.prototype.update;
  Unit.prototype.update=function(dt){const m=Game.map;if(m?.human83?.canopy&&this.active){const q=nearest(m.graph83,this.postX,this.postY);this.postX=q.x;this.postY=q.y;}return update.call(this,dt);};
  const heroMove=Hero.moveHero;
  Hero.moveHero=function(u,x,y){if(Game.map?.human83?.canopy){const q=nearest(Game.map.graph83,x,y);x=q.x;y=q.y;}return heroMove.call(this,u,x,y);};
  const posts=Units.placePosts;
  Units.placePosts=function(T){const out=posts.call(this,T);if(Game.map?.human83?.canopy)for(const u of this.list)if(u.tower===T){const q=nearest(Game.map.graph83,u.postX,u.postY);u.postX=q.x;u.postY=q.y;}return out;};

  // All three projectile types must leave the visually scaled tower muzzle.
  const construct=Towers.build;
  Towers.build=function(...args){const t=construct.apply(this,args);if(!t||!Game.map?.human83)return t;
    const muzzle=t.muzzle;t.muzzle=function(){const q=muzzle.call(this);return{x:this.x+(q.x-this.x),y:this.y+(q.y-this.y)};};
    const top=t.topY;t.topY=function(){return top.call(this);};return t;
  };
  // Direct image URLs avoid permanently caching a loading placeholder as a thumbnail.
  const regionCard=UI.regionCard;
  UI.regionCard=function(r){if(r!==0)return regionCard.call(this,r);
    this.overlay(`<div class="ribbon">Vương Quốc Người</div><p class="rinfo">Qua cảng, làng lúa, cầu đá và phố canh gác. Chặng cuối bên trong Đại Điện Bình Minh.</p><div class="chapter-route">${scenes.map((d,s)=>{const i=s,lock=i>=Save.data.unlocked;return `<button class="chapter-card ${lock?'locked':''}" data-action="${lock?'map-locked':'level'}" data-index="${i}"><img src="${new URL(d.image,base).href}" alt="${d.name}" loading="lazy"><span><b>${s+1}. ${d.name}</b><small>${s===5?'ĐẠI ĐIỆN · ':''}${'★'.repeat(Save.data.stars[i]||0)||'Chưa hoàn thành'}</small></span></button>`;}).join('')}</div><button class="gbtn gray sm" data-action="overlay-ok">Đóng</button>`);
    document.getElementById('overlay-panel').classList.add('wide');
  };
  const levelCard=UI.levelCard;UI.levelCard=function(i){const out=levelCard.call(this,i),d=scenes[i];if(d){const img=document.querySelector('#overlay-panel .lvimg');if(img)img.src=new URL(d.image,base).href;}return out;};
  const result=UI.showResult;
  UI.showResult=function(r){const out=result.apply(this,arguments),d=scenes[Game.levelIndex];if(d)setTimeout(()=>{const rib=document.querySelector('.ribbon');if(rib)rib.insertAdjacentHTML('afterend',`<p class="levelup">${r.win?(Game.levelIndex===5?'Đã giữ Đại Điện Bình Minh. Đoàn tiếp tục sang Rừng Cổ Elf.':'Đã giữ '+d.name+'. Tiến tới '+scenes[Game.levelIndex+1].name+'.'):'Tuyến '+d.name+' đã bị xuyên thủng. Hãy đổi cách bố trí trụ và điều tướng.'}</p>`);},0);return out;};
  window.Human83={scenes,load,nearest,routeBetween,version:83};
})();
