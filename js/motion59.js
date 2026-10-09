/* Complete four-legged painted poses; diagonal gait follows travelled distance. */
(function(){
 const ids=new Set(['warg','frostWolf','wolfRider']);
 ArtStylized.stride=function(key,H=48){const id=this.identify(key);return H*(ids.has(id)?1.05:CONFIG.enemies[id]?.boss?1:['treant','troll','iceGolem','magmaGolem'].includes(id)?.95:.8);};
 window.Motion59={legCount:4,contactPairs:[[0,3],[1,2]],frameCount:6};
})();
