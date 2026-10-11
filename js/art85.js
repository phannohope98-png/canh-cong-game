/* Complete registered painted figures. No limb slicing or uniform walking for airborne creatures. */
(function(){
 const root=new URL('../assets/sprites/',document.currentScript.src),entries=new Map(),promises=[];
 for(const [id,d]of Object.entries(ART85)){const img=new Image(),e={...d,img};entries.set(id,e);promises.push(new Promise((ok,no)=>{img.onload=()=>{e.loaded=true;ok();};img.onerror=()=>no(new Error('Không tải được '+d.file));}));img.src=new URL(d.file,root).href;}
 const alias={};
 const original=ArtStylized.draw;
 function identify(k){return k.replace(/_a\d$|_[bfs]$/,'').replace(/^h_/,'');}
 function blit(g,e,n,H){const f=e.frames[n],z=H/e.height;g.drawImage(e.img,f.x,f.y,f.w,f.h,-e.pivot*z,-e.baseline*z,f.w*z,f.h*z);}
 function draw(g,id,P,H){const e=entries.get(alias[id]||id);if(!e?.loaded)return false;let n=0;
  const actor=P._actor,walk=P.w>=0,attack=P.a>=0,dead=P.d!==undefined;
  if(e.mode==='wolf'){n=attack?8+Math.min(3,Math.floor(P.a*4)):walk?Math.floor(((P.w%1+1)%1)*8):0;}
  else if(actor?.heroSupport85>0)n=5;
  else if(actor?.rolling85)n=4;
  else if(attack)n=3+Math.min(2,Math.floor(P.a*3));
  else if(walk)n=[1,0,2,0][Math.floor(((P.w%1+1)%1)*4)];
  g.save();if(dead){g.rotate(Math.min(1,P.d)*1.3);g.globalAlpha*=1-Math.min(1,P.d)*.8;}
  // Blend entire registered images through contacts: preserve paw/body connectivity.
  if(walk&&!attack&&!dead&&!actor?.rolling85){const sequence=e.mode==='wolf'?[0,1,2,3,4,5,6,7]:[1,0,2,0],q=((P.w%1+1)%1)*sequence.length,i=Math.floor(q),mix=q-i;n=sequence[i];blit(g,e,n,H);if(mix>.85){g.globalAlpha*=(mix-.85)/.15*.35;blit(g,e,sequence[(i+1)%sequence.length],H);}}
  else blit(g,e,n,H);g.restore();return true;
 }
 ArtStylized.draw=function(g,key,P,H=48){const id=identify(key);return draw(g,id,P,H)||original.call(this,g,key,P,H);};
 for(const id of [...entries.keys(),...Object.keys(alias)]){const base=ArtChars[id]||ArtChars.orc;ArtChars[id]={...base,tall:48,dr:12,box:[250,230,125,190],draw:(g,P)=>draw(g,id,P,48)};for(const s of ['_b','_f','_s',...Array.from({length:8},(_,i)=>'_a'+i)])ArtChars[id+s]=ArtChars[id];}
 const ready=Promise.all(promises).then(()=>{window.Painter?.clear();window.PaintedMotion?.clear();});
 window.Art85={ready,entries,draw,blit,version:85};
})();

