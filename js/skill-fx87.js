/* Painted skill-specific assets plus staged motion, synchronized with combat zones. */
(function(){
 const ids=['aldric','lyra','selene','borin','nara','veyra','thalen','oria','haldren','brakka','ilyen','maera'];
 const img=new Image(),root=new URL('../assets/sprites/',document.currentScript.src);
 const ready=new Promise((ok,no)=>{img.onload=ok;img.onerror=()=>no(new Error('Skill atlas 87 missing'));});img.src=new URL('skill-fx87.webp',root).href;
 const colors=['#bddbf5','#c6e994','#c6a1f5','#efad65','#ed897b','#ebcf91','#b2da89','#c2a4f2','#efcf8d','#ed8e80','#c3e89f','#c2dcef'];
 const ease=v=>1-Math.pow(1-Math.max(0,Math.min(1,v)),3);
 function sprite(g,id,slot,x,y,size,alpha=1,angle=0){if(!img.naturalWidth)return;const index=ids.indexOf(id)*2+slot;if(index<0)return;const cw=img.naturalWidth/4,ch=img.naturalHeight/6;g.save();g.translate(x,y);g.rotate(angle);g.globalAlpha*=Math.max(0,alpha);g.drawImage(img,index%4*cw,Math.floor(index/4)*ch,cw,ch,-size/2,-size*.66,size,size);g.restore();}
 function draw(g,id,slot,x,y,r,t,life=1.5,z={}){
  if(z.physical&&id==='oria')id='borin';const i=ids.indexOf(id);if(i<0)return;
  const color=colors[i],impact=z.impact??.35,age=Math.max(0,t-impact),q=ease(age/.45),s=Math.min(105,Math.max(36,r*1.1));
  const hold=z.mine||['ilyen','maera'].includes(id)||(id==='thalen'&&slot)||(id==='selene'&&slot);
  const fade=hold?Math.min(1,t*7,(life-t)*4):Math.min(1,t*10,Math.max(0,1-age/.95));
  g.save();g.lineCap='round';g.lineJoin='round';
  // Trails terminate exactly at the same enemy used by the command, not arbitrary ground.
  if(z.tx!==undefined){const tx=z.tx,ty=z.ty??y,k=ease(t/.3);g.strokeStyle=color;g.lineWidth=id==='brakka'?1.7:2;g.globalAlpha=fade*.8;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo((x+tx)/2,(y+ty)/2-12,x+(tx-x)*k,y+(ty-y)*k);g.stroke();sprite(g,id,slot,x+(tx-x)*k,y+(ty-y)*k,s*.65,fade,0);}
  else if(z.mine){sprite(g,id,slot,x,y,34,fade);g.fillStyle='#ffbc70';g.globalAlpha=fade*(.3+.5*Math.sin(t*5)**2);g.beginPath();g.arc(x,y-15,2,0,7);g.fill();}
  else if(z.impact!==undefined&&t<impact){const k=ease(t/impact),py=y-75*(1-k);g.globalAlpha=.5;g.strokeStyle=color;g.lineWidth=2;g.beginPath();g.moveTo(x-4,py-20);g.lineTo(x,py+4);g.stroke();sprite(g,id,slot,x,py,s*.42,Math.min(1,t*10),-.2*(1-k));}
  else {
   const angle=(id==='brakka'&&!slot)?age*5:(id==='nara'&&!slot)?-.25+q*.5:0;
   const scale=hold?1+Math.sin(t*3)*.035:.45+.65*q;
   sprite(g,id,slot,x,y-2,s*scale,fade,angle);
   // Small radial debris/light marks move outward then fall and disappear.
   if(!hold&&age<.8)for(let n=0;n<7;n++){const a=n*2.399,dist=r*.48*ease(age/.65),px=x+Math.cos(a)*dist,py=y+Math.sin(a)*dist*.36-16*Math.sin(Math.min(1,age/.8)*Math.PI);g.globalAlpha=fade*.65;g.fillStyle=color;g.beginPath();g.ellipse(px,py,1.3+1.2*(1-q),1, a,0,7);g.fill();}
  }
  g.restore();
 }
 SkillFx59.draw=draw;
 window.SkillFx87={draw,sprite,ready,ids,version:87};
 ArtVfx85.ready=Promise.all([ArtVfx85.ready,ready]);
})();
