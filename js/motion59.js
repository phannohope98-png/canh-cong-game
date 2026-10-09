/* Complete four-legged painted poses; diagonal gait follows travelled distance. */
(function(){
 const ids=new Set(['warg','frostWolf','wolfRider']);
 ArtStylized.stride=function(key,H=48){const id=this.identify(key);return H*(ids.has(id)?1.65:CONFIG.enemies[id]?.boss?1.2:['treant','troll','iceGolem','magmaGolem'].includes(id)?1.1:1.15);};
 window.Motion59={legCount:4,contactPairs:[[0,3],[1,2]],frameCount:6};
})();
