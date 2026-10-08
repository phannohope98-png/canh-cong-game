/* Painted modular world. Terrain and path geometry remain playable and editable. */
(function(){
  'use strict';
  const base=new URL('../assets/sprites/',document.currentScript.src),sheets={},icons=new Map();
  const DATA={"env-forest":{"file":"env-forest-painted52.webp","frames":[{"x":13,"y":3,"w":349,"h":413},{"x":422,"y":5,"w":302,"h":411},{"x":759,"y":1,"w":287,"h":431},{"x":1114,"y":110,"w":314,"h":296},{"x":28,"y":450,"w":334,"h":270},{"x":415,"y":462,"w":308,"h":266},{"x":763,"y":471,"w":296,"h":252},{"x":1096,"y":406,"w":339,"h":324},{"x":78,"y":722,"w":205,"h":348},{"x":401,"y":728,"w":323,"h":341},{"x":802,"y":749,"w":279,"h":295},{"x":1193,"y":743,"w":185,"h":320}]},"env-castle":{"file":"env-castle-painted52.webp","frames":[{"x":17,"y":9,"w":345,"h":360},{"x":455,"y":8,"w":152,"h":370},{"x":724,"y":89,"w":310,"h":269},{"x":1091,"y":83,"w":333,"h":280},{"x":28,"y":411,"w":318,"h":273},{"x":397,"y":391,"w":300,"h":299},{"x":743,"y":386,"w":305,"h":334},{"x":1096,"y":365,"w":319,"h":341},{"x":89,"y":684,"w":192,"h":391},{"x":367,"y":690,"w":356,"h":376},{"x":757,"y":751,"w":329,"h":293},{"x":1219,"y":714,"w":116,"h":354}]},"env-desert":{"file":"env-desert-painted52.webp","frames":[{"x":18,"y":9,"w":343,"h":354},{"x":433,"y":5,"w":258,"h":359},{"x":774,"y":123,"w":250,"h":243},{"x":1110,"y":15,"w":324,"h":350},{"x":10,"y":392,"w":352,"h":297},{"x":385,"y":370,"w":324,"h":332},{"x":724,"y":454,"w":353,"h":246},{"x":1092,"y":369,"w":354,"h":333},{"x":29,"y":692,"w":257,"h":377},{"x":362,"y":708,"w":362,"h":366},{"x":786,"y":700,"w":300,"h":359},{"x":1205,"y":709,"w":183,"h":361}]},"env-ice":{"file":"env-ice-painted52.webp","frames":[{"x":22,"y":3,"w":309,"h":353},{"x":370,"y":11,"w":344,"h":347},{"x":748,"y":88,"w":316,"h":265},{"x":1121,"y":16,"w":297,"h":337},{"x":11,"y":392,"w":339,"h":304},{"x":375,"y":399,"w":332,"h":312},{"x":744,"y":377,"w":322,"h":346},{"x":1098,"y":371,"w":340,"h":339},{"x":64,"y":696,"w":227,"h":378},{"x":362,"y":711,"w":362,"h":361},{"x":742,"y":791,"w":344,"h":271},{"x":1189,"y":735,"w":194,"h":324}]},"env-lava":{"file":"env-lava-painted52.webp","frames":[{"x":29,"y":8,"w":323,"h":359},{"x":424,"y":4,"w":265,"h":375},{"x":766,"y":130,"w":302,"h":237},{"x":1137,"y":28,"w":285,"h":333},{"x":24,"y":404,"w":338,"h":275},{"x":394,"y":404,"w":316,"h":278},{"x":735,"y":458,"w":337,"h":231},{"x":1103,"y":361,"w":331,"h":343},{"x":49,"y":685,"w":268,"h":375},{"x":362,"y":682,"w":362,"h":374},{"x":773,"y":778,"w":313,"h":261},{"x":1207,"y":710,"w":209,"h":363}]},"env-chaos":{"file":"env-chaos-painted52.webp","frames":[{"x":17,"y":5,"w":345,"h":364},{"x":431,"y":4,"w":242,"h":365},{"x":740,"y":46,"w":345,"h":317},{"x":1144,"y":17,"w":271,"h":345},{"x":106,"y":380,"w":155,"h":273},{"x":383,"y":380,"w":340,"h":309},{"x":766,"y":368,"w":272,"h":324},{"x":1116,"y":363,"w":312,"h":333},{"x":50,"y":683,"w":248,"h":397},{"x":380,"y":689,"w":344,"h":379},{"x":754,"y":730,"w":332,"h":334},{"x":1191,"y":698,"w":209,"h":371}]},"equipment":{"file":"equipment-painted52.webp","frames":[{"x":21,"y":19,"w":226,"h":186},{"x":293,"y":10,"w":181,"h":195},{"x":544,"y":10,"w":200,"h":198},{"x":796,"y":12,"w":225,"h":194},{"x":1062,"y":23,"w":215,"h":174},{"x":1321,"y":15,"w":183,"h":190},{"x":21,"y":215,"w":219,"h":195},{"x":289,"y":205,"w":196,"h":216},{"x":552,"y":212,"w":170,"h":179},{"x":799,"y":211,"w":205,"h":205},{"x":1067,"y":197,"w":211,"h":227},{"x":1350,"y":210,"w":153,"h":217},{"x":14,"y":411,"w":234,"h":210},{"x":262,"y":421,"w":220,"h":187},{"x":561,"y":403,"w":155,"h":214},{"x":807,"y":421,"w":191,"h":187},{"x":1080,"y":424,"w":169,"h":197},{"x":1303,"y":431,"w":219,"h":169},{"x":8,"y":621,"w":247,"h":183},{"x":291,"y":608,"w":204,"h":197},{"x":538,"y":617,"w":197,"h":191},{"x":803,"y":608,"w":180,"h":200},{"x":1029,"y":622,"w":251,"h":188},{"x":1316,"y":600,"w":213,"h":218},{"x":16,"y":804,"w":238,"h":211},{"x":285,"y":805,"w":195,"h":203},{"x":523,"y":811,"w":187,"h":201},{"x":774,"y":817,"w":250,"h":198},{"x":1100,"y":810,"w":140,"h":200},{"x":1303,"y":818,"w":223,"h":176}]},"towers":{"file":"towers-painted52.webp","frames":[{"x":43,"y":48,"w":212,"h":207},{"x":338,"y":33,"w":244,"h":221},{"x":635,"y":13,"w":250,"h":240},{"x":932,"y":3,"w":289,"h":253},{"x":33,"y":266,"w":223,"h":248},{"x":332,"y":268,"w":246,"h":245},{"x":626,"y":258,"w":258,"h":253},{"x":928,"y":257,"w":288,"h":268},{"x":54,"y":531,"w":204,"h":245},{"x":333,"y":516,"w":238,"h":265},{"x":616,"y":511,"w":288,"h":271},{"x":939,"y":525,"w":279,"h":256},{"x":27,"y":799,"w":229,"h":191},{"x":335,"y":792,"w":252,"h":203},{"x":623,"y":784,"w":266,"h":219},{"x":931,"y":781,"w":288,"h":218},{"x":21,"y":1010,"w":256,"h":237},{"x":321,"y":996,"w":272,"h":250},{"x":615,"y":1003,"w":282,"h":249},{"x":922,"y":999,"w":302,"h":263}]}};
  for(const [id,spec] of Object.entries(DATA)){
    const img=new Image(),s=sheets[id]={...spec,img,loaded:false};
    s.ready=new Promise(resolve=>{img.onload=()=>{s.loaded=true;resolve(true);};img.onerror=()=>{console.warn('Painted asset unavailable:',id);resolve(false);};});
    img.src=new URL(spec.file,base).href;
  }
  function blit(g,id,n,x,y,h,flip){
    const s=sheets[id];if(!s||!s.loaded)return false;
    const f=s.frames[n];if(!f)return false;
    const z=h/f.h,w=f.w*z;
    g.save();g.translate(x,y);if(flip)g.scale(-1,1);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.drawImage(s.img,f.x,f.y,f.w,f.h,-w/2,-h,w,h);g.restore();return true;
  }
  const slots={tree:0,pine:2,snowpine:0,palm:0,cactus:1,deadtree:5,bush:3,drybush:3,rock:4,mesa:4,spire:1,stump:5,mush:6,bones:6,icecrystal:3,redcrystal:3,voidcrystal:3,rune:6,cabin:7,house:7,tent:7,ruin:6,monument:8,gateway:8,castle:9,fort:9,portal:9,well:10,barrel:10,crate:10,hay:10,lamp:11,brazier:11};
  const heights={tree:90,pine:100,snowpine:104,palm:100,cactus:64,deadtree:76,bush:34,drybush:30,rock:34,mesa:84,spire:105,stump:30,mush:25,bones:26,icecrystal:45,redcrystal:44,voidcrystal:46,rune:46,cabin:82,house:88,tent:70,ruin:62,monument:108,gateway:115,castle:210,fort:190,portal:190,well:56,barrel:30,crate:32,hay:32,lamp:48,brazier:45};
  const names=['sword','shield','helm','armor','drum','gem','bow','quiver','feather','potion','tree','crystal','book','staff','frost','ring','rune','scope','cannon','bomb','gear','fire','anvil','axe','helmet','glove','boot','chest','medallion','crown'];
  function icon(name){
    if(icons.has(name))return icons.get(name);
    const n=names.indexOf(name),s=sheets.equipment;if(n<0||!s||!s.loaded)return null;
    const f=s.frames[n],c=document.createElement('canvas');c.width=c.height=128;
    const g=c.getContext('2d'),z=112/Math.max(f.w,f.h);g.imageSmoothingQuality='high';
    g.drawImage(s.img,f.x,f.y,f.w,f.h,(128-f.w*z)/2,(128-f.h*z)/2,f.w*z,f.h*z);
    const u=c.toDataURL('image/png');icons.set(name,u);return u;
  }
  const types=['barracks','archer','mage','artillery','orc'];
  const api=window.PaintedWorld={enabled:true,sheets,blit,icon,names,ready:Promise.all(Object.values(sheets).map(s=>s.ready)),
    prop(g,d,theme){
      const n=slots[d.k];if(n===undefined)return false;
      const h=(heights[d.k]||48)*(d.prop?1:d.s||1),flip=!d.prop&&d.flip<0;
      return blit(g,'env-'+theme,n,d.x,d.y+3,h,flip);
    },
    install(){
      // One atlas blit per actor avoids hundreds of large offscreen frame canvases.
      const oldChar=Painter.char;
      Painter.char=function(g,type,x,y,scale,face,mode,phase,ppu,aim){
        const d=ArtChars[type],id=ArtStylized.identify(type),atlas=ArtStylized.atlases.get(ArtStylized.atlasKey(id));
        if(!d||!d.chibi||!atlas?.loaded)return oldChar.call(this,g,type,x,y,scale,face,mode,phase,ppu,aim);
        const P={w:-1,a:-1,t:0};if(mode==='walk')P.w=phase;else if(mode==='atk')P.a=phase;else if(mode==='die')P.d=phase;else P.t=phase;
        g.save();g.translate(x,y);if(face<0)g.scale(-1,1);
        if(mode!=='die'){g.fillStyle='rgba(15,29,26,.19)';g.beginPath();g.ellipse(0,1,d.tall*scale*.3,d.tall*scale*.085,0,0,Math.PI*2);g.fill();}
        ArtStylized.draw(g,id,P,d.tall*scale);g.restore();
      };
      const oldIcons=window.Icons3D;
      window.Icons3D={has:n=>names.includes(n)||!!(oldIcons&&oldIcons.has(n)),url:(n,...args)=>icon(n)||(oldIcons&&oldIcons.url(n,...args))};
      const oldTower=Painter.tower;
      Painter.tower=function(g,type,tier,x,y,scale,t,st){
        const row=types.indexOf(type),h=(94+tier*14)*scale;
        if(row<0||!sheets.towers?.loaded)return oldTower.call(this,g,type,tier,x,y,scale,t,st);
        g.save();g.translate(x,y+7*scale);
        ArtKit.shadow(g,5*scale,3*scale,37*scale,11*scale,.23);
        const recoil=st&&st.a>=0?Math.sin(Math.min(1,st.a)*Math.PI)*1.8*scale:0;
        blit(g,'towers',row*4+Math.max(0,Math.min(3,tier-1)),0,recoil,h,false);
        if(type==='mage')ArtKit.glow(g,0,-h*.77,15*scale,'#b284ff',.08+.04*Math.sin(t*2));
        const crew={archer:['elf',12,-.45],mage:['mage',12,-.24],artillery:['dwarf',-27,-.2]}[type];
        if(crew){g.save();g.translate(crew[1]*scale,h*crew[2]);if(st&&st.face<0)g.scale(-1,1);ArtStylized.draw(g,crew[0],{w:-1,a:st?.a>=0?st.a:-1,t},30*scale);g.restore();}
        g.restore();
      };
      Painter.clear();
    }
  };
})();
