/* Chế độ test: mở toàn bộ map, tướng (cấp tối đa, đủ 2 kỹ năng), cấp hành trình 60 và mọi vật phẩm mọi bậc.
 * Bật: thêm ?test=1 vào link, hoặc nút "Mở khoá toàn bộ" trong Cài đặt. Tắt: ?test=0 (dữ liệu đã mở giữ nguyên, muốn khoá lại thì Xoá dữ liệu). */
(function(){
 const FLAG='canhcong_test';
 const q=new URLSearchParams(location.search).get('test');
 try{if(q==='1')localStorage.setItem(FLAG,'1');else if(q==='0')localStorage.removeItem(FLAG);}catch(e){}
 const on=()=>{try{return localStorage.getItem(FLAG)==='1';}catch(e){return q==='1';}};
 function grant(){
  const d=Save.data,t=CONFIG.heroLevelXp,types=Object.keys(CONFIG.items.gear),R=CONFIG.items.rarities.length;
  d.unlocked=CONFIG.levels.length;
  d.accountXp=Math.max(d.accountXp||0,59*59*90+10);
  d.coins=Math.max(d.coins||0,999999);
  for(const id of Object.keys(CONFIG.heroes)){d.heroes[id]=true;d.heroXp[id]=Math.max(d.heroXp[id]||0,t[t.length-1]);}
  CONFIG.items.bag=Math.max(CONFIG.items.bag,types.length*6*R+80);
  d.relicFound=d.relicFound||[];
  for(const ty of types)for(let s=0;s<6;s++){
   if(!CONFIG.items.gear[ty][s])continue;
   for(let r=0;r<R;r++)if(!d.items.some(i=>i.t===ty&&i.s===s&&i.r===r)){d.items.push({u:++d.itemN,t:ty,s,r});if(r===R-1&&!d.relicFound.includes(ty+':'+s))d.relicFound.push(ty+':'+s);}
   if(d.loadout[ty]&&!d.loadout[ty][s]){const best=d.items.filter(i=>i.t===ty&&i.s===s).sort((a,b)=>b.r-a.r)[0];if(best)d.loadout[ty][s]=best.u;}
  }
  if(window.Items&&Items.dirty)Items.dirty();
  Save.save();
 }
 const load=Save.load;Save.load=function(){load.call(this);if(on())grant();return this.data;};
 const settings=UI.renderSettings;UI.renderSettings=function(){settings.call(this);const el=document.getElementById('settings-list');if(!el)return;
  el.insertAdjacentHTML('afterbegin',`<div class="card"><h3>Chế độ test</h3><p class="sub">${on()?'Đang bật: mọi map, tướng cấp 60, kỹ năng và vật phẩm đã mở.':'Mở toàn bộ map, tướng, kỹ năng và vật phẩm để kiểm tra game.'}</p><div class="row"><button class="gbtn sm ${on()?'gray':'green'}" data-action="test-all">${on()?'Tắt chế độ test':'Mở khoá toàn bộ'}</button></div></div>`);};
 const act=UI.act;UI.act=function(a,d,el){if(a!=='test-all')return act.call(this,a,d,el);
  if(on()){try{localStorage.removeItem(FLAG);}catch(e){}this.toast('Đã tắt chế độ test (Xoá dữ liệu để khoá lại)');}
  else{try{localStorage.setItem(FLAG,'1');}catch(e){}grant();this.toast('Đã mở khoá toàn bộ!');}
  this.renderSettings();};
 window.TestAll={grant,on};
})();
