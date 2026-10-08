/* One travelled road, six consecutive defence positions per chapter. */
(function(){
  delete CONFIG.towers.orc;
  delete CONFIG.items.gear.orc;
  CONFIG.items.rarities.push({name:'Thần Tích',suffix:'Thần Tích',col:'#59eadc',k:5.6,salvage:450});
  CONFIG.items.bag=160;
  const origin={barracks:['đội giữ cổng Bình Minh','lá cờ cuối cùng cứu đoàn dân qua rừng'],archer:['những người canh Suối Hoa','lời thề gìn giữ hạt giống đầu tiên'],mage:['hội quan trắc Nguyệt Thạch','mảnh sao được tìm thấy sau một đêm không có trăng'],artillery:['xưởng rèn Đèo Tro','ngọn lửa cuối cùng còn cháy dưới lớp tuyết']};
  for(const [t,gear] of Object.entries(CONFIG.items.gear))gear.forEach((g,s)=>{
    g.lore={4:`${g.name} được ${origin[t][0]} tạo ra sau trận giữ tuyến đường thứ ${s+1}. Người thợ khắc lên nó dấu tích của ${origin[t][1]}. Từ đó, mỗi lần công trình được dựng lại, lời thề của người giữ đường lại thức dậy.`,5:`Thần Tích: ${g.name}. Khi sáu cánh cổng đồng loạt tắt sáng, ${origin[t][0]} mang vật này vượt toàn bộ hành trình. ${origin[t][1][0].toUpperCase()+origin[t][1].slice(1)} đã giữ lại một tia sáng trong lõi vật phẩm. Nó không được đúc lần thứ hai: sức mạnh hôm nay là ký ức của những người đã ở lại giữ cổng.`};
  });
  const H=CONFIG.heroes;
  Object.assign(H.aldric,{name:'Aldric Bình Minh',title:'Người giữ lời thề',role:'Tiên phong · Bảo vệ đồng đội',unlockLevel:1,hp:460,armor:.42,skill:{id:'bastion',name:'Vòng Ước Hẹn',icon:'shield',cooldown:24,radius:115,damage:45},desc:'Dựng miền bảo hộ 6 giây quanh mình: đồng đội được lá chắn và hồi phục; quái bị ghìm chân. Nhánh chuyên sâu mở kỹ năng phụ Phản Kích.'});
  Object.assign(H.lyra,{title:'Người dẫn đường',role:'Trinh sát · Đánh dấu mục tiêu',unlockLevel:2,skill:{id:'thread',name:'Sợi Chỉ Gió',icon:'bow',cooldown:19,radius:210,damage:140},desc:'Nối tối đa 4 mục tiêu bằng chỉ gió, gây sát thương và làm chậm. Mục tiêu được đánh dấu chịu thêm 12% sát thương trong 5 giây. Kỹ năng phụ Bước Gió giúp Lyra lùi khỏi quái và tăng tốc trong 3 giây.'});
  Object.assign(H.selene,{title:'Người dệt không gian',role:'Khống chế · Giam giữ nhóm quái',unlockLevel:3,skill:{id:'orbit',name:'Quỹ Đạo Lệch',icon:'rune',cooldown:26,radius:125,damage:85},desc:'Tạo ba vệ tinh tím quay quanh một điểm trong 5 giây, gây sát thương theo nhịp và làm chậm. Kỹ năng phụ Đảo Nhịp làm choáng mục tiêu trong vùng.'});
  Object.assign(H.borin,{title:'Kỹ sư Đèo Tro',role:'Công phá · Hỗ trợ công trình',unlockLevel:4,range:135,proj:'bomb',air:false,skill:{id:'forge',name:'Lò Rèn Dã Chiến',icon:'gear',cooldown:28,radius:130,damage:110},desc:'Đặt lò rèn 7 giây: hồi máu lính gần đó và nạp nhanh các trụ. Kỹ năng phụ Xả Áp phóng sóng nhiệt xuyên giáp.'});
  H.nara={name:'Nara Mầm Sống',title:'Người giữ hạt giống',race:'Tinh linh rừng',role:'Hồi phục · Trói chân',unlockLevel:5,unlock:0,hp:300,damage:[12,18],armor:.18,speed:103,attackRate:.85,regen:12,respawn:14,radius:15,range:150,proj:'bolt',type:'magic',air:true,skill:{id:'grove',name:'Vườn Trong Túi',icon:'tree',cooldown:25,radius:120,damage:60},desc:'Gieo một vườn nhỏ 8 giây: hồi máu theo nhịp, rễ giữ quái trên mặt đất. Kỹ năng phụ Nảy Mầm hồi máu tức thời cho toàn đội trong vùng.'};
  const branches={
    aldric:[['Sinh lực','hp',.12,'+12% máu mỗi điểm'],['Thành lũy','arm',.035,'+3,5% giáp mỗi điểm'],['Mũi kiếm','dmg',.1,'+10% sát thương mỗi điểm']],
    lyra:[['Tập trung','dmg',.11,'+11% sát thương mỗi điểm'],['Nhịp cung','rate',.09,'+9% tốc đánh mỗi điểm'],['Du hành','spd',.07,'+7% tốc chạy mỗi điểm']],
    selene:[['Tinh tú','dmg',.12,'+12% sát thương mỗi điểm'],['Nhịp phép','rate',.08,'+8% tốc đánh mỗi điểm'],['Vỏ nguyệt','hp',.12,'+12% máu mỗi điểm']],
    borin:[['Lõi rèn','hp',.14,'+14% máu mỗi điểm'],['Thép tôi','arm',.035,'+3,5% giáp mỗi điểm'],['Áp suất','dmg',.11,'+11% sát thương mỗi điểm']],
    nara:[['Rễ sâu','hp',.13,'+13% máu mỗi điểm'],['Chồi sáng','rate',.09,'+9% tốc đánh mỗi điểm'],['Gai non','dmg',.1,'+10% sát thương mỗi điểm']]
  };
  for(const [id,h] of Object.entries(H)){
    h.branches=branches[id].map(([name,stat,value,text])=>({name,stat,value,text,max:5}));
    h.skill2={name:{aldric:'Phản Kích',lyra:'Bước Gió',selene:'Đảo Nhịp',borin:'Xả Áp',nara:'Nảy Mầm'}[id],level:4,cooldown:16};
    h.masteryLevel=8;
  }
  const subs=[['Bìa rừng','Lối mòn suối','Dốc rễ cây','Hẻm đá rêu','Đường đoàn xe','Thành Cửa Rừng'],['Ngoài cửa rừng','Bờ sông cũ','Cầu hoàng gia','Lối thành đổ','Sườn điện tối','Thành Hoàng Gia'],['Sau thành cũ','Dấu chân trên cát','Bờ ốc đảo','Đèo bọ cạp','Lối lăng mộ','Thành Cát Vàng'],['Sau thành cát','Lối hồ băng','Đèo tuyết','Bờ sông băng','Dốc gió lạnh','Thành Tuyết'],['Sau thành tuyết','Lối tro nguội','Đèo than','Cầu khe lửa','Dốc miệng núi','Thành Lò Rèn'],['Sau thành lửa','Bờ vực tím','Đèo đảo trôi','Cầu không gian','Lối vết nứt','Thành Cổng Cuối']];
  const y=x=>320+110*Math.sin(x*Math.PI/1280)+45*Math.sin(x*Math.PI/640)+65*Math.sin(x*Math.PI/3840);
  const route=Array.from({length:97},(_,i)=>[i*80,y(i*80)]);
  CONFIG.levels.forEach((L,i)=>{
    const stage=i%6,ri=Math.floor(i/6),start=stage*1280;
    L.bg={img:0,x0:0,y0:0,x1:1280,y1:640};
    L.ipaths=[Array.from({length:19},(_,k)=>{const x=(k-1)*80;return[x,y(start+x)];})];
    L.route={chapter:ri,stage,from:start,to:start+1280,points:route,entry:[0,y(start)],exit:[1280,y(start+1280)]};
    L.sub=subs[ri][stage];L.spots=10+(stage>2?1:0);L.feat={void:false,rivers:[],lakes:[],props:[]};
    // Stream follows a valley; roads only cross it where a bridge is built.
    if([1,3].includes(stage))L.feat.rivers.push({pts:[[530,-80],[570,140],[650,310],[730,490],[800,720]],w:ri===2?42:50,kind:ri===4?'lava':ri===5?'void':'water'});
    if(stage===5){const gx=1190,gy=y(start+gx);L.feat.props.push({k:ri===5?'portal':'castle',x:gx,y:gy+10});}
    const previous=stage?subs[ri][stage-1]:ri?subs[ri-1][5]:'trại Bình Minh';
    L.story=`Rời ${previous}, đoàn người tiếp tục cùng tuyến đường qua ${L.sub}. Đây là chặng ${stage+1}/6 của ${CONFIG.regions[ri].name}. `+(stage===5?`Tòa thành cuối chặng đang khóa đường. Hạ ${CONFIG.enemies[CONFIG.regions[ri].boss].name} để mở cổng và đưa đoàn người sang vùng kế tiếp.`:'Giữ lối đi cho đoàn xe. Phía trước vẫn còn các chặng đường trước khi tới tòa thành.');
  });
  window.Journey={route,y,width:1280};
})();
