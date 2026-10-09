/* Equipment changes a fitted surface, not a miniature inventory object. */
(function(){
 const old=PaintedWorld.layout;
 PaintedWorld.layout=function(type,tier,scale=1){const oldH=[88,91,94,98][tier-1],L=old.call(this,type,tier,scale*[62,64,66,68][tier-1]/oldH);L.crewSize=type==='mage'?24:23;if(type==='artillery')L.crew=null;return L;};
 PaintedWorld.drawFitting=function(g,type,tier,it,time,f){const s=it.s,p=PaintedWorld.mounts[type][tier-1][s],x=p[0]*f.w,y=p[1]*f.h,H=f.h,W=f.w,myth=it.r===5,C=({barracks:'#427aaa',archer:'#83b165',mage:'#a18acb',artillery:'#d4a46d'})[type],ink='#493b2b',metal=it.r<3?'#a69772':it.r===3?'#bfb796':myth?'#e2b85c':'#d6b371';g.save();g.translate(x,y);g.lineJoin='round';g.lineCap='round';
  const grad=(top,bottom,span=H*.18)=>{const q=g.createLinearGradient(-10,-span/2,8,span/2);q.addColorStop(0,top);q.addColorStop(.45,bottom);q.addColorStop(1,ArtKit.shade(bottom,-.24));return q;};
  const path=(points,fill,stroke=ink,lw=H*.006)=>{g.beginPath();points.forEach((v,i)=>i?g.lineTo(...v):g.moveTo(...v));g.closePath();g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=lw;g.fill();g.stroke();};
  const line=(pts,col=metal,lw=H*.013)=>{g.beginPath();pts.forEach((v,i)=>i?g.lineTo(...v):g.moveTo(...v));g.strokeStyle=ink;g.lineWidth=lw+H*.007;g.stroke();g.strokeStyle=col;g.lineWidth=lw;g.stroke();};
  const rivet=(xx,yy,r=H*.006)=>{g.fillStyle='#f7dda0';g.strokeStyle=ink;g.lineWidth=H*.003;g.beginPath();g.arc(xx,yy,r,0,7);g.fill();g.stroke();};
  const gem=(r,col=C)=>{path([[0,-r],[r*.64,0],[0,r],[-r*.64,0]],grad('#f2f4d9',col,r*2));line([[0,-r*.7],[-r*.2,0],[0,r*.6]],'#f5f5dd',H*.003);};
  if(type==='barracks'){
   if(s===0){const w=W*.19,h=H*.17;g.translate(W*.011,0);g.fillStyle=grad('#dae7ed',myth?'#2a577e':C,h);g.strokeStyle=ink;g.lineWidth=H*.007;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(w*.35,-h*.1,w*.65,h*.12,w,Math.sin(time*2)*h*.04);g.lineTo(w*.87,h*.86);g.bezierCurveTo(w*.55,h*1.05,w*.22,h*.78,0,h*.85);g.closePath();g.fill();g.stroke();g.translate(w*.45,h*.4);gem(h*.18,myth?'#fff1b0':'#ecc566');}
   else if(s===1){const w=W*.16,h=H*.22;g.fillStyle=grad('#c18c50','#805338',h);g.strokeStyle=metal;g.lineWidth=H*.012;g.beginPath();g.moveTo(-w/2,h*.48);g.lineTo(-w/2,-h*.25);g.quadraticCurveTo(0,-h*.87,w/2,-h*.25);g.lineTo(w/2,h*.48);g.closePath();g.fill();g.stroke();for(let i=-2;i<=2;i++)line([[i*w/6,-h*.23],[i*w/6,h*.4]],'#62462f',H*.004);for(const yy of [-h*.15,h*.3]){line([[-w*.46,yy],[w*.46,yy]],metal,H*.017);rivet(-w*.36,yy);rivet(w*.36,yy);}rivet(0,h*.09,H*.012);if(myth){g.translate(0,-h*.18);gem(h*.12,'#d99b56');}}
   else if(s===2){const r=H*.048;path([[-r*.8,-r],[r*.8,-r],[r*.65,r*.35],[0,r],[-r*.65,r*.35]],grad('#f2dea5',metal));gem(r*.55,C);}
   else if(s===3){g.translate(-x,-y);const poly=[[[.24,.33],[.53,.13],[.78,.41],[.43,.46]],[[.18,.29],[.5,.11],[.74,.39],[.42,.44]],[[.29,.29],[.56,.10],[.78,.37],[.43,.4]],[[.27,.23],[.53,.09],[.72,.30],[.44,.37]]][tier-1];g.beginPath();poly.forEach(([a,b],i)=>i?g.lineTo(a*W,b*H):g.moveTo(a*W,b*H));g.closePath();g.clip();g.globalAlpha=myth?.4:.22;g.fillStyle=C;g.fillRect(0,0,W,H);g.globalAlpha=1;for(let i=0;i<3;i++)line([[W*(.32+i*.045),H*(.21+i*.048)],[W*(.64+i*.06),H*(.34+i*.048)]],metal,H*.008);}
   else if(s===4){for(const dx of [-W*.035,W*.035]){line([[dx,-H*.09],[dx,H*.065]],metal,H*.018);for(const yy of [-H*.07,H*.045])rivet(dx,yy);}if(myth)gem(H*.019,'#ead490');}
   else{line([[-W*.026,-H*.074],[W*.026,-H*.074],[W*.026,-H*.025]],'#705334',H*.014);const r=H*.026;path([[-r,r],[r,r],[r*.7,-r*.55],[0,-r],[-r*.7,-r*.55]],grad('#f1d28b',metal));rivet(0,r*1.2,r*.2);}
  }else if(type==='archer'){
   if(s===0){for(let i=0;i<4;i++){const a=i*Math.PI/2+time*.3;path([[0,0],[Math.cos(a)*H*.043,Math.sin(a)*H*.043],[Math.cos(a+.7)*H*.036,Math.sin(a+.7)*H*.036]],grad('#d6e3a2',myth?'#f0d588':C));}rivet(0,0,H*.009);}
   else if(s===1){line([[-W*.10,H*.025],[W*.1,H*.025]],'#8d6839',H*.025);for(let i=-1;i<=1;i++){g.save();g.translate(i*W*.065,0);g.beginPath();g.moveTo(-H*.018,-H*.055);g.quadraticCurveTo(H*.027,0,-H*.018,H*.05);g.strokeStyle=ink;g.lineWidth=H*.016;g.stroke();g.strokeStyle=metal;g.lineWidth=H*.01;g.stroke();line([[-H*.018,-H*.05],[-H*.018,H*.045]],'#ebdda4',H*.003);g.restore();}}
   else if(s===2){path([[-W*.028,-H*.012],[W*.028,-H*.01],[W*.024,H*.046],[-W*.021,H*.051]],grad('#b1844c','#745531'));for(let i=-1;i<=1;i++)line([[i*W*.014,H*.025],[i*W*.014,-H*.055]],metal,H*.005);}
   else if(s===3){line([[0,0],[0,H*.022]],'#805b35',H*.025);line([[-W*.045,-H*.009],[W*.045,-H*.009]],metal,H*.026);rivet(W*.04,-H*.009,H*.016);}
   else if(s===4){path([[-W*.023,H*.031],[W*.023,H*.031],[W*.018,-H*.022],[-W*.018,-H*.022]],grad('#f2d092',C));line([[-W*.02,H*.031],[W*.02,H*.031]],'#7f633c',H*.012);}
   else{for(const dx of [-W*.07,0,W*.07]){line([[dx,-H*.065],[dx*.8,-H*.02],[dx*1.4,H*.015]],myth?'#d6b477':'#8d7652',H*.012);}}
  }else if(type==='mage'){
   if(s===0||s===2){gem(H*(s===0?.056:.029));}
   else if(s===1){g.strokeStyle=metal;g.lineWidth=H*.009;g.beginPath();g.ellipse(0,0,W*.15,H*.026,-.08,0,7);g.stroke();for(const dx of [-W*.14,W*.14]){g.save();g.translate(dx,0);gem(H*.016);g.restore();}}
   else if(s===3){line([[0,-H*.12],[0,H*.09],[W*.035,H*.115]],myth?'#d7b77b':'#91bcc5',H*.019);for(const yy of [-H*.075,H*.055])line([[-H*.018,yy],[H*.018,yy]],metal,H*.01);}
   else if(s===4){g.fillStyle=grad('#e0f3ec',C);g.strokeStyle=metal;g.lineWidth=H*.008;g.beginPath();g.ellipse(0,0,W*.029,H*.034,-.1,0,7);g.fill();g.stroke();}
   else{for(let k=-1;k<=1;k++)line([[k*W*.03-H*.01,-H*.007],[k*W*.03,H*.014],[k*W*.03+H*.011,-H*.007]],C,H*.008);}
  }else{
   // These positions belong to the NEW complete artillery body.
   g.translate(-x,-y);const pt=[[.7,.55],[.85,.55],[.43,.57],[.72,.79],[.43,.37],[.6,.91]][s];g.translate(pt[0]*W,pt[1]*H);
   if(s===2){path([[-W*.035,-H*.07],[W*.035,-H*.07],[W*.036,H*.04],[-W*.033,H*.04]],grad('#ceae76','#87643b'));for(const yy of [-H*.05,H*.024])line([[-W*.034,yy],[W*.034,yy]],metal,H*.014);}
   else if(s===3){const r=H*.051;g.strokeStyle=ink;g.lineWidth=H*.021;g.beginPath();g.arc(0,0,r,0,7);g.stroke();g.strokeStyle=metal;g.lineWidth=H*.014;g.stroke();for(let k=0;k<8;k++){const a=k*Math.PI/4;line([[Math.cos(a)*r*.8,Math.sin(a)*r*.8],[Math.cos(a)*r*1.2,Math.sin(a)*r*1.2]],metal,H*.015);}rivet(0,0,r*.28);}
   else if(s===4){line([[-W*.03,-H*.05],[-W*.03,H*.043],[W*.027,H*.043]],metal,H*.014);g.fillStyle=grad('#f9c576','#d57834');g.beginPath();g.ellipse(0,0,H*.02,H*.03,0,0,7);g.fill();}
   else if(s===5){for(const dx of [-W*.13,W*.13]){line([[dx,-H*.13],[dx*1.08,-H*.015],[dx*1.15,H*.018]],metal,H*.023);rivet(dx,-H*.10,H*.009);rivet(dx*1.08,-H*.015,H*.009);}}
  }
  g.restore();
 };
 const pose=(tier,scale,st)=>{const h=PaintedWorld.layout('artillery',tier,scale).h;return {h,x:h*.18,y:-h*.44,w:h*.58,face:st?.face||1,angle:st?.cannonAngle||0,recoil:st?.a>=.5&&st.a<.85?Math.sin((st.a-.5)/.35*Math.PI)*2*scale:0};};
 Cannon58.pose=pose;Cannon58.body=function(g,tier,h){PaintedWorld.blit(g,'artillery59',tier-1,0,0,h,false);};
 Cannon58.barrel=function(g,tier,scale,st,time){const sh=PaintedWorld.sheets.artillery59;if(!sh?.loaded)return;const p=pose(tier,scale,st),f=sh.frames[4+tier-1],z=p.w/f.w;g.save();g.translate(p.x,p.y);g.scale(p.face,1);g.rotate(p.angle*p.face);g.translate(-p.recoil,0);g.drawImage(sh.img,f.x,f.y,f.w,f.h,-p.w*.34,-f.h*z*.5,p.w,f.h*z);
  const list=Items.mods('artillery').list;for(const it of list){if(!it||it.s>1)continue;g.strokeStyle=it.r===5?'#edbd5e':'#d3ba80';g.lineWidth=it.s===1?2.7*scale:1.6*scale;if(it.s===1){g.beginPath();g.ellipse(p.w*.57,0,2.5*scale,f.h*z*.45,0,0,7);g.stroke();}else{g.beginPath();g.moveTo(-p.w*.12,-f.h*z*.49);g.lineTo(-p.w*.12,-f.h*z*.85);g.lineTo(p.w*.14,-f.h*z*.85);g.stroke();g.fillStyle='#8faf9f';g.beginPath();g.arc(p.w*.14,-f.h*z*.85,2*scale,0,7);g.fill();}}
  if(st?.a>=.5&&st.a<.67){const k=1-(st.a-.5)/.17;g.fillStyle='#ffd68b';g.beginPath();g.moveTo(p.w*.66,-3*k);g.lineTo(p.w*.66+13*k,-7*k);g.lineTo(p.w*.66+8*k,0);g.lineTo(p.w*.66+11*k,5*k);g.lineTo(p.w*.66,3*k);g.fill();}g.restore();};
 Cannon58.muzzle=function(T,scale=1){const p=pose(T.level,scale,T.anim),d=p.w*.66-p.recoil;return{x:T.x+p.x+Math.cos(p.angle)*d*p.face,y:T.y+2+p.y+Math.sin(p.angle)*d};};
})();
