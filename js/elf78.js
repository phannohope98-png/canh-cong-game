/* Region 2: six painted Elf stages. Routes and build pads are traced in image pixels.
 * Tree stages use a connected navigation graph, so ground units cannot cut across canopy gaps. */
(function () {
  'use strict';
  const base = new URL('../assets/backgrounds/', document.currentScript.src);
  const scenes = [
    {name:'Bến Rừng Cổ',size:[1665,944],image:'elf78-1.webp',canopy:false,
      routes:[[[170,368],[230,330],[410,308],[540,325],[620,396],[735,403],[850,386],[970,413],[1040,451],[1110,481],[1200,500],[1300,480],[1430,456],[1550,475],[1675,535]]],
      pads:[[475,246],[452,390],[817,298],[820,470],[810,635],[1340,400],[1390,589]],
      story:'Đoàn hộ tống rời bến sông để vào Rừng Cổ Elf. Giữ đường đất và cầu đá trước khi tiến sâu vào rừng.'},
    {name:'Lối Rễ Cổ Thụ',size:[1665,945],image:'elf78-2.webp',canopy:false,
      routes:[[[0,611],[150,615],[275,571],[365,554],[455,580],[590,584],[715,539],[820,500],[970,424],[1100,405],[1220,405],[1340,414],[1450,402],[1515,350],[1490,300],[1390,272]]],
      pads:[[380,480],[430,691],[840,450],[1120,347],[1430,463],[1140,680]],
      story:'Lối mòn xuyên qua rễ cây và dòng suối. Cuối chặng, cầu thang quanh thân cổ thụ đưa đoàn lên tầng tán cây.'},
    {name:'Đường Lên Tán Cây',size:[1665,944],image:'elf78-3.webp',canopy:true,
      routes:[[[0,157],[85,215],[126,297],[196,334],[300,345],[420,380],[535,410],[660,441],[740,451],[860,458],[1010,439],[1130,453],[1200,486],[1250,548],[1360,605],[1480,635],[1590,648],[1675,647]]],
      pads:[[457,276],[381,450],[793,365],[1160,361],[1100,610],[1390,555]],
      story:'Từ đây, toàn bộ đường chiến đấu nằm trên cây. Giữ những sàn gỗ và cầu treo nối các thân cổ thụ; vực rừng nằm sâu phía dưới.'},
    {name:'Ngã Rẽ Cầu Treo',size:[1665,944],image:'elf78-4.webp',canopy:true,
      routes:[[[0,310],[180,370],[380,411],[560,430],[750,410],[850,344],[950,282],[1090,237],[1220,273],[1330,323],[1440,414],[1510,468],[1675,508]],
              [[0,310],[180,370],[380,411],[560,430],[750,410],[850,489],[980,526],[1140,551],[1300,550],[1430,506],[1510,468],[1675,508]]],
      pads:[[640,290],[645,535],[1090,172],[1280,420],[1090,630]],
      story:'Đường cầu treo chia hai nhánh quanh khe tán cây rồi hợp lại. Phân phối trụ và điều tướng giữa hai tuyến để giữ ngã rẽ.'},
    {name:'Vườn Treo Linh Mộc',size:[1668,943],image:'elf78-5.webp',canopy:true,
      routes:[[[0,342],[180,350],[365,322],[510,333],[615,399],[639,487],[710,554],[820,600],[1000,617],[1100,557],[1140,478],[1170,421],[1280,383],[1450,365],[1678,378]]],
      pads:[[490,261],[1060,290],[456,466],[760,677],[1150,681],[1360,542]],
      story:'Vườn treo ôm lấy hồ phép giữa tầng cây. Đoàn phải vượt vòng cầu cuối cùng để tới Tháp Linh Mộc phía trước.'},
    {name:'Tháp Linh Mộc',size:[1665,944],image:'elf78-6.webp',canopy:true,
      routes:[[[0,455],[170,470],[300,510],[390,519],[510,500],[660,450],[790,428],[885,448],[960,484],[1030,480],[1140,420],[1260,409],[1350,410],[1420,366]]],
      pads:[[370,436],[350,589],[736,343],[824,555],[1050,350],[1190,550]],
      story:'Cầu trên cây nối đúng cửa Tháp Linh Mộc. Giữ cửa tháp và đánh bại kẻ giữ mảnh Chuông Bình Minh để mở đường sang vùng tiếp theo.'}
  ];
  const images = new Map();
  function load(d) {
    if (images.has(d.image)) {const a=images.get(d.image);images.delete(d.image);images.set(d.image,a);return a;}
    const a={image:new Image(),loaded:false,error:false};
    a.ready=new Promise((ok,no)=>{
      a.image.onload=()=>{a.loaded=true;ok(a.image);if(Game.map?.elf78===d)Game.renderBg();if(UI._menuMap?.elf78===d){UI._menuBg=null;UI.paintMenu?.();}};
      a.image.onerror=()=>{a.error=true;no(new Error('Không tải được '+d.image));};
    });
    a.ready.catch(()=>{if(Game.map?.elf78===d)UI.toast('Không tải được ảnh rừng Elf. Hãy tải lại trang.');});
    a.image.src=new URL(d.image,base).href;images.set(d.image,a);
    while(images.size>2)images.delete(images.keys().next().value);
    return a;
  }
  function pointLine(points) {const out=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/5));for(let k=0;k<n;k++)out.push({x:a.x+(b.x-a.x)*k/n,y:a.y+(b.y-a.y)*k/n});}out.push({...points.at(-1)});return out;}
  function graphFor(routes,pads) {
    const nodes=[],edges=[],ids=new Map();
    const node=p=>{const k=Math.round(p.x*10)+','+Math.round(p.y*10);if(ids.has(k))return ids.get(k);const i=nodes.length;nodes.push({...p});ids.set(k,i);return i;};
    const edge=(a,b)=>{if(a!==b&&!edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))edges.push({a,b,length:Math.hypot(nodes[a].x-nodes[b].x,nodes[a].y-nodes[b].y)});};
    for(const route of routes)for(let i=1;i<route.length;i++)edge(node(route[i-1]),node(route[i]));
    const graph={nodes,edges};
    for(const p of pads){const q=nearest(graph,p.x,p.y),old=edges[q.edge],id=node(q);edges.splice(q.edge,1);edge(old.a,id);edge(id,old.b);edge(id,node(p));}
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
    const m=build.call(this,i),d=scenes[i-6];if(!d)return m;
    m.elf78=d;m.W=760;m.H=Math.round(760*d.size[1]/d.size[0]);m.sc=760/d.size[0];
    const p=([x,y])=>({x:x*m.sc,y:y*m.sc});const routes=d.routes.map(a=>a.map(p));
    m.paths=routes.map(a=>new Level.Path(pointLine(a)));m.spots=d.pads.map((a,id)=>({...p(a),id}));
    m.graph78=graphFor(routes,m.spots);m.entry=m.paths.map(()=>0);m.starts=m.paths.map(a=>({...a.points[0]}));m.exit={...m.paths[0].points.at(-1)};
    m.feat={...m.feat,rivers:[],lakes:[],props:[]};m.decor=[];m.rivers=[];m.river=null;m.pond=[];m.coded=false;m.image=null;
    m.def.spots=m.spots.length;return m;
  };
  scenes.forEach((d,j)=>{const L=CONFIG.levels[j+6];L.sub=d.name;L.story=d.story;L.elf78=d;L.ipaths=d.routes.map(path=>path.map(([x,y])=>[x*760/d.size[0],y*760/d.size[0]]));L.bg={...L.bg,x0:0,y0:0,x1:760,y1:480};L.route={...L.route,lanes:d.routes.length,entry:L.ipaths[0][0],exit:L.ipaths[0].at(-1)};});
  const render=Level.renderBackground;
  Level.renderBackground=function(m,res){if(!m.elf78)return render.call(this,m,res);const a=load(m.elf78),c=document.createElement('canvas');res=Math.min(1.5,Math.max(.7,res||1));c.width=Math.ceil(m.W*res);c.height=Math.ceil(m.H*res);const g=c.getContext('2d');g.imageSmoothingQuality='high';if(a.loaded)g.drawImage(a.image,0,0,c.width,c.height);else{g.fillStyle='#234c38';g.fillRect(0,0,c.width,c.height);g.fillStyle='#dfefcf';g.font='16px sans-serif';g.textAlign='center';g.fillText(a.error?'Không tải được map Elf':'Đang tải rừng Elf…',c.width/2,c.height/2);}return c;};
  const plot=Painter.plot;
  Painter.plot=function(g,x,y,on,t){if(!Game.map?.elf78)return plot.apply(this,arguments);g.save();g.strokeStyle=on?'#ffe4a1':'rgba(244,241,185,.65)';g.lineWidth=on?2:1;g.beginPath();g.ellipse(x,y,15,6,0,0,Math.PI*2);g.stroke();g.fillStyle=on?'#fff5ca':'#ead6a1';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText('+',x,y+3);g.restore();};
  const tower=Painter.tower;
  Painter.tower=function(g,type,tier,x,y,...args){if(!Game.map?.elf78)return tower.call(this,g,type,tier,x,y,...args);g.save();g.translate(x,y);g.scale(.68,.68);g.translate(-x,-y);try{return tower.call(this,g,type,tier,x,y,...args);}finally{g.restore();}};
  const spotAt=Towers.spotAt;
  Towers.spotAt=function(x,y){if(!Game.map?.elf78)return spotAt.call(this,x,y);let best=null;for(const s of this.spots){const d=Math.hypot(x-s.x,(y-s.y)*1.7);if(d<27&&(!best||d<best.d))best={s,d};}return best?.s||null;};
  const spawn=Enemies.spawn;
  Enemies.spawn=function(...args){const e=spawn.apply(this,args);if(Game.map?.elf78){e.lat=Math.sign(e.lat)*1.8;e.place();}return e;};
  const move=Unit.prototype.moveTo;
  Unit.prototype.moveTo=function(gx,gy,dt){const m=Game.map;if(!m?.elf78?.canopy)return move.call(this,gx,gy,dt);let plan=this.nav78;if(!plan||plan.map!==m||Math.hypot(plan.gx-gx,plan.gy-gy)>7){plan=this.nav78={map:m,gx,gy,path:routeBetween(m.graph78,this.x,this.y,gx,gy),i:0};}
    while(plan.i<plan.path.length&&Math.hypot(this.x-plan.path[plan.i].x,this.y-plan.path[plan.i].y)<1.5)plan.i++;
    if(plan.i>=plan.path.length){this.moving=false;return true;}const q=plan.path[plan.i];const arrived=move.call(this,q.x,q.y,dt);if(arrived)plan.i++;return plan.i>=plan.path.length;
  };
  const update=Unit.prototype.update;
  Unit.prototype.update=function(dt){const m=Game.map;if(m?.elf78?.canopy&&this.active){const q=nearest(m.graph78,this.postX,this.postY);this.postX=q.x;this.postY=q.y;}return update.call(this,dt);};
  const heroMove=Hero.moveHero;
  Hero.moveHero=function(u,x,y){if(Game.map?.elf78?.canopy){const q=nearest(Game.map.graph78,x,y);x=q.x;y=q.y;}return heroMove.call(this,u,x,y);};
  const posts=Units.placePosts;
  Units.placePosts=function(T){const out=posts.call(this,T);if(Game.map?.elf78?.canopy)for(const u of this.list)if(u.tower===T){const q=nearest(Game.map.graph78,u.postX,u.postY);u.postX=q.x;u.postY=q.y;}return out;};
  const result=UI.showResult;
  UI.showResult=function(r){const out=result.apply(this,arguments),d=scenes[Game.levelIndex-6];if(d)setTimeout(()=>{const rib=document.querySelector('.ribbon');if(rib)rib.insertAdjacentHTML('afterend',`<p class="levelup">${r.win?(Game.levelIndex===11?'Đã giữ Tháp Linh Mộc. Đoàn tiếp tục sang vùng kế tiếp.':'Đã giữ '+d.name+'. Tiến tới '+scenes[Game.levelIndex-5].name+'.'):'Tuyến '+d.name+' đã bị xuyên thủng. Hãy đổi cách bố trí trụ và điều tướng.'}</p>`);},0);return out;};
  window.Elf78={scenes,load,nearest,routeBetween,version:78};
})();
