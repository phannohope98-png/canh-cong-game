/* Authored 2D character art. All poses are drawn with paths; no mesh renders,
   reference-image billboards or external character artwork are used. */
(function(){
  'use strict';
  const TAU=Math.PI*2, originals=Object.fromEntries(Object.entries(ArtChars).filter(([,d])=>d&&d.draw).map(([k,d])=>[k,{...d}]));
  const ink='#352c36';
  function tint(c,k){const n=parseInt(c.slice(1),16),a=[n>>16,(n>>8)&255,n&255];return '#'+a.map(v=>Math.round(k>0?v+(255-v)*k:v*(1+k)).toString(16).padStart(2,'0')).join('');}
  function fill(g,path,c,lo=-.28,hi=.26,outline=true){
    let xs=[],ys=[];const record=(name,args)=>{if(name==='ellipse'){xs.push(args[0]-args[2],args[0]+args[2]);ys.push(args[1]-args[3],args[1]+args[3]);}else for(let i=0;i<args.length;i+=2){xs.push(args[i]);ys.push(args[i+1]);}g[name](...args);};
    const pen={moveTo:(...a)=>record('moveTo',a),lineTo:(...a)=>record('lineTo',a),quadraticCurveTo:(...a)=>record('quadraticCurveTo',a),bezierCurveTo:(...a)=>record('bezierCurveTo',a),ellipse:(...a)=>record('ellipse',a)};
    g.beginPath();path(pen);g.closePath();const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),gr=(()=>{g.save();g.translate(minX,minY);g.scale(Math.max(.1,maxX-minX),Math.max(.1,maxY-minY));const light=g.createRadialGradient(.30,.23,.03,.43,.43,.78);g.restore();return light;})();gr.addColorStop(0,tint(c,hi));gr.addColorStop(.40,c);gr.addColorStop(1,tint(c,lo));g.fillStyle=gr;g.fill();if(outline&&ArtStylized.ink){g.strokeStyle=ink;g.lineWidth=.65;g.stroke();}
  }
  const polygon=pts=>g=>{g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);};
  function oval(g,x,y,rx,ry,c,outline=true){fill(g,p=>p.ellipse(x,y,rx,ry,0,0,TAU),c,-.28,.26,outline);}
  function stroke(g,pts,w,c){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.strokeStyle=ink;g.lineWidth=w+1.1;g.stroke();g.strokeStyle=c;g.lineWidth=w;g.stroke();g.strokeStyle=tint(c,.25);g.lineWidth=w*.25;g.stroke();}
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
  function pharaohFigure(g,P){
    const t=P.t||0,w=P.w>=0?Math.sin(P.w*TAU):0,a=P.a>=0?P.a:-1;
    const smooth=x=>x*x*(3-2*x);
    const swing=a<0?0:a<.3?-.42*smooth(a/.3):a<.55?-.42+1.35*smooth((a-.3)/.25):.93*(1-smooth((a-.55)/.45));
    const linen='#d9c99d',shade='#ab976a',blue='#326c8d',brass='#d1a34e';
    const paint=(path,col)=>fill(g,path,col,-.18,.16,false);
    function seam(pts,w,col){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.strokeStyle=col;g.lineWidth=w;g.stroke();}
    // Local occlusion is clipped to the receiving surface, not a separate plate.
    function wash(path,x,y,rx,ry,strength){
      g.save();g.beginPath();path(g);g.closePath();g.clip();
      g.translate(x,y);g.scale(rx,ry);const grad=g.createRadialGradient(0,0,0,0,0,1);
      grad.addColorStop(0,'rgba(57,43,34,'+strength+')');grad.addColorStop(1,'rgba(57,43,34,0)');
      g.fillStyle=grad;g.fillRect(-1,-1,2,2);g.restore();
    }
    const torso=p=>{p.moveTo(-10,-38);p.quadraticCurveTo(-2,-41,9,-37);p.quadraticCurveTo(14,-32,11,-24);p.lineTo(10,-17);p.quadraticCurveTo(0,-14,-10,-18);p.quadraticCurveTo(-14,-29,-10,-38);};
    const facePath=p=>{p.moveTo(-8,-7);p.quadraticCurveTo(0,-12,9,-6);p.quadraticCurveTo(12,1,8,7);p.quadraticCurveTo(3,12,-3,8);p.quadraticCurveTo(-10,5,-8,-7);};
    g.save();g.lineJoin='round';g.lineCap='round';
    g.translate(swing*1.6,P.w>=0?-Math.abs(w)*.6:Math.sin(t*2.2)*.24);
    if(P.d!==undefined){g.translate(0,P.d*3);g.rotate(P.d*1.25);g.globalAlpha*=1-P.d*.65;}
    // Curved, tapered limbs; joints remain inside the wrapped silhouette.
    function limb(points,r0,r1,col){
      const [x0,y0,x1,y1,x2,y2]=points,dx=x2-x0,dy=y2-y0,l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l;
      fill(g,p=>{p.moveTo(x0+nx*r0,y0+ny*r0);p.quadraticCurveTo(x1+nx*r0,y1+ny*r0,x2+nx*r1,y2+ny*r1);p.quadraticCurveTo(x2+dx/l*r1,y2+dy/l*r1,x2-nx*r1,y2-ny*r1);p.quadraticCurveTo(x1-nx*r0,y1-ny*r0,x0-nx*r0,y0-ny*r0);p.quadraticCurveTo(x0-dx/l*r0,y0-dy/l*r0,x0+nx*r0,y0+ny*r0);},col);
    }
    // Feet and shins share one outline; no ankle discs or cut edges.
    function leg(x,shift,col){
      g.save();g.translate(x,0);
      fill(g,p=>{p.moveTo(-3.6,-20);p.quadraticCurveTo(-5+shift,-12,-4+shift,-6);p.quadraticCurveTo(-7+shift,-4,-6+shift,-1);p.quadraticCurveTo(-3+shift,2,6+shift,1);p.quadraticCurveTo(8+shift,-1,3+shift,-4);p.quadraticCurveTo(3+shift,-11,3.6,-20);},col);
      paint(p=>{p.moveTo(-3,-17);p.quadraticCurveTo(-3+shift,-10,-2+shift,-5);p.lineTo(1+shift,-4);p.quadraticCurveTo(0+shift,-11,1,-17);},'#ead9ab');
      seam([-4+shift,-10,2+shift,-9],.65,'#aa936b');seam([-4+shift,-7,2+shift,-6],.55,'#aa936b');
      seam([-4+shift,-1,5+shift,0],.6,'#8b794f');g.restore();
    }
    leg(-9,w*2,shade);leg(10,-w*2,linen);
    // The far arm ends in a single rounded fist, without a wrist seam.
    limb([-10,-34,-18,-29,-15,-20],3.5,3.1,shade);
    seam([-18,-29,-13,-28],.65,'#e4d6b0');seam([-17,-20,-13,-20],.55,'#8f7951');
    // A single torso silhouette avoids a stack of disconnected plates.
    fill(g,torso,linen,-.27,.30);
    wash(torso,1,-37,12,6,.24);wash(torso,10,-31,7,8,.18);
    wash(torso,11,-23,7,11,.18);
    for(let i=0;i<4;i++){
      const y=-34+i*4;
      g.beginPath();g.moveTo(-9,y);g.quadraticCurveTo(0,y+2.3,10,y-1.1);g.strokeStyle='#a79368';g.lineWidth=.7;g.stroke();
      g.beginPath();g.moveTo(-8,y-.8);g.quadraticCurveTo(0,y+1.2,9,y-1.8);g.strokeStyle='#f0e3bc';g.lineWidth=.65;g.stroke();
      // A short lit crest and tapered fold, rather than a uniform stripe.
      g.beginPath();g.moveTo(-5,y-.6);g.quadraticCurveTo(-1,y+.25,3,y-.6);g.strokeStyle='rgba(255,248,216,.65)';g.lineWidth=.4;g.stroke();
    }
    // Short pleated kilt, rounded hips and a readable blue/gold central panel.
    fill(g,p=>{p.moveTo(-10,-19);p.quadraticCurveTo(0,-17,11,-20);p.lineTo(15,-8);p.quadraticCurveTo(11,-5,7,-7);p.lineTo(0,-5);p.quadraticCurveTo(-9,-5,-13,-9);},blue);
    fill(g,p=>{p.moveTo(-3,-18);p.lineTo(5,-19);p.quadraticCurveTo(5,-11,7,-7);p.quadraticCurveTo(2,-5,-3,-7);p.lineTo(-3,-18);},brass);
    paint(p=>{p.moveTo(6,-17);p.quadraticCurveTo(8,-14,10,-8);p.lineTo(12,-8);p.quadraticCurveTo(10,-15,9,-18);},'#23506c');
    seam([-10,-10,-11,-14],.65,'#5e96b1');
    stroke(g,[-10,-19,-1,-18,11,-20],2.3,brass);
    seam([-9,-19.5,-1,-18.7,10,-20.5],.55,'#f1d48c');oval(g,2,-19,2,1.7,'#387caa');
    seam([-8,-15,-8,-9],.7,'#204e68');seam([10,-15,12,-9],.7,'#204e68');
    // Head, jaw and nemes are curved volumes, with asymmetric eyes for 3/4 view.
    g.save();g.translate(1,-43);g.rotate(-swing*.045);
    fill(g,p=>{p.moveTo(-12,-9);p.quadraticCurveTo(-9,-18,1,-18);p.quadraticCurveTo(12,-18,15,-8);p.lineTo(17,10);p.quadraticCurveTo(14,15,9,12);p.lineTo(6,5);p.lineTo(-6,6);p.lineTo(-9,14);p.quadraticCurveTo(-14,15,-16,10);p.lineTo(-12,-9);},blue);
    paint(p=>{p.moveTo(-10,-10);p.quadraticCurveTo(-7,-16,0,-16);p.quadraticCurveTo(7,-16,10,-12);p.quadraticCurveTo(0,-14,-10,-10);},'#6394ad');
    fill(g,p=>{p.moveTo(-12,-8);p.quadraticCurveTo(-15,1,-14,9);p.lineTo(-10,10);p.lineTo(-8,-4);},brass);
    fill(g,p=>{p.moveTo(11,-8);p.quadraticCurveTo(15,0,15,9);p.lineTo(11,11);p.lineTo(8,-4);},brass);
    seam([-13,-5,-14,5],.75,'#f1d08c');seam([12,0,14,8],.65,'#8e7239');
    for(let i=0;i<3;i++){seam([-14,-2+i*4,-10,-3+i*4],.95,blue);seam([11,-2+i*4,15,-1+i*4],.95,blue);}
    fill(g,facePath,linen,-.22,.35);
    wash(facePath,1,-7,14,4,.22);wash(facePath,9,5,8,9,.18);
    wash(facePath,8,6,8,8,.14);
    g.beginPath();g.moveTo(-7,-3);g.quadraticCurveTo(0,-1,9,-4);g.strokeStyle='#9f8b60';g.lineWidth=.7;g.stroke();
    // Deep sockets rather than rectangular robot eyes; a restrained blue glint.
    fill(g,p=>{p.moveTo(-5,-1);p.quadraticCurveTo(-2,-2.2,0,0);p.quadraticCurveTo(-2,2.8,-5,1);},'#4d4938');
    fill(g,p=>{p.moveTo(3,-.6);p.quadraticCurveTo(6,-3,9,-1.7);p.quadraticCurveTo(8,1.9,4,1.8);},'#4d4938');
    oval(g,-1.7,.2,.7,.65,'#77cce1');oval(g,6.9,-.1,.85,.75,'#90dfeb');
    paint(p=>{p.moveTo(1,-2);p.quadraticCurveTo(2,-3,3,-2);p.lineTo(4,3);p.quadraticCurveTo(2,4,1.5,2);},'#f0dfb2');
    seam([5,3,8,2.6],.45,'#ead7a4');
    g.beginPath();g.moveTo(2,1);g.quadraticCurveTo(1.6,4,4,4.1);g.strokeStyle='#a78e60';g.lineWidth=.75;g.stroke();
    g.beginPath();g.moveTo(-3,5);g.quadraticCurveTo(2,6.5,7,4.8);g.strokeStyle='#a28d63';g.lineWidth=.7;g.stroke();
    fill(g,p=>{p.moveTo(-11,-9);p.quadraticCurveTo(1,-15,12,-9);p.lineTo(11,-6);p.quadraticCurveTo(1,-10,-10,-6);},brass);
    seam([-8,-8,-1,-10,8,-8],.6,'#f6dda0');
    fill(g,p=>{p.moveTo(-1,-11);p.quadraticCurveTo(-3,-19,1,-20);p.quadraticCurveTo(6,-20,4,-16);p.lineTo(2,-15);p.lineTo(2,-11);},brass);oval(g,2,-18,.65,.5,'#345b65');
    g.restore();
    // Arm and weapon share a local pivot, so the hand never loses its grip.
    g.save();g.translate(8,-33);g.rotate(-.10+swing*.92);
    g.save();g.translate(11,5);g.rotate(.38);
    stroke(g,[0,3,0,-6],2,'#81603a');
    fill(g,p=>{p.moveTo(-1.8,-6);p.quadraticCurveTo(-3,-17,5,-26);p.quadraticCurveTo(9,-30,13,-30);p.lineTo(12,-25);p.quadraticCurveTo(5,-24,2,-7);},'#ddb56c');
    paint(p=>{p.moveTo(0,-7);p.quadraticCurveTo(1,-20,11,-28);p.lineTo(12,-29);p.quadraticCurveTo(5,-24,2,-7);},'#f1d69a');
    g.beginPath();g.moveTo(2,-8);g.quadraticCurveTo(5,-24,12,-27);g.strokeStyle='#fff0be';g.lineWidth=.6;g.stroke();
    seam([-.6,-9,.2,-16],.6,'#a37b3d');
    stroke(g,[-4,-6,4,-6],1.9,brass);seam([-3,-6.6,3,-6.6],.5,'#f6d895');
    g.restore();
    // One uninterrupted arm-to-knuckle contour, then only short finger marks.
    fill(g,p=>{p.moveTo(-2,-3);p.bezierCurveTo(2,-4,5,1,8,1.5);p.quadraticCurveTo(10,0,13,2);p.quadraticCurveTo(16,3,14,7);p.quadraticCurveTo(11,10,8,7.5);p.quadraticCurveTo(2,8,-2,3);p.quadraticCurveTo(-4,0,-2,-3);},linen);
    paint(p=>{p.moveTo(-1,-2);p.quadraticCurveTo(4,0,8,3);p.lineTo(7,4.5);p.quadraticCurveTo(2,3,-1,0);},'#ecddb7');
    g.beginPath();g.moveTo(0,-1);g.quadraticCurveTo(4,1,7,3);g.strokeStyle='rgba(255,244,205,.65)';g.lineWidth=.55;g.stroke();
    seam([3,4,5,1],.6,'#ad986b');seam([6,6,7,3],.6,'#ad986b');
    seam([11,4,13,4.4],.55,'#a48b61');seam([10.8,6,13,6.2],.55,'#a48b61');
    g.restore();g.restore();
  }


  function draw(g,id,P,height){if(id==='pharaoh'){g.save();g.scale((height||64)/66,(height||64)/66);pharaohFigure(g,P);g.restore();return true;}const k=kind(id);if(k){g.save();g.scale((height||54)/62,(height||54)/62);battleFigure(g,id,P);g.restore();return true;}const alias={wolfRider:'warg',pharaoh:'mummy',treantKing:'treant',magmaLord:'magmaGolem',darkKnight:'deathKnight',darkLord:'deathKnight',shade:'wraith'};const d=originals[id]||originals[alias[id]];if(!d)return false;g.save();const s=(height||d.tall)/d.tall;g.scale(s,s);d.draw(g,P);g.restore();return true;}
  function identify(key){const h=/(?:h_|c_)(aldric|lyra|selene|borin)/.exec(key);return h?h[1]:key.replace(/_a\d$|_[bfs]$/,'').replace(/([1-4])(s[0-4])?$/,'');}
  function install(){for(const [key,d] of Object.entries(ArtChars)){if(!d||!d.draw)continue;const id=identify(key),base=originals[key]||originals[id];if(!kind(id)&&!base&&!originals[{darkKnight:'deathKnight',darkLord:'deathKnight',wolfRider:'warg',shade:'wraith',pharaoh:'mummy',treantKing:'treant',magmaLord:'magmaGolem'}[id]])continue;ArtChars[key]={...d,chibi:true,__3d:false,draw:(g,P)=>draw(g,id,P,d.tall),box:[d.tall*2.4,d.tall*1.6,d.tall*1.2,d.tall*1.35]};}
    const oldHero=ArtChars.heroKey;ArtChars.heroKey=function(id,tiers){const key=oldHero(id,tiers);const d=ArtChars[key];d.draw=(g,P)=>draw(g,id,P,d.tall);d.chibi=true;d.__3d=false;return key;};if(window.Art3D)Art3D.dirKey=()=>null;if(window.Painter)Painter.clear();}
  function captureLegacy(){for(const [key,d] of Object.entries(ArtChars))if(d&&d.draw)originals[key]={...d};}
  window.ArtStylized={draw,kind,identify,install,captureLegacy,ink:true,originals};
})();
