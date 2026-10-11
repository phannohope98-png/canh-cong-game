/* Complete painted walk poses; same foot pivot, no idle frames and no double-image blend. */
(function(){
 const root=new URL('../assets/sprites/',document.currentScript.src),entries=new Map(),pending=[];
 for(const [id,d]of Object.entries(WALK87)){
  const img=new Image(),e={...d,img};entries.set(id,e);pending.push(new Promise((ok,no)=>{img.onload=()=>{e.loaded=true;ok();};img.onerror=()=>no(new Error('Walk atlas missing: '+id));}));img.src=new URL(d.file,root).href;
 }
 function paint(g,id,P,H){const e=entries.get(id);if(!e?.loaded||!(P.w>=0)||P.a>=0||P.d!==undefined)return false;
  const phase=((P.w%1)+1)%1,n=Math.min(7,Math.floor(phase*8)),f=e.frames[n],s=H/e.height;
  g.save();g.drawImage(e.img,f.x,f.y,f.w,f.h,-e.pivot*s,-f.baseline*s,f.w*s,f.h*s);g.restore();return true;
 }
 const draw=ArtStylized.draw;ArtStylized.draw=function(g,key,P,H=48){const id=ArtStylized.identify(key);return paint(g,id,P,H)||draw.apply(this,arguments);};
 const art=Art85.draw;Art85.draw=function(g,id,P,H){return paint(g,id,P,H)||art.apply(this,arguments);};
 for(const [key,d]of Object.entries(ArtChars)){const id=ArtStylized.identify(key);if(!entries.has(id)||!d?.draw)continue;const old=d.draw;ArtChars[key]={...d,draw:(g,P)=>paint(g,id,P,d.tall||48)||old(g,P)};}
 // The new archer and drummer atlases retain the original idle/walk/attack row contract.
 for(const [id,d]of Object.entries(ACTOR87)){
  const img=new Image(),e={id:id+'87',img,loaded:false,cols:6,rows:3,registration:d.registration};
  pending.push(new Promise((ok,no)=>{img.onload=()=>{e.loaded=true;ArtStylized.atlases.set(id,e);ArtStylized.atlases.delete(id+'-walk');ok();};img.onerror=()=>no(new Error('Actor atlas missing: '+id));}));img.src=new URL(d.file,root).href;
 }
 const ready=Promise.all(pending).then(()=>{Painter.clear();PaintedMotion.clear();});
 Art85.ready=Promise.all([Art85.ready,ready]);
 window.Walk87={entries,paint,ready,version:87};
})();
