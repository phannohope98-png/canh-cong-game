(function(){
  const $=id=>document.getElementById(id),thumbs=new Map();
  function thumb(i){if(thumbs.has(i))return thumbs.get(i);const m=Level.build(i),bg=Level.renderBackground(m,.32),url=bg.toDataURL('image/webp',.85);thumbs.set(i,url);return url;}
  UI.renderMap=function(){
    const wrap=$('map-scroll'),inner=$('map-inner'),H=wrap.clientHeight||340,W=Math.max(wrap.clientWidth,1200),dpr=Math.min(2,devicePixelRatio||1),c=$('world-map');
    inner.style.width=W+'px';inner.style.height=H+'px';c.width=W*dpr;c.height=H*dpr;const g=c.getContext('2d');g.scale(dpr,dpr);
    const palettes=['#61754f','#777e66','#ad9874','#b9cbd1','#625850','#776b86'];
    CONFIG.regions.forEach((R,r)=>{const x=r*W/6,w=W/6;g.fillStyle=palettes[r];g.fillRect(x,0,w,H);g.globalAlpha=.14;g.fillStyle='#eee7d1';g.beginPath();g.ellipse(x+w/2,H*.4,w*.7,H*.44,0,0,Math.PI*2);g.fill();g.globalAlpha=1;
      // Exact same world polyline as the six playable pieces, compressed horizontally.
      g.beginPath();Journey.route.forEach(([px,py],i)=>{const xx=x+px/7680*w,yy=H*.26+py/640*H*.46;i?g.lineTo(xx,yy):g.moveTo(xx,yy);});g.strokeStyle='#383d32';g.lineWidth=8;g.stroke();g.strokeStyle='#ddd0a8';g.lineWidth=4;g.stroke();
      for(let s=0;s<6;s++){const xx=x+(s+.5)/6*w,yy=H*.26+Journey.y((s+.5)*1280)/640*H*.46;g.fillStyle=Save.data.stars[r*6+s]?'#ffe8a4':'#445040';g.beginPath();g.arc(xx,yy,4,0,Math.PI*2);g.fill();}
      g.font='bold 15px system-ui';g.textAlign='center';g.fillStyle='#fff7dc';g.fillText(R.name,x+w/2,32);g.font='11px system-ui';g.fillText('6 chặng · cùng một tuyến đường',x+w/2,51);
      PaintedWorld.blit(g,'env-'+R.theme,9,x+w-18,H*.76,75,false);
    });
    $('map-nodes').innerHTML=CONFIG.regions.map((R,r)=>{const open=this.regionOpen(r),n=CONFIG.levels.slice(r*6,r*6+6).filter((_,s)=>Save.data.stars[r*6+s]).length;return `<button class="node region ${open?'':'locked'}" style="left:${(r+.48)/6*100}%;top:82%" data-action="${open?'region':'region-locked'}" data-r="${r}"><span class="nname">${R.name}</span><span class="rprog">${open?n+'/6 chặng':'Chưa mở cổng'}</span></button>`;}).join('');
  };
  UI.regionCard=function(r){const R=CONFIG.regions[r];this.overlay(`<div class="ribbon">${R.name} · Một tuyến đường, sáu chặng</div><p class="rinfo">Đoàn xe đi tiếp qua từng chặng. Chặng 6 tới tòa thành; mở cổng thành rồi mới sang vùng kế tiếp.</p><div class="rgrid journey-grid">${CONFIG.levels.slice(r*6,r*6+6).map((L,s)=>{const i=r*6+s,lock=i>=Save.data.unlocked;return `<button class="rmap ${lock?'locked':''} ${L.boss?'boss':''}" data-action="${lock?'map-locked':'level'}" data-index="${i}"><span class="rthumb" style="background-image:url(${thumb(i)})"><b>${s+1}</b>${s===5?'<em>CỔNG THÀNH</em>':''}</span><span class="rname">${L.sub}</span><span class="nstars">${'★'.repeat(Save.data.stars[i]||0)||'Chưa hoàn thành'}</span></button>`;}).join('')}</div><div class="row"><button class="gbtn gray sm" data-action="overlay-ok">Đóng</button></div>`);$('overlay-panel').classList.add('wide');};
  const card=UI.levelCard;UI.levelCard=function(i){card.call(this,i);const img=$('overlay-panel').querySelector('.lvimg');if(img)img.src=thumb(i);};
  window.JourneyUI={thumb};
})();
