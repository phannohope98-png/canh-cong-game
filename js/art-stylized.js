/* Authored 2D character art. All poses are drawn with paths; no mesh renders,
   reference-image billboards or external character artwork are used. */
(function(){
  'use strict';
  const TAU=Math.PI*2, originals=Object.fromEntries(Object.entries(ArtChars).filter(([,d])=>d&&d.draw).map(([k,d])=>[k,{...d}]));
  const ink='#352c36';
  function tint(c,k){const n=parseInt(c.slice(1),16),a=[n>>16,(n>>8)&255,n&255];return '#'+a.map(v=>Math.round(k>0?v+(255-v)*k:v*(1+k)).toString(16).padStart(2,'0')).join('');}
  function fill(g,path,c,lo=-.28,hi=.26){
    let xs=[],ys=[];const record=(name,args)=>{if(name==='ellipse'){xs.push(args[0]-args[2],args[0]+args[2]);ys.push(args[1]-args[3],args[1]+args[3]);}else for(let i=0;i<args.length;i+=2){xs.push(args[i]);ys.push(args[i+1]);}g[name](...args);};
    const pen={moveTo:(...a)=>record('moveTo',a),lineTo:(...a)=>record('lineTo',a),quadraticCurveTo:(...a)=>record('quadraticCurveTo',a),bezierCurveTo:(...a)=>record('bezierCurveTo',a),ellipse:(...a)=>record('ellipse',a)};
    g.beginPath();path(pen);g.closePath();const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),gr=g.createLinearGradient(minX,minY,maxX,maxY);gr.addColorStop(0,tint(c,hi));gr.addColorStop(.42,c);gr.addColorStop(1,tint(c,lo));g.fillStyle=gr;g.fill();if(ArtStylized.ink){g.strokeStyle=ink;g.lineWidth=1.05;g.stroke();}
  }
  const polygon=pts=>g=>{g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);};
  function oval(g,x,y,rx,ry,c){fill(g,p=>p.ellipse(x,y,rx,ry,0,0,TAU),c);}
  function stroke(g,pts,w,c){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.strokeStyle=ink;g.lineWidth=w+2;g.stroke();g.strokeStyle=c;g.lineWidth=w;g.stroke();g.strokeStyle=tint(c,.25);g.lineWidth=w*.25;g.stroke();}
  function star(g,x,y,r,c){const p=[];for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=i%2?r*.46:r;p.push(x+Math.sin(a)*rr,y-Math.cos(a)*rr);}fill(g,polygon(p),c);}
  const skin='#ecc49c',gold='#d7ae58';
  function kind(id){return /^(elf|lyra)$/.test(id)?'elf':/^(mage|selene)$/.test(id)?'mage':/^(dwarf|borin)$/.test(id)?'dwarf':/^(orct|orc)$/.test(id)?'orc':/^(soldier(S[0-4])?|aldric)$/.test(id)?'knight':null;}
  function humanoid(g,id,P){
    const k=kind(id),elf=k==='elf',mage=k==='mage',dwarf=k==='dwarf',orc=k==='orc',goblin=/goblin/.test(id);
    const walk=P.w>=0?Math.sin(P.w*TAU):0,a=P.a>=0?P.a:-1,t=P.t||0;
    const hit=a<0?0:a<.32?-a/.32*.35:a<.55?-.35+(a-.32)/.23*1.35:(1-a)/.45;
    const breath=Math.sin(t*2.4)*.45,bob=P.w>=0?-(1-Math.cos(P.w*TAU*2))*.8:breath;
    const cloth=elf?'#3a7a45':mage?'#7050a6':dwarf?'#62482e':orc?'#8c3f32':'#285b9c',hair=elf?'#e3cd89':mage?'#ae94cd':dwarf?'#bd612c':orc?'#343b2c':'#72422f',flesh=orc?'#869851':skin;
    const yy=dwarf?8:0,wide=orc?1.12:dwarf?1.16:1;
    g.save();g.translate(hit*3,bob);g.rotate(hit*.10+walk*.025);g.scale(wide,1);g.lineJoin='round';g.lineCap='round';
    if(P.d!==undefined){g.translate(0,P.d*6);g.rotate(P.d*1.35);g.globalAlpha*=1-P.d*.75;}
    // Rear silhouette: cloth has one calm broad curve and an animated hem.
    fill(g,p=>{p.moveTo(-10,-36+yy);p.bezierCurveTo(-19,-27,-18+walk*2,-7,-8+Math.sin(t*3)*2,-6);p.quadraticCurveTo(5,-11,9,-30+yy);},cloth);
    if(elf||mage)fill(g,p=>{p.moveTo(-11,-46);p.bezierCurveTo(-23,-36,-19,-17,-11+walk,-13);p.quadraticCurveTo(2,-16,11,-19);p.bezierCurveTo(18,-27,15,-40,11,-47);},hair);
    // Bent knees and offset feet keep a relaxed weight-bearing stance.
    const hip=-18+yy*.4,foot=walk*3;
    stroke(g,[-7,hip,-9+foot,-10,-10-foot*.5,-3],6.2,orc?'#6a4c37':'#665c45');
    oval(g,-10-foot*.5,-2.3,5.8,3.0,elf?'#4f6638':'#564537');
    stroke(g,[6,hip,7-foot,-10,9+foot*.5,-3],6.7,orc?'#6a4c37':'#665c45');
    oval(g,10+foot*.5,-2.5,6.4,3.3,elf?'#4f6638':'#564537');
    if(mage)fill(g,p=>{p.moveTo(-9,-32);p.quadraticCurveTo(-11,-21,-15,-6);p.quadraticCurveTo(0,-1,14,-7);p.lineTo(8,-32);},cloth);
    // Upper body and far arm; a single shaped breastplate replaces joints.
    stroke(g,[-10,-31+yy,-15,-23+yy,-12,-15+yy],6.3,elf?flesh:cloth);
    fill(g,p=>{p.moveTo(-10,-35+yy);p.quadraticCurveTo(-17,-23+yy,-10,-16+yy*.35);p.quadraticCurveTo(2,-12,12,-19);p.quadraticCurveTo(16,-29,8,-35+yy);},orc?flesh:cloth);
    if(k==='knight'||dwarf)fill(g,p=>{p.moveTo(-9,-33+yy);p.quadraticCurveTo(0,-37+yy,10,-31+yy);p.lineTo(8,-20+yy*.4);p.quadraticCurveTo(0,-16,-9,-21+yy*.4);},dwarf?'#6b6050':'#bdcbd4');
    if(elf)fill(g,polygon([-10,-32,0,-36,9,-31,3,-24,-3,-20,-8,-25]),'#559653');
    stroke(g,[-10,-17+yy*.35,9,-18+yy*.35],3.2,'#64402e');oval(g,2,-17.3+yy*.35,2.1,1.7,gold);
    if(k==='knight')star(g,1,-28+yy,3.7,gold);
    if(orc){fill(g,polygon([-9,-17,8,-17,10,-7,1,-11,-5,-6,-10,-9]),'#9d4034');for(const x of [-12,11])fill(g,p=>{p.moveTo(x-4,-35);p.quadraticCurveTo(x,-39,x+5,-32);p.lineTo(x+3,-28);p.lineTo(x,-30);p.lineTo(x-4,-28);},'#d6c6a5');}
    // A rounded cheek and jaw, with deliberately non-anime eyes and brows.
    g.save();g.translate(1,-44+yy);g.rotate(-hit*.12);
    fill(g,p=>{p.moveTo(-12,-5);p.bezierCurveTo(-16,4,-9,12,2,12);p.bezierCurveTo(12,12,17,5,13,-5);p.quadraticCurveTo(0,-16,-12,-5);},flesh);
    if(elf||orc)for(const s of [-1,1])fill(g,polygon([s*11,-3,s*19,-7,s*14,4,s*10,5]),flesh);
    // Hair is a continuous swept mass, with three large readable locks.
    fill(g,p=>{p.moveTo(-13,1);p.bezierCurveTo(-19,-9,-10,-17,0,-16);p.bezierCurveTo(11,-18,18,-9,14,2);p.lineTo(9,-2);p.lineTo(7,2);p.lineTo(1,-5);p.lineTo(-3,-1);p.lineTo(-5,-6);p.quadraticCurveTo(-9,-2,-13,1);},hair);
    const blink=Math.sin(t*2.4)> .993?.14:1;
    for(const [x,y] of [[-4,3],[7,2.5]]){oval(g,x,y,2.1,1.9*blink,'#f7eaca');oval(g,x+.7,y+.15,1.0,1.4*blink,orc?'#7e4523':elf?'#3b6634':mage?'#64417e':'#325775');}
    stroke(g,[-7,.1,-3,-.7],1.25,hair);stroke(g,[5,-.5,10,.2],1.25,hair);
    if(!dwarf){stroke(g,[4,7,7,6.7],.9,'#815544');if(orc)for(const x of [-4,8])fill(g,polygon([x,8,x+1,4,x+2,8]),'#efe1bb');}
    if(dwarf){fill(g,p=>{p.moveTo(-12,5);p.quadraticCurveTo(0,2,13,5);p.quadraticCurveTo(13,17,2,23);p.quadraticCurveTo(-13,20,-12,5);},hair);stroke(g,[-7,7,0,8,6,6],3.5,tint(hair,.12));for(const x of [-5,6]){oval(g,x,-10,4.2,3.5,gold);oval(g,x,-10,2.7,2.1,'#558ca1');}}
    if(elf){fill(g,polygon([-14,-9,-18,-14,-14,-12,-11,-16,-11,-10]),'#55904b');oval(g,-13,-10,1.7,1.4,'#f4e3b0');}
    if(mage){fill(g,p=>{p.moveTo(-19,-8);p.quadraticCurveTo(-8,-14,18,-8);p.quadraticCurveTo(23,-4,13,-2);p.quadraticCurveTo(-8,1,-19,-8);},cloth);fill(g,p=>{p.moveTo(-10,-9);p.quadraticCurveTo(-6,-26,2,-33);p.quadraticCurveTo(9,-33,11,-24);p.lineTo(5,-25);p.quadraticCurveTo(10,-18,11,-9);},cloth);stroke(g,[-10,-10,10,-10],3,gold);star(g,0,-20,2.4,gold);}
    g.restore();
    // Near arm is posed around the actual weapon, with an anticipation arc.
    const hx=14+hit*5,hy=-20+yy-hit*5;stroke(g,[10,-30+yy,16,-26+yy,hx,hy],6.5,elf||mage?flesh:cloth);oval(g,hx,hy,3.1,3.4,flesh);
    g.save();g.translate(hx,hy);g.rotate(k==='knight'?.35+hit*1.25:orc?.40+hit*1.35:0);
    if(k==='knight'){stroke(g,[0,4,0,-15],2,'#604432');fill(g,polygon([-2,-3,-2,-21,1,-25,3,-21,3,-3]),'#c6d7dc');stroke(g,[-5,-3,5,-3],2.5,gold);}
    if(orc){stroke(g,[0,5,0,-23],2.8,'#76543a');fill(g,p=>{p.moveTo(0,-22);p.lineTo(10,-27);p.quadraticCurveTo(18,-14,8,-11);p.lineTo(0,-15);},'#969992');}
    if(elf){stroke(g,[2,-18,8,-10,9,-1,4,8],2.4,gold);stroke(g,[2,-18,4,8],.65,'#f3e3b8');stroke(g,[-2,-5,15,-5],.8,'#ece0ae');}
    if(mage){stroke(g,[0,7,0,-30],2.4,'#83653c');fill(g,polygon([0,-40,5,-31,0,-25,-4,-31]),'#a778db');stroke(g,[-4,-29,0,-24,5,-29],1.5,gold);}
    if(dwarf){g.rotate(-.10);fill(g,p=>{p.moveTo(-5,-8);p.lineTo(16,-12);p.quadraticCurveTo(24,-6,20,2);p.lineTo(-5,1);},'#4c4944');stroke(g,[1,-9,2,0],2.3,gold);stroke(g,[13,-11,15,1],2.4,gold);oval(g,20,-5,4.8,6.3,gold);oval(g,20.4,-5,3.2,4.5,'#433630');oval(g,20.8,-5,1.8,2.8,'#eab467');}
    g.restore();
    if(k==='knight'){g.save();g.translate(-10,-22);g.rotate(-.18-hit*.16);fill(g,p=>{p.moveTo(-8,-9);p.quadraticCurveTo(0,-13,8,-8);p.quadraticCurveTo(8,7,0,13);p.quadraticCurveTo(-8,6,-8,-9);},gold);fill(g,polygon([-6,-7,6,-7,5,4,0,10,-5,4]),cloth);star(g,0,-1,3.7,'#e8cc82');g.restore();}
    if(hit>.7&&P.a>=0){g.save();g.globalAlpha*=.45;g.strokeStyle=orc?'#e9bc73':'#a8d4e2';g.lineWidth=2;g.beginPath();g.arc(10,-24,25,-1,.8);g.stroke();g.restore();}
    g.restore();
  }
  function draw(g,id,P,height){const k=kind(id);if(k){g.save();g.scale((height||54)/62,(height||54)/62);humanoid(g,id,P);g.restore();return true;}const alias={wolfRider:'warg',pharaoh:'mummy',treantKing:'treant',magmaLord:'magmaGolem',darkKnight:'deathKnight',darkLord:'deathKnight',shade:'wraith'};const d=originals[id]||originals[alias[id]];if(!d)return false;g.save();const s=(height||d.tall)/d.tall;g.scale(s,s);d.draw(g,P);g.restore();return true;}
  function identify(key){const h=/(?:h_|c_)(aldric|lyra|selene|borin)/.exec(key);return h?h[1]:key.replace(/_a\d$|_[bfs]$/,'').replace(/([1-4])(s[0-4])?$/,'');}
  function install(){for(const [key,d] of Object.entries(ArtChars)){if(!d||!d.draw)continue;const id=identify(key),base=originals[key]||originals[id];if(!kind(id)&&!base&&!originals[{darkKnight:'deathKnight',darkLord:'deathKnight',wolfRider:'warg',shade:'wraith',pharaoh:'mummy',treantKing:'treant',magmaLord:'magmaGolem'}[id]])continue;ArtChars[key]={...d,chibi:true,__3d:false,draw:(g,P)=>draw(g,id,P,d.tall),box:[d.tall*2.4,d.tall*1.6,d.tall*1.2,d.tall*1.35]};}
    const oldHero=ArtChars.heroKey;ArtChars.heroKey=function(id,tiers){const key=oldHero(id,tiers);const d=ArtChars[key];d.draw=(g,P)=>draw(g,id,P,d.tall);d.chibi=true;d.__3d=false;return key;};if(window.Art3D)Art3D.dirKey=()=>null;if(window.Painter)Painter.clear();}
  function captureLegacy(){for(const [key,d] of Object.entries(ArtChars))if(d&&d.draw)originals[key]={...d};}
  window.ArtStylized={draw,kind,identify,install,captureLegacy,ink:true,originals};
})();
