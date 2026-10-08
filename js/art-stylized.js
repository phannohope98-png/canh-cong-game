/* 2D game characters: painted Pharaoh animation atlas and path-based faction art. */
(function(){
  'use strict';
  const TAU=Math.PI*2, originals=Object.fromEntries(Object.entries(ArtChars).filter(([,d])=>d&&d.draw).map(([k,d])=>[k,{...d}]));
  const ink='#352c36';
  function tint(c,k){const n=parseInt(c.slice(1),16),a=[n>>16,(n>>8)&255,n&255];return '#'+a.map(v=>Math.round(k>0?v+(255-v)*k:v*(1+k)).toString(16).padStart(2,'0')).join('');}
  // Light is evaluated in the same coordinates as the drawn surface.
  // Clipped brush marks stay attached to each moving part and never flicker.
  function fill(g,path,c,lo=-.28,hi=.26,outline=true){
    let xs=[],ys=[];const record=(name,args)=>{if(name==='ellipse'){xs.push(args[0]-args[2],args[0]+args[2]);ys.push(args[1]-args[3],args[1]+args[3]);}else for(let i=0;i<args.length;i+=2){xs.push(args[i]);ys.push(args[i+1]);}g[name](...args);};
    const pen={moveTo:(...a)=>record('moveTo',a),lineTo:(...a)=>record('lineTo',a),quadraticCurveTo:(...a)=>record('quadraticCurveTo',a),bezierCurveTo:(...a)=>record('bezierCurveTo',a),ellipse:(...a)=>record('ellipse',a)};
    g.beginPath();path(pen);g.closePath();
    const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(.1,Math.max(...xs)-x),h=Math.max(.1,Math.max(...ys)-y);
    const base=g.createLinearGradient(x,y,x+w,y+h);
    base.addColorStop(0,tint(c,hi*.60));base.addColorStop(.24,tint(c,Math.min(.65,hi+.16)));base.addColorStop(.51,c);base.addColorStop(.85,tint(c,lo));base.addColorStop(1,tint(c,Math.max(-.65,lo-.15)));
    g.fillStyle=base;g.fill();
    g.save();g.clip();
    if(w*h>22){
      const glow=g.createRadialGradient(x+w*.30,y+h*.24,0,x+w*.30,y+h*.24,Math.max(w,h)*.65);
      glow.addColorStop(0,'rgba(255,240,203,.19)');glow.addColorStop(1,'rgba(255,240,203,0)');g.fillStyle=glow;g.fillRect(x,y,w,h);
      // Broad translucent strokes break the mechanical smoothness of a vector fill.
      const seed=parseInt(c.slice(1),16)%97;
      for(let i=0;i<12;i++){
        const u=((i*37+seed)%101)/101,v=((i*61+seed*3)%103)/103;
        const px=x+w*u,py=y+h*v,len=w*(.12+(i%3)*.07);
        g.beginPath();g.moveTo(px,py);g.quadraticCurveTo(px+len*.45,py-h*.035,px+len,py+h*.015);
        g.strokeStyle=i%3?'rgba(255,240,207,.12)':'rgba(67,45,30,.09)';g.lineWidth=Math.min(1.25,Math.max(.18,h*.035));g.lineCap='round';g.stroke();
      }
      // A narrow lit edge inside the contour gives cloth and metal thickness.
      g.translate(.28,.32);g.strokeStyle=tint(c,Math.min(.65,hi+.20));g.lineWidth=.48;g.beginPath();path(g);g.closePath();g.stroke();
    }
    g.restore();
    if(outline&&ArtStylized.ink){g.strokeStyle=tint(c,-.57);g.lineWidth=.43;g.beginPath();path(g);g.closePath();g.stroke();}
  }

  const polygon=pts=>g=>{g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);};
  function oval(g,x,y,rx,ry,c,outline=true){fill(g,p=>p.ellipse(x,y,rx,ry,0,0,TAU),c,-.28,.26,outline);}
  function stroke(g,pts,w,c){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.strokeStyle=tint(c,-.58);g.lineWidth=w+.65;g.stroke();g.strokeStyle=c;g.lineWidth=w;g.stroke();g.strokeStyle=tint(c,.25);g.lineWidth=w*.25;g.stroke();}
  function star(g,x,y,r,c){const p=[];for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=i%2?r*.46:r;p.push(x+Math.sin(a)*rr,y-Math.cos(a)*rr);}fill(g,polygon(p),c);}
  const skin='#ecc49c',gold='#d7ae58';
  function kind(id){return /^(elf|lyra)$/.test(id)?'elf':/^(mage|selene)$/.test(id)?'mage':/^(dwarf|borin)$/.test(id)?'dwarf':/^(orct|orc)$/.test(id)?'orc':/^(soldier(S[0-4])?|aldric)$/.test(id)?'knight':null;}
  function battleFigure(g,id,P){
    const k=kind(id),elf=k==='elf',mage=k==='mage',dwarf=k==='dwarf',orc=k==='orc',troop=/^soldier/.test(id);
    const cloth=elf?'#487847':mage?'#66518d':dwarf?'#64503d':orc?'#893d30':'#285785',hair=elf?'#d8c381':mage?'#a092b7':dwarf?'#b96734':orc?'#323a2b':'#654231',flesh=orc?'#83915a':'#dbb58c',metal='#a5b8c2';
    const walk=P.w>=0?Math.sin(P.w*TAU):0,t=P.t||0,a=P.a>=0?P.a:-1;
    const strike=a<0?0:a<.35?-.40*a/.35:a<.52?-.40+(a-.35)/.17*1.40:(1-a)/.48;
    const y=dwarf?5:0,breath=Math.sin(t*2.4)*.24,bob=P.w>=0?-(1-Math.cos(P.w*TAU*2))*.65:breath;
    g.save();g.lineCap='round';g.lineJoin='round';g.translate(strike*3,bob);g.rotate(-.04+strike*.12+walk*.015);g.scale(orc?1.15:dwarf?1.10:1,1);
    if(P.d!==undefined){g.translate(0,P.d*4);g.rotate(P.d*1.30);g.globalAlpha*=1-P.d*.65;}
    // The back is broad and the weight is carried on a staggered pair of feet.
    fill(g,p=>{p.moveTo(-8,-39+y);p.bezierCurveTo(-18,-31,-22,-18,-26+walk,-10);p.lineTo(-18,-12);p.lineTo(-13,-7);p.quadraticCurveTo(-4,-12,3,-32+y);},tint(cloth,-.12));
    fill(g,p=>{p.moveTo(-9,-33+y);p.quadraticCurveTo(-14,-18,-20+walk,-12);p.lineTo(-16,-15);p.lineTo(-10,-12);p.quadraticCurveTo(-8,-19,-6,-33+y);},tint(cloth,.12));
    if(elf||mage)fill(g,p=>{p.moveTo(-11,-47+y);p.quadraticCurveTo(-23,-34,-22,-15);p.lineTo(-18,-18);p.lineTo(-15,-12);p.quadraticCurveTo(-4,-22,0,-39+y);},hair);
    const leg=walk*2.8,hip=-18+y*.5;
    stroke(g,[-6,hip,-10+leg,-10,-13+leg*.4,-4],5.8,'#514837');
    fill(g,p=>{p.moveTo(-17+leg*.4,-7);p.lineTo(-10+leg*.4,-7);p.lineTo(-8+leg*.4,-2);p.quadraticCurveTo(-15+leg*.4,2,-20+leg*.4,-1);p.lineTo(-20+leg*.4,-3);},elf?'#526138':'#554536');
    stroke(g,[7,hip,11-leg,-11,11-leg*.3,-3],6.5,'#655745');
    fill(g,p=>{p.moveTo(8-leg*.3,-7);p.lineTo(15-leg*.3,-7);p.lineTo(20-leg*.3,-3);p.quadraticCurveTo(21-leg*.3,1,9-leg*.3,1);p.lineTo(7-leg*.3,-1);},elf?'#526138':'#65513b');
    if(!elf&&!mage&&!orc){fill(g,polygon([-14+leg*.4,-12,-9+leg*.4,-13,-9+leg*.4,-7,-15+leg*.4,-6]),tint(metal,-.16));fill(g,polygon([7-leg*.3,-13,13-leg*.3,-14,16-leg*.3,-7,9-leg*.3,-6]),metal);}
    // Far hand and compact shoulder block are behind the cuirass.
    stroke(g,[-7,-34+y,-15,-28+y,-16,-19+y],5.2,tint(cloth,-.2));oval(g,-16,-19+y,2.5,2.8,flesh,false);
    fill(g,p=>{p.moveTo(-8,-38+y);p.quadraticCurveTo(2,-43+y,11,-34+y);p.lineTo(15,-22);p.quadraticCurveTo(2,-13,-10,-19);p.lineTo(-13,-30+y);},orc?flesh:cloth);
    if(!mage&&!orc){fill(g,p=>{p.moveTo(-8,-36+y);p.lineTo(2,-39+y);p.lineTo(11,-32+y);p.lineTo(9,-25+y*.3);p.lineTo(-3,-23+y*.3);p.lineTo(-10,-29+y);},elf?'#547e4d':dwarf?'#716454':metal);fill(g,polygon([-8,-35+y,-1,-37+y,0,-26,-6,-27]),tint(elf?'#547e4d':dwarf?'#716454':metal,.22),-.18,.16,false);}
    fill(g,polygon([-10,-23+y*.3,11,-25+y*.3,12,-20,-8,-17]),'#5d4030');oval(g,3,-21.8,2.3,1.7,gold);
    if(k==='knight')star(g,2,-31+y,2.5,gold);
    if(elf){fill(g,polygon([-3,-38,4,-35,0,-28,-5,-32]),'#96aa6b');fill(g,polygon([-8,-18,0,-19,-5,-10,-10,-12]),'#d2cdac');}
    if(mage){fill(g,p=>{p.moveTo(-9,-29);p.lineTo(9,-30);p.quadraticCurveTo(10,-16,15,-5);p.lineTo(8,-8);p.lineTo(3,-4);p.lineTo(-9,-6);p.lineTo(-13,-11);p.quadraticCurveTo(-8,-22,-9,-29);},cloth);fill(g,polygon([-5,-25,-1,-26,0,-9,-7,-9]),tint(cloth,.17));stroke(g,[8,-25,12,-7],1.1,gold);}
    if(orc){stroke(g,[-8,-34,10,-24],3.1,'#554032');fill(g,polygon([-8,-19,9,-20,12,-8,5,-10,0,-5,-8,-9]),'#973e32');for(const x of [-10,12])fill(g,p=>{p.moveTo(x-4,-38);p.lineTo(x,-40);p.lineTo(x+5,-34);p.lineTo(x+3,-29);p.lineTo(x,-31);p.lineTo(x-4,-29);p.lineTo(x-6,-32);},'#cdc2a8');}
    // Heads are a smaller wedge with the visible face turned three-quarter.
    g.save();g.translate(3,-44+y);g.rotate(.07-strike*.12);
    fill(g,p=>{p.moveTo(-10,-5);p.quadraticCurveTo(-12,5,-5,8);p.quadraticCurveTo(2,12,8,7);p.quadraticCurveTo(14,4,13,-4);p.quadraticCurveTo(4,-12,-10,-5);},flesh);
    fill(g,p=>{p.moveTo(-10,-2);p.quadraticCurveTo(-8,-5,-5,-4);p.quadraticCurveTo(-7,2,-4,6);p.quadraticCurveTo(-11,5,-10,-2);},tint(flesh,-.12),-.18,.12,false);
    if(elf||orc)fill(g,polygon([-9,-2,-16,-7,-14,2,-9,4]),flesh);
    if(troop){
      fill(g,p=>{p.moveTo(-12,0);p.bezierCurveTo(-16,-10,-7,-17,3,-16);p.quadraticCurveTo(13,-16,15,-6);p.lineTo(11,4);p.lineTo(5,3);p.lineTo(4,-2);p.lineTo(-10,0);},metal);
      fill(g,p=>{p.moveTo(-10,-7);p.quadraticCurveTo(-3,-14,5,-13);p.lineTo(8,-9);p.quadraticCurveTo(-1,-9,-10,-5);},'#d6dedb');
      fill(g,polygon([-9,0,5,-3,12,-1,11,2,-9,4]),'#293c46');
      fill(g,polygon([-12,-2,-8,-3,-7,7,-12,4]),'#788f9b');
      fill(g,p=>{p.moveTo(-5,-15);p.quadraticCurveTo(-7,-24,1,-22);p.quadraticCurveTo(8,-19,10,-22);p.lineTo(8,-14);p.quadraticCurveTo(2,-16,-5,-15);},cloth);
    }else{
      fill(g,p=>{p.moveTo(-12,0);p.quadraticCurveTo(-17,-10,-8,-14);p.lineTo(-2,-17);p.lineTo(1,-14);p.lineTo(6,-16);p.quadraticCurveTo(16,-12,14,-3);p.lineTo(8,-1);p.lineTo(7,-5);p.lineTo(1,-1);p.lineTo(0,-6);p.lineTo(-5,-2);p.lineTo(-7,-5);p.lineTo(-12,0);},hair);
      fill(g,p=>{p.moveTo(-10,-9);p.quadraticCurveTo(-5,-14,4,-12);p.lineTo(0,-9);p.lineTo(-5,-7);},tint(hair,.25),-.18,.16,false);
      const blink=Math.sin(t*2.7)>.993?.1:1;
      // Narrow eyes and heavy brows, with a larger near eye than far eye.
      oval(g,-1,2,1.3,1.1*blink,'#eee1c1');oval(g,7,1,2,1.15*blink,'#eee1c1');oval(g,0,2,0.7,1*blink,'#35484b');oval(g,8,1,.8,1*blink,'#35484b');stroke(g,[-3,-.7,1,-1.3],1,hair);stroke(g,[5,-1.6,10,-.7],1.2,hair);
      fill(g,polygon([9,3,12,4,9,5]),tint(flesh,-.08));
      if(!dwarf)stroke(g,[5,7,9,6],.7,'#77503b');
    }
    if(elf){fill(g,polygon([-11,-8,-15,-12,-12,-12,-10,-16,-8,-10]),'#63814a');oval(g,-10,-9,1.5,1.1,'#efe0b2');}
    if(dwarf){fill(g,p=>{p.moveTo(-11,4);p.lineTo(-5,2);p.lineTo(1,5);p.lineTo(9,3);p.lineTo(12,7);p.lineTo(8,15);p.lineTo(1,20);p.lineTo(-4,16);p.lineTo(-10,17);p.quadraticCurveTo(-14,10,-11,4);},hair);fill(g,polygon([-7,5,-1,7,6,5,8,8,0,10,-8,8]),tint(hair,.20));stroke(g,[-5,12,-3,16],.7,tint(hair,-.35));stroke(g,[4,11,2,17],.7,tint(hair,-.35));for(const x of [-5,5]){oval(g,x,-10,4.1,3.1,'#a58c56');oval(g,x,-10,2.9,2.0,'#446674');stroke(g,[x-1,-11,x+1,-11],.65,'#b5ccd1');}}
    if(orc)for(const x of [-1,8])fill(g,polygon([x,8,x+.7,3,x+2.5,7]),'#e6dfc5');
    if(mage){fill(g,p=>{p.moveTo(-17,-7);p.quadraticCurveTo(-9,-14,12,-10);p.lineTo(20,-6);p.quadraticCurveTo(12,0,-4,-2);p.lineTo(-17,-7);},cloth);fill(g,p=>{p.moveTo(-8,-10);p.quadraticCurveTo(-7,-25,-1,-31);p.quadraticCurveTo(6,-32,10,-23);p.lineTo(4,-25);p.quadraticCurveTo(9,-18,10,-10);},cloth);stroke(g,[-8,-10,10,-11],2.2,gold);star(g,1,-22,1.8,gold);}
    g.restore();
    // The near shoulder has thickness; the glove grips an angled weapon.
    fill(g,p=>{p.moveTo(8,-37+y);p.quadraticCurveTo(19,-39+y,19,-30+y);p.lineTo(13,-27+y);p.lineTo(6,-31+y);},orc?'#655d4d':dwarf?'#777369':elf?'#587847':mage?cloth:metal);
    if(!elf&&!mage&&!orc)stroke(g,[9,-35+y,16,-35+y,18,-32+y],.9,tint(metal,.28));
    const hx=18+strike*7,hy=-24+y-strike*6;
    stroke(g,[14,-30+y,18,-26+y,hx,hy],5.7,elf||mage?flesh:orc?'#675544':metal);oval(g,hx,hy,2.8,3.0,elf||mage?flesh:'#564437',false);
    g.save();g.translate(hx,hy);g.rotate(k==='knight'?.5+strike*1.7:orc?.55+strike*1.7:elf?-.13:0);
    if(k==='knight'){stroke(g,[0,4,0,-5],2.1,'#5c4632');fill(g,polygon([-2,-4,-2,-23,1,-27,3,-23,3,-4]),'#bacad0');fill(g,polygon([1,-24,2,-22,2,-5,1,-5]),'#e0e4d8',-.18,.16,false);stroke(g,[-5,-4,5,-4],2.1,gold);}
    if(orc){stroke(g,[0,7,0,-25],2.7,'#735736');fill(g,p=>{p.moveTo(0,-24);p.lineTo(9,-29);p.quadraticCurveTo(17,-19,11,-12);p.lineTo(6,-15);p.lineTo(0,-16);},'#898d80');stroke(g,[10,-27,13,-21,11,-15],.7,'#c7c6b5');}
    if(elf){stroke(g,[1,-19,7,-12,9,0,4,10],2,'#a88c4d');stroke(g,[1,-19,4,10],.6,'#e7d7a2');stroke(g,[-5,-4,13,-4],.8,'#d8ccb0');fill(g,polygon([14,-4,10,-6,10,-2]),'#a6b6b2');}
    if(mage){stroke(g,[0,9,0,-31],2.5,'#80663d');fill(g,polygon([0,-40,4,-32,0,-26,-4,-32]),'#9576b4');fill(g,polygon([0,-39,0,-28,-3,-32]),'#c7b3dc');stroke(g,[-4,-30,0,-26,4,-30],1.3,gold);}
    if(dwarf){g.rotate(.12);fill(g,polygon([-5,-9,19,-12,23,-8,23,1,-5,3]),'#444846');stroke(g,[0,-8,1,2],2.1,'#bda064');stroke(g,[12,-11,14,1],2.3,'#bda064');oval(g,22,-5,4.5,6.4,'#bda064');oval(g,23,-5,3.0,4.5,'#292e2d');oval(g,23,-5,1.5,2.5,'#b88b42');}
    g.restore();
    if(k==='knight'){g.save();g.translate(-11,-26);g.rotate(-.22-strike*.13);fill(g,p=>{p.moveTo(-8,-10);p.lineTo(5,-12);p.lineTo(9,-8);p.quadraticCurveTo(9,5,1,13);p.quadraticCurveTo(-7,8,-8,-10);},'#b99a59');fill(g,polygon([-6,-8,4,-10,6,-7,5,4,1,9,-5,4]),cloth);fill(g,polygon([-6,-8,-2,-9,-1,6,-4,3]),tint(cloth,.20));star(g,1,-1,3.4,'#dcc489');g.restore();}
    if(strike>.72){g.save();g.globalAlpha*=.45;g.strokeStyle='#c5d8cb';g.lineWidth=1.4;g.beginPath();g.arc(15,-28,29,-1.1,.8);g.stroke();g.restore();}g.restore();
  }
  // Painted keyframes, with stable ground registration and continuous secondary motion.
  // The source is a transparent 18-frame animation atlas, not a still billboard.
  const pharaohAtlas=(()=>{
    const img=new Image(),url=new URL('../assets/sprites/pharaoh-painted50.png',document.currentScript.src);
    let loaded=false;
    const ready=new Promise((resolve,reject)=>{
      img.onload=()=>{loaded=true;if(window.Painter)Painter.clear();resolve();};
      img.onerror=()=>reject(new Error('Cannot load painted Pharaoh animation atlas'));
    });
    // Handle failures for the game; the workshop awaits ready and reports them.
    ready.catch(err=>console.error(err));img.src=url.href;
    const smooth=x=>x*x*(3-2*x),BASE=[291,278,258];
    function frame(g,row,col,height,alpha){
      const cellW=img.naturalWidth/6,cellH=img.naturalHeight/3,s=height/218;
      let x=Math.round(col*cellW),y=Math.round(row*cellH),width=Math.round((col+1)*cellW)-x;
      // The follow-through blade occupies a small overhang into the empty margin.
      let margin=0;
      if(row===2&&col===4)width+=25;
      if(row===2&&col===5){x+=25;width-=25;margin=25;}
      const h=Math.round((row+1)*cellH)-y;
      g.save();g.globalAlpha*=alpha;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      g.drawImage(img,x,y,width,h,(-cellW*.52+margin)*s,-BASE[row]*s,width*s,h*s);g.restore();
    }
    function draw(g,P,height){
      if(!loaded)return false;
      const H=height||64,walk=P.w>=0,attack=P.a>=0,dead=P.d!==undefined;
      let row=attack?2:walk?1:0,phase=attack?Math.max(0,Math.min(.999999,P.a)):walk?((P.w%1)+1)%1:(((P.t||0)/2.618)%1+1)%1;
      if(dead){row=0;phase=0;}
      const key=phase*6,col=Math.min(5,Math.floor(key)),fraction=key-col;
      g.save();
      if(dead){const d=smooth(Math.min(1,Math.max(0,P.d)));g.translate(H*.18*d,H*.035*d);g.rotate(d*1.32);g.globalAlpha*=1-d*.8;}
      else if(walk){const step=Math.sin(phase*TAU);g.translate(H*.012*step,-H*.008*Math.abs(step));g.rotate(step*.009);}
      else if(!attack){const b=Math.sin((P.t||0)*2.4);g.scale(1-b*.004,1+b*.009);}
      // A short blend only at keyframe boundaries avoids snapping while retaining
      // crisp silhouettes through most of the cycle (no permanent double weapon).
      const next=attack?Math.min(5,col+1):(col+1)%6;
      const mix=next===col?0:smooth(Math.max(0,(fraction-.83)/.17));
      if(mix>0){frame(g,row,col,H,1-mix);frame(g,row,next,H,mix);}else frame(g,row,col,H,1);
      g.restore();return true;
    }
    return {draw,ready,get loaded(){return loaded;},src:url.href};
  })();


  function draw(g,id,P,height){if(id==='pharaoh'){pharaohAtlas.draw(g,P,height);return true;}const k=kind(id);if(k){g.save();g.scale((height||54)/62,(height||54)/62);battleFigure(g,id,P);g.restore();return true;}const alias={wolfRider:'warg',pharaoh:'mummy',treantKing:'treant',magmaLord:'magmaGolem',darkKnight:'deathKnight',darkLord:'deathKnight',shade:'wraith'};const d=originals[id]||originals[alias[id]];if(!d)return false;g.save();const s=(height||d.tall)/d.tall;g.scale(s,s);d.draw(g,P);g.restore();return true;}
  function identify(key){const h=/(?:h_|c_)(aldric|lyra|selene|borin)/.exec(key);return h?h[1]:key.replace(/_a\d$|_[bfs]$/,'').replace(/([1-4])(s[0-4])?$/,'');}
  function install(){if(!ArtChars.pharaoh&&ArtChars.mummy)ArtChars.pharaoh={...ArtChars.mummy};for(const [key,d] of Object.entries(ArtChars)){if(!d||!d.draw)continue;const id=identify(key),base=originals[key]||originals[id];if(!kind(id)&&!base&&!originals[{darkKnight:'deathKnight',darkLord:'deathKnight',wolfRider:'warg',shade:'wraith',pharaoh:'mummy',treantKing:'treant',magmaLord:'magmaGolem'}[id]])continue;ArtChars[key]={...d,chibi:true,__3d:false,draw:(g,P)=>draw(g,id,P,d.tall),box:id==='pharaoh'?[d.tall*3,d.tall*1.8,d.tall*1.5,d.tall*1.4]:[d.tall*2.4,d.tall*1.6,d.tall*1.2,d.tall*1.35]};}
    const oldHero=ArtChars.heroKey;ArtChars.heroKey=function(id,tiers){const key=oldHero(id,tiers);const d=ArtChars[key];d.draw=(g,P)=>draw(g,id,P,d.tall);d.chibi=true;d.__3d=false;return key;};if(window.Art3D)Art3D.dirKey=()=>null;if(window.Painter)Painter.clear();}
  function captureLegacy(){for(const [key,d] of Object.entries(ArtChars))if(d&&d.draw)originals[key]={...d};}
  window.ArtStylized={draw,kind,identify,install,captureLegacy,ink:true,originals,ready:pharaohAtlas.ready,atlas:pharaohAtlas};
})();
