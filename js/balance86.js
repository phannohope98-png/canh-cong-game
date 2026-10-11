/* Compact-board balance: ranges are world units, independent of phone pixels. */
(function () {
  const ranges = {archer:[115,125,135,145],mage:[125,135,145,155],artillery:[140,150,160,170]};
  for (const [type, values] of Object.entries(ranges)) {
    CONFIG.towers[type].levels.forEach((lv,i)=>{lv.range=values[i];});
  }
  CONFIG.towers.mage.levels.forEach(lv=>{lv.damage=lv.damage.map(v=>Math.max(1,Math.round(v*.8)));lv.aoe=0;});
  CONFIG.towers.mage.desc='Hai tia phép nhỏ đánh tối đa hai quái riêng biệt. Không gây sát thương lan.';
  for (const h of Object.values(CONFIG.heroes)) h.speed=Math.round(h.speed*.7);
  const create=Units.createFor;
  Units.createFor=function(t){const result=create.apply(this,arguments);for(const u of this.list)if(u.tower===t&&t.type==='barracks')u.speed=62;return result;};
  window.Balance86={version:86,skillRange:140,ranges};
})();
