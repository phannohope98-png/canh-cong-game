/* One simulation clock; movement remains driven by distance, never screen pixels. */
(function(){
 CONFIG.match.timeScale*=.9;
 for(const h of Object.values(CONFIG.heroes))h.speed=Math.round(h.speed*.78);
 const create=Units.createFor;Units.createFor=function(t){const result=create.apply(this,arguments);for(const u of this.list)if(u.tower===t&&t.type==='barracks')u.speed=48;return result;};
 // Summoned guards are created by the command module with the same 48-unit gait.
 window.Polish87={version:87,timeScale:CONFIG.match.timeScale,troopSpeed:48};
})();
