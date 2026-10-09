/* Cohesive cartoon campaign, paced combat and architectural loot. */
(function(){
  CONFIG.pathWidth=68;CONFIG.match.timeScale=.72;CONFIG.match.enemySpeedScale=.48;CONFIG.match.nextWaveDelay=18;
  CONFIG.heroPerLevel=.012;CONFIG.heroLevelXp=Array.from({length:60},(_,i)=>Math.round(30*i+7*i*i));
  const heroes={
    aldric:['Mộc Khiên','Người giữ Cổng Rễ','Rùa rừng','Đỡ đòn · Bảo hộ','#80b16a','Mai Trấn Lối','Búa Rễ Cây','Tạo vòng mai bảo vệ đồng đội và ghìm quái.','Đập búa quanh mình, gây sát thương và nhận lá chắn.'],
    lyra:['Cáo Lửa','Người dẫn đoàn xe','Cáo','Truy kích · Đánh dấu','#edaa55','Phi Tiêu Hồi Âm','Lướt Lá','Phi tiêu nối nhiều quái, đánh dấu khiến chúng chịu thêm sát thương.','Lùi khỏi quái gần nhất và chạy nhanh trong 3 giây.'],
    selene:['Bông Tuyết','Người giữ Hồ Ngủ','Chim cánh cụt','Khống chế · Băng giá','#a8d6ec','Vườn Bông Băng','Đóng Băng','Ba bông tuyết xoay quanh vùng chọn, gây sát thương và làm chậm.','Đóng băng nhanh một nhóm quái, trùm bị choáng ngắn hơn.'],
    borin:['Rêu Đồng','Thợ máy Đèo Nắng','Gấu trúc đỏ','Công phá · Hỗ trợ trụ','#e9b15c','Trạm Hạt Đồng','Xả Hơi','Dựng trạm bánh răng: hồi máu lính và hỗ trợ nạp đạn.','Phóng làn hơi đồng xuyên giáp vào nhóm quái.'],
    nara:['Đốm Sao','Rồng giữ Mầm Trăng','Rồng rừng','Hồi phục · Trói chân','#9ddeba','Mưa Hạt Sao','Hơi Thở Mầm','Tạo vườn sao hồi máu và rễ giữ chân quái.','Hồi máu tức thời cho đồng đội quanh mình.']
  };
  for(const [id,v] of Object.entries(heroes)){const h=CONFIG.heroes[id];[h.name,h.title,h.race,h.role,h.color]=v;h.skill.name=v[5];h.skill2.name=v[6];h.skill.short=v[7];h.skill2.short=v[8];h.desc=v[7];h.skill2.level=10;h.masteryLevel=35;h.attackRate=Math.max(1.1,h.attackRate*1.3);h.unlockLevel={aldric:1,lyra:3,selene:6,borin:9,nara:12}[id];h.story=`${h.name} rời quê nhà khi mảnh Chuông Bình Minh biến mất. ${h.title} đã nhận lời hộ tống đoàn xe qua sáu thế giới, tìm lại sáu mảnh chuông để mở Cổng Trăng.`;}
  CONFIG.heroes.lyra.proj='arrow';CONFIG.heroes.lyra.range=150;
  for(const [t,T] of Object.entries(CONFIG.towers)){
    T.levels.forEach(l=>{delete l.special;l.rate*=t==='archer'?1.8:t==='barracks'?1.35:1.25;});
    T.desc={barracks:'Hai vệ binh giữ đường. Nâng cấp tăng máu, giáp và sát thương.',archer:'Cung thủ đơn mục tiêu, đánh được quái bay. Nâng cấp tăng lực bắn và tầm.',mage:'Phép băng lan nhỏ, phù hợp quái mặc giáp. Nâng cấp tăng sát thương và vùng phép.',artillery:'Đạn pháo chậm gây sát thương lan trên mặt đất. Nâng cấp tăng lực pháo.'}[t];
  }
  const names={barracks:['Cờ Hiệu','Cửa Gia Cố','Ấn Doanh Trại','Mái Che','Tường Thành','Chuông Tập Hợp'],archer:['Chong Chóng Gió','Dàn Cung','Giá Tên','Đài Quan Sát','Bồn Nhựa Lá','Rễ Neo'],mage:['Lõi Pha Lê','Bộ Vòng Niệm','Ăng-ten Phép','Ống Băng','Khung Khúc Xạ','Bệ Rune'],artillery:['Kính Ngắm','Nòng Pháo','Buồng Thuốc','Bánh Răng','Lò Nung','Chân Chống']};
  const icons={barracks:['flag','gate','crest','roof','wall','bell'],archer:['wind','bowrack','arrows','scope','sap','roots'],mage:['crystal','rings','antenna','icepipe','lens','runes'],artillery:['scope','barrel','chamber','gear','furnace','braces']};
  const origins=['Cổng Rễ','Cầu Bình Minh','Ốc đảo Nhớ','Hồ Ngủ','Đèo Nắng','Cổng Trăng'];
  for(const [t,gear] of Object.entries(CONFIG.items.gear))gear.forEach((g,s)=>{g.name=names[t][s];g.icon=icons[t][s];g.mount=['đỉnh công trình','bộ phận chiến đấu','mặt trước','cánh trái','cánh phải','chân công trình'][s];g.lore={4:`Trong trận giữ ${origins[s]}, người thợ của ${CONFIG.towers[t].name} chế tạo ${g.name.toLowerCase()} từ phần công trình còn lại sau bão. Bộ phận ấy giữ được cổng đủ lâu để đoàn xe thoát nạn. Nó được lưu truyền như lời hứa sẽ luôn đưa người cuối cùng về nhà.`,5:`Khi mảnh Chuông Bình Minh tại ${origins[s]} thức dậy, âm vang ngấm vào ${g.name.toLowerCase()}. Người thợ lắp lại từng chi tiết bằng ánh trăng và gỗ sao. Thần Tích này chỉ ra đời một lần, trong đêm cả sáu thế giới cùng giữ cửa cho nhau.`};});
  CONFIG.items.gear.barracks[1].text='giảm sát thương lính nhờ cửa bảo hộ';
  CONFIG.items.rarities.forEach((r,i)=>r.k=[.35,.6,.9,1.25,1.8,2.5][i]);
  const E=CONFIG.enemies;
  E.mushroomShaman={...E.goblin,name:'Nấm Tụng Ca',hp:260,speed:35,damage:[4,7],armor:.05,mres:.3,reward:16,radius:13,healer:true,art:'mushroomShaman',desc:'Hồi máu quái gần nó mỗi 4 giây. Điều tướng áp sát để hạ trước.'};
  E.shellGuard={...E.orc,name:'Bọ Khiên',hp:410,speed:27,damage:[12,17],armor:.62,mres:0,reward:19,radius:15,art:'shellGuard',desc:'Vỏ cứng chống tên và kiếm; yếu trước phép. Đi chậm nhưng che đường cho quái hỗ trợ.'};
  CONFIG.spawnInterval.mushroomShaman=2.8;CONFIG.spawnInterval.shellGuard=2.5;
  for(const e of Object.values(E)){if(e.charge)e.charge={...e.charge,time:.65,every:12};if(e.lord)e.lord=true;e.speed=Math.min(e.speed,85);}
  CONFIG.levels.forEach((L,i)=>{const r=Math.floor(i/6),s=i%6;L.spots=r<2?6:5;L.gold=Math.round(245+r*35+s*14);L.hpMul=(L.hpMul||1)*(1+r*.12+s*.035);L.story=`${CONFIG.regions[r].name} — chặng ${s+1}/6. Đoàn xe tìm mảnh Chuông Bình Minh tại ${origins[r]}. `+(s===5?'Giữ cổng thành và đánh bại kẻ giữ mảnh chuông để mở đường sang thế giới kế tiếp.':'Bảo vệ đoàn xe trên lối mòn; cánh cổng cuối vùng vẫn còn ở phía trước.');
    L.waves=L.waves.map((wave,w)=>wave+(i>=2&&w%3===1?',mushroomShaman:'+Math.min(3,1+Math.floor(r/2))+':3':'')+(i>=4&&w%3===2?',shellGuard:'+Math.min(4,1+Math.floor(r/2))+':2.8':''));
  });
  window.REALM55={heroIds:Object.keys(heroes),origins};
})();
