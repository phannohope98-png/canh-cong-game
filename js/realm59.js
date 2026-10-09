/* Thirty-six battlefields, five peoples and a final joint expedition. */
(function(){
 const copy=v=>JSON.parse(JSON.stringify(v)),names=['Bờ Vết Nứt','Đảo Khắc Ấn','Hẻm Tinh Thạch','Cầu Năm Tộc','Thềm Hư Vô','Cổng Liên Minh'];
 CONFIG.regions.push({...CONFIG.regions[2],name:'Chiến Tuyến Liên Minh',faction:'Năm tộc',theme:'chaos'});REALM55.origins.push('Hợp nhất năm Ấn');
 for(let s=0;s<6;s++){const L=copy(CONFIG.levels[12+s]);L.name=L.sub=names[s];L.theme='chaos';L.region=5;L.hpMul=2.2+s*.17;L.gold=385+s*16;L.story='Năm chủng tộc đã thu hồi các Ấn Cổng. Họ cùng tiến qua '+names[s]+' để khóa khe Hư Vô; đây là chiến tuyến chung, không phải một chủng tộc mới.';L.waves=['voidling:7,wraith:3','deathKnight:2,voidling:8','orc:6,wraith:4','iceGolem:2,voidling:9','deathKnight:3,imp:5','voidling:10,magmaGolem:2',s===5?'voidLord:1,deathKnight:4,voidling:10':'deathKnight:4,wraith:7'];CONFIG.levels.push(L);}
 const counts=[1,2,3,2,1,3],shapes=[
  [[-40,300],[145,300],[275,160],[480,145],[635,420],[845,475],[1050,320],[1320,320]],
  [[-40,155],[180,155],[330,315],[525,450],[745,465],[925,260],[1120,165],[1320,165]],
  [[-40,435],[180,435],[300,255],[525,225],[655,125],[855,180],[1040,420],[1320,420]],
  [[-40,245],[215,245],[350,450],[525,460],[645,210],[865,170],[1040,370],[1320,370]],
  [[-40,350],[150,350],[295,505],[490,485],[660,325],[655,135],[465,125],[400,275],[800,330],[1000,200],[1320,200]],
  [[-40,315],[185,315],[330,170],[550,150],[715,375],[955,445],[1115,300],[1320,300]]
 ];
 for(let i=0;i<36;i++){const L=CONFIG.levels[i],r=Math.floor(i/6),s=i%6,n=counts[(s+r)%6],variant=(s+r*2)%6,base=shapes[variant],endY=270+(r*41+s*23)%120,gate=s===5;
  const paths=[];for(let lane=0;lane<n;lane++){const offset=(lane-(n-1)/2)*(n===3?135:210);const pts=base.map(([x,y],k)=>{const last=k===base.length-1;let yy=y+offset+Math.sin(k*.9+r+s)*18;if(r%2)yy=640-yy;return [x,Math.max(90,Math.min(560,yy))];});
   // Independent exits remain independent. Only the siege stage meets one doorway.
   if(gate){pts.splice(pts.length-2,2,[990,Math.max(130,Math.min(520,endY+offset*.7))],[1100,endY],[1190,endY]);}
   else{pts[pts.length-1][1]+=((r+s)%3-1)*12;}
   paths.push(pts);
  }
  L.bg={...L.bg,x0:0,y0:0,x1:1280,y1:640};L.ipaths=paths;L.route={chapter:r,lanes:n,entry:paths[0][0],exit:paths[0].at(-1)};L.spots=n===3?6:5;L.scene59={kind:(s+r)%6,seed:i*7919+271,r,s};
  const kind=L.scene59.kind,rx=340+(i*127)%580;L.feat={void:false,props:[],rivers:[],lakes:[]};
  if([1,2,5].includes(kind))L.feat.rivers=[{pts:[[rx-55,-40],[rx+40,160],[rx-25,340],[rx+60,680]],w:kind===2?62:39,kind:r===4?'lava':r===5?'void':'water'}];
  if(kind===0||kind===4)L.feat.lakes=[{x:230+(i*97)%650,y:kind===0?110:560,rx:95+(i%3)*25,ry:38+(i%4)*7,kind:r===4?'lava':'water'}];
  const propKind=r===0?'house':r===1?'stump':r===2?'rune':r===3?'ruin':r===4?'tent':'voidcrystal';
  if(kind===3)for(let p=0;p<3;p++)L.feat.props.push({k:propKind,x:180+p*390+(i%3)*30,y:p%2?570:110,s:.8});
  if(kind===4)for(let p=0;p<4;p++)L.feat.props.push({k:r===1?'monument':'rock',x:130+p*290,y:p%2?560:135,s:1.2});
  if(gate)L.feat.props.push({k:'castle',gate59:true,race:r<5?r:2,x:1190,y:endY,doorX:1190,doorY:endY,s:1});
  L.layout59=i;
 }
 // Explicit drawing heights are independent of combat collision radius.
 const H={goblin:28,orc:43,orcArcher:40,blackOrc:48,warg:31,frostWolf:32,wolfRider:43,bandit:35,skeleton:34,mummy:37,scorpion:29,wraith:40,shade:34,voidWalker:44,voidling:43,deathKnight:48,darkKnight:53,treant:56,troll:53,iceGolem:55,magmaGolem:55,imp:28,drake:48,mushroomShaman:35,shellGuard:43};
 for(const [id,e]of Object.entries(CONFIG.enemies))e.drawHeight=H[id]||(e.boss?68:40);
 for(const id of ['warg','frostWolf','wolfRider'])CONFIG.enemies[id].speed=Math.min(CONFIG.enemies[id].speed,70);
 window.Realm59={counts,shapes};
})();
