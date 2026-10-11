/* Eight distinct painted frames per skill; art size is independent of damage radius. */
(function(){
 const ids=['aldric','lyra','selene','borin','nara','veyra','thalen','oria','haldren','brakka','ilyen','maera'];
 const root=new URL('../assets/sprites/',document.currentScript.src),images=[];
 const ready=Promise.all([0,1,2,3].map(n=>new Promise((ok,no)=>{const im=new Image();images.push(im);im.onload=ok;im.onerror=()=>no(new Error('Skill animation 88 missing: '+n));im.src=new URL('skill-animation88-'+n+'.webp',root).href;})));
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function frameAt(t,life,hold=false){if(t<0||t>=life)return -1;if(hold&&t>.3&&t<life-.25)return 3+Math.floor((t-.3)*10)%3;if(hold&&t>=life-.25)return clamp(6+Math.floor((t-life+.25)*8),6,7);return clamp(Math.floor(t*14),0,7);}
 function sprite(g,id,slot,x,y,size,alpha=1,angle=0,frame=0){
  const k=ids.indexOf(id)*2+(slot?1:0);if(k<0)return;const im=images[Math.floor(k/6)];if(!im?.naturalWidth)return;
  const cw=im.naturalWidth/8,ch=im.naturalHeight/6;
  g.save();g.translate(x,y);g.rotate(angle);g.globalAlpha*=clamp(alpha,0,1);g.drawImage(im,frame*cw,(k%6)*ch,cw,ch,-size/2,-size*106/128,size,size);g.restore();
 }
 function draw(g,id,slot,x,y,r,t,life=1.5,z={}){
  if(z.physical&&id==='oria')id='borin';if(!ids.includes(id)||t<0||t>=life)return;
  const held=z.mine||['ilyen','maera'].includes(id)||(id==='thalen'&&slot)||(id==='selene'&&slot);
  const size=z.mine?22:held?44:48,impact=z.impact??0,age=t-impact;
  if(z.tx!==undefined){
   const dx=z.tx-x,dy=(z.ty??y)-y,angle=Math.atan2(dy,dx),k=clamp(t/.25,0,1);
   if(t<.3){g.save();g.strokeStyle=id==='brakka'?'#aab4bd':'#bb8bec';g.lineWidth=1.5;g.globalAlpha=.75;g.beginPath();g.moveTo(x,y);g.lineTo(x+dx*k,y+dy*k);g.stroke();g.restore();sprite(g,id,slot,x+dx*k,y+dy*k,30,1,angle,clamp(Math.floor(t*20),0,5));}
   else if(t<.85)sprite(g,id,slot,z.tx,z.ty??y,36,clamp((.85-t)*4,0,1),0,frameAt(t-.3,.55));return;
  }
  if(z.impact!==undefined&&age<0){const k=clamp(t/Math.max(.01,impact),0,1);g.save();g.fillStyle=id==='oria'?'#dac3ff':id==='veyra'?'#f7d587':'#555e69';g.strokeStyle='#fff1c9';g.lineWidth=1;g.translate(x,y-42*(1-k));g.beginPath();g.moveTo(0,-7);g.lineTo(4,0);g.lineTo(0,5);g.lineTo(-4,0);g.closePath();g.fill();g.stroke();g.restore();return;}
  const f=z.mine?Math.floor(t*6)%2:frameAt(age,held?life:Math.min(life-impact,.7),held);if(f<0)return;
  const fade=held?Math.min(1,t*8,(life-t)*6):Math.min(1,(.7-age)*6);sprite(g,id,slot,x,y,size,fade,0,f);
 }
 SkillFx59.draw=draw;
 window.SkillFx87=window.SkillFx88={draw,sprite,ready,ids,frameAt,version:88,frames:8,maxSize:48};
 ArtVfx85.ready=Promise.all([ArtVfx85.ready,ready]);
 SkillArt.detail=function(id,slot){
  const h=CONFIG.heroes[id],s=slot?h.skill2:h.skill;
  UI.overlay(`<div class="ribbon">${slot?'Kỹ năng phụ':'Kỹ năng chính'}</div><div class="skill-detail"><img src="${SkillArt.icon(id,slot)}" alt="${s.name}"><h3>${s.name}</h3><p>${s.short}</p><small>Hồi ${s.cooldown} giây · Mở cấp ${slot?10:1}</small><canvas id="skill-preview" width="340" height="170" aria-label="Hoạt ảnh kỹ năng trong trận"></canvas></div><button class="gbtn sm" data-action="overlay-ok">Đóng</button>`);
  const c=document.getElementById('skill-preview'),g=c.getContext('2d'),start=performance.now();
  function paint(now){
   if(!c.isConnected||document.getElementById('overlay').classList.contains('hidden'))return;
   const t=(now-start)/1000%2,melee=['nara','thalen','brakka'].includes(id)&&!slot;
   g.fillStyle='#738a60';g.fillRect(0,0,340,170);g.fillStyle='#b89a68';g.fillRect(0,110,340,36);
   const hx=melee?100+75*clamp(t/.3,0,1):130;g.save();g.translate(hx,128);ArtStylized.draw(g,id,{w:melee&&t<.3?t*2:-1,a:t>.3&&t<.75?t-.3:-1,t},40);g.restore();
   if(!['ilyen','maera'].includes(id))for(let i=0;i<2;i++){g.save();g.translate(186+i*33,128);ArtStylized.draw(g,'goblin',{w:-1,a:-1,t},32);g.restore();}
   const px=id==='aldric'&&slot||['ilyen','maera'].includes(id)?hx:192;
   const z=['borin','veyra','oria','haldren'].includes(id)&&!slot?{impact:.3}:id==='selene'&&!slot||id==='brakka'&&slot?{tx:192,ty:108}:{};
   draw(g,id,slot,z.tx?hx:px,z.tx?104:128,40,t,1.5,z);requestAnimationFrame(paint);
  }requestAnimationFrame(paint);
 };
})();
