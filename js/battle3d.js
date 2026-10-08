/* One live WebGL scene: procedural terrain, buildings and articulated actors.
 * AnimationMixer samples continuous clip time, rather than sprite frame indices. */
(function(){
  'use strict';
  if(!window.THREE||!window.Art3D)return;
  const T=THREE,EL=.34,se=Math.sin(EL),ce=Math.cos(EL),TAU=Math.PI*2;
  const WX=x=>x/40,WZ=y=>y/(40*se);
  function release(root){if(!root)return;root.removeFromParent();if(root.userData.skeleton)root.userData.skeleton.dispose();root.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
  function identity(o){
    if(o.isHero)return {id:o.heroId,tier:Math.min(4,2+Math.floor((o.tiers||[0,0,0,0]).reduce((s,v)=>s+v,0)/4)),height:o.heroId==='borin'?52:66};
    if(o.tower){const k=o.art||'soldier1',shield=/s([0-4])/.exec(k);return{id:shield?'soldierS'+shield[1]:/^orct/.test(k)?'orc':k.replace(/[1-4].*$/,''),tier:o.tower.level,height:o.art==='wolfRider'?90:50};}
    return{id:o.type.replace(/[23]$/,''),tier:/[23]$/.test(o.type)?+o.type.slice(-1):1,height:(ArtChars[o.art]&&ArtChars[o.art].tall)||45};
  }
  function make(o){
    const spec=identity(o);Chars3D.setDetail(.62);Chars3D.setInk(.23);
    const b=Chars3D.build(spec.id,spec.tier);Art3D.optimizeRig(b.root,b.rig);
    const mixer=new T.AnimationMixer(b.root),actions={};
    b.clips.forEach(c=>{const a=mixer.clipAction(c);if(c.userData&&!c.userData.loop){a.setLoop(T.LoopOnce,1);a.clampWhenFinished=true;}actions[c.name]=a;});
    b.root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(b.root),H=Math.max(.4,bounds.max.y);
    const size=spec.height/(H*ce*40),shadow=new T.Mesh(new T.CircleGeometry((o.radius||12)/40,18),new T.MeshBasicMaterial({color:'#172329',transparent:true,opacity:.20,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;
    return{root:b.root,mixer,actions,spec,size,shadow,current:null};
  }
  function pose(a,o,time){
    let clip=o.atk>=0?'attack':o.moving||o.state==='walk'?'walk':'idle';
    if(o.state==='dead'||o.alive===false)clip='die';
    const action=a.actions[clip]||a.actions.idle;if(!action)return;
    if(a.current!==action){const previous=a.current;action.reset().setEffectiveWeight(1).play();if(previous)previous.crossFadeTo(action,.14,false);a.current=action;}
    const phase=clip==='attack'?Math.min(.999,o.atk):clip==='walk'?((o.walk||0)%1+1)%1:clip==='die'?Math.min(.999,o.dieT||0):((o.idleT===undefined?o.anim===undefined?time:o.anim:o.idleT)/2.618)%1;
    const dt=Math.min(.05,Math.max(0,time-(a.lastTime===undefined?time:a.lastTime)));a.lastTime=time;action.time=action.getClip().duration*Math.max(0,phase);a.mixer.update(dt);
  }
  const api=window.Battle3D={active:false,map:null,actors:new Map(),towers:new Map(),group:null,stats:{drawCalls:0,triangles:0,actors:0},
    setup(map){
      if(this.map===map)return !!map.live3d;
      this.reset();this.map=map;
      if(!map.live3d)return false;
      this.group=new T.Group();this.group.name='live-combat';map.live3d.scene.add(this.group);return true;
    },
    reset(){for(const a of this.actors.values()){a.mixer.stopAllAction();a.mixer.uncacheRoot(a.root);release(a.root);release(a.shadow);}for(const a of this.towers.values())release(a.root);this.actors.clear();this.towers.clear();if(this.group)this.group.removeFromParent();this.group=null;this.active=false;},
    sync(game,time){
      const alive=new Set(),workers=Towers.list.filter(t=>t.type!=='barracks').map(t=>({uid:'worker'+t.spot.id,worker:true,tower:t,art:({archer:'elf',mage:'mage',artillery:'dwarf',orc:'orct'}[t.type])+t.level,x:t.x,y:t.y,radius:10,scale:.55,state:'post',atk:t.anim.a===undefined?-1:t.anim.a,idleT:time,face:t.anim.face||1,target:t.pending}));
      if(!window.ArtStylized)for(const [prefix,list]of [['u',Units.list.concat(workers)],['e',Enemies.list]])for(const o of list){
        if(o.state==='dead'||o.alive===false)continue;
        const key=prefix+o.uid,signature=identity(o);let a=this.actors.get(key);
        if(a&&(a.spec.id!==signature.id||a.spec.tier!==signature.tier)){release(a.root);release(a.shadow);a.mixer.uncacheRoot(a.root);this.actors.delete(key);a=null;}
        if(!a){a=make(o);this.actors.set(key,a);this.group.add(a.root,a.shadow);}
        alive.add(key);pose(a,o,time);
        const height=game.map.live3d.hAt(o.x,o.y),wet=MapArt.wetAt(game.map.feat,o.x,o.y,0),ground=wet?.14:Math.max(-.05,height);
        const platform=o.worker?((Towers3D.TOPS[o.tower.type]||[])[o.tower.level]||35)*Towers.TS/(40*ce):0;
        a.root.position.set(WX(o.x),ground+platform+(o.flying?.6:0),WZ(o.y+(o.worker?0:(o.radius||12)*.25)));a.shadow.visible=!o.worker;
        const scale=a.size*(o.scale||1);a.root.scale.setScalar(scale);
        let aim;
        if(o.target&&o.target.alive!==false)aim=Math.atan2(o.target.x-o.x,(o.target.y-o.y)/se);
        else if(o.moving||o.state==='walk')aim=Math.atan2(o.dvx===undefined?o.tdx||1:o.dvx,(o.dvy===undefined?o.tdy||0:o.dvy)/se);
        else aim=o.face<0?-.65:.65;
        // Smooth facing across the -PI/PI seam, rather than snapping eight ways.
        const delta=Math.atan2(Math.sin(aim-a.root.rotation.y),Math.cos(aim-a.root.rotation.y));a.root.rotation.y+=delta*.2;
        a.shadow.position.set(WX(o.x),Math.max(0,height)+.012,WZ(o.y));a.shadow.scale.set(1,1/se,1);
      }
      for(const [key,a]of this.actors)if(!alive.has(key)){a.mixer.stopAllAction();a.mixer.uncacheRoot(a.root);release(a.root);release(a.shadow);this.actors.delete(key);}
      const towerKeys=new Set();
      for(const tower of Towers.list){const key=tower.spot.id;towerKeys.add(key);let a=this.towers.get(key);
        if(a&&a.level!==tower.level){release(a.root);this.towers.delete(key);a=null;}
        if(!a){const root=Towers3D.build(tower.type,tower.level);if(!root)continue;Art3D.optimize(root);a={root,level:tower.level};this.towers.set(key,a);this.group.add(root);}
        a.root.position.set(WX(tower.x),Math.max(0,game.map.live3d.hAt(tower.x,tower.y)),WZ(tower.y));a.root.scale.setScalar(Towers.TS);
      }
      for(const [key,a]of this.towers)if(!towerKeys.has(key)){release(a.root);this.towers.delete(key);}
    },
    drawTitle(g,map,time){
      if(window.PaintedWorld?.enabled)return false;
      if(!map.live3d||!Art3D.enabled)return false;
      const live=map.live3d;
      if(!window.ArtStylized&&!live.titleActors){
        live.titleActors=['borin','lyra','aldric','selene'].map((id,i)=>{const o={isHero:true,heroId:id,uid:'title'+id,radius:15,art:ArtChars.heroKey(id),idleT:0,atk:-1,state:'post'},a=make(o);a.root.position.set(WX(map.W*.29+(i-1.5)*56),.1,WZ(map.H*.61+(i===2?24:0)));a.root.scale.setScalar(a.size*4.0);a.root.rotation.y=.28+i*.14;live.scene.add(a.root);return{a,o};});
      }
      (live.titleActors||[]).forEach(({a,o},i)=>{o.idleT=time+i*.6;pose(a,o,time);});Chars3D.fx.uTime.value=time;
      live.scene.traverse(o=>{if(o.material&&o.material.userData.shader&&o.material.userData.shader.uniforms.uWaterTime)o.material.userData.shader.uniforms.uWaterTime.value=time;});
      const r=Art3D.renderer(),m=g.getTransform(),W=g.canvas.width,H=g.canvas.height,z=m.a,cam=live.cam;
      cam.left=WX(-m.e/z);cam.right=WX((W-m.e)/z);cam.top=m.f/(z*40);cam.bottom=-(H-m.f)/(z*40);cam.updateProjectionMatrix();r.setSize(W,H,false);r.setViewport(0,0,W,H);r.setScissorTest(false);r.shadowMap.enabled=!!live.sun;r.shadowMap.autoUpdate=false;
      if(!live.shadowsReady){r.shadowMap.needsUpdate=true;live.shadowsReady=true;}r.render(live.scene,cam);g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(r.domElement,0,0,W,H);g.restore();r.shadowMap.enabled=false;
      if(window.ArtStylized){for(const [id,x,y,scale]of [['lyra',-65,-12,.88],['selene',65,-18,.88],['aldric',0,12,1]]){g.save();g.translate(map.W*.29+x,map.H*.61+y);ArtStylized.draw(g,id,{t:time,w:-1,a:-1},190*scale);g.restore();}}
      return true;
    },
    draw(g,game,time){
      if(window.PaintedWorld?.enabled)return this.active=false;
      if(!Art3D.enabled||!this.setup(game.map))return this.active=false;
      const live=game.map.live3d,r=Art3D.renderer();if(!r)return this.active=false;
      this.sync(game,time);Chars3D.fx.uTime.value=time;
      live.scene.traverse(o=>{if(o.material&&o.material.userData.shader&&o.material.userData.shader.uniforms.uWaterTime)o.material.userData.shader.uniforms.uWaterTime.value=time;});
      const m=g.getTransform(),W=g.canvas.width,H=g.canvas.height,z=m.a,cam=live.cam;
      cam.left=WX(-m.e/z);cam.right=WX((W-m.e)/z);cam.top=m.f/(z*40);cam.bottom=-(H-m.f)/(z*40);cam.updateProjectionMatrix();
      r.setSize(W,H,false);r.setViewport(0,0,W,H);r.setScissorTest(false);r.shadowMap.enabled=!!live.sun;r.shadowMap.autoUpdate=false;
      if(!live.shadowsReady){r.shadowMap.needsUpdate=true;live.shadowsReady=true;}
      r.render(live.scene,cam);
      g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(r.domElement,0,0,W,H);g.restore();r.shadowMap.enabled=false;
      if(window.ArtStylized){
        const L=Units.list.filter(u=>u.state!=='dead').concat(Enemies.list);L.sort((a,b)=>a.drawY-b.drawY);for(const o of L)o.draw(g,game.time);
        for(const t of Towers.list)if(t.type!=='barracks'){const id=({archer:'elf',mage:'mage',artillery:'dwarf',orc:'orc'})[t.type];if(!id)continue;const top=((Towers3D.TOPS[t.type]||[])[t.level]||35)*Towers.TS;g.save();g.translate(t.x,t.y-top);g.scale(t.anim.face||1,1);ArtStylized.draw(g,id,{t:time,w:-1,a:t.anim.a===undefined?-1:t.anim.a},30);g.restore();}
      }
      this.stats={drawCalls:r.info.render.calls,triangles:r.info.render.triangles,actors:this.actors.size};game.canvas.dataset.renderMode=window.ArtStylized?'painted-2d-characters':'live-webgl';game.canvas.dataset.liveActors=this.actors.size;game.canvas.dataset.drawCalls=this.stats.drawCalls;game.canvas.dataset.liveFrame=+(game.canvas.dataset.liveFrame||0)+1;this.active=true;return true;
    }
  };
})();
