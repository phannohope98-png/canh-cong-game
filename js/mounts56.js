/* Fittings are drawn in each building's source coordinates, not as item badges. */
(function(){
 const types=['barracks','archer','mage','artillery'];
 const P={"barracks":[[[0.176,0.097],[0.421,0.821],[0.414,0.464],[0.56,0.244],[0.635,0.755],[0.759,0.709]],[[0.14,0.114],[0.404,0.806],[0.397,0.463],[0.53,0.28],[0.6,0.74],[0.74,0.69]],[[0.179,0.134],[0.431,0.827],[0.422,0.502],[0.57,0.24],[0.6,0.727],[0.793,0.654]],[[0.148,0.139],[0.388,0.835],[0.397,0.517],[0.58,0.26],[0.545,0.8],[0.702,0.635]]],"archer":[[[0.178,0.05],[0.5,0.61],[0.73,0.52],[0.73,0.41],[0.26,0.75],[0.47,0.94]],[[0.216,0.065],[0.43,0.63],[0.62,0.55],[0.61,0.41],[0.27,0.77],[0.48,0.94]],[[0.189,0.119],[0.42,0.63],[0.6,0.53],[0.61,0.4],[0.27,0.76],[0.48,0.94]],[[0.208,0.131],[0.4,0.64],[0.58,0.54],[0.61,0.4],[0.28,0.76],[0.48,0.94]]],"mage":[[[0.502,0.618],[0.51,0.47],[0.39,0.04],[0.17,0.73],[0.79,0.7],[0.5,0.93]],[[0.468,0.655],[0.46,0.49],[0.41,0.04],[0.15,0.76],[0.79,0.72],[0.47,0.93]],[[0.492,0.659],[0.49,0.5],[0.8,0.27],[0.14,0.76],[0.81,0.74],[0.49,0.93]],[[0.508,0.664],[0.5,0.51],[0.87,0.22],[0.13,0.76],[0.81,0.73],[0.5,0.93]]],"artillery":[[[0.623,0.21],[0.83,0.265],[0.42,0.44],[0.411,0.739],[0.355,0.33],[0.5,0.9]],[[0.69,0.189],[0.87,0.25],[0.43,0.46],[0.425,0.652],[0.304,0.33],[0.5,0.92]],[[0.71,0.169],[0.846,0.27],[0.43,0.49],[0.447,0.705],[0.283,0.26],[0.5,0.92]],[[0.796,0.168],[0.913,0.282],[0.4,0.52],[0.482,0.454],[0.237,0.294],[0.5,0.92]]]};
 const crew={archer:[[.52,.54],[.47,.55],[.48,.54],[.50,.56]],mage:[[.48,.53],[.47,.54],[.46,.56],[.48,.57]],artillery:[[.21,.47],[.21,.46],[.21,.45],[.22,.45]]};
 const oldLayout=PaintedWorld.layout;
 PaintedWorld.layout=function(type,tier,scale=1){const L=oldLayout(type,tier,scale),f=WORLD55.towers55.frames[types.indexOf(type)*4+tier-1],c=crew[type]?.[tier-1];if(c)L.crew=['crew-'+({archer:'elf',mage:'mage',artillery:'dwarf'}[type]),(c[0]-.5)*f.w/f.h*L.h,(c[1]-1)*L.h];L.mx=14;L.my=24;if(type==='artillery'){const p=[[.87,.265],[.9,.25],[.9,.25],[.94,.23]][tier-1];L.muzzle=[(p[0]-.5)*f.w/f.h*L.h,(p[1]-1)*L.h];}L.crewSize=type==='artillery'?23:type==='mage'?30:29;return L;};
 function fitting(g,type,tier,it,time,f){const s=it.s,[px,py]=P[type][tier-1][s],x=px*f.w,y=py*f.h,C=Items.rar(it).col,c=it.r<2?'#bdb6a0':it.r<4?'#d1c5a2':C;
  g.save();g.translate(x,y);g.strokeStyle='#494135';g.fillStyle=c;g.lineWidth=2.2;g.lineJoin='round';g.lineCap='round';
  const line=(a,b,col=c,w=3)=>{g.beginPath();g.moveTo(...a);g.lineTo(...b);g.strokeStyle=col;g.lineWidth=w;g.stroke();};
  const box=(x,y,w,h,fill=c)=>{g.fillStyle=fill;g.strokeStyle='#494135';g.lineWidth=2;g.beginPath();g.roundRect(x,y,w,h,2);g.fill();g.stroke();};
  const gem=(r=8)=>{g.fillStyle=C;g.strokeStyle='#eed59a';g.lineWidth=2;g.beginPath();g.moveTo(0,-r);g.lineTo(r*.7,0);g.lineTo(0,r);g.lineTo(-r*.7,0);g.closePath();g.fill();g.stroke();line([0,-r+2],[-r*.25,0],'#eff9dd',1.5);};
  if(type==='barracks'){
   if(s===0){const w=f.w*.17,h=f.h*.15;g.translate(5,0);g.fillStyle=C;g.strokeStyle='#594832';g.lineWidth=1.8;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(w*.3,-3,w*.65,5,w,Math.sin(time*2)*1.5);g.lineTo(w*.91,h);g.bezierCurveTo(w*.6,h+3,w*.3,h-3,0,h);g.closePath();g.fill();g.stroke();g.fillStyle='#ffe9b5';g.beginPath();g.moveTo(w*.45,3);g.lineTo(w*.58,h*.5);g.lineTo(w*.45,h-3);g.lineTo(w*.32,h*.5);g.closePath();g.fill();}
   else if(s===1){const w=f.w*.075,h=f.h*.11;line([-w,-h],[-w,h],c,3);line([w,-h],[w,h],c,3);line([-w,-h*.2],[w,-h*.2],c,4);box(-3,-h*.2,6,9,'#675341');}
   else if(s===2){gem(f.h*.034);}
   else if(s===3){line([-f.w*.12,9],[0,-8],c,3);line([0,-8],[f.w*.12,9],c,3);for(let i=-1;i<=1;i++)line([i*11,-1],[i*11+5,5],'#f3e3aa',1.3);}
   else if(s===4){for(let i=-1;i<=1;i++){line([i*9,-13],[i*9,13],c,3);box(i*9-3,-4,6,7,'#675f4a');}}
   else{line([0,-13],[0,-5],'#6b4b32',3);line([-9,-13],[9,-13],'#6b4b32',3);g.fillStyle=c;g.beginPath();g.moveTo(-8,9);g.quadraticCurveTo(-5,4,-5,-3);g.quadraticCurveTo(0,-11,5,-3);g.quadraticCurveTo(5,4,8,9);g.closePath();g.fill();g.stroke();box(-2,9,4,4);}
  }else if(type==='archer'){
   if(s===0){g.save();g.rotate(Math.sin(time*.5)*.2);for(let i=0;i<4;i++){g.rotate(Math.PI/2);line([0,0],[5,-9],C,3);line([5,-9],[8,-3],c,2);}g.restore();g.fillStyle='#e3c16f';g.beginPath();g.arc(0,0,3,0,7);g.fill();}
   else if(s===1){g.save();g.rotate(.1);box(-6,-8,12,15,c);line([-3,-5],[3,4],'#f3dc9f',1.5);g.restore();}
   else if(s===2){box(-8,-7,16,14,'#775537');for(let i=0;i<3;i++){line([-5+i*5,-12],[-5+i*5,3],'#bd9d5e',1.5);line([-7+i*5,-13],[-3+i*5,-16],C,2);}}
   else if(s===3){line([0,3],[0,12],'#7d593b',3);box(-10,-3,20,7,'#927044');box(8,-5,5,10,C);}
   else if(s===4){box(-7,6,14,4,'#775537');g.fillStyle=C;g.strokeStyle='#664936';g.beginPath();g.roundRect(-4,-5,8,11,2);g.fill();g.stroke();box(-3,-9,6,4,'#bdab80');}
   else{for(let i=-1;i<=1;i++){g.strokeStyle=it.r<3?'#8c733d':c;g.lineWidth=2.5;g.beginPath();g.moveTo(i*9,-10);g.quadraticCurveTo(i*12,0,i*21,5);g.stroke();}}
  }else if(type==='mage'){
   if(s===0){gem(f.h*.044);}
   else if(s===1){g.strokeStyle=c;g.lineWidth=2.2;g.beginPath();g.ellipse(0,0,f.w*.14,5,0,0,Math.PI);g.stroke();for(const q of [-1,1])box(q*f.w*.1-3,-3,6,6,C);}
   else if(s===2){gem(6);line([0,7],[0,15],c,2);}
   else if(s===3){g.strokeStyle=c;g.lineWidth=6;g.beginPath();g.moveTo(0,-13);g.lineTo(0,10);g.quadraticCurveTo(0,16,8,16);g.lineTo(14,16);g.stroke();line([-3,-7],[3,-7],'#ecddad',2);}
   else if(s===4){g.fillStyle=C;g.strokeStyle='#c5ae72';g.lineWidth=2;g.beginPath();g.arc(0,0,6,0,7);g.fill();g.stroke();line([-2,-3],[1,-4],'#f3eddb',2);}
   else{for(let i=-1;i<=1;i++){line([i*13,-4],[i*13+4,1],C,1.8);line([i*13+4,1],[i*13-1,5],C,1.8);}}
  }else{
   if(s===0){box(-9,-3,17,6,'#897350');box(6,-5,4,10,C);line([0,3],[0,9],'#614a35',2);}
   else if(s===1){g.save();g.rotate(-.17);g.fillStyle=c;g.strokeStyle='#514737';g.beginPath();g.ellipse(0,0,4,17,0,0,7);g.fill();g.stroke();line([-1,-11],[-1,9],'#f3d49a',1.5);g.restore();}
   else if(s===2){box(-12,-6,24,14,'#806442');line([-9,-1],[9,-1],c,3);for(const q of [-1,1])line([q*8,-5],[q*8,7],c,2);}
   else if(s===3){g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(0,0,13,0,7);g.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;line([Math.cos(a)*10,Math.sin(a)*10],[Math.cos(a)*16,Math.sin(a)*16],c,3);}g.fillStyle=C;g.beginPath();g.arc(0,0,4,0,7);g.fill();}
   else if(s===4){g.fillStyle=it.r>=4?C:'#e3a556';g.beginPath();g.ellipse(0,0,5,7,0,0,7);g.fill();g.strokeStyle='#6f4a2d';g.lineWidth=2;g.stroke();line([-6,-9],[6,-9],c,2);}
   else{line([-f.w*.12,0],[f.w*.12,0],c,3);for(const q of [-1,1]){line([q*f.w*.1,-7],[q*f.w*.1,7],c,3);box(q*f.w*.1-2,-1,4,4,'#4d4437');}}
  }
  g.restore();
 }
 Painter.tower=function(g,type,tier,x,y,scale,time,st){const row=types.indexOf(type),L=PaintedWorld.layout(type,tier,scale),h=L.h,f=type==='artillery'?WORLD55.artillery59.frames[tier-1]:WORLD55.towers55.frames[row*4+tier-1],z=h/f.h;
  g.save();g.translate(x,y+2);const flipped=false;if(type==='artillery'&&window.Cannon58)Cannon58.body(g,tier,h);else PaintedWorld.blit(g,'towers',row*4+tier-1,0,0,h,false);
  if(L.crew){const [id,cx,cy]=L.crew;g.save();g.translate(cx,cy);g.fillStyle='#3e362f44';g.beginPath();g.ellipse(0,1,10*scale,2*scale,0,0,7);g.fill();if(st?.face<0&&!flipped)g.scale(-1,1);ArtStylized.draw(g,id,{w:-1,a:st?.a>=0?st.a:-1,t:time},L.crewSize*scale);g.restore();}
  if(L.crew){const poly=type==='archer'?[[.15,.54],[.49,.62],[.83,.54],[.83,.76],[.15,.76]]:type==='mage'?[[.22,.56],[.49,.63],[.78,.56],[.78,.72],[.22,.72]]:[[.07,.47],[.25,.52],[.43,.47],[.43,.64],[.07,.64]];g.save();g.beginPath();poly.forEach(([px,py],i)=>i?g.lineTo((px-.5)*f.w*z,(py-1)*h):g.moveTo((px-.5)*f.w*z,(py-1)*h));g.closePath();g.clip();PaintedWorld.blit(g,'towers',row*4+tier-1,0,0,h,false);g.restore();}
  g.save();g.translate(-f.w*z/2,-h);g.scale(z,z);Items.mods(type).list.forEach(it=>{if(it&&!(type==='artillery'&&it.s<2))PaintedWorld.drawFitting(g,type,tier,it,time,f);});g.restore();
  if(type==='artillery'&&window.Cannon58)Cannon58.barrel(g,tier,scale,st,time);if(type==='barracks'&&window.Cannon58)Cannon58.door(g,tier,f,z,st);g.restore();
 };
 PaintedWorld.mounts=P;PaintedWorld.drawFitting=fitting;
})();
