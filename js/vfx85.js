/* Painted sequence assets supplement the geometry of each existing attack. */
(function(){
 const root=new URL('../assets/sprites/',document.currentScript.src),fx=new Image(),ready=new Promise((ok,no)=>{fx.onload=ok;fx.onerror=no;});fx.src=new URL('fx85.webp',root).href;
 function paint(g,row,n,x,y,size,jet=false){if(!fx.naturalWidth)return;const w=fx.naturalWidth/6,h=fx.naturalHeight/4;g.save();g.translate(x,y);g.drawImage(fx,Math.min(5,n)*w,row*h,w,h,jet?0:-size/2,-size/2,size,size);g.restore();}
 const oldIcon=SkillArt.icon;SkillArt.icon=function(id,slot){if(CONFIG.heroes[id])return new URL('skill85-'+id+'-'+slot+'.webp',root).href;return oldIcon.apply(this,arguments);};
 const draw=SkillFx59.draw;SkillFx59.draw=function(g,id,slot,x,y,r,t,life,z={}){const result=draw.apply(this,arguments);if(z.mine)return result;
  const row=['lyra','thalen'].includes(id)?2:['selene','oria'].includes(id)?1:['nara','brakka'].includes(id)?0:3;
  const impact=z.impact??.45;if(t>=impact&&t<impact+.75){g.save();g.globalAlpha=.65*(1-(t-impact)/.75);paint(g,row,Math.min(5,Math.floor((t-impact)/.75*6)),z.tx??x,(z.ty??y)-10,Math.min(66,r*.6));g.restore();}return result;};
 window.ArtVfx85={paint,ready};
})();
