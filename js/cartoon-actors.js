/* Shared compact 2D atlases; no WebGL context or 3D model initialization. */
(function(){
  const base=new URL('../assets/sprites/',document.currentScript.src),images=new Map(),atlases=new Map();
  const aliases={soldierShield:'soldier',blackOrc:'orc',orcArcher:'orc',treantKing:'treant',trollKing:'troll',magmaLord:'magmaGolem',darkKnight:'deathKnight',darkLord:'deathKnight',shade:'wraith',voidWalker:'wraith',voidLord:'voidling',pharaoh:'mummy',orct:'orc'};
  for(const [id,s] of Object.entries(ATLAS55)){
    if(!images.has(s.file)){const img=new Image(),v={img};v.ready=new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Không tải được '+s.file));});img.src=new URL(s.file,base).href;images.set(s.file,v);}
    const v=images.get(s.file),entry={id,img:v.img,registration:s.registration,loaded:false};entry.ready=v.ready.then(()=>{entry.loaded=true;return entry;});atlases.set(id,entry);
  }
  for(const [a,b] of Object.entries(aliases))atlases.set(a,atlases.get(b));
  function identify(key){if(key==='hero')return window.Save?.data?.hero||'aldric';const h=/(?:h_|c_)(aldric|lyra|selene|borin|nara|veyra|thalen|oria|haldren|brakka)/.exec(key);if(h)return h[1];return key.replace(/_a\d$|_[bfs]$/,'').replace(/s[0-5]$/i,'').replace(/[1-4]$/,'');}
  function blit(g,e,n,H){const r=e.registration,f=r.frames[n],s=H/r.height;g.save();const x=((f.offset||0)-r.pivot)*s,y=-f.baseline*s;if(f.clipRects){if(!f.path){f.path=new Path2D();f.clipRects.forEach(b=>f.path.rect(...b));}g.translate(x,y);g.scale(s,s);g.clip(f.path);g.drawImage(e.img,f.x,f.y,f.w,f.h,0,0,f.w,f.h);}else g.drawImage(e.img,f.x,f.y,f.w,f.h,x,y,f.w*s,f.h*s);g.restore();}
  function draw(g,key,P,H=48){const id=identify(key),e=atlases.get(id);if(!e?.loaded)return false;const dead=P.d!==undefined,attack=P.a>=0,walk=P.w>=0,phase=attack?Math.min(.9999,P.a):walk?((P.w%1)+1)%1:0,n=dead?0:(attack?12:walk?6:0)+Math.floor(phase*6);g.save();if(dead){g.rotate(Math.min(1,P.d)*1.3);g.globalAlpha*=1-Math.min(1,P.d)*.8;}else if(!walk&&!attack){const b=Math.sin((P.t||0)*2.1);g.scale(1-b*.004,1+b*.006);}if(!dead&&window.PaintedMotion&&PaintedMotion.render(g,e.id,P,H,e,n,6,phase)){g.restore();return true;}blit(g,e,n,H);g.restore();return true;}
  function install(){
    const keys=new Set([...Object.keys(ArtChars),...atlases.keys(),...Object.keys(CONFIG.enemies)]);
    for(const key of keys){const id=identify(key);if(!atlases.has(id))continue;const d=ArtChars[key]||{};ArtChars[key]={...d,tall:48,dr:12,wide:48,head:24,chibi:true,__3d:false,box:[150,110,75,80],draw:(g,P)=>draw(g,id,P,48)};}
    ArtChars.heroKey=id=>id;Painter.clear();
  }
  window.ArtStylized={atlases,draw,identify,atlasKey:id=>aliases[id]||id,blit,install,captureLegacy(){},kind:()=>true,ink:true,originals:{},ready:Promise.all([...images.values()].map(v=>v.ready)),stride(key,H=48){const id=identify(key);return H*(id==='soldier'||CONFIG.heroes[id]?.race?.length ? .95 : ['warg','frostWolf','wolfRider'].includes(id)?.8:['treant','troll','magmaGolem'].includes(id)?.55:.65);}};
})();
